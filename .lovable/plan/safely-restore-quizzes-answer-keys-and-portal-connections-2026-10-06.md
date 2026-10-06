# Safely restore quizzes, answer keys, and portal connections

## What the review found
- The archives contain Module 1–17 quizzes and case studies, their answer keys, and a June midterm answer key. Module 2's case-study key was not included; one Module 1 quiz key is duplicated.
- The uploaded assessments are not the same as several existing assessments. For example, uploaded Module 1 has five questions; the portal has sixteen different questions. Uploaded Module 3's case study has two written questions; the portal has one different multiple-choice question.
- Student submissions and released grades already exist. Replacing questions by number would associate old answers with different questions and could produce incorrect grades.

## Changes
1. **Match every document before applying keys.** Extract all documents, compare question text and choices with the portal, and create an exact match/mismatch inventory. Use only supplied keys, never guessed answers.
2. **Update all three courses safely.** Restore keys in place for exact matches while preserving question IDs. For different assessments, create clearly named revised versions across the Day template, Weekend template, and active cohort. Keep original attempted assessments and grades available to instructors; do not redirect an unfinished student attempt to a different version.
3. **Connect Quizzes, Pages, Files, and Modules.** Put student-facing quiz and case-study documents in the appropriate course locations and link them to their revised assessments. Keep new assessments locked until instructors open them. Preserve uploaded originals, and remove prefilled student names from reusable student-facing versions without rewriting their questions.
4. **Keep answer keys private.** Store keys separately for instructors with authenticated access, never public download links or student-visible pages. Written-answer keys support instructor grading rather than automatic exact-text grading.
5. **Correct pending work only when matched.** Recheck submitted, unreleased attempts only when every automatically graded question has a verified matching key. Leave manually released grades untouched. Report unmatched submissions and missing keys instead of assigning unreliable scores.
6. **Check student–instructor connections.** Verify roster access, saved answers, instructor responses, grade release, module publication, document access, and template copying. Apply bounded fixes to confirmed issues and verify both roles. Do not reset attempts or delete student records.

## Verification and report
- Confirm every imported assessment has the correct questions, choices, points, and key mapping in all three courses.
- Confirm students cannot access answer-key documents and cannot open locked assessments, including through direct links.
- Confirm instructors can see existing submissions and original grades after updates.
- Report restored keys, revised assessments, corrected submissions, connection fixes, and any remaining unmatched material.

## Technical details
- Preserve existing `quiz_questions.id` values for exact-match updates; create separate quiz/question IDs for materially different assessment versions.
- Reuse course-specific `module_items`, `lms_pages`, and `lms_files` links with their existing publication-based access rules.
- Use private Cloud storage and instructor-authorized access for answer-key originals. Check storage authorization before uploading.
- Use an explicit verified key status for imported assessments; repeated legitimate answers must not be mistaken for placeholder keys.
- Regrading must enforce ownership/enrollment, avoid released grades, and keep grade records consistent with attempt scores.