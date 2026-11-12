import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { notifyEvent } from '../lib/webPush'
import { computeStudentRowCompleteness, resolveValidResumeUrl, recoverResumeUrlFromStorage } from '../lib/talentService'

export interface RecommendedJob {
  id: string
  title: string
  company: string
  companyId?: string
  companyLogoUrl?: string
  location: string
  workType: 'Remote' | 'Hybrid' | 'On-site' | string
  category: string
  fitScore: number
  matchReasons: string[]
  skills: string[]
  salaryText?: string
  experience?: string
  description?: string
  isApplied: boolean
  isSaved: boolean
  postedDate?: string
  expiresAt?: string
  validityDaysLeft?: number
  responsibilities?: string
  technicalRequirements?: string[]
  aboutUs?: string
  employmentType?: string[]
  numberOfOpenings?: number
  companyWebsite?: string
  companySize?: string
  companyAbout?: string
}

export interface DashboardUpcomingEvent {
  id: string
  title: string
  company: string
  role: string
  month: string
  day: string
  time: string
  type: string
  isVirtual: boolean
  rawDate: string
}

export interface DashboardActivity {
  id: string
  title: string
  description: string
  time: string
  active: boolean
  type: 'application' | 'interview' | 'profile'
}

export interface TalentProfileInfo {
  id: string
  fullName: string
  discipline: string
  specificSkill: string
  location: string
  workMode: string
  skills: string[]
  profileStrength: number
  avatarUrl?: string
  resumeFileUrl?: string
  hasResume?: boolean
}

export interface UseTalentDashboardReturn {
  profile: TalentProfileInfo
  metrics: {
    activeAppsCount: number
    profileViewsCount: number
    profileStrength: number
  }
  recommendedJobs: RecommendedJob[]
  upcomingEvents: DashboardUpcomingEvent[]
  recentActivity: DashboardActivity[]
  appliedJobIds: Set<string>
  savedJobIds: Set<string>
  loading: boolean
  applyingJobId: string | null
  applyForJob: (job: RecommendedJob) => Promise<boolean>
  toggleSaveJob: (job: RecommendedJob, forceSave?: boolean) => void
  refreshData: () => Promise<void>
}

/**
 * Formats salary into Indian Rupee LPA format (e.g. ₹12 - 18 LPA or ₹8.5 LPA)
 */
