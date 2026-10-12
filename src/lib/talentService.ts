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
      .select('*')
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .limit(1)
      .maybeSingle()

    if (spError) {
      console.warn('student_profile check notice:', spError.message)
    }

    const isProfessional = userProfile?.role === 'professional'
    const hasCompletedFlag =
      (isProfessional && userProfile?.onboarding_complete === true) ||
      localCompleted

    const hasBasicProfile = Boolean(studentProfile?.full_name && studentProfile?.discipline)

    const needsOnboarding = !hasCompletedFlag && !hasBasicProfile

    const completeness = studentProfile
      ? computeStudentRowCompleteness(studentProfile as Record<string, unknown>)
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
 * Computes profile completeness (0-100) from a raw student_profile row.
 * Used as a fallback when completeness_percentage is null/0 in the DB.
 */
export function computeStudentRowCompleteness(row: Record<string, unknown> | null | undefined): number {
  if (!row) return 0
  const pl = row.preferred_location
  const fields: unknown[] = [
    row.profile_image_url,
    row.full_name,
    row.email,
    row.phone,
    row.location,
    row.institution,
    row.discipline,
    row.graduation_year,
    row.bio,
    row.work_mode,
    Array.isArray(pl) ? pl.length > 0 : pl,
    row.availability,
    row.employment_type,
    row.notice_period,
    row.resume_file_url,
    row.expected_ctc,
    row.linkedin_url || row.portfolio_url,
  ]
  const filled = fields.filter((v) => (typeof v === 'string' ? v.trim().length > 0 : Boolean(v))).length
  return Math.round((filled / fields.length) * 100)
}

/**
 * Fetches a previously saved talent profile from Supabase and maps it to
 * the onboarding form shape. Returns null when no row exists.
 */
export async function fetchSavedTalentProfile(
  userId: string
): Promise<Partial<TalentProfileData> | null> {
  const { data: sp, error } = await supabase
    .from('student_profile')
    .select('*')
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .limit(1)
    .maybeSingle()

  if (error || !sp) {
    if (error) console.warn('fetchSavedTalentProfile notice:', error.message)
    return null
  }

  const str = (v: unknown) => (v === null || v === undefined ? '' : String(v))

  const locRaw = sp.preferred_location
  const preferredLocations: string[] = Array.isArray(locRaw)
    ? locRaw.map(String)
    : typeof locRaw === 'string'
    ? locRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
    : []

  const reloc = String(sp.relocation_preference ?? '').toLowerCase()
  const relocValue: TalentProfileData['willingToRelocate'] =
    reloc.startsWith('yes') ? 'yes' : reloc.startsWith('open') ? 'open' : reloc.startsWith('no') ? 'no' : ''

  const partial: Partial<TalentProfileData> = {
    profileImagePreview: str(sp.profile_image_url),
    fullName: str(sp.full_name),
    bio: str(sp.bio),
    email: str(sp.email),
    contactNumber: str(sp.phone),
    city: str(sp.location),
    instituteName: str(sp.institution),
    discipline: str(sp.discipline),
    graduationYear: str(sp.graduation_year),
    workMode: str(sp.work_mode),
    preferredLocations,
    willingToRelocate: relocValue,
    availability: str(sp.availability),
    employmentType: str(sp.employment_type),
    noticePeriod: str(sp.notice_period),
    expectedCtc: str(sp.expected_ctc).replace(/^₹/, ''),
    resumeFileName: sp.resume_file_url ? decodeURIComponent(String(sp.resume_file_url).split('/').pop() || 'resume.pdf') : '',
    portfolioLink: str(sp.portfolio_url),
    linkedinLink: str(sp.linkedin_url),
  }

  // Skills
  const studentId: string = sp.id
  const { data: skillsRow } = await supabase
    .from('student_skills')
    .select('skills')
    .eq('student_id', studentId)
    .maybeSingle()

  if (skillsRow && Array.isArray(skillsRow.skills)) {
    const core: string[] = []
    const tech: string[] = []
    const soft: string[] = []
    let specific = ''
    for (const item of skillsRow.skills as Array<string | { skill_name?: string; category?: string }>) {
      const name = typeof item === 'string' ? item : item.skill_name || ''
      const cat = typeof item === 'string' ? '' : item.category || ''
      if (!name) continue
      if (cat === 'primary_specialization') specific = name
      else if (cat === 'core_software') core.push(name)
      else if (cat === 'technical') tech.push(name)
      else if (cat === 'soft_skill') soft.push(name)
    }
    partial.specificSkill = specific
    partial.coreSoftware = core
    partial.technicalSkills = tech
    partial.softSkills = soft
  }

  // Experience
  const { data: expRows } = await supabase
    .from('student_experience')
    .select('*')
    .eq('student_id', studentId)

  if (expRows && expRows.length > 0) {
    partial.isFresher = false
    partial.experiences = expRows.map((r, i) => ({
      id: `exp-db-${r.id ?? i}`,
      role: str(r.role_title),
      organisation: str(r.organization_name),
      startDate: str(r.start_date),
      endDate: str(r.end_date),
      currentlyWorking: !r.end_date,
      contribution: str(r.contributions),
    }))
  } else if (skillsRow) {
    partial.isFresher = true
  }

  return partial
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

  // 2. Prepare payload for student_profile (must match real table columns)
  const relocationLabel =
    data.willingToRelocate === 'yes' ? 'Yes' : data.willingToRelocate === 'open' ? 'Open to Discuss' : data.willingToRelocate === 'no' ? 'No' : null
  const phoneDigits = data.contactNumber.replace(/\D/g, '')

  const studentProfilePayload = {
    user_id: userId,
    full_name: data.fullName.trim(),
    bio: data.bio.trim(),
    email: data.email.trim(),
    phone: phoneDigits ? Number(phoneDigits) : null,
    location: data.city.trim(),
    institution: data.instituteName.trim(),
    discipline: data.discipline.trim(),
    graduation_year: data.graduationYear.trim(),
    work_mode: data.workMode.trim(),
    preferred_location: data.preferredLocations,
    relocation_preference: relocationLabel,
    availability: data.availability.trim(),
    employment_type: data.employmentType.trim(),
    notice_period: data.noticePeriod.trim(),
    expected_ctc: data.expectedCtc.trim(),
    resume_file_url: resumeUrl || null,
    portfolio_url: data.portfolioLink.trim() || null,
    linkedin_url: data.linkedinLink.trim() || null,
    profile_image_url: avatarUrl || null,
    updated_at: new Date().toISOString(),
  }

  // Update existing student_profile or insert a new one
  try {
    const { data: existing } = await supabase
      .from('student_profile')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()

    const { data: upsertedStudent, error: studentError } = existing?.id
      ? await supabase
          .from('student_profile')
          .update(studentProfilePayload)
          .eq('id', existing.id)
          .select('id')
          .maybeSingle()
      : await supabase
          .from('student_profile')
          .insert(studentProfilePayload)
          .select('id')
          .maybeSingle()

    if (studentError) {
      console.warn('Save student_profile notice:', studentError.message)
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
        await supabase.from('student_experience').delete().eq('student_id', studentId)
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
