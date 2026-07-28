// Scout — competitor research agent. Refreshes competitor_facts and drafts
// "HSA vs [School]" landing pages. Uses Firecrawl scrape when available,
// otherwise falls back to LLM-only synthesis (marked lower confidence).

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const ATTRS = [
  "tuition","program_length","schedule","hybrid","clinical_sites",
  "accreditation","payment_plans","class_size","next_start_date","notes",
];

async function scrapeSite(url: string): Promise<string> {
  if (!FIRECRAWL_API_KEY || !url) return "";
  try {
    const isGateway = FIRECRAWL_API_KEY.startsWith("lovc_");
    const base = isGateway
      ? "https://connector-gateway.lovable.dev/firecrawl/v2"
      : "https://api.firecrawl.dev/v2";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (isGateway) {
      headers["Authorization"] = `Bearer ${LOVABLE_API_KEY}`;
      headers["X-Connection-Api-Key"] = FIRECRAWL_API_KEY;
    } else {
      headers["Authorization"] = `Bearer ${FIRECRAWL_API_KEY}`;
    }
    const res = await fetch(`${base}/scrape`, {
      method: "POST", headers,
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    if (!res.ok) return "";
    const j = await res.json();
    const md = j.markdown ?? j?.data?.markdown ?? "";
    return String(md).slice(0, 12000);
  } catch { return ""; }
}

async function llm(prompt: string, jsonMode = false): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": LOVABLE_API_KEY,
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      reasoning_effort: "none",
      messages: [{ role: "user", content: prompt }],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function researchSchool(school: any, hsaFacts: any[]) {
  const scraped = await scrapeSite(school.website);
  const factsPrompt = `You are researching a California CNA training school for a comparison page.

School: ${school.name}
Website: ${school.website ?? "unknown"}
City: ${school.city ?? "unknown"}

${scraped ? `Scraped page content:\n${scraped}\n` : "No scraped content available — use your general knowledge."}

Return JSON with this exact shape. Use null for anything you can't confirm:
{
  "tuition": {"value_text": "$X,XXX total", "value_numeric": 0000, "confidence": "high|medium|low"},
  "program_length": {"value_text": "X weeks", "confidence": "..."},
  "schedule": {"value_text": "Daytime/Evening/Weekend/Hybrid description", "confidence": "..."},
  "hybrid": {"value_text": "Yes|No|Partial", "value_numeric": 0, "confidence": "..."},
  "clinical_sites": {"value_text": "City, City", "confidence": "..."},
  "accreditation": {"value_text": "CDPH approved etc", "confidence": "..."},
  "payment_plans": {"value_text": "Yes — provider name / No", "confidence": "..."},
  "class_size": {"value_text": "Small / Large / N students", "confidence": "..."},
  "next_start_date": {"value_text": "Month YYYY or Rolling", "confidence": "..."}
}
${scraped ? "Set confidence high only if the fact is stated in the scraped content." : "Never use confidence high without scraped content."}`;

  let facts: Record<string, any> = {};
  try {
    const raw = await llm(factsPrompt, true);
    facts = JSON.parse(raw);
  } catch (e) {
    console.error("facts parse failed", school.slug, e);
  }

  const source_url = school.website ?? null;
  for (const attr of ATTRS) {
    const f = facts[attr];
    if (!f || !f.value_text) continue;
    await supabase.from("competitor_facts").upsert({
      school_id: school.id,
      attribute: attr,
      value_text: String(f.value_text).slice(0, 500),
      value_numeric: typeof f.value_numeric === "number" ? f.value_numeric : null,
      confidence: ["high","medium","low"].includes(f.confidence) ? f.confidence : "low",
      source_url,
      last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "school_id,attribute" });
  }

  // Build landing page draft
  const hsaMap = Object.fromEntries(hsaFacts.map((f: any) => [f.attribute, f.value_text]));
  const pagePrompt = `Write a SEO landing page comparing Health Star Academy to ${school.name} for prospective CNA students in California.

Health Star Academy facts (accurate — use verbatim):
${JSON.stringify(hsaMap, null, 2)}

${school.name} facts (researched):
${JSON.stringify(facts, null, 2)}

Return JSON:
{
  "title": "Health Star Academy vs ${school.name}: CNA Program Comparison (60 chars max)",
  "meta_description": "160 chars max, must include both school names and city/CA",
  "tldr": "One sentence — who each program is best for.",
  "body_markdown": "Full page in markdown: intro ~150 words, then a '## Side-by-side comparison' section with a markdown table (Attribute | Health Star Academy | ${school.name}) covering tuition, program length, schedule, hybrid?, clinical sites, accreditation, payment plans. Then '## Why students choose Health Star Academy' (3-4 bullets grounded in HSA facts). Then '## When ${school.name} might fit'. Then '## FAQ' with 3 Q&A pairs. End with a CTA linking to /pre-qualification. Be truthful and specific. Do NOT invent facts marked low confidence — say 'not publicly listed' instead.",
  "faq": [{"q": "...", "a": "..."}, {"q": "...", "a": "..."}, {"q": "...", "a": "..."}]
}`;

  let page: any = {};
  try { page = JSON.parse(await llm(pagePrompt, true)); }
  catch (e) { console.error("page parse failed", school.slug, e); return; }

  if (!page.title || !page.body_markdown) return;

  const slug = `hsa-vs-${school.slug}`;
  const { data: cfg } = await supabase.from("agent_config").select("auto_publish").eq("agent", "scout").maybeSingle();
  const autoPublish = !!cfg?.auto_publish;

  await supabase.from("competitor_pages").upsert({
    competitor_id: school.id,
    slug,
    title: String(page.title).slice(0, 80),
    meta_description: page.meta_description ? String(page.meta_description).slice(0, 200) : null,
    tldr: page.tldr ?? null,
    body_markdown: page.body_markdown,
    faq: Array.isArray(page.faq) ? page.faq : [],
    status: autoPublish ? "published" : "draft",
    published_at: autoPublish ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "slug" });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const runStart = new Date().toISOString();
  const { data: run } = await supabase.from("agent_runs").insert({
    agent: "scout", status: "running", started_at: runStart,
  }).select().single();

  try {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const slugFilter: string | undefined = body?.slug;

    const { data: hsa } = await supabase.from("competitor_schools").select("id").eq("is_hsa", true).single();
    const { data: hsaFacts } = await supabase.from("competitor_facts").select("attribute,value_text").eq("school_id", hsa!.id);

    let q = supabase.from("competitor_schools").select("*").eq("active", true).eq("is_hsa", false);
    if (slugFilter) q = q.eq("slug", slugFilter);
    const { data: schools } = await q;

    let ok = 0;
    for (const s of schools ?? []) {
      try { await researchSchool(s, hsaFacts ?? []); ok++; }
      catch (e) { console.error("school failed", s.slug, e); }
    }

    await supabase.from("agent_runs").update({
      status: "ok",
      finished_at: new Date().toISOString(),
      summary: `Researched ${ok}/${schools?.length ?? 0} schools.`,
    }).eq("id", run!.id);

    return new Response(JSON.stringify({ ok: true, researched: ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    await supabase.from("agent_runs").update({
      status: "error", finished_at: new Date().toISOString(), summary: e.message,
    }).eq("id", run!.id);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
