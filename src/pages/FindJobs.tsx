import { useState, useMemo, type FC } from 'react'
import { useTalentDashboard, type RecommendedJob, type TalentProfileInfo } from './useTalentDashboard'
import './FindJobs.css'

export interface FindJobsProps {
  jobs?: RecommendedJob[]
  loading?: boolean
  applyingJobId?: string | null
  onApply?: (job: RecommendedJob) => Promise<void>
  onSave?: (job: RecommendedJob) => void
  savedJobIds?: Set<string>
  appliedJobIds?: Set<string>
  profile?: TalentProfileInfo
  onNavigateToMessages?: (companyName?: string, companyId?: string) => void
}

type WorkModeFilter = 'all' | 'On-site' | 'Hybrid' | 'Remote'
type FitFilter = 'all' | '80' | '70'
type SortOption = 'fit' | 'recent'

export const FindJobs: FC<FindJobsProps> = (props) => {
  // If props are passed from TalentDashboard, use them; otherwise fallback to the real hook
  const dashboardData = useTalentDashboard()

  const jobs = props.jobs ?? dashboardData.recommendedJobs
  const loading = props.loading ?? dashboardData.loading
  const applyingJobId = props.applyingJobId ?? dashboardData.applyingJobId
  const onApply = props.onApply ?? (async (j: RecommendedJob) => { await dashboardData.applyForJob(j) })
  const onSave = props.onSave ?? dashboardData.toggleSaveJob
  const savedJobIds = props.savedJobIds ?? dashboardData.savedJobIds
  const appliedJobIds = props.appliedJobIds ?? dashboardData.appliedJobIds

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [workModeFilter, setWorkModeFilter] = useState<WorkModeFilter>('all')
  const [fitFilter, setFitFilter] = useState<FitFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('fit')

  // Selected job for right-hand dossier inspector
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const getCompanyInitials = (name: string): string => {
    if (!name) return 'AEC'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'high'
    if (score >= 80) return 'medium'
    return 'low'
  }

  // Filtered & Sorted Jobs from real database
  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    // 1. Search Query (Title, Company, Skills, Category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      )
    }

    // 2. Location filter
    if (locationQuery.trim()) {
      const lq = locationQuery.toLowerCase().trim()
      result = result.filter((j) => j.location.toLowerCase().includes(lq))
    }

    // 3. Work Mode filter
    if (workModeFilter !== 'all') {
      result = result.filter(
        (j) => (j.workType || '').toLowerCase() === workModeFilter.toLowerCase()
      )
    }

    // 4. Fit Score filter
    if (fitFilter === '80') {
      result = result.filter((j) => j.fitScore >= 80)
    } else if (fitFilter === '70') {
      result = result.filter((j) => j.fitScore >= 70)
    }

    // 5. Sorting
    if (sortBy === 'fit') {
      result.sort((a, b) => b.fitScore - a.fitScore)
    } else if (sortBy === 'recent') {
      result.sort((a, b) => {
        const da = a.postedDate ? new Date(a.postedDate).getTime() : 0
        const db = b.postedDate ? new Date(b.postedDate).getTime() : 0
        return db - da
      })
    }

    return result
  }, [jobs, searchQuery, locationQuery, workModeFilter, fitFilter, sortBy])

  // Pagination State (5 jobs per page for optimal split-view ergonomics)
  const PAGE_SIZE = 5
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Sliced jobs for the current page (with auto-clamping so filter changes keep page valid)
  const totalItems = filteredJobs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems)

  const paginatedJobs = useMemo(() => {
    return filteredJobs.slice(startIndex, endIndex)
  }, [filteredJobs, startIndex, endIndex])

  // Active job currently displayed in the right dossier inspector
  const activeJob = useMemo(() => {
    if (paginatedJobs.length === 0) {
      if (filteredJobs.length === 0) return null
      return filteredJobs[0]
    }
    if (selectedJobId) {
      const foundInFiltered = filteredJobs.find((j) => j.id === selectedJobId)
      if (foundInFiltered) return foundInFiltered
    }
    return paginatedJobs[0]
  }, [filteredJobs, paginatedJobs, selectedJobId])

  const isApplied = (id: string) => appliedJobIds.has(id)
  const isSaved = (id: string) => savedJobIds.has(id)

  return (
    <div className="find-jobs-wrapper">
      {/* ── Page Header ── */}
      <div className="find-jobs-page-header">
        <div className="header-badge-row">
          <span className="ai-rec-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            AI RECOMMENDATION RADAR
          </span>
          <span className="live-jobs-pill">
            <span className="live-dot" />
            {jobs.length} Active Positions
          </span>
        </div>
        <h1 className="find-jobs-page-title">Find AEC & BIM Jobs</h1>
        <p className="find-jobs-page-desc">
          Browse real job openings from verified AEC practices, matched directly to your technical profile, software stack, and preferred work mode.
        </p>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="find-jobs-filter-panel">
        <div className="search-bar-row">
          <div className="search-input-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by role, company, skills (e.g. Revit, BIM, Structural)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="location-input-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              placeholder="City, State, or Remote..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            {locationQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setLocationQuery('')}
                aria-label="Clear location"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills & Sort Options */}
        <div className="filter-controls-row">
          <div className="filter-pill-group">
            <span className="filter-group-label">Work Mode:</span>
            {(['all', 'On-site', 'Hybrid', 'Remote'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`filter-pill-btn ${workModeFilter === mode ? 'active' : ''}`}
                onClick={() => setWorkModeFilter(mode)}
              >
                {mode === 'all' ? 'All Modes' : mode}
              </button>
            ))}
          </div>

          <div className="filter-pill-group">
            <span className="filter-group-label">Match Fit:</span>
            <button
              type="button"
              className={`filter-pill-btn ${fitFilter === 'all' ? 'active' : ''}`}
              onClick={() => setFitFilter('all')}
            >
              All Fits
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${fitFilter === '80' ? 'active' : ''}`}
              onClick={() => setFitFilter('80')}
            >
              80%+ Fit
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${fitFilter === '70' ? 'active' : ''}`}
              onClick={() => setFitFilter('70')}
            >
              70%+ Fit
            </button>
          </div>

          <div className="sort-box">
            <span className="filter-group-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="fit">Highest Match %</option>
              <option value="recent">Recently Posted</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Split Viewport (Left Cards Feed + Right Dossier Inspector) ── */}
      {loading ? (
        <div className="loading-grid">
          <div className="job-card-skeleton" style={{ height: '170px' }} />
          <div className="job-card-skeleton" style={{ height: '170px' }} />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="find-jobs-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <h3>No matching positions found</h3>
          <p>Try adjusting your search keywords, clearing location filters, or switching work modes.</p>
          {(searchQuery || locationQuery || workModeFilter !== 'all' || fitFilter !== 'all') && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchQuery('')
                setLocationQuery('')
                setWorkModeFilter('all')
                setFitFilter('all')
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="find-jobs-split-container">
          {/* ── LEFT COLUMN: Job Requisition Cards ── */}
          <div className="jobs-feed-column">
            <div className="feed-status-bar">
              <span className="feed-count-text">
                Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'}
              </span>
            </div>

            <div className="feed-list">
              {paginatedJobs.map((job) => {
                const isSelected = activeJob?.id === job.id
                const applied = isApplied(job.id)
                const saved = isSaved(job.id)

                return (
                  <article
                    key={job.id}
                    className={`find-job-card ${isSelected ? 'active-selection' : ''}`}
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    {isSelected && <div className="card-selection-indicator" />}

                    <div className="card-body">
                      {job.companyLogoUrl ? (
                        <div className="card-logo-box">
                          <img src={job.companyLogoUrl} alt={job.company} className="card-logo-img" />
                        </div>
                      ) : (
                        <div className="card-avatar-box">
                          {getCompanyInitials(job.company)}
                        </div>
                      )}

                      <div className="card-content-area">
                        {/* Match Reasons + Fit Score Pill inline */}
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
                              <circle cx="12" cy="12" r="6" />
                              <circle cx="12" cy="12" r="2" fill="currentColor" />
                            </svg>
                            <span className={`fit-val ${getScoreColor(job.fitScore)}`}>
                              {job.fitScore}% FIT
                            </span>
                          </div>
                        </div>

                        <h3 className="card-job-title">{job.title}</h3>
                        <p className="card-job-company">{job.company} • {job.location}</p>

                        <div className="card-meta-pills">
                          <span className="meta-pill">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="13" height="13" aria-hidden="true">
                              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                            </svg>
                            {job.workType}
                          </span>
                          {job.experience && (
                            <span className="meta-pill">{job.experience}</span>
                          )}
                          {job.salaryText && (
                            <span className="meta-pill salary">{job.salaryText}</span>
                          )}
                        </div>

                        {job.skills.length > 0 && (
                          <div className="card-skills-row">
                            {job.skills.map((skill, sIdx) => (
                              <span className="skill-chip" key={sIdx}>{skill}</span>
                            ))}
                          </div>
                        )}

                        <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`btn-card-apply ${applied ? 'applied' : ''} ${applyingJobId === job.id ? 'loading' : ''}`}
                            onClick={() => !applied && onApply(job)}
                            disabled={applied || applyingJobId === job.id}
                          >
                            {applied ? (
                              <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" aria-hidden="true">
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
                            className={`btn-card-save ${saved ? 'saved' : ''}`}
                            onClick={() => onSave(job)}
                            aria-label={saved ? 'Remove from saved' : 'Save job'}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill={saved ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="2"
                              width="16"
                              height="16"
                              aria-hidden="true"
                            >
                              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                            </svg>
                            {saved ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="feed-pagination-bar">
                <div className="pagination-info">
                  Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalItems}</strong>
                </div>
                <div className="pagination-buttons">
                  <button
                    type="button"
                    className="pagination-btn prev"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    aria-label="Previous Page"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Prev
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`page-num-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pagination-btn next"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    aria-label="Next Page"
                  >
                    Next
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Detailed Job Requisition Inspector ── */}
          {activeJob && (
            <aside className="dossier-inspector-column">
              <div className="inspector-card">
                {/* Header Section */}
                <div className="inspector-header">
                  <div className="inspector-company-row">
                    {activeJob.companyLogoUrl ? (
                      <div className="inspector-logo-box">
                        <img src={activeJob.companyLogoUrl} alt={activeJob.company} className="inspector-logo-img" />
                      </div>
                    ) : (
                      <div className="inspector-avatar-box">
                        {getCompanyInitials(activeJob.company)}
                      </div>
                    )}

                    <div className="inspector-title-meta">
                      <div className="company-verified-row">
                        <span className="company-name-text">{activeJob.company}</span>
                        <span className="verified-badge" title="Verified AEC Practice">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          Verified Partner
                        </span>
                      </div>
                      <h2 className="inspector-job-title">{activeJob.title}</h2>
                      <p className="inspector-location-text">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {activeJob.location} • {activeJob.workType}
                      </p>
                    </div>
                  </div>

                  {/* Primary CTA Cluster */}
                  <div className="inspector-cta-bar">
                    <button
                      type="button"
                      className={`btn-inspector-apply ${isApplied(activeJob.id) ? 'applied' : ''} ${applyingJobId === activeJob.id ? 'loading' : ''}`}
                      onClick={() => !isApplied(activeJob.id) && onApply(activeJob)}
                      disabled={isApplied(activeJob.id) || applyingJobId === activeJob.id}
                    >
                      {isApplied(activeJob.id) ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Application Submitted
                        </>
                      ) : applyingJobId === activeJob.id ? (
                        'Submitting Application...'
                      ) : (
                        'Apply for Position'
                      )}
                    </button>

                    <button
                      type="button"
                      className={`btn-inspector-save ${isSaved(activeJob.id) ? 'saved' : ''}`}
                      onClick={() => onSave(activeJob)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={isSaved(activeJob.id) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                        aria-hidden="true"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                      {isSaved(activeJob.id) ? 'Saved' : 'Save'}
                    </button>

                    {props.onNavigateToMessages && (
                      <button
                        type="button"
                        className={`btn-inspector-msg ${isApplied(activeJob.id) ? 'enabled' : 'disabled'}`}
                        onClick={() => {
                          if (isApplied(activeJob.id)) {
                            props.onNavigateToMessages?.(activeJob.company, activeJob.companyId)
                          }
                        }}
                        disabled={!isApplied(activeJob.id)}
                        title={
                          isApplied(activeJob.id)
                            ? `Chat with ${activeJob.company}`
                            : `Apply for this position to unlock direct chat with ${activeJob.company}`
                        }
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                          {isApplied(activeJob.id) ? (
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                          ) : (
                            <>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </>
                          )}
                        </svg>
                        {isApplied(activeJob.id) ? 'Message Studio' : 'Chat (Apply first)'}
                      </button>
                    )}
                  </div>

                  {/* Messaging status hint */}
                  {!isApplied(activeJob.id) ? (
                    <div className="inspector-msg-hint locked">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
                      <span>Direct messaging unlocks once you submit an application to {activeJob.company}.</span>
                    </div>
                  ) : (
                    <div className="inspector-msg-hint active">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                      <span>Application submitted! Direct messaging with {activeJob.company} is active.</span>
                    </div>
                  )}
                </div>

                {/* ── Key Job Metrics Grid ── */}
                <div className="inspector-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Work Mode</span>
                    <span className="metric-value">{activeJob.workType}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Experience</span>
                    <span className="metric-value">{activeJob.experience || 'Not Specified'}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Compensation</span>
                    <span className="metric-value green">{activeJob.salaryText || 'Competitive'}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Discipline</span>
                    <span className="metric-value">{activeJob.category || 'BIM / AEC'}</span>
                  </div>
                </div>

                {/* ── AI Recommendation Fit Analysis ── */}
                <div className="inspector-fit-card">
                  <div className="fit-header-row">
                    <div className="fit-heading">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                      </svg>
                      <span>AI Recommendation Overlap</span>
                    </div>
                    <span className={`fit-score-badge ${getScoreColor(activeJob.fitScore)}`}>
                      {activeJob.fitScore}% Match
                    </span>
                  </div>

                  <div className="fit-reasons-list">
                    {activeJob.matchReasons.map((reason, idx) => (
                      <span className="fit-reason-chip" key={idx}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {reason}
                      </span>
                    ))}
                  </div>

                  {activeJob.skills.length > 0 && (
                    <div className="matched-skills-section">
                      <span className="matched-skills-title">Matched Software & Stack:</span>
                      <div className="matched-skills-tags">
                        {activeJob.skills.map((skill, idx) => (
                          <span className="tech-badge" key={idx}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Real Job Description from Database ── */}
                <div className="inspector-section">
                  <h3 className="section-title">Job Description</h3>
                  <div className="description-text">
                    {activeJob.description ? (
                      activeJob.description.split('\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))
                    ) : (
                      <p>
                        Leading coordination workflows, architectural model delivery, and project documentation across multidisciplinary AEC teams.
                      </p>
                    )}
                  </div>
                </div>

                {/* ── About the Employer / Practice ── */}
                <div className="inspector-section employer-info-box">
                  <h3 className="section-title">About the Practice</h3>
                  <div className="employer-card-inner">
                    <div className="employer-identity">
                      <strong>{activeJob.company}</strong>
                      <span>{activeJob.location} • Verified AEC Network Partner</span>
                    </div>
                    <span className="aec-verified-pill">ISO 19650 Active</span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  )
}

export default FindJobs
