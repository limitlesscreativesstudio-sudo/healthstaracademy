## What I'll fix

### 1. Clear all test/demo students
- Delete all rows from `enrollments`, `submissions`, `grades`, `attendance`, `clinical_attendance`, `clinical_hours`, `quiz_attempts`, `student_skill_signoffs`, `skill_signoffs`, `notifications`, and `students`.
- Remove the `student` role from every `user_roles` row.
- Delete every `auth.users` account that does **not** have the `admin` or `instructor` role (this wipes seeded students; instructors/admins are kept).
- Profiles for deleted auth users are removed by cascade.

### 2. Top course header — wire the dead buttons
- **View as Student**: toggles a `viewMode` state so `canEdit` flips to `false`; button label becomes "Back to Instructor View". Persists per tab.
- **+ Module** (top right, next to View as Student): jumps to Modules tab and opens the Add Module form (same handler the inline button uses).

### 3. + Item dropdown — make File / Video actually attach
- When type = `file` (or `video`), show a real `<input type="file">`.
- On Add: upload to `course-files` bucket at `{courseUuid}/module-items/{uuid}-{filename}`, store the public URL + filename on the `module_items` row (uses the new `file_url`/`file_name`/`file_type`/`file_size` columns on `lms_files` — for module items I'll add `file_url`/`file_name`/`file_type` columns to `module_items`).
- Clicking a file/video item opens the URL in a new tab.

### 4. Course Actions sidebar (right rail)
- Wire each link: **Choose Home Page** → opens existing `ChooseHomePageDialog`; **View Course Stream** → Announcements tab; **New Announcement** → Announcements tab + open form; **New Analytics** → Analytics tab; **View Notifications** → opens NotificationBell panel; **Import Existing Content** / **Import from Commons** → toast "Coming soon" (honest placeholder, not a silent no-op).

### 5. Syllabus tab — keep structured schedule + add uploaded PDF
- Add a top section "Syllabus Document" with file upload (PDF/DOCX) → `course-files/{courseUuid}/syllabus/...`. Stored on a new column `courses.syllabus_url` + `syllabus_name`. Shown inline via `<iframe>` for PDFs, download link for others.
- Keep the existing day-by-day schedule editor below.
- Add a note: schedule rows auto-pull module names once modules are created (best-effort: read `modules` table and list module titles per day).

### 6. Dashboard — duplicate/edit course-template modules
- Add row-level "Duplicate to cohort" and "Edit" buttons on each course card's module list in `Dashboard.tsx`.
- Duplicate: copies all modules + module_items from the template course into the selected destination cohort.
- Edit: opens that cohort's Modules tab directly.

### 7. Schema additions (one migration)
```sql
ALTER TABLE module_items
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_type text;

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS syllabus_url text,
  ADD COLUMN IF NOT EXISTS syllabus_name text;
```

## Out of scope (will flag, not fix this turn)
- Discussions / Outcomes / Rubrics / Lucid full implementations — these stay as honest "Coming soon" placeholders.
- Real Canvas-style syllabus auto-generation from assignments — only module-name pull-through is included.

## Files touched
- New migration: schema + storage policy updates
- `src/pages/portal/teach/CourseView.tsx` — view-as-student, top + Module, course actions wiring, file-upload in + Item
- `src/pages/portal/teach/SyllabusTab.tsx` — upload + display PDF, accept `courseUuid` prop
- `src/pages/portal/teach/Dashboard.tsx` — duplicate/edit module buttons on cohort cards
- One-off data cleanup via the insert tool to remove demo students
