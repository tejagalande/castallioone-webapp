#!/usr/bin/env node
/**
 * Castallio One - Programmatic SEO, AEO, and GEO Page Generator
 * -------------------------------------------------------------
 * Reads jobs from jobs.json (exported from Supabase) and generates static, crawlable HTML pages:
 *
 *   /jobs/                       -> All-India Hub
 *   /jobs/{state}/               -> State page
 *   /jobs/{state}/{city}/        -> City page (all roles)
 *   /jobs/{state}/{city}/{role}/ -> City + Role page (e.g. BIM Engineer jobs in Pune)
 *   /jobs/role/{role}/           -> Role in India page
 *   /jobs/job/{id}-{title}-{city}/ -> Single job page WITH Google JobPosting schema
 *   sitemap-index.xml + sitemap-1.xml
 *   llms.txt for AI engines (ChatGPT, Claude, Perplexity)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

/* ===================== 1. CONFIG ===================== */
const CONFIG = {
  siteName: 'Castallio One',
  baseUrl: 'https://castallioone.com',
  appUrl: 'https://castallioone.com',
  jobsFile: path.join(__dirname, 'jobs.json'),
  outDir: path.join(rootDir, 'public'),
  distSeoDir: path.join(__dirname, 'dist-seo'),
  favicon: '/favicon-48x48.png',
  maxJobsOnListing: 30,
  emptyPages: 'skip',
  basePath: '/jobs',
  sameAs: [
    'https://www.linkedin.com/company/castallio-one'
  ],
  contactEmail: 'contact@castallioone.com',
  ogImage: '/favicon-512x512.png',
  searchUrlTemplate: 'https://castallioone.com/find-jobs?q={search_term_string}',
}

const B = CONFIG.basePath.replace(/\/$/, '')

/* ===================== 2. STATES x CITIES ===================== */
const STATE_DATA = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu', 'Along', 'Changlang', 'Roing'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Dhamtari'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim', 'Cuncolim', 'Canacona'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Bharuch'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat', 'Yamunanagar', 'Panchkula'],
  'Himachal Pradesh': ['Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Baddi', 'Kullu', 'Nahan', 'Hamirpur', 'Una', 'Bilaspur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Phusro', 'Medininagar'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad', 'Malappuram', 'Kottayam'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Amravati'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul', 'Senapati', 'Tamenglong', 'Jiribam', 'Moirang'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Baghmara', 'Williamnagar', 'Nongpoh', 'Mawkyrwat', 'Resubelpara', 'Khliehriat'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Saiha', 'Lawngtlai', 'Mamit', 'Khawzawl', 'Hnahthial'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Mon', 'Kiphire', 'Longleng'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Moga', 'Batala'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Sikar', 'Bharatpur'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Singtam', 'Jorethang', 'Ravangla', 'Pakyong', 'Soreng'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Tirunelveli', 'Hosur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia', 'Ambassa', 'Khowai', 'Teliamura', 'Sabroom', 'Bishalgarh'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pantnagar', 'Nainital', 'Kotdwar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Kharagpur', 'Haldia', 'Malda', 'Baharampur'],
  'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Janakpuri', 'Okhla', 'Narela', 'Pitampura', 'Laxmi Nagar', 'Mayur Vihar'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Udhampur', 'Kathua', 'Kupwara', 'Pulwama', 'Budgam'],
  'Ladakh': ['Leh', 'Kargil', 'Diskit', 'Padum'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Mayabunder', 'Rangat'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Silvassa', 'Diu'],
  'Lakshadweep': ['Kavaratti', 'Agatti', 'Minicoy', 'Amini', 'Andrott'],
}

/* ===================== 3. ROLES ===================== */
const ROLE_ROWS = [
  ['BIM', 'BIM Engineer', []],
  ['BIM', 'BIM Coordinator', []],
  ['BIM', 'BIM Manager', []],
  ['BIM', 'BIM Modeler', ['bim modeler', 'mepf', 'mepf bim modeler', 'modeler']],
  ['BIM', 'Revit Modeler', ['revit']],
  ['BIM', 'CAD Draughtsman', ['autocad', 'draftsman', 'draughtsman', 'cad technician']],
  ['Civil and Structural', 'Civil Engineer', []],
  ['Civil and Structural', 'Site Engineer', []],
  ['Civil and Structural', 'Structural Engineer', ['structural engineering', 'structural']],
  ['Civil and Structural', 'Quantity Surveyor', ['qs ']],
  ['Civil and Structural', 'Billing Engineer', []],
  ['Civil and Structural', 'Planning Engineer', ['primavera', 'scheduler']],
  ['Civil and Structural', 'QA QC Engineer', ['qa/qc', 'quality engineer', 'qaqc']],
  ['Civil and Structural', 'Safety Engineer', ['hse', 'ehs', 'safety officer']],
  ['Civil and Structural', 'Geotechnical Engineer', ['geotech']],
  ['Civil and Structural', 'Highway Engineer', ['road engineer', 'highway']],
  ['Civil and Structural', 'Land Surveyor', ['surveyor', 'total station']],
  ['Civil and Structural', 'Site Supervisor', ['supervisor']],
  ['Civil and Structural', 'Foreman', []],
  ['MEP and Electrical', 'MEP Engineer', ['mep']],
  ['MEP and Electrical', 'Mechanical Engineer', []],
  ['MEP and Electrical', 'HVAC Engineer', ['hvac']],
  ['MEP and Electrical', 'Plumbing Engineer', ['plumbing', 'public health engineer']],
  ['MEP and Electrical', 'Fire Fighting Engineer', ['fire fighting', 'firefighting', 'fire protection']],
  ['MEP and Electrical', 'Electrical Engineer', ['mep-electrical', 'mep electrical', 'electrical']],
  ['MEP and Electrical', 'Electrical Design Engineer', []],
  ['MEP and Electrical', 'ELV Engineer', ['elv', 'low current']],
  ['Architecture and Design', 'Architect', ['junior architect', 'bim architect', 'architecture']],
  ['Architecture and Design', 'Interior Designer', ['interior design']],
  ['Architecture and Design', 'Landscape Architect', ['landscape']],
  ['Architecture and Design', 'Urban Planner', ['urban planning', 'town planner']],
  ['Architecture and Design', 'Design Manager', []],
  ['Construction Management', 'Construction Project Manager', []],
  ['Construction Management', 'Project Manager', []],
  ['Construction Management', 'Construction Manager', []],
  ['Construction Management', 'Contracts Manager', ['contract manager', 'contracts engineer']],
  ['Construction Management', 'Tender Engineer', ['tendering', 'tender']],
  ['Construction Management', 'Cost Estimator', ['estimation engineer', 'estimator']],
  ['Construction Management', 'Procurement Engineer', ['procurement']],
  ['Construction Management', 'Project Coordinator', []],
]

