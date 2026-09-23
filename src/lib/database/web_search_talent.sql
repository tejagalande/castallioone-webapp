-- Function: web_search_talent
-- Description: Queries student_profile candidates with verified skills, experience,
-- unlock status (checked against unlocked_profiles), and subscription quotas.
-- Prefix: 'web_' (Designated for Castallio One web-app)

CREATE OR REPLACE FUNCTION web_search_talent(
    p_company_id uuid DEFAULT NULL,
    p_search text DEFAULT NULL,
    p_discipline text DEFAULT NULL,
    p_work_mode text DEFAULT NULL,
    p_sort text DEFAULT 'recent'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_company_id uuid := p_company_id;
    v_company_name text;
    v_cv_limit integer := 0;
    v_cvs_unlocked integer := 0;
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

    -- 3. Query candidate talent profiles
    SELECT jsonb_build_object(
        'company_id', v_company_id,
        'company_name', COALESCE(v_company_name, 'Enterprise Studio'),
        'quota', jsonb_build_object(
            'cv_unlock_limit', v_cv_limit,
            'cvs_unlocked', v_cvs_unlocked,
            'remaining_cvs', GREATEST(0, v_cv_limit - v_cvs_unlocked)
        ),
        'total_talent_count', (SELECT COUNT(*) FROM student_profile),
        'embedded_talent_count', (SELECT COUNT(*) FROM student_profile WHERE embedding IS NOT NULL),
        'candidates', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', sp.id,
                    'user_id', sp.user_id,
                    'full_name', COALESCE(sp.full_name, 'Anonymous Candidate'),
                    'bio', COALESCE(sp.bio, ''),
                    'email', CASE 
                        WHEN is_unlocked THEN sp.email 
                        ELSE regexp_replace(COALESCE(sp.email, ''), '^([^@]{2})[^@]+(@.*)$', '\1••••\2')
                    END,
                    'phone', CASE 
                        WHEN is_unlocked THEN sp.phone 
                        ELSE NULL 
                    END,
                    'location', COALESCE(sp.location, 'India'),
                    'discipline', COALESCE(sp.discipline, 'AEC Specialist'),
                    'institution', COALESCE(sp.institution, 'Engineering Institute'),
                    'graduation_year', COALESCE(sp.graduation_year, '2025'),
                    'portfolio_url', sp.portfolio_url,
                    'profile_image_url', sp.profile_image_url,
                    'resume_file_url', sp.resume_file_url,
                    'has_resume', (sp.resume_file_url IS NOT NULL AND sp.resume_file_url != ''),
                    'work_mode', COALESCE(sp.work_mode, 'Flexible'),
                    'expected_ctc', COALESCE(sp.expected_ctc, 'Negotiable'),
                    'notice_period', COALESCE(sp.notice_period, 'Immediately'),
                    'linkedin_url', sp.linkedin_url,
                    'is_unlocked', is_unlocked,
                    'has_embedding', (sp.embedding IS NOT NULL),
                    'experience_years', exp_calc.years,
                    'skills', COALESCE(ss.skills, '[]'::jsonb),
                    'experiences', COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', se.id,
                                    'role_title', se.role_title,
                                    'organization_name', se.organization_name,
                                    'contributions', se.contributions,
                                    'start_date', se.start_date,
                                    'end_date', se.end_date
                                ) ORDER BY se.start_date DESC NULLS LAST
                            )
                            FROM student_experience se
                            WHERE se.student_id = sp.id
                        ),
                        '[]'::jsonb
                    )
                ) ORDER BY 
                    CASE WHEN p_sort = 'experience' THEN exp_calc.years END DESC NULLS LAST,
                    CASE WHEN p_sort = 'name' THEN sp.full_name END ASC NULLS LAST,
                    sp.created_at DESC NULLS LAST
            ),
            '[]'::jsonb
        )
    )
    INTO v_result
    FROM student_profile sp
    LEFT JOIN student_skills ss ON ss.student_id = sp.id
    LEFT JOIN LATERAL (
        SELECT ROUND(
            COALESCE(
                SUM(
                    EXTRACT(EPOCH FROM (COALESCE(se.end_date, CURRENT_DATE)::timestamp - se.start_date::timestamp))
                ) / 31557600,
                0
            )::numeric,
            1
        ) as years
        FROM student_experience se
        WHERE se.student_id = sp.id
    ) exp_calc ON true
    CROSS JOIN LATERAL (
        SELECT EXISTS (
            SELECT 1 FROM unlocked_profiles up
            WHERE up.company_id = v_company_id AND up.student_id = sp.id
        ) as is_unlocked
    ) unlock_check
    WHERE (
        p_discipline IS NULL OR p_discipline = 'all' OR sp.discipline = p_discipline
    )
    AND (
        p_work_mode IS NULL OR p_work_mode = 'all' OR sp.work_mode ILIKE '%' || p_work_mode || '%'
    )
    AND (
        p_search IS NULL OR p_search = '' OR (
            sp.full_name ILIKE '%' || p_search || '%' OR
            sp.discipline ILIKE '%' || p_search || '%' OR
            sp.location ILIKE '%' || p_search || '%' OR
            sp.institution ILIKE '%' || p_search || '%' OR
            sp.bio ILIKE '%' || p_search || '%' OR
            EXISTS (
                SELECT 1 FROM jsonb_array_elements(COALESCE(ss.skills, '[]'::jsonb)) elem
                WHERE (elem->>'skill_name') ILIKE '%' || p_search || '%'
                   OR elem::text ILIKE '%' || p_search || '%'
            )
        )
    );

    RETURN v_result;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION web_search_talent(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION web_search_talent(uuid, text, text, text, text) TO service_role;
