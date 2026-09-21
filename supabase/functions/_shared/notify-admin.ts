// Agent → admin email notifications.
//
// Two modes:
//   • alert  (default) — sent immediately by email.
//   • digest            — queued and included in the once-a-day summary email
//                         produced by the `agent-digest` function.
//
// Silently no-ops if RESEND_API_KEY is missing so callers never crash.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const ADMIN_RECIPIENTS = (): string[] => {
  const extra = Deno.env.get("ADMIN_ALERT_EMAIL");
  const list = ["limitlesscreativesstudio@gmail.com", "Healthstaracademy01@gmail.com"];
  if (extra && !list.some((e) => e.toLowerCase() === extra.toLowerCase())) list.push(extra);
  return list;
};

export const FROM_ADDRESS = "Health Star Academy Agents <alerts@healthstaracademy.org>";

export async function sendAdminEmail(subject: string, html: string): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) { console.warn("[notifyAdmin] RESEND_API_KEY missing, skipping:", subject); return false; }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: ADMIN_RECIPIENTS(),
        subject: `[HSA Agents] ${subject}`,
        html,
      }),
    });
    if (!res.ok) { console.error("[notifyAdmin] resend failed", res.status, await res.text()); return false; }
    return true;
  } catch (e) {
    console.error("[notifyAdmin] error", e);
    return false;
  }
}

type Opts = { mode?: "alert" | "digest"; agent?: string };

export async function notifyAdmin(subject: string, html: string, opts: Opts = {}): Promise<void> {
  const mode = opts.mode ?? "alert";
  if (mode === "alert") { await sendAdminEmail(subject, html); return; }

  // Queue for the daily digest.
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await admin.from("agent_notifications").insert({
      agent: opts.agent ?? "agent",
      subject,
      html,
      mode: "digest",
    });
    if (error) { console.error("[notifyAdmin] queue failed, sending now", error); await sendAdminEmail(subject, html); }
  } catch (e) {
    console.error("[notifyAdmin] queue error, sending now", e);
    await sendAdminEmail(subject, html);
  }
}
