# Finish adding Ada Mae and Gina to the LMS records

## What's already true

Both accounts exist and can log in:

- Ada Mae (adamae29@yahoo.com) — student role, enrolled in "HSA Hybrid Day NATP — Cohort 08/31/26"
- Gina Vang (ginaa.vaang06@gmail.com) — student role, enrolled in the same course

## What's missing

1. Neither student has a record in the student pipeline table, so they don't appear in the Admin Dashboard student list, the Unified Student Profile panel, or cohort rosters. Only 3 rows exist there today, all disqualified applicants.
2. Their profile names are incomplete: "Ada Mae" (no last name) and "Gina Vang".
3. The Aug 31 course is not linked to the Aug 31 cohort record (start 2026-08-31, apply-by 2026-08-23), so cohort-based reporting and roster tools don't pick these students up.
4. No entry in the job/certification pipeline, which is where exam results and certification numbers get tracked after the program.

## Plan

1. Create pipeline records for both students with first/last name, email, cohort = Aug 31 2026 daytime cohort, enrollment status "enrolled", payment status left as-is for the office to set, and linked to their portal accounts so the profile panel joins correctly.
2. Correct the display names to "Ada Mae dela Cruz" and "Gina Vang" in their profiles and pipeline records.
3. Attach the Aug 31 course to the Aug 31 cohort so roster, deadline, and cohort reporting all resolve.
4. Add both to the job/certification pipeline at the "in training" stage so state-exam and certification records have a home from day one.
5. Confirm their enrollment role is student and that they still only see Modules, Quizzes, Grades, and Attendance.

## Records retention (4 years)

Scores already persist permanently in the database — nothing is stored only in the browser. Grades, quiz attempts and answers, attendance, clinical hours, and skill sign-offs are all stored rows, and deletions on the sensitive tables are captured in an append-only audit log. To make the 4-year requirement explicit I will also:

- Verify each student's grade/attempt rows are keyed to their portal user id (so records survive name or email changes).
- Add a short retention note to the admin area stating that student academic records are retained for a minimum of 4 years and must not be deleted.

## Technical notes

- Inserts into `students` and `job_pipeline`, updates to `profiles.full_name` and `courses.cohort_id` — data changes only, no schema change needed.
- Cohort id: the 2026-08-31 daytime cohort; course id: the published "HSA Hybrid Day NATP — Cohort 08/31/26".

## One check before I run it

Spelling: I'll use "Ada Mae dela Cruz" and "Gina Vang" unless you tell me otherwise (the account name reads "Gina", your message read "Gonna").
