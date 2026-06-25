# Multi-Agent Ops System

A team of specialized AI agents (Claude/Gemini via Lovable AI Gateway) that watch the site and portal, answer visitors, support students, help instructors, audit SEO, and draft weekly GBP posts. Lives in a new **Agents Hub** in the admin portal plus a small public chat bubble on the marketing site.

## The Agents

1. **Sentinel** — Site Health
   Scans every 15 min: broken links, failed webhooks (`webhook_logs`), enrollment pipeline stalls, slow edge functions, storage errors, Resend bounces. Opens findings with severity + suggested fix.

2. **Concierge** — Public Website Assistant
   Chat bubble on the marketing site. Answers prospective student questions (program, cost, schedule, requirements) grounded in the site content + cohorts table. Hands off to pre-qualification form when ready.

3. **Advocate** — Student Support
   In the portal. Answers logged-in students about assignments, deadlines, attendance, grades, clinical hours. Flags at-risk students (low attendance, missed assignments) to admin.

4. **Mentor** — Instructor LMS Copilot
   In the teach portal. Drafts module pages, organizes uploaded files into the right module order, generates quiz questions from a PDF, suggests rubric grades.

5. **Scribe** — Content & SEO
   Audits all city pages + blog posts weekly. Checks metadata length, H1/JSON-LD, internal links, keyword coverage, freshness. Drafts new blog posts and meta improvements.

6. **Broadcaster** — Google Business Profile
   Drafts one GBP post per week tied to upcoming cohort / seasonal hook. Stores draft in `gbp_posts` table; pushes via GBP API once connected (requires Google connector + approval).

7. **Orchestrator** — Coordinator
   Routes incoming requests to the right specialist, runs daily standup that summarizes what each agent did, escalates blockers to admin email.

## Autonomy Model (recommended)

**Tiered**, not all-or-nothing:
- **Auto** (no approval): read-only audits, draft creation, internal notifications, answering chat questions.
- **One-click apply**: SEO meta fixes, page content edits, GBP post publish, student/instructor follow-ups.
- **Always ask**: anything that emails students, modifies enrollment status, or charges money.

Every action is logged to `agent_runs` + `agent_actions` for full audit.

## Where they live

- **Admin Portal → new "Agents" tab**: dashboard of all agents, recent runs, findings inbox, approval queue, per-agent chat.
- **Public site**: small "Ask a question" chat bubble (Concierge only) — collapsible, stays out of the way.
- **Portal sections**: subtle "Ask Mentor/Advocate" button in the corner of Pages/Files/Students tabs. No layout disruption.

## Technical Plan

**Backend (Supabase Edge Functions + AI SDK + Lovable AI Gateway)**
- `agent-orchestrator` — routes requests, runs scheduled jobs via `pg_cron`.
- `agent-sentinel` — runs every 15 min, writes findings.
- `agent-concierge` — public streaming chat endpoint.
- `agent-advocate` — authenticated student chat endpoint.
- `agent-mentor` — authenticated instructor chat + tools (generate quiz, organize files).
- `agent-scribe` — weekly SEO audit + content drafting.
- `agent-broadcaster` — weekly GBP draft generator.
- Shared `_shared/ai-gateway.ts` provider helper.

**Models**
- Default: `google/gemini-3-flash-preview` (fast, cheap, multimodal).
- Heavy reasoning (Scribe SEO analysis, Mentor quiz generation): `openai/gpt-5.4` or `google/gemini-3.1-pro-preview`.

**Tools each agent can call** (AI SDK `tool()` with `inputSchema`, server-side):
- query students/cohorts/enrollments
- read `webhook_logs`, `auth_audit_log`, `enrollment_emails`
- read/write `lms_pages`, `module_items` (with approval)
- create `notifications` rows
- send admin email via existing `send-enrollment-email`
- fetch URL (link checking)
- create GBP post draft

**New tables**
- `agent_runs` — id, agent, started_at, finished_at, status, summary, cost
- `agent_findings` — id, agent, severity, title, detail, suggested_fix, status (open/applied/dismissed), target_table, target_id
- `agent_actions` — id, run_id, action_type, payload, requires_approval, approved_by, applied_at
- `agent_conversations` + `agent_messages` — chat history per user/agent
- `gbp_posts` — draft, scheduled_for, status, published_at

All tables: RLS enabled, admin-only for ops tables, student/instructor scoped for their own conversations.

**Scheduled jobs (pg_cron + pg_net)**
- Sentinel: every 15 min
- Scribe weekly audit: Mondays 6am
- Broadcaster GBP draft: Sundays 8pm (admin approves Monday)
- Daily standup digest email: 7am

**Frontend**
- `src/pages/admin/AgentsHub.tsx` — list of agents, status cards, findings inbox, approval queue.
- `src/components/agents/AgentChat.tsx` — reusable streaming chat (AI SDK `useChat`) with `message.parts` rendering and markdown.
- `src/components/agents/ConciergeBubble.tsx` — public chat bubble (mounted in `App.tsx`).
- `src/components/agents/CopilotButton.tsx` — contextual in-portal launcher.
- Findings inbox with one-click "Apply fix" / "Dismiss".

**GBP integration**
- Requires user to connect Google Business Profile (OAuth). First pass: Broadcaster drafts post + admin copies to GBP manually. Phase 2: auto-publish once connector is wired.

## Rollout (suggested order)

1. Schema + Agents Hub shell + shared AI gateway helper.
2. Concierge (public bubble) + Sentinel (highest daily value).
3. Advocate + Mentor.
4. Scribe + Broadcaster.
5. Orchestrator standup digest + auto-apply flows.

## Open items to confirm before building

- OK to add the public chat bubble site-wide (Concierge)?
- Start with the recommended **tiered autonomy** (auto-read, approve-writes, never-auto-email-students)?
- Build all 7 agents in this round, or ship Concierge + Sentinel first and iterate?
- For GBP: ship the draft-only workflow now, and add the Google connector when you're ready?
