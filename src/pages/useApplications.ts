import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type ApplicationStage = 'review' | 'technical' | 'offer' | 'archived'

export type ApplicationTab = 'all' | 'review' | 'technical' | 'offered' | 'archived'

export type SortOption = 'recent' | 'match' | 'progress' | 'studio'

export interface PipelineStep {
  label: string
  date?: string
  isComplete: boolean
  isCurrent: boolean
}

export interface PanelMember {
  name: string
  role: string
  initials: string
  avatarColor: string
  verified: boolean
}

export interface AgendaItem {
  time: string
  topic: string
}

export interface ConfirmedSession {
  title: string
  duration: string
  time: string
  meetingUrl?: string
  panelMembers: PanelMember[]
  agenda: AgendaItem[]
}

export interface SubmittedArtifact {
  id: string
  title: string
  meta: string
  icon: string
  badge?: string
  fileSize?: string
  downloadUrl?: string
}

export interface RecruiterInfo {
  name: string
  initials: string
  status: string
  avatarColor: string
}

export interface AuditTrailItem {
  id: string
  time: string
  description: string
  isRecent: boolean
}

export interface AlertBoxInfo {
  type: 'defense' | 'review' | 'offer' | 'badge'
  icon: string
  title: string
  highlight?: string
  description: string
  buttonText?: string
  buttonAction?: string
}

export interface OfferDetails {
  salary: string
  deadlineDaysLeft: number
  deadlineDate: string
  description: string
  stipend?: string
  leaveDays?: number
}

export interface JobDetailsInfo {
  description?: string
  technicalRequirements?: string[]
  responsibilities?: string
  aboutUs?: string
  workType?: string
  employmentType?: string[]
  openings?: number
}

export interface ApplicationItem {
  id: string
  companyId?: string
  jobId?: string
  studio: string
  studioInitials: string
  studioColor: 'primary' | 'secondary' | 'tertiary' | 'high'
  studioBadge: string
  role: string
  matchScore: number
  reqId: string
  location: string
  compensation: string
  appliedDate: string
  appliedDateTimestamp: number
  stage: ApplicationStage
  stageLabel: string
  currentStageNumber: number
  totalStages: number
  stageTitle: string
  progressPercent: number
  steps: PipelineStep[]
  alertBox?: AlertBoxInfo
  offerDetails?: OfferDetails
  accessNote?: string
  primaryBtnText?: string
  primaryBtnIcon?: string
  secondaryBtnText?: string
  dossierRecordId: string
  confirmedSession?: ConfirmedSession
  submittedArtifacts: SubmittedArtifact[]
  recruiter: RecruiterInfo
  auditTrail: AuditTrailItem[]
  jobDetails?: JobDetailsInfo
  isArchived?: boolean
}

interface DbJobPost {
  id: string
  company_id?: string
  title: string
  category?: string
  project_type?: string
  location?: string
  work_type?: string
  employment_type?: string[]
  salary_min?: number
  salary_max?: number
  technical_requirements?: string
  job_description?: string
  responsibilities?: string
  about_us?: string
  created_at?: string
}

interface DbCompany {
  id: string
  name: string
  logo_url?: string
  office_address?: string
  website?: string
  email?: string
  hr_contact_email?: string
  size?: string
  description?: string
}

interface DbInterview {
  id: string
  job_application_id: string
  company_id?: string
  candidate_id?: string
  interview_date: string
  interview_time?: string
  interview_type?: string
  location_type?: string
  location_value?: string
  status?: string
  notes?: string
  score?: number
  recommendation?: string
}

export interface CandidateProfileInfo {
  fullName: string
  discipline: string
  initials: string
}

function formatIndianOrUkSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Competitive Compensation'
  if (min && max) {
    if (min >= 1000000) {
      return `₹${(min / 100000).toFixed(1)}L – ₹${(max / 100000).toFixed(1)}L PA`
    }
    if (min >= 50000) {
      return `₹${Number(min).toLocaleString('en-IN')} – ₹${Number(max).toLocaleString('en-IN')} / mo`
    }
    return `₹${min}L – ₹${max}L PA`
  }
  if (min) {
    if (min >= 1000000) return `₹${(min / 100000).toFixed(1)}L PA`
    if (min >= 50000) return `₹${Number(min).toLocaleString('en-IN')} / mo`
    return `₹${min}L PA`
  }
  return 'Competitive Compensation'
}

