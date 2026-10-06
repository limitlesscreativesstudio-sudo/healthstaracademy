CREATE UNIQUE INDEX IF NOT EXISTS grades_quiz_attempt_unique ON public.grades(quiz_attempt_id) WHERE quiz_attempt_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.record_quiz_submission(_attempt_id uuid,_user_id uuid,_answers jsonb,_question_scores jsonb,_earned numeric,_maximum numeric,_released boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_quiz_id uuid; v_course_id uuid; v_now timestamptz:=now();
BEGIN
 UPDATE public.quiz_attempts SET answers=_answers,submitted_at=v_now,question_scores=_question_scores,score=CASE WHEN _released THEN _earned ELSE NULL END,max_score=_maximum,grading_status=CASE WHEN _released THEN 'released' ELSE 'awaiting' END,graded_at=CASE WHEN _released THEN v_now ELSE NULL END
 WHERE id=_attempt_id AND user_id=_user_id AND submitted_at IS NULL RETURNING quiz_id INTO v_quiz_id;
 IF NOT FOUND THEN RETURN false; END IF;
 IF _released THEN
 SELECT course_id INTO v_course_id FROM public.quizzes WHERE id=v_quiz_id;
 INSERT INTO public.grades(course_id,user_id,quiz_attempt_id,score,max_score,graded_at) VALUES(v_course_id,_user_id,_attempt_id,_earned,_maximum,v_now)
 ON CONFLICT (quiz_attempt_id) WHERE quiz_attempt_id IS NOT NULL DO UPDATE SET score=EXCLUDED.score,max_score=EXCLUDED.max_score,graded_at=EXCLUDED.graded_at;
 END IF;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.record_quiz_submission(uuid,uuid,jsonb,jsonb,numeric,numeric,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_quiz_submission(uuid,uuid,jsonb,jsonb,numeric,numeric,boolean) TO service_role;
CREATE POLICY "Students read revised assessment documents in Files" ON public.lms_files FOR SELECT TO authenticated USING (public.is_enrolled_in(course_id) AND storage_path LIKE '%/assessment-revisions-20261006/%' AND storage_path NOT LIKE '%instructor-key%' AND COALESCE(file_name,name,'') NOT ILIKE '%Instructor Key%');
CREATE POLICY "Students download revised assessment documents in Files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='course-assets' AND name NOT LIKE '%instructor-key%' AND EXISTS(SELECT 1 FROM public.lms_files f WHERE f.storage_path=objects.name AND f.storage_path LIKE '%/assessment-revisions-20261006/%' AND COALESCE(f.file_name,f.name,'') NOT ILIKE '%Instructor Key%' AND public.is_enrolled_in(f.course_id)));