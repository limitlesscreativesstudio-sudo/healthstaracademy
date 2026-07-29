// Security Monitor: scheduled RLS/access regression scanner.
// Writes findings to agent_findings and notifies admins on critical issues.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/ai-gateway.ts";

type Finding = {
  agent: string;
  run_id: string | null;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  detail?: string;
  suggested_fix?: string;
  target_table?: string;
  target_id?: string;
  status?: string;
};

// Tables that MUST have RLS and MUST NOT allow public/anon writes.
const SENSITIVE_TABLES = [
  "profiles", "user_roles", "enrollments", "students", "submissions",
  "grades", "quiz_attempts", "portal_messages", "portal_conversations",
  "portal_conversation_participants", "notifications", "audit_log",
  "auth_audit_log", "clinical_attendance", "clinical_hours",
  "job_pipeline", "pending_enrollments", "course_invites",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: run } = await supabase
    .from("agent_runs")
    .insert({ agent: "security-monitor", status: "running" })
    .select("id")
    .single();
  const runId: string | null = run?.id ?? null;
  const findings: Finding[] = [];

  const add = (f: Omit<Finding, "agent" | "run_id" | "status">) =>
    findings.push({ agent: "security-monitor", run_id: runId, status: "open", ...f });

  try {
    // 1. RLS enabled on every public table
    const { data: rlsRows } = await supabase.rpc("exec_sql_readonly" as never, {}).then(
      () => ({ data: null as unknown }),
      () => ({ data: null }),
    );
    // Fallback: query pg_class through PostgREST view is not possible; use information_schema via a known helper.
    // We instead sanity-check known sensitive tables by attempting an anon read.
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    for (const table of SENSITIVE_TABLES) {
      const { data, error } = await anonClient.from(table).select("*").limit(1);
      // If anon can read rows without an authenticated policy => regression.
      if (!error && Array.isArray(data) && data.length > 0) {
        add({
          severity: "critical",
          title: `Anonymous read exposure on public.${table}`,
          detail: `Anonymous client returned ${data.length} row(s) from ${table}. RLS may be disabled or a policy permits anon SELECT.`,
          suggested_fix: `Verify ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY and remove any anon SELECT policy or GRANT.`,
          target_table: table,
        });
      }
    }

    // 2. Privileged role assignments — no more than expected admins
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const adminCount = admins?.length ?? 0;
    if (adminCount === 0) {
      add({
        severity: "critical",
        title: "No admin users configured",
        detail: "There are zero rows in user_roles with role='admin'. No one can manage privileged actions.",
        suggested_fix: "Assign at least one trusted user the 'admin' role in user_roles.",
        target_table: "user_roles",
      });
    } else if (adminCount > 5) {
      add({
        severity: "high",
        title: `${adminCount} admin users configured`,
        detail: "More than 5 admin accounts increases blast radius of any compromised account.",
        suggested_fix: "Review user_roles and downgrade any admins that only need 'instructor' access.",
        target_table: "user_roles",
      });
    }

    // 3. Duplicate role rows (integrity)
    const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
    const seen = new Map<string, number>();
    for (const r of allRoles ?? []) {
      const key = `${r.user_id}:${r.role}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, n]) => n > 1);
    if (dupes.length) {
      add({
        severity: "medium",
        title: `${dupes.length} duplicate user_role assignment(s)`,
        detail: dupes.slice(0, 5).map(([k, n]) => `${k} × ${n}`).join("; "),
        suggested_fix: "Deduplicate rows in user_roles; enforce UNIQUE(user_id, role).",
        target_table: "user_roles",
      });
    }

    // 4. Orphaned enrollments (user no longer in profiles)
    const { data: enrolls } = await supabase.from("enrollments").select("id, user_id").limit(500);
    const uniqueUserIds = [...new Set((enrolls ?? []).map((e) => e.user_id))];
    if (uniqueUserIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id")
        .in("user_id", uniqueUserIds);
      const profSet = new Set((profs ?? []).map((p) => p.user_id));
      const orphaned = uniqueUserIds.filter((id) => !profSet.has(id));
      if (orphaned.length) {
        add({
          severity: "medium",
          title: `${orphaned.length} enrollment(s) reference missing profile`,
          detail: `User IDs without profile row: ${orphaned.slice(0, 3).join(", ")}${orphaned.length > 3 ? "…" : ""}`,
          suggested_fix: "Clean up orphaned enrollments or restore missing profiles.",
          target_table: "enrollments",
        });
      }
    }

    // 5. Auth audit anomalies — spike of failed logins in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: failed } = await supabase
      .from("auth_audit_log")
      .select("id, email, event_type")
      .gte("created_at", oneHourAgo)
      .in("event_type", ["login_failed", "unauthorized_access", "role_denied"]);
    if ((failed?.length ?? 0) >= 10) {
      add({
        severity: "high",
        title: `${failed!.length} auth failures in the last hour`,
        detail: "Possible brute-force or misconfigured client.",
        suggested_fix: "Review auth_audit_log; consider rate-limiting or blocking offending IPs.",
        target_table: "auth_audit_log",
      });
    }

    // 6. Storage buckets that should stay private
    const privateBuckets = ["course-assets", "skill-evidence", "course-files", "submissions"];
    for (const bucket of privateBuckets) {
      const { data: b } = await supabase.storage.getBucket(bucket);
      if (b?.public) {
        add({
          severity: "critical",
          title: `Storage bucket '${bucket}' is PUBLIC`,
          detail: "This bucket contains sensitive student/course data and must not be world-readable.",
          suggested_fix: `Set bucket '${bucket}' to private in Cloud → Storage.`,
          target_table: "storage.buckets",
          target_id: bucket,
        });
      }
    }

    // Deduplicate against existing OPEN findings so we don't spam
    const { data: existing } = await supabase
      .from("agent_findings")
      .select("title")
      .eq("agent", "security-monitor")
      .eq("status", "open");
    const openTitles = new Set((existing ?? []).map((e) => e.title));
    const fresh = findings.filter((f) => !openTitles.has(f.title));

    if (fresh.length) {
      await supabase.from("agent_findings").insert(fresh);

      // Notify all admins about critical/high findings
      const critical = fresh.filter((f) => f.severity === "critical" || f.severity === "high");
      if (critical.length && admins?.length) {
        const notifications = admins.flatMap((a) =>
          critical.map((f) => ({
            user_id: a.user_id,
            kind: "security",
            title: `[${f.severity.toUpperCase()}] ${f.title}`,
            body: f.detail?.slice(0, 280) ?? null,
            link: "/portal/teach/admin?tab=findings",
          }))
        );
        await supabase.from("notifications").insert(notifications);
      }
    }

    await supabase.from("agent_runs").update({
      status: "ok",
      finished_at: new Date().toISOString(),
      summary: `Scanned ${SENSITIVE_TABLES.length} tables. ${findings.length} issue(s), ${fresh.length} new.`,
    }).eq("id", runId);

    return new Response(
      JSON.stringify({ ok: true, total: findings.length, new: fresh.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("agent_runs").update({
      status: "error",
      finished_at: new Date().toISOString(),
      summary: msg,
    }).eq("id", runId);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
