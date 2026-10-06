# Fully auto-graded quizzes, case-study pages, and a rotating question bank

## Goal
No quiz or case study needs a teacher to grade it by hand. Every question has a confirmed answer taken from the documents you uploaded, and new cohorts get a rotated set of questions.

## What will happen

1. **Search every uploaded document for missing answers.** That covers the module quizzes, case studies, answer keys, Midterm and Final. Check each question that has no confirmed answer (12 unconfirmed, 3 open, plus every written case-study question). If a question matches one in your documents, its answer is filled in and confirmed.

2. **Swap questions that still have no answer, only where no student has taken the quiz.** That means the Day and Weekend templates, plus any quiz in the Aug 31 cohort that no student has opened.
   - Each question is replaced with the closest question from your documents for the same module/topic that has a confirmed answer.
   - Quizzes students have already taken stay exactly as they are, along with their answers and grades.

3. **Turn written case-study questions into multiple choice.** Each one keeps its scenario and the correct answer from your key, plus three believable wrong choices, so it grades itself. This happens only where no student has taken that quiz.

4. **Case studies in Pages.** First compare the existing case-study pages (format, headings, scenario layout, how they link to their quiz). Then build a page for each submitted case study in that same style, in all three courses, linked to its quiz. Student worksheets stay in Files only.

5. **Question bank with rotation per cohort.**
   - Each module gets a bank: original questions with confirmed answers, plus questions and scenarios from your documents.
   - When a new cohort is copied from a template, each quiz draws a fresh mix from its module's bank. The number of questions and the points stay the same.
   - Existing cohorts don't change.

6. **Report back.** You'll get a list of answers found, questions swapped, questions converted to multiple choice, pages added, and anything that couldn't be matched (if there is any).

## Safeguards
- Saved student answers, attempts and released grades are never changed.
- Back up every question before it's changed.
- Use only answers from your documents. Answers are never guessed.

## Technical details
- New table `question_bank` (course template / module key, question_type, prompt, options, correct_answer, source_doc, verified), with RLS limited to instructors/admins plus service_role grants.
- Swaps run only on quizzes with zero `quiz_attempts`. Question IDs are kept where an answer is only being confirmed.
- `duplicate-course` draws N random verified bank items per quiz when making a new cohort, keeping total_points.
- After the swaps, set `answer_key_status='verified'` and `key_unverified=false` on each covered quiz.
- Back up changed rows to a new backup table first.
