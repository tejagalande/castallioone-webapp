import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { checkUserProfile } from '../lib/companyService'

interface RootRedirectProps {
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void
}

export const RootRedirect: React.FC<RootRedirectProps> = ({ showToast }) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!user) {
      navigate('/signin', { replace: true })
      return
    }

    let isMounted = true

    const resolveDestination = async () => {
      const oauthIntent = localStorage.getItem('castallio_oauth_intent')
      const signupProvider = localStorage.getItem('castallio_signup_provider')
      const isLinkedIn = user.app_metadata?.provider?.includes('linkedin') || signupProvider === 'linkedin'
      const isLinkedInSignUp = oauthIntent === 'signup' && isLinkedIn

      if (isLinkedInSignUp) {
        showToast?.('LinkedIn authentication verified! Please set up your company profile.', 'success', 'Welcome')
        navigate('/company-setup', { replace: true })
        return
      }

      const urlParams = new URLSearchParams(window.location.search)
      const urlRole = urlParams.get('role')
      const role = (urlRole || user.user_metadata?.role || localStorage.getItem('castallio_signup_role') || 'employers') as
        | 'talent'
        | 'employers'

      if (role === 'employers') {
        const { exists, needsOnboarding } = await checkUserProfile(user.id)
        if (!isMounted) return

        if (!exists || needsOnboarding) {
          showToast?.('Please complete your enterprise company profile.', 'info', 'Verification Required')
          navigate('/company-setup', { replace: true })
        } else {
          navigate('/employer', { replace: true })
        }
      } else {
        if (!isMounted) return
        navigate('/talent', { replace: true })
      }
    }

    resolveDestination()

    return () => {
      isMounted = false
    }
  }, [user, loading, navigate, showToast])

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fc',
        fontFamily: "'Manrope', sans-serif",
        color: '#1a1c1e',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            marginBottom: '8px',
            color: '#00418f',
          }}
        >
          Castallio One
        </div>
        <div style={{ fontSize: '13px', color: '#727784' }}>
          Directing you to your workspace...
        </div>
      </div>
    </div>
  )
}
