import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

// 1. Parse .env file for credentials
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

// Indian States fallback lookup for location parsing
const KNOWN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Chandigarh', 'Puducherry'
]

function parseLocation(locRaw) {
  if (!locRaw || typeof locRaw !== 'string') {
    return { city: 'Pune', state: 'Maharashtra' }
  }
  const parts = locRaw.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const potentialCity = parts[0]
    const potentialState = parts[parts.length - 1]
    const matchedState = KNOWN_STATES.find(
      (s) => s.toLowerCase() === potentialState.toLowerCase()
    )
    return {
      city: potentialCity,
      state: matchedState || 'Maharashtra',
    }
  }

  // Single word location
  let loc = parts[0]
  if (!loc || /^\d+$/.test(loc)) {
    return { city: 'Pune', state: 'Maharashtra' }
  }
  const matchedState = KNOWN_STATES.find(
    (s) => s.toLowerCase() === loc.toLowerCase()
  )
  if (matchedState) {
    return { city: loc, state: matchedState }
  }

  // Check known cities
  const cityStateMap = {
    pune: 'Maharashtra',
    mumbai: 'Maharashtra',
    nagpur: 'Maharashtra',
    bengaluru: 'Karnataka',
    bangalore: 'Karnataka',
    hyderabad: 'Telangana',
    delhi: 'Delhi',
    'new delhi': 'Delhi',
    noida: 'Uttar Pradesh',
    gurugram: 'Haryana',
    gurgaon: 'Haryana',
    chennai: 'Tamil Nadu',
    kolkata: 'West Bengal',
    ahmedabad: 'Gujarat',
    jaipur: 'Rajasthan',
    lucknow: 'Uttar Pradesh',
    indore: 'Madhya Pradesh',
    chandigarh: 'Chandigarh',
  }

  const stateFound = cityStateMap[loc.toLowerCase()]
  return {
    city: loc,
    state: stateFound || 'Maharashtra',
  }
}

export async function exportJobs() {
  const env = loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials missing in environment (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })

  console.log('🔄 Fetching active jobs from Supabase create_job_post...')

  // Fetch active/published job requisitions
  const { data: jobs, error } = await supabase
    .from('create_job_post')
    .select('*')
    .or('status.eq.active,status.is.null')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error querying create_job_post:', error.message)
    throw error
  }

  console.log(`📋 Found ${jobs ? jobs.length : 0} job records in database.`)

  // Fetch company records to associate names
  const companyIds = Array.from(new Set(jobs.map((j) => j.company_id).filter(Boolean)))
  const companiesMap = {}
  if (companyIds.length > 0) {
    const { data: comps } = await supabase
      .from('companies')
      .select('id, name, logo_url')
      .in('id', companyIds)
    if (comps) {
      comps.forEach((c) => {
        companiesMap[c.id] = c
      })
    }
  }

  const formattedJobs = (jobs || []).map((j) => {
    const { city, state } = parseLocation(j.location)
    const company = companiesMap[j.company_id]?.name || 'Castallio Enterprise Partner'
    const datePosted = j.created_at ? j.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)

    // Calculate validThrough: expires_at or posted + 60 days
    let validThrough
    if (j.expires_at) {
      validThrough = j.expires_at.slice(0, 10)
    } else {
      const d = new Date(datePosted)
      d.setDate(d.getDate() + 60)
      validThrough = d.toISOString().slice(0, 10)
    }

    const description = [
      j.job_description,
      j.responsibilities ? `Responsibilities:\n${j.responsibilities}` : '',
      j.technical_requirements ? `Requirements:\n${j.technical_requirements}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')

    return {
      id: String(j.id),
      title: j.title || 'AEC Professional',
      company,
      city,
      state,
      description,
      datePosted,
      validThrough,
      employmentType: (j.work_type || 'full_time').toLowerCase(),
      salaryMin: j.salary_min ? Number(j.salary_min) : undefined,
      salaryMax: j.salary_max ? Number(j.salary_max) : undefined,
      applyUrl: `https://castallioone.com/jobs/${j.id}`,
      role: undefined, // Will be matched by title in normalizer
    }
  })

  const outFilePath = path.join(__dirname, 'jobs.json')
  fs.writeFileSync(outFilePath, JSON.stringify(formattedJobs, null, 2), 'utf8')
  console.log(`✅ Exported ${formattedJobs.length} jobs to ${outFilePath}`)
  return formattedJobs
}

// Allow direct CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  exportJobs().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