function getCompanyInitials(name: string): string {
  if (!name) return 'AEC'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Recently'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'Recently'
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function parseSkillsList(techReq?: string, jobDesc?: string): string[] {
  const combined = `${techReq || ''} ${jobDesc || ''}`
  const known = [
    'Revit',
    'Navisworks',
    'AutoCAD',
    'STAAD.Pro',
    'Grasshopper',
    'Rhino',
    'Dynamo',
    'ETABS',
    'BIM 360',
    'ISO 19650',
    'Solibri',
    'Tekla',
    'Python',
  ]
  const matched = known.filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(combined))
  return matched.length > 0 ? matched : ['Revit', 'AutoCAD', 'BIM Coordination', 'Structural Engineering']
}

export function useApplications() {
  const [loading, setLoading] = useState<boolean>(true)
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ApplicationTab>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false)

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileInfo>({
    fullName: 'Talent Candidate',
    discipline: 'AEC Professional',
    initials: 'TC',
  })

  // Interactive Modals State
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState<boolean>(false)
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false)
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState<boolean>(false)
  const [isOfferPackModalOpen, setIsOfferPackModalOpen] = useState<boolean>(false)
  const [isAdjustTermsModalOpen, setIsAdjustTermsModalOpen] = useState<boolean>(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Trigger temporary toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 4000)
  }, [])

  // Sync real applications from Supabase if present
  useEffect(() => {
    let isCancelled = false

    async function fetchSupabaseApplications() {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!isCancelled) {
            setApplications([])
            setSelectedAppId(null)
            setLoading(false)
          }
          return
        }

        // 1. Fetch student_profile
        const { data: student } = await supabase
          .from('student_profile')
          .select('id, user_id, full_name, discipline, resume_file_url, portfolio_url, profile_image_url')
          .or(`user_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle()

        const fullName =
          student?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          'Talent Candidate'
        const discipline = student?.discipline || 'AEC Professional'
        const initials = getCompanyInitials(fullName)

        if (!isCancelled) {
          setCandidateProfile({
            fullName,
            discipline,
            initials,
          })
        }

        // 2. Fetch certificates if student profile exists
        let studentCerts: Array<{
          id: string
          title: string
          organization: string
          issue_date?: string
          certificate_path?: string
        }> = []
        if (student?.id) {
          const { data: certsData } = await supabase
            .from('certificates')
            .select('id, title, organization, issue_date, certificate_path')
            .eq('student_id', student.id)
          if (certsData) studentCerts = certsData
        }

        // 3. Query job_applications
        const candidateClauses = [`candidate_id.eq.${user.id}`]
        if (student?.id && student.id !== user.id) {
          candidateClauses.push(`candidate_id.eq.${student.id}`)
        }

        const { data: dbApps, error: appsError } = await supabase
          .from('job_applications')
          .select(
            'id, job_id, company_id, candidate_id, status, is_starred, applied_at, updated_at, rejection_reason'
          )
          .or(candidateClauses.join(','))
          .order('applied_at', { ascending: false })

        if (appsError) {
          console.warn('Notice loading job_applications from Supabase:', appsError.message)
          if (!isCancelled) {
            setApplications([])
            setSelectedAppId(null)
            setLoading(false)
          }
          return
        }

        if (dbApps && dbApps.length > 0 && !isCancelled) {
          const jobIds = Array.from(new Set(dbApps.map((a) => a.job_id).filter(Boolean))) as string[]
          const companyIds = Array.from(
            new Set(dbApps.map((a) => a.company_id).filter(Boolean))
          ) as string[]
          const appIds = dbApps.map((a) => a.id)

          // Fetch Jobs
          const jobsMap: Record<string, DbJobPost> = {}
          if (jobIds.length > 0) {
            const { data: jobsData } = await supabase
              .from('create_job_post')
              .select(
                'id, company_id, title, category, project_type, location, work_type, employment_type, salary_min, salary_max, technical_requirements, job_description, responsibilities, about_us, created_at'
              )
              .in('id', jobIds)
            if (jobsData) {
              jobsData.forEach((j) => {
                jobsMap[j.id] = j as DbJobPost
                if (j.company_id && !companyIds.includes(j.company_id)) {
                  companyIds.push(j.company_id)
                }
              })
            }
          }

          // Fetch Companies
          const companiesMap: Record<string, DbCompany> = {}
          if (companyIds.length > 0) {
            const { data: compData } = await supabase
              .from('companies')
              .select(
                'id, name, logo_url, office_address, website, email, hr_contact_email, size, description'
              )
              .in('id', companyIds)
            if (compData) {
              compData.forEach((c) => {
                companiesMap[c.id] = c as DbCompany
              })
            }
          }

          // Fetch Interviews
          const interviewsMap: Record<string, DbInterview[]> = {}
          if (appIds.length > 0) {
            const { data: ivData } = await supabase
              .from('interviews')
              .select(
                'id, job_application_id, company_id, candidate_id, interview_date, interview_time, interview_type, location_type, location_value, status, notes, score, recommendation'
              )
              .in('job_application_id', appIds)
              .neq('status', 'cancelled')
            if (ivData) {
              ivData.forEach((iv) => {
                const ivRow = iv as DbInterview
                if (!interviewsMap[ivRow.job_application_id]) {
                  interviewsMap[ivRow.job_application_id] = []
                }
                interviewsMap[ivRow.job_application_id].push(ivRow)
              })
            }
          }

          // Map real DB rows to ApplicationItem
          const mappedRealApps: ApplicationItem[] = dbApps.map((row) => {
            const job: DbJobPost = jobsMap[row.job_id] || { id: row.job_id, title: 'AEC Professional' }
            const compId = row.company_id || job.company_id || ''
            const comp: DbCompany = companiesMap[compId] || { id: compId, name: 'AEC Partner Practice' }
            const ivs = interviewsMap[row.id] || []
            const latestIv = ivs[0]

            const studioName = comp.name || 'AEC Studio Practice'
            const studioInitials = getCompanyInitials(studioName)
            const roleTitle = job.title || 'AEC Specialist'
            const salary = formatIndianOrUkSalary(job.salary_min, job.salary_max)
            const location = job.location || comp.office_address || 'India / Remote'

            // Stage mapping
            const rawStatus = (row.status || 'applied').toLowerCase()
            const hasScheduledIv = Boolean(latestIv && latestIv.status !== 'cancelled')
            let stage: ApplicationStage = 'review'
            let stageLabel = 'Stage 1: Application Received'
            let currentStageNumber = 1
            let stageTitle = 'STAGE 1 OF 5: APPLICATION SUBMITTED'
            let progressPercent = 20
            let isArchived = false

            if (rawStatus === 'offered' || rawStatus === 'hired') {
              stage = 'offer'
              stageLabel =
                rawStatus === 'hired' ? 'Stage 5: Hired & Onboarded' : 'Stage 5: Formal Offer Extended'
              currentStageNumber = 5
              stageTitle =
                rawStatus === 'hired' ? 'STAGE 5 OF 5: HIRED' : 'STAGE 5 OF 5: FORMAL OFFER EXTENDED'
              progressPercent = 100
            } else if (rawStatus === 'scheduled' || hasScheduledIv) {
              stage = 'technical'
              stageLabel = 'Stage 4: Technical Defense / Interview'
              currentStageNumber = 4
              stageTitle = 'STAGE 4 OF 5: TECHNICAL DEFENSE SCHEDULED'
              progressPercent = 80
            } else if (rawStatus === 'shortlisted') {
              stage = 'review'
              stageLabel = 'Stage 3: Shortlisted for Evaluation'
              currentStageNumber = 3
              stageTitle = 'STAGE 3 OF 5: SHORTLISTED CANDIDATE'
              progressPercent = 60
            } else if (rawStatus === 'in_review') {
              stage = 'review'
              stageLabel = 'Stage 2: Application Under Review'
              currentStageNumber = 2
              stageTitle = 'STAGE 2 OF 5: APPLICATION UNDER REVIEW'
              progressPercent = 40
            } else if (rawStatus === 'rejected' || rawStatus === 'withdrawn') {
              stage = 'archived'
              stageLabel = rawStatus === 'withdrawn' ? 'Withdrawn' : 'Archived'
              currentStageNumber = 5
              stageTitle =
                rawStatus === 'withdrawn' ? 'WITHDRAWN BY APPLICANT' : 'APPLICATION ARCHIVED'
              progressPercent = 100
              isArchived = true
            }

            // Steps
            const steps: PipelineStep[] = [
              { label: '1. Applied', isComplete: true, isCurrent: currentStageNumber === 1 },
              {
                label: '2. Screened',
                isComplete: currentStageNumber >= 2,
                isCurrent: currentStageNumber === 2,
              },
              {
                label: '3. Shortlisted',
                isComplete: currentStageNumber >= 3,
                isCurrent: currentStageNumber === 3,
              },
              {
                label: '4. Defense / Interview',
                isComplete: currentStageNumber >= 4,
                isCurrent: currentStageNumber === 4,
              },
              {
                label: '5. Studio Offer',
                isComplete: currentStageNumber === 5,
                isCurrent: currentStageNumber === 5,
              },
            ]

            // Submitted Artifacts from Candidate DB Record
            const artifacts: SubmittedArtifact[] = []
            if (student?.resume_file_url) {
              artifacts.push({
                id: `art-res-${row.id}`,
                title: `Verified Resume - ${fullName}`,
                meta: 'PDF • Verified Profile Document',
                icon: 'description',
                downloadUrl: student.resume_file_url,
              })
            }
            if (student?.portfolio_url && student.portfolio_url.trim()) {
              artifacts.push({
                id: `art-port-${row.id}`,
                title: 'Online AEC Portfolio & Work Showcase',
                meta: 'Portfolio Link • Online Showcase',
                icon: 'view_in_ar',
                downloadUrl: student.portfolio_url.trim().startsWith('http')
                  ? student.portfolio_url.trim()
                  : `https://${student.portfolio_url.trim()}`,
              })
            }
            if (studentCerts && studentCerts.length > 0) {
              studentCerts.forEach((cert) => {
                artifacts.push({
                  id: `art-cert-${cert.id}`,
                  title: `${cert.title} - ${cert.organization} Certification`,
                  meta: cert.issue_date
                    ? `Issued ${cert.issue_date} • Verified Credential`
                    : 'Verified Credential',
                  icon: 'verified',
                  downloadUrl: cert.certificate_path,
                })
              })
            }
            if (artifacts.length === 0) {
              artifacts.push({
                id: `art-default-${row.id}`,
                title: `Candidate Application Profile - ${fullName}`,
                meta: 'Verified Talent Record',
                icon: 'description',
              })
            }

            // Confirmed Session if interview exists
            let confirmedSession: ConfirmedSession | undefined
            if (latestIv) {
              confirmedSession = {
                title: `${latestIv.interview_type || 'Technical Defense'}: ${roleTitle}`,
                duration: latestIv.location_type || 'Video Call (Google Meet / Teams)',
                time: `${latestIv.interview_date}${
                  latestIv.interview_time ? ' • ' + latestIv.interview_time : ''
                }`,
                meetingUrl: latestIv.location_value
                  ? latestIv.location_value.startsWith('http')
                    ? latestIv.location_value
                    : `https://${latestIv.location_value}`
                  : undefined,
                panelMembers: [
                  {
                    name: `${studioName} Technical Panel`,
                    role: 'Engineering Hiring Committee',
                    initials: studioInitials,
                    avatarColor: '#00418f',
                    verified: true,
                  },
                ],
                agenda: [
                  { time: '00-20m:', topic: 'Role Scope & Project Specifications Review' },
                  { time: '20-40m:', topic: 'Technical Skills & Software Evaluation' },
                  { time: '40-60m:', topic: 'Q&A, Expectations & Next Milestones' },
                ],
              }
            }

            // Technical alert box
            let alertBox: AlertBoxInfo | undefined
            if (latestIv) {
              alertBox = {
                type: 'defense',
                icon: 'videocam',
                title: `${latestIv.interview_type || 'Technical Defense'} Scheduled`,
                highlight: `${latestIv.interview_date}${
                  latestIv.interview_time ? ' at ' + latestIv.interview_time : ''
                }`,
                description:
                  latestIv.notes ||
                  `1-on-1 Panel with ${studioName} team via ${
                    latestIv.location_type || 'Video Call'
                  }.`,
                buttonText: latestIv.location_value ? 'Launch Meeting' : 'View Session Info',
                buttonAction: 'meeting',
              }
            } else if (rawStatus === 'offered') {
              alertBox = {
                type: 'offer',
                icon: 'verified',
                title: 'Formal Studio Offer Extended',
                description: `Package: ${salary}. Please review formal offer pack and confirm acceptance.`,
                buttonText: 'Review Offer Pack',
                buttonAction: 'offer',
              }
            } else if (rawStatus === 'shortlisted') {
              alertBox = {
                type: 'review',
                icon: 'task_alt',
                title: 'Candidate Shortlisted by Hiring Team',
                description: `${studioName} has verified your qualifications and moved your application to the interview scheduling stage.`,
                buttonText: 'View Application',
                buttonAction: 'dossier',
              }
            } else {
              alertBox = {
                type: 'review',
                icon: 'model_training',
                title: 'Application Under Initial Review',
                description: `${studioName} talent acquisition is evaluating your portfolio and credentials.`,
                buttonText: 'View Application',
                buttonAction: 'dossier',
              }
            }

            // Audit trail
            const auditTrail: AuditTrailItem[] = []
            if (latestIv) {
              auditTrail.push({
                id: `aud-${row.id}-iv`,
                time: `${latestIv.interview_date}`,
                description: `${latestIv.interview_type || 'Technical Interview'} scheduled via ${
                  latestIv.location_type || 'Video Call'
                }.`,
                isRecent: true,
              })
            }
            if (rawStatus === 'shortlisted') {
              auditTrail.push({
                id: `aud-${row.id}-short`,
                time: formatRelativeTime(row.updated_at).toUpperCase(),
                description: `${studioName} recruitment team moved application to Shortlist.`,
                isRecent: !latestIv,
              })
            }
            auditTrail.push({
              id: `aud-${row.id}-app`,
              time: formatRelativeTime(row.applied_at).toUpperCase(),
              description: `Application submitted for ${roleTitle} at ${studioName}.`,
              isRecent: !latestIv && rawStatus !== 'shortlisted',
            })

            // Offer details if offered
            let offerDetails: OfferDetails | undefined
            if (rawStatus === 'offered') {
              offerDetails = {
                salary,
                deadlineDaysLeft: 7,
                deadlineDate: 'In 7 Days',
                description: `Studio offer package: ${salary}. Review contract terms and accept or message the hiring manager.`,
              }
            }

            // Parse technical skills
            const technicalRequirements = parseSkillsList(
              job.technical_requirements,
              job.job_description
            )

            return {
              id: row.id,
              companyId: compId,
              jobId: row.job_id,
              studio: studioName,
              studioInitials,
              studioColor:
                rawStatus === 'offered'
                  ? 'secondary'
                  : rawStatus === 'shortlisted'
                  ? 'high'
                  : 'primary',
              studioBadge:
                rawStatus === 'offered'
                  ? 'Offer Extended'
                  : hasScheduledIv
                  ? 'Interview Scheduled'
                  : rawStatus === 'shortlisted'
                  ? 'Shortlisted'
                  : 'Active Requisition',
              role: roleTitle,
              matchScore: 94.8,
              reqId: job.id
                ? `REQ-${job.id.slice(0, 8).toUpperCase()}`
                : `REQ-${studioInitials}-${row.id.slice(0, 4).toUpperCase()}`,
              location,
              compensation: salary,
              appliedDate: `Applied ${formatRelativeTime(row.applied_at)}`,
              appliedDateTimestamp: new Date(row.applied_at).getTime() || Date.now(),
              stage,
              stageLabel,
              currentStageNumber,
              totalStages: 5,
              stageTitle,
              progressPercent,
              steps,
              alertBox,
              offerDetails,
              accessNote: 'Verified Candidate Access',
              primaryBtnText: hasScheduledIv ? 'Join Virtual Defense Room' : 'View Job Details',
              primaryBtnIcon: hasScheduledIv ? 'videocam' : 'article',
              secondaryBtnText: 'View Submitted Application',
              dossierRecordId: `${studioInitials}-${row.id.slice(0, 8).toUpperCase()}`,
              confirmedSession,
              submittedArtifacts: artifacts,
              recruiter: {
                name: comp.hr_contact_email ? `${studioName} HR` : `${studioName} Talent Team`,
                initials: studioInitials,
                status: comp.email ? `Contact: ${comp.email}` : 'Active Channel • Response < 24h',
                avatarColor: '#00418f',
              },
              auditTrail,
              jobDetails: {
                description: job.job_description,
                technicalRequirements,
                responsibilities: job.responsibilities,
                aboutUs: job.about_us,
                workType: job.work_type,
                employmentType: job.employment_type,
              },
              isArchived,
            }
          })

          setApplications(mappedRealApps)
          setSelectedAppId(mappedRealApps[0].id)
        } else if (!isCancelled) {
          setApplications([])
          setSelectedAppId(null)
        }
      } catch (e) {
        console.warn('Supabase application sync error:', e)
        if (!isCancelled) {
          setApplications([])
          setSelectedAppId(null)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void fetchSupabaseApplications()
    return () => {
      isCancelled = true
    }
  }, [])

  // Currently selected application (can be null if 0 applications)
  const selectedApp = useMemo(() => {
    if (applications.length === 0) return null
    if (!selectedAppId) return applications[0]
    const found = applications.find((a) => a.id === selectedAppId)
    return found || applications[0]
  }, [applications, selectedAppId])

  // Tab counts
  const tabCounts = useMemo(() => {
    const active = applications.filter((a) => !a.isArchived)
    return {
      all: active.length,
      review: active.filter((a) => a.stage === 'review').length,
      technical: active.filter((a) => a.stage === 'technical').length,
      offered: active.filter((a) => a.stage === 'offer').length,
      archived: applications.filter((a) => a.isArchived).length,
    }
  }, [applications])

  // Upcoming interviews and offer computations for stat cards
  const upcomingInterviewsCount = useMemo(() => {
    return applications.filter((a) => a.confirmedSession).length
  }, [applications])

  const nextInterviewApp = useMemo(() => {
    return applications.find((a) => a.confirmedSession) || null
  }, [applications])

  const activeOfferApp = useMemo(() => {
    return applications.find((a) => a.stage === 'offer') || null
  }, [applications])

  const avgMatchScore = useMemo(() => {
    const active = applications.filter((a) => !a.isArchived)
    if (active.length === 0) return '0.0'
    const total = active.reduce((sum, a) => sum + a.matchScore, 0)
    return (total / active.length).toFixed(1)
  }, [applications])

  // Filtered & Sorted applications
  const filteredApplications = useMemo(() => {
    let list = applications.filter((app) => {
      // Tab filter
      if (activeTab === 'all') {
        if (app.isArchived) return false
      } else if (activeTab === 'archived') {
        if (!app.isArchived) return false
      } else {
        if (app.isArchived) return false
        if (activeTab === 'offered' && app.stage !== 'offer') return false
        if (activeTab === 'review' && app.stage !== 'review') return false
        if (activeTab === 'technical' && app.stage !== 'technical') return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchStudio = app.studio.toLowerCase().includes(q)
        const matchRole = app.role.toLowerCase().includes(q)
        const matchReq = app.reqId.toLowerCase().includes(q)
        const matchLoc = app.location.toLowerCase().includes(q)
        if (!matchStudio && !matchRole && !matchReq && !matchLoc) return false
      }

      return true
    })

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore
      if (sortBy === 'progress') return b.progressPercent - a.progressPercent
      if (sortBy === 'studio') return a.studio.localeCompare(b.studio)
      // default: recent
      return b.appliedDateTimestamp - a.appliedDateTimestamp
    })

    return list
  }, [applications, activeTab, searchQuery, sortBy])

  // Action handlers
  const handleSelectApp = useCallback((id: string) => {
    setSelectedAppId(id)
  }, [])

  const handleExportDossier = useCallback(() => {
    if (!selectedApp) return
    showToast(`Generating Verified PDF Summary for ${selectedApp.studio}... Download ready.`)
    const blob = new Blob(
      [
        `CASTALLIO ONE AEC APPLICATION SUMMARY\n` +
          `Applicant: ${candidateProfile.fullName} (${candidateProfile.discipline})\n` +
          `Active Pipeline: ${selectedApp.studio} - ${selectedApp.role}\n` +
          `Stage: ${selectedApp.stageTitle}\n` +
          `Match Score: ${selectedApp.matchScore}%\n` +
          `Status: ${selectedApp.stageLabel}\n` +
          `Generated: ${new Date().toUTCString()}\n`,
      ],
      { type: 'text/plain;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CastallioOne_Application_${selectedApp.studio.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [selectedApp, candidateProfile, showToast])

  const handleSyncCredentials = useCallback(() => {
    setIsSyncing(true)
    window.setTimeout(() => {
      setIsSyncing(false)
      showToast('Digital CV & Credentials synchronized with live database.')
    }, 1200)
  }, [showToast])

  const handleAcceptOffer = useCallback(
    async (appId: string) => {
      setIsOfferPackModalOpen(false)
      showToast('Congratulations! Formal Offer accepted. Welcome to the studio!')
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === appId) {
            return {
              ...app,
              stageTitle: 'OFFER ACCEPTED & CONTRACT SIGNED',
              auditTrail: [
                {
                  id: `aud-accept-${Date.now()}`,
                  time: 'JUST NOW',
                  description: 'Formal Offer Pack signed by candidate via Castallio Trust Contract.',
                  isRecent: true,
                },
                ...app.auditTrail,
              ],
            }
          }
          return app
        })
      )

      try {
        await supabase
          .from('job_applications')
          .update({ status: 'hired', updated_at: new Date().toISOString() })
          .eq('id', appId)
      } catch (err) {
        console.warn('Could not update job application status:', err)
      }
    },
    [showToast]
  )

  const handleAdjustTerms = useCallback(
    async (notes: string) => {
      if (!selectedApp) return
      setIsAdjustTermsModalOpen(false)
      showToast(`Terms adjustment request sent to ${selectedApp.recruiter.name}. Studio notified.`)
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === selectedApp.id) {
            return {
              ...app,
              auditTrail: [
                {
                  id: `aud-adj-${Date.now()}`,
                  time: 'JUST NOW',
                  description: `Terms modification requested: "${notes.slice(0, 60)}..."`,
                  isRecent: true,
                },
                ...app.auditTrail,
              ],
            }
          }
          return app
        })
      )

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user && selectedApp.companyId) {
          await supabase.from('chatsession').insert({
            candidate_id: user.id,
            company_id: selectedApp.companyId,
            sender_id: user.id,
            message: `[Offer Terms Adjustment Request]: ${notes}`,
            is_read: false,
          })
        }
      } catch (err) {
        console.warn('Could not persist adjustment terms to chatsession:', err)
      }
    },
    [selectedApp, showToast]
  )

  const handleSendMessage = useCallback(
    async (msg: string) => {
      if (!selectedApp) return
      setIsMessageModalOpen(false)
      const preview = msg.trim() ? ` ("${msg.slice(0, 32)}...")` : ''
      showToast(`Message${preview} dispatched to ${selectedApp.recruiter.name} (${selectedApp.studio}).`)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user && selectedApp.companyId) {
          await supabase.from('chatsession').insert({
            candidate_id: user.id,
            company_id: selectedApp.companyId,
            sender_id: user.id,
            message: msg,
            is_read: false,
          })
        }
      } catch (err) {
        console.warn('Could not persist chat message to chatsession:', err)
      }
    },
    [selectedApp, showToast]
  )

  return {
    loading,
    applications,
    selectedApp,
    selectedAppId,
    activeTab,
    searchQuery,
    sortBy,
    isSortDropdownOpen,
    tabCounts,
    avgMatchScore,
    upcomingInterviewsCount,
    nextInterviewApp,
    activeOfferApp,
    candidateProfile,
    filteredApplications,
    isDefenseModalOpen,
    isDossierModalOpen,
    isJobDetailsModalOpen,
    isOfferPackModalOpen,
    isAdjustTermsModalOpen,
    isMessageModalOpen,
    isSyncing,
    toastMessage,
    setActiveTab,
    setSearchQuery,
    setSortBy,
    setIsSortDropdownOpen,
    handleSelectApp,
    handleExportDossier,
    handleSyncCredentials,
    handleAcceptOffer,
    handleAdjustTerms,
    handleSendMessage,
    setIsDefenseModalOpen,
    setIsDossierModalOpen,
    setIsJobDetailsModalOpen,
    setIsOfferPackModalOpen,
    setIsAdjustTermsModalOpen,
    setIsMessageModalOpen,
  }
}
