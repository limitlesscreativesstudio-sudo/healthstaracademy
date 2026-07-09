
CREATE TABLE public.pending_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  email text NOT NULL,
  section text,
  invited_by uuid,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  status text NOT NULL DEFAULT 'pending'
);

CREATE UNIQUE INDEX pending_enrollments_course_email_key
  ON public.pending_enrollments (course_id, lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_enrollments TO authenticated;
GRANT ALL ON public.pending_enrollments TO service_role;

ALTER TABLE public.pending_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors view pending invites"
  ON public.pending_enrollments FOR SELECT TO authenticated
  USING (public.is_instructor_of(course_id) OR public.is_admin());

CREATE POLICY "Instructors create pending invites"
  ON public.pending_enrollments FOR INSERT TO authenticated
  WITH CHECK (public.is_instructor_of(course_id) OR public.is_admin());

CREATE POLICY "Instructors delete pending invites"
  ON public.pending_enrollments FOR DELETE TO authenticated
  USING (public.is_instructor_of(course_id) OR public.is_admin());

CREATE POLICY "Instructors update pending invites"
  ON public.pending_enrollments FOR UPDATE TO authenticated
  USING (public.is_instructor_of(course_id) OR public.is_admin());

-- Extend handle_new_user to auto-enroll invited students
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_invited_instructor boolean;
  pe RECORD;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = now();

  SELECT EXISTS (
    SELECT 1 FROM public.instructor_invites WHERE lower(email) = lower(NEW.email)
  ) INTO is_invited_instructor;

  IF is_invited_instructor THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'instructor')
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;

  -- Promote pending course invitations into real enrollments
  FOR pe IN
    SELECT id, course_id
    FROM public.pending_enrollments
    WHERE lower(email) = lower(NEW.email) AND status = 'pending'
  LOOP
    INSERT INTO public.enrollments (course_id, user_id, role)
    VALUES (pe.course_id, NEW.id, 'student')
    ON CONFLICT (course_id, user_id) DO NOTHING;

    UPDATE public.pending_enrollments
      SET status = 'accepted', accepted_at = now()
      WHERE id = pe.id;
  END LOOP;

  RETURN NEW;
END;
$function$;
