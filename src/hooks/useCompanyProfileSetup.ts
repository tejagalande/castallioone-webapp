import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { saveCompanyProfile } from '../lib/companyService'
import { validateDomainExtension } from './useWalkInDrives'

export interface CompanyProfileData {
  companyLogo: File | null
  companyLogoPreview: string
  companyName: string
  website: string
  email: string
  hrEmail: string
  companySize: '1-50' | '51-200' | '201-1000' | '1000+' | ''
  description: string
  linkedinUrl: string
  establishmentYear: string
  officeAddress: string
  gstNumber: string // Optional
  certificateType: 'MSME' | 'MCA'
  certificateFile: File | null
  certificateFileName: string
  companyPan: string
  panFile: File | null
  panFileName: string
}

export interface UseCompanyProfileSetupProps {
  userId?: string
  onSuccess: () => void
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void
}

const initialProfileData: CompanyProfileData = {
  companyLogo: null,
  companyLogoPreview: '',
  companyName: '',
  website: '',
  email: '',
  hrEmail: '',
  companySize: '',
  description: '',
  linkedinUrl: '',
  establishmentYear: '',
  officeAddress: '',
  gstNumber: '',
  certificateType: 'MSME',
  certificateFile: null,
  certificateFileName: '',
  companyPan: '',
  panFile: null,
  panFileName: '',
}

export const validateSingleField = (
  field: keyof CompanyProfileData,
  value: unknown,
  allData: CompanyProfileData
): string => {
  const strVal = typeof value === 'string' ? value.trim() : ''

  switch (field) {
    case 'companyName':
      if (!strVal) return 'Company name is required.'
      if (strVal.length < 2) return 'Company name must be at least 2 characters.'
      return ''

    case 'website': {
      if (!strVal) return 'Company website is required.'
      const check = validateDomainExtension(strVal, 'website')
      if (!check.isValid) return check.error || 'Please enter a valid website URL.'
      return ''
    }

    case 'email': {
      if (!strVal) return 'Official company email is required.'
      const check = validateDomainExtension(strVal, 'email')
      if (!check.isValid) return check.error || 'Please enter a valid official email address.'
      return ''
    }

    case 'hrEmail': {
      if (!strVal) return 'HR Contact email is required.'
      const check = validateDomainExtension(strVal, 'email')
      if (!check.isValid) return check.error || 'Please enter a valid HR contact email address.'
      return ''
    }

    case 'companySize':
      if (!strVal) return 'Please select your company team size.'
      return ''

    case 'description':
      if (!strVal) return 'Company description is required.'
      if (strVal.length < 20) {
        return `Please provide at least 20 characters (${strVal.length}/20).`
      }
      return ''

    case 'linkedinUrl':
      if (!strVal) return 'LinkedIn company URL is required.'
      if (!/linkedin\.com/i.test(strVal)) {
        return 'Must be a valid LinkedIn URL (e.g. linkedin.com/company/...)'
      }
      return ''

    case 'establishmentYear': {
      const currentYear = new Date().getFullYear()
      const yearNum = parseInt(strVal, 10)
      if (!strVal) return 'Establishment year is required.'
      if (isNaN(yearNum) || yearNum < 1800 || yearNum > currentYear) {
        return `Please choose a valid year between 1800 and ${currentYear}.`
      }
      return ''
    }

    case 'officeAddress':
      if (!strVal) return 'Registered office address is required.'
      if (strVal.length < 5) return 'Please enter a complete office address.'
      return ''

    case 'certificateFileName':
      if (!allData.certificateFile && !allData.certificateFileName) {
        return 'Company verification certificate (MSME or MCA) is required.'
      }
      return ''

    case 'companyPan': {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i
      if (!strVal) return 'Company PAN number is required.'
      if (!panRegex.test(strVal)) {
        return 'Enter a valid 10-digit PAN (e.g. ABCDE1234F).'
      }
      return ''
    }

    case 'gstNumber': {
      if (strVal) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i
        if (!gstRegex.test(strVal)) {
          return 'Enter a valid 15-digit GSTIN (e.g. 22AAAAA0000A1Z5) or leave blank.'
        }
      }
      return ''
    }

    default:
      return ''
  }
}

