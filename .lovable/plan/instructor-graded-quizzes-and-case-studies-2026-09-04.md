# Instructor-graded quizzes and case studies

## What I found in the live data

- **Answer keys were never imported.** Every multiple-choice question in Day 1–6 Quizzes, the Final Exam, Module 01 Quiz and most Assignment Quizzes has its correct answer set to option A. Any auto-score from those quizzes is meaningless — Ada Mae's Day 1 score of 2/10 just counts how often she happened to pick the first option.
- **Only 3 of 7 attempts were ever submitted.** The other 4 were started and abandoned with no answers saved, so nothing reached the gradebook — this is what looks like "quizzes not recording."
- Short-answer questions (Assignment Quizzes 1, 4, 5 and case studies) can never be machine-scored fairly anyway; 20 of them have no key at all.

## What I will build

### Instructor grades everything
- When a student submits, the attempt is recorded and locked as **Submitted — awaiting grading**. No score is calculated or shown to the student.
- Students see "Submitted — your instructor will grade this" instead of a fake percentage.
- Scores only appear to a student after the instructor grades and releases the attempt.

### Grading workspace for instructors
- In each quiz's Responses panel, an instructor opens a student's attempt and sees every question with the student's answer laid out in order.
- Per-question points entry plus an optional comment, with a running total against the quiz's possible points.
- Where a valid answer key exists, the correct answer is shown as a reference and a "suggest points" action pre-fills the obvious ones — the instructor still confirms before anything is saved.
- Save as draft while working; **Release grade** publishes the score to the student's gradebook and grade record, and notifies them.
- Overall feedback box saved with the grade.

### Making ungraded work visible
- Quiz list shows, per quiz: submitted / awaiting grading / in progress / not started.
- Quiz Gradebook cells show "Awaiting grading" and the needs-attention banner counts ungraded submissions as well as unfinished attempts.
- Instructors get a notification when a student submits a quiz or case study.

### Answer keys
- Flag every quiz whose key is missing or all-option-A as **Unkeyed — manual grading required**, shown as a badge in the quiz list and in the grading panel.
- Clear the existing bogus auto-scores on the three already-submitted attempts so they return to the grading queue instead of showing wrong grades.
- Keys can be loaded later per quiz; once a quiz has a real key, the suggest-points helper starts working for it.

### Answer capture
- Save the student's answers to the database as they work (not only at submit) so an abandoned attempt still shows the instructor what was done.

## Technical notes
- New nullable columns on `quiz_attempts`: `grading_status` (`awaiting`/`in_review`/`released`), `question_scores` jsonb, `instructor_feedback`, `graded_by`, `graded_at`. RLS: instructors of the course write; the student reads their own only when `grading_status = 'released'`.
- New nullable `quizzes.answer_key_status` (`keyed` / `unkeyed`), backfilled by detecting all-identical or null keys.
- `submit-quiz-attempt` edge function stops writing `score`/`max_score` and no longer inserts a `grades` row; it stamps `submitted_at` and sets `grading_status = 'awaiting'`.
- New grading path writes `quiz_attempts` score plus a `grades` row on release only, keeping the 4-year record trail.
- Files: `src/pages/portal/teach/QuizView.tsx` (grading panel, counts, student submitted state), `QuizGradebook.tsx` (awaiting-grading cells), `supabase/functions/submit-quiz-attempt/index.ts`, plus a migration and a data cleanup of the three bogus scores.
