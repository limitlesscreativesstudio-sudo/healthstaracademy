# Which agent is the "sales" agent — and adding Facebook posts

## Your agent lineup today

| Agent | Role |
| --- | --- |
| **Concierge** | **This is your sales agent.** Public-facing website chat bubble that answers prospective students on tuition, tracks, requirements, and pushes them to `/pre-qualification`. |
| Broadcaster | Marketing/social agent. Currently drafts weekly Google Business Profile posts. |
| Scribe | SEO agent. Weekly audits + drafts full blog posts. |
| Scout | Competitor research + "HSA vs [School]" pages. |
| Advocate | Student support copilot inside the LMS. |
| Mentor | Instructor copilot (pages, quizzes, rubric feedback). |
| Sentinel / Security Monitor | Health scans and RLS/security monitoring. |

So: **Concierge = sales (lead capture/conversion)**, **Broadcaster = outbound marketing**. Facebook posting belongs to the **Broadcaster**, not the Concierge — same agent that already handles Google Business Profile.

## What I'll build

Extend the Broadcaster so each weekly run produces **two** drafts: the existing GBP post and a new **Facebook post** tuned for Facebook (conversational hook, emoji-light, hashtags, link to pre-qualification).

1. **Storage** — add a `channel` column to the existing posts table (`gbp` | `facebook`) so both live in one place with existing review/publish flow, rather than a second table.
2. **Broadcaster update** — a second generation step writing a Facebook-shaped draft: hook line, 3-5 short lines of value, CTA, hashtags, link. Cohort-aware, and pause-aware (no "next start date" claims while cohorts are paused).
3. **Admin UI** — the Agents Hub drafts tab gets channel tabs (GBP / Facebook) with the same Edit, Copy, Publish, Mark as posted, Discard actions.
4. **Publishing** — mirrors GBP behavior: if a `FACEBOOK_WEBHOOK_URL` (Zapier/Make/n8n) is configured, publish through it; otherwise the draft is marked ready with a one-click copy so you paste it into your Page. Failures email the admin.
5. **Notification** — admin email when a new Facebook draft is ready.

## Technical notes

- Migration: `ALTER TABLE gbp_posts ADD COLUMN channel text NOT NULL DEFAULT 'gbp'` + index; existing rows stay `gbp`. No new grants needed.
- `supabase/functions/agent-broadcaster/index.ts`: second `generateText` call with a Facebook-specific prompt, inserting with `channel: 'facebook'`; both drafts logged as separate `agent_findings`.
- `supabase/functions/publish-gbp-post/index.ts`: branch on `post.channel` to pick `GBP_WEBHOOK_URL` vs `FACEBOOK_WEBHOOK_URL`; keep the manual copy/paste fallback.
- `src/pages/admin/components/AgentsHub.tsx`: channel filter tabs over the existing drafts list.

Direct Facebook Graph API auto-posting is possible later but needs a Meta app, Page access token, and app review — the webhook path gets you posting now with no approval wait.
