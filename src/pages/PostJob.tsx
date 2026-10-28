import { useState, type FC } from 'react'
import './PostJob.css'
import {
  usePostJob,
  EXPERIENCE_LEVELS,
  WORK_TYPES,
  EMPLOYMENT_TYPES,
  POPULAR_CITIES,
  POPULAR_TITLES,
  formatIndianNumber,
  formatIndianWords,
} from './usePostJob'

interface PostJobProps {
  jobIdToEdit?: string | null
  onCancel?: () => void
  onSuccess?: () => void
  onNavigateToSubscription?: () => void
}

export const PostJob: FC<PostJobProps> = ({ jobIdToEdit, onCancel, onSuccess, onNavigateToSubscription }) => {
  const {
    isEditMode,
    isLoadingJob,
    title,
    setTitle,
    category,
    setCategory,
    projectType,
    selectedProjectTypes,
    handleToggleProjectType,
    experience,
    setExperience,
    workType,
    setWorkType,
    location,
    locations,
    handleAddLocation,
    handleRemoveLocation,
    handleToggleLocation,
    employmentTypes,
    handleToggleEmploymentType,
    salaryPeriod,
    handleSalaryPeriodChange,
    handleSalaryChange,
    salaryMin,
    salaryMax,
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
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isPublishSuccessModalOpen,
    setIsPublishSuccessModalOpen,
    isQuotaExceededModalOpen,
    setIsQuotaExceededModalOpen,
    quota,
    isCheckingQuota,
    requiresJobCredit,
    toastMessage,
    handleSaveDraft,
    handlePublishRequisition,
    // Custom Category Dialog
    categories,
    isCustomCategoryModalOpen,
    openCustomCategoryModal,
    closeCustomCategoryModal,
    customCategoryInput,
    setCustomCategoryInput,
    customCategoryError,
    setCustomCategoryError,
    isAddingCustomCategory,
    handleAddCustomCategory,
    // Custom Project Type Dialog
    projectTypes,
    isCustomProjectTypeModalOpen,
    openCustomProjectTypeModal,
    closeCustomProjectTypeModal,
    customProjectTypeInput,
    setCustomProjectTypeInput,
    customProjectTypeError,
    setCustomProjectTypeError,
    isAddingCustomProjectType,
    handleAddCustomProjectType,
  } = usePostJob(onSuccess, jobIdToEdit)

  const [locationInput, setLocationInput] = useState<string>('')

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
      {/* <section className="pj-telemetry-ribbon" aria-label="Requisition Engine Telemetry">
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

          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#00418f', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '13px', height: '13px' }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            POST VALIDITY: 15 DAYS
          </span>
        </div>

        <div className="pj-telemetry-right">
          {quota && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: quota.isLimitReached ? '#fee2e2' : '#e0f2fe',
                color: quota.isLimitReached ? '#991b1b' : '#0369a1',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '11px',
              }}
              title={quota.isLimitReached ? 'Plan total job post limit reached' : 'Total job posting capacity'}
            >
              <span>{quota.planName.toUpperCase()}</span>
              <span>•</span>
              <span>
                {quota.jobPostLimit === null
                  ? `${quota.totalJobsCount} POSTED (UNLIMITED)`
                  : `${quota.totalJobsCount}/${quota.jobPostLimit} JOBS POSTED`}
              </span>
            </span>
          )}

          <span style={{ color: '#727784' }}>STATUS:</span>
          <span style={{ background: '#d8e2ff', color: '#001a41', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
            {title ? 'COMPOSING DRAFT' : 'NEW REQUISITION'}
          </span>
        </div>
      </section> */}

      {/* 2. Header & Action Ribbon */}
      <header className="pj-header-section">
        <div className="pj-title-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="pj-stage-tag">{isEditMode ? 'Edit Existing Requisition' : 'AEC Talent Deployment'}</span>
            <span style={{ color: '#727784' }}>/</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              {isEditMode ? 'REQUISITION MODIFIER' : 'REQUISITION BUILDER'}
            </span>

            {/* Live Job Post Credits Pill */}
            {isCheckingQuota ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                Checking job post credits...
              </span>
            ) : quota ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: quota.isLimitReached ? '#fee2e2' : '#e0f2fe',
                  color: quota.isLimitReached ? '#991b1b' : '#0369a1',
                  border: `1px solid ${quota.isLimitReached ? '#fecaca' : '#bae6fd'}`,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                title={
                  quota.isLimitReached
                    ? '0 job post credits remaining on current plan'
                    : 'Available job posting credits on current plan'
                }
              >
                <span>{quota.planName.toUpperCase()}</span>
                <span>•</span>
                <span>
                  {quota.jobPostLimit === null
                    ? 'UNLIMITED CREDITS'
                    : `${quota.remainingJobs ?? 0} OF ${quota.jobPostLimit} CREDIT${quota.jobPostLimit === 1 ? '' : 'S'} REMAINING`}
                </span>
              </span>
            ) : null}
          </div>
          <h1 className="pj-main-heading">{isEditMode ? 'Edit Job Requisition' : 'Post a New Job Opportunity'}</h1>
          <p className="pj-lead-description">
            {isEditMode
              ? 'Update the job specifications below to reflect changes across the verified AEC talent network.'
              : 'Complete the job specifications below to publish your opening directly to verified AEC professionals and talent pools.'}
          </p>

          {/* Quota Limit Alert Banner if Reached (For new job posts or draft publishing) */}
          {requiresJobCredit && quota && quota.isLimitReached && (
            <div
              style={{
                marginTop: '12px',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9f1239', fontSize: '13px', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  lock
                </span>
                <span>
                  <strong>No Job Post Credits Remaining:</strong> Your {quota.planName} has used {quota.totalJobsCount} of {quota.jobPostLimit} allowed job post credit{quota.jobPostLimit === 1 ? '' : 's'} (0 remaining).
                  You can save this job as a draft, or upgrade your plan to publish.
                </span>
              </div>
              {onNavigateToSubscription && (
                <button
                  type="button"
                  onClick={onNavigateToSubscription}
                  style={{
                    background: '#e11d48',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          )}
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

      {/* Loading state when fetching existing job data */}
      {isLoadingJob ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '14px', padding: '60px 20px' }}>
          <div style={{ width: '38px', height: '38px', border: '3px solid #e2e8f0', borderTopColor: '#00418f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Loading requisition details...</p>
        </div>
      ) : (
        <>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="pj-field-label" htmlFor="job-category-select">
                    <span>Category *</span>
                  </label>
                  <button
                    type="button"
                    onClick={openCustomCategoryModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00418f',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '0 4px',
                      textDecoration: 'underline',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    + Add Custom Category
                  </button>
                </div>
                <select
                  id="job-category-select"
                  className={`pj-select-input ${touched.category && errors.category ? 'error' : ''}`}
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '__ADD_CUSTOM__') {
                      openCustomCategoryModal()
                      return
                    }
                    setCategory(val)
                  }}
                  onBlur={() => handleBlur('category')}
                  aria-invalid={touched.category && !!errors.category}
                >
                  <option value="">Select Domain Category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__ADD_CUSTOM__" style={{ fontWeight: 700, color: '#00418f' }}>
                    + Add Custom Category...
                  </option>
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

              {/* Project Type (Multi-select) */}
              <div className="pj-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <label className="pj-field-label" style={{ marginBottom: 0 }}>
                    <span>Project Type *</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Select one or more</span>
                  </label>
                  <button
                    type="button"
                    onClick={openCustomProjectTypeModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00418f',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '0 4px',
                      textDecoration: 'underline',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    + Add Custom Project Type
                  </button>
                </div>

                <div className="pills-cloud-selector" style={{ marginTop: '8px' }}>
                  {projectTypes.map((pt) => {
                    const isSelected = selectedProjectTypes.some((s) => s.toLowerCase() === pt.toLowerCase())
                    return (
                      <button
                        key={pt}
                        type="button"
                        className={`pill-option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleProjectType(pt)}
                        aria-pressed={isSelected}
                      >
                        <span>{pt}</span>
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

              {/* Location(s) */}
              <div className="pj-field-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <label className="pj-field-label" htmlFor="location-input" style={{ marginBottom: 0 }}>
                    <span>Location(s) *</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Studio / City Base(s)</span>
                  </label>
                  {locations.length > 1 && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                      {locations.length} locations selected
                    </span>
                  )}
                </div>

                {/* Selected Location Chips */}
                {locations.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {locations.map((loc) => (
                      <span
                        key={loc}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#00418f',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 600,
                          boxShadow: '0 1px 3px rgba(0, 65, 143, 0.2)',
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }} aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {loc}
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(loc)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            color: '#ffffff',
                            cursor: 'pointer',
                            padding: '2px',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            lineHeight: 1,
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                          title={`Remove ${loc}`}
                          aria-label={`Remove ${loc}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input box with Add button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f3f3f6',
                    borderRadius: '8px',
                    padding: '2px 8px 2px 10px',
                    gap: '6px',
                    border: touched.location && errors.location ? '1px solid #dc2626' : '1px solid transparent',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#727784" strokeWidth="2" style={{ width: '18px', height: '18px', flexShrink: 0 }} aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    id="location-input"
                    type="text"
                    placeholder="Type a city (e.g. Pune, Bangaluru) and press Enter..."
                    className="pj-text-input"
                    style={{ background: 'transparent', border: 'none', flex: 1, padding: '10px 4px' }}
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        if (locationInput.trim()) {
                          handleAddLocation(locationInput)
                          setLocationInput('')
                        }
                      }
                    }}
                    onBlur={() => {
                      if (locationInput.trim()) {
                        handleAddLocation(locationInput)
                        setLocationInput('')
                      }
                      handleBlur('location')
                    }}
                    aria-invalid={touched.location && !!errors.location}
                  />
                  {locationInput.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        handleAddLocation(locationInput)
                        setLocationInput('')
                      }}
                      style={{
                        background: '#00418f',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + Add
                    </button>
                  )}
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

                {/* Popular Cities Quick Select */}
                <div className="pj-chips-cloud">
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Quick Select:</span>
                  {POPULAR_CITIES.map((c) => {
                    const isSelected = locations.some((l) => l.toLowerCase() === c.toLowerCase())
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`pj-quick-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => handleToggleLocation(c)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {c}
                      </button>
                    )
                  })}
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
                  <h2 className="pj-section-title" id="sec-compensation-title">3. Salary Range (Optional)</h2>
                  <span className="pj-section-subline">COMPENSATION &amp; TRANSPARENCY</span>
                </div>
              </div>
              <span className="optional-badge">OPTIONAL</span>
            </div>

            {/* Salary Period Selector */}
            <div className="pj-field-group pj-salary-period-wrap">
              <label className="pj-field-label">
                <span>Salary Period</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                  {salaryPeriod === 'yearly_lpa' ? 'Annualized LPA Scale' : 'Monthly INR Remuneration'}
                </span>
              </label>
              <div className="segmented-pill-selector" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '280px' }}>
                <button
                  type="button"
                  className={`segmented-pill-btn ${salaryPeriod === 'monthly' ? 'active' : ''}`}
                  onClick={() => handleSalaryPeriodChange('monthly')}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`segmented-pill-btn ${salaryPeriod === 'yearly_lpa' ? 'active' : ''}`}
                  onClick={() => handleSalaryPeriodChange('yearly_lpa')}
                >
                  Yearly (LPA)
                </button>
              </div>
            </div>

            {/* Responsive Salary Inputs: Side by side on desktop, stacked on mobile */}
            <div className="pj-salary-grid">
              {/* Minimum Salary */}
              <div className="pj-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="pj-field-label" htmlFor="min-salary-input">
                    <span>Minimum Salary</span>
                  </label>
                  {salaryPeriod === 'monthly' && salaryMin && formatIndianWords(salaryMin) && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                      ≈ {formatIndianWords(salaryMin)} / mo
                    </span>
                  )}
                  {salaryPeriod === 'yearly_lpa' && salaryMin && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                      ≈ ₹{salaryMin} Lakhs / yr
                    </span>
                  )}
                </div>
                <div className="pj-input-with-affixes">
                  <span className="pj-input-prefix">₹</span>
                  <input
                    id="min-salary-input"
                    type="text"
                    inputMode={salaryPeriod === 'monthly' ? 'numeric' : 'decimal'}
                    placeholder={salaryPeriod === 'monthly' ? 'e.g. 30,000' : 'e.g. 3.6'}
                    className={`pj-text-input has-prefix ${salaryPeriod === 'monthly' ? 'has-suffix-monthly' : 'has-suffix-lpa'} ${touched.salaryMin && errors.salaryMin ? 'error' : ''}`}
                    value={salaryMin}
                    onChange={(e) => handleSalaryChange('min', e.target.value)}
                    onBlur={() => handleBlur('salaryMin')}
                  />
                  <span className="pj-input-suffix">
                    {salaryPeriod === 'monthly' ? '/ month' : 'LPA'}
                  </span>
                </div>
              </div>

              {/* Maximum Salary */}
              <div className="pj-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="pj-field-label" htmlFor="max-salary-input">
                    <span>Maximum Salary</span>
                  </label>
                  {salaryPeriod === 'monthly' && salaryMax && formatIndianWords(salaryMax) && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                      ≈ {formatIndianWords(salaryMax)} / mo
                    </span>
                  )}
                  {salaryPeriod === 'yearly_lpa' && salaryMax && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 600 }}>
                      ≈ ₹{salaryMax} Lakhs / yr
                    </span>
                  )}
                </div>
                <div className="pj-input-with-affixes">
                  <span className="pj-input-prefix">₹</span>
                  <input
                    id="max-salary-input"
                    type="text"
                    inputMode={salaryPeriod === 'monthly' ? 'numeric' : 'decimal'}
                    placeholder={salaryPeriod === 'monthly' ? 'e.g. 50,000' : 'e.g. 6.0'}
                    className={`pj-text-input has-prefix ${salaryPeriod === 'monthly' ? 'has-suffix-monthly' : 'has-suffix-lpa'} ${touched.salaryMax && errors.salaryMax ? 'error' : ''}`}
                    value={salaryMax}
                    onChange={(e) => handleSalaryChange('max', e.target.value)}
                    onBlur={() => handleBlur('salaryMax')}
                  />
                  <span className="pj-input-suffix">
                    {salaryPeriod === 'monthly' ? '/ month' : 'LPA'}
                  </span>
                </div>
              </div>
            </div>

            {(errors.salaryMin || errors.salaryMax) && (
              <span className="pj-field-error" style={{ marginTop: '8px' }}>
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
      </main>

      {/* 4. Sticky Bottom Deployment Bar */}
      <footer className="pj-bottom-launch-bar" aria-label="Deployment Controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: requiresJobCredit && quota?.isLimitReached ? '#fee2e2' : '#d8e2ff',
              color: requiresJobCredit && quota?.isLimitReached ? '#dc2626' : '#00418f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {requiresJobCredit && quota?.isLimitReached ? (
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                lock
              </span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </div>
          <div>
            <strong style={{ fontSize: '14px', color: requiresJobCredit && quota?.isLimitReached ? '#991b1b' : '#1a1c1e', display: 'block' }}>
              {requiresJobCredit && quota?.isLimitReached
                ? `No Job Post Credits Remaining (${quota.totalJobsCount}/${quota.jobPostLimit} Used)`
                : isEditMode
                ? 'Ready to Save Requisition Changes'
                : 'Ready to Launch Job Requisition'}
            </strong>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              {requiresJobCredit && quota?.isLimitReached
                ? `Upgrade your ${quota.planName} to publish, or save this job as a draft`
                : isEditMode
                ? 'Instant sync across Castallio network & candidate radar'
                : quota && quota.jobPostLimit !== null
                ? `${quota.remainingJobs ?? 0} of ${quota.jobPostLimit} job post credit${quota.jobPostLimit === 1 ? '' : 's'} remaining on ${quota.planName}`
                : 'Instant publication to Castallio network & matching talent alerts'}
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
            disabled={isSubmitting || (requiresJobCredit && isCheckingQuota)}
            style={
              requiresJobCredit && quota?.isLimitReached
                ? { background: '#e11d48', borderColor: '#e11d48' }
                : undefined
            }
          >
            {isSubmitting ? (
              <span>{isEditMode ? 'Saving Changes...' : 'Publishing...'}</span>
            ) : requiresJobCredit && isCheckingQuota ? (
              <span>Checking Credits...</span>
            ) : requiresJobCredit && quota?.isLimitReached ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  lock
                </span>
                <span>Limit Reached — Upgrade to Publish</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                </svg>
                <span>{isEditMode ? 'Save & Update Job' : 'Publish Job Post'}</span>
              </>
            )}
          </button>
        </div>
      </footer>
        </>
      )}

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
                {selectedProjectTypes.length > 0 ? (
                  selectedProjectTypes.map((pt) => (
                    <span key={pt} className="preview-badge">{pt} Project</span>
                  ))
                ) : (
                  <span className="preview-badge">{projectType || 'Standard'} Project</span>
                )}
                <span className="preview-badge">{experience || 'Any Experience'}</span>
                {employmentTypes.map((et) => (
                  <span key={et} className="preview-badge">{et}</span>
                ))}
                <span className="preview-badge">{numberOfOpenings} {numberOfOpenings > 1 ? 'Openings' : 'Opening'}</span>
                {(salaryMin || salaryMax) && (
                  <span className="preview-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                    {salaryPeriod === 'yearly_lpa'
                      ? `₹ ${salaryMin || '0'} - ${salaryMax || 'Negotiable'} LPA`
                      : `₹ ${salaryMin ? formatIndianNumber(salaryMin) : '0'} - ${salaryMax ? formatIndianNumber(salaryMax) : 'Negotiable'} / month`}
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
              {isEditMode ? 'Job Successfully Updated!' : 'Job Successfully Published!'}
            </h2>
            <p style={{ fontSize: '14px', color: '#424753', margin: '0 0 20px' }}>
              {isEditMode ? (
                <>
                  Your job post <strong>"{title}"</strong> has been successfully updated across Castallio One.
                </>
              ) : (
                <>
                  Your job post <strong>"{title}"</strong> is now live on Castallio One with a 15-day active validity window.
                </>
              )}
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

      {/* ── MODAL: Quota Exceeded ── */}
      {isQuotaExceededModalOpen && (
        <div className="pj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="quota-modal-title">
          <div className="pj-modal-dialog" style={{ textAlign: 'center', padding: '32px 24px', maxWidth: '480px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                lock
              </span>
            </div>
            <h2 id="quota-modal-title" style={{ fontFamily: 'Hanken Grotesk', fontSize: '22px', color: '#1a1c1e', margin: '0 0 10px' }}>
              Job Posting Limit Reached
            </h2>
            <p style={{ fontSize: '14px', color: '#424753', margin: '0 0 16px', lineHeight: '1.5' }}>
              Your workspace is currently on the <strong>{quota?.planName || 'Free Plan'}</strong>, which allows a total of{' '}
              <strong>{quota?.jobPostLimit ?? 1} job post{quota?.jobPostLimit === 1 ? '' : 's'}</strong> for this billing period.
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '13px', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Total Jobs Posted:</span>
                <strong style={{ color: '#dc2626' }}>{quota?.totalJobsCount || 1} / {quota?.jobPostLimit ?? 1}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Remaining Quota:</span>
                <strong>0 jobs</strong>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: '1.4' }}>
              To publish this job immediately, upgrade to <strong>Starter (2 jobs)</strong>, <strong>Professional (5 jobs)</strong>, or <strong>Unlimited</strong>. You can also save this requisition as a draft for now.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {onNavigateToSubscription && (
                <button
                  type="button"
                  className="btn-pj-primary"
                  onClick={() => {
                    setIsQuotaExceededModalOpen(false)
                    onNavigateToSubscription()
                  }}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    upgrade
                  </span>
                  <span>Upgrade Subscription Plan</span>
                </button>
              )}
              <button
                type="button"
                className="btn-pj-light"
                onClick={async () => {
                  setIsQuotaExceededModalOpen(false)
                  await handleSaveDraft()
                }}
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
              >
                Save as Draft Instead
              </button>
              <button
                type="button"
                onClick={() => setIsQuotaExceededModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}
              >
                Cancel &amp; Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Custom Category ── */}
      {isCustomCategoryModalOpen && (
        <div
          className="pj-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-custom-category-title"
        >
          <div className="pj-modal-dialog" style={{ maxWidth: '460px' }}>
            <div className="pj-modal-header">
              <div>
                <h2 id="add-custom-category-title">Add Custom Category</h2>
                <span style={{ fontSize: '11.5px', color: '#727784' }}>
                  Define a specialized AEC discipline or role classification
                </span>
              </div>
              <button
                type="button"
                className="pj-modal-close"
                onClick={closeCustomCategoryModal}
                aria-label="Close modal"
                disabled={isAddingCustomCategory}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleAddCustomCategory()
              }}
            >
              <div className="pj-modal-body" style={{ gap: '12px' }}>
                <div className="pj-field-group">
                  <label className="pj-field-label" htmlFor="custom-category-name-input">
                    <span>Category Name *</span>
                  </label>
                  <input
                    id="custom-category-name-input"
                    type="text"
                    autoFocus
                    placeholder="Enter category name (e.g. Geotechnical Engineering)"
                    className={`pj-text-input ${customCategoryError ? 'error' : ''}`}
                    value={customCategoryInput}
                    onChange={(e) => {
                      setCustomCategoryInput(e.target.value)
                      if (customCategoryError) setCustomCategoryError(null)
                    }}
                    disabled={isAddingCustomCategory}
                  />
                  {customCategoryError && (
                    <span className="pj-field-error" role="alert" style={{ marginTop: '4px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {customCategoryError}
                    </span>
                  )}
                </div>
              </div>

              <div className="pj-modal-footer">
                <button
                  type="button"
                  className="btn-pj-light"
                  onClick={closeCustomCategoryModal}
                  disabled={isAddingCustomCategory}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pj-primary"
                  disabled={isAddingCustomCategory || !customCategoryInput.trim()}
                >
                  {isAddingCustomCategory ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Add Custom Project Type Modal */}
      {isCustomProjectTypeModalOpen && (
        <div
          className="pj-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-project-type-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isAddingCustomProjectType) {
              closeCustomProjectTypeModal()
            }
          }}
        >
          <div className="pj-modal-dialog" style={{ maxWidth: '460px' }}>
            <div className="pj-modal-header">
              <div>
                <h2 id="custom-project-type-modal-title">Add Custom Project Type</h2>
                <span style={{ fontSize: '11.5px', color: '#727784' }}>
                  Define a specialized project scope or sector classification
                </span>
              </div>
              <button
                type="button"
                className="pj-modal-close"
                onClick={closeCustomProjectTypeModal}
                aria-label="Close modal"
                disabled={isAddingCustomProjectType}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleAddCustomProjectType()
              }}
            >
              <div className="pj-modal-body" style={{ gap: '12px' }}>
                <div className="pj-field-group">
                  <label className="pj-field-label" htmlFor="custom-project-type-name-input">
                    <span>Project Type *</span>
                  </label>
                  <input
                    id="custom-project-type-name-input"
                    type="text"
                    autoFocus
                    placeholder="Enter project type"
                    className={`pj-text-input ${customProjectTypeError ? 'error' : ''}`}
                    value={customProjectTypeInput}
                    onChange={(e) => {
                      setCustomProjectTypeInput(e.target.value)
                      if (customProjectTypeError) setCustomProjectTypeError(null)
                    }}
                    disabled={isAddingCustomProjectType}
                  />
                  {customProjectTypeError && (
                    <span className="pj-field-error" role="alert" style={{ marginTop: '4px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {customProjectTypeError}
                    </span>
                  )}
                </div>
              </div>

              <div className="pj-modal-footer">
                <button
                  type="button"
                  className="btn-pj-light"
                  onClick={closeCustomProjectTypeModal}
                  disabled={isAddingCustomProjectType}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pj-primary"
                  disabled={isAddingCustomProjectType || !customProjectTypeInput.trim()}
                >
                  {isAddingCustomProjectType ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostJob
