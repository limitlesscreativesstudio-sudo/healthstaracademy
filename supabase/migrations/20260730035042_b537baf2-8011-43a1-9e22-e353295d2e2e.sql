WITH ins AS (
  INSERT INTO public.quizzes (course_id, title, instructions, time_limit_minutes, attempts_allowed, total_points, published, due_at)
  SELECT '8b8888ae-60e1-4189-b701-b9b1307cf916', q.title, q.instructions, q.time_limit_minutes, q.attempts_allowed, q.total_points, q.published, NULL
  FROM public.quizzes q
  WHERE q.course_id = '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b'
    AND q.title NOT IN (SELECT title FROM public.quizzes WHERE course_id = '8b8888ae-60e1-4189-b701-b9b1307cf916')
  RETURNING id, title
)
INSERT INTO public.quiz_questions (quiz_id, "position", question_type, prompt, options, correct_answer, points)
SELECT i.id, qq."position", qq.question_type, qq.prompt, qq.options, qq.correct_answer, qq.points
FROM ins i
JOIN public.quizzes sq ON sq.title = i.title AND sq.course_id = '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b'
JOIN public.quiz_questions qq ON qq.quiz_id = sq.id;