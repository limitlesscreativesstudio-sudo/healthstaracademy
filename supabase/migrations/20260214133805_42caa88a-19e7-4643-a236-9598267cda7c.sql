-- Allow public (anonymous) users to read open cohorts
CREATE POLICY "Anyone can view cohorts"
ON public.cohorts
FOR SELECT
USING (true);