// Health Star Academy public site on Cloudflare.
// Serves the website build, and runs the pieces that must not depend on Lovable credits:
// application intake with automatic retry, contact messages, cohort and blog backups,
// the chat bubble, and the weekly blog writer (Cloudflare Workers AI).
import { qualifyHha, type HhaAnswers } from "../../supabase/functions/_shared/hha";
import { cohortSchedule } from "../../src/data/cohortSchedule";

interface Env {
  ASSETS: Fetcher;
  HSA: KVNamespace;
  AI: Ai;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  PORTAL_ORIGIN: string;
  SITE_ORIGIN: string;
  ADMIN_KEY?: string;
}

const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const WRITER_MODELS = ["@cf/openai/gpt-oss-120b", "@cf/meta/llama-3.3-70b-instruct-fp8-fast"];

/** Text from any Workers AI response shape (chat, completions or responses style). */
function aiText(out: any): string {
  if (!out) return "";
  if (typeof out === "string") return out;
  if (typeof out.response === "string") return out.response;
  if (typeof out.output_text === "string") return out.output_text;
  const choice = out.choices?.[0];
  if (choice?.message?.content) return String(choice.message.content);
  if (Array.isArray(out.output)) {
    return out.output
      .flatMap((o: any) => (Array.isArray(o.content) ? o.content : []))
      .filter((c: any) => c.type === "output_text" || c.type === "text")
      .map((c: any) => c.text)
      .join("");
  }
  return "";
}
const PHONE = "(209) 323 4169";

// ---------- helpers ----------

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = /^https:\/\/([a-z0-9-]+\.)*(healthstaracademy\.org|healthstar\.academy|lovable\.app|lovableproject\.com|workers\.dev)$/i.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://healthstaracademy.org",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(req), ...extra },
  });
}

function noDashes(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/ - /g, ", ")
    .replace(/,\s*,/g, ",");
}

