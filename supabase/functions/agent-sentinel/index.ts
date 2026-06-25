// Sentinel: scheduled health scan. Writes findings to agent_findings.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: run } = await supabase
    .from("agent_runs")
    .insert({ agent: "sentinel", status: "running" })
    .select("id")
    .single();
  const runId = run?.id;
  const findings: Array<Record<string, unknown>> = [];

  try {
    // 1. Failed webhooks in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: webhookErrs } = await supabase
      .from("webhook_logs")
      .select("id, source, event_type, created_at, payload")
      .gte("created_at", since)
      .limit(50);
    const failedHooks = (webhookErrs ?? []).filter((w: any) => {
      const p = w.payload as Record<string, unknown> | null;
      return p && (p.error || p.status === "failed");
    });
    if (failedHooks.length) {
      findings.push({
        agent: "sentinel", run_id: runId, severity: "high",
        title: `${failedHooks.length} failed webhook(s) in the last 24h`,
        detail: `Recent failures: ${failedHooks.slice(0, 5).map((h: any) => h.event_type).join(", ")}`,
        suggested_fix: "Review the webhook_logs table in admin → audit, and re-trigger the affected events.",
        target_table: "webhook_logs",
      });
    }

    // 2. Stalled enrollments (pre_qualification with no follow-up >72h)
    const stalled = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const { data: stalledStudents } = await supabase
      .from("students")
      .select("id, first_name, last_name, enrollment_status, created_at")
      .lt("created_at", stalled)
      .in("enrollment_status", ["pre_qualified", "documents_received"])
      .limit(20);
    if (stalledStudents?.length) {
      findings.push({
        agent: "sentinel", run_id: runId, severity: "medium",
        title: `${stalledStudents.length} student(s) stalled in pipeline >72h`,
        detail: stalledStudents.map((s: any) => `${s.first_name} ${s.last_name} (${s.enrollment_status})`).join("; "),
        suggested_fix: "Send follow-up emails or call them.",
        target_table: "students",
      });
    }

    // 3. Upcoming cohort with no confirmed enrollments
    const { data: cohorts } = await supabase
      .from("cohorts")
      .select("id, start_date, track, confirmed_count")
      .gte("start_date", new Date().toISOString().split("T")[0])
      .order("start_date")
      .limit(5);
    for (const c of cohorts ?? []) {
      const daysOut = Math.ceil((new Date((c as any).start_date).getTime() - Date.now()) / 86400000);
      if (daysOut <= 21 && ((c as any).confirmed_count ?? 0) < 5) {
        findings.push({
          agent: "sentinel", run_id: runId, severity: "high",
          title: `Cohort ${(c as any).start_date} (${(c as any).track}) low enrollment`,
          detail: `Only ${(c as any).confirmed_count ?? 0} confirmed students, ${daysOut} days out.`,
          suggested_fix: "Push the GBP post, run ad spend on city pages, contact pre-qualified leads.",
          target_table: "cohorts", target_id: (c as any).id,
        });
      }
    }

    if (findings.length) await supabase.from("agent_findings").insert(findings);

    await supabase.from("agent_runs").update({
      status: "ok", finished_at: new Date().toISOString(),
      summary: `Found ${findings.length} issue(s).`,
    }).eq("id", runId);

    return new Response(JSON.stringify({ ok: true, findings: findings.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("agent_runs").update({
      status: "error", finished_at: new Date().toISOString(), summary: msg,
    }).eq("id", runId);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
