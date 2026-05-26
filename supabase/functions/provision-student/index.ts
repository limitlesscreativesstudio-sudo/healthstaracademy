// Edge function: provision-student
// Auto-provisions an LMS portal account + course enrollment for a student
// who has been marked as "enrolled" in the admin pipeline.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // ---- Auth: caller must be admin ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing_authorization" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    if (!roleRows || roleRows.length === 0) return json({ error: "forbidden_admin_only" }, 403);

    // ---- Input ----
    const body = await req.json().catch(() => ({}));
    const studentId: string | undefined = body.student_id;
    if (!studentId || typeof studentId !== "string") {
      return json({ error: "invalid_input", detail: "student_id required" }, 400);
    }

    // ---- Load student ----
    const { data: student, error: studErr } = await admin
      .from("students")
      .select("*")
      .eq("id", studentId)
      .maybeSingle();
    if (studErr) return json({ error: "db_error", detail: studErr.message }, 500);
    if (!student) return json({ error: "student_not_found" }, 404);

    // ---- Find or invite auth user ----
    let portalUserId = student.portal_user_id as string | null;

    if (!portalUserId) {
      // Try to find existing auth user by email
      const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const match = existing?.users?.find(
        (u: any) => (u.email ?? "").toLowerCase() === String(student.email).toLowerCase(),
      );
      if (match) {
        portalUserId = match.id;
      } else {
        // Invite by email — sends magic invite link via configured email provider
        const fullName = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim();
        const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(
          student.email,
          {
            data: {
              full_name: fullName,
              requested_role: "student",
              source: "admin_provision",
              cohort_id: student.cohort_id ?? null,
            },
          },
        );
        if (invErr || !invited?.user) {
          return json({ error: "invite_failed", detail: invErr?.message ?? "unknown" }, 500);
        }
        portalUserId = invited.user.id;
      }
    }

    if (!portalUserId) return json({ error: "no_portal_user_id" }, 500);

    // Ensure profile exists (trigger usually does this, but invite path can race)
    await admin.from("profiles").upsert(
      { user_id: portalUserId, full_name: `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() },
      { onConflict: "user_id" },
    );

    // Ensure student role
    await admin.from("user_roles").upsert(
      { user_id: portalUserId, role: "student" },
      { onConflict: "user_id,role" },
    );

    // ---- Find matching course for this cohort ----
    let courseId: string | null = null;
    if (student.cohort_id) {
      const { data: cohortCourse } = await admin
        .from("courses")
        .select("id")
        .eq("cohort_id", student.cohort_id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      courseId = cohortCourse?.id ?? null;
    }
    if (!courseId) {
      // Fallback: most recent published course
      const { data: anyCourse } = await admin
        .from("courses")
        .select("id")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      courseId = anyCourse?.id ?? null;
    }

    let enrollmentCreated = false;
    if (courseId) {
      // Check existing enrollment to avoid duplicate-key noise
      const { data: existingEnroll } = await admin
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", portalUserId)
        .maybeSingle();
      if (!existingEnroll) {
        const { error: enrErr } = await admin
          .from("enrollments")
          .insert({ course_id: courseId, user_id: portalUserId, role: "student" });
        if (enrErr) return json({ error: "enroll_failed", detail: enrErr.message }, 500);
        enrollmentCreated = true;
      }
    }

    // ---- Update student record ----
    const { error: updErr } = await admin
      .from("students")
      .update({
        portal_user_id: portalUserId,
        provisioned_at: new Date().toISOString(),
        enrollment_status: "enrolled",
      })
      .eq("id", studentId);
    if (updErr) return json({ error: "student_update_failed", detail: updErr.message }, 500);

    // ---- Log ----
    await admin.from("enrollment_emails").insert({
      student_id: studentId,
      email_type: "portal_provisioned",
      status: "sent",
      metadata: {
        portal_user_id: portalUserId,
        course_id: courseId,
        enrollment_created: enrollmentCreated,
        invited_by: user.id,
      },
    });

    return json({
      ok: true,
      portal_user_id: portalUserId,
      course_id: courseId,
      enrollment_created: enrollmentCreated,
    });
  } catch (e) {
    console.error("provision-student error", e);
    return json({ error: "internal_error", detail: (e as Error).message }, 500);
  }
});
