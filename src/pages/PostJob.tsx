import type { FC } from 'react'
import './PostJob.css'
import {
  usePostJob,
  type CandidatePreview,
  CATEGORIES,
  PROJECT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_TYPES,
  EMPLOYMENT_TYPES,
  POPULAR_CITIES,
  POPULAR_TITLES,
  formatIndianNumber,
  formatIndianWords,
} from './usePostJob'

interface PostJobProps {
  onCancel?: () => void
  onSuccess?: () => void
}

export const PostJob: FC<PostJobProps> = ({ onCancel, onSuccess }) => {
  const {
    title,
    setTitle,
    category,
    setCategory,
    projectType,
    setProjectType,
    experience,
    setExperience,
    workType,
    setWorkType,
    location,
    setLocation,
    employmentTypes,
    handleToggleEmploymentType,
    salaryMin,
    setSalaryMin,
    salaryMax,
    setSalaryMax,
    currency,
    setCurrency,
    numberOfOpenings,
    setNumberOfOpenings,
    jobDescription,
    setJobDescription,
    technicalRequirements,
    setTechnicalRequirements,
    responsibilities,
    setResponsibilities,
    whatWeOffer,
    setWhatWeOffer,
    errors,
    touched,
    handleBlur,
    isSubmitting,
    candidateMatches,
    healthScore,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isPublishSuccessModalOpen,
    setIsPublishSuccessModalOpen,
    toastMessage,
    handleSaveDraft,
    handlePublishRequisition,
  } = usePostJob(onSuccess)

  const quickTechTags = [
    'Revit & BIM Standards',
    'AutoCAD & Civil 3D',
    'Rhino 8 + Grasshopper',
    'Navisworks Clash Detection',
    'Tekla Structures',
    'STAAD.Pro / SAP2000',
    'Python / pyRevit',
    'ISO 19650 Compliance',
  ]

  const appendTechTag = (tag: string) => {
    if (!technicalRequirements.includes(tag)) {
      const updated = technicalRequirements ? `${technicalRequirements}, ${tag}` : tag
      setTechnicalRequirements(updated)
    }
  }

  const handleSalaryChange = (field: 'min' | 'max', inputVal: string) => {
    // Retain only digits
    const cleanDigits = inputVal.replace(/[^0-9]/g, '')
    if (!cleanDigits) {
      if (field === 'min') setSalaryMin('')
      else setSalaryMax('')
      return
    }
    // Format to Indian numbering format (e.g. 12,00,000)
    const formatted = Number(cleanDigits).toLocaleString('en-IN')
    if (field === 'min') setSalaryMin(formatted)
    else setSalaryMax(formatted)
  }

  return (
    <div className="post-job-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="pj-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Top Telemetry Ribbon */}
      <section className="pj-telemetry-ribbon" aria-label="Requisition Engine Telemetry">
        <div className="pj-telemetry-left">
          <div className="req-engine-tag">
            <span className="pulse-dot-pj" aria-hidden="true" />
            <span>REQ_BUILDER_V2</span>
          </div>

          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#39464f', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '15px', height: '15px' }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            RECRUITER TALENT RADAR: <strong style={{ color: '#00418f' }}>ACTIVE</strong>
          </span>

          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#727784', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '14px', height: '14px' }} aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            AEC &amp; INFRASTRUCTURE DIRECTORY VERIFIED
          </span>
        </div>

        <div className="pj-telemetry-right">
          <span style={{ color: '#727784' }}>STATUS:</span>
          <span style={{ background: '#d8e2ff', color: '#001a41', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
            {title ? 'COMPOSING DRAFT' : 'NEW REQUISITION'}
          </span>
        </div>
      </section>

      {/* 2. Header & Action Ribbon */}
      <header className="pj-header-section">
        <div className="pj-title-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pj-stage-tag">AEC Talent Deployment</span>
            <span style={{ color: '#727784' }}>/</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              REQUISITION BUILDER
            </span>
          </div>
          <h1 className="pj-main-heading">Post a New Job Opportunity</h1>
          <p className="pj-lead-description">
            Complete the job specifications below to publish your opening directly to verified AEC professionals and talent pools.
          </p>
        </div>

        <div className="pj-action-cluster">
          {onCancel && (
            <button
              type="button"
              className="btn-pj-light"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            className="btn-pj-light"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            className="btn-pj-light"
            style={{ color: '#00418f', fontWeight: 700 }}
            onClick={() => setIsPreviewModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Preview Live</span>
          </button>
        </div>
      </header>

      {/* 3. Main Grid: Form (8 Cols) & Live Sidebar (4 Cols) */}
      <main className="pj-main-grid">
        {/* Form Column */}
        <div className="pj-form-col">
          {/* Section 1: Role Overview & Classification */}
          <section className="pj-section-card" aria-labelledby="sec-overview-title">
            <div className="pj-section-header">
              <div className="pj-section-title-wrap">
                <div className="pj-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h2 className="pj-section-title" id="sec-overview-title">1. Role Overview &amp; Classification</h2>
                  <span className="pj-section-subline">TITLE, CATEGORY, PROJECT SCOPE &amp; OPENINGS</span>
                </div>
              </div>
            </div>

            {/* 1. Job Title */}
            <div className="pj-field-group">
              <label className="pj-field-label" htmlFor="job-title-input">
                <span>Job Title *</span>
                {title.trim().length >= 3 && (
                  <span style={{ fontFamily: 'JetBrains Mono', color: '#16a34a', fontSize: '11px' }}>
                    ✓ Validated
                  </span>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="job-title-input"
                  type="text"
                  placeholder="e.g. Senior Structural Engineer, BIM Lead, Project Manager"
                  className={`pj-text-input ${touched.title && errors.title ? 'error' : ''}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  aria-invalid={touched.title && !!errors.title}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                />
              </div>
              {touched.title && errors.title && (
                <span className="pj-field-error" id="title-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.title}
                </span>
              )}

              {/* Popular Title Quick Chips */}
              <div className="pj-chips-cloud">
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Suggestions:</span>
                {POPULAR_TITLES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="pj-quick-chip"
                    onClick={() => setTitle(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Category & 3. Project Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* Category */}
              <div className="pj-field-group">
                <label className="pj-field-label" htmlFor="job-category-select">
                  <span>Category *</span>
                </label>
                <select
                  id="job-category-select"
                  className={`pj-select-input ${touched.category && errors.category ? 'error' : ''}`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onBlur={() => handleBlur('category')}
                  aria-invalid={touched.category && !!errors.category}
                >
                  <option value="">Select Domain Category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {touched.category && errors.category && (
                  <span className="pj-field-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.category}
                  </span>
                )}
              </div>

              {/* Project Type */}
              <div className="pj-field-group">
                <label className="pj-field-label">
                  <span>Project Type *</span>
                </label>
                <select
                  className={`pj-select-input ${touched.projectType && errors.projectType ? 'error' : ''}`}
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  onBlur={() => handleBlur('projectType')}
                  aria-invalid={touched.projectType && !!errors.projectType}
                >
                  {PROJECT_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
                {touched.projectType && errors.projectType && (
                  <span className="pj-field-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.projectType}
                  </span>
                )}
              </div>
            </div>

            {/* 4. Number of Openings */}
            <div className="pj-field-group">
              <label className="pj-field-label">
                <span>Number of Openings *</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Positions available</span>
              </label>
              <div className="openings-stepper-wrap">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setNumberOfOpenings(Math.max(1, numberOfOpenings - 1))}
                  disabled={numberOfOpenings <= 1}
                  aria-label="Decrease openings"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  className={`pj-text-input openings-input ${touched.numberOfOpenings && errors.numberOfOpenings ? 'error' : ''}`}
                  value={numberOfOpenings}
                  onChange={(e) => setNumberOfOpenings(parseInt(e.target.value, 10) || 1)}
                  onBlur={() => handleBlur('numberOfOpenings')}
                />
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setNumberOfOpenings(numberOfOpenings + 1)}
                  aria-label="Increase openings"
                >
                  +
                </button>
              </div>
              {touched.numberOfOpenings && errors.numberOfOpenings && (
                <span className="pj-field-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.numberOfOpenings}
                </span>
              )}
            </div>
          </section>

          {/* Section 2: Workplace, Location & Experience */}
          <section className="pj-section-card" aria-labelledby="sec-workplace-title">
            <div className="pj-section-header">
              <div className="pj-section-title-wrap">
                <div className="pj-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h2 className="pj-section-title" id="sec-workplace-title">2. Workplace &amp; Experience Framework</h2>
                  <span className="pj-section-subline">WORK MODEL, LOCATION, EMPLOYMENT TYPE &amp; SENIORITY</span>
                </div>
              </div>
            </div>

            {/* 5. Work Type & 6. Location */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* Work Type */}
              <div className="pj-field-group">
                <label className="pj-field-label">
                  <span>Work Type *</span>
                </label>
                <div className="segmented-pill-selector">
                  {WORK_TYPES.map((wt) => (
                    <button
                      key={wt}
                      type="button"
                      className={`segmented-pill-btn ${workType === wt ? 'active' : ''}`}
                      onClick={() => setWorkType(wt)}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="pj-field-group">
                <label className="pj-field-label" htmlFor="location-input">
                  <span>Location *</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Studio / City Base</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f3f3f6', borderRadius: '8px', padding: '0 10px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#727784" strokeWidth="2" style={{ width: '18px', height: '18px', flexShrink: 0 }} aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    id="location-input"
                    type="text"
                    placeholder="e.g. Pune, Maharashtra, India or London"
                    className={`pj-text-input ${touched.location && errors.location ? 'error' : ''}`}
                    style={{ background: 'transparent', border: 'none' }}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={() => handleBlur('location')}
                    aria-invalid={touched.location && !!errors.location}
                  />
                </div>
                {touched.location && errors.location && (
                  <span className="pj-field-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.location}
                  </span>
                )}

                {/* Popular Cities */}
                <div className="pj-chips-cloud">
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Quick Select:</span>
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="pj-quick-chip"
                      onClick={() => setLocation(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. Employment Type (Multi-select) */}
            <div className="pj-field-group">
              <label className="pj-field-label">
                <span>Employment Type *</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Multi-select supported</span>
              </label>
              <div className="pills-cloud-selector">
                {EMPLOYMENT_TYPES.map((type) => {
                  const isSelected = employmentTypes.includes(type)
                  return (
                    <button
                      key={type}
                      type="button"
                      className={`pill-option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleEmploymentType(type)}
                    >
                      <span>{type}</span>
                      {isSelected ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#727784" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
              {touched.employmentTypes && errors.employmentTypes && (
                <span className="pj-field-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.employmentTypes}
                </span>
              )}
            </div>

            {/* 8. Experience */}
            <div className="pj-field-group">
              <label className="pj-field-label" htmlFor="experience-select">
                <span>Required Experience *</span>
              </label>
              <select
                id="experience-select"
                className={`pj-select-input ${touched.experience && errors.experience ? 'error' : ''}`}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                onBlur={() => handleBlur('experience')}
                aria-invalid={touched.experience && !!errors.experience}
              >
                <option value="">Select Required Experience Level...</option>
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
              {touched.experience && errors.experience && (
                <span className="pj-field-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.experience}
                </span>
              )}
            </div>
          </section>

          {/* Section 3: Salary Range (Optional) */}
          <section className="pj-section-card" aria-labelledby="sec-compensation-title">
            <div className="pj-section-header">
              <div className="pj-section-title-wrap">
                <div className="pj-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div>
                  <h2 className="pj-section-title" id="sec-compensation-title">3. Salary Range &amp; Compensation</h2>
                  <span className="pj-section-subline">TRANSPARENCY BENCHMARK</span>
                </div>
              </div>
              <span className="optional-badge">OPTIONAL</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div className="pj-field-group">
                <label className="pj-field-label">Currency</label>
                <select
                  className="pj-select-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="₹ (INR)">₹ (INR) - Indian Rupee</option>
                  <option value="$ (USD)">$ (USD) - US Dollar</option>
                  <option value="£ (GBP)">£ (GBP) - British Pound</option>
                  <option value="€ (EUR)">€ (EUR) - Euro</option>
                </select>
              </div>

              <div className="pj-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="pj-field-label" htmlFor="min-salary-input">
                    <span>Minimum Salary</span>
                  </label>
                  {salaryMin && formatIndianWords(salaryMin) && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                      ≈ {formatIndianWords(salaryMin)}
                    </span>
                  )}
                </div>
                <input
                  id="min-salary-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 50,000 or 5,00,000"
                  className={`pj-text-input ${touched.salaryMin && errors.salaryMin ? 'error' : ''}`}
                  value={salaryMin}
                  onChange={(e) => handleSalaryChange('min', e.target.value)}
                  onBlur={() => handleBlur('salaryMin')}
                />
              </div>

              <div className="pj-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="pj-field-label" htmlFor="max-salary-input">
                    <span>Maximum Salary</span>
                  </label>
                  {salaryMax && formatIndianWords(salaryMax) && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                      ≈ {formatIndianWords(salaryMax)}
                    </span>
                  )}
                </div>
                <input
                  id="max-salary-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 80,000 or 12,00,000"
                  className={`pj-text-input ${touched.salaryMax && errors.salaryMax ? 'error' : ''}`}
                  value={salaryMax}
                  onChange={(e) => handleSalaryChange('max', e.target.value)}
                  onBlur={() => handleBlur('salaryMax')}
                />
              </div>
            </div>

            {(errors.salaryMin || errors.salaryMax) && (
              <span className="pj-field-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.salaryMin || errors.salaryMax}
              </span>
            )}
          </section>

          {/* Section 4: Specifications & Scope */}
          <section className="pj-section-card" aria-labelledby="sec-specs-title">
            <div className="pj-section-header">
              <div className="pj-section-title-wrap">
                <div className="pj-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <h2 className="pj-section-title" id="sec-specs-title">4. Job Specifications &amp; Detailed Scope</h2>
                  <span className="pj-section-subline">DESCRIPTION, REQUIREMENTS, RESPONSIBILITIES &amp; OFFER</span>
                </div>
              </div>
            </div>

            {/* 10. Job Description */}
            <div className="pj-field-group">
              <label className="pj-field-label" htmlFor="job-desc-input">
                <span>Job Description *</span>
                <span className="char-counter">{jobDescription.length} chars</span>
              </label>
              <textarea
                id="job-desc-input"
                rows={5}
                placeholder="Provide a thorough overview of this role, the studio team, and project context..."
                className={`pj-text-input ${touched.jobDescription && errors.jobDescription ? 'error' : ''}`}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onBlur={() => handleBlur('jobDescription')}
                style={{ resize: 'vertical' }}
              />
              {touched.jobDescription && errors.jobDescription && (
                <span className="pj-field-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.jobDescription}
                </span>
              )}
            </div>

            {/* 11. Technical Requirements */}
            <div className="pj-field-group">
              <label className="pj-field-label" htmlFor="tech-reqs-input">
                <span>Technical Requirements *</span>
                <span className="char-counter">{technicalRequirements.length} chars</span>
              </label>
              <textarea
                id="tech-reqs-input"
                rows={4}
                placeholder="Required technical proficiencies, engineering software, code compliance (e.g. Revit, AutoCAD, Tekla, ISO 19650)..."
                className={`pj-text-input ${touched.technicalRequirements && errors.technicalRequirements ? 'error' : ''}`}
                value={technicalRequirements}
                onChange={(e) => setTechnicalRequirements(e.target.value)}
                onBlur={() => handleBlur('technicalRequirements')}
                style={{ resize: 'vertical' }}
              />
              {touched.technicalRequirements && errors.technicalRequirements && (
                <span className="pj-field-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.technicalRequirements}
                </span>
              )}

              {/* Tech tag helper pills */}
              <div className="pj-chips-cloud" style={{ marginTop: '4px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Quick Insert:</span>
                {quickTechTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="pj-quick-chip"
                    onClick={() => appendTechTag(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 12. Responsibilities */}
            <div className="pj-field-group">
              <label className="pj-field-label" htmlFor="responsibilities-input">
                <span>Responsibilities *</span>
                <span className="char-counter">{responsibilities.length} chars</span>
              </label>
              <textarea
                id="responsibilities-input"
                rows={4}
                placeholder="Outline day-to-day duties, project milestones, coordination and team deliverables..."
                className={`pj-text-input ${touched.responsibilities && errors.responsibilities ? 'error' : ''}`}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                onBlur={() => handleBlur('responsibilities')}
                style={{ resize: 'vertical' }}
              />
              {touched.responsibilities && errors.responsibilities && (
                <span className="pj-field-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.responsibilities}
                </span>
              )}
            </div>

            {/* 13. What We Offer */}
            <div className="pj-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="pj-field-label" htmlFor="what-we-offer-input">
                  <span>What We Offer</span>
                </label>
                <span className="optional-badge">OPTIONAL</span>
              </div>
              <textarea
                id="what-we-offer-input"
                rows={3}
                placeholder="Highlight studio culture, mentorship, health coverage, bonuses, hardware allowance, flexible hours..."
                className="pj-text-input"
                value={whatWeOffer}
                onChange={(e) => setWhatWeOffer(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </section>
        </div>

        {/* Right Column: Live Intelligence & Radar */}
        <aside className="pj-sidebar-col">
          {/* Card 1: Requisition Health Score */}
          <article className="pj-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="pj-sidebar-title">Requisition Health Score</h3>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: 700, color: healthScore >= 80 ? '#16a34a' : healthScore >= 50 ? '#00418f' : '#dc2626' }}>
                {healthScore}%
              </span>
            </div>

            <div className="benchmark-progress-track">
              <div
                className="benchmark-progress-fill"
                style={{
                  width: `${healthScore}%`,
                  background: healthScore >= 80 ? '#16a34a' : healthScore >= 50 ? '#00418f' : '#dc2626',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <p style={{ fontSize: '12px', color: '#424753', margin: 0 }}>
              {healthScore >= 80
                ? 'Optimal funnel quality. Requisition has comprehensive criteria to match high-value AEC talent.'
                : healthScore >= 50
                ? 'Good progress. Fill out technical requirements and responsibilities to achieve 90%+ match accuracy.'
                : 'Initial draft. Provide more details to unlock talent radar syndication.'}
            </p>
          </article>

          {/* Card 2: Algorithmic Talent Pool Estimator */}
          <article className="pj-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#00418f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <h3 className="pj-sidebar-title">Talent Pool Radar</h3>
              </div>
              <span className="trn-radar-badge" style={{ fontSize: '10px' }}>LIVE FEED</span>
            </div>

            <div className="counter-2col-grid">
              <div className="counter-sub-box">
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', textTransform: 'uppercase', color: '#727784' }}>Network Pool</span>
                <span style={{ fontFamily: 'Hanken Grotesk', fontSize: '24px', fontWeight: 700, color: '#1a1c1e' }}>142</span>
                <span style={{ fontSize: '11px', color: '#424753' }}>Verified Candidates</span>
              </div>

              <div className="counter-sub-box primary">
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', textTransform: 'uppercase', color: '#adc6ff' }}>95%+ Match Fit</span>
                <span style={{ fontFamily: 'Hanken Grotesk', fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>18</span>
                <span style={{ fontSize: '11px', color: '#d8e2ff' }}>Instant Alert Ready</span>
              </div>
            </div>

            {/* Candidates Ready Previews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', textTransform: 'uppercase', color: '#727784', fontWeight: 700 }}>
                Top Ranked Matches Ready:
              </span>

              {candidateMatches.map((cand: CandidatePreview) => (
                <div className="candidate-preview-row" key={cand.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div className="candidate-avatar-init">{cand.initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1c1e', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cand.name}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cand.skills}
                      </span>
                    </div>
                  </div>
                  <span className="candidate-fit-pill">{cand.fitScore}% FIT</span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </main>

      {/* 4. Sticky Bottom Deployment Bar */}
      <footer className="pj-bottom-launch-bar" aria-label="Deployment Controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#d8e2ff', color: '#00418f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div>
            <strong style={{ fontSize: '14px', color: '#1a1c1e', display: 'block' }}>
              Ready to Launch Job Requisition
            </strong>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              Instant publication to Castallio network &amp; talent radar
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-pj-light"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            Save Draft
          </button>

          <button
            type="button"
            className="btn-pj-primary"
            onClick={handlePublishRequisition}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Publishing...</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                </svg>
                <span>Publish to Talent Radar</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* ── MODAL: Live Preview (All 13 Fields) ── */}
      {isPreviewModalOpen && (
        <div className="pj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
          <div className="pj-modal-dialog">
            <div className="pj-modal-header">
              <div>
                <h2 id="preview-modal-title">{title || 'Untitled Job Post'}</h2>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#00418f' }}>
                  {category || 'Uncategorized'} • {location || 'Location Pending'} ({workType})
                </span>
              </div>
              <button
                type="button"
                className="pj-modal-close"
                onClick={() => setIsPreviewModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="pj-modal-body preview-modal-body">
              {/* Badges row */}
              <div className="preview-chip-row">
                <span className="preview-badge">{projectType} Project</span>
                <span className="preview-badge">{experience || 'Any Experience'}</span>
                {employmentTypes.map((et) => (
                  <span key={et} className="preview-badge">{et}</span>
                ))}
                <span className="preview-badge">{numberOfOpenings} {numberOfOpenings > 1 ? 'Openings' : 'Opening'}</span>
                {(salaryMin || salaryMax) && (
                  <span className="preview-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                    {currency} {salaryMin ? formatIndianNumber(salaryMin) : '0'} - {salaryMax ? formatIndianNumber(salaryMax) : 'Negotiable'}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="preview-section-box">
                <h4>Job Description</h4>
                <p>{jobDescription || 'No description provided yet.'}</p>
              </div>

              {/* Technical Requirements */}
              <div className="preview-section-box">
                <h4>Technical Requirements</h4>
                <p>{technicalRequirements || 'No technical requirements specified.'}</p>
              </div>

              {/* Responsibilities */}
              <div className="preview-section-box">
                <h4>Responsibilities</h4>
                <p>{responsibilities || 'No responsibilities outlined.'}</p>
              </div>

              {/* What We Offer */}
              {whatWeOffer && (
                <div className="preview-section-box">
                  <h4>What We Offer</h4>
                  <p>{whatWeOffer}</p>
                </div>
              )}
            </div>

            <div className="pj-modal-footer">
              <button
                type="button"
                className="btn-pj-light"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Back to Editing
              </button>
              <button
                type="button"
                className="btn-pj-primary"
                onClick={() => {
                  setIsPreviewModalOpen(false)
                  handlePublishRequisition()
                }}
                disabled={isSubmitting}
              >
                Confirm &amp; Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Publish Success ── */}
      {isPublishSuccessModalOpen && (
        <div className="pj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
          <div className="pj-modal-dialog" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '32px', height: '32px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 id="success-modal-title" style={{ fontFamily: 'Hanken Grotesk', fontSize: '22px', color: '#1a1c1e', margin: '0 0 8px' }}>
              Job Successfully Published!
            </h2>
            <p style={{ fontSize: '14px', color: '#424753', margin: '0 0 20px' }}>
              Your job post <strong>"{title}"</strong> is now live on Castallio One.
            </p>
            <button
              type="button"
              className="btn-pj-primary"
              onClick={() => {
                setIsPublishSuccessModalOpen(false)
                if (onSuccess) onSuccess()
              }}
            >
              View My Job Posts
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostJob
