import { useState, useMemo, useRef, type FC, type ChangeEvent } from 'react'
import './MyProfile.css'
import {
  useMyProfile,
  CDE_STANDARDS_TAGS,
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
  type SoftwareSkill,
  type CredentialItem,
  type AttachedDocument,
} from './useMyProfile'

interface MyProfileProps {
  onNavigateToPortfolio?: () => void
}

const MyProfile: FC<MyProfileProps> = () => {
  const {
    profile,
    editForm,
    setEditForm,
    isEditingProfile,
    startEditProfile,
    cancelEditProfile,
    saveProfileChanges,
    skills,
    experiences,
    documents,
    credentials,
    handleCopyPublicUrl,
    toggleExclusiveOffers,
    handleUploadResumeFile,
    handleUploadAvatarFile,
    handleDownloadDoc,
    isAddCredOpen,
    setIsAddCredOpen,
    credForm,
    setCredForm,
    handleAddCredentialSubmit,
    handleDeleteCredential,
    isAddExpOpen,
    setIsAddExpOpen,
    expForm,
    setExpForm,
    handleAddExperienceSubmit,
    handleDeleteExperience,
    isManageSkillsOpen,
    closeManageSkills,
    manageSkillsDraft,
    openManageSkills,
    updateDraftSpecificSkill,
    toggleDraftSkill,
    addCustomDraftSkill,
    saveSkillsMatrix,
    toggleEditLocation,
    addCustomEditLocation,
    toastMessage,
    showToast,
  } = useMyProfile()

  const resumeFileInputRef = useRef<HTMLInputElement | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const modalAvatarInputRef = useRef<HTMLInputElement | null>(null)
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null)
  const isAvatarValid = Boolean(profile.profileImageUrl && profile.profileImageUrl !== failedAvatarUrl)
  const isModalAvatarValid = Boolean(editForm.profileImageUrl && editForm.profileImageUrl !== failedAvatarUrl)

  // Custom input states for tags in modals
  const [customSoftwareInput, setCustomSoftwareInput] = useState('')
  const [customTechSkillInput, setCustomTechSkillInput] = useState('')
  const [customSoftSkillInput, setCustomSoftSkillInput] = useState('')
  const [customLocationInput, setCustomLocationInput] = useState('')

  // Clean formatted locations (e.g. "Pune · Mumbai")
  const cleanLocations = useMemo(() => {
    if (!profile.preferredLocations || profile.preferredLocations.length === 0) {
      return profile.location ? profile.location.split(',')[0].trim() : 'Pan-India'
    }
    const cities = profile.preferredLocations
      .map((loc) => loc.split(',')[0].trim())
      .filter(Boolean)
    if (cities.length <= 2) {
      return cities.join(' · ')
    }
    return `${cities.slice(0, 2).join(' · ')} (+${cities.length - 2})`
  }, [profile.preferredLocations, profile.location])

  // Clean formatted phone number (e.g. "+91 98765 43210")
  const formattedPhone = useMemo(() => {
    if (!profile.phone) return ''
    const cleaned = String(profile.phone).replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
    }
    return String(profile.phone)
  }, [profile.phone])

  // Case-insensitive relocation status
  const isWillingRelocate = useMemo(() => {
    const raw = (profile.relocationPreference || '').toLowerCase().trim()
    return raw.includes('yes') || raw === 'true'
  }, [profile.relocationPreference])

  const isOpenRelocate = useMemo(() => {
    const raw = (profile.relocationPreference || '').toLowerCase().trim()
    return raw.includes('open')
  }, [profile.relocationPreference])

  const relocationStatus = useMemo(() => {
    if (isWillingRelocate) return 'Willing to Relocate'
    if (isOpenRelocate) return 'Open to Relocation'
    return 'No Relocation'
  }, [isWillingRelocate, isOpenRelocate])

  const handleResumeFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please upload a PDF document format.')
        return
      }
      handleUploadResumeFile(file)
    }
  }

  // Split skills accurately according to the 3 onboarding taxonomy categories
  const softwareSkills = useMemo(
    () => skills.filter((s: SoftwareSkill) => s.category === 'software'),
    [skills]
  )
  const technicalSkills = useMemo(
    () => skills.filter((s: SoftwareSkill) => s.category === 'technical'),
    [skills]
  )
  const softSkills = useMemo(
    () => skills.filter((s: SoftwareSkill) => s.category === 'soft'),
    [skills]
  )

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
            {/* <span className="talent-verified-tag">
              <span className="pulse-dot" aria-hidden="true" />
              VERIFIED AEC PRACTITIONER | {profile.discipline ? profile.discipline.toUpperCase() : 'BIM SPECIALIST'}
            </span>
            <span className="schema-tag">SCHEMA: IFC4x3</span> */}
          </div>
          <div className="profile-title-row">
            <h1 className="profile-main-title">My Profile</h1>
            {/* <span className="view-tag">[WORKSPACE VIEW]</span> */}
          </div>
          <p className="profile-subtext">
            Manage your verified BIM credentials, technical software stack, academic qualifications, and career preferences & availability.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions-row">
          {/* <button
            type="button"
            className="btn-preview-public"
            onClick={handleCopyPublicUrl}
            aria-label="Preview and copy public talent card URL"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview Public View
          </button> */}

          <button
            type="button"
            className="btn-edit-credentials"
            onClick={startEditProfile}
            aria-label="Edit Profile & Credentials"
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
                {isAvatarValid ? (
                  <img
                    className="hero-avatar-img"
                    src={profile.profileImageUrl}
                    alt={`Portrait of ${profile.fullName}`}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setFailedAvatarUrl(profile.profileImageUrl || '')}
                  />
                ) : (
                  <div className="avatar-initials-fallback">
                    {(profile.fullName || 'Talent').slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Instant Avatar Photo Upload Overlay */}
                <button
                  type="button"
                  className="avatar-upload-overlay"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Upload profile photo"
                  aria-label="Upload profile photo"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFailedAvatarUrl(null)
                      handleUploadAvatarFile(file)
                    }
                  }}
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
                    {profile.availability} · Notice: {profile.noticePeriod}
                  </span>
                  <span className="status-master-pill">{profile.discipline || 'AEC Specialist'}</span>
                </div>

                <div className="candidate-name-row">
                  <h2 className="candidate-name">
                    {profile.fullName}
                  </h2>
                  <p className="candidate-headline">
                    {profile.primarySkill || profile.roleTitle || 'Senior BIM Coordinator & Computational Specialist'}
                  </p>
                </div>

                {profile.bio && (
                  <div className="hero-bio-box">
                    "{profile.bio}"
                  </div>
                )}

                <div className="hero-meta-grid">
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{profile.location || 'Location Not Specified'}</span>
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
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2.5" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                    <span className="meta-salary">{profile.expectedCtc || 'Competitive'}</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>
                      {profile.workMode} · {relocationStatus}
                    </span>
                  </div>
                </div>

                {/* External Social / Portfolio Chips */}
                {(profile.linkedinUrl || profile.portfolioUrl || profile.phone) && (
                  <div className="external-links-row">
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link-chip"
                        title="LinkedIn Profile"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect x="2" y="9" width="4" height="12" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {profile.portfolioUrl && (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link-chip"
                        title="External Portfolio"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Portfolio Link
                      </a>
                    )}
                    {profile.phone && (
                      <span className="external-link-chip contact-phone-chip" title="Direct Phone">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {formattedPhone}
                      </span>
                    )}
                  </div>
                )}
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
                    <span className="stat-pill-sub">ALL-STAR</span>
                  </div>
                  <span className="stat-lbl-sub">Profile Completeness</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="stat-data">
                  <div className="stat-value-line">
                    <span className="stat-val-text stat-locations-text" title={profile.preferredLocations.join(', ')}>
                      {cleanLocations}
                    </span>
                  </div>
                  <span className="stat-lbl-sub">Preferred Locations</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="stat-data">
                  <div className="stat-value-line">
                    <span className="stat-val-text">{profile.availability || 'Immediate'}</span>
                    {profile.noticePeriod && (
                      <span className="stat-pill-notice" title={`Notice Period: ${profile.noticePeriod}`}>
                        {profile.noticePeriod.toLowerCase().includes('notice') ? profile.noticePeriod : `${profile.noticePeriod} Notice`}
                      </span>
                    )}
                  </div>
                  <span className="stat-lbl-sub">Joining Availability</span>
                </div>
              </div>
            </div>
          </article>

          {/* 2. Academic & University Background (Real DB Schema) */}
          <article className="profile-card">
            <div className="section-header-row">
              <div>
                <div className="section-tag-row">
                  <span className="section-tag-primary">ACADEMIC FOUNDATION</span>
                  <span className="section-tag-subtle">• ACCREDITED QUALIFICATION</span>
                </div>
                <h3 className="section-card-title">Academic & Institutional Credentials</h3>
              </div>
              <span className="category-sublabel">VERIFIED DEGREE</span>
            </div>

            <div className="academic-meta-grid">
              <div className="academic-stat-card">
                <span className="academic-label">University / Institution</span>
                <span className="academic-value">{profile.institution || 'Accredited Engineering Institute'}</span>
                <span className="academic-subtext">Foundational AEC Studies</span>
              </div>

              <div className="academic-stat-card">
                <span className="academic-label">Discipline / Branch</span>
                <span className="academic-value">{profile.discipline || 'Civil & Architecture'}</span>
                <span className="academic-subtext">AEC Core Specialization</span>
              </div>

              <div className="academic-stat-card">
                <span className="academic-label">Graduation Year</span>
                <span className="academic-value">Class of {profile.graduationYear || '2024'}</span>
                <span className="academic-subtext">Degree Conferred</span>
              </div>
            </div>
          </article>

          {/* 3. Verified BIM & Computational Software Stack (Aligned with 3 Onboarding Categories) */}
          <article className="profile-card">
            <div className="section-header-row">
              <div>
                <div className="section-tag-row">
                  <span className="section-tag-primary">TECHNICAL MATRIX</span>
                  <span className="section-tag-subtle">• LOD 400 CAPABILITIES</span>
                </div>
                <h3 className="section-card-title">Verified BIM & Computational Software Stack</h3>
              </div>
              <button
                type="button"
                className="btn-section-action"
                onClick={openManageSkills}
                aria-label="Manage skills matrix"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Manage Skills
              </button>
            </div>

            {/* Sub-section 1: Specific Specialization Skill */}
            <div className="skill-category-block">
              <div className="category-label-row">
                <span className="category-label">Specific Specialization Skill</span>
                <span className="category-sublabel">PRIMARY NICHE & EXPERTISE</span>
              </div>
              <div className="specialization-hero-card">
                <div className="specialization-card-inner">
                  <div className="specialization-badge-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="specialization-body">
                    <div className="specialization-header-row">
                      <h4 className="specialization-title-text">
                        {profile.primarySkill || profile.roleTitle || 'LOD 400 BIM Coordination & Façade Dynamo Automation'}
                      </h4>
                      <span className="specialization-pill-badge">VERIFIED SPECIALIZATION</span>
                    </div>
                    <p className="specialization-subtext">
                      Primary industry specialization focused on advanced AEC model federation, parametric scripting, and high-LOD production delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-section 2: Core Software */}
            <div className="skill-category-block">
              <div className="category-label-row">
                <span className="category-label">Core Software</span>
                <span className="category-sublabel">EVERYDAY DESIGN & ENGINEERING SOFTWARE</span>
              </div>
              <div className="tools-grid-2col">
                {softwareSkills.length > 0 ? (
                  softwareSkills.map((skill: SoftwareSkill) => (
                    <div className="tool-meter-card software-skill-card" key={skill.id}>
                      <div className="tool-card-top">
                        <div className="tool-badge-wrap">
                          <div className={`tool-letter-badge ${skill.badgeColor || 'primary'}`}>{skill.badgeLetter}</div>
                          <span className="tool-name-text">{skill.name}</span>
                        </div>
                        <span className="tool-status-pill">{skill.statusLabel || 'PRODUCTION'}</span>
                      </div>
                      {skill.description && (
                        <div className="tool-card-bottom">
                          <span className="category-sublabel">{skill.description}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-notice-card" style={{ gridColumn: '1 / -1' }}>
                    No core software configured yet. Click "Manage Skills" to select your production tools.
                  </div>
                )}
              </div>
            </div>

            {/* Sub-section 3: Technical Skills */}
            <div className="skill-category-block">
              <div className="category-label-row">
                <span className="category-label">Technical Skills</span>
                <span className="category-sublabel">PARAMETRIC AUTOMATION & ADVANCED LOD</span>
              </div>
              <div className="tools-grid-3col">
                {technicalSkills.length > 0 ? (
                  technicalSkills.map((skill: SoftwareSkill) => (
                    <div className="tool-meter-card tech-skill-card" key={skill.id}>
                      <div className="tool-card-top">
                        <div className="tool-badge-wrap">
                          <div className="tool-letter-badge tech-badge">{skill.badgeLetter || '⚙'}</div>
                          <span className="tool-name-text">{skill.name}</span>
                        </div>
                        <span className="tool-status-pill">{skill.statusLabel || 'VERIFIED'}</span>
                      </div>
                      {skill.description && (
                        <div className="tool-card-bottom">
                          <span className="category-sublabel">{skill.description}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-notice-card" style={{ gridColumn: '1 / -1' }}>
                    No technical skills registered yet. Click "Manage Skills" to add your capabilities.
                  </div>
                )}
              </div>
            </div>

            {/* Sub-section 4: Soft Skills */}
            <div className="skill-category-block">
              <div className="category-label-row">
                <span className="category-label">Soft Skills</span>
                <span className="category-sublabel">PROFESSIONAL COMPETENCIES & LEADERSHIP</span>
              </div>
              <div className="tools-grid-3col">
                {softSkills.length > 0 ? (
                  softSkills.map((skill: SoftwareSkill) => (
                    <div className="tool-meter-card soft-skill-card" key={skill.id}>
                      <div className="tool-card-top">
                        <div className="tool-badge-wrap">
                          <div className="tool-letter-badge secondary">✓</div>
                          <span className="tool-name-text">{skill.name}</span>
                        </div>
                        <span className="tool-status-pill endorsed">ENDORSED</span>
                      </div>
                      {skill.description && (
                        <div className="tool-card-bottom">
                          <span className="category-sublabel">{skill.description}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-notice-card" style={{ gridColumn: '1 / -1' }}>
                    No soft skills added yet. Click "Manage Skills" to select your competencies.
                  </div>
                )}
              </div>
            </div>

            {/* Category 5: CDE & Standards Badges */}
            {/* <div className="skill-category-block">
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
            </div> */}
          </article>

          {/* 4. Portfolio Repository Section (COMMENTED AS REQUESTED)
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
                  if (profile.portfolioUrl) {
                    window.open(profile.portfolioUrl, '_blank')
                  } else if (onNavigateToPortfolio) {
                    onNavigateToPortfolio()
                  } else {
                    showToast('Please add your Portfolio Link in Edit Profile.')
                  }
                }}
              >
                {profile.portfolioUrl ? 'Open Portfolio Link ↗' : 'Explore Full Portfolio Workspace →'}
              </button>
            </div>

            {profile.portfolioUrl && (
              <div className="portfolio-banner-link">
                <div className="portfolio-banner-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <div>
                    <span className="portfolio-banner-title">Verified Portfolio Workspace Connected</span>
                    <span className="portfolio-banner-url">{profile.portfolioUrl}</span>
                  </div>
                </div>
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-visit-portfolio"
                >
                  Visit Workspace ↗
                </a>
              </div>
            )}

            <div className="projects-mosaic-list">
              {INITIAL_PORTFOLIO_PROJECTS.map((proj: PortfolioProject) => (
                <div
                  key={proj.id}
                  className="project-showcase-item"
                  role="button"
                  tabIndex={0}
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
          </article>
          */}

          {/* 5. Professional Experience & Milestones Timeline (Real student_experience) */}
          <article className="profile-card">
            <div className="section-header-row">
              <div>
                <div className="section-tag-row">
                  <span className="section-tag-primary">TIMELINE MILESTONES</span>
                  <span className="section-tag-subtle">• INDUSTRY EXPERIENCE</span>
                </div>
                <h3 className="section-card-title">Professional Experience & Milestones</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="category-sublabel">{profile.experienceYears}</span>
                <button
                  type="button"
                  className="btn-section-action"
                  onClick={() => setIsAddExpOpen(true)}
                  aria-label="Add new experience milestone"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Experience
                </button>
              </div>
            </div>

            <div className="career-timeline-wrap">
              {experiences.length > 0 ? (
                experiences.map((exp) => (
                  <div className="timeline-milestone-node" key={exp.id}>
                    <div className={`node-bullet ${exp.active ? 'active' : ''}`} aria-hidden="true" />
                    <div className="node-title-line">
                      <h4 className="node-role-title">{exp.role}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="node-period-tag">{exp.period}</span>
                        <button
                          type="button"
                          className="btn-delete-node"
                          onClick={() => handleDeleteExperience(exp.id)}
                          title="Remove milestone"
                          aria-label={`Remove milestone ${exp.role}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="node-company-line">
                      {exp.company} {exp.location ? `· ${exp.location}` : ''}
                    </p>
                    <p className="node-desc-text">{exp.description}</p>
                    {exp.tags && exp.tags.length > 0 && (
                      <div className="node-tags-row">
                        {exp.tags.map((tag) => (
                          <span className="node-mini-pill" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-notice-card">
                  No experience milestones logged. Click "+ Add Experience" above to record your firm or project history.
                </div>
              )}
            </div>
          </article>
        </section>

        {/* RIGHT COLUMN: Verification, Documents, Preferences & Telemetry (4 Cols) */}
        <aside className="profile-sidebar" aria-label="AEC Credentials, Documents, and Preferences">
          {/* 1. Verification & ISO Credentials Card (Real certificates table) */}
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
                {credentials.length} VERIFIED
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
                  <button
                    type="button"
                    className="btn-delete-node"
                    onClick={() => handleDeleteCredential(cred.id)}
                    title="Remove credential"
                    aria-label={`Remove credential ${cred.title}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-sidebar-block"
              onClick={() => setIsAddCredOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add License or Certification
            </button>
          </div>

          {/* 2. Real Attached Documents & Resume PDF (Real resume_file_url) */}
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
                    onClick={() => handleDownloadDoc(doc.name, doc.url)}
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

            {/* Hidden file input for uploading real resume PDF */}
            <input
              type="file"
              ref={resumeFileInputRef}
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handleResumeFileChange}
            />

            <button
              type="button"
              className="btn-sidebar-block"
              onClick={() => resumeFileInputRef.current?.click()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Updated Resume PDF
            </button>
          </div>

          {/* 3. Career Preferences & Availability (Real DB Schema) */}
          <div className="profile-card">
            <div className="category-label-row">
              <h3 className="section-card-title" style={{ fontSize: '17px' }}>
                Career Preferences & Availability
              </h3>
              <span className="category-sublabel">ACTIVE</span>
            </div>

            <div className="telemetry-switch-row">
              <div className="telemetry-switch-text">
                <span className="telemetry-title">Direct Recruiter Visibility</span>
                <span className="telemetry-sub">Visible to vetted AEC firms</span>
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
              <span className="pref-label">Work Mode</span>
              <div className="pref-pills-row">
                <span className="pref-pill">{profile.workMode || 'Flexible'}</span>
              </div>
            </div>

            <div className="telemetry-pref-group">
              <span className="pref-label">Preferred Job Locations</span>
              <div className="pref-pills-row">
                {profile.preferredLocations && profile.preferredLocations.length > 0 ? (
                  profile.preferredLocations.map((loc: string) => (
                    <span className="pref-pill" key={loc}>
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="pref-pill">{profile.location || 'Pan-India'}</span>
                )}
              </div>
            </div>

            <div className="telemetry-pref-group">
              <span className="pref-label">Joining Availability & Notice</span>
              <div className="pref-pills-row">
                <span className="pref-pill subtle">{profile.availability || 'Immediate'}</span>
                <span className="pref-pill subtle">{profile.noticePeriod || '15 Days'}</span>
              </div>
            </div>

            <div className="telemetry-pref-group">
              <span className="pref-label">Relocation / Mobility</span>
              <p className="category-sublabel" style={{ color: '#424753', margin: 0 }}>
                {isWillingRelocate
                  ? 'Willing to relocate for compelling career opportunities.'
                  : isOpenRelocate
                  ? 'Open to hybrid/relocation with relocation assistance.'
                  : 'Prefers local or remote arrangements.'}
              </p>
            </div>

            <div className="telemetry-pref-group">
              <span className="pref-label">Expected Annual CTC</span>
              <span className="pref-pill" style={{ fontWeight: 600, color: '#00418f' }}>
                {profile.expectedCtc || 'Negotiable'}
              </span>
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
              <span className="url-code-text">{profile.publicProfileUrl || `castallio.one/talent/${profile.id}`}</span>
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

            {/* <div className="qr-passport-row">
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
                <span className="qr-desc">Scan directly for mobile AEC credential passport.</span>
              </div>
            </div> */}
          </div>
        </aside>
      </main>

      {/* ── MODAL 1: Edit Profile & Credentials (100% Aligned with Onboarding Flow) ── */}
      {isEditingProfile && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="profile-modal-dialog">
            <div className="modal-header">
              <div>
                <h2 id="modal-title">Edit Profile & Credentials</h2>
                <p className="modal-header-sub">
                  Update your candidate personal information, AEC discipline, and career search parameters.
                </p>
              </div>
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
              {/* Profile Photo Upload Card */}
              <div className="modal-avatar-uploader-card">
                <div className="modal-avatar-left-col">
                  <div className="modal-avatar-thumb">
                    {isModalAvatarValid ? (
                      <img
                        src={editForm.profileImageUrl}
                        alt="Profile preview"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="modal-avatar-thumb-img"
                        onError={() => setFailedAvatarUrl(editForm.profileImageUrl || '')}
                      />
                    ) : (
                      <div className="modal-avatar-fallback">
                        {(editForm.fullName || 'Talent').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="modal-avatar-meta">
                    <span className="modal-avatar-label">Candidate Portrait</span>
                    <span className="modal-avatar-hint">Square PNG, JPG, or WebP (max 5 MB)</span>
                  </div>
                </div>

                <div className="modal-avatar-right-col">
                  <input
                    ref={modalAvatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFailedAvatarUrl(null)
                        handleUploadAvatarFile(file)
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-modal-change-photo"
                    onClick={() => modalAvatarInputRef.current?.click()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Row 1: Full Name & Discipline Dropdown */}
              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Full Name *</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">AEC Discipline *</label>
                  <select
                    className="modal-input"
                    value={editForm.discipline}
                    onChange={(e) => setEditForm({ ...editForm, discipline: e.target.value })}
                  >
                    <option value="">Select your discipline</option>
                    {DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Primary Specialization Headline */}
              <div className="modal-form-group">
                <label className="modal-label">Primary Specialization / Headline *</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editForm.primarySkill}
                  placeholder="e.g. Lead BIM Coordinator & Computational Specialist"
                  onChange={(e) => setEditForm({ ...editForm, primarySkill: e.target.value })}
                />
              </div>

              {/* Row 3: Professional Bio */}
              <div className="modal-form-group">
                <label className="modal-label">Professional Bio *</label>
                <textarea
                  className="modal-textarea"
                  rows={3}
                  value={editForm.bio}
                  placeholder="Summarize your AEC experience, BIM LOD competencies, and projects..."
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>

              {/* Row 4: Current City & Contact Phone */}
              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Current City / Location *</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">Direct Contact Number *</label>
                  <input
                    type="tel"
                    className="modal-input"
                    placeholder="e.g. 98765 43210"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 5: University & Graduation Year */}
              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">University / Institution *</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.institution}
                    onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">Graduation Year *</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.graduationYear}
                    placeholder="e.g. 2023"
                    onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 6: Work Mode & Willing to Relocate */}
              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Work Mode *</label>
                  <select
                    className="modal-input"
                    value={editForm.workMode}
                    onChange={(e) => setEditForm({ ...editForm, workMode: e.target.value })}
                  >
                    {WORK_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Willing to Relocate? *</label>
                  <div className="pill-choice-group">
                    <button
                      type="button"
                      className={`pill-choice-btn ${
                        (editForm.relocationPreference || '').toLowerCase().includes('yes') ? 'selected' : ''
                      }`}
                      onClick={() => setEditForm({ ...editForm, relocationPreference: 'Yes' })}
                    >
                      Yes, Willing
                    </button>
                    <button
                      type="button"
                      className={`pill-choice-btn ${
                        (editForm.relocationPreference || '').toLowerCase().includes('open') ? 'selected' : ''
                      }`}
                      onClick={() => setEditForm({ ...editForm, relocationPreference: 'Open' })}
                    >
                      Open to Discuss
                    </button>
                    <button
                      type="button"
                      className={`pill-choice-btn ${
                        (editForm.relocationPreference || '').toLowerCase().includes('no') ? 'selected' : ''
                      }`}
                      onClick={() => setEditForm({ ...editForm, relocationPreference: 'No' })}
                    >
                      No (Local Only)
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 7: Availability & Employment Type */}
              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Availability *</label>
                  <select
                    className="modal-input"
                    value={editForm.availability}
                    onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                  >
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Employment Type *</label>
                  <select
                    className="modal-input"
                    value={editForm.employmentType}
                    onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 8: Notice Period & Expected CTC */}
              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Notice Period *</label>
                  <select
                    className="modal-input"
                    value={editForm.noticePeriod}
                    onChange={(e) => setEditForm({ ...editForm, noticePeriod: e.target.value })}
                  >
                    {NOTICE_PERIODS.map((np) => (
                      <option key={np} value={np}>
                        {np}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Expected Annual CTC *</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.expectedCtc}
                    placeholder="e.g. ₹12,00,000"
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        expectedCtc: e.target.value.startsWith('₹')
                          ? e.target.value
                          : `₹${formatIndianNumber(e.target.value)}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Row 9: Preferred Locations Interactive Multi-Select */}
              <div className="modal-form-group">
                <label className="modal-label">Preferred Job Locations *</label>
                <div className="tags-interactive-wrap">
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = editForm.preferredLocations?.includes(loc)
                    return (
                      <button
                        key={loc}
                        type="button"
                        className={`tag-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleEditLocation(loc)}
                      >
                        <span>{loc}</span>
                        {isSelected && <span className="chip-remove-x">✓</span>}
                      </button>
                    )
                  })}
                  {/* Any custom added locations */}
                  {editForm.preferredLocations
                    ?.filter((l) => !POPULAR_LOCATIONS.includes(l))
                    .map((customLoc) => (
                      <button
                        key={customLoc}
                        type="button"
                        className="tag-chip active custom"
                        onClick={() => toggleEditLocation(customLoc)}
                      >
                        <span>{customLoc}</span>
                        <span className="chip-remove-x">✕</span>
                      </button>
                    ))}
                </div>

                <div className="custom-tag-input-row">
                  <input
                    type="text"
                    className="modal-input custom-tag-input"
                    placeholder="Add another city (e.g. Bengaluru, Singapore)..."
                    value={customLocationInput}
                    onChange={(e) => setCustomLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (customLocationInput.trim()) {
                          addCustomEditLocation(customLocationInput)
                          setCustomLocationInput('')
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-tag"
                    onClick={() => {
                      if (customLocationInput.trim()) {
                        addCustomEditLocation(customLocationInput)
                        setCustomLocationInput('')
                      }
                    }}
                  >
                    + Add Location
                  </button>
                </div>
              </div>

              {/* Row 10: Portfolio & LinkedIn URL */}
              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Portfolio URL</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.portfolioUrl}
                    placeholder="https://behance.net/..."
                    onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editForm.linkedinUrl}
                    placeholder="https://linkedin.com/in/..."
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                  />
                </div>
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

      {/* ── MODAL 2: Manage Technical Skills & Software Stack (Synced with student_skills) ── */}
      {isManageSkillsOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="manage-skills-title">
          <div className="profile-modal-dialog skills-modal-dialog">
            <div className="modal-header">
              <div>
                <h2 id="manage-skills-title">Manage Technical Software Stack & Skills</h2>
                <p className="modal-header-sub">
                  Select your core authoring tools, technical competencies, and soft skills aligned with the Castallio One taxonomy.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeManageSkills}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* 1. Specific Specialization Skill */}
              <div className="modal-form-group">
                <div className="label-row">
                  <label className="modal-label" htmlFor="manageSpecificSkillInput">
                    Specific Specialization Skill
                  </label>
                  <span className="modal-badge-count">PRIMARY NICHE</span>
                </div>
                <input
                  id="manageSpecificSkillInput"
                  type="text"
                  className="modal-input"
                  placeholder="e.g. LOD 400 BIM Coordination & Façade Dynamo Automation"
                  value={manageSkillsDraft.specificSkill}
                  onChange={(e) => updateDraftSpecificSkill(e.target.value)}
                />
                <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Your primary niche (e.g. LOD-400 Clash Coordinator, Rhino Dynamo Façade Specialist)
                </span>
              </div>

              {/* 2. Core Software */}
              <div className="modal-form-group">
                <div className="label-row">
                  <label className="modal-label">
                    Core Software
                  </label>
                  <span className="modal-badge-count">{manageSkillsDraft.coreSoftware.length} SELECTED</span>
                </div>
                <div className="tags-interactive-wrap">
                  {PREDEFINED_CORE_SOFTWARE.map((soft) => {
                    const isSelected = manageSkillsDraft.coreSoftware.includes(soft)
                    return (
                      <button
                        key={soft}
                        type="button"
                        className={`tag-chip soft-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleDraftSkill('coreSoftware', soft)}
                      >
                        <span className="chip-badge-letter">{soft.slice(0, 1)}</span>
                        <span>{soft}</span>
                        {isSelected && <span className="chip-remove-x">✓</span>}
                      </button>
                    )
                  })}
                  {manageSkillsDraft.coreSoftware
                    .filter((s) => !PREDEFINED_CORE_SOFTWARE.includes(s))
                    .map((customSoft) => (
                      <button
                        key={customSoft}
                        type="button"
                        className="tag-chip soft-chip active custom"
                        onClick={() => toggleDraftSkill('coreSoftware', customSoft)}
                      >
                        <span className="chip-badge-letter">+</span>
                        <span>{customSoft}</span>
                        <span className="chip-remove-x">✕</span>
                      </button>
                    ))}
                </div>
                <div className="custom-tag-input-row">
                  <input
                    type="text"
                    className="modal-input custom-tag-input"
                    placeholder="Add another software (e.g. Tekla Structures, Blender)..."
                    value={customSoftwareInput}
                    onChange={(e) => setCustomSoftwareInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (customSoftwareInput.trim()) {
                          addCustomDraftSkill('coreSoftware', customSoftwareInput)
                          setCustomSoftwareInput('')
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-tag"
                    onClick={() => {
                      if (customSoftwareInput.trim()) {
                        addCustomDraftSkill('coreSoftware', customSoftwareInput)
                        setCustomSoftwareInput('')
                      }
                    }}
                  >
                    + Add Software
                  </button>
                </div>
              </div>

              {/* 3. Technical Skills */}
              <div className="modal-form-group">
                <div className="label-row">
                  <label className="modal-label">
                    Technical Skills
                  </label>
                  <span className="modal-badge-count">{manageSkillsDraft.technicalSkills.length} SELECTED</span>
                </div>
                <div className="tags-interactive-wrap">
                  {PREDEFINED_TECH_SKILLS.map((tech) => {
                    const isSelected = manageSkillsDraft.technicalSkills.includes(tech)
                    return (
                      <button
                        key={tech}
                        type="button"
                        className={`tag-chip tech-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleDraftSkill('technicalSkills', tech)}
                      >
                        <span>{tech}</span>
                        {isSelected && <span className="chip-remove-x">✓</span>}
                      </button>
                    )
                  })}
                  {manageSkillsDraft.technicalSkills
                    .filter((s) => !PREDEFINED_TECH_SKILLS.includes(s))
                    .map((customTech) => (
                      <button
                        key={customTech}
                        type="button"
                        className="tag-chip tech-chip active custom"
                        onClick={() => toggleDraftSkill('technicalSkills', customTech)}
                      >
                        <span>{customTech}</span>
                        <span className="chip-remove-x">✕</span>
                      </button>
                    ))}
                </div>
                <div className="custom-tag-input-row">
                  <input
                    type="text"
                    className="modal-input custom-tag-input"
                    placeholder="Add technical capability (e.g. Computational Fluid Dynamics)..."
                    value={customTechSkillInput}
                    onChange={(e) => setCustomTechSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (customTechSkillInput.trim()) {
                          addCustomDraftSkill('technicalSkills', customTechSkillInput)
                          setCustomTechSkillInput('')
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-tag"
                    onClick={() => {
                      if (customTechSkillInput.trim()) {
                        addCustomDraftSkill('technicalSkills', customTechSkillInput)
                        setCustomTechSkillInput('')
                      }
                    }}
                  >
                    + Add Technical Skill
                  </button>
                </div>
              </div>

              {/* 4. Soft Skills */}
              <div className="modal-form-group">
                <div className="label-row">
                  <label className="modal-label">
                    Soft Skills
                  </label>
                  <span className="modal-badge-count">{manageSkillsDraft.softSkills.length} SELECTED</span>
                </div>
                <div className="tags-interactive-wrap">
                  {PREDEFINED_SOFT_SKILLS.map((soft) => {
                    const isSelected = manageSkillsDraft.softSkills.includes(soft)
                    return (
                      <button
                        key={soft}
                        type="button"
                        className={`tag-chip softskill-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleDraftSkill('softSkills', soft)}
                      >
                        <span>{soft}</span>
                        {isSelected && <span className="chip-remove-x">✓</span>}
                      </button>
                    )
                  })}
                  {manageSkillsDraft.softSkills
                    .filter((s) => !PREDEFINED_SOFT_SKILLS.includes(s))
                    .map((customSoft) => (
                      <button
                        key={customSoft}
                        type="button"
                        className="tag-chip softskill-chip active custom"
                        onClick={() => toggleDraftSkill('softSkills', customSoft)}
                      >
                        <span>{customSoft}</span>
                        <span className="chip-remove-x">✕</span>
                      </button>
                    ))}
                </div>
                <div className="custom-tag-input-row">
                  <input
                    type="text"
                    className="modal-input custom-tag-input"
                    placeholder="Add soft skill (e.g. Stakeholder Management, Mentorship)..."
                    value={customSoftSkillInput}
                    onChange={(e) => setCustomSoftSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (customSoftSkillInput.trim()) {
                          addCustomDraftSkill('softSkills', customSoftSkillInput)
                          setCustomSoftSkillInput('')
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-tag"
                    onClick={() => {
                      if (customSoftSkillInput.trim()) {
                        addCustomDraftSkill('softSkills', customSoftSkillInput)
                        setCustomSoftSkillInput('')
                      }
                    }}
                  >
                    + Add Soft Skill
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-preview-public"
                onClick={closeManageSkills}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-edit-credentials"
                onClick={saveSkillsMatrix}
              >
                Save Skills Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Add Professional Experience Milestone (Synced with student_experience) ── */}
      {isAddExpOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-exp-title">
          <div className="profile-modal-dialog" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h2 id="add-exp-title">Add Professional Experience Milestone</h2>
                <p className="modal-header-sub">Log your AEC industry roles, firm details, and project deliverables.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddExpOpen(false)}
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
                  <label className="modal-label">Role / Job Title *</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Senior BIM Coordinator"
                    value={expForm.role}
                    onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">Organisation / Firm Name *</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Foster + Partners, BDP"
                    value={expForm.organization}
                    onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-grid-2col">
                <div className="modal-form-group">
                  <label className="modal-label">Start Date *</label>
                  <input
                    type="month"
                    className="modal-input"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">End Date {!expForm.currentlyWorking && '*'}</label>
                  {expForm.currentlyWorking ? (
                    <div className="present-badge-field">
                      <span className="present-dot" />
                      <span className="present-text">Present (Ongoing)</span>
                    </div>
                  ) : (
                    <input
                      type="month"
                      className="modal-input"
                      value={expForm.endDate}
                      onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="currently-working-row">
                <label className="currently-working-checkbox">
                  <input
                    type="checkbox"
                    checked={expForm.currentlyWorking}
                    onChange={(e) => setExpForm({ ...expForm, currentlyWorking: e.target.checked })}
                  />
                  <span className="checkbox-custom">
                    {expForm.currentlyWorking && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="checkbox-text">I am currently working in this role</span>
                </label>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Key Contribution & Project Deliverables *</label>
                <textarea
                  className="modal-textarea"
                  rows={3}
                  placeholder="Detail your modeling contributions, clashes resolved, LOD 400 federated coordination, Dynamo scripts created..."
                  value={expForm.contributions}
                  onChange={(e) => setExpForm({ ...expForm, contributions: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-preview-public"
                onClick={() => setIsAddExpOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-edit-credentials"
                onClick={handleAddExperienceSubmit}
              >
                Add Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Add AEC Credential or License (Synced with certificates) ── */}
      {isAddCredOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-cred-title">
          <div className="profile-modal-dialog" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h2 id="add-cred-title">Add AEC Credential or License</h2>
                <p className="modal-header-sub">Verify your professional licenses, software certs, and accreditations.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddCredOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-form-group">
                <label className="modal-label">Certification Title *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. ISO-19650 Information Management"
                  value={credForm.title}
                  onChange={(e) => setCredForm({ ...credForm, title: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Issuing Organization / Authority *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. BRE Academy, Autodesk, buildingSMART"
                  value={credForm.organization}
                  onChange={(e) => setCredForm({ ...credForm, organization: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Issue Date / Year</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. 2024"
                  value={credForm.issueDate}
                  onChange={(e) => setCredForm({ ...credForm, issueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-preview-public"
                onClick={() => setIsAddCredOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-edit-credentials"
                onClick={handleAddCredentialSubmit}
              >
                Add Credential
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyProfile
