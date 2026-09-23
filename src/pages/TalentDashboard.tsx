import { useState } from 'react'
import './TalentDashboard.css'
import FindJobs from './FindJobs'
import Applications from './Applications'
import SavedJobs from './SavedJobs'
import MyProfile from './MyProfile'
import Resume from './Resume'
import Portfolio from './Portfolio'
import Certifications from './Certifications'
import Messages from './Messages'
import Interviews from './Interviews'
import JobAlerts from './JobAlerts'
import Training from './Training'
import { WalkInDrivesTalent } from './WalkInDrivesTalent'
import { TalentSearch } from './TalentSearch'
import { ShortlistedCandidates } from './ShortlistedCandidates'
import { CompanyProfile } from './CompanyProfile'
import { Subscription } from './Subscription'
import { Billing } from './Billing'
import { LogoutModal } from '../components/LogoutModal'

type MenuItem =
  | 'dashboard'
  | 'find-jobs'
  | 'talent-search'
  | 'shortlisted'
  | 'walk-in-drives'
  | 'saved-jobs'
  | 'applications'
  | 'my-profile'
  | 'resume'
  | 'portfolio'
  | 'certifications'
  | 'messages'
  | 'interviews'
  | 'company-profile'
  | 'subscription'
  | 'billing'
  | 'job-alerts'
  | 'training'
  | 'settings'

interface TalentDashboardProps {
  onLogout: () => void
}

