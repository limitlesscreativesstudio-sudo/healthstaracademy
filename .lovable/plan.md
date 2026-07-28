
# Opinly-Style Competitor Comparison Suite

Builds three connected pieces: a public compare widget, auto-generated SEO "HSA vs [School]" landing pages, and an internal Scout agent that keeps competitor data fresh. AI does the research; you review/approve like blog drafts.

## 1. Database (one migration)

- `competitor_schools` — canonical competitor row
  - `id`, `slug` (e.g. `unitek-college`), `name`, `website`, `city`, `state`, `logo_url`, `description`
  - `is_hsa` (bool — one row for us, always in comparisons)
  - `active`, `created_at`, `updated_at`
- `competitor_facts` — the comparable attributes (one row per attribute per school)
  - `school_id`, `attribute` (enum-like text: `tuition`, `program_length`, `schedule`, `accreditation`, `clinical_sites`, `payment_plans`, `job_placement`, `class_size`, `next_start_date`, `notes`)
  - `value_text`, `value_numeric`, `source_url`, `confidence` (`high`/`medium`/`low`), `last_verified_at`
- `competitor_pages` — auto-generated `HSA vs X` landing pages (status: `draft` / `published` / `archived`, mirrors `blog_drafts` pattern so reuse the Agents Hub review UI)

RLS: public `SELECT` on active schools + published pages only; admin full access.

## 2. Scout agent (new edge function `agent-scout`)

- Uses Firecrawl (search + scrape) to pull competitor CNA program pages, plus Perplexity for citation-backed facts (both connectors already fit — will prompt to connect if missing).
- For each competitor: extracts tuition, length, schedule, accreditation, clinical sites, then upserts into `competitor_facts` with `source_url` + confidence.
- Generates a `HSA vs X` landing-page draft (title, meta, intro, side-by-side table markdown, HSA advantages section, FAQ, CTA).
- Runs weekly (pg_cron), or on-demand from Agents Hub "Run now."
- Adds a `finding` if a competitor's tuition/schedule changed since last scan.
- Respects `agent_config.auto_publish` (reuses the same flag pattern as Scribe).

## 3. Public compare widget — `/compare`

- Landing page: "Compare CNA programs in California"
- Multi-select up to 3 schools (HSA pre-selected and locked in).
- Renders responsive side-by-side table: tuition, length, schedule, hybrid?, clinicals, accreditation, payment plans, next start.
- HSA column highlighted (teal border, "Recommended" badge, CTA to `/pre-qualification`).
- Mobile: card-stack fallback instead of horizontal table.
- SEO'd (JSON-LD `ItemList`, canonical, meta).

## 4. Auto-generated SEO pages — `/compare/hsa-vs-:slug`

- Dynamic route reads `competitor_pages` row by slug.
- Rendered like `AgentBlogPost.tsx` (markdown + hero + JSON-LD `Article` + `FAQPage`).
- Added to `sitemap.xml` automatically.
- Internal linking: `/compare` lists all published `hsa-vs-*` pages.

## 5. Agents Hub additions

- New "Scout" agent card next to Scribe/Broadcaster with **Run now**.
- New tab: **Competitors** — list schools, edit facts inline, trigger re-scan per school.
- New tab: **Compare pages** — reuses the blog-draft table UI (Edit / Publish / Unpublish / Archive / View).
- Auto-publish toggle for Scout (independent of Scribe).

## 6. Seed data

Seed the schools table with the main HSA competitors so day-1 has content:
Unitek College (Sacramento/Hayward/Fremont), Milan Institute (Stockton), Gurnick Academy (Modesto), American Red Cross (Sacramento), Angeles College, Cambridge Junior College (Yuba City), Casa Loma College. You can add/remove any in the Competitors tab.

## Technical notes

- Firecrawl: use existing standard-connectors flow; will prompt for connect if not linked.
- Perplexity: same. Falls back to Firecrawl + Lovable AI if Perplexity absent.
- All AI research goes through Lovable AI gateway (`openai/gpt-5.6-sol`, `reasoning_effort: none`) for the drafting/synthesis step so no extra keys needed for the LLM.
- Reuses `publish-blog-post` pattern in a new `publish-competitor-page` function (publish/unpublish/archive/update).
- Adds `<Link>` from `AgentsHub.tsx` Scribe area to the new Competitors tab.
- No breaking changes to existing agents, blog, or GBP flows.

## What ships (order)

1. Migration + seed 7 competitor rows + HSA row
2. `agent-scout` edge function + `publish-competitor-page` function
3. `/compare` widget + `/compare/hsa-vs-:slug` renderer + sitemap entry
4. AgentsHub: Scout card, Competitors tab, Compare-pages tab
5. Weekly pg_cron for Scout
6. Trigger first Scout run so you have live drafts to review immediately

After approval I'll build it end-to-end in one pass and give you a report of what shipped + any secrets to connect.
