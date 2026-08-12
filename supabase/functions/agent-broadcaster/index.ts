// Broadcaster: weekly social drafts — Google Business Profile + Facebook.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateText } from "npm:ai";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";
import { notifyAdmin } from "../_shared/notify-admin.ts";

const MODEL = "openai/gpt-5.6-sol";

function stripFence(s: string) {
  return s.replace(/^```json\n?|\n?```$/g, "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const apiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const gateway = createLovableAiGatewayProvider(apiKey);

  const { data: run } = await supabase.from("agent_runs").insert({ agent: "broadcaster", status: "running" }).select("id").single();
  const runId = run?.id;
  try {
    const { data: cohorts } = await supabase
      .from("cohorts")
      .select("start_date, program_type, status")
      .gte("start_date", new Date().toISOString().split("T")[0])
      .order("start_date").limit(2);

    const upcoming = (cohorts ?? []).filter((c: any) => c.status !== "paused" && c.status !== "cancelled");
    const cohortLine = upcoming.length
      ? upcoming.map((c: any) => `${c.program_type ?? "CNA"} starts ${c.start_date}`).join("; ")
      : "NO CONFIRMED START DATES — the cohort calendar is being restructured. Do not state or imply any start date. Invite readers to join the interest list instead.";

    const brand = `Health Star Academy — CDPH-approved hybrid CNA training in California (Stockton, Lodi, Hayward, Sacramento, Bay Area).
Online theory + in-person clinicals. Tuition $2,499 + $175 enrollment fee. Denefits financing available.
Tone: professional, empowering, compassionate. Use the exact name "Health Star Academy". Say "career support", never "job placement". Never use the word "flexible".
Cohort info: ${cohortLine}`;

    // ---------- 1. Google Business Profile draft ----------
    const { text: gbpText } = await generateText({
      model: gateway(MODEL),
      prompt: `${brand}

Write a Google Business Profile post. Keep the body under 1500 characters. Include a clear CTA to call or visit healthstaracademy.org/pre-qualification.
Output JSON only with keys: title (under 58 characters), body, cta_label (one of: Sign up, Learn more, Call), cta_url.`,
    });

    let gbp: any = {};
    try { gbp = JSON.parse(stripFence(gbpText)); } catch { gbp = { body: gbpText }; }

    const { data: gbpPost } = await supabase.from("gbp_posts").insert({
      channel: "gbp",
      title: gbp.title ?? null,
      body: gbp.body ?? gbpText,
      cta_label: gbp.cta_label ?? "Learn more",
      cta_url: gbp.cta_url ?? "https://healthstaracademy.org/pre-qualification",
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "draft",
    }).select("id").single();

    await supabase.from("agent_findings").insert({
      agent: "broadcaster", run_id: runId, severity: "info",
      title: "New Google Business Profile post draft ready",
      detail: gbp.title ?? "Draft created",
      suggested_fix: "Review in Agents Hub → Social drafts (GBP), edit if needed, then publish.",
      target_table: "gbp_posts", target_id: gbpPost?.id ?? null,
    });

    // ---------- 2. Facebook draft ----------
    const { text: fbText } = await generateText({
      model: gateway(MODEL),
      prompt: `${brand}

Write a Facebook Page post for Health Star Academy. Facebook style, not a press release:
- Open with a short conversational hook line that speaks to someone considering a healthcare career.
- 3 to 5 short lines of concrete value (hybrid format, clinical sites, tuition/financing, career support).
- One clear call to action with the link https://healthstaracademy.org/pre-qualification
- End with 4 to 6 relevant hashtags on one line.
Keep the whole post under 900 characters. Use at most 3 emojis total. No markdown headings or bullet characters like "*".
Output JSON only with keys: title (short internal label under 58 characters, not shown on Facebook), body (the full post text including hashtags), cta_label (one of: Learn more, Sign Up, Call now), cta_url.`,
    });

    let fb: any = {};
    try { fb = JSON.parse(stripFence(fbText)); } catch { fb = { body: fbText }; }

    const { data: fbPost } = await supabase.from("gbp_posts").insert({
      channel: "facebook",
      title: fb.title ?? null,
      body: fb.body ?? fbText,
      cta_label: fb.cta_label ?? "Learn more",
      cta_url: fb.cta_url ?? "https://healthstaracademy.org/pre-qualification",
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "draft",
    }).select("id").single();

    await supabase.from("agent_findings").insert({
      agent: "broadcaster", run_id: runId, severity: "info",
      title: "New Facebook post draft ready",
      detail: fb.title ?? "Draft created",
      suggested_fix: "Review in Agents Hub → Social drafts (Facebook), edit if needed, then publish or copy to your Page.",
      target_table: "gbp_posts", target_id: fbPost?.id ?? null,
    });

    await supabase.from("agent_runs").update({
      status: "ok", finished_at: new Date().toISOString(),
      summary: "Drafted 1 GBP post and 1 Facebook post",
    }).eq("id", runId);

    const esc = (s: string) => s.replace(/</g, "&lt;");
    await notifyAdmin(
      "New social post drafts ready (GBP + Facebook)",
      `<p>The Broadcaster drafted two posts:</p>
       <ul>
         <li><b>Google Business Profile:</b> ${esc((gbp.title ?? "Untitled").toString())}</li>
         <li><b>Facebook:</b> ${esc((fb.title ?? "Untitled").toString())}</li>
       </ul>
       <p>Open <b>Agents Hub → Social drafts</b> to review and publish (or copy &amp; paste).</p>`,
    );

    return new Response(JSON.stringify({ ok: true, gbp_post_id: gbpPost?.id, facebook_post_id: fbPost?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("agent_runs").update({ status: "error", finished_at: new Date().toISOString(), summary: msg }).eq("id", runId);
    await notifyAdmin("Broadcaster agent failed", `<p>The Broadcaster errored:</p><pre>${msg}</pre>`);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
