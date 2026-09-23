import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { uploadCompanyLogo, uploadCompanyDocument } from '../lib/companyService'
import { validateDomainExtension } from '../hooks/useWalkInDrives'

export type CompanySize = '1-50' | '51-200' | '201-1000' | '1000+' | ''
export type CertificateType = 'MSME' | 'MCA'

export interface CompanyRecord {
  id?: string
  owner_id: string
  name: string
  size: CompanySize
  website: string
  email: string
  hr_contact_email: string
  establishment_year: number | ''
  office_address: string
  linkedin_url: string
  description: string
  logo_url: string | null
  gst_number: string
  certificate_type: CertificateType
  certificate_link: string
  pan_card_link: string
  is_profile_complete: boolean
  is_draft: boolean
  created_at?: string
  updated_at?: string
}

export type CompanyValidationErrors = Partial<Record<keyof CompanyRecord, string>>
export type CompanyValidationTouched = Partial<Record<keyof CompanyRecord, boolean>>

export const validateCompanyField = (
  field: keyof CompanyRecord,
  value: unknown
): string => {
  const strVal = typeof value === 'string' ? value.trim() : ''

  switch (field) {
    case 'name':
      if (!strVal) return 'Company name is required.'
      if (strVal.length < 2) return 'Company name must be at least 2 characters.'
      return ''

    case 'size':
      if (!strVal) return 'Please select your company team size.'
      return ''

    case 'website': {
      if (!strVal) return 'Company website URL is required.'
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

    case 'hr_contact_email': {
      if (!strVal) return 'HR contact email is required.'
      const check = validateDomainExtension(strVal, 'email')
      if (!check.isValid) return check.error || 'Please enter a valid HR contact email address.'
      return ''
    }

    case 'establishment_year': {
      if (value === '' || value === null || value === undefined) return ''
      const num = typeof value === 'number' ? value : parseInt(strVal, 10)
      const currentYear = new Date().getFullYear()
      if (isNaN(num) || num < 1800 || num > currentYear) {
        return `Please enter a valid year between 1800 and ${currentYear}.`
      }
      return ''
    }

    case 'office_address':
      if (!strVal) return 'Office address is required.'
      if (strVal.length < 5) return 'Please enter a complete office address (at least 5 characters).'
      return ''

    case 'description':
      if (!strVal) return 'Company description is required.'
      if (strVal.length < 20) {
        return `Please provide at least 20 characters (${strVal.length}/20).`
      }
      return ''

    case 'linkedin_url':
      if (strVal && !/linkedin\.com/i.test(strVal)) {
        return 'Must be a valid LinkedIn URL (e.g. linkedin.com/company/...)'
      }
      return ''

    case 'gst_number':
      if (strVal) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i
        if (!gstRegex.test(strVal)) {
          return 'Enter a valid 15-digit GSTIN (e.g. 27AAPFU0939F1ZV) or leave blank.'
        }
      }
      return ''

    default:
      return ''
  }
}

export const validateAllCompanyFields = (
  record: CompanyRecord
): CompanyValidationErrors => {
  const fieldsToCheck: (keyof CompanyRecord)[] = [
    'name',
    'size',
    'website',
    'email',
    'hr_contact_email',
    'establishment_year',
    'office_address',
    'description',
    'linkedin_url',
    'gst_number',
  ]

  const result: CompanyValidationErrors = {}
  for (const f of fieldsToCheck) {
    const err = validateCompanyField(f, record[f])
    if (err) {
      result[f] = err
    }
  }
  return result
}

const DEFAULT_COMPANY_RECORD: CompanyRecord = {
  owner_id: '',
  name: '',
  size: '',
  website: '',
  email: '',
  hr_contact_email: '',
  establishment_year: '',
  office_address: '',
  linkedin_url: '',
  description: '',
  logo_url: null,
  gst_number: '',
  certificate_type: 'MSME',
  certificate_link: '',
  pan_card_link: '',
  is_profile_complete: false,
  is_draft: false,
}

