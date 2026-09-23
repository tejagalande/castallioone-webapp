import React, { useRef } from 'react'
import { useCompanyProfileSetup, type CompanyProfileData } from '../hooks/useCompanyProfileSetup'
import { YearPicker } from '../components/YearPicker'
import './CompanyProfileSetup.css'

interface CompanyProfileSetupProps {
  userId?: string
  onSetupSuccess: () => void
  onLogout: () => void
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void
}

export const CompanyProfileSetup: React.FC<CompanyProfileSetupProps> = ({
  userId,
  onSetupSuccess,
  onLogout,
  showToast,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const certificateInputRef = useRef<HTMLInputElement>(null)
  const panFileInputRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleBlur,
    handleLogoUpload,
    handleCertificateUpload,
    handlePanFileUpload,
    handleSubmit,
  } = useCompanyProfileSetup({
    userId,
    onSuccess: onSetupSuccess,
    showToast,
  })

  return (
    <div className="setup-page">
      <div className="setup-grid-bg" />

      <main className="setup-container">
        <header className="setup-header">
          <div className="setup-header-top">
            <div className="setup-brand">
              Castallio One
              <span className="setup-badge">Enterprise Onboarding</span>
            </div>
            <button
              type="button"
              className="setup-logout-btn"
              onClick={onLogout}
              aria-label="Log out of Castallio One"
            >
              Sign Out
            </button>
          </div>

          <div className="setup-title-group">
            <h1>Complete Company Profile</h1>
            <p>
              Set up your verified enterprise account to post projects, search licensed AEC talent, and access BIM workflows.
            </p>
          </div>
        </header>

        <section className="setup-card">
          <form className="setup-form" onSubmit={handleSubmit} noValidate>
            {/* ── SECTION 1: BRAND IDENTITY ── */}
            <div className="setup-section">
              <div className="setup-section-title">
                <span className="section-num">1</span>
                <h2>Brand Identity</h2>
                <span>Logo & Public Presence</span>
              </div>

              {/* 1. Company Logo (Profile) */}
              <div className="form-group">
                <label className="form-label" htmlFor="companyLogoInput">
                  Company Logo (Profile)
                </label>
                <div className="logo-upload-wrapper">
                  <div className="logo-preview-box">
                    {formData.companyLogoPreview ? (
                      <img
                        src={formData.companyLogoPreview}
                        alt="Company Logo Preview"
                        className="logo-preview-img"
                      />
                    ) : (
                      <div className="logo-placeholder-icon">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="logo-upload-controls">
                    <input
                      ref={logoInputRef}
                      id="companyLogoInput"
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        handleLogoUpload(file)
                      }}
                    />
                    <button
                      type="button"
                      className="logo-upload-btn"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {formData.companyLogoPreview ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    {formData.companyLogoPreview && (
                      <button
                        type="button"
                        className="logo-remove-btn"
                        onClick={() => handleLogoUpload(null)}
                      >
                        Remove Logo
                      </button>
                    )}
                    <span className="logo-hint">Recommended: Square PNG or SVG, max 5MB</span>
                  </div>
                </div>
              </div>

              {/* 2. Company Name & 3. Website */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="companyName">
                    Company Name *
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    className={`form-input ${errors.companyName ? 'has-error' : ''}`}
                    placeholder="e.g. Apex Architectural & Engineering"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    onBlur={() => handleBlur('companyName')}
                  />
                  {errors.companyName && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.companyName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="website">
                    Website *
                  </label>
                  <input
                    id="website"
                    type="url"
                    className={`form-input ${errors.website ? 'has-error' : ''}`}
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    onBlur={() => handleBlur('website')}
                  />
                  {errors.website && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.website}
                    </span>
                  )}
                </div>
              </div>

              {/* 8. LinkedIn Profile URL */}
              <div className="form-group">
                <label className="form-label" htmlFor="linkedinUrl">
                  LinkedIn Profile URL *
                </label>
                <input
                  id="linkedinUrl"
                  type="url"
                  className={`form-input ${errors.linkedinUrl ? 'has-error' : ''}`}
                  placeholder="https://linkedin.com/company/your-firm"
                  value={formData.linkedinUrl}
                  onChange={(e) => updateField('linkedinUrl', e.target.value)}
                  onBlur={() => handleBlur('linkedinUrl')}
                />
                {errors.linkedinUrl && (
                  <span className="field-error">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.linkedinUrl}
                  </span>
                )}
              </div>
            </div>

            {/* ── SECTION 2: CORPORATE & TEAM DETAILS ── */}
            <div className="setup-section">
              <div className="setup-section-title">
                <span className="section-num">2</span>
                <h2>Corporate & Contact Information</h2>
                <span>Team size & Communications</span>
              </div>

              {/* 4. Email & 5. HR Contact Email */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="officialEmail">
                    Official Company Email *
                  </label>
                  <input
                    id="officialEmail"
                    type="email"
                    className={`form-input ${errors.email ? 'has-error' : ''}`}
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                  />
                  {errors.email && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="hrEmail">
                    HR Contact Email *
                  </label>
                  <input
                    id="hrEmail"
                    type="email"
                    className={`form-input ${errors.hrEmail ? 'has-error' : ''}`}
                    placeholder="careers@company.com"
                    value={formData.hrEmail}
                    onChange={(e) => updateField('hrEmail', e.target.value)}
                    onBlur={() => handleBlur('hrEmail')}
                  />
                  {errors.hrEmail && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.hrEmail}
                    </span>
                  )}
                </div>
              </div>

              {/* 6. Company Size & 9. Establishment Year (YearPicker) */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="companySize">
                    Company Size (Team Size) *
                  </label>
                  <select
                    id="companySize"
                    className={`form-select ${errors.companySize ? 'has-error' : ''}`}
                    value={formData.companySize}
                    onChange={(e) => updateField('companySize', e.target.value as CompanyProfileData['companySize'])}
                    onBlur={() => handleBlur('companySize')}
                  >
                    <option value="">Select team size...</option>
                    <option value="1-50">1-50 employees (Boutique Practice)</option>
                    <option value="51-200">51-200 employees (Mid-sized Engineering)</option>
                    <option value="201-1000">201-1000 employees (Large Multi-disciplinary)</option>
                    <option value="1000+">1000+ employees (Global AEC Enterprise)</option>
                  </select>
                  {errors.companySize && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.companySize}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="establishmentYear">
                    Establishment Year *
                  </label>
                  <YearPicker
                    id="establishmentYear"
                    value={formData.establishmentYear}
                    onChange={(year) => updateField('establishmentYear', year)}
                    onBlur={() => handleBlur('establishmentYear')}
                    hasError={!!errors.establishmentYear}
                  />
                  {errors.establishmentYear && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.establishmentYear}
                    </span>
                  )}
                </div>
              </div>

              {/* 7. Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Company Description *
                </label>
                <textarea
                  id="description"
                  className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                  rows={4}
                  placeholder="Describe your firm's core AEC expertise, BIM practices, major project domains, and engineering capabilities (at least 20 characters)..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                />
                {errors.description && (
                  <span className="field-error">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.description}
                  </span>
                )}
              </div>

              {/* 10. Office Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="officeAddress">
                  Office Address *
                </label>
                <textarea
                  id="officeAddress"
                  className={`form-textarea ${errors.officeAddress ? 'has-error' : ''}`}
                  rows={2}
                  placeholder="Suite / Floor, Building Name, Street, City, State, ZIP/Postal Code"
                  value={formData.officeAddress}
                  onChange={(e) => updateField('officeAddress', e.target.value)}
                  onBlur={() => handleBlur('officeAddress')}
                />
                {errors.officeAddress && (
                  <span className="field-error">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.officeAddress}
                  </span>
                )}
              </div>
            </div>

            {/* ── SECTION 3: LEGAL & COMPLIANCE ── */}
            <div className="setup-section">
              <div className="setup-section-title">
                <span className="section-num">3</span>
                <h2>Legal Verification & Compliance</h2>
                <span>GST, Registration Certificate, and PAN</span>
              </div>

              {/* 11. GST Number (Optional) */}
              <div className="form-group">
                <label className="form-label" htmlFor="gstNumber">
                  GST Number
                  <span className="form-label-optional">(Optional)</span>
                </label>
                <input
                  id="gstNumber"
                  type="text"
                  maxLength={15}
                  className={`form-input ${errors.gstNumber ? 'has-error' : ''}`}
                  placeholder="15-digit GSTIN (e.g. 22AAAAA0000A1Z5)"
                  value={formData.gstNumber}
                  onChange={(e) => updateField('gstNumber', e.target.value.toUpperCase())}
                  onBlur={() => handleBlur('gstNumber')}
                />
                {errors.gstNumber && (
                  <span className="field-error">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.gstNumber}
                  </span>
                )}
              </div>

              {/* Modern Certificate Type Selection Cards */}
              <div className="form-group">
                <label className="form-label">
                  Certificate Verification Type *
                </label>
                <div className="cert-type-grid" role="radiogroup" aria-label="Certificate Type">
                  <div
                    className={`cert-card ${formData.certificateType === 'MSME' ? 'selected' : ''}`}
                    onClick={() => updateField('certificateType', 'MSME')}
                    role="radio"
                    aria-checked={formData.certificateType === 'MSME'}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        updateField('certificateType', 'MSME')
                      }
                    }}
                  >
                    <div className="cert-card-top">
                      <div className="cert-icon-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <div className="cert-radio-indicator" />
                    </div>
                    <div className="cert-title">MSME (Udyam) Registration</div>
                    <div className="cert-desc">For Micro, Small, and Medium Enterprises under Ministry of MSME</div>
                  </div>

                  <div
                    className={`cert-card ${formData.certificateType === 'MCA' ? 'selected' : ''}`}
                    onClick={() => updateField('certificateType', 'MCA')}
                    role="radio"
                    aria-checked={formData.certificateType === 'MCA'}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        updateField('certificateType', 'MCA')
                      }
                    }}
                  >
                    <div className="cert-card-top">
                      <div className="cert-icon-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                      </div>
                      <div className="cert-radio-indicator" />
                    </div>
                    <div className="cert-title">MCA Incorporation Certificate</div>
                    <div className="cert-desc">For Private Limited, LLP, or Public Companies under Ministry of Corporate Affairs</div>
                  </div>
                </div>
              </div>

              {/* 12. Company Certificate (MSME Or MCA) */}
              <div className="form-group">
                <label className="form-label" htmlFor="certificateUpload">
                  Upload {formData.certificateType} Certificate *
                </label>
                <div className="file-upload-box">
                  <div className="file-info">
                    <div className="file-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div>
                      {formData.certificateFileName ? (
                        <div className="file-name-text">{formData.certificateFileName}</div>
                      ) : (
                        <div className="file-prompt-text">
                          Upload your official {formData.certificateType} verification document (.pdf, .png, .jpg)
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    ref={certificateInputRef}
                    id="certificateUpload"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      handleCertificateUpload(file)
                    }}
                  />
                  <button
                    type="button"
                    className="file-attach-btn"
                    onClick={() => certificateInputRef.current?.click()}
                  >
                    {formData.certificateFileName ? 'Replace File' : 'Choose Document'}
                  </button>
                </div>
                {errors.certificateFileName && (
                  <span className="field-error">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.certificateFileName}
                  </span>
                )}
              </div>

              {/* 13. Company PAN */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="companyPan">
                    Company PAN *
                  </label>
                  <input
                    id="companyPan"
                    type="text"
                    maxLength={10}
                    className={`form-input ${errors.companyPan ? 'has-error' : ''}`}
                    placeholder="10-digit PAN (e.g. ABCDE1234F)"
                    value={formData.companyPan}
                    onChange={(e) => updateField('companyPan', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('companyPan')}
                  />
                  {errors.companyPan && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.companyPan}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="panDocumentUpload">
                    PAN Card Document
                    <span className="form-label-optional">(Optional File)</span>
                  </label>
                  <div className="file-upload-box" style={{ padding: '8px 12px' }}>
                    <div className="file-info">
                      <div className="file-icon" style={{ width: '28px', height: '28px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div className="file-name-text" style={{ fontSize: '12px' }}>
                        {formData.panFileName || 'Optional copy of PAN card'}
                      </div>
                    </div>
                    <input
                      ref={panFileInputRef}
                      id="panDocumentUpload"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        handlePanFileUpload(file)
                      }}
                    />
                    <button
                      type="button"
                      className="file-attach-btn"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                      onClick={() => panFileInputRef.current?.click()}
                    >
                      {formData.panFileName ? 'Change' : 'Attach'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ACTION FOOTER ── */}
            <div className="setup-actions">
              <button
                type="submit"
                className="setup-submit-btn"
                disabled={isSubmitting}
                aria-label="Complete Setup and Launch Dashboard"
              >
                {isSubmitting ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Saving & Verifying...
                  </>
                ) : (
                  <>
                    Complete Setup & Launch Dashboard
                    <span style={{ fontSize: '16px' }}>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
export default CompanyProfileSetup
