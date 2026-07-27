// Admin-triggered: read the pre-qualification Google Sheet, filter applicants
// whose submission timestamp is >= a cutoff date, and email each of them the
// updated cohort schedule (via send-enrollment-email `cohort_change`).
//
// Auth: admin JWT required. Callable from the Admin Dashboard.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const SPREADSHEET_ID = "1E5B5-Zi1q7EEZmuDzE6PCQifrH49EZUdEfwFShhPByA";
const SHEET_RANGE = "A2:U"; // Rows 2..end, cols A (timestamp) through U

// --- Google service-account JWT helpers ---
function base64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64urlBytes(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function pemToDer(pem: string): Uint8Array {
  const clean = pem.replace(/-----BEGIN [^-]+-----|-----END [^-]+-----|\s+/g, "");
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
async function getAccessToken(serviceAccountKey: string): Promise<string> {
  const key = JSON.parse(serviceAccountKey.trim());
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(key.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput)),
  );
  const assertion = `${signingInput}.${base64urlBytes(sig)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${assertion}`,
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.access_token as string;
}

async function readSheet(serviceAccountKey: string): Promise<string[][]> {
  const token = await getAccessToken(serviceAccountKey);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_RANGE)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheet read failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return (json.values ?? []) as string[][];
}

// Find the next daytime cohort start (from static schedule) whose date is >=
// today. Keep this in sync with src/data/cohortSchedule.ts.
const DAYTIME_STARTS = [
  "2026-06-22","2026-08-31","2026-10-19","2027-01-04","2027-02-22","2027-04-12",
  "2027-05-31","2027-07-19","2027-09-06","2027-10-25","2027-12-13",
];
function nextDaytimeStart(): string {
  const today = new Date().toISOString().slice(0, 10);
  return DAYTIME_STARTS.find(d => d >= today) ?? DAYTIME_STARTS[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GOOGLE_SERVICE_ACCOUNT_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");

    // Auth: accept either admin JWT (from Admin Dashboard) OR the shared
    // WEBHOOK_SECRET header (for one-off ops runs).
    const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");
    const incomingWebhookSecret = req.headers.get("x-webhook-secret");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let authed = false;
    if (WEBHOOK_SECRET && incomingWebhookSecret === WEBHOOK_SECRET) {
      authed = true;
    } else {
      const authHeader = req.headers.get("authorization") ?? "";
      const jwt = authHeader.replace("Bearer ", "").trim();
      if (jwt) {
        const { data: userData } = await supabase.auth.getUser(jwt);
        const uid = userData?.user?.id;
        if (uid) {
          const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
          if (isAdmin) authed = true;
        }
      }
    }
    if (!authed) return json({ error: "Unauthorized" }, 401);

    if (!GOOGLE_SERVICE_ACCOUNT_KEY) return json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const cutoffISO: string = body.cutoff_date || "2026-08-10"; // >= this date
    const newCohortDate: string = body.new_cohort_date || nextDaytimeStart();
    const dryRun: boolean = !!body.dry_run;

    const rows = await readSheet(GOOGLE_SERVICE_ACCOUNT_KEY);

    // Sheet columns: A timestamp, B name, C dob, D email, E addr, F phone, ..., N cohort selected
    const seen = new Set<string>();
    const targets: Array<{ email: string; name: string; prevCohort: string; timestamp: string }> = [];
    for (const r of rows) {
      const ts = (r[0] || "").trim();
      const name = (r[1] || "").trim();
      const email = (r[3] || "").trim().toLowerCase();
      const prevCohort = (r[13] || "").trim();
      if (!email || !ts) continue;
      // Parse timestamp — accept ISO or common Sheets formats
      let tsDate: Date;
      try { tsDate = new Date(ts); } catch { continue; }
      if (isNaN(tsDate.getTime())) continue;
      const tsISO = tsDate.toISOString().slice(0, 10);
      if (tsISO < cutoffISO) continue;
      if (seen.has(email)) continue;
      seen.add(email);
      targets.push({ email, name, prevCohort, timestamp: tsISO });
    }

    if (dryRun) {
      return json({ ok: true, dry_run: true, count: targets.length, targets: targets.slice(0, 50) });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    for (const t of targets) {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            email_type: "cohort_change",
            student_email: t.email,
            student_name: t.name || t.email.split("@")[0],
            cohort_date: newCohortDate,
            previous_cohort_date: t.prevCohort || undefined,
          }),
        });
        if (res.ok) sent++;
        else { failed++; errors.push(`${t.email}: ${res.status}`); }
      } catch (e) {
        failed++;
        errors.push(`${t.email}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return json({ ok: true, cutoff_date: cutoffISO, new_cohort_date: newCohortDate, sent, failed, errors: errors.slice(0, 20) });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