export function useCompanyProfile() {
  const [userId, setUserId] = useState<string>('')
  const [profile, setProfile] = useState<CompanyRecord>(DEFAULT_COMPANY_RECORD)
  const [savedSnapshot, setSavedSnapshot] = useState<CompanyRecord>(DEFAULT_COMPANY_RECORD)
  
  // Validation state
  const [errors, setErrors] = useState<CompanyValidationErrors>({})
  const [touched, setTouched] = useState<CompanyValidationTouched>({})

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false)
  const [isUploadingCertificate, setIsUploadingCertificate] = useState<boolean>(false)
  const [isUploadingPan, setIsUploadingPan] = useState<boolean>(false)

  const [activeTab, setActiveTab] = useState<'general' | 'documents' | 'preview'>('general')
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => {
      setToastMessage(null)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  // Fetch current company record from Supabase
  const fetchCompanyProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser()

      if (authErr || !user) {
        showToast('Please sign in to view your company profile.')
        setIsLoading(false)
        return
      }

      setUserId(user.id)

      // 1. Try fetching via RPC function
      let companyData: Record<string, unknown> | null = null
      const { data: rpcData, error: rpcError } = await supabase.rpc('web_get_company_profile')

      if (!rpcError && rpcData) {
        companyData = rpcData as Record<string, unknown>
      } else {
        // Fallback to direct table query
        const { data: tableData, error: tableError } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (tableError) {
          console.error('Error fetching company profile:', tableError)
          showToast(`Could not load profile: ${tableError.message}`)
          setIsLoading(false)
          return
        }
        companyData = tableData
      }

      if (companyData) {
        const loaded: CompanyRecord = {
          id: (companyData.id as string) || undefined,
          owner_id: (companyData.owner_id as string) || user.id,
          name: (companyData.name as string) || '',
          size: (companyData.size as CompanySize) || '',
          website: (companyData.website as string) || '',
          email: (companyData.email as string) || user.email || '',
          hr_contact_email: (companyData.hr_contact_email as string) || '',
          establishment_year: (companyData.establishment_year as number) || '',
          office_address: (companyData.office_address as string) || '',
          linkedin_url: (companyData.linkedin_url as string) || '',
          description: (companyData.description as string) || '',
          logo_url: (companyData.logo_url as string) || null,
          gst_number: (companyData.gst_number as string) || '',
          certificate_type: ((companyData.certificate_type as CertificateType) || 'MSME'),
          certificate_link: (companyData.certificate_link as string) || '',
          pan_card_link: (companyData.pan_card_link as string) || '',
          is_profile_complete: Boolean(companyData.is_profile_complete),
          is_draft: Boolean(companyData.is_draft),
          created_at: companyData.created_at as string,
          updated_at: companyData.updated_at as string,
        }
        setProfile(loaded)
        setSavedSnapshot(loaded)
      } else {
        // No existing record, initialize default with user info
        const fresh: CompanyRecord = {
          ...DEFAULT_COMPANY_RECORD,
          owner_id: user.id,
          email: user.email || '',
        }
        setProfile(fresh)
        setSavedSnapshot(fresh)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Exception fetching company profile:', msg)
      showToast(`Error: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchCompanyProfile()
  }, [fetchCompanyProfile])

  // Field updater with live runtime validation
  const updateProfileField = useCallback(
    <K extends keyof CompanyRecord>(field: K, value: CompanyRecord[K]) => {
      setProfile((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Re-validate dynamically if field has been touched or has an existing error
      setTouched((prevTouched) => {
        if (prevTouched[field]) {
          const fieldError = validateCompanyField(field, value)
          setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: fieldError || undefined,
          }))
        }
        return prevTouched
      })
    },
    []
  )

  // Blur handler for inputs
  const handleBlur = useCallback(
    (field: keyof CompanyRecord) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const fieldError = validateCompanyField(field, profile[field])
      setErrors((prev) => ({
        ...prev,
        [field]: fieldError || undefined,
      }))
    },
    [profile]
  )

  // Detect whether changes have been made compared to saved snapshot
  const isDirty = useMemo(() => {
    return (
      profile.name !== savedSnapshot.name ||
      profile.size !== savedSnapshot.size ||
      profile.website !== savedSnapshot.website ||
      profile.email !== savedSnapshot.email ||
      profile.hr_contact_email !== savedSnapshot.hr_contact_email ||
      profile.establishment_year !== savedSnapshot.establishment_year ||
      profile.office_address !== savedSnapshot.office_address ||
      profile.linkedin_url !== savedSnapshot.linkedin_url ||
      profile.description !== savedSnapshot.description ||
      profile.logo_url !== savedSnapshot.logo_url ||
      profile.gst_number !== savedSnapshot.gst_number ||
      profile.certificate_type !== savedSnapshot.certificate_type ||
      profile.certificate_link !== savedSnapshot.certificate_link ||
      profile.pan_card_link !== savedSnapshot.pan_card_link
    )
  }, [profile, savedSnapshot])

  // Profile completeness score & checklist
  const completeness = useMemo(() => {
    const items = [
      { key: 'name', label: 'Company Legal Name', filled: Boolean(profile.name.trim()) },
      { key: 'logo_url', label: 'Company Brand Logo', filled: Boolean(profile.logo_url) },
      { key: 'size', label: 'Company Size Category', filled: Boolean(profile.size) },
      { key: 'website', label: 'Official Website Link', filled: Boolean(profile.website.trim()) },
      { key: 'email', label: 'Corporate Contact Email', filled: Boolean(profile.email.trim()) },
      { key: 'hr_contact_email', label: 'HR / Recruiter Email', filled: Boolean(profile.hr_contact_email.trim()) },
      { key: 'establishment_year', label: 'Founding Year', filled: Boolean(profile.establishment_year) },
      { key: 'office_address', label: 'Office / Studio Address', filled: Boolean(profile.office_address.trim()) },
      { key: 'description', label: 'Studio Narrative & About Us', filled: Boolean(profile.description.trim().length >= 20) },
      { key: 'certificate_link', label: 'Business Registration Document', filled: Boolean(profile.certificate_link) },
    ]

    const completedCount = items.filter((i) => i.filled).length
    const percentage = Math.round((completedCount / items.length) * 100)

    return {
      percentage,
      items,
      isFullyComplete: percentage === 100,
    }
  }, [profile])

  // Logo file upload
  const handleLogoUpload = useCallback(
    async (file: File) => {
      if (!userId) {
        showToast('Authentication required to upload logo.')
        return
      }
      setIsUploadingLogo(true)
      try {
        const publicUrl = await uploadCompanyLogo(userId, file)
        updateProfileField('logo_url', publicUrl)
        showToast('Logo uploaded successfully. Remember to save changes.')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Logo upload failed'
        console.error('Logo upload error:', msg)
        showToast(msg)
      } finally {
        setIsUploadingLogo(false)
      }
    },
    [userId, updateProfileField, showToast]
  )

  // Remove current logo
  const handleRemoveLogo = useCallback(() => {
    updateProfileField('logo_url', null)
    showToast('Logo removed. Save changes to update your profile.')
  }, [updateProfileField, showToast])

  // Document upload (Registration Certificate or PAN card)
  const handleDocumentUpload = useCallback(
    async (file: File, type: 'certificate' | 'pan_card') => {
      if (!userId) {
        showToast('Authentication required to upload document.')
        return
      }

      if (type === 'certificate') {
        setIsUploadingCertificate(true)
      } else {
        setIsUploadingPan(true)
      }

      try {
        const publicUrl = await uploadCompanyDocument(userId, file, type)
        if (type === 'certificate') {
          updateProfileField('certificate_link', publicUrl)
          showToast('Registration certificate uploaded.')
        } else {
          updateProfileField('pan_card_link', publicUrl)
          showToast('PAN card document uploaded.')
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `${type} upload failed`
        console.error('Document upload error:', msg)
        showToast(msg)
      } finally {
        if (type === 'certificate') {
          setIsUploadingCertificate(false)
        } else {
          setIsUploadingPan(false)
        }
      }
    },
    [userId, updateProfileField, showToast]
  )

  // Save changes to Supabase
  const handleSaveAndPublish = useCallback(async () => {
    if (!userId) {
      showToast('You must be signed in to save profile changes.')
      return
    }

    // Gatekeeper Runtime Validation
    const validationErrors = validateAllCompanyFields(profile)
    const errorKeys = Object.keys(validationErrors) as (keyof CompanyRecord)[]

    if (errorKeys.length > 0) {
      const allTouched: CompanyValidationTouched = {}
      errorKeys.forEach((key) => {
        allTouched[key] = true
      })
      setTouched((prev) => ({ ...prev, ...allTouched }))
      setErrors(validationErrors)

      const firstError = validationErrors[errorKeys[0]]
      showToast(`Please correct errors before saving: ${firstError}`)
      return
    }

    setIsSaving(true)
    try {
      const isComplete = Boolean(
        profile.name.trim() &&
        profile.email.trim() &&
        profile.website.trim() &&
        profile.office_address.trim() &&
        profile.description.trim()
      )

      const rpcParams = {
        p_name: profile.name.trim(),
        p_size: profile.size || null,
        p_website: profile.website.trim() || null,
        p_email: profile.email.trim() || null,
        p_hr_contact_email: profile.hr_contact_email.trim() || null,
        p_establishment_year: profile.establishment_year ? Number(profile.establishment_year) : null,
        p_office_address: profile.office_address.trim() || null,
        p_linkedin_url: profile.linkedin_url.trim() || null,
        p_description: profile.description.trim() || null,
        p_logo_url: profile.logo_url || null,
        p_gst_number: profile.gst_number.trim() || null,
        p_certificate_type: profile.certificate_type || 'MSME',
        p_certificate_link: profile.certificate_link || null,
        p_pan_card_link: profile.pan_card_link || null,
      }

      let savedRecord: Record<string, unknown> | null = null
      const { data: rpcData, error: rpcError } = await supabase.rpc('web_upsert_company_profile', rpcParams)

      if (!rpcError && rpcData) {
        savedRecord = rpcData as Record<string, unknown>
      } else {
        // Fallback to direct upsert
        const fallbackPayload = {
          owner_id: userId,
          name: profile.name.trim(),
          size: profile.size || null,
          website: profile.website.trim(),
          email: profile.email.trim(),
          hr_contact_email: profile.hr_contact_email.trim(),
          establishment_year: profile.establishment_year ? Number(profile.establishment_year) : null,
          office_address: profile.office_address.trim(),
          linkedin_url: profile.linkedin_url.trim(),
          description: profile.description.trim(),
          logo_url: profile.logo_url || null,
          gst_number: profile.gst_number.trim() || null,
          certificate_type: profile.certificate_type || 'MSME',
          certificate_link: profile.certificate_link || null,
          pan_card_link: profile.pan_card_link || null,
          is_profile_complete: isComplete,
          is_draft: false,
          updated_at: new Date().toISOString(),
        }

        const { data: tableData, error: tableError } = await supabase
          .from('companies')
          .upsert(fallbackPayload, { onConflict: 'owner_id' })
          .select()
          .single()

        if (tableError) {
          throw new Error(`Failed to save: ${tableError.message}`)
        }
        savedRecord = tableData
      }

      const updatedRecord: CompanyRecord = {
        ...profile,
        id: (savedRecord?.id as string) || profile.id,
        is_profile_complete: isComplete,
        is_draft: false,
        updated_at: (savedRecord?.updated_at as string) || new Date().toISOString(),
      }

      setProfile(updatedRecord)
      setSavedSnapshot(updatedRecord)
      showToast('Company profile successfully saved and published!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error saving company profile'
      console.error('Error in handleSaveAndPublish:', msg)
      showToast(msg)
    } finally {
      setIsSaving(false)
    }
  }, [userId, profile, showToast])

  // Discard changes
  const handleDiscardChanges = useCallback(() => {
    setProfile(savedSnapshot)
    setErrors({})
    setTouched({})
    showToast('Changes discarded. Profile reverted to last saved state.')
  }, [savedSnapshot, showToast])

  return {
    userId,
    profile,
    savedSnapshot,
    errors,
    touched,
    handleBlur,
    validateField: validateCompanyField,
    isLoading,
    isSaving,
    isUploadingLogo,
    isUploadingCertificate,
    isUploadingPan,
    isDirty,
    completeness,
    activeTab,
    setActiveTab,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    toastMessage,
    showToast,
    updateProfileField,
    handleLogoUpload,
    handleRemoveLogo,
    handleDocumentUpload,
    handleSaveAndPublish,
    handleDiscardChanges,
    fetchCompanyProfile,
  }
}
