import { useState, useEffect, useRef } from 'react'
import type { FC } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AppFallback.css'

interface JobPostDetails {
  id: string
  title: string
  category?: string
  project_type?: string
  experience?: string
  work_type?: string
  location?: string
  salary_min?: string | number
  salary_max?: string | number
  currency?: string
  job_description?: string
  technical_requirements?: string
  responsibilities?: string
  company_id?: string
  company_name?: string
  company_logo?: string
  created_at?: string
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.castallioone.app&pcampaignid=web_share'
const APP_SCHEME_PREFIX = 'castallioone://job'

export const JobAppFallback: FC = () => {
  const { id: paramId, jobId: paramJobId } = useParams<{ id?: string; jobId?: string }>()
  const [searchParams] = useSearchParams()
  const resolvedJobId = paramId || paramJobId || searchParams.get('id') || searchParams.get('job_id') || searchParams.get('jobId') || ''

  const [job, setJob] = useState<JobPostDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const autoRedirectRef = useRef<boolean>(false)

  // 1. Fetch real job post from Supabase
  useEffect(() => {
    let isMounted = true

    async function fetchJobDetails() {
      try {
        let query = supabase.from('create_job_post').select('*')

        if (resolvedJobId) {
          query = query.eq('id', resolvedJobId)
        } else {
          // If no specific ID, load latest active requisition
          query = query.order('created_at', { ascending: false }).limit(1)
        }

        const { data: jobRows, error: jobErr } = await query

        if (jobErr) {
          console.warn('Error fetching job details for fallback:', jobErr.message)
        }

        const jobData = jobRows && jobRows.length > 0 ? jobRows[0] : null

        if (jobData) {
          let companyName = 'Castallio Enterprise Partner'
          let companyLogo = ''

          if (jobData.company_id) {
            const { data: comp } = await supabase
              .from('companies')
              .select('name, logo_url')
              .eq('id', jobData.company_id)
              .maybeSingle()

            if (comp?.name) companyName = comp.name
            if (comp?.logo_url) companyLogo = comp.logo_url
          }

          if (isMounted) {
            setJob({
              ...jobData,
              company_name: companyName,
              company_logo: companyLogo,
            })
          }
        }
      } catch (err) {
        console.error('Failed to load job for fallback:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void fetchJobDetails()

    return () => {
      isMounted = false
    }
  }, [resolvedJobId])

  // 2. Mobile Deep Link Intent trigger on Android
  useEffect(() => {
    if (!autoRedirectRef.current && resolvedJobId && typeof window !== 'undefined') {
      const isAndroid = /Android/i.test(navigator.userAgent)
      if (isAndroid) {
        autoRedirectRef.current = true
        const deepLinkUri = `${APP_SCHEME_PREFIX}/${resolvedJobId}`
        // Attempt deep link navigation
        window.location.href = deepLinkUri
      }
    }
  }, [resolvedJobId])

  const deepLinkUrl = resolvedJobId
    ? `${APP_SCHEME_PREFIX}/${resolvedJobId}`
    : 'castallioone://home'

  const getCompanyInitial = (name?: string) => {
    if (!name) return 'C1'
    return name.slice(0, 2).toUpperCase()
  }

  const technicalTags = job?.technical_requirements
    ? job.technical_requirements
        .split(/[,•\n]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : []

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
              <h2 className="af-banner-title">Opening in Castallio One Android App</h2>
              <p className="af-banner-desc">
                If the application didn’t launch automatically, tap below to open or install it from Google Play.
              </p>
            </div>
          </div>
          <a href={deepLinkUrl} className="btn-af-primary" style={{ background: '#ffffff', color: '#00234b' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              open_in_new
            </span>
            <span>Tap to Open in Castallio One App</span>
          </a>
        </section>

        {/* Job Requisition Card */}
        <article className="af-card">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 0' }}>
              <div className="af-skeleton" style={{ height: '28px', width: '70%' }} />
              <div className="af-skeleton" style={{ height: '18px', width: '40%' }} />
              <div className="af-skeleton" style={{ height: '70px', width: '100%' }} />
            </div>
          ) : job ? (
            <>
              {/* Header block */}
              <div className="af-card-header">
                <div className="af-org-badge">
                  <div className="af-avatar-box">
                    {job.company_logo ? (
                      <img src={job.company_logo} alt={job.company_name} />
                    ) : (
                      getCompanyInitial(job.company_name)
                    )}
                  </div>
                  <div className="af-title-group">
                    <h1>{job.title}</h1>
                    <div className="af-company-name">
                      <span>{job.company_name}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16a34a' }}>
                        verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="af-pill-row">
                  {job.work_type && <span className="af-badge af-badge-primary">{job.work_type}</span>}
                  {job.category && <span className="af-badge">{job.category}</span>}
                </div>
              </div>

              {/* Highlights Info Grid */}
              <div className="af-info-grid">
                <div className="af-info-item">
                  <span className="material-symbols-outlined af-info-icon">location_on</span>
                  <div className="af-info-content">
                    <span className="af-info-label">Location</span>
                    <span className="af-info-val">{job.location || 'India (Flexible)'}</span>
                  </div>
                </div>

                <div className="af-info-item">
                  <span className="material-symbols-outlined af-info-icon">work_history</span>
                  <div className="af-info-content">
                    <span className="af-info-label">Experience</span>
                    <span className="af-info-val">{job.experience || '1-3 years'}</span>
                  </div>
                </div>

                {(job.salary_min || job.salary_max) && (
                  <div className="af-info-item">
                    <span className="material-symbols-outlined af-info-icon">payments</span>
                    <div className="af-info-content">
                      <span className="af-info-label">Compensation</span>
                      <span className="af-info-val">
                        ₹{job.salary_min ? Number(job.salary_min).toLocaleString('en-IN') : 'Negotiable'}
                        {job.salary_max ? ` - ₹${Number(job.salary_max).toLocaleString('en-IN')}` : ''}
                      </span>
                    </div>
                  </div>
                )}

                <div className="af-info-item">
                  <span className="material-symbols-outlined af-info-icon">verified_user</span>
                  <div className="af-info-content">
                    <span className="af-info-label">Verification</span>
                    <span className="af-info-val" style={{ color: '#16a34a' }}>Direct Recruiter Post</span>
                  </div>
                </div>
              </div>

              {/* Technical Requirements / Skills */}
              {technicalTags.length > 0 && (
                <div className="af-section-block">
                  <h3 className="af-section-title">Required Competencies</h3>
                  <div className="af-skill-tags-row">
                    {technicalTags.map((tag, idx) => (
                      <span key={idx} className="af-skill-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description Preview */}
              {job.job_description && (
                <div className="af-section-block">
                  <h3 className="af-section-title">Job Overview</h3>
                  <p className="af-desc-text">
                    {job.job_description.length > 320
                      ? `${job.job_description.slice(0, 320)}...`
                      : job.job_description}
                  </p>
                </div>
              )}

              {/* Actions Cluster */}
              <div className="af-actions-cluster">
                <a href={deepLinkUrl} className="btn-af-primary">
                  <span className="material-symbols-outlined">launch</span>
                  <span>Open &amp; Apply in App</span>
                </a>

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
                work_off
              </span>
              <h2 style={{ fontSize: '18px', margin: '12px 0 6px' }}>Requisition Not Found</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>
                This job posting may have been fulfilled or expired. Open the Castallio One app to browse active AEC requisitions.
              </p>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-af-primary">
                Explore Jobs on Google Play
              </a>
            </div>
          )}
        </article>

        {/* Benefits of the Castallio One Android App */}
        <section className="af-features-card" aria-label="Why use Castallio One App">
          <h3 className="af-features-title">Why Use the Castallio One Mobile App?</h3>

          <div className="af-feature-item">
            <div className="af-feature-icon">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <div className="af-feature-body">
              <strong>1-Tap Instant Application</strong>
              <span>Apply directly with your pre-verified AEC skill credentials &amp; portfolio.</span>
            </div>
          </div>

          <div className="af-feature-item">
            <div className="af-feature-icon">
              <span className="material-symbols-outlined">notifications_active</span>
            </div>
            <div className="af-feature-body">
              <strong>Real-Time Recruiter Alerts</strong>
              <span>Get instant push notifications when employers shortlist you or schedule interviews.</span>
            </div>
          </div>

          <div className="af-feature-item">
            <div className="af-feature-icon">
              <span className="material-symbols-outlined">view_in_ar</span>
            </div>
            <div className="af-feature-body">
              <strong>Interactive 3D BIM Viewer</strong>
              <span>Showcase your 3D models (.rvt, .ifc) directly on mobile during recruiter conversations.</span>
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

export default JobAppFallback
