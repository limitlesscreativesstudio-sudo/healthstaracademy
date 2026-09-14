UPDATE public.cohorts
SET status = 'closed', updated_at = now()
WHERE is_template = false
  AND start_date < DATE '2027-01-04'
  AND status <> 'closed';