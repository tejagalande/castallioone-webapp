import { useState, useEffect, useCallback } from 'react'
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

export interface UseEmployerStatsReturn {
  stats: EmployerMetrics
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
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
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

      // 2. Query Active Jobs count
      // Include jobs matching company_id OR posted_by = user.id
      let activeJobsQuery = supabase
        .from('create_job_post')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')

      if (companyId) {
        activeJobsQuery = activeJobsQuery.or(`company_id.eq.${companyId},posted_by.eq.${user.id}`)
      } else {
        activeJobsQuery = activeJobsQuery.eq('posted_by', user.id)
      }

      const { count: activeJobsCount, error: activeJobsErr } = await activeJobsQuery
      if (activeJobsErr) console.warn('Active jobs count query error:', activeJobsErr.message)

      // Query jobs posted this week
      let weekJobsQuery = supabase
        .from('create_job_post')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo)

      if (companyId) {
        weekJobsQuery = weekJobsQuery.or(`company_id.eq.${companyId},posted_by.eq.${user.id}`)
      } else {
        weekJobsQuery = weekJobsQuery.eq('posted_by', user.id)
      }

      const { count: jobsThisWeekCount } = await weekJobsQuery

      // 3. Query Total Applicants count
      let totalApplicantsCount = 0
      let applicantsThisMonthCount = 0
      let hiresThisMonthCount = 0
      let previousMonthHiresCount = 0

      if (companyId) {
        // Total applications for this company
        const { count: appCount, error: appErr } = await supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)

        if (!appErr && typeof appCount === 'number') {
          totalApplicantsCount = appCount
        }

        // Applicants this month
        const { count: appMonthCount } = await supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .gte('applied_at', startOfMonth)

        if (typeof appMonthCount === 'number') {
          applicantsThisMonthCount = appMonthCount
        }

        // Hires this month (status = 'hired' and updated in current month)
        const { count: hireMonthCount } = await supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('status', 'hired')
          .gte('updated_at', startOfMonth)

        if (typeof hireMonthCount === 'number') {
          hiresThisMonthCount = hireMonthCount
        }

        // Hires last month (for comparison trend)
        const { count: prevHireCount } = await supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('status', 'hired')
          .gte('updated_at', startOfLastMonth)
          .lt('updated_at', startOfMonth)

        if (typeof prevHireCount === 'number') {
          previousMonthHiresCount = prevHireCount
        }
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
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStats()
    }
  }, [authLoading, fetchStats])

  return {
    stats,
    loading: authLoading || loading,
    error,
    refreshStats: fetchStats,
  }
}
