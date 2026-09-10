import type { FC } from 'react'
import './PostJob.css'
import {
  usePostJob,
  type ToolItem,
  type CandidatePreview,
} from './usePostJob'

interface PostJobProps {
  onCancel?: () => void
  onSuccess?: () => void
}

export const PostJob: FC<PostJobProps> = ({ onSuccess }) => {
  const {
    currentStep,
    setCurrentStep,
    title,
    setTitle,
    department,
    setDepartment,
    workplaceModel,
    setWorkplaceModel,
    location,
    setLocation,
    employmentFramework,
    setEmploymentFramework,
    bimLevels,
    handleToggleBimLevel,
    governanceProtocols,
    handleToggleProtocol,
    sectors,
    newSectorInput,
    setNewSectorInput,
    isAddingSector,
    setIsAddingSector,
    handleAddSector,
    handleRemoveSector,
    tools,
    handleToggleToolMandatory,
    attachSandbox,
    setAttachSandbox,
    descViewMode,
    setDescViewMode,
    description,
    setDescription,
    currency,
    setCurrency,
    minSalary,
    setMinSalary,
    maxSalary,
    setMaxSalary,
    syndicateRiba,
    setSyndicateRiba,
    vipHeadhunterPing,
    setVipHeadhunterPing,
    stealthMode,
    setStealthMode,
    candidateMatches,
    healthScore,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isPublishSuccessModalOpen,
    setIsPublishSuccessModalOpen,
    toastMessage,
    showToast,
    handleEnhanceWithBep,
    handleSaveDraft,
    handleSaveTemplate,
    handlePublishRequisition,
  } = usePostJob(onSuccess)

  const availableBimLevels = [
    'BIM Level 2 (ISO 19650)',
    'openBIM / IFC 4x3 Core',
    'LOD 350 Detailed Design',
    'LOD 400 Fabrication Ready',
    'LOD 500 Digital Twin',
    'BS 8541 Component Mgmt',
  ]

  const governanceList = [
    { name: 'ISO 19650-2 CDE Protocols', sub: 'WIP → SHARED → PUBLISHED Gates' },
    { name: 'EIR & BEP Authoring Expertise', sub: 'Pre-contract & Post-contract BEP Delivery' },
    { name: 'COBie Drop Standards (UK Annex)', sub: 'Asset Information Model Data Schema' },
    { name: 'Automated Clash Tolerances (< 5mm)', sub: 'Hard & Soft Envelope Coordination' },
  ]

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
            <span>REQ_ENGINE_V3.2</span>
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
            ISO 19650 &amp; openBIM VERIFIED
          </span>
        </div>

        <div className="pj-telemetry-right">
          <span style={{ color: '#727784' }}>AUTHOR:</span>
          <span style={{ background: '#d8e2ff', color: '#001a41', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
            Foster + Partners (Applied R&amp;D Studio)
          </span>
        </div>
      </section>

      {/* 2. Header & Action Ribbon */}
      <header className="pj-header-section">
        <div className="pj-title-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pj-stage-tag">AEC Precision Talent Deployment</span>
            <span style={{ color: '#727784' }}>/</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              STAGE 0{currentStep}: {currentStep === 1 ? 'CORE DETAILS' : currentStep === 2 ? 'TECHNICAL MATRIX' : currentStep === 3 ? 'COMPUTATIONAL STACK' : 'VERIFICATION'}
            </span>
          </div>
          <h1 className="pj-main-heading">Post an AEC Technical Requisition</h1>
          <p className="pj-lead-description">
            Deploy parametric algorithms, BIM Execution Plan (BEP) requirements, and verified software proficiencies to reach top 1% global computational design &amp; VDC specialists.
          </p>
        </div>

        <div className="pj-action-cluster">
          <button
            type="button"
            className="btn-pj-light"
            onClick={handleSaveDraft}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            className="btn-pj-light"
            onClick={() => setIsImportModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Import Past Requisition</span>
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

      {/* 3. Technical Stepper Indicator (Digital Blueprint Ruler Style) */}
      <section className="pj-stepper-box" aria-label="Requisition Stepper">
        <div className="pj-stepper-grid">
          {/* Step 1 */}
          <div
            className={`step-box-item ${currentStep === 1 ? 'active' : ''}`}
            onClick={() => setCurrentStep(1)}
            role="button"
            tabIndex={0}
          >
            <div className={`step-num-badge ${currentStep > 1 ? 'done' : currentStep === 1 ? 'active' : ''}`}>
              {currentStep > 1 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '15px', height: '15px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                '01'
              )}
            </div>
            <div className="step-meta-col">
              <span className="step-sub-lbl">Step 01 // {currentStep > 1 ? 'Completed' : 'Active'}</span>
              <span className="step-main-lbl">Requisition Core Details</span>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`step-box-item ${currentStep === 2 ? 'active' : ''}`}
            onClick={() => setCurrentStep(2)}
            role="button"
            tabIndex={0}
          >
            <div className={`step-num-badge ${currentStep > 2 ? 'done' : currentStep === 2 ? 'active' : ''}`}>
              {currentStep > 2 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '15px', height: '15px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                '02'
              )}
            </div>
            <div className="step-meta-col">
              <span className="step-sub-lbl">Step 02 // {currentStep === 2 ? 'Active' : currentStep > 2 ? 'Completed' : 'Queued'}</span>
              <span className="step-main-lbl">AEC &amp; BIM Framework</span>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`step-box-item ${currentStep === 3 ? 'active' : ''}`}
            onClick={() => setCurrentStep(3)}
            role="button"
            tabIndex={0}
          >
            <div className={`step-num-badge ${currentStep > 3 ? 'done' : currentStep === 3 ? 'active' : ''}`}>
              {currentStep > 3 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '15px', height: '15px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                '03'
              )}
            </div>
            <div className="step-meta-col">
              <span className="step-sub-lbl">Step 03 // {currentStep === 3 ? 'Active' : currentStep > 3 ? 'Completed' : 'Queued'}</span>
              <span className="step-main-lbl">Computational Stack</span>
            </div>
          </div>

          {/* Step 4 */}
          <div
            className={`step-box-item ${currentStep === 4 ? 'active' : ''}`}
            onClick={() => setCurrentStep(4)}
            role="button"
            tabIndex={0}
          >
            <div className={`step-num-badge ${currentStep === 4 ? 'active' : ''}`}>04</div>
            <div className="step-meta-col">
              <span className="step-sub-lbl">Step 04 // {currentStep === 4 ? 'Active' : 'Verification'}</span>
              <span className="step-main-lbl">Comp &amp; Verification</span>
            </div>
          </div>
        </div>

        {/* Segmented Track */}
        <div className="segmented-progress-track">
          <div className={`track-segment ${currentStep >= 1 ? 'filled' : ''}`} />
          <div className={`track-segment ${currentStep >= 2 ? 'filled' : ''}`} />
          <div className={`track-segment ${currentStep >= 3 ? 'filled' : ''}`} />
          <div className={`track-segment ${currentStep >= 4 ? 'filled' : ''}`} />
        </div>
      </section>

      {/* 4. Main Grid: 8 Columns Form, 4 Columns Live Intelligence */}
      <main className="pj-main-grid">
        {/* Form Columns (8 Cols) */}
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
                  <h2 className="pj-section-title" id="sec-overview-title">Role Overview &amp; Classification</h2>
                  <span className="pj-section-subline">PRIMARY REQUISITION METADATA</span>
                </div>
              </div>

              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#eeeef0', color: '#39464f', padding: '3px 8px', borderRadius: '6px' }}>
                ISO-COMPLIANT ID: REQ-F+P-8041
              </span>
            </div>

            {/* Title & Quick Chips */}
            <div className="pj-field-group">
              <label className="pj-field-label" htmlFor="title-input">
                <span>Requisition Title</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontSize: '11px' }}>
                  AEC Taxonomy Match 100%
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="title-input"
                  type="text"
                  className="pj-text-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ position: 'absolute', right: '12px', top: '12px', width: '18px', height: '18px' }} aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="pj-chips-cloud">
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Recommended:</span>
                <button
                  type="button"
                  className="pj-quick-chip"
                  onClick={() => setTitle('BIM Director / ISO 19650 Lead')}
                >
                  BIM Director / ISO 19650 Lead
                </button>
                <button
                  type="button"
                  className="pj-quick-chip"
                  onClick={() => setTitle('Senior VDC Infrastructure Coordinator')}
                >
                  Senior VDC Infrastructure Coordinator
                </button>
                <button
                  type="button"
                  className="pj-quick-chip"
                  onClick={() => setTitle('Parametric Scripting Engineer')}
                >
                  Parametric Scripting Engineer
                </button>
              </div>
            </div>

            {/* Department & Workplace Model */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="pj-field-group">
                <label className="pj-field-label">Department / Specialist Studio</label>
                <input
                  type="text"
                  className="pj-text-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="pj-field-group">
                <label className="pj-field-label">Workplace Model</label>
                <div className="segmented-pill-selector">
                  <button
                    type="button"
                    className={`segmented-pill-btn ${workplaceModel === 'On-site' ? 'active' : ''}`}
                    onClick={() => setWorkplaceModel('On-site')}
                  >
                    On-site
                  </button>
                  <button
                    type="button"
                    className={`segmented-pill-btn ${workplaceModel === 'Hybrid' ? 'active' : ''}`}
                    onClick={() => setWorkplaceModel('Hybrid')}
                  >
                    Hybrid
                  </button>
                  <button
                    type="button"
                    className={`segmented-pill-btn ${workplaceModel === 'Remote' ? 'active' : ''}`}
                    onClick={() => setWorkplaceModel('Remote')}
                  >
                    Remote
                  </button>
                </div>
              </div>
            </div>

            {/* Location & Employment Framework */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="pj-field-group">
                <label className="pj-field-label">Studio Location</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f3f3f6', borderRadius: '8px', padding: '0 10px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#727784" strokeWidth="2" style={{ width: '18px', height: '18px', flexShrink: 0 }} aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    type="text"
                    className="pj-text-input"
                    style={{ background: 'transparent', border: 'none' }}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="pj-field-group">
                <label className="pj-field-label">Employment Framework</label>
                <select
                  className="pj-select-input"
                  value={employmentFramework}
                  onChange={(e) => setEmploymentFramework(e.target.value)}
                >
                  <option value="Full-time Permanent (Studio Staff)">Full-time Permanent (Studio Staff)</option>
                  <option value="Contract / Freelance (Inside IR35)">Contract / Freelance (Inside IR35)</option>
                  <option value="Visiting Computation Fellow / Postdoc">Visiting Computation Fellow / Postdoc</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: AEC Technical Standards & BIM Maturity */}
          <section className="pj-section-card" aria-labelledby="sec-standards-title">
            <div className="pj-section-header">
              <div className="pj-section-title-wrap">
                <div className="pj-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="pj-section-title" id="sec-standards-title">AEC Technical Standards &amp; BIM Maturity</h2>
                  <span className="pj-section-subline">GOVERNANCE &amp; INFORMATION ARCHITECTURE</span>
                </div>
              </div>

              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#d8e2ff', color: '#00418f', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                CORE CRITERIA
              </span>
            </div>

            {/* BIM Maturity Selector */}
            <div className="pj-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="pj-field-label">BIM Maturity &amp; Specification Thresholds</label>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Multi-Select Enabled</span>
              </div>

              <div className="bim-levels-grid">
                {availableBimLevels.map((lvl) => {
                  const isSelected = bimLevels.includes(lvl)

                  return (
                    <button
                      key={lvl}
                      type="button"
                      className={`bim-level-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleBimLevel(lvl)}
                    >
                      <span>{lvl}</span>
                      {isSelected ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#727784" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Governance Protocols */}
            <div className="pj-field-group">
              <label className="pj-field-label">Required Governance Protocols</label>
              <div className="governance-grid">
                {governanceList.map((gov) => {
                  const isChecked = governanceProtocols.includes(gov.name)

                  return (
                    <label className="governance-check-label" key={gov.name}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleProtocol(gov.name)}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e' }}>{gov.name}</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>{gov.sub}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Project Sector & Scale Focus */}
            <div className="pj-field-group">
              <label className="pj-field-label">Project Sector &amp; Scale Focus</label>
              <div className="pj-chips-cloud">
                {sectors.map((sec) => (
                  <span
                    key={sec}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#d8e2ff',
                      color: '#001a41',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                    }}
                  >
                    {sec}
                    <button
                      type="button"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      onClick={() => handleRemoveSector(sec)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '13px', height: '13px' }}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}

                {isAddingSector ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="text"
                      placeholder="Enter sector name..."
                      value={newSectorInput}
                      onChange={(e) => setNewSectorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSector()
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #00418f',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      className="btn-pj-primary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      onClick={handleAddSector}
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-pj-light"
                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '20px' }}
                    onClick={() => setIsAddingSector(true)}
                  >
                    + Add Sector
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Computational Toolchain & Scripting Matrix */}
          <section className="pj-section-card" aria-labelledby="sec-toolchain-title">
            <div className="pj-section-header">
              <div className="pj-section-title-wrap">
                <div className="pj-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <div>
                  <h2 className="pj-section-title" id="sec-toolchain-title">Computational Toolchain &amp; Scripting Matrix</h2>
                  <span className="pj-section-subline">PRODUCTION STACK &amp; API PROFICIENCY</span>
                </div>
              </div>

              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                {tools.length} TOOLS SPECIFIED
              </span>
            </div>

            {/* Tools List */}
            <div className="tools-stack-list">
              {tools.map((tool: ToolItem) => (
                <div className="tool-row-card" key={tool.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="tool-avatar-code">{tool.code}</div>
                    <div>
                      <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#1a1c1e' }}>
                        {tool.name}
                      </h3>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784', margin: '2px 0 0' }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#eeeef0', color: '#1a1c1e', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {tool.level}
                    </span>
                    <button
                      type="button"
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: '10.5px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: tool.isMandatory ? '#00418f' : '#eeeef0',
                        color: tool.isMandatory ? '#ffffff' : '#727784',
                        fontWeight: 700,
                      }}
                      onClick={() => handleToggleToolMandatory(tool.id)}
                    >
                      {tool.isMandatory ? 'MANDATORY' : 'VALUED'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Attach 3D WebGL Technical Assessment Sandbox */}
            <div className="sandbox-attach-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#00418f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#1a1c1e', display: 'block' }}>
                    Attach 3D WebGL Technical Assessment Sandbox
                  </strong>
                  <span style={{ fontSize: '12.5px', color: '#424753' }}>
                    Candidates rationalize a 3D doubly-curved diagrid surface into planar quad panels in browser.
                  </span>
                </div>
              </div>

              <label className="toggle-switch-label" aria-label="Toggle 3D WebGL Sandbox Challenge">
                <input
                  type="checkbox"
                  checked={attachSandbox}
                  onChange={(e) => setAttachSandbox(e.target.checked)}
                />
                <span className="toggle-switch-slider" />
              </label>
            </div>
          </section>

          {/* Section 4: Requisition Description & Technical Scope */}
          <section className="pj-section-card" aria-labelledby="sec-desc-title">
            <div className="pj-section-header">
              <div className="pj-section-title-wrap">
                <div className="pj-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <h2 className="pj-section-title" id="sec-desc-title">Requisition Description &amp; Technical Scope</h2>
                  <span className="pj-section-subline">AI-FORMATTED ARCHITECTURAL SPECIFICATION</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2px', background: '#f3f3f6', padding: '2px', borderRadius: '6px' }}>
                <button
                  type="button"
                  className={`segmented-pill-btn ${descViewMode === 'markdown' ? 'active' : ''}`}
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setDescViewMode('markdown')}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  className={`segmented-pill-btn ${descViewMode === 'bep' ? 'active' : ''}`}
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setDescViewMode('bep')}
                >
                  BEP Scope
                </button>
                <button
                  type="button"
                  className={`segmented-pill-btn ${descViewMode === 'preview' ? 'active' : ''}`}
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setDescViewMode('preview')}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Markdown Toolbar */}
            <div className="markdown-toolbar-bar">
              <button
                type="button"
                className="md-tool-btn"
                title="Bold"
                onClick={() => setDescription((p) => p + ' **bold text**')}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className="md-tool-btn"
                title="Italic"
                onClick={() => setDescription((p) => p + ' *italic text*')}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                className="md-tool-btn"
                title="Bullet List"
                onClick={() => setDescription((p) => p + '\n- Item')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
              <button
                type="button"
                className="md-tool-btn"
                title="Code"
                onClick={() => setDescription((p) => p + ' `code`')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </button>

              <div style={{ height: '14px', width: '1px', background: '#c2c6d5', margin: '0 4px' }} />

              <button
                type="button"
                className="btn-pj-light"
                style={{ padding: '3px 8px', fontSize: '11px', color: '#00418f', fontWeight: 600 }}
                onClick={handleEnhanceWithBep}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Enhance with BEP Template</span>
              </button>
            </div>

            <textarea
              className="pj-text-input"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ lineHeight: '20px', resize: 'vertical' }}
            />
          </section>

          {/* Section 5: Compensation & Benchmark Transparency */}
          <section className="pj-section-card" aria-labelledby="sec-comp-title">
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
                  <h2 className="pj-section-title" id="sec-comp-title">Compensation &amp; Benchmark Transparency</h2>
                  <span className="pj-section-subline">VERIFIED LEVEL COMPENSATION</span>
                </div>
              </div>

              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#d8e2ff', color: '#00418f', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                +15% HEALTH SCORE
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div className="pj-field-group">
                <label className="pj-field-label">Currency</label>
                <select
                  className="pj-select-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="GBP (£) - United Kingdom">GBP (£) - United Kingdom</option>
                  <option value="USD ($) - United States">USD ($) - United States</option>
                  <option value="EUR (€) - European Union">EUR (€) - European Union</option>
                </select>
              </div>

              <div className="pj-field-group">
                <label className="pj-field-label">Minimum Range</label>
                <input
                  type="text"
                  className="pj-text-input"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                />
              </div>

              <div className="pj-field-group">
                <label className="pj-field-label">Maximum Range</label>
                <input
                  type="text"
                  className="pj-text-input"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                />
              </div>
            </div>

            {/* Benchmark Visual Indicator */}
            <div className="benchmark-display-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  <strong style={{ fontSize: '13px', color: '#1a1c1e' }}>Castallio Benchmark: Top 5% London Market</strong>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>Role Mean: £132,000 / yr</span>
              </div>

              <div className="benchmark-progress-track">
                <div className="benchmark-progress-fill" style={{ width: '82%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784' }}>
                <span>£85k (Junior VDC)</span>
                <span>£110k (Mid-level)</span>
                <span>£132k (Avg Lead)</span>
                <span style={{ color: '#00418f', fontWeight: 700 }}>£155k (Offer Top)</span>
              </div>
            </div>

            {/* Hardware & Allowance Perks */}
            <div className="pj-field-group">
              <label className="pj-field-label">Hardware &amp; Professional Allowances Included</label>
              <div className="pj-chips-cloud">
                <span className="course-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                  </svg>
                  <span>RTX 4090 Dual-GPU Workstation Rig</span>
                </span>

                <span className="course-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  </svg>
                  <span>CanBIM / RIBA CPD Allowance (£3,500/yr)</span>
                </span>

                <span className="course-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  <span>Annual Computational Research &amp; Conference Grant</span>
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Live Intelligence (4 Cols) */}
        <aside className="pj-sidebar-col">
          {/* Card 1: Algorithmic Talent Pool Estimator */}
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
                <h3 className="pj-sidebar-title">Talent Pool Estimator</h3>
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
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cand.skills}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: '#d8e2ff', color: '#00418f', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, flexShrink: 0 }}>
                    {cand.fitScore}% Fit
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* Card 2: Requisition Health Score */}
          <article className="pj-sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="pj-sidebar-title">Requisition Health Score</h3>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>OPTIMAL PRECISION RATING</span>
              </div>

              {/* Donut Score Gauge */}
              <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '48px', height: '48px', transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eeeef0"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#00418f"
                    strokeWidth="3.5"
                    strokeDasharray={`${healthScore}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ position: 'absolute', fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: 700, color: '#1a1c1e' }}>
                  {healthScore}
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f3f6', padding: '6px 10px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Verified Salary Bracket</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700 }}>+15%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f3f6', padding: '6px 10px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Explicit ISO 19650 Protocols</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700 }}>+20%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f3f6', padding: '6px 10px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Computational Matrix Defined</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700 }}>+25%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f3f6', padding: '6px 10px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Live WebGL Challenge Attached</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#00418f', fontWeight: 700 }}>+20%</span>
              </div>
            </div>
          </article>

          {/* Card 3: Distribution & Fast-Track Syndication */}
          <article className="pj-sidebar-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#b3272d" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <h3 className="pj-sidebar-title">Syndication Channels</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="governance-check-label">
                <input
                  type="checkbox"
                  checked={syndicateRiba}
                  onChange={(e) => setSyndicateRiba(e.target.checked)}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e' }}>Syndicate to RIBA &amp; buildingSMART</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>Direct API push to international chapter boards</span>
                </div>
              </label>

              <label className="governance-check-label">
                <input
                  type="checkbox"
                  checked={vipHeadhunterPing}
                  onChange={(e) => setVipHeadhunterPing(e.target.checked)}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e' }}>VIP Headhunter Automated Ping</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>Discreet alerts to 12 verified passive specialists</span>
                </div>
              </label>

              <label className="governance-check-label">
                <input
                  type="checkbox"
                  checked={stealthMode}
                  onChange={(e) => setStealthMode(e.target.checked)}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1c1e' }}>Stealth Mode (Shield Studio Identity)</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784' }}>Showcase project typology without firm brand</span>
                </div>
              </label>
            </div>
          </article>
        </aside>
      </main>

      {/* 6. Sticky Bottom Deployment Bar */}
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
              Ready to Launch Requisition
            </strong>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
              Targeting 18 pre-qualified computational candidates
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-pj-light"
            onClick={handleSaveTemplate}
          >
            Save as Template
          </button>

          <button
            type="button"
            className="btn-pj-primary"
            onClick={handlePublishRequisition}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            </svg>
            <span>Publish to Talent Radar</span>
          </button>
        </div>
      </footer>

      {/* ── MODAL: Live Preview ── */}
      {isPreviewModalOpen && (
        <div className="pj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
          <div className="pj-modal-dialog">
            <div className="pj-modal-header">
              <div>
                <h2 id="preview-modal-title">{title || 'Untitled Requisition'}</h2>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f' }}>
                  {department} • {location} ({workplaceModel})
                </span>
              </div>
              <button
                type="button"
                className="pj-modal-close"
                onClick={() => setIsPreviewModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="pj-modal-body">
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="course-tag-pill" style={{ background: '#d8e2ff', color: '#00418f', fontWeight: 700 }}>
                  {minSalary} - {maxSalary}
                </span>
                <span className="course-tag-pill">{employmentFramework}</span>
                {bimLevels.map((b) => (
                  <span className="course-tag-pill" key={b}>{b}</span>
                ))}
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px', color: '#1a1c1e' }}>Job Description</h3>
                <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{description}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px', color: '#1a1c1e' }}>Mandatory Toolchain</h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {tools.map((t) => (
                    <span className="course-tag-pill" key={t.id}>
                      {t.name} ({t.level})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pj-modal-footer">
              <button
                type="button"
                className="btn-pj-light"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="btn-pj-primary"
                onClick={() => {
                  setIsPreviewModalOpen(false)
                  handlePublishRequisition()
                }}
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Import Past Requisition ── */}
      {isImportModalOpen && (
        <div className="pj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
          <div className="pj-modal-dialog">
            <div className="pj-modal-header">
              <h2 id="import-modal-title">Import Requisition from Studio Archive</h2>
              <button
                type="button"
                className="pj-modal-close"
                onClick={() => setIsImportModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="pj-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{ background: '#f3f3f6', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => {
                    setTitle('Senior VDC Infrastructure Coordinator')
                    setDepartment('Transit & Heavy Civil')
                    setMinSalary('£130,000')
                    setMaxSalary('£160,000')
                    setIsImportModalOpen(false)
                    showToast('Imported "Senior VDC Infrastructure Coordinator" template.')
                  }}
                >
                  <strong style={{ fontSize: '13.5px', color: '#1a1c1e', display: 'block' }}>
                    Senior VDC Infrastructure Coordinator (HS2 Phase One)
                  </strong>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                    Archived Oct 2024 • 14 Applicants • Hired
                  </span>
                </div>

                <div
                  style={{ background: '#f3f3f6', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => {
                    setTitle('Parametric Façade Scripting Specialist')
                    setDepartment('CODE Computation Unit')
                    setMinSalary('£120,000')
                    setMaxSalary('£145,000')
                    setIsImportModalOpen(false)
                    showToast('Imported "Parametric Façade Specialist" template.')
                  }}
                >
                  <strong style={{ fontSize: '13.5px', color: '#1a1c1e', display: 'block' }}>
                    Parametric Façade Scripting Specialist (Scalpel Tower)
                  </strong>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                    Archived Sep 2024 • 28 Applicants • Hired
                  </span>
                </div>
              </div>
            </div>

            <div className="pj-modal-footer">
              <button
                type="button"
                className="btn-pj-light"
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Publish Success ── */}
      {isPublishSuccessModalOpen && (
        <div className="pj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
          <div className="pj-modal-dialog" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#d8e2ff', color: '#00418f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '28px', height: '28px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 id="success-modal-title" style={{ fontFamily: 'Hanken Grotesk', fontSize: '20px', fontWeight: 700, margin: '0 0 6px', color: '#1a1c1e' }}>
              Requisition Successfully Published!
            </h2>
            <p style={{ fontSize: '13.5px', color: '#424753', margin: '0 0 20px', lineHeight: '20px' }}>
              <strong>{title}</strong> is now live across Castallio AEC Network, syndicated to RIBA/buildingSMART, and dispatched to 18 verified candidates.
            </p>

            <button
              type="button"
              className="btn-pj-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setIsPublishSuccessModalOpen(false)
                if (onSuccess) onSuccess()
              }}
            >
              View in My Job Posts
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostJob
