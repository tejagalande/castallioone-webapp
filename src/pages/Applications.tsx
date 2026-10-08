import { useState, useRef, useEffect, type FC, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAnchoredMenu, FLOATING_MENU_BASE_STYLE } from '../hooks/useAnchoredMenu'
import {
  useApplications,
  type SortOption,
  type ApplicationItem,
} from './useApplications'
import './Applications.css'

export interface ApplicationsProps {
  onNavigateToFindJobs?: () => void
  onNavigateToMessages?: (companyName?: string, companyId?: string) => void
  onNavigateToInterviews?: () => void
  onNavigateToResume?: () => void
  onNavigateToCertifications?: () => void
}

export const Applications: FC<ApplicationsProps> = ({
  onNavigateToFindJobs,
  onNavigateToMessages,
  onNavigateToInterviews,
  onNavigateToResume,
  onNavigateToCertifications,
}) => {
  const {
    loading,
    applications,
    selectedApp,
    selectedAppId,
    activeTab,
    searchQuery,
    sortBy,
    isSortDropdownOpen,
    tabCounts,
    avgMatchScore,
    upcomingInterviewsCount,
    nextInterviewApp,
    activeOfferApp,
    candidateProfile,
    filteredApplications,
    isDefenseModalOpen,
    isDossierModalOpen,
    isJobDetailsModalOpen,
    isOfferPackModalOpen,
    isAdjustTermsModalOpen,
    isMessageModalOpen,
    // isSyncing,
    toastMessage,
    setActiveTab,
    setSearchQuery,
    setSortBy,
    setIsSortDropdownOpen,
    handleSelectApp,
    handleExportDossier,
    // handleSyncCredentials,
    handleAcceptOffer,
    handleAdjustTerms,
    handleSendMessage,
    setIsDefenseModalOpen,
    setIsDossierModalOpen,
    setIsJobDetailsModalOpen,
    setIsOfferPackModalOpen,
    setIsAdjustTermsModalOpen,
    setIsMessageModalOpen,
  } = useApplications()

  // Local state for modal inputs
  const [adjustNotes, setAdjustNotes] = useState<string>('')
  const [directMessageText, setDirectMessageText] = useState<string>('')
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false)

  const SORT_LABELS: Record<SortOption, string> = {
    recent: 'Recent Activity',
    match: 'Match Score',
    progress: 'Stage Progress',
    studio: 'Studio Name',
  }

  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  useAnchoredMenu({
    isOpen: isSortDropdownOpen,
    anchorRef: sortDropdownRef,
    menuRef: sortMenuRef,
    align: 'right',
    gap: 5,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        isSortDropdownOpen &&
        !sortDropdownRef.current?.contains(target) &&
        !sortMenuRef.current?.contains(target)
      ) {
        setIsSortDropdownOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isSortDropdownOpen) {
        setIsSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSortDropdownOpen, setIsSortDropdownOpen])

  return (
    <div className="applications-page" id="applications-root">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <aside className="app-toast-alert" role="status" aria-live="polite">
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Telemetry Sub-Header Strip */}
      {/* <section className="app-telemetry-strip" aria-label="System Telemetry">
        <div className="app-telemetry-left">
          <span className="app-telemetry-tag">
            <span className="app-pulse-dot" aria-hidden="true"></span>
            CANDIDATE WORKSPACE // APPLICATION PIPELINE
          </span>
          <span className="app-telemetry-sep" aria-hidden="true">•</span>
          <span className="app-telemetry-pill">
            {candidateProfile.discipline ? candidateProfile.discipline.toUpperCase() : 'VERIFIED CANDIDATE'}
          </span>
          <span className="app-telemetry-sep" aria-hidden="true">•</span>
          <span className="app-telemetry-pipelines">
            ACTIVE PIPELINES: <strong>{tabCounts.all} IN FLIGHT</strong>
          </span>
        </div>
        <div className="app-telemetry-right">
          <span className="app-telemetry-cde">STATUS: ACTIVELY SEEKING</span>
          <span className="app-telemetry-divider" aria-hidden="true"></span>
          <span className="app-telemetry-sync">
            <span className="material-symbols-outlined" aria-hidden="true">
              check_circle
            </span>
            {loading ? 'SYNCING DATABASE...' : 'LIVE DATABASE SYNCED'}
          </span>
        </div>
      </section> */}

      {/* 2. Hero / Title & Primary Dossier Actions */}
      <header className="app-hero-wrap">
        <div className="app-hero-info">
          <div className="app-hero-badge-row">
            <span className="app-hero-badge">Talent Applications Gateway</span>
            {/* <span className="app-hero-cycle">LIVE SYNCHRONIZATION</span> */}
          </div>
          <h1 className="app-hero-title">
            Application Tracker &amp; Real-Time Studio Updates
          </h1>
          <p className="app-hero-desc">
            Monitor stage-by-stage progression, technical portfolio reviews, live interviews, and bilateral offers across AEC engineering &amp; design practices.
          </p>
        </div>
        {/* <div className="app-hero-actions">
          {selectedApp && (
            <button
              type="button"
              className="app-btn-outline"
              onClick={handleExportDossier}
              aria-label="Export application summary to text file"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                description
              </span>
              Export Summary (.TXT)
            </button>
          )}
          <button
            type="button"
            className="app-btn-primary"
            onClick={handleSyncCredentials}
            disabled={isSyncing}
            aria-label="Sync digital CV and credentials"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {isSyncing ? 'sync' : 'verified_user'}
            </span>
            {isSyncing ? 'Syncing...' : 'Sync Digital CV & Credentials'}
          </button>
        </div> */}
      </header>

      {/* 3. 4 Pipeline Telemetry Stat Cards */}
      <section className="app-stats-grid" aria-label="Pipeline Telemetry Stats">
        {/* Card 1: Active Applications */}
        <article className="app-stat-card card-primary">
          <div className="app-stat-glow" aria-hidden="true"></div>
          <div className="app-stat-header">
            <span className="app-stat-label">Active Applications</span>
            <span className="material-symbols-outlined app-stat-icon" aria-hidden="true">
              view_timeline
            </span>
          </div>
          <div className="app-stat-value-row">
            <span className="app-stat-value">{tabCounts.all}</span>
            <span className="app-stat-subtext">In-Flight</span>
          </div>
          <div className="app-stat-footer">
            <span className="app-stat-chip">{loading ? 'SYNCING...' : 'LIVE PIPELINE'}</span>
            <span className="app-stat-breakdown">
              {tabCounts.review} Rev • {tabCounts.technical} Int • {tabCounts.offered} Off
            </span>
          </div>
        </article>

        {/* Card 2: Average Skill Match */}
        <article className="app-stat-card card-velocity">
          <div className="app-stat-glow" aria-hidden="true"></div>
          <div className="app-stat-header">
            <span className="app-stat-label">Average Skill Match</span>
            <span className="material-symbols-outlined app-stat-icon" aria-hidden="true">
              bolt
            </span>
          </div>
          <div className="app-stat-value-row">
            <span className="app-stat-value">
              {applications.length > 0 ? `${avgMatchScore}%` : 'N/A'}
            </span>
            <span className="app-stat-subtext">Skill Alignment</span>
          </div>
          <div className="app-stat-footer">
            <div className="app-stat-velocity-chip">
              <span className="material-symbols-outlined" aria-hidden="true">
                trending_up
              </span>
              {applications.length > 0 ? 'Verified Profile Match' : 'Apply to view match'}
            </div>
          </div>
        </article>

        {/* Card 3: Upcoming Interviews */}
        <article className="app-stat-card card-interview">
          <div className="app-stat-glow" aria-hidden="true"></div>
          <div className="app-stat-header">
            <span className="app-stat-label">Upcoming Interviews</span>
            <span className="material-symbols-outlined app-stat-icon" aria-hidden="true">
              event_available
            </span>
          </div>
          <div className="app-stat-value-row">
            <span className="app-stat-value">{upcomingInterviewsCount}</span>
            <span className="app-stat-subtext">
              {upcomingInterviewsCount === 1 ? 'Confirmed Panel' : 'Confirmed Panels'}
            </span>
          </div>
          <div className="app-stat-footer">
            {nextInterviewApp && nextInterviewApp.confirmedSession ? (
              <div className="app-stat-interview-sub">
                <span className="app-stat-ping-dot" aria-hidden="true"></span>
                <span>
                  {nextInterviewApp.studio}: {nextInterviewApp.confirmedSession.time}
                </span>
              </div>
            ) : (
              <span className="app-stat-breakdown">No scheduled interviews</span>
            )}
          </div>
        </article>

        {/* Card 4: Offer & Decision Window */}
        <article className="app-stat-card card-offer">
          <div className="app-stat-glow" aria-hidden="true"></div>
          <div className="app-stat-header">
            <span className="app-stat-label">Offer &amp; Decision Window</span>
            <span className="material-symbols-outlined app-stat-icon" aria-hidden="true">
              verified
            </span>
          </div>
          <div className="app-stat-value-row">
            <span className="app-stat-value">{tabCounts.offered}</span>
            <span className="app-stat-subtext">
              {tabCounts.offered === 1 ? 'Active Offer' : 'Active Offers'}
            </span>
          </div>
          <div className="app-stat-footer">
            {activeOfferApp ? (
              <>
                <span className="app-stat-offer-firm">
                  {activeOfferApp.studio} ({activeOfferApp.compensation})
                </span>
                <span className="app-stat-offer-time">
                  {activeOfferApp.offerDetails?.deadlineDaysLeft
                    ? `${activeOfferApp.offerDetails.deadlineDaysLeft}d left`
                    : 'Open'}
                </span>
              </>
            ) : (
              <span className="app-stat-breakdown">No pending offers</span>
            )}
          </div>
        </article>
      </section>

      {/* 4. Filter & Segmented Pipeline Control Bar */}
      <section className="app-filter-bar" aria-label="Pipeline Filter and Search">
        {/* Stage Filter Tabs */}
        <nav className="app-stage-tabs" role="tablist" aria-label="Filter applications by stage">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`app-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Pipelines
            <span className="app-tab-count">{tabCounts.all}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'review'}
            className={`app-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            In-Review
            <span className="app-tab-count">{tabCounts.review}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'technical'}
            className={`app-tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
            onClick={() => setActiveTab('technical')}
          >
            Technical &amp; Interviews
            <span className="app-tab-count">{tabCounts.technical}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'offered'}
            className={`app-tab-btn ${activeTab === 'offered' ? 'active' : ''}`}
            onClick={() => setActiveTab('offered')}
          >
            Offered
            <span className="app-tab-count highlight">{tabCounts.offered}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'archived'}
            className={`app-tab-btn ${activeTab === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveTab('archived')}
          >
            Archived
            <span className="app-tab-count">{tabCounts.archived}</span>
          </button>
        </nav>

        {/* Search & Sort Controls */}
        <div className="app-filter-actions">
          <div className="app-search-wrap">
            <span className="material-symbols-outlined app-search-icon" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              className="app-search-input"
              placeholder="Search studio, role, location..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              aria-label="Search applications"
            />
            {searchQuery && (
              <button
                type="button"
                className="app-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="app-sort-dropdown-wrap" ref={sortDropdownRef}>
            <button
              type="button"
              className="app-sort-trigger"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              aria-haspopup="listbox"
              aria-expanded={isSortDropdownOpen}
            >
              <span className="material-symbols-outlined app-sort-icon" aria-hidden="true">
                sort
              </span>
              <span className="app-sort-label">Sort: {SORT_LABELS[sortBy]}</span>
              <span
                className={`material-symbols-outlined app-sort-arrow ${
                  isSortDropdownOpen ? 'open' : ''
                }`}
                aria-hidden="true"
              >
                expand_more
              </span>
            </button>

            {isSortDropdownOpen &&
              createPortal(
                <div
                  ref={sortMenuRef}
                  className="app-sort-menu"
                  style={FLOATING_MENU_BASE_STYLE}
                  role="listbox"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      role="option"
                      aria-selected={sortBy === opt}
                      className={`app-sort-item ${sortBy === opt ? 'active selected' : ''}`}
                      onClick={() => {
                        setSortBy(opt)
                        setIsSortDropdownOpen(false)
                      }}
                    >
                      <span>{SORT_LABELS[opt]}</span>
                      {sortBy === opt && (
                        <span className="material-symbols-outlined app-sort-check" aria-hidden="true">
                          check
                        </span>
                      )}
                    </button>
                  ))}
                </div>,
                document.body
              )}
          </div>
        </div>
      </section>

      {/* 5. Main Content Area */}
      {loading ? (
        <div
          style={{
            padding: '72px 24px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e2e5',
            margin: '24px 0',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '42px', color: '#00418f', animation: 'spin 1.2s linear infinite' }}
          >
            progress_activity
          </span>
          <p style={{ marginTop: '16px', fontSize: '15px', color: '#555e6d', fontWeight: 600 }}>
            Loading your applications from database...
          </p>
        </div>
      ) : applications.length === 0 ? (
        <div
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e2e5',
            margin: '24px 0',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#eef3f9',
              color: '#00418f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              work_outline
            </span>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#1a1c1e' }}>
            No Applications Submitted Yet
          </h3>
          <p
            style={{
              margin: '0 auto 20px',
              maxWidth: '460px',
              fontSize: '14px',
              color: '#555e6d',
              lineHeight: '22px',
            }}
          >
            You haven't submitted any job applications yet. Explore active architectural, BIM, and structural engineering positions to apply and track your hiring pipeline.
          </p>
          {onNavigateToFindJobs && (
            <button
              type="button"
              className="app-btn-primary"
              onClick={onNavigateToFindJobs}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                fontSize: '14px',
              }}
            >
              <span className="material-symbols-outlined">search</span>
              Explore Open Jobs
            </button>
          )}
        </div>
      ) : (
        /* Main Workspace Two-Column Split (7 Cols Left / 5 Cols Right) */
        <div className="app-main-split">
          {/* LEFT COLUMN: Application Cards List (7 Cols) */}
          <section className="app-cards-list" aria-label="Application pipelines list">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app: ApplicationItem) => {
                const isSelected = app.id === selectedAppId
                const isOffer = app.stage === 'offer'

                return (
                  <article
                    key={app.id}
                    className={`app-card ${isSelected ? 'selected' : ''} ${isOffer ? 'offer-card' : ''}`}
                    onClick={() => handleSelectApp(app.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelectApp(app.id)
                      }
                    }}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`Select application for ${app.role} at ${app.studio}`}
                  >
                    {isOffer && <div className="app-card-corner-glow" aria-hidden="true" />}

                    {/* Top Tag & Match Bar */}
                    <div className="app-card-header">
                      <div className="app-card-studio-wrap">
                        <div className={`app-card-avatar ${app.studioColor}`}>
                          {app.studioInitials}
                        </div>
                        <div className="app-card-studio-info">
                          <div className="app-card-studio-title-row">
                            <span className="app-card-studio-name">{app.studio}</span>
                            <span
                              className={`app-card-studio-badge ${
                                app.studioBadge.includes('Offer')
                                  ? 'offer'
                                  : app.studioBadge.includes('Interview')
                                  ? 'pritzker'
                                  : 'neutral'
                              }`}
                            >
                              {app.studioBadge}
                            </span>
                          </div>
                          <div className="app-card-role">{app.role}</div>
                        </div>
                      </div>

                      {/* Job Requisition ID */}
                      <div className="app-card-match-wrap">
                        <span className="app-card-req">{app.reqId}</span>
                      </div>
                    </div>

                    {/* Metadata Pill Bar */}
                    <div className={`app-card-meta-bar ${isSelected ? 'shaded' : ''}`}>
                      <div className="app-card-meta-item">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          location_on
                        </span>
                        <span>{app.location}</span>
                      </div>
                      {app.compensation && (
                        <div className="app-card-meta-item">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            payments
                          </span>
                          <span>{app.compensation}</span>
                        </div>
                      )}
                      <div className="app-card-applied-date">{app.appliedDate}</div>
                    </div>

                    {/* Technical Alert Highlighting Next Step (If Present) */}
                    {app.alertBox && (
                      <aside
                        className={`app-card-alert-box ${app.alertBox.type}`}
                        aria-label={`Alert: ${app.alertBox.title}`}
                      >
                        <div className="app-card-alert-icon">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {app.alertBox.icon}
                          </span>
                        </div>
                        <div className="app-card-alert-content">
                          <div className="app-card-alert-header">
                            <span className="app-card-alert-title">{app.alertBox.title}</span>
                            {app.alertBox.highlight && (
                              <span className="app-card-alert-highlight">
                                {app.alertBox.highlight}
                              </span>
                            )}
                          </div>
                          <p className="app-card-alert-desc">{app.alertBox.description}</p>
                        </div>
                        {app.alertBox.buttonText && (
                          <button
                            type="button"
                            className="app-btn-card-secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (
                                app.alertBox?.buttonAction === 'meeting' &&
                                app.confirmedSession?.meetingUrl
                              ) {
                                window.open(app.confirmedSession.meetingUrl, '_blank')
                              } else if (app.alertBox?.buttonAction === 'meeting') {
                                setIsDefenseModalOpen(true)
                              } else if (app.alertBox?.buttonAction === 'offer') {
                                setIsOfferPackModalOpen(true)
                              } else if (app.alertBox?.buttonAction === 'dossier') {
                                setIsDossierModalOpen(true)
                              } else {
                                setIsJobDetailsModalOpen(true)
                              }
                            }}
                            style={{ alignSelf: 'center', marginLeft: 'auto' }}
                          >
                            {app.alertBox.buttonText}
                          </button>
                        )}
                      </aside>
                    )}

                    {/* Offer Highlight Box */}
                    {app.offerDetails && (
                      <aside className="app-offer-box" aria-label="Formal Offer Details">
                        <div className="app-offer-box-header">
                          <span className="app-offer-title">
                            <span className="material-symbols-outlined" aria-hidden="true">
                              verified
                            </span>
                            Formal Offer Extended: {app.offerDetails.salary}
                          </span>
                          <span className="app-offer-countdown">
                            {app.offerDetails.deadlineDaysLeft} DAYS LEFT
                          </span>
                        </div>
                        <p className="app-offer-desc">{app.offerDetails.description}</p>
                      </aside>
                    )}

                    {/* Stepper Progress Bar */}
                    <div className="app-stepper-wrap">
                      <div className="app-stepper-header">
                        <span className={`app-stepper-stage-name ${isSelected ? '' : 'muted'}`}>
                          <span className="material-symbols-outlined" aria-hidden="true">
                            schema
                          </span>
                          {app.stageTitle}
                        </span>
                        <span className="app-stepper-percent">
                          {app.progressPercent}% PIPELINE VERIFIED
                        </span>
                      </div>

                      <div className="app-stepper-bar-grid">
                        {app.steps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className={`app-stepper-segment ${
                              step.isCurrent ? 'current' : step.isComplete ? 'complete' : ''
                            }`}
                            title={`${step.label} (${
                              step.isCurrent
                                ? 'Current'
                                : step.isComplete
                                ? 'Completed'
                                : 'Pending'
                            })`}
                          />
                        ))}
                      </div>

                      <div className="app-stepper-labels">
                        {app.steps.map((step, sIdx) => (
                          <span
                            key={sIdx}
                            className={`app-stepper-label ${
                              step.isCurrent ? 'current' : step.isComplete ? 'done' : ''
                            }`}
                          >
                            {step.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className={`app-card-footer ${isSelected ? 'shaded' : ''}`}>
                      <div className="app-card-access-note">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          verified
                        </span>
                        <span>{app.accessNote || 'Verified Candidate Application'}</span>
                      </div>

                      <div className="app-card-actions-group">
                        {app.secondaryBtnText && (
                          <button
                            type="button"
                            className="app-btn-card-secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (app.secondaryBtnText?.includes('Adjust')) {
                                setIsAdjustTermsModalOpen(true)
                              } else {
                                setIsDossierModalOpen(true)
                              }
                            }}
                          >
                            {app.secondaryBtnText}
                          </button>
                        )}

                        {app.primaryBtnText && (
                          <button
                            type="button"
                            className={isOffer ? 'app-btn-card-offer' : 'app-btn-card-primary'}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isOffer) {
                                setIsOfferPackModalOpen(true)
                              } else if (
                                app.primaryBtnText?.toLowerCase().includes('defense') ||
                                app.primaryBtnText?.toLowerCase().includes('interview') ||
                                app.primaryBtnText?.toLowerCase().includes('join') ||
                                app.primaryBtnText?.toLowerCase().includes('virtual')
                              ) {
                                if (app.confirmedSession?.meetingUrl) {
                                  window.open(app.confirmedSession.meetingUrl, '_blank')
                                } else {
                                  setIsDefenseModalOpen(true)
                                }
                              } else if (
                                app.primaryBtnText?.toLowerCase().includes('job') ||
                                app.primaryBtnText?.toLowerCase().includes('requisition')
                              ) {
                                setIsJobDetailsModalOpen(true)
                              } else {
                                setIsDossierModalOpen(true)
                              }
                            }}
                          >
                            {app.primaryBtnIcon && (
                              <span className="material-symbols-outlined" aria-hidden="true">
                                {app.primaryBtnIcon}
                              </span>
                            )}
                            {app.primaryBtnText}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e2e5',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '48px', color: '#727784' }}
                >
                  search_off
                </span>
                <h3 style={{ margin: '12px 0 6px', color: '#1a1c1e', fontSize: '18px' }}>
                  No Applications Match Filter
                </h3>
                <p
                  style={{
                    color: '#424753',
                    fontSize: '14px',
                    maxWidth: '400px',
                    margin: '0 auto 16px',
                  }}
                >
                  Try adjusting your search query or selecting another tab to view your active applications.
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="app-btn-outline"
                    onClick={() => {
                      setSearchQuery('')
                      setActiveTab('all')
                    }}
                  >
                    Reset Filters
                  </button>
                  {onNavigateToFindJobs && (
                    <button
                      type="button"
                      className="app-btn-primary"
                      onClick={onNavigateToFindJobs}
                    >
                      Explore Jobs
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* RIGHT COLUMN: Selected Application Live Detail & Audit Trail (5 Cols) */}
          <aside className="app-detail-column" aria-label="Selected Application Details">
            {selectedApp ? (
              <div className="app-dossier-master-card">
                {/* Dossier Top Identification Header */}
                <div className="app-dossier-header">
                  <div className="app-dossier-id-row">
                    <div className={`app-dossier-logo ${selectedApp.studioColor}`}>
                      {selectedApp.studioInitials}
                    </div>
                    <div className="app-dossier-title-wrap">
                      <h3 className="app-dossier-title">{selectedApp.studio} Application Details</h3>
                      <span className="app-dossier-record">
                        ACTIVE RECORD: {selectedApp.dossierRecordId}
                      </span>
                    </div>
                  </div>
                  <span className="app-dossier-stage-pill">
                    {selectedApp.stage === 'offer'
                      ? 'OFFER ACTIVE'
                      : selectedApp.stage === 'technical'
                      ? 'INTERVIEW ACTIVE'
                      : 'REVIEW ACTIVE'}
                  </span>
                </div>

                {/* Upcoming Live Interview Widget */}
                {selectedApp.confirmedSession && (
                  <div className="app-defense-widget">
                    <div className="app-defense-top">
                      <span className="app-defense-status">
                        <span className="app-pulse-dot" aria-hidden="true" />
                        Confirmed Session
                      </span>
                      <span className="app-defense-duration">
                        {selectedApp.confirmedSession.duration}
                      </span>
                    </div>

                    <div className="app-defense-info">
                      <h4 className="app-defense-heading">{selectedApp.confirmedSession.title}</h4>
                      <p className="app-defense-time">{selectedApp.confirmedSession.time}</p>
                    </div>

                    {/* Panel Member Avatars & Specs */}
                    <div className="app-defense-panel">
                      <span className="app-defense-panel-label">Interview Committee</span>
                      {selectedApp.confirmedSession.panelMembers.map((panel, pIdx) => (
                        <div className="app-panel-member" key={pIdx}>
                          <div className="app-panel-member-left">
                            <div
                              className="app-panel-avatar"
                              style={{ backgroundColor: panel.avatarColor }}
                            >
                              {panel.initials}
                            </div>
                            <div className="app-panel-details">
                              <span className="app-panel-name">{panel.name}</span>
                              <span className="app-panel-role">{panel.role}</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined" aria-hidden="true">
                            verified
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Defense Agenda Breakdown */}
                    {selectedApp.confirmedSession.agenda.length > 0 && (
                      <div className="app-agenda-box">
                        {selectedApp.confirmedSession.agenda.map((ag, aIdx) => (
                          <div className="app-agenda-row" key={aIdx}>
                            <span>{ag.time}</span>
                            <span>{ag.topic}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Call to Actions for Interview */}
                    <div className="app-defense-ctas">
                      <button
                        type="button"
                        className="app-btn-defense-join"
                        onClick={() => {
                          if (selectedApp.confirmedSession?.meetingUrl) {
                            window.open(selectedApp.confirmedSession.meetingUrl, '_blank')
                          } else {
                            setIsDefenseModalOpen(true)
                          }
                        }}
                        aria-label="Join interview call"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          videocam
                        </span>
                        Join Interview Call
                      </button>
                      <div className="app-defense-secondary-btns">
                        <button
                          type="button"
                          className="app-btn-defense-sec"
                          onClick={() => setIsJobDetailsModalOpen(true)}
                        >
                          View Requisition
                        </button>
                        <button
                          type="button"
                          className="app-btn-defense-sec muted"
                          onClick={() => {
                            if (onNavigateToInterviews) {
                              onNavigateToInterviews()
                            } else {
                              setIsMessageModalOpen(true)
                            }
                          }}
                        >
                          Reschedule / Inquire
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submitted Artifacts & Verified Credentials */}
                <div className="app-artifacts-section">
                  <div className="app-artifacts-header">
                    <h4 className="app-artifacts-title">Submitted Artifacts &amp; Credentials</h4>
                    <span className="app-artifacts-count">
                      {selectedApp.submittedArtifacts.length} DOCUMENTS
                    </span>
                  </div>

                  <div className="app-artifacts-list">
                    {selectedApp.submittedArtifacts.map((art) => (
                      <div
                        key={art.id}
                        className="app-artifact-item"
                        onClick={() => {
                          if (art.downloadUrl) {
                            window.open(art.downloadUrl, '_blank')
                          } else if (
                            onNavigateToResume &&
                            (art.title.toLowerCase().includes('cv') ||
                              art.title.toLowerCase().includes('resume'))
                          ) {
                            onNavigateToResume()
                          } else if (
                            onNavigateToCertifications &&
                            art.title.toLowerCase().includes('cert')
                          ) {
                            onNavigateToCertifications()
                          } else {
                            setIsDossierModalOpen(true)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`View submitted artifact: ${art.title}`}
                      >
                        <div className="app-artifact-left">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {art.icon}
                          </span>
                          <div className="app-artifact-info">
                            <span className="app-artifact-name">{art.title}</span>
                            <span className="app-artifact-meta">{art.meta}</span>
                          </div>
                        </div>
                        <span
                          className="material-symbols-outlined app-artifact-action-icon"
                          aria-hidden="true"
                        >
                          {art.downloadUrl ? 'open_in_new' : 'visibility'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Studio Recruiter Direct Comm Channel */}
                <div className="app-recruiter-card">
                  <div className="app-recruiter-left">
                    <div className="app-recruiter-avatar-wrap">
                      <div
                        className="app-recruiter-avatar"
                        style={{ backgroundColor: selectedApp.recruiter.avatarColor }}
                      >
                        {selectedApp.recruiter.initials}
                      </div>
                      <span className="app-recruiter-online-dot" aria-hidden="true" />
                    </div>
                    <div className="app-recruiter-info">
                      <span className="app-recruiter-name">{selectedApp.recruiter.name}</span>
                      <span className="app-recruiter-status">{selectedApp.recruiter.status}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="app-btn-recruiter-msg"
                    onClick={() => setIsMessageModalOpen(true)}
                    aria-label={`Message ${selectedApp.recruiter.name}`}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      chat
                    </span>
                    Message
                  </button>
                </div>

                {/* Chronological Studio Audit Trail */}
                <div className="app-audit-section">
                  <div className="app-audit-header">
                    <h4 className="app-audit-title">Application Timeline</h4>
                    <span className="app-audit-tag">LIVE AUDIT</span>
                  </div>

                  <div className="app-audit-timeline">
                    {selectedApp.auditTrail.map((log) => (
                      <div key={log.id} className="app-audit-step">
                        <div className={`app-audit-node ${log.isRecent ? 'recent' : ''}`} />
                        <span className={`app-audit-time ${log.isRecent ? 'recent' : ''}`}>
                          {log.time}
                        </span>
                        <p className={`app-audit-text ${log.isRecent ? 'recent' : ''}`}>
                          {log.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="app-dossier-master-card"
                style={{ padding: '48px 24px', textAlign: 'center', color: '#727784' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '48px', color: '#c2c6d4', marginBottom: '12px' }}
                >
                  folder_open
                </span>
                <h3
                  style={{ fontSize: '16px', fontWeight: 600, color: '#1a1c1e', margin: '0 0 6px' }}
                >
                  No Application Selected
                </h3>
                <p style={{ fontSize: '13px', margin: 0, color: '#727784' }}>
                  Select an application from the pipeline list to view its verified details, live interview room, and communication channels.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODALS                                                                 */}
      {/* ========================================================================= */}

      {/* 1. Technical Defense Video Preview Modal */}
      {isDefenseModalOpen && selectedApp && (
        <div
          className="app-modal-backdrop"
          onClick={() => setIsDefenseModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="defense-modal-title"
        >
          <div className="app-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="app-modal-header-left">
                <div className="app-modal-icon-badge">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    videocam
                  </span>
                </div>
                <h3 className="app-modal-title" id="defense-modal-title">
                  Virtual Interview Room // {selectedApp.studio}
                </h3>
              </div>
              <button
                type="button"
                className="app-modal-close-btn"
                onClick={() => setIsDefenseModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '12px',
                  height: '240px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  overflow: 'hidden',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#00418f',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {candidateProfile.initials}
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>
                    {candidateProfile.fullName} (You)
                  </span>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                    {isCameraOff ? 'Camera Off' : 'HD Video Ready'} •{' '}
                    {isMicMuted ? 'Mic Muted' : 'Mic Active'}
                  </p>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    display: 'flex',
                    gap: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    style={{
                      background: isMicMuted ? '#ef4444' : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title={isMicMuted ? 'Unmute' : 'Mute'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {isMicMuted ? 'mic_off' : 'mic'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    style={{
                      background: isCameraOff ? '#ef4444' : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {isCameraOff ? 'videocam_off' : 'videocam'}
                    </span>
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: '#424753', lineHeight: '20px' }}>
                <strong>Session:</strong> {selectedApp.confirmedSession?.title || 'Technical Interview'}
                <br />
                <strong>Time:</strong> {selectedApp.confirmedSession?.time || 'Scheduled Slot'}
                <br />
                <strong>Committee:</strong>{' '}
                {selectedApp.confirmedSession?.panelMembers.map((p) => p.name).join(', ') ||
                  `${selectedApp.studio} Panel`}
              </div>
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="app-btn-outline"
                onClick={() => setIsDefenseModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="app-btn-primary"
                onClick={() => {
                  const url = selectedApp.confirmedSession?.meetingUrl || 'https://meet.google.com'
                  window.open(url, '_blank')
                  setIsDefenseModalOpen(false)
                }}
              >
                <span className="material-symbols-outlined">launch</span>
                Launch Video Conference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Inspect Dossier Modal */}
      {isDossierModalOpen && selectedApp && (
        <div
          className="app-modal-backdrop"
          onClick={() => setIsDossierModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dossier-modal-title"
        >
          <div className="app-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="app-modal-header-left">
                <div className="app-modal-icon-badge">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    folder_shared
                  </span>
                </div>
                <h3 className="app-modal-title" id="dossier-modal-title">
                  Submitted Candidate Application // {selectedApp.studio}
                </h3>
              </div>
              <button
                type="button"
                className="app-modal-close-btn"
                onClick={() => setIsDossierModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <div
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(0, 65, 143, 0.05)',
                  border: '1px solid rgba(0, 65, 143, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#00418f' }}>
                    Verified Candidate Submission
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#424753' }}>
                    Application record synchronized with live database.
                  </p>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ color: '#00418f', fontSize: '28px' }}
                >
                  verified
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#727784',
                    textTransform: 'uppercase',
                  }}
                >
                  Submitted Files &amp; Credentials
                </span>
                {selectedApp.submittedArtifacts.map((art) => (
                  <div
                    key={art.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: '#f9f9fc',
                      borderRadius: '8px',
                      border: '1px solid #e2e2e5',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ color: '#00418f' }}>
                        {art.icon}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e' }}>
                        {art.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="app-btn-outline"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => {
                        if (art.downloadUrl) {
                          window.open(art.downloadUrl, '_blank')
                        } else {
                          handleExportDossier()
                        }
                      }}
                    >
                      {art.downloadUrl ? 'Open Asset' : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="app-btn-primary"
                onClick={() => setIsDossierModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Job Requisition Details Modal */}
      {isJobDetailsModalOpen && selectedApp && (
        <div
          className="app-modal-backdrop"
          onClick={() => setIsJobDetailsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-details-modal-title"
        >
          <div className="app-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="app-modal-header-left">
                <div className="app-modal-icon-badge">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    article
                  </span>
                </div>
                <h3 className="app-modal-title" id="job-details-modal-title">
                  Requisition: {selectedApp.role}
                </h3>
              </div>
              <button
                type="button"
                className="app-modal-close-btn"
                onClick={() => setIsJobDetailsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1c1e' }}>
                    {selectedApp.studio}
                  </span>
                  <span className="app-hero-badge">{selectedApp.reqId}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#424753' }}>
                  📍 {selectedApp.location} • 💰 {selectedApp.compensation}
                </p>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#f3f3f6',
                  fontSize: '13px',
                  lineHeight: '20px',
                  color: '#1a1c1e',
                }}
              >
                <strong>Role Focus &amp; Scope:</strong>
                <p style={{ margin: '6px 0 0', color: '#424753' }}>
                  {selectedApp.jobDetails?.description ||
                    'Lead high-precision architectural and engineering modeling, collaboration, and execution standards.'}
                </p>
              </div>

              {selectedApp.jobDetails?.responsibilities && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#f3f3f6',
                    fontSize: '13px',
                    lineHeight: '20px',
                    color: '#1a1c1e',
                  }}
                >
                  <strong>Key Responsibilities:</strong>
                  <p style={{ margin: '6px 0 0', color: '#424753', whiteSpace: 'pre-line' }}>
                    {selectedApp.jobDetails.responsibilities}
                  </p>
                </div>
              )}

              <div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#727784',
                    textTransform: 'uppercase',
                  }}
                >
                  Required Technical Stack &amp; Standards
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {(selectedApp.jobDetails?.technicalRequirements &&
                  selectedApp.jobDetails.technicalRequirements.length > 0
                    ? selectedApp.jobDetails.technicalRequirements
                    : ['Revit', 'Navisworks', 'AutoCAD', 'BIM Coordination', 'Structural Engineering', 'ISO 19650']
                  ).map((stk, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 8px',
                        background: '#e8e8ea',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#00418f',
                      }}
                    >
                      {stk}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(0,65,143,0.06)',
                  border: '1px solid rgba(0,65,143,0.15)',
                  fontSize: '12px',
                  color: '#00418f',
                }}
              >
                ✓ Application submitted on <strong>{selectedApp.appliedDate}</strong>. Requisition status:{' '}
                <strong>{selectedApp.stageTitle}</strong>.
              </div>
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="app-btn-outline"
                onClick={() => {
                  setIsJobDetailsModalOpen(false)
                  setIsDossierModalOpen(true)
                }}
              >
                View Submitted Application
              </button>
              <button
                type="button"
                className="app-btn-primary"
                onClick={() => {
                  setIsJobDetailsModalOpen(false)
                  setIsMessageModalOpen(true)
                }}
              >
                Message Hiring Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Review Offer Pack Modal */}
      {isOfferPackModalOpen && selectedApp && (
        <div
          className="app-modal-backdrop"
          onClick={() => setIsOfferPackModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-modal-title"
        >
          <div className="app-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="app-modal-header-left">
                <div
                  className="app-modal-icon-badge"
                  style={{ background: 'rgba(179,39,45,0.1)', color: '#b3272d' }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    verified
                  </span>
                </div>
                <h3 className="app-modal-title" id="offer-modal-title">
                  {selectedApp.studio} Formal Offer Pack
                </h3>
              </div>
              <button
                type="button"
                className="app-modal-close-btn"
                onClick={() => setIsOfferPackModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <div
                style={{
                  background: '#f9f9fc',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e2e5',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}
                >
                  <span style={{ fontSize: '13px', color: '#727784' }}>Role Requisition</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1c1e' }}>
                    {selectedApp.role}
                  </span>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}
                >
                  <span style={{ fontSize: '13px', color: '#727784' }}>Compensation Package</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#00418f' }}>
                    {selectedApp.offerDetails?.salary ||
                      selectedApp.compensation ||
                      'Competitive Compensation'}
                  </span>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                >
                  <span style={{ fontSize: '13px', color: '#727784' }}>Location &amp; Work Mode</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1c1e' }}>
                    {selectedApp.location || 'Studio Flexible'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#727784' }}>Decision Window</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1c1e' }}>
                    {selectedApp.offerDetails?.deadlineDaysLeft
                      ? `${selectedApp.offerDetails.deadlineDaysLeft} Days Remaining`
                      : 'Window Open'}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#727784', fontStyle: 'italic' }}>
                {selectedApp.offerDetails?.description ||
                  `Formal offer extended by ${selectedApp.studio}. Review terms and confirm acceptance.`}
              </div>
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="app-btn-outline"
                onClick={() => {
                  setIsOfferPackModalOpen(false)
                  setIsAdjustTermsModalOpen(true)
                }}
              >
                Adjust Terms
              </button>
              <button
                type="button"
                className="app-btn-card-offer"
                style={{ padding: '8px 18px', fontSize: '13px' }}
                onClick={() => handleAcceptOffer(selectedApp.id)}
              >
                Accept Offer &amp; Sign Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Adjust Terms Modal */}
      {isAdjustTermsModalOpen && selectedApp && (
        <div
          className="app-modal-backdrop"
          onClick={() => setIsAdjustTermsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="adjust-modal-title"
        >
          <div className="app-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="app-modal-header-left">
                <div className="app-modal-icon-badge">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    tune
                  </span>
                </div>
                <h3 className="app-modal-title" id="adjust-modal-title">
                  Adjust Offer Terms // {selectedApp.studio}
                </h3>
              </div>
              <button
                type="button"
                className="app-modal-close-btn"
                onClick={() => setIsAdjustTermsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <p style={{ margin: 0, fontSize: '13px', color: '#424753' }}>
                Specify any compensation adjustments, remote flexibility requests, or start date
                modifications for review by {selectedApp.recruiter.name}:
              </p>

              <textarea
                className="app-textarea"
                rows={4}
                placeholder="e.g., Requesting flexibility in start date or discussing hybrid schedule options."
                value={adjustNotes}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAdjustNotes(e.target.value)}
              />
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="app-btn-outline"
                onClick={() => setIsAdjustTermsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="app-btn-primary"
                onClick={() => {
                  handleAdjustTerms(adjustNotes || 'Requested hybrid schedule adjustment')
                  setAdjustNotes('')
                }}
              >
                Submit Adjustment Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Message Recruiter Modal */}
      {isMessageModalOpen && selectedApp && (
        <div
          className="app-modal-backdrop"
          onClick={() => setIsMessageModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="msg-modal-title"
        >
          <div className="app-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="app-modal-header-left">
                <div className="app-modal-icon-badge">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chat
                  </span>
                </div>
                <h3 className="app-modal-title" id="msg-modal-title">
                  Direct Channel: {selectedApp.recruiter.name} ({selectedApp.studio})
                </h3>
              </div>
              <button
                type="button"
                className="app-modal-close-btn"
                onClick={() => setIsMessageModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#727784',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: '#10b981', fontSize: '16px' }}
                >
                  fiber_manual_record
                </span>
                <span>{selectedApp.recruiter.status}</span>
              </div>

              <textarea
                className="app-textarea"
                rows={4}
                placeholder={`Hi ${
                  selectedApp.recruiter.name.split(' ')[0]
                }, I had a quick question regarding the application...`}
                value={directMessageText}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setDirectMessageText(e.target.value)
                }
              />
            </div>

            <div className="app-modal-footer">
              {onNavigateToMessages && (
                <button
                  type="button"
                  className="app-btn-outline"
                  onClick={() => {
                    setIsMessageModalOpen(false)
                    onNavigateToMessages(selectedApp?.studio, selectedApp?.companyId)
                  }}
                  style={{ marginRight: 'auto' }}
                >
                  Open Full Chat
                </button>
              )}
              <button
                type="button"
                className="app-btn-outline"
                onClick={() => setIsMessageModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="app-btn-primary"
                onClick={() => {
                  handleSendMessage(directMessageText || 'Quick inquiry')
                  setDirectMessageText('')
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Applications
