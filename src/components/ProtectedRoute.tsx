import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { checkUserProfile } from '../lib/companyService'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'employers' | 'talent'
  requireCompletedProfile?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireCompletedProfile = false,
}) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [profileChecking, setProfileChecking] = useState<boolean>(requireCompletedProfile)
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true

    const verifyProfile = async () => {
      if (!user || !requireCompletedProfile) {
        if (isMounted) setProfileChecking(false)
        return
      }

      try {
        const { exists, needsOnboarding } = await checkUserProfile(user.id)
        if (!isMounted) return
        setNeedsProfileSetup(!exists || needsOnboarding)
      } catch (err) {
        console.error('Failed to verify profile status:', err)
      } finally {
        if (isMounted) {
          setProfileChecking(false)
        }
      }
    }

    if (!loading) {
      verifyProfile()
    }

    return () => {
      isMounted = false
    }
  }, [user, loading, requireCompletedProfile])

  if (loading || profileChecking) {
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
            Verifying authentication session & permissions...
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // Check role if specified
  if (requiredRole) {
    const urlParams = new URLSearchParams(window.location.search)
    const urlRole = urlParams.get('role')
    const userRole = (urlRole || user.user_metadata?.role || localStorage.getItem('castallio_signup_role') || 'employers') as
      | 'talent'
      | 'employers'

    if (userRole !== requiredRole) {
      return <Navigate to={userRole === 'employers' ? '/employer' : '/talent'} replace />
    }
  }

  // Check profile completion for employers
  if (requireCompletedProfile && needsProfileSetup) {
    return <Navigate to="/company-setup" replace />
  }

  return <>{children}</>
}
