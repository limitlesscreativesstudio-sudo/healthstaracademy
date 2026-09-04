# Fix instructor visibility of student work + clickable Zoom link

## What I found (verified against the live data and code)

**1. There are no assignments at all.** The assignments table has 0 rows and 0 submissions across every course. All student work is currently delivered as quizzes ("Day X Quiz", "Assignment Quiz"), so the Assignments tab and its grading panel will always look empty — nothing is broken there, there is simply nothing to show.

**2. Most quiz attempts were never submitted.** Of the 8 attempts by Ada Mae and Gina, only 3 were actually submitted (all Ada Mae: Day 1, Day 2, Day 3). The other 5 are still "in progress" — started but never finished, including all 3 of Gina's. The instructor gradebook only counts submitted attempts, so unfinished work is invisible: it looks like "the student took it and nothing showed up."

**3. One attempt could never be submitted.** Ada Mae has an in-progress attempt on "8. Assignment Quiz", which has zero questions and is locked. Students can start an attempt on an empty quiz and then get stuck.

**4. The Zoom link is present but looks like plain text.** Day 4 – Video Conference Info (and all 23 conference pages) already contains a real Zoom hyperlink. The typography plugin that styles page content is installed but never registered in the Tailwind config, so links inside page content render with no colour and no underline — they are clickable but look like ordinary text, which is why students do not know to click.

## What I will do

### Zoom / conference pages
- Register the typography plugin so all course page content renders properly, with links in the brand colour and underlined.
- Add a prominent "Join the Live Class on Zoom" button at the top of every Day's Video Conference Info page (Day 4 included), above the meeting ID, opening in a new tab.

### Instructor visibility of student work
- Show activity counts directly in the instructor Quizzes list for each quiz: submitted, in progress, and not started.
- Include in-progress attempts in the Quiz Gradebook with an "In progress" marker and the time started, instead of hiding them.
- Let the instructor open any in-progress attempt's answers so far, and close it out (submit and auto-score it) when a student walks away without submitting.
- Add a "Needs attention" summary at the top of the gradebook: students with unfinished attempts and quizzes awaiting review.

### Guardrails
- Block starting an attempt on a quiz with zero questions, and clear the stuck attempt on "8. Assignment Quiz".
- Give the student quiz screen a clearer unsaved/unsubmitted warning when they try to leave mid-attempt.

### Assignments tab
- Keep quizzes as the delivery method (no data change), and replace the blank Assignments tab with an explanatory empty state plus a "Create assignment" action, so it is obvious no assignments exist rather than looking broken.

## Technical notes
- `tailwind.config.ts`: add `@tailwindcss/typography` to `plugins` (already in package.json), plus prose link styling using existing design tokens.
- Conference page HTML update runs as a data update across `lms_pages` where the title matches "Video Conference Info" (23 pages), preserving existing body content.
- `QuizView.tsx`: per-quiz attempt aggregates; allow the Responses panel to display and force-submit in-progress attempts (instructors already have update rights on attempts in their courses).
- `QuizGradebook.tsx`: drop the `submitted_at is not null` filter, distinguish states in the matrix.
- `submit-quiz-attempt` / attempt start path: reject quizzes with no questions.
