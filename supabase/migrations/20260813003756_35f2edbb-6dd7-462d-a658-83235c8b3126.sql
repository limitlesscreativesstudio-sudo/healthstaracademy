-- Bring quiz/assignment/page visibility in line with the module items that reference them.
UPDATE public.quizzes q SET published = true
WHERE q.published = false
  AND EXISTS (SELECT 1 FROM public.module_items mi JOIN public.modules m ON m.id = mi.module_id
              WHERE mi.content_ref = q.id AND mi.item_type = 'quiz' AND mi.published AND m.published AND m.course_id = q.course_id);

UPDATE public.assignments a SET published = true
WHERE a.published = false
  AND EXISTS (SELECT 1 FROM public.module_items mi JOIN public.modules m ON m.id = mi.module_id
              WHERE mi.content_ref = a.id AND mi.item_type = 'assignment' AND mi.published AND m.published AND m.course_id = a.course_id);

UPDATE public.lms_pages p SET published = true
WHERE p.published = false
  AND EXISTS (SELECT 1 FROM public.module_items mi JOIN public.modules m ON m.id = mi.module_id
              WHERE mi.content_ref = p.id AND mi.item_type = 'page' AND mi.published AND m.published AND m.course_id = p.course_id);