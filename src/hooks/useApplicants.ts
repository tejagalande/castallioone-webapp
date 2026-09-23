import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type ApplicationDBStatus =
  | 'new'
  | 'in_review'
  | 'shortlisted'
  | 'scheduled'
  | 'rejected'
  | 'hired'
  | 'offered'

export type StageCategoryFilter =
  | 'all'
  | 'in_review'
  | 'shortlisted'
  | 'scheduled'
  | 'offered'
  | 'rejected'
  | 'starred'

export type SortOption = 'recent' | 'name' | 'experience' | 'match'

export interface RequisitionOption {
  id: string
  title: string
  refCode?: string
}

export interface StudentExperienceItem {
  id: string
  roleTitle: string
  organizationName: string
  contributions?: string
  startDate?: string | null
  endDate?: string | null
}

export interface ApplicantInterviewInfo {
  id: string
  interviewDate: string
  interviewTime: string
  interviewType: string
  locationType: string
  locationValue: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface ApplicantItem {
  id: string // job_applications.id
  jobId: string | null
  candidateId: string // auth.users.id / student_profile.user_id
  studentProfileId?: string
  name: string
  avatarInitials: string
  profileImageUrl?: string
  email: string
  phone: string
  role: string // applied job title
  jobLocation: string
  firmOrDept: string
  stageStatus: ApplicationDBStatus
  stageLabel: string
  isStarred: boolean
  appliedAt: string
  appliedDaysAgo: number
  appliedDateLabel: string
  lastUpdatedLabel: string
  skills: string[]
  matchScore?: number
  bio: string
  education: string
  institution: string
  discipline: string
  graduationYear: string
  candidateLocation: string
  workMode: string
  expectedCtc: string
  noticePeriod: string
  portfolioUrl?: string
  resumeFileUrl?: string
  linkedinUrl?: string
  rejectionReason?: string
  experiences: StudentExperienceItem[]
  interviews: ApplicantInterviewInfo[]
}

export interface ApplicantMetrics {
  totalCount: number
  newCount: number
  inReviewCount: number
  shortlistedCount: number
  scheduledCount: number
  offeredCount: number
  hiredCount: number
  rejectedCount: number
  starredCount: number
  activePipelineCount: number
}

export interface ScheduleInterviewPayload {
  candidateId: string
  jobApplicationId: string
  interviewDate: string
  interviewTime: string
  interviewType: 'Technical Review' | 'Portfolio Deep-Dive' | 'Cultural Fit'
  locationType: 'Video Call' | 'In-Person'
  locationValue: string
}

export interface UpcomingInterviewItem {
  id: string
  candidateId: string
  candidateName: string
  candidateRole: string
  interviewDate: string
  interviewTime: string
  interviewType: string
  locationType: string
  locationValue: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

// Fallback preview data for unauthenticated or demonstration sessions
const DEMO_APPLICANTS: ApplicantItem[] = [
  {
    id: '774448b2-26da-4ed4-8cc3-646089cc002c',
    jobId: '87b744c0-5a90-467f-9e48-1fc03caf07f2',
    candidateId: '3f383df0-5ff7-4930-b0b1-f1b376d97a84',
    name: 'Passionate Learner',
    avatarInitials: 'PL',
    email: 'student16999@gmail.com',
    phone: '8080969636',
    role: 'Junior Structural Engineer',
    jobLocation: 'Pune, Maharashtra, India',
    firmOrDept: 'Structural Engineering Studio',
    stageStatus: 'in_review',
    stageLabel: 'In Review',
    isStarred: true,
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    appliedDaysAgo: 2,
    appliedDateLabel: 'Applied 2d ago',
    lastUpdatedLabel: 'Updated today',
    skills: ['AutoCAD', 'STAAD.Pro', 'Revit Structure', 'ETABS', 'Civil 3D'],
    matchScore: 94,
    bio: 'Dedicated civil and structural engineering graduate with hands-on exposure to seismic analysis, reinforced concrete modeling, and BIM detailing.',
    education: 'B.Tech Civil Engineering',
    institution: 'Government College Of Engineering',
    discipline: 'Civil Engineering',
    graduationYear: '2025',
    candidateLocation: 'Pune, Maharashtra, India',
    workMode: 'Flexible',
    expectedCtc: '₹15,00,000 / annum',
    noticePeriod: 'Immediately',
    portfolioUrl: 'https://github.com',
    resumeFileUrl:
      'https://pmqtsplqnwexxnojeezg.supabase.co/storage/v1/object/public/profile-resume/profiles/3f383df0-5ff7-4930-b0b1-f1b376d97a84/resume_1789632371836.pdf',
    linkedinUrl: 'https://linkedin.com',
    experiences: [
      {
        id: 'exp-1',
        roleTitle: 'Graduate Engineering Trainee',
        organizationName: 'L&T Infrastructure',
        contributions: 'Assisted in structural validation and foundation layout reviews using STAAD.Pro.',
        startDate: '2024-06-01',
        endDate: '2025-01-15',
      },
    ],
    interviews: [],
  },
  {
    id: 'a6abaf30-c4f8-42e1-a7dc-ce01f1f3bff6-app',
    jobId: '87b744c0-5a90-467f-9e48-1fc03caf07f2',
    candidateId: 'ec0e83b8-c5cd-4a8a-8397-06d03893989b',
    name: 'Kashish Chhajed',
    avatarInitials: 'KC',
    email: 'kashishjain07123@gmail.com',
    phone: '8668856464',
    role: 'Junior Structural Engineer',
    jobLocation: 'Pune, Maharashtra, India',
    firmOrDept: 'Applied Structural Engineering',
    stageStatus: 'shortlisted',
    stageLabel: 'Shortlisted',
    isStarred: false,
    appliedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    appliedDaysAgo: 4,
    appliedDateLabel: 'Applied 4d ago',
    lastUpdatedLabel: 'Updated yesterday',
    skills: ['Revit Architecture', 'Tekla', 'Rhino 3D', 'BIM Coordination'],
    matchScore: 88,
    bio: 'Civil engineering professional with high aptitude in 3D BIM coordination, quantity takeoff, and structural detail drawings.',
    education: 'B.Eng Civil Engineering',
    institution: 'Sant Gadge Baba Amravati University',
    discipline: 'Civil Engineering',
    graduationYear: '2026',
    candidateLocation: 'Nagpur, Maharashtra, India',
    workMode: 'Remote',
    expectedCtc: '₹12,00,000 / annum',
    noticePeriod: 'Immediately',
    portfolioUrl: 'https://www.linkedin.com',
    resumeFileUrl:
      'https://pmqtsplqnwexxnojeezg.supabase.co/storage/v1/object/public/profile-resume/profiles/ec0e83b8-c5cd-4a8a-8397-06d03893989b/resume_1789122610513.pdf',
    linkedinUrl: 'https://www.linkedin.com',
    experiences: [],
    interviews: [
      {
        id: 'int-kc-1',
        interviewDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        interviewTime: '15:00',
        interviewType: 'Technical Review',
        locationType: 'Video Call',
        locationValue: 'https://meet.google.com/abc-defg-hij',
        status: 'scheduled',
      },
    ],
  },
]

function getInitials(name: string): string {
  if (!name) return 'CA'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getStageLabel(status: ApplicationDBStatus): string {
  switch (status) {
    case 'new':
      return 'New Application'
    case 'in_review':
      return 'In Review'
    case 'shortlisted':
      return 'Shortlisted'
    case 'scheduled':
      return 'Interview Scheduled'
    case 'offered':
      return 'Offer Extended'
    case 'hired':
      return 'Hired'
    case 'rejected':
      return 'Archived / Rejected'
    default:
      return status
  }
}

export function useApplicants(initialJobFilter?: { id?: string; title?: string } | null) {
  const [loading, setLoading] = useState<boolean>(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string>('Enterprise Studio')
  const [applicants, setApplicants] = useState<ApplicantItem[]>([])
  const [companyJobs, setCompanyJobs] = useState<RequisitionOption[]>([])
  const [selectedStage, setSelectedStage] = useState<StageCategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedRequisition, setSelectedRequisition] = useState<string>(() => {
    if (initialJobFilter?.id) return initialJobFilter.id
    if (initialJobFilter?.title) return initialJobFilter.title
    return 'all'
  })
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterviewItem[]>([])

  useEffect(() => {
    if (initialJobFilter) {
      if (initialJobFilter.id) {
        setSelectedRequisition(initialJobFilter.id)
      } else if (initialJobFilter.title) {
        setSelectedRequisition(initialJobFilter.title)
      }
    }
  }, [initialJobFilter])

  const showNotification = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }, [])

// Helper to map either RPC row or direct table join row into ApplicantItem
interface RawApplicantRow {
  id: string
  job_id: string | null
  company_id?: string | null
  candidate_id: string
  status?: string | null
  is_starred?: boolean | null
  applied_at?: string | null
  updated_at?: string | null
  rejection_reason?: string | null
  match_score?: number
  job?: {
    id?: string
    title?: string
    location?: string
    category?: string
    employment_type?: string | string[]
  } | null
  candidate?: {
    id?: string
    full_name?: string
    bio?: string
    email?: string
    phone?: number | string
    location?: string
    institution?: string
    discipline?: string
    graduation_year?: string
    portfolio_url?: string
    profile_image_url?: string
    resume_file_url?: string
    work_mode?: string
    expected_ctc?: string
    notice_period?: string
    linkedin_url?: string
    skills?: Array<string | { skill_name?: string }>
    experiences?: Array<{
      id?: string
      role_title?: string
      organization_name?: string
      contributions?: string
      start_date?: string | null
      end_date?: string | null
    }>
  } | null
  interviews?: Array<{
    id?: string
    interview_date?: string
    interview_time?: string
    interview_type?: string
    location_type?: string
    location_value?: string
    status?: 'scheduled' | 'completed' | 'cancelled'
  }> | null
}

function mapRawApplicant(
  row: RawApplicantRow,
  companyName: string
): { applicant: ApplicantItem; scheduledInterview?: UpcomingInterviewItem } {
  const student = row.candidate || {}
  const job = row.job || { title: 'General Applicant', location: 'Remote' }
  const rawSkills = student.skills || []
  const skillsList: string[] = Array.isArray(rawSkills)
    ? rawSkills
        .map((s) => {
          if (typeof s === 'string') return s
          if (typeof s === 'object' && s !== null && 'skill_name' in s) {
            return (s as { skill_name?: string }).skill_name || ''
          }
          return String(s || '')
        })
        .filter(Boolean)
    : []

  const rawExperiences = student.experiences || []
  const experiencesList: StudentExperienceItem[] = (Array.isArray(rawExperiences) ? rawExperiences : []).map(
    (exp) => ({
      id: String(exp.id || Math.random()),
      roleTitle: String(exp.role_title || 'Design Specialist'),
      organizationName: String(exp.organization_name || 'Engineering Firm'),
      contributions: String(exp.contributions || ''),
      startDate: exp.start_date || null,
      endDate: exp.end_date || null,
    })
  )

  const rawInterviews = row.interviews || []
  let scheduledInterview: UpcomingInterviewItem | undefined
  const interviewsList: ApplicantInterviewInfo[] = (Array.isArray(rawInterviews) ? rawInterviews : []).map(
    (iv) => {
      const isSched = iv.status === 'scheduled'
      if (isSched && !scheduledInterview) {
        scheduledInterview = {
          id: String(iv.id || Math.random()),
          candidateId: String(row.candidate_id),
          candidateName: String(student.full_name || 'Candidate'),
          candidateRole: String(job.title || 'Applicant'),
          interviewDate: String(iv.interview_date || ''),
          interviewTime: String(iv.interview_time || '11:00'),
          interviewType: String(iv.interview_type || 'Technical Review'),
          locationType: String(iv.location_type || 'Video Call'),
          locationValue: String(iv.location_value || ''),
          status: 'scheduled',
        }
      }
      return {
        id: String(iv.id || Math.random()),
        interviewDate: String(iv.interview_date || ''),
        interviewTime: String(iv.interview_time || ''),
        interviewType: String(iv.interview_type || 'Technical Review'),
        locationType: String(iv.location_type || 'Video Call'),
        locationValue: String(iv.location_value || ''),
        status: iv.status || 'scheduled',
      }
    }
  )

  const appliedDate = row.applied_at ? new Date(row.applied_at) : new Date()
  const daysAgo = Math.max(0, Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)))
  const daysAgoLabel = daysAgo === 0 ? 'Applied today' : `Applied ${daysAgo}d ago`
  const fullName = String(student.full_name || 'Candidate')
  const rawStatus = (row.status || 'in_review') as ApplicationDBStatus

