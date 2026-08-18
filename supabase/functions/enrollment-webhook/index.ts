import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

// Input validation schemas
const PreQualSchema = z.object({
  timestamp: z.string().optional(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional().default(""),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().default(""),
  is_over_18: z.boolean(),
  has_diploma: z.boolean(),
  has_valid_id: z.boolean(),
  has_ssn: z.boolean(),
  can_pass_background: z.boolean(),
  has_health_proof: z.boolean(),
  has_transportation: z.boolean(),
  can_pay_fee: z.boolean().optional().default(true),
  selected_cohort_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  address: z.string().max(500).optional().default(""),
  referral_source: z.string().max(100).optional().default(""),
  event_type: z.string().max(50).optional(),
  student_id: z.string().uuid().optional(),
  enrollment_status: z.string().max(50).optional(),
});

// Sanitize text for Google Sheets to prevent formula injection
function sanitizeForSheets(str: string): string {
  if (!str) return "";
  // Strip leading characters that could trigger formulas
  const cleaned = str.replace(/^[=+\-@\t\r]+/, "");
  // Remove control characters
  return cleaned.replace(/[\x00-\x1F\x7F]/g, "");
}

// Google Sheets helper
async function appendToGoogleSheet(
  serviceAccountKey: string,
  spreadsheetId: string,
  values: string[][]
) {
  // Try to parse, logging first chars on failure for debugging
  let key;
  try {
    const trimmed = serviceAccountKey.trim();
    key = JSON.parse(trimmed);
  } catch (e) {
    console.error("Failed to parse service account key. First 20 chars:", JSON.stringify(serviceAccountKey.substring(0, 20)));
    throw e;
  }

  // Base64url encode (JWT requires URL-safe base64 without padding)
  function base64url(str: string): string {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function base64urlFromBytes(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  // Create JWT for Google API auth
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claimSet = base64url(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );

  // Import the private key and sign the JWT
  const pemContents = key.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureInput = new TextEncoder().encode(`${header}.${claimSet}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, signatureInput);
  const jwt = `${header}.${claimSet}.${base64urlFromBytes(new Uint8Array(signature))}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Google auth failed: ${JSON.stringify(tokenData)}`);
  }

  // Append row to Sheet1
  const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("2025 Responses")}!A:T:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const appendRes = await fetch(sheetsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Sheets API error [${appendRes.status}]: ${errText}`);
  }

  return await appendRes.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface PreQualData {
  timestamp: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  // Columns G-M qualification fields
  is_over_18: boolean;
  has_diploma: boolean;
  has_valid_id: boolean;
  has_ssn: boolean;
  can_pass_background: boolean;
  has_health_proof: boolean;
  has_transportation: boolean;
  // Column N — informational only, never disqualifying
  can_pay_fee: boolean;
  // Column O
  selected_cohort_date: string;
  // Optional fields
  referral_source?: string;
  event_type?: string;
  student_id?: string;
  enrollment_status?: string;
}

function calculateOrientationDate(cohortStartDate: string): string {
  const start = new Date(cohortStartDate);
  // 10 days before cohort start
  const orientDate = new Date(start);
  orientDate.setDate(orientDate.getDate() - 10);
  // Adjust to closest prior Friday (Friday = 5)
  const day = orientDate.getDay();
  if (day !== 5) {
    const daysToSubtract = day >= 5 ? day - 5 : day + 2;
    orientDate.setDate(orientDate.getDate() - daysToSubtract);
  }
  return orientDate.toISOString().split("T")[0];
}

function qualifyStudent(data: PreQualData): {
  status: "qualified" | "disqualified";
  notes: string;
  needsExam: boolean;
  needsConsent: boolean;
} {
  const {
    is_over_18,
    has_diploma,
    has_valid_id,
    has_ssn,
    can_pass_background,
    has_health_proof,
    has_transportation,
  } = data;

  // Any NO in G-M (except age/diploma combo) = disqualified
  if (!has_valid_id) return { status: "disqualified", notes: "Missing valid government ID", needsExam: false, needsConsent: false };
  if (!has_ssn) return { status: "disqualified", notes: "Missing Social Security Card", needsExam: false, needsConsent: false };
  if (!can_pass_background) return { status: "disqualified", notes: "Cannot pass background check", needsExam: false, needsConsent: false };
  if (!has_health_proof) return { status: "disqualified", notes: "Missing proof of good health", needsExam: false, needsConsent: false };
  if (!has_transportation) return { status: "disqualified", notes: "No reliable transportation", needsExam: false, needsConsent: false };

  let needsExam = false;
  let needsConsent = false;
  const notes: string[] = [];

  if (!has_diploma) {
    needsExam = true;
    notes.push("Needs entrance exam (no diploma)");
  }
  if (!is_over_18) {
    needsConsent = true;
    notes.push("Needs parent consent (under 18)");
  }
  if (data.can_pay_fee === false) {
    // Informational only — does not affect qualification
    notes.push("Cannot pay the $175 application fee up front — discuss payment options");
  }

  return {
    status: "qualified",
    notes: notes.length > 0 ? notes.join("; ") : "Fully qualified",
    needsExam,
    needsConsent,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

    // Authentication: require either a valid JWT, a valid webhook secret, or anon key for public submissions
    const authHeader = req.headers.get("authorization");
    const incomingWebhookSecret = req.headers.get("x-webhook-secret");
    let authenticated = false;
    let isPublicSubmission = false;

    // Path 1: Webhook secret for external callers (e.g. Zapier)
    if (WEBHOOK_SECRET && incomingWebhookSecret === WEBHOOK_SECRET) {
      authenticated = true;
    }

    // Path 2: JWT authentication for internal callers (e.g. admin dashboard)
    if (!authenticated && authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      
      // Path 2a: Check if it's the service role key (internal function-to-function calls)
      if (token === SUPABASE_SERVICE_ROLE_KEY) {
        authenticated = true;
      } else {
        // Path 2b: Check for admin user JWT
        const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data, error: authError } = await supabaseAuth.auth.getUser(token);
        if (!authError && data?.user) {
          const { data: roles } = await supabaseAuth
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .eq("role", "admin");
          if (roles && roles.length > 0) {
            authenticated = true;
          }
        }

        // Path 2c: Allow anon key for public pre-qualification submissions only
        if (!authenticated) {
          isPublicSubmission = true;
          authenticated = true;
        }
      }
    }

    if (!authenticated) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse and validate input
    const rawPayload = await req.json();
    const parseResult = PreQualSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.issues.map(i => i.message) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const payload: PreQualData = parseResult.data as PreQualData;

    // Log the webhook
    await supabase.from("webhook_logs").insert({
      source: "zapier",
      event_type: payload.event_type || "pre_qualification",
      payload: payload as unknown as Record<string, unknown>,
    });

    const eventType = payload.event_type || "pre_qualification";

    // Public submissions (anon key) can only use pre_qualification
    if (isPublicSubmission && eventType !== "pre_qualification") {
      return new Response(
        JSON.stringify({ error: "Unauthorized: public access limited to pre_qualification" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PART 1: Pre-qualification & initial enrollment
    if (eventType === "pre_qualification") {
      // Validate required fields
      if (!payload.first_name || !payload.last_name || !payload.email || !payload.selected_cohort_date) {
        // Notify admin of missing data
        return new Response(
          JSON.stringify({ error: "Missing required fields (A-N)", missing: true }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const qualification = qualifyStudent(payload);
      const orientationDate = calculateOrientationDate(payload.selected_cohort_date);

      // Sync to Google Sheet (primary data store for pre-qualification)
      const GOOGLE_SERVICE_ACCOUNT_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
      const SPREADSHEET_ID = "1E5B5-Zi1q7EEZmuDzE6PCQifrH49EZUdEfwFShhPByA";
      let sheetSynced = false;

      if (GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
          // Column order mirrors the on-screen questionnaire exactly.
          const row = [
            new Date().toISOString(),                                              // A: Timestamp
            sanitizeForSheets(`${payload.first_name} ${payload.last_name}`),       // B: Name
            sanitizeForSheets(payload.date_of_birth || ""),                        // C: DOB
            sanitizeForSheets(payload.email),                                      // D: Email
            sanitizeForSheets(payload.address || ""),                              // E: Address
            sanitizeForSheets(payload.phone || ""),                                // F: Phone
            payload.is_over_18 ? "Yes" : "No",                                    // G: Over 18
            payload.has_valid_id ? "Yes" : "No",                                  // H: Valid ID
            payload.has_ssn ? "Yes" : "No",                                       // I: SSN Card
            payload.can_pass_background ? "Yes" : "No",                           // J: Background
            payload.has_health_proof ? "Yes" : "No",                              // K: Health Proof
            payload.has_diploma ? "Yes" : "No",                                   // L: Diploma
            payload.can_pay_fee === false ? "No" : "Yes",                          // M: Can Pay $175 Fee
            sanitizeForSheets(payload.selected_cohort_date),                       // N: Cohort Selected
            sanitizeForSheets(payload.referral_source || "Website"),                // O: How Did You Hear
            "Yes",                                                                 // P: Consent
            qualification.status === "qualified" ? "Qualified" : "Disqualified",   // Q: Qualification Category
            qualification.needsConsent ? "Yes" : "No",                             // R: Parental Consent Needed
            qualification.needsExam ? "Yes" : "No",                                // S: Entrance Exam Needed
            qualification.status === "disqualified" ? qualification.notes : "",     // T: Missing Disqualifying Items
          ];
          await appendToGoogleSheet(GOOGLE_SERVICE_ACCOUNT_KEY, SPREADSHEET_ID, [row]);
          sheetSynced = true;
          console.log("Successfully synced to Google Sheet");
        } catch (sheetError) {
          console.error("Google Sheets sync error:", sheetError);
        }
      } else {
        console.warn("GOOGLE_SERVICE_ACCOUNT_KEY not configured, skipping sheet sync");
      }

      // Also persist to `students` table so we can notify applicants when
      // cohort dates change and manage them in the admin pipeline.
      let studentId: string | null = null;
      try {
        const studentRow = {
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email.toLowerCase(),
          phone: payload.phone || null,
          date_of_birth: payload.date_of_birth || null,
          shipping_address: payload.address || null,
          is_over_18: payload.is_over_18,
          has_diploma: payload.has_diploma,
          has_valid_id: payload.has_valid_id,
          has_ssn: payload.has_ssn,
          can_pass_background: payload.can_pass_background,
          has_health_proof: payload.has_health_proof,
          has_transportation: payload.has_transportation,
          can_pay_fee: payload.can_pay_fee !== false,
          selected_cohort_date: payload.selected_cohort_date,
          orientation_date: orientationDate,
          qualification_status: qualification.status,
          qualification_notes: qualification.notes,
          needs_entrance_exam: qualification.needsExam,
          needs_parent_consent: qualification.needsConsent,
          enrollment_status: qualification.status === "qualified" ? "pre_qualified" : "disqualified",
          updated_at: new Date().toISOString(),
        };
        const { data: upserted, error: upsertErr } = await supabase
          .from("students")
          .upsert(studentRow, { onConflict: "email" })
          .select("id")
          .single();
        if (upsertErr) {
          console.error("Students upsert failed:", upsertErr.message);
        } else {
          studentId = upserted?.id ?? null;
        }
      } catch (dbErr) {
        console.error("Students table insert error:", dbErr);
      }

      // Trigger email via send-enrollment-email function
      const emailType = qualification.status === "disqualified" ? "disqualified" : "qualified_welcome";
      
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            email_type: emailType,
            student_email: payload.email,
            student_name: `${payload.first_name} ${payload.last_name}`,
            cohort_date: payload.selected_cohort_date,
            orientation_date: orientationDate,
            needs_entrance_exam: qualification.needsExam,
            needs_parent_consent: qualification.needsConsent,
            qualification_notes: qualification.notes,
          }),
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }

      // Send admin notification email with the same results
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            email_type: "admin_notification",
            student_email: "healthstaracademy01@gmail.com",
            student_name: `${payload.first_name} ${payload.last_name}`,
            cohort_date: payload.selected_cohort_date,
            orientation_date: orientationDate,
            needs_entrance_exam: qualification.needsExam,
            needs_parent_consent: qualification.needsConsent,
            qualification_notes: qualification.notes,
          }),
        });
      } catch (adminEmailError) {
        console.error("Admin notification email error:", adminEmailError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          sheet_synced: sheetSynced,
          qualification_status: qualification.status,
          qualification_notes: qualification.notes,
          needs_exam: qualification.needsExam,
          needs_consent: qualification.needsConsent,
          selected_cohort_date: payload.selected_cohort_date,
          email_sent: emailType,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PART 2: Documents received → LiveScan
    if (eventType === "documents_received" && payload.student_id) {
      await supabase
        .from("students")
        .update({ enrollment_status: "documents_received" })
        .eq("id", payload.student_id);

      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("id", payload.student_id)
        .single();

      if (student) {
        await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            student_id: student.id,
            email_type: "livescan",
            student_email: student.email,
            student_name: `${student.first_name} ${student.last_name}`,
            cohort_date: student.selected_cohort_date,
          }),
        });

        await supabase
          .from("students")
          .update({ enrollment_status: "livescan_sent" })
          .eq("id", payload.student_id);
      }

      return new Response(JSON.stringify({ success: true, step: "livescan_sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PART 3: Cohort confirmation & tuition
    if (eventType === "tuition_request" && payload.student_id) {
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("id", payload.student_id)
        .single();

      if (student) {
        await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            student_id: student.id,
            email_type: "tuition_options",
            student_email: student.email,
            student_name: `${student.first_name} ${student.last_name}`,
            cohort_date: student.selected_cohort_date,
          }),
        });

        await supabase
          .from("students")
          .update({ enrollment_status: "tuition_sent" })
          .eq("id", payload.student_id);
      }

      return new Response(JSON.stringify({ success: true, step: "tuition_sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PART 4: Payment complete → Orientation
    if (eventType === "payment_complete" && payload.student_id) {
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("id", payload.student_id)
        .single();

      if (student) {
        await supabase
          .from("students")
          .update({
            enrollment_status: "orientation_scheduled",
            payment_status: "paid",
          })
          .eq("id", payload.student_id);

        await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            student_id: student.id,
            email_type: "orientation",
            student_email: student.email,
            student_name: `${student.first_name} ${student.last_name}`,
            cohort_date: student.selected_cohort_date,
            orientation_date: student.orientation_date,
            needs_entrance_exam: student.needs_entrance_exam,
          }),
        });

        // Also send scrub request email
        await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            student_id: student.id,
            email_type: "scrub_request",
            student_email: student.email,
            student_name: `${student.first_name} ${student.last_name}`,
          }),
        });
      }

      return new Response(JSON.stringify({ success: true, step: "orientation_scheduled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PART 6: Final welcome (Friday before cohort start)
    if (eventType === "final_welcome" && payload.student_id) {
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("id", payload.student_id)
        .single();

      if (student) {
        await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            student_id: student.id,
            email_type: "final_welcome",
            student_email: student.email,
            student_name: `${student.first_name} ${student.last_name}`,
            cohort_date: student.selected_cohort_date,
          }),
        });

        await supabase
          .from("students")
          .update({ enrollment_status: "welcome_sent" })
          .eq("id", payload.student_id);
      }

      return new Response(JSON.stringify({ success: true, step: "welcome_sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown event type", event_type: eventType }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
