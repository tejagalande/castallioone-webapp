export {}

declare global {
  interface Window {
    fbq?: (
      command: 'init' | 'track' | 'trackCustom',
      eventNameOrId: string,
      params?: Record<string, unknown>
    ) => void
  }
}
