INSERT INTO public.instructor_invites (email) VALUES
  ('healthstaracademy01@gmail.com'),
  ('limitlesscreativesstudio@gmail.com'),
  ('knelson4677@gmail.com'),
  ('agnesnamitala@gmail.com')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_invited_instructor boolean;
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

  RETURN NEW;
END;
$function$;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'instructor'::app_role
FROM auth.users u
JOIN public.instructor_invites i ON lower(i.email) = lower(u.email)
ON CONFLICT DO NOTHING;