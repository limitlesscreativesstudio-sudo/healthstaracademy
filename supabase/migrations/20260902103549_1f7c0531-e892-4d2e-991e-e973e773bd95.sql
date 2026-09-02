REVOKE ALL ON FUNCTION public.shares_course_as_instructor(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.shares_course_as_instructor(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.shares_course_as_instructor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_course_as_instructor(uuid) TO service_role;