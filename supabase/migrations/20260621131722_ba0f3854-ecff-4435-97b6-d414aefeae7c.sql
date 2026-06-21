
CREATE POLICY "Instructors view their cohort students" ON public.students
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'instructor'::app_role)
    AND cohort_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.instructor_id = auth.uid()
        AND c.cohort_id = students.cohort_id
    )
  );
