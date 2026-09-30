import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import './ResetPassword.css'

export function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword, error: authError, clearError } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Recovery session status
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null)

  useEffect(() => {
    clearError()

    // 1. Check if Supabase session is currently established or recovery hash is present
    const checkSession = async () => {
      const hash = window.location.hash
      const isRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token')

      const { data: { session } } = await supabase.auth.getSession()

      if (session || isRecoveryHash) {
        setHasRecoverySession(true)
      } else {
        // Allow a small grace period for Supabase to parse the URL hash
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          setHasRecoverySession(Boolean(retrySession || window.location.hash.includes('access_token')))
        }, 1200)
      }
    }

    checkSession()

    // 2. Listen to recovery auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setHasRecoverySession(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [clearError])

  // Redirect countdown after successful reset
  useEffect(() => {
    if (!isSuccess) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/signin', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isSuccess, navigate])

  // Password requirements calculation
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password)

  const getPasswordStrength = (): number => {
    let score = 0
    if (hasMinLength) score++
    if (hasUpperCase) score++
    if (hasNumber && /[a-z]/.test(password)) score++
    if (hasSpecialChar) score++
    return score
  }

  const passwordStrength = getPasswordStrength()

  const strengthColors: Record<number, string> = {
    0: '#e8e8ea',
    1: '#ef4444',
    2: '#f59e0b',
    3: '#3b82f6',
    4: '#22c55e',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError(null)

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please re-enter.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await updatePassword(password)
      if (res.success) {
        setIsSuccess(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="reset-page">
      <div className="reset-grid-bg" />

      {/* Brand Sidebar */}
      <aside className="reset-sidebar">
        <div className="reset-sidebar-glow" />

        <div className="reset-sidebar-content">
          <div className="reset-sidebar-brand">
            <img src="/app_icon.png" alt="Castallio One" className="reset-sidebar-brand-icon" />
            <span>Castallio One</span>
          </div>

          <h1 className="reset-sidebar-heading">
            Restore
            <br />
            Access
            <br />
            Securely
          </h1>

          <p className="reset-sidebar-description">
            Maintain full security and uninterrupted access to your AEC network and professional portfolio.
          </p>
        </div>

        <div className="sidebar-illustration">
          <div className="illustration-container">
            <img
              src="/wireframe-building.svg"
              alt="Technical Building Illustration"
              className="illustration-img"
            />
            <div className="illustration-overlay" />
          </div>
        </div>
      </aside>

      {/* Main Form Content */}
      <main className="reset-main">
        <div className="reset-card">
          <div className="card-highlight" />

          {isSuccess ? (
            <div className="reset-success-box">
              <div className="reset-success-icon-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className="reset-card-title">Password Updated!</h2>
              <p className="reset-card-subtitle" style={{ textAlign: 'center' }}>
                Your Castallio One account password has been successfully reset.
              </p>

              <p className="reset-redirect-note">
                Redirecting to Sign In in {countdown} seconds...
              </p>

              <button
                type="button"
                className="reset-submit-btn"
                style={{ marginTop: '20px' }}
                onClick={() => navigate('/signin', { replace: true })}
              >
                Sign In Now →
              </button>
            </div>
          ) : hasRecoverySession === false ? (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  margin: '0 auto 16px',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <h2 className="reset-card-title">Link Expired or Invalid</h2>
              <p className="reset-card-subtitle" style={{ marginBottom: '24px' }}>
                This password recovery link has either expired or already been used. Please request a new recovery link from the Sign In page.
              </p>

              <Link to="/signin" className="reset-submit-btn" style={{ textDecoration: 'none' }}>
                Return to Sign In
              </Link>
            </div>
          ) : (
            <>
              <header className="reset-card-header">
                <span className="reset-badge">Security Recovery</span>
                <h2 className="reset-card-title">Set New Password</h2>
                <p className="reset-card-subtitle">
                  Create a new, strong password to regain access to your account.
                </p>
              </header>

              {(authError || validationError) && (
                <div className="auth-error-banner" role="alert" style={{ marginBottom: '16px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{validationError || authError}</span>
                </div>
              )}

              <form className="reset-form" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="reset-field">
                  <label htmlFor="new-password">New Password</label>
                  <div className="reset-input-wrapper">
                    <svg
                      className="reset-input-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (validationError) setValidationError(null)
                        if (authError) clearError()
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="reset-pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="password-strength" aria-label={`Password strength: ${passwordStrength} of 4`}>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`strength-segment ${i < passwordStrength ? 'filled' : ''}`}
                        style={{
                          background:
                            i < passwordStrength
                              ? strengthColors[passwordStrength]
                              : '#e8e8ea',
                        }}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div className="password-requirements">
                    <div className={`requirement-item ${hasMinLength ? 'met' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {hasMinLength ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="6" />}
                      </svg>
                      <span>8+ characters</span>
                    </div>

                    <div className={`requirement-item ${hasUpperCase ? 'met' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {hasUpperCase ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="6" />}
                      </svg>
                      <span>Uppercase letter</span>
                    </div>

                    <div className={`requirement-item ${hasNumber ? 'met' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {hasNumber ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="6" />}
                      </svg>
                      <span>At least 1 number</span>
                    </div>

                    <div className={`requirement-item ${hasSpecialChar ? 'met' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {hasSpecialChar ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="6" />}
                      </svg>
                      <span>Special character</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="reset-field">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="reset-input-wrapper">
                    <svg
                      className="reset-input-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (validationError) setValidationError(null)
                        if (authError) clearError()
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="reset-pwd-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="reset-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>

              <footer style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/signin" style={{ color: '#00418f', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  ← Back to Sign In
                </Link>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ResetPassword
