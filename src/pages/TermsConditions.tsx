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

const termsSections: LegalSectionItem[] = [
  {
    id: 'acceptance',
    number: '01',
    title: 'Acceptance of Terms & BIM Infrastructure Scope',
    summary: 'Rules governing access to Castallio One specialized AEC/BIM platform.',
    content: [
      'Welcome to Castallio One ("Castallio", "we", "our", or "the Platform"). By registering an account, accessing, or utilizing any services provided across Castallio One, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions.',
      'Castallio One operates a specialized collaboration, matchmaking, and talent ecosystem dedicated to the Architecture, Engineering, and Construction (AEC) industry. Services include BIM project collaboration, portfolio verification, enterprise hiring workflows, and walk-in drive management.',
      'If you represent an enterprise, architectural studio, engineering firm, or contractor, you represent and warrant that you hold full legal authority to bind that entity to these Terms.',
    ],
  },
  {
    id: 'accounts',
    number: '02',
    title: 'User Accounts, Roles & Identity Verification',
    summary: 'Talent vs. Employer responsibilities and credential protection.',
    content: [
      'Castallio One facilitates two distinct profile tiers: Talent Profiles (for AEC specialists, computational designers, and BIM managers) and Employer Accounts (for studios, contractors, and hiring institutions).',
      'All users must provide accurate, verifiable, and current credentials during registration. Impersonation of any licensed architect, professional engineer (PE), or corporation is strictly prohibited and results in immediate account revocation.',
    ],
    subpoints: [
      'Credential Security: You are solely responsible for safeguarding your authentication credentials, whether direct email/password or third-party OAuth (Google, LinkedIn).',
      'Organizational Verification: Enterprise employer accounts may require tax identification, business domain verification, and corporate authorization before posting jobs or searching candidate vaults.',
      'Account Autonomy: Accounts are non-transferable without express written authorization from Castallio One administration.',
    ],
  },
  {
    id: 'intellectual-property',
    number: '03',
    title: 'Intellectual Property, 3D/BIM Models & Portfolio Rights',
    summary: 'Ownership of architectural drawings, models, parametric scripts, and patents.',
    content: [
      'Talent Retains Ownership: As an AEC professional, you retain all ownership, copyright, and moral rights to your original design files, BIM models (.rvt, .ifc, .dwg), computational scripts (Dynamo, Grasshopper), renderings, and portfolio artifacts uploaded to your profile.',
      'Limited Platform License: By submitting content to public or recruiter-accessible areas of the Platform, you grant Castallio One a worldwide, non-exclusive, royalty-free license solely to display, index, format, and render your portfolio for prospective hiring partners within the parameters of your privacy toggles.',
      'Employer Proprietary Rights: Job listings, tender documentation, proprietary project briefs, and corporate trademarks uploaded by employers remain the exclusive property of respective entities.',
    ],
  },
  {
    id: 'subscriptions',
    number: '04',
    title: 'Enterprise Subscriptions, Billing & Token Economy',
    summary: 'Terms covering subscription tiers, talent search tokens, and billing cycles.',
    content: [
      'Certain enterprise tools—including advanced parametric talent search, direct candidate outreach tokens, walk-in recruitment drive hosting, and applicant tracking systems—require an active Enterprise Subscription or token pack purchase.',
      'Subscription fees are billed in advance on a recurring monthly or annual cadence as selected at checkout. All payments processed via our secure payment partners are non-refundable once the billing cycle begins, except where required by applicable consumer protection laws.',
    ],
    subpoints: [
      'Token Expiration: Sourcing tokens purchased as add-ons remain active during the active subscription period.',
      'Cancellation Policy: You may cancel your subscription at any time via the Employer Billing dashboard. Access to premium enterprise features will persist until the conclusion of the paid billing period.',
      'Taxes & Duties: Quoted subscription prices exclude applicable local sales taxes, VAT, or GST, which will be calculated and invoiced according to your billing jurisdiction.',
    ],
  },
  {
    id: 'confidentiality',
    number: '05',
    title: 'Confidentiality, NDAs & Sensitive Project Data Rooms',
    summary: 'Standardized protocols for handling sensitive infrastructure tenders and proprietary CAD data.',
    content: [
      'Due to the high-security nature of government infrastructure, airport, hospital, and commercial AEC projects, users frequently exchange preliminary project briefs and portfolio samples.',
      'Users agree not to publish, redistribute, or reverse-engineer confidential architectural documentation, proprietary component libraries, or tender pricing disclosed through interview channels or private data rooms without written consent from the issuing firm.',
      'Castallio One incorporates automated metadata stripping for shared portfolios to assist talent in sanitizing proprietary project references, but users retain ultimate responsibility for complying with prior non-disclosure agreements.',
    ],
  },
  {
    id: 'acceptable-use',
    number: '06',
    title: 'Acceptable Platform Conduct & Anti-Scraping Rules',
    summary: 'Prohibited actions, automation limitations, and security policies.',
    content: [
      'Users agree to utilize Castallio One exclusively for bona fide professional AEC recruitment, employment networking, and project staffing.',
    ],
    subpoints: [
      'Prohibition on Automated Scraping: Automated scraping, crawling, spidering, or harvesting of talent profiles, portfolio models, or employer listings is strictly prohibited without written API authorization.',
      'No Spam or Unsolicited Marketing: Employers and talent may not use platform messaging or applicant logs for multi-level marketing, third-party software promotions, or mass unsolicited mailers.',
      'System Integrity: Probing, scanning, or vulnerability testing of our authentication systems, Supabase data layers, or storage endpoints without prior authorization from Castallio One security personnel is an offense subject to civil and criminal penalties.',
    ],
  },
  {
    id: 'liability',
    number: '07',
    title: 'Disclaimers, Limitation of Liability & Platform SLA',
    summary: 'Warranties, uptime commitments, and legal liability limits.',
    content: [
      'Castallio One is provided on an "as is" and "as available" basis. While we strive to maintain 99.9% uptime for our BIM and recruitment infrastructure, we do not warrant that service will be uninterrupted, error-free, or immune from latency.',
      'In no event shall Castallio One, its directors, employees, or partners be held liable for indirect, incidental, punitive, or consequential damages resulting from lost profits, lost BIM data, project tender delays, or hiring decisions made through the Platform.',
      'Our total aggregate liability for any legal claims arising under these Terms shall be limited to the total amount paid by you to Castallio One in the preceding twelve (12) months.',
    ],
  },
  {
    id: 'termination',
    number: '08',
    title: 'Termination, Account Suspension & Data Retention',
    summary: 'Procedures for account deactivation and post-termination rights.',
    content: [
      'You may deactivate your account at any time via your Profile Settings. Upon deactivation, your public profile and job applications will be delisted from active recruiter search indexes.',
      'Castallio One reserves the right to suspend or terminate accounts that violate our code of conduct, breach intellectual property terms, or engage in fraudulent credential representation.',
      'Following account termination, certain anonymized transactional and hiring audit logs may be retained in compliance with statutory tax and employment record regulations.',
    ],
  },
  {
    id: 'governing-law',
    number: '09',
    title: 'Governing Law & Dispute Resolution',
    summary: 'Jurisdiction, arbitration protocols, and dispute mediation.',
    content: [
      'These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which Castallio One operates, without regard to its conflict of law principles.',
      'In the event of any dispute, claim, or controversy arising out of or relating to these Terms, the parties agree to first attempt informal dispute resolution in good faith for a period of thirty (30) business days before initiating formal binding arbitration.',
    ],
  },
]

