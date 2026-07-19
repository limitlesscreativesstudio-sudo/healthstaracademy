// Broadcaster: weekly Google Business Profile post draft.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateText } from "npm:ai";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";
import { notifyAdmin } from "../_shared/notify-admin.ts";

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
      .select("start_date, track, seats_available")
      .gte("start_date", new Date().toISOString().split("T")[0])
      .order("start_date").limit(2);

    const cohortLine = (cohorts ?? []).map((c: any) => `${c.track} starts ${c.start_date}`).join("; ") || "Next cohorts opening soon";

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt: `Write a Google Business Profile post (max 1500 chars) for Health Star Academy CNA training in California.
Cohort info: ${cohortLine}.
Tone: professional, empowering, compassionate. Include a clear CTA to call or visit healthstaracademy.org/pre-qualification.
Output JSON only with keys: title (max 58 chars), body (max 1500 chars), cta_label (one of: Sign up, Learn more, Call), cta_url.`,
    });

    let parsed: any = {};
    try { parsed = JSON.parse(text.replace(/^```json\n?|\n?```$/g, "")); } catch { parsed = { body: text }; }

    const { data: post } = await supabase.from("gbp_posts").insert({
      title: parsed.title ?? null,
      body: parsed.body ?? text,
      cta_label: parsed.cta_label ?? "Learn more",
      cta_url: parsed.cta_url ?? "https://healthstaracademy.org/pre-qualification",
      scheduled_for: new Date(Date.now() + 24*60*60*1000).toISOString().split("T")[0],
      status: "draft",
    }).select("id").single();

    await supabase.from("agent_findings").insert({
      agent: "broadcaster", run_id: runId, severity: "info",
      title: "New GBP post draft ready",
      detail: parsed.title ?? "Draft created",
      suggested_fix: "Review in the Broadcaster tab, edit if needed, then publish to GBP.",
      target_table: "gbp_posts", target_id: post?.id ?? null,
    });
    await supabase.from("agent_runs").update({ status: "ok", finished_at: new Date().toISOString(), summary: "Drafted 1 GBP post" }).eq("id", runId);
    return new Response(JSON.stringify({ ok: true, post_id: post?.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("agent_runs").update({ status: "error", finished_at: new Date().toISOString(), summary: msg }).eq("id", runId);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