const menuItems: { id: MenuItem; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'find-jobs', label: 'Find Jobs', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'talent-search', label: 'Talent Search', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'shortlisted', label: 'Shortlisted Candidates', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'walk-in-drives', label: 'Walk-in Drives', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z M12 11v6m-3-3h6' },
  { id: 'saved-jobs', label: 'Saved Jobs', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { id: 'applications', label: 'Applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'my-profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'resume', label: 'Resume / CV', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'portfolio', label: 'Portfolio / Projects', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'certifications', label: 'Certifications / Licenses', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { id: 'messages', label: 'Messages', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z' },
  { id: 'interviews', label: 'Interviews', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'company-profile', label: 'Company Profile', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'subscription', label: 'Subscription', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 'billing', label: 'Billing / Invoices', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  { id: 'job-alerts', label: 'Job Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'training', label: 'Training / Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

const recommendedJobs = [
  {
    title: 'BIM Manager',
    company: 'BDP',
    location: 'London, UK (Hybrid)',
    fitScore: 94,
    skills: ['Revit', 'Navisworks', 'BIM 360', 'Dynamo'],
  },
  {
    title: 'Principal Structural Engineer',
    company: 'Mott MacDonald',
    location: 'New York, NY',
    fitScore: 89,
    skills: ['AutoCAD', 'Tekla', 'SAP2000'],
  },
]

const recentActivity = [
  {
    title: 'Lead BIM Coordinator - Interview Scheduled',
    description: 'BDP confirmed your virtual interview for Oct 14th.',
    time: '2 days ago',
    active: true,
  },
  {
    title: 'Senior Structural Engineer - Application Sent',
    description: 'Your application and portfolio were successfully submitted to Arup.',
    time: '5 days ago',
    active: false,
  },
]

function TalentDashboard({ onLogout }: TalentDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'high'
    if (score >= 80) return 'medium'
    return 'low'
  }

  const profileStrength = 85
  const circumference = 2 * Math.PI * 45
  const dashoffset = circumference - (profileStrength / 100) * circumference

  return (
    <div className="talent-layout">
      <aside className={`talent-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
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
          <button className="nav-item logout" onClick={() => setIsLogoutModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nav-icon">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />
            </svg>
            {!sidebarCollapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="talent-main">
        {activeMenu === 'find-jobs' ? (
          <div className="talent-page-content">
            <FindJobs />
          </div>
        ) : activeMenu === 'talent-search' ? (
          <div className="talent-page-content">
            <TalentSearch onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : activeMenu === 'shortlisted' ? (
          <div className="talent-page-content">
            <ShortlistedCandidates onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : activeMenu === 'saved-jobs' ? (
          <div className="talent-page-content">
            <SavedJobs onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : activeMenu === 'applications' ? (
          <div className="talent-page-content">
            <Applications />
          </div>
        ) : activeMenu === 'my-profile' ? (
          <div className="talent-page-content">
            <MyProfile onNavigateToPortfolio={() => setActiveMenu('portfolio')} />
          </div>
        ) : activeMenu === 'resume' ? (
          <div className="talent-page-content">
            <Resume
              onNavigateToPortfolio={() => setActiveMenu('portfolio')}
              onNavigateToCertifications={() => setActiveMenu('certifications')}
            />
          </div>
        ) : activeMenu === 'portfolio' ? (
          <div className="talent-page-content">
            <Portfolio onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : activeMenu === 'certifications' ? (
          <div className="talent-page-content">
            <Certifications onNavigateToPortfolio={() => setActiveMenu('portfolio')} />
          </div>
        ) : activeMenu === 'messages' ? (
          <div className="talent-page-content">
            <Messages onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : activeMenu === 'interviews' ? (
          <div className="talent-page-content">
            <Interviews onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : activeMenu === 'company-profile' ? (
          <div className="talent-page-content">
            <CompanyProfile onNavigateToDashboard={() => setActiveMenu('dashboard')} />
          </div>
        ) : activeMenu === 'subscription' ? (
          <div className="talent-page-content">
            <Subscription onNavigateToDashboard={() => setActiveMenu('dashboard')} />
          </div>
        ) : activeMenu === 'billing' ? (
          <div className="talent-page-content">
            <Billing
              onNavigateToSubscription={() => setActiveMenu('subscription')}
              onNavigateToDashboard={() => setActiveMenu('dashboard')}
            />
          </div>
        ) : activeMenu === 'job-alerts' ? (
          <div className="talent-page-content">
            <JobAlerts onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : activeMenu === 'training' ? (
          <div className="talent-page-content">
            <Training onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : activeMenu === 'walk-in-drives' ? (
          <div className="talent-page-content">
            <WalkInDrivesTalent />
          </div>
        ) : (
        <div className="talent-content-grid">
          <aside className="talent-left">
            <div className="welcome-card">
              <div className="welcome-top-row">
                <div>
                  <h1 className="welcome-name">Welcome back, Alex</h1>
                  <p className="welcome-role">Senior BIM Coordinator</p>
                </div>
                <button
                  type="button"
                  className="welcome-logout-btn"
                  onClick={() => setIsLogoutModalOpen(true)}
                  title="Sign Out of Castallio One"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
              <div className="welcome-stats">
                <div className="stat-box">
                  <span className="stat-value">3</span>
                  <span className="stat-label">Active Apps</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">12</span>
                  <span className="stat-label">Profile Views</span>
                </div>
              </div>
            </div>

            <div className="profile-integrity-card">
              <div className="profile-glow" />
              <h2 className="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="title-icon">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Profile Integrity
              </h2>
              <div className="profile-strength">
                <div className="strength-ring">
                  <svg viewBox="0 0 100 100">
                    <circle className="ring-bg" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8" />
                    <circle
                      className="ring-progress"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashoffset}
                    />
                  </svg>
                  <div className="ring-value">{profileStrength}%</div>
                </div>
                <p className="strength-text">
                  You are close to reaching <strong>Expert</strong> status. Complete your profile to boost visibility to top AEC firms.
                </p>
              </div>
              <button className="certification-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6v12m-6-6h12" />
                </svg>
                Add Revit Certification
              </button>
            </div>

            <div className="events-card">
              <h3 className="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="title-icon">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upcoming Events
              </h3>
              <div className="event-item">
                <div className="event-date">
                  <span className="event-month">OCT</span>
                  <span className="event-day">14</span>
                </div>
                <div className="event-details">
                  <h4>Technical Interview</h4>
                  <p>BDP - Lead BIM Coordinator</p>
                  <span className="event-time">10:00 AM EST • Virtual</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="talent-right">
            <div className="matches-header">
              <div>
                <h2 className="matches-title">Precision Matches</h2>
                <p className="matches-subtitle">Algorithms found these opportunities based on your technical blueprint.</p>
              </div>
              <a href="#" className="view-all">
                View All
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="jobs-list">
              {recommendedJobs.map((job, index) => (
                <div className="job-card" key={index}>
                  <div className="job-fit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="fit-icon">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span className={`fit-score ${getScoreColor(job.fitScore)}`}>{job.fitScore}% FIT</span>
                  </div>
                  <div className="job-content">
                    <div className="job-image-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="job-details">
                      <h3>{job.title}</h3>
                      <p className="job-company">{job.company} • {job.location}</p>
                      <div className="job-skills">
                        {job.skills.map((skill, i) => (
                          <span className="skill-tag" key={i}>{skill}</span>
                        ))}
                      </div>
                      <div className="job-actions">
                        <button className="btn-apply">Apply Now</button>
                        <button className="btn-save">Save</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="activity-section">
              <h3 className="activity-title">Recent Activity</h3>
              <div className="activity-timeline">
                {recentActivity.map((activity, index) => (
                  <div className="timeline-item" key={index}>
                    <div className={`timeline-dot ${activity.active ? 'active' : ''}`} />
                    <div className={`timeline-content ${activity.active ? '' : 'inactive'}`}>
                      <div className="timeline-header">
                        <h4>{activity.title}</h4>
                        <span className="timeline-time">{activity.time}</span>
                      </div>
                      <p>{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        )}
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
        userName="Alex Morgan"
        role="Talent"
      />
    </div>
  )
}

export default TalentDashboard
