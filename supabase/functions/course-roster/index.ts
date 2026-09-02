// Course roster management: list enrollments, invite students, revoke invites, remove enrollments.
// Requires authenticated caller who is the course instructor or an admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
};

const sendInviteEmail = async (opts: {
  to: string;
  courseTitle: string;
  inviterName: string;
  acceptUrl: string;
}) => {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return { skipped: true };
  }
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#2D2D47">
      <h1 style="color:#7C4DFF;margin:0 0 8px">You're invited to ${opts.courseTitle}</h1>
      <p style="color:#555">${opts.inviterName} has invited you to join <strong>${opts.courseTitle}</strong> in the Health Star Academy Learning Portal.</p>
      <p style="margin:24px 0">
        <a href="${opts.acceptUrl}" style="background:#319795;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;display:inline-block">Accept Invitation</a>
      </p>
      <p style="font-size:13px;color:#888">This invitation expires in 14 days. If the button doesn't work, copy and paste this URL:<br/><span style="word-break:break-all">${opts.acceptUrl}</span></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="font-size:12px;color:#999">Health Star Academy · CDPH-Approved CNA Training</p>
    </div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: "Health Star Academy <onboarding@resend.dev>",
      to: [opts.to],
      subject: `You're invited to ${opts.courseTitle}`,
      html,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    console.error("Resend error:", text);
    return { error: text };
  }
  return { ok: true };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) return json({ error: "Unauthorized" }, 401);
    const caller = userRes.user;

    const { action, courseId, email, enrollmentId, inviteId, origin, role } = await req.json();
    if (!courseId) return json({ error: "courseId required" }, 400);


    const admin = createClient(url, service);

    const { data: course } = await admin.from("courses").select("id, title, instructor_id").eq("id", courseId).maybeSingle();
    if (!course) return json({ error: "Course not found" }, 404);

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", caller.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    const isOwner = course.instructor_id === caller.id;
    if (!isAdmin && !isOwner) return json({ error: "Forbidden" }, 403);

    if (action === "list") {
      const { data: enrollments } = await admin
        .from("enrollments").select("id, user_id, role, enrolled_at")
        .eq("course_id", courseId);
      const rows = enrollments ?? [];
      const ids = rows.map((e) => e.user_id).filter(Boolean);

      // Batch lookups instead of one auth call per enrollment (much faster).
      const emailById: Record<string, string | null> = {};
      let page = 1;
      while (page < 20) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) break;
        for (const u of data.users) emailById[u.id] = u.email ?? null;
        if (data.users.length < 200) break;
        page++;
      }
      const nameById: Record<string, string | null> = {};
      if (ids.length) {
        const { data: profs } = await admin
          .from("profiles").select("user_id, full_name").in("user_id", ids);
        for (const p of profs ?? []) nameById[p.user_id] = p.full_name ?? null;
      }
      const enriched = rows.map((e) => ({
        ...e,
        email: emailById[e.user_id] ?? null,
        full_name: nameById[e.user_id] ?? null,
      }));
      const { data: invites } = await admin
        .from("course_invites")
        .select("id, email, expires_at, accepted_at, created_at")
        .eq("course_id", courseId)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      return json({ enrollments: enriched, invites: invites ?? [] });
    }


    if (action === "invite") {
      if (!email) return json({ error: "email required" }, 400);
      const normalized = email.trim().toLowerCase();

      // Already enrolled?
      let userId: string | null = null;
      let page = 1;
      while (page < 20) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) break;
        const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
        if (match) { userId = match.id; break; }
        if (data.users.length < 200) break;
        page++;
      }
      if (userId) {
        const { data: existing } = await admin.from("enrollments").select("id").eq("course_id", courseId).eq("user_id", userId).maybeSingle();
        if (existing) return json({ error: "This student is already enrolled." }, 409);
        // Enroll directly, no need to invite
        await admin.from("enrollments").insert({ course_id: courseId, user_id: userId, role: "student" });
        return json({ ok: true, enrolled: true, message: "Student already had an account — enrolled directly." });
      }

      const token = randomToken();
      const { data: invite, error: invErr } = await admin.from("course_invites").insert({
        course_id: courseId, email: normalized, token, invited_by: caller.id,
      }).select().single();
      if (invErr) {
        if (invErr.code === "23505") return json({ error: "An active invite already exists for this email." }, 409);
        return json({ error: invErr.message }, 400);
      }

      const { data: inviterProfile } = await admin.from("profiles").select("full_name").eq("user_id", caller.id).maybeSingle();
      const acceptUrl = `${origin || "https://healthstaracademy.org"}/portal/accept-invite?token=${token}`;
      const mailRes = await sendInviteEmail({
        to: normalized,
        courseTitle: course.title,
        inviterName: inviterProfile?.full_name || caller.email || "Your instructor",
        acceptUrl,
      });

      return json({ ok: true, invited: true, invite, mail: mailRes });
    }

    if (action === "revoke") {
      if (!inviteId) return json({ error: "inviteId required" }, 400);
      const { error } = await admin.from("course_invites").delete().eq("id", inviteId).eq("course_id", courseId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "remove") {
      if (!enrollmentId) return json({ error: "enrollmentId required" }, 400);
      const { error } = await admin.from("enrollments").delete().eq("id", enrollmentId).eq("course_id", courseId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "set_role") {
      if (!enrollmentId || !role) return json({ error: "enrollmentId and role required" }, 400);
      const allowed = ["student", "ta", "teacher", "observer", "designer", "instructor"];
      if (!allowed.includes(String(role))) return json({ error: "Invalid role" }, 400);
      const { error } = await admin.from("enrollments")
        .update({ role: String(role) }).eq("id", enrollmentId).eq("course_id", courseId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