async function timed(input: RequestInfo, init: RequestInit = {}, ms = 15000): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: ctl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function supabaseHeaders(env: Env): Record<string, string> {
  return {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

// ---------- applications ----------

type Qualification = {
  status: "qualified" | "disqualified";
  notes: string;
  needsExam: boolean;
  needsConsent: boolean;
};

// Same rules as supabase/functions/enrollment-webhook qualifyStudent.
function qualifyCna(d: Record<string, unknown>): Qualification {
  if (!d.has_valid_id) return { status: "disqualified", notes: "Missing valid government ID", needsExam: false, needsConsent: false };
  if (!d.has_ssn) return { status: "disqualified", notes: "Missing Social Security Card", needsExam: false, needsConsent: false };
  if (!d.can_pass_background) return { status: "disqualified", notes: "Cannot pass background check", needsExam: false, needsConsent: false };
  if (!d.has_health_proof) return { status: "disqualified", notes: "Missing proof of good health", needsExam: false, needsConsent: false };
  const notes: string[] = [];
  const needsExam = !d.has_diploma;
  const needsConsent = !d.is_over_18;
  if (needsExam) notes.push("Needs entrance exam (no diploma)");
  if (needsConsent) notes.push("Needs parent consent (under 18)");
  if (d.can_pay_fee === false) notes.push("Cannot pay the $175 application fee up front, discuss payment options");
  return { status: "qualified", notes: notes.length ? notes.join("; ") : "Fully qualified", needsExam, needsConsent };
}

function localResult(payload: Record<string, unknown>) {
  const q = payload.program === "HHA" ? qualifyHha(payload as unknown as HhaAnswers) : qualifyCna(payload);
  return {
    success: true,
    queued: true,
    program: payload.program === "HHA" ? "HHA" : "CNA",
    email_sent: false,
    qualification_status: q.status,
    qualification_notes: q.notes,
    needs_exam: q.needsExam,
    needs_consent: q.needsConsent,
  };
}

async function deliverApplication(env: Env, payload: unknown): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await timed(
      `${env.SUPABASE_URL}/functions/v1/enrollment-webhook`,
      { method: "POST", headers: supabaseHeaders(env), body: JSON.stringify(payload) },
      20000,
    );
    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { /* not json */ }
    if (!res.ok || !data) return { ok: false, error: `${res.status} ${text.slice(0, 200)}` };
    if (data.error) return { ok: false, error: String(data.error).slice(0, 200) };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function handleEnroll(req: Request, env: Env): Promise<Response> {
  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return json(req, { error: "Invalid request" }, 400); }
  if (!payload || typeof payload !== "object" || !payload.email || !payload.first_name) {
    return json(req, { error: "Missing name or email" }, 400);
  }
  if (payload.event_type !== "pre_qualification") return json(req, { error: "Not allowed" }, 403);

  const receivedAt = new Date().toISOString();
  const key = `app/${receivedAt}-${crypto.randomUUID().slice(0, 8)}`;
  const record = { received_at: receivedAt, payload, status: "pending", attempts: 0 } as Record<string, unknown>;
  await env.HSA.put(key, JSON.stringify(record));

  const sent = await deliverApplication(env, payload);
  if (sent.ok) {
    record.status = "delivered";
    record.delivered_at = new Date().toISOString();
    record.attempts = 1;
    await env.HSA.put(key, JSON.stringify(record));
    return json(req, sent.data);
  }
  record.attempts = 1;
  record.last_error = sent.error;
  await env.HSA.put(key, JSON.stringify(record));
  await env.HSA.put(`pending/${key}`, "1");
  return json(req, localResult(payload));
}

async function retryPendingApplications(env: Env): Promise<void> {
  const list = await env.HSA.list({ prefix: "pending/" });
  for (const k of list.keys) {
    const appKey = k.name.slice("pending/".length);
    const raw = await env.HSA.get(appKey);
    if (!raw) { await env.HSA.delete(k.name); continue; }
    const record = JSON.parse(raw);
    const sent = await deliverApplication(env, record.payload);
    record.attempts = (record.attempts ?? 0) + 1;
    if (sent.ok) {
      record.status = "delivered";
      record.delivered_at = new Date().toISOString();
      delete record.last_error;
      await env.HSA.put(appKey, JSON.stringify(record));
      await env.HSA.delete(k.name);
    } else {
      record.last_error = sent.error;
      await env.HSA.put(appKey, JSON.stringify(record));
    }
  }
}

// ---------- contact messages ----------

async function handleContact(req: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json(req, { error: "Invalid request" }, 400); }
  const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const msg = {
    name: clean(body.name, 120),
    email: clean(body.email, 200),
    phone: clean(body.phone, 40),
    interest: clean(body.interest, 60),
    message: clean(body.message, 4000),
    page: clean(body.page, 120),
    received_at: new Date().toISOString(),
  };
  if (!msg.name || (!msg.email && !msg.phone)) return json(req, { error: "Name and a way to reach you are required" }, 400);
  await env.HSA.put(`contact/${msg.received_at}-${crypto.randomUUID().slice(0, 6)}`, JSON.stringify(msg));
  return json(req, { ok: true });
}

// ---------- backups of database content ----------

async function refreshBackups(env: Env): Promise<void> {
  const base = `${env.SUPABASE_URL}/rest/v1`;
  const headers = supabaseHeaders(env);
  try {
    const res = await timed(
      `${base}/cohorts?select=id,name,start_date,status,capacity,program_type,enrollment_deadline,paid_in_full_link,payment_plan_link&order=start_date.asc`,
      { headers },
      12000,
    );
    if (res.ok) {
      const cohorts = await res.json();
      if (Array.isArray(cohorts) && cohorts.length) {
        await env.HSA.put("cache/cohorts", JSON.stringify({ updated_at: new Date().toISOString(), cohorts }));
      }
    }
  } catch { /* database paused; keep the last copy */ }
  try {
    const res = await timed(
      `${base}/blog_drafts?select=id,slug,title,tldr,meta_description,category,read_time,published_at,hero_image_url,hero_image_alt,target_city,target_keyword,body_markdown&status=eq.published&order=published_at.desc`,
      { headers },
      15000,
    );
    if (res.ok) {
      const posts = await res.json();
      if (Array.isArray(posts)) {
        for (const p of posts) await env.HSA.put(`dbpost/${p.slug}`, JSON.stringify(p));
        await env.HSA.put("cache/dbposts", JSON.stringify(posts.map((p: any) => p.slug)));
      }
    }
  } catch { /* keep the last copy */ }
}

