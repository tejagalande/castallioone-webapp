import { supabase } from './supabase'
import type { CompanyProfileData } from '../hooks/useCompanyProfileSetup'

export interface UserProfileRecord {
  id: string
  role: 'professional' | 'company'
  onboarding_complete: boolean | null
  created_at?: string
  onesignal_id?: string | null
}

export interface CheckProfileResult {
  exists: boolean
  profile: UserProfileRecord | null
  needsOnboarding: boolean
  error?: string
}

/**
 * Checks whether user_profiles has a record for the current user and whether onboarding is complete.
 */
export async function checkUserProfile(userId: string): Promise<CheckProfileResult> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, role, onboarding_complete, created_at, onesignal_id')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user_profiles:', error.message)
      return { exists: false, profile: null, needsOnboarding: true, error: error.message }
    }

    if (!data) {
      return { exists: false, profile: null, needsOnboarding: true }
    }

    const profile = data as UserProfileRecord
    const needsOnboarding = profile.role === 'company' && !profile.onboarding_complete

    return {
      exists: true,
      profile,
      needsOnboarding,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('checkUserProfile exception:', msg)
    return { exists: false, profile: null, needsOnboarding: true, error: msg }
  }
}

/**
 * Uploads company logo to the public 'company-logos' storage bucket.
 */
export async function uploadCompanyLogo(ownerId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png'
  const fileName = `${Date.now()}_logo.${fileExt}`
  const filePath = `${ownerId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('company-logos')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
    })

  if (uploadError) {
    throw new Error(`Logo upload failed: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from('company-logos').getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Uploads company document (Certificate or PAN) to 'company-documents' storage bucket.
 */
export async function uploadCompanyDocument(
  ownerId: string,
  file: File,
  docType: 'certificate' | 'pan_card'
): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'pdf'
  const fileName = `${docType}_${Date.now()}.${fileExt}`
  const filePath = `${ownerId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('company-documents')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
    })

  if (uploadError) {
    throw new Error(`${docType} upload failed: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from('company-documents').getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Inserts / updates the company record and updates user_profiles.
 */
export async function saveCompanyProfile(ownerId: string, data: CompanyProfileData): Promise<void> {
  // 1. Upload Logo if provided
  let logoUrl: string | null = null
  if (data.companyLogo) {
    logoUrl = await uploadCompanyLogo(ownerId, data.companyLogo)
  }

  // 2. Upload Certificate
  if (!data.certificateFile) {
    throw new Error('Please attach your MSME or MCA registration document.')
  }
  const certificateUrl = await uploadCompanyDocument(ownerId, data.certificateFile, 'certificate')

  // 3. Upload PAN doc if provided, or use PAN string as fallback
  let panCardLink: string = data.companyPan
  if (data.panFile) {
    panCardLink = await uploadCompanyDocument(ownerId, data.panFile, 'pan_card')
  }

  // 4. Upsert into companies table
  const companyPayload = {
    owner_id: ownerId,
    name: data.companyName.trim(),
    website: data.website.trim(),
    email: data.email.trim(),
    hr_contact_email: data.hrEmail.trim(),
    size: data.companySize, // must be '1-50' | '51-200' | '201-1000' | '1000+'
    description: data.description.trim(),
    linkedin_url: data.linkedinUrl.trim(),
    logo_url: logoUrl,
    is_draft: false,
    is_profile_complete: true,
    establishment_year: parseInt(data.establishmentYear, 10),
    office_address: data.officeAddress.trim(),
    gst_number: data.gstNumber.trim() || null,
    certificate_link: certificateUrl,
    certificate_type: data.certificateType || 'MSME', // 'MSME' | 'MCA'
    pan_card_link: panCardLink,
    updated_at: new Date().toISOString(),
  }

  const { error: companyError } = await supabase
    .from('companies')
    .upsert(companyPayload, { onConflict: 'owner_id' })

  if (companyError) {
    throw new Error(`Failed to save company details: ${companyError.message}`)
  }

  // 5. Upsert into user_profiles table
  const profilePayload = {
    id: ownerId,
    role: 'company',
    onboarding_complete: true,
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(profilePayload, { onConflict: 'id' })

  if (profileError) {
    throw new Error(`Failed to update profile status: ${profileError.message}`)
  }
}