export function useCompanyProfileSetup({
  userId: propUserId,
  onSuccess,
  showToast,
}: UseCompanyProfileSetupProps) {
  const [formData, setFormData] = useState<CompanyProfileData>(() => {
    const saved = localStorage.getItem('castallio_enterprise_profile')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          ...initialProfileData,
          ...parsed,
          companyLogo: null,
          certificateFile: null,
          panFile: null,
        }
      } catch {
        return initialProfileData
      }
    }
    return initialProfileData
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyProfileData, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CompanyProfileData, boolean>>>({})

  // Runtime field updater with instant validation
  const updateField = useCallback(
    (field: keyof CompanyProfileData, value: string) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value }
        // Runtime validation check
        const err = validateSingleField(field, value, updated)
        setErrors((prevErr) => ({ ...prevErr, [field]: err }))
        return updated
      })
    },
    []
  )

  // Blur handler marks field as touched and validates
  const handleBlur = useCallback(
    (field: keyof CompanyProfileData) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const err = validateSingleField(field, formData[field], formData)
      setErrors((prev) => ({ ...prev, [field]: err }))
    },
    [formData]
  )

  const handleLogoUpload = useCallback(
    (file: File | null) => {
      if (!file) {
        setFormData((prev) => ({ ...prev, companyLogo: null, companyLogoPreview: '' }))
        return
      }

      if (!file.type.startsWith('image/')) {
        showToast(
          'Please upload a valid image file for company logo (PNG, JPG, SVG).',
          'error',
          'Invalid Format'
        )
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('Logo file size must be less than 5MB.', 'error', 'File Too Large')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          companyLogo: file,
          companyLogoPreview: reader.result as string,
        }))
        showToast('Company logo attached for upload.', 'success', 'Logo Attached')
      }
      reader.onerror = () => {
        showToast('Failed to read logo image.', 'error', 'Upload Error')
      }
      reader.readAsDataURL(file)
    },
    [showToast]
  )

  const handleCertificateUpload = useCallback(
    (file: File | null) => {
      if (!file) {
        setFormData((prev) => ({ ...prev, certificateFile: null, certificateFileName: '' }))
        setErrors((prev) => ({ ...prev, certificateFileName: 'Company verification certificate is required.' }))
        return
      }

      const validExtensions = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!validExtensions.includes(file.type) && !file.name.endsWith('.pdf')) {
        showToast(
          'Please upload a PDF or image file for MSME/MCA certificate.',
          'error',
          'Invalid Format'
        )
        return
      }

      setFormData((prev) => ({
        ...prev,
        certificateFile: file,
        certificateFileName: file.name,
      }))
      setErrors((prev) => ({ ...prev, certificateFileName: '' }))
      showToast(`Certificate attached: ${file.name}`, 'success', 'Document Attached')
    },
    [showToast]
  )

  const handlePanFileUpload = useCallback(
    (file: File | null) => {
      if (!file) {
        setFormData((prev) => ({ ...prev, panFile: null, panFileName: '' }))
        return
      }

      setFormData((prev) => ({
        ...prev,
        panFile: file,
        panFileName: file.name,
      }))
      showToast(`PAN document attached: ${file.name}`, 'success', 'Document Attached')
    },
    [showToast]
  )

  const validateAll = (): boolean => {
    const fieldsToValidate: (keyof CompanyProfileData)[] = [
      'companyName',
      'website',
      'email',
      'hrEmail',
      'companySize',
      'description',
      'linkedinUrl',
      'establishmentYear',
      'officeAddress',
      'certificateFileName',
      'companyPan',
      'gstNumber',
    ]

    const newErrors: Partial<Record<keyof CompanyProfileData, string>> = {}
    const newTouched: Partial<Record<keyof CompanyProfileData, boolean>> = {}

    for (const f of fieldsToValidate) {
      newTouched[f] = true
      const err = validateSingleField(f, formData[f], formData)
      if (err) {
        newErrors[f] = err
      }
    }

    setTouched(newTouched)
    setErrors(newErrors)

    const errorKeys = Object.keys(newErrors)
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0] as keyof CompanyProfileData
      showToast(newErrors[firstKey] || 'Please correct the highlighted fields.', 'error', 'Validation Error')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAll()) return

    setIsSubmitting(true)
    showToast('Uploading documents and creating enterprise records...', 'info', 'Processing')

    try {
      let ownerId = propUserId
      if (!ownerId) {
        const { data: userData } = await supabase.auth.getUser()
        ownerId = userData.user?.id
      }

      if (!ownerId) {
        throw new Error('Authentication session not found. Please log in again.')
      }

      // 1. Upload files and save company details to Supabase DB & Storage
      await saveCompanyProfile(ownerId, formData)

      // 2. Cache completed profile locally
      const profilePayload = {
        companyName: formData.companyName,
        website: formData.website,
        email: formData.email,
        hrEmail: formData.hrEmail,
        companySize: formData.companySize,
        description: formData.description,
        linkedinUrl: formData.linkedinUrl,
        establishmentYear: formData.establishmentYear,
        officeAddress: formData.officeAddress,
        gstNumber: formData.gstNumber,
        companyPan: formData.companyPan.toUpperCase(),
        certificateType: formData.certificateType,
        certificateFileName: formData.certificateFileName,
        panFileName: formData.panFileName,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem('castallio_enterprise_profile', JSON.stringify(profilePayload))
      localStorage.setItem('castallio_enterprise_profile_completed', 'true')

      showToast(
        'Company profile setup completed and verified in database! Welcome to Castallio One.',
        'success',
        'Verification Complete'
      )

      onSuccess()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save company profile.'
      console.error('Submit company profile error:', err)
      showToast(message, 'error', 'Database Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    updateField,
    handleBlur,
    handleLogoUpload,
    handleCertificateUpload,
    handlePanFileUpload,
    handleSubmit,
  }
}