const CATEGORY_BLURB = {
  BIM: 'BIM roles cover 3D coordinated modelling, clash detection and information management using tools such as Revit, Navisworks and BIM 360.',
  'Civil and Structural': 'Civil and structural roles cover site execution, structural design, quantity and billing work, planning, quality and safety on buildings, roads and infrastructure.',
  'MEP and Electrical': 'MEP and electrical roles cover mechanical, HVAC, plumbing, fire-fighting and electrical design and execution for commercial, residential and industrial projects.',
  'Architecture and Design': 'Architecture and design roles cover concept and detailed design, interiors, landscape and planning for buildings and urban projects.',
  'Construction Management': 'Construction management roles cover project delivery, contracts, tendering, estimating and procurement across the project lifecycle.',
}

/* ===================== 4. HELPERS ===================== */
const slug = (s) => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…')
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN')
const today = new Date()
const todayISO = today.toISOString().slice(0, 10)
const monthYear = today.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

const orgLd = () => ({
  '@type': 'Organization',
  name: CONFIG.siteName,
  url: CONFIG.baseUrl,
  logo: CONFIG.baseUrl + CONFIG.favicon,
  description: `${CONFIG.siteName} is an AEC (architecture, engineering and construction) network and hiring platform in India.`,
  ...(CONFIG.sameAs.length ? { sameAs: CONFIG.sameAs } : {}),
  ...(CONFIG.contactEmail ? { email: CONFIG.contactEmail } : {}),
})

const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: CONFIG.siteName,
  url: CONFIG.baseUrl,
  inLanguage: 'en-IN',
  ...(CONFIG.searchUrlTemplate
    ? {
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: CONFIG.searchUrlTemplate },
          'query-input': 'required name=search_term_string',
        },
      }
    : {}),
})

const faqLd = (qa) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: qa.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
})

const faqBlock = (qa) =>
  qa.length
    ? `<h2>Frequently asked questions</h2>` +
      qa.map(([q, a]) => `<details open><summary><strong>${esc(q)}</strong></summary><p>${esc(a)}</p></details>`).join('')
    : ''

const topN = (arr, k) => {
  const m = {}
  arr.forEach((x) => {
    m[x] = (m[x] || 0) + 1
  })
  return Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([x, v]) => `${x} (${v})`)
    .join(', ')
}

const addDays = (iso, d) => {
  const t = new Date(iso)
  t.setDate(t.getDate() + d)
  return t.toISOString().slice(0, 10)
}

/* ===================== 5. BUILD LOOKUPS ===================== */
const STATES = Object.entries(STATE_DATA).map(([name, cities]) => ({
  name,
  slug: slug(name),
  cities: cities.map((c) => ({ name: c, slug: slug(c) })),
}))
const STATE_BY_SLUG = Object.fromEntries(STATES.map((s) => [s.slug, s]))
const ROLES = ROLE_ROWS.map(([cat, name, kw]) => ({
  cat,
  name,
  slug: slug(name),
  keywords: [name.toLowerCase(), ...kw.map((k) => k.toLowerCase())],
}))
const ROLE_BY_SLUG = Object.fromEntries(ROLES.map((r) => [r.slug, r]))
const KEYWORD_LIST = ROLES.flatMap((r) => r.keywords.map((k) => ({ k, r }))).sort((a, b) => b.k.length - a.k.length)

const matchRole = (title) => {
  const t = ' ' + String(title).toLowerCase() + ' '
  const hit = KEYWORD_LIST.find(({ k }) => t.includes(k))
  return hit ? hit.r : null
}

