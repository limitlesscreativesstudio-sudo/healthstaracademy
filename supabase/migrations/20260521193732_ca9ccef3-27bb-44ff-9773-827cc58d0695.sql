
CREATE TABLE IF NOT EXISTS public.instructor_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instructor_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage instructor invites"
ON public.instructor_invites FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO public.instructor_invites (email) VALUES
  ('knelson4677@gmail.com'),
  ('agnesnamitala@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Update signup trigger to grant instructor role if email is on the invite list
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_invited_instructor boolean;
  requested_role text;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;

  SELECT EXISTS (
    SELECT 1 FROM public.instructor_invites WHERE lower(email) = lower(NEW.email)
  ) INTO is_invited_instructor;

  requested_role := NEW.raw_user_meta_data->>'requested_role';

  IF is_invited_instructor OR requested_role = 'instructor' THEN
    -- Only auto-grant instructor if pre-approved via invite list
    IF is_invited_instructor THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'instructor')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Everyone also gets student role as baseline
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Promote any existing accounts that match the invite list
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'instructor'::app_role
FROM auth.users u
JOIN public.instructor_invites i ON lower(i.email) = lower(u.email)
ON CONFLICT DO NOTHING;