type Post = {
  id: string; title: string; slug: string; meta_description: string | null; tldr: string | null;
  hero_image_url: string | null; hero_image_alt: string | null; category: string | null; read_time: string | null;
  body_markdown: string; published_at: string | null; target_city: string | null; target_keyword: string | null;
  status?: string;
};

async function allPosts(env: Env): Promise<Post[]> {
  const out = new Map<string, Post>();
  const ownIndex: string[] = JSON.parse((await env.HSA.get("blog/index")) ?? "[]");
  for (const slug of ownIndex) {
    const raw = await env.HSA.get(`blog/${slug}`);
    if (raw) { const p = JSON.parse(raw) as Post; if (p.status === "published") out.set(p.slug, p); }
  }
  const dbIndex: string[] = JSON.parse((await env.HSA.get("cache/dbposts")) ?? "[]");
  for (const slug of dbIndex) {
    if (out.has(slug)) continue;
    const raw = await env.HSA.get(`dbpost/${slug}`);
    if (raw) out.set(slug, JSON.parse(raw));
  }
  return [...out.values()].sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime());
}

// ---------- chat bubble ----------

async function conciergeFacts(env: Env): Promise<string> {
  let next = "";
  try {
    const cached = JSON.parse((await env.HSA.get("cache/cohorts")) ?? "null");
    const today = new Date().toISOString().slice(0, 10);
    const open = (cached?.cohorts ?? []).filter((c: any) => c.status === "open" && c.program_type === "daytime" && c.start_date >= today);
    if (open[0]) next = `Next daytime cohort starts ${open[0].start_date}${open[0].enrollment_deadline ? `, apply by ${open[0].enrollment_deadline} at 11:59 PM` : ""}.`;
  } catch { /* ignore */ }
  if (!next) {
    const now = new Date().toISOString().slice(0, 10);
    const c = cohortSchedule.find((x) => (x.programType ?? "daytime") === "daytime" && x.deadlineISO >= now);
    if (c) next = `Next daytime cohort start date: ${c.startDate}. Application deadline: ${c.deadline} at 11:59 PM.`;
  }
  return next;
}

const CONCIERGE = `You are the Concierge for Health Star Academy, a CDPH approved hybrid CNA training program in California serving Stockton, Lodi, Hayward, Sacramento and the Bay Area.
Speak warmly, professionally and with compassion. Always use the exact name "Health Star Academy". Never use dash punctuation.

Facts you may share (do not invent anything else; if you do not know, say an admissions advisor can help and give the phone number):
- Hybrid program: 160 hours, 60 hours of online theory plus 100 hours of in person clinical training.
- Tuition: $2,499 total, or a weekly payment plan of 5 payments of $499.80. A $175 non refundable application fee applies. Financing through Denefits (no credit check) and Self Help Credit Union.
- Tuition includes a Chromebook for program use, textbook and workbook, scrubs, blood pressure cuff and stethoscope, lab supplies, LiveScan background check and state exam preparation.
- Daytime track is 6 weeks. Weekend cohorts are currently paused.
- Entrance exam (75% to pass) only if no high school diploma or GED. Parental consent if under 18.
- Bring the original physical government ID and Social Security card, plus proof of good health (physical exam and TB test or chest X ray). A LiveScan background check is required.
- A Home Health Aide (HHA) program is pending CDPH approval and planned for 2027; people can join the HHA priority list at /pre-qualification.
- Office: 5250 Claremont Avenue, Suite 127, Stockton, CA 95207. Calls ${PHONE}. Texts (916) 208 8097. Email info@healthstaracademy.org.
Use "career support", never "job placement". Avoid the word "flexible".
When someone is ready to apply or asks about eligibility, point them to /pre-qualification. Cohort dates and deadlines are at /programs/cohorts.
Keep replies under 120 words unless asked for detail.`;

