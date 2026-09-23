import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import EmployerDashboard from './pages/EmployerDashboard'
import TalentDashboard from './pages/TalentDashboard'
import { CompanyProfileSetup } from './pages/CompanyProfileSetup'
import { TalentProfile } from './pages/TalentProfile'
import TermsConditions from './pages/TermsConditions'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AppPrivacyPolicy from './pages/AppPrivacyPolicy'
import { ToastContainer } from './components/Toast'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RootRedirect } from './components/RootRedirect'
import { useAuth } from './hooks/useAuth'
import { useToast } from './hooks/useToast'
import { checkUserProfile } from './lib/companyService'

function App() {
  const { user, loading, signOut } = useAuth()
  const { toasts, dismissToast, addToast, showSuccess, showInfo } = useToast()
  const navigate = useNavigate()

  const handleSignInSuccess = async (type: 'talent' | 'employers') => {
    if (type === 'employers') {
      if (user) {
        const { exists, needsOnboarding } = await checkUserProfile(user.id)
        if (!exists || needsOnboarding) {
          showInfo('Please complete your company profile to access enterprise tools.', 'Profile Required')
          navigate('/company-setup')
          return
        }
      }
      showSuccess('Signed in successfully!', 'Welcome Back')
      navigate('/employer')
    } else {
      showSuccess('Signed in successfully!', 'Welcome Back')
      navigate('/talent')
    }
  }

  const handleSignUpSuccess = (type: 'talent' | 'employers') => {
    if (type === 'employers') {
      showSuccess('Enterprise account created! Please complete your company verification.', 'Account Created')
      navigate('/company-setup')
    } else {
      showSuccess('Account created successfully!', 'Welcome')
      navigate('/talent')
    }
  }

  const handleCompanySetupSuccess = () => {
    localStorage.setItem('castallio_enterprise_profile_completed', 'true')
    localStorage.removeItem('castallio_oauth_intent')
    localStorage.removeItem('castallio_signup_provider')
    localStorage.removeItem('castallio_signup_role')
    navigate('/employer')
  }

  const handleLogout = async () => {
    await signOut()
    showInfo('You have been logged out.', 'Signed Out')
    navigate('/signin', { replace: true })
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <Routes>
        {/* Smart Root Landing / Redirect */}
        <Route path="/" element={<RootRedirect showToast={addToast} />} />

        {/* Public Auth Routes */}
        <Route
          path="/signin"
          element={
            !loading && user ? (
              <Navigate to="/" replace />
            ) : (
              <SignIn onSignInSuccess={handleSignInSuccess} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !loading && user ? (
              <Navigate to="/" replace />
            ) : (
              <SignUp onSignUpSuccess={handleSignUpSuccess} />
            )
          }
        />

        {/* Public Legal Pages (supports all manual URL entry variations) */}
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/terms/" element={<TermsConditions />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/terms-and-conditions/" element={<TermsConditions />} />
        <Route path="/termsconditions" element={<Navigate to="/terms" replace />} />

        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy/" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy/" element={<PrivacyPolicy />} />
        <Route path="/privacypolicy" element={<Navigate to="/privacy" replace />} />

        <Route path="/app-privacy" element={<AppPrivacyPolicy />} />
        <Route path="/app-privacy/" element={<AppPrivacyPolicy />} />
        <Route path="/app-privacy-policy" element={<AppPrivacyPolicy />} />
        <Route path="/app-privacy-policy/" element={<AppPrivacyPolicy />} />
        <Route path="/appprivacy" element={<Navigate to="/app-privacy" replace />} />
        <Route path="/appprivacy/" element={<Navigate to="/app-privacy" replace />} />
        <Route path="/app_privacy" element={<Navigate to="/app-privacy" replace />} />
        <Route path="/app_privacy/" element={<Navigate to="/app-privacy" replace />} />
        <Route path="/app/privacy" element={<Navigate to="/app-privacy" replace />} />
        <Route path="/privacy/app" element={<Navigate to="/app-privacy" replace />} />
        <Route path="/privacy-app" element={<Navigate to="/app-privacy" replace />} />

        {/* Protected Onboarding / Company Setup */}
        <Route
          path="/company-setup"
          element={
            <ProtectedRoute requiredRole="employers">
              <CompanyProfileSetup
                userId={user?.id}
                onSetupSuccess={handleCompanySetupSuccess}
                onLogout={handleLogout}
                showToast={(message, type, title) => addToast(message, type, title)}
              />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute requiredRole="employers" requireCompletedProfile={true}>
              <EmployerDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/talent"
          element={
            <ProtectedRoute requiredRole="talent">
              <TalentDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Dedicated Standalone Talent Profile Route (opens in browser new tab) */}
        <Route
          path="/talent-profile/:id"
          element={
            <ProtectedRoute requiredRole="employers">
              <TalentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/talent/:id"
          element={
            <ProtectedRoute requiredRole="employers">
              <TalentProfile />
            </ProtectedRoute>
          }
        />

        {/* Aliases for backwards compatibility */}
        <Route path="/employer-dashboard" element={<Navigate to="/employer" replace />} />
        <Route path="/talent-dashboard" element={<Navigate to="/talent" replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