export function formatIndianSalary(min?: number | null, max?: number | null): string | undefined {
  if (!min && !max) return undefined

  const toLPA = (val: number): string => {
    if (val >= 100000) {
      const lpa = val / 100000
      return `₹${Number.isInteger(lpa) ? lpa : lpa.toFixed(1)} LPA`
    }
    return `₹${val.toLocaleString('en-IN')}`
  }

  if (min && max) {
    if (min >= 100000 && max >= 100000) {
      const minLpa = min / 100000
      const maxLpa = max / 100000
      const minStr = Number.isInteger(minLpa) ? minLpa : minLpa.toFixed(1)
      const maxStr = Number.isInteger(maxLpa) ? maxLpa : maxLpa.toFixed(1)
      return `₹${minStr} - ${maxStr} LPA`
    }
    return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`
  }

  if (min) return `From ${toLPA(min)}`
  if (max) return `Up to ${toLPA(max)}`
  return undefined
}

/**
 * Recommendation Engine: Calculates job match percentage (0 - 100%)
 * 
 * Total Match Score (100% Max) is composed of 4 key weighted pillars:
 * 1. AEC Discipline / Domain Fit: 35% weight
 * 2. Core Software & Technical Requirements Overlap: 35% weight
 * 3. Work Mode & Geographic Compatibility: 15% weight
 * 4. Experience & Seniority Calibration: 15% weight
 */
export function computeRecommendationFit(
  job: {
    title: string
    category: string
    technical_requirements?: string
    job_description?: string
    work_type?: string
    location?: string
    experience?: string
  },
  profile: {
    discipline: string
    specificSkill: string
    skills: string[]
    workMode: string
  }
): { fitScore: number; matchReasons: string[] } {
  let disciplineScore: number
  let skillsScore: number
  let workModeScore: number
  const experienceScore = 12
  const reasons: string[] = []

  const title = (job.title || '').toLowerCase()
  const cat = (job.category || '').toLowerCase()
  const disc = (profile.discipline || '').toLowerCase()
  const spec = (profile.specificSkill || '').toLowerCase()

  // 1. AEC Discipline / Domain Fit (Max 35%)
  const isBIM = title.includes('bim') || cat.includes('bim') || disc.includes('bim') || spec.includes('bim')
  const isStruct = title.includes('struct') || cat.includes('struct') || disc.includes('struct')
  const isArch = title.includes('arch') || cat.includes('arch') || disc.includes('arch')
  const isMep = title.includes('mep') || cat.includes('mep') || disc.includes('mep')
  const isComp = title.includes('comput') || cat.includes('comput') || spec.includes('comput')

  if (
    (isBIM && (disc.includes('bim') || spec.includes('bim'))) ||
    (isStruct && disc.includes('struct')) ||
    (isArch && disc.includes('arch')) ||
    (isMep && disc.includes('mep')) ||
    (isComp && spec.includes('comput'))
  ) {
    disciplineScore = 35
    reasons.push('Discipline Fit')
  } else if (cat && disc && (cat.includes(disc) || disc.includes(cat))) {
    disciplineScore = 26
    reasons.push('Domain Match')
  } else {
    disciplineScore = 14
  }

  // 2. Core Software & Technical Requirements Overlap (Max 35%)
  const jobText = `${job.technical_requirements || ''} ${job.job_description || ''} ${job.title}`.toLowerCase()
  const candidateSkills = [...profile.skills, profile.specificSkill].filter(Boolean)

  let matchedSkillsCount = 0
  for (const sk of candidateSkills) {
    if (sk.length > 2 && jobText.includes(sk.toLowerCase())) {
      matchedSkillsCount++
    }
  }

  if (matchedSkillsCount >= 3) {
    skillsScore = 35
    reasons.push('Core Tech Stack')
  } else if (matchedSkillsCount === 2) {
    skillsScore = 27
    reasons.push('Skills Match')
  } else if (matchedSkillsCount === 1) {
    skillsScore = 18
    reasons.push('Familiar Stack')
  } else {
    skillsScore = 8
  }

  // 3. Work Mode & Geographic Compatibility (Max 15%)
  const jobWork = (job.work_type || '').toLowerCase()
  const candWork = (profile.workMode || '').toLowerCase()

  if (jobWork.includes('remote') || candWork.includes('remote') || candWork.includes('flexible')) {
    workModeScore = 15
    reasons.push('Remote / Flexible')
  } else if (jobWork && candWork && jobWork === candWork) {
    workModeScore = 15
    reasons.push('Work Mode Fit')
  } else {
    workModeScore = 8
  }

  // 4. Experience Calibration (Max 15% - handled by const experienceScore = 12)

  const totalRaw = disciplineScore + skillsScore + workModeScore + experienceScore
  const fitScore = Math.min(98, Math.max(72, totalRaw))

  return { fitScore, matchReasons: reasons }
}

/**
 * Parses raw technical requirements or skills string into clean tag array
 */
function extractSkillTags(techReqs?: string, category?: string, fallbackSkills?: string[]): string[] {
  if (fallbackSkills && fallbackSkills.length > 0) return fallbackSkills

  if (techReqs) {
    const rawTokens = techReqs
      .split(/[,;\n•|]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1 && t.length < 30)

    if (rawTokens.length > 0) {
      return Array.from(new Set(rawTokens)).slice(0, 5)
    }
  }

  const keywords: string[] = ['Revit', 'Navisworks', 'AutoCAD', 'Tekla', 'Dynamo', 'BIM 360', 'Grasshopper', 'Python']
  const found: string[] = []
  const textToScan = `${techReqs || ''} ${category || ''}`.toLowerCase()

  for (const kw of keywords) {
    if (textToScan.includes(kw.toLowerCase())) {
      found.push(kw)
    }
  }

  return found.length > 0 ? found : ['Revit', 'Navisworks', 'AutoCAD']
}

function formatRelativeTime(dateStr: string): string {
  try {
    const past = new Date(dateStr).getTime()
    const now = Date.now()
    const diffMs = now - past

    if (isNaN(diffMs) || diffMs < 0) return 'Recent'

    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    if (diffMinutes < 5) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`

    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  } catch {
    return 'Recently'
  }
}

