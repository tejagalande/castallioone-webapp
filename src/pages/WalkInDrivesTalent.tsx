import { useState, type FC, useMemo } from 'react'
import './WalkInDrivesTalent.css'
import { useWalkInDrives, type WalkInDriveItem } from '../hooks/useWalkInDrives'

const POPULAR_CITIES = ['All Cities', 'Pune', 'Mumbai', 'Bengaluru', 'Nagpur', 'Hyderabad', 'Delhi NCR']

export const WalkInDrivesTalent: FC = () => {
  const { publicDrives, publicLoading } = useWalkInDrives()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('All Cities')
  const [savedDriveIds, setSavedDriveIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeModalDrive, setActiveModalDrive] = useState<WalkInDriveItem | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 3500)
  }

  // Filter public drives
  const filteredDrives = useMemo(() => {
    return publicDrives.filter((d) => {
      // City filter
      if (selectedCity !== 'All Cities') {
        const matchCity = d.location?.toLowerCase().includes(selectedCity.toLowerCase())
        if (!matchCity) return false
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = d.title?.toLowerCase().includes(q)
        const matchCompany = d.company_name?.toLowerCase().includes(q)
        const matchRole = d.primary_role?.toLowerCase().includes(q)
        const matchLoc = d.location?.toLowerCase().includes(q)
        const matchSkills = d.required_skills?.some((s) => s.toLowerCase().includes(q))
        if (!matchTitle && !matchCompany && !matchRole && !matchLoc && !matchSkills) {
          return false
        }
      }

      return true
    })
  }, [publicDrives, selectedCity, searchQuery])

  // Parse Date Info
  const parseDriveDate = (isoStr: string | null) => {
    if (!isoStr) return { month: 'TBD', day: '--', time: '--', full: 'Date TBD' }
    const dt = new Date(isoStr)
    const month = dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const day = dt.getDate()
    const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const full = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    return { month, day, time, full }
  }

  // Toggle Save Drive
  const handleToggleSave = (driveId: string) => {
    setSavedDriveIds((prev) => {
      const exists = prev.includes(driveId)
      if (exists) {
        showToast('Drive removed from saved list.')
        return prev.filter((id) => id !== driveId)
      } else {
        showToast('Walk-in drive saved to your reminders!')
        return [...prev, driveId]
      }
    })
  }

  // Copy Venue Address
  const handleCopyVenue = (venue: string | null) => {
    if (!venue) return
    navigator.clipboard.writeText(venue)
    showToast('Venue address copied to clipboard!')
  }

  // Generate .ICS Calendar File
  const handleAddToCalendar = (drive: WalkInDriveItem) => {
    if (!drive.date_time) {
      showToast('Date/time not available for this drive.')
      return
    }

    const start = new Date(drive.date_time)
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000) // 4 hours window

    const formatDateICS = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d+/g, '')
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Castallio One//Walk-in Drives//EN',
      'BEGIN:VEVENT',
      `UID:${drive.id}@castallio.one`,
      `DTSTAMP:${formatDateICS(new Date())}`,
      `DTSTART:${formatDateICS(start)}`,
      `DTEND:${formatDateICS(end)}`,
      `SUMMARY:${drive.title} - Walk-in Drive`,
      `DESCRIPTION:${drive.description || 'Walk-in interview session'}`,
      `LOCATION:${drive.location || ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `walk-in-drive-${drive.title.replace(/\s+/g, '-').toLowerCase()}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showToast('Calendar event downloaded (.ics)!')
  }

  return (
    <div className="wdt-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="wdt-toast" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="wdt-hero-section">
        <div className="wdt-hero-glow" />
        <span className="wdt-badge">On-Site Direct Hiring Feeds</span>
        <h1 className="wdt-heading">Verified AEC Walk-in Drives</h1>
        <p className="wdt-subtext">
          Skip lengthy application queues. Attend on-site interview drives organized by top architecture, engineering, and BIM consulting firms. Bring your portfolio and meet hiring managers directly.
        </p>
      </section>

      {/* 2. Search & City Filter Panel */}
      <section className="wdt-search-panel" aria-label="Search and filter walk-in drives">
        <div className="wdt-search-row">
          <div className="wdt-search-input-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by role, company name, skill, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick City Filter Chips */}
        <div className="wdt-city-chips" role="tablist" aria-label="Filter by City">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              className={`wdt-city-chip ${selectedCity === city ? 'active' : ''}`}
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Walk-in Drives Feed List */}
      <main className="wdt-feed-container">
        {publicLoading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#727784' }}>
            Loading live walk-in drives...
          </div>
        ) : filteredDrives.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px dashed #c2c6d5', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              No Walk-in Drives Matching Filter
            </h3>
            <p style={{ fontSize: '14px', color: '#727784', maxWidth: '420px', margin: '0 auto 16px' }}>
              We could not find active walk-in events matching &ldquo;{selectedCity}&rdquo; or your search terms. Try selecting &ldquo;All Cities&rdquo; or clearing your search.
            </p>
            <button
              type="button"
              className="btn-wdt-secondary"
              onClick={() => {
                setSelectedCity('All Cities')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredDrives.map((drive: WalkInDriveItem) => {
            const dateInfo = parseDriveDate(drive.date_time)
            const isSaved = savedDriveIds.includes(drive.id)

            return (
              <article key={drive.id} className="wdt-card">
                <div className="wdt-card-header">
                  <div className="wdt-card-left">
                    {drive.company_logo ? (
                      <img
                        src={drive.company_logo}
                        alt={`${drive.company_name} logo`}
                        className="wdt-company-logo"
                      />
                    ) : (
                      <div className="wdt-company-fallback">
                        {(drive.company_name || 'C').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="wdt-card-headline">
                      <span className="wdt-company-name">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                          <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M18 11h2M18 15h2M9 3h6v4H9z" />
                        </svg>
                        {drive.company_name}
                      </span>
                      <h2 className="wdt-title">{drive.title}</h2>
                    </div>
                  </div>

                  {/* Calendar Date Badge */}
                  <div className="wdt-date-pill">
                    <span className="wdt-date-pill-month">{dateInfo.month}</span>
                    <span className="wdt-date-pill-day">{dateInfo.day}</span>
                    <span className="wdt-date-pill-time">{dateInfo.time}</span>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="wdt-meta-row">
                  {drive.primary_role && (
                    <div className="wdt-meta-item" style={{ fontWeight: 700, color: '#1a1c1e' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <span>Role: {drive.primary_role}</span>
                    </div>
                  )}

                  {drive.number_of_openings && (
                    <span className="wdt-openings-badge">
                      {drive.number_of_openings} {drive.number_of_openings === 1 ? 'OPENING' : 'OPENINGS'}
                    </span>
                  )}

                  {drive.location && (
                    <div className="wdt-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{drive.location}</span>
                    </div>
                  )}
                </div>

                {/* Technical Focus Chips */}
                {drive.required_skills && drive.required_skills.length > 0 && (
                  <div className="wdt-skills-row">
                    <span style={{ fontSize: '11.5px', color: '#727784', fontWeight: 700 }}>
                      TECHNICAL FOCUS:
                    </span>
                    {drive.required_skills.map((skill, i) => (
                      <span key={i} className="wdt-skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Instructions / Document Checklist */}
                {drive.description && (
                  <div className="wdt-instructions-box">
                    <span className="wdt-instructions-title">Walk-in Guidelines &amp; Checklist:</span>
                    <p style={{ margin: 0 }}>{drive.description}</p>
                  </div>
                )}

                {/* Company Contacts (Email & Website) */}
                {(drive.company_email || drive.company_website) && (
                  <div className="wdt-contacts-strip">
                    {drive.company_email && (
                      <a href={`mailto:${drive.company_email}`} className="wdt-contact-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{drive.company_email}</span>
                      </a>
                    )}
                    {drive.company_website && (
                      <a
                        href={drive.company_website.startsWith('http') ? drive.company_website : `https://${drive.company_website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wdt-contact-link"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>{drive.company_website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="wdt-actions-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-wdt-primary"
                      onClick={() => setActiveModalDrive(drive)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>View Venue Details</span>
                    </button>

                    <button
                      type="button"
                      className="btn-wdt-secondary"
                      onClick={() => handleCopyVenue(drive.location)}
                      title="Copy Venue Address"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copy Address</span>
                    </button>

                    <button
                      type="button"
                      className="btn-wdt-secondary"
                      onClick={() => handleAddToCalendar(drive)}
                      title="Add to Google / Apple Calendar"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Add to Calendar</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`btn-wdt-secondary ${isSaved ? 'saved' : ''}`}
                    onClick={() => handleToggleSave(drive.id)}
                  >
                    <svg viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{isSaved ? 'Saved' : 'Save Drive'}</span>
                  </button>
                </div>
              </article>
            )
          })
        )}
      </main>

      {/* 4. Drive Detail Modal */}
      {activeModalDrive && (
        <div className="wid-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="talent-modal-title">
          <div className="wid-modal-dialog" style={{ maxWidth: '600px' }}>
            <div className="wid-modal-header">
              <div>
                <h2 id="talent-modal-title">{activeModalDrive.title}</h2>
                <span style={{ fontSize: '12px', color: '#00418f', fontWeight: 600 }}>
                  Organized by {activeModalDrive.company_name}
                </span>
              </div>
              <button
                type="button"
                className="wid-modal-close"
                onClick={() => setActiveModalDrive(null)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="wid-modal-body" style={{ gap: '16px' }}>
              <div style={{ background: '#f3f3f6', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '13px', color: '#1a1c1e' }}>Schedule &amp; Timings</strong>
                <span style={{ fontSize: '13.5px', color: '#00418f', fontWeight: 700 }}>
                  {parseDriveDate(activeModalDrive.date_time).full} at {parseDriveDate(activeModalDrive.date_time).time}
                </span>
              </div>

              <div style={{ background: '#f3f3f6', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '13px', color: '#1a1c1e' }}>Venue Address</strong>
                <span style={{ fontSize: '13px', color: '#39464f', lineHeight: 1.5 }}>
                  {activeModalDrive.location || 'Venue details not provided'}
                </span>
              </div>

              {(activeModalDrive.company_email || activeModalDrive.company_website) && (
                <div style={{ background: '#f0f4ff', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(0, 65, 143, 0.15)' }}>
                  <strong style={{ fontSize: '13px', color: '#00418f' }}>Company Inquiries &amp; Official Website</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px' }}>
                    {activeModalDrive.company_email && (
                      <a href={`mailto:${activeModalDrive.company_email}`} className="wdt-contact-link" style={{ color: '#00418f', fontWeight: 600 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{activeModalDrive.company_email}</span>
                      </a>
                    )}
                    {activeModalDrive.company_website && (
                      <a
                        href={activeModalDrive.company_website.startsWith('http') ? activeModalDrive.company_website : `https://${activeModalDrive.company_website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wdt-contact-link"
                        style={{ color: '#00418f', fontWeight: 600 }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>{activeModalDrive.company_website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {activeModalDrive.required_skills && activeModalDrive.required_skills.length > 0 && (
                <div>
                  <strong style={{ fontSize: '13px', color: '#1a1c1e', display: 'block', marginBottom: '6px' }}>
                    Required Technical Focus
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeModalDrive.required_skills.map((skill, idx) => (
                      <span key={idx} className="wdt-skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeModalDrive.description && (
                <div>
                  <strong style={{ fontSize: '13px', color: '#1a1c1e', display: 'block', marginBottom: '6px' }}>
                    Candidate Guidelines &amp; Instructions
                  </strong>
                  <p style={{ fontSize: '13px', color: '#424753', lineHeight: 1.6, margin: 0 }}>
                    {activeModalDrive.description}
                  </p>
                </div>
              )}
            </div>

            <div className="wid-modal-footer">
              <button
                type="button"
                className="btn-wdt-secondary"
                onClick={() => handleCopyVenue(activeModalDrive.location)}
              >
                Copy Venue Address
              </button>
              <button
                type="button"
                className="btn-wdt-primary"
                onClick={() => handleAddToCalendar(activeModalDrive)}
              >
                Add to Calendar (.ics)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
