// Daily agent digest: one email summarising everything the agents did or found
// in the last 24 hours. Urgent items are emailed immediately by the agents
// themselves; everything else lands here.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";
import { sendAdminEmail } from "../_shared/notify-admin.ts";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: string) => String(s ?? "").replace(/</g, "&lt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const since = new Date(Date.now() - 24 * 60 * 60_000).toISOString();

  try {
    const [{ data: queued }, { data: findings }, { data: runs }] = await Promise.all([
      admin.from("agent_notifications").select("id, agent, subject, html, created_at").is("sent_at", null).order("created_at"),
      admin.from("agent_findings").select("agent, severity, title, detail, created_at").eq("status", "open").gte("created_at", since).order("severity"),
      admin.from("agent_runs").select("agent, status, summary, started_at").gte("started_at", since).order("started_at"),
    ]);

    const nothing = !(queued?.length || findings?.length || runs?.length);
    if (nothing) return json({ ok: true, skipped: "nothing to report" });

    const section = (title: string, inner: string) =>
      inner ? `<h3 style="color:#7C4DFF;margin:22px 0 6px">${title}</h3>${inner}` : "";

    const findingsHtml = (findings ?? []).length
      ? `<ul>${(findings ?? []).map((f) =>
          `<li><b>${esc(f.severity)}</b> — ${esc(f.title)}${f.detail ? `<br><span style="color:#666">${esc(f.detail)}</span>` : ""} <i>(${esc(f.agent)})</i></li>`).join("")}</ul>`
      : "";

    const runsHtml = (runs ?? []).length
      ? `<ul>${(runs ?? []).map((r) => `<li><b>${esc(r.agent)}</b> — ${esc(r.status)}${r.summary ? `: ${esc(r.summary)}` : ""}</li>`).join("")}</ul>`
      : "";

    const queuedHtml = (queued ?? []).length
      ? (queued ?? []).map((q) => `<div style="border-left:3px solid #22B8CF;padding:6px 12px;margin:10px 0"><b>${esc(q.subject)}</b><div>${q.html}</div></div>`).join("")
      : "";

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#2D2D47">
        <h2 style="color:#7C4DFF;margin-bottom:2px">Health Star Academy — daily agent report</h2>
        <p style="color:#666;margin-top:0">Everything from the last 24 hours, so you don't have to log in.</p>
        ${section("Needs your attention", findingsHtml)}
        ${section("Updates from the agents", queuedHtml)}
        ${section("Agent activity", runsHtml)}
        <p style="margin-top:26px;font-size:12px;color:#888">Reply to this email or open the Admin Dashboard → Agents Hub to act on anything above.</p>
      </div>`;

    const sent = await sendAdminEmail("Daily report", html);
    if (sent && queued?.length) {
      await admin.from("agent_notifications").update({ sent_at: new Date().toISOString() })
        .in("id", queued.map((q) => q.id));
    }
    return json({ ok: true, sent, queued: queued?.length ?? 0, findings: findings?.length ?? 0 });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
