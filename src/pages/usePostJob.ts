import { useState, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface CandidatePreview {
  id: string
  initials: string
  name: string
  skills: string
  fitScore: number
}

export interface PostJobFormData {
  title: string
  category: string
  projectType: string
  experience: string
  workType: 'On-site' | 'Hybrid' | 'Remote'
  location: string
  employmentTypes: string[]
  salaryMin: string
  salaryMax: string
  currency: string
  numberOfOpenings: number
  jobDescription: string
  technicalRequirements: string
  responsibilities: string
  whatWeOffer: string
}

export type FormErrors = Partial<Record<keyof PostJobFormData, string>>
export type FormTouched = Partial<Record<keyof PostJobFormData, boolean>>

export const CATEGORIES = [
  'Structural Engineering',
  'Construction Management',
  'Architecture',
  'BIM / VDC',
  'MEP Engineering',
  'Project Management',
  'Civil Engineering',
  'Interior Design',
] as const

export const PROJECT_TYPES = [
  'Commercial',
  'Residential',
  'Infrastructure',
  'Industrial',
  'Mixed-Use',
  'Institutional',
] as const

export const EXPERIENCE_LEVELS = [
  'Fresher (0-1 years)',
  '1-2 years',
  '2-5 years',
  '5-8 years',
  '8+ years',
] as const

export const WORK_TYPES: ('On-site' | 'Hybrid' | 'Remote')[] = ['On-site', 'Hybrid', 'Remote']

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
] as const

export const POPULAR_CITIES = [
  'Mumbai',
  'Pune',
  'Nagpur',
  'Nashik',
  'Bengaluru',
  'Delhi',
  'Hyderabad',
  'Remote',
] as const

export const POPULAR_TITLES = [
  'Structural Engineer',
  'Senior Construction Manager',
  'BIM Coordinator',
  'Architect',
  'Project Manager',
  'MEP Design Engineer',
] as const

export function formatIndianNumber(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === '') return ''
  const clean = String(val).replace(/,/g, '').trim()
  if (!clean || isNaN(Number(clean))) return String(val)
  return Number(clean).toLocaleString('en-IN')
}

export function formatIndianWords(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === '') return ''
  const clean = String(val).replace(/,/g, '').trim()
  const num = Number(clean)
  if (!clean || isNaN(num) || num <= 0) return ''
  if (num >= 10000000) {
    const cr = num / 10000000
    return `${Number(cr.toFixed(2))} Cr`
  }
  if (num >= 100000) {
    const lakh = num / 100000
    return `${Number(lakh.toFixed(2))} Lakh${lakh > 1 ? 's' : ''}`
  }
  if (num >= 1000) {
    const k = num / 1000
    return `${Number(k.toFixed(1))}k`
  }
  return ''
}

const CANDIDATE_MATCHES: CandidatePreview[] = [
  { id: 'c-1', initials: 'AM', name: 'Alex Morgan', skills: 'Revit • Dynamo • IFC4', fitScore: 98 },
  { id: 'c-2', initials: 'DK', name: 'David Kim', skills: 'AutoCAD • SAP2000 • Tekla', fitScore: 94 },
  { id: 'c-3', initials: 'EV', name: 'Elena Rostova', skills: 'BIM 360 • Navisworks • BEP', fitScore: 91 },
]

