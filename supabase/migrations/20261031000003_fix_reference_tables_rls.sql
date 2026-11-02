-- ==============================================================================
-- Migration: Fix Reference Tables RLS Auth InitPlan
-- Target Project: castallioone-backend (pmqtsplqnwexxnojeezg)
-- Resolves: The final 2 auth_rls_initplan findings on reference tables
-- ==============================================================================

DROP POLICY IF EXISTS "insert_job_titles_ref" ON public.job_titles_ref;
CREATE POLICY "insert_job_titles_ref" ON public.job_titles_ref
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "insert_cities_ref" ON public.cities_ref;
CREATE POLICY "insert_cities_ref" ON public.cities_ref
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

