import { useState, useEffect, useCallback } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { loginOneSignal, logoutOneSignal } from '../lib/onesignal'

export type UserRole = 'talent' | 'employers'

export interface SignUpResult {
  user: User | null
  session: Session | null
  needsEmailVerification: boolean
  error?: string
}

export interface SignInResult {
  user: User | null
  session: Session | null
  error?: string
}

export interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  setError: (err: string | null) => void
  clearError: () => void
  signUpWithEmail: (email: string, password: string, fullName: string, role?: UserRole) => Promise<SignUpResult>
  signInWithPassword: (email: string, password: string, role?: UserRole) => Promise<SignInResult>
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: (role?: UserRole) => Promise<void>
  signInWithLinkedIn: (role?: UserRole) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

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
        if (currentSession?.user) {
          void loginOneSignal(currentSession.user.id, localStorage.getItem('castallio_user_role'))
        }
      }
      setLoading(false)
    })

    // Listen to auth state changes (login, logout, OAuth callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
      if (event === 'SIGNED_IN' && newSession?.user) {
        void loginOneSignal(newSession.user.id, localStorage.getItem('castallio_user_role'))
      } else if (event === 'SIGNED_OUT') {
        void logoutOneSignal()
      }
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

  const getResetPasswordUrl = () => {
    let origin = window.location.origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (origin.startsWith('http://')) {
        origin = origin.replace('http://', 'https://')
      }
    }
    return `${origin}/reset-password`
  }

  const signInWithGoogle = useCallback(async (role: UserRole = 'talent') => {
    setError(null)
    localStorage.setItem('castallio_signup_role', role)
    localStorage.setItem('castallio_user_role', role)
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
    localStorage.setItem('castallio_user_role', role)
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

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: UserRole = 'talent'
    ): Promise<SignUpResult> => {
      setError(null)
      localStorage.setItem('castallio_signup_role', role)
      localStorage.setItem('castallio_user_role', role)
      const dbRole = role === 'employers' ? 'company' : 'professional'

      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              name: fullName.trim(),
              role: dbRole,
              user_role: role,
            },
            emailRedirectTo: getRedirectUrl(role),
          },
        })

        if (signUpError) {
          throw signUpError
        }

        // Supabase returns user and optionally session
        // If identities is empty array, it indicates the user already exists (Supabase security feature)
        if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
          const userExistsMsg = 'An account with this email address already exists. Please sign in.'
          setError(userExistsMsg)
          return {
            user: null,
            session: null,
            needsEmailVerification: false,
            error: userExistsMsg,
          }
        }

        const needsEmailVerification = !data?.session && Boolean(data?.user)

        if (data?.session) {
          setSession(data.session)
          setUser(data.user)
        }

        return {
          user: data?.user ?? null,
          session: data?.session ?? null,
          needsEmailVerification,
        }
      } catch (err: unknown) {
        const authErr = err as AuthError
        const errorMessage = authErr.message || 'Failed to create account.'
        setError(errorMessage)
        console.error('Email Sign-Up Error:', errorMessage)
        return {
          user: null,
          session: null,
          needsEmailVerification: false,
          error: errorMessage,
        }
      }
    },
    []
  )

  const signInWithPassword = useCallback(
    async (email: string, password: string, role: UserRole = 'talent'): Promise<SignInResult> => {
      setError(null)
      localStorage.setItem('castallio_user_role', role)
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (signInError) throw signInError
        setSession(data.session)
        setUser(data.user)
        return { user: data.user, session: data.session }
      } catch (err: unknown) {
        const authErr = err as AuthError
        const errorMessage = authErr.message || 'Invalid email or password.'
        setError(errorMessage)
        console.error('Password Sign-In Error:', errorMessage)
        return { user: null, session: null, error: errorMessage }
      }
    },
    []
  )

  const resendVerificationEmail = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })
      if (resendError) throw resendError
      return { success: true }
    } catch (err: unknown) {
      const authErr = err as AuthError
      const errorMessage = authErr.message || 'Failed to resend confirmation email.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const sendPasswordResetEmail = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getResetPasswordUrl(),
      })
      if (resetError) throw resetError
      return { success: true }
    } catch (err: unknown) {
      const authErr = err as AuthError
      const errorMessage = authErr.message || 'Failed to send password reset email.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const updatePassword = useCallback(async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) throw updateError
      return { success: true }
    } catch (err: unknown) {
      const authErr = err as AuthError
      const errorMessage = authErr.message || 'Failed to update password.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
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
        localStorage.removeItem('castallio_user_role')
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
    setError,
    clearError,
    signUpWithEmail,
    signInWithPassword,
    resendVerificationEmail,
    sendPasswordResetEmail,
    updatePassword,
    signInWithGoogle,
    signInWithLinkedIn,
    signOut,
  }
}
