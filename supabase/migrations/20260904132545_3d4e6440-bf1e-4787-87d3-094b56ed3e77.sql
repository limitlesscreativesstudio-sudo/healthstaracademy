UPDATE public.lms_pages
SET body_html = '<p><a class="hsa-join-btn" href="https://us06web.zoom.us/j/5379402049?pwd=UfHHksbmC0bg7ZQZu0aZB0LBtSWfh2.1" target="_blank" rel="noopener noreferrer">Join the Live Class on Zoom</a></p>' || body_html,
    updated_at = now()
WHERE title ILIKE '%conference%'
  AND body_html NOT ILIKE '%hsa-join-btn%';

DELETE FROM public.quiz_attempts qa
USING public.quizzes q
WHERE qa.quiz_id = q.id
  AND qa.submitted_at IS NULL
  AND (SELECT count(*) FROM public.quiz_questions qq WHERE qq.quiz_id = q.id) = 0;