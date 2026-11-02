-- ==============================================================================
-- Migration: Add Covering Indexes for Unindexed Foreign Keys
-- Target Project: castallio-one-backend (pmqtsplqnwexxnojeezg)
-- Impact: Non-breaking, zero schema changes, transparent speedup for Web & Mobile
-- ==============================================================================

-- 1. Certificates
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates (student_id);

-- 2. Chat Session
CREATE INDEX IF NOT EXISTS idx_chatsession_candidate_id ON public.chatsession (candidate_id);
CREATE INDEX IF NOT EXISTS idx_chatsession_company_id ON public.chatsession (company_id);
CREATE INDEX IF NOT EXISTS idx_chatsession_sender_id ON public.chatsession (sender_id);

-- 3. Company Subscriptions
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_plan_id ON public.company_subscriptions (plan_id);

-- 4. Create Job Post
CREATE INDEX IF NOT EXISTS idx_create_job_post_company_id ON public.create_job_post (company_id);
CREATE INDEX IF NOT EXISTS idx_create_job_post_posted_by ON public.create_job_post (posted_by);

-- 5. Interviews
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON public.interviews (candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_company_id ON public.interviews (company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_application_id ON public.interviews (job_application_id);

-- 6. Job Applications
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON public.job_applications (candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_id ON public.job_applications (company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications (job_id);

-- 7. Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_batch_id ON public.notifications (batch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

-- 8. Saved Jobs
CREATE INDEX IF NOT EXISTS idx_saved_jobs_drive_id ON public.saved_jobs (drive_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs (job_id);

-- 9. Student Experience
CREATE INDEX IF NOT EXISTS idx_student_experience_student_id ON public.student_experience (student_id);

-- 10. Student Skills Old (if table exists)
CREATE INDEX IF NOT EXISTS idx_student_skills_old_student_id ON public.student_skills_old (student_id);

-- 11. Subscription Transactions
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_plan_id ON public.subscription_transactions (plan_id);

-- 12. Unlocked Profiles
CREATE INDEX IF NOT EXISTS idx_unlocked_profiles_student_id ON public.unlocked_profiles (student_id);

-- 13. Walk-In Drives
CREATE INDEX IF NOT EXISTS idx_walk_in_drives_company_id ON public.walk_in_drives (company_id);
CREATE INDEX IF NOT EXISTS idx_walk_in_drives_posted_by ON public.walk_in_drives (posted_by);

