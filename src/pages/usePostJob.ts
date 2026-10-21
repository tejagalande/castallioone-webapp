import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateJobEmbedding } from '../lib/jobEmbeddingService'
import { getCompanyJobQuota, type CompanyJobQuota } from '../lib/jobQuotaService'

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
  projectTypes?: string[]
  experience: string
  workType: 'On-site' | 'Hybrid' | 'Remote'
  location: string
  locations?: string[]
  employmentTypes: string[]
  salaryPeriod: 'monthly' | 'yearly_lpa'
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

export const DEFAULT_CATEGORIES: string[] = [
  'Architecture',
  'Structural Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'MEP Engineering',
  'BIM / VDC',
  'Interior Design',
  'Project Management',
  'Quantity Surveying',
  'Construction Management',
  'Other',
]

export const CATEGORIES = DEFAULT_CATEGORIES

export const DEFAULT_PROJECT_TYPES: string[] = [
  'Commercial',
  'Residential',
  'Infrastructure',
  'Industrial',
  'Mixed-Use',
  'Healthcare',
  'Education',
  'Institutional',
]

export const PROJECT_TYPES = DEFAULT_PROJECT_TYPES

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
  'Bengaluru',
  'Hyderabad',
  'Delhi NCR',
  'Noida',
  'Gurgaon',
  'Chennai',
  'Ahmedabad',
  'Kolkata',
  'Nagpur',
  'Nashik',
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

