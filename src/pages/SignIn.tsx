import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './SignIn.css'

type AuthTab = 'talent' | 'employers'

interface SignInProps {
  onNavigateToSignUp?: () => void
  onSignInSuccess?: (type: 'talent' | 'employers') => void
}

function SignIn({ onNavigateToSignUp, onSignInSuccess }: SignInProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AuthTab>('talent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)

  const { signInWithGoogle, signInWithLinkedIn, error: authError } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sign in:', { activeTab, email, password })
    if (onSignInSuccess) {
      onSignInSuccess(activeTab)
    } else {
      navigate(activeTab === 'employers' ? '/employer' : '/talent')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      await signInWithGoogle(activeTab)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleLinkedInSignIn = async () => {
    try {
      setIsLinkedInLoading(true)
      localStorage.setItem('castallio_oauth_intent', 'signin')
      await signInWithLinkedIn(activeTab)
    } finally {
      setIsLinkedInLoading(false)
    }
  }

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-left">
          <div className="signin-brand">
            <h1 className="signin-logo">Castallio One</h1>
            <p className="signin-version">v1.2.8 | BIM-Standardized Auth</p>
          </div>

          <div className="signin-tagline">
            <h2>Precision Entry</h2>
            <p>
              Connect with the world's leading AEC talent and projects through
              our data-driven network.
            </p>
          </div>

          <div className="signin-building">
            <img src="/building.svg" alt="Modern building" />
          </div>
        </div>

        <div className="signin-right">
          <div className="signin-tabs">
            <button
              className={`signin-tab ${activeTab === 'talent' ? 'active' : ''}`}
              onClick={() => setActiveTab('talent')}
            >
              For Talent
            </button>
            <button
              className={`signin-tab ${activeTab === 'employers' ? 'active' : ''}`}
              onClick={() => setActiveTab('employers')}
            >
              For Employers
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

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Professional Email</label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-link">
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="signin-btn">
              Sign In
              <span className="signin-arrow">→</span>
            </button>
          </form>

          <div className="signin-divider">
            <span>OR AUTHENTICATE VIA</span>
          </div>

          <div className="signin-social">
            <button
              type="button"
              className="social-btn"
              onClick={handleLinkedInSignIn}
              disabled={isLinkedInLoading}
              aria-label="Sign in with LinkedIn"
            >
              <svg
                className="social-icon"
                viewBox="0 0 24 24"
                fill="#0A66C2"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {isLinkedInLoading ? 'Connecting to LinkedIn...' : 'Sign in with LinkedIn'}
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              aria-label="Sign in with Google"
            >
              <svg
                className="social-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google'}
            </button>
          </div>

          <div className="signin-footer">
            <p>
              Don't have an account?{' '}
              <Link
                to="/signup"
                onClick={(e) => {
                  if (onNavigateToSignUp) {
                    e.preventDefault()
                    onNavigateToSignUp()
                  }
                }}
              >
                Sign Up
              </Link>
            </p>
            <p className="signin-terms">
              By signing in, you agree to our{' '}
              <Link to="/terms">Terms and Conditions</Link>,{' '}
              <Link to="/privacy">Privacy Policy</Link>, and{' '}
              <Link to="/app-privacy">App Privacy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
