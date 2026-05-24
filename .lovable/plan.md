# Lock down hidden content server-side

## Why this matters

The instructor's eye/publish toggle currently only filters the UI. The database RLS is mostly correct, but **three gaps** let a determined student (or anyone with a URL) bypass those toggles:

| Surface | Current behavior | Risk |
|---|---|---|
| `modules` / `module_items` / `quizzes` / `assignments` | Already gated by `published AND is_enrolled_in(...)` | OK |
| `lms_pages` | Any enrolled student can SELECT every page in the course, even if its module_item is unpublished | Hidden page content is readable via the API |
| `lms_files` | Any enrolled student can SELECT every file row (storage_path, drive_file_id, external_url) | Hidden file metadata leaks |
| `course-assets` storage bucket | Marked **public** — anyone with the path can download | Even non-students can read uploaded PDFs/videos if they guess/share the URL |

## What the plan changes

### 1. Tighten `lms_pages` SELECT policy

Students can only read a page if it's referenced by at least one **published** `module_item` inside a **published** `modules` row in a course they're enrolled in. Instructors and admins keep full access.

### 2. Tighten `lms_files` SELECT policy

Same gate as pages: file is reachable only via a published module_item in a published module. (Files not yet attached to any item remain instructor-only.)

### 3. Make `course-assets` bucket private + signed URLs

- Flip the `course-assets` bucket from public to private.
- Add storage RLS policies that mirror the `lms_files` gate (only enrolled students whose course owns the file, plus that file is exposed through a published item).
- Update `ItemViewer` in `src/pages/portal/CourseView.tsx` to fetch a **signed URL** (`supabase.storage.from('course-assets').createSignedUrl(path, 3600)`) instead of `getPublicUrl`.

### 4. Verify

- Run `supabase--linter` to confirm no new warnings.
- Manually test: log in as a student, attempt to query `lms_pages` and `lms_files` for IDs that belong to an unpublished item — should return 0 rows.
- Confirm an instructor still sees everything in `CourseEditor`.

## Technical details

```text
lms_pages SELECT policy (replace existing):
  is_admin()
  OR is_instructor_of(course_id)
  OR EXISTS (
    SELECT 1 FROM module_items mi
    JOIN modules m ON m.id = mi.module_id
    WHERE mi.content_ref = lms_pages.id
      AND mi.published
      AND m.published
      AND is_enrolled_in(m.course_id)
  )

lms_files SELECT policy: same pattern, joined on mi.content_ref = lms_files.id

storage.objects (bucket course-assets) SELECT policy:
  bucket_id = 'course-assets'
  AND EXISTS (
    SELECT 1 FROM lms_files f
    JOIN module_items mi ON mi.content_ref = f.id
    JOIN modules m ON m.id = mi.module_id
    WHERE f.storage_path = storage.objects.name
      AND mi.published AND m.published
      AND (is_admin() OR is_instructor_of(m.course_id) OR is_enrolled_in(m.course_id))
  )
  -- plus a separate policy granting instructors/admins full SELECT on their course's files
```

Frontend change is small: in `ItemViewer`, swap `getPublicUrl` for `createSignedUrl` and store the returned URL in state (it's already async, just one line different).

## Out of scope (ask separately if wanted)

- Bulk-publish controls, drag reorder, Canvas-style indent — that's the "polish Modules editor" track.
- Auditing what files were uploaded before this change (none need to be moved; flipping the bucket private + signed URLs handles it).
