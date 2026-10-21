import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getCompanyJobQuota, type CompanyJobQuota } from '../lib/jobQuotaService'

export interface PipelineStats {
  total: number
  applied: number
  newCount: number
  inReview: number
  shortlisted: number
  scheduled: number
  rejected: number
}

export interface RequisitionItem {
  id: string
  refCode: string
  title: string
  category?: string
  projectType?: string
  projectTypes?: string[]
  location: string
  locations?: string[]
  workType?: string
  salaryRange: string
  salaryMin?: number | string | null
  salaryMax?: number | string | null
  salaryPeriod?: 'monthly' | 'yearly_lpa' | null
  employmentType: string
  openings?: number
  status: 'active' | 'draft' | 'interviewing' | 'closed'
  badges: string[]
  healthScore: number
  healthLabel?: string
  stack: string[]
  pipeline: PipelineStats
  createdDateText: string
  author?: string
  progressPercent?: number
  hiredCandidateName?: string
  jobDescription?: string
  technicalRequirements?: string
  responsibilities?: string
  whatWeOffer?: string
}


export type JobSegmentFilter = 'all' | 'active' | 'draft' | 'interviewing' | 'closed'

interface DBJobRow {
  id: string
  company_id: string
  posted_by: string
  title: string
  category: string | null
  project_type: string | null
  project_types?: string[] | null
  experience: string | null
  work_type: string | null
  location: string | null
  locations?: string[] | null
  employment_type: string[] | string | null
  salary_min: number | string | null
  salary_max: number | string | null
  salary_period: string | null
  number_of_openings: number | null
  job_description: string | null
  technical_requirements: string | null
  responsibilities: string | null
  about_us: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

function formatRelativeDate(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Recently'
  const date = new Date(isoDate)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSec < 60) return 'Just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatSalaryRange(
  min: number | string | null,
  max: number | string | null,
  period?: string | null
): string {
  const hasMin = min != null && String(min).trim() !== ''
  const hasMax = max != null && String(max).trim() !== ''

  if (!hasMin && !hasMax) return 'Competitive / Negotiable'

  const numMin = hasMin ? Number(min) : null
  const numMax = hasMax ? Number(max) : null

  // Check if LPA (either period is yearly_lpa or inferred from small values <= 100 for legacy records)
  const isLpa =
    period === 'yearly_lpa' ||
    (!period && ((numMin != null && numMin <= 100) || (numMax != null && numMax <= 100)))

  if (isLpa) {
    if (hasMin && hasMax) return `₹ ${min} - ${max} LPA`
    if (hasMin) return `From ₹ ${min} LPA`
    if (hasMax) return `Up to ₹ ${max} LPA`
    return 'Competitive / Negotiable'
  }

  // Monthly or standard currency
  const minFmt = numMin != null ? numMin.toLocaleString('en-IN') : null
  const maxFmt = numMax != null ? numMax.toLocaleString('en-IN') : null
  const suffix = period === 'monthly' ? ' / month' : ''

  if (minFmt && maxFmt) return `₹ ${minFmt} - ₹ ${maxFmt}${suffix}`
  if (minFmt) return `From ₹ ${minFmt}${suffix}`
  if (maxFmt) return `Up to ₹ ${maxFmt}${suffix}`
  return 'Competitive'
}

function extractStack(techReqs: string | null | undefined, category: string | null | undefined): string[] {
  if (techReqs) {
    const parts = techReqs
      .split(/[,;\n•]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 32)
    if (parts.length > 0) return parts.slice(0, 4)
  }
  if (category) return [category, 'AEC Engineering']
  return ['Revit & BIM', 'AutoCAD']
}

