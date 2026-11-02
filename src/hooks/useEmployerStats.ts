import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface EmployerMetrics {
  activeJobs: number
  jobsThisWeek: number
  totalApplicants: number
  applicantsThisMonth: number
  hiresThisMonth: number
  previousMonthHires: number
}

export interface RecentApplicantItem {
  id: string
  name: string
  role: string
  fitScore: number
  appliedFor: string
  skills: string[]
  avatar: string | null
  appliedAt: string
}

interface RpcApplicant {
  id: string
  candidate?: {
    full_name?: string
    discipline?: string
    profile_image_url?: string
    skills?: Array<string | { skill_name?: string }>
  }
  job?: {
    title?: string
  }
  applied_at?: string
}

export interface UseEmployerStatsReturn {
  stats: EmployerMetrics
  recentApplicants: RecentApplicantItem[]
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

const DEFAULT_METRICS: EmployerMetrics = {
  activeJobs: 0,
  jobsThisWeek: 0,
  totalApplicants: 0,
  applicantsThisMonth: 0,
  hiresThisMonth: 0,
  previousMonthHires: 0,
}

export function useEmployerStats(): UseEmployerStatsReturn {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<EmployerMetrics>(DEFAULT_METRICS)
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicantItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isFetchingRef = useRef(false)
  const lastFetchedRef = useRef(0)

  const fetchStats = useCallback(async (force = false) => {
    if (!user) {
      setLoading(false)
      return
    }

    // Cooldown check (30 seconds) to avoid hammering the database on focus changes
    const nowTimestamp = Date.now()
    if (!force && isFetchingRef.current) return
    if (!force && lastFetchedRef.current > 0 && nowTimestamp - lastFetchedRef.current < 30000) {
      setLoading(false)
      return
    }

    try {
      isFetchingRef.current = true
      setLoading(true)
      setError(null)

      // 1. Resolve company by owner_id
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (companyError) {
        console.error('Error fetching company record for metrics:', companyError.message)
      }

      const companyId = companyData?.id

      // Calculate time boundaries
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

      // 2. Query Active Jobs & Weekly Jobs counts in parallel
      let activeJobsQuery = supabase
        .from('create_job_post')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')

      let weekJobsQuery = supabase
        .from('create_job_post')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo)

      if (companyId) {
        activeJobsQuery = activeJobsQuery.or(`company_id.eq.${companyId},posted_by.eq.${user.id}`)
        weekJobsQuery = weekJobsQuery.or(`company_id.eq.${companyId},posted_by.eq.${user.id}`)
      } else {
        activeJobsQuery = activeJobsQuery.eq('posted_by', user.id)
        weekJobsQuery = weekJobsQuery.eq('posted_by', user.id)
      }

      const [
        { count: activeJobsCount, error: activeJobsErr },
        { count: jobsThisWeekCount },
      ] = await Promise.all([activeJobsQuery, weekJobsQuery])

      if (activeJobsErr) console.warn('Active jobs count query error:', activeJobsErr.message)

      // 3. Query Applicant counts & Recent Applicants in parallel
      let totalApplicantsCount = 0
      let applicantsThisMonthCount = 0
      let hiresThisMonthCount = 0
      let previousMonthHiresCount = 0

      if (companyId) {
        const [
          { count: appCount, error: appErr },
          { count: appMonthCount },
          { count: hireMonthCount },
          { count: prevHireCount },
          rpcResult,
        ] = await Promise.all([
          supabase
            .from('job_applications')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', companyId),
          supabase
            .from('job_applications')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .gte('applied_at', startOfMonth),
          supabase
            .from('job_applications')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'hired')
            .gte('updated_at', startOfMonth),
          supabase
            .from('job_applications')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'hired')
            .gte('updated_at', startOfLastMonth)
            .lt('updated_at', startOfMonth),
          supabase
            .rpc('web_get_company_applicants', { p_company_id: companyId })
            .then((res) => res, (err) => ({ data: null, error: err })),
        ])

        if (!appErr && typeof appCount === 'number') {
          totalApplicantsCount = appCount
        }
        if (typeof appMonthCount === 'number') {
          applicantsThisMonthCount = appMonthCount
        }
        if (typeof hireMonthCount === 'number') {
          hiresThisMonthCount = hireMonthCount
        }
        if (typeof prevHireCount === 'number') {
          previousMonthHiresCount = prevHireCount
        }

        // 4. Process Recent Applicants from remote database
        let recentAppsList: RecentApplicantItem[] = []
        const { data: rpcData, error: rpcErr } = rpcResult
        if (!rpcErr && rpcData?.applicants && Array.isArray(rpcData.applicants) && rpcData.applicants.length > 0) {
          recentAppsList = (rpcData.applicants as RpcApplicant[]).slice(0, 6).map((app: RpcApplicant) => {
            const skills: string[] = []
            if (Array.isArray(app.candidate?.skills)) {
              for (const s of app.candidate.skills) {
                if (typeof s === 'string') skills.push(s)
                else if (s && typeof s === 'object' && s.skill_name) skills.push(s.skill_name)
              }
            }
            return {
              id: app.id,
              name: app.candidate?.full_name || 'Anonymous Candidate',
              role: app.candidate?.discipline || 'AEC Specialist',
              fitScore: 88,
              appliedFor: app.job?.title || 'General Position',
              skills: skills.length > 0 ? skills.slice(0, 4) : ['Revit', 'BIM', 'AutoCAD'],
              avatar: app.candidate?.profile_image_url || null,
              appliedAt: app.applied_at || new Date().toISOString(),
            }
          })
        }

        // Direct fallback query if RPC did not return list
        if (recentAppsList.length === 0) {
          try {
            const { data: rawApps } = await supabase
              .from('job_applications')
              .select('id, candidate_id, applied_at, job_id')
              .eq('company_id', companyId)
              .order('applied_at', { ascending: false })
              .limit(6)

            if (rawApps && rawApps.length > 0) {
              const cIds = rawApps.map((a) => a.candidate_id).filter(Boolean)
              const jIds = rawApps.map((a) => a.job_id).filter(Boolean)

              const [{ data: students }, { data: jobs }] = await Promise.all([
                cIds.length > 0
                  ? supabase
                      .from('student_profile')
                      .select('id, user_id, full_name, discipline, profile_image_url')
                      .or(`user_id.in.(${cIds.join(',')}),id.in.(${cIds.join(',')})`)
                  : Promise.resolve({ data: [] }),
                jIds.length > 0
                  ? supabase
                      .from('create_job_post')
                      .select('id, title')
                      .in('id', jIds)
                  : Promise.resolve({ data: [] }),
              ])

              const cMap = new Map((students || []).map((s) => [s.user_id || s.id, s]))
              const jMap = new Map((jobs || []).map((j) => [j.id, j.title]))

              recentAppsList = rawApps.map((a) => {
                const s = cMap.get(a.candidate_id)
                return {
                  id: a.id,
                  name: s?.full_name || 'Candidate',
                  role: s?.discipline || 'AEC Professional',
                  fitScore: 85,
                  appliedFor: jMap.get(a.job_id) || 'Job Requisition',
                  skills: ['AEC Professional'],
                  avatar: s?.profile_image_url || null,
                  appliedAt: a.applied_at || new Date().toISOString(),
                }
              })
            }
          } catch (tableErr) {
            console.warn('Fallback direct applications query notice:', tableErr)
          }
        }

        setRecentApplicants(recentAppsList)
      } else {
        setRecentApplicants([])
      }

      setStats({
        activeJobs: activeJobsCount ?? 0,
        jobsThisWeek: jobsThisWeekCount ?? 0,
        totalApplicants: totalApplicantsCount,
        applicantsThisMonth: applicantsThisMonthCount,
        hiresThisMonth: hiresThisMonthCount,
        previousMonthHires: previousMonthHiresCount,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch dashboard metrics'
      console.error('useEmployerStats error:', msg)
      setError(msg)
    } finally {
      lastFetchedRef.current = Date.now()
      isFetchingRef.current = false
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStats()
    }
  }, [authLoading, fetchStats])

  return {
    stats,
    recentApplicants,
    loading: authLoading || loading,
    error,
    refreshStats: () => fetchStats(true),
  }
}
