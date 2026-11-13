import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

function loadEnv() {
  const envPath = path.join(rootDir, '.env')
  const envVars = {}
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim()
        envVars[key] = val
      }
    }
  }
  return { ...process.env, ...envVars }
}

const COLUMNS =
  'id, slug, title, seo_title, meta_description, primary_keyword, secondary_keywords, category, tags, excerpt, content, featured_image_url, featured_image_alt, canonical_url, robots, faq, internal_links, external_links, author_name, word_count, reading_time_minutes, published_at, updated_at, is_published'

export async function exportBlogs() {
  const env = loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials missing in environment (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })

  console.log('🔄 Fetching published blogs from Supabase blogs table...')

  const { data: blogs, error } = await supabase
    .from('blogs')
    .select(COLUMNS)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('❌ Error querying blogs:', error.message)
    throw error
  }

  console.log(`📋 Found ${blogs ? blogs.length : 0} published blog records.`)

  const outFilePath = path.join(__dirname, 'blogs.json')
  fs.writeFileSync(outFilePath, JSON.stringify(blogs || [], null, 2), 'utf8')
  console.log(`✅ Exported ${blogs ? blogs.length : 0} blogs to ${outFilePath}`)
  return blogs || []
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  exportBlogs().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

