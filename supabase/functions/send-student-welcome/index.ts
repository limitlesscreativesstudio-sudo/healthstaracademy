// Sends a branded welcome email to a student with login instructions and a
// password reset link. Service-role authenticated (admin/instructor tooling).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SITE = "https://healthstaracademy.lovable.app";
const LOGIN_URL = `${SITE}/portal/teach/login`;
const RESET_REDIRECT = `${SITE}/portal/teach/update-password`;

function buildHtml(opts: {
  name: string;
  email: string;
  tempPassword?: string | null;
  resetLink: string;
  courseTitle?: string | null;
}) {
  const { name, email, tempPassword, resetLink, courseTitle } = opts;
  return `<!doctype html>
<html><body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#2D2D47;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#7C4DFF,#22B8CF);border-radius:12px;padding:24px;color:#ffffff;">
      <h1 style="margin:0;font-size:22px;">Welcome to Health Star Academy</h1>
      <p style="margin:8px 0 0;font-size:14px;">Your Student Portal account is ready</p>
    </div>

    <p style="font-size:15px;line-height:1.6;">Hi ${name},</p>
    <p style="font-size:15px;line-height:1.6;">
      We're glad to have you with us${courseTitle ? ` in <strong>${courseTitle}</strong>` : ""}.
      Your Student Portal account has been created. From the portal you can view your
      modules, take quizzes, and track your grades and attendance.
    </p>

    <div style="background:#F5F3FF;border-radius:10px;padding:16px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:14px;"><strong>How to sign in</strong></p>
      <p style="margin:0 0 6px;font-size:14px;">1. Go to <a href="${LOGIN_URL}" style="color:#7C4DFF;">${LOGIN_URL}</a></p>
      <p style="margin:0 0 6px;font-size:14px;">2. Email: <strong>${email}</strong></p>
      ${tempPassword ? `<p style="margin:0 0 6px;font-size:14px;">3. Temporary password: <strong>${tempPassword}</strong></p>` : `<p style="margin:0 0 6px;font-size:14px;">3. Use the button below to set your password</p>`}
    </div>

    <p style="text-align:center;margin:28px 0;">
      <a href="${resetLink}" style="background-color:#319795;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;display:inline-block;">Set your password</a>
    </p>
    <p style="font-size:13px;color:#55575d;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${resetLink}" style="color:#7C4DFF;word-break:break-all;">${resetLink}</a>
    </p>
    <p style="font-size:13px;color:#55575d;line-height:1.6;">
      For your security, please set your own password the first time you sign in.
      This link expires in 24 hours &mdash; you can always request a new one from the
      "Forgot password" link on the sign-in page.
    </p>

    <hr style="border:none;border-top:1px solid #e5e5ef;margin:24px 0;" />
    <p style="font-size:13px;color:#55575d;line-height:1.6;">
      Questions? Reply to this email or call us and our team will help you get started.<br />
      &mdash; The Health Star Academy Team
    </p>
  </div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader.includes(service)) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const tempPassword = body?.tempPassword ? String(body.tempPassword) : null;
    if (!email || !email.includes("@")) return json({ error: "Valid email is required" }, 400);

    const admin = createClient(url, service);

    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: RESET_REDIRECT },
    });
    if (linkErr || !link?.properties?.action_link) {
      return json({ error: linkErr?.message ?? "Could not generate reset link" }, 400);
    }

    const userId = link.user?.id;
    let name = email.split("@")[0];
    let courseTitle: string | null = null;
    if (userId) {
      const [{ data: profile }, { data: enrollment }] = await Promise.all([
        admin.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
        admin
          .from("course_enrollments")
          .select("course_id, courses(title)")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle(),
      ]);
      if (profile?.full_name) name = profile.full_name.split(" ")[0];
      courseTitle = (enrollment as any)?.courses?.title ?? null;
    }

    const html = buildHtml({
      name,
      email,
      tempPassword,
      resetLink: link.properties.action_link,
      courseTitle,
    });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.log(`[EMAIL LOG] welcome email for ${email} (no RESEND_API_KEY configured)`);
      return json({ success: false, logged: true, error: "Email provider not configured" }, 200);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Health Star Academy <healthstaracademy01@gmail.com>",
        to: [email],
        reply_to: "healthstaracademy01@gmail.com",
        subject: "Welcome to Health Star Academy — your Student Portal login",
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Resend error", res.status, text);
      return json({ success: false, error: text }, 502);
    }
    const result = await res.json();
    return json({ success: true, id: result.id });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
