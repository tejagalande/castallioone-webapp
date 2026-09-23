import { useState, useRef, type FC, type ChangeEvent } from 'react'
import { useCompanyProfile, type CompanySize, type CertificateType } from './useCompanyProfile'
import './CompanyProfile.css'

export interface CompanyProfileProps {
  onNavigateToDashboard?: () => void
}

export const CompanyProfile: FC<CompanyProfileProps> = () => {
  const {
    profile,
    errors,
    touched,
    handleBlur,
    isLoading,
    isSaving,
    isUploadingLogo,
    isUploadingCertificate,
    isUploadingPan,
    isDirty,
    completeness,
    activeTab,
    setActiveTab,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    toastMessage,
    updateProfileField,
    handleLogoUpload,
    handleRemoveLogo,
    handleDocumentUpload,
    handleSaveAndPublish,
    handleDiscardChanges,
  } = useCompanyProfile()

  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)
  const panInputRef = useRef<HTMLInputElement>(null)

  const handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleLogoUpload(file)
    }
  }

  const handleCertFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleDocumentUpload(file, 'certificate')
    }
  }

  const handlePanFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleDocumentUpload(file, 'pan_card')
    }
  }

  const getCompanyInitials = (name: string): string => {
    if (!name) return 'CO'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  const getFileNameFromUrl = (url: string): string => {
    if (!url) return ''
    try {
      const cleanUrl = url.split('?')[0]
      const parts = cleanUrl.split('/')
      return decodeURIComponent(parts[parts.length - 1] || 'Document')
    } catch {
      return 'Document'
    }
  }

  const isImageUrl = (url: string): boolean => {
    if (!url) return false
    const clean = url.split('?')[0].toLowerCase()
    return (
      clean.endsWith('.png') ||
      clean.endsWith('.jpg') ||
      clean.endsWith('.jpeg') ||
      clean.endsWith('.webp') ||
      clean.endsWith('.gif') ||
      clean.endsWith('.svg')
    )
  }

  if (isLoading) {
    return (
      <main className="cp-network-root" aria-label="Loading Company Profile" aria-busy="true">
        {/* Top Control Bar Skeleton */}
        <section className="cp-top-control-bar">
          <div className="cp-control-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="cp-shimmer" style={{ width: '150px', height: '18px' }} />
              <div className="cp-shimmer" style={{ width: '180px', height: '18px' }} />
            </div>
            <div className="cp-header-actions">
              <div className="cp-shimmer" style={{ width: '130px', height: '36px', borderRadius: '8px' }} />
              <div className="cp-shimmer" style={{ width: '160px', height: '36px', borderRadius: '8px' }} />
              <div className="cp-shimmer" style={{ width: '190px', height: '36px', borderRadius: '8px' }} />
            </div>
          </div>
        </section>

        <div className="cp-main-wrap">
          {/* Hero Card Skeleton */}
          <section className="cp-hero-card">
            <div className="cp-identity-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div className="cp-shimmer" style={{ width: '100px', height: '100px', borderRadius: '16px' }} />
                  <div className="cp-shimmer" style={{ width: '85px', height: '24px', borderRadius: '6px' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div>
                      <div className="cp-shimmer" style={{ width: '130px', height: '14px', marginBottom: '8px' }} />
                      <div className="cp-shimmer" style={{ width: '100%', height: '38px' }} />
                    </div>
                    <div>
                      <div className="cp-shimmer" style={{ width: '110px', height: '14px', marginBottom: '8px' }} />
                      <div className="cp-shimmer" style={{ width: '100%', height: '38px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <div className="cp-shimmer" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
                      <div className="cp-shimmer" style={{ width: '100%', height: '38px' }} />
                    </div>
                    <div>
                      <div className="cp-shimmer" style={{ width: '140px', height: '14px', marginBottom: '8px' }} />
                      <div className="cp-shimmer" style={{ width: '100%', height: '38px' }} />
                    </div>
                    <div>
                      <div className="cp-shimmer" style={{ width: '130px', height: '14px', marginBottom: '8px' }} />
                      <div className="cp-shimmer" style={{ width: '100%', height: '38px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs Bar Skeleton */}
          <nav className="cp-tabs-bar" style={{ display: 'flex', gap: '12px' }}>
            <div className="cp-shimmer" style={{ width: '200px', height: '42px', borderRadius: '8px' }} />
            <div className="cp-shimmer" style={{ width: '210px', height: '42px', borderRadius: '8px' }} />
            <div className="cp-shimmer" style={{ width: '180px', height: '42px', borderRadius: '8px' }} />
          </nav>

          {/* Main Grid Skeleton */}
          <div className="cp-workspace-grid">
            <div className="cp-form-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Form Panel 1 Skeleton */}
              <section className="cp-panel-card" style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div className="cp-shimmer" style={{ width: '160px', height: '12px', marginBottom: '8px' }} />
                  <div className="cp-shimmer" style={{ width: '240px', height: '22px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="cp-shimmer" style={{ width: '140px', height: '14px', marginBottom: '8px' }} />
                      <div className="cp-shimmer" style={{ width: '100%', height: '38px' }} />
                      <div className="cp-shimmer" style={{ width: '70%', height: '12px', marginTop: '6px' }} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Form Panel 2 Skeleton (Narrative) */}
              <section className="cp-panel-card" style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div className="cp-shimmer" style={{ width: '130px', height: '12px', marginBottom: '8px' }} />
                  <div className="cp-shimmer" style={{ width: '200px', height: '22px' }} />
                </div>
                <div className="cp-shimmer" style={{ width: '260px', height: '14px', marginBottom: '10px' }} />
                <div className="cp-shimmer" style={{ width: '100%', height: '140px', borderRadius: '8px' }} />
              </section>
            </div>

            {/* Sidebar Skeleton */}
            <div className="cp-sidebar-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="cp-sidebar-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="cp-shimmer" style={{ width: '140px', height: '14px' }} />
                  <div className="cp-shimmer" style={{ width: '60px', height: '14px' }} />
                </div>
                <div className="cp-shimmer" style={{ width: '100%', height: '8px', borderRadius: '4px', marginBottom: '16px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="cp-shimmer" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                      <div className="cp-shimmer" style={{ width: `${60 + (i * 7)}%`, height: '14px' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="cp-affinity-card" style={{ padding: '20px' }}>
                <div className="cp-shimmer" style={{ width: '130px', height: '16px', marginBottom: '12px' }} />
                <div className="cp-shimmer" style={{ width: '100%', height: '60px', borderRadius: '8px', marginBottom: '12px' }} />
                <div className="cp-shimmer" style={{ width: '120px', height: '16px', marginLeft: 'auto' }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="cp-network-root" aria-label="Company Profile Settings">
      {/* Toast Notification */}
      {toastMessage && (
        <aside className="cp-live-toast" role="status" aria-live="polite">
          <span className="material-symbols-outlined" style={{ color: '#adc6ff' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        style={{ display: 'none' }}
        onChange={handleLogoFileChange}
      />
      <input
        ref={certInputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        style={{ display: 'none' }}
        onChange={handleCertFileChange}
      />
      <input
        ref={panInputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        style={{ display: 'none' }}
        onChange={handlePanFileChange}
      />

      {/* ── 1. Top Action & Navigation Control Bar ── */}
      <section className="cp-top-control-bar" aria-label="Company Profile Header Bar">
        <div className="cp-control-inner">
          <div className="cp-breadcrumb-row">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#727784', fontWeight: 600 }}>
              <span className="cp-pulse-dot" aria-hidden="true" />
              ENTERPRISE WORKSPACE
            </span>
            <span style={{ color: '#c2c6d5' }}>/</span>
            <span style={{ color: '#1a1c1e', fontWeight: 700 }}>
              {profile.name || 'Company Profile'}
            </span>
            {profile.is_profile_complete && (
              <>
                <span style={{ color: '#c2c6d5' }}>/</span>
                <span className="cp-iso-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                    verified
                  </span>
                  VERIFIED PROFILE
                </span>
              </>
            )}
            {isDirty ? (
              <span style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px', fontSize: '11px', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit_note</span>
                Unsaved changes
              </span>
            ) : profile.updated_at ? (
              <span style={{ color: '#727784', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px', fontSize: '11px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                Saved {new Date(profile.updated_at).toLocaleDateString()}
              </span>
            ) : null}
          </div>

          <div className="cp-header-actions">
            <button
              type="button"
              className="btn-cp-secondary"
              onClick={handleDiscardChanges}
              disabled={!isDirty || isSaving}
              style={{ opacity: !isDirty || isSaving ? 0.5 : 1, cursor: !isDirty || isSaving ? 'not-allowed' : 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                restart_alt
              </span>
              <span>Discard Changes</span>
            </button>

            <button
              type="button"
              className="btn-cp-secondary"
              onClick={() => setIsPreviewModalOpen(true)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#00418f' }}>
                visibility
              </span>
              <span>Preview Public Profile</span>
            </button>

            <button
              type="button"
              className="btn-cp-primary"
              onClick={handleSaveAndPublish}
              disabled={isSaving}
              style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'wait' : 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isSaving ? 'sync' : 'cloud_done'}
              </span>
              <span>{isSaving ? 'Saving...' : 'Save & Publish Changes'}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="cp-main-wrap">
        {/* ── 2. Studio Branding Hero Card ── */}
        <section className="cp-hero-card" aria-label="Company Identity Overview">
          <div className="cp-identity-body" style={{ padding: '24px' }}>
            <div className="cp-identity-top-row">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flex: 1, width: '100%', flexWrap: 'wrap' }}>
                {/* Logo Box */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div
                    className="cp-logo-monogram-box"
                    onClick={() => logoInputRef.current?.click()}
                    title="Click to select company logo"
                    style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                  >
                    {profile.logo_url ? (
                      <img
                        src={profile.logo_url}
                        alt={`${profile.name || 'Company'} Logo`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="cp-monogram-inner">
                        <span className="cp-monogram-title">{getCompanyInitials(profile.name)}</span>
                        {profile.establishment_year ? (
                          <span className="cp-monogram-sub">EST. {profile.establishment_year}</span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: '#f3f3f6',
                        border: '1px solid #c2c6d5',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#00418f',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {isUploadingLogo ? 'sync' : profile.logo_url ? 'edit' : 'upload'}
                      </span>
                      <span>{isUploadingLogo ? 'Uploading...' : profile.logo_url ? 'Change Logo' : 'Upload Logo'}</span>
                    </button>
                    {profile.logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#ffffff',
                          border: '1px solid #ffdad6',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#ba1a1a',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ba1a1a' }}>
                          delete
                        </span>
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Editable Identity Key Fields */}
                <div className="cp-identity-fields" style={{ flex: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div>
                      <label className="cp-input-label">Company Legal Name *</label>
                      <input
                        type="text"
                        className={`cp-form-input ${touched.name && errors.name ? 'cp-input-error' : ''}`}
                        placeholder="e.g. Acme Architecture & BIM Consultants"
                        style={{ fontFamily: 'Hanken Grotesk', fontSize: '16px', fontWeight: 700 }}
                        value={profile.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateProfileField('name', e.target.value)
                        }
                        onBlur={() => handleBlur('name')}
                      />
                      {touched.name && errors.name && (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="cp-input-label">Company Size *</label>
                      <select
                        className={`cp-form-input ${touched.size && errors.size ? 'cp-input-error' : ''}`}
                        value={profile.size}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          updateProfileField('size', e.target.value as CompanySize)
                        }
                        onBlur={() => handleBlur('size')}
                      >
                        <option value="">Select team size...</option>
                        <option value="1-50">1-50 Employees (Boutique / Specialist)</option>
                        <option value="51-200">51-200 Employees (Growing Mid-tier)</option>
                        <option value="201-1000">201-1,000 Employees (Large Enterprise)</option>
                        <option value="1000+">1,000+ Employees (Global Multidisciplinary)</option>
                      </select>
                      {touched.size && errors.size && (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.size}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '14px' }}>
                    <div>
                      <label className="cp-input-label">Official Website URL *</label>
                      <input
                        type="url"
                        className={`cp-form-input ${touched.website && errors.website ? 'cp-input-error' : ''}`}
                        placeholder="https://example.com"
                        value={profile.website}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateProfileField('website', e.target.value)
                        }
                        onBlur={() => handleBlur('website')}
                      />
                      {touched.website && errors.website && (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.website}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="cp-input-label">Establishment / Founding Year</label>
                      <input
                        type="number"
                        className={`cp-form-input ${touched.establishment_year && errors.establishment_year ? 'cp-input-error' : ''}`}
                        placeholder="e.g. 2012"
                        value={profile.establishment_year}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateProfileField('establishment_year', e.target.value ? parseInt(e.target.value, 10) : '')
                        }
                        onBlur={() => handleBlur('establishment_year')}
                      />
                      {touched.establishment_year && errors.establishment_year && (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.establishment_year}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="cp-input-label">Primary Office / HQ Location *</label>
                      <input
                        type="text"
                        className={`cp-form-input ${touched.office_address && errors.office_address ? 'cp-input-error' : ''}`}
                        placeholder="e.g. Mumbai, Maharashtra"
                        value={profile.office_address}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateProfileField('office_address', e.target.value)
                        }
                        onBlur={() => handleBlur('office_address')}
                      />
                      {touched.office_address && errors.office_address && (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.office_address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Navigation Tabs Bar ── */}
        <nav className="cp-tabs-bar" aria-label="Profile Sections">
          <button
            type="button"
            className={`btn-cp-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              business
            </span>
            <span>General &amp; Brand Identity</span>
          </button>

          <button
            type="button"
            className={`btn-cp-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              verified_user
            </span>
            <span>Tax &amp; Legal Verification</span>
            {profile.certificate_link && (
              <span style={{ fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                DOCS ATTACHED
              </span>
            )}
          </button>

          <button
            type="button"
            className={`btn-cp-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setIsPreviewModalOpen(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              visibility
            </span>
            <span>Candidate Live Dossier</span>
          </button>
        </nav>

        {/* ── 4. Main Two-Column Layout ── */}
        <div className="cp-workspace-grid">
          {/* LEFT COLUMN: Main Form Panels (8 cols) */}
          <div className="cp-form-column">
            {activeTab === 'general' && (
              <>
                {/* PANEL 1: Contact Information */}
                <section className="cp-panel-card" aria-label="Official Contact Information">
                  <div className="cp-panel-header">
                    <div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        COMMUNICATIONS CHANNELS
                      </span>
                      <h2 className="cp-panel-headline">Official Corporate &amp; HR Contacts</h2>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div>
                      <label className="cp-input-label">Corporate Email Address *</label>
                      <input
                        type="email"
                        className={`cp-form-input ${touched.email && errors.email ? 'cp-input-error' : ''}`}
                        placeholder="contact@company.com"
                        value={profile.email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateProfileField('email', e.target.value)
                        }
                        onBlur={() => handleBlur('email')}
                      />
                      {touched.email && errors.email ? (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.email}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#727784', marginTop: '4px', display: 'block' }}>
                          Used for official platform notices and correspondence.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="cp-input-label">HR / Talent Acquisition Email *</label>
                      <input
                        type="email"
                        className={`cp-form-input ${touched.hr_contact_email && errors.hr_contact_email ? 'cp-input-error' : ''}`}
                        placeholder="careers@company.com"
                        value={profile.hr_contact_email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateProfileField('hr_contact_email', e.target.value)
                        }
                        onBlur={() => handleBlur('hr_contact_email')}
                      />
                      {touched.hr_contact_email && errors.hr_contact_email ? (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.hr_contact_email}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#727784', marginTop: '4px', display: 'block' }}>
                          Direct inbox for applicant queries and interview coordination.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="cp-input-label">LinkedIn Company Page URL</label>
                      <input
                        type="url"
                        className={`cp-form-input ${touched.linkedin_url && errors.linkedin_url ? 'cp-input-error' : ''}`}
                        placeholder="https://linkedin.com/company/..."
                        value={profile.linkedin_url}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateProfileField('linkedin_url', e.target.value)
                        }
                        onBlur={() => handleBlur('linkedin_url')}
                      />
                      {touched.linkedin_url && errors.linkedin_url ? (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.linkedin_url}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#727784', marginTop: '4px', display: 'block' }}>
                          Displayed on your public employer profile for candidates.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="cp-input-label">Registered Office Address *</label>
                      <input
                        type="text"
                        className={`cp-form-input ${touched.office_address && errors.office_address ? 'cp-input-error' : ''}`}
                        placeholder="Suite #, Building, Street, City, State, PIN"
                        value={profile.office_address}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateProfileField('office_address', e.target.value)
                        }
                        onBlur={() => handleBlur('office_address')}
                      />
                      {touched.office_address && errors.office_address ? (
                        <div className="cp-field-error">
                          <span className="material-symbols-outlined">error</span>
                          <span>{errors.office_address}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#727784', marginTop: '4px', display: 'block' }}>
                          Physical headquarters or main studio location.
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                {/* PANEL 2: Company Narrative & Overview */}
                <section className="cp-panel-card" aria-label="About the Practice">
                  <div className="cp-panel-header">
                    <div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        PRACTICE OVERVIEW
                      </span>
                      <h2 className="cp-panel-headline">About the Studio &amp; Culture</h2>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: 'rgba(0, 65, 143, 0.1)', color: '#00418f', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      PUBLIC DOSSIER
                    </span>
                  </div>

                  <div>
                    <label className="cp-input-label">
                      Studio Overview &amp; Project Philosophy (Shown on all your Job Posts) *
                    </label>
                    <textarea
                      className={`cp-textarea ${touched.description && errors.description ? 'cp-input-error' : ''}`}
                      rows={6}
                      placeholder="Describe your studio's architectural vision, flagship projects, design philosophy, and what makes working with your team rewarding..."
                      value={profile.description}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        updateProfileField('description', e.target.value)
                      }
                      onBlur={() => handleBlur('description')}
                    />
                    {touched.description && errors.description && (
                      <div className="cp-field-error" style={{ marginBottom: '6px' }}>
                        <span className="material-symbols-outlined">error</span>
                        <span>{errors.description}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', marginTop: '6px' }}>
                      <span>
                        {profile.description.length} characters {profile.description.length < 20 ? '(min 20 recommended)' : ''}
                      </span>
                      <span>Changes stored in Supabase</span>
                    </div>
                  </div>
                </section>

                {/* PANEL 3: Company Legal & Tax Documents (Always visible on overview) */}
                <section className="cp-panel-card" aria-label="Company Uploaded Documents">
                  <div className="cp-panel-header">
                    <div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        VERIFIED ATTACHMENTS
                      </span>
                      <h2 className="cp-panel-headline">Company Registration &amp; Tax Documents</h2>
                    </div>
                    {profile.certificate_link && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
                        VERIFIED
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Document 1: Registration Certificate */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', background: '#f3f3f6', border: '1px solid #c2c6d5', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: '#ffffff', border: '1px solid #c2c6d5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {profile.certificate_link && isImageUrl(profile.certificate_link) ? (
                            <img src={profile.certificate_link} alt="Certificate thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: profile.certificate_link ? '#00418f' : '#727784' }}>
                              {profile.certificate_link ? 'description' : 'upload_file'}
                            </span>
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'Hanken Grotesk', fontSize: '14px', fontWeight: 700, color: '#1a1c1e' }}>
                              {profile.certificate_type === 'MCA' ? 'MCA Certificate of Incorporation' : 'MSME Registration Certificate'}
                            </span>
                            {profile.certificate_link ? (
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                ATTACHED
                              </span>
                            ) : (
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', background: '#ffdad6', color: '#ba1a1a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                NOT ATTACHED
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '12px', color: '#727784', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            {profile.certificate_link ? getFileNameFromUrl(profile.certificate_link) : 'Official MSME or MCA registration document'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {profile.certificate_link && (
                          <>
                            <button
                              type="button"
                              className="btn-cp-secondary"
                              onClick={() => setPreviewDoc({ title: `${profile.certificate_type} Registration Certificate`, url: profile.certificate_link })}
                              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
                            >
                              Preview Document
                            </button>
                            <a
                              href={profile.certificate_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-cp-secondary"
                              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                            >
                              Open in New Tab
                            </a>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn-cp-secondary"
                          onClick={() => certInputRef.current?.click()}
                          disabled={isUploadingCertificate}
                          style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
                        >
                          {isUploadingCertificate ? 'Uploading...' : profile.certificate_link ? 'Replace Document' : 'Upload Document'}
                        </button>
                      </div>
                    </div>

                    {/* Document 2: Company PAN Card */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', background: '#f3f3f6', border: '1px solid #c2c6d5', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: '#ffffff', border: '1px solid #c2c6d5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {profile.pan_card_link && isImageUrl(profile.pan_card_link) ? (
                            <img src={profile.pan_card_link} alt="PAN thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: profile.pan_card_link ? '#00418f' : '#727784' }}>
                              {profile.pan_card_link ? 'badge' : 'upload_file'}
                            </span>
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'Hanken Grotesk', fontSize: '14px', fontWeight: 700, color: '#1a1c1e' }}>
                              Company PAN Card
                            </span>
                            {profile.pan_card_link ? (
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                ATTACHED
                              </span>
                            ) : (
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', background: '#eeeef0', color: '#727784', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                OPTIONAL
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '12px', color: '#727784', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            {profile.pan_card_link ? getFileNameFromUrl(profile.pan_card_link) : 'Permanent Account Number verification card'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {profile.pan_card_link && (
                          <>
                            <button
                              type="button"
                              className="btn-cp-secondary"
                              onClick={() => setPreviewDoc({ title: 'Company PAN Card', url: profile.pan_card_link })}
                              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
                            >
                              Preview Document
                            </button>
                            <a
                              href={profile.pan_card_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-cp-secondary"
                              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                            >
                              Open in New Tab
                            </a>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn-cp-secondary"
                          onClick={() => panInputRef.current?.click()}
                          disabled={isUploadingPan}
                          style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
                        >
                          {isUploadingPan ? 'Uploading...' : profile.pan_card_link ? 'Replace Document' : 'Upload Document'}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'documents' && (
              <section className="cp-panel-card" aria-label="Tax and Legal Documents">
                <div className="cp-panel-header">
                  <div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      COMPLIANCE &amp; VERIFICATION
                    </span>
                    <h2 className="cp-panel-headline">Enterprise Verification &amp; Tax Documents</h2>
                  </div>
                  {profile.certificate_link && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
                      VERIFIED ATTACHMENTS
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* GST Number */}
                  <div>
                    <label className="cp-input-label">GST Identification Number (GSTIN)</label>
                    <input
                      type="text"
                      className={`cp-form-input ${touched.gst_number && errors.gst_number ? 'cp-input-error' : ''}`}
                      placeholder="e.g. 27ABCDE1234F1Z5 (Optional)"
                      value={profile.gst_number}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateProfileField('gst_number', e.target.value.toUpperCase())
                      }
                      onBlur={() => handleBlur('gst_number')}
                      style={{ maxWidth: '380px' }}
                    />
                    {touched.gst_number && errors.gst_number ? (
                      <div className="cp-field-error">
                        <span className="material-symbols-outlined">error</span>
                        <span>{errors.gst_number}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#727784', marginTop: '4px', display: 'block' }}>
                        Applicable for tax invoices and business receipts.
                      </span>
                    )}
                  </div>

                  {/* Business Registration Certificate Card */}
                  <div style={{ padding: '16px', borderRadius: '12px', background: '#f3f3f6', border: '1px solid #c2c6d5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontFamily: 'Hanken Grotesk', fontWeight: 700 }}>
                          Business Registration Document (MSME / MCA)
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#424753' }}>
                          Upload certificate of incorporation, MSME Udyam registration, or partnership deed.
                        </p>
                      </div>

                      {/* Certificate Type Selection */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#424753' }}>Type:</label>
                        <select
                          className="cp-form-input"
                          style={{ padding: '4px 10px', fontSize: '12px', width: 'auto' }}
                          value={profile.certificate_type}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            updateProfileField('certificate_type', e.target.value as CertificateType)
                          }
                        >
                          <option value="MSME">MSME Udyam</option>
                          <option value="MCA">MCA / Certificate of Incorporation</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #d8e2ff', flexWrap: 'wrap' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#f3f3f6', border: '1px solid #c2c6d5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {profile.certificate_link && isImageUrl(profile.certificate_link) ? (
                          <img src={profile.certificate_link} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: profile.certificate_link ? '#00418f' : '#727784' }}>
                            description
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1c1e' }}>
                            {profile.certificate_type} Document
                          </span>
                          {profile.certificate_link ? (
                            <span style={{ fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              VERIFIED
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', color: '#ba1a1a', fontWeight: 600 }}>Missing</span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#727784', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {profile.certificate_link ? getFileNameFromUrl(profile.certificate_link) : 'No certificate attached'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {profile.certificate_link && (
                          <>
                            <button
                              type="button"
                              className="btn-cp-secondary"
                              onClick={() => setPreviewDoc({ title: `${profile.certificate_type} Registration Certificate`, url: profile.certificate_link })}
                              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                            >
                              Preview Document
                            </button>
                            <a
                              href={profile.certificate_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-cp-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                            >
                              Open in New Tab
                            </a>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn-cp-secondary"
                          onClick={() => certInputRef.current?.click()}
                          disabled={isUploadingCertificate}
                          style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                        >
                          {isUploadingCertificate ? 'Uploading...' : profile.certificate_link ? 'Replace Document' : 'Upload Document'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Company PAN Document Card */}
                  <div style={{ padding: '16px', borderRadius: '12px', background: '#f3f3f6', border: '1px solid #c2c6d5' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontFamily: 'Hanken Grotesk', fontWeight: 700 }}>
                        Company PAN Card Document
                      </h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#424753' }}>
                        Attach firm or corporate Permanent Account Number card.
                      </p>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #d8e2ff', flexWrap: 'wrap' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#f3f3f6', border: '1px solid #c2c6d5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {profile.pan_card_link && isImageUrl(profile.pan_card_link) ? (
                          <img src={profile.pan_card_link} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: profile.pan_card_link ? '#00418f' : '#727784' }}>
                            badge
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1c1e' }}>
                            Permanent Account Number (PAN)
                          </span>
                          {profile.pan_card_link ? (
                            <span style={{ fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              ATTACHED
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', color: '#727784' }}>Optional</span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#727784', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {profile.pan_card_link ? getFileNameFromUrl(profile.pan_card_link) : 'No PAN card attached'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {profile.pan_card_link && (
                          <>
                            <button
                              type="button"
                              className="btn-cp-secondary"
                              onClick={() => setPreviewDoc({ title: 'Company PAN Card', url: profile.pan_card_link })}
                              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                            >
                              Preview Document
                            </button>
                            <a
                              href={profile.pan_card_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-cp-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                            >
                              Open in New Tab
                            </a>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn-cp-secondary"
                          onClick={() => panInputRef.current?.click()}
                          disabled={isUploadingPan}
                          style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                        >
                          {isUploadingPan ? 'Uploading...' : profile.pan_card_link ? 'Replace Document' : 'Upload Document'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar Widgets (4 cols) */}
          <div className="cp-sidebar-column">
            {/* Widget 1: Profile Completeness */}
            <div className="cp-sidebar-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', fontWeight: 700, textTransform: 'uppercase' }}>
                  PROFILE COMPLETENESS
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: completeness.isFullyComplete ? '#047857' : '#00418f', fontWeight: 700 }}>
                  {completeness.percentage}% {completeness.isFullyComplete ? 'VERIFIED' : 'COMPLETE'}
                </span>
              </div>

              <div className="cp-progress-bar-bg">
                <div
                  className="cp-progress-fill"
                  style={{
                    width: `${completeness.percentage}%`,
                    background: completeness.isFullyComplete ? '#059669' : '#00418f',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {completeness.items.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: item.filled ? '#047857' : '#727784',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: item.filled ? '#059669' : '#c2c6d5' }}>
                      {item.filled ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span style={{ fontWeight: item.filled ? 600 : 400 }}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', background: '#f3f3f6', fontSize: '11.5px', color: '#424753', lineHeight: 1.4 }}>
                A verified enterprise profile increases candidate response rates and unlocks top-tier AEC talent matching.
              </div>
            </div>

            {/* Widget 2: Live Candidate View Preview */}
            <div className="cp-affinity-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                  CANDIDATE VIEW
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', background: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #c2c6d5' }}>
                  PREVIEW
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: '#424753' }}>
                This is how your studio identity appears on public job requisitions and candidate radar:
              </p>

              <div className="cp-affinity-mini-dossier" style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #d8e2ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#00418f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', overflow: 'hidden' }}>
                    {profile.logo_url ? (
                      <img src={profile.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getCompanyInitials(profile.name)
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontFamily: 'Hanken Grotesk', fontSize: '13px', fontWeight: 700, color: '#1a1c1e', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile.name || 'Your Company Name'}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>
                      {profile.office_address || 'HQ Location'} • {profile.size || 'Team Size'}
                    </span>
                  </div>
                </div>

                {profile.description && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#424753', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {profile.description}
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  style={{ background: 'transparent', border: 'none', color: '#00418f', fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Open Full Public Dossier</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          MODAL: In-App Document Preview Modal
          ═════════════════════════════════════════════════════════════════════════ */}
      {previewDoc && (
        <div
          className="cp-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="cp-modal-window"
            style={{ maxWidth: '850px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cp-modal-header">
              <h3 className="cp-modal-title">{previewDoc.title}</h3>
              <button
                type="button"
                className="btn-cp-modal-close"
                onClick={() => setPreviewDoc(null)}
                aria-label="Close document viewer"
              >
                ✕
              </button>
            </div>

            <div
              className="cp-modal-body"
              style={{
                padding: '16px',
                minHeight: '400px',
                maxHeight: '75vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f9fa',
              }}
            >
              {isImageUrl(previewDoc.url) ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  }}
                />
              ) : (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  style={{
                    width: '100%',
                    height: '70vh',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#ffffff',
                  }}
                />
              )}
            </div>

            <div className="cp-modal-footer">
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cp-secondary"
                style={{ textDecoration: 'none' }}
              >
                Open in New Tab ↗
              </a>
              <button
                type="button"
                className="btn-cp-primary"
                onClick={() => setPreviewDoc(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          MODAL: Candidate Public Dossier Preview
          ═════════════════════════════════════════════════════════════════════════ */}
      {isPreviewModalOpen && (
        <div
          className="cp-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div className="cp-modal-window" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3 className="cp-modal-title">Public Practice Profile Preview</h3>
              <button
                type="button"
                className="btn-cp-modal-close"
                onClick={() => setIsPreviewModalOpen(false)}
                aria-label="Close preview modal"
              >
                ✕
              </button>
            </div>

            <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', background: '#001a41', color: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#00418f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, overflow: 'hidden' }}>
                      {profile.logo_url ? (
                        <img src={profile.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        getCompanyInitials(profile.name)
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '19px', fontFamily: 'Hanken Grotesk', fontWeight: 700 }}>
                        {profile.name || 'Company Name'}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#adc6ff' }}>
                        {profile.office_address || 'Headquarters'}
                        {profile.establishment_year ? ` • Est. ${profile.establishment_year}` : ''}
                      </span>
                    </div>
                  </div>
                  {profile.is_profile_complete && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: 'rgba(5, 150, 105, 0.3)', color: '#d1fae5', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      VERIFIED ENTERPRISE
                    </span>
                  )}
                </div>

                {profile.description ? (
                  <p style={{ margin: '14px 0 0 0', fontSize: '13px', lineHeight: 1.5, color: '#e2e2e5' }}>
                    {profile.description}
                  </p>
                ) : (
                  <p style={{ margin: '14px 0 0 0', fontSize: '12px', color: '#adc6ff', fontStyle: 'italic' }}>
                    No studio overview provided yet.
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: '#f3f3f6', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>TEAM SIZE</div>
                  <div style={{ fontFamily: 'Hanken Grotesk', fontSize: '14px', fontWeight: 700, color: '#1a1c1e' }}>
                    {profile.size ? `${profile.size} Staff` : 'Not specified'}
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: '#f3f3f6', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>OFFICIAL WEBSITE</div>
                  <div style={{ fontFamily: 'Hanken Grotesk', fontSize: '14px', fontWeight: 700, color: '#00418f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00418f', textDecoration: 'none' }}>
                        Visit Link ↗
                      </a>
                    ) : (
                      'None'
                    )}
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: '#f3f3f6', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>TALENT EMAIL</div>
                  <div style={{ fontFamily: 'Hanken Grotesk', fontSize: '13px', fontWeight: 700, color: '#1a1c1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.hr_contact_email || profile.email || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="cp-modal-footer">
              <button
                type="button"
                className="btn-cp-primary"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default CompanyProfile
