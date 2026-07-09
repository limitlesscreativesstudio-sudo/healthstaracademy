// Admin-only endpoint to update a blog draft's status (publish / unpublish / archive) and edits.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "").trim();
    if (!jwt) return json({ error: "Missing auth" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser(jwt);
    const uid = userData?.user?.id;
    if (!uid) return json({ error: "Not authenticated" }, 401);

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin only" }, 403);

    const body = await req.json();
    const { id, action, patch } = body as {
      id: string;
      action: "publish" | "unpublish" | "archive" | "update";
      patch?: Record<string, unknown>;
    };
    if (!id || !action) return json({ error: "id and action required" }, 400);

    const updates: Record<string, unknown> = {};
    if (action === "publish") { updates.status = "published"; updates.published_at = new Date().toISOString(); }
    if (action === "unpublish") { updates.status = "draft"; updates.published_at = null; }
    if (action === "archive") { updates.status = "archived"; }
    if (action === "update" && patch) {
      const allowed = ["title","meta_description","tldr","body_markdown","category","read_time","hero_image_url","target_keyword","target_city","scheduled_for","status"];
      for (const k of allowed) if (k in patch) updates[k] = (patch as any)[k];
    }

    const { data, error } = await supabase.from("blog_drafts").update(updates).eq("id", id).select().single();
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, post: data });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