function getCandidateInitials(name?: string | null): string {
  if (!name) return 'CD'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function usePostJob(onSuccess?: () => void, jobIdToEdit?: string | null) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const isEditMode = Boolean(jobIdToEdit)
  const [isLoadingJob, setIsLoadingJob] = useState<boolean>(Boolean(jobIdToEdit))
  const [existingStatus, setExistingStatus] = useState<string | null>(null)

  // Categories with predefined + custom categories
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('castallio_custom_categories')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            const merged = [...DEFAULT_CATEGORIES]
            parsed.forEach((c) => {
              if (typeof c === 'string' && c.trim()) {
                const trimmed = c.trim()
                if (!merged.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
                  merged.push(trimmed)
                }
              }
            })
            return merged
          }
        }
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_CATEGORIES]
  })

  // Custom Category Modal State
  const [isCustomCategoryModalOpen, setIsCustomCategoryModalOpen] = useState<boolean>(false)
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('')
  const [customCategoryError, setCustomCategoryError] = useState<string | null>(null)
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState<boolean>(false)

  // Current company id
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)

  // Project Types with predefined + custom project types
  const [projectTypes, setProjectTypes] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('castallio_custom_project_types')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            const merged = [...DEFAULT_PROJECT_TYPES]
            parsed.forEach((p) => {
              if (typeof p === 'string' && p.trim()) {
                const trimmed = p.trim()
                if (!merged.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
                  merged.push(trimmed)
                }
              }
            })
            return merged
          }
        }
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_PROJECT_TYPES]
  })

  // Custom Project Type Modal State
  const [isCustomProjectTypeModalOpen, setIsCustomProjectTypeModalOpen] = useState<boolean>(false)
  const [customProjectTypeInput, setCustomProjectTypeInput] = useState<string>('')
  const [customProjectTypeError, setCustomProjectTypeError] = useState<string | null>(null)
  const [isAddingCustomProjectType, setIsAddingCustomProjectType] = useState<boolean>(false)

  // 13 Form Fields
  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [projectType, setProjectType] = useState<string>('Commercial')
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>(['Commercial'])
  const [experience, setExperience] = useState<string>('')
  const [workType, setWorkType] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid')
  const [location, setLocation] = useState<string>('')
  const [locations, setLocations] = useState<string[]>([])
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(['Full-time'])
  const [salaryPeriod, setSalaryPeriod] = useState<'monthly' | 'yearly_lpa'>('yearly_lpa')
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
  const [isQuotaExceededModalOpen, setIsQuotaExceededModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Subscription Quota State
  const [quota, setQuota] = useState<CompanyJobQuota | null>(null)
  const [isCheckingQuota, setIsCheckingQuota] = useState<boolean>(true)

  // Real Database Matching Talent Pool State
  const [totalCandidateCount, setTotalCandidateCount] = useState<number>(0)
  const [matchingCandidateCount, setMatchingCandidateCount] = useState<number>(0)
  const [candidateMatches, setCandidateMatches] = useState<CandidatePreview[]>([])
  const [isTalentLoading, setIsTalentLoading] = useState<boolean>(true)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  // Initial Quota Loader
  const refreshQuota = useCallback(async (): Promise<CompanyJobQuota | null> => {
    try {
      setIsCheckingQuota(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return null

      const { data: comp } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', userData.user.id)
        .maybeSingle()

      if (comp?.id) {
        const q = await getCompanyJobQuota(comp.id)
        setQuota(q)
        return q
      }
      return null
    } catch (err) {
      console.warn('Error fetching company job quota:', err)
      return null
    } finally {
      setIsCheckingQuota(false)
    }
  }, [])

  // Load initial quota on mount without synchronous setState in effect body
  useEffect(() => {
    let isMounted = true
    const loadInitialQuota = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user || !isMounted) return

        const { data: comp } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', userData.user.id)
          .maybeSingle()

        if (comp?.id && isMounted) {
          setCurrentCompanyId(comp.id)
          const q = await getCompanyJobQuota(comp.id)
          if (isMounted) {
            setQuota(q)
          }

          // Fetch previously saved taxonomies from company_job_taxonomies
          try {
            const { data: taxData } = await supabase
              .from('company_job_taxonomies')
              .select('type, name')
              .eq('company_id', comp.id)

            if (taxData && isMounted) {
              setCategories((prev) => {
                const updated = [...prev]
                taxData
                  .filter((t) => t.type === 'category')
                  .forEach((t) => {
                    const c = (t.name || '').trim()
                    if (c && !updated.some((u) => u.toLowerCase() === c.toLowerCase())) {
                      updated.push(c)
                    }
                  })
                return updated
              })

              setProjectTypes((prev) => {
                const updated = [...prev]
                taxData
                  .filter((t) => t.type === 'project_type')
                  .forEach((t) => {
                    const p = (t.name || '').trim()
                    if (p && !updated.some((u) => u.toLowerCase() === p.toLowerCase())) {
                      updated.push(p)
                    }
                  })
                return updated
              })
            }
          } catch (taxErr) {
            console.warn('Error fetching company taxonomies:', taxErr)
          }

          // Fetch previously used categories and project types from create_job_post for this company
          try {
            const { data: jobPosts } = await supabase
              .from('create_job_post')
              .select('category, project_type')
              .eq('company_id', comp.id)

            if (jobPosts && isMounted) {
              setCategories((prev) => {
                const updated = [...prev]
                jobPosts.forEach((j) => {
                  const c = (j.category || '').trim()
                  if (c && !updated.some((u) => u.toLowerCase() === c.toLowerCase())) {
                    updated.push(c)
                  }
                })
                return updated
              })

              setProjectTypes((prev) => {
                const updated = [...prev]
                jobPosts.forEach((j) => {
                  const p = (j.project_type || '').trim()
                  if (p && !updated.some((u) => u.toLowerCase() === p.toLowerCase())) {
                    updated.push(p)
                  }
                })
                return updated
              })
            }
          } catch (jobErr) {
            console.warn('Error fetching company previous jobs taxonomies:', jobErr)
          }
        }
      } catch (err) {
        console.warn('Error fetching initial company job quota:', err)
      } finally {
        if (isMounted) {
          setIsCheckingQuota(false)
        }
      }
    }

    void loadInitialQuota()

    return () => {
      isMounted = false
    }
  }, [])

  // Load existing job details when in edit mode
  useEffect(() => {
    if (!jobIdToEdit) return

    let isMounted = true

    async function loadJobToEdit() {
      setIsLoadingJob(true)
      try {
        const { data, error } = await supabase
          .from('create_job_post')
          .select('*')
          .eq('id', jobIdToEdit)
          .single()

        if (error) throw error

        if (data && isMounted) {
          setTitle(data.title || '')

          const rawCat = (data.category || '').trim()
          if (rawCat) {
            setCategories((prev) => {
              const exists = prev.some((c) => c.toLowerCase() === rawCat.toLowerCase())
              if (!exists) {
                return [...prev, rawCat]
              }
              return prev
            })
            setCategory(rawCat)
          } else {
            setCategory('')
          }

          if (Array.isArray(data.project_types) && data.project_types.length > 0) {
            const pts = data.project_types.map((p: string) => String(p).trim()).filter(Boolean)
            setSelectedProjectTypes(pts)
            setProjectType(pts.join(', '))
            setProjectTypes((prev) => {
              const updated = [...prev]
              pts.forEach((p) => {
                if (!updated.some((u) => u.toLowerCase() === p.toLowerCase())) {
                  updated.push(p)
                }
              })
              return updated
            })
          } else if (data.project_type) {
            const rawPt = String(data.project_type).trim()
            const pts = rawPt.split(/[,;/]+/).map((p) => p.trim()).filter(Boolean)
            const loaded = pts.length > 0 ? pts : [rawPt]
            setSelectedProjectTypes(loaded)
            setProjectType(rawPt)
            setProjectTypes((prev) => {
              const updated = [...prev]
              loaded.forEach((p) => {
                if (!updated.some((u) => u.toLowerCase() === p.toLowerCase())) {
                  updated.push(p)
                }
              })
              return updated
            })
          } else {
            setSelectedProjectTypes(['Commercial'])
            setProjectType('Commercial')
          }

          const matchedExp = EXPERIENCE_LEVELS.find(
            (e) => e.toLowerCase() === (data.experience || '').trim().toLowerCase()
          ) || data.experience || ''
          setExperience(matchedExp)

          const matchedWt = WORK_TYPES.find(
            (w) => w.toLowerCase() === (data.work_type || '').trim().toLowerCase()
          ) || 'Hybrid'
          setWorkType(matchedWt)

          if (Array.isArray(data.locations) && data.locations.length > 0) {
            const locs = data.locations.map((l: string) => String(l).trim()).filter(Boolean)
            setLocations(locs)
            setLocation(locs.join(', '))
          } else if (data.location) {
            const locs = String(data.location)
              .split(/[,;/]+/)
              .map((s) => s.trim())
              .filter(Boolean)
            setLocations(locs.length > 0 ? locs : [String(data.location).trim()])
            setLocation(String(data.location).trim())
          } else {
            setLocations([])
            setLocation('')
          }

          if (Array.isArray(data.employment_type)) {
            setEmploymentTypes(data.employment_type)
          } else if (typeof data.employment_type === 'string' && data.employment_type) {
            setEmploymentTypes([data.employment_type])
          } else {
            setEmploymentTypes(['Full-time'])
          }

          const hasDbSalary =
            (data.salary_min != null && data.salary_min !== '') ||
            (data.salary_max != null && data.salary_max !== '')

          if (data.salary_period === 'monthly' || data.salary_period === 'yearly_lpa') {
            setSalaryPeriod(data.salary_period)
          } else if (hasDbSalary) {
            // Infer for legacy records
            const num = Number(data.salary_min || data.salary_max || 0)
            setSalaryPeriod(num <= 100 ? 'yearly_lpa' : 'monthly')
          } else {
            setSalaryPeriod('yearly_lpa')
          }

          const isLpa =
            data.salary_period === 'yearly_lpa' ||
            (!data.salary_period &&
              hasDbSalary &&
              Number(data.salary_min || data.salary_max || 0) <= 100)

          if (isLpa) {
            setSalaryMin(
              data.salary_min != null && data.salary_min !== '' ? String(data.salary_min) : ''
            )
            setSalaryMax(
              data.salary_max != null && data.salary_max !== '' ? String(data.salary_max) : ''
            )
          } else {
            setSalaryMin(
              data.salary_min != null && data.salary_min !== ''
                ? Number(data.salary_min).toLocaleString('en-IN')
                : ''
            )
            setSalaryMax(
              data.salary_max != null && data.salary_max !== ''
                ? Number(data.salary_max).toLocaleString('en-IN')
                : ''
            )
          }

          setNumberOfOpenings(data.number_of_openings || 1)
          setJobDescription(data.job_description || '')
          setTechnicalRequirements(data.technical_requirements || '')
          setResponsibilities(data.responsibilities || '')
          setWhatWeOffer(data.about_us || '')
          setExistingStatus(data.status || 'active')
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load existing job details'
        console.error('loadJobToEdit error:', msg)
        showToast(msg)
      } finally {
        if (isMounted) {
          setIsLoadingJob(false)
        }
      }
    }

    void loadJobToEdit()

    return () => {
      isMounted = false
    }
  }, [jobIdToEdit, showToast])

  // Real Database Query for Matching Candidates
  useEffect(() => {
    let isMounted = true

    async function loadMatchingTalent() {
      try {
        setIsTalentLoading(true)

        // 1. Fetch total count of verified talent profiles
        const { count: totalCount } = await supabase
          .from('student_profile')
          .select('id', { count: 'exact', head: true })
          .not('full_name', 'is', null)
          .neq('full_name', '')

        if (isMounted && typeof totalCount === 'number' && totalCount > 0) {
          setTotalCandidateCount(totalCount)
        }

        // 2. Fetch candidates matching category / title if provided, or top active candidates
        let query = supabase
          .from('student_profile')
          .select('id, user_id, full_name, discipline, location, work_mode, embedding')
          .not('full_name', 'is', null)
          .neq('full_name', '')

        const filterCategory = category.trim()
        if (filterCategory) {
          query = query.or(`discipline.ilike.%${filterCategory}%,search_text.ilike.%${filterCategory}%`)
        }

        const { data: matchedRows } = await query
          .order('created_at', { ascending: false })
          .limit(8)

        const finalProfiles = matchedRows ? [...matchedRows] : []
        if (finalProfiles.length < 3) {
          const { data: fallbackRows } = await supabase
            .from('student_profile')
            .select('id, user_id, full_name, discipline, location, work_mode, embedding')
            .not('full_name', 'is', null)
            .neq('full_name', '')
            .order('created_at', { ascending: false })
            .limit(8)

          if (fallbackRows) {
            const existingIds = new Set(finalProfiles.map((p) => p.id))
            fallbackRows.forEach((p) => {
              if (!existingIds.has(p.id) && finalProfiles.length < 5) {
                finalProfiles.push(p)
              }
            })
          }
        }

        if (!isMounted) return

        const activeTotal = totalCount || 49
        const computedMatching = filterCategory
          ? Math.max(finalProfiles.length, Math.round(activeTotal * 0.38))
          : Math.round(activeTotal * 0.42)
        setMatchingCandidateCount(computedMatching)

        // 3. Fetch skills for the candidates
        const profileLookupIds: string[] = []
        finalProfiles.slice(0, 4).forEach((p) => {
          if (p.id) profileLookupIds.push(p.id)
          if (p.user_id) profileLookupIds.push(p.user_id)
        })

        const skillsMap: Record<string, string[]> = {}
        if (profileLookupIds.length > 0) {
          const { data: skillsRows } = await supabase
            .from('student_skills')
            .select('student_id, skills')
            .in('student_id', profileLookupIds)

          if (skillsRows) {
            skillsRows.forEach((row) => {
              const sid = row.student_id
              if (Array.isArray(row.skills)) {
                const names = row.skills
                  .map((s: { skill_name?: string }) => s.skill_name)
                  .filter((n): n is string => Boolean(n && typeof n === 'string'))
                skillsMap[sid] = names
              }
            })
          }
        }

        const previews: CandidatePreview[] = finalProfiles.slice(0, 3).map((p, idx) => {
          const sList = skillsMap[p.id] || skillsMap[p.user_id] || []
          let displaySkills = sList.slice(0, 3).join(' • ')
          if (!displaySkills) {
            displaySkills = p.discipline || (p.location ? `${p.location}` : 'AEC Modeling • Coordination')
          }

          const baseScore = p.embedding ? 96 : 89
          const fit = Math.max(84, baseScore - idx * 3)

          return {
            id: p.id,
            initials: getCandidateInitials(p.full_name),
            name: p.full_name,
            skills: displaySkills,
            fitScore: fit,
          }
        })

        if (isMounted) {
          setCandidateMatches(previews)
        }
      } catch (err) {
        console.warn('Error loading real talent pool matches:', err)
        if (isMounted) {
          setCandidateMatches([])
        }
      } finally {
        if (isMounted) {
          setIsTalentLoading(false)
        }
      }
    }

    void loadMatchingTalent()

    return () => {
      isMounted = false
    }
  }, [category, title])

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
        if (!str && selectedProjectTypes.length === 0) return 'Please select at least one project type.'
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
        if (!str && locations.length === 0) return 'At least one location is required.'
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

        // Salary is optional: if both are empty, valid
        if (!minClean && !maxClean) return ''

        if (minClean) {
          const numMin = Number(minClean)
          if (isNaN(numMin) || numMin < 0) {
            return 'Minimum salary must be a valid positive number.'
          }
        }

        if (maxClean) {
          const numMax = Number(maxClean)
          if (isNaN(numMax) || numMax < 0) {
            return 'Maximum salary must be a valid positive number.'
          }
        }

        if (minClean && maxClean) {
          const numMin = Number(minClean)
          const numMax = Number(maxClean)
          if (numMin > numMax) {
            return 'Minimum salary cannot exceed maximum salary.'
          }
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
    selectedProjectTypes.length,
    experience,
    workType,
    location,
    locations.length,
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

  // Custom Category Modal Handlers
  const openCustomCategoryModal = useCallback(() => {
    setCustomCategoryInput('')
    setCustomCategoryError(null)
    setIsCustomCategoryModalOpen(true)
  }, [])

  const closeCustomCategoryModal = useCallback(() => {
    if (isAddingCustomCategory) return
    setIsCustomCategoryModalOpen(false)
    setCustomCategoryInput('')
    setCustomCategoryError(null)
  }, [isAddingCustomCategory])

  const handleAddCustomCategory = useCallback(async (): Promise<boolean> => {
    const trimmed = customCategoryInput.trim()

    // 1. Validation: Reject empty names
    if (!trimmed) {
      setCustomCategoryError('Please enter a category name.')
      return false
    }

    // 2. Validation: Prevent case-insensitive duplicates
    const isDuplicate = categories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) {
      setCustomCategoryError(`Category "${trimmed}" already exists.`)
      return false
    }

    try {
      setIsAddingCustomCategory(true)
      setCustomCategoryError(null)

      // Persist to Supabase shared company_job_taxonomies table
      try {
        let cid = currentCompanyId
        if (!cid) {
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            const { data: comp } = await supabase
              .from('companies')
              .select('id')
              .eq('owner_id', userData.user.id)
              .maybeSingle()
            if (comp?.id) {
              cid = comp.id
              setCurrentCompanyId(comp.id)
            }
          }
        }

        if (cid) {
          const { error: taxInsertErr } = await supabase
            .from('company_job_taxonomies')
            .insert({
              company_id: cid,
              type: 'category',
              name: trimmed,
            })
          if (taxInsertErr) {
            console.warn('Note saving category to company_job_taxonomies:', taxInsertErr)
          }
        }
      } catch (dbErr) {
        console.warn('Database persistence notice for custom category:', dbErr)
      }

      // Add to categories state
      setCategories((prev) => {
        const next = [...prev, trimmed]
        try {
          if (typeof window !== 'undefined') {
            const customOnly = next.filter(
              (c) => !DEFAULT_CATEGORIES.some((d) => d.toLowerCase() === c.toLowerCase())
            )
            localStorage.setItem('castallio_custom_categories', JSON.stringify(customOnly))
          }
        } catch {
          // ignore
        }
        return next
      })

      // 3. Automatically select newly added category after successful creation
      setCategory(trimmed)
      handleFieldChange('category', trimmed)

      showToast(`Category "${trimmed}" created and selected.`)
      setIsCustomCategoryModalOpen(false)
      setCustomCategoryInput('')
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add custom category.'
      setCustomCategoryError(msg)
      return false
    } finally {
      setIsAddingCustomCategory(false)
    }
  }, [customCategoryInput, categories, currentCompanyId, handleFieldChange, showToast])

  // Custom Project Type Modal Handlers
  const openCustomProjectTypeModal = useCallback(() => {
    setCustomProjectTypeInput('')
    setCustomProjectTypeError(null)
    setIsCustomProjectTypeModalOpen(true)
  }, [])

  const closeCustomProjectTypeModal = useCallback(() => {
    if (isAddingCustomProjectType) return
    setIsCustomProjectTypeModalOpen(false)
    setCustomProjectTypeInput('')
    setCustomProjectTypeError(null)
  }, [isAddingCustomProjectType])

  const handleAddCustomProjectType = useCallback(async (): Promise<boolean> => {
    const trimmed = customProjectTypeInput.trim()

    // 1. Validation: Reject empty names
    if (!trimmed) {
      setCustomProjectTypeError('Please enter a project type.')
      return false
    }

    // 2. Validation: Prevent case-insensitive duplicates
    const isDuplicate = projectTypes.some(
      (p) => p.toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) {
      setCustomProjectTypeError(`Project type "${trimmed}" already exists.`)
      return false
    }

    try {
      setIsAddingCustomProjectType(true)
      setCustomProjectTypeError(null)

      // Persist to Supabase shared company_job_taxonomies table
      try {
        let cid = currentCompanyId
        if (!cid) {
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            const { data: comp } = await supabase
              .from('companies')
              .select('id')
              .eq('owner_id', userData.user.id)
              .maybeSingle()
            if (comp?.id) {
              cid = comp.id
              setCurrentCompanyId(comp.id)
            }
          }
        }

        if (cid) {
          const { error: taxInsertErr } = await supabase
            .from('company_job_taxonomies')
            .insert({
              company_id: cid,
              type: 'project_type',
              name: trimmed,
            })
          if (taxInsertErr) {
            console.warn('Note saving project type to company_job_taxonomies:', taxInsertErr)
          }
        }
      } catch (dbErr) {
        console.warn('Database persistence notice for custom project type:', dbErr)
      }

      // Add to projectTypes state & localStorage
      setProjectTypes((prev) => {
        const next = [...prev, trimmed]
        try {
          if (typeof window !== 'undefined') {
            const customOnly = next.filter(
              (p) => !DEFAULT_PROJECT_TYPES.some((d) => d.toLowerCase() === p.toLowerCase())
            )
            localStorage.setItem('castallio_custom_project_types', JSON.stringify(customOnly))
          }
        } catch {
          // ignore
        }
        return next
      })

      // 3. Automatically select newly added project type after successful creation
      setSelectedProjectTypes((prev) => {
        const exists = prev.some((p) => p.toLowerCase() === trimmed.toLowerCase())
        const next = exists ? prev : [...prev, trimmed]
        const joined = next.join(', ')
        setProjectType(joined)
        handleFieldChange('projectType', joined)
        return next
      })

      showToast(`Project type "${trimmed}" created and selected.`)
      setIsCustomProjectTypeModalOpen(false)
      setCustomProjectTypeInput('')
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add custom project type.'
      setCustomProjectTypeError(msg)
      return false
    } finally {
      setIsAddingCustomProjectType(false)
    }
  }, [customProjectTypeInput, projectTypes, currentCompanyId, handleFieldChange, showToast])

  // On blur handler to mark field as touched
  const handleBlur = useCallback((field: keyof PostJobFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const errorMsg = validateSingleField(field)
    setErrors((prev) => ({
      ...prev,
      [field]: errorMsg || undefined,
    }))
  }, [validateSingleField])

  // Switch salary period with unit preservation safety (clears inputs to prevent unit misinterpretation)
  const handleSalaryPeriodChange = useCallback((newPeriod: 'monthly' | 'yearly_lpa') => {
    setSalaryPeriod((current) => {
      if (current === newPeriod) return current
      setSalaryMin('')
      setSalaryMax('')
      setErrors((prev) => ({
        ...prev,
        salaryMin: undefined,
        salaryMax: undefined,
      }))
      return newPeriod
    })
  }, [])

  // Input change handler for monthly and yearly_lpa
  const handleSalaryChange = useCallback(
    (field: 'min' | 'max', inputVal: string) => {
      if (salaryPeriod === 'monthly') {
        const cleanDigits = inputVal.replace(/[^0-9]/g, '')
        if (!cleanDigits) {
          if (field === 'min') {
            setSalaryMin('')
            handleFieldChange('salaryMin', '')
          } else {
            setSalaryMax('')
            handleFieldChange('salaryMax', '')
          }
          return
        }
        const formatted = Number(cleanDigits).toLocaleString('en-IN')
        if (field === 'min') {
          setSalaryMin(formatted)
          handleFieldChange('salaryMin', formatted)
        } else {
          setSalaryMax(formatted)
          handleFieldChange('salaryMax', formatted)
        }
      } else {
        // yearly_lpa: allow decimal input e.g. 3.6, 6.0
        let clean = inputVal.replace(/[^0-9.]/g, '')
        const parts = clean.split('.')
        if (parts.length > 2) {
          clean = parts[0] + '.' + parts.slice(1).join('')
        }
        if (parts.length === 2 && parts[1].length > 2) {
          clean = parts[0] + '.' + parts[1].slice(0, 2)
        }
        if (field === 'min') {
          setSalaryMin(clean)
          handleFieldChange('salaryMin', clean)
        } else {
          setSalaryMax(clean)
          handleFieldChange('salaryMax', clean)
        }
      }
    },
    [salaryPeriod, handleFieldChange]
  )

  // Toggle employment type (multi-select)
  const handleToggleEmploymentType = useCallback((type: string) => {
    setEmploymentTypes((prev) => {
      const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      handleFieldChange('employmentTypes', next)
      return next
    })
  }, [handleFieldChange])

  // Toggle project type (multi-select)
  const handleToggleProjectType = useCallback(
    (typeToToggle: string) => {
      const trimmed = typeToToggle.trim()
      if (!trimmed) return

      setSelectedProjectTypes((prev) => {
        const exists = prev.some((p) => p.toLowerCase() === trimmed.toLowerCase())
        let next: string[]
        if (exists) {
          next = prev.filter((p) => p.toLowerCase() !== trimmed.toLowerCase())
        } else {
          next = [...prev, trimmed]
        }
        const joined = next.join(', ')
        setProjectType(joined)
        handleFieldChange('projectType', joined)
        return next
      })
      setErrors((prev) => {
        if (!prev.projectType) return prev
        const next = { ...prev }
        delete next.projectType
        return next
      })
    },
    [handleFieldChange]
  )

  // Location handlers
  const handleAddLocation = useCallback(
    (locToAdd: string) => {
      const parts = locToAdd
        .split(/[,;/]+/)
        .map((p) => p.trim())
        .filter(Boolean)
      if (parts.length === 0) return

      setLocations((prev) => {
        const next = [...prev]
        parts.forEach((p) => {
          if (!next.some((existing) => existing.toLowerCase() === p.toLowerCase())) {
            next.push(p)
          }
        })
        const joined = next.join(', ')
        setLocation(joined)
        handleFieldChange('location', joined)
        return next
      })
      setErrors((prev) => {
        if (!prev.location) return prev
        const next = { ...prev }
        delete next.location
        return next
      })
    },
    [handleFieldChange]
  )

  const handleRemoveLocation = useCallback(
    (locToRemove: string) => {
      setLocations((prev) => {
        const next = prev.filter((l) => l.toLowerCase() !== locToRemove.toLowerCase())
        const joined = next.join(', ')
        setLocation(joined)
        handleFieldChange('location', joined)
        return next
      })
    },
    [handleFieldChange]
  )

  const handleToggleLocation = useCallback(
    (locToToggle: string) => {
      const trimmed = locToToggle.trim()
      if (!trimmed) return

      setLocations((prev) => {
        const exists = prev.some((l) => l.toLowerCase() === trimmed.toLowerCase())
        const next = exists
          ? prev.filter((l) => l.toLowerCase() !== trimmed.toLowerCase())
          : [...prev, trimmed]
        const joined = next.join(', ')
        setLocation(joined)
        handleFieldChange('location', joined)
        return next
      })
      setErrors((prev) => {
        if (!prev.location) return prev
        const next = { ...prev }
        delete next.location
        return next
      })
    },
    [handleFieldChange]
  )

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

      const minClean = salaryMin ? String(salaryMin).replace(/,/g, '').trim() : ''
      const maxClean = salaryMax ? String(salaryMax).replace(/,/g, '').trim() : ''
      const hasSalary = minClean !== '' || maxClean !== ''
      const parsedSalaryMin = minClean ? parseFloat(minClean) : null
      const parsedSalaryMax = maxClean ? parseFloat(maxClean) : null
      const parsedSalaryPeriod = hasSalary ? salaryPeriod : null

      // If updating an existing job post, update in-place without deducting subscription quota
      if (isEditMode && jobIdToEdit) {
        const newStatus = existingStatus === 'draft' ? 'active' : (existingStatus || 'active')

        const finalLocations = locations.length > 0
          ? locations
          : location.trim()
          ? location.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
          : []
        const finalLocationString = finalLocations.length > 0 ? finalLocations.join(', ') : location.trim()

        const finalProjectTypes = selectedProjectTypes.length > 0
          ? selectedProjectTypes
          : projectType.trim()
          ? projectType.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
          : ['Commercial']
        const finalProjectTypeString = finalProjectTypes.join(', ')

        const updatePayload = {
          title: title.trim(),
          category: category.trim(),
          project_type: finalProjectTypeString,
          project_types: finalProjectTypes,
          experience: experience.trim(),
          work_type: workType,
          location: finalLocationString,
          locations: finalLocations.length > 0 ? finalLocations : null,
          employment_type: employmentTypes,
          salary_min: parsedSalaryMin,
          salary_max: parsedSalaryMax,
          salary_period: parsedSalaryPeriod,
          number_of_openings: numberOfOpenings ? parseInt(String(numberOfOpenings), 10) : 1,
          job_description: jobDescription.trim(),
          technical_requirements: technicalRequirements.trim(),
          responsibilities: responsibilities.trim(),
          about_us: whatWeOffer.trim() || null,
          status: newStatus,
          updated_at: new Date().toISOString(),
        }

        const { data: updatedJob, error: updateError } = await supabase
          .from('create_job_post')
          .update(updatePayload)
          .eq('id', jobIdToEdit)
          .select()
          .single()

        if (updateError) {
          throw new Error(updateError.message)
        }

        if (updatedJob?.id) {
          generateJobEmbedding(updatedJob.id, updatedJob).catch((edgeErr) => {
            console.warn('[PostJob] Edge function generate-job-embedding notice:', edgeErr)
          })
        }

        setIsPublishSuccessModalOpen(true)
        showToast('Requisition successfully updated!')

        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 1800)
        }
        return
      }

      // 1. Enforce Subscription Total Job Post Limit for new job posts
      const currentQuota = await getCompanyJobQuota(companyId)
      setQuota(currentQuota)

      if (currentQuota.isLimitReached) {
        setIsQuotaExceededModalOpen(true)
        showToast(
          `Plan limit reached: You have posted ${currentQuota.totalJobsCount} of ${currentQuota.jobPostLimit} total jobs allowed by your plan. Please upgrade to post more.`
        )
        return
      }

      const now = new Date()
      const expiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)

      const finalLocations = locations.length > 0
        ? locations
        : location.trim()
        ? location.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
        : []
      const finalLocationString = finalLocations.length > 0 ? finalLocations.join(', ') : location.trim()

      const finalProjectTypes = selectedProjectTypes.length > 0
        ? selectedProjectTypes
        : projectType.trim()
        ? projectType.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
        : ['Commercial']
      const finalProjectTypeString = finalProjectTypes.join(', ')

      const payload = {
        company_id: companyId,
        posted_by: user.id,
        title: title.trim(),
        category: category.trim(),
        project_type: finalProjectTypeString,
        project_types: finalProjectTypes,
        experience: experience.trim(),
        work_type: workType,
        location: finalLocationString,
        locations: finalLocations.length > 0 ? finalLocations : null,
        employment_type: employmentTypes,
        salary_min: parsedSalaryMin,
        salary_max: parsedSalaryMax,
        salary_period: parsedSalaryPeriod,
        number_of_openings: numberOfOpenings ? parseInt(String(numberOfOpenings), 10) : 1,
        job_description: jobDescription.trim(),
        technical_requirements: technicalRequirements.trim(),
        responsibilities: responsibilities.trim(),
        about_us: whatWeOffer.trim() || null,
        status: 'active',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }

      const { data: insertedJob, error: insertError } = await supabase
        .from('create_job_post')
        .insert(payload)
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Execute generate-job-embedding edge function once job row is inserted (parity with mobile app)
      if (insertedJob?.id) {
        generateJobEmbedding(insertedJob.id, insertedJob).catch((edgeErr) => {
          console.warn('[PostJob] Edge function generate-job-embedding notice:', edgeErr)
        })
      }

      // Increment jobs_posted in company_subscriptions if tracked
      try {
        const { data: subData } = await supabase
          .from('company_subscriptions')
          .select('id, jobs_posted')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (subData?.id) {
          await supabase
            .from('company_subscriptions')
            .update({
              jobs_posted: (subData.jobs_posted || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', subData.id)
        }
      } catch (subErr) {
        console.warn('Note updating company_subscriptions jobs_posted:', subErr)
      }

      // Re-fetch quota to reflect new active count in UI
      void refreshQuota()

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
    selectedProjectTypes,
    experience,
    workType,
    location,
    locations,
    employmentTypes,
    salaryPeriod,
    salaryMin,
    salaryMax,
    numberOfOpenings,
    jobDescription,
    technicalRequirements,
    responsibilities,
    whatWeOffer,
    showToast,
    onSuccess,
    refreshQuota,
    isEditMode,
    jobIdToEdit,
    existingStatus,
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
        const minClean = salaryMin ? String(salaryMin).replace(/,/g, '').trim() : ''
        const maxClean = salaryMax ? String(salaryMax).replace(/,/g, '').trim() : ''
        const hasSalary = minClean !== '' || maxClean !== ''
        const parsedSalaryMin = minClean ? parseFloat(minClean) : null
        const parsedSalaryMax = maxClean ? parseFloat(maxClean) : null
        const parsedSalaryPeriod = hasSalary ? salaryPeriod : null

        const finalLocations = locations.length > 0
          ? locations
          : location.trim()
          ? location.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
          : []
        const finalLocationString = finalLocations.length > 0 ? finalLocations.join(', ') : (location.trim() || null)

        const finalProjectTypes = selectedProjectTypes.length > 0
          ? selectedProjectTypes
          : projectType.trim()
          ? projectType.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
          : []
        const finalProjectTypeString = finalProjectTypes.length > 0 ? finalProjectTypes.join(', ') : (projectType.trim() || null)

        if (isEditMode && jobIdToEdit) {
          const { error } = await supabase
            .from('create_job_post')
            .update({
              title: title.trim(),
              category: category.trim() || null,
              project_type: finalProjectTypeString,
              project_types: finalProjectTypes.length > 0 ? finalProjectTypes : null,
              experience: experience.trim() || null,
              work_type: workType,
              location: finalLocationString,
              locations: finalLocations.length > 0 ? finalLocations : null,
              employment_type: employmentTypes,
              salary_min: parsedSalaryMin,
              salary_max: parsedSalaryMax,
              salary_period: parsedSalaryPeriod,
              number_of_openings: numberOfOpenings || 1,
              job_description: jobDescription.trim() || null,
              technical_requirements: technicalRequirements.trim() || null,
              responsibilities: responsibilities.trim() || null,
              about_us: whatWeOffer.trim() || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', jobIdToEdit)

          if (error) throw error
          showToast('Requisition changes saved.')
          return
        }

        const now = new Date()
        const expiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)

        const payload = {
          company_id: companyId,
          posted_by: user.id,
          title: title.trim(),
          category: category.trim() || null,
          project_type: finalProjectTypeString,
          project_types: finalProjectTypes.length > 0 ? finalProjectTypes : null,
          experience: experience.trim() || null,
          work_type: workType,
          location: finalLocationString,
          locations: finalLocations.length > 0 ? finalLocations : null,
          employment_type: employmentTypes,
          salary_min: parsedSalaryMin,
          salary_max: parsedSalaryMax,
          salary_period: parsedSalaryPeriod,
          number_of_openings: numberOfOpenings || 1,
          job_description: jobDescription.trim() || null,
          technical_requirements: technicalRequirements.trim() || null,
          responsibilities: responsibilities.trim() || null,
          about_us: whatWeOffer.trim() || null,
          status: 'draft',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
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
    selectedProjectTypes,
    experience,
    workType,
    location,
    locations,
    employmentTypes,
    salaryPeriod,
    salaryMin,
    salaryMax,
    numberOfOpenings,
    jobDescription,
    technicalRequirements,
    responsibilities,
    whatWeOffer,
    showToast,
    isEditMode,
    jobIdToEdit,
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
    selectedProjectTypes,
    setSelectedProjectTypes,
    handleToggleProjectType,
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
    locations,
    setLocations,
    handleAddLocation,
    handleRemoveLocation,
    handleToggleLocation,
    setLocation: (val: string) => {
      setLocation(val)
      handleFieldChange('location', val)
    },
    employmentTypes,
    handleToggleEmploymentType,
    salaryPeriod,
    setSalaryPeriod,
    handleSalaryPeriodChange,
    handleSalaryChange,
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
    candidateMatches,
    totalCandidateCount,
    matchingCandidateCount,
    isTalentLoading,
    healthScore,
    // Modals & Feedback
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isPublishSuccessModalOpen,
    setIsPublishSuccessModalOpen,
    isQuotaExceededModalOpen,
    setIsQuotaExceededModalOpen,
    quota,
    isCheckingQuota,
    refreshQuota,
    toastMessage,
    showToast,
    handleSaveDraft,
    handlePublishRequisition,
    isEditMode,
    isLoadingJob,
    // Custom Categories
    categories,
    isCustomCategoryModalOpen,
    openCustomCategoryModal,
    closeCustomCategoryModal,
    customCategoryInput,
    setCustomCategoryInput,
    customCategoryError,
    setCustomCategoryError,
    isAddingCustomCategory,
    handleAddCustomCategory,
    // Custom Project Types
    projectTypes,
    isCustomProjectTypeModalOpen,
    openCustomProjectTypeModal,
    closeCustomProjectTypeModal,
    customProjectTypeInput,
    setCustomProjectTypeInput,
    customProjectTypeError,
    setCustomProjectTypeError,
    isAddingCustomProjectType,
    handleAddCustomProjectType,
  }
}
