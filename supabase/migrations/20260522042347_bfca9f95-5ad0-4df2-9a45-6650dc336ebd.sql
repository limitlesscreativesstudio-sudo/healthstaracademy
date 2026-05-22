
CREATE TABLE public.course_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_invites_token ON public.course_invites(token);
CREATE INDEX idx_course_invites_course ON public.course_invites(course_id);
CREATE UNIQUE INDEX idx_course_invites_unique_pending ON public.course_invites(course_id, lower(email)) WHERE accepted_at IS NULL;

ALTER TABLE public.course_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors manage invites"
  ON public.course_invites FOR ALL
  TO authenticated
  USING (public.is_instructor_of(course_id) OR public.is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR public.is_admin());
