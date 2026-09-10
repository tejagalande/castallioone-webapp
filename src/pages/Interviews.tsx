import type { FC } from 'react'
import './Interviews.css'
import {
  useInterviews,
  type CompletedInterview,
} from './useInterviews'

interface InterviewsProps {
  onNavigateToFindJobs?: () => void
}

const Interviews: FC<InterviewsProps> = () => {
  const {
    activeTab,
    setActiveTab,
    formatFilter,
    setFormatFilter,
    selectedZhaSlot,
    setSelectedZhaSlot,
    isZhaConfirmed,
    selectedTimezone,
    setSelectedTimezone,
    zhaSlots,
    completedInterviews,
    isMockModalOpen,
    setIsMockModalOpen,
    isDiagnosticsModalOpen,
    setIsDiagnosticsModalOpen,
    isAvailabilityModalOpen,
    setIsAvailabilityModalOpen,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    selectedFeedbackItem,
    setSelectedFeedbackItem,
    diagStep,
    isTestingDiag,
    toastMessage,
    showToast,
    handleConfirmZhaSlot,
    handleSyncCalendar,
    handleDownloadIcs,
    runFullDiagnostics,
  } = useInterviews()

  return (
    <div className="interviews-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="int-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Telemetry & Breadcrumb Sub-bar */}
      <section className="int-telemetry-bar" aria-label="AEC Interview Telemetry">
        <div className="telemetry-row-left">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00418f', fontWeight: 600 }}>
            <span className="pulse-dot-primary" aria-hidden="true" />
            TALENT_WORKSPACE
          </span>
          <span style={{ color: '#727784' }}>/</span>
          <span style={{ color: '#1a1c1e', fontWeight: 600 }}>INTERVIEWS-SCHEDULE-V2.1</span>
          <span style={{ color: '#727784' }}>/</span>
          <span style={{ color: '#727784' }}>CALENDAR ENGINE: GOOGLE &amp; OUTLOOK SYNCED</span>
        </div>

        <div className="telemetry-row-right">
          <span className="telemetry-tag-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            TIMEZONE: <strong style={{ color: '#1a1c1e' }}>GMT (LONDON / UTC+0)</strong>
          </span>

          <span className="telemetry-tag-pill active-rounds">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '13px', height: '13px' }} aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            STATUS: 2 UPCOMING ROUNDS
          </span>
        </div>
      </section>

      {/* 2. Page Header & Action Bar */}
      <header className="int-header-section">
        <div className="int-title-wrapper">
          <div className="int-meta-tags">
            <span className="int-verified-badge">Verified Talent Pipeline</span>
            <span className="int-session-id">SESSION ID: #TLN-8842-INT</span>
          </div>
          <h1 className="int-main-heading">Interviews &amp; Technical Assessments</h1>
          <p className="int-lead-description">
            Manage scheduled technical panels, algorithmic code defenses, BIM model audits, and recruiter debriefs with leading AEC practices.
          </p>
        </div>

        <div className="int-action-cluster">
          <button
            type="button"
            className="btn-int-light"
            onClick={handleSyncCalendar}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" aria-hidden="true">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Sync Calendar</span>
            <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '4px' }}>
              <span style={{ background: '#eeeef0', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}>G</span>
              <span style={{ background: '#eeeef0', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}>O</span>
            </span>
          </button>

          <button
            type="button"
            className="btn-int-light"
            onClick={() => setIsAvailabilityModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#39464f" strokeWidth="2" aria-hidden="true">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
            </svg>
            <span>Availability Windows</span>
          </button>

          <button
            type="button"
            className="btn-int-primary"
            onClick={() => {
              setIsDiagnosticsModalOpen(true)
              runFullDiagnostics()
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Practice 3D Sandbox</span>
          </button>
        </div>
      </header>

      {/* 3. Metrics Summary Strip (4 Cards) */}
      <section className="int-metrics-grid" aria-label="Assessment Metrics">
        {/* Metric 1 */}
        <article className="int-metric-card">
          <div className="metric-top-row">
            <div>
              <span className="metric-lbl-text">Upcoming Sessions</span>
              <div className="metric-val-group">
                <span className="metric-huge-num">2</span>
                <span className="metric-sub-label">Scheduled</span>
              </div>
            </div>
            <div className="metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
          </div>
          <div className="metric-bottom-meta">
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Foster + Partners, Grimshaw</span>
            <span style={{ color: '#00418f', fontWeight: 700 }}>Next: 48h</span>
          </div>
        </article>

        {/* Metric 2 */}
        <article className="int-metric-card">
          <div className="metric-top-row">
            <div>
              <span className="metric-lbl-text">Completed Rounds</span>
              <div className="metric-val-group">
                <span className="metric-huge-num">5</span>
                <span className="metric-sub-label" style={{ color: '#00418f' }}>Passed</span>
              </div>
            </div>
            <div className="metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="metric-bottom-meta">
            <span>Clearance Rate</span>
            <span style={{ color: '#1a1c1e', fontWeight: 700 }}>100% Technical</span>
          </div>
        </article>

        {/* Metric 3 */}
        <article className="int-metric-card">
          <div className="metric-top-row">
            <div>
              <span className="metric-lbl-text">Avg. Panel Score</span>
              <div className="metric-val-group">
                <span className="metric-huge-num">
                  94.8<span style={{ fontSize: '18px', color: '#727784', fontWeight: 400 }}>%</span>
                </span>
              </div>
            </div>
            <div className="metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
          </div>
          <div className="metric-bottom-meta">
            <span style={{ background: 'rgba(0, 65, 143, 0.1)', color: '#00418f', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              Top 5% Computational Pool
            </span>
            <span style={{ color: '#727784' }}>LOD 400+</span>
          </div>
        </article>

        {/* Metric 4 */}
        <article className="int-metric-card">
          <div className="metric-top-row">
            <div>
              <span className="metric-lbl-text" style={{ color: '#b3272d' }}>Pending Invites</span>
              <div className="metric-val-group">
                <span className="metric-huge-num" style={{ color: '#b3272d' }}>
                  {isZhaConfirmed ? '0' : '1'}
                </span>
                <span className="metric-sub-label" style={{ color: isZhaConfirmed ? '#00418f' : '#b3272d' }}>
                  {isZhaConfirmed ? 'All Confirmed' : 'Action Required'}
                </span>
              </div>
            </div>
            <div className="metric-icon-box secondary" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
          </div>
          <div className="metric-bottom-meta">
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Zaha Hadid Architects</span>
            <span style={{ color: isZhaConfirmed ? '#00418f' : '#b3272d', fontWeight: 700 }}>
              {isZhaConfirmed ? 'Slot Synced' : 'Slot Selection'}
            </span>
          </div>
        </article>
      </section>

      {/* 4. Main Grid Workspace (12 cols) */}
      <main className="int-main-workspace-grid">
        {/* LEFT COLUMN: Main Workspace (8 cols) */}
        <div className="int-left-col">
          {/* View Selector Tabs & Filter Chips */}
          <div className="int-view-selector-bar">
            <div className="int-tabs-scroll" role="tablist">
              <button
                type="button"
                className={`int-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming (2)
              </button>

              <button
                type="button"
                className={`int-tab-btn ${activeTab === 'action-required' ? 'active' : ''}`}
                onClick={() => setActiveTab('action-required')}
              >
                Action Required
                {!isZhaConfirmed && <span className="tab-badge-dot" aria-hidden="true" />}
              </button>

              <button
                type="button"
                className={`int-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past Completed (5)
              </button>

              <button
                type="button"
                className={`int-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Rounds (8)
              </button>
            </div>

            <div className="int-filters-scroll">
              <button
                type="button"
                className={`int-filter-pill ${formatFilter === '3d-model-defense' ? 'active' : ''}`}
                onClick={() => setFormatFilter(formatFilter === '3d-model-defense' ? 'all' : '3d-model-defense')}
              >
                <span>Format: <strong>3D Model Defense</strong></span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <button
                type="button"
                className={`int-filter-pill ${formatFilter === 'tier-1' ? 'active' : ''}`}
                onClick={() => setFormatFilter(formatFilter === 'tier-1' ? 'all' : 'tier-1')}
              >
                <span>Tier-1 AEC</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '12px', height: '12px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* CARD 1: Pinned / Next Imminent Interview (Foster + Partners) */}
          {(activeTab === 'upcoming' || activeTab === 'all') && (
            <article className="imminent-session-card" aria-labelledby="fp-interview-title">
              {/* Top Header & Imminent Tag */}
              <div className="imminent-card-top">
                <div className="firm-identity-block">
                  <div className="firm-monogram-box">
                    <span>F+P</span>
                  </div>
                  <div>
                    <h2 className="firm-name-title" id="fp-interview-title">
                      Foster + Partners
                      <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </h2>
                    <p className="firm-subtext-line">Applied R&amp;D Computation Studio • London HQ (Riverside)</p>
                  </div>
                </div>

                <div className="session-badge-strip">
                  <span className="badge-live-pulse">
                    <span className="pulse-dot-primary" style={{ background: '#ffffff' }} aria-hidden="true" />
                    LIVE VIDEO + 3D SANDBOX
                  </span>
                  <span className="badge-session-code">SESSION: #INT-FP-9821</span>
                </div>
              </div>

              {/* Role & Stage Banner */}
              <div className="stage-role-banner">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span className="stage-tracker-lbl">
                    Stage 03 / 04 • Technical Algorithm &amp; LOD-400 Model Defense
                  </span>
                  <h3 className="role-prominent-title">
                    Lead Computational Designer &amp; Façade Specialist
                  </h3>
                </div>

                <div className="fit-score-block">
                  <div className="fit-text-meta">
                    <div className="lbl">TECHNICAL FIT</div>
                    <div className="score">96.4%</div>
                  </div>
                  <div style={{ position: 'relative', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '38px', height: '38px', transform: 'rotate(-90deg)' }}>
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e2e5"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#00418f"
                        strokeWidth="3.5"
                        strokeDasharray="96, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ position: 'absolute', width: '14px', height: '14px' }} aria-hidden="true">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Timing and Interviewers Grid */}
              <div className="timing-panelists-grid">
                <div className="info-sub-card">
                  <div className="info-card-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="info-card-content">
                    <span className="lbl">Scheduled Date &amp; Time</span>
                    <p className="val-date">Thursday, Nov 7, 2024</p>
                    <p className="val-time">14:00 - 14:45 GMT (45 mins)</p>
                  </div>
                </div>

                <div className="info-sub-card">
                  <div className="info-card-icon" style={{ background: '#eeeef0', color: '#39464f' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="info-card-content">
                    <span className="lbl">Examination Panel</span>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e', margin: 0 }}>
                      Elena Rostova <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', fontWeight: 400 }}>(Head of Computational TA)</span>
                    </p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e', margin: 0 }}>
                      Dr. Julian Croft <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', fontWeight: 400 }}>(Partner, Applied R&amp;D)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Defense Agenda Box */}
              <div className="defense-agenda-box">
                <div className="agenda-header-line">
                  <span style={{ fontWeight: 700, color: '#1a1c1e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }} aria-hidden="true">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                    Session Agenda &amp; Live Model Scope
                  </span>
                  <span style={{ color: '#727784' }}>ISO 19650-2 / LOD-400 SPEC</span>
                </div>

                <div className="agenda-items-list">
                  <div className="agenda-step-row">
                    <span className="agenda-time-pill">15m</span>
                    <div className="agenda-desc-text">
                      <strong>Grasshopper &amp; pyRevit Automation Workflow:</strong> Candidate walkthrough of parametric skin script for <em>The Scalpel Tower</em> diagrid rationalization.
                    </div>
                  </div>

                  <div className="agenda-step-row">
                    <span className="agenda-time-pill">20m</span>
                    <div className="agenda-desc-text">
                      <strong>Live LOD-400 Panelization &amp; Clash Script Defense:</strong> Live interactive test in WebGL sandbox. Rationalizing double-curved GFRC panels with fabrication tolerance.
                    </div>
                  </div>

                  <div className="agenda-step-row">
                    <span className="agenda-time-pill">10m</span>
                    <div className="agenda-desc-text">
                      <strong>ISO 19650 CDE &amp; BEP Architecture:</strong> Interactive Q&amp;A on multi-firm federated coordination protocols &amp; schema mappings.
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-loaded Technical Materials Strip */}
              <div className="preloaded-assets-row">
                <div className="assets-chips-wrap">
                  <span style={{ color: '#727784', textTransform: 'uppercase', marginRight: '4px' }}>Pre-loaded Assets:</span>
                  <button
                    type="button"
                    className="asset-chip-link"
                    onClick={() => showToast('Opening Foster_Technical_Panel_Brief.pdf...')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>Foster_Technical_Panel_Brief.pdf</span>
                  </button>

                  <button
                    type="button"
                    className="asset-chip-link"
                    onClick={() => showToast('Inspecting Scalpel_Facade_Cluster.ghx cluster definitions...')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" aria-hidden="true">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    <span>Scalpel_Facade_Cluster.ghx</span>
                  </button>

                  <button
                    type="button"
                    className="asset-chip-link"
                    onClick={() => showToast('Alex_Morgan_Verified_CV_v4.2.pdf loaded.')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#39464f" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 14 14" />
                    </svg>
                    <span>Alex_Morgan_Verified_CV_v4.2.pdf</span>
                  </button>
                </div>

                <span style={{ color: '#727784' }}>ENCRYPTION: TLS 1.3 AEC-VAULT</span>
              </div>

              {/* Main CTA Bar */}
              <div className="imminent-cta-bar">
                <div className="cta-left-group">
                  <button
                    type="button"
                    className="btn-int-primary"
                    onClick={() => showToast('Live Video Room will activate at 13:50 GMT on Thursday, Nov 7.')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <span>Join Live Room (Opens in 46h)</span>
                  </button>

                  <button
                    type="button"
                    className="btn-int-light"
                    onClick={() => {
                      setIsDiagnosticsModalOpen(true)
                      runFullDiagnostics()
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" aria-hidden="true">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    </svg>
                    <span>Test BIM Sandbox &amp; Mic</span>
                  </button>
                </div>

                <div className="cta-right-group">
                  <button
                    type="button"
                    className="btn-int-light"
                    style={{ fontSize: '12px' }}
                    onClick={() => showToast('Reschedule request sent to Elena Rostova (F+P).')}
                  >
                    Reschedule / Propose Alternate
                  </button>

                  <button
                    type="button"
                    className="btn-int-light"
                    style={{ padding: '8px 10px' }}
                    title="Download .ics calendar file"
                    onClick={() => handleDownloadIcs('Foster_Partners_Technical_Defense')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="12" y1="11" x2="12" y2="17" />
                      <line x1="9" y1="14" x2="15" y2="14" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* CARD 2: Grimshaw Upcoming Interview */}
          {(activeTab === 'upcoming' || activeTab === 'all') && (
            <article className="secondary-session-card" aria-labelledby="grimshaw-title">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="firm-monogram-box" style={{ background: '#eeeef0', color: '#39464f' }}>
                    <span>GA</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="firm-name-title" id="grimshaw-title">Grimshaw Architects</h3>
                      <span className="badge-session-code" style={{ fontSize: '10px' }}>STAGE 02 / 03</span>
                    </div>
                    <p className="firm-subtext-line" style={{ fontWeight: 600 }}>
                      Senior BIM Infrastructure Coordinator (HS2 Rail Interchange)
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge-session-code" style={{ background: '#d8e2ff', color: '#00418f', fontWeight: 700 }}>
                    CDE SIMULATION
                  </span>
                  <span className="badge-session-code" style={{ background: '#eeeef0', color: '#1a1c1e', fontWeight: 700 }}>
                    SOLIBRI AUDIT
                  </span>
                </div>
              </div>

              <div className="three-col-metric-grid">
                <div className="three-col-item">
                  <span className="lbl">DATE &amp; WINDOW</span>
                  <span className="main">Mon, Nov 11, 2024</span>
                  <span className="sub">10:30 - 11:30 GMT (60m)</span>
                </div>

                <div className="three-col-item">
                  <span className="lbl">LEAD ASSESSOR</span>
                  <span className="main">Marcus Vance</span>
                  <span className="sub">VDC Director, Transit &amp; Rail</span>
                </div>

                <div className="three-col-item">
                  <span className="lbl">VERIFICATION FOCUS</span>
                  <span className="main">ISO 19650 BEP Audit</span>
                  <span className="sub" style={{ color: '#00418f', fontWeight: 600 }}>Cross-Disciplinary Model QA</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(194, 198, 213, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-int-primary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                    onClick={() => showToast('Opening HS2 Rail Interchange Preparation Checklist...')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    <span>Prepare Checklist</span>
                  </button>

                  <button
                    type="button"
                    className="btn-int-light"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => showToast('Marcus Vance: VDC Director @ Grimshaw, 14 yrs AEC experience.')}
                  >
                    View Panelist Profile
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#424753' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }} aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Calendar Invite Sent (.ics confirmed)</span>
                </div>
              </div>
            </article>
          )}

          {/* CARD 3: Action Required (Pending Invitation Slot Selection - ZHA) */}
          {(activeTab === 'action-required' || activeTab === 'all') && (
            <article className="action-required-card" aria-labelledby="zha-title">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="firm-monogram-box" style={{ background: '#eeeef0', color: '#b3272d' }}>
                    <span>ZHA</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="firm-name-title" id="zha-title">Zaha Hadid Architects</h3>
                      <span className="badge-action-alert">
                        {isZhaConfirmed ? 'SLOT CONFIRMED' : 'ACTION REQUIRED'}
                      </span>
                    </div>
                    <p className="firm-subtext-line">
                      Parametric Façade Scripting Specialist • CODE Computation Research Unit
                    </p>
                  </div>
                </div>

                {!isZhaConfirmed && (
                  <div className="expiry-countdown">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                      <path d="M5 22h14M5 2h14m-4 0v6.5a4.5 4.5 0 0 1-9 0V2m9 20v-6.5a4.5 4.5 0 0 0-9 0V22" />
                    </svg>
                    <span>EXPIRES IN 22 HOURS</span>
                  </div>
                )}
              </div>

              <div style={{ background: '#f3f3f6', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: '#1a1c1e' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Stage 1: Portfolio &amp; Algorithmic Geometry Review
                </div>
                <p style={{ fontSize: '13px', color: '#424753', margin: 0 }}>
                  Recruiter Shona Macleod (Lead AEC Talent Partner) proposed 3 time slots for your 45-minute portfolio deep-dive. Please confirm one to synchronize calendars:
                </p>

                <div className="slots-selector-grid">
                  {zhaSlots.map((slot) => {
                    const isSelected = selectedZhaSlot === slot.id

                    return (
                      <label
                        key={slot.id}
                        className={`slot-radio-card ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="zha_slot"
                          checked={isSelected}
                          onChange={() => setSelectedZhaSlot(slot.id)}
                        />
                        <div>
                          <p className="slot-date-title">{slot.dateText}</p>
                          <p className="slot-time-sub">{slot.timeText}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isZhaConfirmed ? (
                    <span className="btn-int-light" style={{ background: '#d8e2ff', color: '#00418f', fontWeight: 700 }}>
                      ✓ Slot Confirmed &amp; Calendar Synced
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-int-primary"
                        onClick={handleConfirmZhaSlot}
                      >
                        Confirm Selected Slot
                      </button>

                      <button
                        type="button"
                        className="btn-int-light"
                        onClick={() => showToast('Alternative times requested from ZHA CODE unit.')}
                      >
                        Request Alternative Time
                      </button>
                    </>
                  )}
                </div>

                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                  HOST: CODE COMPUTATION LAB
                </span>
              </div>
            </article>
          )}

          {/* CARD 4: Past Interview Archive Snippet */}
          {(activeTab === 'past' || activeTab === 'all') && (
            <article className="archive-snippet-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#39464f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <h4 style={{ fontFamily: 'Hanken Grotesk', fontSize: '15px', fontWeight: 700, margin: 0, color: '#1a1c1e' }}>
                    Recent Verified Performance
                  </h4>
                </div>

                <button
                  type="button"
                  style={{ border: 'none', background: 'none', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => setIsFeedbackModalOpen(true)}
                >
                  View All 5 Completed Rounds →
                </button>
              </div>

              <div className="archive-items-grid">
                {completedInterviews.slice(0, 2).map((item: CompletedInterview) => (
                  <div className="archive-item-card" key={item.id}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '13.5px', color: '#1a1c1e' }}>{item.firmName}</strong>
                        <span className="badge-session-code" style={{ background: item.badgeColor === 'success' ? '#d8e2ff' : 'rgba(0,65,143,0.1)', color: '#00418f', fontWeight: 700, fontSize: '9.5px' }}>
                          {item.statusBadge}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#424753' }}>
                        {item.roleTitle} • {item.dateText}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-int-light"
                      style={{ padding: '6px 8px' }}
                      title="View Performance Breakdown"
                      onClick={() => {
                        setSelectedFeedbackItem(item)
                        setIsFeedbackModalOpen(true)
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>

        {/* RIGHT COLUMN: Telemetry, Prep Simulator & Diagnostic Sidebar (4 cols) */}
        <aside className="int-right-col">
          {/* Card: AI Interview Prep Kit */}
          <article className="sidebar-box-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <path d="M12 2a10 10 0 0 1 10 10c0 4.42-3.58 8-8 8v2c0 .55-.45 1-1 1s-1-.45-1-1v-2a8 8 0 0 1-8-8c0-5.52 4.48-10 10-10z" />
                </svg>
                AI Interview Prep Kit
              </h3>
              <span className="int-verified-badge" style={{ fontSize: '10px' }}>GPT-4o BIM</span>
            </div>

            <p className="sidebar-card-desc">
              Context-tailored drill generator calibrated for <strong>Foster + Partners</strong> computational defense panel.
            </p>

            <div style={{ background: '#f3f3f6', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', textTransform: 'uppercase', color: '#727784', fontWeight: 700 }}>
                Recommended Prep Focus
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#1a1c1e' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px', flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span>pyRevit Unit Testing &amp; Ribbon deployment structure</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#1a1c1e' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px', flexShrink: 0, marginTop: '2px' }}>
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                </svg>
                <span>Rhino.Inside geometry streaming under IFC4 schema</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#1a1c1e' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px', flexShrink: 0, marginTop: '2px' }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                </svg>
                <span>Embodied Carbon evaluation scripts in Ladybug &amp; Pollination</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-int-primary"
              style={{ justifyContent: 'center' }}
              onClick={() => setIsMockModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              <span>Launch Mock Technical Simulator</span>
            </button>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', textAlign: 'center' }}>
              Includes live audio interrogation + live code sandbox
            </span>
          </article>

          {/* Card: 3D Sandbox Diagnostics */}
          <article className="sidebar-box-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                3D Sandbox Diagnostics
              </h3>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#00418f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot-primary" aria-hidden="true" />
                ACTIVE
              </span>
            </div>

            <p className="sidebar-card-desc">
              Local workstation diagnostic suite for seamless model manipulation during technical defense panels.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="diagnostic-item-row">
                <span>WebGL 2.0 Graphics Pipeline</span>
                <span className="status-val">60 FPS (RTX Active)</span>
              </div>
              <div className="diagnostic-item-row">
                <span>IFC4x3 WASM Parser</span>
                <span className="status-val">READY (v3.2)</span>
              </div>
              <div className="diagnostic-item-row">
                <span>Dual Screen Share Sync</span>
                <span className="status-val">VERIFIED</span>
              </div>
              <div className="diagnostic-item-row">
                <span>Audio/Latency Buffer</span>
                <span className="status-val">18 ms (Ultra-low)</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-int-light"
              style={{ justifyContent: 'center' }}
              onClick={() => {
                setIsDiagnosticsModalOpen(true)
                runFullDiagnostics()
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#39464f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Run 60s Tech Check</span>
            </button>
          </article>

          {/* Card: Recruiter Notes & Debrief Feedback */}
          <article className="sidebar-box-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Debrief Feedback
              </h3>
              <span className="badge-session-code" style={{ fontSize: '10px' }}>ARUP AUDIT</span>
            </div>

            <div className="debrief-quote-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '13px', color: '#1a1c1e' }}>Arup Global Computational Panel</strong>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#00418f', fontWeight: 700 }}>
                  9.6 / 10
                </span>
              </div>
              <p className="debrief-quote-text">
                “Exceptional mastery of openBIM schemas and Grasshopper custom components. Strong communication of complex parametric constraints and automated fabrication outputs.”
              </p>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', textAlign: 'right' }}>
                — Dr. Sarah Jenkins, Lead Partner
              </span>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '4px' }}>
              <button
                type="button"
                style={{ border: 'none', background: 'none', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setIsFeedbackModalOpen(true)}
              >
                View All 4 Post-Interview Feedback Reports →
              </button>
            </div>
          </article>

          {/* Card: Availability Window */}
          <article className="sidebar-box-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Availability Window
              </h3>
              <button
                type="button"
                style={{ border: 'none', background: 'none', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setIsAvailabilityModalOpen(true)}
              >
                Edit
              </button>
            </div>

            <p className="sidebar-card-desc">Automated reservation slots published to Tier-1 firms:</p>

            <div className="hours-schedule-list">
              <div className="hours-row">
                <span style={{ fontWeight: 600, color: '#1a1c1e' }}>Mon – Thu:</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700 }}>14:00 – 18:00 GMT</span>
              </div>
              <div className="hours-row">
                <span style={{ fontWeight: 600, color: '#1a1c1e' }}>Friday:</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#424753' }}>10:00 – 13:00 GMT</span>
              </div>
              <div className="hours-row">
                <span style={{ fontWeight: 600, color: '#1a1c1e' }}>Min Notice:</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#424753' }}>24 Hours Required</span>
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', textTransform: 'uppercase', color: '#727784', display: 'block', marginBottom: '4px' }}>
                Active Timezone Reference
              </label>
              <select
                className="timezone-select-box"
                value={selectedTimezone}
                onChange={(e) => {
                  setSelectedTimezone(e.target.value)
                  showToast(`Timezone updated to ${e.target.value}`)
                }}
              >
                <option value="Europe/London (GMT / UTC+0)">Europe/London (GMT / UTC+0)</option>
                <option value="Europe/Berlin (CET / UTC+1)">Europe/Berlin (CET / UTC+1)</option>
                <option value="America/New_York (EST / UTC-5)">America/New_York (EST / UTC-5)</option>
                <option value="Asia/Dubai (GST / UTC+4)">Asia/Dubai (GST / UTC+4)</option>
                <option value="Asia/Singapore (SGT / UTC+8)">Asia/Singapore (SGT / UTC+8)</option>
              </select>
            </div>
          </article>
        </aside>
      </main>

      {/* ── MODAL: AI Mock Simulator ── */}
      {isMockModalOpen && (
        <div className="int-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="mock-modal-title">
          <div className="int-modal-dialog">
            <div className="modal-header-bar">
              <h2 id="mock-modal-title">AI Mock Technical Assessment Simulator</h2>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsMockModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-content-body">
              <div style={{ background: '#f3f3f6', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                  ACTIVE TARGET: FOSTER + PARTNERS PANEL
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#1a1c1e' }}>
                  Simulates a 45-minute technical interrogation covering double-curved façade rationalization and LOD-400 ISO 19650 protocols.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: '#1a1c1e' }}>Select Simulator Difficulty</label>
                <select className="timezone-select-box" defaultValue="advanced">
                  <option value="standard">Standard BIM Coordinator Level</option>
                  <option value="advanced">Senior / Lead Computational Architect (Tier-1 Standard)</option>
                  <option value="expert">Expert Partner Level (High pressure / Edge cases)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: '#1a1c1e' }}>Live Code &amp; Geometry Engine</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="badge-session-code" style={{ background: '#d8e2ff', color: '#00418f', fontWeight: 700 }}>
                    Grasshopper WebGL Sandbox: ACTIVE
                  </span>
                  <span className="badge-session-code" style={{ background: '#eeeef0', color: '#39464f', fontWeight: 700 }}>
                    pyRevit Console: READY
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer-bar">
              <button
                type="button"
                className="btn-int-light"
                onClick={() => setIsMockModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-int-primary"
                onClick={() => {
                  setIsMockModalOpen(false)
                  showToast('Starting AI Mock Simulator session with audio & WebGL engine...')
                }}
              >
                Begin 45-Min Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: 60s Tech Check Diagnostics ── */}
      {isDiagnosticsModalOpen && (
        <div className="int-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="diag-modal-title">
          <div className="int-modal-dialog">
            <div className="modal-header-bar">
              <h2 id="diag-modal-title">Local Workstation 3D &amp; Comms Diagnostic</h2>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsDiagnosticsModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-content-body">
              <p style={{ margin: 0 }}>
                Running hardware acceleration and WebRTC connectivity tests for live model sharing during technical assessments.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="diagnostic-item-row">
                  <span>1. WebGL 2.0 Shader Pipeline</span>
                  <span className="status-val" style={{ color: diagStep >= 1 ? '#00418f' : '#727784' }}>
                    {diagStep >= 1 ? '✓ 60 FPS (NVIDIA RTX)' : 'Testing...'}
                  </span>
                </div>
                <div className="diagnostic-item-row">
                  <span>2. IFC4.3 WebAssembly Parser</span>
                  <span className="status-val" style={{ color: diagStep >= 2 ? '#00418f' : '#727784' }}>
                    {diagStep >= 2 ? '✓ VERIFIED (v3.2.1)' : 'Pending...'}
                  </span>
                </div>
                <div className="diagnostic-item-row">
                  <span>3. Microphone &amp; Noise Cancellation</span>
                  <span className="status-val" style={{ color: diagStep >= 3 ? '#00418f' : '#727784' }}>
                    {diagStep >= 3 ? '✓ Clear (48kHz)' : 'Pending...'}
                  </span>
                </div>
                <div className="diagnostic-item-row">
                  <span>4. Network Latency to London Hub</span>
                  <span className="status-val" style={{ color: diagStep >= 4 ? '#00418f' : '#727784' }}>
                    {diagStep >= 4 ? '✓ 18ms (Ultra-Low)' : 'Pending...'}
                  </span>
                </div>
              </div>

              {isTestingDiag && (
                <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                  Testing streaming buffer and vertex shaders...
                </div>
              )}
            </div>

            <div className="modal-footer-bar">
              <button
                type="button"
                className="btn-int-light"
                onClick={() => setIsDiagnosticsModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-int-primary"
                onClick={runFullDiagnostics}
              >
                Rerun Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Availability Editor ── */}
      {isAvailabilityModalOpen && (
        <div className="int-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="avail-modal-title">
          <div className="int-modal-dialog">
            <div className="modal-header-bar">
              <h2 id="avail-modal-title">Edit Availability Windows</h2>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsAvailabilityModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-content-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, color: '#1a1c1e' }}>Monday – Thursday Time Slot</label>
                <input
                  type="text"
                  className="timezone-select-box"
                  defaultValue="14:00 – 18:00 GMT"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, color: '#1a1c1e' }}>Friday Time Slot</label>
                <input
                  type="text"
                  className="timezone-select-box"
                  defaultValue="10:00 – 13:00 GMT"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, color: '#1a1c1e' }}>Minimum Advance Notice</label>
                <select className="timezone-select-box" defaultValue="24">
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours Required</option>
                  <option value="48">48 Hours</option>
                </select>
              </div>
            </div>

            <div className="modal-footer-bar">
              <button
                type="button"
                className="btn-int-light"
                onClick={() => setIsAvailabilityModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-int-primary"
                onClick={() => {
                  setIsAvailabilityModalOpen(false)
                  showToast('Availability windows published to Tier-1 hiring firms.')
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Feedback & Performance Breakdown ── */}
      {isFeedbackModalOpen && (
        <div className="int-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
          <div className="int-modal-dialog" style={{ maxWidth: '600px' }}>
            <div className="modal-header-bar">
              <h2 id="feedback-modal-title">Completed Rounds &amp; Panel Feedback</h2>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => {
                  setIsFeedbackModalOpen(false)
                  setSelectedFeedbackItem(null)
                }}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-content-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {completedInterviews.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#f3f3f6',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      border: selectedFeedbackItem?.id === item.id ? '2px solid #00418f' : '1px solid #e2e2e5',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '14px', color: '#1a1c1e' }}>{item.firmName}</strong>
                      <span className="badge-session-code" style={{ background: '#d8e2ff', color: '#00418f', fontWeight: 700 }}>
                        {item.statusBadge}
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#00418f', margin: '3px 0 0', fontWeight: 600 }}>
                      {item.roleTitle} ({item.dateText})
                    </p>
                    <p style={{ fontSize: '12px', color: '#424753', margin: '4px 0 0' }}>
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer-bar">
              <button
                type="button"
                className="btn-int-primary"
                onClick={() => {
                  setIsFeedbackModalOpen(false)
                  setSelectedFeedbackItem(null)
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Interviews
