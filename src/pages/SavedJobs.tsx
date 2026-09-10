import type { FC } from 'react'
import './SavedJobs.css'
import {
  useSavedJobs,
  type SavedJob,
  UPCOMING_DEADLINES,
  ARCHIVED_JOBS,
  SAVED_COMPANIES,
} from './useSavedJobs'

interface SavedJobsProps {
  onNavigateToFindJobs?: () => void
}

const SavedJobs: FC<SavedJobsProps> = ({ onNavigateToFindJobs }) => {
  const {
    jobs,
    filteredJobs,
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
    activeNoteEditId,
    noteDraft,
    setNoteDraft,
    startEditingNote,
    cancelEditingNote,
    saveNote,
    removeSavedJob,
    handleQuickApply,
    handleBulkApply,
    handleExportSpecs,
    appliedJobIds,
    autoMatchAlerts,
    setAutoMatchAlerts,
    alertCadence,
    setAlertCadence,
    toastMessage,
    showToast,
  } = useSavedJobs()

  const disciplines = ['All', 'Structural', 'BIM Mgmt', 'Computational', 'MEP']

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
            <span className="tech-badge-subtle">LOD-400 DISCIPLINE SYNC</span>
          </div>
          <h1 className="saved-title">Saved Jobs</h1>
          <p className="saved-subtitle">
            Manage your bookmarked opportunities, track application deadlines, and monitor technical alignment.
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
              {jobs.length}
            </span>
          </button>

          <button
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
              {ARCHIVED_JOBS.length}
            </span>
          </button>

          <button
            type="button"
            className={`segment-btn ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
            aria-selected={activeTab === 'companies'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 21h18M9 8h1m4 0h1m-5 4h1m4 0h1M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16" />
            </svg>
            Saved Companies
            <span className={`segment-pill ${activeTab === 'companies' ? '' : 'muted'}`}>
              {SAVED_COMPANIES.length}
            </span>
          </button>
        </nav>
      </header>

      {/* Filter and Command Search Console */}
      {activeTab === 'saved' && (
        <section className="saved-filter-console" aria-label="Search and filter options">
          <div className="saved-search-input-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter bookmarked roles by software, company, or LOD level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search saved roles"
            />
            <div className="kbd-shortcut" aria-hidden="true">
              <span>⌘</span>
              <span>F</span>
            </div>
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

            {/* Bulk Action Button */}
            {selectedJobIds.length > 0 && (
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

      {/* Main Fluid Grid (8 cols / 4 cols) */}
      {activeTab === 'saved' && (
        <main className="saved-grid-container">
          {/* LEFT COLUMN: Opportunity Cards & Closing Alert */}
          <section className="saved-stream" aria-label="Bookmarked Job Opportunities">
            {/* Critical Closing Alert Banner */}
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
                      <span className="tag-deadline">CLOSING IN 48 HOURS</span>
                    </div>
                    <h2 className="closing-job-title">Lead Computational Designer at Foster + Partners</h2>
                    <p className="closing-job-desc">
                      Technical alignment rated at <span className="score-highlight">96%</span> against your Rhino/Grasshopper repository.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-closing-apply"
                  onClick={() => handleQuickApply('job-1', 'Lead Computational Designer')}
                >
                  Apply Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </aside>

            {/* List of Saved Job Cards */}
            {filteredJobs.length === 0 ? (
              <div className="empty-saved-state">
                <div className="empty-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="empty-title">No Saved Jobs Found</h3>
                <p className="empty-desc">
                  {searchQuery
                    ? `No bookmarked opportunities match "${searchQuery}". Try adjusting your filters.`
                    : 'You have not saved any jobs in this category yet.'}
                </p>
                {onNavigateToFindJobs && (
                  <button type="button" className="btn-browse-jobs" onClick={onNavigateToFindJobs}>
                    Browse AEC Openings
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job: SavedJob) => {
                const isSelected = selectedJobIds.includes(job.id)
                const isApplied = appliedJobIds.includes(job.id)

                return (
                  <article
                    key={job.id}
                    className={`saved-job-card ${isSelected ? 'selected' : ''}`}
                    aria-labelledby={`job-title-${job.id}`}
                  >
                    <div className="job-card-top-row">
                      <div className="job-brand-wrap">
                        {/* Company Logo Monogram */}
                        <div
                          className={`company-badge ${job.companyColor}`}
                          aria-label={`${job.company} monogram`}
                        >
                          {job.companyInitials}
                        </div>

                        <div className="job-headline-info">
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
                              {job.location}
                            </span>
                            <span className="meta-dot" aria-hidden="true" />
                            <span className="salary-tag">{job.salary}</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Indicator (Circular SVG) */}
                      <div className="fit-score-box">
                        <div className="score-visual-pill">
                          <svg className="circle-progress-svg" viewBox="0 0 36 36" aria-hidden="true">
                            <path
                              className="circle-bg"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                            />
                            <path
                              className="circle-fill"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeDasharray={`${job.matchScore}, 100`}
                              strokeWidth="3.5"
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

                    {/* Candidate Recruiter / Log Note */}
                    {activeNoteEditId === job.id ? (
                      <div className="note-edit-area">
                        <textarea
                          className="note-textarea"
                          rows={3}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Write private notes about this position (recruiter contact, specific projects, requirements)..."
                          aria-label="Edit candidate log"
                        />
                        <div className="note-edit-buttons">
                          <button
                            type="button"
                            className="btn-action-outline"
                            onClick={cancelEditingNote}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn-quick-apply"
                            onClick={() => saveNote(job.id)}
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      job.candidateNote && (
                        <div className="candidate-note-box">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="note-icon"
                            aria-hidden="true"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                          <p className="note-text">
                            <strong>Candidate Log:</strong> {job.candidateNote}
                          </p>
                        </div>
                      )
                    )}

                    {/* Action Deck */}
                    <div className="card-action-deck">
                      <div className="action-deck-left">
                        <button
                          type="button"
                          className="btn-icon-saved"
                          onClick={() => toggleSelectJob(job.id)}
                          aria-label={isSelected ? 'Deselect job' : 'Select job'}
                          title={isSelected ? 'Selected' : 'Select for bulk action'}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="btn-action-outline"
                          onClick={() => startEditingNote(job)}
                          aria-label="Edit recruiter or candidate note"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          {job.candidateNote ? 'Edit Note' : 'Add Note'}
                        </button>

                        <button
                          type="button"
                          className="btn-action-outline"
                          onClick={() => handleExportSpecs(job)}
                          aria-label="Export technical position specs"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Export Specs
                        </button>

                        <button
                          type="button"
                          className="btn-action-danger"
                          onClick={() => removeSavedJob(job.id, job.title)}
                          aria-label={`Remove ${job.title} from saved jobs`}
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
                          className="btn-view-pos"
                          onClick={() => showToast(`Opening specifications for ${job.title}...`)}
                        >
                          View Position
                        </button>

                        <button
                          type="button"
                          className={`btn-quick-apply ${isApplied ? 'applied' : ''}`}
                          onClick={() => handleQuickApply(job.id, job.title)}
                          disabled={isApplied}
                          aria-label={isApplied ? 'Already applied' : `Quick apply to ${job.title}`}
                        >
                          {isApplied ? (
                            <>
                              Applied
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </>
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
            )}
          </section>

          {/* RIGHT COLUMN: Analytical Telemetry & Deadline Timeline */}
          <aside className="saved-sidebar" aria-label="Market and Deadline Telemetry">
            {/* Widget 1: Market Intelligence & Skills Density */}
            <div className="analytics-widget">
              <div className="widget-header">
                <div className="widget-title-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <h3 className="widget-title">Market Trends</h3>
                </div>
                <span className="widget-badge">Telemetry</span>
              </div>

              <div className="metric-box">
                <span className="metric-label">Average Saved Compensation</span>
                <div className="metric-main-row">
                  <span className="metric-number">$138,500</span>
                  <span className="metric-diff">+6.4% AEC Avg</span>
                </div>
                <p className="metric-subtext">
                  Derived from {jobs.length} bookmarked positions across UK and US East Coast markets.
                </p>
              </div>

              <div className="distribution-row">
                <div className="dist-header">
                  <span className="dist-title">Algorithmic Modeling</span>
                  <span className="dist-metric">83% Occurrence</span>
                </div>
                <p className="dist-desc">
                  5 of 6 saved roles demand Grasshopper or Dynamo computational workflows.
                </p>
              </div>

              {/* Engineering Segmented Pressure Ruler */}
              <div className="ruler-progress-container">
                <div className="ruler-header">
                  <span className="label">Computational BIM Hiring Pressure</span>
                  <span className="rate">+18% MoM</span>
                </div>
                <div className="segmented-bar" aria-label="Hiring pressure 80%">
                  <div className="bar-segment filled" />
                  <div className="bar-segment filled" />
                  <div className="bar-segment filled" />
                  <div className="bar-segment filled" />
                  <div className="bar-segment filled" />
                  <div className="bar-segment filled" />
                  <div className="bar-segment filled" />
                  <div className="bar-segment mid" />
                  <div className="bar-segment" />
                  <div className="bar-segment" />
                </div>
                <div className="ruler-scale">
                  <span>Q1 BASE</span>
                  <span>MEDIAN</span>
                  <span>PEAK (LOD-500)</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Upcoming Deadlines Checklist */}
            <div className="analytics-widget">
              <div className="widget-header">
                <div className="widget-title-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h3 className="widget-title">Closing Deadlines</h3>
                </div>
                <span className="widget-badge pill">3 Active</span>
              </div>

              <div className="deadlines-list">
                {UPCOMING_DEADLINES.map((dl) => (
                  <div className="deadline-item" key={dl.id}>
                    <div className="deadline-info">
                      <strong className="deadline-company">{dl.company}</strong>
                      <span className="deadline-role">{dl.role}</span>
                    </div>
                    <span className={`deadline-pill ${dl.urgency}`}>{dl.daysLeftText}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-sync-calendar"
                onClick={() => showToast('Deadlines synchronized with your calendar.')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Sync to BIM Workspace Calendar
              </button>
            </div>

            {/* Widget 3: BIM Alert Rules */}
            <div className="analytics-widget">
              <div className="widget-header">
                <div className="widget-title-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <h3 className="widget-title">BIM Alert Rule</h3>
                </div>
                <span className="widget-badge accent">CONFIG-09</span>
              </div>

              <p className="alert-desc">
                Automatically index upcoming vacancies matching your Grasshopper, Revit LOD-400, and ISO-19650 credentials.
              </p>

              <div className="switch-row">
                <span className="switch-label">Auto-match Notifications</span>
                <label className="toggle-switch" aria-label="Toggle auto match notifications">
                  <input
                    type="checkbox"
                    checked={autoMatchAlerts}
                    onChange={(e) => {
                      setAutoMatchAlerts(e.target.checked)
                      showToast(
                        e.target.checked
                          ? 'Auto-match alerts enabled'
                          : 'Auto-match alerts paused'
                      )
                    }}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="cadence-selector">
                <span className="cadence-title">Dispatch Cadence</span>
                <div className="cadence-grid">
                  <button
                    type="button"
                    className={`cadence-btn ${alertCadence === 'daily' ? 'active' : ''}`}
                    onClick={() => {
                      setAlertCadence('daily')
                      showToast('Cadence switched to Daily Digest.')
                    }}
                  >
                    Daily Digest
                  </button>
                  <button
                    type="button"
                    className={`cadence-btn ${alertCadence === 'realtime' ? 'active' : ''}`}
                    onClick={() => {
                      setAlertCadence('realtime')
                      showToast('Cadence switched to Real-time Alerts.')
                    }}
                  >
                    Real-time
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </main>
      )}

      {/* Archived & Expired Tab View */}
      {activeTab === 'archived' && (
        <section className="saved-stream" aria-label="Archived & Expired Listings">
          {ARCHIVED_JOBS.map((job) => (
            <article key={job.id} className="saved-job-card" style={{ opacity: 0.85 }}>
              <div className="job-card-top-row">
                <div className="job-brand-wrap">
                  <div className={`company-badge ${job.companyColor}`}>{job.companyInitials}</div>
                  <div className="job-headline-info">
                    <div className="job-title-row">
                      <h2 className="job-title-text">{job.title}</h2>
                      <span className="closing-pill">{job.matchLabel}</span>
                    </div>
                    <div className="job-meta-line">
                      <span className="company-name">{job.company}</span>
                      <span className="meta-dot" aria-hidden="true" />
                      <span>{job.location}</span>
                      <span className="meta-dot" aria-hidden="true" />
                      <span className="salary-tag">{job.salary}</span>
                    </div>
                  </div>
                </div>
                <div className="fit-score-box">
                  <span className="saved-time-tag">{job.savedDate}</span>
                </div>
              </div>
              <div className="stack-strip">
                <span className="stack-label">STACK:</span>
                {job.stack.map((item) => (
                  <span className="stack-chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Saved Companies Tab View */}
      {activeTab === 'companies' && (
        <section className="saved-stream" aria-label="Saved Firm Profiles">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {SAVED_COMPANIES.map((comp) => (
              <article key={comp.id} className="saved-job-card">
                <div className="job-brand-wrap">
                  <div className="company-badge primary">{comp.initials}</div>
                  <div className="job-headline-info">
                    <h2 className="job-title-text">{comp.name}</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#424753' }}>{comp.industry}</p>
                    <span style={{ fontSize: '12px', color: '#727784' }}>{comp.location}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                  <span className="tech-badge-primary">{comp.openRolesCount} Open Positions</span>
                  <button
                    type="button"
                    className="btn-action-outline"
                    onClick={() => showToast(`Viewing active openings at ${comp.name}`)}
                  >
                    View Jobs
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default SavedJobs
