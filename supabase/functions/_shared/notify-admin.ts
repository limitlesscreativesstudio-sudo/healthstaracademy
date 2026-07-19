// Sends a failure/notice email to the HSA admin via Resend.
// Silently no-ops if RESEND_API_KEY is missing so callers never crash.
export async function notifyAdmin(subject: string, html: string): Promise<void> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) { console.warn("[notifyAdmin] RESEND_API_KEY missing, skipping:", subject); return; }
  const to = Deno.env.get("ADMIN_ALERT_EMAIL") ?? "Healthstaracademy01@gmail.com";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Health Star Academy Agents <alerts@healthstaracademy.org>",
        to: [to],
        subject: `[HSA Agents] ${subject}`,
        html,
      }),
    });
    if (!res.ok) console.error("[notifyAdmin] resend failed", res.status, await res.text());
  } catch (e) {
    console.error("[notifyAdmin] error", e);
  }
}
