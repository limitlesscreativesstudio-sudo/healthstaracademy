// Deep-clone a course (sandbox -> new cohort) entirely server-side.
// Runs with the service role so RLS can never silently drop rows mid-copy.
// Caller must be an admin or an instructor/teacher of the source course.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    const caller = userData?.user;
    if (!caller) return json({ error: "Not authenticated" }, 401);

    const db = createClient(url, service, { auth: { persistSession: false } });

    const { sourceCourseId, title, code, targetCourseId } = await req.json().catch(() => ({}));
    if (!sourceCourseId) return json({ error: "sourceCourseId is required" }, 400);

    // ── Authorize: admin, course owner, or enrolled teacher/ta/designer
    const [{ data: roles }, { data: srcCourse }, { data: enr }] = await Promise.all([
      db.from("user_roles").select("role").eq("user_id", caller.id),
      db.from("courses").select("*").eq("id", sourceCourseId).maybeSingle(),
      db.from("enrollments").select("role").eq("course_id", sourceCourseId).eq("user_id", caller.id).maybeSingle(),
    ]);
    if (!srcCourse) return json({ error: "Source course not found" }, 404);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
    const isTeacher =
      srcCourse.instructor_id === caller.id ||
      ["teacher", "ta", "designer"].includes(String(enr?.role ?? ""));
    if (!isAdmin && !isTeacher) return json({ error: "Not authorized to duplicate this course" }, 403);

    const stats: Record<string, number> = {};
    const bump = (k: string, n = 1) => { stats[k] = (stats[k] ?? 0) + n; };

    // ── Target course: reuse (repair) or create
    let newCourseId: string;
    if (targetCourseId) {
      newCourseId = targetCourseId;
      // Purge any partial content so the fill is exact.
      const { data: oldMods } = await db.from("modules").select("id").eq("course_id", newCourseId);
      const modIds = (oldMods ?? []).map((m: any) => m.id);
      if (modIds.length) await db.from("module_items").delete().in("module_id", modIds);
      await db.from("modules").delete().eq("course_id", newCourseId);
      const { data: oldQz } = await db.from("quizzes").select("id").eq("course_id", newCourseId);
      const qzIds = (oldQz ?? []).map((q: any) => q.id);
      if (qzIds.length) {
        await db.from("quiz_questions").delete().in("quiz_id", qzIds);
        await db.from("quiz_attempts").delete().in("quiz_id", qzIds);
      }
      await db.from("quizzes").delete().eq("course_id", newCourseId);
      const { data: oldAsgn } = await db.from("assignments").select("id").eq("course_id", newCourseId);
      const asgnIds = (oldAsgn ?? []).map((a: any) => a.id);
      if (asgnIds.length) {
        await db.from("submissions").delete().in("assignment_id", asgnIds);
        await db.from("rubric_scores").delete().in("assignment_id", asgnIds);
        await db.from("grades").delete().in("assignment_id", asgnIds);
      }
      await db.from("assignments").delete().eq("course_id", newCourseId);
      await db.from("lms_pages").delete().eq("course_id", newCourseId);
      await db.from("lms_files").delete().eq("course_id", newCourseId);
      await db.from("lms_folders").delete().eq("course_id", newCourseId);
      await db.from("lms_announcements").delete().eq("course_id", newCourseId);
      await db.from("discussions").delete().eq("course_id", newCourseId);
      const { data: oldRub } = await db.from("rubrics").select("id").eq("course_id", newCourseId);
      const rubIds = (oldRub ?? []).map((r: any) => r.id);
      if (rubIds.length) await db.from("rubric_criteria").delete().in("rubric_id", rubIds);
      await db.from("rubrics").delete().eq("course_id", newCourseId);
      if (title || code) {
        await db.from("courses").update({
          ...(title ? { title } : {}),
          ...(code ? { code } : {}),
        }).eq("id", newCourseId);
      }
    } else {
      const { id: _omit, created_at, updated_at, cohort_id, ...rest } = srcCourse as any;
      const { data: created, error: cErr } = await db.from("courses").insert({
        ...rest,
        title: (title ?? `${srcCourse.title} (Copy)`).trim(),
        code: (code ?? `${srcCourse.code ?? "COURSE"}-COPY`).trim(),
        instructor_id: srcCourse.instructor_id ?? caller.id,
        status: "draft",
      }).select("id").single();
      if (cErr || !created) return json({ error: cErr?.message ?? "Failed to create course" }, 400);
      newCourseId = created.id;
    }

    // Make sure the caller keeps teaching access on the copy.
    await db.from("enrollments").upsert(
      { course_id: newCourseId, user_id: caller.id, role: "teacher" },
      { onConflict: "course_id,user_id" },
    );

    const rubricMap = new Map<string, string>();
    const pageMap = new Map<string, string>();
    const quizMap = new Map<string, string>();
    const assignmentMap = new Map<string, string>();
    const discussionMap = new Map<string, string>();
    const folderMap = new Map<string, string>();
    const fileMap = new Map<string, string>();
    const urlMap = new Map<string, string>();

    const strip = (row: any, drop: string[] = []) => {
      const out: any = { ...row };
      for (const k of ["id", "created_at", "updated_at", ...drop]) delete out[k];
      return out;
    };

    // ── Sections
    const { data: sections } = await db.from("course_sections").select("*").eq("course_id", sourceCourseId).order("created_at");
    for (const s of sections ?? []) {
      await db.from("course_sections").insert({ ...strip(s), course_id: newCourseId });
      bump("sections");
    }

    // ── Announcements
    const { data: anns } = await db.from("lms_announcements").select("*").eq("course_id", sourceCourseId).order("posted_at");
    if (anns?.length) {
      await db.from("lms_announcements").insert(anns.map((a: any) => ({ ...strip(a, ["posted_at"]), course_id: newCourseId })));
      bump("announcements", anns.length);
    }

    // ── Rubrics + criteria
    const { data: rubrics } = await db.from("rubrics").select("*").eq("course_id", sourceCourseId).order("created_at");
    for (const r of rubrics ?? []) {
      const { data: nr } = await db.from("rubrics").insert({ ...strip(r), course_id: newCourseId }).select("id").single();
      if (!nr) continue;
      rubricMap.set(r.id, nr.id);
      bump("rubrics");
      const { data: crit } = await db.from("rubric_criteria").select("*").eq("rubric_id", r.id).order("position");
      if (crit?.length) await db.from("rubric_criteria").insert(crit.map((c: any) => ({ ...strip(c), rubric_id: nr.id })));
    }

    // ── Pages
    const { data: pages } = await db.from("lms_pages").select("*").eq("course_id", sourceCourseId).order("position");
    for (const p of pages ?? []) {
      const { data: np } = await db.from("lms_pages").insert({ ...strip(p), course_id: newCourseId }).select("id").single();
      if (np) { pageMap.set(p.id, np.id); bump("pages"); }
    }

    // ── Quizzes + questions
    const { data: quizzes } = await db.from("quizzes").select("*").eq("course_id", sourceCourseId).order("created_at");
    for (const q of quizzes ?? []) {
      const { data: nq } = await db.from("quizzes")
        .insert({ ...strip(q, ["module_item_id"]), course_id: newCourseId }).select("id").single();
      if (!nq) continue;
      quizMap.set(q.id, nq.id);
      bump("quizzes");
      const { data: qq } = await db.from("quiz_questions").select("*").eq("quiz_id", q.id).order("position");
      if (qq?.length) {
        await db.from("quiz_questions").insert(qq.map((x: any) => ({ ...strip(x), quiz_id: nq.id })));
        bump("quiz_questions", qq.length);
      }
    }

    // ── Assignments
    const { data: assignments } = await db.from("assignments").select("*").eq("course_id", sourceCourseId).order("created_at");
    for (const a of assignments ?? []) {
      const { data: na } = await db.from("assignments").insert({
        ...strip(a, ["module_item_id"]),
        course_id: newCourseId,
        rubric_id: a.rubric_id ? (rubricMap.get(a.rubric_id) ?? null) : null,
      }).select("id").single();
      if (na) { assignmentMap.set(a.id, na.id); bump("assignments"); }
    }

    // ── Discussions (topics only, no student replies)
    const { data: discussions } = await db.from("discussions").select("*").eq("course_id", sourceCourseId).order("created_at");
    for (const d of discussions ?? []) {
      const { data: nd } = await db.from("discussions").insert({ ...strip(d), course_id: newCourseId }).select("id").single();
      if (nd) { discussionMap.set(d.id, nd.id); bump("discussions"); }
    }

    // ── Folders (parents first)
    const { data: folders } = await db.from("lms_folders").select("*").eq("course_id", sourceCourseId).order("position");
    const pending = [...(folders ?? [])];
    let guard = 0;
    while (pending.length && guard < 50) {
      guard++;
      for (let i = pending.length - 1; i >= 0; i--) {
        const f: any = pending[i];
        if (f.parent_id && !folderMap.has(f.parent_id)) continue;
        const { data: nf } = await db.from("lms_folders").insert({
          ...strip(f), course_id: newCourseId, parent_id: f.parent_id ? folderMap.get(f.parent_id) : null,
        }).select("id").single();
        if (nf) { folderMap.set(f.id, nf.id); bump("folders"); }
        pending.splice(i, 1);
      }
    }

    // ── Files (copy storage objects so the new course owns its content)
    const { data: files } = await db.from("lms_files").select("*").eq("course_id", sourceCourseId).order("name");
    for (const f of files ?? []) {
      let newPath: string | null = f.storage_path ?? null;
      let newUrl: string | null = f.file_url ?? null;

      if (f.storage_path && f.storage_provider !== "drive") {
        const bucket = String(f.storage_path).startsWith("submissions/") ? "course-assets" : "course-files";
        const tail = String(f.storage_path).split("/").slice(1).join("/") || String(f.storage_path);
        const candidate = `${newCourseId}/${tail}`;
        const { error: copyErr } = await db.storage.from(bucket).copy(f.storage_path, candidate);
        if (!copyErr) {
          newPath = candidate;
          newUrl = db.storage.from(bucket).getPublicUrl(candidate).data.publicUrl;
          if (f.file_url) urlMap.set(f.file_url, newUrl);
          urlMap.set(f.storage_path, candidate);
          bump("storage_objects");
        }
      }

      const { data: nf } = await db.from("lms_files").insert({
        ...strip(f),
        course_id: newCourseId,
        file_url: newUrl,
        storage_path: newPath,
        folder_id: f.folder_id ? (folderMap.get(f.folder_id) ?? null) : null,
      }).select("id").single();
      if (nf) { fileMap.set(f.id, nf.id); bump("files"); }
    }

    // ── Modules + items (relinked to the copied content)
    const { data: modules } = await db.from("modules").select("*").eq("course_id", sourceCourseId).order("position");
    for (const m of modules ?? []) {
      const { data: nm } = await db.from("modules").insert({ ...strip(m), course_id: newCourseId }).select("id").single();
      if (!nm) continue;
      bump("modules");
      const { data: items } = await db.from("module_items").select("*").eq("module_id", m.id).order("position");
      for (const it of items ?? []) {
        const ref =
          it.item_type === "quiz" ? (quizMap.get(it.content_ref) ?? null) :
          it.item_type === "assignment" ? (assignmentMap.get(it.content_ref) ?? null) :
          it.item_type === "page" ? (pageMap.get(it.content_ref) ?? null) :
          it.item_type === "discussion" ? (discussionMap.get(it.content_ref) ?? null) :
          it.item_type === "file" ? (fileMap.get(it.content_ref) ?? null) :
          it.content_ref;

        const { data: ni } = await db.from("module_items").insert({
          ...strip(it),
          module_id: nm.id,
          content_ref: ref ?? it.content_ref,
          url: it.url ? (urlMap.get(it.url) ?? it.url) : it.url,
          file_url: it.file_url ? (urlMap.get(it.file_url) ?? it.file_url) : it.file_url,
        }).select("id").single();
        if (ni) bump("module_items");

        if (ni?.id && ref) {
          if (it.item_type === "quiz") await db.from("quizzes").update({ module_item_id: ni.id }).eq("id", ref);
          if (it.item_type === "assignment") await db.from("assignments").update({ module_item_id: ni.id }).eq("id", ref);
        }
      }
    }

    // ── Rewrite embedded links to the old course's files
    if (urlMap.size) {
      const rewrite = (html: string | null) => {
        if (!html) return html;
        let out = html;
        urlMap.forEach((to, from) => { out = out.split(from).join(to); });
        return out;
      };
      const { data: newPages } = await db.from("lms_pages").select("id,body_html").eq("course_id", newCourseId);
      for (const p of newPages ?? []) {
        const next = rewrite(p.body_html);
        if (next !== p.body_html) await db.from("lms_pages").update({ body_html: next }).eq("id", p.id);
      }
      const { data: c } = await db.from("courses").select("syllabus_html,front_page_html").eq("id", newCourseId).maybeSingle();
      if (c) {
        await db.from("courses").update({
          syllabus_html: rewrite(c.syllabus_html) ?? c.syllabus_html,
          front_page_html: rewrite(c.front_page_html) ?? c.front_page_html,
        }).eq("id", newCourseId);
      }
    }

    return json({ ok: true, courseId: newCourseId, stats });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
