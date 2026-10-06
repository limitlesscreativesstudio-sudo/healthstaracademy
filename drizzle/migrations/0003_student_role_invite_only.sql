CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_invited_instructor boolean;
  is_invited_student boolean;
  pe RECORD;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = now();

  SELECT EXISTS (SELECT 1 FROM public.instructor_invites WHERE lower(email) = lower(NEW.email))
    INTO is_invited_instructor;
  IF is_invited_instructor THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'instructor') ON CONFLICT DO NOTHING;
  END IF;

  -- Student access only for people an instructor actually invited.
  SELECT EXISTS (SELECT 1 FROM public.pending_enrollments WHERE lower(email) = lower(NEW.email) AND status = 'pending')
      OR EXISTS (SELECT 1 FROM public.course_invites WHERE lower(email) = lower(NEW.email) AND accepted_at IS NULL AND expires_at > now())
    INTO is_invited_student;
  IF is_invited_student THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  END IF;

  FOR pe IN
    SELECT id, course_id FROM public.pending_enrollments
    WHERE lower(email) = lower(NEW.email) AND status = 'pending'
  LOOP
    INSERT INTO public.enrollments (course_id, user_id, role)
    VALUES (pe.course_id, NEW.id, 'student')
    ON CONFLICT (course_id, user_id) DO NOTHING;
    UPDATE public.pending_enrollments SET status = 'accepted', accepted_at = now() WHERE id = pe.id;
  END LOOP;

  RETURN NEW;
END;
$$;