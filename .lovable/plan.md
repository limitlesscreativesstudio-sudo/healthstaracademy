# LMS Completion Plan

Audit results: the LMS is roughly **70% done**. Most student-facing screens work, but the instructor portal is stubbed, several buttons are dead, and the cohort manager has no "Create" UI. We'll finish in the order you asked — LMS first, cohort creation last — and design cohort creation around your **template-and-duplicate** workflow.

---

## Phase 1 — Instructor Portal (blocks teaching)

1. **Wire real instructor screens in `src/App.tsx`**
   - Replace the 4 placeholders (`InstructorDashboard`, `CourseEditor`, `QuizEditor`, `SubmissionsInbox`) currently aliased to `StudentDashboard`.
   - Promote the orphaned `src/pages/portal/teach/Dashboard.tsx` to the real `/portal/teach` landing page (instructor dashboard with course list, recent submissions, announcements).
   - Add new routes:
     - `/portal/teach` → InstructorDashboard
     - `/portal/teach/courses/:courseId` → CourseEditor (reuses CourseView in author mode)
     - `/portal/teach/courses/:courseId/quizzes/:quizId/edit` → QuizEditor
     - `/portal/teach/submissions` → SubmissionsInbox (lists ungraded submissions across all instructor's courses)

2. **Role gating**
   - Fix `SettingsTab.tsx` — replace fake `user?.canEdit` with a real check using `usePortalAuth().isInstructor`.
   - Same check enables author UI inside CourseView tabs (Modules, Pages, Files, Syllabus).

3. **Forgot-password route**
   - Add `/portal/teach/reset` page that calls `supabase.auth.resetPasswordForEmail` and a `/portal/teach/update-password` page for the recovery callback. Kills the dead link on PortalLogin.

---

## Phase 2 — Fix Broken Buttons & Hardcoded Data

4. **`CareerPortal.tsx`** — wire all 5 resource buttons to real URLs (resume builder, CDPH, CEU site, etc.) and connect "Apply Now" to `job_pipeline` table or external job URL field. Move hardcoded job list into the existing `job_pipeline` table query.

5. **`RequiredWork.tsx`** — replace mock `STUDENTS` / `WORK` arrays with live queries against `students`, `assignments`, `submissions`, `clinical_hours`. Implement the "Export Report" button as a CSV download.

6. **`CohortOpsHub.tsx` roster** — add inline editing of `enrollment_status` and `payment_status` per student so you can manage students from the hub.

7. **`CalendarTab.tsx`** — implement week view (or hide the toggle until later — you choose).

8. **`SyllabusTab.tsx`** — remove the dead `<a href="#">` anchor.

---

## Phase 3 — Cohort Creation with Templates (last)

Designed for your workflow: create one daytime template and one weekend template, then **duplicate** them for each new group of students (each duplicate is a fresh record so rosters stay separate).

9. **DB migration** — add `cohorts.is_template boolean default false` and `cohorts.template_source_id uuid` (nullable, points to the template it was duplicated from). No data loss.

10. **CohortManager UI additions**
    - **Templates section** at the top showing the 2 master templates (Daytime, Weekend) — edit name, capacity, payment links, clinical site, deadlines, notes.
    - **"+ New Cohort from Template"** button → modal asking: which template + start date + (auto-fills name like "Daytime — Jan 12, 2026"). On submit, inserts a new cohort copying every field except `id`, `start_date`, `name`, `created_at`, and sets `template_source_id`.
    - **"+ New Cohort"** button for ad-hoc cohorts (full form: name, start_date, capacity, program_type, links).
    - Edit `program_type` (daytime ↔ weekend) on existing cohorts.
    - Delete cohort button (only when 0 enrolled students, with confirm).

11. **Visual cleanup** — group cohorts in the manager as: Templates → Upcoming → Active → Past.

---

## Out of scope (call out, do later)

- Real-time chat / messaging between instructor and students
- Bulk email from the instructor portal (separate enrollment-email function already covers this)
- Mobile-specific instructor views

---

## Technical notes

- All new tables/columns go through `supabase--migration` with GRANTs and RLS.
- Instructor screens reuse existing `usePortalAuth` for role checks — no new auth code.
- Cohort duplication is a single client-side `INSERT ... SELECT` style copy via Supabase JS — no edge function needed.
- Estimated edits: ~12 files touched in Phase 1, ~6 files in Phase 2, ~3 files + 1 migration in Phase 3.

Approve and I'll start with Phase 1.
