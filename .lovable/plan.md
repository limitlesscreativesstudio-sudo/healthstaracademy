# LMS Build Audit

Audit of the instructor/student portal and admin tools so you know exactly what to fix before pouring content in. Grouped by severity.

---

## 🔴 Blockers (must fix before adding content)

### 1. Instructor routes are still stubs
`src/App.tsx` lines 53-57:
```ts
const InstructorDashboard = StudentDashboard;
const CourseEditor = StudentDashboard;
const QuizEditor = StudentDashboard;
const SubmissionsInbox = StudentDashboard;
```
And `/portal/teach` is wired to `CourseView` instead of an instructor landing page. There is no instructor home, no submissions inbox, no dedicated course editor route. The real `src/pages/portal/teach/Dashboard.tsx` (486 lines, lists courses from DB) is never mounted.

### 2. `/portal` shows the wrong screen to students
`/portal` and `/portal/courses` both render `StudentDashboard`, but that file is actually the **course People/Roster panel** (queries `enrollments` by `courseId`). With no `courseId`, students land on an empty roster, not a dashboard of their courses. Need a real student home (course cards + upcoming work + announcements).

### 3. Two parallel auth systems
- `src/pages/portal/teach/AuthContext.tsx` (creates its own Supabase client, `useAuth`)
- `src/hooks/usePortalAuth.ts` (uses shared client, used by `RoleGuard`)

They duplicate session listeners, can disagree on roles, and `AuthContext` is only mounted on a subset of routes — so `useAuth().user.canEdit` is undefined for components rendered outside an `AuthProvider`. Pick one (recommend `usePortalAuth` + a thin profile loader) and delete the other.

### 4. `RequiredWork.tsx` is 100% mock data
Hardcoded `STUDENTS` array and `WORK` list with `Math.random()` completion. Export CSV works, but the data is fake. Must be wired to `students`, `assignments`, `submissions`, `clinical_hours`.

### 5. `CalendarTab.tsx` is hardcoded
`EVENTS` is a literal array of May 2026 entries. Needs to read from `assignments.due_date`, `quizzes.due_date`, `clinical_attendance`.

---

## 🟠 High priority (functionality gaps)

### 6. Course editor uses seeded mock courses
`CourseView.tsx` line 42 — `COURSES` is a hardcoded 3-item array. The view should hydrate the course from `courses` table by `:courseId`.

### 7. `SettingsTab.tsx` saves nothing
"Save" just flashes "✅ updated" with a `setTimeout` — no Supabase write. Same pattern likely on Sections/Navigation tabs.

### 8. `CareerPortal.tsx` jobs list is hardcoded
5 fake LA-area jobs in a literal array. The `job_pipeline` table exists — switch to a live query, or repurpose this view for grad placement tracking and link out for live job boards.

### 9. Dead "View Calendar →" link
`CourseView.tsx:409` and `Dashboard.tsx:443` — `<a href="#">` anchors that go nowhere.

### 10. "📅 Calendar feed coming soon"
`CalendarTab.tsx:260` — visible to users. Either implement iCal feed or hide.

### 11. `CohortOpsHub` roster read-only
You can view enrolled students per cohort but can't change `enrollment_status` / `payment_status` from there.

### 12. Forgot/Update password flows
Toasts and audit logging are wired (recent work) but no end-to-end test of recovery email → update-password handoff. Need to verify the `redirectTo` matches `/portal/teach/update-password`.

---

## 🟡 Medium (polish before launch)

13. **`AuthContext` student-portal block** — `login()` in `AuthContext.tsx:170` signs out anyone whose role is `student`, but `/portal/teach/login` is the only login form on the site. Students currently have no way in.
14. **Instructor invite acceptance** — `AcceptInvite.tsx` exists but flow not verified end-to-end against `course_invites`/`instructor_invites` tables.
15. **`StudentGrades.tsx`** — verify it pulls from `grades` and matches the gradebook columns instructors will use.
16. **Notifications** — `notifications` table + `NotificationBell` component exist; need to confirm the bell shows announcements + submission events triggered by your DB triggers.
17. **`ModulesTabAuthor.tsx`** — 600+ lines; verify add-module, add-item, reorder, delete all persist.
18. **`FilesTab` / `PagesTab`** — confirm upload to `course-assets` / `page-images` buckets actually works and respects RLS.

---

## 🟢 Working (verified during audit)

- Supabase auth + role tables (`user_roles`, `has_role`, `is_admin`, `is_instructor_of`).
- `RoleGuard` + `AuthAuditLog` + password-strength helpers.
- Cohort templates + duplication UI in `CohortManager`.
- `JobPipelineTracker` and `StudentPipeline` (admin tools) use live data.
- Edge functions deployed: `accept-invite`, `enrollment-webhook`, `provision-student`, `send-enrollment-email`, `student-lookup`, `submit-quiz-attempt`, `course-roster`.
- Quiz scoring trigger (`prevent_quiz_attempt_score_tamper`) and announcement fan-out trigger.

---

## Recommended fix order

1. **Auth consolidation** (#3) — everything else depends on knowing who the user is.
2. **Student `/portal` home** (#2) — so students can log in and see something real.
3. **Instructor routes + Dashboard mount** (#1) — unblocks course authoring.
4. **CourseView hydration** (#6) + **SettingsTab persistence** (#7) — so editing actually saves.
5. **RequiredWork** (#4) and **CalendarTab** (#5) — replace mocks with live queries.
6. **Polish pass** (#9-18).

Estimated scope: ~15 files touched, no new tables needed (schema is already in place).

---

Approve and I'll start with Step 1 (auth consolidation). If you want a different order — e.g. ship the student home first so you can demo it — say so and I'll re-sequence.
