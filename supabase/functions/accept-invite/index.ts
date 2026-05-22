// Accept a course invitation: look up token, create user, enroll, mark accepted.
// Public endpoint (no auth required) — security via single-use random token.
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
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, service);

    const body = await req.json();
    const { action, token, fullName, password } = body ?? {};
    if (!token) return json({ error: "token required" }, 400);

    const { data: invite, error: invErr } = await admin
      .from("course_invites")
      .select("id, course_id, email, expires_at, accepted_at, courses:course_id(title)")
      .eq("token", token)
      .maybeSingle();
    if (invErr || !invite) return json({ error: "Invalid invitation link." }, 404);
    if (invite.accepted_at) return json({ error: "This invitation has already been used." }, 410);
    if (new Date(invite.expires_at) < new Date()) return json({ error: "This invitation has expired. Ask your instructor to send a new one." }, 410);

    const courseTitle = (invite.courses as any)?.title ?? "your course";

    if (action === "lookup") {
      return json({ email: invite.email, courseTitle });
    }

    if (action === "accept") {
      if (!password || password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400);
      if (!fullName?.trim()) return json({ error: "Full name required." }, 400);

      // Check if a user already exists for this email
      let userId: string | null = null;
      let page = 1;
      while (page < 20) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) break;
        const match = data.users.find((u) => u.email?.toLowerCase() === invite.email.toLowerCase());
        if (match) { userId = match.id; break; }
        if (data.users.length < 200) break;
        page++;
      }

      if (!userId) {
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: invite.email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
        if (createErr || !created.user) return json({ error: createErr?.message ?? "Failed to create account" }, 400);
        userId = created.user.id;
      }

      // Make sure profile exists / is updated with name
      await admin.from("profiles").upsert({ user_id: userId, full_name: fullName }, { onConflict: "user_id" });

      // Enroll (idempotent — ignore unique-violation)
      const { error: enrErr } = await admin.from("enrollments").insert({
        course_id: invite.course_id, user_id: userId, role: "student",
      });
      if (enrErr && enrErr.code !== "23505") return json({ error: enrErr.message }, 400);

      await admin.from("course_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

      return json({ ok: true, email: invite.email });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
