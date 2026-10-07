import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { notifyEvent } from '../lib/webPush'

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

  // Local storage cache keys
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('castallio_applied_jobs')
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('castallio_saved_jobs')
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  // Talent identity & profile state
  const [profile, setProfile] = useState<TalentProfileInfo>(() => {
    try {
      const raw = localStorage.getItem('castallio_talent_profile_data')
      const parsed = raw ? JSON.parse(raw) : null
      const savedCompleteness = parseInt(localStorage.getItem('castallio_talent_profile_completeness') || '0', 10)

      return {
        id: parsed?.userId || '',
        fullName: parsed?.fullName || '',
        discipline: parsed?.discipline || '',
        specificSkill: parsed?.specificSkill || '',
        location: parsed?.city || '',
        workMode: parsed?.workMode || '',
        skills: Array.isArray(parsed?.coreSoftware) ? parsed.coreSoftware : [],
        profileStrength: savedCompleteness || (parsed ? 92 : 0),
        avatarUrl: parsed?.profileImagePreview || undefined,
      }
    } catch {
      return {
        id: '',
        fullName: '',
        discipline: '',
        specificSkill: '',
        location: '',
        workMode: '',
        skills: [],
        profileStrength: 0,
      }
    }
  })

  // Metrics
  const [activeAppsCount, setActiveAppsCount] = useState<number>(() => {
    const raw = localStorage.getItem('castallio_applied_jobs')
    try {
      return raw ? JSON.parse(raw).length : 0
    } catch {
      return 0
    }
  })

  const [profileViewsCount] = useState<number>(0)

  // Recommendation Jobs
  const [rawJobs, setRawJobs] = useState<RecommendedJob[]>([])

  // Upcoming Events - Starts strictly as empty array. Only populated if REAL DB rows exist.
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardUpcomingEvent[]>([])

  // Recent Activity
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([])

  /**
   * Main fetcher attached to Supabase backend
   */
  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const resolvedUserId = user?.id || null
      let currentDiscipline = profile.discipline
      let currentSkill = profile.specificSkill
      let currentSkillsList = [...profile.skills]
      let currentWorkMode = profile.workMode
      let completeness = profile.profileStrength
      let fullName = profile.fullName
      let profileAvatar = profile.avatarUrl
      let studentRecordId: string | null = null

      // 2. Query student_profile from Supabase if user exists
      if (resolvedUserId) {
        const { data: studentData } = await supabase
          .from('student_profile')
          .select('*')
          .or(`user_id.eq.${resolvedUserId},id.eq.${resolvedUserId}`)
          .maybeSingle()

        if (studentData) {
          studentRecordId = studentData.id || null
          if (studentData.full_name) fullName = studentData.full_name
          if (studentData.discipline) currentDiscipline = studentData.discipline
          if (studentData.work_mode) currentWorkMode = studentData.work_mode
          if (studentData.profile_image_url) profileAvatar = studentData.profile_image_url
          if (typeof studentData.completeness_percentage === 'number') {
            completeness = studentData.completeness_percentage
          }

          // Query skills from student_skills
          const { data: skillsRows } = await supabase
            .from('student_skills')
            .select('skill_name, category')
            .or(`student_id.eq.${studentData.id},student_id.eq.${resolvedUserId}`)

          if (skillsRows && skillsRows.length > 0) {
            currentSkillsList = skillsRows.map((s) => s.skill_name)
            const specific = skillsRows.find((s) => s.category === 'specific')
            if (specific) currentSkill = specific.skill_name
          }
        } else if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
          fullName = user.user_metadata.full_name || user.user_metadata.name
        }
      }

      // Update Profile state
      setProfile((prev) => ({
        ...prev,
        id: resolvedUserId || prev.id,
        fullName,
        discipline: currentDiscipline,
        specificSkill: currentSkill,
        skills: currentSkillsList,
        workMode: currentWorkMode,
        profileStrength: completeness,
        avatarUrl: profileAvatar,
      }))

      // 3. Query Real Active Jobs from create_job_post joined with companies
      const { data: dbJobs, error: jobsError } = await supabase
        .from('create_job_post')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)

      // Query companies for metadata
      const companiesMap: Record<string, { name: string; logo_url?: string; location?: string }> = {}
      if (!jobsError && dbJobs && dbJobs.length > 0) {
        const companyIds = Array.from(new Set(dbJobs.map((j) => j.company_id).filter(Boolean)))
        if (companyIds.length > 0) {
          const { data: companiesData } = await supabase
            .from('companies')
            .select('id, name, logo_url')
            .in('id', companyIds)

          if (companiesData) {
            companiesData.forEach((c) => {
              companiesMap[c.id] = {
                name: c.name,
                logo_url: c.logo_url || undefined,
              }
            })
          }
        }
      }

      // 3b. Query Backend Postgres similarity scores from match_jobs_for_talent RPC
      const backendSimilarityMap: Record<string, number> = {}
      if (studentRecordId) {
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('match_jobs_for_talent', {
            p_student_id: studentRecordId,
            p_match_threshold: 0.0,
            p_match_count: 50,
          })

          if (!rpcErr && rpcData && Array.isArray(rpcData)) {
            rpcData.forEach((row: { job_id: string; similarity: number }) => {
              if (row.job_id && typeof row.similarity === 'number') {
                backendSimilarityMap[row.job_id] = Math.min(99, Math.max(50, Math.round(row.similarity * 100)))
              }
            })
          }
        } catch {
          // Fallback to domain recommendation algorithm if candidate has no embedding
        }
      }

      // 4. Query Applications count and applied jobs for current user
      const userAppliedSet = new Set<string>()
      try {
        const raw = localStorage.getItem('castallio_applied_jobs')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) parsed.forEach((id: string) => userAppliedSet.add(id))
        }
      } catch {
        // fallback
      }
      let dbAppliedCount = 0
      const applicationsList: Array<{
        id: string
        job_id: string
        status: string
        applied_at: string
      }> = []

      const loadedSaved = new Set<string>()
      try {
        const raw = localStorage.getItem('castallio_saved_jobs')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) parsed.forEach((id: string) => loadedSaved.add(id))
        }
      } catch {
        // fallback
      }

      if (resolvedUserId) {
        const candidateQueries = [`candidate_id.eq.${resolvedUserId}`]
        if (studentRecordId && studentRecordId !== resolvedUserId) {
          candidateQueries.push(`candidate_id.eq.${studentRecordId}`)
        }

        const { data: dbApps, count } = await supabase
          .from('job_applications')
          .select('id, job_id, status, applied_at', { count: 'exact' })
          .or(candidateQueries.join(','))
          .order('applied_at', { ascending: false })

        if (dbApps && dbApps.length > 0) {
          dbApps.forEach((a) => {
            if (a.job_id) userAppliedSet.add(a.job_id)
            applicationsList.push(a)
          })
          dbAppliedCount = count || dbApps.length
          setAppliedJobIds(new Set(userAppliedSet))
          localStorage.setItem('castallio_applied_jobs', JSON.stringify(Array.from(userAppliedSet)))
        }

        // Query saved_jobs from Supabase for current user
        const { data: dbSavedJobs } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('user_id', resolvedUserId)
          .eq('item_type', 'job')

        if (dbSavedJobs && dbSavedJobs.length > 0) {
          dbSavedJobs.forEach((s) => {
            if (s.job_id) loadedSaved.add(s.job_id)
          })
        }
        setSavedJobIds(new Set(loadedSaved))
        localStorage.setItem('castallio_saved_jobs', JSON.stringify(Array.from(loadedSaved)))
      } else {
        setSavedJobIds(new Set(loadedSaved))
      }

      // Update active apps count
      const finalAppsCount = Math.max(dbAppliedCount, userAppliedSet.size)
      setActiveAppsCount(finalAppsCount)

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
          .select('*')
          .or(candidateClauses.join(','))
          .neq('status', 'cancelled')
          .order('interview_date', { ascending: true })

        if (!ivsErr && dbInterviews && dbInterviews.length > 0) {
          const ivCompanyIds = Array.from(new Set(dbInterviews.map((iv) => iv.company_id).filter(Boolean)))
          const ivJobIds = Array.from(new Set(dbInterviews.map((iv) => iv.job_id).filter(Boolean)))

          const ivCompaniesMap: Record<string, string> = {}
          if (ivCompanyIds.length > 0) {
            const { data: ivComps } = await supabase
              .from('companies')
              .select('id, name')
              .in('id', ivCompanyIds)
            if (ivComps) {
              ivComps.forEach((c) => {
                ivCompaniesMap[c.id] = c.name
              })
            }
          }

          const ivJobsMap: Record<string, string> = {}
          if (ivJobIds.length > 0) {
            const { data: ivJobs } = await supabase
              .from('create_job_post')
              .select('id, title')
              .in('id', ivJobIds)
            if (ivJobs) {
              ivJobs.forEach((j) => {
                ivJobsMap[j.id] = j.title
              })
            }
          }

          realUpcomingEvents = dbInterviews.map((iv) => {
            const dateObj = new Date(iv.interview_date)
            const monthStr = isNaN(dateObj.getTime())
              ? 'OCT'
              : dateObj.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()
            const dayStr = isNaN(dateObj.getTime()) ? '15' : String(dateObj.getDate())
            const isVirtual = (iv.interview_type || iv.location_type || '').toLowerCase().includes('virtual')

            const companyName =
              ivCompaniesMap[iv.company_id] ||
              companiesMap[iv.company_id]?.name ||
              iv.company_name ||
              'AEC Partner Practice'

            const roleTitle =
              ivJobsMap[iv.job_id] ||
              iv.role_title ||
              iv.job_title ||
              currentDiscipline ||
              'AEC Specialist'

            const timeStr = iv.interview_time
              ? (iv.interview_time.includes('IST') ? iv.interview_time : `${iv.interview_time} IST`)
              : '10:30 AM IST'

            return {
              id: iv.id,
              title: iv.interview_title || iv.round_title || 'Technical Interview',
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
      setLoading(false)
    }
  }, [
    profile.discipline,
    profile.specificSkill,
    profile.skills,
    profile.workMode,
    profile.profileStrength,
    profile.fullName,
    profile.avatarUrl,
  ])

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

        // 2. Update local tracking
        const updatedApplied = new Set(appliedJobIds)
        updatedApplied.add(job.id)
        setAppliedJobIds(updatedApplied)
        localStorage.setItem('castallio_applied_jobs', JSON.stringify(Array.from(updatedApplied)))

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
    [appliedJobIds, profile.id]
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
      localStorage.setItem('castallio_saved_jobs', JSON.stringify(Array.from(nextSaved)))

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
      await loadDashboardData()
    },
  }
}