function uiChunk(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

async function handleConcierge(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: any;
  try { body = await req.json(); } catch { return json(req, { error: "Invalid request" }, 400); }
  const ui = Array.isArray(body?.messages) ? body.messages.slice(-12) : [];
  const messages = ui
    .map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String((m.parts ?? []).map((p: any) => (p?.type === "text" ? p.text : "")).join("") || m.content || "").slice(0, 2000),
    }))
    .filter((m: any) => m.content);
  if (!messages.length) return json(req, { error: "messages required" }, 400);

  const next = await conciergeFacts(env);
  const system = next ? `${CONCIERGE}\n- ${next}` : CONCIERGE;

  const aiStream = (await env.AI.run(CHAT_MODEL as any, {
    messages: [{ role: "system", content: system }, ...messages],
    stream: true,
    max_tokens: 600,
    temperature: 0.3,
  } as any)) as ReadableStream<Uint8Array>;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const messageId = crypto.randomUUID();
  let full = "";
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(uiChunk({ type: "start", messageId })));
      controller.enqueue(encoder.encode(uiChunk({ type: "start-step" })));
      controller.enqueue(encoder.encode(uiChunk({ type: "text-start", id: "t0" })));
      const reader = aiStream.getReader();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const data = t.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const j = JSON.parse(data);
              const piece = j.response ?? j.choices?.[0]?.delta?.content ?? "";
              if (piece) {
                const clean = piece.replace(/[—–]/g, ",");
                full += clean;
                controller.enqueue(encoder.encode(uiChunk({ type: "text-delta", id: "t0", delta: clean })));
              }
            } catch { /* partial line */ }
          }
        }
      } catch (e) {
        if (!full) {
          const fallback = `Sorry, I could not answer just now. Please call ${PHONE} or start at /pre-qualification.`;
          controller.enqueue(encoder.encode(uiChunk({ type: "text-delta", id: "t0", delta: fallback })));
        }
      }
      controller.enqueue(encoder.encode(uiChunk({ type: "text-end", id: "t0" })));
      controller.enqueue(encoder.encode(uiChunk({ type: "finish-step" })));
      controller.enqueue(encoder.encode(uiChunk({ type: "finish" })));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
      const session = String(body?.sessionToken ?? body?.id ?? "anon").slice(0, 64);
      const lastUser = messages.filter((m: any) => m.role === "user").pop()?.content ?? "";
      ctx.waitUntil(
        env.HSA.put(
          `chat/${new Date().toISOString()}-${session.slice(0, 8)}`,
          JSON.stringify({ session, question: lastUser, answer: full }),
          { expirationTtl: 60 * 60 * 24 * 90 },
        ),
      );
    },
  });
  return new Response(out, {
    headers: {
      ...corsHeaders(req),
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "x-vercel-ai-ui-message-stream": "v1",
    },
  });
}

// ---------- weekly blog writer ----------

