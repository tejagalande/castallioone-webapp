import { supabase } from './supabase'

export interface CandidateEmbeddingResult {
  success: boolean
  studentId: string
  error?: string
  data?: unknown
}

/**
 * Triggers the Supabase Edge Function 'genarte-candidate-embedding' for a given candidate/student.
 * Matches the Castallio One mobile app architecture, where the edge function is called
 * once a talent profile is created, updated, or when skills/experiences are modified.
 *
 * The edge function:
 * 1. Fetches candidate profile, skills, and experience
 * 2. Compiles a comprehensive searchable document (`search_text`)
 * 3. Calls Gemini embedding model (1536-dimensional vector)
 * 4. Automatically updates `search_text` and `embedding` columns in `student_profile` table
 */
export async function generateCandidateEmbedding(
  studentId: string
): Promise<CandidateEmbeddingResult> {
  if (!studentId) {
    return { success: false, studentId, error: 'No studentId provided' }
  }

  try {
    let resolvedId = studentId

    // The edge function strictly queries: .from("student_profile").select(...).eq("id", student_id)
    // Check if the provided studentId is a user_id or student_profile.id, and resolve the true PK
    try {
      const { data: profileRow } = await supabase
        .from('student_profile')
        .select('id')
        .or(`id.eq.${studentId},user_id.eq.${studentId}`)
        .limit(1)
        .maybeSingle()

      if (profileRow?.id) {
        resolvedId = profileRow.id
      }
    } catch (resolveErr) {
      console.warn('[CandidateEmbedding] Notice resolving student record ID:', resolveErr)
    }

    console.log(`[CandidateEmbedding] Invoking genarte-candidate-embedding for student record ID: ${resolvedId}`)

    const payload = {
      student_id: resolvedId,
      id: resolvedId,
    }

    const { data, error } = await supabase.functions.invoke('genarte-candidate-embedding', {
      body: payload,
    })

    if (error) {
      console.warn(`[CandidateEmbedding] genarte-candidate-embedding returned error for ${resolvedId}:`, error.message)
      return { success: false, studentId: resolvedId, error: error.message }
    }

    console.log(`[CandidateEmbedding] Embedding and search_text successfully generated for ${resolvedId}:`, data)
    return { success: true, studentId: resolvedId, data }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error generating candidate embedding'
    console.error(`[CandidateEmbedding] Exception invoking genarte-candidate-embedding for ${studentId}:`, msg)
    return { success: false, studentId, error: msg }
  }
}

/**
 * Searches for active student profiles that are missing 1536-dimensional embeddings,
 * and triggers 'genarte-candidate-embedding' for each of them.
 */
export async function syncMissingCandidateEmbeddings(limit = 15): Promise<CandidateEmbeddingResult[]> {
  const results: CandidateEmbeddingResult[] = []

  try {
    const { data: missingCandidates, error } = await supabase
      .from('student_profile')
      .select('id, full_name')
      .is('embedding', null)
      .limit(limit)

    if (error) {
      console.warn('[CandidateEmbedding] Query error finding candidates without embeddings:', error.message)
      return results
    }

    if (missingCandidates && missingCandidates.length > 0) {
      console.log(`[CandidateEmbedding] Found ${missingCandidates.length} candidates missing embeddings. Synchronizing...`)
      for (const candidate of missingCandidates) {
        if (!candidate.id) continue
        console.log(`[CandidateEmbedding] Generating embedding for "${candidate.full_name || 'Candidate'}" (${candidate.id})...`)
        const res = await generateCandidateEmbedding(candidate.id)
        results.push(res)
      }
    }
  } catch (err: unknown) {
    console.warn('[CandidateEmbedding] syncMissingCandidateEmbeddings exception:', err)
  }

  return results
}
