import type { FC } from 'react'
import './SavedJobs.css'
import {
  useSavedJobs,
  type SavedJobItem,
  type SavedDriveItem,
} from './useSavedJobs'
import type { RecommendedJob, TalentProfileInfo } from './useTalentDashboard'

interface SavedJobsProps {
  onNavigateToFindJobs?: () => void
  jobs?: RecommendedJob[]
  loading?: boolean
  profile?: TalentProfileInfo
  savedJobIds?: Set<string>
  appliedJobIds?: Set<string>
  onSave?: (job: RecommendedJob) => void
  onApply?: (job: RecommendedJob) => Promise<void>
}

const SavedJobs: FC<SavedJobsProps> = (props) => {
  const { onNavigateToFindJobs } = props

  const {
    loading,
    activeJobs,
    savedDrives,
    filteredJobs,
    upcomingDeadlines,
    urgentClosingJob,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedDiscipline,
    setSelectedDiscipline,
    sortBy,
    setSortBy,
    selectedJobIds,
    toggleSelectAll,
    toggleSelectJob,
    removeSavedJob,
    removeSavedDrive,
    handleQuickApply,
    handleBulkApply,
    appliedJobIds,
    toastMessage,
  } = useSavedJobs(props)

  const disciplines = ['All', 'Structural', 'BIM Management', 'Computational', 'Architecture', 'MEP']

  return (
    <div className="saved-jobs-page">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <aside className="saved-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Top Header & Telemetry Index */}
      <header className="saved-header-wrap">
        <div className="saved-header-left">
          <div className="telemetry-badges">
            <span className="tech-badge-primary">PORTAL_SAVED // INDEX</span>
            <span className="tech-badge-subtle">AEC TALENT REPOSITORY</span>
          </div>
          <h1 className="saved-title">Saved Opportunities</h1>
          <p className="saved-subtitle">
            Manage your bookmarked opportunities, monitor application deadlines, and coordinate technical submissions.
          </p>
        </div>

        {/* Segmented Tab Navigation */}
        <nav className="segmented-tabs-bar" aria-label="Saved views">
          <button
            type="button"
            className={`segment-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
            aria-selected={activeTab === 'saved'}
          >
            <svg viewBox="0 0 24 24" fill={activeTab === 'saved' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Saved Jobs
            <span className={`segment-pill ${activeTab === 'saved' ? '' : 'muted'}`}>
              {activeJobs.length}
            </span>
          </button>

          <button
            type="button"
            className={`segment-btn ${activeTab === 'drives' ? 'active' : ''}`}
            onClick={() => setActiveTab('drives')}
            aria-selected={activeTab === 'drives'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Walk-in Drives
            <span className={`segment-pill ${activeTab === 'drives' ? '' : 'muted'}`}>
              {savedDrives.length}
            </span>
          </button>

          {/* <button
            type="button"
            className={`segment-btn ${activeTab === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveTab('archived')}
            aria-selected={activeTab === 'archived'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            Archived & Expired
            <span className={`segment-pill ${activeTab === 'archived' ? '' : 'muted'}`}>
              {archivedJobs.length}
            </span>
          </button> */}
        </nav>
      </header>

      {/* Filter and Command Search Console */}
      {activeTab !== 'drives' && (
        <section className="saved-filter-console" aria-label="Search and filter options">
          <div className="saved-search-input-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter bookmarked roles by title, company, or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search saved roles"
            />
          </div>

          <div className="filter-actions-group">
            {/* Discipline Filter Chips */}
            <div className="chips-bar" role="group" aria-label="Filter by discipline">
              {disciplines.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`chip-btn ${selectedDiscipline === d ? 'active' : ''}`}
                  onClick={() => setSelectedDiscipline(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-dropdown-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
              </svg>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'closing-soonest' | 'highest-match' | 'recently-saved' | 'highest-comp'
                  )
                }
                aria-label="Sort options"
              >
                <option value="closing-soonest">Closing Soonest</option>
                <option value="highest-match">Highest Match Score</option>
                <option value="recently-saved">Recently Saved</option>
                <option value="highest-comp">Highest Compensation</option>
              </select>
            </div>

            {/* Select All Toggle Button */}
            {activeTab === 'saved' && filteredJobs.length > 0 && (
              <button
                type="button"
                className="btn-bulk-select"
                onClick={toggleSelectAll}
                title="Toggle Select All"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  {selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0 && (
                    <polyline points="9 11 12 14 22 4" />
                  )}
                </svg>
                {selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0
                  ? 'Deselect All'
                  : `Select All (${filteredJobs.length})`}
              </button>
            )}

            {/* Bulk Action Button */}
            {activeTab === 'saved' && selectedJobIds.length > 0 && (
              <button
                type="button"
                className="btn-quick-apply"
                onClick={handleBulkApply}
                title="Apply to all selected jobs"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Apply ({selectedJobIds.length})
              </button>
            )}
          </div>
        </section>
      )}

      {/* Main Fluid Grid (Left stream, Right telemetry sidebar) */}
      <main className="saved-grid-container">
        {/* LEFT COLUMN: Saved Opportunities */}
        <section className="saved-stream" aria-label="Bookmarked Opportunities">
          {/* Dynamic Urgent Closing Banner (Only displayed if an active saved job is closing soon) */}
          {activeTab === 'saved' && urgentClosingJob && (
            <aside className="critical-closing-banner">
              <div className="closing-banner-inner">
                <div className="closing-banner-content">
                  <div className="closing-icon-badge" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="closing-info">
                    <div className="closing-tag-row">
                      <span className="tag-urgent">Action Required</span>
                      <span className="tag-deadline">CLOSING SOON</span>
                    </div>
                    <h2 className="closing-job-title">
                      {urgentClosingJob.title} at {urgentClosingJob.company}
                    </h2>
                    <p className="closing-job-desc">
                      Technical alignment evaluated at <span className="score-highlight">{urgentClosingJob.matchScore}%</span> against your AEC verified credentials.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-closing-apply"
                  onClick={() => handleQuickApply(urgentClosingJob.jobId, urgentClosingJob.title, urgentClosingJob.companyId)}
                >
                  Apply Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </aside>
          )}

          {/* Shimmer Effect while loading */}
          {loading ? (
            <div className="saved-shimmer-container" aria-label="Loading saved opportunities...">
              {[1, 2, 3].map((itemIndex) => (
                <div key={itemIndex} className="saved-shimmer-card">
                  <div className="job-card-top-row">
                    <div className="job-brand-wrap" style={{ flex: 1 }}>
                      <div className="shimmer-elem shimmer-logo-box" />
                      <div className="job-headline-info" style={{ flex: 1 }}>
                        <div className="shimmer-elem shimmer-badge-row" />
                        <div className="shimmer-elem shimmer-title-line" />
                        <div className="shimmer-elem shimmer-meta-line" />
                      </div>
                    </div>
                    <div className="shimmer-elem shimmer-fit-pill" />
                  </div>
                  <div className="shimmer-elem shimmer-stack-strip" />
                  <div className="shimmer-actions-row">
                    <div className="shimmer-elem shimmer-btn-outline" />
                    <div className="shimmer-elem shimmer-btn-outline" />
                    <div className="shimmer-elem shimmer-btn-apply" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'saved' || activeTab === 'archived' ? (
            /* Active & Archived Jobs Stream */
            filteredJobs.length === 0 ? (
              <div className="empty-saved-state">
                <div className="empty-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="empty-title">
                  {activeTab === 'archived' ? 'No Archived Jobs' : 'No Saved Jobs Found'}
                </h3>
                <p className="empty-desc">
                  {searchQuery
                    ? `No opportunities match "${searchQuery}". Try adjusting your filters.`
                    : activeTab === 'archived'
                    ? 'You have no expired or closed saved positions.'
                    : 'You have not bookmarked any active jobs yet. Browse openings to save roles for quick review.'}
                </p>
                {onNavigateToFindJobs && activeTab === 'saved' && (
                  <button type="button" className="btn-browse-jobs" onClick={onNavigateToFindJobs}>
                    Browse AEC Openings
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job: SavedJobItem) => {
                const isSelected = selectedJobIds.includes(job.jobId)
                const isApplied = appliedJobIds.includes(job.jobId)

                return (
                  <article
                    key={job.id}
                    className={`saved-job-card ${isSelected ? 'selected' : ''}`}
                    aria-labelledby={`job-title-${job.id}`}
                  >
                    <div className="job-card-top-row">
                      <div className="job-brand-wrap">
                        {/* Company Logo Image or Fallback Initials */}
                        {job.companyLogoUrl ? (
                          <div className="company-logo-box">
                            <img src={job.companyLogoUrl} alt={job.company} className="company-logo-img" />
                          </div>
                        ) : (
                          <div
                            className={`company-badge ${job.companyColor}`}
                            aria-label={`${job.company} monogram`}
                          >
                            {job.companyInitials}
                          </div>
                        )}

                        <div className="job-headline-info">
                          {/* Match Reasons + Fit Score Pill aligned exactly with FindJobs */}
                          <div className="card-badge-row">
                            {job.matchReasons.map((reason, rIdx) => (
                              <span className="reason-tag" key={rIdx}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {reason}
                              </span>
                            ))}

                            <div className="fit-pill">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="fit-icon" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="6" />
                                <circle cx="12" cy="2" fill="currentColor" />
                              </svg>
                              <span className="fit-val high">
                                {job.matchScore}% FIT
                              </span>
                            </div>
                          </div>

                          <div className="job-title-row">
                            <h2 id={`job-title-${job.id}`} className="job-title-text">
                              {job.title}
                            </h2>
                            {job.closingBadge && (
                              <span
                                className={`closing-pill ${
                                  job.closingBadge.isUrgent ? 'urgent' : ''
                                }`}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {job.closingBadge.text}
                              </span>
                            )}
                          </div>

                          <div className="job-meta-line">
                            <span className="company-name">{job.company}</span>
                            <span className="meta-dot" aria-hidden="true" />
                            <span className="loc-span">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {job.location} ({job.workType})
                            </span>
                            <span className="meta-dot" aria-hidden="true" />
                            <span className="salary-tag">{job.salary}</span>
                          </div>
                        </div>
                      </div>

                      {/* Saved Time Tag & Circular Fit Visual */}
                      <div className="fit-score-box">
                        <div className="score-visual-pill" title={`${job.matchScore}% Match`}>
                          <svg className="circle-progress-svg" viewBox="0 0 36 36" aria-hidden="true">
                            <circle
                              className="circle-bg"
                              cx="18"
                              cy="18"
                              r="15.9155"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                            />
                            <circle
                              className="circle-fill"
                              cx="18"
                              cy="18"
                              r="15.9155"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              strokeDasharray={`${job.matchScore}, 100`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="score-text-block">
                            <span className="score-percent">{job.matchScore}%</span>
                            <span className="score-label">{job.matchLabel}</span>
                          </div>
                        </div>
                        <span className="saved-time-tag">{job.savedDate}</span>
                      </div>
                    </div>

                    {/* Software Stack Strip */}
                    <div className="stack-strip">
                      <span className="stack-label">STACK:</span>
                      {job.stack.map((item) => (
                        <span className="stack-chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>

                    {/* Action Deck */}
                    <div className="card-action-deck">
                      <div className="action-deck-left">
                        {activeTab === 'saved' && (
                          <button
                            type="button"
                            className="btn-icon-saved"
                            onClick={() => toggleSelectJob(job.jobId)}
                            aria-label={isSelected ? 'Deselect job' : 'Select job'}
                            title={isSelected ? 'Selected' : 'Select for bulk action'}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-action-danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            void removeSavedJob(job.id, job.jobId, job.title)
                          }}
                          aria-label={`Remove ${job.title} from saved jobs`}
                          title="Remove bookmark"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="action-deck-right">
                        {onNavigateToFindJobs && (
                          <button
                            type="button"
                            className="btn-view-pos"
                            onClick={onNavigateToFindJobs}
                          >
                            View Details
                          </button>
                        )}

                        <button
                          type="button"
                          className={`btn-quick-apply ${isApplied ? 'applied' : ''}`}
                          onClick={() => handleQuickApply(job.jobId, job.title, job.companyId)}
                          disabled={isApplied || job.isExpired}
                          aria-label={isApplied ? 'Already applied' : `Quick apply to ${job.title}`}
                        >
                          {isApplied ? (
                            <>
                              Applied
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </>
                          ) : job.isExpired ? (
                            'Position Closed'
                          ) : (
                            <>
                              Quick Apply
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            )
          ) : (
            /* Saved Walk-in Drives View */
            <div className="saved-drives-list">
              {savedDrives.length === 0 ? (
                <div className="empty-saved-state">
                  <div className="empty-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h3 className="empty-title">No Saved Walk-in Drives</h3>
                  <p className="empty-desc">
                    You have not saved any upcoming walk-in hiring drives yet. Explore the Walk-in Drives section to bookmark in-person hiring events.
                  </p>
                </div>
              ) : (
                savedDrives.map((drive: SavedDriveItem) => (
                  <article key={drive.id} className="saved-job-card">
                    <div className="job-card-top-row">
                      <div className="job-brand-wrap">
                        <div className="company-badge primary">{drive.companyInitials}</div>
                        <div className="job-headline-info">
                          <div className="job-title-row">
                            <h2 className="job-title-text">{drive.title}</h2>
                            {drive.isUrgent && <span className="closing-pill urgent">Urgent Hiring</span>}
                          </div>
                          <div className="job-meta-line">
                            <span className="company-name">{drive.company}</span>
                            <span className="meta-dot" aria-hidden="true" />
                            <span className="loc-span">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              </svg>
                              {drive.location}
                            </span>
                            <span className="meta-dot" aria-hidden="true" />
                            <span className="tech-badge-primary">{drive.numberOpenings} Openings</span>
                          </div>
                        </div>
                      </div>

                      <div className="fit-score-box">
                        <span className="closing-pill urgent" style={{ fontSize: '12px' }}>
                          📅 {drive.dateFormatted}
                        </span>
                        <span className="saved-time-tag">{drive.savedDate}</span>
                      </div>
                    </div>

                    <div className="stack-strip">
                      <span className="stack-label">REQUIRED SKILLS:</span>
                      {drive.skills.map((s) => (
                        <span className="stack-chip" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="card-action-deck">
                      <div className="action-deck-left">
                        <button
                          type="button"
                          className="btn-action-danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            void removeSavedDrive(drive.id, drive.driveId, drive.title)
                          }}
                          aria-label={`Remove ${drive.title} from saved drives`}
                          title="Remove bookmark"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>

                      <div className="action-deck-right">
                        <button
                          type="button"
                          className="btn-quick-apply"
                          onClick={() => alert(`Venue details: ${drive.location}`)}
                        >
                          View Venue Info
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Analytical Telemetry & Real Deadlines */}
        <aside className="saved-sidebar" aria-label="Market and Deadline Telemetry">
          {loading ? (
            <>
              <div className="analytics-widget saved-shimmer-widget">
                <div className="shimmer-elem shimmer-widget-header" />
                <div className="shimmer-elem shimmer-widget-metric" />
                <div className="shimmer-elem shimmer-widget-btn" />
              </div>
              <div className="analytics-widget saved-shimmer-widget">
                <div className="shimmer-elem shimmer-widget-header" />
                <div className="shimmer-elem shimmer-widget-item" />
                <div className="shimmer-elem shimmer-widget-item" />
              </div>
            </>
          ) : (
            <>
              {/* Real Telemetry Overview Widget */}
              <div className="analytics-widget">
                <div className="widget-header">
                  <div className="widget-title-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <h3 className="widget-title">Saved Overview</h3>
                  </div>
                  <span className="widget-badge accent">LIVE</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Active Bookmarks</span>
                  <div className="metric-main-row">
                    <span className="metric-number">{activeJobs.length + savedDrives.length}</span>
                    <span className="metric-diff" style={{ color: '#00418f' }}>
                      {activeJobs.length} Jobs • {savedDrives.length} Drives
                    </span>
                  </div>
                  <p className="metric-subtext">
                    {appliedJobIds.length} application{appliedJobIds.length === 1 ? '' : 's'} submitted across saved positions.
                  </p>
                </div>

                {onNavigateToFindJobs && (
                  <button
                    type="button"
                    className="btn-action-outline"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px 14px' }}
                    onClick={onNavigateToFindJobs}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Browse More Openings
                  </button>
                )}
              </div>

              {/* Real Closing Deadlines Widget */}
              <div className="analytics-widget">
                <div className="widget-header">
                  <div className="widget-title-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <h3 className="widget-title">Upcoming Dates</h3>
                  </div>
                  <span className="widget-badge pill">
                    {upcomingDeadlines.length} Active
                  </span>
                </div>

                {upcomingDeadlines.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: '#727784', lineHeight: '20px' }}>
                    All bookmarked opportunities have open deadlines with no immediate closures.
                  </p>
                ) : (
                  <div className="deadlines-list">
                    {upcomingDeadlines.map((dl) => (
                      <div className="deadline-item" key={dl.id}>
                        <div className="deadline-info">
                          <strong className="deadline-company">{dl.company}</strong>
                          <span className="deadline-role">{dl.role}</span>
                        </div>
                        <span className={`deadline-pill ${dl.urgency}`}>{dl.daysLeftText}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  )
}

export default SavedJobs
