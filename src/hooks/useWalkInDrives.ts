import { useState, useCallback, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

export interface WalkInDriveItem {
  id: string
  company_id: string
  posted_by: string
  title: string
  date_time: string | null
  location: string | null
  number_of_openings: number | null
  primary_role: string | null
  required_skills: string[] | null
  description: string | null
  status: 'active' | 'draft' | 'closed'
  is_urgent?: boolean | null
  applicants_count?: number | null
  created_at?: string | null
  company_name?: string | null
  company_logo?: string | null
  company_address?: string | null
  company_email?: string | null
  company_website?: string | null
  is_past?: boolean
}

export interface WalkInDriveFormData {
  title: string
  date: string
  time: string
  location: string
  number_of_openings: number
  primary_role: string
  required_skills: string[]
  description: string
  company_email: string
  company_website: string
}

export interface FormErrors {
  title?: string
  date?: string
  time?: string
  location?: string
  number_of_openings?: string
  primary_role?: string
  required_skills?: string
  description?: string
  company_email?: string
  company_website?: string
}

export type FormTouched = {
  [K in keyof WalkInDriveFormData]?: boolean
}

export const STANDARD_ROLE_TYPES = [
  'Architect',
  'AutoCAD Designer',
  'BIM Coordinator',
  'BIM Engineer',
  'BIM Manager',
  'BIM Modeler',
  'Civil Engineer',
  'Construction Manager',
  'Draftsman',
  'Electrical Engineer',
  'HVAC Engineer',
  'Interior Designer',
  'Landscape Architect',
  'Mechanical Engineer',
  'MEP Engineer',
  'Structural Engineer',
]

export const POPULAR_TECHNICAL_SKILLS = [
  'Revit',
  'AutoCAD',
  'Navisworks',
  'BIM 360',
  'Civil 3D',
  'Rhino',
  'Grasshopper',
  'Tekla',
  'ETABS',
  'Staad Pro',
  'Dynamo',
  'SketchUp',
  'ArchiCAD',
  'Primavera P6',
  'Solibri',
]

export function getLocalTodayDate(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getLocalCurrentTime(): string {
  const d = new Date()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function getUpcomingDefaultTime(): string {
  const d = new Date()
  const hours = d.getHours()
  if (hours < 9) {
    return '10:00'
  }
  const nextHour = hours + 1
  if (nextHour >= 20) {
    return '10:00'
  }
  return `${String(nextHour).padStart(2, '0')}:00`
}

// Valid Top-Level Domains (TLDs) & Second-Level Domains
export const VALID_DOMAIN_EXTENSIONS = new Set([
  // Core Requested TLDs
  'com',
  'in',
  'org',

  // Common Business & Enterprise TLDs
  'net',
  'co',
  'io',
  'ai',
  'biz',
  'info',
  'edu',
  'gov',
  'tech',
  'agency',
  'app',
  'global',
  'design',
  'build',
  'studio',
  'me',
  'dev',
  'cloud',
  'online',
  'site',
  'ltd',
  'services',
  'group',
  'solutions',
  'world',
  'pro',
  'engineering',
  'systems',
  'consulting',
  'space',
  'digital',
  'center',
  'link',
  'expert',
  'work',
  'zone',
  'team',
  'network',
  'media',
  'architect',
  'hub',
  'infra',
  'construction',
  'properties',
  'house',
  'estate',
  'enterprises',
  'international',
  'company',
  'ventures',
  'capital',
  'partners',
  'xyz',

  // Regional & Second-Level Country TLDs
  'co.in',
  'org.in',
  'net.in',
  'gov.in',
  'ac.in',
  'edu.in',
  'res.in',
  'gen.in',
  'firm.in',
  'ind.in',
  'co.uk',
  'org.uk',
  'me.uk',
  'ltd.uk',
  'com.au',
  'net.au',
  'org.au',
  'co.nz',
  'org.nz',
  'com.sg',
  'org.sg',
  'com.my',
  'co.za',
  'org.za',
  'com.ae',
  'co.jp',

  // Standard Country Codes
  'us',
  'uk',
  'ca',
  'au',
  'de',
  'fr',
  'sg',
  'ae',
  'jp',
  'nl',
  'se',
  'ch',
  'za',
  'nz',
  'ie',
  'it',
  'es',
  'br',
  'eu',
])

export function validateDomainExtension(
  input: string,
  type: 'email' | 'website'
): { isValid: boolean; error?: string } {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) {
    return {
      isValid: false,
      error: type === 'email' ? 'Company Email is required.' : 'Company Website URL is required.',
    }
  }

  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address (e.g. careers@company.com).',
      }
    }

    const domainPart = trimmed.split('@')[1] || ''
    const subParts = domainPart.split('.').filter(Boolean)
    if (subParts.length < 2) {
      return {
        isValid: false,
        error: 'Email domain must include a valid extension like .com, .in, .org.',
      }
    }

    // Check two-level extension first (e.g. co.in)
    const twoLevel = subParts.slice(-2).join('.')
    const singleLevel = subParts[subParts.length - 1]

    if (VALID_DOMAIN_EXTENSIONS.has(twoLevel) || VALID_DOMAIN_EXTENSIONS.has(singleLevel)) {
      return { isValid: true }
    }

    return {
      isValid: false,
      error: `Invalid email domain extension ('.${singleLevel}'). Must use a valid domain name like .com, .in, .org.`,
    }
  }

  // Website URL validation
  let clean = trimmed.replace(/^[a-zA-Z]+:\/\//, '')
  clean = clean.split('/')[0].split('?')[0].split('#')[0].split(':')[0].trim()

  if (!clean) {
    return {
      isValid: false,
      error: 'Please enter a valid website URL (e.g. https://company.com or company.com).',
    }
  }

  // Check valid hostname characters (alphanumeric, hyphens, dots)
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(clean)) {
    return {
      isValid: false,
      error: 'Please enter a valid website URL structure (e.g. https://company.com).',
    }
  }

  const subParts = clean.split('.').filter(Boolean)
  if (subParts.length < 2) {
    return {
      isValid: false,
      error: 'Website URL must include a valid domain extension like .com, .in, .org.',
    }
  }

  const twoLevel = subParts.slice(-2).join('.')
  const singleLevel = subParts[subParts.length - 1]

  if (VALID_DOMAIN_EXTENSIONS.has(twoLevel) || VALID_DOMAIN_EXTENSIONS.has(singleLevel)) {
    return { isValid: true }
  }

  return {
    isValid: false,
    error: `Invalid website domain extension ('.${singleLevel}'). Must use a valid domain name like .com, .in, .org.`,
  }
}