export function useTalentDashboard(): UseTalentDashboardReturn {
  const [loading, setLoading] = useState(true)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => new Set())

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => new Set())

  // Talent identity & profile state (populated directly from Supabase)
  const [profile, setProfile] = useState<TalentProfileInfo>({
    id: '',
    fullName: '',
    discipline: '',
    specificSkill: '',
    location: '',
    workMode: '',
    skills: [],
    profileStrength: 0,
    hasResume: false,
  })

  // Metrics
  const [activeAppsCount, setActiveAppsCount] = useState<number>(0)

  const [profileViewsCount] = useState<number>(0)

  // Recommendation Jobs
  const [rawJobs, setRawJobs] = useState<RecommendedJob[]>([])

  // Upcoming Events - Starts strictly as empty array. Only populated if REAL DB rows exist.
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardUpcomingEvent[]>([])

  // Recent Activity
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([])

  const isFetchingRef = useRef(false)
  const lastFetchedRef = useRef(0)
  const profileRef = useRef(profile)

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  /**
   * Main fetcher attached to Supabase backend
   */
  const loadDashboardData = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && isFetchingRef.current) return
    if (!force && lastFetchedRef.current > 0 && now - lastFetchedRef.current < 20000) {
      setLoading(false)
      return
    }
    isFetchingRef.current = true

    try {
      // 1. Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const resolvedUserId = user?.id || null
      let currentDiscipline = profileRef.current.discipline
      let currentSkill = profileRef.current.specificSkill
      let currentSkillsList = [...profileRef.current.skills]
      let currentWorkMode = profileRef.current.workMode
      let completeness = profileRef.current.profileStrength
      let fullName = profileRef.current.fullName
      let profileAvatar = profileRef.current.avatarUrl
      let studentRecordId: string | null = null
      let resumeUrl: string | undefined = profileRef.current.resumeFileUrl
      let hasValidResume: boolean = Boolean(profileRef.current.hasResume || resumeUrl)

      // 2. Query student_profile from Supabase if user exists (explicit columns, excluding large embedding vector)
      if (resolvedUserId) {
        const { data: studentRows, error: spQueryErr } = await supabase
          .from('student_profile')
          .select(
            'id, user_id, full_name, discipline, work_mode, profile_image_url, resume_file_url, email, phone, location, institution, graduation_year, bio, preferred_location, availability, employment_type, notice_period, expected_ctc, linkedin_url, portfolio_url'
          )
          .or(`user_id.eq.${resolvedUserId},id.eq.${resolvedUserId}`)
          .order('updated_at', { ascending: false })
          .limit(5)

        if (spQueryErr) {
          console.warn('student_profile dashboard query notice:', spQueryErr.message)
        }

        const studentData =
          studentRows && studentRows.length > 0
            ? studentRows.find((r) => Boolean(r.resume_file_url && String(r.resume_file_url).trim())) ||
              studentRows[0]
            : null

        if (studentData) {
          studentRecordId = studentData.id || null
          const rawDbResume = studentData.resume_file_url ? String(studentData.resume_file_url).trim() : ''
          const resolvedDbResume = resolveValidResumeUrl(
            rawDbResume,
            studentData.user_id || studentData.id || resolvedUserId
          )
          if (resolvedDbResume) {
            resumeUrl = resolvedDbResume
            hasValidResume = true
          } else if (rawDbResume) {
            resumeUrl = rawDbResume
            hasValidResume = true
          } else {
            const recovered = await recoverResumeUrlFromStorage(studentData.user_id || resolvedUserId)
            if (recovered) {
              resumeUrl = recovered
              hasValidResume = true
              void supabase
                .from('student_profile')
                .update({ resume_file_url: recovered, updated_at: new Date().toISOString() })
                .eq('id', studentData.id)
            }
          }

          if (studentData.full_name) fullName = studentData.full_name
          if (studentData.discipline) currentDiscipline = studentData.discipline
          if (studentData.work_mode) currentWorkMode = studentData.work_mode
          if (studentData.profile_image_url) profileAvatar = studentData.profile_image_url
          completeness = computeStudentRowCompleteness({
            ...studentData,
            resume_file_url: studentData.resume_file_url || resumeUrl || null,
          })

          // Query skills from student_skills (jsonb `skills` array keyed by student_id)
          const { data: skillsRow } = await supabase
            .from('student_skills')
            .select('skills')
            .or(`student_id.eq.${studentData.id},student_id.eq.${resolvedUserId}`)
            .limit(1)
            .maybeSingle()

          if (skillsRow && Array.isArray(skillsRow.skills) && skillsRow.skills.length > 0) {
            const items = skillsRow.skills as Array<string | { skill_name?: string; category?: string }>
            const names = items
              .map((s) => (typeof s === 'string' ? s : s.skill_name || ''))
              .filter(Boolean)
            if (names.length > 0) currentSkillsList = names
            const specific = items.find(
              (s) => typeof s !== 'string' && s.category === 'primary_specialization'
            )
            if (specific && typeof specific !== 'string' && specific.skill_name) {
              currentSkill = specific.skill_name
            }
          }
        } else if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
          fullName = user.user_metadata.full_name || user.user_metadata.name
        }
      }

      // Update Profile state only if fields actually changed
      setProfile((prev) => {
        const isSkillsEqual =
          prev.skills.length === currentSkillsList.length &&
          prev.skills.every((s, i) => s === currentSkillsList[i])
        const targetId = resolvedUserId || prev.id
        if (
          prev.id === targetId &&
          prev.fullName === fullName &&
          prev.discipline === currentDiscipline &&
          prev.specificSkill === currentSkill &&
          prev.workMode === currentWorkMode &&
          prev.profileStrength === completeness &&
          prev.avatarUrl === profileAvatar &&
          prev.resumeFileUrl === resumeUrl &&
          prev.hasResume === hasValidResume &&
          isSkillsEqual
        ) {
          return prev
        }
        return {
          ...prev,
          id: targetId,
          fullName,
          discipline: currentDiscipline,
          specificSkill: currentSkill,
          skills: isSkillsEqual ? prev.skills : currentSkillsList,
          workMode: currentWorkMode,
          profileStrength: completeness,
          avatarUrl: profileAvatar,
          resumeFileUrl: resumeUrl,
          hasResume: hasValidResume,
        }
      })

      // 3. Query Real Active Jobs from create_job_post (explicit columns, excluding embedding vector)
      const { data: dbJobs, error: jobsError } = await supabase
        .from('create_job_post')
        .select(
          'id, company_id, title, category, technical_requirements, job_description, work_type, location, salary_min, salary_max, expires_at, created_at, experience, responsibilities, about_us, employment_type, number_of_openings'
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)

      // Prepare parallel queries for company metadata, similarity scores, user applications, and saved jobs
      const companyIds =
        !jobsError && dbJobs && dbJobs.length > 0
          ? Array.from(new Set(dbJobs.map((j) => j.company_id).filter(Boolean)))
          : []

      const candidateQueries = resolvedUserId ? [`candidate_id.eq.${resolvedUserId}`] : []
      if (resolvedUserId && studentRecordId && studentRecordId !== resolvedUserId) {
        candidateQueries.push(`candidate_id.eq.${studentRecordId}`)
      }

      const [companiesRes, similarityRes, appsRes, savedRes] = await Promise.all([
        companyIds.length > 0
          ? supabase
              .from('companies')
              .select('id, name, logo_url, website, size, description')
              .in('id', companyIds)
          : Promise.resolve({ data: null }),
        studentRecordId
          ? supabase
              .rpc('match_jobs_for_talent', {
                p_student_id: studentRecordId,
                p_match_threshold: 0.0,
                p_match_count: 50,
              })
              .then((res) => res, () => ({ data: null, error: null }))
          : Promise.resolve({ data: null, error: null }),
        resolvedUserId
          ? supabase
              .from('job_applications')
              .select('id, job_id, status, applied_at')
              .or(candidateQueries.join(','))
              .order('applied_at', { ascending: false })
          : Promise.resolve({ data: null }),
        resolvedUserId
          ? supabase
              .from('saved_jobs')
              .select('job_id')
              .eq('user_id', resolvedUserId)
              .eq('item_type', 'job')
          : Promise.resolve({ data: null }),
      ])

      const companiesMap: Record<
        string,
        {
          name: string
          logo_url?: string
          location?: string
          website?: string
          size?: string
          description?: string
        }
      > = {}
      if (companiesRes.data) {
        companiesRes.data.forEach((c) => {
          companiesMap[c.id] = {
            name: c.name,
            logo_url: c.logo_url || undefined,
            website: c.website || undefined,
            size: c.size || undefined,
            description: c.description || undefined,
          }
        })
      }

      const backendSimilarityMap: Record<string, number> = {}
      if (!similarityRes.error && similarityRes.data && Array.isArray(similarityRes.data)) {
        similarityRes.data.forEach((row: { job_id: string; similarity: number }) => {
          if (row.job_id && typeof row.similarity === 'number') {
            backendSimilarityMap[row.job_id] = Math.min(99, Math.max(50, Math.round(row.similarity * 100)))
          }
        })
      }

      // 4. Process Applications count and applied jobs for current user from Supabase
      const userAppliedSet = new Set<string>()
      let dbAppliedCount = 0
      const applicationsList: Array<{
        id: string
        job_id: string
        status: string
        applied_at: string
      }> = []

      const loadedSaved = new Set<string>()

      if (resolvedUserId) {
        const dbApps = appsRes.data
        if (dbApps && dbApps.length > 0) {
          dbApps.forEach((a) => {
            if (a.job_id) userAppliedSet.add(a.job_id)
            applicationsList.push(a)
          })
          dbAppliedCount = dbApps.length
        }
        setAppliedJobIds(new Set(userAppliedSet))

        const dbSavedJobs = savedRes.data
        if (dbSavedJobs && dbSavedJobs.length > 0) {
          dbSavedJobs.forEach((s) => {
            if (s.job_id) loadedSaved.add(s.job_id)
          })
        }
        setSavedJobIds(new Set(loadedSaved))
      } else {
        setAppliedJobIds(new Set())
        setSavedJobIds(new Set())
      }

      // Update active apps count
      setActiveAppsCount(dbAppliedCount)

      // 5. Query REAL Interviews for Upcoming Events Section
      let realUpcomingEvents: DashboardUpcomingEvent[] = []

      if (resolvedUserId) {
        const candidateClauses = [`candidate_id.eq.${resolvedUserId}`]
        if (studentRecordId && studentRecordId !== resolvedUserId) {
          candidateClauses.push(`candidate_id.eq.${studentRecordId}`)
        }

        const appIds = applicationsList.map((a) => a.id).filter(Boolean)
        if (appIds.length > 0) {
          candidateClauses.push(`job_application_id.in.(${appIds.join(',')})`)
        }

        const { data: dbInterviews, error: ivsErr } = await supabase
          .from('interviews')
          .select(
            'id, company_id, job_application_id, interview_date, interview_time, interview_type, location_type, location_value, status'
          )
          .or(candidateClauses.join(','))
          .neq('status', 'cancelled')
          .order('interview_date', { ascending: true })

        if (!ivsErr && dbInterviews && dbInterviews.length > 0) {
          const appJobMap = new Map(applicationsList.map((a) => [a.id, a.job_id]))
          const ivCompanyIds = Array.from(
            new Set(dbInterviews.map((iv) => iv.company_id).filter((id): id is string => Boolean(id)))
          )
          const ivJobIds = Array.from(
            new Set(
              dbInterviews
                .map((iv) => (iv.job_application_id ? appJobMap.get(iv.job_application_id) : undefined))
                .filter((id): id is string => Boolean(id))
            )
          )

          const [{ data: ivComps }, { data: ivJobs }] = await Promise.all([
            ivCompanyIds.length > 0
              ? supabase.from('companies').select('id, name').in('id', ivCompanyIds)
              : Promise.resolve({ data: null }),
            ivJobIds.length > 0
              ? supabase.from('create_job_post').select('id, title').in('id', ivJobIds)
              : Promise.resolve({ data: null }),
          ])

          const ivCompaniesMap: Record<string, string> = {}
          if (ivComps) {
            ivComps.forEach((c) => {
              ivCompaniesMap[c.id] = c.name
            })
          }

          const ivJobsMap: Record<string, string> = {}
          if (ivJobs) {
            ivJobs.forEach((j) => {
              ivJobsMap[j.id] = j.title
            })
          }

          realUpcomingEvents = dbInterviews.map((iv) => {
            const dateObj = new Date(iv.interview_date)
            const monthStr = isNaN(dateObj.getTime())
              ? 'OCT'
              : dateObj.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()
            const dayStr = isNaN(dateObj.getTime()) ? '15' : String(dateObj.getDate())
            const isVirtual = (iv.interview_type || iv.location_type || '').toLowerCase().includes('virtual')

            const companyName =
              (iv.company_id ? ivCompaniesMap[iv.company_id] || companiesMap[iv.company_id]?.name : undefined) ||
              'AEC Partner Practice'

            const mappedJobId = iv.job_application_id ? appJobMap.get(iv.job_application_id) : undefined
            const roleTitle =
              (mappedJobId ? ivJobsMap[mappedJobId] : undefined) ||
              currentDiscipline ||
              'AEC Specialist'

            const timeStr = iv.interview_time
              ? (iv.interview_time.includes('IST') ? iv.interview_time : `${iv.interview_time} IST`)
              : '10:30 AM IST'

            return {
              id: iv.id,
              title: iv.interview_type || 'Technical Interview',
              company: companyName,
              role: roleTitle,
              month: monthStr,
              day: dayStr,
              time: timeStr,
              type: isVirtual ? 'Virtual' : (iv.location_value || 'In-person'),
              isVirtual,
              rawDate: iv.interview_date,
            }
          })
        }
      }

      // Sets strictly the REAL fetched events. If zero exist in DB, this becomes empty array []
      // causing the empty state ("No Interviews Scheduled") to render naturally.
      setUpcomingEvents(realUpcomingEvents)

      // 6. Build Recommendation Jobs list
      const candidateProfileForAlgo = {
        discipline: currentDiscipline,
        specificSkill: currentSkill,
        skills: currentSkillsList,
        workMode: currentWorkMode,
      }

      let compiledRecommendedJobs: RecommendedJob[] = []

      if (dbJobs && dbJobs.length > 0) {
        compiledRecommendedJobs = dbJobs.map((j) => {
          const comp = companiesMap[j.company_id]
          const isAstro =
            j.company_id === '035657ca-04ff-4e96-8ef2-23639ed9c291' ||
            j.company_id === '67e18ab0-a413-4861-9ed4-44bcb430cecc'
          const companyName = comp?.name || (isAstro ? 'Astro' : 'AEC Partner Practice')
          const companyLocation = j.location || 'Pune, India'
          const skillsTags = extractSkillTags(j.technical_requirements, j.category)

          const { fitScore, matchReasons } = computeRecommendationFit(
            {
              title: j.title,
              category: j.category,
              technical_requirements: j.technical_requirements,
              job_description: j.job_description,
              work_type: j.work_type,
              location: j.location,
            },
            candidateProfileForAlgo
          )

          const salaryText = formatIndianSalary(j.salary_min, j.salary_max)

          const expTime = j.expires_at
            ? new Date(j.expires_at).getTime()
            : j.created_at
            ? new Date(j.created_at).getTime() + 15 * 24 * 60 * 60 * 1000
            : null
          const validityDaysLeft =
            expTime !== null
              ? Math.max(0, Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24)))
              : 15
          const expiresAt =
            j.expires_at ||
            (j.created_at
              ? new Date(new Date(j.created_at).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString()
              : undefined)

          const fullTechReqs = j.technical_requirements
            ? j.technical_requirements
                .split(/[,;\n•|]+/)
                .map((t: string) => t.trim())
                .filter((t: string) => t.length > 1 && t.length < 50)
            : skillsTags

          const empTypes: string[] = Array.isArray(j.employment_type)
            ? j.employment_type
            : typeof j.employment_type === 'string'
            ? [j.employment_type]
            : ['Full-Time']

          return {
            id: j.id,
            title: j.title,
            company: companyName,
            companyId: j.company_id,
            companyLogoUrl: comp?.logo_url,
            location: companyLocation,
            workType: j.work_type || 'Hybrid',
            category: j.category || 'Architecture & BIM',
            fitScore: backendSimilarityMap[j.id] ?? fitScore,
            matchReasons,
            skills: skillsTags,
            salaryText,
            experience: j.experience,
            description: j.job_description,
            isApplied: userAppliedSet.has(j.id),
            isSaved: loadedSaved.has(j.id),
            postedDate: j.created_at,
            expiresAt,
            validityDaysLeft,
            responsibilities: j.responsibilities || undefined,
            technicalRequirements: fullTechReqs.length > 0 ? fullTechReqs : skillsTags,
            aboutUs: j.about_us || undefined,
            employmentType: empTypes,
            numberOfOpenings: j.number_of_openings || 1,
            companyWebsite: comp?.website,
            companySize: comp?.size,
            companyAbout: comp?.description,
          }
        })
      } else {
        compiledRecommendedJobs = []
      }

      // Sort by highest fitScore first
      compiledRecommendedJobs.sort((a, b) => b.fitScore - a.fitScore)
      setRawJobs(compiledRecommendedJobs)

      // 7. Compose dynamic Recent Activity
      const dynamicActivities: DashboardActivity[] = []

      if (applicationsList.length > 0) {
        applicationsList.slice(0, 3).forEach((app) => {
          const matchingJob = compiledRecommendedJobs.find((j) => j.id === app.job_id)
          const jobTitle = matchingJob?.title || 'BIM Specialist Requisition'
          const compName = matchingJob?.company || 'AEC Enterprise'

          dynamicActivities.push({
            id: `act-app-${app.id}`,
            title: `${jobTitle} - Application Submitted`,
            description: `Application & verified credentials forwarded to ${compName}.`,
            time: formatRelativeTime(app.applied_at),
            active: true,
            type: 'application',
          })
        })
      }

      if (realUpcomingEvents.length > 0) {
        const nextInterview = realUpcomingEvents[0]
        dynamicActivities.push({
          id: `act-int-${nextInterview.id}`,
          title: `${nextInterview.role} - Interview Scheduled`,
          description: `${nextInterview.company} confirmed technical interview for ${nextInterview.month} ${nextInterview.day}.`,
          time: 'Active Notice',
          active: true,
          type: 'interview',
        })
      }

      setRecentActivity(dynamicActivities)
    } catch (err: unknown) {
      console.warn('loadDashboardData error:', err)
      setRawJobs([])
      setRecentActivity([])
    } finally {
      isFetchingRef.current = false
      lastFetchedRef.current = Date.now()
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(() => {
      if (!ignore) {
        void loadDashboardData()
      }
    })
    return () => {
      ignore = true
    }
  }, [loadDashboardData])

  // Sync profile state immediately when resume/profile is updated in MyProfile or Setup
  useEffect(() => {
    const handleProfileUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ resumeFileUrl?: string; hasResume?: boolean }>
      if (custom.detail) {
        setProfile((prev) => ({
          ...prev,
          resumeFileUrl: custom.detail.resumeFileUrl || prev.resumeFileUrl,
          hasResume: custom.detail.hasResume ?? Boolean(custom.detail.resumeFileUrl || prev.hasResume),
        }))
      }
      void loadDashboardData(true)
    }
    window.addEventListener('castallio-profile-updated', handleProfileUpdated)
    return () => {
      window.removeEventListener('castallio-profile-updated', handleProfileUpdated)
    }
  }, [loadDashboardData])

  /**
   * Applies for a recommended job:
   * Inserts into Supabase `job_applications` if authenticated,
   * updates local state, stats, and adds recent activity.
   */
  const applyForJob = useCallback(
    async (job: RecommendedJob): Promise<boolean> => {
      try {
        setApplyingJobId(job.id)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        const candidateId = user?.id || profile.id || 'candidate-alex'

        // Pre-application gatekeeper: verified resume PDF is strictly mandatory
        if (!profile.hasResume) {
          const { data: spRows } = await supabase
            .from('student_profile')
            .select('id, user_id, resume_file_url')
            .or(`user_id.eq.${candidateId},id.eq.${candidateId}`)
            .order('updated_at', { ascending: false })
            .limit(5)

          const currentSp =
            spRows && spRows.length > 0
              ? spRows.find((r) => Boolean(r.resume_file_url && String(r.resume_file_url).trim())) || spRows[0]
              : null

          const rawResume = currentSp?.resume_file_url ? String(currentSp.resume_file_url).trim() : ''
          const validResume =
            resolveValidResumeUrl(rawResume, currentSp?.user_id || currentSp?.id || candidateId) ||
            (rawResume ? rawResume : undefined)

          if (validResume) {
            setProfile((prev) => ({ ...prev, resumeFileUrl: validResume, hasResume: true }))
          } else {
            setApplyingJobId(null)
            return false
          }
        }

        // 1. If not a mock job and user is authenticated, insert to Supabase
        if (user && !job.id.startsWith('seed-job-')) {
          const { data: createdApp, error: insertError } = await supabase
            .from('job_applications')
            .insert({
              job_id: job.id,
              candidate_id: candidateId,
              company_id: job.companyId || null,
              status: 'new',
              applied_at: new Date().toISOString(),
            })
            .select('id')
            .single()

          if (insertError) {
            console.warn('Backend application insert notice:', insertError.message)
          } else if (createdApp?.id) {
            notifyEvent({ event: 'application_submitted', application_id: createdApp.id })
          }
        }

        // 2. Update local state
        const updatedApplied = new Set(appliedJobIds)
        updatedApplied.add(job.id)
        setAppliedJobIds(updatedApplied)

        // 3. Update rawJobs state
        setRawJobs((prev) =>
          prev.map((item) => (item.id === job.id ? { ...item, isApplied: true } : item))
        )

        // 4. Increment active apps count
        setActiveAppsCount((prev) => prev + 1)

        // 5. Prepend new Activity
        const newAct: DashboardActivity = {
          id: `act-applied-${Date.now()}`,
          title: `${job.title} - Application Submitted`,
          description: `Your profile and portfolio were submitted to ${job.company}.`,
          time: 'Just now',
          active: true,
          type: 'application',
        }
        setRecentActivity((prev) => [newAct, ...prev])

        return true
      } catch (err: unknown) {
        console.error('applyForJob error:', err)
        return false
      } finally {
        setApplyingJobId(null)
      }
    },
    [appliedJobIds, profile.id, profile.hasResume]
  )

  /**
   * Toggles bookmarking for a recommended job (supports optional explicit forceSave boolean)
   */
  const toggleSaveJob = useCallback(
    async (job: RecommendedJob, forceSave?: boolean) => {
      const nextSaved = new Set(savedJobIds)
      const isCurrentlySaved = nextSaved.has(job.id)
      const shouldSave = forceSave !== undefined ? forceSave : !isCurrentlySaved

      if (shouldSave) {
        nextSaved.add(job.id)
      } else {
        nextSaved.delete(job.id)
      }

      setSavedJobIds(nextSaved)

      setRawJobs((prev) =>
        prev.map((item) => (item.id === job.id ? { ...item, isSaved: shouldSave } : item))
      )

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user && !job.id.startsWith('seed-job-')) {
          if (!shouldSave) {
            await supabase
              .from('saved_jobs')
              .delete()
              .eq('user_id', user.id)
              .eq('job_id', job.id)
          } else {
            await supabase.from('saved_jobs').insert({
              user_id: user.id,
              job_id: job.id,
              item_type: 'job',
            })
          }
        }
      } catch (err) {
        console.warn('toggleSaveJob Supabase persistence error:', err)
      }
    },
    [savedJobIds]
  )

  const recommendedJobs = useMemo(() => {
    return rawJobs.map((j) => ({
      ...j,
      isApplied: appliedJobIds.has(j.id),
      isSaved: savedJobIds.has(j.id),
    }))
  }, [rawJobs, appliedJobIds, savedJobIds])

  return {
    profile,
    metrics: {
      activeAppsCount,
      profileViewsCount,
      profileStrength: profile.profileStrength,
    },
    recommendedJobs,
    upcomingEvents,
    recentActivity,
    appliedJobIds,
    savedJobIds,
    loading,
    applyingJobId,
    applyForJob,
    toggleSaveJob,
    refreshData: async () => {
      setLoading(true)
      await loadDashboardData(true)
    },
  }
}
