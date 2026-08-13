// Sends apply-by deadline reminders for upcoming cohorts.
// Apply-by = cohort start date minus 14 days (e.g. Aug 31, 2026 start -> Aug 17, 2026).
// Fires at T-14, T-7, T-3, T-1 and T-0 days before the apply-by date.
// Scheduled daily via pg_cron; also callable manually (?dry=1 to preview).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Health Star Academy <info@healthstaracademy.org>";
const ADMIN_EMAIL = Deno.env.get("ADMIN_ALERT_EMAIL") ?? "Healthstaracademy01@gmail.com";
const MILESTONES = [14, 7, 3, 1, 0];
const APPLY_BY_OFFSET_DAYS = 14;

const fmt = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const daysBetween = (fromISO: string, toISO: string) =>
  Math.round(
    (new Date(toISO + "T00:00:00").getTime() - new Date(fromISO + "T00:00:00").getTime()) / 86400000,
  );

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) { console.warn("[deadline-reminders] RESEND_API_KEY missing; skipping", to); return false; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) { console.error("[deadline-reminders] resend failed", res.status, await res.text()); return false; }
  return true;
}

const studentHtml = (name: string, cohortName: string, startISO: string, applyByISO: string, daysLeft: number) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2D2D47">
    <h2 style="color:#7C4DFF;margin-bottom:4px">${daysLeft === 0 ? "Today is the final day to apply" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left to apply`}</h2>
    <p>Hi ${name || "there"},</p>
    <p>Enrollment for our <strong>${cohortName}</strong> CNA cohort closes on
    <strong>${fmt(applyByISO)}</strong> — that's the final submission date, 14 days before classes begin on
    <strong>${fmt(startISO)}</strong>.</p>
    <p>To hold your seat, make sure your application, enrollment fee, and required documents
    (physical original government ID) are submitted before the deadline.</p>
    <p style="margin:24px 0">
      <a href="https://healthstaracademy.org/pre-qualification"
         style="background:#319795;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">
        Complete My Enrollment
      </a>
    </p>
    <p style="font-size:13px;color:#666">Questions? Reply to this email or call us and our team will walk you through it.</p>
    <p style="font-size:13px;color:#666">— Health Star Academy</p>
  </div>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: cohorts, error: cErr } = await supabase
      .from("cohorts")
      .select("id, name, start_date, enrollment_deadline, is_template, program_type")
      .eq("is_template", false)
      .gte("start_date", today);
    if (cErr) throw cErr;

    const results: any[] = [];

    for (const c of cohorts ?? []) {
      const startISO = String(c.start_date).slice(0, 10);
      const applyByISO = (c.enrollment_deadline
        ? String(c.enrollment_deadline).slice(0, 10)
        : addDays(startISO, -APPLY_BY_OFFSET_DAYS));
      const daysLeft = daysBetween(today, applyByISO);
      if (!MILESTONES.includes(daysLeft)) continue;

      // Recipients: students attached to this cohort who have not finished enrolling.
      const { data: students } = await supabase
        .from("students")
        .select("id, first_name, last_name, email, enrollment_status")
        .eq("cohort_id", c.id);

      const pending = (students ?? []).filter(
        (s) => !["enrolled", "completed", "withdrawn", "rejected"].includes(
          String(s.enrollment_status ?? "").toLowerCase(),
        ),
      );

      const subject = daysLeft === 0
        ? `Final day to apply — ${c.name} starts ${fmt(startISO)}`
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left: apply by ${fmt(applyByISO)}`;

      let emailed = 0;
      let notified = 0;

      for (const s of pending) {
        if (!s.email) continue;

        // Idempotency guard — one send per student, per cohort, per milestone.
        const { error: logErr } = await supabase.from("cohort_deadline_reminders").insert({
          cohort_id: c.id, milestone_days: daysLeft, email: s.email.toLowerCase(),
        });
        if (logErr) continue; // already sent

        if (!dry) {
          const ok = await sendEmail(
            s.email,
            subject,
            studentHtml(s.first_name ?? "", c.name, startISO, applyByISO, daysLeft),
          );
          if (ok) emailed++;
        } else { emailed++; }

        // In-app notification if the applicant already has a portal account.
        const { data: profile } = await supabase.rpc("user_id_by_email", { _email: s.email });
        if (profile && !dry) {
          await supabase.from("notifications").insert({
            user_id: profile,
            kind: "deadline",
            title: subject,
            body: `Enrollment for ${c.name} closes ${fmt(applyByISO)}. Classes start ${fmt(startISO)}.`,
            link: "/pre-qualification",
          });
          notified++;
        }
      }

      // Admin digest so staff can chase stragglers.
      if (!dry && pending.length) {
        await sendEmail(
          ADMIN_EMAIL,
          `[HSA] ${c.name}: ${daysLeft} day(s) to apply-by (${fmt(applyByISO)})`,
          `<p><strong>${c.name}</strong> apply-by is ${fmt(applyByISO)} (start ${fmt(startISO)}).</p>
           <p>${pending.length} applicant(s) still incomplete:</p>
           <ul>${pending.map((s) => `<li>${s.first_name ?? ""} ${s.last_name ?? ""} — ${s.email} (${s.enrollment_status})</li>`).join("")}</ul>`,
        );
      }

      results.push({ cohort: c.name, applyByISO, startISO, daysLeft, pending: pending.length, emailed, notified });
    }

    return new Response(JSON.stringify({ ok: true, dry, today, results }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[cohort-deadline-reminders]", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
