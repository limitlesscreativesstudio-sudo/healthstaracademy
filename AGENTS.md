# Assessment integrity

- Import changed assessments as locked revised versions; preserve attempted quiz and question IDs because saved answers reference them.
- A verified answer key bypasses the repeated-choice heuristic because legitimate uploaded keys may mark every answer with the same choice.
- Course duplication must reject populated targets and authorize both courses because replacement can destroy saved student history.
- Display released quiz grades using the attempt's original maximum because later assessment edits must not change earned percentages.- Questions flagged key_unverified are never auto-scored because their stored answer was not confirmed by an instructor document.
- New sign-ups get the student role only when an invite exists (pending enrollment or course invite), because self-registered accounts must not reach the LMS.
- Quiz answer drafts are scoped to the open quiz's question IDs, because unscoped state leaked one quiz's answers into another attempt.
- Render authored assessment instructions and prompts through the shared sanitized AssessmentText renderer, because plain interpolation exposes markup and loses case-study structure.
- Keep imported student assessment documents in lms_files only, without module_items or document-only lms_pages copies, because Modules must open interactive assessments rather than duplicate worksheets.
- Commit quiz submission and its grade together through a service-only atomic database function; enforce one grade per attempt because concurrent requests must never overwrite submissions or duplicate marks.
- Students may only create ungraded attempts and edit answers before submission; protect grading fields and immutable attempt identity in database triggers because client controls are not authorization.
- Files-only revised student documents use explicit enrollment-scoped metadata and storage read policies, excluding instructor keys because removing module links must not remove authorized document access.
- Block manual grade entry while a student has an open attempt because creating a separate paper attempt would consume attempts and split student history.
- Midterm/Final exams count toward course point totals only while published, and only one published exam per family (fuzzy title match) counts (src/lib/gradePolicy.ts countableQuizzes), because unpublished drafts and similar-titled duplicate versions must not inflate possible points.
- New cohort copies draw quiz questions from question_bank by quizzes.bank_key (case studies rotate whole scenarios and update the matching "N. Case Study" page); existing courses are never re-rotated, because saved attempts reference question IDs.
