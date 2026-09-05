// Portal Doctor: end-to-end health scan of the LMS.
// Checks student records, enrollments, instructor access, quizzes, attempts,
// grading backlog, module ordering and content links, then writes findings to
// agent_findings so they can be reviewed and fixed quickly.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";

type Severity = "critical" | "high" | "medium" | "low";
type Finding = {
  severity: Severity;
  title: string;
  detail?: string;
  suggested_fix?: string;
  target_table?: string;
  target_id?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey);

  let body: any = {};
  try { body = await req.json(); } catch { /* no body */ }
  const courseId: string | null = body?.courseId ?? null;
  const action: string = body?.action ?? "scan";

  // ── Caller must be an admin, an instructor, or the scheduler ───────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
  const scheduled = bearer === serviceKey;

  let uid: string | null = null;
  let isAdmin = false;
  if (!scheduled) {
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await caller.auth.getUser();
    uid = userRes?.user?.id ?? null;
    if (!uid) return json({ error: "Not signed in" }, 401);

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", uid);
    const roleSet = new Set((roles ?? []).map((r: any) => r.role));
    const { data: teaching } = await admin
      .from("enrollments").select("course_id").eq("user_id", uid).eq("role", "teacher");
    isAdmin = roleSet.has("admin");
    const isStaff = isAdmin || roleSet.has("instructor") || (teaching ?? []).length > 0;
    if (!isStaff) return json({ error: "Not allowed" }, 403);
  }

  // ── Apply a confirmed correction ───────────────────────────────────────────
  if (action === "fix") {
    try {
      const result = await applyFix(admin, String(body?.findingId ?? ""), uid);
      return json(result, result.ok ? 200 : 400);
    } catch (e) {
      return json({ ok: false, error: String(e) }, 500);
    }
  }

  const findings: Finding[] = [];
  const add = (f: Finding) => findings.push(f);

  const { data: run } = await admin
    .from("agent_runs").insert({ agent: "diagnostics", status: "running" }).select("id").single();
  const runId: string | null = run?.id ?? null;


  try {
    // ── Courses in scope ─────────────────────────────────────────────────────
    let cq = admin.from("courses").select("id,title,instructor_id,status");
    if (courseId) cq = cq.eq("id", courseId);
    const { data: courses } = await cq;
    const courseList = courses ?? [];
    const courseIds = courseList.map((c: any) => c.id);
    const courseTitle = new Map(courseList.map((c: any) => [c.id, c.title]));

    const { data: enrolls } = await admin
      .from("enrollments").select("id,course_id,user_id,role").in("course_id", courseIds);
    const enrollList = enrolls ?? [];

    // 1. Every course needs at least one teacher and one student
    for (const c of courseList) {
      const mine = enrollList.filter((e: any) => e.course_id === c.id);
      if (!mine.some((e: any) => e.role === "teacher")) {
        add({
          severity: "high", target_table: "enrollments", target_id: c.id,
          title: `No instructor on "${c.title}"`,
          detail: "Nobody is enrolled as a teacher, so staff may not see this course's students or grading.",
          suggested_fix: "Add an instructor from the People tab.",
        });
      }
      if (!mine.some((e: any) => e.role === "student")) {
        add({
          severity: "low", target_table: "enrollments", target_id: c.id,
          title: `No students enrolled in "${c.title}"`,
          detail: "This course has no student roster yet.",
          suggested_fix: "Add students from the People tab, or ignore if this is a template.",
        });
      }
    }

    // 2. Student accounts: profile + role + student record
    const studentUserIds = Array.from(
      new Set(enrollList.filter((e: any) => e.role === "student").map((e: any) => e.user_id)),
    );
    if (studentUserIds.length) {
      const [{ data: profs }, { data: srole }, { data: recs }] = await Promise.all([
        admin.from("profiles").select("user_id,full_name").in("user_id", studentUserIds),
        admin.from("user_roles").select("user_id,role").in("user_id", studentUserIds),
        admin.from("students").select("id,portal_user_id,first_name,last_name").in("portal_user_id", studentUserIds),
      ]);
      const hasProfile = new Set((profs ?? []).map((p: any) => p.user_id));
      const named = new Map((profs ?? []).map((p: any) => [p.user_id, p.full_name]));
      const hasStudentRole = new Set((srole ?? []).filter((r: any) => r.role === "student").map((r: any) => r.user_id));
      const hasRecord = new Set((recs ?? []).map((r: any) => r.portal_user_id));
      for (const sid of studentUserIds) {
        const label = named.get(sid) || sid.slice(0, 8);
        if (!hasProfile.has(sid) || !named.get(sid)) {
          add({
            severity: "medium", target_table: "profiles", target_id: sid,
            title: `Student has no name on file (${label})`,
            detail: "Rosters and gradebooks will show this person as \"Student\".",
            suggested_fix: "Open People and set their full name.",
          });
        }
        if (!hasStudentRole.has(sid)) {
          add({
            severity: "high", target_table: "user_roles", target_id: sid,
            title: `Missing student role for ${label}`,
            detail: "Without the student role the portal may show them the wrong menu.",
            suggested_fix: "Re-add the student from People so the role is created.",
          });
        }
        if (!hasRecord.has(sid)) {
          add({
            severity: "medium", target_table: "students", target_id: sid,
            title: `No student record for ${label}`,
            detail: "Enrollment and 4-year record keeping rely on a linked student record.",
            suggested_fix: "Re-add the student from People to create the record.",
          });
        }
      }
    }

    // 3. Quizzes and attempts
    const { data: quizzes } = await admin
      .from("quizzes").select("id,title,course_id,published,total_points,answer_key_status").in("course_id", courseIds);
    const quizList = quizzes ?? [];
    const quizIds = quizList.map((q: any) => q.id);
    const quizById = new Map(quizList.map((q: any) => [q.id, q]));

    const { data: qq } = quizIds.length
      ? await admin.from("quiz_questions").select("id,quiz_id").in("quiz_id", quizIds)
      : { data: [] as any[] };
    const qCount = new Map<string, number>();
    for (const q of qq ?? []) qCount.set(q.quiz_id, (qCount.get(q.quiz_id) ?? 0) + 1);

    for (const q of quizList) {
      const n = qCount.get(q.id) ?? 0;
      if (q.published && n === 0) {
        add({
          severity: "critical", target_table: "quizzes", target_id: q.id,
          title: `"${q.title}" is open to students but has no questions`,
          detail: `Course: ${courseTitle.get(q.course_id) ?? ""}. Students open it and see a blank page.`,
          suggested_fix: "Add questions, or lock the quiz until it is ready.",
        });
      }
      if (n > 0 && q.answer_key_status === "unkeyed") {
        add({
          severity: "low", target_table: "quizzes", target_id: q.id,
          title: `"${q.title}" has no answer key`,
          detail: "Nothing can be auto-checked; every submission needs manual grading.",
          suggested_fix: "Set the correct answers, or grade it by hand in the Grade panel.",
        });
      }
    }

    const { data: attempts } = quizIds.length
      ? await admin.from("quiz_attempts")
          .select("id,quiz_id,user_id,submitted_at,started_at,grading_status,score")
          .in("quiz_id", quizIds)
      : { data: [] as any[] };
    const attemptList = attempts ?? [];
    const studentSet = new Set(studentUserIds);
    const now = Date.now();

    // Attempts belonging to staff / non-enrolled accounts pollute the counts
    const strays = attemptList.filter((a: any) => !studentSet.has(a.user_id));
    if (strays.length) {
      add({
        severity: "medium", target_table: "quiz_attempts",
        title: `${strays.length} quiz attempt(s) from people who are not enrolled students`,
        detail: "Staff previews or removed students are inflating quiz counts.",
        suggested_fix: "Delete these practice attempts so counts show real students only.",
      });
    }

    // Grading backlog
    const awaiting = attemptList.filter(
      (a: any) => studentSet.has(a.user_id) && a.submitted_at && a.grading_status !== "released",
    );
    const stale = awaiting.filter((a: any) => now - new Date(a.submitted_at).getTime() > 3 * 864e5);
    if (awaiting.length) {
      add({
        severity: stale.length ? "high" : "medium", target_table: "quiz_attempts",
        title: `${awaiting.length} submitted quiz${awaiting.length === 1 ? "" : "zes"} waiting to be graded`,
        detail: stale.length
          ? `${stale.length} of them have been waiting more than 3 days. Students see no score until you release grades.`
          : "Students see no score until you grade and release.",
        suggested_fix: "Open Quizzes → Grade on each quiz, then Release.",
      });
    }

    // Stuck in-progress attempts block a student's single allowed attempt
    const stuck = attemptList.filter(
      (a: any) => studentSet.has(a.user_id) && !a.submitted_at &&
        now - new Date(a.started_at).getTime() > 2 * 864e5,
    );
    for (const a of stuck) {
      add({
        severity: "high", target_table: "quiz_attempts", target_id: a.id,
        title: `Unfinished quiz stuck open: "${quizById.get(a.quiz_id)?.title ?? "Quiz"}"`,
        detail: "Started more than 2 days ago and never submitted; it uses up the student's only attempt.",
        suggested_fix: "Force-submit it, or give the student another attempt in Quiz Gradebook.",
      });
    }

    // 4. Modules and items
    const { data: modules } = await admin
      .from("modules").select("id,course_id,title,position,published").in("course_id", courseIds);
    const moduleList = modules ?? [];
    const modIds = moduleList.map((m: any) => m.id);
    const byCourse = new Map<string, any[]>();
    for (const m of moduleList) {
      byCourse.set(m.course_id, [...(byCourse.get(m.course_id) ?? []), m]);
    }
    for (const [cid, mods] of byCourse) {
      const pos = mods.map((m: any) => m.position);
      if (new Set(pos).size !== pos.length) {
        add({
          severity: "medium", target_table: "modules", target_id: cid,
          title: `Modules are out of order in "${courseTitle.get(cid) ?? cid}"`,
          detail: "Two or more modules share the same position, so days can appear shuffled.",
          suggested_fix: "Re-order the modules once; the list will renumber itself.",
        });
      }
    }

    const { data: items } = modIds.length
      ? await admin.from("module_items")
          .select("id,module_id,title,item_type,content_ref,url,published,position")
          .in("module_id", modIds)
      : { data: [] as any[] };
    const itemList = items ?? [];
    const pageIds = itemList.filter((i: any) => i.item_type === "page" && i.content_ref).map((i: any) => i.content_ref);
    const { data: pages } = pageIds.length
      ? await admin.from("lms_pages").select("id").in("id", pageIds)
      : { data: [] as any[] };
    const livePages = new Set((pages ?? []).map((p: any) => p.id));
    for (const it of itemList) {
      if (it.item_type === "page" && it.content_ref && !livePages.has(it.content_ref)) {
        add({
          severity: "high", target_table: "module_items", target_id: it.id,
          title: `Broken link in modules: "${it.title}"`,
          detail: "This item points at a page that no longer exists, so it opens empty.",
          suggested_fix: "Re-attach the page or remove the item.",
        });
      }
      if (it.item_type === "quiz" && it.content_ref) {
        const q = quizById.get(it.content_ref);
        if (!q) {
          add({
            severity: "high", target_table: "module_items", target_id: it.id,
            title: `Broken quiz link in modules: "${it.title}"`,
            detail: "The quiz behind this module item is missing.",
            suggested_fix: "Re-attach the quiz or delete the item.",
          });
        } else if (it.published && !q.published) {
          add({
            severity: "medium", target_table: "module_items", target_id: it.id,
            title: `"${it.title}" looks open in the module but the quiz is locked`,
            detail: "Students can click it and then get a locked notice.",
            suggested_fix: "Unlock the quiz, or hide the module item.",
          });
        }
      }
    }

    // 5. Pending invites that were never accepted
    const { data: pend } = await admin
      .from("pending_enrollments").select("id,email,course_id,status,invited_at")
      .in("course_id", courseIds).eq("status", "pending");
    for (const p of pend ?? []) {
      if (now - new Date(p.invited_at).getTime() > 7 * 864e5) {
        add({
          severity: "medium", target_table: "pending_enrollments", target_id: p.id,
          title: `Invite never accepted: ${p.email}`,
          detail: "Invited more than a week ago and still not signed in.",
          suggested_fix: "Resend the invite from People, or remove it.",
        });
      }
    }

    // 6. Attendance not being recorded for an active course
    const { data: att } = await admin
      .from("attendance").select("id,course_id").in("course_id", courseIds).limit(1);
    if (studentUserIds.length && (att ?? []).length === 0) {
      add({
        severity: "low", target_table: "attendance",
        title: "No attendance has been recorded yet",
        detail: "Students are enrolled but no attendance days exist.",
        suggested_fix: "Take attendance from the Attendance tab.",
      });
    }

    // ── Persist ──────────────────────────────────────────────────────────────
    if (findings.length) {
      await admin.from("agent_findings").insert(
        findings.map(f => ({ agent: "diagnostics", run_id: runId, status: "open", ...f })),
      );
    }
    const counts = findings.reduce<Record<string, number>>((a, f) => {
      a[f.severity] = (a[f.severity] ?? 0) + 1; return a;
    }, {});
    const summary = findings.length
      ? `${findings.length} issue(s): ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ")}`
      : "No issues found";

    if (runId) {
      await admin.from("agent_runs")
        .update({ status: "success", finished_at: new Date().toISOString(), summary })
        .eq("id", runId);
    }

    return json({
      ok: true, run_id: runId, summary, counts,
      checked: {
        courses: courseList.length, students: studentUserIds.length,
        quizzes: quizList.length, attempts: attemptList.length,
        modules: moduleList.length, module_items: itemList.length,
      },
      findings,
    });
  } catch (e) {
    if (runId) {
      await admin.from("agent_runs")
        .update({ status: "error", finished_at: new Date().toISOString(), summary: String(e) })
        .eq("id", runId);
    }
    return json({ error: String(e) }, 500);
  }
});
