import { useState, type FC, type ChangeEvent, type FormEvent } from 'react'
import {
  useApplicants,
  type ApplicantItem,
  type ApplicationDBStatus,
  type SortOption,
} from '../hooks/useApplicants'
import { CustomSortDropdown, type SortOptionItem } from '../components/CustomSortDropdown'
import { CandidateStatusDropdown } from '../components/CandidateStatusDropdown'
import './ApplicantsEmployer.css'

export interface ApplicantsEmployerProps {
  onBrowseJobs?: () => void
  initialJobFilter?: { id?: string; title?: string } | null
  onClearJobFilter?: () => void
  onViewJobPost?: (jobId?: string, jobTitle?: string) => void
}

const APPLICANT_SORT_OPTIONS: SortOptionItem<SortOption>[] = [
  {
    value: 'recent',
    label: 'Application Date',
    icon: 'schedule',
    description: 'Most recently submitted applications first',
  },
  {
    value: 'match',
    label: 'Highest Match Score',
    icon: 'auto_awesome',
    description: 'Rank by job qualification fit',
  },
  {
    value: 'name',
    label: 'Candidate Name (A-Z)',
    icon: 'sort_by_alpha',
    description: 'Alphabetical directory order',
  },
  {
    value: 'experience',
    label: 'Skills Depth',
    icon: 'psychology',
    description: 'Rank by verified technical proficiencies',
  },
]