/* ===================== 6. SAMPLE / REAL JOBS ===================== */
const SAMPLE_JOBS = [
  { id: 'S1', title: 'Senior BIM Coordinator', company: 'Shapoorji Pallonji', city: 'Pune', state: 'Maharashtra', description: 'Coordinate multi-discipline Revit models and run Navisworks clash detection. Minimum 5 years experience.', salaryMin: 60000, salaryMax: 90000, applyUrl: 'https://castallioone.com/jobs/S1' },
  { id: 'S2', title: 'BIM Engineer', company: 'L&T Construction', city: 'Pune', state: 'Maharashtra', description: 'Prepare LOD 300-400 models for commercial projects in Revit.', salaryMin: 45000, salaryMax: 70000, applyUrl: 'https://castallioone.com/jobs/S2' },
  { id: 'S3', title: 'Site Engineer - Civil', company: 'Tata Projects', city: 'Mumbai', state: 'Maharashtra', description: 'Execution of high-rise RCC structures at site.', salaryMin: 40000, salaryMax: 65000, applyUrl: 'https://castallioone.com/jobs/S3' },
  { id: 'S4', title: 'MEP Engineer (HVAC)', company: 'Voltas Limited', city: 'Bengaluru', state: 'Karnataka', description: 'Design and supervise HVAC ducting and chilled water installation.', salaryMin: 55000, salaryMax: 85000, applyUrl: 'https://castallioone.com/jobs/S4' },
  { id: 'S5', title: 'Structural Engineer', company: 'Afcons Infrastructure', city: 'Hyderabad', state: 'Telangana', description: 'Design of RCC and steel structures using ETABS and STAAD Pro.', salaryMin: 50000, salaryMax: 80000, applyUrl: 'https://castallioone.com/jobs/S5' },
  { id: 'S6', title: 'Construction Project Manager', company: 'Godrej Properties', city: 'Gurugram', state: 'Haryana', description: 'Lead end-to-end delivery of luxury high-rise residential projects.', salaryMin: 90000, salaryMax: 150000, applyUrl: 'https://castallioone.com/jobs/S6' },
]

function loadJobs() {
  if (process.argv.includes('--sample')) {
    console.log('ℹ️ Running in --sample test mode with mock AEC jobs.')
    return SAMPLE_JOBS
  }
  if (!fs.existsSync(CONFIG.jobsFile)) {
    console.warn(`\n[!] ${CONFIG.jobsFile} not found. Running with sample mock data.\n    Export your real jobs first with "npm run seo:export" or use --sample.\n`)
    return SAMPLE_JOBS
  }
  try {
    const raw = fs.readFileSync(CONFIG.jobsFile, 'utf8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.warn('⚠️ jobs.json is empty. Falling back to sample dataset.')
      return SAMPLE_JOBS
    }
    return parsed
  } catch (err) {
    console.error('❌ Could not parse jobs.json:', err.message)
    return SAMPLE_JOBS
  }
}

const TYPE_MAP = {
  fulltime: 'FULL_TIME',
  full_time: 'FULL_TIME',
  parttime: 'PART_TIME',
  part_time: 'PART_TIME',
  contract: 'CONTRACTOR',
  contractor: 'CONTRACTOR',
  intern: 'INTERN',
  internship: 'INTERN',
  temporary: 'TEMPORARY',
}

function normalise(raw) {
  const st = STATE_BY_SLUG[slug(raw.state || '')]
  if (!st) {
    console.warn(`  skip job ${raw.id}: unknown state "${raw.state}"`)
    return null
  }
  let ct = st.cities.find((c) => c.slug === slug(raw.city || ''))
  if (!ct) {
    ct = { name: raw.city, slug: slug(raw.city) }
    st.cities.push(ct)
  }
  // Match role: prioritize title keywords, then fallback to explicit role/category
  let role = matchRole(raw.title)
  if (!role && raw.role) {
    role = ROLE_BY_SLUG[slug(raw.role)] || matchRole(raw.role)
  }
  if (!role) {
    console.warn(`  skip job ${raw.id}: no role matched for "${raw.title}"`)
    return null
  }
  const datePosted = (raw.datePosted || todayISO).slice(0, 10)
  const validThrough = (raw.validThrough || addDays(datePosted, 30)).slice(0, 10)
  if (validThrough < todayISO) return null

  const type = TYPE_MAP[String(raw.employmentType || 'full_time').toLowerCase().replace(/[\s-]/g, '_')] || 'FULL_TIME'
  const id = String(raw.id)
  return {
    id,
    title: String(raw.title),
    company: raw.company || CONFIG.siteName,
    desc: raw.description || '',
    state: st.name,
    stateSlug: st.slug,
    city: ct.name,
    citySlug: ct.slug,
    role,
    datePosted,
    validThrough,
    type,
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    applyUrl: raw.applyUrl || `${CONFIG.appUrl}/jobs/${id}`,
    remote: !!raw.remote,
    experienceMonths: raw.experienceMonths,
    skills: raw.skills,
    url: `${B}/job/${slug(id)}-${slug(raw.title)}-${ct.slug}/`,
  }
}

/* ===================== 7. INDEXES ===================== */
const idx = { state: new Map(), city: new Map(), cityRole: new Map(), role: new Map() }
const add = (m, k, j) => {
  if (!m.has(k)) m.set(k, [])
  m.get(k).push(j)
}
const get = (m, k) => m.get(k) || []

/* ===================== 8. HTML LAYOUT ===================== */
const SITEMAP = []

