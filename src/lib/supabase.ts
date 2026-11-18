import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://pmqtsplqnwexxnojeezg.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcXRzcGxxbndleHhub2plZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTIzNjYsImV4cCI6MjA5NjQ4ODM2Nn0.njMHaeY3plFQVjWyt0LmpCJzEDEtkU9naZ1HBmFJKQI'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

const HEALTH_CHECK_TIMEOUT_MS = 5000

/**
 * Verify that the Supabase auth endpoint is reachable from the client's network
 * before redirecting to OAuth (catches ISP/firewall blocks on *.supabase.co).
 */
export async function checkAuthServerReachable(): Promise<{
  reachable: boolean
  error?: unknown
}> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS)

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: supabaseAnonKey },
      signal: controller.signal,
    })
    return { reachable: response.ok }
  } catch (err: unknown) {
    return { reachable: false, error: err }
  } finally {
    window.clearTimeout(timer)
  }
}