export const TermsConditions = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSectionId, setActiveSectionId] = useState<string>('acceptance')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return termsSections
    return termsSections.filter(
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
              <span className="legal-version-badge">v1.2.8 | BIM Legal Standard</span>
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
                Official Master Agreement
              </span>
              <span className="legal-timestamp">Last Updated: September 20, 2026</span>
            </div>

            <h1 className="legal-title">Terms &amp; Conditions</h1>
            <p className="legal-subtitle">
              The operational rules, intellectual property guidelines, and enterprise covenants governing
              AEC talent portfolios and employer recruitment on the Castallio One Platform.
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
                Privacy Policy &rarr;
              </Link>
              <Link to="/app-privacy" className="legal-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                App Privacy Policy &rarr;
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
                  placeholder="Filter clauses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter terms clauses"
                />
              </div>

              <ul className="legal-toc-list">
                {termsSections.map((item) => (
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
              <h4>Questions Regarding Terms?</h4>
              <p>
                Our legal and AEC compliance team is available to assist enterprise clients and candidates with custom NDA alignment.
              </p>
              <a href="mailto:legal@castallio.one" className="legal-contact-link">
                Contact Legal Counsel &rarr;
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <div className="legal-overview-text">
                <h3>Executive Summary</h3>
                <p>
                  You own your architectural BIM portfolios and design work. Castallio One provides enterprise
                  infrastructure for matchmaking, verified credentials, and recruiter connections. By signing in or
                  creating an account, you agree to professional conduct, non-disclosure compliance, and platform terms.
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
                    <p key={idx} className="legal-paragraph">
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
              <strong>Need a customized enterprise master services agreement (MSA)?</strong>
              <br />
              Enterprise studio accounts with more than 50 active seats may request an enterprise addendum, custom SLA, or corporate billing master agreement by emailing{' '}
              <a href="mailto:enterprise@castallio.one" style={{ color: '#00418f', fontWeight: 600 }}>
                enterprise@castallio.one
              </a>.
            </div>
          </article>
        </div>
      </main>

      {/* ── Page Footer ── */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <p className="legal-copy">
            &copy; {new Date().getFullYear()} Castallio One Platform. All rights reserved. Precision AEC Network.
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
            <Link to="/app-privacy" className="legal-footer-link">
              App Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TermsConditions