const INITIAL_FORM: WalkInDriveFormData = {
  title: '',
  date: '',
  time: '10:00',
  location: '',
  number_of_openings: 10,
  primary_role: 'BIM Coordinator',
  required_skills: ['Revit', 'Navisworks'],
  description: '',
  company_email: '',
  company_website: '',
}

export function useWalkInDrives() {
  const [drives, setDrives] = useState<WalkInDriveItem[]>([])
  const [publicDrives, setPublicDrives] = useState<WalkInDriveItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [publicLoading, setPublicLoading] = useState<boolean>(true)
  const [companyName, setCompanyName] = useState<string>('Company')
  const [companyEmail, setCompanyEmail] = useState<string>('')
  const [companyWebsite, setCompanyWebsite] = useState<string>('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formData, setFormData] = useState<WalkInDriveFormData>(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({})
  const [minDate, setMinDate] = useState<string>(getLocalTodayDate)
  const [currentTime, setCurrentTime] = useState<string>(getLocalCurrentTime)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 3500)
  }, [])

  // 1. Fetch employer's company drives
  const fetchEmployerDrives = useCallback(async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        setLoading(false)
        return
      }

      const uid = userData.user.id
      setUserId(uid)

      // Resolve company
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, email, website, hr_contact_email')
        .eq('owner_id', uid)
        .maybeSingle()

      const cId = companyData?.id || null
      setCompanyId(cId)
      if (companyData?.name) {
        setCompanyName(companyData.name)
      }
      if (companyData?.email || companyData?.hr_contact_email) {
        setCompanyEmail(companyData.hr_contact_email || companyData.email || '')
      }
      if (companyData?.website) {
        setCompanyWebsite(companyData.website)
      }

      let query = supabase
        .from('walk_in_drives')
        .select('*')
        .order('date_time', { ascending: false })

      if (cId) {
        query = query.or(`company_id.eq.${cId},posted_by.eq.${uid}`)
      } else {
        query = query.eq('posted_by', uid)
      }

      const { data, error } = await query
      if (error) throw error

      const nowTs = Date.now()
      const todayStr = getLocalTodayDate()
      setMinDate(todayStr)
      setCurrentTime(getLocalCurrentTime())

      const rawList = (data as WalkInDriveItem[]) || []
      const mapped: WalkInDriveItem[] = rawList.map((d) => ({
        ...d,
        is_past: d.date_time ? new Date(d.date_time).getTime() < nowTs : false,
      }))

      setDrives(mapped)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch walk-in drives'
      console.error('fetchEmployerDrives error:', msg)
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // 2. Fetch public drives for Talent
  const fetchPublicDrives = useCallback(async () => {
    try {
      // Query active drives with joined company details
      const { data, error } = await supabase
        .from('walk_in_drives')
        .select('*, companies(id, name, logo_url, office_address, email, website)')
        .eq('status', 'active')
        .order('date_time', { ascending: true })

      if (error) throw error

      interface RawDriveRow {
        id: string
        company_id: string
        posted_by: string
        title: string
        date_time: string | null
        location: string | null
        number_of_openings: number | null
        primary_role: string | null
        required_skills: string[] | null
        description: string | null
        status: 'active' | 'draft' | 'closed'
        is_urgent?: boolean | null
        applicants_count?: number | null
        created_at?: string | null
        company_email?: string | null
        company_website?: string | null
        companies?: {
          id: string
          name: string
          logo_url: string | null
          office_address: string | null
          email?: string | null
          website?: string | null
        } | null
      }

      const rawList = (data as RawDriveRow[]) || []
      const mapped: WalkInDriveItem[] = rawList.map((row) => ({
        id: row.id,
        company_id: row.company_id,
        posted_by: row.posted_by,
        title: row.title,
        date_time: row.date_time,
        location: row.location,
        number_of_openings: row.number_of_openings,
        primary_role: row.primary_role,
        required_skills: row.required_skills,
        description: row.description,
        status: row.status,
        is_urgent: row.is_urgent,
        applicants_count: row.applicants_count,
        created_at: row.created_at,
        company_name: row.companies?.name || 'AEC Enterprise Firm',
        company_logo: row.companies?.logo_url || null,
        company_address: row.companies?.office_address || row.location,
        company_email: row.company_email || row.companies?.email || null,
        company_website: row.company_website || row.companies?.website || null,
      }))

      setPublicDrives(mapped)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch walk-in drive feed'
      console.error('fetchPublicDrives error:', msg)
    } finally {
      setPublicLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEmployerDrives()
    void fetchPublicDrives()
  }, [fetchEmployerDrives, fetchPublicDrives])

  // Runtime single-field validator
  const validateSingleField = useCallback((field: keyof WalkInDriveFormData, val?: unknown): string => {
    switch (field) {
      case 'title': {
        const str = typeof val === 'string' ? val.trim() : formData.title.trim()
        if (!str) return 'Drive Title is required.'
        if (str.length < 5) return 'Drive Title must be at least 5 characters.'
        return ''
      }
      case 'date': {
        const str = typeof val === 'string' ? val.trim() : formData.date.trim()
        if (!str) return 'Drive Date is required.'
        const todayStr = getLocalTodayDate()
        if (str < todayStr) {
          return 'Drive Date cannot be in the past. Please select today or a future date.'
        }
        return ''
      }
      case 'time': {
        const str = typeof val === 'string' ? val.trim() : formData.time.trim()
        if (!str) return 'Drive start time is required.'
        const todayStr = getLocalTodayDate()
        const selectedDate = formData.date.trim()
        if (selectedDate === todayStr) {
          const nowTime = getLocalCurrentTime()
          if (str < nowTime) {
            return 'For a drive scheduled today, start time must be from now onwards.'
          }
        }
        return ''
      }
      case 'location': {
        const str = typeof val === 'string' ? val.trim() : formData.location.trim()
        if (!str) return 'Venue Location address is required.'
        if (str.length < 8) return 'Please provide detailed venue address with landmarks.'
        return ''
      }
      case 'number_of_openings': {
        const num = typeof val === 'number' ? val : Number(formData.number_of_openings)
        if (isNaN(num) || num <= 0) return 'Openings must be at least 1.'
        return ''
      }
      case 'primary_role': {
        const str = typeof val === 'string' ? val.trim() : formData.primary_role.trim()
        if (!str) return 'Primary Role Type is required.'
        return ''
      }
      case 'required_skills': {
        const skills = Array.isArray(val) ? val : formData.required_skills
        if (!skills || skills.length === 0) return 'Select at least 1 Technical Focus skill.'
        return ''
      }
      case 'description': {
        const str = typeof val === 'string' ? val.trim() : formData.description.trim()
        if (!str) return 'Event instructions & candidate guidelines are required.'
        if (str.length < 20) return 'Description must be at least 20 characters (include docs to bring, schedule, etc.).'
        return ''
      }
      case 'company_email': {
        const str = typeof val === 'string' ? val.trim() : formData.company_email.trim()
        const check = validateDomainExtension(str, 'email')
        if (!check.isValid) {
          return check.error || 'Invalid company email address.'
        }
        return ''
      }
      case 'company_website': {
        const str = typeof val === 'string' ? val.trim() : formData.company_website.trim()
        const check = validateDomainExtension(str, 'website')
        if (!check.isValid) {
          return check.error || 'Invalid company website URL.'
        }
        return ''
      }
      default:
        return ''
    }
  }, [formData])

  // Handle blur for runtime validation
  const handleBlur = useCallback((field: keyof WalkInDriveFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const err = validateSingleField(field)
    setFormErrors((prev) => ({ ...prev, [field]: err || undefined }))
  }, [validateSingleField])

  // Handle change for runtime validation
  const handleFieldChange = useCallback((field: keyof WalkInDriveFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => {
      const err = validateSingleField(field, value)
      const nextErrors: FormErrors = { ...prev, [field]: err || undefined }

      // Cross-revalidation between date and time
      const todayStr = getLocalTodayDate()
      const nowTime = getLocalCurrentTime()

      if (field === 'date') {
        const selectedDate = typeof value === 'string' ? value.trim() : ''
        if (selectedDate === todayStr && formData.time) {
          if (formData.time < nowTime) {
            nextErrors.time = 'For a drive scheduled today, start time must be from now onwards.'
          } else if (prev.time?.includes('from now onwards')) {
            delete nextErrors.time
          }
        } else if (selectedDate > todayStr && prev.time?.includes('from now onwards')) {
          delete nextErrors.time
        }
      }

      if (field === 'time') {
        const selectedTime = typeof value === 'string' ? value.trim() : ''
        if (formData.date === todayStr) {
          if (selectedTime < nowTime) {
            nextErrors.time = 'For a drive scheduled today, start time must be from now onwards.'
          } else if (prev.time?.includes('from now onwards')) {
            delete nextErrors.time
          }
        }
      }

      return nextErrors
    })
  }, [validateSingleField, formData.date, formData.time])

  // Open modal with fresh date/time bounds and pre-populated company info
  const openCreateModal = useCallback(() => {
    const todayStr = getLocalTodayDate()
    const nowTimeStr = getLocalCurrentTime()
    const defTime = getUpcomingDefaultTime()
    setMinDate(todayStr)
    setCurrentTime(nowTimeStr)
    setFormData((prev) => ({
      ...prev,
      date: prev.date && prev.date >= todayStr ? prev.date : todayStr,
      time: prev.date === todayStr && prev.time && prev.time < nowTimeStr ? defTime : (prev.time || defTime),
      company_email: prev.company_email || companyEmail,
      company_website: prev.company_website || companyWebsite,
    }))
    setIsModalOpen(true)
  }, [companyEmail, companyWebsite])

  // Create Walk-in Drive Feed
  const handleCreateDrive = useCallback(async () => {
    // Touch all fields on submit
    const allTouched: FormTouched = {
      title: true,
      date: true,
      time: true,
      location: true,
      number_of_openings: true,
      primary_role: true,
      required_skills: true,
      description: true,
      company_email: true,
      company_website: true,
    }
    setTouched(allTouched)

    const keys: (keyof WalkInDriveFormData)[] = [
      'title',
      'date',
      'time',
      'location',
      'number_of_openings',
      'primary_role',
      'required_skills',
      'description',
      'company_email',
      'company_website',
    ]
    const errors: FormErrors = {}
    keys.forEach((k) => {
      const err = validateSingleField(k)
      if (err) errors[k] = err
    })
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      showToast('Please correct the highlighted form errors before publishing.')
      return false
    }

    // Strict submission guard: date & time must be from now onwards
    const todayStr = getLocalTodayDate()
    if (formData.date < todayStr) {
      showToast('Drive Date cannot be in the past. Please select today or a future date.')
      return false
    }
    if (formData.date === todayStr && formData.time) {
      const nowTime = getLocalCurrentTime()
      if (formData.time < nowTime) {
        showToast('Drive start time must be from now onwards.')
        return false
      }
    }

    // Strict submission guard: domain validation for email and website
    const emailDomainCheck = validateDomainExtension(formData.company_email, 'email')
    if (!emailDomainCheck.isValid) {
      showToast(emailDomainCheck.error || 'Invalid company email domain.')
      return false
    }
    const webDomainCheck = validateDomainExtension(formData.company_website, 'website')
    if (!webDomainCheck.isValid) {
      showToast(webDomainCheck.error || 'Invalid company website domain.')
      return false
    }

    try {
      setIsSubmitting(true)

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        throw new Error('You must be signed in as an employer to publish a drive.')
      }

      let activeCompanyId = companyId
      if (!activeCompanyId) {
        const { data: cData } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', userData.user.id)
          .maybeSingle()
        if (cData?.id) activeCompanyId = cData.id
      }

      if (!activeCompanyId) {
        throw new Error('No registered enterprise company profile found. Please complete company setup first.')
      }

      const driveDateTime = new Date(`${formData.date}T${formData.time}`).toISOString()

      let formattedWebsite = formData.company_website.trim()
      if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
        formattedWebsite = `https://${formattedWebsite}`
      }

      const payload = {
        company_id: activeCompanyId,
        posted_by: userData.user.id,
        title: formData.title.trim(),
        date_time: driveDateTime,
        location: formData.location.trim(),
        number_of_openings: Number(formData.number_of_openings),
        primary_role: formData.primary_role.trim(),
        required_skills: formData.required_skills,
        description: formData.description.trim(),
        company_email: formData.company_email.trim(),
        company_website: formattedWebsite,
        status: 'active' as const,
        is_urgent: false,
        applicants_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: inserted, error: insertError } = await supabase
        .from('walk_in_drives')
        .insert(payload)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      showToast('Walk-in Drive Feed published successfully!')
      setFormData(INITIAL_FORM)
      setFormErrors({})
      setTouched({})
      setIsModalOpen(false)

      if (inserted) {
        setDrives((prev) => [inserted as WalkInDriveItem, ...prev])
        void fetchPublicDrives()
      }

      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish walk-in drive'
      console.error('handleCreateDrive error:', msg)
      showToast(msg)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, companyId, validateSingleField, showToast, fetchPublicDrives])

  // Toggle status between active and closed
  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: 'active' | 'draft' | 'closed') => {
      try {
        const newStatus = currentStatus === 'active' ? 'closed' : 'active'
        const { error } = await supabase
          .from('walk_in_drives')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error

        setDrives((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
        )
        showToast(`Drive status marked as ${newStatus}.`)
        void fetchPublicDrives()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update drive status'
        showToast(msg)
      }
    },
    [showToast, fetchPublicDrives]
  )

  // Delete drive
  const handleDeleteDrive = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('walk_in_drives').delete().eq('id', id)
        if (error) throw error

        setDrives((prev) => prev.filter((d) => d.id !== id))
        showToast('Walk-in drive feed post removed.')
        void fetchPublicDrives()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete drive'
        showToast(msg)
      }
    },
    [showToast, fetchPublicDrives]
  )

  // Segregate into upcoming and past
  const upcomingDrives = useMemo(() => {
    return drives.filter((d) => !d.is_past)
  }, [drives])

  const pastDrives = useMemo(() => {
    return drives.filter((d) => !!d.is_past)
  }, [drives])

  const totalOpenings = useMemo(() => {
    return drives.reduce((sum, d) => sum + (d.number_of_openings || 0), 0)
  }, [drives])

  return {
    drives,
    upcomingDrives,
    pastDrives,
    publicDrives,
    loading,
    publicLoading,
    companyName,
    companyId,
    userId,
    totalOpenings,
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    touched,
    setTouched,
    minDate,
    currentTime,
    openCreateModal,
    validateSingleField,
    handleBlur,
    handleFieldChange,
    toastMessage,
    showToast,
    fetchEmployerDrives,
    fetchPublicDrives,
    handleCreateDrive,
    handleToggleStatus,
    handleDeleteDrive,
  }
}
