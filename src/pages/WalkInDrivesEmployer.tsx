import { useState, type FC, type KeyboardEvent } from 'react'
import './WalkInDrivesEmployer.css'
import {
  useWalkInDrives,
  STANDARD_ROLE_TYPES,
  POPULAR_TECHNICAL_SKILLS,
  type WalkInDriveItem,
} from '../hooks/useWalkInDrives'

type DriveTab = 'all' | 'upcoming' | 'past'

const WalkInDriveSkeleton: FC = () => (
  <article className="wid-card wid-card-skeleton" aria-hidden="true">
    <div className="wid-card-top">
      <div className="wid-card-main-info" style={{ width: '100%' }}>
        {/* Date Badge Skeleton */}
        <div className="wid-date-badge wid-shimmer" style={{ width: '70px', height: '72px', border: 'none', background: '#edeef2' }} />

        <div className="wid-card-details" style={{ flex: 1 }}>
          {/* Badges Row Skeleton */}
          <div className="wid-card-badges" style={{ gap: '8px' }}>
            <div className="wid-shimmer" style={{ width: '90px', height: '22px', borderRadius: '6px' }} />
            <div className="wid-shimmer" style={{ width: '120px', height: '22px', borderRadius: '6px' }} />
            <div className="wid-shimmer" style={{ width: '80px', height: '22px', borderRadius: '6px' }} />
          </div>

          {/* Title Skeleton */}
          <div className="wid-shimmer" style={{ width: '68%', height: '22px', margin: '8px 0 6px 0', borderRadius: '6px' }} />

          {/* Location Skeleton */}
          <div className="wid-shimmer" style={{ width: '42%', height: '15px', borderRadius: '4px' }} />
        </div>
      </div>
    </div>

    {/* Skills Row Skeleton */}
    <div className="wid-skills-line" style={{ gap: '8px' }}>
      <div className="wid-shimmer" style={{ width: '110px', height: '14px', borderRadius: '4px' }} />
      <div className="wid-shimmer" style={{ width: '60px', height: '24px', borderRadius: '6px' }} />
      <div className="wid-shimmer" style={{ width: '80px', height: '24px', borderRadius: '6px' }} />
      <div className="wid-shimmer" style={{ width: '75px', height: '24px', borderRadius: '6px' }} />
      <div className="wid-shimmer" style={{ width: '90px', height: '24px', borderRadius: '6px' }} />
    </div>

    {/* Description Box Skeleton */}
    <div className="wid-card-description" style={{ background: '#f8f9fc', borderLeftColor: '#c2c6d5' }}>
      <div className="wid-shimmer" style={{ width: '94%', height: '14px', marginBottom: '8px', borderRadius: '4px' }} />
      <div className="wid-shimmer" style={{ width: '70%', height: '14px', borderRadius: '4px' }} />
    </div>

    {/* Contact Strip Skeleton */}
    <div className="wid-card-contacts" style={{ background: '#f8f9fc', border: '1px solid #edeef2' }}>
      <div className="wid-shimmer" style={{ width: '170px', height: '16px', borderRadius: '4px' }} />
      <div className="wid-shimmer" style={{ width: '130px', height: '16px', borderRadius: '4px' }} />
    </div>

    {/* Footer Actions Skeleton */}
    <div className="wid-card-footer">
      <div className="wid-shimmer" style={{ width: '180px', height: '14px', borderRadius: '4px' }} />
      <div className="wid-footer-actions" style={{ gap: '8px' }}>
        <div className="wid-shimmer" style={{ width: '90px', height: '32px', borderRadius: '6px' }} />
        <div className="wid-shimmer" style={{ width: '65px', height: '32px', borderRadius: '6px' }} />
      </div>
    </div>
  </article>
)

