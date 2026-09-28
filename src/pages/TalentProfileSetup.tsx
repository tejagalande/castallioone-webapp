import React, { useRef, useState } from 'react'
import {
  useTalentProfileSetup,
  PREDEFINED_CORE_SOFTWARE,
  PREDEFINED_TECH_SKILLS,
  PREDEFINED_SOFT_SKILLS,
  DISCIPLINES,
  WORK_MODES,
  AVAILABILITY_OPTIONS,
  EMPLOYMENT_TYPES,
  NOTICE_PERIODS,
  POPULAR_LOCATIONS,
  formatIndianNumber,
  getIndianCurrencyWords,
} from '../hooks/useTalentProfileSetup'
import { YearPicker } from '../components/YearPicker'
import './TalentProfileSetup.css'

interface TalentProfileSetupProps {
  userId?: string
  userEmail?: string
  userName?: string
  onSetupSuccess: () => void
  onLogout: () => void
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void
}

export const TalentProfileSetup: React.FC<TalentProfileSetupProps> = ({
  userId,
  userEmail,
  userName,
  onSetupSuccess,
  onLogout,
  showToast,
}) => {
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [showCompletenessDetails, setShowCompletenessDetails] = useState(false)

  const {
    currentStep,
    formData,
    errors,
    touched,
    isSubmitting,
    completeness,
    updateField,
    handleBlur,
    goToNextStep,
    goToPrevStep,
    handleSubmit,

    // File handlers
    handleProfileImageUpload,
    removeProfileImage,
    handleResumeUpload,
    removeResume,

    // Locations
    customLocationInput,
    setCustomLocationInput,
    toggleLocation,
    addCustomLocation,

    // Skills
    customSoftwareInput,
    setCustomSoftwareInput,
    toggleCoreSoftware,
    addCustomSoftware,

    customTechSkillInput,
    setCustomTechSkillInput,
    toggleTechSkill,
    addCustomTechSkill,

    customSoftSkillInput,
    setCustomSoftSkillInput,
    toggleSoftSkill,
    addCustomSoftSkill,

    // Experience
    addExperienceCard,
    updateExperience,
    removeExperience,

    // Certificates
    addCertificateCard,
    updateCertificate,
    handleCertificateDocUpload,
    removeCertificate,
  } = useTalentProfileSetup({
    userId,
    userEmail,
    userName,
    onSuccess: onSetupSuccess,
    showToast,
  })

  // Circumference for the circular progress gauge
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (completeness.score / 100) * circumference

  const getFieldClass = (field: keyof typeof formData) => {
    if (errors[field as string]) return 'has-error'
    if (touched[field as string] && formData[field]) return 'is-valid'
    return ''
  }

  return (
    <div className="talent-setup-page">
      <div className="setup-grid-bg" />

      <main className="talent-setup-container">
        {/* Header */}
        <header className="setup-header">
          <div className="setup-header-top">
            <div className="setup-brand">
              <span className="brand-dot" />
              <span>Castallio One</span>
              <span className="setup-badge">Talent Onboarding</span>
            </div>
            <button
              type="button"
              className="setup-logout-btn"
              onClick={onLogout}
              id="talentSetupLogoutBtn"
              aria-label="Log out of Castallio One"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>

          <div className="setup-title-group">
            <h1>Build Your AEC Talent Passport</h1>
            <p>
              Complete your standardized profile to unlock verified recruiter visibility, direct job offers, and BIM precision matching.
            </p>
          </div>

          {/* Real-time Profile Completeness Banner */}
          <div className="completeness-hero-card">
            <div className="completeness-left">
              <div className="completeness-gauge-wrap">
                <svg className="completeness-gauge" viewBox="0 0 100 100">
                  <circle
                    className="gauge-bg"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    strokeWidth="8"
                  />
                  <circle
                    className="gauge-progress"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    stroke={completeness.tierColor}
                  />
                </svg>
                <div className="gauge-text">
                  <span className="gauge-number">{completeness.score}%</span>
                  <span className="gauge-sub">DONE</span>
                </div>
              </div>

              <div className="completeness-info">
                <div className="completeness-title-row">
                  <h3>Profile Completeness Score</h3>
                  <span
                    className="tier-badge"
                    style={{
                      backgroundColor: `${completeness.tierColor}18`,
                      color: completeness.tierColor,
                      borderColor: `${completeness.tierColor}40`,
                    }}
                  >
                    {completeness.tier} Profile
                  </span>
                </div>
                <p className="completeness-hint">
                  {completeness.score >= 90
                    ? 'Outstanding! Your profile is fully optimized for top architecture & engineering firms.'
                    : completeness.score >= 70
                    ? 'Strong blueprint! Add your technical skills and resume to achieve All-Star ranking.'
                    : 'Fill in your academic and skills details to boost profile visibility to 3x more employers.'}
                </p>

                {/* Linear progress bar */}
                <div className="completeness-bar-track">
                  <div
                    className="completeness-bar-fill"
                    style={{
                      width: `${completeness.score}%`,
                      background: `linear-gradient(90deg, #00418f 0%, ${completeness.tierColor} 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="completeness-details-toggle"
              onClick={() => setShowCompletenessDetails(!showCompletenessDetails)}
              aria-expanded={showCompletenessDetails}
              id="toggleCompletenessBreakdownBtn"
            >
              <span>{showCompletenessDetails ? 'Hide Checklist' : 'Score Checklist'}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: showCompletenessDetails ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Expandable Checklist Details */}
          {showCompletenessDetails && (
            <div className="completeness-breakdown-panel">
              <div className="breakdown-grid">
                {completeness.items.map((item) => (
                  <div key={item.id} className={`breakdown-chip ${item.isDone ? 'done' : 'pending'}`}>
                    <span className="check-icon">
                      {item.isDone ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="pending-dot" />
                      )}
                    </span>
                    <span className="chip-name">{item.label}</span>
                    <span className="chip-weight">+{item.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Navigation Indicator */}
          <nav className="setup-steps-nav" aria-label="Onboarding Steps">
            <button
              type="button"
              className={`step-nav-btn ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
              onClick={goToPrevStep}
              id="step1NavBtn"
            >
              <div className="step-nav-num">
                {currentStep > 1 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  '1'
                )}
              </div>
              <div className="step-nav-content">
                <span className="step-nav-sub">STEP 1</span>
                <span className="step-nav-title">Profile & Career Blueprint</span>
              </div>
            </button>

            <div className={`step-connector ${currentStep >= 2 ? 'active' : ''}`} />

            <button
              type="button"
              className={`step-nav-btn ${currentStep === 2 ? 'active' : ''}`}
              onClick={goToNextStep}
              id="step2NavBtn"
            >
              <div className="step-nav-num">2</div>
              <div className="step-nav-content">
                <span className="step-nav-sub">STEP 2</span>
                <span className="step-nav-title">Technical Skills & Credentials</span>
              </div>
            </button>
          </nav>
        </header>

        {/* STEP 1: PROFILE & CAREER BLUEPRINT */}
        {currentStep === 1 && (
          <section className="setup-card" aria-labelledby="step1Heading">
            <div className="setup-card-header">
              <div className="step-badge-tag">STEP 1 OF 2</div>
              <h2 id="step1Heading">Profile, Identity & Work Preferences</h2>
              <p>Personal details, academic discipline, job preferences, and resume attachment.</p>
            </div>

            <form
              className="setup-form"
              onSubmit={(e) => {
                e.preventDefault()
                goToNextStep()
              }}
              noValidate
            >
              {/* ── 1. AVATAR & BASIC DETAILS ── */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  Personal & Contact Identity
                </h3>

                {/* Profile Image */}
                <div className="form-group">
                  <label className="form-label" htmlFor="talentProfileImageInput">
                    <span className="label-title">User Profile Photo <span className="req-star">*</span></span>
                    <span className="field-hint">(JPG, PNG, or WEBP, max 5 MB)</span>
                  </label>

                  <div className="avatar-upload-box">
                    <div className="avatar-preview-wrapper">
                      {formData.profileImagePreview ? (
                        <img
                          src={formData.profileImagePreview}
                          alt="Profile Preview"
                          className="avatar-preview-img"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="avatar-controls">
                      <input
                        ref={profileImageInputRef}
                        id="talentProfileImageInput"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => handleProfileImageUpload(e.target.files?.[0] || null)}
                      />
                      <button
                        type="button"
                        className="btn-upload-file"
                        onClick={() => profileImageInputRef.current?.click()}
                        id="uploadProfileImageBtn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>{formData.profileImagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                      </button>

                      {formData.profileImagePreview && (
                        <button
                          type="button"
                          className="btn-remove-file"
                          onClick={removeProfileImage}
                          id="removeProfileImageBtn"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  {/* Full Name */}
                  <div className={`form-group ${getFieldClass('fullName')}`}>
                    <label className="form-label" htmlFor="fullNameInput">
                      Full Name <span className="req-star">*</span>
                    </label>
                    <input
                      id="fullNameInput"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Alex Morgan"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                    />
                    {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                    {!errors.fullName && touched.fullName && formData.fullName && (
                      <span className="field-valid-hint">✓ Looks good</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className={`form-group ${getFieldClass('email')}`}>
                    <label className="form-label" htmlFor="emailInput">
                      Official Email <span className="req-star">*</span>
                    </label>
                    <input
                      id="emailInput"
                      type="email"
                      className="form-input"
                      placeholder="e.g. alex.morgan@bimcad.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                    {!errors.email && touched.email && formData.email && (
                      <span className="field-valid-hint">✓ Valid email</span>
                    )}
                  </div>
                </div>

                <div className="form-grid-2">
                  {/* Contact Number */}
                  <div className={`form-group ${getFieldClass('contactNumber')}`}>
                    <label className="form-label" htmlFor="contactNumberInput">
                      Contact Number <span className="req-star">*</span>
                    </label>
                    <input
                      id="contactNumberInput"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 98765 43210 or +91 98765 43210"
                      value={formData.contactNumber}
                      onChange={(e) => updateField('contactNumber', e.target.value)}
                      onBlur={() => handleBlur('contactNumber')}
                    />
                    {errors.contactNumber && <span className="field-error">{errors.contactNumber}</span>}
                    {!errors.contactNumber && touched.contactNumber && formData.contactNumber && (
                      <span className="field-valid-hint">✓ Valid phone</span>
                    )}
                  </div>

                  {/* City */}
                  <div className={`form-group ${getFieldClass('city')}`}>
                    <label className="form-label" htmlFor="cityInput">
                      Current City <span className="req-star">*</span>
                    </label>
                    <input
                      id="cityInput"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Bengaluru, Mumbai, London"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      onBlur={() => handleBlur('city')}
                    />
                    {errors.city && <span className="field-error">{errors.city}</span>}
                    {!errors.city && touched.city && formData.city && (
                      <span className="field-valid-hint">✓ City entered</span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="form-group">
                  <div className="label-row">
                    <label className="form-label" htmlFor="bioInput">
                      Professional Bio <span className="req-star">*</span>
                    </label>
                    <span className="char-count">{formData.bio.length} chars</span>
                  </div>
                  <textarea
                    id="bioInput"
                    className="form-textarea"
                    rows={3}
                    placeholder="Brief summary of your AEC expertise, BIM specialization, structural modeling, or design philosophy..."
                    value={formData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    onBlur={() => handleBlur('bio')}
                  />
                </div>
              </div>

              {/* ── 2. ACADEMIC DETAILS ── */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </span>
                  Academic Background
                </h3>

                <div className="form-grid-3">
                  {/* Institute Name */}
                  <div className={`form-group ${getFieldClass('instituteName')}`}>
                    <label className="form-label" htmlFor="instituteNameInput">
                      Institute / University Name <span className="req-star">*</span>
                    </label>
                    <input
                      id="instituteNameInput"
                      type="text"
                      className="form-input"
                      placeholder="e.g. CEPT University, IIT Bombay"
                      value={formData.instituteName}
                      onChange={(e) => updateField('instituteName', e.target.value)}
                      onBlur={() => handleBlur('instituteName')}
                    />
                    {errors.instituteName && <span className="field-error">{errors.instituteName}</span>}
                    {!errors.instituteName && touched.instituteName && formData.instituteName && (
                      <span className="field-valid-hint">✓ Verified</span>
                    )}
                  </div>

                  {/* Discipline */}
                  <div className={`form-group ${getFieldClass('discipline')}`}>
                    <label className="form-label" htmlFor="disciplineSelect">
                      Discipline <span className="req-star">*</span>
                    </label>
                    <select
                      id="disciplineSelect"
                      className="form-select"
                      value={formData.discipline}
                      onChange={(e) => updateField('discipline', e.target.value)}
                      onBlur={() => handleBlur('discipline')}
                    >
                      <option value="">Select your discipline</option>
                      {DISCIPLINES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {errors.discipline && <span className="field-error">{errors.discipline}</span>}
                  </div>

                  {/* Graduation Year */}
                  <div className={`form-group ${getFieldClass('graduationYear')}`}>
                    <label className="form-label" htmlFor="gradYearPicker">
                      Graduation Year <span className="req-star">*</span>
                    </label>
                    <YearPicker
                      id="gradYearPicker"
                      value={formData.graduationYear}
                      onChange={(yr) => updateField('graduationYear', yr)}
                      onBlur={() => handleBlur('graduationYear')}
                      hasError={Boolean(errors.graduationYear)}
                      placeholder="Select graduation year..."
                      ariaLabel="Select Graduation Year"
                      maxYear={new Date().getFullYear() + 10}
                    />
                    {errors.graduationYear && <span className="field-error">{errors.graduationYear}</span>}
                  </div>
                </div>
              </div>

              {/* ── 3. WORK PREFERENCES & AVAILABILITY ── */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </span>
                  Work Mode, Relocation & Career Preferences
                </h3>

                <div className="form-grid-2">
                  {/* Work Mode */}
                  <div className="form-group">
                    <label className="form-label">
                      Work Mode <span className="req-star">*</span>
                    </label>
                    <div className="pill-choice-group">
                      {WORK_MODES.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className={`pill-choice-btn ${formData.workMode === mode ? 'selected' : ''}`}
                          onClick={() => updateField('workMode', mode)}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Relocation */}
                  <div className="form-group">
                    <label className="form-label">
                      Willing to Relocate? <span className="req-star">*</span>
                    </label>
                    <div className="pill-choice-group">
                      <button
                        type="button"
                        className={`pill-choice-btn ${formData.willingToRelocate === 'yes' ? 'selected' : ''}`}
                        onClick={() => updateField('willingToRelocate', 'yes')}
                      >
                        Yes, Willing
                      </button>
                      <button
                        type="button"
                        className={`pill-choice-btn ${formData.willingToRelocate === 'open' ? 'selected' : ''}`}
                        onClick={() => updateField('willingToRelocate', 'open')}
                      >
                        Open to Discuss
                      </button>
                      <button
                        type="button"
                        className={`pill-choice-btn ${formData.willingToRelocate === 'no' ? 'selected' : ''}`}
                        onClick={() => updateField('willingToRelocate', 'no')}
                      >
                        No (Local Only)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preferred Locations */}
                <div className={`form-group ${errors.preferredLocations ? 'has-error' : ''}`}>
                  <label className="form-label">
                    <span className="label-title">Preferred Job Locations <span className="req-star">*</span></span>
                    <span className="field-hint">(Select multiple or add your own)</span>
                  </label>

                  <div className="tags-interactive-wrap">
                    {POPULAR_LOCATIONS.map((loc) => {
                      const isSelected = formData.preferredLocations.includes(loc)
                      return (
                        <button
                          key={loc}
                          type="button"
                          className={`tag-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleLocation(loc)}
                        >
                          <span>{loc}</span>
                          {isSelected && <span className="chip-remove-x">✓</span>}
                        </button>
                      )
                    })}
                  </div>

                  {/* Add custom location input */}
                  <div className="custom-tag-input-row">
                    <input
                      type="text"
                      className="form-input custom-tag-input"
                      placeholder="Add another city (e.g. Hyderabad, Singapore)"
                      value={customLocationInput}
                      onChange={(e) => setCustomLocationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomLocation()
                        }
                      }}
                      id="customLocationInput"
                    />
                    <button
                      type="button"
                      className="btn-add-tag"
                      onClick={addCustomLocation}
                      id="addCustomLocationBtn"
                    >
                      + Add Location
                    </button>
                  </div>
                  {errors.preferredLocations && (
                    <span className="field-error">{errors.preferredLocations}</span>
                  )}
                </div>

                <div className="form-grid-3">
                  {/* Availability */}
                  <div className={`form-group ${getFieldClass('availability')}`}>
                    <label className="form-label" htmlFor="availabilitySelect">
                      Availability <span className="req-star">*</span>
                    </label>
                    <select
                      id="availabilitySelect"
                      className="form-select"
                      value={formData.availability}
                      onChange={(e) => updateField('availability', e.target.value)}
                      onBlur={() => handleBlur('availability')}
                    >
                      <option value="">Select availability</option>
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Type */}
                  <div className={`form-group ${getFieldClass('employmentType')}`}>
                    <label className="form-label" htmlFor="employmentTypeSelect">
                      Employment Type <span className="req-star">*</span>
                    </label>
                    <select
                      id="employmentTypeSelect"
                      className="form-select"
                      value={formData.employmentType}
                      onChange={(e) => updateField('employmentType', e.target.value)}
                      onBlur={() => handleBlur('employmentType')}
                    >
                      <option value="">Select employment type</option>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notice Period */}
                  <div className={`form-group ${getFieldClass('noticePeriod')}`}>
                    <label className="form-label" htmlFor="noticePeriodSelect">
                      Notice Period <span className="req-star">*</span>
                    </label>
                    <select
                      id="noticePeriodSelect"
                      className="form-select"
                      value={formData.noticePeriod}
                      onChange={(e) => updateField('noticePeriod', e.target.value)}
                      onBlur={() => handleBlur('noticePeriod')}
                    >
                      <option value="">Select notice period</option>
                      {NOTICE_PERIODS.map((np) => (
                        <option key={np} value={np}>
                          {np}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Expected CTC */}
                <div className={`form-group ${getFieldClass('expectedCtc')}`}>
                  <label className="form-label" htmlFor="expectedCtcInput">
                    <span className="label-title">Expected CTC (Annual Salary) <span className="req-star">*</span></span>
                    <span className="field-hint">(Indian number format: e.g. 12,00,000)</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-lead-icon rupee-prefix">₹</span>
                    <input
                      id="expectedCtcInput"
                      type="text"
                      inputMode="numeric"
                      className="form-input"
                      placeholder="e.g. 12,00,000"
                      value={formData.expectedCtc}
                      onChange={(e) => updateField('expectedCtc', formatIndianNumber(e.target.value))}
                      onBlur={() => handleBlur('expectedCtc')}
                      maxLength={15}
                    />
                  </div>
                  {errors.expectedCtc && <span className="field-error">{errors.expectedCtc}</span>}
                  {!errors.expectedCtc && touched.expectedCtc && formData.expectedCtc && (
                    <span className="field-valid-hint">
                      ✓ {getIndianCurrencyWords(formData.expectedCtc) || `₹${formData.expectedCtc} / yr`}
                    </span>
                  )}
                </div>
              </div>

              {/* ── 4. RESUME & PORTFOLIO LINKS ── */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </span>
                  Resume & Online Credentials
                </h3>

                {/* Resume Upload (PDF) */}
                <div className="form-group">
                  <label className="form-label" htmlFor="resumeFileInput">
                    <span className="label-title">Resume / CV (PDF) <span className="req-star">*</span></span>
                    <span className="field-hint">(Recommended for fast-track recruiter reviews, max 10 MB)</span>
                  </label>

                  <div className="resume-upload-card">
                    {formData.resumeFileName ? (
                      <div className="resume-attached-info">
                        <div className="pdf-icon-badge">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="pdf-details">
                          <span className="pdf-name">{formData.resumeFileName}</span>
                          <span className="pdf-size">{formData.resumeFileSize || 'PDF Document'} • Ready for analysis</span>
                        </div>
                        <button
                          type="button"
                          className="btn-remove-resume"
                          onClick={removeResume}
                          id="removeResumeBtn"
                          aria-label="Remove uploaded resume"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div
                        className="resume-drop-zone"
                        onClick={() => resumeInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          handleResumeUpload(e.dataTransfer.files?.[0] || null)
                        }}
                      >
                        <input
                          ref={resumeInputRef}
                          id="resumeFileInput"
                          type="file"
                          accept=".pdf,application/pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                        />
                        <div className="drop-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div className="drop-text">
                          <strong>Click to upload PDF</strong> or drag and drop your resume here
                        </div>
                        <span className="drop-meta">PDF format up to 10 MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-grid-2">
                  {/* Portfolio Link */}
                  <div className={`form-group ${getFieldClass('portfolioLink')}`}>
                    <label className="form-label" htmlFor="portfolioLinkInput">
                      <span className="label-title">Portfolio Link</span>
                      <span className="field-hint">(Optional)</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-lead-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </span>
                      <input
                        id="portfolioLinkInput"
                        type="url"
                        className="form-input"
                        placeholder="e.g. behance.net/username or myportfolio.com"
                        value={formData.portfolioLink}
                        onChange={(e) => updateField('portfolioLink', e.target.value)}
                        onBlur={() => handleBlur('portfolioLink')}
                      />
                    </div>
                    {errors.portfolioLink && <span className="field-error">{errors.portfolioLink}</span>}
                    {!errors.portfolioLink && touched.portfolioLink && formData.portfolioLink && (
                      <span className="field-valid-hint">✓ Valid portfolio link</span>
                    )}
                  </div>

                  {/* LinkedIn Link */}
                  <div className={`form-group ${getFieldClass('linkedinLink')}`}>
                    <label className="form-label" htmlFor="linkedinLinkInput">
                      <span className="label-title">LinkedIn Profile Link</span>
                      <span className="field-hint">(Optional)</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-lead-icon linkedin-icon">in</span>
                      <input
                        id="linkedinLinkInput"
                        type="url"
                        className="form-input"
                        placeholder="e.g. linkedin.com/in/alexmorgan-aec"
                        value={formData.linkedinLink}
                        onChange={(e) => updateField('linkedinLink', e.target.value)}
                        onBlur={() => handleBlur('linkedinLink')}
                      />
                    </div>
                    {errors.linkedinLink && <span className="field-error">{errors.linkedinLink}</span>}
                    {!errors.linkedinLink && touched.linkedinLink && formData.linkedinLink && (
                      <span className="field-valid-hint">✓ Valid LinkedIn profile</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions Step 1 */}
              <div className="setup-actions-bar">
                <div className="actions-left-meta">
                  <span className="step-counter">Step 1 of 2</span>
                  <span className="meta-text">Step 2: Technical Skills & Experience</span>
                </div>

                <button
                  type="submit"
                  className="btn-next-step"
                  id="btnProceedToStep2"
                >
                  <span>Continue to Technical Skills</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* STEP 2: TECHNICAL SKILLS, EXPERIENCE & CERTIFICATES */}
        {currentStep === 2 && (
          <section className="setup-card" aria-labelledby="step2Heading">
            <div className="setup-card-header">
              <div className="step-badge-tag">STEP 2 OF 2</div>
              <h2 id="step2Heading">Technical Skills, Work Experience & Certificates</h2>
              <p>Showcase your core software tools, parametric skills, past contributions, and licensed credentials.</p>
            </div>

            <form className="setup-form" onSubmit={handleSubmit} noValidate>
              {/* ── 1. TECHNICAL & SOFTWARE MASTERY ── */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </span>
                  Technical Skill Blueprint
                </h3>

                {/* Specific Skill */}
                <div className={`form-group ${getFieldClass('specificSkill')}`}>
                  <label className="form-label" htmlFor="specificSkillInput">
                    <span className="label-title">Specific Specialization Skill <span className="req-star">*</span></span>
                    <span className="field-hint">(Your primary niche, e.g. LOD-400 Clash Coordinator, Rhino Dynamo Façade Specialist)</span>
                  </label>
                  <input
                    id="specificSkillInput"
                    type="text"
                    className="form-input"
                    placeholder="e.g. LOD 400 BIM Coordination & Façade Dynamo Automation"
                    value={formData.specificSkill}
                    onChange={(e) => updateField('specificSkill', e.target.value)}
                    onBlur={() => handleBlur('specificSkill')}
                  />
                  {errors.specificSkill && <span className="field-error">{errors.specificSkill}</span>}
                  {!errors.specificSkill && touched.specificSkill && formData.specificSkill && (
                    <span className="field-valid-hint">✓ Specialization entered</span>
                  )}
                </div>

                {/* Core Software */}
                <div className={`form-group ${errors.coreSoftware ? 'has-error' : ''}`}>
                  <label className="form-label">
                    <span className="label-title">Core Software <span className="req-star">*</span></span>
                    <span className="field-hint">(Select your everyday design & engineering software)</span>
                  </label>

                  <div className="tags-interactive-wrap">
                    {PREDEFINED_CORE_SOFTWARE.map((soft) => {
                      const isSelected = formData.coreSoftware.includes(soft)
                      return (
                        <button
                          key={soft}
                          type="button"
                          className={`tag-chip soft-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleCoreSoftware(soft)}
                        >
                          <span className="chip-badge-letter">{soft.slice(0, 1)}</span>
                          <span>{soft}</span>
                          {isSelected && <span className="chip-remove-x">✓</span>}
                        </button>
                      )
                    })}
                    {/* Render any custom added core software */}
                    {formData.coreSoftware
                      .filter((s) => !PREDEFINED_CORE_SOFTWARE.includes(s))
                      .map((customSoft) => (
                        <button
                          key={customSoft}
                          type="button"
                          className="tag-chip soft-chip active custom"
                          onClick={() => toggleCoreSoftware(customSoft)}
                        >
                          <span className="chip-badge-letter">+</span>
                          <span>{customSoft}</span>
                          <span className="chip-remove-x">✕</span>
                        </button>
                      ))}
                  </div>

                  {/* Add Custom Software */}
                  <div className="custom-tag-input-row">
                    <input
                      type="text"
                      className="form-input custom-tag-input"
                      placeholder="Add another software (e.g. Rhino.Inside, Vectorworks, Procore)"
                      value={customSoftwareInput}
                      onChange={(e) => setCustomSoftwareInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomSoftware()
                        }
                      }}
                      id="customSoftwareInput"
                    />
                    <button
                      type="button"
                      className="btn-add-tag"
                      onClick={addCustomSoftware}
                      id="addCustomSoftwareBtn"
                    >
                      + Add Software
                    </button>
                  </div>
                  {errors.coreSoftware && <span className="field-error">{errors.coreSoftware}</span>}
                </div>

                {/* Technical Skills */}
                <div className={`form-group ${errors.technicalSkills ? 'has-error' : ''}`}>
                  <label className="form-label">
                    <span className="label-title">Technical Skills <span className="req-star">*</span></span>
                    <span className="field-hint">(Methodologies, coding, BIM standards, calculations)</span>
                  </label>

                  <div className="tags-interactive-wrap">
                    {PREDEFINED_TECH_SKILLS.map((tech) => {
                      const isSelected = formData.technicalSkills.includes(tech)
                      return (
                        <button
                          key={tech}
                          type="button"
                          className={`tag-chip tech-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleTechSkill(tech)}
                        >
                          <span>{tech}</span>
                          {isSelected && <span className="chip-remove-x">✓</span>}
                        </button>
                      )
                    })}
                    {/* Custom added tech skills */}
                    {formData.technicalSkills
                      .filter((s) => !PREDEFINED_TECH_SKILLS.includes(s))
                      .map((customTech) => (
                        <button
                          key={customTech}
                          type="button"
                          className="tag-chip tech-chip active custom"
                          onClick={() => toggleTechSkill(customTech)}
                        >
                          <span>{customTech}</span>
                          <span className="chip-remove-x">✕</span>
                        </button>
                      ))}
                  </div>

                  <div className="custom-tag-input-row">
                    <input
                      type="text"
                      className="form-input custom-tag-input"
                      placeholder="Add technical capability (e.g. Computational Fluid Dynamics, Dynamo Scripts)"
                      value={customTechSkillInput}
                      onChange={(e) => setCustomTechSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomTechSkill()
                        }
                      }}
                      id="customTechSkillInput"
                    />
                    <button
                      type="button"
                      className="btn-add-tag"
                      onClick={addCustomTechSkill}
                      id="addCustomTechSkillBtn"
                    >
                      + Add Technical Skill
                    </button>
                  </div>
                  {errors.technicalSkills && <span className="field-error">{errors.technicalSkills}</span>}
                </div>

                {/* Soft Skills */}
                <div className={`form-group ${errors.softSkills ? 'has-error' : ''}`}>
                  <label className="form-label">
                    <span className="label-title">Soft Skills <span className="req-star">*</span></span>
                    <span className="field-hint">(Collaboration, client leadership, project management)</span>
                  </label>

                  <div className="tags-interactive-wrap">
                    {PREDEFINED_SOFT_SKILLS.map((soft) => {
                      const isSelected = formData.softSkills.includes(soft)
                      return (
                        <button
                          key={soft}
                          type="button"
                          className={`tag-chip softskill-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleSoftSkill(soft)}
                        >
                          <span>{soft}</span>
                          {isSelected && <span className="chip-remove-x">✓</span>}
                        </button>
                      )
                    })}
                    {formData.softSkills
                      .filter((s) => !PREDEFINED_SOFT_SKILLS.includes(s))
                      .map((customSoft) => (
                        <button
                          key={customSoft}
                          type="button"
                          className="tag-chip softskill-chip active custom"
                          onClick={() => toggleSoftSkill(customSoft)}
                        >
                          <span>{customSoft}</span>
                          <span className="chip-remove-x">✕</span>
                        </button>
                      ))}
                  </div>

                  <div className="custom-tag-input-row">
                    <input
                      type="text"
                      className="form-input custom-tag-input"
                      placeholder="Add soft skill (e.g. Stakeholder Management, Mentorship)"
                      value={customSoftSkillInput}
                      onChange={(e) => setCustomSoftSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomSoftSkill()
                        }
                      }}
                      id="customSoftSkillInput"
                    />
                    <button
                      type="button"
                      className="btn-add-tag"
                      onClick={addCustomSoftSkill}
                      id="addCustomSoftSkillBtn"
                    >
                      + Add Soft Skill
                    </button>
                  </div>
                  {errors.softSkills && <span className="field-error">{errors.softSkills}</span>}
                </div>
              </div>

              {/* ── 2. PROFESSIONAL EXPERIENCE ── */}
              <div className="form-section">
                <div className="section-title-with-toggle">
                  <h3 className="section-title">
                    <span className="section-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </span>
                    Professional Experience
                  </h3>

                  {/* Fresher Toggle */}
                  <div className="toggle-switch-wrapper">
                    <span
                      className="talent-toggle-text"
                      onClick={() => updateField('isFresher', !formData.isFresher)}
                    >
                      I am a Fresher
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.isFresher}
                      className={`toggle-switch ${formData.isFresher ? 'on' : 'off'}`}
                      onClick={() => updateField('isFresher', !formData.isFresher)}
                      id="fresherToggleBtn"
                    >
                      <span className="switch-thumb" />
                    </button>
                  </div>
                </div>

                {formData.isFresher ? (
                  <div className="fresher-notice-card">
                    <div className="fresher-icon">🎓</div>
                    <div className="fresher-text">
                      <h4>Fresh Graduate / Entry-Level Track Enabled</h4>
                      <p>
                        Prior professional work experience is optional. Your academic projects, technical skills, and institute discipline will be highlighted to prospective AEC employers.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="experience-cards-list">
                    {errors.experience && <span className="field-error mb-2">{errors.experience}</span>}

                    {formData.experiences.map((exp, index) => (
                      <div key={exp.id} className="dynamic-subcard">
                        <div className="subcard-header">
                          <span className="subcard-num">Experience #{index + 1}</span>
                          {formData.experiences.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-card"
                              onClick={() => removeExperience(index)}
                              aria-label={`Remove experience ${index + 1}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="form-grid-2">
                          <div className="form-group">
                            <label className="form-label" htmlFor={`expRole_${exp.id}`}>
                              Role / Job Title <span className="req-star">*</span>
                            </label>
                            <input
                              id={`expRole_${exp.id}`}
                              type="text"
                              className="form-input"
                              placeholder="e.g. BIM Coordinator, Junior Architect"
                              value={exp.role}
                              onChange={(e) => updateExperience(index, 'role', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" htmlFor={`expOrg_${exp.id}`}>
                              Organisation / Firm Name <span className="req-star">*</span>
                            </label>
                            <input
                              id={`expOrg_${exp.id}`}
                              type="text"
                              className="form-input"
                              placeholder="e.g. Foster + Partners, Balfour Beatty"
                              value={exp.organisation}
                              onChange={(e) => updateExperience(index, 'organisation', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-grid-2">
                          <div className="form-group">
                            <label className="form-label" htmlFor={`expStart_${exp.id}`}>
                              Start Date <span className="req-star">*</span>
                            </label>
                            <input
                              id={`expStart_${exp.id}`}
                              type="month"
                              className="form-input"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" htmlFor={`expEnd_${exp.id}`}>
                              End Date {!exp.currentlyWorking && <span className="req-star">*</span>}
                            </label>
                            {exp.currentlyWorking ? (
                              <div className="present-badge-field" id={`expEnd_${exp.id}`}>
                                <span className="present-dot" />
                                <span className="present-text">Present (Ongoing)</span>
                              </div>
                            ) : (
                              <input
                                id={`expEnd_${exp.id}`}
                                type="month"
                                className="form-input"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                              />
                            )}
                          </div>
                        </div>

                        {/* Currently working here checkbox */}
                        <div className="currently-working-row">
                          <label className="currently-working-checkbox" htmlFor={`currentlyWorking_${exp.id}`}>
                            <input
                              type="checkbox"
                              id={`currentlyWorking_${exp.id}`}
                              checked={exp.currentlyWorking}
                              onChange={(e) =>
                                updateExperience(index, 'currentlyWorking', e.target.checked)
                              }
                            />
                            <span className="checkbox-custom">
                              {exp.currentlyWorking && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </span>
                            <span className="checkbox-text">I am currently working in this role</span>
                          </label>
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor={`expCont_${exp.id}`}>
                            Key Contribution & Project Deliverables <span className="req-star">*</span>
                          </label>
                          <textarea
                            id={`expCont_${exp.id}`}
                            className="form-textarea"
                            rows={3}
                            placeholder="Detail your modeling contributions, clashes resolved, LOD 400 federated coordination, Dynamo scripts created, or floor areas coordinated..."
                            value={exp.contribution}
                            onChange={(e) => updateExperience(index, 'contribution', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn-add-subcard"
                      onClick={addExperienceCard}
                      id="addAnotherExperienceBtn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>+ Add Another Experience</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── 3. CERTIFICATES & LICENSES ── */}
              <div className="form-section">
                <div className="section-title-with-toggle">
                  <h3 className="section-title">
                    <span className="section-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </span>
                    Certifications & Accreditations
                  </h3>

                  {/* "I have no certificate" Toggle */}
                  <div className="toggle-switch-wrapper">
                    <span
                      className="talent-toggle-text"
                      onClick={() => updateField('hasNoCertificate', !formData.hasNoCertificate)}
                    >
                      I have no certificate
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.hasNoCertificate}
                      className={`toggle-switch ${formData.hasNoCertificate ? 'on' : 'off'}`}
                      onClick={() => updateField('hasNoCertificate', !formData.hasNoCertificate)}
                      id="noCertificateToggleBtn"
                    >
                      <span className="switch-thumb" />
                    </button>
                  </div>
                </div>

                {formData.hasNoCertificate ? (
                  <div className="fresher-notice-card certificate-waived">
                    <div className="fresher-icon">📜</div>
                    <div className="fresher-text">
                      <h4>Certificates Section Skipped</h4>
                      <p>
                        No certificate attachments required right now. You can always upload licensed Autodesk, BRE Academy, or structural certificates later from your profile.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="certificate-cards-list">
                    {formData.certificates.map((cert, index) => (
                      <div key={cert.id} className="dynamic-subcard">
                        <div className="subcard-header">
                          <span className="subcard-num">Certificate #{index + 1}</span>
                          {formData.certificates.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-card"
                              onClick={() => removeCertificate(index)}
                              aria-label={`Remove certificate ${index + 1}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="form-grid-3">
                          <div className="form-group">
                            <label className="form-label" htmlFor={`certTitle_${cert.id}`}>
                              Certificate Title <span className="req-star">*</span>
                            </label>
                            <input
                              id={`certTitle_${cert.id}`}
                              type="text"
                              className="form-input"
                              placeholder="e.g. Autodesk Certified Professional - Revit"
                              value={cert.title}
                              onChange={(e) => updateCertificate(index, 'title', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" htmlFor={`certOrg_${cert.id}`}>
                              Issuing Organisation <span className="req-star">*</span>
                            </label>
                            <input
                              id={`certOrg_${cert.id}`}
                              type="text"
                              className="form-input"
                              placeholder="e.g. Autodesk, BRE Academy"
                              value={cert.organisation}
                              onChange={(e) => updateCertificate(index, 'organisation', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" htmlFor={`certDate_${cert.id}`}>
                              Issue Date <span className="req-star">*</span>
                            </label>
                            <input
                              id={`certDate_${cert.id}`}
                              type="month"
                              className="form-input"
                              value={cert.issueDate}
                              onChange={(e) => updateCertificate(index, 'issueDate', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* PDF Document Upload */}
                        <div className="form-group">
                          <label className="form-label">
                            PDF Document Attachment <span className="req-star">*</span>
                            <span className="field-hint">(Max 10 MB, PDF only)</span>
                          </label>

                          <div className="cert-doc-box">
                            {cert.fileName ? (
                              <div className="cert-doc-attached">
                                <div className="pdf-icon-badge small">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                </div>
                                <div className="cert-doc-meta">
                                  <span className="cert-file-name">{cert.fileName}</span>
                                  <span className="cert-file-size">{cert.fileSize}</span>
                                </div>
                                <button
                                  type="button"
                                  className="btn-remove-cert-file"
                                  onClick={() => {
                                    updateCertificate(index, 'file', null)
                                    updateCertificate(index, 'fileName', '')
                                    updateCertificate(index, 'fileSize', '')
                                  }}
                                >
                                  Remove File
                                </button>
                              </div>
                            ) : (
                              <label className="cert-doc-picker" htmlFor={`certFileInput_${cert.id}`}>
                                <input
                                  id={`certFileInput_${cert.id}`}
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  style={{ display: 'none' }}
                                  onChange={(e) =>
                                    handleCertificateDocUpload(index, e.target.files?.[0] || null)
                                  }
                                />
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span>Attach Certificate PDF</span>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn-add-subcard"
                      onClick={addCertificateCard}
                      id="addAnotherCertificateBtn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>+ Add Another Certificate</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Actions Step 2 */}
              <div className="setup-actions-bar">
                <button
                  type="button"
                  className="btn-back-step"
                  onClick={goToPrevStep}
                  id="btnBackToStep1"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Back to Profile</span>
                </button>

                <button
                  type="submit"
                  className="btn-complete-setup"
                  disabled={isSubmitting}
                  id="btnCompleteTalentSetup"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" />
                      <span>Saving Talent Passport...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>Complete Profile ({completeness.score}%) & Enter Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}
