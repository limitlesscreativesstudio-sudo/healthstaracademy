
CREATE TABLE public.job_pipeline (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL UNIQUE,
  portal_user_id uuid,
  cohort_id uuid,
  stage text NOT NULL DEFAULT 'scheduled_exam',
  state_exam_date date,
  state_exam_location text DEFAULT '',
  state_exam_result text,
  certification_number text DEFAULT '',
  certification_date date,
  certification_expires date,
  job_search_status text DEFAULT 'not_started',
  employer_name text DEFAULT '',
  employer_city text DEFAULT '',
  job_title text DEFAULT '',
  hire_date date,
  hourly_wage numeric,
  shift_type text DEFAULT '',
  placement_source text DEFAULT '',
  notes text DEFAULT '',
  follow_up_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_pipeline_student ON public.job_pipeline(student_id);
CREATE INDEX idx_job_pipeline_cohort ON public.job_pipeline(cohort_id);
CREATE INDEX idx_job_pipeline_stage ON public.job_pipeline(stage);
CREATE INDEX idx_job_pipeline_portal_user ON public.job_pipeline(portal_user_id);

ALTER TABLE public.job_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage job pipeline"
ON public.job_pipeline FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Students view own job pipeline"
ON public.job_pipeline FOR SELECT
TO authenticated
USING (portal_user_id = auth.uid());

CREATE TRIGGER update_job_pipeline_updated_at
BEFORE UPDATE ON public.job_pipeline
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
