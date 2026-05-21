
# HSA Learning Portal — Canvas-style LMS

Since Canvas is currently inaccessible (hack), the priority is getting students learning again **fast**. I'll build a Canvas-*inspired* LMS — same mental model (Dashboard → Course → Modules → Items) but HSA-branded. We ship in 4 phases. Phase 1 is the foundation you need before anything else works.

---

## Phase 1 — Foundation (this build)

**Goal: Agnes & Kimberly can create a course, upload modules, and students can log in and view content.**

### Auth & roles
- Email/password + Google login on a new `/portal/login` page
- Replace the existing Instructure "Student Portal" button → points to `/portal`
- 3 roles in `user_roles`: `student`, `instructor`, `admin`
- Instructor accounts seeded for **Agnes Edebe** and **Kimberly Nelson** (you give me their emails, or I send invites)

### Database (new tables)
- `courses` — title, code, term, cover image, instructor_id, status (published/draft)
- `enrollments` — student ↔ course, role, enrolled_at
- `modules` — course_id, title, position, published
- `module_items` — module_id, title, type (`page` | `file` | `link` | `assignment` | `quiz` | `discussion` | `video`), content/url, position, published
- `pages` — rich-text course pages (HTML)
- `files` — name, mime, size, storage_provider (`drive` | `cloud`), drive_file_id or storage_path, course_id
- `announcements` — course_id, title, body, posted_at
- All with RLS: students see only their enrolled courses; instructors manage their own courses; admins see all.

### Storage (hybrid as requested)
- **Lovable Cloud storage**: small assets (images, PDFs <10 MB, page attachments) → instant, no extra setup
- **Google Drive connector**: large files (PowerPoints, videos, case studies) → I'll wire the Google Drive connector so uploads stream to your Drive and the portal embeds them
- Upload UI auto-routes by file size/type

### Student portal (`/portal`)
- **Dashboard**: course cards (cover image, title, instructor, progress bar)
- **Course view**: left sidebar (Home, Modules, Announcements, Grades, Files), main content area
- **Modules page**: collapsible module list, items with type icons, click to view
- **Content viewers**: PDF inline, PowerPoint via Google Drive embed, video player, rich-text pages, external links

### Instructor portal (`/portal/teach`)
- **My Courses** dashboard
- **Course editor**: edit course details, manage enrollments (add students by email or CSV)
- **Module builder**: drag-to-reorder modules and items, add/edit/delete, publish toggle
- **Content creator**: rich-text page editor (TipTap), file uploader (auto-routes Drive vs Cloud), link adder
- **Announcements**: post to course
- **Roster**: see enrolled students

### Design
Matches HSA brand (Purple #7C4DFF, Teal CTAs). Layout pattern mirrors Canvas (familiar for returning students) without copying its proprietary UI.

---

## Phase 2 — Assessments
- Assignments (instructions, due date, file/text submission, grading)
- Quizzes (multiple choice, true/false, short answer) — reusing your existing exam-prep engine
- Gradebook (per-student, per-assignment, weighted categories, export to CSV)
- Submissions inbox for instructors with inline grading + feedback

## Phase 3 — Interaction & schedule
- Threaded discussions (course-level + per-topic)
- Course calendar (auto-populated from due dates) + iCal feed
- Notifications (email via Resend + in-app bell)
- Direct messages student ↔ instructor

## Phase 4 — Polish & advanced
- Rubrics + speed-grader
- Attendance tracker (important for clinicals)
- Certificates of completion (PDF generation)
- Bulk import from old Canvas exports (.imscc) once you regain access
- Mobile-optimized PWA

---

## Technical notes

```text
src/pages/portal/
  LoginPage.tsx            # student + instructor login
  StudentDashboard.tsx     # course cards
  CourseView.tsx           # shell with sidebar nav
    ModulesTab.tsx
    AnnouncementsTab.tsx
    GradesTab.tsx
    FilesTab.tsx
  ItemViewer.tsx           # routes by item type
  teach/
    InstructorDashboard.tsx
    CourseEditor.tsx
    ModuleBuilder.tsx
    PageEditor.tsx         # TipTap rich text
    Roster.tsx
src/components/portal/
  CourseCard.tsx
  ModuleList.tsx
  FileUploader.tsx         # hybrid Drive/Cloud routing
  PortalLayout.tsx

supabase/functions/
  drive-upload/            # signed upload to Google Drive
  drive-stream/            # proxy/embed Drive files
  enroll-student/          # invite by email
```

- **Auth state**: standard `onAuthStateChange` pattern, redirect by role after login.
- **Google Drive**: I'll connect the Google Drive connector when we get there — files land in a "HSA Courses" folder in your Drive, organized by course.
- **Realtime**: announcements + new submissions use Supabase realtime so instructors see activity live.

---

## What I need from you to start Phase 1

1. **Confirm this plan** (or tell me what to cut/change)
2. **Instructor emails** for Agnes Edebe and Kimberly Nelson (so I can seed their accounts) — or say "I'll add them after login is built"
3. **Do you want the existing Instructure "Student Portal" link removed immediately, or kept until Phase 1 launches?** (recommend: keep until ready)

Once you approve, Phase 1 will take several iterations to fully ship. I'll build it in working chunks (auth → schema → student view → instructor view → file storage) so you can test each piece as we go.
