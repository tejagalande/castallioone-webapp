import { supabase } from './supabase'

export interface JobEmbeddingResult {
  success: boolean
  jobId: string
  error?: string
  data?: unknown
}

/**
 * Triggers the Supabase Edge Function 'generate-job-embedding' for a given job post.
 * Matches the Castallio One mobile app architecture, where the edge function is called
 * once a row is inserted in 'create_job_post' table.
 */
export async function generateJobEmbedding(
  jobId: string,
  jobRecord?: {
    id?: string
    title?: string
    category?: string
    job_description?: string
    technical_requirements?: string
    location?: string
    experience?: string
  }
): Promise<JobEmbeddingResult> {
  if (!jobId) {
    return { success: false, jobId, error: 'No jobId provided' }
  }

  try {
    console.log(`[JobEmbedding] Invoking generate-job-embedding for job ID: ${jobId}`)

    // Provide payload in both direct (id/job_id) and webhook format (record)
    const payload = {
      id: jobId,
      job_id: jobId,
      jobId: jobId,
      record: jobRecord
        ? {
            id: jobId,
            ...jobRecord,
          }
        : { id: jobId },
    }

    const { data, error } = await supabase.functions.invoke('generate-job-embedding', {
      body: payload,
    })

    if (error) {
      console.warn(`[JobEmbedding] generate-job-embedding returned error for ${jobId}:`, error.message)
      return { success: false, jobId, error: error.message }
    }

    console.log(`[JobEmbedding] Embedding successfully generated for ${jobId}:`, data)
    return { success: true, jobId, data }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error generating job embedding'
    console.error(`[JobEmbedding] Exception invoking generate-job-embedding for ${jobId}:`, msg)
    return { success: false, jobId, error: msg }
  }
}

/**
 * Searches for the job from "Astro" company (Structural Engineering position)
 * or any active jobs missing embeddings, and triggers 'generate-job-embedding' for them.
 */
export async function syncAstroAndMissingJobEmbeddings(): Promise<JobEmbeddingResult[]> {
  const results: JobEmbeddingResult[] = []

  try {
    // 1. Locate Astro company
    const { data: astroCompanies } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', '%astro%')

    const astroIds = (astroCompanies || []).map((c) => c.id)

    // 2. Query jobs for Astro or Structural Engineering
    let jobsQuery = supabase.from('create_job_post').select('*')

    if (astroIds.length > 0) {
      jobsQuery = jobsQuery.or(`company_id.in.(${astroIds.join(',')}),title.ilike.%structural%`)
    } else {
      jobsQuery = jobsQuery.ilike('title', '%structural%')
    }

    const { data: targetJobs, error: qErr } = await jobsQuery

    if (qErr) {
      console.warn('[JobEmbedding] Query error finding target jobs:', qErr.message)
      return results
    }

    if (targetJobs && targetJobs.length > 0) {
      for (const job of targetJobs) {
        console.log(`[JobEmbedding] Generating missing embedding for "${job.title}" (${job.id})...`)
        const res = await generateJobEmbedding(job.id, job)
        results.push(res)
      }
    }
  } catch (err: unknown) {
    console.warn('[JobEmbedding] syncAstroAndMissingJobEmbeddings exception:', err)
  }

  return results
}
