import type { FC } from 'react'
import './JobAlerts.css'
import {
  useJobAlerts,
  type JobAlertItem,
  type OpportunityMatch,
  type DeliveryChannel,
  type TrendingQuery,
} from './useJobAlerts'

interface JobAlertsProps {
  onNavigateToFindJobs?: () => void
}

const JobAlerts: FC<JobAlertsProps> = ({ onNavigateToFindJobs }) => {
  const {
    alerts,
    filteredAlerts,
    activeFilterTab,
    setActiveFilterTab,
    searchQuery,
    setSearchQuery,
    precisionThreshold,
    setPrecisionThreshold,
    channels,
    strictIso,
    setStrictIso,
    requireSalary,
    setRequireSalary,
    excludeHeadhunters,
    setExcludeHeadhunters,
    tier1Only,
    setTier1Only,
    activeCount,
    pausedCount,
    instantCount,
    trendingQueries,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isChannelsModalOpen,
    setIsChannelsModalOpen,
    isMatchesModalOpen,
    setIsMatchesModalOpen,
    selectedAlertForMatches,
    newRoleTitle,
    setNewRoleTitle,
    newTargetFirms,
    setNewTargetFirms,
    newPackageRange,
    setNewPackageRange,
    newLocationType,
    setNewLocationType,
    newStackTags,
    setNewStackTags,
    newIsInstant,
    setNewIsInstant,
    toastMessage,
    showToast,
    handleToggleAlert,
    handlePauseAll,
    handleDeleteAlert,
    handleCreateAlert,
    handleAddTrendingTag,
    handleReindex,
    handleSendTestDispatch,
    handleViewMatches,
  } = useJobAlerts()

  return (
    <div className="job-alerts-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="alt-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Telemetry Top Bar */}
      <section className="alt-telemetry-strip" aria-label="Job Alerts Engine Telemetry">
        <div className="alt-telemetry-left">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00418f', fontWeight: 600 }}>
            <span className="pulse-dot-alt" aria-hidden="true" />
            TALENT_WORKSPACE // JOB-ALERTS-ENGINE-V2.4
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#424753' }}>
            ALGORITHMIC MATCHER: <strong style={{ color: '#00418f' }}>REAL-TIME STREAMING</strong>
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#424753' }}>
            ALERT VELOCITY: <strong style={{ color: '#1a1c1e' }}>&lt; 4 MIN NOTIFY</strong>
          </span>
        </div>

        <div className="alt-telemetry-right">
          <span style={{ background: '#eeeef0', padding: '3px 10px', borderRadius: '20px', color: '#00418f', fontWeight: 700 }}>
            STATUS: {activeCount} ACTIVE MONITORS (1 TRIGGERED TODAY)
          </span>
          <span style={{ color: '#c2c6d5' }}>|</span>
          <span style={{ color: '#727784' }}>CIPHER_VER: SHA-256</span>
        </div>
      </section>

      {/* 2. Page Header & Action Bar */}
      <header className="alt-header-section">
        <div className="alt-title-wrapper">
          <div className="alt-radar-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            DISCRETE VDC TALENT RADAR
          </div>
          <h1 className="alt-main-heading">Job Alerts &amp; Opportunity Triggers</h1>
          <p className="alt-lead-description">
            Configure multi-parameter algorithmic radars across Tier-1 AEC firms, salary bands, LOD criteria, and BIM software ecosystems.
          </p>
        </div>

        <div className="alt-action-cluster">
          <button
            type="button"
            className="btn-alt-light"
            onClick={() => setIsChannelsModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Channels</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00418f', display: 'inline-block' }} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="btn-alt-light"
            style={{ color: '#727784' }}
            onClick={handlePauseAll}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="10" y1="15" x2="10" y2="9" />
              <line x1="14" y1="15" x2="14" y2="9" />
            </svg>
            <span>{activeCount === 0 ? 'Resume All Triggers' : 'Pause All Triggers'}</span>
          </button>

          <button
            type="button"
            className="btn-alt-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>+ Create New Alert</span>
          </button>
        </div>
      </header>

      {/* 3. Metrics Summary Strip (4 Cards) */}
      <section className="alt-metrics-grid" aria-label="Radar Telemetry Metrics">
        {/* Metric 1 */}
        <article className="alt-metric-card">
          <div className="alt-metric-header">
            <span className="alt-metric-lbl">Monitors Online</span>
            <div className="alt-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12h20M2 12a10 10 0 0 1 20 0M2 12a10 10 0 0 0 20 0" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          <div>
            <span className="alt-metric-huge-val">{activeCount} Configured</span>
            <p className="alt-metric-subtext" style={{ color: '#00418f', fontWeight: 600 }}>
              <span className="pulse-dot-alt" style={{ width: '6px', height: '6px' }} aria-hidden="true" />
              All systems healthy • {instantCount} instant push
            </p>
          </div>
          <div className="alt-progress-track">
            <div className="alt-progress-fill" style={{ width: '100%' }} />
          </div>
        </article>

        {/* Metric 2 */}
        <article className="alt-metric-card">
          <div className="alt-metric-header">
            <span className="alt-metric-lbl">Algorithmic Matches</span>
            <div className="alt-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="alt-metric-huge-val">28 Opportunities</span>
            <p className="alt-metric-subtext">
              <strong style={{ color: '#00418f' }}>+12 this week</strong> • 94%+ fit rate
            </p>
          </div>
          <div className="alt-progress-track">
            <div className="alt-progress-fill" style={{ width: '82%' }} />
          </div>
        </article>

        {/* Metric 3 */}
        <article className="alt-metric-card">
          <div className="alt-metric-header">
            <span className="alt-metric-lbl">Direct Headhunters</span>
            <div className="alt-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="alt-metric-huge-val">9 Direct Pings</span>
            <p className="alt-metric-subtext">Tier-1 architectural practices verified</p>
          </div>
          <div className="alt-progress-track">
            <div className="alt-progress-fill" style={{ width: '65%' }} />
          </div>
        </article>

        {/* Metric 4 */}
        <article className="alt-metric-card">
          <div className="alt-metric-header">
            <span className="alt-metric-lbl">Fit Threshold</span>
            <div className="alt-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
              </svg>
            </div>
          </div>
          <div>
            <span className="alt-metric-huge-val">{precisionThreshold}% Fit Index</span>
            <p className="alt-metric-subtext">Precision filtered to eliminate spam</p>
          </div>
          <div className="alt-progress-track">
            <div className="alt-progress-fill" style={{ width: `${precisionThreshold}%` }} />
          </div>
        </article>
      </section>

      {/* 4. Main Grid Workspace (12 cols) */}
      <main className="alt-main-workspace-grid">
        {/* LEFT COLUMN: Main Feed (8 cols) */}
        <div className="alt-left-col">
          {/* Filter & Search Toolbar */}
          <div className="alt-toolbar-box">
            <div className="alt-tabs-scroll" role="tablist">
              <button
                type="button"
                className={`alt-tab-btn ${activeFilterTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilterTab('all')}
              >
                All Alerts ({alerts.length})
              </button>

              <button
                type="button"
                className={`alt-tab-btn ${activeFilterTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveFilterTab('active')}
              >
                Active Triggers ({activeCount})
              </button>

              <button
                type="button"
                className={`alt-tab-btn ${activeFilterTab === 'paused' ? 'active' : ''}`}
                onClick={() => setActiveFilterTab('paused')}
              >
                Paused ({pausedCount})
              </button>

              <button
                type="button"
                className={`alt-tab-btn ${activeFilterTab === 'instant' ? 'active' : ''}`}
                onClick={() => setActiveFilterTab('instant')}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b3272d', display: 'inline-block' }} aria-hidden="true" />
                High-Priority Instant ({instantCount})
              </button>
            </div>

            <div className="alt-search-group">
              <div className="alt-search-input-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search keywords, firms, software..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter alerts"
                />
              </div>

              <button
                type="button"
                className="btn-alt-light"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => showToast('Sorted by match priority.')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="14" y2="12" />
                  <line x1="4" y1="18" x2="8" y2="18" />
                </svg>
                <span>Priority</span>
              </button>
            </div>
          </div>

          {/* Alert Cards Feed */}
          {filteredAlerts.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '36px', textAlign: 'center', border: '1px solid #c2c6d5' }}>
              <h3 style={{ margin: '0 0 6px', color: '#1a1c1e' }}>No matching job alerts found</h3>
              <p style={{ margin: '0 0 16px', color: '#727784', fontSize: '13.5px' }}>
                Try adjusting your search query or create a new custom opportunity radar.
              </p>
              <button
                type="button"
                className="btn-alt-primary"
                onClick={() => {
                  setSearchQuery('')
                  setActiveFilterTab('all')
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert: JobAlertItem) => {
              const isFeatured = alert.id === 'alt-1'
              const isPaused = !alert.isActive

              return (
                <article
                  key={alert.id}
                  className={`alert-card-container ${isFeatured ? 'featured' : ''} ${isPaused ? 'paused' : ''}`}
                >
                  {/* Card Header & Controls */}
                  <div className="alert-card-top-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="alert-badges-line">
                        <span className={`badge-alert-status ${isPaused ? 'paused' : ''}`}>
                          {alert.isActive && <span className="pulse-dot-alt" style={{ width: '6px', height: '6px' }} aria-hidden="true" />}
                          {alert.isActive ? (alert.isInstant ? 'ACTIVE • INSTANT NOTIFY' : 'ACTIVE • DAILY DIGEST') : alert.pausedText || 'PAUSED'}
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>{alert.refCode}</span>
                        {alert.isoBadge && <span className="badge-alert-iso">{alert.isoBadge}</span>}
                      </div>

                      <h2 className="alert-title-text">{alert.title}</h2>
                      <p className="alert-target-firms">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px', flexShrink: 0 }} aria-hidden="true">
                          <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M18 11h2M18 15h2M9 3h6v4H9z" />
                        </svg>
                        <span>Target Practices: <strong style={{ color: '#1a1c1e' }}>{alert.targetFirms}</strong></span>
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                      <div className="alert-toggle-wrapper">
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                          {alert.isActive ? 'TRIGGER: ON' : 'TRIGGER: OFF'}
                        </span>
                        <label className="toggle-switch-label" aria-label={`Toggle alert for ${alert.title}`}>
                          <input
                            type="checkbox"
                            checked={alert.isActive}
                            onChange={() => handleToggleAlert(alert.id)}
                          />
                          <span className="toggle-switch-slider" />
                        </label>
                      </div>

                      {alert.matchBadge && alert.isActive && (
                        <span className="badge-alert-status" style={{ fontSize: '11px', padding: '3px 8px' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                          </svg>
                          {alert.matchBadge}
                        </span>
                      )}

                      {alert.updatedText && (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                          {alert.updatedText}
                        </span>
                      )}

                      {alert.slackSyncLive && (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                          Slack Sync: Live
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parameter Matrix (4 or 3 col) */}
                  <div className="alert-params-grid">
                    <div className="param-item">
                      <span className="param-lbl">Location / Studio</span>
                      <p className="param-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {alert.locationType}
                      </p>
                    </div>

                    <div className="param-item">
                      <span className="param-lbl">Target Package</span>
                      <p className="param-val" style={{ fontFamily: 'JetBrains Mono' }}>
                        {alert.packageRange}
                      </p>
                    </div>

                    <div className="param-item">
                      <span className="param-lbl">Experience / LOD</span>
                      <p className="param-val">{alert.experienceLod}</p>
                    </div>

                    <div className="param-item">
                      <span className="param-lbl">Radar Velocity</span>
                      <p className="param-val" style={{ color: alert.isActive ? '#00418f' : '#727784' }}>
                        {alert.velocityText}
                      </p>
                    </div>
                  </div>

                  {/* Software Stack Chips */}
                  <div className="stack-chips-row">
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', textTransform: 'uppercase', color: '#727784', marginRight: '4px' }}>
                      Matched Stack:
                    </span>
                    {alert.stack.map((item, idx) => (
                      <span className="stack-tag-pill" key={idx}>
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Recent Matches Preview (Alert 1) */}
                  {alert.recentMatches && alert.recentMatches.length > 0 && alert.isActive && (
                    <div className="matches-preview-block">
                      <div className="matches-preview-header">
                        <span style={{ color: '#00418f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                          3 NEW MATCHES IN LAST 48 HOURS
                        </span>
                        <span style={{ color: '#727784' }}>Algorithmic Confidence Score: 0.982</span>
                      </div>

                      <div className="mini-matches-grid">
                        {alert.recentMatches.map((m: OpportunityMatch) => (
                          <div
                            className="mini-match-card"
                            key={m.id}
                            onClick={() => handleViewMatches(alert)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="mini-match-top">
                              <strong style={{ fontSize: '12.5px', color: '#1a1c1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.firmName}
                              </strong>
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                                {m.fitScore}% FIT
                              </span>
                            </div>
                            <div className="mini-match-bottom">
                              <span>{m.salaryText}</span>
                              <span style={{ color: '#727784' }}>{m.locationText}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Paused Cached Count notice */}
                  {!alert.isActive && alert.dormantCachedCount && (
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11.5px', color: '#727784' }}>
                      {alert.dormantCachedCount} dormant matches cached in vault
                    </div>
                  )}

                  {/* Card Footer Actions */}
                  <div className="alert-card-footer">
                    <div className="footer-btn-cluster">
                      {alert.isActive ? (
                        <>
                          <button
                            type="button"
                            className="footer-action-link"
                            onClick={() => showToast(`Editing radar parameters for ${alert.title}`)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Parameters
                          </button>

                          <button
                            type="button"
                            className="footer-action-link"
                            onClick={() => showToast('Testing radar query against live openBIM database...')}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                              <circle cx="12" cy="12" r="10" />
                              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                            </svg>
                            Test Query
                          </button>

                          <button
                            type="button"
                            className="footer-action-link"
                            onClick={() => showToast('Alert muted for 7 days.')}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Mute (7d)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="footer-action-link"
                            style={{ color: '#00418f', fontWeight: 700 }}
                            onClick={() => handleToggleAlert(alert.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                              <circle cx="12" cy="12" r="10" />
                              <polygon points="10 8 16 12 10 16 10 8" />
                            </svg>
                            Resume Alert
                          </button>

                          <button
                            type="button"
                            className="footer-action-link delete"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      className="footer-action-link"
                      style={{ color: '#00418f', fontWeight: 700, background: 'rgba(0, 65, 143, 0.06)', padding: '6px 12px', borderRadius: '8px' }}
                      onClick={() => handleViewMatches(alert)}
                    >
                      <span>View {alert.totalMatchesCount} Matching Openings</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar Controls (4 cols) */}
        <aside className="alt-right-col">
          {/* Sidebar Card 1: AI Match Calibration */}
          <article className="alt-sidebar-card">
            <div className="alt-sidebar-header">
              <h3 className="alt-sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <path d="M12 2a10 10 0 0 1 10 10c0 4.42-3.58 8-8 8v2c0 .55-.45 1-1 1s-1-.45-1-1v-2a8 8 0 0 1-8-8c0-5.52 4.48-10 10-10z" />
                </svg>
                AI Match Calibration
              </h3>
              <span className="alt-radar-badge" style={{ fontSize: '10px', padding: '2px 8px' }}>RADAR-AI</span>
            </div>

            <p className="alt-sidebar-desc">
              Fine-tune algorithmic heuristics to balance match breadth against executive role signal purity.
            </p>

            {/* Slider Simulation */}
            <div className="precision-slider-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#727784' }}>Precision Threshold</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#00418f' }}>{precisionThreshold}% Fit Index</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                value={precisionThreshold}
                onChange={(e) => setPrecisionThreshold(Number(e.target.value))}
                aria-label="Precision Threshold"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>
                <span>Broad (70%)</span>
                <span>Balanced (85%)</span>
                <span>Ultra-Strict (98%)</span>
              </div>
            </div>

            {/* Parameter Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer' }}>
                <span style={{ color: '#1a1c1e', fontWeight: 500 }}>Strict ISO 19650 BEP Validation</span>
                <input
                  type="checkbox"
                  checked={strictIso}
                  onChange={(e) => setStrictIso(e.target.checked)}
                  style={{ accentColor: '#00418f', width: '16px', height: '16px' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer' }}>
                <span style={{ color: '#1a1c1e', fontWeight: 500 }}>Require Verified Salary Disclosure</span>
                <input
                  type="checkbox"
                  checked={requireSalary}
                  onChange={(e) => setRequireSalary(e.target.checked)}
                  style={{ accentColor: '#00418f', width: '16px', height: '16px' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer' }}>
                <span style={{ color: '#1a1c1e', fontWeight: 500 }}>Exclude Unaccredited Headhunters</span>
                <input
                  type="checkbox"
                  checked={excludeHeadhunters}
                  onChange={(e) => setExcludeHeadhunters(e.target.checked)}
                  style={{ accentColor: '#00418f', width: '16px', height: '16px' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer' }}>
                <span style={{ color: '#1a1c1e', fontWeight: 500 }}>Direct Tier-1 Practice Openings Only</span>
                <input
                  type="checkbox"
                  checked={tier1Only}
                  onChange={(e) => setTier1Only(e.target.checked)}
                  style={{ accentColor: '#00418f', width: '16px', height: '16px' }}
                />
              </label>
            </div>

            <button
              type="button"
              className="btn-alt-light"
              style={{ justifyContent: 'center', marginTop: '4px' }}
              onClick={handleReindex}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Re-index Talent Graph</span>
            </button>
          </article>

          {/* Sidebar Card 2: Delivery Channels & Sync */}
          <article className="alt-sidebar-card">
            <div className="alt-sidebar-header">
              <h3 className="alt-sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                Delivery Channels &amp; Sync
              </h3>
              <span className="pulse-dot-alt" style={{ width: '8px', height: '8px' }} aria-hidden="true" />
            </div>

            <div className="channels-list-wrap">
              {channels.map((ch: DeliveryChannel) => (
                <div className="channel-row-item" key={ch.id}>
                  <div className="channel-meta-left">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px', flexShrink: 0 }} aria-hidden="true">
                      {ch.icon === 'mail' && <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />}
                      {ch.icon === 'sms' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />}
                      {ch.icon === 'terminal' && <polyline points="4 17 10 11 4 5 M12 19 20 19" />}
                      {ch.icon === 'link' && <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />}
                    </svg>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ch.title}
                      </p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ch.subtext}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#00418f', fontWeight: 700, flexShrink: 0 }}>
                    {ch.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-alt-light"
              style={{ justifyContent: 'center' }}
              onClick={handleSendTestDispatch}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>Send Test Dispatch</span>
            </button>
          </article>

          {/* Sidebar Card 3: Trending AEC Radar Queries */}
          <article className="alt-sidebar-card">
            <div className="alt-sidebar-header">
              <h3 className="alt-sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Trending AEC Radar Queries
              </h3>
              <span className="alt-radar-badge" style={{ fontSize: '10px', padding: '2px 8px' }}>T1 DEMAND</span>
            </div>

            <p className="alt-sidebar-desc">
              High-velocity skills targeted by Tier-1 design tech hiring partners this month:
            </p>

            <div className="trending-queries-list">
              {trendingQueries.map((tq: TrendingQuery) => (
                <div className="trending-query-row" key={tq.id}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1c1e', display: 'block' }}>
                      {tq.name}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#00418f', fontWeight: 700 }}>
                      {tq.growth}
                    </span>
                  </div>

                  <button
                    type="button"
                    style={{ border: 'none', background: 'none', color: '#00418f', cursor: 'pointer', padding: '4px', display: 'flex' }}
                    title={`Filter by ${tq.name}`}
                    onClick={() => handleAddTrendingTag(tq.name)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </article>

          {/* Sidebar Card 4: Cryptographic Privacy Guard */}
          <article className="alt-sidebar-card" style={{ background: 'rgba(243, 243, 246, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13.5px', color: '#1a1c1e' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Cryptographic Vault Privacy
            </div>

            <p style={{ fontSize: '12px', lineHeight: '18px', color: '#424753', margin: 0 }}>
              Your active alert searches and algorithmic radars are 100% anonymized via Castallio Cryptographic Vault. Current employers cannot monitor your trigger configurations, salary floors, or targeted competitor firms.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', paddingTop: '4px' }}>
              <span>VAULT STATUS: ENCRYPTED</span>
              <button
                type="button"
                style={{ border: 'none', background: 'none', color: '#00418f', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                onClick={() => showToast('Cryptographic privacy audit log: 0 leaks, 256-bit token hash validated.')}
              >
                Audit Log
              </button>
            </div>
          </article>
        </aside>
      </main>

      {/* ── MODAL: Create New Alert ── */}
      {isCreateModalOpen && (
        <div className="alt-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="create-modal-title">
          <div className="alt-modal-dialog">
            <div className="alt-modal-header">
              <h2 id="create-modal-title">Create Custom Opportunity Trigger</h2>
              <button
                type="button"
                className="alt-modal-close"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="alt-modal-body">
              <div className="alt-form-group">
                <label>Target Role Title</label>
                <input
                  type="text"
                  className="alt-form-input"
                  placeholder="e.g. Senior BIM Coordinator, Parametric Lead..."
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                />
              </div>

              <div className="alt-form-group">
                <label>Target Practices / Client Clusters</label>
                <input
                  type="text"
                  className="alt-form-input"
                  placeholder="e.g. Foster + Partners, ZHA, BIG, Arup..."
                  value={newTargetFirms}
                  onChange={(e) => setNewTargetFirms(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="alt-form-group">
                  <label>Package / Salary Floor</label>
                  <input
                    type="text"
                    className="alt-form-input"
                    value={newPackageRange}
                    onChange={(e) => setNewPackageRange(e.target.value)}
                  />
                </div>

                <div className="alt-form-group">
                  <label>Location / Remote Mode</label>
                  <input
                    type="text"
                    className="alt-form-input"
                    value={newLocationType}
                    onChange={(e) => setNewLocationType(e.target.value)}
                  />
                </div>
              </div>

              <div className="alt-form-group">
                <label>Matched Toolset / Software Stack (comma separated)</label>
                <input
                  type="text"
                  className="alt-form-input"
                  value={newStackTags}
                  onChange={(e) => setNewStackTags(e.target.value)}
                />
              </div>

              <div className="alt-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newIsInstant}
                    onChange={(e) => setNewIsInstant(e.target.checked)}
                    style={{ accentColor: '#00418f', width: '16px', height: '16px' }}
                  />
                  <span>Instant Notification Velocity (&lt; 4 Min Webhook Push)</span>
                </label>
              </div>
            </div>

            <div className="alt-modal-footer">
              <button
                type="button"
                className="btn-alt-light"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-alt-primary"
                onClick={handleCreateAlert}
              >
                Activate Trigger Radar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Channels Configuration ── */}
      {isChannelsModalOpen && (
        <div className="alt-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="channels-modal-title">
          <div className="alt-modal-dialog">
            <div className="alt-modal-header">
              <h2 id="channels-modal-title">Notification Channels &amp; Dispatch</h2>
              <button
                type="button"
                className="alt-modal-close"
                onClick={() => setIsChannelsModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="alt-modal-body">
              <div className="alt-form-group">
                <label>Primary Email Notification Address</label>
                <input
                  type="email"
                  className="alt-form-input"
                  defaultValue="active@alexmorgan.bim"
                />
              </div>

              <div className="alt-form-group">
                <label>SMS Radar Mobile Number (High Priority)</label>
                <input
                  type="text"
                  className="alt-form-input"
                  defaultValue="+44 7911 234521"
                />
              </div>

              <div className="alt-form-group">
                <label>Slack Webhook Integration URL</label>
                <input
                  type="text"
                  className="alt-form-input"
                  defaultValue="https://hooks.slack.com/services/T00/B00/XXXX"
                />
              </div>
            </div>

            <div className="alt-modal-footer">
              <button
                type="button"
                className="btn-alt-light"
                onClick={() => setIsChannelsModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-alt-primary"
                onClick={() => {
                  setIsChannelsModalOpen(false)
                  showToast('Notification channel preferences saved.')
                }}
              >
                Save Channels
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Matching Openings Viewer ── */}
      {isMatchesModalOpen && selectedAlertForMatches && (
        <div className="alt-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="matches-modal-title">
          <div className="alt-modal-dialog" style={{ maxWidth: '620px' }}>
            <div className="alt-modal-header">
              <div>
                <h2 id="matches-modal-title">Live Matching Openings</h2>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
                  {selectedAlertForMatches.title}
                </span>
              </div>
              <button
                type="button"
                className="alt-modal-close"
                onClick={() => setIsMatchesModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="alt-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedAlertForMatches.recentMatches && selectedAlertForMatches.recentMatches.length > 0 ? (
                  selectedAlertForMatches.recentMatches.map((m: OpportunityMatch) => (
                    <div
                      key={m.id}
                      style={{
                        background: '#f3f3f6',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '14px', color: '#1a1c1e' }}>{m.firmName}</strong>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', background: '#d8e2ff', color: '#00418f', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {m.fitScore}% FIT
                          </span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#424753', margin: '3px 0 0' }}>
                          {selectedAlertForMatches.title} • {m.locationText}
                        </p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#00418f', margin: '3px 0 0', fontWeight: 700 }}>
                          {m.salaryText}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn-alt-primary"
                        style={{ fontSize: '12px', padding: '6px 14px', flexShrink: 0 }}
                        onClick={() => {
                          setIsMatchesModalOpen(false)
                          if (onNavigateToFindJobs) {
                            onNavigateToFindJobs()
                          } else {
                            showToast(`Application draft initiated for ${m.firmName}.`)
                          }
                        }}
                      >
                        1-Click Apply
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, color: '#727784' }}>No live cached matches for this specific radar.</p>
                )}
              </div>
            </div>

            <div className="alt-modal-footer">
              <button
                type="button"
                className="btn-alt-light"
                onClick={() => setIsMatchesModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-alt-primary"
                onClick={() => {
                  setIsMatchesModalOpen(false)
                  if (onNavigateToFindJobs) {
                    onNavigateToFindJobs()
                  }
                }}
              >
                Search In Find Jobs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobAlerts
