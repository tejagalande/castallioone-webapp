/**
 * Razorpay Payment Gateway Integration Service
 * Castallio One Enterprise Platform
 */

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

export interface RazorpayPaymentFailureResponse {
  error: {
    code: string
    description: string
    source: string
    step: string
    reason: string
    metadata?: {
      payment_id?: string
      order_id?: string
    }
  }
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number // in paise (e.g. 1499 * 1.18 * 100)
  currency: string // 'INR'
  name: string
  description: string
  image?: string
  order_id?: string
  handler: (response: RazorpayPaymentSuccessResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
    backdrop_color?: string
  }
  modal?: {
    ondismiss?: () => void
    escape?: boolean
    animation?: boolean
    confirm_close?: boolean
  }
}

export interface RazorpayInstance {
  open: () => void
  close?: () => void
  on: (event: string, callback: (response: unknown) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance
  }
}

let razorpayScriptLoadingPromise: Promise<boolean> | null = null

/**
 * Loads the Razorpay checkout.js script asynchronously.
 * Uses promise caching to prevent multiple script tag insertions.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(false)
  }

  if (window.Razorpay) {
    return Promise.resolve(true)
  }

  if (razorpayScriptLoadingPromise) {
    return razorpayScriptLoadingPromise
  }

  razorpayScriptLoadingPromise = new Promise<boolean>((resolve) => {
    // Check if already injected in DOM
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    )
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true))
      existingScript.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.crossOrigin = 'anonymous'

    script.onload = () => {
      resolve(true)
    }

    script.onerror = () => {
      console.error('Failed to load Razorpay checkout script from CDN.')
      razorpayScriptLoadingPromise = null
      resolve(false)
    }

    document.head.appendChild(script)
  })

  return razorpayScriptLoadingPromise
}

export interface InitiatePaymentParams {
  keyId?: string
  planId: string
  planName: string
  amountInr: number // Total payable in INR including GST
  companyName: string
  userEmail?: string
  userContact?: string
  gstin?: string
}

export interface PaymentExecutionResult {
  status: 'success' | 'dismissed' | 'failed'
  paymentId?: string
  orderId?: string
  signature?: string
  errorMessage?: string
}

/**
 * Launches the official Razorpay Checkout modal
 */
export const initiateRazorpayCheckout = async (
  params: InitiatePaymentParams
): Promise<PaymentExecutionResult> => {
  const isLoaded = await loadRazorpayScript()
  const RazorpayConstructor = window.Razorpay
  if (!isLoaded || !RazorpayConstructor) {
    return {
      status: 'failed',
      errorMessage:
        'Unable to load Razorpay checkout library. Please check your internet connection and try again.',
    }
  }

  const razorpayKey =
    params.keyId ||
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    (import.meta.env.VITE_RAZORPAY_KEY as string | undefined)

  if (!razorpayKey) {
    return {
      status: 'failed',
      errorMessage:
        'Razorpay Key ID is not configured. Please set VITE_RAZORPAY_KEY_ID in your .env file or settings.',
    }
  }

  // Convert INR amount to paise (1 INR = 100 paise)
  const amountInPaise = Math.round(params.amountInr * 100)

  return new Promise<PaymentExecutionResult>((resolve) => {
    let hasResolved = false

    const options: RazorpayCheckoutOptions = {
      key: razorpayKey,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Castallio One',
      description: `${params.planName} Enterprise Subscription`,
      image: '/app_icon.png',
      prefill: {
        name: params.companyName,
        email: params.userEmail || '',
        contact: params.userContact || '',
      },
      notes: {
        plan_id: params.planId,
        company_name: params.companyName,
        gstin: params.gstin || 'UNREGISTERED',
        platform: 'Castallio One Web App',
      },
      theme: {
        color: '#0056d2',
        backdrop_color: 'rgba(15, 23, 42, 0.65)',
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          if (!hasResolved) {
            hasResolved = true
            resolve({
              status: 'dismissed',
              errorMessage: 'Payment checkout was closed by the user.',
            })
          }
        },
      },
      handler: (response: RazorpayPaymentSuccessResponse) => {
        if (!hasResolved) {
          hasResolved = true
          resolve({
            status: 'success',
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          })
        }
      },
    }

    try {
      const rzpInstance = new RazorpayConstructor(options)

      rzpInstance.on('payment.failed', (failureResponse: unknown) => {
        console.error('Razorpay payment failed:', failureResponse)
        if (!hasResolved) {
          hasResolved = true
          const failObj = failureResponse as RazorpayPaymentFailureResponse | undefined
          const desc = failObj?.error?.description || 'Payment was declined by the bank or gateway.'
          resolve({
            status: 'failed',
            errorMessage: desc,
          })
        }
      })

      rzpInstance.open()
    } catch (err: unknown) {
      console.error('Error opening Razorpay checkout window:', err)
      if (!hasResolved) {
        hasResolved = true
        const message = err instanceof Error ? err.message : 'Failed to initialize payment gateway modal.'
        resolve({
          status: 'failed',
          errorMessage: message,
        })
      }
    }
  })
}
