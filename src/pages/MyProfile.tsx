import type { FC } from 'react'
import './MyProfile.css'
import {
  useMyProfile,
  INITIAL_PORTFOLIO_PROJECTS,
  INITIAL_EXPERIENCE,
  CDE_STANDARDS_TAGS,
  type SoftwareSkill,
  type PortfolioProject,
  type CredentialItem,
  type AttachedDocument,
} from './useMyProfile'

interface MyProfileProps {
  onNavigateToPortfolio?: () => void
}

const MyProfile: FC<MyProfileProps> = ({ onNavigateToPortfolio }) => {
  const {
    profile,
    editForm,
    setEditForm,
    isEditingProfile,
    startEditProfile,
    cancelEditProfile,
    saveProfileChanges,
    skills,
    documents,
    credentials,
    isViewerOpen,
    activeViewerProject,
    openModelViewer,
    closeModelViewer,
    handleCopyPublicUrl,
    toggleExclusiveOffers,
    handleUploadDocument,
    handleDownloadDoc,
    handleAddAssessment,
    handleAddCredential,
    toastMessage,
    showToast,
  } = useMyProfile()

  const authoringSkills = skills.filter((s: SoftwareSkill) => s.category === 'authoring')
  const computationalSkills = skills.filter((s: SoftwareSkill) => s.category === 'computational')

  return (
    <div className="my-profile-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="profile-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Top Header & Breadcrumb Bar */}
      <header className="profile-header-wrap">
        <div className="profile-header-left">
          <div className="profile-telemetry-row">
            <span className="talent-id-badge">TALENT_ID // {profile.talentId}</span>
            <span className="talent-verified-tag">
              <span className="pulse-dot" aria-hidden="true" />
              VERIFIED AEC PRACTITIONER | ISO-19650 CERTIFIED
            </span>
            <span className="schema-tag">SCHEMA: IFC4x3</span>
          </div>
          <div className="profile-title-row">
            <h1 className="profile-main-title">My Profile</h1>
            <span className="view-tag">[WORKSPACE VIEW]</span>
          </div>
          <p className="profile-subtext">
            Manage your professional BIM credentials, verified model portfolio, technical proficiency stack, and career availability telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions-row">
          <button
            type="button"
            className="btn-preview-public"
            onClick={handleCopyPublicUrl}
            aria-label="Preview public talent card"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview Public View
          </button>

          <button
            type="button"
            className="btn-edit-credentials"
            onClick={startEditProfile}
            aria-label="Edit Profile and Credentials"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Edit Profile & Credentials
          </button>
        </div>
      </header>

      {/* Main CAD Workstation 12-Column Layout */}
      <main className="profile-workstation-grid">
        {/* LEFT COLUMN: Core Profile, Software Matrix, Projects, Timeline (8 Cols) */}
        <section className="profile-main-stream" aria-label="Candidate Core Profile and Technical Matrix">
          {/* 1. Candidate Identity & Hero Glass Card */}
          <article className="profile-card hero-identity-card">
            <div className="blueprint-glow" aria-hidden="true" />
            <div className="hero-identity-wrap">
              {/* Avatar with Verified Status */}
              <div className="hero-avatar-wrap">
                <img
                  className="hero-avatar-img"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvvsw6HlzRt_VLqEpn1fvV9vVanYf-d6x7xup2bKJT9Hedon4Zj437ivwDxZ0tUY32W5A1r_RV9A2rIYEOAzP8adEO0_THlR7rLfkddxsBOm9BMdtDOiFRZyGf1QBNNTZt7wwGE0qbySzuDESX8VouxAsLhTROAtAqrPwBgX5On79vVXQnUzoVPLe-CO8U6XtlrRsf4lUChnsWH-ua3DGHJMzq45lLsWneMn9FPRK3W4GM11zAmScy5A"
                  alt={`Portrait of ${profile.fullName}`}
                />
                <div className="avatar-verified-badge" title="LOD 400 Verified Practitioner">
                  <div className="icon-inner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Identity Info */}
              <div className="hero-info-block">
                <div className="hero-status-row">
                  <span className="status-active-pill">
                    <span className="dot" aria-hidden="true" />
                    {profile.availabilityStatus}
                  </span>
                  <span className="status-master-pill">{profile.availabilityBadge}</span>
                </div>

                <div className="candidate-name-row">
                  <h2 className="candidate-name">
                    {profile.fullName},
                    <span className="candidate-credentials">{profile.credentialsSuffix}</span>
                  </h2>
                  <p className="candidate-headline">{profile.roleTitle}</p>
                </div>

                <div className="hero-meta-grid">
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{profile.location}</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span>{profile.experienceYears}</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span className="meta-salary">{profile.salaryExpectation}</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>{profile.citizenshipStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="hero-stats-strip">
              <div className="stat-metric-card">
                <div className="stat-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="stat-data">
                  <div className="stat-value-line">
                    <span className="stat-val-text">{profile.profileStrength}%</span>
                    <span className="stat-pill-sub">{profile.lodRating}</span>
                  </div>
                  <span className="stat-lbl-sub">Profile Strength</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="stat-data">
                  <div className="stat-value-line">
                    <span className="stat-val-text">{profile.searchImpressions}</span>
                    <span className="stat-pill-sub">{profile.searchImpressionsGrowth}</span>
                  </div>
                  <span className="stat-lbl-sub">Search Impressions</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
                <div className="stat-data">
                  <div className="stat-value-line">
                    <span className="stat-val-text">{profile.firmInquiries}</span>
                    <span className="stat-pill-sub alert">DIRECT</span>
                  </div>
                  <span className="stat-lbl-sub">Firm Inquiries</span>
                </div>
              </div>
            </div>
          </article>

          {/* 2. Verified BIM & Computational Software Stack */}
          <article className="profile-card">
            <div className="section-header-row">
              <div>
                <div className="section-tag-row">
                  <span className="section-tag-primary">TECHNICAL MATRIX</span>
                  <span className="section-tag-subtle">• LOD RATING & APIS</span>
                </div>
                <h3 className="section-card-title">Verified BIM & Computational Software Stack</h3>
              </div>
              <button
                type="button"
                className="btn-section-action"
                onClick={handleAddAssessment}
                aria-label="Add new technical assessment"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Add Assessment
              </button>
            </div>

            {/* Category A: Authoring & Clash Coordination */}
            <div className="skill-category-block">
              <div className="category-label-row">
                <span className="category-label">Authoring & Clash Coordination</span>
                <span className="category-sublabel">ISO-19650 ALIGNED</span>
              </div>
              <div className="tools-grid-2col">
                {authorSkillsMapping(authoringSkills)}
              </div>
            </div>

            {/* Category B: Computational & Algorithmic Engines */}
            <div className="skill-category-block">
              <div className="category-label-row">
                <span className="category-label">Computational & Algorithmic Engines</span>
                <span className="category-sublabel">PARAMETRIC AUTOMATION</span>
              </div>
              <div className="tools-grid-3col">
                {computationalSkills.map((skill: SoftwareSkill) => (
                  <div className="tool-meter-card" key={skill.id}>
                    <div className="tool-card-top">
                      <span className="tool-name-text">{skill.name}</span>
                      <span className="tool-score-num">{skill.score}%</span>
                    </div>
                    <div className="tool-ruler-progress">
                      <div className="tool-ruler-fill" style={{ width: `${skill.score}%` }} />
                    </div>
                    <span className="category-sublabel">{skill.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category C: CDE & Standards Badges */}
            <div className="skill-category-block">
              <span className="category-label">CDE Environments & Interoperability Standards</span>
              <div className="standards-tag-cloud">
                {CDE_STANDARDS_TAGS.map((tag: string) => (
                  <span className="standard-chip" key={tag}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* 3. Featured AEC Projects & Model Showcase */}
          <article className="profile-card">
            <div className="section-header-row">
              <div>
                <div className="section-tag-row">
                  <span className="section-tag-primary">PORTFOLIO REPOSITORY</span>
                  <span className="section-tag-subtle">• 3D FEDERATION VERIFIED</span>
                </div>
                <h3 className="section-card-title">Featured AEC Projects & Model Showcase</h3>
              </div>
              <button
                type="button"
                className="btn-section-action"
                onClick={() => {
                  if (onNavigateToPortfolio) onNavigateToPortfolio()
                  else showToast('Opening complete portfolio repository...')
                }}
              >
                Explore All 8 Verified Models →
              </button>
            </div>

            <div className="projects-mosaic-list">
              {INITIAL_PORTFOLIO_PROJECTS.map((proj: PortfolioProject) => (
                <div
                  key={proj.id}
                  className="project-showcase-item"
                  onClick={() => openModelViewer(proj)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openModelViewer(proj)
                    }
                  }}
                  aria-label={`Open 3D inspector for ${proj.title}`}
                >
                  <div className="project-thumb-frame">
                    <img src={proj.imageSrc} alt={proj.imageAlt} />
                    <span className="project-corner-badge">{proj.badge}</span>
                  </div>

                  <div className="project-meta-content">
                    <div className="project-title-bar">
                      <h4 className="project-main-title">{proj.title}</h4>
                      <span className="project-collab-tag">{proj.collaboration}</span>
                    </div>
                    <p className="project-summary-text">{proj.description}</p>
                    <div className="project-stack-tags">
                      <span className="stack-title-tag">STACK:</span>
                      {proj.stack.map((item) => (
                        <span className="stack-pill-mini" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WebGL Banner Action */}
            <div className="webgl-viewer-banner">
              <div className="webgl-banner-left">
                <div className="webgl-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div className="webgl-title-block">
                  <p className="webgl-title">Interactive 3D WebGL Model Viewer Enabled</p>
                  <p className="webgl-subtitle">Recruiters can spin, slice, and inspect Alex Morgan's IFC models live in browser.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-launch-viewer"
                onClick={() => openModelViewer(INITIAL_PORTFOLIO_PROJECTS[0])}
              >
                Launch Viewer
              </button>
            </div>
          </article>

          {/* 4. Professional Experience & Milestones Timeline */}
          <article className="profile-card">
            <div className="section-header-row">
              <div>
                <div className="section-tag-row">
                  <span className="section-tag-primary">TIMELINE MILESTONES</span>
                  <span className="section-tag-subtle">• CAREER EVOLUTION</span>
                </div>
                <h3 className="section-card-title">Professional Experience & Milestones</h3>
              </div>
              <span className="category-sublabel">7+ YRS ACTIVE</span>
            </div>

            <div className="career-timeline-wrap">
              {INITIAL_EXPERIENCE.map((exp) => (
                <div className="timeline-milestone-node" key={exp.id}>
                  <div className={`node-bullet ${exp.active ? 'active' : ''}`} aria-hidden="true" />
                  <div className="node-title-line">
                    <h4 className="node-role-title">{exp.role}</h4>
                    <span className="node-period-tag">{exp.period}</span>
                  </div>
                  <p className="node-company-line">
                    {exp.company} · {exp.location}
                  </p>
                  <p className="node-desc-text">{exp.description}</p>
                  <div className="node-tags-row">
                    {exp.tags.map((tag) => (
                      <span className="node-mini-pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* RIGHT COLUMN: Verification, Documents, Preferences & Telemetry (4 Cols) */}
        <aside className="profile-sidebar" aria-label="AEC Credentials, Documents, and Preferences">
          {/* 1. Verification & ISO Credentials Card */}
          <div className="profile-card">
            <div className="category-label-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h3 className="section-card-title" style={{ fontSize: '17px' }}>
                  Verified AEC Credentials
                </h3>
              </div>
              <span className="talent-id-badge" style={{ fontSize: '10.5px' }}>
                {credentials.length}/{credentials.length} VERIFIED
              </span>
            </div>

            <div className="sidebar-checklist">
              {credentials.map((cred: CredentialItem) => (
                <div className="credential-item-row" key={cred.id}>
                  <div className="cred-check-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="cred-text-block">
                    <p className="cred-title">{cred.title}</p>
                    <p className="cred-issuer">{cred.issuer}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-sidebar-block"
              onClick={handleAddCredential}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add License or Certification
            </button>
          </div>

          {/* 2. Quick Documents & Portfolio Attachments */}
          <div className="profile-card">
            <div className="category-label-row">
              <h3 className="section-card-title" style={{ fontSize: '17px' }}>
                Attached Documents
              </h3>
              <span className="category-sublabel">{documents.length} FILES</span>
            </div>

            <div className="documents-sidebar-list">
              {documents.map((doc: AttachedDocument) => (
                <div className="doc-sidebar-row" key={doc.id}>
                  <div className="doc-info-wrap">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="pdf-icon"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <div className="doc-text-block">
                      <p className="doc-name" title={doc.name}>
                        {doc.name}
                      </p>
                      <p className="doc-meta">
                        {doc.meta} · {doc.size}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="doc-action-btn"
                    onClick={() => handleDownloadDoc(doc.name)}
                    title={`Download ${doc.name}`}
                    aria-label={`Download ${doc.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-sidebar-block"
              onClick={handleUploadDocument}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload New BIM Document
            </button>
          </div>

          {/* 3. Career Preferences & Job Search Telemetry */}
          <div className="profile-card">
            <div className="category-label-row">
              <h3 className="section-card-title" style={{ fontSize: '17px' }}>
                Career Telemetry
              </h3>
              <span className="category-sublabel">CONFIDENTIAL</span>
            </div>

            <div className="telemetry-switch-row">
              <div className="telemetry-switch-text">
                <span className="telemetry-title">Exclusive Direct Offers</span>
                <span className="telemetry-sub">Visible to vetted AEC firms only</span>
              </div>
              <label className="toggle-switch" aria-label="Toggle direct offers visibility">
                <input
                  type="checkbox"
                  checked={profile.exclusiveDirectOffers}
                  onChange={toggleExclusiveOffers}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="telemetry-pref-group">
              <span className="pref-label">Target Roles</span>
              <div className="pref-pills-row">
                {profile.targetRoles.map((r: string) => (
                  <span className="pref-pill" key={r}>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="telemetry-pref-group">
              <span className="pref-label">Work Models</span>
              <div className="pref-pills-row">
                {profile.workModels.map((m: string) => (
                  <span className="pref-pill" key={m}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="telemetry-pref-group">
              <span className="pref-label">Target AEC Sectors</span>
              <div className="pref-pills-row">
                {profile.targetSectors.map((s: string) => (
                  <span className="pref-pill subtle" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="telemetry-pref-group">
              <span className="pref-label">Relocation / Mobility</span>
              <p className="category-sublabel" style={{ color: '#424753', margin: 0 }}>
                {profile.relocationMobility}
              </p>
            </div>
          </div>

          {/* 4. Public Profile Sharing & QR Passport */}
          <div className="profile-card">
            <div className="category-label-row">
              <h3 className="section-card-title" style={{ fontSize: '17px' }}>
                Public Talent Link
              </h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="#727784" strokeWidth="2" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>

            <div className="public-url-box">
              <span className="url-code-text">{profile.publicProfileUrl}</span>
              <button
                type="button"
                className="btn-copy-url"
                onClick={handleCopyPublicUrl}
                title="Copy URL"
                aria-label="Copy Public Talent Passport URL"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>

            <div className="qr-passport-row">
              <div className="simulated-qr" aria-hidden="true">
                <div className="qr-row">
                  <div className="qr-dot" />
                  <div className="qr-dot" />
                </div>
                <div className="qr-row" style={{ justifyContent: 'center' }}>
                  <div className="qr-dot dark" />
                </div>
                <div className="qr-row">
                  <div className="qr-dot" />
                  <div className="qr-dot dark" />
                </div>
              </div>
              <div className="qr-text-block">
                <span className="qr-title">Digital Card / CV QR</span>
                <span className="qr-desc">Scan directly for mobile BIM credential passport.</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Edit Profile Dialog Modal */}
      {isEditingProfile && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="profile-modal-dialog">
            <div className="modal-header">
              <h2 id="modal-title">Edit Profile & Credentials</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={cancelEditProfile}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Full Name</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">Certifications Suffix</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.credentialsSuffix}
                    onChange={(e) => setEditForm({ ...editForm, credentialsSuffix: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Professional Headline Role</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editForm.roleTitle}
                  onChange={(e) => setEditForm({ ...editForm, roleTitle: e.target.value })}
                />
              </div>

              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Location / Work Style</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">Compensation Range</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.salaryExpectation}
                    onChange={(e) => setEditForm({ ...editForm, salaryExpectation: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Availability Status</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editForm.availabilityStatus}
                  onChange={(e) => setEditForm({ ...editForm, availabilityStatus: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Relocation / Mobility Notes</label>
                <textarea
                  className="modal-textarea"
                  rows={3}
                  value={editForm.relocationMobility}
                  onChange={(e) => setEditForm({ ...editForm, relocationMobility: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-preview-public"
                onClick={cancelEditProfile}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-edit-credentials"
                onClick={saveProfileChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D WebGL Model Viewer Modal */}
      {isViewerOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="3D Model Viewer">
          <div className="webgl-modal-dialog">
            <div className="webgl-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'Hanken Grotesk' }}>
                  {activeViewerProject.title}
                </h3>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
                  IFC4x3 FEDERATED MODEL // {activeViewerProject.badge}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                style={{ color: '#fff' }}
                onClick={closeModelViewer}
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
                <span>ELEMENTS: 42,890 IFC ENTITIES</span>
                <span>LOD: 400 FABRICATION</span>
                <span>STATUS: NO ACTIVE CLASHES</span>
              </div>

              <div className="viewport-wireframe-sim">
                <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1" style={{ width: '64px', height: '64px' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>
                  [Interactive Orbit Mode Active]
                </span>
              </div>

              <div className="viewport-controls-bottom">
                <button type="button" className="viewport-btn" onClick={() => showToast('Section slice tool enabled.')}>
                  Section Slice
                </button>
                <button type="button" className="viewport-btn" onClick={() => showToast('Clash detection overlay toggled.')}>
                  Clash Overlay
                </button>
                <button type="button" className="viewport-btn" onClick={() => showToast('Discipline filter: Structural & MEP isolated.')}>
                  Filter Disciplines
                </button>
                <button type="button" className="viewport-btn" onClick={() => showToast('Reset camera view.')}>
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

function authorSkillsMapping(authoringSkills: SoftwareSkill[]) {
  return authoringSkills.map((skill: SoftwareSkill) => (
    <div className="tool-meter-card" key={skill.id}>
      <div className="tool-card-top">
        <div className="tool-badge-wrap">
          <div className={`tool-letter-badge ${skill.badgeColor}`}>{skill.badgeLetter}</div>
          <span className="tool-name-text">{skill.name}</span>
        </div>
        <span className="tool-score-num">{skill.score}%</span>
      </div>
      <div className="tool-ruler-progress">
        <div className="tool-ruler-fill" style={{ width: `${skill.score}%` }} />
      </div>
      <div className="tool-card-bottom">
        <span>{skill.description}</span>
        <span className="tool-status-pill">{skill.statusLabel}</span>
      </div>
    </div>
  ))
}

export default MyProfile
