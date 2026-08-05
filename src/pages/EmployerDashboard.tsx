import { useState } from 'react'
import './EmployerDashboard.css'

type MenuItem =
  | 'dashboard'
  | 'post-job'
  | 'my-jobs'
  | 'applicants'
  | 'talent-search'
  | 'shortlisted'
  | 'interviews'
  | 'messages'
  | 'company-profile'
  | 'projects'
  | 'subscription'
  | 'billing'
  | 'team'
  | 'reports'
  | 'settings'

interface EmployerDashboardProps {
  onLogout: () => void
}

const menuItems: { id: MenuItem; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'post-job', label: 'Post a Job', icon: 'M12 5v14M5 12h14' },
  { id: 'my-jobs', label: 'My Job Posts', icon: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16' },
  { id: 'applicants', label: 'Applicants', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { id: 'talent-search', label: 'Talent Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'shortlisted', label: 'Shortlisted Candidates', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'interviews', label: 'Interviews', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'messages', label: 'Messages', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z' },
  { id: 'company-profile', label: 'Company Profile', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'projects', label: 'Projects / Campaigns', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { id: 'subscription', label: 'Subscription', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 'billing', label: 'Billing / Invoices', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  { id: 'team', label: 'Team Members', icon: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'reports', label: 'Reports / Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

const recentApplicants = [
  {
    name: 'Elena Rostova',
    role: 'Senior BIM Coordinator',
    fitScore: 94,
    appliedFor: 'Lead Revit Specialist - NYC Core',
    skills: ['Revit', 'Navisworks'],
    avatar: null,
  },
  {
    name: 'Marcus Chen',
    role: 'Structural Engineer',
    fitScore: 88,
    appliedFor: 'Senior Structural Engineer',
    skills: ['AutoCAD', 'SAP2000'],
    avatar: null,
  },
  {
    name: 'Sarah Jenkins',
    role: 'Junior Architect',
    fitScore: 72,
    appliedFor: 'Architectural Designer',
    skills: ['SketchUp', 'Rhino'],
    avatar: null,
  },
]

function EmployerDashboard({ onLogout }: EmployerDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'high'
    if (score >= 80) return 'medium'
    return 'low'
  }

  return (
    <div className="dashboard-layout">
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">Castallio One</span>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarCollapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nav-icon">
                <path d={item.icon} />
              </svg>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={onLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nav-icon">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />
            </svg>
            {!sidebarCollapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Employer Dashboard</h1>
            <p>Overview of your firm's hiring activities.</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Talent Search
            </button>
            <button className="btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Post a Job
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-glow blue" />
              <div className="metric-header">
                <span className="metric-label">Active Job Posts</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
                  <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                </svg>
              </div>
              <span className="metric-value">12</span>
              <div className="metric-trend positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 6l-9.5 9.5-5-5L1 18" />
                  <path d="M17 6h6v6" />
                </svg>
                +2 this week
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-glow pink" />
              <div className="metric-header">
                <span className="metric-label">Total Applicants</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <span className="metric-value">348</span>
              <div className="metric-trend positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 6l-9.5 9.5-5-5L1 18" />
                  <path d="M17 6h6v6" />
                </svg>
                +45 this month
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-glow gray" />
              <div className="metric-header">
                <span className="metric-label">Hires this Month</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <span className="metric-value">4</span>
              <div className="metric-trend neutral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
                Same as last month
              </div>
            </div>
          </div>

          <div className="applicants-section">
            <div className="section-header">
              <h2>Recent Applicants</h2>
              <a href="#" className="view-all">View All</a>
            </div>

            <div className="applicants-grid">
              {recentApplicants.map((applicant, index) => (
                <div className="applicant-card" key={index}>
                  <div className="applicant-top">
                    <div className="applicant-info">
                      {applicant.avatar ? (
                        <img src={applicant.avatar} alt={applicant.name} className="applicant-avatar" />
                      ) : (
                        <div className="applicant-avatar placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3>{applicant.name}</h3>
                        <p>{applicant.role}</p>
                      </div>
                    </div>
                    <div className="fit-score">
                      <span className="fit-label">FIT SCORE</span>
                      <div className={`score-circle ${getScoreColor(applicant.fitScore)}`}>
                        {applicant.fitScore}
                      </div>
                    </div>
                  </div>

                  <div className="applicant-position">
                    <span className="position-label">APPLIED FOR</span>
                    <span className="position-title">{applicant.appliedFor}</span>
                  </div>

                  <div className="applicant-skills">
                    {applicant.skills.map((skill, i) => (
                      <span className="skill-tag" key={i}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard
