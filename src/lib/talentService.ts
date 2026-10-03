import { supabase } from './supabase'
import type { TalentProfileData } from '../hooks/useTalentProfileSetup'
import { generateCandidateEmbedding } from './candidateEmbeddingService'

export interface CheckTalentProfileResult {
  exists: boolean
  profile: Record<string, unknown> | null
  needsOnboarding: boolean
  completeness: number
  error?: string
}

/**
 * Checks whether user has completed talent onboarding.
 * Checks user_profiles table, student_profile table, and local storage fallback.
 */
export async function checkTalentProfile(userId?: string): Promise<CheckTalentProfileResult> {
  const localCompleted = localStorage.getItem('castallio_talent_profile_completed') === 'true'
  const localCompleteness = parseInt(localStorage.getItem('castallio_talent_profile_completeness') || '0', 10)

  if (!userId) {
    return {
      exists: localCompleted,
      profile: null,
      needsOnboarding: !localCompleted,
      completeness: localCompleteness || (localCompleted ? 100 : 0),
    }
  }

  try {
    // 1. Check user_profiles for onboarding flag
    const { data: userProfile, error: upError } = await supabase
      .from('user_profiles')
      .select('id, role, onboarding_complete, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (upError) {
      console.warn('user_profiles check notice:', upError.message)
    }

    // 2. Check student_profile
    const { data: studentProfile, error: spError } = await supabase
      .from('student_profile')
      .select('id, user_id, full_name, email, discipline, is_profile_complete, completeness_percentage')
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle()

    if (spError) {
      console.warn('student_profile check notice:', spError.message)
    }

    const isProfessional = userProfile?.role === 'professional'
    const hasCompletedFlag = 
      (isProfessional && userProfile?.onboarding_complete === true) || 
      studentProfile?.is_profile_complete === true ||
      localCompleted

    const hasBasicProfile = Boolean(studentProfile?.full_name && studentProfile?.discipline)

    const needsOnboarding = !hasCompletedFlag && !hasBasicProfile

    const completeness = 
      typeof studentProfile?.completeness_percentage === 'number'
        ? studentProfile.completeness_percentage
        : localCompleteness || (hasCompletedFlag ? 100 : 25)

    return {
      exists: Boolean((isProfessional && userProfile) || studentProfile || localCompleted),
      profile: (studentProfile || (isProfessional ? userProfile : null)) as Record<string, unknown> | null,
      needsOnboarding,
      completeness,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.warn('checkTalentProfile fallback triggered:', msg)
    return {
      exists: localCompleted,
      profile: null,
      needsOnboarding: !localCompleted,
      completeness: localCompleteness,
      error: msg,
    }
  }
}

/**
 * Uploads talent avatar image to public storage.
 * Falls back to base64 Data URL if storage bucket is not configured.
 */
export async function uploadTalentAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png'
  const fileName = `profile_${Date.now()}.${fileExt}`
  const filePath = `profiles/${userId}/${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('profile-picture')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      })

    if (!uploadError) {
      const { data } = supabase.storage.from('profile-picture').getPublicUrl(filePath)
      return data.publicUrl
    }
  } catch {
    // Bucket might not exist, proceed to fallback
  }

  // Fallback: convert to base64 Data URL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads talent resume PDF file to storage bucket.
 * Falls back to local object URL or Data URL.
 */
export async function uploadTalentResume(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'pdf'
  const fileName = `resume_${Date.now()}.${fileExt}`
  const filePath = `profiles/${userId}/${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('profile-resume')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      })

    if (!uploadError) {
      const { data } = supabase.storage.from('profile-resume').getPublicUrl(filePath)
      return data.publicUrl
    }
  } catch {
    // Bucket might not exist
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads certificate PDF document.
 */
export async function uploadTalentCertificateDoc(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'pdf'
  const fileName = `cert_${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('profile-certificates')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      })

    if (!uploadError) {
      const { data } = supabase.storage.from('profile-certificates').getPublicUrl(filePath)
      return data.publicUrl
    }
  } catch {
    // Proceed to fallback
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

/**
 * Saves completed talent onboarding data into Supabase (student_profile,
 * student_skills, student_experience, user_profiles) and mirrors in localStorage.
 */
export async function saveTalentProfile(
  userId: string,
  data: TalentProfileData,
  completenessScore: number
): Promise<void> {
  // 1. Upload files if provided
  let avatarUrl = data.profileImagePreview || ''
  if (data.profileImage) {
    try {
      avatarUrl = await uploadTalentAvatar(userId, data.profileImage)
    } catch (e) {
      console.warn('Avatar upload fallback used:', e)
    }
  }

  let resumeUrl = data.resumeFileName ? `resume-${data.resumeFileName}` : ''
  if (data.resumeFile) {
    try {
      resumeUrl = await uploadTalentResume(userId, data.resumeFile)
    } catch (e) {
      console.warn('Resume upload fallback used:', e)
    }
  }

  // 2. Prepare payload for student_profile
  const preferredLocationsStr = data.preferredLocations.join(', ')

  const studentProfilePayload = {
    user_id: userId,
    full_name: data.fullName.trim(),
    bio: data.bio.trim(),
    email: data.email.trim(),
    phone: data.contactNumber.trim(),
    location: data.city.trim(),
    institution: data.instituteName.trim(),
    discipline: data.discipline.trim(),
    graduation_year: data.graduationYear.trim(),
    work_mode: data.workMode.trim(),
    preferred_location: preferredLocationsStr,
    willing_to_relocate: data.willingToRelocate === 'yes',
    availability: data.availability.trim(),
    employment_type: data.employmentType.trim(),
    notice_period: data.noticePeriod.trim(),
    expected_ctc: data.expectedCtc.trim(),
    resume_file_url: resumeUrl || null,
    portfolio_url: data.portfolioLink.trim() || null,
    linkedin_url: data.linkedinLink.trim() || null,
    profile_image_url: avatarUrl || null,
    is_profile_complete: true,
    completeness_percentage: completenessScore,
    updated_at: new Date().toISOString(),
  }

  // Upsert student_profile
  try {
    const { data: upsertedStudent, error: studentError } = await supabase
      .from('student_profile')
      .upsert(studentProfilePayload, { onConflict: 'user_id' })
      .select('id')
      .maybeSingle()

    if (studentError) {
      console.warn('Upsert student_profile notice:', studentError.message)
    }

    const studentId = upsertedStudent?.id || userId

    // 3. Save Skills (Core Software, Technical, Soft Skills)
    const combinedSkills = [
      ...data.coreSoftware.map((s) => ({ skill_name: s, category: 'core_software' })),
      ...data.technicalSkills.map((s) => ({ skill_name: s, category: 'technical' })),
      ...data.softSkills.map((s) => ({ skill_name: s, category: 'soft_skill' })),
    ]

    if (data.specificSkill.trim()) {
      combinedSkills.unshift({ skill_name: data.specificSkill.trim(), category: 'primary_specialization' })
    }

    if (combinedSkills.length > 0) {
      const { error: skillErr } = await supabase
        .from('student_skills')
        .upsert(
          {
            student_id: studentId,
            skills: combinedSkills,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'student_id' }
        )
      if (skillErr) console.warn('Skills upsert notice:', skillErr.message)
    }

    // 4. Save Experiences if not fresher
    if (!data.isFresher && data.experiences.length > 0) {
      const expRows = data.experiences
        .filter((exp) => exp.role.trim() || exp.organisation.trim())
        .map((exp) => ({
          student_id: studentId,
          role_title: exp.role.trim() || 'AEC Specialist',
          organization_name: exp.organisation.trim() || 'Organization',
          start_date: exp.startDate || null,
          end_date: exp.currentlyWorking ? null : exp.endDate || null,
          contributions: exp.contribution.trim(),
        }))

      if (expRows.length > 0) {
        const { error: expErr } = await supabase
          .from('student_experience')
          .insert(expRows)
        if (expErr) console.warn('Experience insert notice:', expErr.message)
      }
    }

    // 5. Update user_profiles onboarding_complete = true
    const { error: profErr } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          role: 'professional',
          onboarding_complete: true,
        },
        { onConflict: 'id' }
      )
    if (profErr) console.warn('user_profiles update notice:', profErr.message)

    // 6. Trigger 1536-dim candidate embedding & search_text generation (parity with mobile app)
    const embeddingTargetId = upsertedStudent?.id || studentId
    if (embeddingTargetId) {
      generateCandidateEmbedding(embeddingTargetId).catch((embErr) => {
        console.warn('[TalentService] Edge function genarte-candidate-embedding notice:', embErr)
      })
    }
  } catch (err) {
    console.warn('Supabase profile persistence encountered error, local cache active:', err)
  }

  // 6. Cache into localStorage for zero-latency instant offline restoration
  const localCache = {
    ...data,
    profileImage: null, // exclude binary file objects from JSON
    resumeFile: null,
    certificates: data.certificates.map((c) => ({ ...c, file: null })),
    profileImagePreview: avatarUrl,
    resumeFileUrl: resumeUrl,
    completenessScore,
    savedAt: new Date().toISOString(),
  }

  localStorage.setItem('castallio_talent_profile_completed', 'true')
  localStorage.setItem('castallio_talent_profile_completeness', String(completenessScore))
  localStorage.setItem('castallio_talent_profile_data', JSON.stringify(localCache))
}
