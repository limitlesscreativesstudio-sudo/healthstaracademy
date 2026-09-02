REVOKE ALL ON FUNCTION public.attach_instructors_to_course() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.attach_instructor_to_all_courses() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.shares_course_with(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.shares_course_with(uuid) TO authenticated;