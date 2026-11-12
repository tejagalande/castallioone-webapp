import { supabase } from './supabase'
import { logoutOneSignal } from './onesignal'

export type AccountRoleType = 'talent' | 'company'

/**
 * Recursively or flatly purges files inside a specific folder of a Supabase storage bucket.
 */
async function purgeStorageFolder(bucket: string, folder: string): Promise<void> {
  try {
    const { data: files, error: listError } = await supabase.storage.from(bucket).list(folder)
    if (listError || !files || files.length === 0) {
      return
    }

    const pathsToDelete = files
      .filter((item) => item.name && item.id) // Only real items
      .map((item) => (folder ? `${folder}/${item.name}` : item.name))

    if (pathsToDelete.length > 0) {
      await supabase.storage.from(bucket).remove(pathsToDelete)
    }
  } catch (err) {
    console.warn(`Storage cleanup notice for bucket '${bucket}' at '${folder}':`, err)
  }
}

/**
 * Cleans up binary assets stored in Supabase Storage for the user before row deletion.
 */
export async function purgeUserStorageAssets(userId: string, role: AccountRoleType): Promise<void> {
  if (!userId) return

  if (role === 'talent') {
    await Promise.allSettled([
      purgeStorageFolder('profile-picture', userId),
      purgeStorageFolder('profile-resume', `profiles/${userId}`),
      purgeStorageFolder('profile-resume', userId),
      purgeStorageFolder('profile-certificates', userId),
    ])
  } else {
    await Promise.allSettled([
      purgeStorageFolder('company-logos', userId),
      purgeStorageFolder('company-documents', userId),
    ])
  }
}

/**
 * Permanently deletes the user's account and associated data:
 * 1. Purges user files in storage buckets
 * 2. Unsubscribes and logs out from OneSignal push notification system
 * 3. Calls the database atomic RPC `web_delete_account`
 * 4. Cleanses browser storage (localStorage, sessionStorage)
 * 5. Signs out the Supabase auth session
 */
export async function deleteUserAccount(userId: string, role: AccountRoleType): Promise<void> {
  if (!userId) {
    throw new Error('User identifier is missing for account deletion.')
  }

  // 1. Storage bucket cleanup
  try {
    await purgeUserStorageAssets(userId, role)
  } catch (storageErr) {
    console.warn('Storage purge warning (continuing with DB deletion):', storageErr)
  }

  // 2. Unsubscribe OneSignal notifications
  try {
    await logoutOneSignal()
  } catch (pushErr) {
    console.warn('OneSignal logout notice:', pushErr)
  }

  // 3. Call the server-side RPC to delete all database records and auth.users
  const { error: rpcError } = await supabase.rpc('web_delete_account')

  if (rpcError) {
    console.error('Account deletion RPC error:', rpcError)
    throw new Error(rpcError.message || 'Failed to delete account from server.')
  }

  // 4. Clean browser storage
  try {
    localStorage.removeItem('castallio_enterprise_profile_completed')
    localStorage.removeItem('castallio_enterprise_profile')
    localStorage.removeItem('castallio_oauth_intent')
    localStorage.removeItem('castallio_signup_provider')
    localStorage.removeItem('castallio_signup_role')
    localStorage.removeItem('castallio_user_role')
    localStorage.removeItem('castallio_talent_profile_completed')
    localStorage.removeItem('castallio_talent_profile_completeness')
    localStorage.removeItem('castallio_talent_profile_data')
    sessionStorage.clear()
  } catch (storageErr) {
    console.warn('Storage purge notice:', storageErr)
  }

  // 5. Sign out auth session
  try {
    await supabase.auth.signOut()
  } catch (signOutErr) {
    console.warn('Auth sign out notice:', signOutErr)
  }
}
