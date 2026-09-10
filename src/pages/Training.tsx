import type { FC } from 'react'
import './Training.css'
import {
  useTraining,
  type CourseItem,
  type CourseModule,
  type LearningPathStep,
} from './useTraining'

interface TrainingProps {
  onNavigateToFindJobs?: () => void
}

const Training: FC<TrainingProps> = () => {
  const {
    courses,
    filteredCourses,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filterFreeForPro,
    setFilterFreeForPro,
    filterBuildingSmart,
    setFilterBuildingSmart,
    filterUnder10h,
    setFilterUnder10h,
    filterWithSandbox,
    setFilterWithSandbox,
    pathSteps,
    workshop,
    selectedCourseForPreview,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isCreditModalOpen,
    setIsCreditModalOpen,
    isSandboxModalOpen,
    setIsSandboxModalOpen,
    creditCodeInput,
    setCreditCodeInput,
    terminalLines,
    toastMessage,
    showToast,
    handleEnrollCourse,
    handleOpenPreview,
    handleReserveWorkshopSeat,
    handleLaunchSandbox,
    handleRedeemCredit,
    handleAddPath,
  } = useTraining()

  const flagshipCourse = courses.find((c) => c.isFlagship) || courses[0]

  return (
    <div className="training-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="trn-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Telemetry Ribbon Bar */}
      <section className="trn-telemetry-strip" aria-label="AEC Academy Telemetry">
        <div className="trn-telemetry-left">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00418f', fontWeight: 600 }}>
            <span className="pulse-dot-trn" aria-hidden="true" />
            TALENT_WORKSPACE // ACADEMY-LEARNING-V2.8
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#39464f' }}>CONTINUOUS ACCREDITATION ENGINE</span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#424753' }}>RECOGNISED BY buildingSMART &amp; UK BIM FRAMEWORK</span>
        </div>

        <div className="trn-telemetry-right">
          <span style={{ color: '#424753' }}>SKILL GRAPH SYNC:</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '2px 10px', borderRadius: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700 }}>94.2%</span>
            <svg viewBox="0 0 24 24" fill="#00418f" stroke="#00418f" strokeWidth="1" style={{ width: '13px', height: '13px' }} aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      </section>

      {/* 2. Page Header & Action Controls */}
      <header className="trn-header-section">
        <div className="trn-title-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="trn-radar-badge">ISO 19650 &amp; OpenBIM Core</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>REV // 2025.Q1</span>
          </div>
          <h1 className="trn-main-heading">AEC Technical Training &amp; Certifications</h1>
          <p className="trn-lead-description">
            Upskill in computational design, ISO 19650 workflows, LOD-400 fabrication modeling, and API development with verified Castallio Masterclasses and accredited partner curricula.
          </p>
        </div>

        <div className="trn-action-cluster">
          <button
            type="button"
            className="btn-trn-light"
            onClick={() => {
              setActiveCategory('all')
              setSearchQuery('')
              showToast('Browsing full AEC course catalog.')
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Browse Full Catalog</span>
          </button>

          <button
            type="button"
            className="btn-trn-light"
            onClick={() => {
              setActiveCategory('recommended')
              showToast('Filtered 3 active enrolled courses.')
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#0058bc" strokeWidth="2" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>My Enrolled Courses (3)</span>
          </button>

          <button
            type="button"
            className="btn-trn-primary"
            onClick={() => setIsCreditModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>+ Redeem Firm Training Credit</span>
          </button>
        </div>
      </header>

      {/* 3. Learning Metric Cards (4 Cards) */}
      <section className="trn-metrics-grid" aria-label="Learning Metrics">
        {/* Card 1 */}
        <article className="trn-metric-card">
          <div className="trn-metric-top">
            <div>
              <span className="trn-metric-lbl">Active Tracks</span>
              <div className="trn-metric-huge-val">3 Active</div>
            </div>
            <div className="trn-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
            </div>
          </div>
          <div className="trn-metric-bottom-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#424753', fontWeight: 500 }}>Cohort Completion</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700 }}>82% Avg</span>
            </div>
            <div className="trn-progress-track">
              <div className="trn-progress-fill" style={{ width: '82%' }} />
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Next: Grasshopper FEA Automation
            </span>
          </div>
        </article>

        {/* Card 2 */}
        <article className="trn-metric-card">
          <div className="trn-metric-top">
            <div>
              <span className="trn-metric-lbl">Verified CPD / CEU</span>
              <div className="trn-metric-huge-val">
                48 / 60 <span style={{ fontSize: '14px', color: '#727784', fontWeight: 400 }}>Hrs</span>
              </div>
            </div>
            <div className="trn-metric-icon-box tertiary" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
          </div>
          <div className="trn-metric-bottom-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#424753', fontWeight: 500 }}>RIBA / CanBIM Target</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#39464f', fontWeight: 700 }}>80% Reached</span>
            </div>
            <div className="trn-progress-track">
              <div className="trn-progress-fill" style={{ width: '80%', background: '#39464f' }} />
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>
              12 Hrs remaining for 2025 Cycle
            </span>
          </div>
        </article>

        {/* Card 3 */}
        <article className="trn-metric-card">
          <div className="trn-metric-top">
            <div>
              <span className="trn-metric-lbl">Talent Match Expansion</span>
              <div className="trn-metric-huge-val" style={{ color: '#00418f' }}>+18.4%</div>
            </div>
            <div className="trn-metric-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <div className="trn-metric-bottom-box">
            <span style={{ fontSize: '11px', color: '#727784', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>
              Role Eligibility Unlocked:
            </span>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '15px', height: '15px' }} aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              14 Tier-1 Roles (Foster, ZHA, Arup)
            </p>
          </div>
        </article>

        {/* Card 4 */}
        <article className="trn-metric-card">
          <div className="trn-metric-top">
            <div>
              <span className="trn-metric-lbl">Castallio Pro Credits</span>
              <div className="trn-metric-huge-val">
                450 <span style={{ fontSize: '14px', color: '#727784', fontWeight: 400 }}>CR</span>
              </div>
            </div>
            <div className="trn-metric-icon-box secondary" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M6 12h12" />
              </svg>
            </div>
          </div>
          <div className="trn-metric-bottom-box" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1c1e', display: 'block' }}>1 Voucher Ready</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>1 Masterclass Value</span>
            </div>
            <button
              type="button"
              className="btn-trn-light"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              onClick={() => setIsCreditModalOpen(true)}
            >
              Apply
            </button>
          </div>
        </article>
      </section>

      {/* 4. Main Content Grid (12 cols) */}
      <main className="trn-main-workspace-grid">
        {/* LEFT COLUMN: 8 Columns */}
        <div className="trn-left-col">
          {/* Flagship Masterclass Banner */}
          <article className="flagship-banner-card" aria-labelledby="flagship-heading">
            <div className="flagship-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="trn-radar-badge" style={{ background: '#00418f', color: '#ffffff' }}>
                  CASTALLIO MASTERCLASS // EXECUTIVE SERIES
                </span>
                <span className="trn-radar-badge" style={{ background: '#d8e2ff', color: '#00418f' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }} aria-hidden="true">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Flagship
                </span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                BATCH #2025-Q1 // LIMITED COHORT
              </span>
            </div>

            <div>
              <h2 className="flagship-title-text" id="flagship-heading">
                {flagshipCourse.title}
              </h2>
              {flagshipCourse.instructor && (
                <div className="instructor-row-wrap" style={{ marginTop: '10px' }}>
                  <div className="instructor-avatar-circle">
                    {flagshipCourse.instructor.initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1a1c1e' }}>
                      {flagshipCourse.instructor.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#727784' }}>
                      {flagshipCourse.instructor.title}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Badges Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
              <span className="course-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#00418f', fontWeight: 600 }}>
                <svg viewBox="0 0 24 24" fill="#00418f" stroke="#00418f" strokeWidth="1" style={{ width: '13px', height: '13px' }} aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Official Castallio Certification
              </span>
              <span className="course-tag-pill">ISO 19650-2 Aligned</span>
              <span className="course-tag-pill" style={{ color: '#b3272d', fontWeight: 600 }}>
                CEU: 18 Hours
              </span>
              <span className="course-tag-pill" style={{ color: '#00418f', fontWeight: 700 }}>
                Level: Advanced
              </span>
            </div>

            <p style={{ fontSize: '13.5px', lineHeight: '21px', color: '#424753', margin: 0 }}>
              {flagshipCourse.description}
            </p>

            {/* 4 Highlights Checklist */}
            <div className="flagship-highlights-grid">
              <div className="highlight-bullet-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>8 Comprehensive Modules</span>
              </div>
              <div className="highlight-bullet-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <span>Live 3D Sandbox Terminal</span>
              </div>
              <div className="highlight-bullet-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <span>Real Grimshaw / Foster Project Data</span>
              </div>
              <div className="highlight-bullet-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09" />
                </svg>
                <span>Direct Recruiter Ledger Verification</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <button
                type="button"
                className="btn-trn-primary"
                onClick={() => handleEnrollCourse(flagshipCourse.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                <span>Enroll with 1-Click • Free with Pro Membership</span>
              </button>

              <button
                type="button"
                className="btn-trn-light"
                onClick={() => handleOpenPreview(flagshipCourse)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Preview Syllabus &amp; Sandbox</span>
              </button>
            </div>
          </article>

          {/* Filter & Category Selector Tabs */}
          <div className="trn-filter-container">
            <div className="trn-category-tabs-scroll" role="tablist">
              <button
                type="button"
                className={`trn-cat-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Courses (42)
              </button>
              <button
                type="button"
                className={`trn-cat-tab-btn ${activeCategory === 'recommended' ? 'active' : ''}`}
                onClick={() => setActiveCategory('recommended')}
              >
                Recommended by Castallio (6)
              </button>
              <button
                type="button"
                className={`trn-cat-tab-btn ${activeCategory === 'computational' ? 'active' : ''}`}
                onClick={() => setActiveCategory('computational')}
              >
                Computational Design (12)
              </button>
              <button
                type="button"
                className={`trn-cat-tab-btn ${activeCategory === 'bim-iso' ? 'active' : ''}`}
                onClick={() => setActiveCategory('bim-iso')}
              >
                BIM &amp; ISO 19650 (10)
              </button>
              <button
                type="button"
                className={`trn-cat-tab-btn ${activeCategory === 'vdc-synchro' ? 'active' : ''}`}
                onClick={() => setActiveCategory('vdc-synchro')}
              >
                4D/5D VDC &amp; Synchro (8)
              </button>
              <button
                type="button"
                className={`trn-cat-tab-btn ${activeCategory === 'revit-python' ? 'active' : ''}`}
                onClick={() => setActiveCategory('revit-python')}
              >
                Revit API &amp; Python (6)
              </button>
            </div>

            <div className="trn-search-filter-box">
              <div className="trn-search-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', color: '#727784' }} aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search technical topics, software (Grasshopper, Speckle, Solibri), or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search courses"
                />
              </div>

              <div className="trn-chips-filter-row">
                <button
                  type="button"
                  className={`trn-quick-chip ${filterFreeForPro ? 'active' : ''}`}
                  onClick={() => setFilterFreeForPro(!filterFreeForPro)}
                >
                  <span className="pulse-dot-trn" style={{ width: '5px', height: '5px' }} aria-hidden="true" />
                  Free for Pro
                </button>

                <button
                  type="button"
                  className={`trn-quick-chip ${filterBuildingSmart ? 'active' : ''}`}
                  onClick={() => setFilterBuildingSmart(!filterBuildingSmart)}
                >
                  buildingSMART Certified
                </button>

                <button
                  type="button"
                  className={`trn-quick-chip ${filterUnder10h ? 'active' : ''}`}
                  onClick={() => setFilterUnder10h(!filterUnder10h)}
                >
                  Under 10 Hours
                </button>

                <button
                  type="button"
                  className={`trn-quick-chip ${filterWithSandbox ? 'active' : ''}`}
                  onClick={() => setFilterWithSandbox(!filterWithSandbox)}
                >
                  With Sandbox
                </button>
              </div>
            </div>
          </div>

          {/* Curated Courses List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h3 style={{ fontFamily: 'Hanken Grotesk', fontSize: '17px', fontWeight: 700, margin: 0, color: '#1a1c1e' }}>
                  Recommended by Castallio AI — Curated for Alex Morgan
                </h3>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                ENGINE: TALENT-VECTOR-MATCH // V2.4
              </span>
            </div>

            {filteredCourses.map((course: CourseItem) => (
              <article className="trn-course-card" key={course.id}>
                <div className="course-top-title-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                      <span style={{ textTransform: 'uppercase' }}>{course.provider}</span>
                      {course.collaboration && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#39464f', fontWeight: 600 }}>{course.collaboration}</span>
                        </>
                      )}
                    </div>
                    <h4 className="course-card-heading">{course.title}</h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {course.matchScore && (
                      <span className="trn-radar-badge" style={{ background: '#d8e2ff', color: '#00418f', fontSize: '11px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        {course.matchScore}% Match
                      </span>
                    )}

                    {course.progressPercent !== undefined && (
                      <span className="trn-radar-badge" style={{ background: '#eeeef0', color: '#1a1c1e', fontSize: '11px' }}>
                        {course.progressPercent}% Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Reason Callout */}
                {course.matchReason && (
                  <div className="ai-reason-callout">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px', flexShrink: 0 }} aria-hidden="true">
                      <path d="M12 2a10 10 0 0 1 10 10c0 4.42-3.58 8-8 8v2c0 .55-.45 1-1 1s-1-.45-1-1v-2a8 8 0 0 1-8-8c0-5.52 4.48-10 10-10z" />
                    </svg>
                    <span><strong>AI Insight:</strong> {course.matchReason}</span>
                  </div>
                )}

                {/* Stacks */}
                <div className="course-meta-tags-line">
                  {course.stacks.map((st, i) => (
                    <span className="course-tag-pill" key={i}>{st}</span>
                  ))}
                </div>

                {/* Progress bar if present */}
                {course.progressPercent !== undefined && (
                  <div className="trn-progress-track" style={{ height: '7px' }}>
                    <div className="trn-progress-fill" style={{ width: `${course.progressPercent}%` }} />
                  </div>
                )}

                {/* Footer stats & Action */}
                <div className="course-bottom-actions-row">
                  <div className="course-stats-cluster">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {course.totalHours}h Total
                    </span>
                    <span>•</span>
                    <span>{course.modulesCount} Modules</span>
                    <span>•</span>
                    <span>{course.cpdPoints} CPD Points</span>
                    <span>•</span>
                    <span style={{ color: '#1a1c1e', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      ★ {course.rating} ({course.reviewsCount})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-trn-light"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleAddPath(course.title)}
                    >
                      + Add to Path
                    </button>

                    <button
                      type="button"
                      className="btn-trn-primary"
                      style={{ padding: '6px 16px', fontSize: '12px' }}
                      onClick={() => {
                        if (course.isEnrolled) {
                          handleOpenPreview(course)
                        } else {
                          handleEnrollCourse(course.id)
                        }
                      }}
                    >
                      {course.isEnrolled ? `Resume Learning (${course.progressPercent ?? 0}%)` : 'Enroll Free (Pro)'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Columns (Intelligence, Learning Track & Credential Sync) */}
        <aside className="trn-right-col">
          {/* 1. Learning Pathway: BIM Director Track */}
          <article className="trn-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="trn-radar-badge" style={{ fontSize: '10px' }}>Curated Pathway</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>TIER // DIRECTOR</span>
            </div>

            <div>
              <h3 className="trn-sidebar-title">BIM Director Track</h3>
              <p style={{ fontSize: '12.5px', color: '#424753', margin: '4px 0 0' }}>
                Structured 4-step specialization leading to enterprise governance roles.
              </p>
            </div>

            {/* Timeline Steps */}
            <div className="pathway-steps-list">
              {pathSteps.map((step: LearningPathStep) => (
                <div className="path-step-row" key={step.id}>
                  <div className={`step-num-circle ${step.status}`}>
                    {step.status === 'done' ? '✓' : `0${step.id}`}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#1a1c1e' }}>{step.title}</strong>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: step.status === 'done' ? '#00418f' : '#727784', fontWeight: 700 }}>
                        {step.subtext}
                      </span>
                    </div>
                    {step.progressPercent !== undefined && (
                      <div className="trn-progress-track" style={{ height: '4px', margin: '3px 0' }}>
                        <div className="trn-progress-fill" style={{ width: `${step.progressPercent}%` }} />
                      </div>
                    )}
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>
                      {step.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#d8e2ff', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg viewBox="0 0 24 24" fill="#00418f" stroke="#00418f" strokeWidth="1" style={{ width: '22px', height: '22px', flexShrink: 0 }} aria-hidden="true">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
              <div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#001a41', fontWeight: 700, display: 'block' }}>
                  UNLOCKS $150K+ SALARY BENCHMARK
                </span>
                <span style={{ fontSize: '11.5px', color: '#00418f' }}>
                  Estimated completion: ~4 weeks with active cadence
                </span>
              </div>
            </div>
          </article>

          {/* 2. Sandbox Lab Environment Widget */}
          <article className="trn-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', textTransform: 'uppercase', fontWeight: 700 }}>
                Virtual Modeling Pod
              </span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#00418f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot-trn" aria-hidden="true" />
                RTX 4090 CLOUD GPU
              </span>
            </div>

            <div>
              <h3 className="trn-sidebar-title">Castallio Sandbox Lab</h3>
              <p style={{ fontSize: '12.5px', color: '#424753', margin: '4px 0 0' }}>
                Spin up an instant browser-based development station with pre-configured toolchains.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', textTransform: 'uppercase', color: '#727784' }}>
                Installed Kernels &amp; Runtimes:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', fontFamily: 'JetBrains Mono', fontSize: '10.5px' }}>
                <span className="course-tag-pill">pyRevit 4.8.14</span>
                <span className="course-tag-pill">Python 3.10 AEC</span>
                <span className="course-tag-pill">Rhino.Inside v1.12</span>
                <span className="course-tag-pill">Speckle CLI</span>
                <span className="course-tag-pill">Solibri Mock API</span>
              </div>
            </div>

            {/* Visual Terminal Window */}
            <div className="terminal-window-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#727784', borderBottom: '1px solid #424753', paddingBottom: '3px', marginBottom: '4px' }}>
                <span>TERMINAL // POD-ALPHA-04</span>
                <span style={{ color: '#00418f' }}>LATENCY: 14ms</span>
              </div>
              <div style={{ color: '#adc6ff' }}>$ import pyrevit.forms as forms</div>
              <div style={{ color: '#adc6ff' }}>$ speckle_client.authenticate_session(AUTH_TOKEN)</div>
              <div style={{ color: '#c2c6d5' }}>&gt;&gt; Geometry stream linked: IFC4x3_AIRPORT_TERMINAL_B.ifc</div>
            </div>

            <button
              type="button"
              className="btn-trn-primary"
              style={{ justifyContent: 'center' }}
              onClick={handleLaunchSandbox}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span>Launch 3D WebGL Lab Environment</span>
            </button>
          </article>

          {/* 3. Live Masterclasses & Workshops */}
          <article className="trn-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="trn-radar-badge" style={{ background: '#ffdad7', color: '#b3272d' }}>
                LIVE WORKSHOP
              </span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                {workshop.dateText}
              </span>
            </div>

            <div>
              <h4 className="trn-sidebar-title">{workshop.title}</h4>
              <p style={{ fontSize: '12.5px', color: '#424753', margin: '4px 0 0' }}>
                {workshop.description}
              </p>
            </div>

            <div style={{ background: '#f3f3f6', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>
                {workshop.seatsRemaining} Seats Remaining
              </span>
              <span className="trn-radar-badge" style={{ fontSize: '10px' }}>FREE FOR PRO</span>
            </div>

            <button
              type="button"
              className="btn-trn-light"
              style={{ justifyContent: 'center', fontWeight: 700 }}
              onClick={handleReserveWorkshopSeat}
            >
              {workshop.isReserved ? '✓ Seat Reserved (Check Calendar)' : 'Reserve Seat Now'}
            </button>
          </article>

          {/* 4. Recognized Industry Credentials */}
          <article className="trn-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', textTransform: 'uppercase', color: '#727784', fontWeight: 700 }}>
                Accreditation Network
              </span>
              <svg viewBox="0 0 24 24" fill="#00418f" stroke="#00418f" strokeWidth="1" style={{ width: '16px', height: '16px' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            <h4 className="trn-sidebar-title">Recognized Industry Credentials</h4>

            <div className="accreditation-2col-grid">
              <div className="accred-box-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                  <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M18 11h2M18 15h2M9 3h6v4H9z" />
                </svg>
                <span>buildingSMART</span>
              </div>
              <div className="accred-box-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="#39464f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
                <span>BRE Academy</span>
              </div>
              <div className="accred-box-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                </svg>
                <span>Autodesk Partner</span>
              </div>
              <div className="accred-box-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b3272d" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
                <span>CanBIM Council</span>
              </div>
            </div>

            <p style={{ fontSize: '12px', lineHeight: '18px', color: '#424753', margin: 0 }}>
              Every Castallio Academy certificate is cryptographically anchored to your public AEC Ledger and instantly verifiable by Tier-1 hiring partners.
            </p>

            <button
              type="button"
              style={{ border: 'none', background: 'none', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0 }}
              onClick={() => showToast('Public Ledger: SHA-256 block 884129 verified.')}
            >
              View Public Ledger Verification Protocol →
            </button>
          </article>
        </aside>
      </main>

      {/* ── MODAL: Course Preview & Syllabus ── */}
      {isPreviewModalOpen && selectedCourseForPreview && (
        <div className="trn-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
          <div className="trn-modal-dialog">
            <div className="trn-modal-header">
              <div>
                <h2 id="preview-modal-title">{selectedCourseForPreview.title}</h2>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
                  {selectedCourseForPreview.provider} • {selectedCourseForPreview.totalHours} Hours Total ({selectedCourseForPreview.cpdPoints} CPD Points)
                </span>
              </div>
              <button
                type="button"
                className="trn-modal-close"
                onClick={() => setIsPreviewModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="trn-modal-body">
              <p style={{ margin: 0 }}>{selectedCourseForPreview.description}</p>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px', color: '#1a1c1e' }}>
                  Course Syllabus ({selectedCourseForPreview.modulesCount} Modules)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedCourseForPreview.syllabus?.map((mod: CourseModule, idx) => (
                    <div
                      key={mod.id}
                      style={{
                        background: '#f3f3f6',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                          0{idx + 1}.
                        </span>
                        <span style={{ color: '#1a1c1e', fontWeight: 500 }}>{mod.title}</span>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                        {mod.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="trn-modal-footer">
              <button
                type="button"
                className="btn-trn-light"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-trn-primary"
                onClick={() => {
                  handleEnrollCourse(selectedCourseForPreview.id)
                  setIsPreviewModalOpen(false)
                }}
              >
                Enroll in Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Redeem Training Credit ── */}
      {isCreditModalOpen && (
        <div className="trn-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="credit-modal-title">
          <div className="trn-modal-dialog">
            <div className="trn-modal-header">
              <h2 id="credit-modal-title">Redeem Enterprise Training Credit</h2>
              <button
                type="button"
                className="trn-modal-close"
                onClick={() => setIsCreditModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="trn-modal-body">
              <p style={{ margin: 0 }}>
                Enter your employer-issued AEC continuous education voucher code or buildingSMART partner grant key:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, color: '#1a1c1e' }}>Voucher / Token Code</label>
                <input
                  type="text"
                  placeholder="e.g. FOSTER-Q1-TRN-8842"
                  value={creditCodeInput}
                  onChange={(e) => setCreditCodeInput(e.target.value)}
                  style={{
                    background: '#f3f3f6',
                    border: '1px solid #c2c6d5',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div className="trn-modal-footer">
              <button
                type="button"
                className="btn-trn-light"
                onClick={() => setIsCreditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-trn-primary"
                onClick={handleRedeemCredit}
              >
                Validate &amp; Redeem Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: 3D WebGL Sandbox Lab Terminal ── */}
      {isSandboxModalOpen && (
        <div className="trn-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="sandbox-modal-title">
          <div className="trn-modal-dialog" style={{ maxWidth: '640px' }}>
            <div className="trn-modal-header">
              <div>
                <h2 id="sandbox-modal-title">Castallio WebGL 3D Modeling Pod</h2>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
                  RTX 4090 GPU Node • 60 FPS Stream
                </span>
              </div>
              <button
                type="button"
                className="trn-modal-close"
                onClick={() => setIsSandboxModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="trn-modal-body">
              <div className="terminal-window-box" style={{ minHeight: '180px' }}>
                {terminalLines.map((line, idx) => (
                  <div key={idx} style={{ color: line.startsWith('$') ? '#adc6ff' : '#f0f0f3' }}>
                    {line}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', background: '#f3f3f6', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                  Active Schemas:
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#39464f' }}>
                  IFC4.3 ADD2 • Rhino 8 NURBS Kernel • pyRevit VDC Framework
                </span>
              </div>
            </div>

            <div className="trn-modal-footer">
              <button
                type="button"
                className="btn-trn-primary"
                onClick={() => setIsSandboxModalOpen(false)}
              >
                Keep Pod Running in Background
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Training
