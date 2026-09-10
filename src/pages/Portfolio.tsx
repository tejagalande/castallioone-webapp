import type { FC } from 'react'
import './Portfolio.css'
import {
  usePortfolio,
  SCRIPT_PACKAGES,
  ENDORSEMENTS,
  type ProjectAsset,
} from './usePortfolio'

interface PortfolioProps {
  onNavigateToFindJobs?: () => void
}

const Portfolio: FC<PortfolioProps> = () => {
  const {
    filteredProjects,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedSoftware,
    setSelectedSoftware,
    inspectionToggles,
    toggleToggle,
    activeViewerProject,
    viewerMode,
    setViewerMode,
    open3DViewer,
    close3DViewer,
    handleCopyLink,
    handleExportPackage,
    handleDownloadClashMatrix,
    toastMessage,
    showToast,
  } = usePortfolio()

  const categories = [
    { id: 'all', label: 'All Projects (8)' },
    { id: 'parametric', label: 'Parametric & Façade (3)' },
    { id: 'infrastructure', label: 'Infrastructure & Rail (2)' },
    { id: 'commercial', label: 'Commercial High-Rise (2)' },
    { id: 'timber', label: 'Timber & Sustainable (1)' },
  ]

  const softwareStack = ['All', 'Revit', 'Grasshopper', 'Navisworks', 'Solibri', 'Python', 'Synchro 4D']

  return (
    <div className="portfolio-page">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <aside className="portfolio-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Top Meta Breadcrumb & Technical Telemetry Strip */}
      <section className="portfolio-top-meta" aria-label="Portfolio Telemetry Breadcrumb">
        <div className="meta-crumb-left">
          <span className="talent-crumb-badge">
            <span className="pulse-primary" aria-hidden="true" />
            TALENT_WORKSPACE // PORTFOLIO-V2.6
          </span>
          <span>/</span>
          <span style={{ color: '#1a1c1e', fontWeight: 600 }}>BIM_PORTFOLIO_HUB</span>
          <span>/</span>
          <span>ALEX_MORGAN_VDC</span>
        </div>
        <div className="meta-crumb-right">
          <span className="capital-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            LOD 350-500 VERIFIED
          </span>
          <span className="capital-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            TOTAL DELIVERED CAPITAL: £640M+
          </span>
        </div>
      </section>

      {/* 2. Main Showcase Header Bar */}
      <header className="portfolio-header-card">
        <div className="header-card-content">
          <div className="header-card-tags">
            <span className="tag-accent-pill">Verified Project Repository</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              ISO 19650-2:2018 LEVEL 2 READY
            </span>
          </div>
          <h1 className="portfolio-hero-title">Technical Portfolio & Project Showcase</h1>
          <p className="portfolio-hero-desc">
            Curated architectural models, parametric façade scripts, BIM execution deliverables, and verified 3D IFC assets prepared for high-tier recruitment technical audits.
          </p>
        </div>

        <div className="header-action-suite">
          <button
            type="button"
            className="btn-portfolio-primary"
            onClick={() => showToast('Opening Project Upload & IFC Geometry Converter...')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Upload New Project
          </button>

          <button
            type="button"
            className="btn-portfolio-secondary"
            onClick={handleCopyLink}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share Public Link
          </button>

          <button
            type="button"
            className="btn-portfolio-secondary"
            onClick={handleExportPackage}
            title="Download Complete Package"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Package
          </button>
        </div>
      </header>

      {/* 3. Telemetry & Verification Strip (4 KPI Glass Cards) */}
      <section className="portfolio-kpi-grid" aria-label="Project Key Performance Indicators">
        <div className="portfolio-kpi-card">
          <div className="kpi-header-line">
            <span className="kpi-label-text">PROJECT VOLUME</span>
            <div className="kpi-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                <path d="M9 7h1" />
                <path d="M9 11h1" />
                <path d="M14 7h1" />
                <path d="M14 11h1" />
              </svg>
            </div>
          </div>
          <div className="kpi-data-block">
            <div className="kpi-number-row">
              <span className="kpi-number">8</span>
              <span className="kpi-tag">VERIFIED ASSETS</span>
            </div>
            <p className="kpi-desc">LOD 300 to LOD 500 across Commercial, Transit & Civic.</p>
          </div>
          <div className="kpi-footer-metric">
            <span>COORDINATION ACCURACY</span>
            <strong>99.8%</strong>
          </div>
        </div>

        <div className="portfolio-kpi-card">
          <div className="kpi-header-line">
            <span className="kpi-label-text">WEBGL BIM VIEWER</span>
            <div className="kpi-icon-box" style={{ background: '#bac9d3', color: '#0f1d25' }} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <div className="kpi-data-block">
            <div className="kpi-number-row">
              <span className="kpi-number">3</span>
              <span className="kpi-tag">INTERACTIVE IFCs</span>
            </div>
            <p className="kpi-desc">Direct in-browser spatial clash, slicing & metadata queries.</p>
          </div>
          <div className="kpi-footer-metric">
            <span>IFC4x3 COMPLIANT</span>
            <strong>READY</strong>
          </div>
        </div>

        <div className="portfolio-kpi-card">
          <div className="kpi-header-line">
            <span className="kpi-label-text">BIM DELIVERABLES</span>
            <div className="kpi-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
          </div>
          <div className="kpi-data-block">
            <div className="kpi-number-row">
              <span className="kpi-number">14</span>
              <span className="kpi-tag">EXECUTABLES</span>
            </div>
            <p className="kpi-desc">BEP specifications, clash matrices, Dynamo & pyRevit tools.</p>
          </div>
          <div className="kpi-footer-metric">
            <span>CODE REPOS LINKED</span>
            <strong>4 LIBS</strong>
          </div>
        </div>

        <div className="portfolio-kpi-card">
          <div className="kpi-header-line">
            <span className="kpi-label-text">RECRUITER VISIBILITY</span>
            <div className="kpi-icon-box" style={{ background: '#adc6ff', color: '#00418f' }} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          <div className="kpi-data-block">
            <div className="kpi-number-row">
              <span className="kpi-number">1,240+</span>
              <span className="kpi-tag growth">+18% 30D</span>
            </div>
            <p className="kpi-desc">Inspected by Foster + Partners, ZHA, Arup & Grimshaw teams.</p>
          </div>
          <div className="kpi-footer-metric">
            <span>RECENT INQUIRIES</span>
            <strong>6 FIRMS</strong>
          </div>
        </div>
      </section>

      {/* 4. Filter, Search & View Controls Bar */}
      <section className="portfolio-controls-console" aria-label="Portfolio Filters and Category Selection">
        <div className="controls-row-top">
          <div className="pills-scroll-bar" role="tablist" aria-label="Project typologies">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="search-input-wrap-mini">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by LOD, typology, software..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter project models"
            />
          </div>
        </div>

        <div className="controls-row-bottom">
          <div className="software-filter-chips">
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', textTransform: 'uppercase' }}>
              BIM ECOSYSTEM:
            </span>
            {softwareStack.map((soft) => (
              <button
                key={soft}
                type="button"
                className={`soft-chip-btn ${selectedSoftware === soft ? 'active' : ''}`}
                onClick={() => setSelectedSoftware(soft)}
              >
                {soft}
              </button>
            ))}
          </div>

          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
            SORT: RECENT FIRST ({filteredProjects.length} SHOWING)
          </span>
        </div>
      </section>

      {/* 5. Main 12-Cols Work Surface */}
      <main className="portfolio-work-surface">
        {/* LEFT MAIN GALLERY (8 COLS) */}
        <section className="portfolio-gallery-stream" aria-label="Projects Gallery">
          {filteredProjects.map((proj: ProjectAsset) => {
            if (proj.isFeatured) {
              return (
                <article className="featured-showcase-card" key={proj.id}>
                  {/* Card Header & Metadata */}
                  <div className="featured-card-header">
                    <div className="featured-top-badge-row">
                      <div className="featured-badge-group">
                        <span className="badge-featured-main">FEATURED CASE STUDY</span>
                        <span className="badge-subtle-lod">{proj.lodRating}</span>
                        <span className="badge-subtle-lod">ISO 19650 VERIFIED</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                          CAPITAL: {proj.capitalValue}
                        </span>
                      </div>
                      <div className="audit-pass-badge">
                        <span className="pulse-primary" aria-hidden="true" />
                        100% AUDIT PASS
                      </div>
                    </div>

                    <h2 className="featured-title">{proj.title}</h2>
                    <p className="featured-subtitle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                      </svg>
                      {proj.subtitle}
                    </p>
                  </div>

                  {/* 3D BIM Viewer Simulation Box */}
                  <div className="bim-viewer-simulation-box">
                    <img className="viewer-bg-img" src={proj.imageSrc} alt={proj.imageAlt} />

                    <div className="viewer-overlay-ui-top">
                      <div className="telemetry-chip-dark">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          <polyline points="2 17 12 22 22 17" />
                          <polyline points="2 12 12 17 22 12" />
                        </svg>
                        <span>VIEWER: WEBGL_IFC4_STREAMING [FLOORS 18-38]</span>
                      </div>
                      <div className="telemetry-chip-dark">
                        <span>TOLERANCE: 0.00mm | 60 FPS</span>
                      </div>
                    </div>

                    <div className="viewer-overlay-ui-bottom">
                      <div className="viewer-controls-cluster">
                        <button
                          type="button"
                          className="btn-viewer-ctrl"
                          onClick={() => open3DViewer(proj, 'orbit')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                          </svg>
                          3D Orbit
                        </button>
                        <button
                          type="button"
                          className="btn-viewer-ctrl"
                          onClick={() => open3DViewer(proj, 'slice')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <line x1="2" y1="12" x2="22" y2="12" />
                          </svg>
                          Section Cut
                        </button>
                        <button
                          type="button"
                          className="btn-viewer-ctrl"
                          onClick={() => open3DViewer(proj, 'wireframe')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="3" y1="15" x2="21" y2="15" />
                            <line x1="9" y1="3" x2="9" y2="21" />
                            <line x1="15" y1="3" x2="15" y2="21" />
                          </svg>
                          Wireframe
                        </button>
                        <button
                          type="button"
                          className="btn-viewer-ctrl"
                          onClick={() => open3DViewer(proj, 'clash')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          Clashes
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-launch-fullscreen"
                        onClick={() => open3DViewer(proj, 'orbit')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
                        Launch Fullscreen 3D CDE
                      </button>
                    </div>
                  </div>

                  {/* Metrics & Narrative Excerpt */}
                  <div className="featured-details-body">
                    <div className="metrics-strip-3col">
                      <div className="metric-strip-box">
                        <span className="metric-strip-lbl">CLASH REDUCTION</span>
                        <span className="metric-strip-val accent">{proj.hardClashesResolved}+ Hard Clashes</span>
                        <span className="metric-strip-sub">Zero onsite rework delays</span>
                      </div>
                      <div className="metric-strip-box">
                        <span className="metric-strip-lbl">AUTOMATION GAIN</span>
                        <span className="metric-strip-val">{proj.velocityLift}</span>
                        <span className="metric-strip-sub">Custom Python pyRevit ribbon</span>
                      </div>
                      <div className="metric-strip-box">
                        <span className="metric-strip-lbl">COORDINATED ASSETS</span>
                        <span className="metric-strip-val">{proj.totalUnits}</span>
                        <span className="metric-strip-sub">Curtain wall panels & brackets</span>
                      </div>
                    </div>

                    <p className="featured-narrative">{proj.description}</p>

                    <div className="featured-stack-pills">
                      {proj.stack.map((s) => (
                        <span className="stack-pill-hero" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="featured-card-footer">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-portfolio-primary"
                          onClick={() => open3DViewer(proj)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          View IFC Model
                        </button>
                        <button
                          type="button"
                          className="btn-portfolio-secondary"
                          onClick={handleDownloadClashMatrix}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          Clash Matrix Report
                        </button>
                      </div>

                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#00418f', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                        onClick={() => open3DViewer(proj)}
                      >
                        Read Full Technical Case Study →
                      </button>
                    </div>
                  </div>
                </article>
              )
            }

            return (
              <article className="standard-project-card" key={proj.id}>
                <div className="card-top-title-row">
                  <div className="card-badge-row">
                    <span className="badge-featured-main" style={{ background: '#39464f' }}>
                      {proj.categoryLabel.toUpperCase()}
                    </span>
                    <span className="badge-subtle-lod">{proj.lodRating}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                      VALUE: {proj.capitalValue}
                    </span>
                    {proj.carbonReduction && (
                      <span className="badge-subtle-lod" style={{ color: '#00418f', fontWeight: 700 }}>
                        CARBON: {proj.carbonReduction}
                      </span>
                    )}
                  </div>
                  <h3 className="card-title-main">{proj.title}</h3>
                  <p className="card-role-sub">{proj.subtitle}</p>
                </div>

                <div className="card-split-content">
                  <div className="card-thumb-frame">
                    <img src={proj.imageSrc} alt={proj.imageAlt} />
                    <span className="thumb-tag-badge">IFC4 ALIGNED</span>
                  </div>

                  <div className="card-meta-narrative">
                    <p className="card-desc-text">{proj.description}</p>
                    <div className="featured-stack-pills">
                      {proj.stack.map((s) => (
                        <span className="stack-pill-hero" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-action-bar">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-portfolio-secondary"
                      onClick={() => open3DViewer(proj)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                      Explore 3D Model
                    </button>
                    <button
                      type="button"
                      className="btn-portfolio-secondary"
                      onClick={() => showToast(`Opening technical specification for ${proj.title}...`)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      BEP Spec
                    </button>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                    AUDITED 2024-Q3
                  </span>
                </div>
              </article>
            )
          })}
        </section>

        {/* RIGHT SIDEBAR: RECRUITER AUDIT TOOLS & TELEMETRY (4 COLS) */}
        <aside className="portfolio-inspector-sidebar" aria-label="3D Model Inspector and Verification">
          {/* 1. Recruiter 3D Audit Tools */}
          <div className="portfolio-side-panel">
            <div className="side-panel-header">
              <div className="side-panel-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <h4 className="side-panel-title">Recruiter 3D Audit Tools</h4>
              </div>
              <span className="badge-subtle-lod" style={{ color: '#00418f', fontWeight: 700 }}>
                ACTIVE
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#424753', margin: 0 }}>
              Recruiters and Lead BIM Managers can toggle live inspection layers across all hosted projects:
            </p>

            <div className="inspection-toggles-list">
              <label className="inspection-toggle-row">
                <div className="toggle-row-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="6" y1="8" x2="6" y2="16" />
                    <line x1="18" y1="8" x2="18" y2="16" />
                  </svg>
                  <div className="toggle-text-block">
                    <span className="toggle-name">Slice & Point Measure</span>
                    <span className="toggle-subtext">Real-time IFC millimeter snap</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={inspectionToggles.sliceMeasure}
                  onChange={() => toggleToggle('sliceMeasure')}
                />
              </label>

              <label className="inspection-toggle-row">
                <div className="toggle-row-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                  <div className="toggle-text-block">
                    <span className="toggle-name">Wireframe / Shaded Mode</span>
                    <span className="toggle-subtext">Evaluate polygon density</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={inspectionToggles.wireframeShaded}
                  onChange={() => toggleToggle('wireframeShaded')}
                />
              </label>

              <label className="inspection-toggle-row">
                <div className="toggle-row-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#b3272d" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="toggle-text-block">
                    <span className="toggle-name">Clash Cluster Heatmaps</span>
                    <span className="toggle-subtext">Highlight collisions &gt; 5mm</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={inspectionToggles.clashHeatmaps}
                  onChange={() => toggleToggle('clashHeatmaps')}
                />
              </label>
            </div>

            <button
              type="button"
              className="btn-portfolio-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleDownloadClashMatrix}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Sample Clash Matrix (.CSV)
            </button>
          </div>

          {/* 2. Computational Script Repository */}
          <div className="portfolio-side-panel">
            <div className="side-panel-header">
              <div className="side-panel-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <h4 className="side-panel-title">Script & Automation Repo</h4>
              </div>
              <span className="badge-subtle-lod" style={{ color: '#00418f', fontWeight: 700 }}>
                4 PACKAGES
              </span>
            </div>

            <div className="scripts-repo-list">
              {SCRIPT_PACKAGES.map((pkg) => (
                <div className="script-repo-box" key={pkg.id}>
                  <div className="script-top-bar">
                    <span className="script-name">{pkg.fileName}</span>
                    <span className="script-stars">★ {pkg.stars}</span>
                  </div>
                  <p className="script-desc">{pkg.description}</p>
                  <div className="script-footer-bar">
                    <span>{pkg.specs}</span>
                    <span
                      className="script-link"
                      onClick={() => showToast(`Opening ${pkg.fileName} in Castallio Code Viewer...`)}
                    >
                      {pkg.urlText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Verified Firm Endorsements */}
          <div className="portfolio-side-panel">
            <div className="side-panel-header">
              <div className="side-panel-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h4 className="side-panel-title">Verified Firm Endorsements</h4>
              </div>
              <span className="badge-subtle-lod" style={{ color: '#00418f', fontWeight: 700 }}>
                2 SIGN-OFFS
              </span>
            </div>

            <div className="scripts-repo-list">
              {ENDORSEMENTS.map((end) => (
                <div className="endorsement-box" key={end.id}>
                  <div className="endorsement-top">
                    <div className="endorsement-firm">
                      <div className={`firm-initial-badge ${end.badgeColor}`}>{end.initial}</div>
                      <span>{end.firmName}</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="endorsement-quote">{end.quote}</p>
                  <span className="endorsement-signer">{end.signer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Portfolio Sharing & Access Control */}
          <div className="portfolio-side-panel">
            <div className="side-panel-header">
              <div className="side-panel-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <h4 className="side-panel-title">Sharing & Access Controls</h4>
              </div>
            </div>

            <div className="inspection-toggles-list">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="toggle-subtext">PUBLIC RECRUITER PASS LINK</span>
                <div style={{ display: 'flex', gap: '6px', background: '#f3f3f6', padding: '6px', borderRadius: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value="castallio.one/p/alex-morgan-bim"
                    style={{ background: 'transparent', border: 'none', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', width: '100%', outline: 'none', fontWeight: 600 }}
                  />
                  <button
                    type="button"
                    className="btn-portfolio-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={handleCopyLink}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <label className="inspection-toggle-row">
                <span style={{ fontSize: '12.5px', color: '#1a1c1e' }}>Watermark Drawings & Models</span>
                <input
                  type="checkbox"
                  checked={inspectionToggles.watermarkDrawings}
                  onChange={() => toggleToggle('watermarkDrawings')}
                />
              </label>

              <label className="inspection-toggle-row">
                <span style={{ fontSize: '12.5px', color: '#1a1c1e' }}>Require Recruiter NDA for IFC Download</span>
                <input
                  type="checkbox"
                  checked={inspectionToggles.requireNDA}
                  onChange={() => toggleToggle('requireNDA')}
                />
              </label>
            </div>

            <button
              type="button"
              className="btn-portfolio-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleExportPackage}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Portfolio Package (PDF + ZIP)
            </button>
          </div>
        </aside>
      </main>

      {/* 3D WebGL Model Viewer Modal */}
      {activeViewerProject && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="3D IFC Model Viewer">
          <div className="webgl-modal-dialog">
            <div className="webgl-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'Hanken Grotesk' }}>
                  {activeViewerProject.title}
                </h3>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
                  IFC4x3 FEDERATED MODEL // {activeViewerProject.lodRating} // {activeViewerProject.capitalValue}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                style={{ color: '#fff' }}
                onClick={close3DViewer}
                aria-label="Close 3D viewer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="webgl-viewport">
              <div className="viewport-overlay-ui">
                <span>FPS: 60.0 (WebGL2)</span>
                <span>MODE: {viewerMode.toUpperCase()}</span>
                <span>ASSETS: 42,890 IFC ENTITIES</span>
                <span>TOLERANCE: 0.00mm</span>
              </div>

              <div className="viewport-wireframe-sim">
                <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1" style={{ width: '64px', height: '64px' }}>
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>
                  [Interactive 3D WebGL Viewport Active]
                </span>
              </div>

              <div className="viewport-controls-bottom">
                <button
                  type="button"
                  className={`viewport-btn ${viewerMode === 'orbit' ? 'active' : ''}`}
                  onClick={() => setViewerMode('orbit')}
                >
                  3D Orbit
                </button>
                <button
                  type="button"
                  className={`viewport-btn ${viewerMode === 'slice' ? 'active' : ''}`}
                  onClick={() => setViewerMode('slice')}
                >
                  Section Cut
                </button>
                <button
                  type="button"
                  className={`viewport-btn ${viewerMode === 'wireframe' ? 'active' : ''}`}
                  onClick={() => setViewerMode('wireframe')}
                >
                  Wireframe
                </button>
                <button
                  type="button"
                  className={`viewport-btn ${viewerMode === 'clash' ? 'active' : ''}`}
                  onClick={() => setViewerMode('clash')}
                >
                  Clash Heatmap
                </button>
                <button
                  type="button"
                  className="viewport-btn"
                  onClick={() => showToast('Resetting 3D camera to default isometric.')}
                >
                  Reset Camera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio
