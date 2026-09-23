import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LegalPages.css'

interface LegalSectionItem {
  id: string
  number: string
  title: string
  summary?: string
  content: string[]
  subpoints?: string[]
}

const appPrivacySections: LegalSectionItem[] = [
  {
    id: 'app-scope',
    number: '01',
    title: 'Scope of the Mobile & Desktop Application',
    summary: 'Applicability to Castallio One iOS, Android, Desktop, and Progressive Web Applications (PWA).',
    content: [
      'This Application Privacy Policy ("App Privacy Policy") supplements the general Castallio One Privacy Policy and specifically governs data collection, device permissions, and security practices when you access our platform via mobile apps, desktop wrappers, or Progressive Web App (PWA) clients.',
      'By downloading, installing, or accessing the Castallio One application on any handheld, tablet, or desktop operating system, you consent to the device-level handling practices outlined herein.',
    ],
  },
  {
    id: 'device-permissions',
    number: '02',
    title: 'Mobile Device Permissions & Hardware Access',
    summary: 'Detailed explanation of why specific operating system permissions are requested.',
    content: [
      'The Castallio One app requires certain hardware and operating system permissions solely to facilitate BIM portfolio rendering, credential verification, and recruitment operations. We do not access hardware peripherals without explicit runtime permission prompts:',
    ],
    subpoints: [
      'Camera & Document Scanner: Required to scan hard-copy architectural certificates, degree credentials, and license cards for instant optical verification, or to capture photos for profile avatars.',
      'Files, Storage & Media: Required to attach and review local 3D BIM models (.rvt, .ifc), DWG drawings, PDF resumes, and render image files from your device storage.',
      'Location Services (Coarse / Approximate): Used strictly to locate nearby AEC walk-in recruitment drives, interview venues, and calculate commute radiuses. Continuous background location tracking is never enabled.',
      'Biometric Authentication (Face ID / Touch ID / Fingerprint): Used exclusively for quick, localized device unlock. Biometric sensor data remains strictly on your device’s secure enclave and is never transmitted to or stored on our servers.',
    ],
  },
  {
    id: 'push-notifications',
    number: '03',
    title: 'Push Notifications & Background Sync',
    summary: 'Managing real-time recruiter alerts, interview calls, and background synchronization.',
    content: [
      'When enabled, the app utilizes native Apple Push Notification service (APNs) and Firebase Cloud Messaging (FCM) to deliver critical recruitment notifications, including direct recruiter interview invitations, walk-in drive status changes, and message alerts.',
      'You maintain complete control over notification channels and can disable push notifications at any time in your operating system device settings or directly in the app’s notification preferences.',
    ],
  },
  {
    id: 'offline-cache',
    number: '04',
    title: 'Offline Data Caching & Local Storage Encryption',
    summary: 'How cached blueprints, resumes, and drafted messages are protected locally on device.',
    content: [
      'To provide a seamless experience on job sites and during transit with intermittent connectivity, the app caches portfolio drafts, offline resume templates, and unread messages in local device storage.',
      'All local SQLite and IndexedDB application caches are encrypted on-device. When you log out of the Castallio One app or initiate account termination, all localized offline caches and access tokens are immediately purged from the device.',
    ],
  },
  {
    id: 'app-telemetry',
    number: '05',
    title: 'Crash Diagnostics, Telemetry & App Performance Monitoring',
    summary: 'Automated crash reporting and performance metrics without personal tracking.',
    content: [
      'To guarantee high-speed 3D model rendering and crash-free recruitment interactions, we collect anonymized application performance metrics:',
    ],
    subpoints: [
      'Crash Logs & Stack Traces: Information regarding unhandled runtime exceptions, graphics card rendering crashes during 3D preview, and app freezes.',
      'Device Metadata: Device model, operating system build, screen resolution, and available memory.',
      'No Keystroke or Model Scraping: Diagnostics tools never capture passwords, credit card numbers, or proprietary CAD geometry content.',
    ],
  },
  {
    id: 'app-stores',
    number: '06',
    title: 'App Store Compliance (Apple App Store & Google Play)',
    summary: 'Adherence to Apple App Store Guidelines and Google Play Developer Policies.',
    content: [
      'In accordance with Apple App Store Review Guidelines (Section 5.1 - Privacy) and Google Play Developer Policies (User Data Policy):',
    ],
    subpoints: [
      'App Tracking Transparency (ATT): Castallio One does not track users across third-party apps or websites for targeted ad delivery. Consequently, IDFA / GAID tracking is disabled.',
      'In-App Account Deletion: Users can initiate instant and complete deletion of their account, all personal data, and uploaded portfolio files directly from within the application settings without having to visit an external website.',
      'Children\'s Online Privacy: The application is designed strictly for AEC working professionals and university graduates aged 18 and older. We do not knowingly gather data from minors.',
    ],
  },
  {
    id: 'data-sharing-app',
    number: '07',
    title: 'Data Sharing & Third-Party SDK Disclosures',
    summary: 'Software Development Kits (SDKs) bundled inside the mobile/desktop clients.',
    content: [
      'We minimize third-party client-side SDKs to preserve battery life and eliminate security vectors. Third-party libraries integrated into the app client are limited to:',
    ],
    subpoints: [
      'Supabase Client SDK: Handles encrypted session synchronization and secure real-time messaging.',
      'Native WebGL / WebGPU Renderers: Hardware-accelerated client-side rendering engine for CAD and BIM previewing.',
      'OAuth Client SDKs (Google & LinkedIn): Official native authentication libraries providing isolated single sign-on flows.',
    ],
  },
  {
    id: 'app-updates',
    number: '08',
    title: 'App Updates & Privacy Policy Modifications',
    summary: 'Notification protocols when application permissions or policies change.',
    content: [
      'As we introduce new architectural features—such as augmented reality (AR) model placement or AI computational workflows—we may update this App Privacy Policy.',
      'Any update introducing new device permission requirements will require your explicit approval upon updating or opening the application.',
      'For inquiries concerning mobile data privacy, contact our mobile security desk at app-privacy@castallio.one.',
    ],
  },
]

