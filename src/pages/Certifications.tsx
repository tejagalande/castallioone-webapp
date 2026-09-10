import type { FC } from 'react'
import './Certifications.css'
import {
  useCertifications,
  type CertificationLicense,
} from './useCertifications'

interface CertificationsProps {
  onNavigateToPortfolio?: () => void
}

const Certifications: FC<CertificationsProps> = () => {
  const {
    filteredCertifications,
    cpdProgress,
    telemetry,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    recruiterSSOAudit,
    setRecruiterSSOAudit,
    embedWatermark,
    setEmbedWatermark,
    includeRegistryUrls,
    setIncludeRegistryUrls,
    requireNDAForSerials,
    setRequireNDAForSerials,
    isAddModalOpen,
    setIsAddModalOpen,
    isLogCPDModalOpen,
    setIsLogCPDModalOpen,
    inspectCert,
    setInspectCert,
    newCertTitle,
    setNewCertTitle,
    newCertIssuer,
    setNewCertIssuer,
    newCertId,
    setNewCertId,
    logHours,
    setLogHours,
    logCategory,
    setLogCategory,
    logTitle,
    setLogTitle,
    handleCopyLedgerHash,
    handleCopyShareLink,
    handleDownloadTranscriptPDF,
    handleDownloadSingleCert,
    handleRenewCSCS,
    handleAddCertSubmit,
    handleLogCPDSubmit,
    toastMessage,
    showToast,
  } = useCertifications()

  const filterTabs = [
    { id: 'all', label: 'All Credentials (6)' },
    { id: 'bim-cde', label: 'BIM & CDE Management (2)' },
    { id: 'parametric', label: 'Parametric & Software (2)' },
    { id: 'institutions', label: 'Institutions (2)' },
    { id: 'expiring', label: 'Expiring Soon (1)', alert: true },
  ]

  const circumference = 2 * Math.PI * 15.9155

  return (
    <div className="certifications-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="cert-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Sub-Header Technical Telemetry Ribbon */}
      <section className="telemetry-ribbon-bar" aria-label="Cryptographic Verification Ribbon">
        <div className="ribbon-left">
          <span className="ribbon-crumb-pill">
            <span className="pulse-primary" aria-hidden="true" />
            TALENT_WORKSPACE // VERIFICATION-VAULT-V3.1
          </span>
          <span style={{ color: '#c2c6d5' }}>/</span>
          <span style={{ color: '#39464f', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '14px', height: '14px' }} aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            ISO 19650-2:2018 LEVEL 2 VALIDATED
          </span>
          <span style={{ color: '#c2c6d5' }}>/</span>
          <span style={{ color: '#39464f' }}>AUTODESK BADGE NETWORK: SYNCED</span>
        </div>

        <div className="ribbon-right">
          <span style={{ color: '#727784' }}>CRYPTOGRAPHIC HASH:</span>
          <span className="hash-code-box">{telemetry.ledgerShort}</span>
          <button
            type="button"
            className="btn-icon-copy"
            onClick={handleCopyLedgerHash}
            title="Copy Ledger Hash"
            aria-label="Copy Ledger Hash"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      </section>

      {/* 2. Header Title Area */}
      <header className="cert-header-area">
        <div className="header-text-block">
          <div className="header-tags-line">
            <span className="vault-tag-pill">BIM & VDC Credential Vault</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              REGISTRY REF #CW-9921-AM
            </span>
          </div>
          <h1 className="cert-main-title">Professional Certifications & Verified Accreditations</h1>
          <p className="cert-main-desc">
            Official AEC credentials, software vendor licenses, international BIM compliance standards, and continuing education credits verified via cryptographic blockchain or direct issuing body API sync.
          </p>
        </div>

        <div className="header-action-buttons">
          <button
            type="button"
            className="btn-cert-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add New Certification
          </button>

          <button
            type="button"
            className="btn-cert-secondary"
            onClick={() => showToast('Credential Scanner active. Point at QR Certificate.')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Verify External Credential
          </button>

          <button
            type="button"
            className="btn-cert-neutral"
            onClick={handleDownloadTranscriptPDF}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Transcript
          </button>
        </div>
      </header>

      {/* 3. Verification Telemetry Strip (4 cards) */}
      <section className="cert-telemetry-grid" aria-label="Verification Telemetry">
        {/* Card 1 */}
        <div className="telemetry-glass-card">
          <div className="card-kpi-top">
            <span className="kpi-title-small">Active Accreditations</span>
            <div className="kpi-icon-pill" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
          </div>
          <div className="card-kpi-main">
            <div className="kpi-stat-row">
              <span className="kpi-stat-large">{telemetry.activeCount}</span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#39464f' }}>Active Licenses</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
              <span style={{ color: '#00418f', fontWeight: 600 }}>100% Verified</span>
              <span>•</span>
              <span style={{ color: '#ba1a1a', fontWeight: 600 }}>1 Expiring in 65d</span>
            </div>
          </div>
          <div className="kpi-footer-strip">
            <span>ISSUING ACCURACY</span>
            <strong>100% AUTHENTICATED</strong>
          </div>
        </div>

        {/* Card 2 */}
        <div className="telemetry-glass-card">
          <div className="card-kpi-top">
            <span className="kpi-title-small">AEC Compliance Score</span>
            <div className="kpi-icon-pill" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="card-kpi-main">
            <div className="kpi-stat-row">
              <span className="kpi-stat-large accent">{telemetry.complianceScore}%</span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#39464f' }}>ISO Aligned</span>
            </div>
            <span className="kpi-sub-text">Meets UK BIM & buildingSMART Tier 3</span>
          </div>
          <div className="kpi-footer-strip">
            <span>AUDIT CRITERIA</span>
            <strong>ISO 19650-1/-2</strong>
          </div>
        </div>

        {/* Card 3 */}
        <div className="telemetry-glass-card">
          <div className="card-kpi-top">
            <span className="kpi-title-small">Verification Velocity</span>
            <div className="kpi-icon-pill" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
          </div>
          <div className="card-kpi-main">
            <div className="kpi-stat-row">
              <span className="kpi-stat-large">Instant</span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#39464f' }}>SSO Check</span>
            </div>
            <span className="kpi-sub-text">4.8x faster audit across 18 hiring firms</span>
          </div>
          <div className="kpi-footer-strip">
            <span>RECRUITER TRUST</span>
            <strong>100 / 100 LEVEL</strong>
          </div>
        </div>

        {/* Card 4 */}
        <div className="telemetry-glass-card">
          <div className="card-kpi-top">
            <span className="kpi-title-small">CEU & CPD Progress</span>
            <div className="kpi-icon-pill" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
          </div>
          <div className="card-kpi-main">
            <div className="kpi-stat-row">
              <span className="kpi-stat-large">{cpdProgress.totalHours}</span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#39464f' }}>/ {cpdProgress.targetHours} hrs</span>
            </div>
            <div className="kpi-progress-bar">
              <div className="kpi-progress-fill" style={{ width: `${(cpdProgress.totalHours / cpdProgress.targetHours) * 100}%` }} />
            </div>
          </div>
          <div className="kpi-footer-strip">
            <span>{cpdProgress.cycle}</span>
            <strong>{Math.round((cpdProgress.totalHours / cpdProgress.targetHours) * 100)}% COMPLETED</strong>
          </div>
        </div>
      </section>

      {/* 4. Filter & Organization Controls */}
      <section className="cert-filter-console" aria-label="Credentials Filter and Search">
        <div className="filter-pills-wrap" role="tablist">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`cert-filter-btn ${activeFilter === tab.id ? 'active' : ''} ${tab.alert ? 'alert' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="filter-search-row">
          <div className="cert-search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by issuing body, ID, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter credentials"
            />
          </div>

          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', whiteSpace: 'nowrap' }}>
            SORT: INDUSTRY TIER
          </span>
        </div>
      </section>

      {/* 5. Main Content Work Surface (8 Cols / 4 Cols) */}
      <main className="cert-work-surface">
        {/* LEFT / MAIN STREAM (8 Cols) */}
        <section className="cert-main-stream" aria-label="Credentials Vault List">
          {filteredCertifications.map((cert: CertificationLicense) => {
            const isExpiring = cert.status === 'expiring'

            return (
              <article
                key={cert.id}
                className={`credential-vault-card ${isExpiring ? 'expiring' : ''}`}
                aria-labelledby={`cert-title-${cert.id}`}
              >
                <div className="cert-card-top-row">
                  <div className={`cert-logo-avatar ${isExpiring ? 'expiring' : ''}`} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isExpiring ? (
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      ) : (
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      )}
                    </svg>
                  </div>

                  <div className="cert-title-block">
                    <div className="cert-tag-line">
                      <span className="tier-label-badge">{cert.tierLabel}</span>
                      <span className={`status-active-badge ${isExpiring ? 'expiring' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '12px', height: '12px' }} aria-hidden="true">
                          {isExpiring ? (
                            <line x1="12" y1="9" x2="12" y2="13" />
                          ) : (
                            <polyline points="20 6 9 17 4 12" />
                          )}
                        </svg>
                        {isExpiring ? `EXPIRING IN ${cert.daysRemaining} DAYS` : 'VERIFIED ACTIVE'}
                      </span>
                    </div>

                    <h2 id={`cert-title-${cert.id}`} className="cert-heading-title">
                      {cert.title}
                    </h2>

                    <div className="cert-meta-sub">
                      <strong>{cert.issuingBody}</strong>
                      <span>•</span>
                      <span>{cert.location}</span>
                      <span>•</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                        ID: <span style={{ color: '#1a1c1e', fontWeight: 600 }}>{cert.certNumber}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid 4-Col */}
                <div className="cert-meta-grid-4col">
                  <div className="meta-grid-cell">
                    <span className="cell-label">Issue Date</span>
                    <span className="cell-val">{cert.issueDate}</span>
                  </div>
                  <div className="meta-grid-cell">
                    <span className="cell-label">Valid Until</span>
                    <span className="cell-val">{cert.validUntil}</span>
                  </div>
                  <div className="meta-grid-cell">
                    <span className="cell-label">Accreditation Type</span>
                    <span className="cell-val">{cert.accreditationType}</span>
                  </div>
                  <div className="meta-grid-cell">
                    <span className="cell-label">Ledger State</span>
                    <span className="cell-val accent">Anchored {cert.ledgerHash.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Technical Scope */}
                <div className="cert-competencies-block">
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', textTransform: 'uppercase' }}>
                    Core Competencies & Validated Protocols:
                  </span>
                  <div className="competencies-chips">
                    {cert.competencies.map((comp) => (
                      <span className="comp-chip-pill" key={comp}>
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Renewal Warning if Expiring */}
                {isExpiring && cert.renewalActionRequired && (
                  <div className="renewal-alert-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div className="renewal-title-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Renewal Action Recommended
                      </div>
                      <p className="renewal-desc-text">{cert.renewalNotes}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-renew-action"
                      onClick={handleRenewCSCS}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                        <path d="M23 4v6h-6" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Initiate Online Renewal
                    </button>
                  </div>
                )}

                {/* Footer Verification Actions */}
                <div className="cert-card-footer">
                  <div className="footer-sync-note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{cert.apiSyncStatus}</span>
                  </div>

                  <div className="footer-action-buttons">
                    <button
                      type="button"
                      className="btn-card-util"
                      onClick={() => setInspectCert(cert)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                      Ledger Proof
                    </button>

                    <button
                      type="button"
                      className="btn-card-util accent"
                      onClick={() => handleDownloadSingleCert(cert)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Signed PDF
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        {/* RIGHT SIDEBAR (4 Cols) */}
        <aside className="cert-sidebar-col" aria-label="Verification Vault and CPD Tracker">
          {/* 1. Verification Vault & Trust Score */}
          <div className="cert-side-card">
            <div className="side-card-top-line">
              <span className="side-title-text">Verification Vault & Trust</span>
              <span className="side-score-pill">100/100</span>
            </div>

            <div className="trust-gauge-box">
              <div className="trust-gauge-visual">
                <svg viewBox="0 0 36 36" aria-hidden="true">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e2e5"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#00418f"
                    strokeDasharray={`${circumference}, ${circumference}`}
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                <div className="trust-gauge-center">100%</div>
              </div>

              <div className="trust-gauge-text">
                <span className="trust-bold-title">Fully Cryptographically Audited</span>
                <p className="trust-sub-desc">All 6 certificates validated against issuing registrars via tamper-proof proof.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', textTransform: 'uppercase' }}>
                Public Shareable Ledger URL:
              </span>
              <div style={{ display: 'flex', gap: '6px', background: '#f3f3f6', padding: '6px', borderRadius: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value="castallio.one/verify/alex-morgan-vdc"
                  style={{ background: 'transparent', border: 'none', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', width: '100%', outline: 'none', fontWeight: 600 }}
                />
                <button
                  type="button"
                  className="btn-cert-neutral"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={handleCopyShareLink}
                >
                  Copy
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#424753', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={recruiterSSOAudit}
                onChange={(e) => {
                  setRecruiterSSOAudit(e.target.checked)
                  showToast(e.target.checked ? 'Recruiter instant SSO audit enabled' : 'Instant audit paused')
                }}
                style={{ marginTop: '2px', accentColor: '#00418f' }}
              />
              <span>
                <strong>Recruiter Instant SSO Audit</strong> — Allow verified Tier-1 architectural firms instant automated validation.
              </span>
            </label>
          </div>

          {/* 2. CPD & CEU Tracker */}
          <div className="cert-side-card">
            <div className="side-card-top-line">
              <span className="side-title-text">CPD & CEU Tracker</span>
              <span className="side-score-pill">{cpdProgress.cycle}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1c1e' }}>{cpdProgress.totalHours} Hours Earned</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11.5px', color: '#727784' }}>
                {cpdProgress.targetHours - cpdProgress.totalHours} hrs to go
              </span>
            </div>

            <div className="cpd-segmented-bar">
              <div
                className="cpd-seg-fill bim"
                style={{ width: `${(cpdProgress.breakdown.bimCoordination / cpdProgress.targetHours) * 100}%` }}
                title={`BIM & Coordination (${cpdProgress.breakdown.bimCoordination} hrs)`}
              />
              <div
                className="cpd-seg-fill comp"
                style={{ width: `${(cpdProgress.breakdown.computationalScripting / cpdProgress.targetHours) * 100}%` }}
                title={`Computational & Scripting (${cpdProgress.breakdown.computationalScripting} hrs)`}
              />
              <div
                className="cpd-seg-fill legal"
                style={{ width: `${(cpdProgress.breakdown.isoLegalProtocol / cpdProgress.targetHours) * 100}%` }}
                title={`ISO BEP & Legal (${cpdProgress.breakdown.isoLegalProtocol} hrs)`}
              />
            </div>

            <div className="cpd-breakdown-list">
              <div className="cpd-breakdown-row">
                <div className="cpd-legend-item">
                  <span className="dot bim" />
                  <span>BIM & Multi-D Coordination</span>
                </div>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>{cpdProgress.breakdown.bimCoordination} hrs</strong>
              </div>
              <div className="cpd-breakdown-row">
                <div className="cpd-legend-item">
                  <span className="dot comp" />
                  <span>Computational & Python Scripting</span>
                </div>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>{cpdProgress.breakdown.computationalScripting} hrs</strong>
              </div>
              <div className="cpd-breakdown-row">
                <div className="cpd-legend-item">
                  <span className="dot legal" />
                  <span>ISO 19650 BEP & Legal Protocol</span>
                </div>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>{cpdProgress.breakdown.isoLegalProtocol} hrs</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn-cert-neutral"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setIsLogCPDModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Log CPD Hours / Upload Proof
            </button>
          </div>

          {/* 3. Recommended Pathways (AI Matching) */}
          <div className="cert-side-card">
            <div className="side-card-top-line">
              <div className="side-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="side-title-text">Recommended Pathways</span>
              </div>
              <span className="side-score-pill">AI TARGET FIT</span>
            </div>

            <p style={{ fontSize: '12px', color: '#424753', margin: 0 }}>
              Based on your career target <strong style={{ color: '#1a1c1e' }}>"Lead VDC / Computational Director"</strong>:
            </p>

            <div className="scripts-repo-list">
              <div className="pathway-item-box">
                <div className="pathway-top-row">
                  <span className="pathway-title">buildingSMART Practitioner Coordinator</span>
                  <span className="pathway-vis-badge">+18% Vis</span>
                </div>
                <p className="pathway-desc">Upgrades Foundation badge to certified openBIM project auditor status.</p>
                <div className="pathway-foot">
                  <span>Exam prep: 14 hrs</span>
                  <span className="pathway-link" onClick={() => showToast('Enrolled in buildingSMART Practitioner module.')}>
                    Explore Syllabus →
                  </span>
                </div>
              </div>

              <div className="pathway-item-box">
                <div className="pathway-top-row">
                  <span className="pathway-title">AIA Continuing Ed — Advanced Mass Timber FEA</span>
                  <span className="pathway-vis-badge">+8 CEU</span>
                </div>
                <p className="pathway-desc">Parametric analysis in timber superstructure engineering.</p>
                <div className="pathway-foot">
                  <span>AIA Approved</span>
                  <span className="pathway-link" onClick={() => showToast('Opening AIA timber syllabus provider...')}>
                    Enroll Provider →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Transcript Export Security Settings */}
          <div className="cert-side-card">
            <span className="side-title-text">Transcript Export Security</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#424753' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span>Embed Cryptographic Watermark</span>
                <input
                  type="checkbox"
                  checked={embedWatermark}
                  onChange={(e) => setEmbedWatermark(e.target.checked)}
                  style={{ accentColor: '#00418f' }}
                />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span>Include Direct Registry URLs</span>
                <input
                  type="checkbox"
                  checked={includeRegistryUrls}
                  onChange={(e) => setIncludeRegistryUrls(e.target.checked)}
                  style={{ accentColor: '#00418f' }}
                />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span>Require Recruiter NDA for Serial IDs</span>
                <input
                  type="checkbox"
                  checked={requireNDAForSerials}
                  onChange={(e) => setRequireNDAForSerials(e.target.checked)}
                  style={{ accentColor: '#00418f' }}
                />
              </label>
            </div>

            <button
              type="button"
              className="btn-cert-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleDownloadTranscriptPDF}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Consolidated Transcript (PDF)
            </button>
          </div>
        </aside>
      </main>

      {/* Add New Certification Dialog Modal */}
      {isAddModalOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
          <div className="profile-modal-dialog" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2 id="add-modal-title">Add Professional Certification</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-form-group">
                <label className="modal-label">Certification / License Title *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. CanBIM Professional Level 3"
                  value={newCertTitle}
                  onChange={(e) => setNewCertTitle(e.target.value)}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Issuing Body / Authority</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Canada BIM Council / buildingSMART"
                  value={newCertIssuer}
                  onChange={(e) => setNewCertIssuer(e.target.value)}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">License / Serial Number</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. CANBIM-L3-0941"
                  value={newCertId}
                  onChange={(e) => setNewCertId(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cert-neutral"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-cert-primary"
                onClick={handleAddCertSubmit}
              >
                Verify & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log CPD Modal */}
      {isLogCPDModalOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cpd-modal-title">
          <div className="profile-modal-dialog" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 id="cpd-modal-title">Log Continuing Education (CPD)</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsLogCPDModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-form-group">
                <label className="modal-label">Activity Name / Course Title *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Advanced Mass Timber Computational Workshop"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                />
              </div>

              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Hours Earned</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    className="modal-input"
                    value={logHours}
                    onChange={(e) => setLogHours(Number(e.target.value))}
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Domain Track</label>
                  <select
                    className="modal-input"
                    value={logCategory}
                    onChange={(e) => setLogCategory(e.target.value as 'bim' | 'comp' | 'legal')}
                  >
                    <option value="bim">BIM & Multi-D Coordination</option>
                    <option value="comp">Computational & Scripting</option>
                    <option value="legal">ISO 19650 BEP & Legal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cert-neutral"
                onClick={() => setIsLogCPDModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-cert-primary"
                onClick={handleLogCPDSubmit}
              >
                Log CPD Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Certificate Modal */}
      {inspectCert && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Certificate Details">
          <div className="profile-modal-dialog" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Hanken Grotesk', fontSize: '18px' }}>
                  {inspectCert.title}
                </h3>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
                  HASH: {inspectCert.ledgerHash}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setInspectCert(null)}
                aria-label="Close details"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="cert-meta-grid-4col">
                <div className="meta-grid-cell">
                  <span className="cell-label">Issuing Body</span>
                  <span className="cell-val">{inspectCert.issuingBody}</span>
                </div>
                <div className="meta-grid-cell">
                  <span className="cell-label">Serial Number</span>
                  <span className="cell-val">{inspectCert.certNumber}</span>
                </div>
                <div className="meta-grid-cell">
                  <span className="cell-label">Issue Date</span>
                  <span className="cell-val">{inspectCert.issueDate}</span>
                </div>
                <div className="meta-grid-cell">
                  <span className="cell-label">Expiry Date</span>
                  <span className="cell-val">{inspectCert.validUntil}</span>
                </div>
              </div>

              <div className="cert-competencies-block">
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', textTransform: 'uppercase' }}>
                  Audited Competencies:
                </span>
                <div className="competencies-chips">
                  {inspectCert.competencies.map((c) => (
                    <span className="comp-chip-pill" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cert-neutral"
                onClick={() => setInspectCert(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-cert-primary"
                onClick={() => handleDownloadSingleCert(inspectCert)}
              >
                Download Signed PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Certifications
