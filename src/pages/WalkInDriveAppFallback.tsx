import { useState, useEffect, useRef } from 'react'
import type { FC } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AppFallback.css'

interface WalkInDriveDetails {
  id: string
  title: string
  primary_role?: string
  date_time?: string
  location?: string
  number_of_openings?: number
  required_skills?: string[]
  description?: string
  is_urgent?: boolean
  company_id?: string
  company_name?: string
  company_logo?: string
  company_email?: string
  company_website?: string
  status?: string
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.castallioone.app&pcampaignid=web_share'
const APP_SCHEME_PREFIX = 'castallioone://walkin'

export const WalkInDriveAppFallback: FC = () => {
  const { id: paramId, driveId: paramDriveId } = useParams<{ id?: string; driveId?: string }>()
  const [searchParams] = useSearchParams()
  const resolvedDriveId = paramId || paramDriveId || searchParams.get('id') || searchParams.get('drive_id') || searchParams.get('driveId') || ''

  const [drive, setDrive] = useState<WalkInDriveDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const autoRedirectRef = useRef<boolean>(false)

  // 1. Fetch real walk-in drive from Supabase
  useEffect(() => {
    let isMounted = true

    async function fetchDriveDetails() {
      try {
        setLoading(true)

        let query = supabase.from('walk_in_drives').select('*')

        if (resolvedDriveId) {
          query = query.eq('id', resolvedDriveId)
        } else {
          // If no ID, load the nearest upcoming drive
          query = query.order('created_at', { ascending: false }).limit(1)
        }

        const { data: driveRows, error: driveErr } = await query

        if (driveErr) {
          console.warn('Error fetching walk-in drive for fallback:', driveErr.message)
        }

        const driveData = driveRows && driveRows.length > 0 ? driveRows[0] : null

        if (driveData) {
          let companyName = 'AEC Enterprise Employer'
          let companyLogo = ''

          if (driveData.company_id) {
            const { data: comp } = await supabase
              .from('companies')
              .select('name, logo_url')
              .eq('id', driveData.company_id)
              .maybeSingle()

            if (comp?.name) companyName = comp.name
            if (comp?.logo_url) companyLogo = comp.logo_url
          }

          if (isMounted) {
            setDrive({
              ...driveData,
              company_name: companyName,
              company_logo: companyLogo,
            })
          }
        }
      } catch (err) {
        console.error('Failed to load drive for fallback:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void fetchDriveDetails()

    return () => {
      isMounted = false
    }
  }, [resolvedDriveId])

  // 2. Mobile Deep Link Intent trigger on Android
  useEffect(() => {
    if (!autoRedirectRef.current && resolvedDriveId && typeof window !== 'undefined') {
      const isAndroid = /Android/i.test(navigator.userAgent)
      if (isAndroid) {
        autoRedirectRef.current = true
        const deepLinkUri = `${APP_SCHEME_PREFIX}/${resolvedDriveId}`
        window.location.href = deepLinkUri
      }
    }
  }, [resolvedDriveId])

  const deepLinkUrl = resolvedDriveId
    ? `${APP_SCHEME_PREFIX}/${resolvedDriveId}`
    : 'castallioone://walkin'

  const getCompanyInitial = (name?: string) => {
    if (!name) return 'WD'
    return name.slice(0, 2).toUpperCase()
  }

  const formatDriveDate = (dateStr?: string) => {
    if (!dateStr) return 'Schedule Pending'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const mapsUrl = drive?.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(drive.location)}`
    : '#'

  return (
    <div className="af-page-container">
      {/* ── Top Header ── */}
      <header className="af-header">
        <Link to="/" className="af-brand-link">
          <img src="/app_icon.png" alt="Castallio One" className="af-brand-logo" />
          <span className="af-brand-name">Castallio One</span>
        </Link>
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="af-header-cta">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            download
          </span>
          <span>Get App</span>
        </a>
      </header>

      {/* ── Main Content ── */}
      <main className="af-main">
        {/* Smart App Banner */}
        <section className="af-smart-banner" aria-label="Mobile App Action">
          <div className="af-banner-top">
            <div className="af-android-icon-box">
              <svg viewBox="0 0 24 24">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9996.4482.9996.9993.0001.5511-.4485.9997-.9996.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5802 7.844 13.8601 7.29 12 7.29s-3.5802.554-5.1378 1.6597L4.8399 5.4467a.416.416 0 0 0-.5676-.1521.416.416 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
              </svg>
            </div>
            <div>
              <h2 className="af-banner-title">Opening Walk-in Drive in Castallio One</h2>
              <p className="af-banner-desc">
                Tap below to view direct venue directions, register your attendance, or install the Android app.
              </p>
            </div>
          </div>
          <a href={deepLinkUrl} className="btn-af-primary" style={{ background: '#ffffff', color: '#00234b' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              open_in_new
            </span>
            <span>Tap to Open Drive in App</span>
          </a>
        </section>

        {/* Walk-in Drive Details Card */}
        <article className="af-card">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 0' }}>
              <div className="af-skeleton" style={{ height: '28px', width: '70%' }} />
              <div className="af-skeleton" style={{ height: '18px', width: '40%' }} />
              <div className="af-skeleton" style={{ height: '70px', width: '100%' }} />
            </div>
          ) : drive ? (
            <>
              {/* Header block */}
              <div className="af-card-header">
                <div className="af-org-badge">
                  <div className="af-avatar-box">
                    {drive.company_logo ? (
                      <img src={drive.company_logo} alt={drive.company_name} />
                    ) : (
                      getCompanyInitial(drive.company_name)
                    )}
                  </div>
                  <div className="af-title-group">
                    <h1>{drive.title}</h1>
                    <div className="af-company-name">
                      <span>{drive.company_name}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16a34a' }}>
                        verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="af-pill-row">
                  {drive.is_urgent && <span className="af-badge af-badge-urgent">URGENT HIRING</span>}
                  <span className="af-badge af-badge-success">ON-SITE DRIVE</span>
                  {drive.primary_role && <span className="af-badge">{drive.primary_role}</span>}
                </div>
              </div>

              {/* Highlights Info Grid */}
              <div className="af-info-grid">
                <div className="af-info-item">
                  <span className="material-symbols-outlined af-info-icon">event</span>
                  <div className="af-info-content">
                    <span className="af-info-label">Date &amp; Time</span>
                    <span className="af-info-val">{formatDriveDate(drive.date_time)}</span>
                  </div>
                </div>

                <div className="af-info-item">
                  <span className="material-symbols-outlined af-info-icon">pin_drop</span>
                  <div className="af-info-content">
                    <span className="af-info-label">Venue Location</span>
                    <span className="af-info-val">{drive.location || 'Venue in details'}</span>
                  </div>
                </div>

                <div className="af-info-item">
                  <span className="material-symbols-outlined af-info-icon">group</span>
                  <div className="af-info-content">
                    <span className="af-info-label">Openings</span>
                    <span className="af-info-val">
                      {drive.number_of_openings ? `${drive.number_of_openings} Vacancies` : 'Multiple Positions'}
                    </span>
                  </div>
                </div>

                <div className="af-info-item">
                  <span className="material-symbols-outlined af-info-icon">domain_verification</span>
                  <div className="af-info-content">
                    <span className="af-info-label">Drive Status</span>
                    <span className="af-info-val" style={{ color: '#16a34a' }}>
                      {drive.status === 'completed' ? 'Completed' : 'Active Registration'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              {drive.required_skills && drive.required_skills.length > 0 && (
                <div className="af-section-block">
                  <h3 className="af-section-title">Required Technical Skills</h3>
                  <div className="af-skill-tags-row">
                    {drive.required_skills.map((skill, idx) => (
                      <span key={idx} className="af-skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description & Candidate Instructions */}
              {drive.description && (
                <div className="af-section-block">
                  <h3 className="af-section-title">Drive Instructions &amp; Agenda</h3>
                  <p className="af-desc-text">
                    {drive.description.length > 340
                      ? `${drive.description.slice(0, 340)}...`
                      : drive.description}
                  </p>
                </div>
              )}

              {/* Actions Cluster */}
              <div className="af-actions-cluster">
                <a href={deepLinkUrl} className="btn-af-primary">
                  <span className="material-symbols-outlined">qr_code_scanner</span>
                  <span>Register &amp; Check-in via App</span>
                </a>

                {drive.location && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-af-secondary"
                    style={{ borderColor: '#cbd5e1' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ea4335' }}>
                      directions
                    </span>
                    <span>Get Google Maps Directions</span>
                  </a>
                )}

                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-af-google-play">
                  <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: '#3ddc84' }}>
                    <path d="M3.609 1.814L13.792 12 3.61 22.186c-.198-.225-.31-.518-.31-.836V2.65c0-.318.112-.611.31-.836zM15.207 13.414l2.193 2.193-11.455 6.613 9.262-8.806zm0-2.828L5.945 1.78l11.455 6.613-2.193 2.193zm1.414 1.414l3.774-2.179c.81-.468.81-1.229 0-1.696L16.621 6.35 14.5 8.471l2.121 2.121 1.414 1.414z" />
                  </svg>
                  <span>Get it on Google Play</span>
                </a>

                <Link to="/signin" className="btn-af-secondary">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    language
                  </span>
                  <span>Continue on Web Browser</span>
                </Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>
                event_busy
              </span>
              <h2 style={{ fontSize: '18px', margin: '12px 0 6px' }}>Drive Not Found</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>
                This walk-in recruitment campaign may have concluded. Open the Castallio One app to view upcoming recruitment events.
              </p>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-af-primary">
                Explore Drives on Google Play
              </a>
            </div>
          )}
        </article>

        {/* Benefits of the Castallio One Android App */}
        <section className="af-features-card" aria-label="Why use Castallio One App">
          <h3 className="af-features-title">Why Attend via the Castallio One App?</h3>

          <div className="af-feature-item">
            <div className="af-feature-icon">
              <span className="material-symbols-outlined">qr_code</span>
            </div>
            <div className="af-feature-body">
              <strong>Instant Digital Check-In</strong>
              <span>Scan at the venue reception to bypass paper sign-up sheets and submit your resume digitally.</span>
            </div>
          </div>

          <div className="af-feature-item">
            <div className="af-feature-icon">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div className="af-feature-body">
              <strong>Live Queue Tracker</strong>
              <span>Monitor your interview time slot and queue position live on your phone without waiting in line.</span>
            </div>
          </div>

          <div className="af-feature-item">
            <div className="af-feature-icon">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div className="af-feature-body">
              <strong>On-Spot Offer Letters</strong>
              <span>Receive and accept digital intent letters directly through the app right after round clearance.</span>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="af-footer">
        <p>&copy; {new Date().getFullYear()} Castallio One. All rights reserved.</p>
        <p>
          <Link to="/privacy">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms">Terms of Service</Link>
          <span>•</span>
          <Link to="/app-privacy">Mobile App Policy</Link>
        </p>
      </footer>
    </div>
  )
}

export default WalkInDriveAppFallback