  const appItem: ApplicantItem = {
    id: String(row.id),
    jobId: row.job_id || null,
    candidateId: String(row.candidate_id),
    studentProfileId: student.id ? String(student.id) : undefined,
    name: fullName,
    avatarInitials: getInitials(fullName),
    profileImageUrl: student.profile_image_url || undefined,
    email: student.email || '',
    phone: student.phone ? String(student.phone) : '',
    role: String(job.title || 'Open Position Applicant'),
    jobLocation: String(job.location || 'Remote'),
    firmOrDept: companyName || 'Enterprise Studio',
    stageStatus: rawStatus,
    stageLabel: getStageLabel(rawStatus),
    isStarred: Boolean(row.is_starred),
    appliedAt: row.applied_at || new Date().toISOString(),
    appliedDaysAgo: daysAgo,
    appliedDateLabel: daysAgoLabel,
    lastUpdatedLabel: row.updated_at ? `Updated ${new Date(row.updated_at).toLocaleDateString()}` : 'Active',
    skills: skillsList.length > 0 ? skillsList : ['Civil & Structural Engineering', 'AutoCAD'],
    matchScore: row.match_score ?? (80 + (skillsList.length % 15)),
    bio: student.bio || 'Candidate registered on Castallio One talent platform.',
    education: student.graduation_year ? `Graduation Class ${student.graduation_year}` : 'Graduate',
    institution: student.institution || 'Engineering Institute',
    discipline: student.discipline || 'AEC Specialist',
    graduationYear: student.graduation_year || '2025',
    candidateLocation: student.location || 'India',
    workMode: student.work_mode || 'Flexible',
    expectedCtc: student.expected_ctc ? `₹${student.expected_ctc}` : 'Open to negotiate',
    noticePeriod: student.notice_period || 'Immediately',
    portfolioUrl: student.portfolio_url || undefined,
    resumeFileUrl: student.resume_file_url || undefined,
    linkedinUrl: student.linkedin_url || undefined,
    rejectionReason: row.rejection_reason || undefined,
    experiences: experiencesList,
    interviews: interviewsList,
  }

