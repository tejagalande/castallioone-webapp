import { useState, useCallback, useMemo } from 'react'
import { saveTalentProfile } from '../lib/talentService'

export interface ExperienceItem {
  id: string
  role: string
  organisation: string
  startDate: string
  endDate: string
  currentlyWorking: boolean
  contribution: string
}

export interface CertificateItem {
  id: string
  title: string
  organisation: string
  issueDate: string
  file: File | null
  fileName: string
  fileSize: string
  fileUrl?: string
}

export interface TalentProfileData {
  // Step 1: Profile & Preferences
  profileImage: File | null
  profileImagePreview: string
  fullName: string
  bio: string
  email: string
  contactNumber: string
  city: string
  instituteName: string
  discipline: string
  graduationYear: string
  workMode: string // 'Remote' | 'Hybrid' | 'On-site' | 'Flexible'
  preferredLocations: string[]
  willingToRelocate: 'yes' | 'no' | 'open' | ''
  availability: string
  employmentType: string
  noticePeriod: string
  expectedCtc: string
  resumeFile: File | null
  resumeFileName: string
  resumeFileSize: string
  portfolioLink: string
  linkedinLink: string

  // Step 2: Technical Skills & Experience
  specificSkill: string
  coreSoftware: string[]
  technicalSkills: string[]
  softSkills: string[]
  isFresher: boolean
  experiences: ExperienceItem[]
  hasNoCertificate: boolean
  certificates: CertificateItem[]
}

export interface CompletenessItem {
  id: string
  label: string
  weight: number
  isDone: boolean
  category: 'identity' | 'academic' | 'preferences' | 'docs' | 'skills'
}

export interface CompletenessBreakdown {
  score: number
  tier: 'Draft' | 'Building' | 'Strong' | 'All-Star'
  tierColor: string
  items: CompletenessItem[]
  missingLabels: string[]
}

export interface UseTalentProfileSetupProps {
  userId?: string
  userEmail?: string
  userName?: string
  onSuccess: () => void
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void
}

// Predefined option libraries
export const PREDEFINED_CORE_SOFTWARE = [
  'Autodesk Revit',
  'Navisworks Manage',
  'AutoCAD',
  'Rhino 3D',
  'Grasshopper',
  'ArchiCAD',
  'Dynamo Studio',
  'Tekla Structures',
  'Solibri Model Checker',
  'Civil 3D',
  'SketchUp',
  'Blender',
  '3ds Max',
  'ETABS',
  'STAAD.Pro',
  'Bluebeam Revu',
  'Synchro 4D',
]

export const PREDEFINED_TECH_SKILLS = [
  'LOD 300/400 Modeling',
  'Clash Detection & Matrix',
  '4D/5D BIM Simulation',
  'Scan-to-BIM (Point Cloud)',
  'Parametric Architecture',
  'Python & pyRevit Scripting',
  'IFC & openBIM Schemas',
  'ISO 19650 BEP Authoring',
  'Quantity Takeoff & BOQ',
  'Curtain Wall Façade Detailing',
  'Structural Steel Detailing',
  'MEP Coordination',
  'Generative Design',
  'COBie Data Auditing',
]

export const PREDEFINED_SOFT_SKILLS = [
  'Design Collaboration',
  'Cross-Functional Leadership',
  'Problem Solving',
  'Client Presentations',
  'Agile / Scrum Delivery',
  'Critical Thinking',
  'Time Management',
  'Conflict Resolution',
  'BEP Documentation',
  'Attention to Detail',
]

export const DISCIPLINES = [
  'Architecture',
  'BIM & Computational Design',
  'Civil Engineering',
  'Structural Engineering',
  'MEP Engineering',
  'Construction Management',
  'Interior Architecture',
  'Urban Planning & Infrastructure',
  'Landscape Architecture',
  'Other AEC Specialization',
]

export const WORK_MODES = ['Flexible', 'Hybrid', 'Remote', 'On-site']

export const AVAILABILITY_OPTIONS = [
  'Immediate',
  'Within 15 Days',
  '1 Month',
  '2 Months',
  '3 Months',
]

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Contract',
  'Hybrid / Project-based',
  'Part-time',
  'Internship',
]

export const NOTICE_PERIODS = [
  'Immediate / Serving Notice',
  '15 Days',
  '30 Days',
  '60 Days',
  '90 Days',
]

