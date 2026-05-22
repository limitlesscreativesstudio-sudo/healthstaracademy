// Course roster management: list / add / remove enrollments by email.
// Requires authenticated caller who is the course instructor or an admin.
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

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Caller-scoped client (to identify user + run RLS checks)
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) return json({ error: "Unauthorized" }, 401);
    const caller = userRes.user;

    const { action, courseId, email, enrollmentId } = await req.json();
    if (!courseId) return json({ error: "courseId required" }, 400);

    // Admin client for privileged reads (auth.users lookup)
    const admin = createClient(url, service);

    // Authorize: caller must be instructor of course OR admin
    const { data: course } = await admin.from("courses").select("instructor_id").eq("id", courseId).maybeSingle();
    if (!course) return json({ error: "Course not found" }, 404);

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", caller.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    const isOwner = course.instructor_id === caller.id;
    if (!isAdmin && !isOwner) return json({ error: "Forbidden" }, 403);

    if (action === "list") {
      const { data: enrollments } = await admin
        .from("enrollments").select("id, user_id, role, enrolled_at")
        .eq("course_id", courseId);
      const enriched = await Promise.all((enrollments ?? []).map(async (e) => {
        const { data: u } = await admin.auth.admin.getUserById(e.user_id);
        const { data: p } = await admin.from("profiles").select("full_name").eq("user_id", e.user_id).maybeSingle();
        return { ...e, email: u.user?.email ?? null, full_name: p?.full_name ?? null };
      }));
      return json({ enrollments: enriched });
    }

    if (action === "add") {
      if (!email) return json({ error: "email required" }, 400);
      const normalized = email.trim().toLowerCase();
      // Find user by email — paginate listUsers
      let foundId: string | null = null;
      let foundEmail: string | null = null;
      let page = 1;
      while (page < 20) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) break;
        const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
        if (match) { foundId = match.id; foundEmail = match.email ?? null; break; }
        if (data.users.length < 200) break;
        page++;
      }
      if (!foundId) {
        return json({ error: "No portal account found for that email. Ask the student to sign up at /portal/login first." }, 404);
      }
      const { error: insErr } = await admin.from("enrollments").insert({
        course_id: courseId, user_id: foundId, role: "student",
      });
      if (insErr) {
        if (insErr.code === "23505") return json({ error: "Student is already enrolled." }, 409);
        return json({ error: insErr.message }, 400);
      }
      return json({ ok: true, email: foundEmail });
    }

    if (action === "remove") {
      if (!enrollmentId) return json({ error: "enrollmentId required" }, 400);
      const { error } = await admin.from("enrollments").delete().eq("id", enrollmentId).eq("course_id", courseId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
