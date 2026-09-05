-- Day 8 conference pages, cloned from the Day 9 page content
WITH src AS (
  SELECT body_html FROM public.lms_pages WHERE id = '4f8ea487-dba5-46cb-8813-edff0c176e8e'
), ins AS (
  INSERT INTO public.lms_pages (course_id, title, body_html, published, front_page, position)
  SELECT v.course_id, 'Day 8 – Video Conference Info', src.body_html, true, false, 999
  FROM (VALUES
    ('917c5cbd-38e4-4c41-a812-c9e6cafc110b'::uuid, 'f78cbfac-1409-4600-b473-a12cb626db41'::uuid),
    ((SELECT course_id FROM public.modules WHERE id = '7046d88e-ec32-4111-a9b5-58820e7b9f73'), '7046d88e-ec32-4111-a9b5-58820e7b9f73'::uuid)
  ) AS v(course_id, module_id), src
  RETURNING id, course_id, title
)
INSERT INTO public.module_items (module_id, title, item_type, content_ref, position, published, indent)
SELECT m.id, 'Day 8 – Video Conference Info', 'page', ins.id, 0.5, true, 0
FROM ins
JOIN public.modules m ON m.course_id = ins.course_id
 AND m.id IN ('f78cbfac-1409-4600-b473-a12cb626db41','7046d88e-ec32-4111-a9b5-58820e7b9f73');
