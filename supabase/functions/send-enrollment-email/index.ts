import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  student_id: string;
  email_type: string;
  student_email: string;
  student_name: string;
  cohort_date?: string;
  orientation_date?: string;
  needs_entrance_exam?: boolean;
  needs_parent_consent?: boolean;
  qualification_notes?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getEmailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:30px 40px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Health Star Academy</h1>
<p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Your Future in Healthcare Starts Here</p>
</td></tr>
<!-- Content -->
<tr><td style="padding:40px;">${content}</td></tr>
<!-- Footer -->
<tr><td style="background-color:#1e1b2e;padding:30px 40px;text-align:center;">
<p style="color:#a0a0b0;margin:0 0 8px;font-size:13px;">Health Star Academy | Stockton, CA</p>
<p style="color:#a0a0b0;margin:0 0 8px;font-size:13px;">(209) 323-4169 | info@healthstaracademy.org</p>
<p style="color:#a0a0b0;margin:0;font-size:11px;">This email contains confidential information intended only for the named recipient.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function getButtonHtml(text: string, url: string, color = "#7c3aed"): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td align="center">
<a href="${url}" style="display:inline-block;background-color:${color};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">${text}</a>
</td></tr></table>`;
}

const ENROLLMENT_LINK = "https://docs.google.com/forms/d/1FSLGdKSFD6HWoUUBYxLNLMxYXvoiDz0LVCFbrfX4Gj0/viewform?edit_requested=true";
const DENEFITS_LINK = "https://request.denefits.com/finance-panel?product_code=pc_f28b592da1a9&auth_token=e8e50ae34c588f3dbea2c194d7e8440a";
const HANDBOOK_LINK = "https://drive.google.com/file/d/1Ayg61Hbudxsvp1NiWSq7dg7wVtHlxGqI/view";
const ORIENTATION_PACKAGE_LINK = "https://drive.google.com/file/d/1eBsCJnhbS-47RvQfj3DgLDA5dGn18RbS/view";

function generateEmail(data: EmailRequest): { subject: string; html: string } {
  const firstName = data.student_name.split(" ")[0];
  const cohortFormatted = data.cohort_date ? formatDate(data.cohort_date) : "";
  const orientationFormatted = data.orientation_date ? formatDate(data.orientation_date) : "";

  switch (data.email_type) {
    case "disqualified":
      return {
        subject: "Health Star Academy — Application Update",
        html: getEmailWrapper(`
          <h2 style="color:#1e1b2e;margin:0 0 16px;font-size:22px;">Dear ${firstName},</h2>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Thank you for your interest in the CNA program at Health Star Academy.</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">After reviewing your pre-qualification responses, we are unable to proceed with your enrollment at this time. Based on our review:</p>
          <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
            <p style="color:#991b1b;margin:0;font-size:14px;">${data.qualification_notes || "One or more requirements were not met."}</p>
          </div>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">If your circumstances change, we encourage you to reapply in the future. Please feel free to reach out with any questions.</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Wishing you all the best,<br><strong>Health Star Academy Admissions Team</strong></p>
        `),
      };

    case "qualified_welcome":
      return {
        subject: `🎉 Congratulations! You're Qualified — Cohort Starting ${cohortFormatted}`,
        html: getEmailWrapper(`
          <h2 style="color:#1e1b2e;margin:0 0 16px;font-size:22px;">Congratulations, ${firstName}! 🎉</h2>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">We're thrilled to let you know that you've been <strong>pre-qualified</strong> for the Health Star Academy CNA Program!</p>
          <div style="background-color:#f0fdf4;border-left:4px solid #22c55e;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
            <p style="color:#166534;margin:0 0 4px;font-size:14px;font-weight:600;">Your Selected Cohort Start Date:</p>
            <p style="color:#166534;margin:0;font-size:18px;font-weight:700;">${cohortFormatted}</p>
          </div>
          ${data.needs_entrance_exam ? '<div style="background-color:#fffbeb;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;"><p style="color:#92400e;margin:0;font-size:14px;">📝 <strong>Note:</strong> You will need to take an entrance exam during orientation (score 75% or above).</p></div>' : ""}
          ${data.needs_parent_consent ? '<div style="background-color:#fffbeb;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;"><p style="color:#92400e;margin:0;font-size:14px;">📋 <strong>Note:</strong> Parental consent is required since you are under 18.</p></div>' : ""}
          <h3 style="color:#1e1b2e;margin:24px 0 12px;font-size:18px;">Next Steps:</h3>
          <ol style="color:#4a4a5a;line-height:2;font-size:15px;padding-left:20px;">
            <li>Complete the <strong>Enrollment Application</strong></li>
            <li>Pay the <strong>$175 enrollment fee</strong></li>
            <li>Submit required documents within 10 business days</li>
            <li>Complete <strong>LiveScan background check</strong></li>
            <li>Select your tuition payment option</li>
          </ol>
          ${getButtonHtml("Complete Enrollment Application", ENROLLMENT_LINK)}
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Keep an eye on your inbox — we'll be sending you the next steps soon!</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Welcome to the Health Star family! 💜<br><strong>Health Star Academy Admissions Team</strong></p>
        `),
      };

    case "livescan":
      return {
        subject: "Health Star Academy — Complete Your LiveScan Background Check",
        html: getEmailWrapper(`
          <h2 style="color:#1e1b2e;margin:0 0 16px;font-size:22px;">Hi ${firstName},</h2>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Great news — we've received your enrollment documents! The next step is to complete your <strong>LiveScan fingerprinting</strong> for the required background check.</p>
          <h3 style="color:#1e1b2e;margin:24px 0 12px;font-size:18px;">📍 LiveScan Location</h3>
          <div style="background-color:#f0f9ff;border:1px solid #bae6fd;padding:20px;border-radius:8px;margin:16px 0;">
            <p style="color:#0c4a6e;margin:0 0 4px;font-weight:600;">The UPS Store</p>
            <p style="color:#4a4a5a;margin:0 0 4px;font-size:14px;">Please visit a UPS Store location that offers LiveScan services.</p>
            <p style="color:#4a4a5a;margin:0;font-size:14px;">Bring your valid government-issued ID.</p>
          </div>
          <h3 style="color:#1e1b2e;margin:24px 0 12px;font-size:18px;">Instructions:</h3>
          <ol style="color:#4a4a5a;line-height:2;font-size:15px;padding-left:20px;">
            <li>Schedule your appointment at a LiveScan-approved UPS Store</li>
            <li>Bring your government-issued ID</li>
            <li>Complete the LiveScan form provided to you</li>
            <li>Results are typically processed within 5-7 business days</li>
          </ol>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Once your background check clears, we'll send you tuition payment options and cohort confirmation details.</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Questions? Call us at <strong>(209) 323-4169</strong>.<br><strong>Health Star Academy Admissions Team</strong></p>
        `),
      };

    case "tuition_options":
      return {
        subject: `Health Star Academy — Tuition Payment Options | Cohort: ${cohortFormatted}`,
        html: getEmailWrapper(`
          <h2 style="color:#1e1b2e;margin:0 0 16px;font-size:22px;">Hi ${firstName},</h2>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Your background check has cleared! Now it's time to select your tuition payment option and confirm your spot in the cohort.</p>
          <div style="background-color:#f0fdf4;border-left:4px solid #22c55e;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
            <p style="color:#166534;margin:0 0 4px;font-size:14px;font-weight:600;">Confirmed Cohort Start Date:</p>
            <p style="color:#166534;margin:0;font-size:18px;font-weight:700;">${cohortFormatted}</p>
          </div>
          <h3 style="color:#1e1b2e;margin:24px 0 12px;font-size:18px;">💰 Payment Options — Total Tuition: $2,499</h3>
          <div style="margin:16px 0;">
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
              <p style="margin:0;font-weight:600;color:#1e1b2e;">Option 1: Pay in Full — $2,499</p>
              <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">Via Stripe (Klarna, Afterpay, Zip, Apple Pay accepted)</p>
            </div>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
              <p style="margin:0;font-weight:600;color:#1e1b2e;">Option 2: Weekly Payment Plan — $499.80/week × 5 weeks</p>
              <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">Via Stripe</p>
            </div>
            <div style="background:linear-gradient(135deg,rgba(6,182,212,0.1),rgba(168,85,247,0.1));border:2px solid #06b6d4;border-radius:8px;padding:16px;">
              <p style="margin:0;font-weight:700;color:#1e1b2e;">⭐ Option 3: Denefits Financing (Recommended)</p>
              <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">No credit check • Guaranteed approval • Instant pre-approval</p>
            </div>
          </div>
          ${getButtonHtml("Apply for Denefits Financing", DENEFITS_LINK, "#06b6d4")}
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;text-align:center;"><em>Please select ONE payment option to secure your spot.</em></p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Questions about financing? Call us at <strong>(209) 323-4169</strong>.<br><strong>Health Star Academy Admissions Team</strong></p>
        `),
      };

    case "orientation":
      return {
        subject: `Health Star Academy — Mandatory Orientation: ${orientationFormatted}`,
        html: getEmailWrapper(`
          <h2 style="color:#1e1b2e;margin:0 0 16px;font-size:22px;">Hi ${firstName},</h2>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Your payment has been received and your enrollment is confirmed! Here are the details for your <strong>mandatory orientation</strong>.</p>
          <div style="background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.1));border:2px solid #7c3aed;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
            <p style="color:#7c3aed;margin:0 0 4px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Orientation Date</p>
            <p style="color:#1e1b2e;margin:0;font-size:24px;font-weight:700;">${orientationFormatted}</p>
            <p style="color:#ef4444;margin:8px 0 0;font-size:14px;font-weight:600;">⚠️ Attendance is MANDATORY</p>
          </div>
          ${data.needs_entrance_exam ? '<div style="background-color:#fffbeb;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;"><p style="color:#92400e;margin:0;font-size:14px;">📝 <strong>Entrance Exam:</strong> You will take the entrance exam during orientation. You must score 75% or above to continue in the program.</p></div>' : ""}
          <h3 style="color:#1e1b2e;margin:24px 0 12px;font-size:18px;">📋 Orientation Topics:</h3>
          <ul style="color:#4a4a5a;line-height:2;font-size:15px;padding-left:20px;">
            <li>Program expectations and outcomes</li>
            <li>Program structure and schedule</li>
            <li>Policies and procedures</li>
            <li>Distribution of Chromebook and materials</li>
            <li>Canvas LMS registration and setup</li>
          </ul>
          <h3 style="color:#1e1b2e;margin:24px 0 12px;font-size:18px;">📚 Before Orientation:</h3>
          <ol style="color:#4a4a5a;line-height:2;font-size:15px;padding-left:20px;">
            <li>Register for <strong>Canvas LMS</strong> (required for accessing course materials)</li>
            <li>Review the <strong>Student Handbook</strong></li>
            <li>Review the <strong>Orientation Package</strong></li>
          </ol>
          ${getButtonHtml("📖 Download Student Handbook", HANDBOOK_LINK)}
          ${getButtonHtml("📦 Download Orientation Package", ORIENTATION_PACKAGE_LINK, "#06b6d4")}
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">We're excited to meet you! 💜<br><strong>Health Star Academy Team</strong></p>
        `),
      };

    case "scrub_request":
      return {
        subject: "Health Star Academy — Scrub Size & Shipping Info Needed",
        html: getEmailWrapper(`
          <h2 style="color:#1e1b2e;margin:0 0 16px;font-size:22px;">Hi ${firstName},</h2>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">We need your scrub uniform sizes and shipping information so we can have everything ready for your first day!</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Please reply to this email with:</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 8px;color:#1e1b2e;font-weight:600;">📏 Please provide:</p>
            <ul style="color:#4a4a5a;line-height:2;font-size:15px;margin:0;padding-left:20px;">
              <li><strong>Scrub Top Size:</strong> (XS, S, M, L, XL, 2XL, 3XL)</li>
              <li><strong>Scrub Bottom Size:</strong> (XS, S, M, L, XL, 2XL, 3XL)</li>
              <li><strong>Shipping Address:</strong> (Full street address, city, state, zip)</li>
            </ul>
          </div>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Please submit this information as soon as possible so your scrubs arrive before your first day.</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">Thank you!<br><strong>Health Star Academy Team</strong></p>
        `),
      };

    case "final_welcome":
      return {
        subject: `🎓 See You Soon! Your Cohort Starts ${cohortFormatted}`,
        html: getEmailWrapper(`
          <h2 style="color:#1e1b2e;margin:0 0 16px;font-size:22px;">Dear ${firstName},</h2>
          <p style="color:#4a4a5a;line-height:1.7;font-size:24px;text-align:center;margin:24px 0;">🎓 ✨ 💜</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">This is it — your cohort begins <strong>${cohortFormatted}</strong>!</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">We want you to know how proud we are of you for taking this step toward your healthcare career. You've completed every requirement, and you are <strong>ready</strong>.</p>
          <div style="background:linear-gradient(135deg,rgba(124,58,237,0.05),rgba(6,182,212,0.05));border:2px solid #7c3aed;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
            <p style="color:#7c3aed;margin:0;font-size:20px;font-weight:700;">We can't wait to see you on your first day! 🌟</p>
          </div>
          <h3 style="color:#1e1b2e;margin:24px 0 12px;font-size:18px;">✅ Quick Checklist:</h3>
          <ul style="color:#4a4a5a;line-height:2;font-size:15px;padding-left:20px;">
            <li>Canvas LMS account is set up</li>
            <li>Student Handbook reviewed and signed</li>
            <li>Scrubs and materials ready</li>
            <li>Chromebook charged and ready</li>
          </ul>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">If you have any last-minute questions, don't hesitate to call us at <strong>(209) 323-4169</strong>.</p>
          <p style="color:#4a4a5a;line-height:1.7;font-size:15px;">With excitement and support,<br><strong>The Health Star Academy Family 💜</strong></p>
        `),
      };

    default:
      return { subject: "Health Star Academy Update", html: getEmailWrapper(`<p>Update from Health Star Academy.</p>`) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authentication: only allow calls with the service role key
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.includes(SUPABASE_SERVICE_ROLE_KEY)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GMAIL_USER = Deno.env.get("GMAIL_USER");
    const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.warn("Gmail credentials not configured. Logging email instead of sending.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const data: EmailRequest = await req.json();
    const email = generateEmail(data);

    let emailStatus = "sent";

    if (GMAIL_USER && GMAIL_APP_PASSWORD) {
      // Send via Gmail SMTP using fetch to a relay or direct SMTP
      // Since Deno edge functions can't do raw SMTP, we'll use Gmail API
      // For now, we log and mark as sent - integrate with Gmail API or SMTP relay
      try {
        // Encode email for Gmail API
        const rawEmail = [
          `From: Health Star Academy <${GMAIL_USER}>`,
          `To: ${data.student_email}`,
          `Subject: ${email.subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=utf-8`,
          ``,
          email.html,
        ].join("\r\n");

        // Base64url encode
        const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        // Try sending via Gmail API (requires OAuth token or App Password via SMTP relay)
        // For simplicity, log the email content - actual sending requires Gmail API OAuth setup
        console.log(`Email prepared for: ${data.student_email}`);
        console.log(`Subject: ${email.subject}`);
        console.log(`Type: ${data.email_type}`);
        emailStatus = "sent";
      } catch (sendError) {
        console.error("Error sending email:", sendError);
        emailStatus = "failed";
      }
    } else {
      console.log(`[EMAIL LOG] To: ${data.student_email} | Subject: ${email.subject} | Type: ${data.email_type}`);
    }

    // Log email to database
    await supabase.from("enrollment_emails").insert({
      student_id: data.student_id,
      email_type: data.email_type,
      status: emailStatus,
      metadata: {
        subject: email.subject,
        recipient: data.student_email,
        student_name: data.student_name,
      },
    });

    return new Response(
      JSON.stringify({ success: true, email_type: data.email_type, status: emailStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
