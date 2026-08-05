import { useState } from 'react'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import EmployerDashboard from './pages/EmployerDashboard'
import TalentDashboard from './pages/TalentDashboard'

type Page = 'signin' | 'signup' | 'employer-dashboard' | 'talent-dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('signin')

  const handleSignInSuccess = (type: 'talent' | 'employers') => {
    setCurrentPage(type === 'talent' ? 'talent-dashboard' : 'employer-dashboard')
  }

  const handleSignUpSuccess = (type: 'talent' | 'employers') => {
    setCurrentPage(type === 'talent' ? 'talent-dashboard' : 'employer-dashboard')
  }

  const handleLogout = () => {
    setCurrentPage('signin')
  }

  if (currentPage === 'employer-dashboard') {
    return <EmployerDashboard onLogout={handleLogout} />
  }

  if (currentPage === 'talent-dashboard') {
    return <TalentDashboard onLogout={handleLogout} />
  }

  if (currentPage === 'signup') {
    return (
      <SignUp
        onNavigateToSignIn={() => setCurrentPage('signin')}
        onSignUpSuccess={handleSignUpSuccess}
      />
    )
  }

  return (
    <SignIn
      onNavigateToSignUp={() => setCurrentPage('signup')}
      onSignInSuccess={handleSignInSuccess}
    />
  )
}

export default App
