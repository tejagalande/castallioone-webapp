import { useState, useEffect, useCallback } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type UserRole = 'talent' | 'employers'

export interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signInWithGoogle: (role?: UserRole) => Promise<void>
  signInWithLinkedIn: (role?: UserRole) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error: sessionError }) => {
      if (!mounted) return
      if (sessionError) {
        setError(sessionError.message)
      } else {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      }
      setLoading(false)
    })

    // Listen to auth state changes (login, logout, OAuth callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const getRedirectUrl = (role: UserRole = 'talent') => {
    let origin = window.location.origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (origin.startsWith('http://')) {
        origin = origin.replace('http://', 'https://')
      }
    }
    return `${origin}?role=${role}`
  }

  const signInWithGoogle = useCallback(async (role: UserRole = 'talent') => {
    setError(null)
    localStorage.setItem('castallio_signup_role', role)
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(role),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (signInError) {
        throw signInError
      }
    } catch (err: unknown) {
      const authErr = err as AuthError
      const errorMessage = authErr.message || 'Failed to initiate Google sign in.'
      setError(errorMessage)
      console.error('Google Sign-In Error:', errorMessage)
    }
  }, [])

  const signInWithLinkedIn = useCallback(async (role: UserRole = 'talent') => {
    setError(null)
    localStorage.setItem('castallio_signup_role', role)
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: getRedirectUrl(role),
        },
      })

      if (signInError) {
        throw signInError
      }
    } catch (err: unknown) {
      const authErr = err as AuthError
      const errorMessage = authErr.message || 'Failed to initiate LinkedIn sign in.'
      setError(errorMessage)
      console.error('LinkedIn Sign-In Error:', errorMessage)
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
    } catch (err: unknown) {
      const authErr = err as AuthError
      const errorMessage = authErr.message || 'Failed to sign out.'
      setError(errorMessage)
      console.error('Sign Out Error:', errorMessage)
    } finally {
      setUser(null)
      setSession(null)
      try {
        localStorage.removeItem('castallio_enterprise_profile_completed')
        localStorage.removeItem('castallio_enterprise_profile')
        localStorage.removeItem('castallio_oauth_intent')
        localStorage.removeItem('castallio_signup_provider')
        localStorage.removeItem('castallio_signup_role')
        sessionStorage.clear()
      } catch (storageErr) {
        console.warn('Storage cleanup notice:', storageErr)
      }
    }
  }, [])

  return {
    user,
    session,
    loading,
    error,
    signInWithGoogle,
    signInWithLinkedIn,
    signOut,
  }
}
