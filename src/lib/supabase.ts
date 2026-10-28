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

