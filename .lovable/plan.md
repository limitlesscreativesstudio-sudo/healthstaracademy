# Fix the Aug 31 cohort apply-by date (Aug 23, 11:59 PM) + audit

## What's wrong

The Aug 31, 2026 cohort record already carries the extended deadline of **August 23, 2026**, but every date shown on the site is recalculated as "start date minus 14 days", which produces **August 17**. That calculation ignores the extension, so the announcement banner, countdown, cohort cards, and the pre-qualification cohort picker all still show Aug 17.

## The fix

Make the stored per-cohort deadline the source of truth for "Apply by":

1. In the cohort data helper, return the cohort's own deadline as the apply-by date, falling back to start-minus-14 only when no explicit deadline is set. This single change corrects every surface at once (announcement banner text and countdown, cohorts page, programs page, admissions page, pre-qualification picker).
2. Update the "still open?" filtering on the pre-qualification page so cohorts stay selectable until 11:59 PM on their real deadline (Aug 23), not Aug 17.
3. Countdown in the announcement bar will then target Aug 23, 11:59 PM.

## Audit of earlier requests (verified in code today)

Already live and correct:
- Weekend cohorts paused site-wide; daytime running.
- Transportation question removed from the form, the sheet mapping, and the disqualification logic.
- Disclaimer column removed from the sheet write; checkbox still on the form for records.
- $175 application fee question added, stored on the student record, flagged in notes, and written to sheet column M.
- Sheet append range A:T in questionnaire order.
- Student portal restricted to Home, Modules, Quizzes, Grades, Attendance with self-only grades.
- Server-side deep-clone duplication for cohorts.
- Deadline reminder emails scheduled off the cohort deadline (these will follow the Aug 23 date once the fix lands).

Only outstanding item is the Aug 17 → Aug 23 date, fixed above.

## Technical notes

- `src/data/cohortSchedule.ts`: `getCohortDeadlines()` returns `applyByISO = cohort.deadlineISO` when present; keep `getApplyByISO(startISO)` for the generic 14-day rule and add a cohort-aware variant used by callers.
- `src/pages/portal/PreQualificationPage.tsx`: two filters currently call `getApplyByISO(d.startISO)` — switch to the cohort-aware deadline.
- No database or edge function changes needed; the DB row already holds Aug 23.
