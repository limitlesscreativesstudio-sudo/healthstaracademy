
-- 1. competitor_schools
CREATE TABLE public.competitor_schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  website text,
  city text,
  state text DEFAULT 'CA',
  logo_url text,
  description text,
  is_hsa boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.competitor_schools TO anon, authenticated;
GRANT ALL ON public.competitor_schools TO authenticated;
GRANT ALL ON public.competitor_schools TO service_role;
ALTER TABLE public.competitor_schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active schools" ON public.competitor_schools
  FOR SELECT USING (active = true);
CREATE POLICY "Admins manage schools" ON public.competitor_schools
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_competitor_schools_updated
  BEFORE UPDATE ON public.competitor_schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. competitor_facts
CREATE TABLE public.competitor_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.competitor_schools(id) ON DELETE CASCADE,
  attribute text NOT NULL,
  value_text text,
  value_numeric numeric,
  source_url text,
  confidence text NOT NULL DEFAULT 'medium',
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, attribute)
);
GRANT SELECT ON public.competitor_facts TO anon, authenticated;
GRANT ALL ON public.competitor_facts TO authenticated;
GRANT ALL ON public.competitor_facts TO service_role;
ALTER TABLE public.competitor_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view facts" ON public.competitor_facts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.competitor_schools s WHERE s.id = school_id AND s.active = true)
  );
CREATE POLICY "Admins manage facts" ON public.competitor_facts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_competitor_facts_updated
  BEFORE UPDATE ON public.competitor_facts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. competitor_pages (HSA vs X landing pages)
CREATE TABLE public.competitor_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid NOT NULL REFERENCES public.competitor_schools(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_description text,
  tldr text,
  hero_image_url text,
  hero_image_alt text,
  body_markdown text NOT NULL,
  faq jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.competitor_pages TO anon, authenticated;
GRANT ALL ON public.competitor_pages TO authenticated;
GRANT ALL ON public.competitor_pages TO service_role;
ALTER TABLE public.competitor_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published pages" ON public.competitor_pages
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage pages" ON public.competitor_pages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_competitor_pages_updated
  BEFORE UPDATE ON public.competitor_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed schools
INSERT INTO public.competitor_schools (slug, name, website, city, state, is_hsa, description) VALUES
  ('health-star-academy', 'Health Star Academy', 'https://healthstaracademy.org', 'Stockton', 'CA', true, 'CDPH-approved hybrid CNA program serving Stockton, Lodi, and Hayward.'),
  ('unitek-college', 'Unitek College', 'https://www.unitekcollege.edu', 'Hayward', 'CA', false, 'Private career college with CNA programs across the Bay Area.'),
  ('milan-institute', 'Milan Institute', 'https://www.milaninstitute.edu', 'Stockton', 'CA', false, 'Career school offering CNA training in the Central Valley.'),
  ('gurnick-academy', 'Gurnick Academy of Medical Arts', 'https://gurnick.edu', 'Modesto', 'CA', false, 'Allied health school with CNA programs in Northern California.'),
  ('american-red-cross-sacramento', 'American Red Cross (Sacramento)', 'https://www.redcross.org/take-a-class', 'Sacramento', 'CA', false, 'Nonprofit provider of CNA courses in Sacramento.'),
  ('angeles-college', 'Angeles College', 'https://angelescollege.edu', 'Los Angeles', 'CA', false, 'Private college offering CNA and allied health programs.'),
  ('cambridge-junior-college', 'Cambridge Junior College', 'https://cambridge.edu', 'Yuba City', 'CA', false, 'Career college with CNA programs in Northern California.'),
  ('casa-loma-college', 'Casa Loma College', 'https://casalomacollege.edu', 'Van Nuys', 'CA', false, 'Healthcare-focused college offering CNA training.');

-- Seed baseline facts for HSA (accurate)
WITH hsa AS (SELECT id FROM public.competitor_schools WHERE slug = 'health-star-academy')
INSERT INTO public.competitor_facts (school_id, attribute, value_text, value_numeric, confidence, source_url) VALUES
  ((SELECT id FROM hsa), 'tuition', '$2,499 total ($175 enrollment fee)', 2499, 'high', 'https://healthstaracademy.org/programs'),
  ((SELECT id FROM hsa), 'program_length', '6 weeks (Daytime) or 8 weekends', NULL, 'high', 'https://healthstaracademy.org/programs'),
  ((SELECT id FROM hsa), 'schedule', 'Hybrid — online theory, in-person clinicals', NULL, 'high', 'https://healthstaracademy.org/programs'),
  ((SELECT id FROM hsa), 'hybrid', 'Yes', 1, 'high', 'https://healthstaracademy.org'),
  ((SELECT id FROM hsa), 'clinical_sites', 'Stockton, Lodi, Hayward', NULL, 'high', 'https://healthstaracademy.org/locations'),
  ((SELECT id FROM hsa), 'accreditation', 'CDPH approved · BBB accredited', NULL, 'high', 'https://healthstaracademy.org/about'),
  ((SELECT id FROM hsa), 'payment_plans', 'Denefits financing available', NULL, 'high', 'https://healthstaracademy.org/programs'),
  ((SELECT id FROM hsa), 'class_size', 'Small cohorts (15-25 students)', NULL, 'high', 'https://healthstaracademy.org');
