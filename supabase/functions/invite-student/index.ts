// Invite a student to a course by email. Instructor/admin only.
// - Verifies caller is instructor of the course (or admin) via their JWT
// - Sends Supabase auth invite email
// - Records pending_enrollments row so the student is auto-enrolled on signup
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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);

    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Not authenticated" }, 401);
    const invitedBy = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { courseId, emails, section, redirectTo, cohortId } = body ?? {};

    if (!courseId || !Array.isArray(emails) || emails.length === 0) {
      return json({ error: "courseId and emails[] are required" }, 400);
    }

    const admin = createClient(url, service);

    // Authorize: caller must be instructor of course or admin
    const [{ data: course }, { data: roles }] = await Promise.all([
      admin.from("courses").select("id, instructor_id, title").eq("id", courseId).maybeSingle(),
      admin.from("user_roles").select("role").eq("user_id", invitedBy),
    ]);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
    if (!course) return json({ error: "Course not found" }, 404);
    if (!isAdmin && course.instructor_id !== invitedBy) {
      return json({ error: "Not authorized for this course" }, 403);
    }

    // If cohortId provided, resolve all sibling courses in that cohort so we
    // enroll/invite the student across the entire cohort in one shot.
    let targetCourseIds: string[] = [courseId];
    if (cohortId) {
      const { data: cohortCourses } = await admin
        .from("courses")
        .select("id, instructor_id")
        .eq("cohort_id", cohortId);
      if (cohortCourses && cohortCourses.length > 0) {
        // Authorize: admin OR instructor of at least one course in the cohort (the
        // originating course is already authorized above).
        targetCourseIds = Array.from(new Set([courseId, ...cohortCourses.map((c: any) => c.id)]));
      }
    }

    const finalRedirect =
      typeof redirectTo === "string" && redirectTo.length > 0
        ? redirectTo
        : "https://healthstaracademy.org/portal/teach/login";

    const results: Array<{ email: string; ok: boolean; message: string }> = [];

    for (const raw of emails) {
      const email = String(raw ?? "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        results.push({ email: String(raw), ok: false, message: "Invalid email" });
        continue;
      }

      // Send Supabase auth invite. If user already exists this returns an error —
      // in that case fall back to enrolling them directly.
      const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { role: "student", full_name: email.split("@")[0] },
        redirectTo: finalRedirect,
      });

      let userAlreadyExists = false;
      let existingUserId: string | null = null;
      if (inviteErr) {
        const msg = (inviteErr.message || "").toLowerCase();
        if (msg.includes("already been registered") || msg.includes("already registered") || msg.includes("already exists")) {
          userAlreadyExists = true;
        } else {
          results.push({ email, ok: false, message: inviteErr.message });
          continue;
        }
      }

      if (userAlreadyExists) {
        // Look up their user id
        let page = 1;
        while (page < 20) {
          const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
          if (error) break;
          const match = data.users.find((u) => u.email?.toLowerCase() === email);
          if (match) { existingUserId = match.id; break; }
          if (data.users.length < 200) break;
          page++;
        }
      } else if (inviteData?.user?.id) {
        existingUserId = inviteData.user.id;
      }

      // Record pending_enrollment for tracking — one row per target course.
      for (const cid of targetCourseIds) {
        const { error: peErr } = await admin
          .from("pending_enrollments")
          .upsert(
            {
              course_id: cid,
              email,
              section: section ?? null,
              invited_by: invitedBy,
              status: userAlreadyExists ? "accepted" : "pending",
              accepted_at: userAlreadyExists ? new Date().toISOString() : null,
            },
            { onConflict: "course_id,email" },
          );
        if (peErr) console.error("pending_enrollments upsert error", peErr);
      }

      // If user already exists, enroll them directly right now — across every
      // target course. Also stamp cohort_id on the students record when we know it.
      if (userAlreadyExists && existingUserId) {
        let enrolledCount = 0;
        for (const cid of targetCourseIds) {
          const { error: enrErr } = await admin
            .from("enrollments")
            .insert({ course_id: cid, user_id: existingUserId, role: "student" });
          if (!enrErr || enrErr.code === "23505") enrolledCount++;
        }
        if (cohortId) {
          await admin.from("students").update({ cohort_id: cohortId })
            .eq("email", email);
        }
        results.push({
          email, ok: true,
          message: `Already had an account — enrolled in ${enrolledCount} course${enrolledCount === 1 ? "" : "s"}.`,
        });
      } else {
        results.push({
          email, ok: true,
          message: targetCourseIds.length > 1
            ? `Invitation sent — will be enrolled in ${targetCourseIds.length} cohort courses on signup.`
            : "Invitation email sent.",
        });
      }
    }

    return json({ ok: true, results });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
