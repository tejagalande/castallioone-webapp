import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, type UserRole } from '../hooks/useAuth'
import './SignUp.css'

type AuthTab = 'talent' | 'employers'

interface SignUpProps {
  onNavigateToSignIn?: () => void
  onSignUpSuccess?: (type: 'talent' | 'employers') => void
}

interface ValidationErrors {
  fullName?: string
  email?: string
  password?: string
}

function SignUp({ onNavigateToSignIn, onSignUpSuccess }: SignUpProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AuthTab>('talent')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Loading & submission states
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)

  // Verification state (when Supabase requires email confirmation)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendCooldown, setResendCooldown] = useState(0)

  const {
    signUpWithEmail,
    resendVerificationEmail,
    signInWithGoogle,
    signInWithLinkedIn,
    error: authError,
    clearError,
  } = useAuth()

  // Cooldown countdown effect for resending verification email
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

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

  const getStrengthLabel = (score: number): string => {
    switch (score) {
      case 1:
        return 'Weak'
      case 2:
        return 'Fair'
      case 3:
        return 'Good'
      case 4:
        return 'Strong'
      default:
        return ''
    }
  }

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!fullName.trim()) {
      errors.fullName = activeTab === 'employers' ? 'Company contact name is required.' : 'Full name is required.'
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      errors.email = activeTab === 'employers' ? 'Work email is required.' : 'Professional email is required.'
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      errors.password = 'Password is required.'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleTabChange = (newTab: AuthTab) => {
    setActiveTab(newTab)
    clearError()
    setValidationErrors({})
    try {
      localStorage.setItem('castallio_user_role', newTab)
      localStorage.setItem('castallio_signup_role', newTab)
    } catch (e) {
      console.warn('Storage role update warning:', e)
    }
  }

  // Email & Password Sign Up Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    setIsEmailSubmitting(true)

    try {
      const result = await signUpWithEmail(email, password, fullName, activeTab as UserRole)

      if (result.needsEmailVerification) {
        setRegisteredEmail(email.trim())
        setEmailVerificationSent(true)
        setResendCooldown(30)
        return
      }

      if (result.session || result.user) {
        localStorage.setItem('castallio_user_role', activeTab)
        localStorage.setItem('castallio_signup_role', activeTab)

        if (onSignUpSuccess) {
          onSignUpSuccess(activeTab)
        } else {
          navigate(activeTab === 'employers' ? '/company-setup' : '/talent-setup')
        }
      }
    } finally {
      setIsEmailSubmitting(false)
    }
  }

  // Resend verification email handler
  const handleResendVerification = async () => {
    if (!registeredEmail || resendCooldown > 0) return
    setResendStatus('sending')

    const res = await resendVerificationEmail(registeredEmail)
    if (res.success) {
      setResendStatus('sent')
      setResendCooldown(60)
    } else {
      setResendStatus('error')
    }
  }

  // Google OAuth Handler
  const handleGoogleSignUp = async () => {
    try {
      clearError()
      setIsGoogleLoading(true)
      localStorage.setItem('castallio_oauth_intent', 'signup')
      localStorage.setItem('castallio_signup_role', activeTab)
      localStorage.setItem('castallio_user_role', activeTab)
      await signInWithGoogle(activeTab)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // LinkedIn OAuth Handler
  const handleLinkedInSignUp = async () => {
    try {
      clearError()
      setIsLinkedInLoading(true)
      localStorage.setItem('castallio_oauth_intent', 'signup')
      localStorage.setItem('castallio_signup_provider', 'linkedin')
      localStorage.setItem('castallio_signup_role', activeTab)
      localStorage.setItem('castallio_user_role', activeTab)
      await signInWithLinkedIn(activeTab)
    } finally {
      setIsLinkedInLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="blueprint-grid" />

      {/* Brand Sidebar (Desktop & Tablet) */}
      <aside className="signup-sidebar">
        <div className="sidebar-glow" />

        <div className="sidebar-content">
          <div className="sidebar-brand">
            <img src="/app_icon.png" alt="Castallio One" className="sidebar-brand-icon" />
            <span>Castallio One</span>
          </div>

          <h1 className="sidebar-heading">
            Join the
            <br />
            Precision
            <br />
            Network
          </h1>

          <p className="sidebar-description">
            Connect with the world's leading AEC talent and projects through our data-driven network.
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

      {/* Main Authentication Flow */}
      <main className="signup-main">
        <div className="signup-glow" />

        <div className="signup-card">
          <div className="card-highlight" />

          {/* Conditional View: Email Verification Notice or Registration Form */}
          {emailVerificationSent ? (
            <div className="verification-view">
              <div className="verification-icon-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>

              <h2 className="verification-title">Verify Your Email</h2>
              <p className="verification-desc">
                We've dispatched a confirmation link to:
                <br />
                <span className="verification-email-chip">{registeredEmail}</span>
                <br />
                <br />
                Please open your inbox and click the verification link to activate your account.
              </p>

              {resendStatus === 'sent' && (
                <div className="resend-feedback-success" role="status">
                  ✓ Verification email resent successfully!
                </div>
              )}

              {authError && (
                <div className="auth-error-banner" role="alert" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{authError}</span>
                </div>
              )}

              <div className="verification-actions">
                <button
                  type="button"
                  className="verification-resend-btn"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0 || resendStatus === 'sending'}
                >
                  {resendStatus === 'sending' ? (
                    <>
                      <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Sending link...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>

                <Link
                  to="/signin"
                  className="signup-btn"
                  style={{ textDecoration: 'none' }}
                  onClick={(e) => {
                    if (onNavigateToSignIn) {
                      e.preventDefault()
                      onNavigateToSignIn()
                    }
                  }}
                >
                  <span>Proceed to Sign In</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>

                <button
                  type="button"
                  className="back-to-signup-btn"
                  onClick={() => {
                    setEmailVerificationSent(false)
                    clearError()
                  }}
                >
                  Entered wrong email? Return to create account
                </button>
              </div>
            </div>
          ) : (
            <>
              <header className="card-header">
                <h2 className="card-title">Create Account</h2>
                <p className="card-subtitle">
                  Enter your credentials to construct your Castallio profile.
                </p>
              </header>

              {/* Persona Selector */}
              <div className="persona-toggle" role="group" aria-label="Account Type">
                <div
                  className="persona-slider"
                  style={{
                    transform:
                      activeTab === 'talent'
                        ? 'translateX(0)'
                        : 'translateX(100%)',
                  }}
                />
                <button
                  type="button"
                  className={`persona-btn ${activeTab === 'talent' ? 'active' : ''}`}
                  onClick={() => handleTabChange('talent')}
                >
                  Professional
                </button>
                <button
                  type="button"
                  className={`persona-btn ${activeTab === 'employers' ? 'active' : ''}`}
                  onClick={() => handleTabChange('employers')}
                >
                  Company
                </button>
              </div>

              {/* Auth Failure / Error Banner */}
              {authError && (
                <div className="auth-error-banner" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{authError}</span>
                </div>
              )}

              {/* Primary Email & Password Form */}
              <form className="signup-form" onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="fullName">
                    {activeTab === 'employers' ? 'Contact Name / Representative' : 'Full Name'}
                  </label>
                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      id="fullName"
                      type="text"
                      placeholder={activeTab === 'employers' ? 'Ar. Snehal Jagtap' : 'Jane Doe'}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        if (validationErrors.fullName) {
                          setValidationErrors((prev) => ({ ...prev, fullName: undefined }))
                        }
                        if (authError) clearError()
                      }}
                      aria-invalid={Boolean(validationErrors.fullName)}
                      aria-describedby={validationErrors.fullName ? 'fullName-error' : undefined}
                      required
                    />
                  </div>
                  {validationErrors.fullName && (
                    <span id="fullName-error" className="form-field-error" role="alert">
                      {validationErrors.fullName}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label htmlFor="email">
                    {activeTab === 'employers' ? 'Company Work Email' : 'Professional Email'}
                  </label>
                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      id="email"
                      type="email"
                      placeholder={activeTab === 'employers' ? 'contact@studio-arch.com' : 'jane.doe@architecture.com'}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (validationErrors.email) {
                          setValidationErrors((prev) => ({ ...prev, email: undefined }))
                        }
                        if (authError) clearError()
                      }}
                      aria-invalid={Boolean(validationErrors.email)}
                      aria-describedby={validationErrors.email ? 'email-error' : undefined}
                      required
                    />
                  </div>
                  {validationErrors.email && (
                    <span id="email-error" className="form-field-error" role="alert">
                      {validationErrors.email}
                    </span>
                  )}
                </div>

                {/* Password & Security Meter */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="password">Password</label>
                    {password && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: strengthColors[passwordStrength],
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    )}
                  </div>

                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
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
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (validationErrors.password) {
                          setValidationErrors((prev) => ({ ...prev, password: undefined }))
                        }
                        if (authError) clearError()
                      }}
                      aria-invalid={Boolean(validationErrors.password)}
                      aria-describedby={validationErrors.password ? 'password-error' : undefined}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {validationErrors.password && (
                    <span id="password-error" className="form-field-error" role="alert">
                      {validationErrors.password}
                    </span>
                  )}

                  {/* Password Strength Meter */}
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

                  {/* Password Requirements Checklist */}
                  <div className="password-requirements" aria-label="Password checklist">
                    <div className={`requirement-item ${hasMinLength ? 'met' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {hasMinLength ? (
                          <polyline points="20 6 9 17 4 12" />
                        ) : (
                          <circle cx="12" cy="12" r="6" />
                        )}
                      </svg>
                      <span>8+ characters</span>
                    </div>

                    <div className={`requirement-item ${hasUpperCase ? 'met' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {hasUpperCase ? (
                          <polyline points="20 6 9 17 4 12" />
                        ) : (
                          <circle cx="12" cy="12" r="6" />
                        )}
                      </svg>
                      <span>Uppercase letter</span>
                    </div>

                    <div className={`requirement-item ${hasNumber ? 'met' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {hasNumber ? (
                          <polyline points="20 6 9 17 4 12" />
                        ) : (
                          <circle cx="12" cy="12" r="6" />
                        )}
                      </svg>
                      <span>At least 1 number</span>
                    </div>

                    <div className={`requirement-item ${hasSpecialChar ? 'met' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {hasSpecialChar ? (
                          <polyline points="20 6 9 17 4 12" />
                        ) : (
                          <circle cx="12" cy="12" r="6" />
                        )}
                      </svg>
                      <span>Special character</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="signup-btn"
                  disabled={isEmailSubmitting || isGoogleLoading || isLinkedInLoading}
                >
                  {isEmailSubmitting ? (
                    <>
                      <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      <span>Constructing Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* OAuth Providers Divider */}
              <div className="signup-divider">
                <span>Or Authenticate Via</span>
              </div>

              {/* Google & LinkedIn OAuth Buttons */}
              <div className="social-grid">
                <button
                  type="button"
                  className="social-btn google"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading || isEmailSubmitting || isLinkedInLoading}
                  aria-label="Sign up with Google"
                >
                  {isGoogleLoading ? (
                    <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  ) : (
                    <svg className="social-icon" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  {isGoogleLoading ? 'Connecting...' : 'Google'}
                </button>

                <button
                  type="button"
                  className="social-btn linkedin"
                  onClick={handleLinkedInSignUp}
                  disabled={isLinkedInLoading || isEmailSubmitting || isGoogleLoading}
                  aria-label="Sign up with LinkedIn"
                >
                  {isLinkedInLoading ? (
                    <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  ) : (
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      fill="#0A66C2"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  )}
                  {isLinkedInLoading ? 'Connecting...' : 'LinkedIn'}
                </button>
              </div>

              {/* Navigation to Sign In & Terms */}
              <footer className="signup-footer">
                <p>
                  Already have an account?{' '}
                  <Link
                    to="/signin"
                    onClick={(e) => {
                      if (onNavigateToSignIn) {
                        e.preventDefault()
                        onNavigateToSignIn()
                      }
                    }}
                  >
                    Sign In
                  </Link>
                </p>
                <p className="signup-terms" style={{ marginTop: '10px', fontSize: '12px', color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" style={{ color: '#00418f', fontWeight: 500 }}>Terms and Conditions</Link>,{' '}
                  <Link to="/privacy" style={{ color: '#00418f', fontWeight: 500 }}>Privacy Policy</Link>, and{' '}
                  <Link to="/app-privacy" style={{ color: '#00418f', fontWeight: 500 }}>App Privacy</Link>.
                </p>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default SignUp
