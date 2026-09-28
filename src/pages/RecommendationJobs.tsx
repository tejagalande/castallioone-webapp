import { useState, useMemo, type FC } from 'react'
import type { RecommendedJob, TalentProfileInfo } from './useTalentDashboard'
import './RecommendationJobs.css'

export interface RecommendationJobsProps {
  jobs: RecommendedJob[]
  loading: boolean
  applyingJobId: string | null
  onApply: (job: RecommendedJob) => Promise<void>
  onSave: (job: RecommendedJob) => void
  savedJobIds: Set<string>
  appliedJobIds: Set<string>
  profile: TalentProfileInfo
  onNavigateToFindJobs?: () => void
}

type WorkModeFilter = 'all' | 'Remote' | 'Hybrid' | 'On-site'
type FitFilter = 'all' | '90' | '80'
type SortOption = 'fit' | 'recent' | 'title'

export const RecommendationJobs: FC<RecommendationJobsProps> = ({
  jobs,
  loading,
  applyingJobId,
  onApply,
  onSave,
  profile,
  onNavigateToFindJobs,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [workModeFilter, setWorkModeFilter] = useState<WorkModeFilter>('all')
  const [fitFilter, setFitFilter] = useState<FitFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('fit')

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'high'
    if (score >= 80) return 'medium'
    return 'low'
  }

  const getCompanyInitials = (name: string): string => {
    if (!name) return 'AEC'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.skills.some((sk) => sk.toLowerCase().includes(q)) ||
          (j.description && j.description.toLowerCase().includes(q))
      )
    }

    // 2. Work Mode Filter
    if (workModeFilter !== 'all') {
      result = result.filter((j) => (j.workType || '').toLowerCase().includes(workModeFilter.toLowerCase()))
    }

    // 3. Fit Score Filter
    if (fitFilter === '90') {
      result = result.filter((j) => j.fitScore >= 90)
    } else if (fitFilter === '80') {
      result = result.filter((j) => j.fitScore >= 80)
    }

    // 4. Sorting
    if (sortBy === 'fit') {
      result.sort((a, b) => b.fitScore - a.fitScore)
    } else if (sortBy === 'recent') {
      result.sort((a, b) => {
        const timeA = a.postedDate ? new Date(a.postedDate).getTime() : 0
        const timeB = b.postedDate ? new Date(b.postedDate).getTime() : 0
        return timeB - timeA
      })
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [jobs, searchQuery, workModeFilter, fitFilter, sortBy])

  const maxFitScore = useMemo(() => {
    if (jobs.length === 0) return 96
    return Math.max(...jobs.map((j) => j.fitScore))
  }, [jobs])

  return (
    <div className="rec-page">
      {/* Page Header */}
      <div className="rec-header">
        <div className="rec-header-content">
          <div className="rec-header-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            AI Recommendation Engine
          </div>
          <h1 className="rec-page-title">Recommendation Jobs</h1>
          <p className="rec-page-subtitle">
            Personalized AEC opportunities calibrated to your technical blueprint, verified skills in{' '}
            <strong>{profile.discipline}</strong>, and preferred work modes.
          </p>
        </div>

        <div className="rec-summary-stats">
          <div className="rec-stat-chip">
            <span className="rec-stat-chip-label">Total Matches</span>
            <span className="rec-stat-chip-val">{jobs.length}</span>
          </div>
          <div className="rec-stat-chip">
            <span className="rec-stat-chip-label">Highest Fit</span>
            <span className="rec-stat-chip-val">{maxFitScore}%</span>
          </div>
          <div className="rec-stat-chip">
            <span className="rec-stat-chip-label">Discipline</span>
            <span className="rec-stat-chip-val" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
              {profile.discipline || 'AEC'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <section className="rec-controls-card" aria-label="Recommendation Filters">
        <div className="rec-search-row">
          <div className="rec-search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rec-search-icon" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="rec-search-input"
              placeholder="Search recommended jobs by title, company, skills, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search recommended jobs"
            />
          </div>
        </div>

        <div className="rec-filter-tabs-row">
          <div className="rec-tabs-group" role="tablist" aria-label="Work Mode Filters">
            <button
              type="button"
              className={`rec-filter-tab ${workModeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setWorkModeFilter('all')}
            >
              All Modes
            </button>
            <button
              type="button"
              className={`rec-filter-tab ${workModeFilter === 'Hybrid' ? 'active' : ''}`}
              onClick={() => setWorkModeFilter('Hybrid')}
            >
              Hybrid
            </button>
            <button
              type="button"
              className={`rec-filter-tab ${workModeFilter === 'Remote' ? 'active' : ''}`}
              onClick={() => setWorkModeFilter('Remote')}
            >
              Remote
            </button>
            <button
              type="button"
              className={`rec-filter-tab ${workModeFilter === 'On-site' ? 'active' : ''}`}
              onClick={() => setWorkModeFilter('On-site')}
            >
              On-site
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="rec-tabs-group" role="tablist" aria-label="Match Fit Filters">
              <button
                type="button"
                className={`rec-filter-tab ${fitFilter === 'all' ? 'active' : ''}`}
                onClick={() => setFitFilter('all')}
              >
                All Fits
              </button>
              <button
                type="button"
                className={`rec-filter-tab ${fitFilter === '90' ? 'active' : ''}`}
                onClick={() => setFitFilter('90')}
              >
                90%+ Fit
              </button>
              <button
                type="button"
                className={`rec-filter-tab ${fitFilter === '80' ? 'active' : ''}`}
                onClick={() => setFitFilter('80')}
              >
                80%+ Fit
              </button>
            </div>

            <select
              className="rec-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort recommendations"
            >
              <option value="fit">Sort by Highest Fit %</option>
              <option value="recent">Sort by Recently Added</option>
              <option value="title">Sort by Job Title</option>
            </select>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="rec-jobs-container" aria-label="Recommended Jobs Feed">
        {loading ? (
          <>
            <div className="job-card-skeleton" style={{ height: '180px' }} />
            <div className="job-card-skeleton" style={{ height: '180px' }} />
            <div className="job-card-skeleton" style={{ height: '180px' }} />
          </>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <article className="rec-job-card" key={job.id}>
              <div className="rec-job-body">
                {job.companyLogoUrl ? (
                  <div className="rec-logo-wrapper">
                    <img src={job.companyLogoUrl} alt={job.company} className="rec-company-logo" />
                  </div>
                ) : (
                  <div className="rec-company-avatar">
                    {getCompanyInitials(job.company)}
                  </div>
                )}

                <div className="rec-job-main-info">
                  <div className="rec-job-header-row">
                    {job.matchReasons.map((reason, rIdx) => (
                      <span className="rec-reason-pill" key={rIdx}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {reason}
                      </span>
                    ))}

                    <div className="rec-fit-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                      </svg>
                      <span className={`rec-fit-score ${getScoreColor(job.fitScore)}`}>
                        {job.fitScore}% FIT
                      </span>
                    </div>
                  </div>

                  <h2 className="rec-job-title">{job.title}</h2>
                  <p className="rec-company-subtitle">
                    {job.company} • {job.location}
                  </p>

                  <div className="rec-meta-tags-row">
                    <span className="rec-meta-tag">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="13" height="13" aria-hidden="true">
                        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                      </svg>
                      {job.workType}
                    </span>
                    {job.experience && (
                      <span className="rec-meta-tag">{job.experience}</span>
                    )}
                    {job.salaryText && (
                      <span className="rec-meta-tag salary">{job.salaryText}</span>
                    )}
                  </div>

                  <div className="rec-skills-tags-row">
                    {job.skills.map((skill, i) => (
                      <span className="rec-skill-tag" key={i}>{skill}</span>
                    ))}
                  </div>

                  <div className="rec-actions-row">
                    <button
                      type="button"
                      className={`rec-btn-apply ${job.isApplied ? 'applied' : ''} ${applyingJobId === job.id ? 'loading' : ''}`}
                      onClick={() => !job.isApplied && onApply(job)}
                      disabled={job.isApplied || applyingJobId === job.id}
                      aria-label={job.isApplied ? 'Already applied' : `Apply to ${job.title}`}
                    >
                      {job.isApplied ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Applied
                        </>
                      ) : applyingJobId === job.id ? (
                        'Submitting...'
                      ) : (
                        'Apply Now'
                      )}
                    </button>

                    <button
                      type="button"
                      className={`rec-btn-save ${job.isSaved ? 'saved' : ''}`}
                      onClick={() => onSave(job)}
                      aria-label={job.isSaved ? 'Remove from saved' : 'Save job'}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={job.isSaved ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                      {job.isSaved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rec-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="rec-empty-icon" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <h3 className="rec-empty-title">No Matching Recommendations Found</h3>
            <p className="rec-empty-desc">
              Try adjusting your search query, clearing filters, or exploring all available AEC listings.
            </p>
            {onNavigateToFindJobs && (
              <button
                type="button"
                className="rec-btn-find-more"
                onClick={onNavigateToFindJobs}
              >
                Browse All AEC Jobs
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default RecommendationJobs
