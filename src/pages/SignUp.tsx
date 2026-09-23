import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './SignUp.css'

type AuthTab = 'talent' | 'employers'

interface SignUpProps {
  onNavigateToSignIn?: () => void
  onSignUpSuccess?: (type: 'talent' | 'employers') => void
}

function SignUp({ onNavigateToSignIn, onSignUpSuccess }: SignUpProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AuthTab>('talent')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)

  const { signInWithGoogle, signInWithLinkedIn, error: authError } = useAuth()

  const getPasswordStrength = (pwd: string): number => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd) && /[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const passwordStrength = getPasswordStrength(password)

  const strengthColors: Record<number, string> = {
    0: '#e8e8ea',
    1: '#ef4444',
    2: '#f59e0b',
    3: '#3b82f6',
    4: '#22c55e',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sign up:', { activeTab, fullName, email, password })
    if (onSignUpSuccess) {
      onSignUpSuccess(activeTab)
    } else {
      navigate(activeTab === 'employers' ? '/company-setup' : '/talent')
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true)
      await signInWithGoogle(activeTab)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleLinkedInSignUp = async () => {
    try {
      setIsLinkedInLoading(true)
      localStorage.setItem('castallio_oauth_intent', 'signup')
      localStorage.setItem('castallio_signup_provider', 'linkedin')
      localStorage.setItem('castallio_signup_role', activeTab)
      await signInWithLinkedIn(activeTab)
    } finally {
      setIsLinkedInLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="blueprint-grid" />

      <aside className="signup-sidebar">
        <div className="sidebar-glow" />

        <div className="sidebar-content">
          <div className="sidebar-brand">Castallio One</div>

          <h1 className="sidebar-heading">
            Join the
            <br />
            Precision
            <br />
            Network
          </h1>

          <p className="sidebar-description">
            Connect with the world's leading AEC talent and projects through
            our data-driven network.
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

      <main className="signup-main">
        <div className="signup-glow" />

        <div className="signup-card">
          <div className="card-highlight" />

          <div className="card-header">
            <h2 className="card-title">Create Account</h2>
            <p className="card-subtitle">
              Enter your details to construct your profile.
            </p>
          </div>

          <div className="persona-toggle">
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
              onClick={() => setActiveTab('talent')}
            >
              For Talent
            </button>
            <button
              type="button"
              className={`persona-btn ${activeTab === 'employers' ? 'active' : ''}`}
              onClick={() => setActiveTab('employers')}
            >
              Enterprise (Employers)
            </button>
          </div>

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

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Professional Email</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="jane.doe@architecture.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
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
              <div className="password-strength">
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
            </div>

            <button type="submit" className="signup-btn">
              <span>Create Account</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          <div className="signup-divider">
            <span>Or Authenticate Via</span>
          </div>

          <div className="social-grid">
            <button
              type="button"
              className="social-btn google"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              aria-label="Sign up with Google"
            >
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
              {isGoogleLoading ? 'Connecting...' : 'Google'}
            </button>
            <button
              type="button"
              className="social-btn linkedin"
              onClick={handleLinkedInSignUp}
              disabled={isLinkedInLoading}
              aria-label="Sign up with LinkedIn"
            >
              <svg
                className="social-icon"
                viewBox="0 0 24 24"
                fill="#0A66C2"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {isLinkedInLoading ? 'Connecting...' : 'LinkedIn'}
            </button>
          </div>

          <div className="signup-footer">
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
          </div>
        </div>
      </main>
    </div>
  )
}

export default SignUp
