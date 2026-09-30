import type { FC } from 'react'
import {
  useTraining,
  type CourseItem,
  type CourseModule,
  type LearningPathStep,
  type CourseCategory,
  type CourseLevel,
} from './useTraining'
import './Training.css'

interface TrainingProps {
  onNavigateToFindJobs?: () => void
}

const CATEGORY_TABS: { id: CourseCategory; label: string }[] = [
  { id: 'all', label: 'All Courses' },
  { id: 'bim-iso', label: 'BIM & ISO 19650' },
  { id: 'computational', label: 'Computational Design' },
  { id: 'vdc-coordination', label: '4D/5D VDC & Logistics' },
  { id: 'automation-api', label: 'Revit API & Python' },
]

export const Training: FC<TrainingProps> = ({ onNavigateToFindJobs }) => {
  const {
    filteredCourses,
    flagshipCourse,
    activeCategory,
    setActiveCategory,
    levelFilter,
    setLevelFilter,
    searchQuery,
    setSearchQuery,
    filterEnrolledOnly,
    setFilterEnrolledOnly,
    pathSteps,
    workshop,
    selectedCourseForPreview,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    selectedCourseForEnroll,
    isEnrollModalOpen,
    setIsEnrollModalOpen,
    toastMessage,
    metrics,
    categoryCounts,
    handleEnrollCourse,
    handleOpenPreview,
    handleOpenEnrollModal,
    handleConfirmEnrollment,
    handleReserveWorkshopSeat,
    handleAddPath,
  } = useTraining()

  return (
    <main className="training-page" aria-label="Castallio Academy Technical Courses & Certifications">
      {/* Toast Notification */}
      {toastMessage && (
        <aside className="trn-toast" role="status" aria-live="polite">
          <span className="material-symbols-outlined" aria-hidden="true">
            school
          </span>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Telemetry & Partnership Strip */}
      {/* <section className="trn-telemetry-bar" aria-label="Academy Accreditation Ribbon">
        <div className="trn-telemetry-left">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00418f', fontWeight: 600 }}>
            <span className="trn-pulse-dot" aria-hidden="true" />
            CASTALLIO ACADEMY // PROFESSIONAL ACCREDITATION
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span>
            CURRICULUM: <strong style={{ color: '#00418f' }}>ISO 19650 &amp; OPENBIM CORE</strong>
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span>
            CREDENTIAL SYNC: <strong style={{ color: '#059669' }}>CASTALLIO ONE TALENT PASSPORT</strong>
          </span>
        </div>

        <div className="trn-telemetry-right">
          <span className="trn-telemetry-badge">
            INDUSTRY CERTIFICATION PORTAL
          </span>
        </div>
      </section> */}

      {/* 2. Header Area */}
      <header className="trn-header-area">
        <div>
          <div className="trn-overline-badge">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">
              verified
            </span>
            <span>PROGRAMS BY CASTALLIO • VERIFIED ON CASTALLIO ONE</span>
          </div>
          <h1 className="trn-header-title">Technical Training &amp; Certifications</h1>
          <p className="trn-header-desc">
            Advance your AEC technical expertise with certified masterclasses designed and taught by <strong>Castallio</strong>. Every completed certification instantly boosts your verified talent passport and hiring ranking on <strong>Castallio One</strong>.
          </p>
        </div>

        <div className="trn-header-actions">
          <button
            type="button"
            className={`btn-trn-secondary ${filterEnrolledOnly ? 'active' : ''}`}
            onClick={() => setFilterEnrolledOnly(!filterEnrolledOnly)}
            title="Filter your enrolled courses"
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              school
            </span>
            <span>{filterEnrolledOnly ? 'Showing Enrolled' : 'My Enrolled Courses'}</span>
          </button>

          {onNavigateToFindJobs && (
            <button
              type="button"
              className="btn-trn-primary"
              onClick={onNavigateToFindJobs}
              title="Explore AEC opportunities matching your skills"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                work
              </span>
              <span>Matched Job Openings</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. KPI Metrics Summary Cards */}
      <section className="trn-metrics-grid" aria-label="Learning Metrics Summary">
        <article className="trn-metric-card">
          <div className="trn-metric-top">
            <span className="trn-metric-label">Enrolled Programs</span>
            <div className="trn-metric-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                local_library
              </span>
            </div>
          </div>
          <div className="trn-metric-value">{metrics.activeTracks}</div>
          <span className="trn-metric-subtext">Active specialized curricula</span>
        </article>

        <article className="trn-metric-card">
          <div className="trn-metric-top">
            <span className="trn-metric-label">Completed Certs</span>
            <div className="trn-metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                workspace_premium
              </span>
            </div>
          </div>
          <div className="trn-metric-value" style={{ color: '#059669' }}>{metrics.completedCertifications}</div>
          <span className="trn-metric-subtext">Added to Castallio One profile</span>
        </article>

        <article className="trn-metric-card">
          <div className="trn-metric-top">
            <span className="trn-metric-label">Study Hours Logged</span>
            <div className="trn-metric-icon-box" style={{ background: '#eff6ff', color: '#0058bc' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                schedule
              </span>
            </div>
          </div>
          <div className="trn-metric-value">{metrics.totalHoursLearned}h</div>
          <span className="trn-metric-subtext">Hands-on AEC project modeling</span>
        </article>

        <article className="trn-metric-card">
          <div className="trn-metric-top">
            <span className="trn-metric-label">Talent Match Boost</span>
            <div className="trn-metric-icon-box" style={{ background: '#fdf4ff', color: '#a855f7' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                trending_up
              </span>
            </div>
          </div>
          <div className="trn-metric-value" style={{ color: '#00418f' }}>{metrics.visibilityBoost}</div>
          <span className="trn-metric-subtext">Higher visibility to AEC recruiters</span>
        </article>
      </section>

      {/* 4. Main 2-Column Grid */}
      <div className="trn-workspace-grid">
        {/* LEFT COLUMN: Flagship Spotlight & Course Catalog */}
        <div className="trn-left-col">
          {/* Flagship Course Spotlight Banner */}
          {flagshipCourse && (
            <article className="flagship-banner-card" aria-label="Castallio Flagship Masterclass">
              <div className="flagship-top-row">
                <div className="flagship-badge-group">
                  <span className="flagship-pill">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                      stars
                    </span>
                    Castallio Flagship Masterclass
                  </span>
                  <span className="flagship-tag-pill">{flagshipCourse.level}</span>
                </div>
                {flagshipCourse.accreditation && (
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                    {flagshipCourse.accreditation}
                  </span>
                )}
              </div>

              <div>
                <h2 className="flagship-title">{flagshipCourse.title}</h2>
                <div className="flagship-instructor-row" style={{ marginTop: '10px' }}>
                  <div className="flagship-instructor-avatar">
                    {flagshipCourse.instructor.initials}
                  </div>
                  <div className="flagship-instructor-info">
                    <span className="flagship-instructor-name">{flagshipCourse.instructor.name}</span>
                    <span className="flagship-instructor-title">
                      {flagshipCourse.instructor.title} {flagshipCourse.instructor.organization ? `• ${flagshipCourse.instructor.organization}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <p className="flagship-desc">{flagshipCourse.description}</p>

              {/* Stacks chips */}
              <div className="flagship-stacks-row">
                {flagshipCourse.stacks.map((stack, i) => (
                  <span key={i} className="stack-chip">
                    {stack}
                  </span>
                ))}
              </div>

              {/* Career Boost Callout */}
              <div className="flagship-profile-callout">
                <span className="material-symbols-outlined" aria-hidden="true">
                  verified_user
                </span>
                <span>{flagshipCourse.profileBoostImpact}</span>
              </div>

              {/* CTAs */}
              <div className="flagship-actions-row">
                <button
                  type="button"
                  className="btn-trn-primary"
                  onClick={() => handleOpenEnrollModal(flagshipCourse)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    how_to_reg
                  </span>
                  <span>{flagshipCourse.isEnrolled ? 'View Enrolled Workspace' : 'Enroll in Program'}</span>
                </button>

                <button
                  type="button"
                  className="btn-trn-secondary"
                  onClick={() => handleOpenPreview(flagshipCourse)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    menu_book
                  </span>
                  <span>Preview Full Syllabus ({flagshipCourse.modulesCount} Modules)</span>
                </button>
              </div>
            </article>
          )}

          {/* Controls: Category Tabs & Search Bar */}
          <section className="trn-controls-section" aria-label="Course Catalog Filters">
            {/* Category Tabs */}
            <nav className="trn-tabs-scroll" aria-label="Course Category Tabs">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`trn-tab-pill ${activeCategory === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(tab.id)}
                >
                  <span>{tab.label}</span>
                  <span className="trn-tab-count">{categoryCounts[tab.id]}</span>
                </button>
              ))}
            </nav>

            {/* Search & Level Filter */}
            <div className="trn-filters-row">
              <div className="trn-search-box">
                <span className="material-symbols-outlined trn-search-icon" aria-hidden="true">
                  search
                </span>
                <input
                  type="text"
                  className="trn-search-input"
                  placeholder="Search by topic, instructor, or software (Revit, Grasshopper, Synchro)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search courses"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="trn-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">
                      close
                    </span>
                  </button>
                )}
              </div>

              <select
                className="trn-select-dropdown"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as CourseLevel)}
                aria-label="Filter by course level"
              >
                <option value="All">All Skill Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </section>

          {/* Courses List */}
          <section className="trn-courses-list" aria-label="Castallio Programs Catalog">
            {filteredCourses.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94a3b8' }} aria-hidden="true">
                  school
                </span>
                <h3 style={{ margin: '8px 0', fontSize: '16px', fontWeight: 700, color: '#1a1c1e' }}>
                  No Castallio courses match your search
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Try clearing the search query or selecting a different course category.
                </p>
                <button
                  type="button"
                  className="btn-trn-secondary"
                  style={{ marginTop: '14px' }}
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('all')
                    setLevelFilter('All')
                    setFilterEnrolledOnly(false)
                  }}
                >
                  Reset Catalog Filters
                </button>
              </div>
            ) : (
              filteredCourses.map((course: CourseItem) => (
                <article
                  key={course.id}
                  className={`trn-course-card ${course.isEnrolled ? 'enrolled' : ''}`}
                >
                  <div className="course-card-top">
                    <div>
                      <div className="course-provider-line">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                          verified
                        </span>
                        <span>{course.provider}</span>
                      </div>
                      <h3 className="course-card-heading">{course.title}</h3>
                    </div>
                    <span className="course-level-chip">{course.level}</span>
                  </div>

                  <p className="course-desc-text">{course.description}</p>

                  {/* Stacks chips */}
                  <div className="flagship-stacks-row">
                    {course.stacks.map((stack, i) => (
                      <span key={i} className="stack-chip">
                        {stack}
                      </span>
                    ))}
                  </div>

                  {/* Career Impact Note */}
                  <div className="course-career-boost-box">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#059669' }} aria-hidden="true">
                      rocket_launch
                    </span>
                    <span>{course.profileBoostImpact}</span>
                  </div>

                  {/* Progress bar if enrolled */}
                  {course.isEnrolled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#00418f', fontWeight: 600 }}>
                        <span>Course Progress</span>
                        <span>{course.progressPercent ?? 0}% Completed</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${course.progressPercent ?? 0}%`, background: '#0058bc', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  )}

                  {/* Footer Meta & Actions */}
                  <div className="course-meta-footer">
                    <div className="course-stats-line">
                      <span className="course-stat-item">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          schedule
                        </span>
                        <span>{course.totalHours} Hours</span>
                      </span>
                      <span>•</span>
                      <span className="course-stat-item">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          format_list_bulleted
                        </span>
                        <span>{course.modulesCount} Modules</span>
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: 600, color: '#1a1c1e' }}>
                        ★ {course.rating} ({course.reviewsCount} reviews)
                      </span>
                    </div>

                    <div className="course-action-buttons">
                      <button
                        type="button"
                        className="btn-trn-secondary"
                        onClick={() => handleAddPath(course.title)}
                        title="Add course to your personal pathway"
                      >
                        + Pathway
                      </button>

                      <button
                        type="button"
                        className="btn-trn-secondary"
                        onClick={() => handleOpenPreview(course)}
                        title="Preview syllabus"
                      >
                        Syllabus
                      </button>

                      <button
                        type="button"
                        className="btn-trn-primary"
                        onClick={() => {
                          if (course.isEnrolled) {
                            handleOpenPreview(course)
                          } else {
                            handleOpenEnrollModal(course)
                          }
                        }}
                      >
                        {course.isEnrolled ? 'Resume Study' : 'Enroll Now'}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Streamlined Sidebar (Pathway, Workshop, Why Castallio) */}
        <aside className="trn-right-col" aria-label="Curated Pathways and Workshops">
          {/* Card 1: Curated Career Specialization Pathway */}
          <article className="trn-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="trn-overline-badge" style={{ margin: 0 }}>Specialization Track</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700 }}>
                AEC LEADERSHIP
              </span>
            </div>

            <div>
              <h3 className="trn-sidebar-title">BIM Coordinator to Director Pathway</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#555b68', lineHeight: 1.4 }}>
                Structured 4-stage technical progression endorsed by Castallio for high-velocity career advancement.
              </p>
            </div>

            <div className="pathway-steps-list">
              {pathSteps.map((step: LearningPathStep) => (
                <div key={step.id} className="path-step-row">
                  <div className={`step-num-circle ${step.status}`}>
                    {step.status === 'done' ? '✓' : `0${step.id}`}
                  </div>
                  <div className="step-info-col">
                    <div className="step-title-line">
                      <span>{step.title}</span>
                      <span style={{ fontSize: '11px', color: step.status === 'done' ? '#059669' : '#00418f' }}>
                        {step.subtext}
                      </span>
                    </div>
                    {step.progressPercent !== undefined && (
                      <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', margin: '3px 0' }}>
                        <div style={{ height: '100%', width: `${step.progressPercent}%`, background: '#0058bc' }} />
                      </div>
                    )}
                    <span className="step-note-text">{step.note}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#00418f', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                military_tech
              </span>
              <span>Completing this pathway unlocks Tier-1 enterprise recruiter prioritization on Castallio One.</span>
            </div>
          </article>

          {/* Card 2: Upcoming Live Workshop */}
          <article className="trn-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="trn-overline-badge" style={{ margin: 0, background: '#fee2e2', color: '#b91c1c' }}>
                Live Masterclass
              </span>
              <span className="workshop-date-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }} aria-hidden="true">
                  calendar_today
                </span>
                {workshop.dateText}
              </span>
            </div>

            <div>
              <h3 className="trn-sidebar-title">{workshop.title}</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#555b68', lineHeight: 1.45 }}>
                {workshop.description}
              </p>
            </div>

            <div className="workshop-highlight-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: '#1a1c1e' }}>{workshop.instructor}</span>
                <span style={{ color: '#00418f', fontWeight: 700 }}>{workshop.seatsRemaining} Seats Left</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#727784' }}>{workshop.timeText} • {workshop.platform}</span>
            </div>

            <button
              type="button"
              className={workshop.isReserved ? 'btn-trn-secondary' : 'btn-trn-primary'}
              style={{ justifyContent: 'center' }}
              onClick={handleReserveWorkshopSeat}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {workshop.isReserved ? 'event_available' : 'confirmation_number'}
              </span>
              <span>{workshop.isReserved ? 'Seat Reserved (Check Email / Alerts)' : 'Reserve Free Candidate Seat'}</span>
            </button>
          </article>

          {/* Card 3: Why Learn with Castallio */}
          <article className="trn-sidebar-card">
            <h3 className="trn-sidebar-title">Why Learn with Castallio?</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="why-castallio-item">
                <div className="why-castallio-icon">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    badge
                  </span>
                </div>
                <div className="why-castallio-text">
                  <span className="why-castallio-heading">Direct Castallio One Sync</span>
                  <span className="why-castallio-desc">
                    Certificates automatically appear on your talent profile for hiring studios to verify.
                  </span>
                </div>
              </div>

              <div className="why-castallio-item">
                <div className="why-castallio-icon">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    domain
                  </span>
                </div>
                <div className="why-castallio-text">
                  <span className="why-castallio-heading">Production Project Blueprints</span>
                  <span className="why-castallio-desc">
                    Trained on real IFC datasets from international airports, hospitals, and transit hubs.
                  </span>
                </div>
              </div>

              <div className="why-castallio-item">
                <div className="why-castallio-icon">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    verified
                  </span>
                </div>
                <div className="why-castallio-text">
                  <span className="why-castallio-heading">ISO 19650 &amp; OpenBIM Standards</span>
                  <span className="why-castallio-desc">
                    Aligend with global buildingSMART, UK BIM Framework, and Autodesk standards.
                  </span>
                </div>
              </div>
            </div>
          </article>
        </aside>
      </div>

      {/* ── MODAL: Course Syllabus & Module Preview ── */}
      {isPreviewModalOpen && selectedCourseForPreview && (
        <aside
          className="trn-modal-backdrop"
          onClick={() => setIsPreviewModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Course Syllabus Modal"
        >
          <div className="trn-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <header className="trn-modal-header">
              <div>
                <h2 className="trn-modal-title">{selectedCourseForPreview.title}</h2>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
                  Offered by {selectedCourseForPreview.provider} • {selectedCourseForPreview.totalHours} Hours ({selectedCourseForPreview.modulesCount} Modules)
                </span>
              </div>
              <button
                type="button"
                className="trn-modal-close"
                onClick={() => setIsPreviewModalOpen(false)}
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </header>

            <div className="trn-modal-body">
              <p style={{ margin: 0, fontSize: '13.5px', color: '#424753', lineHeight: 1.5 }}>
                {selectedCourseForPreview.description}
              </p>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 10px', color: '#1a1c1e' }}>
                  Detailed Course Syllabus ({selectedCourseForPreview.modulesCount} Modules)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCourseForPreview.syllabus.map((mod: CourseModule, idx) => (
                    <div key={mod.id} className="trn-module-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11.5px', color: '#00418f', fontWeight: 700 }}>
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span style={{ fontWeight: 600, color: '#1a1c1e' }}>{mod.title}</span>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                        {mod.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#00418f', display: 'block', marginBottom: '2px' }}>
                  Castallio Certificate Issued Upon Completion:
                </span>
                <span style={{ fontSize: '12.5px', color: '#1a1c1e', fontWeight: 600 }}>
                  {selectedCourseForPreview.certificateTitle}
                </span>
              </div>
            </div>

            <footer className="trn-modal-footer">
              <button
                type="button"
                className="btn-trn-secondary"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-trn-primary"
                onClick={() => {
                  setIsPreviewModalOpen(false)
                  handleEnrollCourse(selectedCourseForPreview.id)
                }}
              >
                {selectedCourseForPreview.isEnrolled ? 'Open Workspace' : 'Enroll in Program'}
              </button>
            </footer>
          </div>
        </aside>
      )}

      {/* ── MODAL: Course Enrollment Confirmation ── */}
      {isEnrollModalOpen && selectedCourseForEnroll && (
        <aside
          className="trn-modal-backdrop"
          onClick={() => setIsEnrollModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Course Enrollment Modal"
        >
          <div className="trn-modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <header className="trn-modal-header">
              <div>
                <h2 className="trn-modal-title">Enroll in Castallio Program</h2>
                <span style={{ fontSize: '12px', color: '#00418f' }}>
                  {selectedCourseForEnroll.provider}
                </span>
              </div>
              <button
                type="button"
                className="trn-modal-close"
                onClick={() => setIsEnrollModalOpen(false)}
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </header>

            <div className="trn-modal-body">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1c1e' }}>
                {selectedCourseForEnroll.title}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: '#727784', display: 'block' }}>Instructor</span>
                  <strong style={{ color: '#1a1c1e' }}>{selectedCourseForEnroll.instructor.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#727784', display: 'block' }}>Duration</span>
                  <strong style={{ color: '#1a1c1e' }}>{selectedCourseForEnroll.totalHours} Hours Total</strong>
                </div>
                <div>
                  <span style={{ color: '#727784', display: 'block' }}>Skill Level</span>
                  <strong style={{ color: '#1a1c1e' }}>{selectedCourseForEnroll.level}</strong>
                </div>
                <div>
                  <span style={{ color: '#727784', display: 'block' }}>Access</span>
                  <strong style={{ color: '#059669' }}>Free for Verified Candidates</strong>
                </div>
              </div>

              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#00418f' }}>
                Upon enrollment, your curriculum progress will synchronize directly to your candidate profile on Castallio One to boost recruiter search rankings.
              </div>
            </div>

            <footer className="trn-modal-footer">
              <button
                type="button"
                className="btn-trn-secondary"
                onClick={() => setIsEnrollModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-trn-primary"
                onClick={handleConfirmEnrollment}
              >
                Confirm &amp; Start Learning
              </button>
            </footer>
          </div>
        </aside>
      )}
    </main>
  )
}

export default Training
