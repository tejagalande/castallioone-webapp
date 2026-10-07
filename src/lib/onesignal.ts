import OneSignal from 'react-onesignal'

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined

let initPromise: Promise<void> | null = null

/** Initialize OneSignal once. Safe to call multiple times. No-op if App ID is missing. */
export function initOneSignal(): Promise<void> {
  if (!APP_ID) {
    console.warn('OneSignal: VITE_ONESIGNAL_APP_ID is not set; push disabled.')
    return Promise.resolve()
  }
  if (!initPromise) {
    initPromise = OneSignal.init({
      appId: APP_ID,
      allowLocalhostAsSecureOrigin: import.meta.env.DEV,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
    }).catch((err: unknown) => {
      console.error('OneSignal init failed:', err)
    })
  }
  return initPromise
}

/** Link this browser to the app user (same external ID as the mobile app). */
export async function loginOneSignal(userId: string, role?: string | null): Promise<void> {
  if (!APP_ID) return
  await initOneSignal()
  try {
    await OneSignal.login(userId)
    if (role) OneSignal.User.addTag('role', role)
  } catch (err) {
    console.error('OneSignal login failed:', err)
  }
}

export async function logoutOneSignal(): Promise<void> {
  if (!APP_ID) return
  await initOneSignal()
  try {
    await OneSignal.logout()
  } catch (err) {
    console.error('OneSignal logout failed:', err)
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