  return { applicant: appItem, scheduledInterview }
}

  // Fetch full applicant data via remote PostgreSQL database (RPC with direct table join fallback)
  const fetchApplicantsData = useCallback(async () => {
    try {
      setLoading(true)

      const { data: userData, error: userError } = await supabase.auth.getUser()
      const user = userData?.user

      // If user is unauthenticated, fallback to demonstration preview applicants
      if (!user || userError) {
        setApplicants(DEMO_APPLICANTS)
        setUpcomingInterviews([
          {
            id: 'int-demo-1',
            candidateId: 'ec0e83b8-c5cd-4a8a-8397-06d03893989b',
            candidateName: 'Kashish Chhajed',
            candidateRole: 'Junior Structural Engineer',
            interviewDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            interviewTime: '15:00',
            interviewType: 'Technical Review',
            locationType: 'Video Call',
            locationValue: 'https://meet.google.com/abc-defg-hij',
            status: 'scheduled',
          },
        ])
        setLoading(false)
        return
      }

      // 1. Resolve company by owner_id or user.id
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name')
        .or(`owner_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle()

      const cId = companyData?.id || null
      const cName = companyData?.name || 'Enterprise Studio'
      setCompanyId(cId)
      setCompanyName(cName)

      // 2. Fetch jobs posted by this company or user
      let jobsQuery = supabase
        .from('create_job_post')
        .select('id, title, location, category, employment_type')
        .order('created_at', { ascending: false })

      if (cId) {
        jobsQuery = jobsQuery.or(`company_id.eq.${cId},posted_by.eq.${user.id}`)
      } else {
        jobsQuery = jobsQuery.eq('posted_by', user.id)
      }

      const { data: rawJobs } = await jobsQuery
      const jobsList = rawJobs || []
      const jobIds = jobsList.map((j) => j.id)

      if (jobsList.length > 0) {
        setCompanyJobs(jobsList.map((j) => ({ id: j.id, title: j.title })))
      }

      // 3. First attempt: Query via remote RPC function web_get_company_applicants
      let rawApplicantRows: RawApplicantRow[] = []
      let rpcSucceeded = false

      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('web_get_company_applicants', {
          p_company_id: cId || null,
        })

        if (!rpcError && rpcData && Array.isArray((rpcData as { applicants?: RawApplicantRow[] }).applicants)) {
          const rpcApps = (rpcData as { applicants: RawApplicantRow[] }).applicants
          if (rpcApps.length > 0) {
            rawApplicantRows = rpcApps
            rpcSucceeded = true
          }
        } else if (rpcError) {
          console.warn('RPC web_get_company_applicants notice:', rpcError.message)
        }
      } catch (rpcErr) {
        console.warn('RPC web_get_company_applicants execution failed, switching to direct SQL tables query:', rpcErr)
      }

      // 4. Second attempt: Direct SQL Query against job_applications and relational tables
      if (!rpcSucceeded || rawApplicantRows.length === 0) {
        let appsQuery = supabase
          .from('job_applications')
          .select('*')
          .order('applied_at', { ascending: false })

        if (cId && jobIds.length > 0) {
          appsQuery = appsQuery.or(`company_id.eq.${cId},job_id.in.(${jobIds.join(',')})`)
        } else if (cId) {
          appsQuery = appsQuery.eq('company_id', cId)
        } else if (jobIds.length > 0) {
          appsQuery = appsQuery.in('job_id', jobIds)
        }

        const { data: dbApps, error: dbAppsErr } = await appsQuery

        if (!dbAppsErr && dbApps && Array.isArray(dbApps) && dbApps.length > 0) {
          const candidateIds = Array.from(new Set(dbApps.map((a) => a.candidate_id).filter(Boolean)))
          const candidatesMap: Record<string, any> = {}
          const skillsMap: Record<string, any[]> = {}
          const expsMap: Record<string, any[]> = {}

          if (candidateIds.length > 0) {
            // Query student_profile
            const { data: students } = await supabase
              .from('student_profile')
              .select('*')
              .or(`user_id.in.(${candidateIds.join(',')}),id.in.(${candidateIds.join(',')})`)

            if (students && Array.isArray(students)) {
              const studentProfileIds: string[] = []
              students.forEach((st) => {
                if (st.user_id) candidatesMap[st.user_id] = st
                if (st.id) {
                  candidatesMap[st.id] = st
                  studentProfileIds.push(st.id)
                }
              })

              const profileIds = Array.from(new Set([...studentProfileIds, ...candidateIds]))

              // Query skills
              if (profileIds.length > 0) {
                const { data: skillsData } = await supabase
                  .from('student_skills')
                  .select('*')
                  .in('student_id', profileIds)

                if (skillsData && Array.isArray(skillsData)) {
                  skillsData.forEach((sk) => {
                    skillsMap[sk.student_id] = sk.skills || []
                  })
                }

                // Query experiences
                const { data: expsData } = await supabase
                  .from('student_experience')
                  .select('*')
                  .in('student_id', profileIds)
                  .order('start_date', { ascending: false })

                if (expsData && Array.isArray(expsData)) {
                  expsData.forEach((exp) => {
                    if (!expsMap[exp.student_id]) expsMap[exp.student_id] = []
                    expsMap[exp.student_id].push(exp)
                  })
                }
              }
            }
          }

          // Query interviews
          const appIds = dbApps.map((a) => a.id)
          const ivsMap: Record<string, any[]> = {}
          if (appIds.length > 0) {
            const { data: ivsData } = await supabase
              .from('interviews')
              .select('*')
              .in('job_application_id', appIds)

            if (ivsData && Array.isArray(ivsData)) {
              ivsData.forEach((iv) => {
                if (!ivsMap[iv.job_application_id]) ivsMap[iv.job_application_id] = []
                ivsMap[iv.job_application_id].push(iv)
              })
            }
          }

          const jobsMap: Record<string, any> = {}
          jobsList.forEach((j) => {
            jobsMap[j.id] = j
          })

          rawApplicantRows = dbApps.map((app) => {
            const st = candidatesMap[app.candidate_id] || {}
            const j = jobsMap[app.job_id] || { title: 'General Applicant', location: 'Remote' }
            const sk = skillsMap[st.id] || skillsMap[app.candidate_id] || []
            const ex = expsMap[st.id] || expsMap[app.candidate_id] || []
            const iv = ivsMap[app.id] || []

            return {
              id: app.id,
              job_id: app.job_id,
              company_id: app.company_id || cId,
              candidate_id: app.candidate_id,
              status: app.status || 'in_review',
              is_starred: app.is_starred || false,
              applied_at: app.applied_at,
              updated_at: app.updated_at,
              rejection_reason: app.rejection_reason,
              job: j,
              candidate: {
                ...st,
                skills: sk,
                experiences: ex,
              },
              interviews: iv,
            }
          })
        }
      }

      // Map raw rows to ApplicantItem
      const upcomingList: UpcomingInterviewItem[] = []
      const mappedApplicants: ApplicantItem[] = rawApplicantRows.map((row) => {
        const { applicant, scheduledInterview } = mapRawApplicant(row, cName)
        if (scheduledInterview) {
          upcomingList.push(scheduledInterview)
        }
        return applicant
      })

      setUpcomingInterviews(upcomingList)
      setApplicants(mappedApplicants)
    } catch (err) {
      console.error('Fatal error during applicants fetch:', err)
      // Never silently mask errors with fake applicants if user is authenticated
      setApplicants([])
      setUpcomingInterviews([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchApplicantsData()
  }, [fetchApplicantsData])

  // Real-time Mutation: Update application status in PostgreSQL
  const updateApplicationStatus = useCallback(
    async (applicationId: string, newStatus: ApplicationDBStatus, reason?: string) => {
      // Optimistic state update
      setApplicants((prev) =>
        prev.map((app) => {
          if (app.id !== applicationId) return app
          return {
            ...app,
            stageStatus: newStatus,
            stageLabel: getStageLabel(newStatus),
            rejectionReason: reason || app.rejectionReason,
            lastUpdatedLabel: 'Updated just now',
          }
        })
      )

      if (selectedApplicant && selectedApplicant.id === applicationId) {
        setSelectedApplicant((prev) =>
          prev
            ? {
                ...prev,
                stageStatus: newStatus,
                stageLabel: getStageLabel(newStatus),
                rejectionReason: reason || prev.rejectionReason,
                lastUpdatedLabel: 'Updated just now',
              }
            : null
        )
      }

      try {
        const payload: Record<string, unknown> = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        }
        if (reason) {
          payload.rejection_reason = reason
        }

        const { error } = await supabase
          .from('job_applications')
          .update(payload)
          .eq('id', applicationId)

        if (error) {
          console.error('Error updating application status in Supabase:', error.message)
          showNotification(`Failed to sync stage update: ${error.message}`)
        } else {
          showNotification(`Application status updated to "${getStageLabel(newStatus)}".`)
        }
      } catch (err) {
        console.error('Error performing status update:', err)
      }
    },
    [selectedApplicant, showNotification]
  )

  // Real-time Mutation: Toggle star / bookmark in PostgreSQL
  const toggleStarApplicant = useCallback(
    async (applicationId: string) => {
      const current = applicants.find((a) => a.id === applicationId)
      if (!current) return
      const nextStarred = !current.isStarred

      // Optimistic update
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, isStarred: nextStarred } : app))
      )

      if (selectedApplicant && selectedApplicant.id === applicationId) {
        setSelectedApplicant((prev) => (prev ? { ...prev, isStarred: nextStarred } : null))
      }

      try {
        const { error } = await supabase
          .from('job_applications')
          .update({ is_starred: nextStarred, updated_at: new Date().toISOString() })
          .eq('id', applicationId)

        if (error) {
          console.error('Error toggling star in Supabase:', error.message)
        } else {
          showNotification(nextStarred ? 'Candidate added to Starred Talent.' : 'Candidate removed from Starred.')
        }
      } catch (err) {
        console.error('Error in toggleStarApplicant:', err)
      }
    },
    [applicants, selectedApplicant, showNotification]
  )

  // Real-time Mutation: Schedule an Interview in PostgreSQL
  const scheduleInterview = useCallback(
    async (payload: ScheduleInterviewPayload) => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) {
          showNotification('Authentication required to schedule interview.')
          return false
        }

        const { data: inserted, error } = await supabase
          .from('interviews')
          .insert({
            candidate_id: payload.candidateId,
            company_id: companyId,
            job_application_id: payload.jobApplicationId,
            interview_date: payload.interviewDate,
            interview_time: payload.interviewTime,
            interview_type: payload.interviewType,
            location_type: payload.locationType,
            location_value: payload.locationValue,
            status: 'scheduled',
          })
          .select()
          .single()

        if (error) {
          console.error('Error scheduling interview in Supabase:', error.message)
          showNotification(`Interview schedule error: ${error.message}`)
          return false
        }

        // Also update application status to 'scheduled'
        await updateApplicationStatus(payload.jobApplicationId, 'scheduled')

        // Refresh interviews list
        const candidate = applicants.find((a) => a.id === payload.jobApplicationId)
        if (inserted) {
          setUpcomingInterviews((prev) => [
            ...prev,
            {
              id: inserted.id,
              candidateId: payload.candidateId,
              candidateName: candidate?.name || 'Candidate',
              candidateRole: candidate?.role || 'Applicant',
              interviewDate: payload.interviewDate,
              interviewTime: payload.interviewTime,
              interviewType: payload.interviewType,
              locationType: payload.locationType,
              locationValue: payload.locationValue,
              status: 'scheduled',
            },
          ])
        }

        showNotification(`Interview confirmed for ${payload.interviewDate} at ${payload.interviewTime}.`)
        return true
      } catch (err) {
        console.error('Failed to schedule interview:', err)
        return false
      }
    },
    [companyId, applicants, updateApplicationStatus, showNotification]
  )

  // Real-time Mutation: Dispatch direct message via chatsession
  const sendCandidateMessage = useCallback(
    async (candidateId: string, message: string) => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const senderId = userData?.user?.id

        if (!senderId) {
          showNotification('Message simulated (session unauthenticated).')
          return true
        }

        const { error } = await supabase.from('chatsession').insert({
          candidate_id: candidateId,
          company_id: companyId,
          sender_id: senderId,
          message: message.trim(),
          is_read: false,
          is_deleted: false,
        })

        if (error) {
          console.error('Error inserting message into chatsession:', error.message)
          showNotification(`Direct dispatch notice: ${error.message}`)
          return false
        }

        showNotification('Direct message dispatched securely to candidate.')
        return true
      } catch (err) {
        console.error('Failed to dispatch message:', err)
        return false
      }
    },
    [companyId, showNotification]
  )

  // Derived unique job options from company jobs and applicants
  const availableRequisitions: RequisitionOption[] = useMemo(() => {
    const list: RequisitionOption[] = [...companyJobs]
    applicants.forEach((a) => {
      const exists = list.some(
        (item) => (a.jobId && item.id === a.jobId) || item.title.toLowerCase() === a.role.toLowerCase()
      )
      if (!exists && a.role) {
        list.push({ id: a.jobId || a.role, title: a.role })
      }
    })
    return list
  }, [companyJobs, applicants])

  // Filter and Sort Pipeline
  const filteredApplicants = useMemo(() => {
    return applicants
      .filter((app) => {
        // Stage filter
        if (selectedStage === 'in_review') {
          if (app.stageStatus !== 'new' && app.stageStatus !== 'in_review') return false
        } else if (selectedStage === 'shortlisted') {
          if (app.stageStatus !== 'shortlisted') return false
        } else if (selectedStage === 'scheduled') {
          if (app.stageStatus !== 'scheduled') return false
        } else if (selectedStage === 'offered') {
          if (app.stageStatus !== 'offered' && app.stageStatus !== 'hired') return false
        } else if (selectedStage === 'rejected') {
          if (app.stageStatus !== 'rejected') return false
        } else if (selectedStage === 'starred') {
          if (!app.isStarred) return false
        }

        // Job filter (matches by Job ID or by Job Title / Role)
        if (selectedRequisition !== 'all') {
          const sel = selectedRequisition.toLowerCase().trim()
          const matchJobId = app.jobId ? app.jobId.toLowerCase() === sel : false
          const appRole = app.role ? app.role.toLowerCase().trim() : ''
          const matchRoleExact = appRole === sel
          const matchRolePartial = appRole.includes(sel) || sel.includes(appRole)

          // Check if selectedRequisition matches an availableRequisition item
          const matchedOpt = availableRequisitions.find(
            (opt) => opt.id.toLowerCase() === sel || opt.title.toLowerCase().trim() === sel
          )
          const matchViaOpt = matchedOpt
            ? (app.jobId && app.jobId.toLowerCase() === matchedOpt.id.toLowerCase()) ||
              (appRole && (appRole === matchedOpt.title.toLowerCase().trim() ||
                appRole.includes(matchedOpt.title.toLowerCase().trim()) ||
                matchedOpt.title.toLowerCase().trim().includes(appRole)))
            : false

          if (!matchJobId && !matchRoleExact && !matchRolePartial && !matchViaOpt) {
            return false
          }
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchesName = app.name.toLowerCase().includes(q)
          const matchesRole = app.role.toLowerCase().includes(q)
          const matchesDiscipline = app.discipline.toLowerCase().includes(q)
          const matchesInstitution = app.institution.toLowerCase().includes(q)
          const matchesLocation = app.candidateLocation.toLowerCase().includes(q)
          const matchesSkills = app.skills.some((s) => s.toLowerCase().includes(q))
          if (!matchesName && !matchesRole && !matchesDiscipline && !matchesInstitution && !matchesLocation && !matchesSkills) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'experience') return b.skills.length - a.skills.length
        if (sortBy === 'match') return (b.matchScore ?? 0) - (a.matchScore ?? 0)
        // Default 'recent'
        return a.appliedDaysAgo - b.appliedDaysAgo
      })
  }, [applicants, selectedStage, selectedRequisition, searchQuery, sortBy])

  // Real Aggregate Metrics
  const metrics: ApplicantMetrics = useMemo(() => {
    const total = applicants.length
    const newCount = applicants.filter((a) => a.stageStatus === 'new').length
    const inReviewCount = applicants.filter((a) => a.stageStatus === 'in_review').length
    const shortlistedCount = applicants.filter((a) => a.stageStatus === 'shortlisted').length
    const scheduledCount = applicants.filter((a) => a.stageStatus === 'scheduled').length
    const offeredCount = applicants.filter((a) => a.stageStatus === 'offered').length
    const hiredCount = applicants.filter((a) => a.stageStatus === 'hired').length
    const rejectedCount = applicants.filter((a) => a.stageStatus === 'rejected').length
    const starredCount = applicants.filter((a) => a.isStarred).length

    return {
      totalCount: total,
      newCount,
      inReviewCount: inReviewCount + newCount,
      shortlistedCount,
      scheduledCount,
      offeredCount,
      hiredCount,
      rejectedCount,
      starredCount,
      activePipelineCount: inReviewCount + newCount + shortlistedCount + scheduledCount + offeredCount,
    }
  }, [applicants])

  // Export CSV Dossier
  const exportDossierCSV = useCallback(() => {
    const headers = [
      'Candidate Name',
      'Applied Position',
      'Discipline',
      'Institution',
      'Status',
      'Location',
      'Work Mode',
      'Expected CTC',
      'Notice Period',
      'Resume URL',
    ]

    const rows = filteredApplicants.map((app) => [
      `"${app.name}"`,
      `"${app.role}"`,
      `"${app.discipline}"`,
      `"${app.institution}"`,
      `"${app.stageLabel}"`,
      `"${app.candidateLocation}"`,
      `"${app.workMode}"`,
      `"${app.expectedCtc}"`,
      `"${app.noticePeriod}"`,
      `"${app.resumeFileUrl || ''}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `Castallio_Applicants_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification('Export complete: Applicants list downloaded.')
  }, [filteredApplicants, showNotification])

  return {
    loading,
    companyId,
    companyName,
    applicants,
    filteredApplicants,
    selectedStage,
    setSelectedStage,
    searchQuery,
    setSearchQuery,
    selectedRequisition,
    setSelectedRequisition,
    availableRequisitions,
    sortBy,
    setSortBy,
    metrics,
    selectedApplicant,
    setSelectedApplicant,
    toastMessage,
    upcomingInterviews,
    updateApplicationStatus,
    toggleStarApplicant,
    scheduleInterview,
    sendCandidateMessage,
    exportDossierCSV,
    refreshApplicants: fetchApplicantsData,
    showNotification,
  }
}
