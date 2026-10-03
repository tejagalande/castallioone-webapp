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
export async function getCompanyJobQuota(companyId: string): Promise<CompanyJobQuota> {
  let planId = 'free'
  let planName = 'Free Plan'
  let jobPostLimit: number | null = 1
  let trackedJobsPosted = 0

  try {
    // 1. Try backend RPC first (returns company & subscription overview)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('web_get_company_subscription_billing')
    if (!rpcErr && rpcData?.has_company && rpcData?.subscription) {
      const sub = rpcData.subscription
      planId = sub.plan_id || 'free'
      planName = sub.plan_name || PLAN_DISPLAY_NAMES[planId] || 'Free Plan'
      trackedJobsPosted = typeof sub.jobs_posted === 'number' ? sub.jobs_posted : 0
      
      if (planId === 'unlimited') {
        jobPostLimit = null
      } else if (typeof sub.job_post_limit === 'number') {
        jobPostLimit = sub.job_post_limit
      } else {
        jobPostLimit = PLAN_JOB_LIMITS[planId] ?? 1
      }
    } else {
      // 2. Fallback: Query company_subscriptions directly
      const { data: sub } = await supabase
        .from('company_subscriptions')
        .select('plan_id, jobs_posted, is_active')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sub?.plan_id) {
        planId = sub.plan_id
        planName = PLAN_DISPLAY_NAMES[planId] || `${planId.toUpperCase()} Plan`
        trackedJobsPosted = typeof sub.jobs_posted === 'number' ? sub.jobs_posted : 0
        jobPostLimit = PLAN_JOB_LIMITS[planId] !== undefined ? PLAN_JOB_LIMITS[planId] : 1
      }
    }
  } catch (err) {
    console.warn('Failed to load subscription quota from RPC, falling back to defaults:', err)
  }

  // 3. Count total published jobs (non-drafts) in create_job_post
  let publishedCount = 0
  let activeJobsCount = 0
  try {
    const { count: nonDraftCount, error: nonDraftErr } = await supabase
      .from('create_job_post')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .neq('status', 'draft')

    if (!nonDraftErr && typeof nonDraftCount === 'number') {
      publishedCount = nonDraftCount
    }

    const { count: activeCount, error: activeErr } = await supabase
      .from('create_job_post')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active')

    if (!activeErr && typeof activeCount === 'number') {
      activeJobsCount = activeCount
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
    companyId,
    planId,
    planName,
    jobPostLimit,
    totalJobsCount,
    activeJobsCount,
    remainingJobs,
    isLimitReached,
  }
}
