import { useState } from 'react'
import './Applications.css'

type Tab = 'all' | 'review' | 'interview' | 'offered' | 'rejected'

const tabs: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All Applied' },
  { id: 'review', label: 'In Review' },
  { id: 'interview', label: 'Interview Stage' },
  { id: 'offered', label: 'Offered' },
  { id: 'rejected', label: 'Rejected / Archived' },
]

const applications = [
  {
    title: 'Senior BIM Manager',
    company: 'Foster & Partners',
    location: 'London, UK',
    status: 'interviewing' as const,
    match: 98,
    appliedDate: 'Oct 12, 2024',
    nextStep: 'Technical Interview',
  },
  {
    title: 'Structural Engineer (Revit)',
    company: 'Arup',
    location: 'Remote',
    status: 'review' as const,
    match: 85,
    appliedDate: 'Oct 20, 2024',
    nextStep: null,
  },
]

function Applications() {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  return (
    <div className="applications-page">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track and manage your professional AEC opportunities.</p>
      </div>

      <div className="applications-grid">
        <div className="applications-main">
          <div className="tabs-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="applications-list">
            {applications.map((app, i) => (
              <div className="application-card" key={i}>
                <div className="app-card-top">
                  <div className="app-info">
                    <div className="app-logo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3>{app.title}</h3>
                      <p>{app.company} · {app.location}</p>
                    </div>
                  </div>
                  <div className="app-badges">
                    <span className={`status-badge ${app.status}`}>
                      {app.status === 'interviewing' && <span className="status-dot" />}
                      {app.status === 'interviewing' ? 'Interviewing' : 'Under Review'}
                    </span>
                    <span className="match-score">{app.match}% MATCH</span>
                  </div>
                </div>

                <div className="app-card-bottom">
                  <div className="app-meta">
                    <div>
                      <span className="meta-label">Applied</span>
                      <span className="meta-value">{app.appliedDate}</span>
                    </div>
                    {app.nextStep && (
                      <div>
                        <span className="meta-label">Next Step</span>
                        <span className="meta-value bold">{app.nextStep}</span>
                      </div>
                    )}
                  </div>
                  {app.status === 'interviewing' ? (
                    <button className="btn-primary">Prepare for Interview</button>
                  ) : (
                    <button className="btn-outline">Withdraw</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="applications-sidebar">
          <div className="analytics-card">
            <h3>Analytics</h3>
            <div className="analytics-row">
              <span>Total Applications</span>
              <span className="analytics-value">12</span>
            </div>
            <div className="analytics-progress">
              <div className="progress-header">
                <span>Interview Conversion</span>
                <span className="analytics-value">25%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '25%' }} />
              </div>
            </div>
            <div className="analytics-tags">
              <span className="analytics-label">Top Matching Disciplines</span>
              <div className="tags-row">
                <span className="discipline-tag">Architecture (90%)</span>
                <span className="discipline-tag">MEP (82%)</span>
              </div>
            </div>
          </div>

          <div className="upcoming-card">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="upcoming-icon">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming
            </h3>
            <div className="upcoming-item">
              <p className="upcoming-time">Tomorrow, 10:00 AM</p>
              <p className="upcoming-company">Foster & Partners</p>
              <p className="upcoming-detail">Technical Interview - Video Call</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Applications
