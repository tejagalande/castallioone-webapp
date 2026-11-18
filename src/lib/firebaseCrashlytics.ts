import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAnalytics,
  isSupported,
  logEvent,
  setUserId,
  setUserProperties,
  type Analytics,
} from 'firebase/analytics'

export interface CrashContext {
  fatal?: boolean
  source?: string
  componentStack?: string | null
  extra?: Record<string, string | number | boolean>
}

interface Breadcrumb {
  message: string
  timestamp: string
}

const MAX_PARAM_LENGTH = 100
const MAX_BREADCRUMBS = 10

let firebaseApp: FirebaseApp | null = null
let analyticsInstance: Analytics | null = null
let initPromise: Promise<Analytics | null> | null = null
let globalListenersAttached = false
const breadcrumbs: Breadcrumb[] = []

function getFirebaseConfig(): {
  apiKey: string
  authDomain?: string
  projectId: string
  storageBucket?: string
  messagingSenderId?: string
  appId: string
  measurementId: string
} | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined

  if (!apiKey || !projectId || !appId || !measurementId) {
    return null
  }

  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
    appId,
    measurementId,
  }
}

function truncate(value: string, maxLength = MAX_PARAM_LENGTH): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 3)}...`
}

function normalizeError(error: unknown): { name: string; message: string; stack: string } {
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message || 'Unknown error',
      stack: error.stack || '',
    }
  }
  if (typeof error === 'string') {
    return { name: 'Error', message: error, stack: '' }
  }
  try {
    return { name: 'UnknownError', message: JSON.stringify(error), stack: '' }
  } catch {
    return { name: 'UnknownError', message: String(error), stack: '' }
  }
}

async function getAnalyticsClient(): Promise<Analytics | null> {
  if (analyticsInstance) return analyticsInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    if (typeof window === 'undefined') return null

    const config = getFirebaseConfig()
    if (!config) {
      if (import.meta.env.DEV) {
        console.warn(
          'Firebase Crash Reporting: VITE_FIREBASE_* env vars are not set; crash reporting disabled.'
        )
      }
      return null
    }

    try {
      const supported = await isSupported()
      if (!supported) return null

      firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(config)
      analyticsInstance = getAnalytics(firebaseApp)
      return analyticsInstance
    } catch (err: unknown) {
      console.error('Firebase Analytics init failed:', err)
      return null
    }
  })()

  return initPromise
}

function attachGlobalErrorListeners(): void {
  if (typeof window === 'undefined' || globalListenersAttached) return
  globalListenersAttached = true

  window.addEventListener('error', (event: ErrorEvent) => {
    const err = event.error ?? new Error(event.message || 'Uncaught window error')
    void recordException(err, {
      fatal: true,
      source: 'window.onerror',
      extra: {
        filename: event.filename || 'unknown',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
      },
    })
  })

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    void recordException(event.reason, {
      fatal: false,
      source: 'window.unhandledrejection',
    })
  })
}

/**
 * Initialize Firebase Analytics crash/exception reporting and attach global
 * error & unhandled promise rejection listeners. Safe to call multiple times.
 */
export function initCrashReporting(): Promise<Analytics | null> {
  attachGlobalErrorListeners()
  return getAnalyticsClient()
}

/**
 * Record an error/exception to Firebase Analytics using the standard GA4
 * `exception` event along with route and breadcrumb context.
 */
export async function recordException(
  error: unknown,
  context: CrashContext = {}
): Promise<void> {
  const { name, message } = normalizeError(error)
  const fatal = context.fatal ?? false
  const route = typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1]?.message

  const analytics = await getAnalyticsClient()
  if (!analytics) return

  try {
    logEvent(analytics, 'exception', {
      description: truncate(`${name}: ${message}`),
      fatal,
      error_name: truncate(name, 40),
      error_source: truncate(context.source ?? 'manual', 40),
      route: truncate(route),
      ...(lastBreadcrumb ? { last_breadcrumb: truncate(lastBreadcrumb) } : {}),
      ...(context.extra ?? {}),
    })
  } catch (logErr: unknown) {
    console.error('Failed to record exception to Firebase:', logErr)
  }
}

/**
 * Associate subsequent crash/exception events with the authenticated user.
 * Pass `null` on sign-out to clear the user association.
 */
export async function setCrashUserId(
  userId: string | null,
  role?: string | null
): Promise<void> {
  const analytics = await getAnalyticsClient()
  if (!analytics) return

  try {
    setUserId(analytics, userId)
    if (role !== undefined) {
      setUserProperties(analytics, { user_role: role ?? 'anonymous' })
    }
  } catch (err: unknown) {
    console.error('Failed to set Firebase crash user ID:', err)
  }
}

/**
 * Add a lightweight breadcrumb so the most recent user action is attached
 * when an exception occurs.
 */
export function logCrashBreadcrumb(message: string): void {
  breadcrumbs.push({
    message: truncate(message),
    timestamp: new Date().toISOString(),
  })
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift()
  }
}

/**
 * Log a custom diagnostic event (e.g., oauth_redirect_started, auth_server_unreachable)
 * to Firebase Analytics for production troubleshooting.
 */
export async function logCrashEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  const analytics = await getAnalyticsClient()
  if (!analytics) return

  try {
    logEvent(analytics, eventName, params)
  } catch (err: unknown) {
    console.error('Failed to log Firebase diagnostic event:', err)
  }
}
