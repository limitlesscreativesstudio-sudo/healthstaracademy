// Sends onboarding checklist reminders to students who haven't finished their setup steps.
// Scheduled daily via pg_cron. Bounded batch + single-flight lease + idempotent reminder log.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JOB = "onboarding-reminders";
const BATCH_SIZE = 100;
const MILESTONES = [1, 3, 7, 14]; // days since the student first saw the checklist
const LEASE_MINUTES = 10;

const STEP_LABELS: Record<string, string> = {
  password: "Set your own password",
  modules: "Open Modules and start Day 1",
  attendance: "Check your Attendance tab",
  grades: "Know where your grades live",
};
const ALL_STEPS = Object.keys(STEP_LABELS);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const now = new Date();

    // --- paused-state guard + single-flight lease -------------------------
    const { data: state } = await supabase
      .from("agent_job_state").select("*").eq("job_name", JOB).maybeSingle();

    if (state?.status === "paused") {
      return json({ ok: true, skipped: "job paused", last_error: state.last_error });
    }
    if (state?.lease_until && new Date(state.lease_until) > now) {
      return json({ ok: true, skipped: "another run holds the lease" });
    }

    await supabase.from("agent_job_state").upsert({
      job_name: JOB,
      status: "active",
      lease_until: new Date(now.getTime() + LEASE_MINUTES * 60000).toISOString(),
      last_run_at: now.toISOString(),
    });

    // --- find students with incomplete, non-dismissed checklists ----------
    const { data: rows, error } = await supabase
      .from("student_onboarding_progress")
      .select("user_id, steps, dismissed, started_at, completed_at")
      .is("completed_at", null)
      .eq("dismissed", false)
      .order("started_at", { ascending: true })
      .limit(BATCH_SIZE);
    if (error) throw error;

    const candidates = (rows ?? []).map((r) => {
      const steps = (r.steps ?? {}) as Record<string, boolean>;
      const pending = ALL_STEPS.filter((s) => !steps[s]);
      const ageDays = Math.floor((now.getTime() - new Date(r.started_at).getTime()) / 86400000);
      const milestone = [...MILESTONES].reverse().find((m) => ageDays >= m);
      return { user_id: r.user_id, pending, milestone };
    }).filter((c) => c.pending.length > 0 && c.milestone !== undefined);

    if (!candidates.length) {
      await supabase.from("agent_job_state").update({ lease_until: null }).eq("job_name", JOB);
      return json({ ok: true, reminders: 0, note: "no students due for a reminder" });
    }

    // --- skip anyone already reminded at this milestone -------------------
    const { data: alreadySent } = await supabase
      .from("onboarding_reminder_log")
      .select("user_id, milestone_days")
      .in("user_id", candidates.map((c) => c.user_id));
    const sentKey = new Set((alreadySent ?? []).map((r) => `${r.user_id}:${r.milestone_days}`));

    const due = candidates.filter((c) => !sentKey.has(`${c.user_id}:${c.milestone}`));

    let sent = 0;
    for (const c of due) {
      const list = c.pending.map((s) => `• ${STEP_LABELS[s]}`).join("\n");
      const { error: notifErr } = await supabase.from("notifications").insert({
        user_id: c.user_id,
        kind: "onboarding",
        title: c.pending.includes("password")
          ? "Finish setting up your Student Portal"
          : "A few onboarding steps are still open",
        body: `You still have ${c.pending.length} step${c.pending.length === 1 ? "" : "s"} left:\n${list}`,
        link: "/portal",
      });
      if (notifErr) continue;

      // Idempotent marker written in the same step that does the work.
      await supabase.from("onboarding_reminder_log").insert({
        user_id: c.user_id,
        milestone_days: c.milestone,
        channel: "in_app",
        pending_steps: c.pending,
      });
      sent++;
    }

    await supabase.from("agent_job_state")
      .update({ lease_until: null, last_error: null }).eq("job_name", JOB);

    return json({ ok: true, reminders: sent, considered: candidates.length });
  } catch (e) {
    await supabase.from("agent_job_state")
      .update({ lease_until: null, last_error: String((e as Error)?.message ?? e) })
      .eq("job_name", JOB);
    return json({ ok: false, error: String((e as Error)?.message ?? e) }, 500);
  }
});
