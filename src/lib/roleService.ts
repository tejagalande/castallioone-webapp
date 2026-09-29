import { supabase } from './supabase'

export type UserRole = 'talent' | 'employers'

/**
 * Resolves the role of the user with multiple levels of verification:
 * 1. URL search param (?role=talent or ?role=employers)
 * 2. Supabase user_profiles table (role: 'professional' -> 'talent', 'company' -> 'employers')
 * 3. Supabase companies table (owner_id) -> 'employers'
 * 4. Supabase student_profile table (user_id / id) -> 'talent'
 * 5. user.user_metadata?.role
 * 6. localStorage cached keys ('castallio_user_role', 'castallio_signup_role', profile cache flags)
 * 7. Default fallback: 'talent'
 */
export async function resolveUserRole(userId?: string, userMetadataRole?: string): Promise<UserRole> {
  // 1. Check URL query param first (e.g. from OAuth redirect or direct link)
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const urlRole = urlParams.get('role')
    if (urlRole === 'talent' || urlRole === 'employers') {
      localStorage.setItem('castallio_user_role', urlRole)
      return urlRole
    }
  } catch (e) {
    console.warn('URL params check skipped:', e)
  }

  // 2. Check Supabase database if userId is provided (source of truth)
  if (userId) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (profile?.role === 'company') {
        localStorage.setItem('castallio_user_role', 'employers')
        return 'employers'
      }
      if (profile?.role === 'professional') {
        localStorage.setItem('castallio_user_role', 'talent')
        return 'talent'
      }

      // Check companies table
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle()

      if (company) {
        localStorage.setItem('castallio_user_role', 'employers')
        return 'employers'
      }

      // Check student_profile table
      const { data: student } = await supabase
        .from('student_profile')
        .select('id')
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        .maybeSingle()

      if (student) {
        localStorage.setItem('castallio_user_role', 'talent')
        return 'talent'
      }
    } catch (err) {
      console.warn('Error querying role from Supabase:', err)
    }
  }

  // 3. Check user_metadata
  if (userMetadataRole === 'employers' || userMetadataRole === 'company') {
    localStorage.setItem('castallio_user_role', 'employers')
    return 'employers'
  }
  if (userMetadataRole === 'talent' || userMetadataRole === 'professional') {
    localStorage.setItem('castallio_user_role', 'talent')
    return 'talent'
  }

  // 4. Check localStorage cache
  try {
    const cachedRole = localStorage.getItem('castallio_user_role')
    if (cachedRole === 'talent' || cachedRole === 'employers') {
      return cachedRole
    }

    const signupRole = localStorage.getItem('castallio_signup_role')
    if (signupRole === 'talent' || signupRole === 'employers') {
      return signupRole
    }

    if (
      localStorage.getItem('castallio_enterprise_profile_completed') === 'true' ||
      localStorage.getItem('castallio_enterprise_profile')
    ) {
      localStorage.setItem('castallio_user_role', 'employers')
      return 'employers'
    }

    if (
      localStorage.getItem('castallio_talent_profile_completed') === 'true' ||
      localStorage.getItem('castallio_talent_profile_data')
    ) {
      localStorage.setItem('castallio_user_role', 'talent')
      return 'talent'
    }
  } catch (storageErr) {
    console.warn('LocalStorage role check warning:', storageErr)
  }

  // 5. Default fallback to 'talent'
  return 'talent'
}

export function setUserRole(role: UserRole): void {
  try {
    localStorage.setItem('castallio_user_role', role)
  } catch (err) {
    console.warn('Failed to set user role in localStorage:', err)
  }
}

export function clearUserRole(): void {
  try {
    localStorage.removeItem('castallio_user_role')
    localStorage.removeItem('castallio_signup_role')
  } catch (err) {
    console.warn('Failed to clear user role from localStorage:', err)
  }
}
