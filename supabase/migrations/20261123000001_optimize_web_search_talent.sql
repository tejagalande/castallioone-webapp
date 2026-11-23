-- ==============================================================================
-- Migration: 20261123000001_optimize_web_search_talent.sql
-- Description: Fix critical 19.8s latency in web_search_talent by stripping
-- 78MB of bloated Base64 image payloads and sanitizing profile_image_url.
-- ==============================================================================

-- 1. Clean up existing bloated Base64 image strings from student_profile
-- (23 profiles had raw 3MB-11MB base64 strings totaling 78MB, bloating the JSON response)
UPDATE public.student_profile
SET profile_image_url = NULL
WHERE profile_image_url LIKE 'data:%';

-- 2. Deploy optimized web_search_talent RPC function
CREATE OR REPLACE FUNCTION public.web_search_talent(
    p_company_id uuid DEFAULT NULL::uuid,
    p_search text DEFAULT NULL::text,
    p_discipline text DEFAULT NULL::text,
    p_work_mode text DEFAULT NULL::text,
    p_sort text DEFAULT 'recent'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_company_id uuid := p_company_id;
    v_company_name text;
    v_cv_limit integer := 0;
    v_cvs_unlocked integer := 0;
    v_total_talent integer := 0;
    v_embedded_talent integer := 0;
    v_search text := NULLIF(TRIM(p_search), '');
    v_result jsonb;
BEGIN
    -- 1. Resolve company if not explicitly passed
    IF v_company_id IS NULL THEN
        SELECT id, name INTO v_company_id, v_company_name
        FROM companies
        WHERE owner_id = auth.uid()
        LIMIT 1;
    ELSE
        SELECT name INTO v_company_name
        FROM companies
        WHERE id = v_company_id
        LIMIT 1;
    END IF;

    -- 2. Fetch subscription unlock quotas if company exists
    IF v_company_id IS NOT NULL THEN
        SELECT 
            COALESCE(sp.cv_unlock_limit, 0),
            COALESCE(cs.cvs_unlocked, 0)
        INTO v_cv_limit, v_cvs_unlocked
        FROM company_subscriptions cs
        LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
        WHERE cs.company_id = v_company_id AND cs.is_active = true
        ORDER BY cs.created_at DESC
        LIMIT 1;
    END IF;

    -- 3. Fast counts using indexes (avoid scanning vector TOAST tables)
    SELECT COUNT(*), COUNT(embedding)
    INTO v_total_talent, v_embedded_talent
    FROM student_profile;

    -- 4. Query candidate talent profiles with CTEs to eliminate correlated subquery loops
    WITH exp_agg AS (
        SELECT 
            student_id,
            ROUND(
                COALESCE(
                    SUM(
                        EXTRACT(EPOCH FROM (COALESCE(se.end_date, CURRENT_DATE)::timestamp - se.start_date::timestamp))
                    ) / 31557600,
                    0
                )::numeric,
                1
            ) as years,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', se.id,
                        'role_title', se.role_title,
                        'organization_name', se.organization_name,
                        'contributions', se.contributions,
                        'start_date', se.start_date,
                        'end_date', se.end_date
                    ) ORDER BY se.start_date DESC NULLS LAST
                ),
                '[]'::jsonb
            ) as experiences
        FROM student_experience se
        GROUP BY student_id
    ),
    company_unlocked AS (
        SELECT student_id
        FROM unlocked_profiles
        WHERE v_company_id IS NOT NULL AND company_id = v_company_id
    )
    SELECT jsonb_build_object(
        'company_id', v_company_id,
        'company_name', COALESCE(v_company_name, 'Enterprise Studio'),
        'quota', jsonb_build_object(
            'cv_unlock_limit', v_cv_limit,
            'cvs_unlocked', v_cvs_unlocked,
            'remaining_cvs', GREATEST(0, v_cv_limit - v_cvs_unlocked)
        ),
        'total_talent_count', v_total_talent,
        'embedded_talent_count', v_embedded_talent,
        'candidates', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', sp.id,
                    'user_id', sp.user_id,
                    'full_name', COALESCE(sp.full_name, 'Anonymous Candidate'),
                    'bio', COALESCE(sp.bio, ''),
                    'email', CASE 
                        WHEN cu.student_id IS NOT NULL THEN sp.email 
                        ELSE regexp_replace(COALESCE(sp.email, ''), '^([^@]{2})[^@]+(@.*)$', '\1••••\2')
                    END,
                    'phone', CASE 
                        WHEN cu.student_id IS NOT NULL THEN sp.phone 
                        ELSE NULL 
                    END,
                    'location', COALESCE(sp.location, 'India'),
                    'discipline', COALESCE(sp.discipline, 'AEC Specialist'),
                    'institution', COALESCE(sp.institution, 'Engineering Institute'),
                    'graduation_year', COALESCE(sp.graduation_year, '2025'),
                    'portfolio_url', sp.portfolio_url,
                    -- Guard against multi-megabyte inline base64 images in directory listings
                    'profile_image_url', CASE 
                        WHEN sp.profile_image_url LIKE 'data:%' THEN NULL 
                        ELSE sp.profile_image_url 
                    END,
                    -- Guard against multi-megabyte inline base64 resumes in directory listings
                    'resume_file_url', CASE 
                        WHEN cu.student_id IS NOT NULL AND sp.resume_file_url NOT LIKE 'data:%' THEN sp.resume_file_url 
                        ELSE NULL 
                    END,
                    'has_resume', (sp.resume_file_url IS NOT NULL AND sp.resume_file_url != ''),
                    'work_mode', COALESCE(sp.work_mode, 'Flexible'),
                    'expected_ctc', COALESCE(sp.expected_ctc, 'Negotiable'),
                    'notice_period', COALESCE(sp.notice_period, 'Immediately'),
                    'linkedin_url', sp.linkedin_url,
                    'is_unlocked', (cu.student_id IS NOT NULL),
                    'has_embedding', (sp.embedding IS NOT NULL),
                    'experience_years', COALESCE(ea.years, 0),
                    'skills', COALESCE(ss.skills, '[]'::jsonb),
                    'experiences', COALESCE(ea.experiences, '[]'::jsonb)
                ) ORDER BY 
                    CASE WHEN p_sort = 'experience' THEN COALESCE(ea.years, 0) END DESC NULLS LAST,
                    CASE WHEN p_sort = 'name' THEN sp.full_name END ASC NULLS LAST,
                    sp.created_at DESC NULLS LAST
            ),
            '[]'::jsonb
        )
    )
    INTO v_result
    FROM student_profile sp
    LEFT JOIN student_skills ss ON ss.student_id = sp.id
    LEFT JOIN exp_agg ea ON ea.student_id = sp.id
    LEFT JOIN company_unlocked cu ON cu.student_id = sp.id
    WHERE (
        p_discipline IS NULL OR p_discipline = 'all' OR sp.discipline = p_discipline
    )
    AND (
        p_work_mode IS NULL OR p_work_mode = 'all' OR sp.work_mode ILIKE '%' || p_work_mode || '%'
    )
    AND (
        v_search IS NULL OR (
            sp.full_name ILIKE '%' || v_search || '%' OR
            sp.discipline ILIKE '%' || v_search || '%' OR
            sp.location ILIKE '%' || v_search || '%' OR
            sp.institution ILIKE '%' || v_search || '%' OR
            sp.bio ILIKE '%' || v_search || '%' OR
            ss.skills::text ILIKE '%' || v_search || '%'
        )
    );

    RETURN v_result;
END;
$function$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.web_search_talent(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.web_search_talent(uuid, text, text, text, text) TO service_role;
