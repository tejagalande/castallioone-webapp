-- ==============================================================================
-- Migration: Optimize RLS Policies with InitPlan Auth Evaluation
-- Target Project: castallioone-backend (pmqtsplqnwexxnojeezg)
-- Impact: Prevents auth.uid() re-evaluation on every table row.
--         Executes auth checks once per statement (InitPlan).
--         Preserves 100% identical authorization logic for Web & Mobile.
-- ==============================================================================

-- 1. companies
DROP POLICY IF EXISTS "Owner can view their company" ON public.companies;
CREATE POLICY "Owner can view their company" ON public.companies
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Owner can update their company" ON public.companies;
CREATE POLICY "Owner can update their company" ON public.companies
  FOR UPDATE TO public
  USING ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Owner can delete their company" ON public.companies;
CREATE POLICY "Owner can delete their company" ON public.companies
  FOR DELETE TO public
  USING ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Owner can insert their company" ON public.companies;
CREATE POLICY "Owner can insert their company" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);

-- 2. user_profiles
DROP POLICY IF EXISTS "User can manage own profile" ON public.user_profiles;
CREATE POLICY "User can manage own profile" ON public.user_profiles
  FOR ALL TO public
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;
CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- 3. create_job_post
DROP POLICY IF EXISTS "select_job_post" ON public.create_job_post;
CREATE POLICY "select_job_post" ON public.create_job_post
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "insert_job_post" ON public.create_job_post;
CREATE POLICY "insert_job_post" ON public.create_job_post
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "update_job_post" ON public.create_job_post;
CREATE POLICY "update_job_post" ON public.create_job_post
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "delete_job_post" ON public.create_job_post;
CREATE POLICY "delete_job_post" ON public.create_job_post
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "create_job_post_owner_insert" ON public.create_job_post;
CREATE POLICY "create_job_post_owner_insert" ON public.create_job_post
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies c
    WHERE c.id = create_job_post.company_id AND c.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "create_job_post_owner_update" ON public.create_job_post;
CREATE POLICY "create_job_post_owner_update" ON public.create_job_post
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies c
    WHERE c.id = create_job_post.company_id AND c.owner_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies c
    WHERE c.id = create_job_post.company_id AND c.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "create_job_post_owner_delete" ON public.create_job_post;
CREATE POLICY "create_job_post_owner_delete" ON public.create_job_post
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies c
    WHERE c.id = create_job_post.company_id AND c.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "create_job_post_read_policy" ON public.create_job_post;
CREATE POLICY "create_job_post_read_policy" ON public.create_job_post
  FOR SELECT TO public
  USING (
    (status = 'active') OR
    (EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = create_job_post.company_id AND c.owner_id = (SELECT auth.uid())
    )) OR
    (EXISTS (
      SELECT 1 FROM saved_jobs sj
      WHERE sj.job_id = create_job_post.id AND sj.user_id = (SELECT auth.uid())
    ))
  );

-- 4. walk_in_drives
DROP POLICY IF EXISTS "select_walk_in_drive" ON public.walk_in_drives;
CREATE POLICY "select_walk_in_drive" ON public.walk_in_drives
  FOR SELECT TO authenticated
  USING (((SELECT auth.uid()) = posted_by) OR (status = 'active'));

DROP POLICY IF EXISTS "insert_walk_in_drive" ON public.walk_in_drives;
CREATE POLICY "insert_walk_in_drive" ON public.walk_in_drives
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "update_walk_in_drive" ON public.walk_in_drives;
CREATE POLICY "update_walk_in_drive" ON public.walk_in_drives
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "delete_walk_in_drive" ON public.walk_in_drives;
CREATE POLICY "delete_walk_in_drive" ON public.walk_in_drives
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "candidates can view their saved drives regardless of status" ON public.walk_in_drives;
CREATE POLICY "candidates can view their saved drives regardless of status" ON public.walk_in_drives
  FOR SELECT TO public
  USING (
    (status = 'active') OR
    (EXISTS (
      SELECT 1 FROM saved_jobs sj
      WHERE sj.drive_id = walk_in_drives.id AND sj.user_id = (SELECT auth.uid()) AND sj.item_type = 'drive'
    ))
  );

-- 5. job_applications
DROP POLICY IF EXISTS "candidate_view_own" ON public.job_applications;
CREATE POLICY "candidate_view_own" ON public.job_applications
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = candidate_id);

DROP POLICY IF EXISTS "candidate_insert_application" ON public.job_applications;
CREATE POLICY "candidate_insert_application" ON public.job_applications
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = candidate_id);

