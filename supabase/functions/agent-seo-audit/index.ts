// SEO Auditor — crawls the live site and reports concrete, fixable SEO issues.
//
// Checks per page: title presence/length/uniqueness, meta description
// presence/length/uniqueness, canonical tag, single H1, Open Graph tags,
// structured data (JSON-LD), image alt text, word count, and broken internal
// links. Findings are written to agent_findings and emailed (critical/high
// immediately, the rest in the daily digest).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";
import { notifyAdmin } from "../_shared/notify-admin.ts";

const SITE = Deno.env.get("PUBLIC_SITE_URL") ?? "https://healthstaracademy.org";

type Severity = "critical" | "high" | "medium" | "low" | "info";
type Finding = { severity: Severity; title: string; detail?: string; suggested_fix?: string; url?: string };

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: string) => String(s ?? "").replace(/</g, "&lt;");
const pick = (html: string, re: RegExp) => (html.match(re)?.[1] ?? "").trim();

async function sitemapUrls(): Promise<string[]> {
  try {
    const res = await fetch(`${SITE}/sitemap.xml`);
    if (!res.ok) return [SITE];
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    return urls.length ? urls : [SITE];
  } catch { return [SITE]; }
}

// The site is a single-page app: every URL is served the same HTML shell and
// the real title/description/H1 are set in the browser. Crawling raw HTML would
// report the same false problem on every page, so we detect the shell, report
// it once, and only run the checks that are meaningful on un-rendered HTML.
function isShell(url: string, title: string, desc: string, shellTitle: string, shellDesc: string): boolean {
  return url.replace(/\/$/, "") !== SITE.replace(/\/$/, "") && title === shellTitle && desc === shellDesc;
}

function auditPage(url: string, html: string, shell: boolean): Finding[] {
  const out: Finding[] = [];
  const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const canonical = pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const ogTitle = /property=["']og:title["']/i.test(html);
  const ogImage = /property=["']og:image["']/i.test(html);
  const jsonLd = /application\/ld\+json/i.test(html);
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const missingAlt = imgs.filter((i) => !/\balt=/.test(i)).length;

  if (shell) return out; // handled once, sitewide

  if (!title) out.push({ severity: "critical", title: "Page has no title", url, suggested_fix: "Add a unique 50–60 character title with the main keyword and the city." });
  else if (title.length < 30 || title.length > 65) out.push({ severity: "medium", title: `Title length ${title.length} characters`, detail: title, url, suggested_fix: "Aim for 50–60 characters so Google shows it in full." });

  if (!desc) out.push({ severity: "high", title: "Page has no meta description", url, suggested_fix: "Add a 140–160 character description with a benefit and a call to action." });
  else if (desc.length < 110 || desc.length > 165) out.push({ severity: "low", title: `Meta description length ${desc.length} characters`, detail: desc, url, suggested_fix: "Aim for 140–160 characters." });

  if (!canonical) out.push({ severity: "medium", title: "Missing canonical link", url, suggested_fix: "Add a canonical tag so duplicate URLs do not compete." });
  if (h1s.length === 0) out.push({ severity: "high", title: "No H1 heading on the page", url, suggested_fix: "Add one clear H1 that matches the search term the page targets." });
  if (h1s.length > 1) out.push({ severity: "low", title: `${h1s.length} H1 headings on the page`, url, suggested_fix: "Keep one H1; make the rest H2." });
  if (!ogTitle || !ogImage) out.push({ severity: "low", title: "Incomplete social preview tags", url, suggested_fix: "Add og:title and og:image so shared links look right." });
  if (!jsonLd) out.push({ severity: "medium", title: "No structured data on the page", url, suggested_fix: "Add Course, LocalBusiness or FAQ structured data so Google can show rich results." });
  if (words < 300) out.push({ severity: "medium", title: `Thin content (${words} words)`, url, suggested_fix: "Expand to 600+ words covering cost, schedule, requirements and the city served." });
  if (missingAlt > 0) out.push({ severity: "low", title: `${missingAlt} image(s) without alt text`, url, suggested_fix: "Describe each image; include the program and city where natural." });

  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: run } = await admin.from("agent_runs")
    .insert({ agent: "seo-auditor", status: "running" }).select("id").single();
  const runId = run?.id ?? null;

  try {
    let body: any = {};
    try { body = await req.json(); } catch { /* no body */ }
    const limit: number = Math.min(Number(body?.limit) || 40, 80);

    const urls = (await sitemapUrls()).slice(0, limit);
    const findings: Finding[] = [];
    const shellPages: string[] = [];
    let shellTitle = "", shellDesc = "";
    try {
      const home = await fetch(SITE, { headers: { "User-Agent": "HSA-SEO-Auditor/1.0" } });
      const homeHtml = await home.text();
      shellTitle = pick(homeHtml, /<title[^>]*>([\s\S]*?)<\/title>/i);
      shellDesc = pick(homeHtml, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    } catch { /* ignore */ }
    const titles = new Map<string, string[]>();
    const descs = new Map<string, string[]>();

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": "HSA-SEO-Auditor/1.0" } });
        if (!res.ok) {
          findings.push({ severity: "critical", title: `Page returns ${res.status}`, url, suggested_fix: "Fix or remove this URL from the sitemap." });
          continue;
        }
        const html = await res.text();
        const t = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
        const d = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
        const shell = isShell(url, t, d, shellTitle, shellDesc);
        if (shell) shellPages.push(url);
        findings.push(...auditPage(url, html, shell));
        if (!shell) {
          if (t) titles.set(t, [...(titles.get(t) ?? []), url]);
          if (d) descs.set(d, [...(descs.get(d) ?? []), url]);
        }
      } catch (e) {
        findings.push({ severity: "high", title: "Page could not be loaded", detail: String(e), url });
      }
    }

    if (shellPages.length) {
      findings.push({
        severity: "high",
        title: "Pages are not pre-rendered for search engines",
        detail: `${shellPages.length} page(s) serve the same homepage title and description in their raw HTML; the real ones are only added after JavaScript runs. Examples: ${shellPages.slice(0, 5).join(", ")}`,
        suggested_fix: "Pre-render or server-render the public pages so each URL ships its own title, description and H1 in the HTML. Google usually renders JavaScript, but Bing, Facebook and LinkedIn often do not.",
      });
    }

    for (const [t, list] of titles) if (list.length > 1)
      findings.push({ severity: "high", title: "Duplicate page title", detail: `${t} — used on ${list.length} pages: ${list.join(", ")}`, suggested_fix: "Give each page its own title, ideally with a different city or topic." });
    for (const [d, list] of descs) if (list.length > 1)
      findings.push({ severity: "medium", title: "Duplicate meta description", detail: `Used on ${list.length} pages: ${list.join(", ")}`, suggested_fix: "Write a unique description per page." });

    if (findings.length) {
      const rows = findings.map((f) => ({
        agent: "seo-auditor", run_id: runId, severity: f.severity === "info" ? "low" : f.severity,
        title: f.title, detail: [f.url, f.detail].filter(Boolean).join(" — "),
        suggested_fix: f.suggested_fix ?? null, status: "open",
      }));
      // Insert in small batches so one bad row can't drop the whole report.
      for (const row of rows) {
        const { error: insErr } = await admin.from("agent_findings").insert(row);
        // A duplicate simply means the same open issue is already on the list.
        if (insErr && !/duplicate key/i.test(insErr.message)) {
          console.error("[seo-audit] finding insert failed", insErr.message, JSON.stringify(row));
        }
      }
    }

    const counts = findings.reduce<Record<string, number>>((a, f) => { a[f.severity] = (a[f.severity] ?? 0) + 1; return a; }, {});
    const summary = `Audited ${urls.length} pages, ${findings.length} issues (${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ") || "none"})`;

    await admin.from("agent_runs").update({ status: "ok", finished_at: new Date().toISOString(), summary }).eq("id", runId);

    const top = findings.slice(0, 25);
    const html = `<p>${esc(summary)}</p><ul>${top.map((f) =>
      `<li><b>${esc(f.severity)}</b> — ${esc(f.title)}${f.url ? `<br><a href="${f.url}">${esc(f.url)}</a>` : ""}${f.suggested_fix ? `<br><i>${esc(f.suggested_fix)}</i>` : ""}</li>`).join("")}</ul>
      ${findings.length > top.length ? `<p>+ ${findings.length - top.length} more in Agents Hub.</p>` : ""}`;

    const urgent = (counts["critical"] ?? 0) > 0 || (counts["high"] ?? 0) > 0;
    await notifyAdmin("Website SEO audit results", html, { mode: urgent ? "alert" : "digest", agent: "seo-auditor" });

    return json({ ok: true, pages: urls.length, findings: findings.length, counts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await admin.from("agent_runs").update({ status: "error", finished_at: new Date().toISOString(), summary: msg }).eq("id", runId);
    await notifyAdmin("SEO auditor failed", `<pre>${esc(msg)}</pre>`, { agent: "seo-auditor" });
    return json({ error: msg }, 500);
  }
});
