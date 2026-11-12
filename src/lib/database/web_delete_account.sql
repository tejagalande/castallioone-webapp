-- ==============================================================================
-- Function: web_delete_account
-- Target Project: castallio-one-backend (pmqtsplqnwexxnojeezg)
-- Security: SECURITY DEFINER, caller must be authenticated
-- Description: Completely and permanently deletes the authenticated user's
-- account, cascading through all non-cascading foreign keys (job posts, walk-ins,
-- student profiles, skills, unlocked profiles, applications) before removing
-- the auth.users record.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.web_delete_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_role text;
    v_company_id uuid;
    v_student_id uuid;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Fetch user role if recorded
    SELECT role INTO v_role 
    FROM public.user_profiles 
    WHERE id = v_user_id;

    -- =========================================================================
    -- 1. COMPANY / EMPLOYER SPECIFIC TEARDOWN
    -- =========================================================================
    FOR v_company_id IN 
        SELECT id FROM public.companies WHERE owner_id = v_user_id
    LOOP
        -- Delete unlocked profiles associated with company (no cascade FK)
        DELETE FROM public.unlocked_profiles WHERE company_id = v_company_id;

        -- Delete interviews linked to this company or its applications
        DELETE FROM public.interviews 
        WHERE company_id = v_company_id 
           OR job_application_id IN (
               SELECT id FROM public.job_applications WHERE company_id = v_company_id
           );

        -- Delete job applications submitted to this company's jobs
        DELETE FROM public.job_applications WHERE company_id = v_company_id;

        -- Delete saved jobs referring to company's job posts or walk-in drives
        DELETE FROM public.saved_jobs 
        WHERE job_id IN (SELECT id FROM public.create_job_post WHERE company_id = v_company_id OR posted_by = v_user_id)
           OR drive_id IN (SELECT id FROM public.walk_in_drives WHERE company_id = v_company_id OR posted_by = v_user_id);

        -- Disassociate notifications linked to company jobs
        UPDATE public.notifications 
        SET job_id = NULL 
        WHERE job_id IN (SELECT id FROM public.create_job_post WHERE company_id = v_company_id OR posted_by = v_user_id);

        -- Delete walk-in drives and job posts (posted_by references auth.users without cascade)
        DELETE FROM public.walk_in_drives WHERE company_id = v_company_id OR posted_by = v_user_id;
        DELETE FROM public.create_job_post WHERE company_id = v_company_id OR posted_by = v_user_id;

        -- Delete chat sessions
        DELETE FROM public.chatsession WHERE company_id = v_company_id;

        -- Delete subscription expiry reminders and transactions
        DELETE FROM public.subscription_expiry_reminders 
        WHERE subscription_id IN (SELECT id FROM public.company_subscriptions WHERE company_id = v_company_id);
        DELETE FROM public.subscription_transactions WHERE company_id = v_company_id;
        DELETE FROM public.company_subscriptions WHERE company_id = v_company_id;
        DELETE FROM public.company_job_taxonomies WHERE company_id = v_company_id;

        -- Delete company record
        DELETE FROM public.companies WHERE id = v_company_id;
    END LOOP;

    -- Clean up any residual job posts or walk-ins authored by this user directly
    DELETE FROM public.saved_jobs 
    WHERE job_id IN (SELECT id FROM public.create_job_post WHERE posted_by = v_user_id)
       OR drive_id IN (SELECT id FROM public.walk_in_drives WHERE posted_by = v_user_id);

    DELETE FROM public.walk_in_drives WHERE posted_by = v_user_id;
    DELETE FROM public.create_job_post WHERE posted_by = v_user_id;

    -- =========================================================================
    -- 2. TALENT / CANDIDATE SPECIFIC TEARDOWN
    -- =========================================================================
    FOR v_student_id IN 
        SELECT id FROM public.student_profile WHERE user_id = v_user_id OR id = v_user_id
    LOOP
        -- Delete non-cascading dependencies
        DELETE FROM public.unlocked_profiles WHERE student_id = v_student_id;
        DELETE FROM public.student_skills WHERE student_id = v_student_id;
        DELETE FROM public.student_skills_old WHERE student_id = v_student_id;
        DELETE FROM public.certificates WHERE student_id = v_student_id;
        DELETE FROM public.student_experience WHERE student_id = v_student_id;

        -- Delete student profile record
        DELETE FROM public.student_profile WHERE id = v_student_id;
    END LOOP;

    -- Delete candidate applications, interviews, saved jobs, chats
    DELETE FROM public.interviews WHERE candidate_id = v_user_id;
    DELETE FROM public.job_applications WHERE candidate_id = v_user_id;
    DELETE FROM public.saved_jobs WHERE user_id = v_user_id;
    DELETE FROM public.chatsession WHERE candidate_id = v_user_id OR sender_id = v_user_id;

    -- =========================================================================
    -- 3. COMMON CLEANUP (Notifications, presence, quotes, user_profiles)
    -- =========================================================================
    DELETE FROM public.notifications WHERE user_id = v_user_id;
    DELETE FROM public.user_presence WHERE user_id = v_user_id;
    DELETE FROM public.pricing_quotes WHERE user_id = v_user_id;
    DELETE FROM public.user_profiles WHERE id = v_user_id;

    -- Finally, permanently delete the auth.users record
    DELETE FROM auth.users WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.web_delete_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.web_delete_account() TO authenticated;

