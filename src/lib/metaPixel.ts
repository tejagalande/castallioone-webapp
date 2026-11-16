/**
 * Safely fires a Meta Pixel standard event if `window.fbq` is loaded.
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (params) {
      window.fbq('track', eventName, params)
    } else {
      window.fbq('track', eventName)
    }
  }
}
