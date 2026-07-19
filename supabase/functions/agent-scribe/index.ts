// Scribe: weekly SEO audit + full blog-post drafting.
// - Audits city landing pages for basic SEO issues.
// - Drafts one full blog post (title, meta, markdown body) targeting a rotating city keyword.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateText } from "npm:ai";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";
import { notifyAdmin } from "../_shared/notify-admin.ts";

const CITY_URLS = [
  "stockton","lodi","hayward","sacramento","fremont","oakland","tracy","manteca","modesto",
];

// Rotating angle library — mixes local commercial keywords with high-volume informational
// and trust/differentiation queries so Scribe attacks SERPs from every direction.
const ANGLES = [
  // — Local commercial —
  { keyword: "CNA classes in {city}", angle: "beginner overview of hybrid CNA training for {city} residents" },
  { keyword: "CNA salary {city}", angle: "2026 wage breakdown by shift/setting for CNAs in {city} with hiring outlook" },
  { keyword: "fast CNA certification {city}", angle: "how to certify in 6 weeks from {city} with the hybrid model" },
  { keyword: "CNA state exam prep {city}", angle: "how {city} students should prepare for the 22 CDPH skills" },
  { keyword: "CNA to RN pathway {city}", angle: "career ladder from CNA to LVN/RN starting in {city}" },
  { keyword: "financing CNA training {city}", angle: "how {city} students pay for training with Denefits + payment plans" },
  // — Informational (top-of-funnel, dominate 'what is / how does' queries) —
  { keyword: "what does a CNA do {city}", angle: "day-in-the-life responsibilities for a {city} CNA across hospital, SNF and home-health settings" },
  { keyword: "how to become a CNA in {city}", angle: "step-by-step guide from application to CDPH certification for {city} residents" },
  { keyword: "how much do CNAs make in {city}", angle: "hourly + annual wage ranges by setting for {city} with overtime and shift-differential math" },
  { keyword: "CNA vs medical assistant {city}", angle: "which credential fits {city} healthcare hiring — cost, time, ceiling and job outlook" },
  { keyword: "is CNA training worth it {city}", angle: "honest ROI breakdown for {city} students weighing cost, time and career ceiling" },
  // — Trust / differentiation (win against big review-farm competitors) —
  { keyword: "best CNA schools in {city}", angle: "how {city} students should evaluate CNA schools — accreditation, pass rates, clinical placement, hidden fees" },
  { keyword: "CNA program reviews {city}", angle: "what real {city} CNA graduates say about hybrid training vs traditional 4-week programs" },
  { keyword: "CDPH approved CNA schools {city}", angle: "why CDPH approval matters and how to verify a {city} program on the state registry" },
  { keyword: "affordable CNA classes {city}", angle: "true total cost of CNA training in {city} — tuition, exam, uniforms, background check, live scan" },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const apiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const gateway = createLovableAiGatewayProvider(apiKey);

  const { data: run } = await supabase.from("agent_runs").insert({ agent: "scribe", status: "running" }).select("id").single();
  const runId = run?.id;
  const findings: any[] = [];
  let draftedSlug: string | null = null;

  try {
    // --- 1. City page SEO audit ---
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
            target_table: "page", target_id: `/cna-classes/${city}`,
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

    // --- 2. Draft one full blog post ---
    // Pick a city+angle we haven't targeted in the last 60 days.
    const { data: recent } = await supabase
      .from("blog_drafts").select("target_city, target_keyword, created_at")
      .gte("created_at", new Date(Date.now() - 60 * 86400_000).toISOString());
    const usedKeys = new Set((recent ?? []).map((r: any) => `${r.target_city}::${r.target_keyword}`));

    let pick: { city: string; keyword: string; angle: string } | null = null;
    outer: for (const city of CITY_URLS) {
      for (const a of ANGLES) {
        const kw = a.keyword.replace("{city}", city.charAt(0).toUpperCase() + city.slice(1));
        if (!usedKeys.has(`${city}::${kw}`)) {
          pick = { city, keyword: kw, angle: a.angle.replace("{city}", city) };
          break outer;
        }
      }
    }
    if (!pick) pick = { city: "stockton", keyword: "CNA classes Stockton California", angle: "evergreen overview" };

    const cityTitle = pick.city.charAt(0).toUpperCase() + pick.city.slice(1);
    const prompt = `You are the Scribe agent for Health Star Academy — a CDPH-approved hybrid CNA training program (online theory, in-person clinicals in Stockton, Lodi, Hayward).

Write ONE full blog post targeting the keyword: "${pick.keyword}".
Angle: ${pick.angle}.
Voice: professional, empowering, compassionate. Use definitive terms. Do not use the word "flexible". Use "career support" not "job placement".

Return STRICT JSON only (no markdown fences) with keys:
{
  "title": string (max 60 chars, includes the keyword),
  "meta_description": string (max 155 chars, includes the keyword and a benefit),
  "tldr": string (2 sentences, plain summary),
  "category": string (one of: Stockton, Lodi, Hayward, Sacramento, Bay Area, Exam Prep, Career Guide, Financing),
  "read_time": string (e.g. "8 min read"),
  "body_markdown": string (1200-1800 words, well-structured markdown with an intro, 5-7 H2 sections using ##, bullet lists where useful, an FAQ H2 at the end with 4 questions, and at least 3 internal links written as [anchor](/path) — MUST include links to /pre-qualification, /programs/cohorts, and /cna-classes/${pick.city}. No H1 — the title renders separately. No images.)
}

Facts you may reference:
- Tuition $2,499 total ($175 enrollment fee)
- 6-week Daytime or 8-weekend tracks, 14-day enrollment deadline
- 75% entrance exam pass score
- CDPH approved, BBB accredited
- Clinical sites: Stockton, Lodi, Hayward
- Serving ${cityTitle} students
- Denefits financing available
- Contact: healthstaracademy.org/pre-qualification`;

    let parsed: any = null;
    try {
      const { text } = await generateText({
        model: gateway("openai/gpt-5.5"),
        prompt,
      });
      const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      findings.push({
        agent: "scribe", run_id: runId, severity: "medium",
        title: "Blog draft generation failed",
        detail: e instanceof Error ? e.message : String(e),
      });
    }

    if (parsed?.title && parsed?.body_markdown) {
      const baseSlug = slugify(parsed.title);
      // Ensure unique slug
      let slug = baseSlug;
      let n = 1;
      while (true) {
        const { data: exists } = await supabase.from("blog_drafts").select("id").eq("slug", slug).maybeSingle();
        if (!exists) break;
        n += 1;
        slug = `${baseSlug}-${n}`;
      }
      const { data: draft, error: draftErr } = await supabase.from("blog_drafts").insert({
        agent: "scribe",
        title: String(parsed.title).slice(0, 120),
        slug,
        meta_description: String(parsed.meta_description ?? "").slice(0, 160),
        tldr: parsed.tldr ?? null,
        category: parsed.category ?? "CNA Training",
        read_time: parsed.read_time ?? "8 min read",
        target_keyword: pick.keyword,
        target_city: pick.city,
        body_markdown: parsed.body_markdown,
        status: "draft",
      }).select("id, slug").single();

      if (!draftErr && draft) {
        draftedSlug = draft.slug;
        findings.push({
          agent: "scribe", run_id: runId, severity: "info",
          title: `New blog draft: ${parsed.title}`,
          detail: `Target: ${pick.keyword} • ${parsed.read_time ?? ""}\n\n${parsed.tldr ?? ""}`,
          suggested_fix: "Review in the Blog tab of Agents Hub, edit if needed, then click Publish.",
          target_table: "blog_drafts", target_id: draft.id,
        });
      } else if (draftErr) {
        findings.push({
          agent: "scribe", run_id: runId, severity: "medium",
          title: "Blog draft insert failed",
          detail: draftErr.message,
        });
      }
    }

    if (findings.length) await supabase.from("agent_findings").insert(findings);
    await supabase.from("agent_runs").update({
      status: "ok",
      finished_at: new Date().toISOString(),
      summary: `${findings.length} finding(s)${draftedSlug ? `, drafted /${draftedSlug}` : ""}`,
    }).eq("id", runId);

    if (draftedSlug) {
      await notifyAdmin(
        "New blog draft ready to publish",
        `<p>Scribe just drafted a new blog post targeting <b>${pick.keyword}</b>.</p>
         <p>Review it in the <b>Agents Hub → Blog</b> tab and click Publish when ready.</p>`,
      );
    }

    return new Response(JSON.stringify({ ok: true, findings: findings.length, draft_slug: draftedSlug }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("agent_runs").update({ status: "error", finished_at: new Date().toISOString(), summary: msg }).eq("id", runId);
    await notifyAdmin("Scribe agent failed", `<p>The Scribe agent errored:</p><pre>${msg}</pre>`);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
