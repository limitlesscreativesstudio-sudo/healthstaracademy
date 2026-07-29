CREATE OR REPLACE FUNCTION public.notify_discussion_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_id uuid;
  v_title text;
  v_author uuid;
  v_name text;
BEGIN
  SELECT d.course_id, d.title, d.author_id
    INTO v_course_id, v_title, v_author
  FROM public.discussions d
  WHERE d.id = NEW.discussion_id;

  IF v_course_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.full_name INTO v_name FROM public.profiles p WHERE p.user_id = NEW.author_id;

  INSERT INTO public.notifications (user_id, kind, title, body, link)
  SELECT DISTINCT t.uid, 'discussion',
         COALESCE(v_name, 'Someone') || ' replied to: ' || COALESCE(v_title, 'a discussion'),
         LEFT(COALESCE(NEW.body, ''), 280),
         '/portal/courses/' || v_course_id || '?tab=discussions'
  FROM (
    SELECT v_author AS uid
    UNION
    SELECT r.author_id FROM public.discussion_replies r WHERE r.discussion_id = NEW.discussion_id
  ) t
  WHERE t.uid IS NOT NULL AND t.uid <> NEW.author_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_discussion_reply ON public.discussion_replies;
CREATE TRIGGER trg_notify_discussion_reply
AFTER INSERT ON public.discussion_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_discussion_reply();