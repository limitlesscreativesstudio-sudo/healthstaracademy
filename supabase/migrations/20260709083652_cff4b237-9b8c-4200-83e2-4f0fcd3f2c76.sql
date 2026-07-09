
-- Discussions
CREATE TABLE public.discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussions TO authenticated;
GRANT ALL ON public.discussions TO service_role;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View discussions if enrolled or instructor" ON public.discussions FOR SELECT
  TO authenticated USING (public.is_admin() OR public.is_instructor_of(course_id) OR public.is_enrolled_in(course_id));
CREATE POLICY "Create discussions if enrolled or instructor" ON public.discussions FOR INSERT
  TO authenticated WITH CHECK (author_id = auth.uid() AND (public.is_admin() OR public.is_instructor_of(course_id) OR public.is_enrolled_in(course_id)));
CREATE POLICY "Update own discussion or instructor" ON public.discussions FOR UPDATE
  TO authenticated USING (author_id = auth.uid() OR public.is_admin() OR public.is_instructor_of(course_id));
CREATE POLICY "Delete own discussion or instructor" ON public.discussions FOR DELETE
  TO authenticated USING (author_id = auth.uid() OR public.is_admin() OR public.is_instructor_of(course_id));
CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON public.discussions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussion_replies TO authenticated;
GRANT ALL ON public.discussion_replies TO service_role;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View replies if enrolled or instructor" ON public.discussion_replies FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.discussions d WHERE d.id = discussion_id
      AND (public.is_admin() OR public.is_instructor_of(d.course_id) OR public.is_enrolled_in(d.course_id)))
  );
CREATE POLICY "Post replies if enrolled or instructor" ON public.discussion_replies FOR INSERT
  TO authenticated WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.discussions d WHERE d.id = discussion_id
      AND (public.is_admin() OR public.is_instructor_of(d.course_id) OR public.is_enrolled_in(d.course_id)))
  );
CREATE POLICY "Delete own reply or instructor" ON public.discussion_replies FOR DELETE
  TO authenticated USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.discussions d WHERE d.id = discussion_id
      AND (public.is_admin() OR public.is_instructor_of(d.course_id)))
  );
