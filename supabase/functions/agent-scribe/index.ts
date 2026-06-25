// Scribe: weekly SEO + content audit. Uses Lovable AI to analyze city pages and blog posts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateText } from "npm:ai";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";

const CITY_URLS = [
  "stockton","lodi","hayward","sacramento","fremont","oakland","tracy","manteca","modesto",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const apiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const gateway = createLovableAiGatewayProvider(apiKey);

  const { data: run } = await supabase.from("agent_runs").insert({ agent: "scribe", status: "running" }).select("id").single();
  const runId = run?.id;
  const findings: any[] = [];

  try {
    for (const city of CITY_URLS) {
      const url = `https://healthstaracademy.org/cna-classes/${city}`;
      try {
        const res = await fetch(url, { redirect: "follow" });
        const html = await res.text();
        const title = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
        const desc = (html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/) ?? [])[1] ?? "";
        const issues: string[] = [];
        if (!title) issues.push("missing <title>");
        else if (title.length > 60) issues.push(`title too long (${title.length})`);
        if (!desc) issues.push("missing meta description");
        else if (desc.length > 160) issues.push(`meta description too long (${desc.length})`);
        if (!html.includes('"@type":"EducationalOrganization"')) issues.push("missing EducationalOrganization JSON-LD");
        if (issues.length) {
          findings.push({
            agent: "scribe", run_id: runId, severity: "medium",
            title: `SEO issues on /cna-classes/${city}`,
            detail: issues.join("; "),
            suggested_fix: "Edit src/data/cityMarkets.ts and src/pages/portal/CityLandingPage.tsx for this city.",
            target_table: "page",
            target_id: `/cna-classes/${city}`,
          });
        }
      } catch (e) {
        findings.push({
          agent: "scribe", run_id: runId, severity: "high",
          title: `City page /cna-classes/${city} failed to load`,
          detail: e instanceof Error ? e.message : String(e),
        });
      }
    }

    // Draft this week's blog idea
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt: `Suggest ONE blog post idea for Health Star Academy (CNA training in California) for this week. Give: title (<60 chars), meta description (<160 chars), 5-bullet outline. Focus on local SEO for Stockton/Sacramento/Bay Area.`,
    });
    findings.push({
      agent: "scribe", run_id: runId, severity: "info",
      title: "Weekly blog post idea",
      detail: text,
      suggested_fix: "Approve and ask the Mentor to draft the full post.",
    });

    if (findings.length) await supabase.from("agent_findings").insert(findings);
    await supabase.from("agent_runs").update({ status: "ok", finished_at: new Date().toISOString(), summary: `${findings.length} item(s)` }).eq("id", runId);
    return new Response(JSON.stringify({ ok: true, findings: findings.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("agent_runs").update({ status: "error", finished_at: new Date().toISOString(), summary: msg }).eq("id", runId);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
