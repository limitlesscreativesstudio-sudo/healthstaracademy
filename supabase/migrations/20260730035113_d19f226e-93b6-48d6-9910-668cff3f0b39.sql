INSERT INTO public.quiz_questions (quiz_id, "position", question_type, prompt, options, correct_answer, points)
SELECT dq.id, qq."position", qq.question_type, qq.prompt, qq.options, qq.correct_answer, qq.points
FROM public.quizzes sq
JOIN public.quiz_questions qq ON qq.quiz_id = sq.id
JOIN public.quizzes dq ON dq.title = sq.title AND dq.course_id = '8b8888ae-60e1-4189-b701-b9b1307cf916'
WHERE sq.course_id = '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b'
  AND sq.title = 'Module 07 Quiz'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions x WHERE x.quiz_id = dq.id);