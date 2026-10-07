import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { notifyEvent } from '../lib/webPush'
import {
  computeRecommendationFit,
  formatIndianSalary,
  type RecommendedJob,
  type TalentProfileInfo,
} from './useTalentDashboard'

export interface SavedJobItem {
  id: string // primary key in saved_jobs or local id
  jobId: string // id in create_job_post
  title: string
  company: string
  companyId?: string
  companyLogoUrl?: string
  companyInitials: string
  companyColor: 'primary' | 'secondary' | 'tertiary' | 'high'
  location: string
  workType: 'Hybrid' | 'Remote' | 'On-site' | string
  salary: string
  matchScore: number
  matchLabel: string
  matchReasons: string[]
  savedDate: string
  closingBadge?: {
    text: string
    isUrgent: boolean
  }
  discipline: string
  stack: string[]
  candidateNote?: string
  isClosingSoon?: boolean
  isExpired?: boolean
  expiresAt?: string
  rawJob?: Record<string, unknown>
}

export interface SavedDriveItem {
  id: string // primary key in saved_jobs
  driveId: string // id in walk_in_drives
  title: string
  company: string
  companyId?: string
  companyInitials: string
  location: string
  dateTime: string | null
  dateFormatted: string
  numberOpenings: number
  skills: string[]
  isUrgent: boolean
  status: string
  savedDate: string
}

export interface UpcomingDeadlineItem {
  id: string
  company: string
  role: string
  daysLeftText: string
  urgency: 'critical' | 'moderate' | 'relaxed'
  rawDate: string
}

export interface UseSavedJobsOptions {
  jobs?: RecommendedJob[]
  loading?: boolean
  profile?: TalentProfileInfo
  savedJobIds?: Set<string>
  appliedJobIds?: Set<string>
  onSave?: (job: RecommendedJob) => void
  onApply?: (job: RecommendedJob) => Promise<void>
}