const CITIES = ["stockton", "lodi", "hayward", "sacramento", "fremont", "oakland", "tracy", "manteca", "modesto"];
const ANGLES = [
  { keyword: "CNA classes in {city}", angle: "a beginner overview of hybrid CNA training for {city} residents" },
  { keyword: "fast CNA certification {city}", angle: "how a {city} student can complete CNA training in 6 weeks with the hybrid model" },
  { keyword: "CNA state exam prep {city}", angle: "how {city} students can prepare for the California CNA certification exam skills and written test" },
  { keyword: "CNA to RN pathway {city}", angle: "the career ladder from CNA toward LVN and RN for someone starting in {city}" },
  { keyword: "financing CNA training {city}", angle: "how {city} students can pay for training with the full payment, weekly plan, Denefits or Self Help Credit Union" },
  { keyword: "what does a CNA do {city}", angle: "the day to day responsibilities of a CNA in hospitals, skilled nursing and home health settings" },
  { keyword: "how to become a CNA in {city}", angle: "a step by step guide from application to state certification for {city} residents" },
  { keyword: "CNA vs medical assistant {city}", angle: "how to choose between a CNA and a medical assistant credential, focused on training time and patient care" },
  { keyword: "is CNA training worth it {city}", angle: "what a {city} student should weigh: cost, time, and where the credential can lead" },
  { keyword: "best CNA schools in {city}", angle: "how {city} students should evaluate a CNA school: CDPH approval, clinical training, what tuition includes, hidden fees" },
  { keyword: "CDPH approved CNA schools {city}", angle: "why CDPH approval matters and how to check a program before enrolling" },
  { keyword: "affordable CNA classes {city}", angle: "the true total cost of CNA training and what an all inclusive tuition covers" },
  { keyword: "CNA training documents {city}", angle: "the documents and health clearances a {city} applicant needs ready before applying" },
];
const HEROES = Array.from({ length: 10 }, (_, i) => `/blog-heroes/hero-${String(i + 1).padStart(2, "0")}.jpg`);

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function field(text: string, name: string): string {
  const m = text.match(new RegExp(`^${name}:\\s*(.+)$`, "mi"));
  return m ? m[1].trim().replace(/^"|"$/g, "") : "";
}

