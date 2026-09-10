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
export function ApplicantsPage() {
  const [selectedJob, setSelectedJob] = useState('Senior BIM Coordinator - NYC')
  const [statusFilter, setStatusFilter] = useState('All')

  const applicants = [
    {
      id: '1',
      name: 'Elena Rostova',
      role: 'Senior BIM Coordinator',
      exp: '7 yrs exp',
      fitScore: 94,
      status: 'Reviewed',
      appliedDate: '2 hours ago',
      skills: ['Revit', 'Navisworks', 'Dynamo'],
      portfolioUrl: '#',
    },
    {
      id: '2',
      name: 'Marcus Chen',
      role: 'Structural Engineer & BIM Lead',
      exp: '9 yrs exp',
      fitScore: 88,
      status: 'Shortlisted',
      appliedDate: '1 day ago',
      skills: ['AutoCAD', 'SAP2000', 'Revit Structure'],
      portfolioUrl: '#',
    },
    {
      id: '3',
      name: 'Sarah Jenkins',
      role: 'Architectural Designer',
      exp: '4 yrs exp',
      fitScore: 72,
      status: 'New',
      appliedDate: '3 days ago',
      skills: ['SketchUp', 'Rhino', 'Enscape'],
      portfolioUrl: '#',
    },
    {
      id: '4',
      name: 'David Vance',
      role: 'MEP BIM Technician',
      exp: '6 yrs exp',
      fitScore: 91,
      status: 'Interviewing',
      appliedDate: '4 days ago',
      skills: ['Revit MEP', 'Navisworks', 'SysQue'],
      portfolioUrl: '#',
    },
  ]

  return (
    <div className="emp-page-container fade-in">
      <div className="emp-page-header">
        <div>
          <h1>Applicant Management</h1>
          <p>Review candidate profiles, filter match scores, and move candidates through recruitment stages.</p>
        </div>
        <div className="job-selector">
          <label>Filter by Listing:</label>
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
            <option value="Senior BIM Coordinator - NYC">Senior BIM Coordinator - NYC</option>
            <option value="Structural Revit Specialist">Structural Revit Specialist</option>
            <option value="Lead MEP Design Engineer">Lead MEP Design Engineer</option>
          </select>
        </div>
      </div>

      <div className="table-controls">
        <div className="tabs-row">
          {['All', 'New', 'Reviewed', 'Shortlisted', 'Interviewing', 'Rejected'].map(st => (
            <button
              key={st}
              className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="applicants-list-card">
        <table className="emp-data-table">
          <thead>
            <tr>
              <th>Candidate Name & Title</th>
              <th>Fit Score</th>
              <th>Skills & Stack</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map(app => (
              <tr key={app.id}>
                <td>
                  <div className="candidate-cell">
                    <div className="cand-avatar">{app.name.charAt(0)}</div>
                    <div>
                      <strong className="cand-name">{app.name}</strong>
                      <span className="cand-role">{app.role} • {app.exp}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={`score-badge ${app.fitScore >= 90 ? 'high' : app.fitScore >= 80 ? 'mid' : 'low'}`}>
                    {app.fitScore}% Match
                  </div>
                </td>
                <td>
                  <div className="table-tags">
                    {app.skills.map(s => (
                      <span className="mini-tag" key={s}>{s}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`app-status-badge ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </td>
                <td className="text-muted">{app.appliedDate}</td>
                <td>
                  <div className="action-buttons-group">
                    <button className="btn-secondary xs">View Profile</button>
                    <button className="btn-primary xs">Shortlist</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── 3. TALENT SEARCH ── */
export function TalentSearchPage() {
  const [roleSearch, setRoleSearch] = useState('')
  const [selectedDiscipline, setSelectedDiscipline] = useState('All')

  const talents = [
    {
      id: '1',
      name: 'Alexander Wright',
      headline: 'Principal BIM Manager & Dynamo Developer',
      location: 'Seattle, WA',
      exp: '11 Years Exp',
      rate: '$85 / hr',
      availability: 'Available Immediately',
      skills: ['Revit', 'Dynamo', 'Python', 'Navisworks', 'ISO 19650'],
    },
    {
      id: '2',
      name: 'Maya Lin-Patel',
      headline: 'Senior Computational Architect & Rhino Specialist',
      location: 'New York, NY',
      exp: '8 Years Exp',
      rate: '$75 / hr',
      availability: '2 Weeks Notice',
      skills: ['Rhino', 'Grasshopper', 'Houdini', 'C#', 'Unreal Engine'],
    },
    {
      id: '3',
      name: 'Julian Vance',
      headline: 'Facade Engineer & Structural Consultant',
      location: 'Chicago, IL',
      exp: '9 Years Exp',
      rate: '$90 / hr',
      availability: 'Available Immediately',
      skills: ['Tekla', 'SAP2000', 'RFEM', 'AutoCAD'],
    },
  ]

  return (
    <div className="emp-page-container fade-in">
      <div className="emp-page-header">
        <div>
          <h1>Talent Search</h1>
          <p>Discover top-tier AEC & BIM professionals verified for technical proficiency.</p>
        </div>
      </div>

      <div className="search-banner">
        <div className="search-banner-grid">
          <div className="search-input-wrap">
            <label>Keyword / Software</label>
            <input
              type="text"
              placeholder="e.g. Revit, Dynamo, Facade Engineer..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
            />
          </div>
          <div className="search-input-wrap">
            <label>Discipline</label>
            <select value={selectedDiscipline} onChange={(e) => setSelectedDiscipline(e.target.value)}>
              <option value="All">All Specializations</option>
              <option value="BIM">BIM / VDC Management</option>
              <option value="Architecture">Architecture & Design</option>
              <option value="Structural">Structural Engineering</option>
              <option value="MEP">MEP Engineering</option>
            </select>
          </div>
          <button className="btn-primary search-btn-lg">
            Search Talent Network
          </button>
        </div>
      </div>

      <div className="talent-cards-grid">
        {talents.map(t => (
          <div className="talent-profile-card" key={t.id}>
            <div className="talent-card-header">
              <div className="talent-avatar-lg">{t.name.split(' ').map(n => n[0]).join('')}</div>
              <div className="talent-title-area">
                <h3>{t.name}</h3>
                <p className="talent-headline">{t.headline}</p>
                <span className="talent-loc">{t.location} • {t.exp}</span>
              </div>
              <div className="talent-rate-badge">{t.rate}</div>
            </div>

            <div className="talent-avail-bar">
              <span className="dot active" /> {t.availability}
            </div>

            <div className="talent-skills-wrap">
              {t.skills.map(s => (
                <span className="talent-skill-chip" key={s}>{s}</span>
              ))}
            </div>

            <div className="talent-card-footer">
              <button className="btn-secondary sm">View Full Profile</button>
              <button className="btn-primary sm">Send Message / Offer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 4. SHORTLISTED CANDIDATES ── */
export function ShortlistedPage() {
  const candidates = [
    {
      id: '1',
      name: 'Elena Rostova',
      role: 'Senior BIM Coordinator',
      forJob: 'Lead Revit Specialist - NYC Core',
      rating: '★★★★★',
      notes: 'Strong Revit proficiency and Dynamo script automation background.',
      dateAdded: 'Aug 2, 2026',
    },
    {
      id: '2',
      name: 'Marcus Chen',
      role: 'Structural Engineer',
      forJob: 'Senior Structural Engineer',
      rating: '★★★★☆',
      notes: 'Exceptional background in high-rise seismic structural modeling.',
      dateAdded: 'Jul 30, 2026',
    },
  ]

  return (
    <div className="emp-page-container fade-in">
      <div className="emp-page-header">
        <div>
          <h1>Shortlisted Candidates</h1>
          <p>Bookmarked high-priority candidates saved for interviews or upcoming projects.</p>
        </div>
      </div>

      <div className="shortlist-grid">
        {candidates.map(c => (
          <div className="shortlist-card" key={c.id}>
            <div className="shortlist-card-top">
              <div className="cand-avatar">{c.name.charAt(0)}</div>
              <div>
                <h3>{c.name}</h3>
                <p className="role">{c.role}</p>
              </div>
              <span className="star-rating">{c.rating}</span>
            </div>

            <div className="shortlist-meta-box">
              <div className="meta-line">
                <strong>Saved For:</strong> {c.forJob}
              </div>
              <div className="meta-line">
                <strong>Notes:</strong> {c.notes}
              </div>
            </div>

            <div className="shortlist-actions">
              <button className="btn-primary sm">Schedule Interview</button>
              <button className="btn-secondary sm">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 5. INTERVIEWS ── */
export function InterviewsPage() {
  const interviews = [
    {
      id: '1',
      candidate: 'David Vance',
      role: 'MEP BIM Technician',
      date: 'Tomorrow, Aug 6',
      time: '10:30 AM - 11:30 AM EST',
      type: 'Technical Screen (Video)',
      interviewer: 'Alex Rivera (Lead MEP)',
      status: 'Confirmed',
    },
    {
      id: '2',
      candidate: 'Elena Rostova',
      role: 'Senior BIM Coordinator',
      date: 'Friday, Aug 8',
      time: '2:00 PM - 3:00 PM EST',
      type: 'Final Executive Interview',
      interviewer: 'Sarah Jenkins (VP Design)',
      status: 'Scheduled',
    },
  ]

  return (
    <div className="emp-page-container fade-in">
      <div className="emp-page-header">
        <div>
          <h1>Interviews & Schedules</h1>
          <p>Track upcoming candidate interviews, send calendar invites, and add evaluation notes.</p>
        </div>
        <button className="btn-primary">
          + Schedule New Interview
        </button>
      </div>

      <div className="interviews-list">
        {interviews.map(i => (
          <div className="interview-card" key={i.id}>
            <div className="int-date-box">
              <span className="int-date">{i.date}</span>
              <span className="int-time">{i.time}</span>
            </div>
            <div className="int-details">
              <h3>{i.candidate}</h3>
              <p>{i.role} • <strong>{i.type}</strong></p>
              <span className="int-interviewer">Interviewer: {i.interviewer}</span>
            </div>
            <div className="int-status">
              <span className="status-badge active">{i.status}</span>
            </div>
            <div className="int-actions">
              <button className="btn-secondary sm">Join Video Call</button>
              <button className="btn-secondary sm">Reschedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 6. MESSAGES ── */
export function MessagesPage() {
  const [activeChat, setActiveChat] = useState('1')

  const chats = [
    { id: '1', name: 'Elena Rostova', lastMsg: 'Thanks! I look forward to our video interview.', time: '10:42 AM', unread: 1 },
    { id: '2', name: 'Marcus Chen', lastMsg: 'I have attached my revised Tekla portfolio file.', time: 'Yesterday', unread: 0 },
    { id: '3', name: 'David Vance', lastMsg: 'Does 10:30 AM EST tomorrow still work for you?', time: 'Aug 3', unread: 0 },
  ]

  return (
    <div className="emp-page-container fade-in">
      <div className="emp-page-header">
        <div>
          <h1>Messages & Communications</h1>
          <p>Direct communication channel with candidates and applicants.</p>
        </div>
      </div>

      <div className="messages-layout">
        <div className="messages-sidebar">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="chat-avatar">{chat.name.charAt(0)}</div>
              <div className="chat-info">
                <div className="chat-top">
                  <strong>{chat.name}</strong>
                  <span className="chat-time">{chat.time}</span>
                </div>
                <p className="chat-preview">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-main-area">
          <div className="chat-header">
            <strong>Elena Rostova</strong>
            <span className="sub-text">Applying for Senior BIM Coordinator</span>
          </div>

          <div className="chat-messages-body">
            <div className="msg-bubble received">
              Hello! Thank you for reviewing my application for the Senior BIM Coordinator role.
            </div>
            <div className="msg-bubble sent">
              Hi Elena, we were very impressed with your BIM execution planning experience. We would love to schedule a video call.
            </div>
            <div className="msg-bubble received">
              Thanks! I look forward to our video interview.
            </div>
          </div>

          <div className="chat-input-area">
            <input type="text" placeholder="Type a message to Elena..." />
            <button className="btn-primary sm">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 7. COMPANY PROFILE ── */
export function CompanyProfilePage() {
  return (
    <div className="emp-page-container fade-in">
      <div className="emp-page-header">
        <div>
          <h1>Company Profile</h1>
          <p>Update your firm's branding, headquarters location, website, and company overview.</p>
        </div>
        <button className="btn-primary">Save Changes</button>
      </div>

      <div className="company-profile-card">
        <div className="profile-banner">
          <div className="company-logo-large">APEX</div>
          <button className="btn-secondary sm upload-btn">Change Logo</button>
        </div>

        <div className="profile-form-grid">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input type="text" className="form-input" defaultValue="Apex Architectural & Structural Solutions" />
          </div>

          <div className="form-group">
            <label className="form-label">Industry / Sector</label>
            <input type="text" className="form-input" defaultValue="AEC Engineering & BIM Services" />
          </div>

          <div className="form-group">
            <label className="form-label">Headquarters</label>
            <input type="text" className="form-input" defaultValue="New York, NY" />
          </div>

          <div className="form-group">
            <label className="form-label">Website URL</label>
            <input type="text" className="form-input" defaultValue="https://apex-architectural.example.com" />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Company Overview & Culture</label>
            <textarea
              className="form-textarea"
              rows={5}
              defaultValue="Apex is a leading multidisciplinary engineering firm pioneering digital twin delivery, automated BIM workflows, and sustainable structural design across major metropolitan infrastructure projects."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
