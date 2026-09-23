import type { FC } from 'react'
import './MyJobs.css'
import {
  useMyJobs,
  type RequisitionItem,
} from './useMyJobs'

export interface MyJobsProps {
  onPostNewJob?: () => void
  onViewCandidates?: (jobId: string, jobTitle: string) => void
  highlightedJobId?: string | null
}

export const MyJobs: FC<MyJobsProps> = ({ onPostNewJob, onViewCandidates, highlightedJobId }) => {
  const {
    filteredRequisitions,
    loading,
    companyName,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    totalCount,
    activeCount,
    draftCount,
    interviewingCount,
    closedCount,
    totalApplicantsCount,
    selectedReqForCandidates,
    isCandidatesModalOpen,
    setIsCandidatesModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    toastMessage,
    showToast,
    refreshJobs,
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
            {companyName}
          </span>
          <span style={{ color: '#c2c6d5' }}>/</span>
          <span style={{ color: '#1a1c1e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            LIVE TALENT RADAR: {activeCount} ACTIVE {activeCount === 1 ? 'NODE' : 'NODES'}
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
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>FIRM: {companyName.toUpperCase()}</span>
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
            onClick={refreshJobs}
            title="Refresh Requisitions"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00418f"
              strokeWidth="2"
              aria-hidden="true"
              style={{
                width: '15px',
                height: '15px',
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Refresh</span>
          </button>

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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="mj-metric-huge-num">{loading ? '...' : String(activeCount).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700, fontSize: '13px' }}>
                {activeCount > 0 ? 'Live / Synced' : 'No Active Posts'}
              </span>
            </div>
            <p className="mj-metric-subtext" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              Live radar syndication active
            </p>
          </div>
          <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: '#eeeef0', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: activeCount > 0 ? '100%' : '0%', height: '100%', background: '#00418f' }} />
          </div>
        </article>

        {/* Metric 2 */}
        <article className="mj-metric-card">
          <div className="mj-metric-top">
            <span className="mj-metric-lbl">Total Inbound Applicants</span>
            <div className="mj-metric-icon-box tertiary" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="mj-metric-huge-num">{loading ? '...' : totalApplicantsCount}</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700, fontSize: '13px' }}>Profiles</span>
            </div>
            <p className="mj-metric-subtext" style={{ marginTop: '4px' }}>
              Across {totalCount} total {totalCount === 1 ? 'job post' : 'job posts'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Applicant Tracking System Synced
          </div>
        </article>

        {/* Metric 3 */}
        <article className="mj-metric-card">
          <div className="mj-metric-top">
            <span className="mj-metric-lbl">Draft Requisitions</span>
            <div className="mj-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="mj-metric-huge-num">{loading ? '...' : String(draftCount).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700, fontSize: '13px' }}>In Vault</span>
            </div>
            <p className="mj-metric-subtext" style={{ marginTop: '4px' }}>
              Unpublished drafts awaiting launch
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
            <span>Vault Status</span>
            <span style={{ color: '#00418f', fontWeight: 700 }}>Ready to configure</span>
          </div>
        </article>

        {/* Metric 4 */}
        <article className="mj-metric-card">
          <div className="mj-metric-top">
            <span className="mj-metric-lbl">Closed / Fulfilled</span>
            <div className="mj-metric-icon-box secondary" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="mj-metric-huge-num">{loading ? '...' : String(closedCount).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#39464f', fontWeight: 700, fontSize: '13px' }}>Archived</span>
            </div>
            <p className="mj-metric-subtext" style={{ marginTop: '4px' }}>
              Past completed hiring campaigns
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Ledger historical record intact
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
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mj-skeleton-card">
                  <div className="mj-skeleton-line" style={{ width: '35%', height: '16px', marginBottom: '16px' }} />
                  <div className="mj-skeleton-line" style={{ width: '65%', height: '24px', marginBottom: '12px' }} />
                  <div className="mj-skeleton-line" style={{ width: '45%', height: '14px', marginBottom: '24px' }} />
                  <div className="mj-skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '10px' }} />
                </div>
              ))}
            </>
          ) : filteredRequisitions.length === 0 ? (
            <div className="mj-empty-state">
              <div className="mj-empty-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1c1e', marginBottom: '8px' }}>
                {searchQuery || activeTab !== 'all' ? 'No Requisitions Match Criteria' : 'No Requisitions Posted Yet'}
              </h3>
              <p style={{ fontSize: '14px', color: '#727784', maxWidth: '440px', lineHeight: 1.5, marginBottom: '20px' }}>
                {searchQuery || activeTab !== 'all'
                  ? `No requisitions found matching your filter criteria. Reset the search query or active filter to view all listings.`
                  : `Your organization (${companyName}) has not deployed any job posts yet. Launch your first recruitment funnel to start sourcing qualified architectural & engineering talent.`}
              </p>
              {searchQuery || activeTab !== 'all' ? (
                <button
                  type="button"
                  className="btn-mj-light"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveTab('all')
                  }}
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-mj-primary"
                  onClick={onPostNewJob}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Post a New Requisition
                </button>
              )}
            </div>
          ) : (
            filteredRequisitions.map((req: RequisitionItem) => {
            const isClosed = req.status === 'closed'
            const isDraft = req.status === 'draft'

            const isHighlighted = Boolean(
              highlightedJobId && (
                req.id.toLowerCase() === highlightedJobId.toLowerCase() ||
                req.title.toLowerCase().includes(highlightedJobId.toLowerCase()) ||
                highlightedJobId.toLowerCase().includes(req.title.toLowerCase())
              )
            )

            return (
              <article
                key={req.id}
                id={`req-card-${req.id}`}
                className={`req-hub-card ${isClosed ? 'closed' : ''} ${isHighlighted ? 'highlighted-requisition' : ''}`}
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

                  {/* Posting Date / Metadata */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11.5px', color: '#727784', fontWeight: 500 }}>
                      {req.createdDateText}
                    </span>
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

                {/* Pipeline Breakdown (5 Stages: New, In Review, Shortlisted, Scheduled, Rejected) */}
                {!isDraft && !isClosed && (
                  <div className="pipeline-conversion-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ fontWeight: 700, color: '#1a1c1e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </svg>
                        Candidate Pipeline Stages
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                        Total Applicants: {req.pipeline.total}
                      </span>
                    </div>

                    <div className="pipeline-funnel-grid">
                      <div
                        className="funnel-segment-card"
                        onClick={() => {
                          if (onViewCandidates) {
                            onViewCandidates(req.id, req.title)
                          } else {
                            handleOpenCandidates(req)
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        title="View New Applications"
                      >
                        <span className="lbl">New</span>
                        <span className="num">{req.pipeline.newCount}</span>
                        <span className="sub">Awaiting Review</span>
                      </div>

                      <div
                        className="funnel-segment-card"
                        onClick={() => {
                          if (onViewCandidates) {
                            onViewCandidates(req.id, req.title)
                          } else {
                            handleOpenCandidates(req)
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        title="View Applications In Review"
                      >
                        <span className="lbl">In Review</span>
                        <span className="num">{req.pipeline.inReview}</span>
                        <span className="sub">Screening</span>
                      </div>

                      <div
                        className="funnel-segment-card"
                        onClick={() => {
                          if (onViewCandidates) {
                            onViewCandidates(req.id, req.title)
                          } else {
                            handleOpenCandidates(req)
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        title="View Shortlisted Candidates"
                      >
                        <span className="lbl">Shortlisted</span>
                        <span className="num">{req.pipeline.shortlisted}</span>
                        <span className="sub">Evaluation</span>
                      </div>

                      <div
                        className="funnel-segment-card"
                        onClick={() => {
                          if (onViewCandidates) {
                            onViewCandidates(req.id, req.title)
                          } else {
                            handleOpenCandidates(req)
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        title="View Scheduled Interviews"
                      >
                        <span className="lbl">Scheduled</span>
                        <span className="num">{req.pipeline.scheduled}</span>
                        <span className="sub">Interviews</span>
                      </div>

                      <div
                        className="funnel-segment-card"
                        onClick={() => {
                          if (onViewCandidates) {
                            onViewCandidates(req.id, req.title)
                          } else {
                            handleOpenCandidates(req)
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        title="View Rejected Applications"
                      >
                        <span className="lbl">Rejected</span>
                        <span className="num">{req.pipeline.rejected}</span>
                        <span className="sub">Declined</span>
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
                      <button
                        type="button"
                        className="btn-mj-primary"
                        style={{ fontSize: '12.5px', padding: '7px 16px' }}
                        onClick={() => {
                          if (onViewCandidates) {
                            onViewCandidates(req.id, req.title)
                          } else {
                            handleOpenCandidates(req)
                          }
                        }}
                        title={`View all candidates for ${req.title}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                        </svg>
                        <span>View Candidates ({req.pipeline.total})</span>
                      </button>
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
                        title="Pause Requisition"
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
          })
        )}
      </div>

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
                  if (onViewCandidates && selectedReqForCandidates) {
                    onViewCandidates(selectedReqForCandidates.id, selectedReqForCandidates.title)
                  } else {
                    showToast('Opened candidate review panel in Applicants desk.')
                  }
                }}
              >
                Review Inbound in Candidates Hub →
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
