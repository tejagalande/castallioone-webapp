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

const privacySections: LegalSectionItem[] = [
  {
    id: 'information-collected',
    number: '01',
    title: 'Information We Collect',
    summary: 'Directly submitted details, uploaded portfolios, and automated technical logs.',
    content: [
      'We collect information to deliver high-precision AEC recruiting, secure authentication, and verified credential matching across Castallio One.',
      'When you interact with the Platform as a talent candidate or employer representative, we gather data through your direct submissions and automated telemetry.',
    ],
    subpoints: [
      'Account & Identity Information: Your legal name, professional email address, phone number, password hashes, and third-party OAuth profile identifiers (Google and LinkedIn authentication tokens).',
      'Professional AEC Portfolio Data: Architectural and engineering work samples, 3D BIM assets, CAD specifications, certifications (e.g., Revit Certified Professional, LEED AP), resume documents, employment history, and licensing credentials.',
      'Employer Organization Data: Company legal name, business registration, headquarters address, BIM software stack preferences, job requisitions, and recruiter contact information.',
      'Usage & Device Telemetry: IP addresses, browser specifications, operating system telemetry, session timestamps, and page interaction diagnostics collected for security auditing and performance optimization.',
    ],
  },
  {
    id: 'how-we-use-data',
    number: '02',
    title: 'How We Use Your Information',
    summary: 'Matchmaking algorithms, credential verification, and account communications.',
    content: [
      'Castallio One processes your data strictly for legitimate business and recruitment purposes. We never sell, rent, or monetize your personal or architectural project information to third-party ad networks.',
    ],
    subpoints: [
      'AEC Candidate Matchmaking: Matching candidate BIM proficiency, geographic availability, and compensation expectations with open employer requisitions.',
      'Credential & Verification Audits: Validating software proficiencies, academic degrees, and professional certifications to ensure verified credentials for employers.',
      'Recruitment Communications: Facilitating direct recruiter messaging, interview invitations, walk-in drive schedules, and offer letters.',
      'Security & Fraud Prevention: Monitoring for unauthorized scraping, unauthorized access attempts, and enforcing compliance with non-disclosure obligations.',
    ],
  },
  {
    id: 'ghost-mode-controls',
    number: '03',
    title: 'Talent Privacy & "Ghost Mode" Controls',
    summary: 'Granular controls allowing AEC specialists to browse confidentially without current employer visibility.',
    content: [
      'We recognize that AEC professionals frequently seek confidential career advancement while actively employed at architectural or engineering consultancies.',
      'Castallio One includes granular talent privacy controls accessible in your Resume & Profile settings:',
    ],
    subpoints: [
      'Ghost Mode (Confidential Browsing): When activated, your personal name, contact details, and current employer name are redacted into an anonymized cryptographic handle (e.g., "Senior Computational Designer — 8+ Yrs Exp").',
      'Employer Domain Blocking: You can specify current employer domains and partner firms so that your profile and active job hunting signals remain completely invisible to their recruiter accounts.',
      'Direct Contact Requests: Employers must submit a formal interest token to request unmasking of your contact details, which you may accept or decline at your sole discretion.',
    ],
  },
  {
    id: 'security-encryption',
    number: '04',
    title: 'Cryptographic Vault & Data Security Standards',
    summary: 'AES-256 encryption, TLS 1.3 in transit, and role-based access control.',
    content: [
      'We treat architectural portfolios and talent credentials with defense-in-depth security measures.',
      'All data transmitted to and from the Platform is encrypted in transit using industry-standard TLS 1.3 protocol. Sensitive credentials, authentication tokens, and private data room assets are encrypted at rest using AES-256 cryptographic standards.',
    ],
    subpoints: [
      'Row-Level Security (RLS): Supabase PostgreSQL database architecture enforces strict database row-level policies, ensuring employers only access candidates who have permitted discovery.',
      'Zero Token Leaks: OAuth tokens and API keys are stored in secure server-side environments and never exposed to client-side loggers or public repositories.',
      'Regular Vulnerability Audits: We conduct scheduled vulnerability evaluations and continuous dependency scanning to safeguard our systems against unauthorized intrusion.',
    ],
  },
  {
    id: 'third-party-processors',
    number: '05',
    title: 'Third-Party Processors & Sub-Processors',
    summary: 'Authorized enterprise infrastructure partners supporting the Platform.',
    content: [
      'To provide resilient cloud infrastructure, we partner with specialized, SOC 2 / ISO 27001 compliant cloud infrastructure providers under strict Data Processing Agreements (DPAs):',
    ],
    subpoints: [
      'Supabase & PostgreSQL Cloud: Enterprise database hosting, authentication, and secure session management.',
      'Google Identity & LinkedIn OAuth: Secure single sign-on authentication options chosen by users.',
      'Secure Cloud Object Storage: Encrypted storage buckets for portfolio attachments, BIM model previews, and verification certificates.',
      'Transactional Email & Notifications: Reliable delivery of password resets, interview reminders, and job alert digests.',
    ],
  },
  {
    id: 'cookies-telemetry',
    number: '06',
    title: 'Cookies, Telemetry & Session Management',
    summary: 'Essential cookies used for authentication and preferences.',
    content: [
      'Castallio One uses essential session cookies and local storage tokens strictly necessary to maintain your logged-in session, remember your role selection (Talent vs. Employer), and preserve your dashboard theme preferences.',
      'We do not deploy invasive third-party cross-site behavioral tracking cookies or sell your browsing history to third-party data brokers.',
    ],
  },
  {
    id: 'global-rights',
    number: '07',
    title: 'Your Global Privacy Rights (GDPR, CCPA & Data Portability)',
    summary: 'Your legal entitlements to inspect, export, correct, or permanently erase your data.',
    content: [
      'Regardless of your geographic location, Castallio One extends high-standard privacy rights to all registered users under GDPR, CCPA/CPRA, and relevant data protection frameworks:',
    ],
    subpoints: [
      'Right of Access: You may request a complete copy of all personal data, resume records, and application history stored in our systems.',
      'Right to Rectification: You have full access to edit, update, or correct your profile data, project details, and certifications anytime in your account.',
      'Right to Erasure ("Right to Be Forgotten"): You may request permanent deletion of your account and associated personal data by contacting our privacy desk or utilizing the account deletion tool in settings.',
      'Right to Data Portability: You can export your structured profile and resume information in standard JSON or PDF format.',
    ],
  },
  {
    id: 'contact-dpo',
    number: '08',
    title: 'Contact Our Data Protection Officer (DPO)',
    summary: 'Direct communication channels for privacy questions or data deletion requests.',
    content: [
      'If you have any questions, concerns, or formal requests regarding this Privacy Policy, your rights, or data processing activities, you may reach our designated Data Protection Officer directly:',
      'Email: privacy@castallio.one\nSubject Line: "Privacy Rights Inquiry - Castallio One"\nResponse Window: We endeavor to address and acknowledge all verified privacy requests within thirty (30) business days.',
    ],
  },
]