export const POPULAR_LOCATIONS = [
  'Mumbai',
  'Bengaluru',
  'Delhi NCR',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'London, UK',
  'Dubai, UAE',
  'Singapore',
  'Remote (Worldwide)',
]

/**
 * Formats a raw number string into Indian numbering format (e.g. 1200000 -> 12,00,000).
 */
export function formatIndianNumber(value: string | number): string {
  const clean = value.toString().replace(/\D/g, '')
  if (!clean) return ''
  if (clean.length <= 3) return clean
  const lastThree = clean.slice(-3)
  const remaining = clean.slice(0, -3)
  const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `${formattedRemaining},${lastThree}`
}

/**
 * Converts Indian currency numbers into human-readable text (e.g. 12,00,000 -> ₹12 Lakhs / yr).
 */
export function getIndianCurrencyWords(numStr: string): string {
  const digits = numStr.replace(/\D/g, '')
  if (!digits) return ''
  const val = parseInt(digits, 10)
  if (isNaN(val) || val === 0) return ''
  if (val >= 10000000) {
    const cr = (val / 10000000).toFixed(2).replace(/\.00$/, '')
    return `₹${cr} Crore / yr`
  }
  if (val >= 100000) {
    const lk = (val / 100000).toFixed(2).replace(/\.00$/, '')
    return `₹${lk} Lakhs / yr`
  }
  if (val >= 1000) {
    const th = (val / 1000).toFixed(1).replace(/\.0$/, '')
    return `₹${th} Thousand / yr`
  }
  return `₹${val} / yr`
}

/**
 * Validates a single field in real-time on keystroke or blur.
 * Returns an error string if invalid, or empty string if valid.
 */
