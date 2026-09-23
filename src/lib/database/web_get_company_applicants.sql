-- Function: web_get_company_applicants
-- Description: Retrieves complete applicant tree (profile, skills, experience, job post, and interviews)
-- for the authenticated company in a single optimized database call.
-- Prefix: 'web_' (Designated for Castallio One web-app)

CREATE OR REPLACE FUNCTION web_get_company_applicants(p_company_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_company_id uuid := p_company_id;
    v_company_name text;
    v_result jsonb;
BEGIN
    -- 1. If not explicitly provided, resolve company associated with the authenticated user
    IF v_company_id IS NULL THEN
        SELECT id, name INTO v_company_id, v_company_name
        FROM companies
        WHERE owner_id = auth.uid() OR id = auth.uid()
        LIMIT 1;
    ELSE
        SELECT name INTO v_company_name
        FROM companies
        WHERE id = v_company_id
        LIMIT 1;
    END IF;

    -- If no company name resolved, fallback to sensible default
    IF v_company_name IS NULL THEN
        v_company_name := 'Enterprise Studio';
    END IF;

    -- 2. Join and aggregate the entire applicant tree directly in PostgreSQL
    SELECT jsonb_build_object(
        'company_id', v_company_id,
        'company_name', COALESCE(v_company_name, 'Enterprise Studio'),
        'applicants', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', ja.id,
                    'job_id', ja.job_id,
                    'company_id', COALESCE(ja.company_id, cjp.company_id, v_company_id),
                    'candidate_id', ja.candidate_id,
                    'status', COALESCE(ja.status, 'in_review'),
                    'is_starred', COALESCE(ja.is_starred, false),
                    'applied_at', ja.applied_at,
                    'updated_at', ja.updated_at,
                    'rejection_reason', ja.rejection_reason,
                    'job', jsonb_build_object(
                        'id', cjp.id,
                        'title', COALESCE(cjp.title, 'General Applicant'),
                        'location', COALESCE(cjp.location, 'Remote'),
                        'category', cjp.category,
                        'employment_type', cjp.employment_type
                    ),
                    'candidate', jsonb_build_object(
                        'id', sp.id,
                        'full_name', COALESCE(sp.full_name, 'Candidate'),
                        'bio', COALESCE(sp.bio, ''),
                        'email', COALESCE(sp.email, ''),
                        'phone', sp.phone,
                        'location', COALESCE(sp.location, 'India'),
                        'institution', COALESCE(sp.institution, 'AEC Institute'),
                        'discipline', COALESCE(sp.discipline, 'Civil & Structural'),
                        'graduation_year', COALESCE(sp.graduation_year, '2025'),
                        'portfolio_url', sp.portfolio_url,
                        'profile_image_url', sp.profile_image_url,
                        'resume_file_url', sp.resume_file_url,
                        'work_mode', COALESCE(sp.work_mode, 'Flexible'),
                        'expected_ctc', COALESCE(sp.expected_ctc, 'Open'),
                        'notice_period', COALESCE(sp.notice_period, 'Immediately'),
                        'linkedin_url', sp.linkedin_url,
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
                                WHERE se.student_id = sp.id OR se.student_id = sp.user_id
                            ),
                            '[]'::jsonb
                        )
                    ),
                    'interviews', COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', iv.id,
                                    'interview_date', iv.interview_date,
                                    'interview_time', iv.interview_time,
                                    'interview_type', iv.interview_type,
                                    'location_type', iv.location_type,
                                    'location_value', iv.location_value,
                                    'status', iv.status
                                ) ORDER BY iv.interview_date ASC
                            )
                            FROM interviews iv
                            WHERE iv.job_application_id = ja.id
                        ),
                        '[]'::jsonb
                    )
                ) ORDER BY ja.applied_at DESC
            ) FILTER (WHERE ja.id IS NOT NULL),
            '[]'::jsonb
        )
    )
    INTO v_result
    FROM job_applications ja
    LEFT JOIN create_job_post cjp ON cjp.id = ja.job_id
    LEFT JOIN student_profile sp ON (sp.user_id = ja.candidate_id OR sp.id = ja.candidate_id)
    LEFT JOIN student_skills ss ON (ss.student_id = sp.id OR ss.student_id = sp.user_id)
    WHERE (
        (v_company_id IS NOT NULL AND ja.company_id = v_company_id)
        OR (v_company_id IS NOT NULL AND cjp.company_id = v_company_id)
        OR (auth.uid() IS NOT NULL AND cjp.posted_by = auth.uid())
    );

    RETURN v_result;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION web_get_company_applicants(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION web_get_company_applicants(uuid) TO service_role;
