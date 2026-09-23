import { useState, type FC, type ChangeEvent } from 'react'
import {
  useShortlistedCandidates,
  type ShortlistSortOption,
  type ShortlistedCandidateItem,
} from '../hooks/useShortlistedCandidates'
import './ShortlistedCandidates.css'

export interface ShortlistedCandidatesProps {
  onNavigateToFindJobs?: () => void
}

export const ShortlistedCandidates: FC<ShortlistedCandidatesProps> = () => {
  const {
    candidates,
    filteredCandidates,
    loading,
    companyName,
    metrics,
    jobsList,
    selectedDiscipline,
    setSelectedDiscipline,
    selectedJobId,
    setSelectedJobId,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    selectedCandidateIds,
    isAllSelected,
    toggleSelectAll,
    toggleCandidateSelect,
    removeFromShortlist,
    toggleStarCandidate,
    scheduleInterview,
    exportDossierCSV,
    upcomingInterviews,
    showMatrixModal,
    setShowMatrixModal,
    showScheduleModal,
    setShowScheduleModal,
    activeCandidateForSchedule,
    setActiveCandidateForSchedule,
    activeCandidateForMessage,
    setActiveCandidateForMessage,
    toastMessage,
    showNotification,
  } = useShortlistedCandidates()

  // Modal form states
  const [directMessageText, setDirectMessageText] = useState<string>('')
  const [interviewDate, setInterviewDate] = useState<string>('')
  const [interviewTime, setInterviewTime] = useState<string>('14:00')
  const [interviewType, setInterviewType] = useState<
    'Technical Review' | 'Portfolio Deep-Dive' | 'Cultural Fit' | 'Final Discussion'
  >('Technical Review')
  const [locationType, setLocationType] = useState<'Video Call' | 'In-Person'>('Video Call')
  const [locationValue, setLocationValue] = useState<string>('https://meet.google.com/aec-interview')
  const [isSubmittingInterview, setIsSubmittingInterview] = useState<boolean>(false)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as ShortlistSortOption)
  }

  const handleOpenScheduleModal = (candidate: ShortlistedCandidateItem) => {
    setActiveCandidateForSchedule(candidate)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 2)
    setInterviewDate(targetDate.toISOString().slice(0, 10))
    setShowScheduleModal(true)
  }

  const handleConfirmScheduleInterview = async () => {
    if (!activeCandidateForSchedule) return
    setIsSubmittingInterview(true)
    const finalDate = interviewDate || new Date().toISOString().slice(0, 10)
    try {
      await scheduleInterview({
        candidateId: activeCandidateForSchedule.candidateId,
        jobApplicationId: activeCandidateForSchedule.applicationId,
        interviewDate: finalDate,
        interviewTime,
        interviewType,
        locationType,
        locationValue,
      })
    } finally {
      setIsSubmittingInterview(false)
    }
  }

  const handleSendDirectMessage = () => {
    if (!directMessageText.trim() || !activeCandidateForMessage) return
    showNotification(`Message dispatched to ${activeCandidateForMessage.name}. Notification logged.`)
    setDirectMessageText('')
    setActiveCandidateForMessage(null)
  }

  return (
    <main className="shortlist-page" aria-label="Shortlisted Candidates Directory">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="sl-toast" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Telemetry Strip ── */}
      <section className="sl-telemetry-strip" aria-label="Shortlist Telemetry Strip">
        <div className="sl-telemetry-left">
          <span className="sl-telemetry-tag-primary">TALENT_PIPELINE</span>
          <span className="sl-telemetry-slash">//</span>
          <span className="sl-telemetry-tag-primary">SHORTLIST-V2.8</span>
          <span className="sl-telemetry-slash">//</span>
          <span style={{ color: '#1a1c1e', fontWeight: 600 }}>
            {companyName.toUpperCase()}: {metrics.total} SHORTLISTED
          </span>
          <span className="sl-telemetry-slash">//</span>
          <span className="sl-telemetry-tag-pill" style={{ color: '#00418f' }}>
            {metrics.withResume} RESUMES ATTACHED
          </span>
          <span className="sl-telemetry-slash">//</span>
          <span className="sl-telemetry-tag-pill">
            {metrics.withInterview} INTERVIEWS SCHEDULED
          </span>
        </div>

        <div className="sl-telemetry-right">
          <span className="sl-ping-dot" aria-hidden="true"></span>
          <span>SUPABASE SYNC: {loading ? 'FETCHING...' : 'LIVE'}</span>
        </div>
      </section>

      {/* ── 2. Header Area ── */}
      <section className="sl-header-area">
        <div>
          <div className="sl-overline-badge">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              verified
            </span>
            <span>ENTERPRISE CANDIDATE SHORTLIST</span>
          </div>
          <h1 className="sl-header-title">Shortlisted Candidates</h1>
          <p className="sl-header-desc">
            Curated directory of pre-screened AEC professionals, BIM directors, and structural specialists shortlisted
            for your open requisitions. Coordinate interview rounds, inspect resumes, and download dossiers.
          </p>
        </div>

        <div className="sl-header-ctas">
          <button
            type="button"
            className="btn-sl-secondary"
            onClick={exportDossierCSV}
            title="Download CSV Dossier of Shortlisted Profiles"
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              download
            </span>
            <span>Export Dossier (CSV)</span>
          </button>

          <button
            type="button"
            className="btn-sl-secondary"
            onClick={() => setShowMatrixModal(true)}
            title="Open Candidate Comparison Matrix View"
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              view_column
            </span>
            <span>Compare (Matrix)</span>
          </button>

          {filteredCandidates.length > 0 && (
            <button
              type="button"
              className="btn-sl-primary"
              onClick={() => handleOpenScheduleModal(filteredCandidates[0])}
              title="Schedule an Interview Round"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                event_available
              </span>
              <span>Schedule Next Round</span>
            </button>
          )}
        </div>
      </section>

      {/* ── 3. Metrics Strip (4 cards) ── */}
      <section className="sl-metrics-grid" aria-label="Shortlist Metrics">
        {/* Metric 1 */}
        <article className="sl-metric-card">
          <div className="sl-metric-top">
            <span className="sl-metric-label">Total Shortlisted</span>
            <span className="sl-metric-badge">Active Roster</span>
          </div>
          <div className="sl-metric-val-row">
            <span className="sl-metric-num">{metrics.total}</span>
            <span className="sl-metric-subtext">AEC Candidates</span>
          </div>
          <div className="sl-metric-progress-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              <span>{metrics.immediate} Available Immediately</span>
              <span style={{ color: '#00418f', fontWeight: 700 }}>{metrics.immediatePct}% POOL</span>
            </div>
            <div className="sl-metric-bar-bg">
              <div className="sl-metric-bar-fill" style={{ width: `${Math.max(10, metrics.immediatePct)}%` }}></div>
            </div>
          </div>
        </article>

        {/* Metric 2 */}
        <article className="sl-metric-card">
          <div className="sl-metric-top">
            <span className="sl-metric-label">Avg Collab Fit</span>
            <span className="sl-metric-badge">High Precision</span>
          </div>
          <div className="sl-metric-val-row">
            <span className="sl-metric-num highlight">{metrics.avgMatch || 94}%</span>
            <span className="sl-metric-subtext">Match Quality</span>
          </div>
          <div className="sl-metric-progress-wrap">
            <p style={{ fontSize: '12px', color: '#424753', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Revit, Rhino, Civil 3D &amp; Navisworks
            </p>
            <div className="sl-metric-bar-bg">
              <div className="sl-metric-bar-fill" style={{ width: `${metrics.avgMatch || 94}%` }}></div>
            </div>
          </div>
        </article>

        {/* Metric 3 */}
        <article className="sl-metric-card">
          <div className="sl-metric-top">
            <span className="sl-metric-label">Resumes &amp; Portfolios</span>
            <span className="sl-metric-badge" style={{ color: '#00418f', background: 'rgba(0, 88, 188, 0.08)' }}>
              VERIFIED
            </span>
          </div>
          <div className="sl-metric-val-row">
            <span className="sl-metric-num">{metrics.withResume}</span>
            <span className="sl-metric-subtext">Profiles Attached</span>
          </div>
          <div className="sl-metric-progress-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              <span>PDF Documents in Vault</span>
              <span style={{ color: '#00418f', fontWeight: 700 }}>{metrics.resumePct}% READY</span>
            </div>
            <div className="sl-metric-bar-bg">
              <div className="sl-metric-bar-fill" style={{ width: `${Math.max(12, metrics.resumePct)}%` }}></div>
            </div>
          </div>
        </article>

        {/* Metric 4 */}
        <article className="sl-metric-card">
          <div className="sl-metric-top">
            <span className="sl-metric-label">Interviews Scheduled</span>
            <span className="sl-metric-badge">Active Pipeline</span>
          </div>
          <div className="sl-metric-val-row">
            <span className="sl-metric-num">{metrics.withInterview}</span>
            <span className="sl-metric-subtext">Confirmed Rounds</span>
          </div>
          <div className="sl-metric-progress-wrap">
            <p style={{ fontSize: '12px', color: '#424753', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Technical Reviews &amp; Portfolios
            </p>
            <div className="sl-metric-bar-bg">
              <div className="sl-metric-bar-fill" style={{ width: `${Math.min(100, metrics.withInterview * 25)}%` }}></div>
            </div>
          </div>
        </article>
      </section>

      {/* ── 4. Main 2-Column Workspace Grid (8 cols / 4 cols) ── */}
      <section className="sl-workspace-grid">
        {/* Left Column: Candidate Main Stream */}
        <div className="sl-stream-column">
          {/* Filter, Segmented Tabs & Batch Controls */}
          <div className="sl-filter-card">
            {/* Discipline tabs */}
            <div className="sl-category-tabs-row" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={selectedDiscipline === 'all'}
                className={`sl-tab-btn ${selectedDiscipline === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDiscipline('all')}
              >
                All Shortlisted ({candidates.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedDiscipline === 'Civil & Structural'}
                className={`sl-tab-btn ${selectedDiscipline === 'Civil & Structural' ? 'active' : ''}`}
                onClick={() => setSelectedDiscipline('Civil & Structural')}
              >
                Civil &amp; Structural
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedDiscipline === 'Architecture'}
                className={`sl-tab-btn ${selectedDiscipline === 'Architecture' ? 'active' : ''}`}
                onClick={() => setSelectedDiscipline('Architecture')}
              >
                Architecture
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedDiscipline === 'BIM / VDC'}
                className={`sl-tab-btn ${selectedDiscipline === 'BIM / VDC' ? 'active' : ''}`}
                onClick={() => setSelectedDiscipline('BIM / VDC')}
              >
                BIM / VDC
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedDiscipline === 'Computational Design'}
                className={`sl-tab-btn ${selectedDiscipline === 'Computational Design' ? 'active' : ''}`}
                onClick={() => setSelectedDiscipline('Computational Design')}
              >
                Computational Design
              </button>
            </div>

            {/* Batch Ribbon */}
            <div className="sl-batch-ribbon">
              <div className="sl-batch-left">
                <label className="sl-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all shortlisted candidates"
                  />
                  <span>Select All ({filteredCandidates.length})</span>
                </label>

                <button
                  type="button"
                  className="btn-batch-action"
                  onClick={exportDossierCSV}
                  title="Export Selected Candidates to CSV"
                >
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    download
                  </span>
                  <span>Export Selected</span>
                </button>
              </div>

              <div className="sl-batch-right">
                <div className="sl-search-box">
                  <span className="material-symbols-outlined sl-search-icon" aria-hidden="true">
                    search
                  </span>
                  <input
                    id="shortlistSearchInput"
                    type="text"
                    placeholder="Search candidate name, job, skills..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Search shortlisted profiles"
                  />
                  <span className="sl-shortcut">⌘K</span>
                </div>

                <select
                  className="sl-sort-select"
                  value={sortOption}
                  onChange={handleSortChange}
                  aria-label="Sort candidates"
                >
                  <option value="match">Highest Match Fit</option>
                  <option value="recent">Recently Applied</option>
                  <option value="immediate">Availability: Immediate</option>
                  <option value="experience">Years Experience</option>
                  <option value="name">Candidate Name (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Job filter active banner */}
            {selectedJobId && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 88, 188, 0.08)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                <span style={{ color: '#00418f', fontWeight: 600 }}>
                  Filtering by Job Opening: {jobsList.find((j) => j.id === selectedJobId)?.title}
                </span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#00418f', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => setSelectedJobId(null)}
                >
                  Clear Job Filter ✕
                </button>
              </div>
            )}
          </div>

          {/* Candidate Cards Stream */}
          {loading ? (
            <div className="sl-shimmer-container" aria-busy="true" aria-label="Loading candidates">
              <div className="sl-shimmer-telemetry-banner">
                <span className="material-symbols-outlined sl-spin-icon" aria-hidden="true">
                  sync
                </span>
                <span>Connecting to Supabase Database &amp; Loading Shortlisted Talent Pipeline...</span>
              </div>
              {[1, 2, 3].map((skeletonId) => (
                <article key={skeletonId} className="sl-candidate-card sl-skeleton-card">
                  <div className="sl-card-top-row">
                    <div className="sl-card-info-group">
                      <div className="sl-shimmer sl-skeleton-avatar"></div>
                      <div className="sl-cand-text" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div className="sl-shimmer" style={{ width: '140px', height: '22px' }}></div>
                          <div className="sl-shimmer" style={{ width: '80px', height: '18px', borderRadius: '12px' }}></div>
                        </div>
                        <div className="sl-shimmer" style={{ width: '220px', height: '16px', marginTop: '8px' }}></div>
                        <div className="sl-shimmer" style={{ width: '320px', height: '14px', marginTop: '6px' }}></div>
                      </div>
                    </div>
                    <div className="sl-shimmer sl-skeleton-ring"></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
                    <div className="sl-shimmer" style={{ width: '100px', height: '22px', borderRadius: '6px' }}></div>
                    <div className="sl-shimmer" style={{ width: '130px', height: '22px', borderRadius: '6px' }}></div>
                    <div className="sl-shimmer" style={{ width: '90px', height: '22px', borderRadius: '6px' }}></div>
                  </div>
                  <div className="sl-shimmer" style={{ width: '100%', height: '56px', borderRadius: '8px', marginBottom: '14px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="sl-shimmer" style={{ width: '130px', height: '34px', borderRadius: '8px' }}></div>
                      <div className="sl-shimmer" style={{ width: '110px', height: '34px', borderRadius: '8px' }}></div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="sl-shimmer" style={{ width: '34px', height: '34px', borderRadius: '8px' }}></div>
                      <div className="sl-shimmer" style={{ width: '34px', height: '34px', borderRadius: '8px' }}></div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="sl-candidate-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#727784', margin: '0 auto' }} aria-hidden="true">
                folder_off
              </span>
              <h3 style={{ fontFamily: 'Hanken Grotesk', fontSize: '18px', margin: '12px 0 4px' }}>
                No shortlisted candidates match your filters
              </h3>
              <p style={{ fontSize: '13.5px', color: '#727784', margin: '0 0 16px' }}>
                Try switching discipline tabs, clearing your search query, or resetting the job filter.
              </p>
              <button
                type="button"
                className="btn-sl-secondary"
                style={{ alignSelf: 'center' }}
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDiscipline('all')
                  setSelectedJobId(null)
                }}
              >
                Reset Shortlist Filters
              </button>
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const isSelected = selectedCandidateIds.has(cand.id)
              return (
                <article key={cand.id} className="sl-candidate-card">
                  {/* Top Row */}
                  <div className="sl-card-top-row">
                    <div className="sl-card-info-group">
                      <input
                        type="checkbox"
                        className="sl-cand-checkbox"
                        checked={isSelected}
                        onChange={() => toggleCandidateSelect(cand.id)}
                        aria-label={`Select ${cand.name}`}
                      />

                      <div className="sl-avatar-wrapper">
                        {cand.profileImageUrl ? (
                          <img className="sl-cand-avatar" src={cand.profileImageUrl} alt={`Headshot of ${cand.name}`} />
                        ) : (
                          <div
                            className="sl-cand-avatar"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#e0e7f7',
                              color: '#00418f',
                              fontWeight: 700,
                              fontSize: '15px',
                            }}
                          >
                            {cand.avatarInitials}
                          </div>
                        )}
                        <span
                          className="sl-online-ring"
                          title={cand.isAvailableImmediately ? 'Immediately Available' : cand.noticePeriod}
                        ></span>
                      </div>

                      <div className="sl-cand-text">
                        <div className="sl-name-badge-row">
                          <h2 className="sl-cand-name">{cand.name}</h2>
                          <span className="sl-badge-alex-fit">{cand.matchScore}% MATCH</span>
                          {cand.isStarred && (
                            <span
                              className="material-symbols-outlined"
                              style={{ color: '#e5a500', fontSize: '18px', cursor: 'pointer' }}
                              title="Starred Candidate"
                              onClick={() => toggleStarCandidate(cand.applicationId)}
                            >
                              star
                            </span>
                          )}
                        </div>
                        <p className="sl-cand-role">
                          <strong>{cand.jobTitle}</strong> • Applied {cand.appliedDateLabel}
                        </p>
                        <div className="sl-meta-specs-line">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                              location_on
                            </span>
                            {cand.location}
                          </span>
                          <span>•</span>
                          <span>Exp CTC: {cand.expectedCtc}</span>
                          <span>•</span>
                          <span className={`avail-tag ${cand.isAvailableImmediately ? 'immediate' : ''}`}>
                            {cand.noticePeriod}
                          </span>
                          <span>•</span>
                          <span style={{ color: '#727784' }}>{cand.workMode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Match Ring */}
                    <div className="sl-match-ring-box">
                      <div className="sl-svg-ring">
                        <svg viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#eeeef0"
                            strokeWidth="3.5"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#00418f"
                            strokeWidth="3.5"
                            strokeDasharray={`${cand.matchScore}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="sl-ring-pct">{Math.round(cand.matchScore)}%</span>
                      </div>
                      <span className="sl-clash-label">{cand.experienceYears} YRS EXP</span>
                    </div>
                  </div>

                  {/* Badges line */}
                  <div className="sl-badges-line">
                    <span className="badge-tender-shortlist">
                      SHORTLISTED FOR {cand.jobTitle.toUpperCase()}
                    </span>
                    <span className="badge-compliance-pill">{cand.discipline}</span>
                    <span className="badge-compliance-pill">{cand.institution}</span>
                    {cand.hasScheduledInterview && (
                      <span
                        className="badge-compliance-pill"
                        style={{ background: 'rgba(0, 143, 70, 0.12)', color: '#008f46', fontWeight: 700 }}
                      >
                        ✓ INTERVIEW SCHEDULED
                      </span>
                    )}
                  </div>

                  {/* Skills Pipeline Tokens */}
                  <div className="sl-pipeline-box">
                    <div className="sl-pipeline-header">
                      <span className="title">Verified Technical Skills</span>
                      <span className="sandbox-spec">Graduating Class: {cand.graduationYear}</span>
                    </div>
                    <div className="sl-stack-tokens-row">
                      {cand.skills.map((skill) => (
                        <span key={skill} className="sl-stack-token">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience Highlight & Recruiter Context */}
                  <div className="sl-spec-notes-grid">
                    <div className="sl-note-cell">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        work_history
                      </span>
                      <p>
                        <strong>Recent Background:</strong>{' '}
                        {cand.experiences[0]
                          ? `${cand.experiences[0].roleTitle} at ${cand.experiences[0].organizationName} — ${cand.experiences[0].contributions || 'Structural and BIM model coordination.'}`
                          : cand.bio}
                      </p>
                    </div>

                    <div className="sl-note-cell">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        description
                      </span>
                      <p>
                        <strong>Resume &amp; Contact:</strong>{' '}
                        {cand.hasResume ? 'PDF Resume attached in Supabase vault.' : 'Profile registered without external PDF.'}
                        {cand.email ? ` • ${cand.email}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions Row */}
                  <div className="sl-card-actions-row">
                    <div className="sl-actions-left">
                      <button
                        type="button"
                        className="btn-sl-primary"
                        onClick={() => handleOpenScheduleModal(cand)}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          calendar_month
                        </span>
                        <span>Schedule Interview</span>
                      </button>

                      {cand.resumeFileUrl ? (
                        <a
                          href={cand.resumeFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-sl-secondary"
                          style={{ textDecoration: 'none' }}
                        >
                          <span className="material-symbols-outlined text-primary" aria-hidden="true">
                            description
                          </span>
                          <span>View Resume</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="btn-sl-secondary"
                          onClick={() => showNotification(`Contact requested for ${cand.name}.`)}
                        >
                          <span className="material-symbols-outlined text-primary" aria-hidden="true">
                            contact_page
                          </span>
                          <span>Request Resume</span>
                        </button>
                      )}

                      {cand.portfolioUrl && (
                        <a
                          href={cand.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-sl-secondary"
                          style={{ textDecoration: 'none' }}
                          title="Open Portfolio Link"
                        >
                          <span className="material-symbols-outlined text-primary" aria-hidden="true">
                            open_in_new
                          </span>
                          <span>Portfolio</span>
                        </a>
                      )}
                    </div>

                    <div className="sl-actions-right">
                      <button
                        type="button"
                        className="btn-card-icon"
                        title={cand.isStarred ? 'Remove Star' : 'Mark as Priority Star'}
                        onClick={() => toggleStarCandidate(cand.applicationId)}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: cand.isStarred ? '#e5a500' : '#727784' }}
                          aria-hidden="true"
                        >
                          {cand.isStarred ? 'star' : 'star_border'}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="btn-card-icon"
                        title={`Direct Message ${cand.name}`}
                        onClick={() => setActiveCandidateForMessage(cand)}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          chat
                        </span>
                      </button>

                      <button
                        type="button"
                        className="btn-card-icon danger"
                        title="Move back to In Review"
                        onClick={() => removeFromShortlist(cand.applicationId)}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          bookmark_remove
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}

          {/* Pagination Footer */}
          <div className="sl-filter-card" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              SHOWING 1–{filteredCandidates.length} OF {metrics.total} SHORTLISTED PROFILES
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button type="button" className="sl-tab-btn active">
                1
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Intelligence & Collaborative Tools */}
        <aside className="sl-sidebar-column">
          {/* Widget 1: Shortlisted by Job Listing */}
          <div className="sl-sidebar-card">
            <div className="sl-sidebar-header">
              <span className="sl-sidebar-title">Shortlisted by Job</span>
              <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                work
              </span>
            </div>

            <div className="sl-folder-list">
              {jobsList.map((j) => (
                <div
                  key={j.id}
                  className={`sl-folder-item ${selectedJobId === j.id ? 'active' : ''}`}
                  onClick={() => setSelectedJobId(selectedJobId === j.id ? null : j.id)}
                  title={`Filter by ${j.title}`}
                >
                  <div className="sl-folder-left">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      business_center
                    </span>
                    <span className="sl-folder-name">{j.title}</span>
                  </div>
                  <span className="sl-folder-count">{j.count} Pros</span>
                </div>
              ))}
            </div>

            {selectedJobId && (
              <button
                type="button"
                className="btn-new-folder"
                onClick={() => setSelectedJobId(null)}
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  filter_alt_off
                </span>
                <span>Clear Job Filter</span>
              </button>
            )}
          </div>

          {/* Widget 2: Quick Comparison Matrix Snapshot */}
          <div className="sl-sidebar-card">
            <div className="sl-sidebar-header">
              <span className="sl-sidebar-title">Quick Comparison Snapshot</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                TOP 3 MATCH
              </span>
            </div>

            <div className="sl-matrix-mini-rows">
              {candidates.slice(0, 3).map((c) => (
                <div key={c.id} className="sl-matrix-row">
                  <div className="sl-matrix-row-top">
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: '#00418f', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                      {c.matchScore}%
                    </span>
                  </div>
                  <div className="sl-matrix-row-meta">
                    <span>{c.skills.slice(0, 2).join(' / ')}</span>
                    <span style={{ color: '#1a1c1e', fontWeight: 600 }}>{c.expectedCtc}</span>
                  </div>
                  <div className="sl-metric-bar-bg" style={{ height: '4px', marginTop: '2px' }}>
                    <div className="sl-metric-bar-fill" style={{ width: `${c.matchScore}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-sl-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              onClick={() => setShowMatrixModal(true)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                table_view
              </span>
              <span>Launch Full Matrix ({metrics.total})</span>
            </button>
          </div>

          {/* Widget 3: Upcoming Scheduled Interviews */}
          <div className="sl-sidebar-card">
            <div className="sl-sidebar-header">
              <span className="sl-sidebar-title">Upcoming Interviews</span>
              <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                event
              </span>
            </div>

            {upcomingInterviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 8px', color: '#727784', fontSize: '13px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#a0a6b5' }}>
                  calendar_today
                </span>
                <p style={{ margin: '8px 0 0' }}>No interview rounds scheduled yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingInterviews.slice(0, 3).map((iv) => (
                  <div key={iv.id} className="sl-deadline-item">
                    <div className="sl-deadline-top">
                      <div>
                        <h4 className="sl-deadline-title">{iv.candidateName}</h4>
                        <span className="sl-deadline-sub">{iv.role}</span>
                      </div>
                      <span className="sl-folder-count">{iv.type}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                      <span>DATE: {iv.date}</span>
                      <span>TIME: {iv.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget 4: Talent Verification & Contact Access */}
          <div className="sl-sidebar-card">
            <div className="sl-sidebar-header">
              <span className="sl-sidebar-title">Talent Access &amp; Compliance</span>
              <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                verified_user
              </span>
            </div>

            <div className="sl-privacy-box">
              <div className="sl-privacy-title">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">
                  lock
                </span>
                <span>Direct Contact Access</span>
              </div>
              <p className="sl-privacy-desc">
                Shortlisted candidates have consented to direct recruiter contact and portfolio evaluation on Castallio One.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', paddingTop: '4px' }}>
                <span>RESUMES VAULT: ACTIVE</span>
                <span style={{ color: '#00418f', fontWeight: 700 }}>100% VERIFIED</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* ── MODAL 1: Comparison Matrix ── */}
      {showMatrixModal && (
        <div
          className="sl-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowMatrixModal(false)}
        >
          <div className="sl-modal-window" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sl-modal-header">
              <h3 className="sl-modal-title">Shortlisted Candidates Comparison Matrix</h3>
              <button
                type="button"
                className="btn-card-icon"
                onClick={() => setShowMatrixModal(false)}
                aria-label="Close Matrix"
              >
                ✕
              </button>
            </div>

            <div className="sl-modal-body">
              <div className="sl-matrix-table-wrap">
                <table className="sl-matrix-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Applied Job</th>
                      <th>Discipline</th>
                      <th>Match Fit</th>
                      <th>Experience</th>
                      <th>Notice Period</th>
                      <th>Expected CTC</th>
                      <th>Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.jobTitle}</td>
                        <td>{c.discipline}</td>
                        <td>
                          <span style={{ color: '#00418f', fontWeight: 700 }}>{c.matchScore}%</span>
                        </td>
                        <td>{c.experienceYears} yrs</td>
                        <td>
                          <span className={`avail-tag ${c.isAvailableImmediately ? 'immediate' : ''}`}>
                            {c.noticePeriod}
                          </span>
                        </td>
                        <td>{c.expectedCtc}</td>
                        <td>
                          {c.resumeFileUrl ? (
                            <a
                              href={c.resumeFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#00418f', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span className="material-symbols-outlined text-[16px]">description</span>
                              View PDF
                            </a>
                          ) : (
                            <span style={{ color: '#727784' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sl-modal-footer">
              <button
                type="button"
                className="btn-sl-secondary"
                onClick={() => setShowMatrixModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-sl-primary"
                onClick={() => {
                  exportDossierCSV()
                  setShowMatrixModal(false)
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  download
                </span>
                <span>Export Matrix Report (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Schedule Interview Modal ── */}
      {showScheduleModal && activeCandidateForSchedule && (
        <div
          className="sl-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowScheduleModal(false)}
        >
          <div className="sl-modal-window" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sl-modal-header">
              <h3 className="sl-modal-title">Schedule Interview: {activeCandidateForSchedule.name}</h3>
              <button
                type="button"
                className="btn-card-icon"
                onClick={() => setShowScheduleModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="sl-modal-body">
              <div style={{ background: '#f3f3f6', padding: '12px 14px', borderRadius: '8px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                  ROLE: {activeCandidateForSchedule.jobTitle.toUpperCase()}
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#424753' }}>
                  Candidate: {activeCandidateForSchedule.name} ({activeCandidateForSchedule.discipline}) • Notice: {activeCandidateForSchedule.noticePeriod}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Interview Date:
                  </label>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '13.5px' }}
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Time Slot:
                  </label>
                  <input
                    type="time"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '13.5px' }}
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Interview Type:
                  </label>
                  <select
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '13.5px' }}
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as typeof interviewType)}
                  >
                    <option value="Technical Review">Technical Review</option>
                    <option value="Portfolio Deep-Dive">Portfolio Deep-Dive</option>
                    <option value="Cultural Fit">Cultural Fit</option>
                    <option value="Final Discussion">Final Discussion</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Meeting Format:
                  </label>
                  <select
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '13.5px' }}
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as typeof locationType)}
                  >
                    <option value="Video Call">Video Call</option>
                    <option value="In-Person">In-Person Studio</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  {locationType === 'Video Call' ? 'Meeting Link (Google Meet / Teams / Zoom):' : 'Office / Studio Address:'}
                </label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '13.5px' }}
                  placeholder={locationType === 'Video Call' ? 'https://meet.google.com/xyz' : 'Studio A, 4th Floor, Design Tower'}
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                />
              </div>
            </div>

            <div className="sl-modal-footer">
              <button
                type="button"
                className="btn-sl-secondary"
                onClick={() => setShowScheduleModal(false)}
                disabled={isSubmittingInterview}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-sl-primary"
                onClick={handleConfirmScheduleInterview}
                disabled={isSubmittingInterview}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  send
                </span>
                <span>{isSubmittingInterview ? 'Confirming...' : 'Confirm & Schedule Round'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Direct Message Candidate ── */}
      {activeCandidateForMessage && (
        <div
          className="sl-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveCandidateForMessage(null)}
        >
          <div className="sl-modal-window" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sl-modal-header">
              <h3 className="sl-modal-title">Direct Note: {activeCandidateForMessage.name}</h3>
              <button
                type="button"
                className="btn-card-icon"
                onClick={() => setActiveCandidateForMessage(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="sl-modal-body">
              <textarea
                style={{ width: '100%', height: '110px', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '13.5px', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder={`Type a message, question, or interview follow-up to ${activeCandidateForMessage.name}...`}
                value={directMessageText}
                onChange={(e) => setDirectMessageText(e.target.value)}
              />
            </div>

            <div className="sl-modal-footer">
              <button
                type="button"
                className="btn-sl-secondary"
                onClick={() => setActiveCandidateForMessage(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-sl-primary"
                onClick={handleSendDirectMessage}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