export const validateSingleTalentField = (
  field: keyof TalentProfileData,
  value: unknown,
  allData: TalentProfileData
): string => {
  const strVal = typeof value === 'string' ? value.trim() : ''

  switch (field) {
    case 'fullName':
      if (!strVal) return 'Full name is required.'
      if (strVal.length < 2) return 'Full name must be at least 2 characters.'
      if (!/^[a-zA-Z\s.'-]+$/.test(strVal)) return 'Please enter a valid name (letters and spaces).'
      return ''

    case 'email':
      if (!strVal) return 'Official email address is required.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
        return 'Please enter a valid email address (e.g. name@domain.com).'
      }
      return ''

    case 'contactNumber': {
      if (!strVal) return 'Contact phone number is required.'
      const trimmed = strVal.trim()

      // Disallow letters or unexpected symbols
      if (/[^\d\s\-()+]/.test(trimmed)) {
        return 'Phone number can only contain digits, spaces, and + - ( )'
      }

      // Check international format starting with +
      if (trimmed.startsWith('+')) {
        const digitsOnly = trimmed.replace(/\D/g, '')
        if (trimmed.startsWith('+91')) {
          const nationalDigits = trimmed.replace(/^\+91[\s-]*/, '').replace(/\D/g, '')
          if (nationalDigits.length !== 10) {
            return 'Indian mobile numbers must have exactly 10 digits after +91.'
          }
          if (!/^[6-9]/.test(nationalDigits)) {
            return 'Indian mobile number should start with 6, 7, 8, or 9.'
          }
          return ''
        }
        if (digitsOnly.length < 8 || digitsOnly.length > 15) {
          return 'International phone numbers must have between 8 and 15 digits.'
        }
        return ''
      }

      // Pure digits (without +)
      const digitsOnly = trimmed.replace(/\D/g, '')

      // 12 digits starting with 91 (e.g. 919876543210)
      if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        const nationalPart = digitsOnly.slice(2)
        if (!/^[6-9]/.test(nationalPart)) {
          return 'Indian mobile number should start with 6, 7, 8, or 9.'
        }
        return ''
      }

      // 11 digits starting with 0 (e.g. 09876543210)
      if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
        const nationalPart = digitsOnly.slice(1)
        if (!/^[6-9]/.test(nationalPart)) {
          return 'Indian mobile number should start with 6, 7, 8, or 9.'
        }
        return ''
      }

      // Domestic mobile numbers without prefix: must be exactly 10 digits
      if (digitsOnly.length < 10) {
        return 'Contact number must be a 10-digit mobile number (or include country code e.g. +91).'
      }
      if (digitsOnly.length > 10) {
        return 'Contact number cannot exceed 10 digits without an international country code (e.g. +91).'
      }
      if (!/^[6-9]/.test(digitsOnly)) {
        return 'Mobile number should start with 6, 7, 8, or 9 (or include international code e.g. +1).'
      }

      return ''
    }

    case 'city':
      if (!strVal) return 'Current city of residence is required.'
      if (strVal.length < 2) return 'Please enter a valid city name.'
      return ''

    case 'instituteName':
      if (!strVal) return 'Institute or university name is required.'
      if (strVal.length < 2) return 'Please enter at least 2 characters.'
      return ''

    case 'discipline':
      if (!strVal) return 'Please select your AEC discipline.'
      return ''

    case 'graduationYear': {
      if (!strVal) return 'Graduation year is required.'
      const yr = parseInt(strVal, 10)
      if (isNaN(yr) || yr < 1960 || yr > 2035) {
        return 'Please enter a valid year between 1960 and 2035.'
      }
      return ''
    }

    case 'workMode':
      if (!strVal) return 'Please select your preferred work mode.'
      return ''

    case 'preferredLocations':
      if (!allData.preferredLocations || allData.preferredLocations.length === 0) {
        return 'Please select or add at least one preferred job location.'
      }
      return ''

    case 'expectedCtc': {
      if (!strVal) return 'Expected annual CTC is required.'
      const rawDigits = strVal.replace(/\D/g, '')
      if (!rawDigits || rawDigits.length < 4) {
        return 'Please enter a valid annual CTC in Indian number format (e.g. 12,00,000).'
      }
      return ''
    }

    case 'portfolioLink':
      if (strVal) {
        if (!/^(https?:\/\/|[a-zA-Z0-9-]+\.)/i.test(strVal)) {
          return 'Enter a valid URL (e.g. https://behance.net/username or myportfolio.com).'
        }
      }
      return ''

    case 'linkedinLink':
      if (strVal) {
        if (!/linkedin\.com/i.test(strVal)) {
          return 'Enter a valid LinkedIn URL (e.g. linkedin.com/in/username).'
        }
      }
      return ''

    case 'specificSkill':
      if (!strVal) return 'Primary specific specialization skill is required.'
      if (strVal.length < 2) return 'Please enter at least 2 characters.'
      return ''

    case 'coreSoftware':
      if (!allData.coreSoftware || allData.coreSoftware.length === 0) {
        return 'Please select or add at least one core software tool.'
      }
      return ''

    case 'technicalSkills':
      if (!allData.technicalSkills || allData.technicalSkills.length === 0) {
        return 'Please select or add at least one technical capability.'
      }
      return ''

    case 'softSkills':
      if (!allData.softSkills || allData.softSkills.length === 0) {
        return 'Please select or add at least one soft skill.'
      }
      return ''

    default:
      return ''
  }
}

const createEmptyExperience = (): ExperienceItem => ({
  id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  role: '',
  organisation: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  contribution: '',
})

const createEmptyCertificate = (): CertificateItem => ({
  id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  title: '',
  organisation: '',
  issueDate: '',
  file: null,
  fileName: '',
  fileSize: '',
})

