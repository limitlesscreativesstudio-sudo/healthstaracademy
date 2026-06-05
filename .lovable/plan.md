## What's broken

On `/pre-qualification` Step 3, picking **Daytime** shows no start dates, so the form can't be submitted. Weekend works because it reads from the static `cohortSchedule.ts` file, while Daytime relies on a live database query that — for any number of reasons (slow load, transient network/CORS, an empty filter result, a TanStack Query failure that silently sets `data = []`) — is returning nothing for the user.

I verified the DB itself is fine: there are 14 open daytime cohorts (next start June 22, 2026) and the anon API returns them when called directly.

## The fix

Make the Daytime radio list render from the same resilient source the Weekend list uses, with the live DB query as an enhancement (not a hard dependency):

1. Use the static `getCohortsByType("daytime")` list (`daytimeCohortDates`, already imported but currently unused) as the source of truth for the radio options — same pattern as weekend.
2. Apply the existing "deadline hasn't passed" filter (`startISO − 14 days ≥ today`) so expired cohorts don't show.
3. Use `startISO` as the radio value (same convention as weekend) so the submit payload stays consistent.
4. Keep the live `cohorts` DB query, but use it only to:
   - Hide a static date if its matching DB row is `status = "closed"`.
   - Look up `id` / payment links if needed downstream.
   If the DB query is empty or errors, the static list still renders — the form is never blocked.
5. Update the post-submit `cohortDateLabel` builder so it works whether the selected value came from the static list or the DB row (it currently only handles the DB case for daytime).

## Files touched

- `src/pages/portal/PreQualificationPage.tsx` — only the Daytime branch of the radio group (lines ~776–814) and the small label-builder block in `handleSubmit` (lines ~202–215). No backend, schema, or styling changes.

## Why this is safe

- Weekend already works this way, so we're matching a proven pattern.
- The static `cohortSchedule.ts` is the canonical schedule per project memory ("Cohort Schedule Management" / "Program Schedule") and is kept in sync with the DB.
- Admins keep full control: closing a cohort in the Admin Cohort Manager will still hide it from the form via the DB cross-check.
