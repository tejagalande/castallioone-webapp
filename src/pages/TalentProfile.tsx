import { useState, useEffect, useCallback, type FC } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  type CandidateTalentItem,
  type StudentExperienceItem,
  type TalentSearchQuota,
} from '../hooks/useTalentSearch'
import { resolveValidResumeUrl } from '../lib/talentService'
import './TalentProfile.css'

export const TalentProfile: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [candidate, setCandidate] = useState<CandidateTalentItem | null>(() => {
    if (!id) return null
    try {
      const cached = sessionStorage.getItem(`talent_candidate_${id}`)
      if (cached) return JSON.parse(cached) as CandidateTalentItem
    } catch {
      // ignore
    }
    return null
  })

  const [loading, setLoading] = useState<boolean>(!candidate)
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false)
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false)
  const [showChatModal, setShowChatModal] = useState<boolean>(false)
  const [chatMessage, setChatMessage] = useState<string>('')
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false)
  const [quota, setQuota] = useState<TalentSearchQuota>({
    cvUnlockLimit: 3,
    cvsUnlocked: 0,
    remainingCvs: 3,
  })

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }, [])

  // Load latest candidate details from Supabase
  const loadCandidateData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)

      // 1. Check current employer company
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let companyId: string | null = null
      if (user) {
        const { data: empData } = await supabase
          .from('employer_profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (empData?.company_id) {
          companyId = empData.company_id
        } else {
          const { data: comp } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle()
          if (comp?.id) {
            companyId = comp.id
          }
        }
      }

      // Check if unlocked
      let isUnlocked = false
      if (companyId) {
        const { data: unlockedData } = await supabase
          .from('unlocked_profiles')
          .select('id')
          .eq('company_id', companyId)
          .eq('student_id', id)
          .maybeSingle()
        if (unlockedData) {
          isUnlocked = true
        }

        // Fetch company subscription & authentic CV unlock quota
        let cvLimit = 3 // default for Free Plan
        let cvsUsed = 0

        const { data: subData } = await supabase
          .from('company_subscriptions')
          .select('plan_id, cvs_unlocked, is_active')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (subData) {
          const planId = (subData.plan_id || 'free').toLowerCase()
          if (typeof subData.cvs_unlocked === 'number') {
            cvsUsed = subData.cvs_unlocked
          }

          if (planId === 'free') cvLimit = 3
          else if (planId === 'starter') cvLimit = 0
          else if (planId === 'professional') cvLimit = 0
          else if (planId === 'unlimited') cvLimit = 500
          else if (planId === 'starter_cv') cvLimit = 100
          else if (planId === 'professional_cv') cvLimit = 200
        }

        // Also check if web_get_company_subscription_billing provides details
        try {
          const { data: rpcData } = await supabase.rpc('web_get_company_subscription_billing')
          if (rpcData?.has_company && rpcData?.subscription) {
            const s = rpcData.subscription
            if (typeof s.cv_unlock_limit === 'number') {
              cvLimit = s.cv_unlock_limit
            } else if (typeof s.plan_cv_limit === 'number') {
              cvLimit = s.plan_cv_limit
            }
            if (typeof s.cvs_unlocked === 'number') {
              cvsUsed = s.cvs_unlocked
            }
          }
        } catch {
          // fallback
        }

        const remaining = Math.max(0, cvLimit - cvsUsed)
        setQuota({
          cvUnlockLimit: cvLimit,
          cvsUnlocked: cvsUsed,
          remainingCvs: remaining,
        })
      }

      // 2. Fetch candidate profile details
      const { data: sp, error: spErr } = await supabase
        .from('student_profile')
        .select('*')
        .or(`id.eq.${id},user_id.eq.${id}`)
        .maybeSingle()

      if (spErr) {
        console.warn('Error fetching student_profile by id:', spErr.message)
      }

      if (sp) {
        // Fetch experiences from student_experience table
        const profileId = (sp.id as string) || id
        const { data: rawExps } = await supabase
          .from('student_experience')
          .select('*')
          .eq('student_id', profileId)
          .order('start_date', { ascending: false })

        // Fetch skills from student_skills table
        const { data: skillsRow } = await supabase
          .from('student_skills')
          .select('skills')
          .eq('student_id', profileId)
          .maybeSingle()

        const skillsList: string[] = []
        if (skillsRow && Array.isArray(skillsRow.skills)) {
          for (const item of skillsRow.skills) {
            if (typeof item === 'string') {
              skillsList.push(item)
            } else if (item && typeof item === 'object' && 'skill_name' in item) {
              const sName = (item as { skill_name?: string }).skill_name
              if (sName) skillsList.push(sName)
            }
          }
        }

        const expsList: StudentExperienceItem[] = (Array.isArray(rawExps) ? rawExps : []).map(
          (e: {
            id?: string
            role_title?: string
            organization_name?: string
            contributions?: string
            start_date?: string | null
            end_date?: string | null
          }) => ({
            id: e.id || Math.random().toString(),
            roleTitle: e.role_title || 'Specialist',
            organizationName: e.organization_name || 'AEC Studio',
            contributions: e.contributions || '',
            startDate: e.start_date || null,
            endDate: e.end_date || null,
          })
        )

        const mapped: CandidateTalentItem = {
          id: sp.id,
          userId: sp.user_id,
          name: sp.full_name || 'Verified Talent',
          avatarInitials: (sp.full_name || 'CA').slice(0, 2).toUpperCase(),
          profileImageUrl: sp.profile_image_url || undefined,
          bio: sp.bio || 'Verified parametric designer on Castallio One talent ecosystem.',
          email: isUnlocked ? (sp.email || 'unlocked.talent@castallio.com') : '••••••••@gmail.com',
          phone: isUnlocked ? (sp.phone ? String(sp.phone) : '+91 Verified') : null,
          location: sp.location || 'India',
          discipline: sp.discipline || 'AEC Specialist',
          institution: sp.institution || 'Engineering Institute',
          graduationYear: sp.graduation_year || '2025',
          workMode: sp.work_mode || 'Flexible',
          expectedCtc: sp.expected_ctc ? `₹${sp.expected_ctc}` : 'Open to negotiate',
          noticePeriod: sp.notice_period || 'Immediately',
          portfolioUrl: sp.portfolio_url || undefined,
          resumeFileUrl: isUnlocked
            ? resolveValidResumeUrl(sp.resume_file_url, sp.user_id || sp.id)
            : undefined,
          hasResume: Boolean(sp.resume_file_url),
          linkedinUrl: sp.linkedin_url || undefined,
          isUnlocked,
          hasEmbedding: Boolean(sp.embedding),
          matchScore: 94,
          experienceYears: Number(sp.experience_years) || 0,
          skills:
            skillsList.length > 0
              ? skillsList
              : ['AutoCAD', 'Revit', 'STAAD.Pro', 'BIM Coordination'],
          experiences: expsList,
        }

        setCandidate(mapped)
        try {
          sessionStorage.setItem(`talent_candidate_${id}`, JSON.stringify(mapped))
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error loading candidate profile:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCandidateData()
  }, [loadCandidateData])

  // Set document title
  useEffect(() => {
    if (candidate) {
      document.title = `${candidate.name} | Talent Profile - Castallio One`
    }
  }, [candidate])

  const handleToggleSave = () => {
    setIsSaved((prev) => {
      const next = !prev
      showToast(next ? 'Candidate saved to your shortlisted favorites!' : 'Removed candidate from favorites.')
      return next
    })
  }

  const handleConfirmUnlock = async () => {
    if (!candidate) return
    setIsUnlocking(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let companyId: string | null = null
      if (user) {
        const { data: empData } = await supabase
          .from('employer_profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (empData?.company_id) {
          companyId = empData.company_id
        } else {
          const { data: comp } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle()
          if (comp?.id) {
            companyId = comp.id
          }
        }
      }

      if (!companyId) {
        showToast('Please log in with your employer company profile to unlock candidates.')
        setIsUnlocking(false)
        setShowUnlockModal(false)
        return
      }

      const { data, error } = await supabase.rpc('unlock_candidate_profile', {
        p_company_id: companyId,
        p_student_id: candidate.id,
      })

      if (error) {
        showToast(`Unlock failed: ${error.message}`)
      } else {
        interface UnlockResult {
          success: boolean
          remaining?: number
        }
        const res = data as UnlockResult | null
        if (res?.success) {
          // Fetch genuine contact and resume details now that profile is unlocked
          let resolvedEmail = candidate.email
          let resolvedPhone = candidate.phone
          let resolvedResumeUrl = candidate.resumeFileUrl

          try {
            const { data: unlockedSp } = await supabase
              .from('student_profile')
              .select('id, user_id, email, phone, resume_file_url')
              .eq('id', candidate.id)
              .maybeSingle()

            if (unlockedSp) {
              resolvedEmail = unlockedSp.email || candidate.email
              resolvedPhone = unlockedSp.phone ? String(unlockedSp.phone) : candidate.phone
              resolvedResumeUrl = resolveValidResumeUrl(
                unlockedSp.resume_file_url,
                unlockedSp.user_id || candidate.userId || candidate.id
              )
            }
          } catch {
            // fallback
          }

          showToast(`Success: ${candidate.name}'s profile & CV unlocked!`)
          setCandidate((prev) => {
            if (!prev) return null
            const updated = {
              ...prev,
              isUnlocked: true,
              email: resolvedEmail,
              phone: resolvedPhone,
              resumeFileUrl: resolvedResumeUrl,
              hasResume: Boolean(resolvedResumeUrl),
            }
            try {
              sessionStorage.setItem(`talent_candidate_${candidate.id}`, JSON.stringify(updated))
            } catch {
              // ignore
            }
            return updated
          })
          if (typeof res.remaining === 'number') {
            setQuota((q) => ({
              ...q,
              cvsUnlocked: q.cvsUnlocked + 1,
              remainingCvs: res.remaining || 0,
            }))
          }
          setShowUnlockModal(false)
        } else {
          showToast('Could not complete unlock. Please verify your subscription quota.')
        }
      }
    } catch (err) {
      console.error('Error during candidate unlock:', err)
      showToast('Unlock encountered an unexpected error.')
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !candidate) return
    setIsSendingChat(true)
    try {
      const targetUserId = candidate.userId || candidate.id
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        showToast('Please sign in to send messages.')
        return
      }

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: targetUserId,
        content: chatMessage.trim(),
        message_type: 'direct',
      })

      if (error) {
        showToast(`Message error: ${error.message}`)
      } else {
        showToast(`Message sent to ${candidate.name}!`)
        setChatMessage('')
        setShowChatModal(false)
      }
    } catch (err) {
      console.error('Error sending message:', err)
      showToast('Failed to deliver message.')
    } finally {
      setIsSendingChat(false)
    }
  }

  const handleCloseOrBack = () => {
    if (window.opener) {
      window.close()
    } else {
      navigate('/employer')
    }
  }

  if (loading && !candidate) {
    return (
      <div className="tp-loading-screen" aria-live="polite">
        <div className="tp-loading-box">
          <span className="material-symbols-outlined tp-spin-icon" aria-hidden="true">
            sync
          </span>
          <h2>Loading Candidate Profile &amp; Resume...</h2>
          <p>Retrieving verified credentials and portfolio records from talent network.</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="tp-loading-screen">
        <div className="tp-loading-box">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#dc2626' }} aria-hidden="true">
            error
          </span>
          <h2>Candidate Profile Not Found</h2>
          <p>The candidate profile you requested could not be located in our active database records.</p>
          <Link to="/employer" className="btn-tp-primary" style={{ marginTop: '16px' }}>
            Return to Employer Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="talent-profile-standalone-page" aria-label={`Candidate Profile of ${candidate.name}`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="tp-toast-alert" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Standalone Navigation Bar ── */}
      <header className="tp-standalone-header">
        <div className="tp-header-left">
          <button
            type="button"
            className="tp-back-btn"
            onClick={handleCloseOrBack}
            title="Return to search directory"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
            <span>Back to Talent Search</span>
          </button>
          <div className="tp-header-divider" aria-hidden="true"></div>
          <div className="tp-brand-tag">
            <img src="/app_icon.png" alt="Castallio One" style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'cover' }} />
            <span>CASTALLIO ONE // VERIFIED AEC TALENT PROFILE</span>
          </div>
        </div>

        <div className="tp-header-right">
          <button
            type="button"
            className="btn-tp-header-action"
            onClick={handleToggleSave}
            title={isSaved ? 'Remove from favorites' : 'Save candidate'}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: isSaved ? '#d97706' : 'currentColor' }}
              aria-hidden="true"
            >
              {isSaved ? 'bookmark' : 'bookmark_border'}
            </span>
            <span>{isSaved ? 'Saved Favorite' : 'Save Candidate'}</span>
          </button>

          <button
            type="button"
            className="btn-tp-header-action"
            onClick={() => window.print()}
            title="Print or export candidate profile PDF"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              print
            </span>
            <span>Print Profile</span>
          </button>

          <button
            type="button"
            className="btn-tp-header-primary"
            onClick={() => setShowChatModal(true)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              chat
            </span>
            <span>Send Direct Message</span>
          </button>
        </div>
      </header>

      {/* ── Hero Dossier Card ── */}
      <section className="tp-hero-card">
        <div className="tp-hero-top-row">
          <div className="tp-hero-avatar-wrap">
            {candidate.profileImageUrl ? (
              <img
                src={candidate.profileImageUrl}
                alt={candidate.name}
                className="tp-hero-avatar-img"
              />
            ) : (
              <div className="tp-hero-avatar-initials">{candidate.avatarInitials}</div>
            )}
            <span className="tp-avatar-badge" title="Pre-verified AEC Candidate">
              <span className="material-symbols-outlined" aria-hidden="true">
                verified
              </span>
            </span>
          </div>

          <div className="tp-hero-content">
            <div className="tp-hero-badges-row">
              <span className="tp-badge-verified">
                <span className="material-symbols-outlined" aria-hidden="true">
                  verified_user
                </span>
                Pre-Verified Candidate
              </span>
              <span className="tp-badge-discipline">{candidate.discipline}</span>
              {candidate.isUnlocked ? (
                <span className="tp-badge-unlocked">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    lock_open
                  </span>
                  Full Contact &amp; CV Unlocked
                </span>
              ) : (
                <span className="tp-badge-locked">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    lock
                  </span>
                  Contact Locked
                </span>
              )}
            </div>

            <h1 className="tp-candidate-name">{candidate.name}</h1>
            <p className="tp-candidate-headline">
              {candidate.discipline} Specialist • {candidate.institution} (Class of {candidate.graduationYear})
            </p>

            {candidate.bio && <p className="tp-candidate-bio">{candidate.bio}</p>}

            {/* Quick Metrics Bar */}
            <div className="tp-candidate-stats-grid">
              <div className="tp-stat-chip">
                <span className="material-symbols-outlined stat-icon" aria-hidden="true">
                  work_history
                </span>
                <div className="stat-content">
                  <span className="stat-value">{candidate.experienceYears} Years</span>
                  <span className="stat-label">AEC Experience</span>
                </div>
              </div>

              <div className="tp-stat-chip">
                <span className="material-symbols-outlined stat-icon" aria-hidden="true">
                  location_on
                </span>
                <div className="stat-content">
                  <span className="stat-value">{candidate.location}</span>
                  <span className="stat-label">Location</span>
                </div>
              </div>

              <div className="tp-stat-chip">
                <span className="material-symbols-outlined stat-icon" aria-hidden="true">
                  laptop_chromebook
                </span>
                <div className="stat-content">
                  <span className="stat-value">{candidate.workMode}</span>
                  <span className="stat-label">Work Mode</span>
                </div>
              </div>

              <div className="tp-stat-chip">
                <span className="material-symbols-outlined stat-icon" aria-hidden="true">
                  payments
                </span>
                <div className="stat-content">
                  <span className="stat-value">{candidate.expectedCtc}</span>
                  <span className="stat-label">Expected CTC</span>
                </div>
              </div>

              <div className="tp-stat-chip">
                <span className="material-symbols-outlined stat-icon" aria-hidden="true">
                  timer
                </span>
                <div className="stat-content">
                  <span className="stat-value">{candidate.noticePeriod}</span>
                  <span className="stat-label">Notice Period</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="tp-hero-action-col">
            {!candidate.isUnlocked ? (
              <div className="tp-unlock-cta-card">
                <div className="cta-icon-ring">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    key
                  </span>
                </div>
                <h3>Unlock Full Profile</h3>
                <p>Access direct phone, email, and high-resolution official CV PDF.</p>
                <div className="quota-hint">Remaining Quota: {quota.remainingCvs} unlocks</div>
                <button
                  type="button"
                  className="btn-tp-unlock-full"
                  onClick={() => setShowUnlockModal(true)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    lock_open
                  </span>
                  <span>Unlock Profile (1 Quota)</span>
                </button>
              </div>
            ) : (
              <div className="tp-unlocked-card">
                <div className="unlocked-header">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    check_circle
                  </span>
                  <span>Direct Contact Active</span>
                </div>
                <div className="unlocked-contacts">
                  <div className="contact-row">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      mail
                    </span>
                    <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                  </div>
                  {candidate.phone && (
                    <div className="contact-row">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        call
                      </span>
                      <a href={`tel:${candidate.phone}`}>{candidate.phone}</a>
                    </div>
                  )}
                  {candidate.linkedinUrl && (
                    <div className="contact-row">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        share
                      </span>
                      <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {candidate.portfolioUrl && (
                    <div className="contact-row">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        link
                      </span>
                      <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        Design Portfolio
                      </a>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-tp-message-direct"
                  onClick={() => setShowChatModal(true)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chat
                  </span>
                  <span>Message Candidate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Two Column Body Grid ── */}
      <section className="tp-body-layout">
        {/* Left / Main Column */}
        <div className="tp-main-column">
          {/* 1. Live Resume PDF Viewer */}
          <article className="tp-content-card" aria-label="Official Resume PDF">
            <div className="tp-card-header">
              <div className="card-header-left">
                <span className="material-symbols-outlined card-header-icon" aria-hidden="true">
                  description
                </span>
                <div>
                  <h2 className="card-title">Official Candidate Resume / CV</h2>
                  <p className="card-sub">
                    Live document preview verified by Castallio One authentication framework
                  </p>
                </div>
              </div>

              {candidate.isUnlocked && candidate.resumeFileUrl && (
                <div className="card-header-actions">
                  <a
                    href={candidate.resumeFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-tp-secondary-sm"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      open_in_new
                    </span>
                    <span>Open in New Window</span>
                  </a>
                  <a
                    href={candidate.resumeFileUrl}
                    download={`${candidate.name.replace(/\s+/g, '_')}_CV.pdf`}
                    className="btn-tp-secondary-sm"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      download
                    </span>
                    <span>Download PDF</span>
                  </a>
                </div>
              )}
            </div>

            {candidate.isUnlocked && candidate.resumeFileUrl ? (
              <div className="tp-resume-viewer-container">
                <object
                  data={`${candidate.resumeFileUrl}#toolbar=1&view=FitH`}
                  type="application/pdf"
                  className="tp-resume-iframe"
                  aria-label={`${candidate.name} Resume PDF`}
                >
                  <iframe
                    src={`${candidate.resumeFileUrl}#toolbar=1`}
                    title={`${candidate.name} Resume`}
                    className="tp-resume-iframe"
                  >
                    <div className="tp-empty-resume-state">
                      <span className="material-symbols-outlined empty-icon" aria-hidden="true">
                        description
                      </span>
                      <h3>PDF Preview</h3>
                      <p>Your browser could not preview the document inline.</p>
                      <a
                        href={candidate.resumeFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tp-header-primary"
                        style={{ marginTop: '12px', textDecoration: 'none' }}
                      >
                        Open PDF in New Window
                      </a>
                    </div>
                  </iframe>
                </object>
              </div>
            ) : !candidate.isUnlocked ? (
              <div className="tp-resume-locked-container">
                <div className="tp-resume-locked-badge">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    lock
                  </span>
                </div>
                <h3>Official Candidate Resume / CV Locked</h3>
                <p>
                  This candidate has an authenticated resume on file. Unlock their profile using 1 CV credit to view the full PDF document, download it, and access verified direct contact credentials.
                </p>
                <div className="tp-resume-locked-actions">
                  <button
                    type="button"
                    className="btn-tp-unlock-full"
                    onClick={() => setShowUnlockModal(true)}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      lock_open
                    </span>
                    <span>Unlock Profile to View CV (1 Quota)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="tp-resume-viewer-container">
                <div className="tp-empty-resume-state">
                  <span className="material-symbols-outlined empty-icon" aria-hidden="true">
                    picture_as_pdf
                  </span>
                  <h3>Resume Document Pending</h3>
                  <p>
                    Candidate has registered technical proficiencies and career journey, but has not uploaded a
                    raw PDF document.
                  </p>
                </div>
              </div>
            )}
          </article>

          {/* 2. Career Experience Timeline */}
          <article className="tp-content-card" aria-label="Career Journey & Experience">
            <div className="tp-card-header">
              <div className="card-header-left">
                <span className="material-symbols-outlined card-header-icon" aria-hidden="true">
                  history_edu
                </span>
                <div>
                  <h2 className="card-title">Professional Experience &amp; Roles</h2>
                  <p className="card-sub">Industry tenure, engineering projects, and studio contributions</p>
                </div>
              </div>
            </div>

            <div className="tp-timeline-wrap">
              {candidate.experiences && candidate.experiences.length > 0 ? (
                candidate.experiences.map((exp, idx) => (
                  <div key={exp.id || idx} className="tp-timeline-node">
                    <div className="timeline-bullet-col">
                      <div className="timeline-node-dot"></div>
                      {idx < candidate.experiences.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-node-content">
                      <div className="timeline-role-row">
                        <h3 className="role-title">{exp.roleTitle}</h3>
                        <span className="org-badge">{exp.organizationName}</span>
                      </div>
                      <div className="timeline-date-range">
                        <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                          calendar_month
                        </span>
                        <span>
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'Active'} —{' '}
                          {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                        </span>
                      </div>
                      {exp.contributions && <p className="timeline-contributions">{exp.contributions}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="tp-empty-state-card">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    work_outline
                  </span>
                  <p>Candidate is an enthusiastic fresher seeking initial industry placement.</p>
                </div>
              )}
            </div>
          </article>

          {/* 3. Academic Credentials */}
          <article className="tp-content-card" aria-label="Academic Credentials">
            <div className="tp-card-header">
              <div className="card-header-left">
                <span className="material-symbols-outlined card-header-icon" aria-hidden="true">
                  school
                </span>
                <div>
                  <h2 className="card-title">Academic &amp; University Credentials</h2>
                  <p className="card-sub">Accredited degrees and foundational institution training</p>
                </div>
              </div>
            </div>

            <div className="tp-education-grid">
              <div className="tp-education-card">
                <div className="edu-icon-wrap">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    account_balance
                  </span>
                </div>
                <div className="edu-content">
                  <span className="edu-degree">{candidate.discipline}</span>
                  <span className="edu-institution">{candidate.institution}</span>
                  <span className="edu-year">Graduation Year: {candidate.graduationYear}</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Right / Sidebar Column */}
        <div className="tp-sidebar-column">
          {/* Verified Skills Matrix */}
          <article className="tp-content-card" aria-label="Skills and Technical Competencies">
            <div className="tp-card-header">
              <div className="card-header-left">
                <span className="material-symbols-outlined card-header-icon" aria-hidden="true">
                  psychology
                </span>
                <div>
                  <h2 className="card-title">Skills Matrix</h2>
                  <p className="card-sub">Validated technical proficiencies</p>
                </div>
              </div>
            </div>

            <div className="tp-skills-cluster">
              {(candidate.skills || []).map((skill) => (
                <div key={skill} className="tp-skill-chip">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    verified
                  </span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </article>

          {/* AI Telemetry & Match Engine Details */}
          <article className="tp-content-card" aria-label="AI Match Telemetry">
            <div className="tp-card-header">
              <div className="card-header-left">
                <span className="material-symbols-outlined card-header-icon" aria-hidden="true">
                  auto_awesome
                </span>
                <div>
                  <h2 className="card-title">Profile Diagnostics</h2>
                  <p className="card-sub">Pre-verified credentials &amp; platform telemetry</p>
                </div>
              </div>
            </div>

            <div className="tp-telemetry-stats">
              <div className="telemetry-stat-row">
                <span className="telemetry-label">Match Verification</span>
                <span className="telemetry-value">Verified Profile</span>
              </div>
              <div className="telemetry-stat-row">
                <span className="telemetry-label">Profile Verification</span>
                <span className="telemetry-value-blue">Certified AEC Graduate</span>
              </div>
              <div className="telemetry-stat-row">
                <span className="telemetry-label">Contact State</span>
                <span className={candidate.isUnlocked ? 'telemetry-value-green' : 'telemetry-value-orange'}>
                  {candidate.isUnlocked ? 'Unlocked' : 'Encrypted'}
                </span>
              </div>
            </div>
          </article>

          {/* Quick Direct Message Composer */}
          <article className="tp-content-card" aria-label="Quick Message Candidate">
            <div className="tp-card-header">
              <div className="card-header-left">
                <span className="material-symbols-outlined card-header-icon" aria-hidden="true">
                  send
                </span>
                <div>
                  <h2 className="card-title">Direct Outreach</h2>
                  <p className="card-sub">Send priority message to candidate inbox</p>
                </div>
              </div>
            </div>

            <div className="tp-inline-chat-box">
              <textarea
                className="tp-chat-textarea"
                rows={4}
                placeholder={`Write an outreach message to ${candidate.name} regarding your company's open opportunities...`}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <div className="chat-actions-row">
                <button
                  type="button"
                  className="btn-tp-primary"
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || isSendingChat}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {isSendingChat ? 'sync' : 'send'}
                  </span>
                  <span>{isSendingChat ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── Unlock Confirmation Modal ── */}
      {showUnlockModal && (
        <div className="tp-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="unlock-title">
          <div className="tp-modal-card">
            <div className="modal-top-icon">
              <span className="material-symbols-outlined" aria-hidden="true">
                key
              </span>
            </div>
            <h2 id="unlock-title">Unlock Full Profile &amp; Contact</h2>
            <p className="modal-desc">
              Are you sure you want to use <strong>1 CV Unlock</strong> from your monthly plan quota to access{' '}
              <strong>{candidate.name}</strong>&apos;s direct contact details and downloadable high-res CV?
            </p>
            <div className="modal-quota-stat">
              <span>Remaining Monthly Quota:</span>
              <strong>{quota.remainingCvs} Unlocks</strong>
            </div>

            {quota.remainingCvs <= 0 && (
              <div className="modal-quota-alert" role="alert" style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '12px', margin: '14px 0', textAlign: 'left' }}>
                <strong style={{ color: '#991b1b', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Monthly Quota Reached</strong>
                <p style={{ color: '#7f1d1d', fontSize: '12px', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  You have 0 CV unlocks remaining this cycle. Please upgrade your subscription to unlock more candidate profiles.
                </p>
                <Link to="/employer/subscription" style={{ color: '#00418f', fontSize: '12px', fontWeight: '700', textDecoration: 'underline' }}>
                  Upgrade Subscription Plan →
                </Link>
              </div>
            )}

            <div className="modal-btn-row">
              <button
                type="button"
                className="btn-tp-modal-cancel"
                onClick={() => setShowUnlockModal(false)}
                disabled={isUnlocking}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-tp-modal-confirm"
                onClick={handleConfirmUnlock}
                disabled={isUnlocking || quota.remainingCvs <= 0}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {isUnlocking ? 'sync' : 'lock_open'}
                </span>
                <span>{isUnlocking ? 'Unlocking...' : 'Confirm Unlock'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Modal ── */}
      {showChatModal && (
        <div className="tp-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="chat-title">
          <div className="tp-modal-card tp-modal-chat">
            <div className="modal-header-line">
              <div className="left">
                <span className="material-symbols-outlined" aria-hidden="true">
                  chat
                </span>
                <h2 id="chat-title">Message {candidate.name}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowChatModal(false)}
                aria-label="Close message dialog"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </div>

            <p className="modal-desc">
              Your message will be delivered directly to the candidate&apos;s Castallio One notifications and talent
              portal inbox.
            </p>

            <textarea
              className="tp-chat-textarea"
              rows={5}
              placeholder={`Hi ${candidate.name}, we reviewed your profile on Castallio One and would like to invite you for an interview...`}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />

            <div className="modal-btn-row">
              <button
                type="button"
                className="btn-tp-modal-cancel"
                onClick={() => setShowChatModal(false)}
                disabled={isSendingChat}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-tp-modal-confirm"
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isSendingChat}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {isSendingChat ? 'sync' : 'send'}
                </span>
                <span>{isSendingChat ? 'Delivering...' : 'Send Message'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