export const AppPrivacyPolicy = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSectionId, setActiveSectionId] = useState<string>('app-scope')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return appPrivacySections
    return appPrivacySections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.content.some((p) => p.toLowerCase().includes(query)) ||
        (section.subpoints && section.subpoints.some((sp) => sp.toLowerCase().includes(query)))
    )
  }, [searchQuery])

  const scrollToSection = (id: string) => {
    setActiveSectionId(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="legal-page">
      <div className="legal-grid-bg" aria-hidden="true" />

      {/* ── Top Header Banner ── */}
      <header className="legal-header">
        <div className="legal-header-container">
          <nav className="legal-nav-bar" aria-label="Breadcrumb and back navigation">
            <Link to="/" className="legal-brand-link" aria-label="Castallio One Home">
              <span className="legal-brand-name">Castallio One</span>
              <span className="legal-version-badge">v1.2.8 | App Store &amp; Play Compliant</span>
            </Link>

            <button
              type="button"
              className="legal-back-btn"
              onClick={() => navigate('/signin')}
              aria-label="Return to Sign In page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Sign In</span>
            </button>
          </nav>

          <div className="legal-header-content">
            <div className="legal-badge-row">
              <span className="legal-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                Mobile &amp; Client Application Shield
              </span>
              <span className="legal-timestamp">Last Updated: September 20, 2026</span>
            </div>

            <h1 className="legal-title">App Privacy Policy</h1>
            <p className="legal-subtitle">
              Specific privacy standards, device permissions (camera, storage, biometric unlock), and data
              practices for Castallio One mobile and desktop application users.
            </p>

            <div className="legal-header-actions">
              <button
                type="button"
                className="legal-action-btn"
                onClick={handlePrint}
                aria-label="Print or Save as PDF"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print / Save PDF
              </button>
              <Link to="/privacy" className="legal-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Web Privacy Policy &rarr;
              </Link>
              <Link to="/terms" className="legal-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Terms &amp; Conditions &rarr;
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout Body ── */}
      <main className="legal-main">
        <div className="legal-layout-container">
          {/* ── Sidebar Navigation & Tools ── */}
          <aside className="legal-sidebar" aria-label="Table of Contents">
            <div className="legal-sidebar-card">
              <h2 className="legal-toc-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                App Policy Sections
              </h2>

              <div className="legal-search-box">
                <svg
                  className="legal-search-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="legal-search-input"
                  placeholder="Filter app permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter app privacy clauses"
                />
              </div>

              <ul className="legal-toc-list">
                {appPrivacySections.map((item) => (
                  <li key={item.id} className="legal-toc-item">
                    <button
                      type="button"
                      className={`legal-toc-link ${activeSectionId === item.id ? 'active' : ''}`}
                      onClick={() => scrollToSection(item.id)}
                    >
                      <span className="legal-toc-text">{item.title}</span>
                      <span className="legal-toc-num">{item.number}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="legal-help-card">
              <h4>App Store Inquiries</h4>
              <p>
                Have questions regarding iOS/Android sandboxing, offline caches, or in-app account deletion?
              </p>
              <a href="mailto:app-privacy@castallio.one" className="legal-contact-link">
                Email App Security Desk &rarr;
              </a>
            </div>
          </aside>

          {/* ── Content Article Column ── */}
          <article className="legal-content">
            <div className="legal-overview-box">
              <svg
                className="legal-overview-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <div className="legal-overview-text">
                <h3>App Privacy Overview</h3>
                <p>
                  Castallio One mobile and desktop apps never access your camera, storage, or location without
                  explicit runtime permission. Biometric data never leaves your device’s secure enclave, and all
                  offline BIM portfolio caches are encrypted.
                </p>
              </div>
            </div>

            {filteredSections.length === 0 ? (
              <div className="legal-no-results">
                <p>No clauses matched your filter: <strong>"{searchQuery}"</strong></p>
                <button
                  type="button"
                  className="legal-action-btn"
                  onClick={() => setSearchQuery('')}
                  style={{ marginTop: 12 }}
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <section key={sec.id} id={sec.id} className="legal-section">
                  <header className="legal-section-header">
                    <span className="legal-section-index">{sec.number}</span>
                    <h2 className="legal-section-title">{sec.title}</h2>
                  </header>

                  {sec.content.map((paragraph, idx) => (
                    <p key={idx} className="legal-paragraph" style={{ whiteSpace: 'pre-line' }}>
                      {paragraph}
                    </p>
                  ))}

                  {sec.subpoints && sec.subpoints.length > 0 && (
                    <ul className="legal-list">
                      {sec.subpoints.map((sp, sIdx) => {
                        const [boldPart, ...rest] = sp.split(':')
                        return (
                          <li key={sIdx}>
                            {rest.length > 0 ? (
                              <>
                                <strong>{boldPart}:</strong>
                                {rest.join(':')}
                              </>
                            ) : (
                              sp
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              ))
            )}

            <div className="legal-callout">
              <strong>In-App Account Deletion &amp; Data Erasure:</strong>
              <br />
              In strict adherence to Apple App Store Review Guideline 5.1.1(v) and Google Play policy, you can
              permanently delete your entire account, BIM models, and credential records directly from within the app
              under <em>Settings &gt; Account Security &gt; Delete Account</em>.
            </div>
          </article>
        </div>
      </main>

      {/* ── Page Footer ── */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <p className="legal-copy">
            &copy; {new Date().getFullYear()} Castallio One Platform. All rights reserved. Mobile &amp; Desktop App Security.
          </p>
          <div className="legal-footer-links">
            <Link to="/signin" className="legal-footer-link">
              Sign In
            </Link>
            <Link to="/signup" className="legal-footer-link">
              Sign Up
            </Link>
            <Link to="/privacy" className="legal-footer-link">
              Privacy Policy
            </Link>
            <Link to="/terms" className="legal-footer-link">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppPrivacyPolicy
