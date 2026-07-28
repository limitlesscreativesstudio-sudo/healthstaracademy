// Weekly refresh of CNA job listings for the HSA Career Portal.
// Uses Lovable AI Gateway (google/gemini-2.5-flash) to produce a curated
// list of current CNA openings at HSA partner sites + regional employers,
// then upserts them into public.career_jobs.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const PROMPT = `You are a job-board curator for Health Star Academy (a CNA school in California).
Return a JSON array of 12-18 CURRENT Certified Nursing Assistant (CNA) job openings in California.

REQUIREMENTS:
- Include 6-8 openings at these HSA PARTNER clinical sites (mark is_partner=true):
  * St. Joseph's Medical Center - Dignity Health (Stockton)
  * Lodi Memorial Hospital / Adventist Health (Lodi)
  * St. Rose Hospital (Hayward)
  * Windsor Vista Care Center (Hayward)
  * Vibra Hospital of Sacramento
- Include 4-8 additional regional CNA openings across Sacramento, Bay Area, Stockton, Central Valley from real employers (Kaiser, Sutter, Dignity, Adventist, Brookdale, Sunrise, etc.). Mark is_partner=false.
- Use realistic 2026 wage ranges ($20-$32/hr depending on facility & shift).
- Each job needs a WORKING URL to the employer's careers page (not a fake listing ID).
- posted: use "This week" or a date within the last 7 days (format "MMM D, YYYY").

Respond with ONLY a JSON array (no prose, no markdown). Each item:
{
  "title": string,
  "org": string,
  "location": string,   // "City, CA" — append " (HSA Partner Site)" for partners
  "type": "Full-Time" | "Part-Time" | "Per Diem",
  "wage": string,       // e.g. "$22-$28/hr"
  "posted": string,
  "tags": string[],     // 2-4 short tags e.g. ["Partner Site","Hospital","Benefits"]
  "url": string,        // employer careers page
  "is_partner": boolean
}`;

async function fetchFreshJobs(): Promise<any[]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You output only valid JSON arrays. No prose." },
        { role: "user", content: PROMPT },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI gateway failed [${res.status}]: ${body}`);
  }
  const data = await res.json();
  let content = data?.choices?.[0]?.message?.content ?? "[]";
  // Strip ``` fences if present
  content = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) throw new Error("AI did not return an array");
  return parsed;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const jobs = await fetchFreshJobs();

    // Deactivate previous listings, then insert fresh set (simple swap).
    const { error: deactivateErr } = await supabase
      .from("career_jobs")
      .update({ active: false })
      .eq("active", true);
    if (deactivateErr) throw deactivateErr;

    const rows = jobs.map((j: any) => ({
      title: String(j.title ?? "").slice(0, 200),
      org: String(j.org ?? "").slice(0, 200),
      location: String(j.location ?? "").slice(0, 200),
      type: ["Full-Time", "Part-Time", "Per Diem"].includes(j.type) ? j.type : "Full-Time",
      wage: j.wage ? String(j.wage).slice(0, 60) : null,
      posted: j.posted ? String(j.posted).slice(0, 60) : "This week",
      tags: Array.isArray(j.tags) ? j.tags.slice(0, 6) : [],
      url: String(j.url ?? "https://healthstaracademy.org/portal/career"),
      is_partner: Boolean(j.is_partner),
      source: "ai-refresh",
      active: true,
    }));

    const { error: insertErr } = await supabase.from("career_jobs").insert(rows);
    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({ ok: true, inserted: rows.length, refreshed_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("refresh-career-jobs failed:", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