export function useTalentProfileSetup({
  userId,
  userEmail,
  userName,
  onSuccess,
  showToast,
}: UseTalentProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Form State
  const [formData, setFormData] = useState<TalentProfileData>(() => {
    // Check cached data if user previously completed their profile
    const isProfileCompleted = localStorage.getItem('castallio_talent_profile_completed') === 'true'
    const cached = localStorage.getItem('castallio_talent_profile_data')
    if (isProfileCompleted && cached) {
      try {
        const parsed = JSON.parse(cached)
        return {
          profileImage: null,
          profileImagePreview: parsed.profileImagePreview || '',
          fullName: parsed.fullName || userName || '',
          bio: parsed.bio || '',
          email: parsed.email || userEmail || '',
          contactNumber: parsed.contactNumber || '',
          city: parsed.city || '',
          instituteName: parsed.instituteName || '',
          discipline: parsed.discipline || '',
          graduationYear: parsed.graduationYear || '',
          workMode: parsed.workMode || '',
          preferredLocations: parsed.preferredLocations || [],
          willingToRelocate: parsed.willingToRelocate || '',
          availability: parsed.availability || '',
          employmentType: parsed.employmentType || '',
          noticePeriod: parsed.noticePeriod || '',
          expectedCtc: parsed.expectedCtc || '',
          resumeFile: null,
          resumeFileName: parsed.resumeFileName || '',
          resumeFileSize: parsed.resumeFileSize || '',
          portfolioLink: parsed.portfolioLink || '',
          linkedinLink: parsed.linkedinLink || '',
          specificSkill: parsed.specificSkill || '',
          coreSoftware: parsed.coreSoftware || [],
          technicalSkills: parsed.technicalSkills || [],
          softSkills: parsed.softSkills || [],
          isFresher: parsed.isFresher ?? false,
          experiences: parsed.experiences?.length ? parsed.experiences : [createEmptyExperience()],
          hasNoCertificate: parsed.hasNoCertificate ?? false,
          certificates: parsed.certificates?.length ? parsed.certificates : [createEmptyCertificate()],
        }
      } catch {
        // ignore
      }
    }

    return {
      profileImage: null,
      profileImagePreview: '',
      fullName: userName || '',
      bio: '',
      email: userEmail || '',
      contactNumber: '',
      city: '',
      instituteName: '',
      discipline: '',
      graduationYear: '',
      workMode: '',
      preferredLocations: [],
      willingToRelocate: '',
      availability: '',
      employmentType: '',
      noticePeriod: '',
      expectedCtc: '',
      resumeFile: null,
      resumeFileName: '',
      resumeFileSize: '',
      portfolioLink: '',
      linkedinLink: '',
      specificSkill: '',
      coreSoftware: [],
      technicalSkills: [],
      softSkills: [],
      isFresher: false,
      experiences: [createEmptyExperience()],
      hasNoCertificate: false,
      certificates: [createEmptyCertificate()],
    }
  })

  // Predefined custom chips management
  const [customSoftwareInput, setCustomSoftwareInput] = useState('')
  const [customTechSkillInput, setCustomTechSkillInput] = useState('')
  const [customSoftSkillInput, setCustomSoftSkillInput] = useState('')
  const [customLocationInput, setCustomLocationInput] = useState('')

  // Adjust email/name when props arrive asynchronously without cascading effect render
  const [prevAuthProps, setPrevAuthProps] = useState({ email: userEmail, name: userName })
  if (userEmail !== prevAuthProps.email || userName !== prevAuthProps.name) {
    setPrevAuthProps({ email: userEmail, name: userName })
    if ((userEmail && !formData.email) || (userName && !formData.fullName)) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || userEmail || '',
        fullName: prev.fullName || userName || '',
      }))
    }
  }

  // Profile Completeness Calculation
  const completeness = useMemo((): CompletenessBreakdown => {
    const items: CompletenessItem[] = [
      // 1. Personal Identity & Contact (25%)
      {
        id: 'profileImage',
        label: 'User profile image',
        weight: 5,
        isDone: Boolean(formData.profileImage || formData.profileImagePreview),
        category: 'identity',
      },
      {
        id: 'fullName',
        label: 'Full name',
        weight: 5,
        isDone: formData.fullName.trim().length >= 2,
        category: 'identity',
      },
      {
        id: 'email',
        label: 'Email address',
        weight: 5,
        isDone: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()),
        category: 'identity',
      },
      {
        id: 'contactNumber',
        label: 'Contact number',
        weight: 5,
        isDone: validateSingleTalentField('contactNumber', formData.contactNumber, formData) === '' && formData.contactNumber.trim().length > 0,
        category: 'identity',
      },
      {
        id: 'city',
        label: 'Current city',
        weight: 5,
        isDone: formData.city.trim().length >= 2,
        category: 'identity',
      },

      // 2. Academic & Bio (15%)
      {
        id: 'instituteName',
        label: 'Institute name',
        weight: 5,
        isDone: formData.instituteName.trim().length >= 2,
        category: 'academic',
      },
      {
        id: 'discipline',
        label: 'AEC discipline',
        weight: 5,
        isDone: Boolean(formData.discipline),
        category: 'academic',
      },
      {
        id: 'graduationYear',
        label: 'Graduation year',
        weight: 3,
        isDone: Boolean(formData.graduationYear),
        category: 'academic',
      },
      {
        id: 'bio',
        label: 'Professional bio',
        weight: 2,
        isDone: formData.bio.trim().length >= 15,
        category: 'academic',
      },

      // 3. Work Preferences (20%)
      {
        id: 'workMode',
        label: 'Work mode',
        weight: 5,
        isDone: Boolean(formData.workMode),
        category: 'preferences',
      },
      {
        id: 'preferredLocations',
        label: 'Preferred job locations',
        weight: 5,
        isDone: formData.preferredLocations.length > 0,
        category: 'preferences',
      },
      {
        id: 'willingToRelocate',
        label: 'Relocation willingness',
        weight: 3,
        isDone: Boolean(formData.willingToRelocate),
        category: 'preferences',
      },
      {
        id: 'availability',
        label: 'Joining availability',
        weight: 3,
        isDone: Boolean(formData.availability),
        category: 'preferences',
      },
      {
        id: 'employmentType',
        label: 'Employment type',
        weight: 2,
        isDone: Boolean(formData.employmentType),
        category: 'preferences',
      },
      {
        id: 'noticePeriod',
        label: 'Notice period',
        weight: 2,
        isDone: Boolean(formData.noticePeriod),
        category: 'preferences',
      },

      // 4. Documents & Links (15%)
      {
        id: 'resumeFile',
        label: 'Resume PDF document',
        weight: 7,
        isDone: Boolean(formData.resumeFile || formData.resumeFileName),
        category: 'docs',
      },
      {
        id: 'expectedCtc',
        label: 'Expected CTC',
        weight: 4,
        isDone: formData.expectedCtc.replace(/\D/g, '').length >= 4,
        category: 'docs',
      },
      {
        id: 'links',
        label: 'LinkedIn or Portfolio URL',
        weight: 4,
        isDone: Boolean(formData.linkedinLink.trim() || formData.portfolioLink.trim()),
        category: 'docs',
      },

      // 5. Technical Skills & Experience (25%)
      {
        id: 'specificSkill',
        label: 'Specific specialization skill',
        weight: 5,
        isDone: formData.specificSkill.trim().length >= 2,
        category: 'skills',
      },
      {
        id: 'coreSoftware',
        label: 'Core software mastery',
        weight: 5,
        isDone: formData.coreSoftware.length >= 1,
        category: 'skills',
      },
      {
        id: 'technicalSkills',
        label: 'Technical skills',
        weight: 5,
        isDone: formData.technicalSkills.length >= 1,
        category: 'skills',
      },
      {
        id: 'softSkills',
        label: 'Soft skills',
        weight: 5,
        isDone: formData.softSkills.length >= 1,
        category: 'skills',
      },
      {
        id: 'experience',
        label: 'Experience or Fresher status',
        weight: 5,
        isDone:
          formData.isFresher ||
          formData.experiences.some((exp) => exp.role.trim() && exp.organisation.trim()),
        category: 'skills',
      },
    ]

    const score = items.reduce((acc, curr) => (curr.isDone ? acc + curr.weight : acc), 0)
    const missingLabels = items.filter((i) => !i.isDone).map((i) => i.label)

    let tier: 'Draft' | 'Building' | 'Strong' | 'All-Star' = 'Draft'
    let tierColor = '#94a3b8'

    if (score >= 90) {
      tier = 'All-Star'
      tierColor = '#10b981'
    } else if (score >= 70) {
      tier = 'Strong'
      tierColor = '#00418f'
    } else if (score >= 40) {
      tier = 'Building'
      tierColor = '#f59e0b'
    }

    return {
      score,
      tier,
      tierColor,
      items,
      missingLabels,
    }
  }, [formData])

  // Field updater with instant runtime validation
  const updateField = useCallback(
    <K extends keyof TalentProfileData>(field: K, value: TalentProfileData[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value }
        // Run instant single field validation
        const err = validateSingleTalentField(field, value, next)
        setErrors((prevErr) => {
          if (err) {
            return { ...prevErr, [field as string]: err }
          }
          const copy = { ...prevErr }
          delete copy[field as string]
          return copy
        })
        return next
      })
    },
    []
  )

  // Blur handler marks field as touched and performs validation check
  const handleBlur = useCallback(
    (fieldName: string) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }))
      const err = validateSingleTalentField(
        fieldName as keyof TalentProfileData,
        formData[fieldName as keyof TalentProfileData],
        formData
      )
      setErrors((prevErr) => {
        if (err) {
          return { ...prevErr, [fieldName]: err }
        }
        const copy = { ...prevErr }
        delete copy[fieldName]
        return copy
      })
    },
    [formData]
  )

  // File Upload Handlers
  const handleProfileImageUpload = useCallback(
    (file: File | null) => {
      if (!file) return

      if (!file.type.startsWith('image/')) {
        showToast('Please upload a valid image (PNG, JPG, or WEBP).', 'error')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be under 5 MB.', 'error')
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
        profileImagePreview: previewUrl,
      }))
      showToast('Profile image selected successfully!', 'success')
    },
    [showToast]
  )

  const removeProfileImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
      profileImagePreview: '',
    }))
  }, [])

  const handleResumeUpload = useCallback(
    (file: File | null) => {
      if (!file) return

      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please upload your resume in PDF format only.', 'error')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast('Resume file size must be under 10 MB.', 'error')
        return
      }

      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      setFormData((prev) => ({
        ...prev,
        resumeFile: file,
        resumeFileName: file.name,
        resumeFileSize: sizeStr,
      }))
      showToast(`Resume "${file.name}" attached successfully!`, 'success')
    },
    [showToast]
  )

  const removeResume = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      resumeFile: null,
      resumeFileName: '',
      resumeFileSize: '',
    }))
  }, [])

  // Locations multi-tag management with instant validation
  const toggleLocation = useCallback((loc: string) => {
    setFormData((prev) => {
      const exists = prev.preferredLocations.includes(loc)
      const nextLocs = exists
        ? prev.preferredLocations.filter((item) => item !== loc)
        : [...prev.preferredLocations, loc]
      const next = { ...prev, preferredLocations: nextLocs }

      const err = validateSingleTalentField('preferredLocations', nextLocs, next)
      setErrors((prevErr) => {
        if (err) return { ...prevErr, preferredLocations: err }
        const copy = { ...prevErr }
        delete copy.preferredLocations
        return copy
      })
      return next
    })
  }, [])

  const addCustomLocation = useCallback(() => {
    const trimmed = customLocationInput.trim()
    if (!trimmed) return
    if (!formData.preferredLocations.includes(trimmed)) {
      setFormData((prev) => {
        const nextLocs = [...prev.preferredLocations, trimmed]
        const next = { ...prev, preferredLocations: nextLocs }
        const err = validateSingleTalentField('preferredLocations', nextLocs, next)
        setErrors((prevErr) => {
          if (err) return { ...prevErr, preferredLocations: err }
          const copy = { ...prevErr }
          delete copy.preferredLocations
          return copy
        })
        return next
      })
    }
    setCustomLocationInput('')
  }, [customLocationInput, formData.preferredLocations])

  // Core Software toggle & add with instant validation
  const toggleCoreSoftware = useCallback((soft: string) => {
    setFormData((prev) => {
      const exists = prev.coreSoftware.includes(soft)
      const nextSoft = exists
        ? prev.coreSoftware.filter((item) => item !== soft)
        : [...prev.coreSoftware, soft]
      const next = { ...prev, coreSoftware: nextSoft }

      const err = validateSingleTalentField('coreSoftware', nextSoft, next)
      setErrors((prevErr) => {
        if (err) return { ...prevErr, coreSoftware: err }
        const copy = { ...prevErr }
        delete copy.coreSoftware
        return copy
      })
      return next
    })
  }, [])

  const addCustomSoftware = useCallback(() => {
    const trimmed = customSoftwareInput.trim()
    if (!trimmed) return
    if (!formData.coreSoftware.includes(trimmed)) {
      setFormData((prev) => {
        const nextSoft = [...prev.coreSoftware, trimmed]
        const next = { ...prev, coreSoftware: nextSoft }
        const err = validateSingleTalentField('coreSoftware', nextSoft, next)
        setErrors((prevErr) => {
          if (err) return { ...prevErr, coreSoftware: err }
          const copy = { ...prevErr }
          delete copy.coreSoftware
          return copy
        })
        return next
      })
    }
    setCustomSoftwareInput('')
  }, [customSoftwareInput, formData.coreSoftware])

  // Technical Skills toggle & add with instant validation
  const toggleTechSkill = useCallback((skill: string) => {
    setFormData((prev) => {
      const exists = prev.technicalSkills.includes(skill)
      const nextSkills = exists
        ? prev.technicalSkills.filter((item) => item !== skill)
        : [...prev.technicalSkills, skill]
      const next = { ...prev, technicalSkills: nextSkills }

      const err = validateSingleTalentField('technicalSkills', nextSkills, next)
      setErrors((prevErr) => {
        if (err) return { ...prevErr, technicalSkills: err }
        const copy = { ...prevErr }
        delete copy.technicalSkills
        return copy
      })
      return next
    })
  }, [])

  const addCustomTechSkill = useCallback(() => {
    const trimmed = customTechSkillInput.trim()
    if (!trimmed) return
    if (!formData.technicalSkills.includes(trimmed)) {
      setFormData((prev) => {
        const nextSkills = [...prev.technicalSkills, trimmed]
        const next = { ...prev, technicalSkills: nextSkills }
        const err = validateSingleTalentField('technicalSkills', nextSkills, next)
        setErrors((prevErr) => {
          if (err) return { ...prevErr, technicalSkills: err }
          const copy = { ...prevErr }
          delete copy.technicalSkills
          return copy
        })
        return next
      })
    }
    setCustomTechSkillInput('')
  }, [customTechSkillInput, formData.technicalSkills])

  // Soft Skills toggle & add with instant validation
  const toggleSoftSkill = useCallback((skill: string) => {
    setFormData((prev) => {
      const exists = prev.softSkills.includes(skill)
      const nextSkills = exists
        ? prev.softSkills.filter((item) => item !== skill)
        : [...prev.softSkills, skill]
      const next = { ...prev, softSkills: nextSkills }

      const err = validateSingleTalentField('softSkills', nextSkills, next)
      setErrors((prevErr) => {
        if (err) return { ...prevErr, softSkills: err }
        const copy = { ...prevErr }
        delete copy.softSkills
        return copy
      })
      return next
    })
  }, [])

  const addCustomSoftSkill = useCallback(() => {
    const trimmed = customSoftSkillInput.trim()
    if (!trimmed) return
    if (!formData.softSkills.includes(trimmed)) {
      setFormData((prev) => {
        const nextSkills = [...prev.softSkills, trimmed]
        const next = { ...prev, softSkills: nextSkills }
        const err = validateSingleTalentField('softSkills', nextSkills, next)
        setErrors((prevErr) => {
          if (err) return { ...prevErr, softSkills: err }
          const copy = { ...prevErr }
          delete copy.softSkills
          return copy
        })
        return next
      })
    }
    setCustomSoftSkillInput('')
  }, [customSoftSkillInput, formData.softSkills])

  // Experience management
  const addExperienceCard = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, createEmptyExperience()],
    }))
  }, [])

  const updateExperience = useCallback(
    (index: number, field: keyof ExperienceItem, value: unknown) => {
      setFormData((prev) => {
        const next = [...prev.experiences]
        if (next[index]) {
          next[index] = { ...next[index], [field]: value }
        }
        return { ...prev, experiences: next }
      })
      // Clear experience error once filled
      setErrors((prev) => {
        if (prev.experience) {
          const copy = { ...prev }
          delete copy.experience
          return copy
        }
        return prev
      })
    },
    []
  )

  const removeExperience = useCallback((index: number) => {
    setFormData((prev) => {
      if (prev.experiences.length <= 1) {
        return { ...prev, experiences: [createEmptyExperience()] }
      }
      return {
        ...prev,
        experiences: prev.experiences.filter((_, i) => i !== index),
      }
    })
  }, [])

  // Certificate management
  const addCertificateCard = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      certificates: [...prev.certificates, createEmptyCertificate()],
    }))
  }, [])

  const updateCertificate = useCallback(
    (index: number, field: keyof CertificateItem, value: unknown) => {
      setFormData((prev) => {
        const next = [...prev.certificates]
        if (next[index]) {
          next[index] = { ...next[index], [field]: value }
        }
        return { ...prev, certificates: next }
      })
    },
    []
  )

  const handleCertificateDocUpload = useCallback(
    (index: number, file: File | null) => {
      if (!file) return

      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please upload certificate in PDF format.', 'error')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast('Certificate PDF must be under 10 MB.', 'error')
        return
      }

      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      setFormData((prev) => {
        const next = [...prev.certificates]
        if (next[index]) {
          next[index] = {
            ...next[index],
            file,
            fileName: file.name,
            fileSize: sizeStr,
          }
        }
        return { ...prev, certificates: next }
      })
      showToast(`Certificate "${file.name}" attached.`, 'success')
    },
    [showToast]
  )

  const removeCertificate = useCallback((index: number) => {
    setFormData((prev) => {
      if (prev.certificates.length <= 1) {
        return { ...prev, certificates: [createEmptyCertificate()] }
      }
      return {
        ...prev,
        certificates: prev.certificates.filter((_, i) => i !== index),
      }
    })
  }, [])

  // Step Validation
  const validateStep1 = useCallback((): boolean => {
    const step1Fields: (keyof TalentProfileData)[] = [
      'fullName',
      'email',
      'contactNumber',
      'city',
      'instituteName',
      'discipline',
      'graduationYear',
      'workMode',
      'preferredLocations',
      'expectedCtc',
      'portfolioLink',
      'linkedinLink',
    ]

    const errs: Record<string, string> = {}
    const newTouched: Record<string, boolean> = {}

    step1Fields.forEach((field) => {
      newTouched[field] = true
      const err = validateSingleTalentField(field, formData[field], formData)
      if (err) {
        errs[field] = err
      }
    })

    setTouched((prev) => ({ ...prev, ...newTouched }))
    setErrors((prev) => ({ ...prev, ...errs }))

    if (Object.keys(errs).length > 0) {
      showToast('Please resolve the highlighted fields in your profile.', 'warning')
      return false
    }

    return true
  }, [formData, showToast])

  const validateStep2 = useCallback((): boolean => {
    const step2Fields: (keyof TalentProfileData)[] = [
      'specificSkill',
      'coreSoftware',
      'technicalSkills',
      'softSkills',
    ]

    const errs: Record<string, string> = {}
    const newTouched: Record<string, boolean> = {}

    step2Fields.forEach((field) => {
      newTouched[field] = true
      const err = validateSingleTalentField(field, formData[field], formData)
      if (err) {
        errs[field] = err
      }
    })

    // Experience check if not fresher
    if (!formData.isFresher) {
      const hasValidExp = formData.experiences.some(
        (exp) => exp.role.trim() && exp.organisation.trim()
      )
      if (!hasValidExp) {
        errs.experience = 'Please add at least one professional experience, or toggle "I am a fresher".'
      }
    }

    setTouched((prev) => ({ ...prev, ...newTouched }))
    setErrors((prev) => ({ ...prev, ...errs }))

    if (Object.keys(errs).length > 0) {
      showToast('Please complete your technical skills and experience information.', 'warning')
      return false
    }

    return true
  }, [formData, showToast])

  // Step transitions
  const goToNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [currentStep, validateStep1])

  const goToPrevStep = useCallback(() => {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Final Submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (!validateStep1()) {
        setCurrentStep(1)
        return
      }

      if (!validateStep2()) {
        return
      }

      setIsSubmitting(true)
      try {
        const finalUserId = userId || `talent_${Date.now()}`
        await saveTalentProfile(finalUserId, formData, completeness.score)
        showToast('Talent profile setup completed successfully! Welcome to Castallio One.', 'success', 'Profile Activated')
        onSuccess()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save profile'
        showToast(msg, 'error', 'Setup Error')
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateStep1, validateStep2, userId, formData, completeness.score, onSuccess, showToast]
  )

  return {
    currentStep,
    setCurrentStep,
    formData,
    errors,
    touched,
    isSubmitting,
    completeness,
    updateField,
    handleBlur,
    goToNextStep,
    goToPrevStep,
    handleSubmit,

    // File handlers
    handleProfileImageUpload,
    removeProfileImage,
    handleResumeUpload,
    removeResume,

    // Location tags
    customLocationInput,
    setCustomLocationInput,
    toggleLocation,
    addCustomLocation,

    // Software & Skills
    customSoftwareInput,
    setCustomSoftwareInput,
    toggleCoreSoftware,
    addCustomSoftware,

    customTechSkillInput,
    setCustomTechSkillInput,
    toggleTechSkill,
    addCustomTechSkill,

    customSoftSkillInput,
    setCustomSoftSkillInput,
    toggleSoftSkill,
    addCustomSoftSkill,

    // Experience
    addExperienceCard,
    updateExperience,
    removeExperience,

    // Certificates
    addCertificateCard,
    updateCertificate,
    handleCertificateDocUpload,
    removeCertificate,
  }
}