function layout({ title, desc, url, noindex, crumbs, h1, intro, body, extraLd = [], quick = '', faq = [] }) {
  const canonical = CONFIG.baseUrl + url
  const crumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: CONFIG.baseUrl + c.url,
    })),
  }
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: desc,
    url: canonical,
    inLanguage: 'en-IN',
    dateModified: todayISO,
    isPartOf: { '@type': 'WebSite', name: CONFIG.siteName, url: CONFIG.baseUrl },
    publisher: orgLd(),
  }
  const nav = crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<span>${esc(c.name)}</span>` : `<a href="${c.url}">${esc(c.name)}</a>`))
    .join(' › ')

  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(clip(title, 65))}</title>
<meta name="description" content="${esc(clip(desc, 158))}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-snippet:-1,max-image-preview:large'}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${CONFIG.favicon}" sizes="48x48">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(CONFIG.siteName)}">
<meta property="og:title" content="${esc(clip(title, 65))}">
<meta property="og:description" content="${esc(clip(desc, 158))}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_IN">
${CONFIG.ogImage ? `<meta property="og:image" content="${CONFIG.baseUrl}${CONFIG.ogImage}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" hreflang="en-IN" href="${canonical}">
${ld(crumbLd)}
${[webPageLd, ...extraLd, ...(faq.length ? [faqLd(faq)] : [])].map(ld).join('\n')}
<style>
:root{--primary:#0284c7;--primary-hover:#0369a1;--bg:#0b0f19;--card-bg:#111827;--border:#1f293d;--text:#f3f4f6;--muted:#9ca3af}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;color:var(--text);background:var(--bg);line-height:1.6}
header,main,footer{max-width:960px;margin:0 auto;padding:18px}
header{border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
header a.logo{font-weight:700;font-size:20px;text-decoration:none;color:#38bdf8;display:flex;align-items:center;gap:8px}
nav.crumbs{font-size:14px;color:var(--muted);margin:16px 0 8px}
nav.crumbs a{color:#38bdf8;text-decoration:none}
h1{font-size:30px;line-height:1.25;margin:8px 0 16px;color:#fff}
h2{font-size:20px;margin-top:32px;color:#e2e8f0}
ul.jobs{list-style:none;padding:0;display:flex;flex-direction:column;gap:12px}
li.card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:16px 20px;transition:border-color .2s}
li.card:hover{border-color:#38bdf8}
li.card a{color:#38bdf8;text-decoration:none;font-size:18px}
ul.chips{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px}
ul.chips a{display:inline-block;background:#1e293b;border:1px solid var(--border);border-radius:999px;padding:6px 14px;text-decoration:none;color:#93c5fd;font-size:13px}
ul.chips a:hover{background:#2563eb;color:#fff}
a.btn{display:inline-block;background:#0284c7;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px}
a.btn:hover{background:#0369a1}
footer{font-size:13px;color:var(--muted);border-top:1px solid var(--border);margin-top:40px;text-align:center}
.quick{background:rgba(2,132,199,0.12);border-left:4px solid #0284c7;padding:12px 16px;border-radius:6px;margin:16px 0}
details{background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:12px 16px;margin:10px 0}
summary{cursor:pointer;color:#38bdf8}
</style>
</head>
<body>
<header>
  <a class="logo" href="${CONFIG.baseUrl}">
    <img src="/app_icon.png" width="28" height="28" alt="" style="border-radius:6px;" />
    ${esc(CONFIG.siteName)}
  </a>
  <a class="btn" style="padding:6px 14px;font-size:13px;" href="${CONFIG.appUrl}/signin">Sign In</a>
</header>
<main>
<nav class="crumbs" aria-label="Breadcrumb">${nav}</nav>
<h1>${esc(h1)}</h1>
${quick ? `<div class="quick"><strong>Quick answer:</strong> ${esc(quick)}</div>` : ''}
<p style="color:var(--muted);">${intro}</p>
${body}
${faqBlock(faq)}
</main>
<footer>© ${today.getFullYear()} ${esc(CONFIG.siteName)} · AEC Talent &amp; Requisitions across India · Updated <time datetime="${todayISO}">${esc(monthYear)}</time></footer>
</body>
</html>`
}

function writePage(url, html, indexable, lastmod) {
  // 1. Write to dist-seo
  const dirDist = path.join(CONFIG.distSeoDir, url)
  fs.mkdirSync(dirDist, { recursive: true })
  fs.writeFileSync(path.join(dirDist, 'index.html'), html)

  // 2. Also write directly to public folder so Vite builds include it
  const dirPublic = path.join(CONFIG.outDir, url)
  fs.mkdirSync(dirPublic, { recursive: true })
  fs.writeFileSync(path.join(dirPublic, 'index.html'), html)

  if (indexable) {
    SITEMAP.push({ loc: CONFIG.baseUrl + url, lastmod: lastmod || todayISO })
  }
}

const chips = (items) =>
  items.length
    ? `<ul class="chips">${items.map((i) => `<li><a href="${i.url}">${esc(i.text)}</a></li>`).join('')}</ul>`
    : ''

const salaryText = (j) =>
  j.salaryMin ? ` · ${inr(j.salaryMin)}${j.salaryMax ? ' - ' + inr(j.salaryMax) : '+'} / month` : ''

const card = (j) =>
  `<li class="card"><a href="${j.url}"><strong>${esc(j.title)}</strong></a><br><span style="color:#94a3b8;">${esc(j.company)} · ${esc(j.city)}, ${esc(j.state)}${salaryText(j)}</span><br><small style="color:#64748b;">Posted ${j.datePosted}</small></li>`

const jobList = (jobs) =>
  jobs.length
    ? `<ul class="jobs">${jobs.slice(0, CONFIG.maxJobsOnListing).map(card).join('')}</ul>`
    : `<p>No open positions right now. <a href="${CONFIG.appUrl}/signup" style="color:#38bdf8;">Create a free talent profile</a> on ${esc(CONFIG.siteName)} to get matched.</p>`

const cta = (text) => `<p><a class="btn" href="${CONFIG.appUrl}/find-jobs">${esc(text)}</a></p>`

const collectionLd = (name, url, jobs) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  url: CONFIG.baseUrl + url,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: jobs.slice(0, CONFIG.maxJobsOnListing).map((j, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: CONFIG.baseUrl + j.url,
    })),
  },
})

/* ===================== 8b. AEO: Quick answer + FAQ ===================== */
function faqFor(kind, c) {
  const jobs = c.jobs
  const n = jobs.length
  const site = CONFIG.siteName
  if (!n) return { quick: '', faq: [] }

  const sal = jobs.filter((j) => j.salaryMin)
  const lo = sal.length ? Math.min(...sal.map((j) => j.salaryMin)) : null
  const hi = sal.length ? Math.max(...sal.map((j) => j.salaryMax || j.salaryMin)) : null
  const companies = [...new Set(jobs.map((j) => j.company))]

  const salaryQA = (what) =>
    lo
      ? [
          `What is the salary for ${what}?`,
          `Listed jobs on ${site} offer ${inr(lo)}${hi && hi !== lo ? ' to ' + inr(hi) : ''} per month. Actual compensation varies by experience, software skill level and employer.`,
        ]
      : null

  const companyQA = (where) =>
    companies.length
      ? [
          `Which companies are hiring ${where}?`,
          `Employers with open listings on ${site} include ${companies.slice(0, 5).join(', ')}.`,
        ]
      : null

  let qa = []
  if (kind === 'cityRole') {
    const { st, ct, role } = c
    const w = `${role.name} jobs in ${ct.name}`
    qa = [
      [`How many ${w} are there?`, `As of ${monthYear}, ${site} lists ${plural(n, 'open ' + role.name + ' position')} in ${ct.name}, ${st.name}.`],
      companyQA(`${role.name} in ${ct.name}`),
      salaryQA(`a ${role.name} in ${ct.name}`),
      [`How do I apply for ${w}?`, `Open any listing on ${site}, review qualifications, and apply directly via your verified Castallio profile.`],
    ]
  } else if (kind === 'city') {
    const { st, ct } = c
    qa = [
      [`How many AEC jobs are there in ${ct.name}?`, `As of ${monthYear}, ${site} lists ${plural(n, 'open AEC job')} in ${ct.name}, ${st.name}.`],
      [`Which AEC roles are most in demand in ${ct.name}?`, `The most listings on ${site} are for: ${topN(jobs.map((j) => j.role.name), 3)}.`],
      companyQA(`in ${ct.name}`),
      salaryQA(`AEC jobs in ${ct.name}`),
    ]
  } else if (kind === 'state') {
    const { st } = c
    qa = [
      [`How many AEC jobs are there in ${st.name}?`, `As of ${monthYear}, ${site} lists ${plural(n, 'open AEC job')} in ${st.name}.`],
      [`Which cities in ${st.name} have the most AEC jobs?`, `The most listings are in: ${topN(jobs.map((j) => j.city), 3)}.`],
      [`Which AEC roles are hiring in ${st.name}?`, `The most listings are for: ${topN(jobs.map((j) => j.role.name), 3)}.`],
      companyQA(`in ${st.name}`),
      salaryQA(`AEC jobs in ${st.name}`),
    ]
  } else if (kind === 'role') {
    const { role } = c
    qa = [
      [`How many ${role.name} jobs are there in India?`, `As of ${monthYear}, ${site} lists ${plural(n, 'open ' + role.name + ' position')} across India.`],
      [`Which cities have the most ${role.name} jobs?`, `The most listings are in: ${topN(jobs.map((j) => j.city), 3)}.`],
      companyQA(`${role.name} in India`),
      salaryQA(`a ${role.name} in India`),
    ]
  } else if (kind === 'hub') {
    qa = [
      [`What is ${site}?`, `${site} is a precision BIM and AEC network connecting engineers, modelers, and architects with world-class firms across India.`],
      [`How many AEC jobs are listed on ${site}?`, `As of ${monthYear}, ${site} lists ${plural(n, 'open job')} across India.`],
      [`Which states have the most AEC jobs?`, `The top hiring states are: ${topN(jobs.map((j) => j.state), 3)}.`],
      [`Which AEC roles are hiring most?`, `The top roles in demand are: ${topN(jobs.map((j) => j.role.name), 3)}.`],
    ]
  }
  qa = qa.filter(Boolean)
  return { quick: qa[0] ? qa[0][1] : '', faq: qa }
}

function jobFaq(j) {
  const qa = [
    [`Where is this ${j.title} job located?`, `${j.city}, ${j.state}, India.`],
    [`Who is hiring for this role?`, `${j.company}.`],
    [`Until when can I apply?`, `Applications are open until ${j.validThrough}.`],
  ]
  if (j.salaryMin) {
    qa.push([
      `What is the salary for this job?`,
      `${inr(j.salaryMin)}${j.salaryMax ? ' to ' + inr(j.salaryMax) : ''} per month, as listed by the employer.`,
    ])
  }
  return {
    quick: `${j.title} at ${j.company} in ${j.city}, ${j.state}. Posted ${j.datePosted}; apply by ${j.validThrough}.`,
    faq: qa,
  }
}

/* ===================== 9. PAGE GENERATORS ===================== */
const skipEmpty = (n) => n === 0 && CONFIG.emptyPages === 'skip'

function pageCityRole(st, ct, role) {
  const jobs = get(idx.cityRole, `${st.slug}/${ct.slug}/${role.slug}`)
  const n = jobs.length
  if (skipEmpty(n)) return

  const url = `${B}/${st.slug}/${ct.slug}/${role.slug}/`
  const title = n
    ? `${plural(n, role.name + ' Job')} in ${ct.name} | ${CONFIG.siteName}`
    : `${role.name} Jobs in ${ct.name} | ${CONFIG.siteName}`
  const desc = n
    ? `${plural(n, role.name + ' opening')} in ${ct.name}, ${st.name} - updated ${monthYear}. Apply on ${CONFIG.siteName}.`
    : `Looking for ${role.name} jobs in ${ct.name}, ${st.name}? Browse open requisitions on ${CONFIG.siteName}.`

  const sameCityRoles = ROLES.filter((r) => r.slug !== role.slug && get(idx.cityRole, `${st.slug}/${ct.slug}/${r.slug}`).length)
    .slice(0, 12)
    .map((r) => ({ url: `${B}/${st.slug}/${ct.slug}/${r.slug}/`, text: `${r.name} jobs in ${ct.name}` }))

  const sameRoleCities = st.cities.filter((c) => c.slug !== ct.slug && get(idx.cityRole, `${st.slug}/${c.slug}/${role.slug}`).length)
    .slice(0, 12)
    .map((c) => ({ url: `${B}/${st.slug}/${c.slug}/${role.slug}/`, text: `${role.name} jobs in ${c.name}` }))

  const body = `${jobList(jobs)}${cta(`Search more ${role.name} jobs`)}
${sameCityRoles.length ? `<h2>Other AEC jobs in ${esc(ct.name)}</h2>${chips(sameCityRoles)}` : ''}
${sameRoleCities.length ? `<h2>${esc(role.name)} jobs in other cities of ${esc(st.name)}</h2>${chips(sameRoleCities)}` : ''}
${chips([
  { url: `${B}/role/${role.slug}/`, text: `${role.name} jobs in India` },
  { url: `${B}/${st.slug}/${ct.slug}/`, text: `All jobs in ${ct.name}` },
  { url: `${B}/${st.slug}/`, text: `Jobs in ${st.name}` },
])}`

  writePage(
    url,
    layout({
      title,
      desc,
      url,
      noindex: n === 0,
      crumbs: [
        { name: 'Home', url: `${B}/` },
        { name: st.name, url: `${B}/${st.slug}/` },
        { name: ct.name, url: `${B}/${st.slug}/${ct.slug}/` },
        { name: `${role.name} Jobs`, url },
      ],
      h1: `${role.name} Jobs in ${ct.name}, ${st.name}`,
      intro: `${
        n
          ? `There ${n === 1 ? 'is' : 'are'} <strong>${plural(n, 'open ' + role.name + ' position')}</strong> in ${esc(ct.name)} right now.`
          : `No ${esc(role.name)} positions are open in ${esc(ct.name)} right now.`
      } ${esc(CATEGORY_BLURB[role.cat])}`,
      ...faqFor('cityRole', { st, ct, role, jobs }),
      body,
      extraLd: n ? [collectionLd(`${role.name} Jobs in ${ct.name}`, url, jobs)] : [],
    }),
    n > 0
  )
}

function pageCity(st, ct) {
  const jobs = get(idx.city, `${st.slug}/${ct.slug}`)
  const n = jobs.length
  if (skipEmpty(n)) return

  const url = `${B}/${st.slug}/${ct.slug}/`
  const roleChips = ROLES.map((r) => ({ r, c: get(idx.cityRole, `${st.slug}/${ct.slug}/${r.slug}`).length }))
    .filter((x) => x.c)
    .map((x) => ({ url: `${B}/${st.slug}/${ct.slug}/${x.r.slug}/`, text: `${x.r.name} (${x.c})` }))

  writePage(
    url,
    layout({
      title: n
        ? `${plural(n, 'AEC Job')} in ${ct.name} - BIM, Civil, MEP | ${CONFIG.siteName}`
        : `AEC Jobs in ${ct.name} | ${CONFIG.siteName}`,
      desc: `${n ? plural(n, 'architecture, engineering and construction job') : 'AEC jobs'} in ${ct.name}, ${st.name}: BIM, civil, structural, MEP. Updated ${monthYear}.`,
      url,
      noindex: n === 0,
      crumbs: [
        { name: 'Home', url: `${B}/` },
        { name: st.name, url: `${B}/${st.slug}/` },
        { name: ct.name, url },
      ],
      h1: `AEC Jobs in ${ct.name}, ${st.name}`,
      intro: `Browse <strong>${plural(n, 'open job')}</strong> in ${esc(ct.name)} across BIM, civil, structural, MEP, and architecture.`,
      body: `<h2>Jobs by role</h2>${chips(roleChips)}<h2>Latest jobs</h2>${jobList(jobs)}${cta('Search all jobs')}`,
      ...faqFor('city', { st, ct, jobs }),
      extraLd: n ? [collectionLd(`AEC Jobs in ${ct.name}`, url, jobs)] : [],
    }),
    n > 0
  )
}

function pageState(st) {
  const jobs = get(idx.state, st.slug)
  const n = jobs.length
  if (skipEmpty(n)) return

  const url = `${B}/${st.slug}/`
  const cityChips = st.cities
    .map((c) => ({ c, k: get(idx.city, `${st.slug}/${c.slug}`).length }))
    .filter((x) => x.k || CONFIG.emptyPages !== 'skip')
    .map((x) => ({ url: `${B}/${st.slug}/${x.c.slug}/`, text: `${x.c.name} (${x.k})` }))

  const roleChips = ROLES.map((r) => ({ r, k: jobs.filter((j) => j.role.slug === r.slug).length }))
    .filter((x) => x.k)
    .map((x) => ({ url: `${B}/role/${x.r.slug}/`, text: `${x.r.name} (${x.k})` }))

  writePage(
    url,
    layout({
      title: n ? `${plural(n, 'AEC Job')} in ${st.name} | ${CONFIG.siteName}` : `AEC Jobs in ${st.name} | ${CONFIG.siteName}`,
      desc: `Find ${n ? plural(n, 'job') : 'jobs'} in ${st.name}: BIM engineer, site engineer, MEP, structural, architect roles. Updated ${monthYear}.`,
      url,
      noindex: n === 0,
      crumbs: [
        { name: 'Home', url: `${B}/` },
        { name: st.name, url },
      ],
      h1: `AEC Jobs in ${st.name}`,
      intro: `<strong>${plural(n, 'open job')}</strong> across the top cities of ${esc(st.name)}.`,
      body: `<h2>Cities in ${esc(st.name)}</h2>${chips(cityChips)}<h2>Roles hiring</h2>${chips(roleChips)}<h2>Latest jobs</h2>${jobList(jobs)}`,
      ...faqFor('state', { st, jobs }),
      extraLd: n ? [collectionLd(`AEC Jobs in ${st.name}`, url, jobs)] : [],
    }),
    n > 0
  )
}

function pageRoleIndia(role) {
  const jobs = get(idx.role, role.slug)
  const n = jobs.length
  if (skipEmpty(n)) return

  const url = `${B}/role/${role.slug}/`
  const cityChips = STATES.flatMap((s) =>
    s.cities.map((c) => ({ s, c, k: get(idx.cityRole, `${s.slug}/${c.slug}/${role.slug}`).length }))
  )
    .filter((x) => x.k)
    .sort((a, b) => b.k - a.k)
    .slice(0, 40)
    .map((x) => ({ url: `${B}/${x.s.slug}/${x.c.slug}/${role.slug}/`, text: `${role.name} jobs in ${x.c.name} (${x.k})` }))

  writePage(
    url,
    layout({
      title: n ? `${plural(n, role.name + ' Job')} in India | ${CONFIG.siteName}` : `${role.name} Jobs in India | ${CONFIG.siteName}`,
      desc: `${n ? plural(n, role.name + ' opening') : role.name + ' jobs'} across India - Mumbai, Pune, Bengaluru, Delhi NCR, Hyderabad. Updated ${monthYear}.`,
      url,
      noindex: n === 0,
      crumbs: [
        { name: 'Home', url: `${B}/` },
        { name: `${role.name} Jobs`, url },
      ],
      h1: `${role.name} Jobs in India`,
      intro: `${esc(CATEGORY_BLURB[role.cat])} Browse <strong>${plural(n, 'current opening')}</strong>.`,
      body: `<h2>${esc(role.name)} jobs by city</h2>${chips(cityChips)}<h2>Latest ${esc(role.name)} jobs</h2>${jobList(jobs)}`,
      ...faqFor('role', { role, jobs }),
      extraLd: n ? [collectionLd(`${role.name} Jobs in India`, url, jobs)] : [],
    }),
    n > 0
  )
}

function pageHub(all) {
  const url = `${B}/`
  const stateChips = STATES.map((s) => ({ s, k: get(idx.state, s.slug).length }))
    .filter((x) => x.k)
    .map((x) => ({ url: `${B}/${x.s.slug}/`, text: `${x.s.name} (${x.k})` }))

  const roleChips = ROLES.map((r) => ({ r, k: get(idx.role, r.slug).length }))
    .filter((x) => x.k)
    .map((x) => ({ url: `${B}/role/${x.r.slug}/`, text: `${x.r.name} (${x.k})` }))

  writePage(
    url,
    layout({
      title: `${all.length ? plural(all.length, 'AEC Job') : 'AEC Jobs'} in India - BIM, Civil, MEP | ${CONFIG.siteName}`,
      desc: `India's premier BIM & AEC platform: ${all.length ? plural(all.length, 'job') : 'jobs'} for engineers, modelers, and architects. Updated ${monthYear}.`,
      url,
      noindex: false,
      crumbs: [{ name: 'Home', url }],
      h1: 'AEC Jobs in India',
      intro: `Architecture, engineering and construction jobs across India. <strong>${plural(all.length, 'open job')}</strong> right now.`,
      body: `<h2>Jobs by state</h2>${chips(stateChips)}<h2>Jobs by role</h2>${chips(roleChips)}<h2>Latest jobs</h2>${jobList(all)}${cta('Find your next AEC job')}`,
      ...faqFor('hub', { jobs: all }),
      extraLd: [websiteLd(), { '@context': 'https://schema.org', ...orgLd() }],
    }),
    true
  )
}

function pageJob(j) {
  const posting = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: j.title,
    description:
      j.desc
        .split(/\n+/)
        .filter(Boolean)
        .map((p) => `<p>${esc(p)}</p>`)
        .join('') || `<p>${esc(j.title)} at ${esc(j.company)}</p>`,
    identifier: { '@type': 'PropertyValue', name: j.company, value: j.id },
    datePosted: j.datePosted,
    validThrough: j.validThrough + 'T23:59',
    employmentType: j.type,
    hiringOrganization: { '@type': 'Organization', name: j.company },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: j.city,
        addressRegion: j.state,
        addressCountry: 'IN',
      },
    },
    directApply: false,
    industry: 'Architecture, Engineering and Construction',
    url: CONFIG.baseUrl + j.url,
  }

  if (j.experienceMonths) {
    posting.experienceRequirements = {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: Number(j.experienceMonths),
    }
  }
  if (j.skills) {
    posting.skills = Array.isArray(j.skills) ? j.skills.join(', ') : String(j.skills)
  }
  if (j.remote) {
    posting.jobLocationType = 'TELECOMMUTE'
    posting.applicantLocationRequirements = { '@type': 'Country', name: 'IN' }
  }
  if (j.salaryMin) {
    posting.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: j.salaryMin,
        ...(j.salaryMax ? { maxValue: j.salaryMax } : {}),
        unitText: 'MONTH',
      },
    }
  }

  const roleUrl = `${B}/${j.stateSlug}/${j.citySlug}/${j.role.slug}/`

  writePage(
    j.url,
    layout({
      title: `${j.title} - ${j.company}, ${j.city} | ${CONFIG.siteName}`,
      desc: `${j.title} job at ${j.company} in ${j.city}, ${j.state}.${j.salaryMin ? ' Salary ' + inr(j.salaryMin) + (j.salaryMax ? ' - ' + inr(j.salaryMax) : '+') + ' per month.' : ''} Apply on ${CONFIG.siteName}.`,
      url: j.url,
      noindex: false,
      crumbs: [
        { name: 'Home', url: `${B}/` },
        { name: j.state, url: `${B}/${j.stateSlug}/` },
        { name: j.city, url: `${B}/${j.stateSlug}/${j.citySlug}/` },
        { name: j.title, url: j.url },
      ],
      h1: j.title,
      intro: `<strong>${esc(j.company)}</strong> · ${esc(j.city)}, ${esc(j.state)}${esc(salaryText(j))} · Posted ${j.datePosted}`,
      body: `<h2>Job description</h2>${j.desc
        .split(/\n+/)
        .filter(Boolean)
        .map((p) => `<p>${esc(p)}</p>`)
        .join('')}
<p><a class="btn" href="${esc(j.applyUrl)}" rel="nofollow">Apply now on Castallio One</a></p>
${chips([
  { url: roleUrl, text: `More ${j.role.name} jobs in ${j.city}` },
  { url: `${B}/role/${j.role.slug}/`, text: `${j.role.name} jobs in India` },
])}`,
      ...jobFaq(j),
      extraLd: [posting],
    }),
    true,
    j.datePosted
  )
}

/* ===================== 10. SITEMAPS + ROBOTS ===================== */
function writeSitemaps() {
  const CHUNK = 45000
  const files = []

  for (let i = 0; i < SITEMAP.length; i += CHUNK) {
    const name = `sitemap-${files.length + 1}.xml`
    files.push(name)
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      SITEMAP.slice(i, i + CHUNK)
        .map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`)
        .join('\n') +
      '\n</urlset>\n'

    fs.writeFileSync(path.join(CONFIG.distSeoDir, name), xml)
    fs.writeFileSync(path.join(CONFIG.outDir, name), xml)
  }

  const index =
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    files.map((f) => `  <sitemap><loc>${CONFIG.baseUrl}/${f}</loc><lastmod>${todayISO}</lastmod></sitemap>`).join('\n') +
    '\n</sitemapindex>\n'

  fs.writeFileSync(path.join(CONFIG.distSeoDir, 'sitemap-index.xml'), index)
  fs.writeFileSync(path.join(CONFIG.outDir, 'sitemap-index.xml'), index)

  const bots = [
    'Googlebot',
    'Bingbot',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
  ]

  const robotsSnippet =
    `# GEO & SEO: Explicitly allow search and AI answer engines\n` +
    bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n') +
    `\nUser-agent: *\nAllow: /\n\nSitemap: ${CONFIG.baseUrl}/sitemap-index.xml\n`

  fs.writeFileSync(path.join(CONFIG.distSeoDir, 'robots-snippet.txt'), robotsSnippet)
}

function writeLlms(total) {
  const base = CONFIG.baseUrl
  const L = []
  L.push(
    `# ${CONFIG.siteName}`,
    '',
    `> ${CONFIG.siteName} is an AEC (architecture, engineering and construction) network and hiring platform in India. It lists jobs in BIM, civil, structural, MEP, mechanical, electrical, architecture and construction management across Indian states and cities.`,
    ''
  )
  L.push(
    '## Facts',
    `- Open jobs listed: ${total}`,
    `- Last updated: ${todayISO}`,
    `- Coverage: ${STATES.length} states and union territories, up to 10 cities each`,
    `- Website: ${base}`,
    ''
  )
  L.push('## Jobs by state')
  STATES.forEach((s) => {
    const k = get(idx.state, s.slug).length
    if (k) L.push(`- [${s.name}](${base}${B}/${s.slug}/): ${plural(k, 'job')}`)
  })
  L.push('', '## Jobs by role')
  ROLES.forEach((r) => {
    const k = get(idx.role, r.slug).length
    if (k) L.push(`- [${r.name} jobs in India](${base}${B}/role/${r.slug}/): ${plural(k, 'job')}`)
  })
  L.push('', '## Sitemaps', `- [Sitemap Index](${base}/sitemap-index.xml)`, '')

  const content = L.join('\n')
  fs.writeFileSync(path.join(CONFIG.distSeoDir, 'llms.txt'), content)
  fs.writeFileSync(path.join(CONFIG.outDir, 'llms.txt'), content)
}

/* ===================== 11. MAIN ===================== */
export function generatePages() {
  console.log('🚀 Starting SEO/AEO/GEO Page Generation...')
  const rawJobs = loadJobs()
  const jobs = rawJobs
    .map(normalise)
    .filter(Boolean)
    .sort((a, b) => (a.datePosted < b.datePosted ? 1 : -1))

  jobs.forEach((j) => {
    add(idx.state, j.stateSlug, j)
    add(idx.city, `${j.stateSlug}/${j.citySlug}`, j)
    add(idx.cityRole, `${j.stateSlug}/${j.citySlug}/${j.role.slug}`, j)
    add(idx.role, j.role.slug, j)
  })

  console.log(`📊 Processing ${jobs.length} valid, unexpired jobs...`)

  fs.rmSync(CONFIG.distSeoDir, { recursive: true, force: true })
  fs.mkdirSync(CONFIG.distSeoDir, { recursive: true })

  pageHub(jobs)
  ROLES.forEach(pageRoleIndia)
  STATES.forEach((st) => {
    pageState(st)
    st.cities.forEach((ct) => {
      pageCity(st, ct)
      ROLES.forEach((role) => pageCityRole(st, ct, role))
    })
  })
  jobs.forEach(pageJob)
  writeSitemaps()
  writeLlms(jobs.length)

  console.log(`\n🎉 Success! ${SITEMAP.length} indexable pages written to public/jobs and dist-seo/`)
  console.log(`📄 Sitemaps & llms.txt generated at public/sitemap-index.xml and public/llms.txt`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generatePages()
}