export const PrivacyPolicy = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSectionId, setActiveSectionId] = useState<string>('information-collected')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return privacySections
    return privacySections.filter(
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
              <span className="legal-version-badge">v1.2.8 | Privacy Shield</span>
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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Cryptographic Data Protection
              </span>
              <span className="legal-timestamp">Last Updated: September 20, 2026</span>
            </div>

            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-subtitle">
              How Castallio One safeguards your AEC credentials, BIM portfolio assets, and identity through
              AES-256 encryption and candidate-controlled Ghost Mode visibility.
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
              <Link to="/app-privacy" className="legal-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                App Privacy Policy &rarr;
              </Link>
              <Link to="/terms" className="legal-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                View Terms &amp; Conditions &rarr;
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
                Table of Contents
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
                  placeholder="Filter privacy terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter privacy terms"
                />
              </div>

              <ul className="legal-toc-list">
                {privacySections.map((item) => (
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
              <h4>Privacy Inquiries &amp; Erasure</h4>
              <p>
                To request data export or permanent deletion under GDPR/CCPA, reach our dedicated Data Protection Officer.
              </p>
              <a href="mailto:privacy@castallio.one" className="legal-contact-link">
                Email Data Protection Officer &rarr;
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div className="legal-overview-text">
                <h3>Our Core Privacy Pledge</h3>
                <p>
                  We do not sell your personal or architectural project information. Talent maintains absolute
                  authority over recruiter visibility via built-in Ghost Mode and cryptographic privacy guards.
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
              <strong>Recruiter Privacy Ledger &amp; Candidate Consent:</strong>
              <br />
              All recruiter views, contact unmaskings, and resume downloads are logged in an immutable audit ledger.
              Candidates receive immediate notification when an employer requests full contact disclosure.
            </div>
          </article>
        </div>
      </main>

      {/* ── Page Footer ── */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <p className="legal-copy">
            &copy; {new Date().getFullYear()} Castallio One Platform. All rights reserved. Encrypted AEC Network.
          </p>
          <div className="legal-footer-links">
            <Link to="/signin" className="legal-footer-link">
              Sign In
            </Link>
            <Link to="/signup" className="legal-footer-link">
              Sign Up
            </Link>
            <Link to="/terms" className="legal-footer-link">
              Terms &amp; Conditions
            </Link>
            <Link to="/app-privacy" className="legal-footer-link">
              App Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PrivacyPolicy
