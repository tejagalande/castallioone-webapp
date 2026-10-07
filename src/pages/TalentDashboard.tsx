import { useState, useEffect, type FC } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './TalentDashboard.css'
import FindJobs from './FindJobs'
import Applications from './Applications'
import SavedJobs from './SavedJobs'
import MyProfile from './MyProfile'
import Messages from './Messages'
import Interviews from './Interviews'
import Notifications from './Notifications'
import Training from './Training'
import { WalkInDrivesTalent } from './WalkInDrivesTalent'
import { LogoutModal } from '../components/LogoutModal'
import { useTalentDashboard, type RecommendedJob } from './useTalentDashboard'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/Toast'
import RecommendationJobs from './RecommendationJobs'

type MenuItem =
  | 'dashboard'
  | 'recommendation-jobs'
  | 'find-jobs'
  | 'walk-in-drives'
  | 'saved-jobs'
  | 'applications'
  | 'my-profile'
  | 'messages'
  | 'interviews'
  | 'notifications'
  | 'job-alerts'
  | 'training'
  | 'settings'

interface TalentDashboardProps {
  onLogout: () => void
}

const menuItems: { id: MenuItem; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'recommendation-jobs', label: 'Recommendation Jobs', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'find-jobs', label: 'Find Jobs', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'walk-in-drives', label: 'Walk-in Drives', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z M12 11v6m-3-3h6' },
  { id: 'saved-jobs', label: 'Saved Jobs', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { id: 'applications', label: 'Applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'my-profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'messages', label: 'Messages', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z' },
  { id: 'interviews', label: 'Interviews', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'training', label: 'Training / Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

export const TalentDashboard: FC<TalentDashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as string | null

  const [activeMenu, setActiveMenu] = useState<MenuItem>(() => {
    if (tabParam === 'resume' || tabParam === 'portfolio' || tabParam === 'certifications') {
      return 'my-profile'
    }
    if (tabParam === 'job-alerts' || tabParam === 'notifications') {
      return 'notifications'
    }
    if (tabParam && menuItems.some((m) => m.id === tabParam)) {
      return tabParam as MenuItem
    }
    return 'dashboard'
  })
  const [prevTabParam, setPrevTabParam] = useState<string | null>(tabParam)

  if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam)
    if (tabParam === 'resume' || tabParam === 'portfolio' || tabParam === 'certifications') {
      setActiveMenu('my-profile')
    } else if (tabParam === 'job-alerts' || tabParam === 'notifications') {
      setActiveMenu('notifications')
    } else if (tabParam && menuItems.some((m) => m.id === tabParam)) {
      setActiveMenu(tabParam as MenuItem)
    }
  }

  // Live Unread Notification Badge Counter
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(() => {
    try {
      const count = localStorage.getItem('castallio_unread_notifications_count')
      return count ? parseInt(count, 10) : 4
    } catch {
      return 4
    }
  })

  useEffect(() => {
    const handleNotifUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ unreadCount: number }>
      if (customEvent.detail && typeof customEvent.detail.unreadCount === 'number') {
        setUnreadNotifCount(customEvent.detail.unreadCount)
      }
    }
    window.addEventListener('castallio-notifications-updated', handleNotifUpdate)
    return () => {
      window.removeEventListener('castallio-notifications-updated', handleNotifUpdate)
    }
  }, [])

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1280
    }
    return false
  })
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [targetChatCompany, setTargetChatCompany] = useState<{ id?: string; name?: string } | null>(null)

  const handleNavigateToMessages = (companyName?: string, companyId?: string) => {
    if (companyName || companyId) {
      setTargetChatCompany({ id: companyId, name: companyName })
    }
    setActiveMenu('messages')
  }

  // Custom Toast notifications
  const { toasts, dismissToast, showSuccess, showInfo } = useToast()

  // Real backend hook powering Recommendation Jobs, profile, upcoming events, and telemetry
  const {
    profile,
    metrics,
    recommendedJobs,
    upcomingEvents,
    recentActivity,
    appliedJobIds,
    savedJobIds,
    loading,
    applyingJobId,
    applyForJob,
    toggleSaveJob,
  } = useTalentDashboard()

  const DASHBOARD_REC_LIMIT = 3

  const talentName = profile.fullName || 'Talent Member'
  const talentRole = profile.specificSkill || profile.discipline || 'AEC Candidate'
  const profileStrength = metrics.profileStrength || 0

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'high'
    if (score >= 80) return 'medium'
    return 'low'
  }

  const getCompanyInitials = (name: string): string => {
    if (!name) return 'AEC'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleApply = async (job: RecommendedJob) => {
    const success = await applyForJob(job)
    if (success) {
      showSuccess(`Application submitted to ${job.company}! Recruiter will review your credentials.`, 'Application Sent')
    }
  }

  const handleSave = (job: RecommendedJob) => {
    const wasSaved = savedJobIds.has(job.id)
    toggleSaveJob(job)
    if (!wasSaved) {
      showSuccess(`Saved "${job.title}" to your bookmarks`, 'Job Saved')
    } else {
      showInfo(`Removed "${job.title}" from saved jobs`, 'Job Removed')
    }
  }

  const circumference = 2 * Math.PI * 45
  const dashoffset = circumference - (profileStrength / 100) * circumference

  return (
    <div className="talent-layout">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <aside className={`talent-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-group">
            <img src="/app_icon.png" alt="Castallio One" className="sidebar-brand-icon" />
            <span className="sidebar-logo">Castallio One</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle navigation sidebar"
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

        <nav className="sidebar-nav" aria-label="Main Navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id || (item.id === 'notifications' && activeMenu === 'job-alerts') ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <div className="nav-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nav-icon" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
                {item.id === 'notifications' && unreadNotifCount > 0 && sidebarCollapsed && (
                  <span className="nav-unread-badge" aria-label={`${unreadNotifCount} unread notifications`}>
                    {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                  </span>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="nav-label-group">
                  <span className="nav-label">{item.label}</span>
                  {item.id === 'notifications' && unreadNotifCount > 0 && (
                    <span className="nav-badge-pill">{unreadNotifCount}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={() => setIsLogoutModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nav-icon" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />
            </svg>
            {!sidebarCollapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="talent-main">
        {activeMenu === 'recommendation-jobs' ? (
          <div className="talent-page-content">
            <RecommendationJobs
              jobs={recommendedJobs}
              loading={loading}
              applyingJobId={applyingJobId}
              onApply={handleApply}
              onSave={handleSave}
              savedJobIds={savedJobIds}
              appliedJobIds={appliedJobIds}
              profile={profile}
              onNavigateToFindJobs={() => setActiveMenu('find-jobs')}
            />
          </div>
        ) : activeMenu === 'find-jobs' ? (
          <div className="talent-page-content find-jobs-page-wrapper">
            <FindJobs
              jobs={recommendedJobs}
              loading={loading}
              applyingJobId={applyingJobId}
              onApply={handleApply}
              onSave={handleSave}
              savedJobIds={savedJobIds}
              appliedJobIds={appliedJobIds}
              profile={profile}
              onNavigateToMessages={handleNavigateToMessages}
            />
          </div>
        ) : activeMenu === 'walk-in-drives' ? (
          <div className="talent-page-content">
            <WalkInDrivesTalent />
          </div>
        ) : activeMenu === 'saved-jobs' ? (
          <div className="talent-page-content">
            <SavedJobs
              jobs={recommendedJobs}
              loading={loading}
              profile={profile}
              savedJobIds={savedJobIds}
              appliedJobIds={appliedJobIds}
              onSave={handleSave}
              onApply={handleApply}
              onNavigateToFindJobs={() => setActiveMenu('find-jobs')}
            />
          </div>
        ) : activeMenu === 'applications' ? (
          <div className="talent-page-content find-jobs-page-wrapper">
            <Applications
              onNavigateToFindJobs={() => setActiveMenu('find-jobs')}
              onNavigateToMessages={handleNavigateToMessages}
              onNavigateToInterviews={() => setActiveMenu('interviews')}
              onNavigateToResume={() => setActiveMenu('my-profile')}
              onNavigateToCertifications={() => setActiveMenu('my-profile')}
            />
          </div>
        ) : activeMenu === 'my-profile' ? (
          <div className="talent-page-content">
            <MyProfile onNavigateToPortfolio={() => setActiveMenu('my-profile')} />
          </div>
        ) : activeMenu === 'messages' ? (
          <div className="talent-page-content">
            <Messages
              onNavigateToFindJobs={() => setActiveMenu('find-jobs')}
              targetCompany={targetChatCompany}
              onClearTargetCompany={() => setTargetChatCompany(null)}
            />
          </div>
        ) : activeMenu === 'interviews' ? (
          <div className="talent-page-content">
            <Interviews
              onNavigateToFindJobs={() => setActiveMenu('find-jobs')}
              onNavigateToMessages={handleNavigateToMessages}
            />
          </div>
        ) : activeMenu === 'notifications' || activeMenu === 'job-alerts' ? (
          <div className="talent-page-content">
            <Notifications
              onNavigateToFindJobs={() => setActiveMenu('find-jobs')}
              onNavigateToApplications={() => setActiveMenu('applications')}
              onNavigateToInterviews={() => setActiveMenu('interviews')}
              onNavigateToMessages={handleNavigateToMessages}
              onNavigateToDrives={() => setActiveMenu('walk-in-drives')}
              onNavigateToProfile={() => setActiveMenu('my-profile')}
            />
          </div>
        ) : activeMenu === 'training' ? (
          <div className="talent-page-content">
            <Training onNavigateToFindJobs={() => setActiveMenu('find-jobs')} />
          </div>
        ) : (
          <div className="talent-content-grid">
            <aside className="talent-left">
              <section className="welcome-card" aria-label="Candidate Welcome">
                <div className="welcome-top-row">
                  <div>
                    <h1 className="welcome-name">Welcome back, {talentName.split(' ')[0]}</h1>
                    <p className="welcome-role">{talentRole}</p>
                  </div>
                </div>
                <div className="welcome-stats">
                  <div className="stat-box">
                    <span className="stat-value">{metrics.activeAppsCount}</span>
                    <span className="stat-label">Active Apps</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{metrics.profileViewsCount}</span>
                    <span className="stat-label">Profile Views</span>
                  </div>
                </div>
              </section>

              <section className="profile-integrity-card" aria-label="Profile Integrity">
                <div className="profile-glow" />
                <h2 className="card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="title-icon" aria-hidden="true">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Profile Integrity
                </h2>
                <div className="profile-strength">
                  <div className="strength-ring">
                    <svg viewBox="0 0 100 100" aria-hidden="true">
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
                    {profileStrength >= 90 ? (
                      <>Your profile is at <strong>All-Star</strong> status. You have maximum visibility in recruiter talent searches.</>
                    ) : (
                      <>You are at <strong>{profileStrength}%</strong> completeness. Complete your skills and certificates to boost visibility to top AEC firms.</>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  className="certification-btn"
                  onClick={() => navigate('/talent-setup')}
                  id="editTalentPassportBtn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 6v12m-6-6h12" />
                  </svg>
                  {profileStrength < 100 ? `Complete Talent Profile (${profileStrength}%)` : 'Update Talent Passport'}
                </button>
              </section>

              <section className="events-card" aria-label="Upcoming Events">
                <h3 className="card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="title-icon" aria-hidden="true">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upcoming Events
                </h3>

                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((ev) => (
                    <article className="event-item" key={ev.id}>
                      <div className="event-date">
                        <span className="event-month">{ev.month}</span>
                        <span className="event-day">{ev.day}</span>
                      </div>
                      <div className="event-details">
                        <h4>{ev.title}</h4>
                        <p>{ev.company} - {ev.role}</p>
                        <span className="event-time">{ev.time} • {ev.type}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="events-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty-state-icon" aria-hidden="true">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h4 className="empty-state-title">No Interviews Scheduled</h4>
                    <p className="empty-state-desc">Interview invites for your active applications will appear here.</p>
                  </div>
                )}
              </section>
            </aside>

            <section className="talent-right" aria-label="Recommendation Jobs and Activity">
              {/* Recommendation Jobs Section Header */}
              <div className="matches-header">
                <div>
                  <div className="recommendation-badge-header">
                    <span className="rec-sparkle-pill">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      AI Recommendation Engine
                    </span>
                  </div>
                  <h2 className="matches-title">Recommendation Jobs</h2>
                  <p className="matches-subtitle">
                    Opportunities curated based on your technical blueprint, verified AEC stack, and experience.
                  </p>
                </div>
                <button
                  type="button"
                  className="view-all-btn"
                  onClick={() => setActiveMenu('recommendation-jobs')}
                  aria-label="View all recommendation jobs"
                >
                  Browse All ({recommendedJobs.length})
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Recommendation Jobs List (Preview limited on Dashboard) */}
              <div className="jobs-list">
                {loading ? (
                  <>
                    <div className="job-card-skeleton" style={{ height: '170px' }} />
                    <div className="job-card-skeleton" style={{ height: '170px' }} />
                  </>
                ) : recommendedJobs.length > 0 ? (
                  recommendedJobs.slice(0, DASHBOARD_REC_LIMIT).map((job) => (
                    <article className="job-card" key={job.id}>
                      <div className="job-content">
                        {job.companyLogoUrl ? (
                          <div className="job-logo-wrapper">
                            <img src={job.companyLogoUrl} alt={job.company} className="job-company-logo" />
                          </div>
                        ) : (
                          <div className="job-company-avatar">
                            {getCompanyInitials(job.company)}
                          </div>
                        )}

                        <div className="job-details">
                          <div className="job-header-row">
                            {job.matchReasons.map((reason, rIdx) => (
                              <span className="rec-reason-badge" key={rIdx}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {reason}
                              </span>
                            ))}

                            <div className="job-fit">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="fit-icon" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                              </svg>
                              <span className={`fit-score ${getScoreColor(job.fitScore)}`}>
                                {job.fitScore}% FIT
                              </span>
                            </div>
                          </div>

                          <h3 className="job-title-text">{job.title}</h3>
                          <p className="job-company">{job.company} • {job.location}</p>

                          <div className="job-meta-row">
                            <span className="job-meta-pill">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="13" height="13" aria-hidden="true">
                                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                              </svg>
                              {job.workType}
                            </span>
                            {job.experience && (
                              <span className="job-meta-pill">{job.experience}</span>
                            )}
                            {job.salaryText && (
                              <span className="job-meta-pill salary">{job.salaryText}</span>
                            )}
                          </div>

                          <div className="job-skills">
                            {job.skills.map((skill, i) => (
                              <span className="skill-tag" key={i}>{skill}</span>
                            ))}
                          </div>

                          <div className="job-actions">
                            <button
                              type="button"
                              className={`btn-apply ${job.isApplied ? 'applied' : ''} ${applyingJobId === job.id ? 'loading' : ''}`}
                              onClick={() => !job.isApplied && handleApply(job)}
                              disabled={job.isApplied || applyingJobId === job.id}
                            >
                              {job.isApplied ? (
                                <>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Applied
                                </>
                              ) : applyingJobId === job.id ? (
                                'Submitting...'
                              ) : (
                                'Apply Now'
                              )}
                            </button>
                            <button
                              type="button"
                              className={`btn-save ${job.isSaved ? 'saved' : ''}`}
                              onClick={() => handleSave(job)}
                              aria-label={job.isSaved ? 'Remove from saved' : 'Save job'}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill={job.isSaved ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                              >
                                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                              </svg>
                              {job.isSaved ? 'Saved' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="jobs-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty-state-icon" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <h3 className="empty-state-title">No Recommendations Currently</h3>
                    <p className="empty-state-desc">Update your skills and discipline to unlock tailored opportunities.</p>
                  </div>
                )}

                {recommendedJobs.length > DASHBOARD_REC_LIMIT && (
                  <div className="rec-dashboard-footer">
                    <div className="rec-footer-text">
                      <span className="rec-footer-counter">
                        Showing top {DASHBOARD_REC_LIMIT} of {recommendedJobs.length} AI matches
                      </span>
                      <span className="rec-footer-sub">
                        Explore all tailored AEC opportunities matching your skills and work modes
                      </span>
                    </div>
                    <button
                      type="button"
                      className="rec-footer-browse-btn"
                      onClick={() => setActiveMenu('recommendation-jobs')}
                    >
                      Browse More Recommendations
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Activity Section */}
              <div className="activity-section">
                <h3 className="activity-title">Recent Activity</h3>
                <div className="activity-timeline">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div className="timeline-item" key={activity.id || index}>
                        <div className={`timeline-dot ${activity.active ? 'active' : ''}`} />
                        <div className={`timeline-content ${activity.active ? '' : 'inactive'}`}>
                          <div className="timeline-header">
                            <h4>{activity.title}</h4>
                            <span className="timeline-time">{activity.time}</span>
                          </div>
                          <p>{activity.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                      No recent activities yet. Your application updates and scheduled interviews will appear here.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
        userName={talentName}
        role="Talent"
      />
    </div>
  )
}

export default TalentDashboard
