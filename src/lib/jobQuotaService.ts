import { supabase } from './supabase'

export interface CompanyJobQuota {
  companyId: string
  planId: string
  planName: string
  jobPostLimit: number | null // null = unlimited
  totalJobsCount: number
  activeJobsCount: number
  remainingJobs: number | null // null = unlimited
  isLimitReached: boolean
}

export const PLAN_JOB_LIMITS: Record<string, number | null> = {
  free: 1,
  starter: 2,
  professional: 5,
  unlimited: null,
  starter_cv: 1,
  professional_cv: 1,
}

export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free Plan',
  starter: 'Starter Plan',
  professional: 'Professional Plan',
  unlimited: 'Unlimited Enterprise Plan',
  starter_cv: 'Starter + CV Addon',
  professional_cv: 'Professional + CV Addon',
}

/**
 * Calculates and returns the live job posting quota for a company.
 * Compares total jobs posted against the company's active subscription tier.
 */
export async function getCompanyJobQuota(
  companyId: string,
  ownerUserId?: string
): Promise<CompanyJobQuota> {
  let planId = 'free'
  let planName = 'Free Plan'
  let jobPostLimit: number | null = 1
  let trackedJobsPosted = 0
  let subStartedAt: string | null = null
  let resolvedUserId = ownerUserId || null
  let resolvedCompanyId = companyId || ''

  try {
    if (!resolvedUserId || !resolvedCompanyId) {
      const { data: authData } = await supabase.auth.getUser()
      if (authData?.user?.id) {
        resolvedUserId = resolvedUserId || authData.user.id
        if (!resolvedCompanyId) {
          const { data: comp } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', authData.user.id)
            .maybeSingle()
          if (comp?.id) {
            resolvedCompanyId = comp.id
          }
        }
      }
    }
  } catch (authErr) {
    console.warn('Error resolving user/company for quota check:', authErr)
  }

  try {
    // 1. Try backend RPC first (returns company & subscription overview)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('web_get_company_subscription_billing')
    if (!rpcErr && rpcData?.has_company && rpcData?.subscription) {
      const sub = rpcData.subscription
      if (!resolvedCompanyId && rpcData.company?.id) {
        resolvedCompanyId = rpcData.company.id
      }
      planId = (sub.plan_id || 'free').toLowerCase()
      planName = sub.plan_name || PLAN_DISPLAY_NAMES[planId] || 'Free Plan'
      trackedJobsPosted = typeof sub.jobs_posted === 'number' ? sub.jobs_posted : 0
      subStartedAt = sub.started_at || null

      if (planId === 'unlimited') {
        jobPostLimit = null
      } else if (typeof sub.job_post_limit === 'number') {
        jobPostLimit = sub.job_post_limit
      } else {
        jobPostLimit = PLAN_JOB_LIMITS[planId] ?? 1
      }
    } else if (resolvedCompanyId) {
      // 2. Fallback: Query company_subscriptions directly
      const { data: sub } = await supabase
        .from('company_subscriptions')
        .select('plan_id, jobs_posted, is_active, started_at')
        .eq('company_id', resolvedCompanyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sub?.plan_id) {
        planId = sub.plan_id.toLowerCase()
        planName = PLAN_DISPLAY_NAMES[planId] || `${planId.toUpperCase()} Plan`
        trackedJobsPosted = typeof sub.jobs_posted === 'number' ? sub.jobs_posted : 0
        subStartedAt = sub.started_at || null
        jobPostLimit = PLAN_JOB_LIMITS[planId] !== undefined ? PLAN_JOB_LIMITS[planId] : 1
      }
    }
  } catch (err) {
    console.warn('Failed to load subscription quota from RPC, falling back to defaults:', err)
  }

  // 3. Count published jobs (non-drafts) in create_job_post
  // Note: We fetch rows and filter in JS because in SQL `status != 'draft'` excludes rows where `status IS NULL`,
  // and jobs may be linked via `company_id` or `posted_by`.
  let publishedCount = 0
  let activeJobsCount = 0
  try {
    let jobsQuery = supabase
      .from('create_job_post')
      .select('id, status, created_at')

    if (resolvedCompanyId && resolvedUserId) {
      jobsQuery = jobsQuery.or(`company_id.eq.${resolvedCompanyId},posted_by.eq.${resolvedUserId}`)
    } else if (resolvedCompanyId) {
      jobsQuery = jobsQuery.eq('company_id', resolvedCompanyId)
    } else if (resolvedUserId) {
      jobsQuery = jobsQuery.eq('posted_by', resolvedUserId)
    }

    const { data: jobRows, error: jobsErr } = await jobsQuery

    if (!jobsErr && Array.isArray(jobRows)) {
      const nonDraftRows = jobRows.filter((row) => {
        const normalizedStatus = (row.status || 'active').trim().toLowerCase()
        return normalizedStatus !== 'draft'
      })

      activeJobsCount = nonDraftRows.filter((row) => {
        const normalizedStatus = (row.status || 'active').trim().toLowerCase()
        return normalizedStatus === 'active'
      }).length

      if (planId !== 'free' && subStartedAt) {
        const subStartMs = new Date(subStartedAt).getTime()
        if (!isNaN(subStartMs)) {
          const cycleRows = nonDraftRows.filter((row) => {
            if (!row.created_at) return true
            const createdMs = new Date(row.created_at).getTime()
            return isNaN(createdMs) || createdMs >= subStartMs
          })
          publishedCount = cycleRows.length
        } else {
          publishedCount = nonDraftRows.length
        }
      } else {
        publishedCount = nonDraftRows.length
      }
    }
  } catch (err) {
    console.warn('Failed to count jobs in create_job_post:', err)
  }

  // Use the maximum of total published jobs from table and tracked jobs_posted on subscription
  const totalJobsCount = Math.max(publishedCount, trackedJobsPosted)

  // Evaluation is based on TOTAL jobs posted against plan limit
  const isLimitReached = jobPostLimit !== null && totalJobsCount >= jobPostLimit
  const remainingJobs = jobPostLimit !== null ? Math.max(0, jobPostLimit - totalJobsCount) : null

  return {
    companyId: resolvedCompanyId,
    planId,
    planName,
    jobPostLimit,
    totalJobsCount,
    activeJobsCount,
    remainingJobs,
    isLimitReached,
  }
}
