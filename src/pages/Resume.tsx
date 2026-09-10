import type { FC } from 'react'
import './Resume.css'
import {
  useResumeManagement,
  ATS_TOKENS,
  VERIFICATION_SEALS,
  type ResumeVersion,
} from './useResume'

interface ResumeProps {
  onNavigateToPortfolio?: () => void
  onNavigateToCertifications?: () => void
}

const Resume: FC<ResumeProps> = ({ onNavigateToPortfolio, onNavigateToCertifications }) => {
  const {
    activeResume,
    variants,
    selectedTargetJob,
    setSelectedTargetJob,
    oneClickDownload,
    setOneClickDownload,
    hideContactInfo,
    setHideContactInfo,
    digitalWatermark,
    setDigitalWatermark,
    activeTab,
    setActiveTab,
    isFullscreenPreview,
    setIsFullscreenPreview,
    handleDownloadPDF,
    handleCopyLink,
    handleExportZip,
    handleExportJsonResume,
    handleCreateVariant,
    handleAutoGenerateTailoredDraft,
    toastMessage,
    showToast,
  } = useResumeManagement()

  return (
    <div className="resume-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="resume-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. System Status Breadcrumb Strip */}
      <section className="resume-status-strip" aria-label="Resume Document Status and Telemetry">
        <div className="status-strip-left">
          <span className="doc-id-pill">DOC_ID // {activeResume.docId}</span>
          <span className="verified-cand-tag">
            <span className="pulse-primary" aria-hidden="true" />
            VERIFIED AEC CANDIDATE
          </span>
          <span className="ats-score-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            ATS & BIM-PARSER SCORE: <strong>{activeResume.atsHealthScore}%</strong>
          </span>
        </div>
        <div className="status-strip-right">
          <span className="sheet-rev-text">LOD STANDARD:</span>
          <span className="doc-id-pill" style={{ background: '#eeeef0', color: '#1a1c1e' }}>
            {activeResume.lodStandard}
          </span>
        </div>
      </section>

      {/* 2. Workspace Subheader Section */}
      <header className="resume-subheader">
        <div className="resume-header-info">
          <div className="sheet-revision-line">
            <span className="view-badge-primary">Workspace View</span>
            <span className="sheet-rev-text">SHEET NO. A-001 // REVISION 4.2</span>
          </div>
          <h1 className="resume-main-title">Resume & CV Management</h1>
          <p className="resume-lead-text">
            Manage version-controlled resumes, generate discipline-specific BIM CVs (LOD/CDE focused), track ATS parsing health, and configure recruiter export permissions.
          </p>
        </div>

        <div className="action-ribbon">
          <button
            type="button"
            className="btn-ribbon-secondary"
            onClick={() => setIsFullscreenPreview(true)}
            aria-label="Preview public resume view"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview Public CV
          </button>

          <button
            type="button"
            className="btn-ribbon-secondary"
            onClick={() => showToast('File upload dialog opened for new CV revision.')}
            aria-label="Upload new version"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload New Version
          </button>

          <button
            type="button"
            className="btn-ribbon-primary"
            onClick={handleCreateVariant}
            aria-label="Create tailored discipline CV"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Create Tailored CV
          </button>
        </div>
      </header>

      {/* 3. Main Work Surface Container (8 Cols / 4 Cols) */}
      <main className="resume-work-surface">
        {/* LEFT COLUMN: Active Primary Resume & Blueprint Sheet (8 Cols) */}
        <section className="resume-main-column" aria-label="Active Primary Resume Sheet">
          <article className="active-resume-card">
            {/* Card Blueprint Title Header */}
            <div className="card-blueprint-header">
              <div className="blueprint-header-left">
                <div className="icon-box-primary" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="header-meta-details">
                  <div className="tag-row">
                    <span className="active-cv-pill">PRIMARY ACTIVE CV (V4.2)</span>
                    <span className="sheet-rev-text">{activeResume.lastUpdated}</span>
                  </div>
                  <span className="cv-file-title">{activeResume.fileName}</span>
                  <span className="cv-file-spec">{activeResume.fileSize} • {activeResume.compliance}</span>
                </div>
              </div>

              <div className="broadcast-badge">
                <span className="pulse-primary" aria-hidden="true" />
                ACTIVE BROADCAST
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="resume-quick-bar">
              <div className="quick-bar-left">
                <button
                  type="button"
                  className="btn-quick-util"
                  onClick={() => setIsFullscreenPreview(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                  View Fullscreen
                </button>

                <button
                  type="button"
                  className="btn-quick-util"
                  onClick={() => handleDownloadPDF(activeResume.fileName)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </button>

                <button
                  type="button"
                  className="btn-quick-util"
                  onClick={() => showToast('Replace file prompt active.')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Replace File
                </button>

                <button
                  type="button"
                  className="btn-quick-util"
                  onClick={handleCreateVariant}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Duplicate as Draft
                </button>
              </div>

              <button
                type="button"
                className="btn-json-export"
                onClick={handleExportJsonResume}
                title="Export standard Open Source JSON-Resume"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Export JSON-Resume / IFC XML
              </button>
            </div>

            {/* Embedded Visual DIN Blueprint Sheet */}
            <div className="blueprint-sheet-container">
              <div className="din-blueprint-sheet">
                {/* Blueprint Title Block Banner */}
                <div className="blueprint-title-banner">
                  <div className="title-banner-left">
                    <div className="blueprint-stamps-row">
                      <span className="stamp-code">PROJECT CODE: BIM-CORE</span>
                      <span className="stamp-spec">SCALE: N.T.S.</span>
                      <span className="stamp-spec">DATE: NOV 2024</span>
                    </div>
                    <h2 className="blueprint-hero-name">ALEX MORGAN, M.Sc., AIA Assoc.</h2>
                    <p className="blueprint-sub-role">SENIOR BIM COORDINATOR • COMPUTATIONAL VDC SPECIALIST</p>
                  </div>
                  <div className="title-banner-right">
                    <div>DISCIPLINE: ARCH / STRUCT / MEP COORDINATION</div>
                    <div>SECURITY CLEARANCE: ACTIVE LEVEL II (UK/EU)</div>
                    <div>LOCATION: LONDON, UK (REMOTE & SITE-READY)</div>
                    <div className="highlight">CDE STATUS: ISO 19650-2 COMPLIANT</div>
                  </div>
                </div>

                {/* Section 01: Executive Summary */}
                <div className="sheet-section">
                  <div className="sheet-section-header">
                    <span className="sheet-section-tag">
                      <span className="section-dot" aria-hidden="true" />
                      01 // EXECUTIVE SUMMARY & TECHNICAL SPECIFICATION
                    </span>
                    <span className="sheet-rev-tag">SPEC_REV: 04</span>
                  </div>
                  <p className="sheet-body-text">{activeResume.executiveSummary}</p>
                </div>

                {/* Section 02: Core Technical Stack Matrix */}
                <div className="sheet-section">
                  <div className="sheet-section-header">
                    <span className="sheet-section-tag">
                      <span className="section-dot" aria-hidden="true" />
                      02 // VERIFIED CORE TECHNICAL MATRIX & SOFTWARE STACK
                    </span>
                    <span className="sheet-rev-tag">EVAL_DATE: 2024.11</span>
                  </div>
                  <div className="core-stack-grid">
                    {renderCoreStackTiles()}
                  </div>
                </div>

                {/* Section 03: Career Milestones & Appointments */}
                <div className="sheet-section">
                  <div className="sheet-section-header">
                    <span className="sheet-section-tag">
                      <span className="section-dot" aria-hidden="true" />
                      03 // CAREER MILESTONES & APPOINTMENTS
                    </span>
                    <span className="sheet-rev-tag">RECORD: 3 FIRMS</span>
                  </div>
                  <div className="milestones-sheet-list">
                    {/* Role 1 */}
                    <div className="milestone-sheet-item">
                      <div className="milestone-top-line">
                        <div>
                          <span className="milestone-role-text">Senior BIM Coordinator</span>
                          <span className="milestone-firm-pill">Grimshaw Architects</span>
                        </div>
                        <span className="milestone-period-text">2022 — Present • London, UK</span>
                      </div>
                      <ul className="milestone-bullets">
                        <li>Author and manage the primary ISO 19650-2 BIM Execution Plan (BEP) for an international rail transport interchange hub valued at £420M.</li>
                        <li>Orchestrated federation across 14 distinct disciplines (Arch, Structural, MEP, Signalling, Landscape), resolving 1,800+ spatial clashes via Navisworks prior to tender release.</li>
                        <li>Developed custom pyRevit ribbon tools accelerating family parameter verification across 350+ Revit models, slashing review cycle time by 42%.</li>
                      </ul>
                    </div>
                    {/* Role 2 */}
                    <div className="milestone-sheet-item">
                      <div className="milestone-top-line">
                        <div>
                          <span className="milestone-role-text">Computational BIM Specialist</span>
                          <span className="milestone-firm-pill">Foster + Partners</span>
                        </div>
                        <span className="milestone-period-text">2019 — 2022 • London, UK</span>
                      </div>
                      <ul className="milestone-bullets">
                        <li>Constructed parametric Grasshopper scripts to automate the panel division and structural bracket alignment for a 52-story curved curtain wall facade.</li>
                        <li>Streamlined bidirectional IFC geometry pipelines connecting Rhino.Inside.Revit with structural engineering teams, ensuring sub-millimeter tolerances.</li>
                        <li>Conducted weekly clash reviews in Solibri Office, enforcing strict COBie standard compliance for government client deliverables.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 04: Key Milestone Projects */}
                <div className="sheet-section">
                  <div className="sheet-section-header">
                    <span className="sheet-section-tag">
                      <span className="section-dot" aria-hidden="true" />
                      04 // KEY MILESTONE PROJECTS (LOD 350-500)
                    </span>
                    <span className="sheet-rev-tag">PORTFOLIO EXCERPT</span>
                  </div>
                  <div className="projects-excerpt-grid">
                    {/* Project 1 */}
                    <div className="project-excerpt-card">
                      <div className="excerpt-img-frame">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjnIvsGXJNXplArdEm97mmWx5bCbLxivkPUnqsqPD5Gstc3zBrZznH2f3F6ge-tFWFZjMeGu0-fPL37ySAiIFwmuEHGxD2fjCo1jjiVj7MU1_Ti3oE6oRprRIVbXjEjH4yBB6GuU1lKnLWhzhLyaS1WVJMIwn_MZRjzy-4r0Ji7uXUkCQ8dP01pU-pU-OshdHM5-JqKHkI4fxOi1yuCoZjE18ORLUVkHvOJMuh9goSR2eiA6o5_xhWJg"
                          alt="The Scalpel Commercial Tower in London"
                        />
                      </div>
                      <div className="excerpt-details">
                        <div className="excerpt-meta-top">
                          <span className="lod">LOD 400 • £180M</span>
                          <span className="type">COMMERCIAL</span>
                        </div>
                        <h4 className="excerpt-title">The Scalpel Commercial Tower</h4>
                        <p className="excerpt-desc">Lead MEP/Architectural clash coordinator across 38 tenant fit-out levels.</p>
                        <span className="excerpt-firm-foot">Grimshaw Architects • Completed 2023</span>
                      </div>
                    </div>

                    {/* Project 2 */}
                    <div className="project-excerpt-card">
                      <div className="excerpt-img-frame">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2qYh-bNkMlHaMBNiDacrVHF-qWYE1airvhKR2cT4EjDYl89tZ_KEjxfDkBV5x20yQxCo9yB7nWefnviL9oUxf-l6RMguU8Jw47IyTfzdUrPGaCTKjb4F2gnRowsMQOHGezduNpzqi1tJiApRJLKKmz1AMLO_yT4Y-ViQ0YVL17bESGyT1sQBc5nZx_3VoCl3ruhUokXFZ9weW8KDdjEcIsjDPdgZ_4d0deDFSS1PHP7ppoxstEAqT6Q"
                          alt="Rail Interchange Transit Hub"
                        />
                      </div>
                      <div className="excerpt-details">
                        <div className="excerpt-meta-top">
                          <span className="lod">LOD 500 • £420M</span>
                          <span className="type">INFRASTRUCTURE</span>
                        </div>
                        <h4 className="excerpt-title">Rail Interchange Transit Hub</h4>
                        <p className="excerpt-desc">ISO 19650 BEP management, multi-disciplinary CDE governance for HS2.</p>
                        <span className="excerpt-firm-foot">Grimshaw Architects • Phase 2 Active</span>
                      </div>
                    </div>

                    {/* Project 3 */}
                    <div className="project-excerpt-card">
                      <div className="excerpt-img-frame">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYcIN5n8ftlUd9X0d91jVwQLyv4b7WJHfPhIXc7MrKcwmkHF0jw4JMBlr4WyW2-OTx97-9Ym6zSredMQ6ciiDys-VknVBhCR_-kA6cgnaSMuhAlKa0MbqKYYkXlNrWWpnqesFwZadT5V9qnTH2u0LdhXjCFTJTjvTzAtc81FTwAGiqj8FFZGSyTq1JyhlqV_Q-kqOI9hNJUJerqPNrBcZsO0FsY_sRLP3vi_4Z6_QZ4054rCJj575tpg"
                          alt="CLT Innovation Pavilion"
                        />
                      </div>
                      <div className="excerpt-details">
                        <div className="excerpt-meta-top">
                          <span className="lod">LOD 350 • £14M</span>
                          <span className="type">TIMBER CLT</span>
                        </div>
                        <h4 className="excerpt-title">CLT Innovation Pavilion</h4>
                        <p className="excerpt-desc">Computational Grasshopper-to-CNC milling fabrication model generation.</p>
                        <span className="excerpt-firm-foot">Foster + Partners • Award Winner 2021</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 05: Accreditations & Higher Education */}
                <div className="sheet-section">
                  <div className="sheet-section-header">
                    <span className="sheet-section-tag">
                      <span className="section-dot" aria-hidden="true" />
                      05 // ACCREDITATIONS, LICENSES & HIGHER EDUCATION
                    </span>
                    <span className="sheet-rev-tag">VERIFIED 4 OF 4</span>
                  </div>
                  <div className="accreditations-grid">
                    <div className="accred-box-item">
                      <div className="accred-info-left">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                          <span className="accred-title-main">M.Sc. Architectural Computation</span>
                          <span className="accred-subtext">University College London (The Bartlett) • Distinction</span>
                        </div>
                      </div>
                      <span className="accred-badge-pill">2017</span>
                    </div>

                    <div className="accred-box-item">
                      <div className="accred-info-left">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                          <span className="accred-title-main">BRE Academy ISO 19650 Lead</span>
                          <span className="accred-subtext">Global Information Management Certification</span>
                        </div>
                      </div>
                      <span className="accred-badge-pill">CERTIFIED</span>
                    </div>

                    <div className="accred-box-item">
                      <div className="accred-info-left">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                          <span className="accred-title-main">CanBIM Professional (CP)</span>
                          <span className="accred-subtext">Canada BIM Council Certification Level 3</span>
                        </div>
                      </div>
                      <span className="accred-badge-pill">LEVEL 3</span>
                    </div>

                    <div className="accred-box-item">
                      <div className="accred-info-left">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                          <span className="accred-title-main">buildingSMART openBIM Foundation</span>
                          <span className="accred-subtext">IFC / BCF Schema Certified Practitioner</span>
                        </div>
                      </div>
                      <span className="accred-badge-pill">bSI-2024</span>
                    </div>
                  </div>
                </div>

                {/* Blueprint Sheet Corner Hash */}
                <div className="blueprint-corner-hash">
                  <span>ISSUED UNDER AUTODESK LICENSED ECOSYSTEM // CASTALLIO SYSTEM ENGINE v2.8</span>
                  <span>AUTHENTICITY HASH: {activeResume.hash}</span>
                </div>
              </div>
            </div>

            {/* ATS Parsing Health Bar */}
            <div className="ats-health-footer">
              <div className="ats-health-top">
                <div className="ats-score-box">
                  <div className="ats-num-badge">{activeResume.atsHealthScore}</div>
                  <div className="ats-title-wrap">
                    <h3 className="ats-main-title">ATS & Talent Engine Compatibility Health</h3>
                    <span className="ats-sub-desc">Tested against Greenhouse, Workday AEC, Taleo, and Castallio Semantic BIM Parser.</span>
                  </div>
                </div>
                <span className="active-cv-pill" style={{ background: '#d8e2ff', color: '#00418f' }}>
                  OPTIMAL MATCH
                </span>
              </div>

              <div className="ats-tokens-cloud">
                <span className="token-label-prefix">Parser Detected High-Value AEC Match Tokens:</span>
                {ATS_TOKENS.map((token) => (
                  <span className="token-chip" key={token.name}>
                    <strong>{token.name}</strong>
                    <span className="percent">{token.matchPercent}%</span>
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Tailored & Version-Controlled CV Variants Section */}
          <article className="resume-variants-card">
            <div className="variants-header-line">
              <div className="variants-title-block">
                <h3>Discipline-Tailored CV Variants</h3>
                <p>Custom-tuned versions emphasizing distinct technical workflows for specific firm types.</p>
              </div>
              <button
                type="button"
                className="btn-ribbon-secondary"
                onClick={handleCreateVariant}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                New Variant
              </button>
            </div>

            <div className="milestones-sheet-list">
              {variants.map((v: ResumeVersion) => (
                <div className="variant-item-card" key={v.id}>
                  <div className="variant-top-row">
                    <span className="variant-code-badge">{v.versionCode}</span>
                    <h4 className="variant-title-text">{v.title}</h4>
                    <span className="variant-modified-tag">{v.lastModified}</span>
                  </div>
                  <p className="variant-desc-text">
                    Targeted at: <strong>{v.targetFirms}</strong>. {v.summary}
                  </p>
                  <div className="variant-footer-bar">
                    <div className="variant-tags-wrap">
                      {v.tags.map((tag) => (
                        <span className="variant-tag-pill" key={tag}>
                          {tag}
                        </span>
                      ))}
                      <span className="sheet-rev-text">• {v.downloadsCount} Downloads • Shared with {v.sharedCount} Firms</span>
                    </div>

                    <div className="variant-actions-group">
                      <span className="variant-ats-badge">{v.atsScore}% ATS</span>
                      <button
                        type="button"
                        className="btn-icon-variant"
                        onClick={() => setIsFullscreenPreview(true)}
                        title="Preview Variant"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn-icon-variant"
                        onClick={() => handleDownloadPDF(`${v.versionCode}_${v.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)}
                        title="Download PDF"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn-icon-variant"
                        onClick={handleCopyLink}
                        title="Share Link"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* RIGHT COLUMN: Sidebar Tools & Telemetry (4 Cols) */}
        <aside className="resume-sidebar-column" aria-label="Resume AI Tailor, Seals, and Controls">
          {/* 1. AI BIM Tailor & Optimization Assistant */}
          <div className="resume-side-card">
            <div className="side-card-header">
              <div className="side-card-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <h3 className="side-card-title">Castallio AI Tailor</h3>
              </div>
              <span className="side-card-badge">GPT-4o AEC MODEL</span>
            </div>

            <p className="side-desc-text">
              Match your live CV against any active AEC opening or saved job to identify missing LOD specifications and BEP keywords.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="pref-label">Compare against Target Job:</label>
              <select
                className="select-target-job"
                value={selectedTargetJob}
                onChange={(e) => setSelectedTargetJob(e.target.value)}
              >
                <option value="Lead Computational Designer • Foster + Partners (Saved)">
                  Lead Computational Designer • Foster + Partners (Saved)
                </option>
                <option value="Senior BIM Manager (Rail) • Arup London">
                  Senior BIM Manager (Rail) • Arup London
                </option>
                <option value="VDC Project Lead • Skanska Construction">
                  VDC Project Lead • Skanska Construction
                </option>
                <option value="Custom Job Description">
                  Custom Job Description (Paste raw text...)
                </option>
              </select>
            </div>

            <div className="ai-score-gauge-box">
              <div className="gauge-top-line">
                <span className="gauge-label">TARGET ALIGNMENT</span>
                <span className="gauge-score">94%</span>
              </div>
              <div className="gauge-segments">
                <div className="gauge-seg filled" />
                <div className="gauge-seg filled" />
                <div className="gauge-seg filled" />
                <div className="gauge-seg filled" />
                <div className="gauge-seg filled" />
                <div className="gauge-seg filled" />
                <div className="gauge-seg filled" />
                <div className="gauge-seg filled" />
                <div className="gauge-seg filled" />
                <div className="gauge-seg" />
              </div>
              <div className="tweaks-list">
                <span className="pref-label">Recommended Tweaks:</span>
                <div className="tweak-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <span>Add <strong>"pyRevit unit-testing"</strong> bullet to Grimshaw experience block.</span>
                </div>
                <div className="tweak-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <span>Emphasize <strong>"ISO 19650-2 BEP Authoring"</strong> in executive summary line 2.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-ribbon-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleAutoGenerateTailoredDraft}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              Auto-Generate Tailored Draft
            </button>
          </div>

          {/* 2. Verification & Blockchain Credential Seal */}
          <div className="resume-side-card">
            <div className="side-card-header">
              <div className="side-card-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h3 className="side-card-title">Verification Seals</h3>
              </div>
              <span className="side-card-badge">100% VERIFIED</span>
            </div>

            <div className="seals-list-box">
              {VERIFICATION_SEALS.map((seal) => (
                <div className="seal-row" key={seal.id}>
                  <span className="title">{seal.title}</span>
                  <span className="code">{seal.code}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
              <span style={{ color: '#727784' }}>TRUST INDEX: 10/10</span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#00418f', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => {
                  if (onNavigateToCertifications) onNavigateToCertifications()
                  else showToast('Opening cryptographic verification ledger...')
                }}
              >
                View Public Proof →
              </button>
            </div>
          </div>

          {/* 3. Recruiter Access & Privacy Controls */}
          <div className="resume-side-card">
            <div className="side-card-title-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h3 className="side-card-title">Privacy & Sharing Controls</h3>
            </div>

            <div className="privacy-toggles-list">
              <div className="privacy-toggle-item">
                <div className="toggle-item-text">
                  <span className="toggle-item-title">One-Click Recruiter PDF Download</span>
                  <span className="toggle-item-sub">Allow verified Tier 1 HR/BIM leads to download immediately.</span>
                </div>
                <label className="toggle-switch" aria-label="Toggle one click download">
                  <input
                    type="checkbox"
                    checked={oneClickDownload}
                    onChange={(e) => {
                      setOneClickDownload(e.target.checked)
                      showToast(e.target.checked ? 'One-click download active' : 'One-click download disabled')
                    }}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="privacy-toggle-item">
                <div className="toggle-item-text">
                  <span className="toggle-item-title">Hide Contact Info Until Request</span>
                  <span className="toggle-item-sub">Require formal connection request before revealing email/phone.</span>
                </div>
                <label className="toggle-switch" aria-label="Toggle hide contact info">
                  <input
                    type="checkbox"
                    checked={hideContactInfo}
                    onChange={(e) => {
                      setHideContactInfo(e.target.checked)
                      showToast(e.target.checked ? 'Contact info protected' : 'Contact info public')
                    }}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="privacy-toggle-item">
                <div className="toggle-item-text">
                  <span className="toggle-item-title">Digital Candidate Watermark</span>
                  <span className="toggle-item-sub">Embed verified cryptographic seal onto exported PDFs.</span>
                </div>
                <label className="toggle-switch" aria-label="Toggle digital watermark">
                  <input
                    type="checkbox"
                    checked={digitalWatermark}
                    onChange={(e) => {
                      setDigitalWatermark(e.target.checked)
                      showToast(e.target.checked ? 'Watermark enabled' : 'Watermark disabled')
                    }}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="pref-label">Personalized Recruiter Link:</label>
              <div className="recruiter-url-box">
                <span className="recruiter-url-text">castallio.one/cv/alex-morgan-bim</span>
                <button
                  type="button"
                  className="btn-icon-variant"
                  style={{ width: '28px', height: '28px' }}
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn-ribbon-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleExportZip}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Export Complete BIM Portfolio & CV (.ZIP)
            </button>
          </div>

          {/* 4. Quick Document Switcher / Document Hub Navigation */}
          <div className="resume-side-card">
            <div className="side-card-header">
              <h3 className="side-card-title">Talent Document Hub</h3>
              <span className="sheet-rev-text">SECURE VAULT</span>
            </div>

            <nav className="document-hub-nav" aria-label="Talent Document Hub">
              <button
                type="button"
                className={`doc-hub-link ${activeTab === 'resumes' ? 'active' : ''}`}
                onClick={() => setActiveTab('resumes')}
              >
                <div className="hub-link-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Resumes & CVs</span>
                </div>
                <span className="hub-count-pill">4 FILES</span>
              </button>

              <button
                type="button"
                className={`doc-hub-link ${activeTab === 'cover-letters' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('cover-letters')
                  showToast('Cover Letters vault selected.')
                }}
              >
                <div className="hub-link-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Cover Letters</span>
                </div>
                <span className="hub-count-pill">2 TEMPLATES</span>
              </button>

              <button
                type="button"
                className={`doc-hub-link ${activeTab === 'bep-samples' ? 'active' : ''}`}
                onClick={() => {
                  if (onNavigateToPortfolio) onNavigateToPortfolio()
                  else showToast('Opening Technical BEP Portfolio samples...')
                }}
              >
                <div className="hub-link-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <span>Technical BEP Portfolio</span>
                </div>
                <span className="hub-count-pill">3 SAMPLES</span>
              </button>

              <button
                type="button"
                className={`doc-hub-link ${activeTab === 'certs' ? 'active' : ''}`}
                onClick={() => {
                  if (onNavigateToCertifications) onNavigateToCertifications()
                  else showToast('Opening Certifications & ID Proofs...')
                }}
              >
                <div className="hub-link-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  <span>Certifications & ID Proofs</span>
                </div>
                <span className="hub-count-pill" style={{ color: '#00418f' }}>
                  4 VERIFIED
                </span>
              </button>
            </nav>
          </div>
        </aside>
      </main>

      {/* Fullscreen CV Preview Modal */}
      {isFullscreenPreview && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Fullscreen CV Preview">
          <div className="profile-modal-dialog" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'Hanken Grotesk' }}>
                  Alex_Morgan_BIM_Computational_CV_2024.pdf
                </h2>
                <span style={{ fontSize: '11px', color: '#727784', fontFamily: 'JetBrains Mono' }}>
                  LOD 400 VERIFIED AEC CANDIDATE // SHA-256 HASH: {activeResume.hash}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsFullscreenPreview(false)}
                aria-label="Close preview"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ background: '#f3f3f6' }}>
              <div className="din-blueprint-sheet" style={{ margin: '0 auto' }}>
                <div className="blueprint-title-banner">
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'Hanken Grotesk', fontSize: '20px', color: '#00418f' }}>
                      ALEX MORGAN, M.Sc., AIA Assoc.
                    </h3>
                    <p style={{ margin: '2px 0 0', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#39464f' }}>
                      SENIOR BIM COORDINATOR • COMPUTATIONAL VDC SPECIALIST
                    </p>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                    ISO 19650-2 COMPLIANT
                  </div>
                </div>

                <div className="sheet-section">
                  <div className="sheet-section-header">
                    <span className="sheet-section-tag">EXECUTIVE SUMMARY</span>
                  </div>
                  <p className="sheet-body-text">{activeResume.executiveSummary}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-ribbon-secondary"
                onClick={() => setIsFullscreenPreview(false)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="btn-ribbon-primary"
                onClick={() => handleDownloadPDF(activeResume.fileName)}
              >
                Download Verified PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function renderCoreStackTiles() {
  const stackItems = [
    { name: 'Autodesk Revit', tag: '2024', disc: 'Parametric / LOD 400', pct: 98 },
    { name: 'Navisworks Manage', tag: 'EXPERT', disc: 'Clash Detective & 4D', pct: 95 },
    { name: 'Solibri Office', tag: 'RULESET', disc: 'QA/QC & COBie', pct: 92 },
    { name: 'Rhino + Grasshopper', tag: 'PARAMETRIC', disc: 'Algorithmic Geometry', pct: 94 },
    { name: 'Python / pyRevit', tag: 'DEV', disc: 'Automation Scripts', pct: 88 },
    { name: 'Autodesk CC / ACC', tag: 'CDE LEAD', disc: 'BIM 360 & Hub Admin', pct: 96 },
    { name: 'Synchro 4D', tag: 'VDC', disc: 'Construction Phasing', pct: 85 },
    { name: 'Dynamo Studio', tag: 'SCRIPTING', disc: 'Batch Parameter Flow', pct: 91 },
  ]

  return stackItems.map((item) => (
    <div className="stack-blueprint-box" key={item.name}>
      <div className="stack-box-top">
        <span className="stack-tool-title">{item.name}</span>
        <span className="stack-tool-badge">{item.tag}</span>
      </div>
      <span className="stack-sub-disc">{item.disc}</span>
      <div className="stack-progress-bar">
        <div className="stack-fill" style={{ width: `${item.pct}%` }} />
      </div>
    </div>
  ))
}

export default Resume