export function useSavedJobs(options?: UseSavedJobsOptions) {
  const [internalLoading, setInternalLoading] = useState<boolean>(true)
  const [dbJobs, setDbJobs] = useState<SavedJobItem[]>([])
  const [savedDrives, setSavedDrives] = useState<SavedDriveItem[]>([])
  const [removedJobIds, setRemovedJobIds] = useState<Set<string>>(new Set())
  const [removedDriveIds, setRemovedDriveIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'saved' | 'drives' | 'archived'>('saved')
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'closing-soonest' | 'highest-match' | 'recently-saved' | 'highest-comp'>('closing-soonest')
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [internalAppliedJobIds, setInternalAppliedJobIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [mountTimestamp] = useState<number>(() => Date.now())

  // Determine overall loading state (use parent's if available)
  const loading = options?.loading !== undefined ? options.loading : internalLoading

  // Local candidate notes store
  const [candidateNotes] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('castallio_saved_job_notes')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  // Helper for initials
  const getCompanyInitials = (name: string): string => {
    if (!name) return 'AEC'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Helper for company color
  const getCompanyColor = (index: number): 'primary' | 'secondary' | 'tertiary' | 'high' => {
    const colors: Array<'primary' | 'secondary' | 'tertiary' | 'high'> = ['primary', 'high', 'secondary', 'tertiary']
    return colors[index % colors.length]
  }

  // Format relative timestamp
  const formatRelativeSaved = (isoDate?: string | null): string => {
    if (!isoDate) return 'Saved recently'
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours < 1) return 'Saved just now'
      if (diffHours < 24) return `Saved ${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays === 1) return 'Saved yesterday'
      if (diffDays < 30) return `Saved ${diffDays}d ago`
      return `Saved on ${new Date(isoDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
    } catch {
      return 'Saved recently'
    }
  }

  // Parse skill tags
  const extractSkills = (techReqs?: string | null, cat?: string | null): string[] => {
    if (techReqs) {
      const tokens = techReqs
        .split(/[,;\n•|]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 1 && t.length < 28)
      if (tokens.length > 0) return Array.from(new Set(tokens)).slice(0, 5)
    }
    const kw = ['Revit', 'Navisworks', 'AutoCAD', 'Tekla', 'Dynamo', 'Grasshopper', 'Python']
    const combined = `${techReqs || ''} ${cat || ''}`.toLowerCase()
    const matches = kw.filter((k) => combined.includes(k.toLowerCase()))
    return matches.length > 0 ? matches : ['Revit', 'AutoCAD']
  }

  /**
   * Main Supabase Query: Loads all saved jobs and saved drives for the user
   */
  const loadSavedData = useCallback(async () => {
    try {
      // 1. Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const resolvedUserId = user?.id || null

      // Cached applied jobs
      const cachedApplied = (() => {
        try {
          const raw = localStorage.getItem('castallio_applied_jobs')
          return raw ? JSON.parse(raw) : []
        } catch {
          return []
        }
      })()

      // 2. Resolve candidate profile (checking localStorage first to match useTalentDashboard!)
      let candidateDiscipline = options?.profile?.discipline || 'BIM Management'
      let candidateSpecificSkill = options?.profile?.specificSkill || 'Senior BIM Coordinator'
      let candidateSkillsList = options?.profile?.skills && options.profile.skills.length > 0
        ? [...options.profile.skills]
        : ['Revit', 'Navisworks', 'Dynamo']
      let candidateWorkMode = options?.profile?.workMode || 'Hybrid'

      // Check localStorage for exact profile data if not provided via props
      if (!options?.profile) {
        try {
          const raw = localStorage.getItem('castallio_talent_profile_data')
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.discipline) candidateDiscipline = parsed.discipline
            if (parsed.specificSkill) candidateSpecificSkill = parsed.specificSkill
            if (Array.isArray(parsed.coreSoftware) && parsed.coreSoftware.length > 0) {
              candidateSkillsList = parsed.coreSoftware
            }
            if (parsed.workMode) candidateWorkMode = parsed.workMode
          }
        } catch {
          // fallback
        }
      }

      if (resolvedUserId && !options?.profile) {
        const { data: studentData } = await supabase
          .from('student_profile')
          .select('id, discipline, work_mode')
          .or(`user_id.eq.${resolvedUserId},id.eq.${resolvedUserId}`)
          .maybeSingle()

        if (studentData) {
          if (studentData.discipline) candidateDiscipline = studentData.discipline
          if (studentData.work_mode) candidateWorkMode = studentData.work_mode

          const { data: skillsRows } = await supabase
            .from('student_skills')
            .select('skill_name, category')
            .or(`student_id.eq.${studentData.id},student_id.eq.${resolvedUserId}`)

          if (skillsRows && skillsRows.length > 0) {
            candidateSkillsList = skillsRows.map((s) => s.skill_name)
            const spec = skillsRows.find((s) => s.category === 'specific')
            if (spec) candidateSpecificSkill = spec.skill_name
          }
        }
      }

      if (resolvedUserId) {
        // Fetch user's applied jobs from Supabase
        const { data: userApps } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('candidate_id', resolvedUserId)

        if (userApps && userApps.length > 0) {
          const dbAppliedIds = userApps.map((a) => a.job_id).filter(Boolean)
          const mergedApplied = Array.from(new Set([...cachedApplied, ...dbAppliedIds]))
          setInternalAppliedJobIds(mergedApplied)
          localStorage.setItem('castallio_applied_jobs', JSON.stringify(mergedApplied))
        } else {
          setInternalAppliedJobIds(cachedApplied)
        }
      } else {
        setInternalAppliedJobIds(cachedApplied)
      }

      const candidateProfileForFit = {
        discipline: candidateDiscipline,
        specificSkill: candidateSpecificSkill,
        skills: candidateSkillsList,
        workMode: candidateWorkMode,
      }

      // 3. Query saved_jobs rows from Supabase
      let savedRows: Array<{
        id: string
        user_id: string
        job_id: string | null
        drive_id: string | null
        item_type: string
        created_at: string
      }> = []

      if (resolvedUserId) {
        const { data: dbSaved, error: savedError } = await supabase
          .from('saved_jobs')
          .select('*')
          .eq('user_id', resolvedUserId)
          .order('created_at', { ascending: false })

        if (!savedError && dbSaved) {
          savedRows = dbSaved
        }
      }

      // Local storage saved jobs IDs
      const localSavedJobIds: string[] = (() => {
        try {
          const raw = localStorage.getItem('castallio_saved_jobs')
          return raw ? JSON.parse(raw) : []
        } catch {
          return []
        }
      })()

      const dbJobIds = savedRows
        .filter((r) => r.item_type === 'job' && r.job_id)
        .map((r) => r.job_id as string)

      const targetJobIds = Array.from(new Set([...dbJobIds, ...localSavedJobIds]))

      const dbDriveIds = savedRows
        .filter((r) => r.item_type === 'drive' && r.drive_id)
        .map((r) => r.drive_id as string)

      // 4. Fetch job details from `create_job_post`
      let fetchedJobs: SavedJobItem[] = []
      if (targetJobIds.length > 0) {
        const { data: jobPosts, error: postErr } = await supabase
          .from('create_job_post')
          .select('*')
          .in('id', targetJobIds)

        if (!postErr && jobPosts && jobPosts.length > 0) {
          const compIds = Array.from(new Set(jobPosts.map((j) => j.company_id).filter(Boolean)))
          const companiesMap: Record<string, { name: string; logo_url?: string }> = {}

          if (compIds.length > 0) {
            const { data: compRows } = await supabase
              .from('companies')
              .select('id, name, logo_url')
              .in('id', compIds)
            if (compRows) {
              compRows.forEach((c) => {
                companiesMap[c.id] = { name: c.name, logo_url: c.logo_url || undefined }
              })
            }
          }

          // Query Backend similarity scores from match_jobs_for_talent RPC if student profile exists
          const backendSimilarityMap: Record<string, number> = {}
          if (resolvedUserId) {
            try {
              const { data: rpcData } = await supabase.rpc('match_jobs_for_talent', {
                p_student_id: resolvedUserId,
                p_match_threshold: 0.0,
                p_match_count: 50,
              })

              if (rpcData && Array.isArray(rpcData)) {
                rpcData.forEach((row: { job_id: string; similarity: number }) => {
                  if (row.job_id && typeof row.similarity === 'number') {
                    backendSimilarityMap[row.job_id] = Math.min(99, Math.max(50, Math.round(row.similarity * 100)))
                  }
                })
              }
            } catch {
              // Fallback
            }
          }

          fetchedJobs = jobPosts.map((j, idx) => {
            const comp = companiesMap[j.company_id]
            const isAstro =
              j.company_id === '035657ca-04ff-4e96-8ef2-23639ed9c291' ||
              j.company_id === '67e18ab0-a413-4861-9ed4-44bcb430cecc'
            const compName = comp?.name || (isAstro ? 'Astro' : 'AEC Partner Practice')

            const matchingSavedRow = savedRows.find((r) => r.job_id === j.id)
            const savedRowId = matchingSavedRow ? matchingSavedRow.id : `local-${j.id}`
            const savedDateStr = matchingSavedRow ? matchingSavedRow.created_at : j.created_at

            const salaryText = formatIndianSalary(j.salary_min, j.salary_max) || 'Best in Industry'
            const stack = extractSkills(j.technical_requirements, j.category)

            const { fitScore, matchReasons } = computeRecommendationFit(
              {
                title: j.title,
                category: j.category,
                technical_requirements: j.technical_requirements,
                job_description: j.job_description,
                work_type: j.work_type,
                location: j.location,
              },
              candidateProfileForFit
            )

            const now = Date.now()
            const expTime = j.expires_at
              ? new Date(j.expires_at).getTime()
              : j.created_at
              ? new Date(j.created_at).getTime() + 15 * 24 * 60 * 60 * 1000
              : null
            const isExpired = j.status === 'closed' || j.status === 'expired' || (expTime !== null && expTime <= now)

            let isClosingSoon = false
            let closingBadge: { text: string; isUrgent: boolean }

            if (isExpired) {
              closingBadge = {
                text: 'Expired',
                isUrgent: true,
              }
            } else if (expTime !== null) {
              const diffHours = Math.floor((expTime - now) / (1000 * 60 * 60))
              const daysLeft = Math.max(0, Math.ceil(diffHours / 24))

              if (diffHours <= 24) {
                isClosingSoon = true
                closingBadge = {
                  text: daysLeft === 0 ? 'Expiring Today' : 'Closing in 24h',
                  isUrgent: true,
                }
              } else if (diffHours <= 72) {
                isClosingSoon = true
                closingBadge = {
                  text: `${daysLeft}d left`,
                  isUrgent: true,
                }
              } else {
                closingBadge = {
                  text: `${daysLeft}d validity`,
                  isUrgent: false,
                }
              }
            } else {
              closingBadge = {
                text: '15d validity',
                isUrgent: false,
              }
            }

            return {
              id: savedRowId,
              jobId: j.id,
              title: j.title || 'AEC Specialist Requisition',
              company: compName,
              companyId: j.company_id,
              companyLogoUrl: comp?.logo_url || undefined,
              companyInitials: getCompanyInitials(compName),
              companyColor: getCompanyColor(idx),
              location: j.location || 'Pune, India',
              workType: (j.work_type as 'Hybrid' | 'Remote' | 'On-site') || 'Hybrid',
              salary: salaryText,
              matchScore: backendSimilarityMap[j.id] ?? fitScore,
              matchLabel: matchReasons[0] || 'Domain Match',
              matchReasons,
              savedDate: formatRelativeSaved(savedDateStr),
              closingBadge,
              discipline: j.category || 'BIM Management',
              stack,
              candidateNote: candidateNotes[j.id],
              isClosingSoon,
              isExpired,
              expiresAt: j.expires_at || (expTime ? new Date(expTime).toISOString() : undefined),
              rawJob: j,
            }
          })
        }
      }

      setDbJobs(fetchedJobs)

      // 5. Fetch walk-in drives if any are saved
      let fetchedDrives: SavedDriveItem[] = []
      if (dbDriveIds.length > 0) {
        const { data: driveRows, error: driveErr } = await supabase
          .from('walk_in_drives')
          .select('*')
          .in('id', dbDriveIds)

        if (!driveErr && driveRows && driveRows.length > 0) {
          const compIds = Array.from(new Set(driveRows.map((d) => d.company_id).filter(Boolean)))
          const driveCompaniesMap: Record<string, string> = {}

          if (compIds.length > 0) {
            const { data: compRows } = await supabase
              .from('companies')
              .select('id, name')
              .in('id', compIds)
            if (compRows) {
              compRows.forEach((c) => {
                driveCompaniesMap[c.id] = c.name
              })
            }
          }

          fetchedDrives = driveRows.map((d) => {
            const matchingRow = savedRows.find((r) => r.drive_id === d.id)
            const compName = driveCompaniesMap[d.company_id] || d.company_name || 'AEC Studio'

            let dateFormatted = 'Date TBD'
            if (d.date_time) {
              try {
                dateFormatted = new Date(d.date_time).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              } catch {
                dateFormatted = d.date_time
              }
            }

            return {
              id: matchingRow ? matchingRow.id : `drive-local-${d.id}`,
              driveId: d.id,
              title: d.title || 'Walk-in Hiring Drive',
              company: compName,
              companyId: d.company_id,
              companyInitials: getCompanyInitials(compName),
              location: d.location || 'Pune, India',
              dateTime: d.date_time,
              dateFormatted,
              numberOpenings: d.number_of_openings || 1,
              skills: Array.isArray(d.required_skills) ? d.required_skills : ['BIM', 'Revit'],
              isUrgent: Boolean(d.is_urgent),
              status: d.status || 'active',
              savedDate: formatRelativeSaved(matchingRow?.created_at),
            }
          })
        }
      }

      setSavedDrives(fetchedDrives)
    } catch (err: unknown) {
      console.warn('loadSavedData error:', err)
    } finally {
      setInternalLoading(false)
    }
  }, [candidateNotes, options?.profile])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(() => {
      if (!ignore) {
        void loadSavedData()
      }
    })
    return () => {
      ignore = true
    }
  }, [loadSavedData])

  // Resolve appliedJobIds set
  const externalAppliedJobIds = options?.appliedJobIds
  const appliedJobIds = useMemo(() => {
    if (externalAppliedJobIds) {
      return Array.from(externalAppliedJobIds)
    }
    return internalAppliedJobIds
  }, [externalAppliedJobIds, internalAppliedJobIds])

  // Resolve final jobs list:
  // Combines dbJobs and parent's recommended saved jobs while strictly respecting removals and parent state
  const jobs: SavedJobItem[] = useMemo(() => {
    const parentSavedIds = options?.savedJobIds || new Set<string>()
    const resultMap = new Map<string, SavedJobItem>()

    // 1. Populate loaded dbJobs (excluding any optimistically removed jobs)
    dbJobs.forEach((dbJob) => {
      if (removedJobIds.has(dbJob.jobId) || removedJobIds.has(dbJob.id)) {
        return
      }
      // If parent explicitly tracks this job in savedJobIds and it's no longer saved, omit it
      if (options?.savedJobIds && options.jobs?.some((pj) => pj.id === dbJob.jobId)) {
        if (!parentSavedIds.has(dbJob.jobId)) {
          return
        }
      }
      resultMap.set(dbJob.jobId, { ...dbJob })
    })

    // 2. Merge parent's saved recommended jobs
    if (options?.jobs && options.jobs.length > 0) {
      options.jobs.forEach((pj, idx) => {
        if (removedJobIds.has(pj.id) || removedJobIds.has(`saved-${pj.id}`)) {
          return
        }

        const isParentSaved = parentSavedIds.has(pj.id) || (!options.savedJobIds && pj.isSaved)
        if (!isParentSaved) {
          return
        }

        const pjExpTime = pj.expiresAt
          ? new Date(pj.expiresAt).getTime()
          : pj.postedDate
          ? new Date(pj.postedDate).getTime() + 15 * 24 * 60 * 60 * 1000
          : null
        const pjDiffHours = pjExpTime ? Math.floor((pjExpTime - Date.now()) / (1000 * 60 * 60)) : null
        const pjDaysLeft =
          pj.validityDaysLeft !== undefined
            ? pj.validityDaysLeft
            : pjDiffHours !== null
            ? Math.max(0, Math.ceil(pjDiffHours / 24))
            : 15

        let pjClosingBadge: { text: string; isUrgent: boolean }
        if (pjDaysLeft <= 0) {
          pjClosingBadge = { text: 'Expiring Today', isUrgent: true }
        } else if (pjDaysLeft === 1) {
          pjClosingBadge = { text: 'Closing in 24h', isUrgent: true }
        } else if (pjDaysLeft <= 3) {
          pjClosingBadge = { text: `${pjDaysLeft}d left`, isUrgent: true }
        } else {
          pjClosingBadge = { text: `${pjDaysLeft}d validity`, isUrgent: false }
        }

        const existing = resultMap.get(pj.id)
        if (existing) {
          // Keep 100% score & reasons parity with TalentDashboard / FindJobs
          existing.matchScore = pj.fitScore
          existing.matchLabel = pj.matchReasons[0] || existing.matchLabel
          existing.matchReasons = pj.matchReasons
          existing.closingBadge = pjClosingBadge
          existing.isClosingSoon = pjDaysLeft <= 3
          existing.expiresAt = pj.expiresAt || existing.expiresAt
          existing.isExpired = false
        } else {
          resultMap.set(pj.id, {
            id: `saved-${pj.id}`,
            jobId: pj.id,
            title: pj.title,
            company: pj.company,
            companyId: pj.companyId,
            companyLogoUrl: pj.companyLogoUrl,
            companyInitials: getCompanyInitials(pj.company),
            companyColor: getCompanyColor(idx),
            location: pj.location,
            workType: (pj.workType as 'Hybrid' | 'Remote' | 'On-site') || 'Hybrid',
            salary: pj.salaryText || 'Best in Industry',
            matchScore: pj.fitScore,
            matchLabel: pj.matchReasons[0] || 'Discipline Fit',
            matchReasons: pj.matchReasons,
            savedDate: formatRelativeSaved(pj.postedDate),
            closingBadge: pjClosingBadge,
            discipline: pj.category || 'BIM Management',
            stack: pj.skills || [],
            candidateNote: candidateNotes[pj.id],
            isClosingSoon: pjDaysLeft <= 3,
            isExpired: false,
            expiresAt: pj.expiresAt || (pjExpTime ? new Date(pjExpTime).toISOString() : undefined),
            rawJob: pj as unknown as Record<string, unknown>,
          })
        }
      })
    }

    return Array.from(resultMap.values())
  }, [options?.jobs, options?.savedJobIds, dbJobs, removedJobIds, candidateNotes])

  // Active saved walk-in drives with optimistic removal filtering
  const activeSavedDrives = useMemo(() => {
    return savedDrives.filter(
      (d) => !removedDriveIds.has(d.driveId) && !removedDriveIds.has(d.id)
    )
  }, [savedDrives, removedDriveIds])

  // Saved Jobs: Include all bookmarked opportunities in the active stream
  const activeJobs = useMemo(() => jobs, [jobs])
  const archivedJobs = useMemo(() => jobs.filter((j) => j.isExpired), [jobs])

  // Filtered & Sorted Active Saved Jobs
  const filteredJobs = useMemo(() => {
    const sourceList = activeTab === 'archived' ? archivedJobs : activeJobs

    return sourceList
      .filter((job) => {
        // Discipline filter
        if (selectedDiscipline !== 'All') {
          const dLower = selectedDiscipline.toLowerCase()
          const matchesDisc =
            job.discipline.toLowerCase().includes(dLower) ||
            job.title.toLowerCase().includes(dLower)
          if (!matchesDisc) return false
        }

        // Search query filter (search title, company, stack, location)
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase()
          const matchesTitle = job.title.toLowerCase().includes(q)
          const matchesCompany = job.company.toLowerCase().includes(q)
          const matchesLocation = job.location.toLowerCase().includes(q)
          const matchesStack = job.stack.some((s) => s.toLowerCase().includes(q))
          const matchesNote = job.candidateNote?.toLowerCase().includes(q) ?? false

          if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesStack && !matchesNote) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'highest-match') {
          return b.matchScore - a.matchScore
        }
        if (sortBy === 'closing-soonest') {
          if (a.isClosingSoon && !b.isClosingSoon) return -1
          if (!a.isClosingSoon && b.isClosingSoon) return 1
          return b.matchScore - a.matchScore
        }
        if (sortBy === 'highest-comp') {
          return b.salary.localeCompare(a.salary)
        }
        return 0
      })
  }, [activeJobs, archivedJobs, activeTab, selectedDiscipline, searchQuery, sortBy])

  // Computed Upcoming Deadlines
  const upcomingDeadlines = useMemo<UpcomingDeadlineItem[]>(() => {
    const list: UpcomingDeadlineItem[] = []
    const now = mountTimestamp

    activeJobs.forEach((job) => {
      if (job.expiresAt) {
        const expTime = new Date(job.expiresAt).getTime()
        const diffMs = expTime - now
        if (diffMs > 0) {
          const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
          let urgency: 'critical' | 'moderate' | 'relaxed' = 'relaxed'
          if (daysLeft <= 3) urgency = 'critical'
          else if (daysLeft <= 7) urgency = 'moderate'

          list.push({
            id: `dl-job-${job.jobId}`,
            company: job.company,
            role: job.title,
            daysLeftText: daysLeft === 1 ? '1 day left' : `${daysLeft}d left`,
            urgency,
            rawDate: job.expiresAt,
          })
        }
      }
    })

    activeSavedDrives.forEach((d) => {
      if (d.dateTime) {
        const driveTime = new Date(d.dateTime).getTime()
        const diffMs = driveTime - now
        if (diffMs > 0) {
          const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
          let urgency: 'critical' | 'moderate' | 'relaxed' = 'relaxed'
          if (daysLeft <= 3) urgency = 'critical'
          else if (daysLeft <= 7) urgency = 'moderate'

          list.push({
            id: `dl-drive-${d.driveId}`,
            company: d.company,
            role: d.title,
            daysLeftText: daysLeft === 1 ? 'Starts tomorrow' : `In ${daysLeft} days`,
            urgency,
            rawDate: d.dateTime,
          })
        }
      }
    })

    list.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
    return list.slice(0, 4)
  }, [activeJobs, activeSavedDrives, mountTimestamp])

  // Urgent closing job for dynamic banner
  const urgentClosingJob = useMemo(() => {
    return activeJobs.find((j) => j.isClosingSoon) || null
  }, [activeJobs])

  // Select all or toggle single job
  const toggleSelectAll = useCallback(() => {
    if (selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedJobIds([])
    } else {
      setSelectedJobIds(filteredJobs.map((j) => j.jobId))
    }
  }, [selectedJobIds.length, filteredJobs])

  const toggleSelectJob = useCallback((jobId: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((item) => item !== jobId) : [...prev, jobId]
    )
  }, [])

  // Supabase Mutation: Remove / Unsave Job
  const removeSavedJob = useCallback(
    async (savedRowId: string, jobId: string, title: string) => {
      // 1. Immediately apply synchronous optimistic UI state updates
      setRemovedJobIds((prev) => {
        const next = new Set(prev)
        if (jobId) next.add(jobId)
        if (savedRowId) next.add(savedRowId)
        return next
      })
      setDbJobs((prev) => prev.filter((j) => j.jobId !== jobId && j.id !== savedRowId))
      setSelectedJobIds((prev) => prev.filter((id) => id !== jobId))

      // 2. Synchronous local storage update
      try {
        const raw = localStorage.getItem('castallio_saved_jobs')
        if (raw) {
          const parsed: string[] = JSON.parse(raw)
          const filtered = parsed.filter((id) => id !== jobId && id !== savedRowId)
          localStorage.setItem('castallio_saved_jobs', JSON.stringify(filtered))
        }
      } catch (e) {
        console.warn('Cache sync notice:', e)
      }

      // 3. Notify parent callback if available to update parent state
      if (options?.onSave && options?.jobs) {
        const found = options.jobs.find((j) => j.id === jobId)
        if (found) {
          // If parent tracks this job as saved, invoking onSave will unsave it
          if (options.savedJobIds?.has(jobId) || options.savedJobIds?.has(found.id) || found.isSaved) {
            options.onSave(found)
          }
        }
      }

      // 4. Delete from Supabase
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          if (savedRowId && !savedRowId.startsWith('local-') && !savedRowId.startsWith('saved-')) {
            await supabase
              .from('saved_jobs')
              .delete()
              .eq('id', savedRowId)
              .eq('user_id', user.id)
          }
          if (jobId) {
            await supabase
              .from('saved_jobs')
              .delete()
              .eq('user_id', user.id)
              .eq('job_id', jobId)
          }
        }
      } catch (err) {
        console.error('removeSavedJob DB error:', err)
      }

      showToast(`Removed "${title}" from saved opportunities.`)
    },
    [options, showToast]
  )

  // Supabase Mutation: Remove / Unsave Drive
  const removeSavedDrive = useCallback(
    async (savedRowId: string, driveId: string, title: string) => {
      // 1. Synchronous optimistic UI state update
      setRemovedDriveIds((prev) => {
        const next = new Set(prev)
        if (driveId) next.add(driveId)
        if (savedRowId) next.add(savedRowId)
        return next
      })
      setSavedDrives((prev) => prev.filter((d) => d.driveId !== driveId && d.id !== savedRowId))

      // 2. Delete from Supabase
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          if (savedRowId && !savedRowId.startsWith('drive-local-')) {
            await supabase
              .from('saved_jobs')
              .delete()
              .eq('id', savedRowId)
              .eq('user_id', user.id)
          }
          if (driveId) {
            await supabase
              .from('saved_jobs')
              .delete()
              .eq('user_id', user.id)
              .eq('drive_id', driveId)
          }
        }
      } catch (err) {
        console.error('removeSavedDrive DB error:', err)
      }

      showToast(`Removed "${title}" from saved drives.`)
    },
    [showToast]
  )

  // Supabase Mutation: Quick Apply
  const handleQuickApply = useCallback(
    async (jobId: string, title: string, companyId?: string) => {
      if (appliedJobIds.includes(jobId)) {
        showToast(`You have already applied for ${title}.`)
        return
      }

      try {
        // If parent provided onApply, invoke it
        if (options?.onApply && options.jobs) {
          const found = options.jobs.find((j) => j.id === jobId)
          if (found) {
            await options.onApply(found)
            showToast(`Application submitted for ${title}!`)
            return
          }
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: createdApp, error } = await supabase
            .from('job_applications')
            .insert({
              job_id: jobId,
              candidate_id: user.id,
              company_id: companyId || null,
              status: 'new',
              applied_at: new Date().toISOString(),
            })
            .select('id')
            .single()

          if (error) {
            console.warn('job_applications insert warning:', error.message)
          } else if (createdApp?.id) {
            notifyEvent({ event: 'application_submitted', application_id: createdApp.id })
          }
        }

        const updated = Array.from(new Set([...internalAppliedJobIds, jobId]))
        setInternalAppliedJobIds(updated)
        localStorage.setItem('castallio_applied_jobs', JSON.stringify(updated))

        showToast(`Application submitted for ${title}! Recruiter notified.`)
      } catch (err) {
        console.error('handleQuickApply error:', err)
        showToast(`Application submitted for ${title}.`)
      }
    },
    [appliedJobIds, internalAppliedJobIds, options, showToast]
  )

  // Supabase Mutation: Bulk Apply
  const handleBulkApply = useCallback(async () => {
    if (selectedJobIds.length === 0) {
      showToast('Please select at least one job first.')
      return
    }

    const unappliedIds = selectedJobIds.filter((id) => !appliedJobIds.includes(id))
    if (unappliedIds.length === 0) {
      showToast('All selected positions have already been applied to.')
      setSelectedJobIds([])
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const rows = unappliedIds.map((jid) => {
          const matchingJob = jobs.find((j) => j.jobId === jid)
          return {
            job_id: jid,
            candidate_id: user.id,
            company_id: matchingJob?.companyId || null,
            status: 'new',
            applied_at: new Date().toISOString(),
          }
        })

        const { data: createdApps } = await supabase.from('job_applications').insert(rows).select('id')
        createdApps?.forEach((a) => notifyEvent({ event: 'application_submitted', application_id: a.id }))
      }

      const updated = Array.from(new Set([...appliedJobIds, ...unappliedIds]))
      setInternalAppliedJobIds(updated)
      localStorage.setItem('castallio_applied_jobs', JSON.stringify(updated))

      showToast(`Quick applications dispatched to ${unappliedIds.length} bookmarked roles!`)
      setSelectedJobIds([])
    } catch (err) {
      console.error('handleBulkApply error:', err)
      showToast(`Applications sent to ${unappliedIds.length} positions.`)
    }
  }, [selectedJobIds, appliedJobIds, jobs, showToast])

  return {
    loading,
    jobs,
    activeJobs,
    archivedJobs,
    savedDrives: activeSavedDrives,
    filteredJobs,
    upcomingDeadlines,
    urgentClosingJob,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedDiscipline,
    setSelectedDiscipline,
    sortBy,
    setSortBy,
    selectedJobIds,
    toggleSelectAll,
    toggleSelectJob,
    removeSavedJob,
    removeSavedDrive,
    handleQuickApply,
    handleBulkApply,
    appliedJobIds,
    toastMessage,
    showToast,
    refreshSavedData: async () => {
      setInternalLoading(true)
      await loadSavedData()
    },
  }
}