export const ApplicantsEmployer: FC<ApplicantsEmployerProps> = ({
  onBrowseJobs,
  initialJobFilter,
  onClearJobFilter,
  onViewJobPost,
}) => {
  const {
    loading,
    companyName,
    filteredApplicants,
    selectedStage,
    setSelectedStage,
    searchQuery,
    setSearchQuery,
    selectedRequisition,
    setSelectedRequisition,
    availableRequisitions,
    sortBy,
    setSortBy,
    metrics,
    selectedApplicant,
    setSelectedApplicant,
    toastMessage,
    upcomingInterviews,
    updateApplicationStatus,
    toggleStarApplicant,
    scheduleInterview,
    sendCandidateMessage,
    exportDossierCSV,
    refreshApplicants,
  } = useApplicants(initialJobFilter)

  // Modal states
  const [chatCandidate, setChatCandidate] = useState<ApplicantItem | null>(null)
  const [chatMessageText, setChatMessageText] = useState<string>('')
  const [interviewCandidate, setInterviewCandidate] = useState<ApplicantItem | null>(null)
  const [interviewDate, setInterviewDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000)
    return tomorrow.toISOString().slice(0, 10)
  })
  const [interviewTime, setInterviewTime] = useState<string>('11:00')
  const [interviewType, setInterviewType] = useState<'Technical Review' | 'Portfolio Deep-Dive' | 'Cultural Fit'>('Technical Review')
  const [locationType, setLocationType] = useState<'Video Call' | 'In-Person'>('Video Call')
  const [locationValue, setLocationValue] = useState<string>('https://meet.google.com/')
  const [isSubmittingInterview, setIsSubmittingInterview] = useState<boolean>(false)

  // Resume PDF preview modal
  const [previewResumeUrl, setPreviewResumeUrl] = useState<string | null>(null)
  const [previewCandidateName, setPreviewCandidateName] = useState<string>('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(6)

  const totalPages = Math.max(1, Math.ceil((filteredApplicants?.length || 0) / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const paginatedApplicants = (filteredApplicants || []).slice(startIndex, startIndex + itemsPerPage)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleRequisitionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedRequisition(val)
    setCurrentPage(1)
    if (val === 'all' && onClearJobFilter) {
      onClearJobFilter()
    }
  }

  const currentSelectedReqObj = availableRequisitions.find(
    (r) => r.id.toLowerCase() === selectedRequisition.toLowerCase() || r.title.toLowerCase() === selectedRequisition.toLowerCase()
  )
  const selectedReqTitle = currentSelectedReqObj ? currentSelectedReqObj.title : selectedRequisition

  const handleSendDirectMessage = async () => {
    if (!chatMessageText.trim() || !chatCandidate) return
    await sendCandidateMessage(chatCandidate.candidateId, chatMessageText)
    setChatMessageText('')
    setChatCandidate(null)
  }

  const handleScheduleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!interviewCandidate) return
    setIsSubmittingInterview(true)

    await scheduleInterview({
      candidateId: interviewCandidate.candidateId,
      jobApplicationId: interviewCandidate.id,
      interviewDate,
      interviewTime,
      interviewType,
      locationType,
      locationValue,
    })

    setIsSubmittingInterview(false)
    setInterviewCandidate(null)
  }

  return (
    <main className="emp-applicants-page" aria-label="Applicant Management & Pipeline">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="app-toast" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Telemetry & Operational Live Sync Bar ── */}
      <section className="app-telemetry-bar" aria-label="Operational Live Sync Status">
        <div className="app-telemetry-left">
          <span className="telemetry-tag-active">
            <span className="telemetry-pulse" aria-hidden="true"></span>
            POSTGRESQL TALENT REPO
          </span>
          <span className="telemetry-slash">/</span>
          <span className="telemetry-pill">{companyName.toUpperCase()}</span>
          <span className="telemetry-slash">/</span>
          <span className="telemetry-pill">PIPELINE ENGINE: LIVE</span>
          <span className="telemetry-slash">•</span>
          <span className="telemetry-cand-id">
            DATABASE: <strong>SUPABASE CONNECTED</strong>
          </span>
        </div>

        <div className="app-telemetry-right">
          <button
            type="button"
            className="telemetry-refresh-btn"
            onClick={refreshApplicants}
            title="Refresh database records"
            aria-label="Refresh database records"
          >
            <span className={`material-symbols-outlined ${loading ? 'spin-icon' : ''}`} aria-hidden="true">
              sync
            </span>
            <span>{loading ? 'SYNCING...' : 'SYNC REPO'}</span>
          </button>
        </div>
      </section>

      {/* ── 2. Page Header & Action Area ── */}
      <section className="app-header-area">
        <div>
          <div className="app-header-meta">
            <span className="meta-pill-primary">ENTERPRISE TALENT ACQUISITION</span>
            <span className="meta-pill-rev">{companyName}</span>
          </div>
          <h1 className="app-header-title">Applicant Management &amp; Pipeline</h1>
          <p className="app-header-desc">
            Manage candidates across your active requisitions. Review candidate dossiers, inspect uploaded resumes,
            schedule technical interviews, and advance hiring stages.
          </p>
        </div>

        <div className="app-header-actions">
          <button
            type="button"
            className="btn-dossier-secondary"
            onClick={exportDossierCSV}
            title="Export filtered applicants as CSV"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              download
            </span>
            <span>Export Dossier (CSV)</span>
          </button>
          {onBrowseJobs && (
            <button
              type="button"
              className="btn-dossier-primary"
              onClick={onBrowseJobs}
              title="Browse Open Requisitions"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                work
              </span>
              <span>Manage Job Openings</span>
            </button>
          )}
        </div>
      </section>

      {/* ── 3. Metric Overview Cards (PostgreSQL Backed) ── */}
      <section className="app-metrics-grid" aria-label="Talent Pipeline Metrics">
        {/* Metric 1 */}
        <article className="app-metric-card">
          <div className="metric-bg-orb" aria-hidden="true"></div>
          <div className="app-metric-top">
            <span className="app-metric-label">Total Applications</span>
            <span className="app-metric-badge">All Time</span>
          </div>
          <div className="app-metric-value-row">
            <span className="app-metric-val">{String(metrics.totalCount).padStart(2, '0')}</span>
            <span className="app-metric-subtext">Received</span>
          </div>
          <div className="app-metric-progress-breakdown">
            <div className="app-metric-stages-labels">
              <span>{metrics.inReviewCount} In Review</span>
              <span>{metrics.shortlistedCount} Shortlisted</span>
              <span className="offer-highlight">{metrics.scheduledCount} Interviews</span>
            </div>
            <div className="app-metric-bar" aria-label="Pipeline distribution breakdown">
              <div
                className="bar-segment-1"
                style={{
                  width: `${metrics.totalCount ? (metrics.inReviewCount / metrics.totalCount) * 100 : 50}%`,
                }}
              ></div>
              <div
                className="bar-segment-2"
                style={{
                  width: `${metrics.totalCount ? (metrics.shortlistedCount / metrics.totalCount) * 100 : 25}%`,
                }}
              ></div>
              <div
                className="bar-segment-3"
                style={{
                  width: `${metrics.totalCount ? (metrics.scheduledCount / metrics.totalCount) * 100 : 25}%`,
                }}
              ></div>
            </div>
          </div>
        </article>

        {/* Metric 2 */}
        <article className="app-metric-card">
          <div className="app-metric-top">
            <span className="app-metric-label">Under Review</span>
            <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
              hourglass_top
            </span>
          </div>
          <div className="app-metric-value-row">
            <span className="app-metric-val highlight">{String(metrics.inReviewCount).padStart(2, '0')}</span>
            <span className="app-metric-subtext">Awaiting Action</span>
          </div>
          <div className="app-metric-sparkline-row">
            <span className="telemetry-pulse" style={{ background: '#0058bc' }} aria-hidden="true"></span>
            <span className="app-metric-footer-note">Pending Initial Screening</span>
          </div>
        </article>

        {/* Metric 3 */}
        <article className="app-metric-card">
          <div className="app-metric-top">
            <span className="app-metric-label">Interviews Scheduled</span>
            <span className="material-symbols-outlined text-tertiary" style={{ color: '#0058bc' }} aria-hidden="true">
              calendar_month
            </span>
          </div>
          <div className="app-metric-value-row">
            <span className="app-metric-val">{String(metrics.scheduledCount).padStart(2, '0')} Active</span>
            <span className="app-metric-subtext">Rounds Planned</span>
          </div>
          <div className="app-metric-sparkline-row">
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0058bc' }} aria-hidden="true">
              videocam
            </span>
            <span className="app-metric-footer-note">{upcomingInterviews.length} Upcoming in Calendar</span>
          </div>
        </article>

        {/* Metric 4 */}
        <article className="app-metric-card">
          <div className="app-metric-top">
            <span className="app-metric-label">Shortlisted &amp; Starred</span>
            <span className="material-symbols-outlined text-primary" style={{ color: '#d97706' }} aria-hidden="true">
              star
            </span>
          </div>
          <div className="app-metric-value-row">
            <span className="app-metric-val">{String(metrics.starredCount).padStart(2, '0')}</span>
            <span className="app-metric-subtext">Saved Favorites</span>
          </div>
          <div className="app-metric-footer-velocity">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">
              check
            </span>
            <span>{metrics.shortlistedCount} Total Shortlisted for Evaluation</span>
          </div>
        </article>
      </section>

      {/* ── 4. Main Workspace Area (2-Column Grid) ── */}
      <section className="app-workspace-grid">
        {/* Left Column: Pipeline Filter Bar & Detailed Application Cards */}
        <div className="app-pipeline-column">
          {/* Stage Filter Tabs & Search Header */}
          <div className="app-filter-box">
            {/* Stage Tabs */}
            <nav className="app-stage-tabs-row" role="tablist" aria-label="Candidate Stage Filters">
              <button
                type="button"
                role="tab"
                aria-selected={selectedStage === 'all'}
                className={`app-stage-tab-btn ${selectedStage === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedStage('all')}
              >
                All ({metrics.totalCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedStage === 'in_review'}
                className={`app-stage-tab-btn ${selectedStage === 'in_review' ? 'active' : ''}`}
                onClick={() => setSelectedStage('in_review')}
              >
                In Review ({metrics.inReviewCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedStage === 'shortlisted'}
                className={`app-stage-tab-btn ${selectedStage === 'shortlisted' ? 'active' : ''}`}
                onClick={() => setSelectedStage('shortlisted')}
              >
                Shortlisted ({metrics.shortlistedCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedStage === 'scheduled'}
                className={`app-stage-tab-btn ${selectedStage === 'scheduled' ? 'active' : ''}`}
                onClick={() => setSelectedStage('scheduled')}
              >
                Interviews ({metrics.scheduledCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedStage === 'starred'}
                className={`app-stage-tab-btn ${selectedStage === 'starred' ? 'active' : ''}`}
                onClick={() => setSelectedStage('starred')}
              >
                Starred ({metrics.starredCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedStage === 'offered'}
                className={`app-stage-tab-btn ${selectedStage === 'offered' ? 'active' : ''}`}
                onClick={() => setSelectedStage('offered')}
              >
                Offers &amp; Hires ({metrics.offeredCount + metrics.hiredCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedStage === 'rejected'}
                className={`app-stage-tab-btn ${selectedStage === 'rejected' ? 'active' : ''}`}
                onClick={() => setSelectedStage('rejected')}
              >
                Archived ({metrics.rejectedCount})
              </button>
            </nav>

            {/* Search & Filter Ribbon */}
            <div className="app-search-filter-ribbon">
              <div className="app-search-input-box">
                <span className="material-symbols-outlined" aria-hidden="true">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by candidate, position, discipline, skills, or location..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search candidates"
                />
              </div>

              <div className="app-ribbon-controls">
                <select
                  className="app-select-ctrl"
                  value={selectedRequisition}
                  onChange={handleRequisitionChange}
                  aria-label="Filter by Job Position"
                >
                  <option value="all">All Positions ({availableRequisitions.length})</option>
                  {availableRequisitions.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.title}
                    </option>
                  ))}
                </select>

                <CustomSortDropdown<SortOption>
                  id="applicant-sort-dropdown"
                  value={sortBy}
                  options={APPLICANT_SORT_OPTIONS}
                  onChange={(val) => setSortBy(val)}
                  labelPrefix="Sort:"
                  ariaLabel="Sort applicants"
                  align="right"
                />
              </div>
            </div>
          </div>

          {/* Active Job Requisition Filter Banner */}
          {selectedRequisition !== 'all' && (
            <div className="active-req-filter-bar">
              <div className="active-req-filter-left">
                <span className="material-symbols-outlined" aria-hidden="true">
                  work_outline
                </span>
                <span>
                  Filtering candidates for requisition: <strong>{selectedReqTitle}</strong>
                </span>
                <span className="active-req-count-badge">
                  {filteredApplicants.length} {filteredApplicants.length === 1 ? 'applicant' : 'applicants'}
                </span>
              </div>
              <div className="active-req-filter-actions">
                {onViewJobPost && (
                  <button
                    type="button"
                    className="btn-active-req-nav"
                    onClick={() => onViewJobPost(currentSelectedReqObj?.id, selectedReqTitle)}
                    title={`View "${selectedReqTitle}" requisition in My Job Posts`}
                  >
                    <span>View Job Requisition</span>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '15px' }}>
                      open_in_new
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-active-req-clear"
                  onClick={() => {
                    setSelectedRequisition('all')
                    if (onClearJobFilter) onClearJobFilter()
                  }}
                  title="Clear position filter and show all applicants"
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '15px' }}>
                    close
                  </span>
                  <span>Clear Filter</span>
                </button>
              </div>
            </div>
          )}

          {/* Cards List */}
          {loading ? (
            <div className="app-shimmer-container" aria-busy="true" aria-label="Loading candidate applications">
              <div className="app-shimmer-telemetry-banner">
                <span className="material-symbols-outlined spin-icon" aria-hidden="true">
                  sync
                </span>
                <span>Fetching candidate applications, skills depth &amp; pipeline records...</span>
              </div>
              {[1, 2, 3].map((skeletonId) => (
                <article key={skeletonId} className="applicant-card app-skeleton-card">
                  <div className="card-top-row">
                    <div className="app-shimmer app-skeleton-avatar"></div>
                    <div className="card-primary-info">
                      <div className="name-and-match">
                        <div className="app-shimmer app-skeleton-bar" style={{ width: '160px', height: '20px' }}></div>
                        <div className="app-shimmer app-skeleton-pill" style={{ width: '85px', height: '22px' }}></div>
                      </div>
                      <div className="app-shimmer app-skeleton-bar" style={{ width: '220px', height: '14px', marginTop: '6px' }}></div>
                      <div className="app-shimmer app-skeleton-bar" style={{ width: '180px', height: '12px', marginTop: '6px' }}></div>
                    </div>
                  </div>
                  <div className="app-shimmer app-skeleton-bar" style={{ width: '92%', height: '14px', margin: '12px 0 8px' }}></div>
                  <div className="skills-row">
                    <div className="app-shimmer app-skeleton-pill" style={{ width: '85px', height: '24px' }}></div>
                    <div className="app-shimmer app-skeleton-pill" style={{ width: '100px', height: '24px' }}></div>
                    <div className="app-shimmer app-skeleton-pill" style={{ width: '75px', height: '24px' }}></div>
                    <div className="app-shimmer app-skeleton-pill" style={{ width: '110px', height: '24px' }}></div>
                  </div>
                  <div className="card-actions-row">
                    <div className="app-shimmer app-skeleton-pill" style={{ width: '130px', height: '34px' }}></div>
                    <div className="app-shimmer app-skeleton-pill" style={{ width: '120px', height: '34px' }}></div>
                    <div className="app-shimmer app-skeleton-pill" style={{ width: '110px', height: '34px' }}></div>
                  </div>
                </article>
              ))}
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="app-empty-state">
              <span className="material-symbols-outlined" aria-hidden="true">
                filter_alt_off
              </span>
              <h3>No candidate applications found</h3>
              <p>Try resetting the search query or selecting a different status tab.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-card-secondary"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedStage('all')
                    setSelectedRequisition('all')
                    if (onClearJobFilter) onClearJobFilter()
                  }}
                >
                  Reset Pipeline Filters
                </button>
                {onBrowseJobs && (
                  <button
                    type="button"
                    className="btn-card-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={onBrowseJobs}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>
                      work
                    </span>
                    <span>Browse My Job Posts</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            paginatedApplicants.map((app) => {
              const statusPillClass =
                app.stageStatus === 'shortlisted'
                  ? 'pill-shortlisted'
                  : app.stageStatus === 'scheduled'
                  ? 'pill-defense'
                  : app.stageStatus === 'offered' || app.stageStatus === 'hired'
                  ? 'pill-offer'
                  : app.stageStatus === 'rejected'
                  ? 'pill-archived'
                  : 'pill-review'

              return (
                <article key={app.id} className="app-card">
                  <div className="app-card-accent-bar" aria-hidden="true"></div>

                  {/* Top Row */}
                  <div className="app-card-top-row">
                    <div className="app-card-firm-meta">
                      <div className="app-card-avatar-wrapper">
                        {app.profileImageUrl ? (
                          <img
                            src={app.profileImageUrl}
                            alt={app.name}
                            className="app-card-avatar-img"
                          />
                        ) : (
                          <div className="app-card-avatar">{app.avatarInitials}</div>
                        )}
                        <button
                          type="button"
                          className={`btn-star-applicant ${app.isStarred ? 'starred' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleStarApplicant(app.id)
                          }}
                          title={app.isStarred ? 'Unstar candidate' : 'Star candidate'}
                          aria-label={app.isStarred ? 'Unstar candidate' : 'Star candidate'}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {app.isStarred ? 'star' : 'star_border'}
                          </span>
                        </button>
                      </div>

                      <div className="app-card-headlines">
                        <div className="app-card-badge-line">
                          <span className={`badge-stage-pill ${statusPillClass}`}>
                            {(app.stageStatus === 'in_review' || app.stageStatus === 'scheduled') && (
                              <span className="telemetry-pulse" aria-hidden="true" />
                            )}
                            {app.stageLabel}
                          </span>
                          <span className="badge-match-fit">{app.workMode}</span>
                          {app.noticePeriod && (
                            <span className="badge-notice-period">
                              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '13px' }}>
                                schedule
                              </span>
                              Notice: {app.noticePeriod}
                            </span>
                          )}
                        </div>

                        <h2
                          className="app-card-role-title"
                          onClick={() => setSelectedApplicant(app)}
                          title="Open Candidate Dossier"
                        >
                          {app.name}
                        </h2>
                        <div className="app-card-applied-row">
                          <p className="app-card-studio-line">
                            <strong>Applied for:</strong> {app.role} • {app.discipline} ({app.institution})
                          </p>
                          {onViewJobPost && (
                            <button
                              type="button"
                              className="btn-view-job-post-link"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewJobPost(app.jobId || undefined, app.role)
                              }}
                              title={`View ${app.role} requisition in My Job Posts`}
                              aria-label={`View ${app.role} requisition in My Job Posts`}
                            >
                              <span>View Job Post</span>
                              <span className="material-symbols-outlined" aria-hidden="true">
                                open_in_new
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="app-card-comp-box">
                      <span className="app-card-salary">{app.expectedCtc}</span>
                      <span className="app-card-emp-type">{app.candidateLocation}</span>
                      <span className="app-card-date-meta">
                        {app.appliedDateLabel} • {app.lastUpdatedLabel}
                      </span>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="app-card-tags-row">
                    {app.skills.map((skill) => (
                      <span key={skill} className="app-software-tag">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          verified
                        </span>
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Scheduled Interview Banner (if any) */}
                  {app.interviews && app.interviews.length > 0 && (
                    <div className="app-card-notice-banner notice-defense">
                      <div className="notice-content-left">
                        <div className="notice-icon-video-box">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            videocam
                          </span>
                        </div>
                        <div>
                          <div className="notice-title">
                            {app.interviews[0].interviewType}: {app.interviews[0].interviewDate} at{' '}
                            {app.interviews[0].interviewTime}
                          </div>
                          <div className="notice-desc">
                            {app.interviews[0].locationType} •{' '}
                            <a
                              href={app.interviews[0].locationValue}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="meeting-link"
                            >
                              Open Meeting Channel
                            </a>
                          </div>
                        </div>
                      </div>
                      <span className="notice-badge-deadline deadline-defense">CONFIRMED</span>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="app-card-buttons-row">
                    {/* View Resume Button */}
                    {app.resumeFileUrl ? (
                      <button
                        type="button"
                        className="btn-card-primary"
                        onClick={() => {
                          setPreviewResumeUrl(app.resumeFileUrl || null)
                          setPreviewCandidateName(app.name)
                        }}
                        title="View Candidate Resume PDF"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          description
                        </span>
                        <span>View Resume PDF</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-card-secondary"
                        onClick={() => setSelectedApplicant(app)}
                        title="View Profile Dossier"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          folder_open
                        </span>
                        <span>View Profile</span>
                      </button>
                    )}

                    {/* Schedule Interview (Enabled when status is "Shortlisted") */}
                    <button
                      type="button"
                      className="btn-card-secondary"
                      disabled={app.stageStatus !== 'shortlisted' && app.stageStatus !== 'scheduled'}
                      onClick={() => setInterviewCandidate(app)}
                      title={
                        app.stageStatus === 'shortlisted' || app.stageStatus === 'scheduled'
                          ? 'Schedule Interview Round'
                          : 'Change candidate status to "Shortlisted" to schedule an interview'
                      }
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        calendar_add_on
                      </span>
                      <span>Schedule Interview</span>
                    </button>

                    {/* Message Candidate */}
                    <button
                      type="button"
                      className="btn-card-secondary"
                      onClick={() => setChatCandidate(app)}
                      title={`Message ${app.name}`}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        chat
                      </span>
                      <span>Message</span>
                    </button>

                    {/* View Full Dossier */}
                    <button
                      type="button"
                      className="btn-card-tertiary"
                      onClick={() => setSelectedApplicant(app)}
                      title="View Complete Submission Dossier"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        assignment_ind
                      </span>
                      <span>Full Dossier</span>
                    </button>

                    {/* Status Dropdown */}
                    <div className="card-status-dropdown-wrapper">
                      <CandidateStatusDropdown
                        value={app.stageStatus}
                        onChange={(newStatus) => updateApplicationStatus(app.id, newStatus)}
                        candidateName={app.name}
                      />
                    </div>
                  </div>
                </article>
              )
            })
          )}

          {/* Pagination Navigation */}
          {!loading && filteredApplicants.length > 0 && (
            <nav className="app-pagination-nav" aria-label="Applicants pagination">
              <div className="app-pagination-info">
                Showing <strong>{startIndex + 1}</strong> -{' '}
                <strong>{Math.min(startIndex + itemsPerPage, filteredApplicants.length)}</strong> of{' '}
                <strong>{filteredApplicants.length}</strong> applicants
              </div>

              <div className="app-pagination-controls">
                <button
                  type="button"
                  className="app-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_left
                  </span>
                  <span>Previous</span>
                </button>

                <div className="app-page-numbers-group">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`app-page-number-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                      aria-current={safeCurrentPage === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="app-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_right
                  </span>
                </button>

                <div className="app-per-page-box">
                  <label htmlFor="appPerPageSelect" className="app-per-page-label">
                    Per Page:
                  </label>
                  <select
                    id="appPerPageSelect"
                    className="app-per-page-select"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                  >
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            </nav>
          )}
        </div>

        {/* Right Column: Upcoming Interviews & Intelligence Sidebar (4 cols) */}
        <aside className="app-sidebar-column">
          {/* 1. Upcoming Scheduled Interviews Desk */}
          <div className="app-sidebar-card">
            <div className="sidebar-card-header">
              <div className="sidebar-card-title-group">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  calendar_month
                </span>
                <h3 className="sidebar-card-title">Upcoming Interviews</h3>
              </div>
              <span className="sidebar-badge-count">
                {String(upcomingInterviews.length).padStart(2, '0')} SCHEDULED
              </span>
            </div>

            {upcomingInterviews.length === 0 ? (
              <p className="sidebar-empty-text">
                No active interviews scheduled yet. Select &ldquo;Schedule Interview&rdquo; on any shortlisted candidate
                to arrange technical panels.
              </p>
            ) : (
              <div className="upcoming-interviews-list">
                {upcomingInterviews.map((iv) => (
                  <div key={iv.id} className="upcoming-interview-item">
                    <div className="interview-time-badge">
                      <span className="iv-date">{iv.interviewDate.slice(5)}</span>
                      <span className="iv-time">{iv.interviewTime}</span>
                    </div>
                    <div className="interview-meta-details">
                      <strong className="iv-name">{iv.candidateName}</strong>
                      <span className="iv-role">{iv.candidateRole}</span>
                      <span className="iv-type">{iv.interviewType}</span>
                      {iv.locationValue && (
                        <a
                          href={iv.locationValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="iv-meeting-btn"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">
                            videocam
                          </span>
                          <span>Join Meeting</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Pipeline Distribution Breakdown */}
          <div className="app-sidebar-card">
            <div className="sidebar-card-header">
              <div className="sidebar-card-title-group">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  analytics
                </span>
                <h3 className="sidebar-card-title">Pipeline Health</h3>
              </div>
              <span className="sidebar-badge-mono">LIVE METRICS</span>
            </div>

            <div className="velocity-benchmark-box">
              <div className="velocity-stat-row">
                <span className="stat-muted">TOTAL SUBMISSIONS:</span>
                <span className="stat-bold">{metrics.totalCount}</span>
              </div>
              <div className="velocity-stat-row">
                <span className="stat-muted">ACTIVE IN PIPELINE:</span>
                <span className="stat-primary">{metrics.activePipelineCount}</span>
              </div>
              <div className="velocity-stat-row">
                <span className="stat-muted">SHORTLIST CONVERSION:</span>
                <span className="stat-bold">
                  {metrics.totalCount > 0
                    ? `${Math.round((metrics.shortlistedCount / metrics.totalCount) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            <div className="velocity-market-insight-callout">
              <span className="material-symbols-outlined" aria-hidden="true">
                tips_and_updates
              </span>
              <p>
                <strong>Hiring Tip:</strong> Candidates respond <strong>2.8x faster</strong> when feedback or interview
                invitations are sent within 72 hours of application submission.
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* ── MODAL 1: Candidate Dossier Modal ── */}
      {selectedApplicant && (
        <div
          className="app-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedApplicant(null)}
        >
          <div className="app-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="modal-header-left">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  folder_shared
                </span>
                <div>
                  <h3 className="modal-header-title">Candidate Profile &amp; Requisition Dossier</h3>
                  <span className="modal-header-sub">
                    {selectedApplicant.role} • {selectedApplicant.candidateLocation}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedApplicant(null)}
                aria-label="Close Dossier"
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <div className="dossier-profile-card">
                <div className="dossier-avatar-wrapper">
                  {selectedApplicant.profileImageUrl ? (
                    <img
                      src={selectedApplicant.profileImageUrl}
                      alt={selectedApplicant.name}
                      className="dossier-avatar-img"
                    />
                  ) : (
                    <div className="dossier-avatar">{selectedApplicant.avatarInitials}</div>
                  )}
                </div>
                <div>
                  <h4 className="dossier-name">{selectedApplicant.name}</h4>
                  <p className="dossier-role">
                    {selectedApplicant.discipline} • {selectedApplicant.institution} ({selectedApplicant.graduationYear})
                  </p>
                  <div className="dossier-contacts-row">
                    {selectedApplicant.email && (
                      <a href={`mailto:${selectedApplicant.email}`} className="dossier-contact-link">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          mail
                        </span>
                        <span>{selectedApplicant.email}</span>
                      </a>
                    )}
                    {selectedApplicant.phone && (
                      <a href={`tel:${selectedApplicant.phone}`} className="dossier-contact-link">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          call
                        </span>
                        <span>{selectedApplicant.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="dossier-info-grid">
                <div className="dossier-info-cell">
                  <span className="cell-label">Current Pipeline Status</span>
                  <span className="cell-value" style={{ color: '#00418f' }}>
                    {selectedApplicant.stageLabel}
                  </span>
                </div>
                <div className="dossier-info-cell">
                  <span className="cell-label">Expected CTC</span>
                  <span className="cell-value">{selectedApplicant.expectedCtc}</span>
                </div>
                <div className="dossier-info-cell">
                  <span className="cell-label">Work Mode &amp; Notice</span>
                  <span className="cell-value">
                    {selectedApplicant.workMode} • Notice: {selectedApplicant.noticePeriod}
                  </span>
                </div>
                <div className="dossier-info-cell">
                  <span className="cell-label">Candidate Location</span>
                  <span className="cell-value">{selectedApplicant.candidateLocation}</span>
                </div>
              </div>

              {selectedApplicant.bio && (
                <div>
                  <h5 className="dossier-section-title">Professional Bio &amp; Summary</h5>
                  <p className="dossier-bio">{selectedApplicant.bio}</p>
                </div>
              )}

              {/* Skills */}
              {selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
                <div>
                  <h5 className="dossier-section-title">Verified Skills</h5>
                  <div className="app-card-tags-row" style={{ paddingLeft: 0 }}>
                    {selectedApplicant.skills.map((skill) => (
                      <span key={skill} className="app-software-tag">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          verified
                        </span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {selectedApplicant.experiences && selectedApplicant.experiences.length > 0 && (
                <div>
                  <h5 className="dossier-section-title">Work Experience</h5>
                  <div className="dossier-experience-list">
                    {selectedApplicant.experiences.map((exp) => (
                      <div key={exp.id} className="dossier-exp-item">
                        <strong>{exp.roleTitle}</strong> — <span>{exp.organizationName}</span>
                        {exp.contributions && <p className="dossier-exp-desc">{exp.contributions}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Portfolio / LinkedIn / Resume Links */}
              <div>
                <h5 className="dossier-section-title">Verified Dossier Documents</h5>
                <div className="dossier-docs-row">
                  {selectedApplicant.resumeFileUrl && (
                    <button
                      type="button"
                      className="btn-card-primary"
                      onClick={() => {
                        setPreviewResumeUrl(selectedApplicant.resumeFileUrl || null)
                        setPreviewCandidateName(selectedApplicant.name)
                      }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        description
                      </span>
                      <span>Preview Resume PDF</span>
                    </button>
                  )}
                  {selectedApplicant.portfolioUrl && (
                    <a
                      href={selectedApplicant.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-secondary"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        open_in_new
                      </span>
                      <span>External Portfolio</span>
                    </a>
                  )}
                  {selectedApplicant.linkedinUrl && (
                    <a
                      href={selectedApplicant.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-secondary"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        link
                      </span>
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Advance Pipeline Stage Action */}
              <div>
                <h5 className="dossier-section-title">Set Application Status</h5>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(['new', 'in_review', 'shortlisted', 'scheduled', 'rejected'] as ApplicationDBStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        className={`app-stage-tab-btn ${selectedApplicant.stageStatus === st ? 'active' : ''}`}
                        onClick={() => updateApplicationStatus(selectedApplicant.id, st)}
                      >
                        {st.replace('_', ' ').toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setSelectedApplicant(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-card-primary"
                disabled={
                  selectedApplicant.stageStatus !== 'shortlisted' &&
                  selectedApplicant.stageStatus !== 'scheduled'
                }
                onClick={() => {
                  setInterviewCandidate(selectedApplicant)
                  setSelectedApplicant(null)
                }}
                title={
                  selectedApplicant.stageStatus === 'shortlisted' ||
                  selectedApplicant.stageStatus === 'scheduled'
                    ? 'Schedule Interview Round'
                    : 'Change candidate status to "Shortlisted" to schedule an interview'
                }
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  calendar_add_on
                </span>
                <span>Schedule Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Schedule Interview Modal (PostgreSQL interviews table) ── */}
      {interviewCandidate && (
        <div
          className="app-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setInterviewCandidate(null)}
        >
          <div className="app-modal-window" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleScheduleSubmit}>
              <div className="app-modal-header">
                <div className="modal-header-left">
                  <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                    calendar_add_on
                  </span>
                  <div>
                    <h3 className="modal-header-title">Schedule Candidate Interview</h3>
                    <span className="modal-header-sub">
                      Candidate: {interviewCandidate.name} ({interviewCandidate.role})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setInterviewCandidate(null)}
                  aria-label="Close Schedule Modal"
                >
                  ✕
                </button>
              </div>

              <div className="app-modal-body">
                <div className="form-group-row">
                  <label htmlFor="interview-date-input" className="form-label">
                    Interview Date
                  </label>
                  <input
                    id="interview-date-input"
                    type="date"
                    className="form-input-ctrl"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>

                <div className="form-group-row">
                  <label htmlFor="interview-time-input" className="form-label">
                    Interview Time
                  </label>
                  <input
                    id="interview-time-input"
                    type="time"
                    className="form-input-ctrl"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                  />
                </div>

                <div className="form-group-row">
                  <label htmlFor="interview-type-select" className="form-label">
                    Interview Type / Round
                  </label>
                  <select
                    id="interview-type-select"
                    className="form-select-ctrl"
                    value={interviewType}
                    onChange={(e) =>
                      setInterviewType(e.target.value as 'Technical Review' | 'Portfolio Deep-Dive' | 'Cultural Fit')
                    }
                  >
                    <option value="Technical Review">Technical Review</option>
                    <option value="Portfolio Deep-Dive">Portfolio Deep-Dive</option>
                    <option value="Cultural Fit">Cultural Fit</option>
                  </select>
                </div>

                <div className="form-group-row">
                  <label htmlFor="interview-location-type" className="form-label">
                    Format
                  </label>
                  <select
                    id="interview-location-type"
                    className="form-select-ctrl"
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as 'Video Call' | 'In-Person')}
                  >
                    <option value="Video Call">Video Call (Google Meet / Zoom)</option>
                    <option value="In-Person">In-Person (Studio Office)</option>
                  </select>
                </div>

                <div className="form-group-row">
                  <label htmlFor="interview-location-val" className="form-label">
                    Meeting Link or Office Address
                  </label>
                  <input
                    id="interview-location-val"
                    type="text"
                    className="form-input-ctrl"
                    required
                    placeholder="e.g. https://meet.google.com/xyz or Studio Boardroom 2"
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="app-modal-footer">
                <button
                  type="button"
                  className="btn-card-secondary"
                  onClick={() => setInterviewCandidate(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-card-primary" disabled={isSubmittingInterview}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    check_circle
                  </span>
                  <span>{isSubmittingInterview ? 'Scheduling...' : 'Confirm & Save Schedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Direct Candidate Messaging Drawer (chatsession table) ── */}
      {chatCandidate && (
        <div
          className="app-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setChatCandidate(null)}
        >
          <div className="app-modal-window" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="modal-header-left">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  forum
                </span>
                <div>
                  <h3 className="modal-header-title">Direct Channel: {chatCandidate.name}</h3>
                  <span className="modal-header-sub">Position: {chatCandidate.role}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setChatCandidate(null)}
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <textarea
                className="chat-textarea"
                placeholder={`Type message or review query to ${chatCandidate.name}...`}
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
              />

              <div>
                <span className="cell-label" style={{ marginBottom: '6px' }}>
                  Quick Requisition Templates
                </span>
                <div className="quick-prompts-row">
                  <button
                    type="button"
                    className="quick-prompt-chip"
                    onClick={() =>
                      setChatMessageText(
                        `Hello ${chatCandidate.name}, we reviewed your application for ${chatCandidate.role} and would like to arrange an interview.`
                      )
                    }
                  >
                    Interview Invite
                  </button>
                  <button
                    type="button"
                    className="quick-prompt-chip"
                    onClick={() =>
                      setChatMessageText(
                        `Hi ${chatCandidate.name}, could you please share any additional portfolio samples or project details?`
                      )
                    }
                  >
                    Request Portfolio
                  </button>
                  <button
                    type="button"
                    className="quick-prompt-chip"
                    onClick={() =>
                      setChatMessageText(
                        `We are pleased to inform you that your profile has been shortlisted for the ${chatCandidate.role} position.`
                      )
                    }
                  >
                    Shortlist Notice
                  </button>
                </div>
              </div>
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setChatCandidate(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-card-primary"
                onClick={handleSendDirectMessage}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  send
                </span>
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Resume PDF Preview Modal ── */}
      {previewResumeUrl && (
        <div
          className="app-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewResumeUrl(null)}
        >
          <div className="app-modal-window resume-preview-window" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="modal-header-left">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  picture_as_pdf
                </span>
                <div>
                  <h3 className="modal-header-title">{previewCandidateName} &mdash; Official Resume</h3>
                  <span className="modal-header-sub">PDF Document Viewer</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={previewResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-card-secondary"
                  title="Open PDF in new tab"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    open_in_new
                  </span>
                  <span>New Tab</span>
                </a>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setPreviewResumeUrl(null)}
                  aria-label="Close Preview"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="app-modal-body resume-iframe-body">
              <iframe
                src={previewResumeUrl}
                title={`${previewCandidateName} Resume`}
                className="resume-pdf-iframe"
              />
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setPreviewResumeUrl(null)}
              >
                Close Viewer
              </button>
              <a
                href={previewResumeUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn-card-primary"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  download
                </span>
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
