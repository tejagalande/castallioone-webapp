import { useState } from 'react'
import './EmployerPages.css'

/* ── 1. MY JOBS ── */
export function MyJobsPage({ onPostNewJob }: { onPostNewJob: () => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all')
  const [search, setSearch] = useState('')

  const jobs = [
    {
      id: '1',
      title: 'Senior BIM Coordinator - Infrastructure',
      dept: 'BIM / VDC',
      location: 'New York, NY (Hybrid)',
      type: 'Full-time',
      posted: '2 days ago',
      applicantsCount: 42,
      shortlistedCount: 8,
      status: 'active',
      tags: ['Revit', 'Navisworks', 'Civil 3D'],
    },
    {
      id: '2',
      title: 'Structural Revit Specialist',
      dept: 'Structural Engineering',
      location: 'Chicago, IL (On-site)',
      type: 'Full-time',
      posted: '5 days ago',
      applicantsCount: 28,
      shortlistedCount: 5,
      status: 'active',
      tags: ['Revit Structure', 'Tekla'],
    },
    {
      id: '3',
      title: 'Lead MEP Design Engineer',
      dept: 'MEP Engineering',
      location: 'Remote (US)',
      type: 'Contract',
      posted: '2 weeks ago',
      applicantsCount: 64,
      shortlistedCount: 12,
      status: 'active',
      tags: ['AutoCAD MEP', 'Navisworks'],
    },
    {
      id: '4',
      title: 'Computational Design Specialist',
      dept: 'Architecture',
      location: 'San Francisco, CA (Hybrid)',
      type: 'Full-time',
      posted: 'Draft saved yesterday',
      applicantsCount: 0,
      shortlistedCount: 0,
      status: 'draft',
      tags: ['Rhino', 'Grasshopper', 'Python'],
    },
    {
      id: '5',
      title: 'Junior Facade Architect',
      dept: 'Architecture',
      location: 'Austin, TX',
      type: 'Full-time',
      posted: 'Closed 1 month ago',
      applicantsCount: 95,
      shortlistedCount: 14,
      status: 'closed',
      tags: ['Rhino', 'Enscape'],
    },
  ]

  const filteredJobs = jobs.filter(j => {
    if (filter !== 'all' && j.status !== filter) return false
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="emp-page-container fade-in">
      <div className="emp-page-header">
        <div>
          <h1>My Job Posts</h1>
          <p>Manage and track all active listings, drafts, and past recruitment campaigns.</p>
        </div>
        <button className="btn-primary" onClick={onPostNewJob}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Post a New Job
        </button>
      </div>

      <div className="table-controls">
        <div className="tabs-row">
          {(['all', 'active', 'draft', 'closed'] as const).map(tab => (
            <button
              key={tab}
              className={`tab-btn ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-count">
                {tab === 'all' ? jobs.length : jobs.filter(j => j.status === tab).length}
              </span>
            </button>
          ))}
        </div>
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="jobs-list">
        {filteredJobs.map(job => (
          <div className="job-post-card" key={job.id}>
            <div className="job-main-info">
              <div className="job-title-row">
                <h3>{job.title}</h3>
                <span className={`status-badge ${job.status}`}>
                  {job.status.toUpperCase()}
                </span>
              </div>
              <p className="job-meta">
                <span>{job.dept}</span> • <span>{job.location}</span> • <span>{job.type}</span> • <span className="time">{job.posted}</span>
              </p>
              <div className="job-tags-row">
                {job.tags.map(tag => (
                  <span className="job-tag" key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="job-stats-row">
              <div className="stat-pill">
                <span className="stat-val">{job.applicantsCount}</span>
                <span className="stat-lbl">Applicants</span>
              </div>
              <div className="stat-pill">
                <span className="stat-val highlighted">{job.shortlistedCount}</span>
                <span className="stat-lbl">Shortlisted</span>
              </div>
            </div>

            <div className="job-actions-row">
              <button className="btn-secondary sm">View Applicants</button>
              <button className="icon-btn" title="Edit Post">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button className="icon-btn danger" title="Close Post">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 2. APPLICANTS ── */
export { ApplicantsEmployer as ApplicantsPage } from './ApplicantsEmployer'


/* ── 3. TALENT SEARCH ── */
export { TalentSearch as TalentSearchPage } from './TalentSearch'

/* ── 4. SHORTLISTED CANDIDATES ── */
export { ShortlistedCandidates as ShortlistedPage } from './ShortlistedCandidates'


/* ── 5. INTERVIEWS ── */
export { Interviews as InterviewsPage } from './Interviews'

/* ── 6. MESSAGES ── */
export { Messages as MessagesPage } from './Messages'

/* ── 7. COMPANY PROFILE ── */
export { CompanyProfile as CompanyProfilePage } from './CompanyProfile'
