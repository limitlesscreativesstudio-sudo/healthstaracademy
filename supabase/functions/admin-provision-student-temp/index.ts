// TEMPORARY: provision a single student account + enrollment.
// Guarded by a shared secret passed in the request body. Delete after use.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const GUARD = "hsa-provision-2026-08-26";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { guard, email, password, fullName, courseId } = await req.json();
    if (guard !== GUARD) return json({ error: "forbidden" }, 403);

    const mail = String(email).trim().toLowerCase();
    let uid: string | null = null;
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: mail, password, email_confirm: true, user_metadata: { full_name: fullName },
    });
    if (created?.user) uid = created.user.id;
    if (cErr) {
      let page = 1;
      while (page < 20) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) break;
        const m = data.users.find((u) => u.email?.toLowerCase() === mail);
        if (m) { uid = m.id; break; }
        if (data.users.length < 200) break;
        page++;
      }
      if (uid) await admin.auth.admin.updateUserById(uid, { password, email_confirm: true });
    }
    if (!uid) return json({ error: cErr?.message ?? "could not create user" }, 400);

    await admin.from("profiles").upsert({ user_id: uid, full_name: fullName }, { onConflict: "user_id" });
    await admin.from("user_roles").upsert({ user_id: uid, role: "student" }, { onConflict: "user_id,role" });
    const { error: eErr } = await admin.from("enrollments").insert({ course_id: courseId, user_id: uid, role: "student" });
    if (eErr && eErr.code !== "23505") return json({ error: eErr.message }, 400);

    return json({ ok: true, user_id: uid, existed: !!cErr });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