export const WalkInDrivesEmployer: FC = () => {
  const {
    drives,
    upcomingDrives,
    pastDrives,
    loading,
    companyName,
    totalOpenings,
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    formData,
    formErrors,
    touched,
    minDate,
    currentTime,
    openCreateModal,
    handleBlur,
    handleFieldChange,
    toastMessage,
    handleCreateDrive,
    handleToggleStatus,
    handleDeleteDrive,
  } = useWalkInDrives()

  const [activeTab, setActiveTab] = useState<DriveTab>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [customSkillInput, setCustomSkillInput] = useState<string>('')
  const [customRoleActive, setCustomRoleActive] = useState<boolean>(false)

  // Filtered list
  const tabDrives = activeTab === 'upcoming' ? upcomingDrives : activeTab === 'past' ? pastDrives : drives

  const filteredDrives = tabDrives.filter((d) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const matchTitle = d.title?.toLowerCase().includes(q)
    const matchRole = d.primary_role?.toLowerCase().includes(q)
    const matchLoc = d.location?.toLowerCase().includes(q)
    const matchSkills = d.required_skills?.some((s) => s.toLowerCase().includes(q))
    return matchTitle || matchRole || matchLoc || matchSkills
  })

  // Format date helper
  const parseDriveDate = (isoStr: string | null, isPast?: boolean) => {
    if (!isoStr) return { month: 'TBD', day: '--', time: '--', isPast: !!isPast }
    const dt = new Date(isoStr)
    const month = dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const day = dt.getDate()
    const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return { month, day, time, isPast: !!isPast }
  }

  // Toggle skill chip in modal
  const toggleSkillChip = (skill: string) => {
    const exists = formData.required_skills.includes(skill)
    const nextSkills = exists
      ? formData.required_skills.filter((s) => s !== skill)
      : [...formData.required_skills, skill]
    handleFieldChange('required_skills', nextSkills)
  }

  // Add custom skill chip
  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim()
    if (!trimmed) return
    if (!formData.required_skills.includes(trimmed)) {
      handleFieldChange('required_skills', [...formData.required_skills, trimmed])
    }
    setCustomSkillInput('')
  }

  const handleKeyDownSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomSkill()
    }
  }

  return (
    <div className="wid-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="wid-toast" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Telemetry Strip */}
      <section className="wid-telemetry-strip" aria-label="Walk-in Drive Telemetry">
        <div className="wid-telemetry-left">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00418f', fontWeight: 700 }}>
            <span className="wid-pulse-dot" />
            WALK-IN DRIVES FEED // ENTERPRISE RADAR
          </span>
          <span style={{ color: '#c2c6d5' }}>/</span>
          <span style={{ color: '#39464f', fontWeight: 600 }}>{companyName}</span>
          <span style={{ color: '#c2c6d5' }}>/</span>
          <span style={{ color: '#1a1c1e', fontWeight: 600 }}>
            {upcomingDrives.length} UPCOMING {upcomingDrives.length === 1 ? 'DRIVE' : 'DRIVES'}
          </span>
        </div>
      </section>

      {/* 2. Header Block */}
      <header className="wid-header-section">
        <div className="wid-title-wrapper">
          <span className="wid-tag-badge">Recruiter Venue Desk</span>
          <h1 className="wid-main-heading">Walk-in Drives &amp; Hiring Feeds</h1>
          <p className="wid-lead-desc">
            Publish on-site walk-in recruitment feeds, broadcast drive schedules to qualified architectural and engineering talent, and manage past and upcoming walk-in campaigns.
          </p>
        </div>

        <div className="wid-action-cluster">
          <button
            type="button"
            className="btn-wid-primary"
            onClick={openCreateModal}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Walk-in Drive Feed</span>
          </button>
        </div>
      </header>

      {/* 3. Telemetry Quad Cards */}
      <section className="wid-metrics-grid" aria-label="Drive Statistics">
        <article className="wid-metric-card">
          <div className="wid-metric-top">
            <span className="wid-metric-lbl">Total Drives</span>
            <div className="wid-metric-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          {loading ? (
            <div className="wid-shimmer wid-metric-shimmer" />
          ) : (
            <span className="wid-metric-huge-num">{drives.length}</span>
          )}
          <p className="wid-metric-subtext">All scheduled campaigns</p>
        </article>

        <article className="wid-metric-card">
          <div className="wid-metric-top">
            <span className="wid-metric-lbl">Upcoming Drives</span>
            <div className="wid-metric-icon-box" style={{ background: '#e6f4ea', color: '#137333' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          {loading ? (
            <div className="wid-shimmer wid-metric-shimmer" />
          ) : (
            <span className="wid-metric-huge-num" style={{ color: '#137333' }}>
              {upcomingDrives.length}
            </span>
          )}
          <p className="wid-metric-subtext">Active on candidate feeds</p>
        </article>

        <article className="wid-metric-card">
          <div className="wid-metric-top">
            <span className="wid-metric-lbl">Past / Completed</span>
            <div className="wid-metric-icon-box" style={{ background: '#f0f0f4', color: '#727784' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          {loading ? (
            <div className="wid-shimmer wid-metric-shimmer" />
          ) : (
            <span className="wid-metric-huge-num" style={{ color: '#727784' }}>
              {pastDrives.length}
            </span>
          )}
          <p className="wid-metric-subtext">Historical drive archives</p>
        </article>

        <article className="wid-metric-card">
          <div className="wid-metric-top">
            <span className="wid-metric-lbl">Total Openings</span>
            <div className="wid-metric-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          {loading ? (
            <div className="wid-shimmer wid-metric-shimmer" />
          ) : (
            <span className="wid-metric-huge-num" style={{ color: '#b45309' }}>
              {totalOpenings}
            </span>
          )}
          <p className="wid-metric-subtext">Vacancies across drives</p>
        </article>
      </section>

      {/* 4. Filter Console */}
      <section className="wid-filter-console" aria-label="Drive Filters">
        <div className="wid-tabs-scroll" role="tablist">
          <button
            type="button"
            className={`wid-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Drives ({drives.length})
          </button>
          <button
            type="button"
            className={`wid-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Drives ({upcomingDrives.length})
          </button>
          <button
            type="button"
            className={`wid-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Drives ({pastDrives.length})
          </button>
        </div>

        <div className="wid-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search drive title, role, venue, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* 5. Drive Feed Posts List */}
      <main className="wid-cards-col">
        {loading ? (
          <>
            {[1, 2, 3].map((n) => (
              <WalkInDriveSkeleton key={n} />
            ))}
          </>
        ) : filteredDrives.length === 0 ? (
          <div className="wid-empty-state">
            <div className="wid-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              {searchQuery ? 'No Drives Match Search' : 'No Walk-in Drives Posted'}
            </h3>
            <p style={{ fontSize: '14px', color: '#727784', maxWidth: '420px', margin: 0 }}>
              {searchQuery
                ? `No walk-in drive found matching "${searchQuery}". Try clearing search or switching filter tabs.`
                : 'Host a walk-in interview campaign to meet architectural, BIM, and engineering candidates on-site.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                className="btn-wid-light"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                className="btn-wid-primary"
                onClick={openCreateModal}
              >
                + Create Walk-in Drive Feed
              </button>
            )}
          </div>
        ) : (
          filteredDrives.map((drive: WalkInDriveItem) => {
            const dateInfo = parseDriveDate(drive.date_time, drive.is_past)
            const isClosed = drive.status === 'closed'

            return (
              <article key={drive.id} className={`wid-card ${isClosed ? 'closed' : ''}`}>
                <div className="wid-card-top">
                  <div className="wid-card-main-info">
                    {/* Date Badge */}
                    <div className={`wid-date-badge ${dateInfo.isPast ? 'past' : ''}`}>
                      <span className="wid-date-badge-month">{dateInfo.month}</span>
                      <span className="wid-date-badge-day">{dateInfo.day}</span>
                      <span className="wid-date-badge-time">{dateInfo.time}</span>
                    </div>

                    <div className="wid-card-details">
                      <div className="wid-card-badges">
                        <span
                          className={`badge-wid-status ${
                            isClosed ? 'closed' : dateInfo.isPast ? 'past' : 'active'
                          }`}
                        >
                          {isClosed ? 'CLOSED' : dateInfo.isPast ? 'PAST DRIVE' : 'UPCOMING // LIVE'}
                        </span>
                        {drive.primary_role && (
                          <span className="badge-wid-role">{drive.primary_role}</span>
                        )}
                        {drive.number_of_openings && (
                          <span className="badge-wid-openings">
                            {drive.number_of_openings} {drive.number_of_openings === 1 ? 'OPENING' : 'OPENINGS'}
                          </span>
                        )}
                      </div>

                      <h2 className="wid-card-title">{drive.title}</h2>

                      <div className="wid-card-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{drive.location || 'Venue Location not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Focus Chips */}
                {drive.required_skills && drive.required_skills.length > 0 && (
                  <div className="wid-skills-line">
                    <span style={{ fontSize: '11.5px', color: '#727784', fontWeight: 700 }}>
                      TECHNICAL FOCUS:
                    </span>
                    {drive.required_skills.map((skill, idx) => (
                      <span key={idx} className="wid-skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description / Instructions */}
                {drive.description && (
                  <div className="wid-card-description">
                    <strong>Instructions / Guidelines: </strong>
                    <span>{drive.description}</span>
                  </div>
                )}

                {/* Company Contact Links */}
                {(drive.company_email || drive.company_website) && (
                  <div className="wid-card-contacts">
                    {drive.company_email && (
                      <a href={`mailto:${drive.company_email}`} className="wid-contact-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{drive.company_email}</span>
                      </a>
                    )}
                    {drive.company_website && (
                      <a
                        href={drive.company_website.startsWith('http') ? drive.company_website : `https://${drive.company_website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wid-contact-link"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>{drive.company_website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="wid-card-footer">
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11.5px', color: '#727784' }}>
                    ID: {drive.id.slice(0, 8)}... • POSTED BY ENTERPRISE
                  </span>

                  <div className="wid-footer-actions">
                    <button
                      type="button"
                      className="btn-wid-light"
                      onClick={() => handleToggleStatus(drive.id, drive.status)}
                    >
                      {drive.status === 'active' ? 'Close Drive' : 'Re-open Drive'}
                    </button>
                    <button
                      type="button"
                      className="btn-wid-light"
                      style={{ color: '#b3272d' }}
                      onClick={() => handleDeleteDrive(drive.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </main>

      {/* 6. Create Walk-in Drive Modal (7 Requested Fields) */}
      {isModalOpen && (
        <div className="wid-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="wid-modal-dialog">
            <div className="wid-modal-header">
              <div>
                <h2 id="modal-title">Create Walk-in Drive Feed</h2>
                <span style={{ fontSize: '12px', color: '#727784' }}>
                  Broadcast your walk-in event details to verified AEC talent
                </span>
              </div>
              <button
                type="button"
                className="wid-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="wid-modal-body">
              {/* Field 1: Drive Title */}
              <div className="wid-field-group">
                <label className="wid-field-label">
                  <span>1. Drive Title <span className="req">*</span></span>
                </label>
                <input
                  type="text"
                  className={`wid-input ${formErrors.title && touched.title ? 'error' : ''}`}
                  placeholder="e.g. Mega Walk-in Drive for Senior BIM &amp; Structural Engineers"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  onBlur={() => handleBlur('title')}
                  aria-invalid={!!(formErrors.title && touched.title)}
                />
                {formErrors.title && touched.title && <span className="wid-field-error">{formErrors.title}</span>}
              </div>

              {/* Field 2: Date & Time (Two Columns) */}
              <div className="wid-field-row">
                <div className="wid-field-group">
                  <label className="wid-field-label">
                    <span>2A. Drive Date <span className="req">*</span></span>
                    <span style={{ fontSize: '11px', color: '#137333', fontWeight: 600 }}>
                      (Today &amp; onwards)
                    </span>
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    className={`wid-input ${formErrors.date && touched.date ? 'error' : ''}`}
                    value={formData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    onBlur={() => handleBlur('date')}
                    aria-invalid={!!(formErrors.date && touched.date)}
                  />
                  {formErrors.date && touched.date && <span className="wid-field-error">{formErrors.date}</span>}
                </div>

                <div className="wid-field-group">
                  <label className="wid-field-label">
                    <span>2B. Start Time <span className="req">*</span></span>
                    {formData.date === minDate && (
                      <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                        (From now onwards)
                      </span>
                    )}
                  </label>
                  <input
                    type="time"
                    min={formData.date === minDate ? currentTime : undefined}
                    className={`wid-input ${formErrors.time && touched.time ? 'error' : ''}`}
                    value={formData.time}
                    onChange={(e) => handleFieldChange('time', e.target.value)}
                    onBlur={() => handleBlur('time')}
                    aria-invalid={!!(formErrors.time && touched.time)}
                  />
                  {formErrors.time && touched.time && <span className="wid-field-error">{formErrors.time}</span>}
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#727784', marginTop: '-8px', marginBottom: '8px', display: 'block' }}>
                Walk-in drive date &amp; start time can only be scheduled from now onwards.
              </span>

              {/* Field 3: Location */}
              <div className="wid-field-group">
                <label className="wid-field-label">
                  <span>3. Venue Location Address <span className="req">*</span></span>
                </label>
                <input
                  type="text"
                  className={`wid-input ${formErrors.location && touched.location ? 'error' : ''}`}
                  placeholder="e.g. Mindspace IT Park, Building 4, 6th Floor, Hadapsar, Pune - 411028"
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  onBlur={() => handleBlur('location')}
                  aria-invalid={!!(formErrors.location && touched.location)}
                />
                {formErrors.location && touched.location && <span className="wid-field-error">{formErrors.location}</span>}
              </div>

              {/* Field 4 & 5: Number of Openings & Primary Role Type */}
              <div className="wid-field-row">
                <div className="wid-field-group">
                  <label className="wid-field-label">
                    <span>4. Number of Openings <span className="req">*</span></span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={`wid-input ${formErrors.number_of_openings && touched.number_of_openings ? 'error' : ''}`}
                    value={formData.number_of_openings}
                    onChange={(e) => handleFieldChange('number_of_openings', Math.max(1, parseInt(e.target.value) || 1))}
                    onBlur={() => handleBlur('number_of_openings')}
                    aria-invalid={!!(formErrors.number_of_openings && touched.number_of_openings)}
                  />
                  {formErrors.number_of_openings && touched.number_of_openings && (
                    <span className="wid-field-error">{formErrors.number_of_openings}</span>
                  )}
                </div>

                <div className="wid-field-group">
                  <label className="wid-field-label">
                    <span>5. Primary Role Type <span className="req">*</span></span>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#00418f', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setCustomRoleActive(!customRoleActive)}
                    >
                      {customRoleActive ? 'Select from list' : '+ Enter custom role'}
                    </button>
                  </label>
                  {customRoleActive ? (
                    <input
                      type="text"
                      className={`wid-input ${formErrors.primary_role && touched.primary_role ? 'error' : ''}`}
                      placeholder="e.g. Façade Computation Specialist"
                      value={formData.primary_role}
                      onChange={(e) => handleFieldChange('primary_role', e.target.value)}
                      onBlur={() => handleBlur('primary_role')}
                      aria-invalid={!!(formErrors.primary_role && touched.primary_role)}
                    />
                  ) : (
                    <select
                      className={`wid-select ${formErrors.primary_role && touched.primary_role ? 'error' : ''}`}
                      value={formData.primary_role}
                      onChange={(e) => handleFieldChange('primary_role', e.target.value)}
                      onBlur={() => handleBlur('primary_role')}
                      aria-invalid={!!(formErrors.primary_role && touched.primary_role)}
                    >
                      {STANDARD_ROLE_TYPES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.primary_role && touched.primary_role && (
                    <span className="wid-field-error">{formErrors.primary_role}</span>
                  )}
                </div>
              </div>

              {/* Field 6: Technical Focus (Interactive Chip UI) */}
              <div className="wid-field-group">
                <label className="wid-field-label">
                  <span>6. Technical Focus (Skills / Tools) <span className="req">*</span></span>
                  <span style={{ fontSize: '11.5px', color: '#727784' }}>
                    {formData.required_skills.length} selected
                  </span>
                </label>

                <div className="wid-chips-container">
                  {POPULAR_TECHNICAL_SKILLS.map((skill) => {
                    const isSelected = formData.required_skills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        className={`wid-chip-selectable ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSkillChip(skill)}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {skill}
                      </button>
                    )
                  })}
                </div>

                {/* Add Custom Chip */}
                <div className="wid-chip-add-box">
                  <input
                    type="text"
                    placeholder="Add custom skill / tool (e.g. Grasshopper, STAAD Pro)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={handleKeyDownSkill}
                  />
                  <button
                    type="button"
                    className="wid-chip-add-btn"
                    onClick={handleAddCustomSkill}
                  >
                    Add Chip
                  </button>
                </div>

                {formErrors.required_skills && touched.required_skills && (
                  <span className="wid-field-error">{formErrors.required_skills}</span>
                )}
              </div>

              {/* Field 7: Event Description */}
              <div className="wid-field-group">
                <label className="wid-field-label">
                  <span>7. Event Description &amp; Candidate Instructions <span className="req">*</span></span>
                </label>
                <textarea
                  rows={4}
                  className={`wid-textarea ${formErrors.description && touched.description ? 'error' : ''}`}
                  placeholder="Outline drive schedule, candidate eligibility, documents to bring (e.g. 2 copies of resume, portfolio on USB/tablet), round details, etc."
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  aria-invalid={!!(formErrors.description && touched.description)}
                />
                {formErrors.description && touched.description && (
                  <span className="wid-field-error">{formErrors.description}</span>
                )}
              </div>

              {/* Field 8 & 9: Company Contact (Email & Website URL) */}
              <div className="wid-field-row">
                <div className="wid-field-group">
                  <label className="wid-field-label">
                    <span>8. Company / HR Email <span className="req">*</span></span>
                    <span style={{ fontSize: '11px', color: '#727784' }}>(e.g. .com, .in, .org)</span>
                  </label>
                  <input
                    type="email"
                    className={`wid-input ${formErrors.company_email && touched.company_email ? 'error' : ''}`}
                    placeholder="e.g. careers@aecbuild.com"
                    value={formData.company_email}
                    onChange={(e) => handleFieldChange('company_email', e.target.value)}
                    onBlur={() => handleBlur('company_email')}
                    aria-invalid={!!(formErrors.company_email && touched.company_email)}
                  />
                  {formErrors.company_email && touched.company_email && (
                    <span className="wid-field-error">{formErrors.company_email}</span>
                  )}
                </div>

                <div className="wid-field-group">
                  <label className="wid-field-label">
                    <span>9. Company Website URL <span className="req">*</span></span>
                    <span style={{ fontSize: '11px', color: '#727784' }}>(e.g. .com, .in, .org)</span>
                  </label>
                  <input
                    type="url"
                    className={`wid-input ${formErrors.company_website && touched.company_website ? 'error' : ''}`}
                    placeholder="e.g. https://www.aecbuild.com"
                    value={formData.company_website}
                    onChange={(e) => handleFieldChange('company_website', e.target.value)}
                    onBlur={() => handleBlur('company_website')}
                    aria-invalid={!!(formErrors.company_website && touched.company_website)}
                  />
                  {formErrors.company_website && touched.company_website && (
                    <span className="wid-field-error">{formErrors.company_website}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="wid-modal-footer">
              <button
                type="button"
                className="btn-wid-light"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-wid-primary"
                onClick={handleCreateDrive}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing Feed...' : 'Publish Walk-in Feed →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
