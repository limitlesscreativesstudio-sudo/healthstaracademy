-- Restrict anonymous access to cohorts to marketing-safe columns only
REVOKE SELECT ON public.cohorts FROM anon;

GRANT SELECT (id, name, start_date, status, capacity, program_type, clinical_site)
  ON public.cohorts TO anon;
GRANT SELECT (paid_in_full_link, payment_plan_link)
  ON public.cohorts TO anon;

-- Authenticated staff/admin access is unchanged
GRANT SELECT ON public.cohorts TO authenticated;
GRANT ALL ON public.cohorts TO service_role;

-- Keep the public read policy but exclude internal template rows from anonymous reads
DROP POLICY IF EXISTS "Anyone can view cohorts" ON public.cohorts;
CREATE POLICY "Public can view live cohorts"
  ON public.cohorts FOR SELECT TO anon
  USING (is_template = false);
CREATE POLICY "Authenticated can view cohorts"
  ON public.cohorts FOR SELECT TO authenticated
  USING (true);