// Sends due-date reminder notifications (and emails) for assignments/quizzes due in the next 48 hours.
// Scheduled daily via pg_cron.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Health Star Academy <info@healthstaracademy.org>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const now = new Date();
    const horizon = new Date(now.getTime() + 48 * 3600 * 1000);
    const iso = (d: Date) => d.toISOString();

    const [{ data: asgns }, { data: quizzes }] = await Promise.all([
      supabase.from("assignments").select("id, course_id, title, due_at")
        .eq("published", true).gte("due_at", iso(now)).lte("due_at", iso(horizon)),
      supabase.from("quizzes").select("id, course_id, title, due_at")
        .eq("published", true).gte("due_at", iso(now)).lte("due_at", iso(horizon)),
    ]);

    const items = [
      ...(asgns ?? []).map((a) => ({ ...a, kind: "assignment" as const })),
      ...(quizzes ?? []).map((q) => ({ ...q, kind: "quiz" as const })),
    ];
    if (!items.length) {
      return new Response(JSON.stringify({ ok: true, reminders: 0, note: "nothing due in 48h" }),
        { headers: { ...cors, "Content-Type": "application/json" } });
    }

    const courseIds = [...new Set(items.map((i) => i.course_id))];
    const [{ data: enrs }, { data: courses }] = await Promise.all([
      supabase.from("enrollments").select("course_id, user_id").in("course_id", courseIds).eq("role", "student"),
      supabase.from("courses").select("id, title").in("id", courseIds),
    ]);
    const courseTitle: Record<string, string> = {};
    (courses ?? []).forEach((c) => { courseTitle[c.id] = c.title; });

    const studentsBy: Record<string, string[]> = {};
    (enrs ?? []).forEach((e) => { (studentsBy[e.course_id] ||= []).push(e.user_id); });

    const rows: any[] = [];
    for (const it of items) {
      const link = it.kind === "assignment"
        ? `/portal/courses/${it.course_id}?tab=assignments`
        : `/portal/courses/${it.course_id}?tab=quizzes`;
      const due = new Date(it.due_at as string);
      for (const uid of studentsBy[it.course_id] ?? []) {
        rows.push({
          user_id: uid,
          kind: "due_reminder",
          title: `Due soon: ${it.title}`,
          body: `${courseTitle[it.course_id] ?? "Your course"} — due ${due.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`,
          link,
        });
      }
    }

    // Skip anyone already reminded about the same item in the last 24h.
    const since = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    const { data: recent } = await supabase.from("notifications")
      .select("user_id, title").eq("kind", "due_reminder").gte("created_at", since);
    const seen = new Set((recent ?? []).map((r) => `${r.user_id}|${r.title}`));
    const fresh = rows.filter((r) => !seen.has(`${r.user_id}|${r.title}`));

    if (fresh.length) {
      const { error } = await supabase.from("notifications").insert(fresh);
      if (error) throw error;
    }

    // Optional email nudge
    let emailed = 0;
    if (RESEND_API_KEY && fresh.length) {
      const byUser: Record<string, any[]> = {};
      fresh.forEach((r) => { (byUser[r.user_id] ||= []).push(r); });
      for (const [uid, list] of Object.entries(byUser)) {
        const { data: u } = await supabase.auth.admin.getUserById(uid);
        const email = u?.user?.email;
        if (!email) continue;
        const html = `<p>Hi,</p><p>You have work due in the next 48 hours:</p><ul>${
          list.map((l) => `<li><strong>${l.title.replace("Due soon: ", "")}</strong> — ${l.body}</li>`).join("")
        }</ul><p>Log in to the Student Portal to complete it.</p><p>— Health Star Academy</p>`;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [email], subject: "Reminder: work due in the next 48 hours", html }),
        });
        if (res.ok) emailed++;
      }
    }

    return new Response(JSON.stringify({ ok: true, reminders: fresh.length, emailed }),
      { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-due-reminders error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
