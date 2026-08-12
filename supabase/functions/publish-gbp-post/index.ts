// Admin-only: publish a Google Business Profile draft.
// If GBP_WEBHOOK_URL is set (Zapier/Make/n8n hook that posts to GBP), we POST the draft
// there and mark it published. Otherwise we mark the post as `ready_to_post` and return
// a helpful payload so the admin can copy/paste manually. Failures email the admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";
import { notifyAdmin } from "../_shared/notify-admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const jwt = auth.replace("Bearer ", "").trim();
    if (!jwt) return json({ error: "Missing auth" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: u } = await supabase.auth.getUser(jwt);
    const uid = u?.user?.id;
    if (!uid) return json({ error: "Not authenticated" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin only" }, 403);

    const { id, action } = await req.json() as { id: string; action: "publish" | "mark_posted" | "discard" };
    if (!id || !action) return json({ error: "id and action required" }, 400);

    const { data: post, error: postErr } = await supabase.from("gbp_posts").select("*").eq("id", id).single();
    if (postErr || !post) return json({ error: "Post not found" }, 404);

    if (action === "discard") {
      await supabase.from("gbp_posts").update({ status: "archived" }).eq("id", id);
      return json({ ok: true, status: "archived" });
    }

    if (action === "mark_posted") {
      await supabase.from("gbp_posts").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id);
      return json({ ok: true, status: "published" });
    }

    // action === "publish"
    const channel = (post as any).channel === "facebook" ? "facebook" : "gbp";
    const webhook = channel === "facebook"
      ? Deno.env.get("FACEBOOK_WEBHOOK_URL")
      : Deno.env.get("GBP_WEBHOOK_URL");
    const composer = channel === "facebook"
      ? "https://www.facebook.com/healthstaracademy"
      : "https://business.google.com/";
    if (!webhook) {
      return json({
        ok: false,
        mode: "manual",
        channel,
        message: channel === "facebook"
          ? "No FACEBOOK_WEBHOOK_URL configured. Copy the post and paste it on your Facebook Page, then click 'Mark as posted'."
          : "No GBP_WEBHOOK_URL configured. Copy the post and paste into Google Business Profile, then click 'Mark as posted'.",
        gbp_composer: composer,
        post: { title: post.title, body: post.body, cta_label: post.cta_label, cta_url: post.cta_url },
      }, 200);
    }

    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          body: post.body,
          cta_label: post.cta_label,
          cta_url: post.cta_url,
          scheduled_for: post.scheduled_for,
          source: "hsa-broadcaster",
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Webhook returned ${res.status}: ${t}`);
      }
      await supabase.from("gbp_posts").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id);
      return json({ ok: true, status: "published", mode: "webhook" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await notifyAdmin(
        "GBP auto-publish failed",
        `<p>The GBP post <b>${escape(post.title ?? "(untitled)")}</b> failed to publish via webhook.</p>
         <p><b>Error:</b> ${escape(msg)}</p>
         <p>Open the Agents Hub → GBP tab and post it manually.</p>`,
      );
      return json({ ok: false, error: msg, mode: "webhook_failed" }, 500);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function escape(s: string) { return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]!)); }
function json(b: unknown, status = 200) { return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