export function useMyJobs(onPostNewJob?: () => void) {
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [companyName, setCompanyName] = useState<string>('Enterprise Company')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<JobSegmentFilter>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedReqForCandidates, setSelectedReqForCandidates] = useState<RequisitionItem | null>(null)
  const [isCandidatesModalOpen, setIsCandidatesModalOpen] = useState<boolean>(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [jobQuota, setJobQuota] = useState<CompanyJobQuota | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur))
    }, 3500)
  }, [])

  // Fetch jobs and applicant counts from Supabase
  const fetchCompanyJobs = useCallback(async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        setLoading(false)
        return
      }

      const user = userData.user

      // 1. Resolve company
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user.id)
        .maybeSingle()

      const cId = companyData?.id || null
      const cName = companyData?.name || 'Enterprise Studio'
      setCompanyId(cId)
      setCompanyName(cName)

      // Fetch active job quota
      if (cId) {
        void getCompanyJobQuota(cId).then((q) => setJobQuota(q))
      }

      // 2. Fetch jobs
      let jobsQuery = supabase
        .from('create_job_post')
        .select('*')
        .order('created_at', { ascending: false })

      if (cId) {
        jobsQuery = jobsQuery.or(`company_id.eq.${cId},posted_by.eq.${user.id}`)
      } else {
        jobsQuery = jobsQuery.eq('posted_by', user.id)
      }

      const { data: rawJobs, error: jobsError } = await jobsQuery
      if (jobsError) {
        throw new Error(jobsError.message)
      }

      const jobsList = (rawJobs as DBJobRow[]) || []

      // 3. Fetch applications for these jobs to aggregate counts
      const appCountsMap: Record<
        string,
        {
          total: number
          newCount: number
          inReview: number
          shortlisted: number
          scheduled: number
          rejected: number
        }
      > = {}

      if (cId) {
        const { data: appsData } = await supabase
          .from('job_applications')
          .select('id, job_id, status')
          .eq('company_id', cId)

        if (appsData && Array.isArray(appsData)) {
          appsData.forEach((app) => {
            const jId = app.job_id
            if (!appCountsMap[jId]) {
              appCountsMap[jId] = {
                total: 0,
                newCount: 0,
                inReview: 0,
                shortlisted: 0,
                scheduled: 0,
                rejected: 0,
              }
            }
            appCountsMap[jId].total += 1
            const st = (app.status || 'new').toLowerCase()
            if (st === 'new') appCountsMap[jId].newCount += 1
            else if (st === 'in_review') appCountsMap[jId].inReview += 1
            else if (st === 'shortlisted') appCountsMap[jId].shortlisted += 1
            else if (st === 'scheduled') appCountsMap[jId].scheduled += 1
            else if (st === 'rejected') appCountsMap[jId].rejected += 1
            else {
              appCountsMap[jId].inReview += 1
            }
          })
        }
      }

      // 4. Map DB rows to RequisitionItem
      const mappedRequisitions: RequisitionItem[] = jobsList.map((job) => {
        const refCode = ''

        const appStats = appCountsMap[job.id] || {
          total: 0,
          newCount: 0,
          inReview: 0,
          shortlisted: 0,
          scheduled: 0,
          rejected: 0,
        }
        const rawStatus = (job.status || 'active').toLowerCase()
        const status =
          rawStatus === 'active' || rawStatus === 'draft' || rawStatus === 'interviewing' || rawStatus === 'closed'
            ? (rawStatus as RequisitionItem['status'])
            : 'active'

        const statusBadge =
          status === 'active'
            ? 'ACTIVE'
            : status === 'draft'
            ? 'DRAFT'
            : status === 'closed'
            ? 'CLOSED'
            : 'INTERVIEWING'

        const ptArray: string[] = Array.isArray(job.project_types) && job.project_types.length > 0
          ? job.project_types.map((p: string) => p.trim()).filter(Boolean)
          : job.project_type
          ? job.project_type.split(/[,;/]+/).map((p) => p.trim()).filter(Boolean)
          : []

        const badges: string[] = [statusBadge]
        if (ptArray.length > 0) {
          if (ptArray.length <= 2) {
            ptArray.forEach((pt) => badges.push(`${pt.toUpperCase()} PROJECT`))
          } else {
            badges.push(`${ptArray[0].toUpperCase()} +${ptArray.length - 1} PROJECTS`)
          }
        } else if (job.project_type) {
          badges.push(`${job.project_type.toUpperCase()} PROJECT`)
        }
        if (job.experience) badges.push(job.experience.toUpperCase())
        if (job.work_type) badges.push(job.work_type.toUpperCase())

        const empType = Array.isArray(job.employment_type)
          ? job.employment_type.join(', ')
          : typeof job.employment_type === 'string'
          ? job.employment_type
          : 'Full-time'

        // Calculate a representative health score
        let score = 70
        if (job.technical_requirements) score += 10
        if (job.job_description && job.job_description.length > 50) score += 10
        if (job.salary_min || job.salary_max) score += 10
        score = Math.min(98, score)

        const locArray: string[] = Array.isArray(job.locations) && job.locations.length > 0
          ? job.locations.map((l: string) => l.trim()).filter(Boolean)
          : job.location
          ? job.location.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
          : []

        const displayLocation = locArray.length > 0
          ? locArray.join(', ')
          : (job.location || 'Remote / Hybrid')

        return {
          id: job.id,
          refCode,
          title: job.title,
          category: job.category || undefined,
          projectType: ptArray.length > 0 ? ptArray.join(', ') : (job.project_type || undefined),
          projectTypes: ptArray,
          location: (job.location || locArray.length > 0)
            ? `${displayLocation} (${job.work_type || 'Hybrid'})`
            : 'Remote / Hybrid',
          locations: locArray,
          workType: job.work_type || undefined,
          salaryRange: formatSalaryRange(job.salary_min, job.salary_max, job.salary_period),
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          salaryPeriod: (job.salary_period as 'monthly' | 'yearly_lpa') || null,
          employmentType: empType,
          openings: job.number_of_openings || 1,
          status,
          badges,
          healthScore: score,
          healthLabel: score >= 90 ? 'Optimal Funnel' : score >= 80 ? 'Good Coverage' : 'Draft Incomplete',
          stack: extractStack(job.technical_requirements, job.category),
          pipeline: {
            total: appStats.total,
            applied: appStats.total,
            newCount: appStats.newCount,
            inReview: appStats.inReview,
            shortlisted: appStats.shortlisted,
            scheduled: appStats.scheduled,
            rejected: appStats.rejected,
          },
          createdDateText: `Posted ${formatRelativeDate(job.created_at)}`,
          author: cName,
          progressPercent: status === 'draft' ? 65 : undefined,
          jobDescription: job.job_description || undefined,
          technicalRequirements: job.technical_requirements || undefined,
          responsibilities: job.responsibilities || undefined,
          whatWeOffer: job.about_us || undefined,
        }
      })

      setRequisitions(mappedRequisitions)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load company requisitions.'
      console.error('fetchCompanyJobs error:', msg)
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCompanyJobs()
  }, [fetchCompanyJobs])


  // Derived counts
  const totalCount = requisitions.length
  const activeCount = useMemo(() => requisitions.filter((r) => r.status === 'active').length, [requisitions])
  const draftCount = useMemo(() => requisitions.filter((r) => r.status === 'draft').length, [requisitions])
  const interviewingCount = useMemo(() => requisitions.filter((r) => r.status === 'interviewing').length, [requisitions])
  const closedCount = useMemo(() => requisitions.filter((r) => r.status === 'closed').length, [requisitions])
  const totalApplicantsCount = useMemo(
    () => requisitions.reduce((acc, r) => acc + r.pipeline.applied, 0),
    [requisitions]
  )

  // Filtered requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((req) => {
      // Tab filter
      if (activeTab === 'active' && req.status !== 'active') return false
      if (activeTab === 'draft' && req.status !== 'draft') return false
      if (activeTab === 'interviewing' && req.status !== 'interviewing') return false
      if (activeTab === 'closed' && req.status !== 'closed') return false

      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchTitle = req.title.toLowerCase().includes(q)
        const matchRef = req.refCode.toLowerCase().includes(q)
        const matchLoc = req.location.toLowerCase().includes(q)
        const matchStack = req.stack.some((s) => s.toLowerCase().includes(q))
        if (!matchTitle && !matchRef && !matchLoc && !matchStack) return false
      }

      return true
    })
  }, [requisitions, activeTab, searchQuery])

  // Handlers connected to Supabase
  const handlePauseRequisition = useCallback(
    async (id: string) => {
      try {
        const target = requisitions.find((r) => r.id === id)
        const newStatus = target?.status === 'active' ? 'closed' : 'active'
        const { error } = await supabase.from('create_job_post').update({ status: newStatus }).eq('id', id)
        if (error) throw error

        setRequisitions((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        )
        showToast(`Requisition marked as ${newStatus}.`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error updating status'
        showToast(msg)
      }
    },
    [requisitions, showToast]
  )

  const handleCloseRequisition = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('create_job_post').update({ status: 'closed' }).eq('id', id)
        if (error) throw error

        setRequisitions((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'closed' } : r))
        )
        if (companyId) {
          void getCompanyJobQuota(companyId).then((q) => setJobQuota(q))
        }
        showToast('Requisition marked as closed and moved to archive.')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error closing requisition'
        showToast(msg)
      }
    },
    [companyId, showToast]
  )

  const handleDuplicateRequisition = useCallback(
    async (req: RequisitionItem) => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user || !companyId) {
          showToast('Could not duplicate requisition.')
          return
        }

        const duplicatePayload = {
          company_id: companyId,
          posted_by: userData.user.id,
          title: `${req.title} (Copy)`,
          category: req.category || null,
          project_type: req.projectType || null,
          project_types: req.projectTypes || null,
          work_type: req.workType || 'Hybrid',
          location: req.location,
          locations: req.locations || null,
          employment_type: [req.employmentType],
          salary_min: req.salaryMin != null ? req.salaryMin : null,
          salary_max: req.salaryMax != null ? req.salaryMax : null,
          salary_period: req.salaryPeriod || null,
          number_of_openings: req.openings || 1,
          job_description: req.jobDescription || null,
          technical_requirements: req.technicalRequirements || null,
          responsibilities: req.responsibilities || null,
          about_us: req.whatWeOffer || null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: inserted, error } = await supabase
          .from('create_job_post')
          .insert(duplicatePayload)
          .select()
          .single()

        if (error) throw error

        if (inserted) {
          fetchCompanyJobs()
          showToast(`Duplicated "${req.title}" as new draft requisition.`)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error duplicating requisition'
        showToast(msg)
      }
    },
    [companyId, fetchCompanyJobs, showToast]
  )

  const handleDiscardDraft = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('create_job_post').delete().eq('id', id)
        if (error) throw error

        setRequisitions((prev) => prev.filter((r) => r.id !== id))
        showToast('Requisition removed.')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error discarding requisition'
        showToast(msg)
      }
    },
    [showToast]
  )

  const handleReopenRequisition = useCallback(
    async (id: string) => {
      try {
        if (companyId) {
          const quota = await getCompanyJobQuota(companyId)
          setJobQuota(quota)
          if (quota.isLimitReached) {
            showToast(
              `Cannot re-open: Plan limit of ${quota.jobPostLimit} active jobs reached (${quota.activeJobsCount} live). Please close an active job or upgrade your subscription plan.`
            )
            return
          }
        }

        const newExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        const { error } = await supabase
          .from('create_job_post')
          .update({ status: 'active', expires_at: newExpiresAt })
          .eq('id', id)
        if (error) throw error

        if (companyId) {
          void getCompanyJobQuota(companyId).then((q) => setJobQuota(q))
        }

        setRequisitions((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'active', createdDateText: 'Re-opened today' } : r))
        )
        showToast('Requisition re-opened on active Talent Radar (15 days validity).')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error re-opening requisition'
        showToast(msg)
      }
    },
    [companyId, showToast]
  )

  const handleExportLedger = useCallback(
    (format: 'csv' | 'pdf') => {
      const exportContent = requisitions
        .map(
          (r) =>
            `"${r.title}","${r.location}","${r.salaryRange}",${r.status.toUpperCase()},${r.pipeline.applied} APPLICANTS,${r.pipeline.shortlisted} SHORTLISTED`
        )
        .join('\n')

      const header = 'TITLE,LOCATION,COMPENSATION,STATUS,APPLICANTS,SHORTLISTED\n'
      const blob = new Blob([header + exportContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_AEC_Requisitions_${new Date().toISOString().slice(0, 10)}.${format === 'csv' ? 'csv' : 'txt'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setIsExportModalOpen(false)
      showToast(`Exported ${requisitions.length} requisitions as ${format.toUpperCase()} ledger!`)
    },
    [requisitions, companyName, showToast]
  )

  const handleOpenCandidates = useCallback((req: RequisitionItem) => {
    setSelectedReqForCandidates(req)
    setIsCandidatesModalOpen(true)
  }, [])

  const refreshJobs = useCallback(() => {
    setLoading(true)
    void fetchCompanyJobs()
  }, [fetchCompanyJobs])

  return {
    requisitions,
    filteredRequisitions,
    loading,
    companyName,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    totalCount,
    activeCount,
    draftCount,
    interviewingCount,
    closedCount,
    totalApplicantsCount,
    selectedReqForCandidates,
    isCandidatesModalOpen,
    setIsCandidatesModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    jobQuota,
    toastMessage,
    showToast,
    refreshJobs,
    handlePauseRequisition,
    handleCloseRequisition,
    handleDuplicateRequisition,
    handleDiscardDraft,
    handleReopenRequisition,
    handleExportLedger,
    handleOpenCandidates,
    onPostNewJob,
  }
}
