-- Notifications table for in-app bell
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all notifications"
ON public.notifications FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers fan out announcements as notifications to enrolled students + instructor
CREATE OR REPLACE FUNCTION public.fanout_announcement_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instructor UUID;
  v_course_title TEXT;
BEGIN
  SELECT instructor_id, title INTO v_instructor, v_course_title
  FROM public.courses WHERE id = NEW.course_id;

  INSERT INTO public.notifications (user_id, kind, title, body, link)
  SELECT DISTINCT e.user_id, 'announcement',
         COALESCE(v_course_title, 'Course') || ': ' || NEW.title,
         LEFT(COALESCE(NEW.body, ''), 280),
         '/portal/courses/' || NEW.course_id || '/announcements'
  FROM public.enrollments e
  WHERE e.course_id = NEW.course_id
    AND e.user_id <> COALESCE(NEW.posted_by, '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fanout_announcement ON public.lms_announcements;
CREATE TRIGGER trg_fanout_announcement
AFTER INSERT ON public.lms_announcements
FOR EACH ROW EXECUTE FUNCTION public.fanout_announcement_notifications();

-- Notify instructor when a submission arrives
CREATE OR REPLACE FUNCTION public.notify_submission_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instructor UUID;
  v_course_id UUID;
  v_asgn_title TEXT;
BEGIN
  SELECT a.course_id, a.title, c.instructor_id
    INTO v_course_id, v_asgn_title, v_instructor
  FROM public.assignments a
  JOIN public.courses c ON c.id = a.course_id
  WHERE a.id = NEW.assignment_id;

  IF v_instructor IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (v_instructor, 'submission',
            'New submission: ' || COALESCE(v_asgn_title, 'Assignment'),
            NULL,
            '/portal/teach/courses/' || v_course_id || '/assignments/' || NEW.assignment_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_submission ON public.submissions;
CREATE TRIGGER trg_notify_submission
AFTER INSERT ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_submission_received();