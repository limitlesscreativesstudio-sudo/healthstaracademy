
-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT,
  term TEXT,
  description TEXT,
  cover_image_url TEXT,
  instructor_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','ta','observer')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);

CREATE OR REPLACE FUNCTION public.is_instructor_of(_course_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.courses WHERE id = _course_id AND instructor_id = auth.uid())
$$;
REVOKE EXECUTE ON FUNCTION public.is_instructor_of(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_instructor_of(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_enrolled_in(_course_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = _course_id AND user_id = auth.uid())
$$;
REVOKE EXECUTE ON FUNCTION public.is_enrolled_in(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_enrolled_in(UUID) TO authenticated;

CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_modules_course ON public.modules(course_id);

CREATE TABLE public.module_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('page','file','link','video','assignment','quiz','discussion')),
  content_ref UUID,
  url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.module_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_module_items_module ON public.module_items(module_id);

CREATE TABLE public.lms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body_html TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_pages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lms_pages_course ON public.lms_pages(course_id);

CREATE TABLE public.lms_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  storage_provider TEXT NOT NULL DEFAULT 'cloud' CHECK (storage_provider IN ('cloud','drive','external')),
  storage_path TEXT,
  drive_file_id TEXT,
  external_url TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_files ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lms_files_course ON public.lms_files(course_id);

CREATE TABLE public.lms_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  posted_by UUID,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_announcements ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lms_announcements_course ON public.lms_announcements(course_id);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  -- Default new users to 'student' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_modules_updated BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_module_items_updated BEFORE UPDATE ON public.module_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lms_pages_updated BEFORE UPDATE ON public.lms_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint on user_roles if missing
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role);

-- RLS POLICIES
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all profiles" ON public.profiles
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Courses viewable by enrolled, instructor, admin" ON public.courses
  FOR SELECT TO authenticated USING (
    is_admin() OR instructor_id = auth.uid()
    OR (status = 'published' AND public.is_enrolled_in(id))
  );
CREATE POLICY "Instructors create courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (
    instructor_id = auth.uid() AND (has_role(auth.uid(), 'instructor') OR is_admin())
  );
CREATE POLICY "Instructors update own courses" ON public.courses
  FOR UPDATE TO authenticated USING (instructor_id = auth.uid() OR is_admin());
CREATE POLICY "Instructors delete own courses" ON public.courses
  FOR DELETE TO authenticated USING (instructor_id = auth.uid() OR is_admin());

CREATE POLICY "View own enrollments or instructor view" ON public.enrollments
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_instructor_of(course_id) OR is_admin()
  );
CREATE POLICY "Instructors create enrollments" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (public.is_instructor_of(course_id) OR is_admin());
CREATE POLICY "Instructors update enrollments" ON public.enrollments
  FOR UPDATE TO authenticated USING (public.is_instructor_of(course_id) OR is_admin());
CREATE POLICY "Instructors delete enrollments" ON public.enrollments
  FOR DELETE TO authenticated USING (public.is_instructor_of(course_id) OR is_admin());

CREATE POLICY "View modules if enrolled or instructor" ON public.modules
  FOR SELECT TO authenticated USING (
    is_admin() OR public.is_instructor_of(course_id)
    OR (published AND public.is_enrolled_in(course_id))
  );
CREATE POLICY "Instructors manage modules" ON public.modules
  FOR ALL TO authenticated
  USING (public.is_instructor_of(course_id) OR is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR is_admin());

CREATE POLICY "View module items if enrolled or instructor" ON public.module_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.modules m WHERE m.id = module_id AND (
        is_admin() OR public.is_instructor_of(m.course_id)
        OR (module_items.published AND m.published AND public.is_enrolled_in(m.course_id))
      )
    )
  );
CREATE POLICY "Instructors manage module items" ON public.module_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.modules m WHERE m.id = module_id AND (public.is_instructor_of(m.course_id) OR is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.modules m WHERE m.id = module_id AND (public.is_instructor_of(m.course_id) OR is_admin())));

CREATE POLICY "View pages if enrolled or instructor" ON public.lms_pages
  FOR SELECT TO authenticated USING (is_admin() OR public.is_instructor_of(course_id) OR public.is_enrolled_in(course_id));
CREATE POLICY "Instructors manage pages" ON public.lms_pages
  FOR ALL TO authenticated
  USING (public.is_instructor_of(course_id) OR is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR is_admin());

CREATE POLICY "View files if enrolled or instructor" ON public.lms_files
  FOR SELECT TO authenticated USING (is_admin() OR public.is_instructor_of(course_id) OR public.is_enrolled_in(course_id));
CREATE POLICY "Instructors manage files" ON public.lms_files
  FOR ALL TO authenticated
  USING (public.is_instructor_of(course_id) OR is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR is_admin());

CREATE POLICY "View announcements if enrolled or instructor" ON public.lms_announcements
  FOR SELECT TO authenticated USING (is_admin() OR public.is_instructor_of(course_id) OR public.is_enrolled_in(course_id));
CREATE POLICY "Instructors manage announcements" ON public.lms_announcements
  FOR ALL TO authenticated
  USING (public.is_instructor_of(course_id) OR is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR is_admin());

-- Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Course assets publicly readable" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'course-assets');
CREATE POLICY "Authenticated upload course assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-assets');
CREATE POLICY "Authenticated update own course assets" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'course-assets' AND owner = auth.uid());
CREATE POLICY "Authenticated delete own course assets" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'course-assets' AND owner = auth.uid());
