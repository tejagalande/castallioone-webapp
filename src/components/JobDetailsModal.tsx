import { useEffect, useState, useCallback, type FC } from 'react'
import type { RecommendedJob } from '../pages/useTalentDashboard'
import './JobDetailsModal.css'

export interface JobDetailsModalProps {
  job: RecommendedJob | null
  isOpen: boolean
  onClose: () => void
  onApply: (job: RecommendedJob) => Promise<void>
  onSave: (job: RecommendedJob) => void
  isApplied: boolean
  isSaved: boolean
  isApplying?: boolean
  onNavigateToMessages?: (companyName?: string, companyId?: string) => void
}

export const JobDetailsModal: FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  onSave,
  isApplied,
  isSaved,
  isApplying = false,
  onNavigateToMessages,
}) => {
  const [copiedLink, setCopiedLink] = useState(false)

  // Handle ESC key to dismiss modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent background scrolling while modal is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !job) {
    return null
  }

  const getCompanyInitials = (name: string): string => {
    if (!name) return 'AEC'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/job/${job.id}`
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${job.title} at ${job.company} - ${shareUrl}`)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2500)
      }
    } catch {
      // Fallback
    }
  }

  const handleApplyClick = async () => {
    if (!isApplied && !isApplying) {
      await onApply(job)
    }
  }

  return (
    <div
      className="job-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-modal-title"
    >
      <div
        className="job-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <header className="job-modal-header">
          <div className="job-modal-header-lead">
            {job.companyLogoUrl ? (
              <div className="job-modal-logo-box">
                <img src={job.companyLogoUrl} alt={job.company} className="job-modal-logo" />
              </div>
            ) : (
              <div className="job-modal-avatar-box">
                {getCompanyInitials(job.company)}
              </div>
            )}

            <div className="job-modal-title-meta">
              <div className="job-modal-company-row">
                <span className="job-modal-company-name">{job.company}</span>
                <span className="job-modal-verified-pill" title="Verified Practice Partner">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Verified Partner
                </span>
                {job.category && (
                  <span className="job-modal-category-pill">{job.category}</span>
                )}
              </div>

              <h2 className="job-modal-title" id="job-modal-title">
                {job.title}
              </h2>

              <div className="job-modal-location-row">
                <span className="location-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {job.location}
                </span>
                <span className="separator">•</span>
                <span className="worktype-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
                    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                  </svg>
                  {job.workType}
                </span>
                {job.validityDaysLeft !== undefined && (
                  <>
                    <span className="separator">•</span>
                    <span className={`expiry-item ${job.validityDaysLeft <= 5 ? 'urgent' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {job.validityDaysLeft > 0 ? `${job.validityDaysLeft}d left` : 'Expiring soon'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="job-modal-header-actions">
            <div className="job-modal-fit-badge">
              <span className="fit-score-value">{job.fitScore}%</span>
              <span className="fit-score-label">Match</span>
            </div>

            <button
              type="button"
              className="job-modal-close-btn"
              onClick={onClose}
              aria-label="Close job details modal"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Match Reasons Strip */}
        {job.matchReasons.length > 0 && (
          <section className="job-modal-reasons-strip" aria-label="AI Match Highlights">
            <span className="reasons-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
              Why you match:
            </span>
            <div className="reasons-list">
              {job.matchReasons.map((reason, idx) => (
                <span className="reason-pill" key={idx}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {reason}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Telemetry Metrics Quick Bar */}
        <section className="job-modal-telemetry-bar" aria-label="Requisition Specs">
          <div className="telemetry-box">
            <span className="telemetry-label">Compensation</span>
            <span className="telemetry-value highlight">{job.salaryText || 'Competitive Market Rate'}</span>
          </div>
          <div className="telemetry-box">
            <span className="telemetry-label">Experience</span>
            <span className="telemetry-value">{job.experience || 'Not Specified'}</span>
          </div>
          <div className="telemetry-box">
            <span className="telemetry-label">Employment Type</span>
            <span className="telemetry-value">
              {job.employmentType && job.employmentType.length > 0
                ? job.employmentType.join(', ')
                : 'Full-time'}
            </span>
          </div>
          <div className="telemetry-box">
            <span className="telemetry-label">Open Positions</span>
            <span className="telemetry-value">{job.numberOfOpenings || 1} Requisition</span>
          </div>
        </section>

        {/* Scrollable Modal Content Body */}
        <main className="job-modal-body">
          {/* Section: Role Scope & Description */}
          <article className="job-modal-section">
            <h3 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Role Scope &amp; Focus
            </h3>
            <div className="section-content text-body">
              {job.description ? (
                job.description.split('\n').map((para, i) => (
                  para.trim() ? <p key={i}>{para}</p> : null
                ))
              ) : (
                <p>
                  High-precision architectural and engineering modeling, BIM coordination, and execution
                  standards aligned with ISO 19650 protocols and multidisciplinary project delivery.
                </p>
              )}
            </div>
          </article>

          {/* Section: Key Responsibilities */}
          {job.responsibilities && (
            <article className="job-modal-section">
              <h3 className="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Key Responsibilities
              </h3>
              <div className="section-content text-body">
                {job.responsibilities.split('\n').map((line, idx) => {
                  const cleaned = line.replace(/^[•\-*]\s*/, '').trim()
                  if (!cleaned) return null
                  return (
                    <div className="responsibility-item" key={idx}>
                      <span className="bullet-point">▸</span>
                      <span>{cleaned}</span>
                    </div>
                  )
                })}
              </div>
            </article>
          )}

          {/* Section: Technical Requirements & Software Stack */}
          <article className="job-modal-section">
            <h3 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              Required Technical Stack &amp; Skills
            </h3>
            <div className="skills-tags-cluster">
              {(job.technicalRequirements && job.technicalRequirements.length > 0
                ? job.technicalRequirements
                : job.skills
              ).map((skill, sIdx) => {
                const isMatched = job.skills.includes(skill)
                return (
                  <span className={`tech-pill ${isMatched ? 'matched' : ''}`} key={sIdx}>
                    {isMatched && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="11" height="11" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {skill}
                  </span>
                )
              })}
            </div>
          </article>

          {/* Section: About the Studio & Practice */}
          <article className="job-modal-section practice-card">
            <h3 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 21V3h6v18" />
              </svg>
              About the Practice
            </h3>
            <div className="practice-details">
              <div className="practice-header">
                <div>
                  <h4 className="practice-name">{job.company}</h4>
                  <p className="practice-meta">
                    {job.location} • {job.companySize || 'AEC Enterprise Practice'}
                  </p>
                </div>
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite.startsWith('http') ? job.companyWebsite : `https://${job.companyWebsite}`}
                    target="_blank"
                    rel="noreferrer"
                    className="practice-link-btn"
                    aria-label={`Visit ${job.company} official website`}
                  >
                    <span>Website</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
              <p className="practice-desc">
                {job.companyAbout ||
                  job.aboutUs ||
                  `${job.company} is an active industry partner within the Castallio AEC talent network, delivering high-performance architecture, engineering, and digital twin infrastructure.`}
              </p>
            </div>
          </article>
        </main>

        {/* Modal Sticky Footer Actions */}
        <footer className="job-modal-footer">
          <div className="footer-left-actions">
            <button
              type="button"
              className={`footer-btn-save ${isSaved ? 'saved' : ''}`}
              onClick={() => onSave(job)}
              aria-label={isSaved ? 'Remove from saved jobs' : 'Save job for later'}
            >
              <svg
                viewBox="0 0 24 24"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              className="footer-btn-share"
              onClick={handleShare}
              aria-label="Share this job opportunity"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            {onNavigateToMessages && (
              <button
                type="button"
                className={`footer-btn-chat ${isApplied ? 'active' : 'locked'}`}
                onClick={() => {
                  if (isApplied) {
                    onClose()
                    onNavigateToMessages(job.company, job.companyId)
                  }
                }}
                disabled={!isApplied}
                title={isApplied ? 'Chat with practice recruitment team' : 'Apply first to unlock direct recruiter chat'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
                <span>{isApplied ? 'Message Team' : 'Chat (Apply First)'}</span>
              </button>
            )}
          </div>

          <div className="footer-right-actions">
            <button
              type="button"
              className="footer-btn-cancel"
              onClick={onClose}
            >
              Close
            </button>

            <button
              type="button"
              className={`footer-btn-apply ${isApplied ? 'applied' : ''} ${isApplying ? 'loading' : ''}`}
              onClick={handleApplyClick}
              disabled={isApplied || isApplying}
              aria-label={isApplied ? 'Application already submitted' : `Apply now for ${job.title}`}
            >
              {isApplied ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Applied</span>
                </>
              ) : isApplying ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <span>Apply Now</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default JobDetailsModal
