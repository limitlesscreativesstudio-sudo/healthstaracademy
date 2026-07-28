import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id;
    if (!uid) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
    if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { id, action, patch } = await req.json();
    if (!id || !action) return new Response(JSON.stringify({ error: "id and action required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let update: Record<string, any> = {};
    if (action === "publish") update = { status: "published", published_at: new Date().toISOString() };
    else if (action === "unpublish") update = { status: "draft", published_at: null };
    else if (action === "archive") update = { status: "archived" };
    else if (action === "update") update = { ...(patch ?? {}) };
    else return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    update.updated_at = new Date().toISOString();
    const { error } = await supabase.from("competitor_pages").update(update).eq("id", id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
