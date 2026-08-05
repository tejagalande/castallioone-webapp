import { useState } from 'react'
import './FindJobs.css'

const disciplines = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'structural', label: 'Structural Engineering' },
  { id: 'mep', label: 'MEP Engineering' },
  { id: 'civil', label: 'Civil Engineering' },
]

const techStack = ['Revit', 'AutoCAD', 'Navisworks', 'Civil 3D', 'Tekla']

const urgentJobs = [
  {
    title: 'Senior BIM Coordinator',
    company: 'Apex Structural',
    skills: ['Revit', 'Navisworks'],
  },
  {
    title: 'Lead MEP Engineer',
    company: 'Flux Dynamics',
    skills: ['AutoCAD MEP'],
  },
]

const browseJobs = [
  {
    title: 'Computational Designer',
    company: 'Studio Architrave',
    location: 'New York, NY (Hybrid)',
    match: 92,
    skills: ['Rhino', 'Grasshopper', 'Python'],
  },
  {
    title: 'Structural Revit Technician',
    company: 'ConstructBase Inc.',
    location: 'Chicago, IL (On-site)',
    match: 78,
    skills: ['Revit Structure', 'Tekla'],
  },
]

function FindJobs() {
  const [searchTitle, setSearchTitle] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(['structural'])
  const [selectedTech, setSelectedTech] = useState<string[]>(['Revit'])
  const [experienceLevel, setExperienceLevel] = useState(5)

  const toggleDiscipline = (id: string) => {
    setSelectedDisciplines((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  return (
    <div className="find-jobs">
      <div className="find-jobs-header">
        <h1>Browse AEC Jobs</h1>
        <div className="search-bar">
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="search-icon">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </div>
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="search-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              placeholder="Location or Remote"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          <button className="search-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Search
          </button>
        </div>
      </div>

      <div className="find-jobs-grid">
        <aside className="filters-sidebar">
          <div className="filters-card">
            <div className="filters-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="filters-icon">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <h2>Advanced Filters</h2>
            </div>

            <div className="filter-section">
              <h3>AEC Discipline</h3>
              <div className="filter-options">
                {disciplines.map((d) => (
                  <label key={d.id} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedDisciplines.includes(d.id)}
                      onChange={() => toggleDiscipline(d.id)}
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Technical Stack</h3>
              <div className="tech-tags">
                {techStack.map((tech) => (
                  <button
                    key={tech}
                    className={`tech-tag ${selectedTech.includes(tech) ? 'active' : ''}`}
                    onClick={() => toggleTech(tech)}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Experience Level</h3>
              <input
                type="range"
                min="0"
                max="10"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(Number(e.target.value))}
                className="experience-slider"
              />
              <div className="experience-labels">
                <span>Entry</span>
                <span>Mid</span>
                <span>Senior+</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="jobs-content">
          <div className="urgent-section">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="urgent-icon">
                <path d="M12 2c.3 3.2 2.4 5.8 5.3 7.2L12 12l-5.3-2.8C9.6 7.8 11.7 5.2 12 2z" />
                <path d="M12 12v10" />
              </svg>
              Urgent Hiring
            </h2>
            <div className="urgent-scroll">
              {urgentJobs.map((job, i) => (
                <div className="urgent-card" key={i}>
                  <div className="urgent-badge">URGENT</div>
                  <div className="urgent-top">
                    <div className="urgent-logo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3>{job.title}</h3>
                      <p>{job.company}</p>
                    </div>
                  </div>
                  <div className="urgent-skills">
                    {job.skills.map((s, j) => (
                      <span key={j}>{s}</span>
                    ))}
                  </div>
                  <button className="apply-urgent-btn">Apply Now</button>
                </div>
              ))}
            </div>
          </div>

          <div className="browse-section">
            <h2>Browse Jobs</h2>
            <div className="jobs-list">
              {browseJobs.map((job, i) => (
                <div className="job-card" key={i}>
                  <div className="job-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="job-details">
                    <div className="job-title-row">
                      <h3>{job.title}</h3>
                      <div className="match-score">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="match-icon">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                        {job.match}% Match
                      </div>
                    </div>
                    <p className="job-meta">
                      <strong>{job.company}</strong>
                      <span>•</span>
                      <span className="location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {job.location}
                      </span>
                    </p>
                    <div className="job-skills">
                      {job.skills.map((s, j) => (
                        <span key={j}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <button className="apply-btn">Apply Now</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default FindJobs
