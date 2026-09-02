UPDATE public.quizzes q
SET published = false, updated_at = now()
WHERE q.published
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions x WHERE x.quiz_id = q.id);

UPDATE public.module_items mi
SET published = false, updated_at = now()
WHERE mi.item_type = 'quiz'
  AND mi.published
  AND EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = mi.content_ref
      AND NOT EXISTS (SELECT 1 FROM public.quiz_questions x WHERE x.quiz_id = q.id)
  );