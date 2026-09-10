import type { FC } from 'react'
import './MyJobs.css'
import {
  useMyJobs,
  type RequisitionItem,
  type LiveRadarAlert,
} from './useMyJobs'

interface MyJobsProps {
  onPostNewJob?: () => void
}

export const MyJobs: FC<MyJobsProps> = ({ onPostNewJob }) => {
  const {
    filteredRequisitions,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    radarAlerts,
    totalCount,
    activeCount,
    draftCount,
    interviewingCount,
    closedCount,
    selectedReqForCandidates,
    isCandidatesModalOpen,
    setIsCandidatesModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    toastMessage,
    showToast,
    handlePauseRequisition,
    handleDuplicateRequisition,
    handleDiscardDraft,
    handleReopenRequisition,
    handleExportLedger,
    handleOpenCandidates,
  } = useMyJobs(onPostNewJob)

  return (
    <div className="my-jobs-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="mj-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Top Telemetry Meta Strip */}
      <section className="mj-telemetry-strip" aria-label="Requisitions Management Telemetry">
        <div className="mj-telemetry-left">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00418f', fontWeight: 700 }}>
            <span className="pulse-dot-mj" aria-hidden="true" />
            WORKSPACE // REQUISITIONS-MANAGEMENT-V2.6
          </span>
          <span style={{ color: '#c2c6d5' }}>/</span>
          <span style={{ color: '#39464f', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }} aria-hidden="true">
              <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M18 11h2M18 15h2M9 3h6v4H9z" />
            </svg>
            Foster + Partners (Applied R&amp;D Studio)
          </span>
          <span style={{ color: '#c2c6d5' }}>/</span>
          <span style={{ color: '#1a1c1e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            LIVE TALENT RADAR: 4 ACTIVE NODES
          </span>
        </div>

        <div className="mj-telemetry-right">
          <span style={{ background: '#d8e2ff', color: '#001a41', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
            ISO 19650 LEVEL 2
          </span>
          <span style={{ background: '#d6e5ef', color: '#0f1d25', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
            openBIM VERIFIED
          </span>
        </div>
      </section>

      {/* 2. Top Action Bar & Title Block */}
      <header className="mj-header-section">
        <div className="mj-title-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mj-radar-badge">Recruiter Desk // Production Ready</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>STU_CODE: FP-ARD-LON</span>
          </div>
          <h1 className="mj-main-heading">Requisition Hub &amp; Active Postings</h1>
          <p className="mj-lead-description">
            Monitor real-time candidate pipelines, BIM competency verification, AI talent match velocity, and publishing status across all architectural and computational requisitions.
          </p>
        </div>

        <div className="mj-action-cluster">
          <button
            type="button"
            className="btn-mj-light"
            onClick={() => setIsExportModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Ledger (CSV / PDF)</span>
          </button>

          <button
            type="button"
            className="btn-mj-primary"
            onClick={onPostNewJob}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>Post New Requisition</span>
          </button>
        </div>
      </header>

      {/* 3. Telemetry Metric Quad Cards */}
      <section className="mj-metrics-grid" aria-label="Requisitions Telemetry Quad">
        {/* Metric 1 */}
        <article className="mj-metric-card">
          <div className="mj-metric-top">
            <span className="mj-metric-lbl">Active Requisitions</span>
            <div className="mj-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="mj-metric-huge-num">06</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700, fontSize: '13px' }}>Live / Synced</span>
            </div>
            <p className="mj-metric-subtext" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              +2 added this month (London, Zurich, Remote)
            </p>
          </div>
          <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: '#eeeef0', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '75%', height: '100%', background: '#00418f' }} />
            <div style={{ width: '25%', height: '100%', background: '#095bbf' }} />
          </div>
        </article>

        {/* Metric 2 */}
        <article className="mj-metric-card">
          <div className="mj-metric-top">
            <span className="mj-metric-lbl">Talent Inbound</span>
            <div className="mj-metric-icon-box tertiary" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="mj-metric-huge-num">384</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700, fontSize: '13px' }}>Profiles</span>
            </div>
            <p className="mj-metric-subtext" style={{ marginTop: '4px' }}>
              <strong style={{ fontFamily: 'JetBrains Mono', color: '#1a1c1e' }}>88</strong> verified at 95%+ Fit score
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            First qualified inbound: 17.8 mins avg
          </div>
        </article>

        {/* Metric 3 */}
        <article className="mj-metric-card">
          <div className="mj-metric-top">
            <span className="mj-metric-lbl">3D Sandbox Cleared</span>
            <div className="mj-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="mj-metric-huge-num">42</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700, fontSize: '13px' }}>Submissions</span>
            </div>
            <p className="mj-metric-subtext" style={{ marginTop: '4px' }}>
              GFRC Panelization &amp; pyRevit scripts validated
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
            <span>WebGL Test Pass Rate</span>
            <span style={{ color: '#00418f', fontWeight: 700 }}>87.4%</span>
          </div>
        </article>

        {/* Metric 4 */}
        <article className="mj-metric-card">
          <div className="mj-metric-top">
            <span className="mj-metric-lbl">Velocity Benchmark</span>
            <div className="mj-metric-icon-box secondary" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="mj-metric-huge-num">6.4</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#39464f', fontWeight: 700, fontSize: '13px' }}>Days to Shortlist</span>
            </div>
            <p className="mj-metric-subtext" style={{ marginTop: '4px' }}>
              34% faster than industry standard
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            BEP Skill Matrix Automation On
          </div>
        </article>
      </section>

      {/* 4. Filter Console & Segment Tabs */}
      <section className="mj-filter-console" aria-label="Requisitions Filter Controls">
        <div className="mj-tabs-scroll" role="tablist">
          <button
            type="button"
            className={`mj-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Posts ({totalCount})
          </button>
          <button
            type="button"
            className={`mj-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active &amp; Live ({activeCount})
          </button>
          <button
            type="button"
            className={`mj-tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
            onClick={() => setActiveTab('draft')}
          >
            Under Review / Drafts ({draftCount})
          </button>
          <button
            type="button"
            className={`mj-tab-btn ${activeTab === 'interviewing' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviewing')}
          >
            Interviews Underway ({interviewingCount})
          </button>
          <button
            type="button"
            className={`mj-tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Closed / Fulfilled ({closedCount})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="mj-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter by REQ ID, role, IFC, stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter requisitions"
            />
          </div>

          <button
            type="button"
            className="btn-mj-light"
            style={{ padding: '8px' }}
            title="Filter options"
            onClick={() => showToast('Advanced filtering criteria applied.')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
            </svg>
          </button>
        </div>
      </section>

      {/* 5. Main Content Workspace (12-Column Grid) */}
      <main className="mj-main-grid">
        {/* Primary Requisitions Column (8 Cols Left) */}
        <div className="mj-cards-col">
          {filteredRequisitions.map((req: RequisitionItem) => {
            const isClosed = req.status === 'closed'
            const isDraft = req.status === 'draft'

            return (
              <article
                key={req.id}
                className={`req-hub-card ${isClosed ? 'closed' : ''}`}
                aria-labelledby={`req-title-${req.id}`}
              >
                {/* Header & Badges */}
                <div className="req-card-top-header">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="req-badges-row">
                      {req.badges.map((b, idx) => (
                        <span
                          key={idx}
                          className={idx === 0 ? 'badge-req-status' : 'badge-req-tag'}
                          style={{
                            background: b.includes('DRAFT') ? '#eeeef0' : b.includes('FULFILLED') ? '#e8e8ea' : undefined,
                            color: b.includes('DRAFT') ? '#39464f' : b.includes('FULFILLED') ? '#727784' : undefined,
                          }}
                        >
                          {idx === 0 && !isClosed && !isDraft && (
                            <span className="pulse-dot-mj" style={{ width: '6px', height: '6px', background: '#ffffff' }} aria-hidden="true" />
                          )}
                          {b}
                        </span>
                      ))}
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                        {req.refCode}
                      </span>
                    </div>

                    <h2 className="req-title-text" id={`req-title-${req.id}`}>
                      {req.title}
                    </h2>

                    <div className="req-meta-subline">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {req.location}
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: 700, color: '#1a1c1e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                        </svg>
                        {req.salaryRange}
                      </span>
                      <span>•</span>
                      <span style={{ color: '#39464f' }}>{req.employmentType}</span>
                    </div>
                  </div>

                  {/* Health Score or Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <div className="req-health-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      HEALTH: {req.healthScore}/100
                    </div>
                    {req.healthLabel && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', marginTop: '3px' }}>
                        {req.healthLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Software Stack */}
                <div className="req-stack-chips-line">
                  <span style={{ color: '#727784', marginRight: '4px' }}>STACK:</span>
                  {req.stack.map((item, i) => (
                    <span className="stack-pill-tag" key={i}>
                      {item}
                    </span>
                  ))}
                </div>

                {/* Pipeline Funnel Box if Active / Interviewing */}
                {!isDraft && !isClosed && (
                  <div className="pipeline-conversion-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ fontWeight: 700, color: '#1a1c1e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09" />
                        </svg>
                        Pipeline Stage Conversion
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                        {req.pipeline.sandboxes} Live Sandbox Panels Scheduled
                      </span>
                    </div>

                    <div className="pipeline-funnel-grid">
                      <div className="funnel-segment-card">
                        <span className="lbl">Sourced Pool</span>
                        <span className="num">{req.pipeline.sourced}</span>
                        <span className="sub">RADAR INBOUND</span>
                      </div>

                      <div className="funnel-segment-card">
                        <span className="lbl">Applied</span>
                        <span className="num">{req.pipeline.applied}</span>
                        <span className="sub">+4 today</span>
                      </div>

                      <div className="funnel-segment-card highlighted">
                        <span className="lbl">Shortlist (95%+)</span>
                        <span className="num">{req.pipeline.shortlisted}</span>
                        <span className="sub">PASSED BEP VERIF</span>
                      </div>

                      <div className="funnel-segment-card">
                        <span className="lbl">3D Sandboxes</span>
                        <span className="num">0{req.pipeline.sandboxes}</span>
                        <span className="sub">Elena &amp; Julian C.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Draft Progress Bar if Draft */}
                {isDraft && req.progressPercent && (
                  <div style={{ background: '#f3f3f6', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11.5px' }}>
                      <span style={{ color: '#727784' }}>Setup Progress</span>
                      <span style={{ color: '#00418f', fontWeight: 700 }}>{req.progressPercent}% Complete</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: '#eeeef0', overflow: 'hidden' }}>
                      <div style={{ width: `${req.progressPercent}%`, height: '100%', background: '#00418f' }} />
                    </div>
                  </div>
                )}

                {/* Closed / Fulfilled notice */}
                {isClosed && req.hiredCandidateName && (
                  <div style={{ background: '#f3f3f6', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1a1c1e' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Selected Candidate: <strong>{req.hiredCandidateName}</strong></span>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="req-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {!isDraft && !isClosed && (
                      <>
                        <button
                          type="button"
                          className="btn-mj-primary"
                          style={{ fontSize: '12.5px', padding: '7px 14px' }}
                          onClick={() => handleOpenCandidates(req)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          <span>View Candidates ({req.pipeline.applied})</span>
                        </button>

                        <button
                          type="button"
                          className="btn-mj-light"
                          style={{ fontSize: '12.5px', padding: '7px 12px' }}
                          onClick={() => handleOpenCandidates(req)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          </svg>
                          <span>3D Sandboxes ({req.pipeline.shortlisted})</span>
                        </button>
                      </>
                    )}

                    {isDraft && (
                      <>
                        <button
                          type="button"
                          className="btn-mj-light"
                          style={{ color: '#b3272d' }}
                          onClick={() => handleDiscardDraft(req.id)}
                        >
                          Discard Draft
                        </button>

                        <button
                          type="button"
                          className="btn-mj-primary"
                          style={{ fontSize: '12.5px', padding: '7px 14px' }}
                          onClick={onPostNewJob}
                        >
                          Continue Configuration →
                        </button>
                      </>
                    )}

                    {isClosed && (
                      <>
                        <button
                          type="button"
                          className="btn-mj-light"
                          onClick={() => showToast('Viewing ledger archive for ' + req.refCode)}
                        >
                          View Ledger Archive
                        </button>

                        <button
                          type="button"
                          className="btn-mj-primary"
                          style={{ fontSize: '12.5px', padding: '7px 14px' }}
                          onClick={() => handleReopenRequisition(req.id)}
                        >
                          Re-open Requisition
                        </button>
                      </>
                    )}
                  </div>

                  {!isDraft && !isClosed && (
                    <div className="footer-action-icons-wrap">
                      <button
                        type="button"
                        className="btn-icon-req"
                        title="Pause Radar"
                        onClick={() => handlePauseRequisition(req.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="10" y1="15" x2="10" y2="9" />
                          <line x1="14" y1="15" x2="14" y2="9" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className="btn-icon-req"
                        title="Duplicate Requisition"
                        onClick={() => handleDuplicateRequisition(req)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className="btn-icon-req"
                        title="Syndicate Configuration"
                        onClick={() => showToast('Syndication channels updated.')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className="btn-icon-req"
                        title="Edit Requisition Details"
                        onClick={onPostNewJob}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Right Sidebar / Talent Intelligence & Radar (4 Cols) */}
        <aside className="mj-sidebar-col">
          {/* Widget 1: Live Inbound Talent Radar */}
          <article className="mj-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="mj-sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                Live Inbound Alerts
              </h3>
              <span className="pulse-dot-mj" title="Radar Streaming" aria-hidden="true" />
            </div>

            <div className="radar-stream-list">
              {radarAlerts.map((alert: LiveRadarAlert) => (
                <div
                  key={alert.id}
                  className="radar-alert-item"
                  onClick={() => showToast(`Opening candidate profile for ${alert.candidateName}...`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#1a1c1e', display: 'block' }}>
                        {alert.candidateName}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#727784' }}>
                        {alert.candidateRole}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', background: '#00418f', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {alert.matchScore}% MATCH
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', borderTop: '1px solid #e2e2e5', paddingTop: '4px' }}>
                    <span style={{ color: '#00418f', fontWeight: 600 }}>{alert.targetRequisitionTitle}</span>
                    <span>{alert.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-mj-light"
              style={{ justifyContent: 'center', color: '#00418f', fontWeight: 700 }}
              onClick={() => showToast('Opening Real-Time Radar Console...')}
            >
              Open Real-Time Radar Console ↗
            </button>
          </article>

          {/* Widget 2: Performance Heatmap & Conversion Telemetry */}
          <article className="mj-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="mj-sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Funnel Conversion
              </h3>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>LAST 30 DAYS</span>
            </div>

            <div className="funnel-blueprint-graphic">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                <span>METRIC BREAKDOWN</span>
                <span style={{ color: '#00418f', fontWeight: 700 }}>RATE: 4.8x BENCHMARK</span>
              </div>

              {/* Blueprint SVG Chart */}
              <svg viewBox="0 0 320 100" style={{ width: '100%', height: '80px', overflow: 'visible' }}>
                <line x1="0" y1="20" x2="320" y2="20" stroke="#c2c6d5" strokeDasharray="2,2" strokeOpacity="0.5" />
                <line x1="0" y1="50" x2="320" y2="50" stroke="#c2c6d5" strokeDasharray="2,2" strokeOpacity="0.5" />
                <line x1="0" y1="80" x2="320" y2="80" stroke="#c2c6d5" strokeDasharray="2,2" strokeOpacity="0.5" />

                <rect x="20" y="30" width="30" height="50" rx="4" fill="#e2e2e5" />
                <rect x="80" y="40" width="30" height="40" rx="4" fill="#095bbf" opacity="0.4" />
                <rect x="140" y="20" width="30" height="60" rx="4" fill="#d8e2ff" />
                <rect x="200" y="10" width="30" height="70" rx="4" fill="#00418f" />
                <rect x="260" y="35" width="30" height="45" rx="4" fill="#39464f" />

                <path d="M 35 30 L 95 40 L 155 20 L 215 10 L 275 35" fill="none" stroke="#00418f" strokeWidth="2.5" />
                <circle cx="215" cy="10" r="4" fill="#ffffff" stroke="#00418f" strokeWidth="2" />
              </svg>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '9.5px', color: '#727784', display: 'block' }}>IMPRESSIONS</span>
                  <span style={{ fontWeight: 700, color: '#1a1c1e' }}>14.8k</span>
                </div>
                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '9.5px', color: '#727784', display: 'block' }}>APPLY RATE</span>
                  <span style={{ fontWeight: 700, color: '#00418f' }}>2.6%</span>
                </div>
                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '9.5px', color: '#727784', display: 'block' }}>TEST PASS</span>
                  <span style={{ fontWeight: 700, color: '#39464f' }}>87.4%</span>
                </div>
              </div>
            </div>
          </article>

          {/* Widget 3: Automated Syndication Hub Status */}
          <article className="mj-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="mj-sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
                AEC Syndication Grid
              </h3>
              <span className="badge-req-status" style={{ fontSize: '10px' }}>ALL LIVE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ background: '#f3f3f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#1a1c1e' }}>RIBA Appointments</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>PING: 42ms</span>
              </div>
              <div style={{ background: '#f3f3f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#1a1c1e' }}>buildingSMART API</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>IFC 4x3 SYNC</span>
              </div>
              <div style={{ background: '#f3f3f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#1a1c1e' }}>LinkedIn AEC Direct</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>ACTIVE // 6 POSTS</span>
              </div>
            </div>
          </article>

          {/* Widget 4: Quick Launch Templates */}
          <article className="mj-sidebar-card">
            <h3 className="mj-sidebar-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Quick Draft Templates
            </h3>
            <p style={{ fontSize: '12.5px', color: '#424753', margin: 0 }}>
              Pre-configured with Foster + Partners BIM Execution Standards:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                className="quick-template-btn"
                onClick={onPostNewJob}
              >
                <span>+ Façade Computation Specialist</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>LOD 400</span>
              </button>

              <button
                type="button"
                className="quick-template-btn"
                onClick={onPostNewJob}
              >
                <span>+ Infrastructure VDC Coordinator</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>COBie / 4D</span>
              </button>

              <button
                type="button"
                className="quick-template-btn"
                onClick={onPostNewJob}
              >
                <span>+ AEC C# &amp; Speckle Plugin Dev</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>.NET 8</span>
              </button>
            </div>
          </article>
        </aside>
      </main>

      {/* ── MODAL: Candidates Drawer ── */}
      {isCandidatesModalOpen && selectedReqForCandidates && (
        <div className="mj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cand-modal-title">
          <div className="mj-modal-dialog">
            <div className="mj-modal-header">
              <div>
                <h2 id="cand-modal-title">{selectedReqForCandidates.title}</h2>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
                  {selectedReqForCandidates.refCode} • {selectedReqForCandidates.pipeline.applied} Inbound Profiles ({selectedReqForCandidates.pipeline.shortlisted} Shortlisted)
                </span>
              </div>
              <button
                type="button"
                className="mj-modal-close"
                onClick={() => setIsCandidatesModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mj-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: '#f3f3f6', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#1a1c1e', display: 'block' }}>Alex Morgan</strong>
                    <span style={{ fontSize: '12px', color: '#424753' }}>Senior BIM Coordinator • ISO 19650 Level 2 Certified</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#d8e2ff', color: '#00418f', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    98% Match
                  </span>
                </div>

                <div style={{ background: '#f3f3f6', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#1a1c1e', display: 'block' }}>David Kim</strong>
                    <span style={{ fontSize: '12px', color: '#424753' }}>Façade Scripting Specialist • Scalpel Façade cluster author</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#d8e2ff', color: '#00418f', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    94% Match
                  </span>
                </div>

                <div style={{ background: '#f3f3f6', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#1a1c1e', display: 'block' }}>Elena V. Kowalski</strong>
                    <span style={{ fontSize: '12px', color: '#424753' }}>CDE Information Lead • Arup Berlin</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#d8e2ff', color: '#00418f', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    91% Match
                  </span>
                </div>
              </div>
            </div>

            <div className="mj-modal-footer">
              <button
                type="button"
                className="btn-mj-primary"
                onClick={() => {
                  setIsCandidatesModalOpen(false)
                  showToast('Opened candidate review panel in Applicants desk.')
                }}
              >
                Review Inbound in Candidates Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Export Ledger ── */}
      {isExportModalOpen && (
        <div className="mj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
          <div className="mj-modal-dialog">
            <div className="mj-modal-header">
              <h2 id="export-modal-title">Export Requisitions Ledger</h2>
              <button
                type="button"
                className="mj-modal-close"
                onClick={() => setIsExportModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mj-modal-body">
              <p style={{ margin: 0 }}>
                Generate an export of all active, draft, and archived requisitions with pipeline conversion metrics:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-mj-light"
                  style={{ padding: '16px', flexDirection: 'column', gap: '8px', textAlign: 'center' }}
                  onClick={() => handleExportLedger('csv')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <strong style={{ fontSize: '13px', color: '#1a1c1e' }}>Download CSV Ledger</strong>
                  <span style={{ fontSize: '11px', color: '#727784' }}>Excel, Sheets &amp; ERP compatible</span>
                </button>

                <button
                  type="button"
                  className="btn-mj-light"
                  style={{ padding: '16px', flexDirection: 'column', gap: '8px', textAlign: 'center' }}
                  onClick={() => handleExportLedger('pdf')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#b3272d" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <strong style={{ fontSize: '13px', color: '#1a1c1e' }}>Studio Report (PDF)</strong>
                  <span style={{ fontSize: '11px', color: '#727784' }}>Executive hiring summary</span>
                </button>
              </div>
            </div>

            <div className="mj-modal-footer">
              <button
                type="button"
                className="btn-mj-light"
                onClick={() => setIsExportModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyJobs
