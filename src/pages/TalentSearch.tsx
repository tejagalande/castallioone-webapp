import { useState, type FC, type ChangeEvent, type FormEvent } from 'react'
import {
  useTalentSearch,
  type TalentSortOption,
  type TalentDisciplineFilter,
  type CandidateTalentItem,
} from '../hooks/useTalentSearch'
import { CustomSortDropdown, type SortOptionItem } from '../components/CustomSortDropdown'
import './TalentSearch.css'

export interface TalentSearchProps {
  onNavigateToFindJobs?: () => void
}

const TALENT_SORT_OPTIONS: SortOptionItem<TalentSortOption>[] = [
  {
    value: 'match',
    label: 'Highest Match Score',
    icon: 'auto_awesome',
    description: 'AI vector match & keyword relevance',
  },
  {
    value: 'experience',
    label: 'Most Experience',
    icon: 'work_history',
    description: 'Rank by cumulative career experience',
  },
  {
    value: 'name',
    label: 'Candidate Name (A-Z)',
    icon: 'sort_by_alpha',
    description: 'Alphabetical directory order',
  },
  {
    value: 'recent',
    label: 'Recently Registered',
    icon: 'schedule',
    description: 'Newest candidates onboarded to network',
  },
]

export const TalentSearch: FC<TalentSearchProps> = () => {
  const {
    loading,
    semanticSearching,
    isSemanticMode,
    setIsSemanticMode,
    companyName,
    filteredTalent,
    searchQuery,
    setSearchQuery,
    selectedDiscipline,
    setSelectedDiscipline,
    selectedWorkMode,
    setSelectedWorkMode,
    selectedExperienceRange,
    setSelectedExperienceRange,
    sortOption,
    setSortOption,
    savedCandidateIds,
    toggleBookmarkCandidate,
    selectedCandidate,
    setSelectedCandidate,
    candidateToUnlock,
    setCandidateToUnlock,
    unlockCandidate,
    sendCandidateMessage,
    quota,
    metrics,
    toastMessage,
    exportTalentCSV,
    loadTalentData,
    performSemanticSearch,
  } = useTalentSearch()

  // Modal states
  const [chatCandidate, setChatCandidate] = useState<CandidateTalentItem | null>(null)
  const [chatMessageText, setChatMessageText] = useState<string>('')
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false)

  // Resume PDF preview modal
  const [previewResumeUrl, setPreviewResumeUrl] = useState<string | null>(null)
  const [previewCandidateName, setPreviewCandidateName] = useState<string>('')

  const handleOpenCandidateProfile = (cand: CandidateTalentItem) => {
    try {
      sessionStorage.setItem(`talent_candidate_${cand.id}`, JSON.stringify(cand))
    } catch {
      // ignore
    }
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(6)

  const totalPages = Math.max(1, Math.ceil((filteredTalent?.length || 0) / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const paginatedTalent = (filteredTalent || []).slice(startIndex, startIndex + itemsPerPage)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleDisciplineSelect = (discipline: TalentDisciplineFilter) => {
    setSelectedDiscipline(discipline)
    setCurrentPage(1)
  }

  const handleWorkModeChange = (mode: string) => {
    setSelectedWorkMode(mode)
    setCurrentPage(1)
  }

  const handleExperienceChange = (range: string) => {
    setSelectedExperienceRange(range)
    setCurrentPage(1)
  }

  const handleSortSelect = (val: TalentSortOption) => {
    setSortOption(val)
    setCurrentPage(1)
  }

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isSemanticMode && searchQuery.trim()) {
      void performSemanticSearch(searchQuery)
    } else {
      void loadTalentData()
    }
  }

  const handleSendDirectMessage = async () => {
    if (!chatMessageText.trim() || !chatCandidate) return
    const userId = chatCandidate.userId || chatCandidate.id
    await sendCandidateMessage(userId, chatMessageText)
    setChatMessageText('')
    setChatCandidate(null)
  }

  const handleConfirmUnlock = async () => {
    if (!candidateToUnlock) return
    setIsUnlocking(true)
    const success = await unlockCandidate(candidateToUnlock)
    setIsUnlocking(false)
    if (success) {
      setCandidateToUnlock(null)
    }
  }

  return (
    <main className="talent-search-page" aria-label="AEC Talent and Semantic Search">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="ts-toast" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Telemetry Ribbon ── */}
      <section className="ts-telemetry-ribbon" aria-label="Database and Quota Telemetry">
        <div className="ts-telemetry-left">
          <span className="ts-telemetry-beacon">
            <span className="ts-pulse-dot" aria-hidden="true"></span>
            TALENT_WORKSPACE // POSTGRESQL AI REPO
          </span>
          <span className="ts-slash">/</span>
          <span>COMPANY: {(companyName || 'Enterprise Studio').toUpperCase()}</span>
          <span className="ts-slash">/</span>
          <span className="ts-tag-iso">PGVECTOR 1536 EMBEDDINGS ACTIVE</span>
          <span className="ts-slash">•</span>
          <span>
            CV UNLOCK QUOTA: <strong>{quota?.remainingCvs ?? 0} REMAINING</strong>
          </span>
        </div>

        <div className="ts-telemetry-right">
          <button
            type="button"
            className="telemetry-refresh-btn"
            onClick={loadTalentData}
            title="Refresh database records"
            aria-label="Refresh database records"
          >
            <span className={`material-symbols-outlined ${loading || semanticSearching ? 'spin-icon' : ''}`} aria-hidden="true">
              sync
            </span>
            <span>{loading || semanticSearching ? 'SYNCING...' : 'SYNC TALENT'}</span>
          </button>
        </div>
      </section>

      {/* ── 2. Header Area ── */}
      <section className="ts-header-area">
        <div>
          <div className="ts-overline-badge">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              psychology
            </span>
            <span>AI VECTOR &amp; SEMANTIC DISCOVERY ENGINE</span>
          </div>
          <h1 className="ts-header-title">AEC Talent &amp; Candidate Search</h1>
          <p className="ts-header-desc">
            Discover pre-verified civil engineers, structural designers, and BIM coordinators. Search using natural
            language queries with Gemini AI vector embeddings or browse by technical disciplines.
          </p>
        </div>

        <div className="ts-header-ctas">
          <button
            type="button"
            className="btn-ts-secondary"
            onClick={exportTalentCSV}
            title="Download CSV of Filtered Talent"
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              download
            </span>
            <span>Export Talent Pool (CSV)</span>
          </button>
          <div className="semantic-toggle-pill">
            <span className="toggle-label">AI Semantic Search:</span>
            <button
              type="button"
              className={`toggle-switch-btn ${isSemanticMode ? 'active' : ''}`}
              onClick={() => setIsSemanticMode(!isSemanticMode)}
              aria-pressed={isSemanticMode}
              title="Toggle AI Semantic Vector Search vs Standard Search"
            >
              <span className="material-symbols-outlined text-xs" aria-hidden="true">
                {isSemanticMode ? 'bolt' : 'filter_alt'}
              </span>
              <span>{isSemanticMode ? 'ON (Vector Embeddings)' : 'OFF (Keyword)'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. KPI Metrics Cards (Real Database Telemetry) ── */}
      <section className="ts-metrics-grid" aria-label="Talent Network Metrics">
        {/* Metric 1 */}
        <article className="ts-metric-card">
          <div className="ts-metric-bg-orb" aria-hidden="true"></div>
          <div className="ts-metric-top">
            <span className="ts-metric-label">Total Verified Talent</span>
            <span className="material-symbols-outlined ts-metric-icon" aria-hidden="true">
              group
            </span>
          </div>
          <div className="ts-metric-val-row">
            <span className="ts-metric-num">{metrics?.totalTalentCount ?? 0}</span>
            <span className="ts-metric-pill-verified">Indexed</span>
          </div>
          <p className="ts-metric-desc">Civil, Structural &amp; Architecture Specialists</p>
        </article>

        {/* Metric 2 */}
        <article className="ts-metric-card">
          <div className="ts-metric-bg-orb" aria-hidden="true"></div>
          <div className="ts-metric-top">
            <span className="ts-metric-label">AI Vector Indexed</span>
            <span className="material-symbols-outlined ts-metric-icon" aria-hidden="true">
              model_training
            </span>
          </div>
          <div className="ts-metric-val-row">
            <span className="ts-metric-num">{metrics?.embeddedTalentCount ?? 0}</span>
            <span className="ts-metric-pill-verified" style={{ background: 'rgba(0, 88, 188, 0.1)', color: '#00418f' }}>
              1536 Dim
            </span>
          </div>
          <p className="ts-metric-desc">Ready for Semantic Cosine Search</p>
        </article>

        {/* Metric 3 */}
        <article className="ts-metric-card">
          <div className="ts-metric-bg-orb" aria-hidden="true"></div>
          <div className="ts-metric-top">
            <span className="ts-metric-label">CVs Unlocked This Month</span>
            <span className="material-symbols-outlined ts-metric-icon" aria-hidden="true">
              lock_open
            </span>
          </div>
          <div className="ts-metric-val-row">
            <span className="ts-metric-num">{quota?.cvsUnlocked ?? 0}</span>
            <span className="ts-metric-label" style={{ textTransform: 'none' }}>
              Used / {quota?.cvUnlockLimit ?? 50} Total
            </span>
          </div>
          <p className="ts-metric-desc">{quota?.remainingCvs ?? 0} Unlocks remaining in active plan</p>
        </article>

        {/* Metric 4 */}
        <article className="ts-metric-card">
          <div className="ts-metric-bg-orb" aria-hidden="true"></div>
          <div className="ts-metric-top">
            <span className="ts-metric-label">Saved Favorites</span>
            <span className="material-symbols-outlined ts-metric-icon" style={{ color: '#d97706' }} aria-hidden="true">
              bookmark
            </span>
          </div>
          <div className="ts-metric-val-row">
            <span className="ts-metric-num">{metrics?.savedCount ?? 0}</span>
            <span className="ts-metric-pill-verified">Bookmarked</span>
          </div>
          <p className="ts-metric-desc">Candidates shortlisted for direct outreach</p>
        </article>
      </section>

      {/* ── 4. Search Bar & Segmented Facet Filters ── */}
      <section className="ts-filter-card" aria-label="Search and Filter Controls">
        <form onSubmit={handleSearchSubmit} className="ts-search-input-row">
          <div className="ts-search-wrapper">
            <span className="material-symbols-outlined ts-search-icon-left" aria-hidden="true">
              {isSemanticMode ? 'psychology' : 'search'}
            </span>
            <input
              id="talentSearchInput"
              className="ts-search-input"
              type="text"
              placeholder={
                isSemanticMode
                  ? 'Ask AI: e.g. "Structural engineer with 2+ years experience in Revit and STAAD.Pro"...'
                  : 'Search by candidate name, institution, location, or software skill...'
              }
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search candidates"
            />
            <button
              type="submit"
              className="btn-ts-search-submit"
              title="Run Search"
              disabled={semanticSearching}
            >
              {semanticSearching ? 'Searching...' : isSemanticMode ? 'AI Match' : 'Search'}
            </button>
          </div>

          <CustomSortDropdown<TalentSortOption>
            id="talent-sort-dropdown"
            value={sortOption}
            options={TALENT_SORT_OPTIONS}
            onChange={handleSortSelect}
            labelPrefix="Sort:"
            ariaLabel="Sort talent by criteria"
            align="right"
          />
        </form>

        {/* Discipline Tabs (Directly mapped to PostgreSQL values) */}
        <div className="ts-category-tabs-row" role="tablist" aria-label="Filter by Discipline">
          <button
            type="button"
            role="tab"
            aria-selected={selectedDiscipline === 'all'}
            className={`ts-category-tab-btn ${selectedDiscipline === 'all' ? 'active' : ''}`}
            onClick={() => handleDisciplineSelect('all')}
          >
            All Disciplines ({metrics?.totalTalentCount ?? 0})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedDiscipline === 'Civil Engineering'}
            className={`ts-category-tab-btn ${selectedDiscipline === 'Civil Engineering' ? 'active' : ''}`}
            onClick={() => handleDisciplineSelect('Civil Engineering')}
          >
            Civil Engineering
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedDiscipline === 'Structural Engineering'}
            className={`ts-category-tab-btn ${selectedDiscipline === 'Structural Engineering' ? 'active' : ''}`}
            onClick={() => handleDisciplineSelect('Structural Engineering')}
          >
            Structural Engineering
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedDiscipline === 'Architecture'}
            className={`ts-category-tab-btn ${selectedDiscipline === 'Architecture' ? 'active' : ''}`}
            onClick={() => handleDisciplineSelect('Architecture')}
          >
            Architecture
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedDiscipline === 'unlocked'}
            className={`ts-category-tab-btn ${selectedDiscipline === 'unlocked' ? 'active' : ''}`}
            onClick={() => handleDisciplineSelect('unlocked')}
          >
            Unlocked CVs ({metrics?.unlockedCount ?? 0})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedDiscipline === 'saved'}
            className={`ts-category-tab-btn ${selectedDiscipline === 'saved' ? 'active' : ''}`}
            onClick={() => handleDisciplineSelect('saved')}
          >
            Bookmarked ({metrics?.savedCount ?? 0})
          </button>
        </div>

        {/* Secondary Facet Dropdowns */}
        <div className="ts-secondary-facets-row">
          <div className="facet-select-group">
            <label htmlFor="work-mode-facet" className="facet-label">
              Work Mode:
            </label>
            <select
              id="work-mode-facet"
              className="ts-facet-select"
              value={selectedWorkMode}
              onChange={(e) => handleWorkModeChange(e.target.value)}
            >
              <option value="all">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Flexible">Flexible</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div className="facet-select-group">
            <label htmlFor="exp-range-facet" className="facet-label">
              Experience:
            </label>
            <select
              id="exp-range-facet"
              className="ts-facet-select"
              value={selectedExperienceRange}
              onChange={(e) => handleExperienceChange(e.target.value)}
            >
              <option value="all">Any Experience</option>
              <option value="fresher">Fresher (&lt; 1.5 yrs)</option>
              <option value="mid">Mid-level (1.5 - 4.5 yrs)</option>
              <option value="senior">Senior (4.5+ yrs)</option>
            </select>
          </div>

          {searchQuery && (
            <button
              type="button"
              className="ts-facet-chip active"
              onClick={() => {
                setSearchQuery('')
                setCurrentPage(1)
                void loadTalentData()
              }}
            >
              <span>Clear Filter: &ldquo;{searchQuery}&rdquo;</span>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                close
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ── 5. Main Workspace Layout ── */}
      <section className="ts-main-grid">
        {/* Left Column: Candidate Cards */}
        <div className="ts-peers-column">
          {loading || semanticSearching ? (
            <div className="ts-shimmer-container" aria-busy="true" aria-label="Loading candidates">
              <div className="ts-shimmer-telemetry-banner">
                <span className="material-symbols-outlined spin-icon" aria-hidden="true">
                  sync
                </span>
                <span>
                  {semanticSearching
                    ? 'AI Vector Engine: Generating Gemini 1536-dim Embeddings & Calculating Cosine Similarity...'
                    : 'Querying Remote PostgreSQL Repository & Evaluating Pre-Verified Credentials...'}
                </span>
              </div>
              {[1, 2, 3].map((skeletonId) => (
                <article key={skeletonId} className="ts-peer-card ts-skeleton-card">
                  <div className="ts-card-top-row">
                    <div className="ts-avatar-wrap">
                      <div className="ts-shimmer ts-skeleton-avatar"></div>
                    </div>
                    <div className="ts-card-meta-main">
                      <div className="ts-badge-line">
                        <div className="ts-shimmer ts-skeleton-pill" style={{ width: '90px', height: '22px' }}></div>
                        <div className="ts-shimmer ts-skeleton-pill" style={{ width: '120px', height: '22px' }}></div>
                        <div className="ts-shimmer ts-skeleton-pill" style={{ width: '70px', height: '22px' }}></div>
                      </div>
                      <div className="ts-shimmer ts-skeleton-bar" style={{ width: '48%', height: '20px', marginTop: '6px' }}></div>
                      <div className="ts-shimmer ts-skeleton-bar" style={{ width: '64%', height: '14px', marginTop: '6px' }}></div>
                      <div className="ts-shimmer ts-skeleton-bar" style={{ width: '38%', height: '13px', marginTop: '6px' }}></div>
                    </div>
                    <div className="ts-shimmer ts-skeleton-exp-box"></div>
                  </div>
                  <div className="ts-shimmer ts-skeleton-bar" style={{ width: '85%', height: '14px', margin: '4px 0' }}></div>
                  <div className="ts-card-skills-row">
                    <div className="ts-shimmer ts-skeleton-pill" style={{ width: '80px', height: '24px' }}></div>
                    <div className="ts-shimmer ts-skeleton-pill" style={{ width: '100px', height: '24px' }}></div>
                    <div className="ts-shimmer ts-skeleton-pill" style={{ width: '90px', height: '24px' }}></div>
                    <div className="ts-shimmer ts-skeleton-pill" style={{ width: '115px', height: '24px' }}></div>
                  </div>
                  <div className="ts-shimmer ts-skeleton-banner"></div>
                  <div className="ts-card-actions-row">
                    <div className="ts-shimmer ts-skeleton-pill" style={{ width: '150px', height: '34px' }}></div>
                    <div className="ts-shimmer ts-skeleton-pill" style={{ width: '120px', height: '34px' }}></div>
                    <div className="ts-shimmer ts-skeleton-pill" style={{ width: '130px', height: '34px' }}></div>
                  </div>
                </article>
              ))}
            </div>
          ) : filteredTalent.length === 0 ? (
            <div className="ts-empty-state">
              <span className="material-symbols-outlined" aria-hidden="true">
                search_off
              </span>
              <h3>No matching candidates found</h3>
              <p>Try clearing or expanding your search query or discipline selection.</p>
              <button
                type="button"
                className="btn-ts-secondary"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDiscipline('all')
                  setSelectedWorkMode('all')
                  setSelectedExperienceRange('all')
                  void loadTalentData()
                }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              {paginatedTalent.map((cand) => (
                <article key={cand.id} className="ts-peer-card">
                <div className="ts-card-top-row">
                  <div className="ts-avatar-wrap">
                    {cand.profileImageUrl ? (
                      <img
                        src={cand.profileImageUrl}
                        alt={cand.name}
                        className="ts-avatar-img"
                      />
                    ) : (
                      <div className="ts-avatar-initials">{cand.avatarInitials}</div>
                    )}
                    <button
                      type="button"
                      className={`btn-bookmark-candidate ${savedCandidateIds.has(cand.id) ? 'bookmarked' : ''}`}
                      onClick={() => toggleBookmarkCandidate(cand.id)}
                      title={savedCandidateIds.has(cand.id) ? 'Remove bookmark' : 'Bookmark candidate'}
                      aria-label="Bookmark candidate"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        {savedCandidateIds.has(cand.id) ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                  </div>

                  <div className="ts-card-meta-main">
                    <div className="ts-badge-line">
                      <span className="badge-match-score">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                          {cand.hasEmbedding ? 'bolt' : 'verified'}
                        </span>
                        {cand.matchScore}% MATCH FIT
                      </span>
                      <span className="badge-discipline">{cand.discipline}</span>
                      <span className="badge-workmode">{cand.workMode}</span>
                      {cand.isUnlocked ? (
                        <span className="badge-unlocked-status">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }} aria-hidden="true">
                            lock_open
                          </span>
                          CV UNLOCKED
                        </span>
                      ) : (
                        <span className="badge-locked-status">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }} aria-hidden="true">
                            lock
                          </span>
                          CONTACT LOCKED
                        </span>
                      )}
                    </div>

                    <h2
                      className="ts-peer-name"
                      onClick={() => handleOpenCandidateProfile(cand)}
                      title="Open Candidate Profile in New Tab"
                    >
                      {cand.name}
                    </h2>

                    <p className="ts-peer-title">
                      {cand.discipline} • {cand.institution} ({cand.graduationYear})
                    </p>

                    <p className="ts-peer-location">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                        location_on
                      </span>
                      <span>{cand.location}</span>
                      <span className="bullet">•</span>
                      <span>Expected: {cand.expectedCtc}</span>
                      <span className="bullet">•</span>
                      <span>Notice: {cand.noticePeriod}</span>
                    </p>
                  </div>

                  <div className="ts-card-exp-box">
                    <span className="exp-years-val">{cand.experienceYears} Yrs</span>
                    <span className="exp-years-sub">AEC Experience</span>
                  </div>
                </div>

                {cand.bio && <p className="ts-card-bio-snippet">{cand.bio}</p>}

                {/* Skills Chips */}
                <div className="ts-card-skills-row">
                  {(cand.skills || []).map((skill) => (
                    <span key={skill} className="ts-skill-tag">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        verified
                      </span>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Contact Preview / Masked Status */}
                <div className="ts-contact-preview-banner">
                  {cand.isUnlocked ? (
                    <div className="contact-unlocked-row">
                      <div className="contact-detail-item">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          mail
                        </span>
                        <span>{cand.email}</span>
                      </div>
                      {cand.phone && (
                        <div className="contact-detail-item">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            call
                          </span>
                          <span>{cand.phone}</span>
                        </div>
                      )}
                      {cand.resumeFileUrl && (
                        <button
                          type="button"
                          className="btn-view-cv-inline"
                          onClick={() => {
                            setPreviewResumeUrl(cand.resumeFileUrl || null)
                            setPreviewCandidateName(cand.name)
                          }}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">
                            description
                          </span>
                          <span>View Official CV PDF</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="contact-locked-row">
                      <div className="contact-masked-text">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          lock
                        </span>
                        <span>
                          Direct phone and email are locked.
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {cand.resumeFileUrl && (
                          <button
                            type="button"
                            className="btn-view-cv-inline"
                            onClick={() => {
                              setPreviewResumeUrl(cand.resumeFileUrl || null)
                              setPreviewCandidateName(cand.name)
                            }}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">
                              description
                            </span>
                            <span>Preview CV</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-unlock-cv-pill"
                          onClick={() => setCandidateToUnlock(cand)}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">
                            key
                          </span>
                          <span>Unlock Contact (1 Quota)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="ts-card-actions-row">
                  <a
                    href={`/talent-profile/${cand.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-card-primary"
                    onClick={() => handleOpenCandidateProfile(cand)}
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      badge
                    </span>
                    <span>View Profile &amp; Resume</span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '15px', marginLeft: '2px' }}
                      aria-hidden="true"
                    >
                      open_in_new
                    </span>
                  </a>

                  {!cand.isUnlocked ? (
                    <button
                      type="button"
                      className="btn-card-secondary"
                      onClick={() => setCandidateToUnlock(cand)}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        lock_open
                      </span>
                      <span>Unlock (1 Quota)</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="btn-card-secondary"
                    onClick={() => setChatCandidate(cand)}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      chat
                    </span>
                    <span>Message</span>
                  </button>
                </div>
              </article>
            ))}

            {/* Pagination Controls */}
            {filteredTalent.length > 0 && (
              <nav className="ts-pagination-nav" aria-label="Talent pagination navigation">
                <div className="ts-pagination-info">
                  Showing <strong>{startIndex + 1}</strong> –{' '}
                  <strong>{Math.min(startIndex + itemsPerPage, filteredTalent.length)}</strong> of{' '}
                  <strong>{filteredTalent.length}</strong> verified talent
                </div>

                <div className="ts-pagination-controls">
                  <button
                    type="button"
                    className="ts-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      chevron_left
                    </span>
                    <span>Previous</span>
                  </button>

                  <div className="ts-page-numbers-group">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`ts-page-number-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={safeCurrentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="ts-page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      chevron_right
                    </span>
                  </button>

                  <div className="ts-per-page-box">
                    <label htmlFor="perPageSelect" className="ts-per-page-label">
                      Per Page:
                    </label>
                    <select
                      id="perPageSelect"
                      className="ts-per-page-select"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                    >
                      <option value={4}>4</option>
                      <option value={6}>6</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>
              </nav>
            )}
          </>
        )}
        </div>

        {/* Right Column: Sidebar Quota & Search Intelligence */}
        <aside className="ts-sidebar-column">
          {/* Subscription & CV Unlock Quota Box */}
          <div className="ts-sidebar-card">
            <div className="sidebar-card-header">
              <div className="sidebar-card-title-group">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  credit_score
                </span>
                <h3 className="sidebar-card-title">Talent Sourcing Quota</h3>
              </div>
              <span className="sidebar-badge-count">{quota.remainingCvs} LEFT</span>
            </div>

            <div className="quota-progress-box">
              <div className="quota-numbers-line">
                <span>{quota.cvsUnlocked} Unlocked This Month</span>
                <strong>{quota.cvUnlockLimit} Plan Limit</strong>
              </div>
              <div className="quota-bar-track">
                <div
                  className="quota-bar-fill"
                  style={{
                    width: `${quota.cvUnlockLimit ? (quota.cvsUnlocked / quota.cvUnlockLimit) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <p className="sidebar-quota-desc">
              Unlocking a profile grants permanent access to verified email, direct contact phone, and official resume PDF.
            </p>
          </div>

          {/* AI Semantic Engine Card */}
          <div className="ts-sidebar-card">
            <div className="sidebar-card-header">
              <div className="sidebar-card-title-group">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  neurology
                </span>
                <h3 className="sidebar-card-title">Vector Search Engine</h3>
              </div>
              <span className="sidebar-badge-mono">GEMINI-001</span>
            </div>

            <p className="sidebar-info-desc">
              Our semantic matching converts natural language queries into <strong>1536-dimensional embeddings</strong>,
              matching candidates based on semantic skill graphs, project contributions, and discipline depth.
            </p>

            <div className="quick-search-samples">
              <span className="samples-title">Try Example Prompts:</span>
              <button
                type="button"
                className="sample-prompt-chip"
                onClick={() => {
                  setSearchQuery('Revit BIM structural designer with reinforced concrete detailing')
                  setIsSemanticMode(true)
                  void performSemanticSearch('Revit BIM structural designer with reinforced concrete detailing')
                }}
              >
                &ldquo;Revit BIM structural designer...&rdquo;
              </button>
              <button
                type="button"
                className="sample-prompt-chip"
                onClick={() => {
                  setSearchQuery('Civil engineer with AutoCAD and parametric modeling experience')
                  setIsSemanticMode(true)
                  void performSemanticSearch('Civil engineer with AutoCAD and parametric modeling experience')
                }}
              >
                &ldquo;Civil engineer with AutoCAD...&rdquo;
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* ── MODAL 1: Candidate Quick Dossier ── */}
      {selectedCandidate && (
        <div
          className="ts-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedCandidate(null)}
        >
          <div className="ts-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <div className="modal-header-left">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  folder_shared
                </span>
                <div>
                  <h3 className="modal-header-title">Candidate Talent Dossier</h3>
                  <span className="modal-header-sub">
                    {selectedCandidate.discipline} • {selectedCandidate.location}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedCandidate(null)}
                aria-label="Close Dossier"
              >
                ✕
              </button>
            </div>

            <div className="ts-modal-body">
              <div className="dossier-profile-card">
                <div className="dossier-avatar-wrap">
                  {selectedCandidate.profileImageUrl ? (
                    <img
                      src={selectedCandidate.profileImageUrl}
                      alt={selectedCandidate.name}
                      className="dossier-avatar-img"
                    />
                  ) : (
                    <div className="dossier-avatar">{selectedCandidate.avatarInitials}</div>
                  )}
                </div>
                <div>
                  <h4 className="dossier-name">{selectedCandidate.name}</h4>
                  <p className="dossier-role">
                    {selectedCandidate.discipline} • {selectedCandidate.institution} ({selectedCandidate.graduationYear})
                  </p>
                  <div className="dossier-contacts-row">
                    {selectedCandidate.isUnlocked ? (
                      <>
                        <span className="contact-unlocked-badge">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            mail
                          </span>
                          {selectedCandidate.email}
                        </span>
                        {selectedCandidate.phone && (
                          <span className="contact-unlocked-badge">
                            <span className="material-symbols-outlined" aria-hidden="true">
                              call
                            </span>
                            {selectedCandidate.phone}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="contact-locked-badge">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          lock
                        </span>
                        Contact details locked. Unlock profile to access.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="dossier-info-grid">
                <div className="dossier-info-cell">
                  <span className="cell-label">Match Fit Score</span>
                  <span className="cell-value" style={{ color: '#00418f' }}>
                    {selectedCandidate.matchScore}% Precision
                  </span>
                </div>
                <div className="dossier-info-cell">
                  <span className="cell-label">Expected CTC</span>
                  <span className="cell-value">{selectedCandidate.expectedCtc}</span>
                </div>
                <div className="dossier-info-cell">
                  <span className="cell-label">Work Mode</span>
                  <span className="cell-value">{selectedCandidate.workMode}</span>
                </div>
                <div className="dossier-info-cell">
                  <span className="cell-label">Notice Period</span>
                  <span className="cell-value">{selectedCandidate.noticePeriod}</span>
                </div>
              </div>

              {selectedCandidate.bio && (
                <div>
                  <h5 className="dossier-section-title">Professional Bio</h5>
                  <p className="dossier-bio">{selectedCandidate.bio}</p>
                </div>
              )}

              {/* Skills */}
              {(selectedCandidate.skills || []).length > 0 && (
                <div>
                  <h5 className="dossier-section-title">Verified Skills</h5>
                  <div className="ts-card-skills-row" style={{ paddingLeft: 0 }}>
                    {(selectedCandidate.skills || []).map((skill) => (
                      <span key={skill} className="ts-skill-tag">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          verified
                        </span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {(selectedCandidate.experiences || []).length > 0 && (
                <div>
                  <h5 className="dossier-section-title">Experience Timeline</h5>
                  <div className="dossier-exp-list">
                    {(selectedCandidate.experiences || []).map((exp) => (
                      <div key={exp.id} className="dossier-exp-item">
                        <strong>{exp.roleTitle}</strong> — <span>{exp.organizationName}</span>
                        {exp.contributions && <p className="dossier-exp-desc">{exp.contributions}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio & Documents */}
              <div>
                <h5 className="dossier-section-title">Verified Documents &amp; External Links</h5>
                <div className="dossier-docs-row">
                  {selectedCandidate.resumeFileUrl && (
                    <button
                      type="button"
                      className="btn-card-primary"
                      onClick={() => {
                        setPreviewResumeUrl(selectedCandidate.resumeFileUrl || null)
                        setPreviewCandidateName(selectedCandidate.name)
                      }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        description
                      </span>
                      <span>Preview Official Resume PDF</span>
                    </button>
                  )}
                  {selectedCandidate.portfolioUrl && (
                    <a
                      href={selectedCandidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-secondary"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        open_in_new
                      </span>
                      <span>External Portfolio</span>
                    </a>
                  )}
                  {selectedCandidate.linkedinUrl && (
                    <a
                      href={selectedCandidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-secondary"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        link
                      </span>
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="ts-modal-footer">
              <a
                href={`/talent-profile/${selectedCandidate.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-card-secondary"
                onClick={() => {
                  try {
                    sessionStorage.setItem(`talent_candidate_${selectedCandidate.id}`, JSON.stringify(selectedCandidate))
                  } catch {
                    // ignore
                  }
                }}
                style={{ textDecoration: 'none' }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  open_in_new
                </span>
                <span>Open in New Tab</span>
              </a>
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </button>
              {!selectedCandidate.isUnlocked ? (
                <button
                  type="button"
                  className="btn-card-primary"
                  onClick={() => {
                    setCandidateToUnlock(selectedCandidate)
                    setSelectedCandidate(null)
                  }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    key
                  </span>
                  <span>Unlock Profile &amp; CV (1 Quota)</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-card-primary"
                  onClick={() => {
                    setChatCandidate(selectedCandidate)
                    setSelectedCandidate(null)
                  }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chat
                  </span>
                  <span>Direct Message</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Unlock Candidate Confirmation ── */}
      {candidateToUnlock && (
        <div
          className="ts-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setCandidateToUnlock(null)}
        >
          <div className="ts-modal-window" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <div className="modal-header-left">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  key
                </span>
                <div>
                  <h3 className="modal-header-title">Unlock Candidate Profile</h3>
                  <span className="modal-header-sub">Deduct 1 CV unlock credit</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setCandidateToUnlock(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="ts-modal-body">
              <div className="unlock-confirm-card">
                <strong>{candidateToUnlock.name}</strong>
                <p>{candidateToUnlock.discipline} • {candidateToUnlock.institution}</p>
                <div className="unlock-benefits-list">
                  <div className="benefit-item">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      check
                    </span>
                    <span>Permanent access to direct email and verified phone number</span>
                  </div>
                  <div className="benefit-item">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      check
                    </span>
                    <span>Immediate download and in-app viewing of official Resume PDF</span>
                  </div>
                  <div className="benefit-item">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      check
                    </span>
                    <span>Remaining quota after unlock: {Math.max(0, quota.remainingCvs - 1)} CVs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ts-modal-footer">
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setCandidateToUnlock(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-card-primary"
                onClick={handleConfirmUnlock}
                disabled={isUnlocking}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  lock_open
                </span>
                <span>{isUnlocking ? 'Unlocking...' : 'Confirm & Unlock Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Direct Messaging Drawer ── */}
      {chatCandidate && (
        <div
          className="ts-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setChatCandidate(null)}
        >
          <div className="ts-modal-window" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <div className="modal-header-left">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  forum
                </span>
                <div>
                  <h3 className="modal-header-title">Message: {chatCandidate.name}</h3>
                  <span className="modal-header-sub">{chatCandidate.discipline}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setChatCandidate(null)}
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>

            <div className="ts-modal-body">
              <textarea
                className="ts-chat-textarea"
                placeholder={`Type message or job inquiry to ${chatCandidate.name}...`}
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
              />

              <div>
                <span className="cell-label" style={{ marginBottom: '6px' }}>
                  Quick Hiring Templates
                </span>
                <div className="quick-prompts-row">
                  <button
                    type="button"
                    className="quick-prompt-chip"
                    onClick={() =>
                      setChatMessageText(
                        `Hi ${chatCandidate.name}, we reviewed your profile on Castallio One and have an opening matching your ${chatCandidate.discipline} background.`
                      )
                    }
                  >
                    Job Opportunity Intro
                  </button>
                  <button
                    type="button"
                    className="quick-prompt-chip"
                    onClick={() =>
                      setChatMessageText(
                        `Hello ${chatCandidate.name}, are you open for an introductory technical discussion regarding our current projects?`
                      )
                    }
                  >
                    Intro Call Request
                  </button>
                </div>
              </div>
            </div>

            <div className="ts-modal-footer">
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setChatCandidate(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-card-primary"
                onClick={handleSendDirectMessage}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  send
                </span>
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Resume PDF Preview Modal ── */}
      {previewResumeUrl && (
        <div
          className="ts-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewResumeUrl(null)}
        >
          <div className="ts-modal-window resume-preview-window" onClick={(e) => e.stopPropagation()}>
            <div className="ts-modal-header">
              <div className="modal-header-left">
                <span className="material-symbols-outlined text-primary" style={{ color: '#00418f' }} aria-hidden="true">
                  picture_as_pdf
                </span>
                <div>
                  <h3 className="modal-header-title">{previewCandidateName} &mdash; Official Resume</h3>
                  <span className="modal-header-sub">PDF Document Viewer</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={previewResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-card-secondary"
                  title="Open PDF in new tab"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    open_in_new
                  </span>
                  <span>New Tab</span>
                </a>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setPreviewResumeUrl(null)}
                  aria-label="Close Preview"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="ts-modal-body resume-iframe-body">
              <iframe
                src={previewResumeUrl}
                title={`${previewCandidateName} Resume`}
                className="resume-pdf-iframe"
              />
            </div>

            <div className="ts-modal-footer">
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setPreviewResumeUrl(null)}
              >
                Close Viewer
              </button>
              <a
                href={previewResumeUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn-card-primary"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  download
                </span>
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default TalentSearch