async function writeBlogPost(env: Env, opts: { publish?: boolean } = {}): Promise<Post | { error: string }> {
  const index: string[] = JSON.parse((await env.HSA.get("blog/index")) ?? "[]");
  const used = new Set<string>(JSON.parse((await env.HSA.get("blog/used")) ?? "[]"));
  let pick: { city: string; keyword: string; angle: string } | null = null;
  outer: for (const a of ANGLES) {
    for (const city of CITIES) {
      const keyword = a.keyword.replace("{city}", cap(city));
      if (!used.has(`${city}::${keyword}`)) { pick = { city, keyword, angle: a.angle.replace("{city}", cap(city)) }; break outer; }
    }
  }
  if (!pick) { used.clear(); pick = { city: "stockton", keyword: "CNA classes in Stockton", angle: ANGLES[0].angle.replace("{city}", "Stockton") }; }
  const cityTitle = cap(pick.city);
  const next = await conciergeFacts(env);

  const prompt = `Write one blog post for Health Star Academy, a CDPH approved hybrid CNA training program in California.
Target keyword: "${pick.keyword}". Angle: ${pick.angle}. Readers live in or near ${cityTitle}, California.
Voice: warm, professional, empowering, compassionate. Use "career support", never "job placement". Never use the word "flexible". Never use dash punctuation (no em dash, no en dash, no spaced hyphen).

STRICT FACT RULE: use only these facts about Health Star Academy and do not invent statistics, wages, pass rates, quotes, testimonials, rankings or dates:
- CDPH approved, BBB accredited, hybrid program of 160 hours: 60 hours online theory and 100 hours in person clinical training.
- Daytime track is 6 weeks. Weekend cohorts are currently paused.
- Tuition $2,499 total, or 5 weekly payments of $499.80; $175 non refundable application fee; financing through Denefits and Self Help Credit Union.
- Tuition includes a Chromebook for program use, textbook and workbook, scrubs, blood pressure cuff and stethoscope, lab supplies, LiveScan background check, and state exam preparation.
- Entrance exam with a 75% passing score only for applicants without a diploma or GED; parental consent for applicants under 18.
- Applicants bring the original physical government ID and Social Security card, and proof of good health (physical exam and TB test or chest X ray).
- Clinical training sites in Stockton, Lodi and Hayward. Office at 5250 Claremont Avenue, Suite 127, Stockton. Phone ${PHONE}.
${next ? `- ${next}` : ""}
General knowledge about the CNA role in California is fine when written as general information (for example "CNAs in California commonly..."), but give no salary figures or numbers that are not listed above.
Never describe for Health Star Academy: how the weeks are divided, which clinical units or facilities students rotate through, who supervises clinicals, what career support includes, instructor activities, employer partnerships, pass rates, class sizes, or anything else not in the fact list. Say only "career support" for career help.

Return exactly this format and nothing else:
TITLE: (a compelling headline of at most 60 characters that includes the keyword naturally)
META: (at most 155 characters, includes the keyword and a benefit)
TLDR: (two plain sentences)
CATEGORY: (one of: Stockton, Lodi, Hayward, Sacramento, Bay Area, Exam Prep, Career Guide, Financing)
READ_TIME: (for example 7 min read)
BODY:
(1300 to 1700 words of markdown, do not stop early: an intro paragraph, 5 to 7 sections with ## headings, bullet lists where useful, and a final ## Frequently Asked Questions section with 4 questions as ### headings. Include these internal links written as markdown links: [start your pre qualification](/pre-qualification), [upcoming cohorts](/programs/cohorts), and [CNA classes in ${cityTitle}](/cna-classes/${pick.city}). No H1 and no images.)`;

  const system = "You are a careful healthcare education copywriter. You follow formatting and fact rules exactly and always write the full requested length.";
  let text = "";
  const errors: string[] = [];
  for (const model of WRITER_MODELS) {
    try {
      const out: any = model.includes("gpt-oss")
        ? await env.AI.run(model as any, { instructions: system, input: prompt, reasoning: { effort: "low" } } as any)
        : await env.AI.run(model as any, {
            messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
            max_tokens: 4000,
            temperature: 0.6,
          } as any);
      text = aiText(out);
      if (/^BODY:/mi.test(text) && text.length > 4000) break;
      errors.push(`${model}: short output (${text.length})`);
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (!text) return { error: `writer failed: ${errors.join(" | ")}` };

  const title = noDashes(field(text, "TITLE")).slice(0, 90);
  const bodyIdx = text.search(/^BODY:\s*$/mi);
  let body = bodyIdx >= 0 ? text.slice(bodyIdx).replace(/^BODY:\s*/i, "").trim() : "";

  // Fact check pass: remove anything about Health Star Academy that is not in the fact list.
  if (body.length >= 4000) {
    const factList = prompt.slice(prompt.indexOf("STRICT FACT RULE"), prompt.indexOf("Return exactly this format"));
    const checkPrompt = `${factList}
Below is a blog post. Edit it so that every statement about Health Star Academy is directly supported by the fact list above. Delete or rewrite as general information any Health Star Academy claim that is not supported (for example how weeks are divided, clinical units, what career support includes, instructor activities, employer networks). Keep the structure, headings, links, length and warm voice. Do not add new claims. Do not use dash punctuation. Return only the corrected markdown, with no preface.

${body}`;
    try {
      const checked: any = await env.AI.run(WRITER_MODELS[0] as any, { instructions: "You are a meticulous fact checker and editor.", input: checkPrompt, reasoning: { effort: "medium" } } as any);
      const fixed = aiText(checked).trim();
      if (fixed.length > body.length * 0.7) body = fixed;
    } catch { /* keep the first draft */ }
  }
  body = noDashes(body.replace(/^#{2,4}\s*Introduction\s*\n+/i, ""))
    .replace(/\bflexibility\b/gi, "freedom")
    .replace(/\bflexible\b/gi, "convenient")
    .replace(/\bjob placement\b/gi, "career support");
  if (!title || body.length < 4000) return { error: `writer returned an incomplete post (${body.length} characters)` };

  let slug = slugify(title);
  for (let n = 2; (await env.HSA.get(`blog/${slug}`)) || (await env.HSA.get(`dbpost/${slug}`)); n++) slug = `${slugify(title)}-${n}`;
  const autoPublish = opts.publish ?? ((await env.HSA.get("config/auto_publish")) ?? "on") === "on";
  const now = new Date().toISOString();
  const post: Post = {
    id: crypto.randomUUID(),
    title,
    slug,
    meta_description: noDashes(field(text, "META")).slice(0, 160),
    tldr: noDashes(field(text, "TLDR")),
    category: field(text, "CATEGORY") || "Career Guide",
    read_time: field(text, "READ_TIME") || "7 min read",
    body_markdown: noDashes(body),
    hero_image_url: HEROES[index.length % HEROES.length],
    hero_image_alt: `Health Star Academy CNA students in hands on training`,
    published_at: autoPublish ? now : null,
    target_city: pick.city,
    target_keyword: pick.keyword,
    status: autoPublish ? "published" : "draft",
  };
  await env.HSA.put(`blog/${slug}`, JSON.stringify(post));
  await env.HSA.put("blog/index", JSON.stringify([slug, ...index]));
  used.add(`${pick.city}::${pick.keyword}`);
  await env.HSA.put("blog/used", JSON.stringify([...used]));
  return post;
}

// ---------- sitemap ----------

async function sitemap(req: Request, env: Env): Promise<Response> {
  const base = await env.ASSETS.fetch(new Request(new URL("/sitemap.xml", req.url)));
  let xml = await base.text();
  const posts = await allPosts(env);
  const known = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const extra = posts
    .map((p) => ({ loc: `https://healthstaracademy.org/blog/${p.slug}`, mod: (p.published_at ?? "").slice(0, 10) }))
    .filter((u) => !known.has(u.loc))
    .map((u) => `  <url><loc>${u.loc}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ""}<priority>0.6</priority></url>`)
    .join("\n");
  if (extra) xml = xml.replace("</urlset>", `${extra}\n</urlset>`);
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

// ---------- router ----------

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === "OPTIONS" && path.startsWith("/api/")) return new Response(null, { status: 204, headers: corsHeaders(req) });

    if (/^\/(portal|admin|~oauth)(\/|$)/.test(path) && env.PORTAL_ORIGIN) {
      return Response.redirect(`${env.PORTAL_ORIGIN}${path}${url.search}`, 302);
    }

    if (path === "/sitemap.xml") return sitemap(req, env);

    if (path.startsWith("/api/")) {
      try {
        if (path === "/api/enroll" && req.method === "POST") return await handleEnroll(req, env);
        if (path === "/api/contact" && req.method === "POST") return await handleContact(req, env);
        if (path === "/api/concierge" && req.method === "POST") return await handleConcierge(req, env, ctx);
        if (path === "/api/cohorts" && req.method === "GET") {
          const cached = JSON.parse((await env.HSA.get("cache/cohorts")) ?? '{"cohorts":[]}');
          return json(req, cached, 200, { "Cache-Control": "public, max-age=300" });
        }
        if (path === "/api/blog" && req.method === "GET") {
          const posts = (await allPosts(env)).map(({ body_markdown, ...rest }) => rest);
          return json(req, { posts }, 200, { "Cache-Control": "public, max-age=300" });
        }
        const one = path.match(/^\/api\/blog\/([a-z0-9-]+)$/);
        if (one && req.method === "GET") {
          const raw = (await env.HSA.get(`blog/${one[1]}`)) ?? (await env.HSA.get(`dbpost/${one[1]}`));
          const post = raw ? JSON.parse(raw) : null;
          return json(req, { post: post && (post.status ?? "published") === "published" ? post : null });
        }
        if (path === "/api/health") return json(req, { ok: true, time: new Date().toISOString() });
        if (path.startsWith("/api/admin/")) {
          if (!env.ADMIN_KEY || req.headers.get("x-admin-key") !== env.ADMIN_KEY) return json(req, { error: "Not allowed" }, 403);
          if (path === "/api/admin/write-post") return json(req, await writeBlogPost(env, { publish: url.searchParams.get("publish") !== "0" }));
          if (path === "/api/admin/refresh") { await refreshBackups(env); await retryPendingApplications(env); return json(req, { ok: true }); }
        }
        return json(req, { error: "Not found" }, 404);
      } catch (e) {
        return json(req, { error: e instanceof Error ? e.message : String(e) }, 500);
      }
    }

    return env.ASSETS.fetch(req);
  },

  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    if (event.cron === "0 17 * * 2") {
      ctx.waitUntil(writeBlogPost(env));
      return;
    }
    ctx.waitUntil((async () => { await refreshBackups(env); await retryPendingApplications(env); })());
  },
};