export function usePostJob(onSuccess?: () => void) {
  const [currentStep, setCurrentStep] = useState<number>(1)

  // 13 Form Fields
  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [projectType, setProjectType] = useState<string>('Commercial')
  const [experience, setExperience] = useState<string>('')
  const [workType, setWorkType] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid')
  const [location, setLocation] = useState<string>('')
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(['Full-time'])
  const [salaryMin, setSalaryMin] = useState<string>('')
  const [salaryMax, setSalaryMax] = useState<string>('')
  const [currency, setCurrency] = useState<string>('₹ (INR)')
  const [numberOfOpenings, setNumberOfOpenings] = useState<number>(1)
  const [jobDescription, setJobDescription] = useState<string>('')
  const [technicalRequirements, setTechnicalRequirements] = useState<string>('')
  const [responsibilities, setResponsibilities] = useState<string>('')
  const [whatWeOffer, setWhatWeOffer] = useState<string>('')

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Modals & Notifications
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [isPublishSuccessModalOpen, setIsPublishSuccessModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  // Runtime field-level validation function
  const validateSingleField = useCallback((field: keyof PostJobFormData, val?: unknown): string => {
    switch (field) {
      case 'title': {
        const str = typeof val === 'string' ? val.trim() : title.trim()
        if (!str) return 'Job title is required.'
        if (str.length < 3) return 'Job title must be at least 3 characters.'
        return ''
      }
      case 'category': {
        const str = typeof val === 'string' ? val.trim() : category.trim()
        if (!str) return 'Please select a job category.'
        return ''
      }
      case 'projectType': {
        const str = typeof val === 'string' ? val.trim() : projectType.trim()
        if (!str) return 'Please select a project type.'
        return ''
      }
      case 'experience': {
        const str = typeof val === 'string' ? val.trim() : experience.trim()
        if (!str) return 'Please select required experience level.'
        return ''
      }
      case 'workType': {
        const str = typeof val === 'string' ? val.trim() : workType.trim()
        if (!str) return 'Work type is required.'
        return ''
      }
      case 'location': {
        const str = typeof val === 'string' ? val.trim() : location.trim()
        if (!str) return 'Location / city is required.'
        return ''
      }
      case 'employmentTypes': {
        const arr = Array.isArray(val) ? val : employmentTypes
        if (!arr || arr.length === 0) return 'Select at least one employment type.'
        return ''
      }
      case 'salaryMin':
      case 'salaryMax': {
        const rawMin = field === 'salaryMin' ? (typeof val === 'string' ? val : salaryMin) : salaryMin
        const rawMax = field === 'salaryMax' ? (typeof val === 'string' ? val : salaryMax) : salaryMax

        const minClean = rawMin ? String(rawMin).replace(/,/g, '').trim() : ''
        const maxClean = rawMax ? String(rawMax).replace(/,/g, '').trim() : ''

        if (minClean && isNaN(Number(minClean))) return 'Minimum salary must be a valid number.'
        if (maxClean && isNaN(Number(maxClean))) return 'Maximum salary must be a valid number.'

        if (minClean && maxClean && Number(minClean) > Number(maxClean)) {
          return 'Minimum salary cannot exceed maximum salary.'
        }
        return ''
      }
      case 'numberOfOpenings': {
        const num = typeof val === 'number' ? val : numberOfOpenings
        if (!num || num < 1) return 'Number of openings must be at least 1.'
        return ''
      }
      case 'jobDescription': {
        const str = typeof val === 'string' ? val.trim() : jobDescription.trim()
        if (!str) return 'Job description is required.'
        if (str.length < 20) return 'Description must be at least 20 characters.'
        return ''
      }
      case 'technicalRequirements': {
        const str = typeof val === 'string' ? val.trim() : technicalRequirements.trim()
        if (!str) return 'Technical requirements are required.'
        if (str.length < 10) return 'Please specify at least 10 characters of technical skills.'
        return ''
      }
      case 'responsibilities': {
        const str = typeof val === 'string' ? val.trim() : responsibilities.trim()
        if (!str) return 'Responsibilities are required.'
        if (str.length < 10) return 'Please describe core responsibilities (at least 10 characters).'
        return ''
      }
      default:
        return ''
    }
  }, [
    title,
    category,
    projectType,
    experience,
    workType,
    location,
    employmentTypes,
    salaryMin,
    salaryMax,
    numberOfOpenings,
    jobDescription,
    technicalRequirements,
    responsibilities,
  ])

  // Field change handlers with live error clearing
  const handleFieldChange = useCallback((field: keyof PostJobFormData, val: unknown) => {
    const errorMsg = validateSingleField(field, val)
    setErrors((prev) => ({
      ...prev,
      [field]: errorMsg || undefined,
    }))
  }, [validateSingleField])

  // On blur handler to mark field as touched
  const handleBlur = useCallback((field: keyof PostJobFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const errorMsg = validateSingleField(field)
    setErrors((prev) => ({
      ...prev,
      [field]: errorMsg || undefined,
    }))
  }, [validateSingleField])

  // Toggle employment type (multi-select)
  const handleToggleEmploymentType = useCallback((type: string) => {
    setEmploymentTypes((prev) => {
      const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      handleFieldChange('employmentTypes', next)
      return next
    })
  }, [handleFieldChange])

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    const fieldsToValidate: (keyof PostJobFormData)[] = [
      'title',
      'category',
      'projectType',
      'experience',
      'workType',
      'location',
      'employmentTypes',
      'salaryMin',
      'salaryMax',
      'numberOfOpenings',
      'jobDescription',
      'technicalRequirements',
      'responsibilities',
    ]

    let isValid = true
    fieldsToValidate.forEach((f) => {
      const err = validateSingleField(f)
      if (err) {
        newErrors[f] = err
        isValid = false
      }
    })

    setErrors(newErrors)
    // Mark all required fields as touched so errors display
    const allTouched: FormTouched = {}
    fieldsToValidate.forEach((f) => {
      allTouched[f] = true
    })
    setTouched(allTouched)

    return isValid
  }, [validateSingleField])

  // Dynamic Health Score computation (0 - 100%)
  const healthScore = useMemo(() => {
    let score = 0
    if (title.trim().length >= 3) score += 15
    if (category.trim()) score += 10
    if (projectType.trim()) score += 5
    if (experience.trim()) score += 10
    if (workType.trim() && location.trim()) score += 10
    if (employmentTypes.length > 0) score += 10
    if (salaryMin.trim() || salaryMax.trim()) score += 10
    if (numberOfOpenings >= 1) score += 5
    if (jobDescription.trim().length >= 20) score += 10
    if (technicalRequirements.trim().length >= 10) score += 5
    if (responsibilities.trim().length >= 10) score += 5
    if (whatWeOffer.trim().length >= 5) score += 5
    return Math.min(100, score)
  }, [
    title,
    category,
    projectType,
    experience,
    workType,
    location,
    employmentTypes,
    salaryMin,
    salaryMax,
    numberOfOpenings,
    jobDescription,
    technicalRequirements,
    responsibilities,
    whatWeOffer,
  ])

  // Publish Job Requisition to Supabase
  const handlePublishRequisition = useCallback(async () => {
    if (!validateForm()) {
      showToast('Please fix the highlighted errors before publishing.')
      return
    }

    try {
      setIsSubmitting(true)
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        throw new Error('Please sign in to publish a job requisition.')
      }

      const user = userData.user

      // Find company id for this employer
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      const companyId = companyData?.id

      if (!companyId) {
        throw new Error('Company profile not found. Please complete company setup first.')
      }

      const payload = {
        company_id: companyId,
        posted_by: user.id,
        title: title.trim(),
        category: category.trim(),
        project_type: projectType.trim(),
        experience: experience.trim(),
        work_type: workType,
        location: location.trim(),
        employment_type: employmentTypes,
        salary_min: salaryMin ? parseFloat(String(salaryMin).replace(/,/g, '')) : null,
        salary_max: salaryMax ? parseFloat(String(salaryMax).replace(/,/g, '')) : null,
        number_of_openings: numberOfOpenings ? parseInt(String(numberOfOpenings), 10) : 1,
        job_description: jobDescription.trim(),
        technical_requirements: technicalRequirements.trim(),
        responsibilities: responsibilities.trim(),
        about_us: whatWeOffer.trim() || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase
        .from('create_job_post')
        .insert(payload)

      if (insertError) {
        throw new Error(insertError.message)
      }

      setIsPublishSuccessModalOpen(true)
      showToast('Requisition successfully published to Castallio Talent Radar!')

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2200)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish requisition.'
      console.error('handlePublishRequisition error:', msg)
      showToast(msg)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    validateForm,
    title,
    category,
    projectType,
    experience,
    workType,
    location,
    employmentTypes,
    salaryMin,
    salaryMax,
    numberOfOpenings,
    jobDescription,
    technicalRequirements,
    responsibilities,
    whatWeOffer,
    showToast,
    onSuccess,
  ])

  // Save Draft to Supabase
  const handleSaveDraft = useCallback(async () => {
    if (!title.trim()) {
      showToast('Please provide at least a job title to save a draft.')
      return
    }

    try {
      setIsSubmitting(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      let companyId: string | null = null
      if (user) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()
        companyId = companyData?.id || null
      }

      if (user && companyId) {
        const payload = {
          company_id: companyId,
          posted_by: user.id,
          title: title.trim(),
          category: category.trim() || null,
          project_type: projectType || null,
          experience: experience.trim() || null,
          work_type: workType,
          location: location.trim() || null,
          employment_type: employmentTypes,
          salary_min: salaryMin ? parseFloat(String(salaryMin).replace(/,/g, '')) : null,
          salary_max: salaryMax ? parseFloat(String(salaryMax).replace(/,/g, '')) : null,
          number_of_openings: numberOfOpenings || 1,
          job_description: jobDescription.trim() || null,
          technical_requirements: technicalRequirements.trim() || null,
          responsibilities: responsibilities.trim() || null,
          about_us: whatWeOffer.trim() || null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from('create_job_post').insert(payload)
        if (error) throw error
      }

      showToast('Requisition draft saved to Talent Vault.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save draft.'
      showToast(msg)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    title,
    category,
    projectType,
    experience,
    workType,
    location,
    employmentTypes,
    salaryMin,
    salaryMax,
    numberOfOpenings,
    jobDescription,
    technicalRequirements,
    responsibilities,
    whatWeOffer,
    showToast,
  ])

  return {
    currentStep,
    setCurrentStep,
    // Fields
    title,
    setTitle: (val: string) => {
      setTitle(val)
      handleFieldChange('title', val)
    },
    category,
    setCategory: (val: string) => {
      setCategory(val)
      handleFieldChange('category', val)
    },
    projectType,
    setProjectType: (val: string) => {
      setProjectType(val)
      handleFieldChange('projectType', val)
    },
    experience,
    setExperience: (val: string) => {
      setExperience(val)
      handleFieldChange('experience', val)
    },
    workType,
    setWorkType: (val: 'On-site' | 'Hybrid' | 'Remote') => {
      setWorkType(val)
      handleFieldChange('workType', val)
    },
    location,
    setLocation: (val: string) => {
      setLocation(val)
      handleFieldChange('location', val)
    },
    employmentTypes,
    handleToggleEmploymentType,
    salaryMin,
    setSalaryMin: (val: string) => {
      setSalaryMin(val)
      handleFieldChange('salaryMin', val)
    },
    salaryMax,
    setSalaryMax: (val: string) => {
      setSalaryMax(val)
      handleFieldChange('salaryMax', val)
    },
    currency,
    setCurrency,
    numberOfOpenings,
    setNumberOfOpenings: (val: number) => {
      setNumberOfOpenings(val)
      handleFieldChange('numberOfOpenings', val)
    },
    jobDescription,
    setJobDescription: (val: string) => {
      setJobDescription(val)
      handleFieldChange('jobDescription', val)
    },
    technicalRequirements,
    setTechnicalRequirements: (val: string) => {
      setTechnicalRequirements(val)
      handleFieldChange('technicalRequirements', val)
    },
    responsibilities,
    setResponsibilities: (val: string) => {
      setResponsibilities(val)
      handleFieldChange('responsibilities', val)
    },
    whatWeOffer,
    setWhatWeOffer: (val: string) => {
      setWhatWeOffer(val)
      handleFieldChange('whatWeOffer', val)
    },
    // Validation
    errors,
    touched,
    handleBlur,
    isSubmitting,
    // Telemetry & Sidebar
    candidateMatches: CANDIDATE_MATCHES,
    healthScore,
    // Modals & Feedback
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isPublishSuccessModalOpen,
    setIsPublishSuccessModalOpen,
    toastMessage,
    showToast,
    handleSaveDraft,
    handlePublishRequisition,
  }
}