DROP POLICY IF EXISTS "company_view_applications" ON public.job_applications;
CREATE POLICY "company_view_applications" ON public.job_applications
  FOR SELECT TO authenticated
  USING (company_id IN (
    SELECT companies.id FROM companies
    WHERE companies.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "company_update_applications" ON public.job_applications;
CREATE POLICY "company_update_applications" ON public.job_applications
  FOR UPDATE TO authenticated
  USING (company_id IN (
    SELECT companies.id FROM companies
    WHERE companies.owner_id = (SELECT auth.uid())
  ));

-- 6. student_profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.student_profile;
CREATE POLICY "Users can update own profile" ON public.student_profile
  FOR UPDATE TO public
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 7. company_subscriptions
DROP POLICY IF EXISTS "company_select_subscription" ON public.company_subscriptions;
CREATE POLICY "company_select_subscription" ON public.company_subscriptions
  FOR SELECT TO authenticated
  USING (company_id IN (
    SELECT companies.id FROM companies
    WHERE companies.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "company_insert_subscription" ON public.company_subscriptions;
CREATE POLICY "company_insert_subscription" ON public.company_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (company_id IN (
    SELECT companies.id FROM companies
    WHERE companies.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "company_update_subscription" ON public.company_subscriptions;
CREATE POLICY "company_update_subscription" ON public.company_subscriptions
  FOR UPDATE TO authenticated
  USING (company_id IN (
    SELECT companies.id FROM companies
    WHERE companies.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "company_subscriptions_owner_read" ON public.company_subscriptions;
CREATE POLICY "company_subscriptions_owner_read" ON public.company_subscriptions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies c
    WHERE c.id = company_subscriptions.company_id AND c.owner_id = (SELECT auth.uid())
  ));

-- 8. notifications
DROP POLICY IF EXISTS "user_view_own_notifications" ON public.notifications;
CREATE POLICY "user_view_own_notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_update_own_notifications" ON public.notifications;
CREATE POLICY "user_update_own_notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 9. chatsession
DROP POLICY IF EXISTS "Users can view messages" ON public.chatsession;
CREATE POLICY "Users can view messages" ON public.chatsession
  FOR SELECT TO authenticated
  USING (
    ((SELECT auth.uid()) = sender_id) OR
    ((SELECT auth.uid()) = candidate_id) OR
    ((SELECT auth.uid()) IN (
      SELECT companies.owner_id FROM companies WHERE companies.id = chatsession.company_id
    ))
  );

DROP POLICY IF EXISTS "Users can insert messages" ON public.chatsession;
CREATE POLICY "Users can insert messages" ON public.chatsession
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = sender_id);

DROP POLICY IF EXISTS "Users can update their messages" ON public.chatsession;
CREATE POLICY "Users can update their messages" ON public.chatsession
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = sender_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.chatsession;
CREATE POLICY "Users can delete own messages" ON public.chatsession
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = sender_id);

DROP POLICY IF EXISTS "Allow participants to update read status" ON public.chatsession;
CREATE POLICY "Allow participants to update read status" ON public.chatsession
  FOR UPDATE TO public
  USING (
    ((SELECT auth.uid()) = candidate_id) OR
    (EXISTS (
      SELECT 1 FROM companies WHERE companies.id = chatsession.company_id AND companies.owner_id = (SELECT auth.uid())
    ))
  )
  WITH CHECK (
    ((SELECT auth.uid()) = candidate_id) OR
    (EXISTS (
      SELECT 1 FROM companies WHERE companies.id = chatsession.company_id AND companies.owner_id = (SELECT auth.uid())
    ))
  );

-- 10. saved_jobs
DROP POLICY IF EXISTS "Users can view their own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can view their own saved jobs" ON public.saved_jobs
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can save jobs" ON public.saved_jobs;
CREATE POLICY "Users can save jobs" ON public.saved_jobs
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can unsave jobs" ON public.saved_jobs;
CREATE POLICY "Users can unsave jobs" ON public.saved_jobs
  FOR DELETE TO public
  USING ((SELECT auth.uid()) = user_id);

-- 11. unlocked_profiles
DROP POLICY IF EXISTS "companies view own unlocks" ON public.unlocked_profiles;
CREATE POLICY "companies view own unlocks" ON public.unlocked_profiles
  FOR SELECT TO public
  USING (company_id IN (
    SELECT companies.id FROM companies WHERE companies.owner_id = (SELECT auth.uid())
  ));

-- 12. student_skills
DROP POLICY IF EXISTS "enable all for own skills" ON public.student_skills;
CREATE POLICY "enable all for own skills" ON public.student_skills
  FOR ALL TO public
  USING (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "user can insert own skliis " ON public.student_skills;
CREATE POLICY "user can insert own skliis " ON public.student_skills
  FOR INSERT TO authenticated
  WITH CHECK (student_id = (SELECT auth.uid()));

-- 13. student_experience
DROP POLICY IF EXISTS "delete_own_student_experience" ON public.student_experience;
CREATE POLICY "delete_own_student_experience" ON public.student_experience
  FOR DELETE TO authenticated
  USING (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "insert_own_student_experience" ON public.student_experience;
CREATE POLICY "insert_own_student_experience" ON public.student_experience
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "update_own_student_experience" ON public.student_experience;
CREATE POLICY "update_own_student_experience" ON public.student_experience
  FOR UPDATE TO authenticated
  USING (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ));

-- 14. certificates
DROP POLICY IF EXISTS "delete_own_certificates" ON public.certificates;
CREATE POLICY "delete_own_certificates" ON public.certificates
  FOR DELETE TO authenticated
  USING (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "insert_own_certificates" ON public.certificates;
CREATE POLICY "insert_own_certificates" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "update_own_certificates" ON public.certificates;
CREATE POLICY "update_own_certificates" ON public.certificates
  FOR UPDATE TO authenticated
  USING (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (student_id IN (
    SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
  ));

-- 15. interviews
DROP POLICY IF EXISTS "candidate_view_interviews" ON public.interviews;
CREATE POLICY "candidate_view_interviews" ON public.interviews
  FOR SELECT TO authenticated
  USING (
    ((SELECT auth.uid()) = candidate_id) OR
    (candidate_id IN (
      SELECT student_profile.id FROM student_profile WHERE student_profile.user_id = (SELECT auth.uid())
    ))
  );

DROP POLICY IF EXISTS "company_manage_interviews" ON public.interviews;
CREATE POLICY "company_manage_interviews" ON public.interviews
  FOR ALL TO authenticated
  USING (company_id IN (
    SELECT companies.id FROM companies
    WHERE (companies.owner_id = (SELECT auth.uid()) OR companies.id = (SELECT auth.uid()))
  ))
  WITH CHECK (company_id IN (
    SELECT companies.id FROM companies
    WHERE (companies.owner_id = (SELECT auth.uid()) OR companies.id = (SELECT auth.uid()))
  ));

-- 16. subscription_transactions
DROP POLICY IF EXISTS "Companies can view own subscription transactions" ON public.subscription_transactions;
CREATE POLICY "Companies can view own subscription transactions" ON public.subscription_transactions
  FOR SELECT TO public
  USING (company_id IN (
    SELECT companies.id FROM companies WHERE companies.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Company users can view own transactions" ON public.subscription_transactions;
CREATE POLICY "Company users can view own transactions" ON public.subscription_transactions
  FOR SELECT TO authenticated
  USING (company_id IN (
    SELECT companies.id FROM companies WHERE companies.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "company_insert_transactions" ON public.subscription_transactions;
CREATE POLICY "company_insert_transactions" ON public.subscription_transactions
  FOR INSERT TO authenticated
  WITH CHECK (company_id IN (
    SELECT companies.id FROM companies WHERE companies.owner_id = (SELECT auth.uid())
  ));

-- 17. user_presence
DROP POLICY IF EXISTS "Users manage own presence" ON public.user_presence;
CREATE POLICY "Users manage own presence" ON public.user_presence
  FOR ALL TO public
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 18. notification_batches
DROP POLICY IF EXISTS "Recruiter can read own batches" ON public.notification_batches;
CREATE POLICY "Recruiter can read own batches" ON public.notification_batches
  FOR SELECT TO public
  USING (company_id IN (
    SELECT companies.id FROM companies WHERE companies.owner_id = (SELECT auth.uid())
  ));

-- 19. company_job_taxonomies
DROP POLICY IF EXISTS "company_job_taxonomies_select" ON public.company_job_taxonomies;
CREATE POLICY "company_job_taxonomies_select" ON public.company_job_taxonomies
  FOR SELECT TO authenticated
  USING (company_id IN (
    SELECT companies.id FROM companies WHERE companies.owner_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "company_job_taxonomies_insert" ON public.company_job_taxonomies;
CREATE POLICY "company_job_taxonomies_insert" ON public.company_job_taxonomies
  FOR INSERT TO authenticated
  WITH CHECK (company_id IN (
    SELECT companies.id FROM companies WHERE companies.owner_id = (SELECT auth.uid())
  ));

-- 20. subscription_expiry_reminders
DROP POLICY IF EXISTS "Company owners can view their subscription reminders" ON public.subscription_expiry_reminders;
CREATE POLICY "Company owners can view their subscription reminders" ON public.subscription_expiry_reminders
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM (company_subscriptions cs JOIN companies c ON c.id = cs.company_id)
    WHERE cs.id = subscription_expiry_reminders.subscription_id AND c.owner_id = (SELECT auth.uid())
  ));

-- 21. admin_users
DROP POLICY IF EXISTS "Admins can read own admin row" ON public.admin_users;
CREATE POLICY "Admins can read own admin row" ON public.admin_users
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

