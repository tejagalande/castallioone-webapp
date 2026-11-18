import OneSignal from 'react-onesignal'

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined

let initPromise: Promise<boolean> | null = null
let isInitialized = false

/** Initialize OneSignal once. Safe to call multiple times. No-op if App ID is missing. */
export function initOneSignal(): Promise<boolean> {
  if (!APP_ID) {
    console.warn('OneSignal: VITE_ONESIGNAL_APP_ID is not set; push disabled.')
    return Promise.resolve(false)
  }
  if (!initPromise) {
    initPromise = OneSignal.init({
      appId: APP_ID,
      allowLocalhostAsSecureOrigin: import.meta.env.DEV,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
    })
      .then(() => {
        isInitialized = true
        return true
      })
      .catch((err: unknown) => {
        isInitialized = false
        console.warn('OneSignal init failed (check Site URL in OneSignal dashboard):', err)
        return false
      })
  }
  return initPromise
}

/** Link this browser to the app user (same external ID as the mobile app). */
export async function loginOneSignal(userId: string, role?: string | null): Promise<void> {
  if (!APP_ID) return
  const ready = await initOneSignal()
  if (!ready || !isInitialized) return

  try {
    await OneSignal.login(userId)
    if (role) OneSignal.User.addTag('role', role)
  } catch (err) {
    console.warn('OneSignal login skipped/failed:', err)
  }
}

export async function logoutOneSignal(): Promise<void> {
  if (!APP_ID) return
  const ready = await initOneSignal()
  if (!ready || !isInitialized) return

  try {
    await OneSignal.logout()
  } catch (err) {
    console.warn('OneSignal logout skipped/failed:', err)
  }
}

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

export function getPushPermission(): NotificationPermission | 'unsupported' {
  return isPushSupported() ? Notification.permission : 'unsupported'
}

/** Call from a user gesture (button click). */
export async function requestPushPermission(): Promise<boolean> {
  if (!APP_ID || !isPushSupported()) return false
  await initOneSignal()
  try {
    await OneSignal.Notifications.requestPermission()
  } catch (err) {
    console.error('OneSignal permission request failed:', err)
  }
  return Notification.permission === 'granted'
}
