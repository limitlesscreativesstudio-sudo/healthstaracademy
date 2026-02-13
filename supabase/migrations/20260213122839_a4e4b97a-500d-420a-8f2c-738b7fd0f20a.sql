
-- Role system for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Shorthand for current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS on user_roles: only admins can view/manage
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin());

-- Cohorts table
CREATE TABLE public.cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'HSA Certified Nursing Assistant (CNA)',
    start_date DATE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'full')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cohorts" ON public.cohorts
  FOR ALL TO authenticated USING (public.is_admin());

-- Students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    has_diploma BOOLEAN DEFAULT false,
    is_over_18 BOOLEAN DEFAULT true,
    has_valid_id BOOLEAN DEFAULT false,
    has_ssn BOOLEAN DEFAULT false,
    can_pass_background BOOLEAN DEFAULT false,
    has_health_proof BOOLEAN DEFAULT false,
    has_transportation BOOLEAN DEFAULT false,
    qualification_status TEXT NOT NULL DEFAULT 'pending' CHECK (qualification_status IN ('pending', 'qualified', 'disqualified')),
    qualification_notes TEXT,
    needs_entrance_exam BOOLEAN DEFAULT false,
    needs_parent_consent BOOLEAN DEFAULT false,
    enrollment_status TEXT NOT NULL DEFAULT 'pre_qualification' CHECK (enrollment_status IN (
      'pre_qualification', 'qualified', 'application_sent', 'documents_received',
      'livescan_sent', 'livescan_complete', 'tuition_sent', 'payment_complete',
      'orientation_scheduled', 'scrubs_requested', 'scrubs_received',
      'welcome_sent', 'enrolled', 'disqualified'
    )),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'financed')),
    payment_method TEXT,
    scrub_top_size TEXT,
    scrub_bottom_size TEXT,
    shipping_address TEXT,
    cohort_id UUID REFERENCES public.cohorts(id),
    selected_cohort_date DATE,
    orientation_date DATE,
    google_sheet_row INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL TO authenticated USING (public.is_admin());

-- Enrollment emails tracking
CREATE TABLE public.enrollment_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    email_type TEXT NOT NULL CHECK (email_type IN (
      'disqualified', 'qualified_welcome', 'livescan', 'tuition_options',
      'orientation', 'scrub_request', 'final_welcome'
    )),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'opened')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.enrollment_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage enrollment emails" ON public.enrollment_emails
  FOR ALL TO authenticated USING (public.is_admin());

-- Webhook logs for audit trail
CREATE TABLE public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL DEFAULT 'zapier',
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR ALL TO authenticated USING (public.is_admin());

-- Allow edge functions to insert via service role (no RLS check needed for service_role)
-- But we need a policy for the webhook endpoint (uses anon key)
CREATE POLICY "Webhooks can insert logs" ON public.webhook_logs
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Webhooks can insert students" ON public.students
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Webhooks can update students" ON public.students
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Webhooks can insert emails" ON public.enrollment_emails
  FOR INSERT TO anon WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cohorts_updated_at BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- View for admin dashboard
CREATE OR REPLACE VIEW public.admin_students_view AS
SELECT 
  s.*,
  c.name AS cohort_name,
  c.start_date AS cohort_start_date,
  (SELECT COUNT(*) FROM public.enrollment_emails e WHERE e.student_id = s.id) AS emails_sent_count,
  (SELECT MAX(e.sent_at) FROM public.enrollment_emails e WHERE e.student_id = s.id) AS last_email_sent
FROM public.students s
LEFT JOIN public.cohorts c ON s.cohort_id = c.id;
