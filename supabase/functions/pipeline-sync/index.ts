// Edge function: pipeline-sync
// Keeps a student's portal account + course enrollment in sync with their
// admin pipeline state (enrollment_status + job_pipeline.stage).
//
// - Active in training  -> ensure auth user, student role, profile, enrollment
// - Left / disqualified -> remove active course enrollments (records are kept)
// - Completed (hired / not_placed / certified) -> keep records, mark alumni
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ACTIVE_STATUSES = new Set(["enrolled"]);
const EXIT_STATUSES = new Set(["disqualified", "withdrawn", "dropped"]);
const COMPLETED_STAGES = new Set(["hired", "not_placed", "certified"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing_authorization" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Admins and instructors may sync
    const { data: roleRows } = await admin
      .from("user_roles").select("role").eq("user_id", user.id);
    const roles = (roleRows ?? []).map((r: any) => r.role);
    if (!roles.includes("admin") && !roles.includes("instructor")) {
      return json({ error: "forbidden" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const studentId: string | undefined = body.student_id;
    if (!studentId || typeof studentId !== "string") {
      return json({ error: "invalid_input", detail: "student_id required" }, 400);
    }

    const { data: student, error: sErr } = await admin
      .from("students").select("*").eq("id", studentId).maybeSingle();
    if (sErr) return json({ error: "db_error", detail: sErr.message }, 500);
    if (!student) return json({ error: "student_not_found" }, 404);

    const { data: pipe } = await admin
      .from("job_pipeline").select("stage").eq("student_id", studentId).maybeSingle();
    const stage: string | null = pipe?.stage ?? null;

    const status = String(student.enrollment_status ?? "");
    const fullName = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim();

    // ---------- Determine target course for this student's cohort ----------
    const findCourseId = async (): Promise<string | null> => {
      if (student.cohort_id) {
        const { data } = await admin.from("courses").select("id")
          .eq("cohort_id", student.cohort_id).eq("status", "published")
          .order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (data?.id) return data.id;
      }
      const { data: any1 } = await admin.from("courses").select("id")
        .eq("status", "published").order("created_at", { ascending: false })
        .limit(1).maybeSingle();
      return any1?.id ?? null;
    };

    // ---------- LEAVING ----------
    if (EXIT_STATUSES.has(status)) {
      let removed = 0;
      if (student.portal_user_id) {
        const { data: gone } = await admin.from("enrollments")
          .delete().eq("user_id", student.portal_user_id).eq("role", "student").select("id");
        removed = (gone ?? []).length;
      }
      await admin.from("pending_enrollments")
        .update({ status: "revoked" })
        .ilike("email", student.email).eq("status", "pending");

      return json({ ok: true, action: "unenrolled", enrollments_removed: removed });
    }

    // ---------- COMPLETED (keep everything, just report) ----------
    if (stage && COMPLETED_STAGES.has(stage) && !ACTIVE_STATUSES.has(status)) {
      return json({ ok: true, action: "kept_alumni_records", stage });
    }

    // ---------- ACTIVE / MOVING INTO TRAINING ----------
    if (!ACTIVE_STATUSES.has(status)) {
      return json({ ok: true, action: "no_change", status, stage });
    }

    let portalUserId: string | null = student.portal_user_id ?? null;
    let invited = false;

    if (!portalUserId) {
      const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const match = existing?.users?.find(
        (u: any) => (u.email ?? "").toLowerCase() === String(student.email).toLowerCase(),
      );
      if (match) {
        portalUserId = match.id;
      } else {
        const { data: created, error: invErr } = await admin.auth.admin.inviteUserByEmail(
          student.email,
          { data: { full_name: fullName, requested_role: "student", source: "pipeline_sync" } },
        );
        if (invErr || !created?.user) {
          return json({ error: "invite_failed", detail: invErr?.message ?? "unknown" }, 500);
        }
        portalUserId = created.user.id;
        invited = true;
      }
    }

    await admin.from("profiles").upsert(
      { user_id: portalUserId, full_name: fullName }, { onConflict: "user_id" },
    );
    await admin.from("user_roles").upsert(
      { user_id: portalUserId, role: "student" }, { onConflict: "user_id,role" },
    );

    const courseId = await findCourseId();
    let enrollmentCreated = false;
    if (courseId) {
      const { data: existingEnroll } = await admin.from("enrollments")
        .select("id").eq("course_id", courseId).eq("user_id", portalUserId).maybeSingle();
      if (!existingEnroll) {
        const { error: enrErr } = await admin.from("enrollments")
          .insert({ course_id: courseId, user_id: portalUserId, role: "student" });
        if (enrErr) return json({ error: "enroll_failed", detail: enrErr.message }, 500);
        enrollmentCreated = true;
      }
    }

    await admin.from("students").update({
      portal_user_id: portalUserId,
      provisioned_at: student.provisioned_at ?? new Date().toISOString(),
    }).eq("id", studentId);

    // Keep the job pipeline row pointed at the portal account
    await admin.from("job_pipeline")
      .update({ portal_user_id: portalUserId, cohort_id: student.cohort_id ?? null })
      .eq("student_id", studentId);

    return json({
      ok: true,
      action: "synced",
      portal_user_id: portalUserId,
      course_id: courseId,
      enrollment_created: enrollmentCreated,
      invited,
    });
  } catch (e) {
    console.error("pipeline-sync error", e);
    return json({ error: "internal_error", detail: (e as Error).message }, 500);
  }
});
