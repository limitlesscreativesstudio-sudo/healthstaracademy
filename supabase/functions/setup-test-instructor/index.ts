// One-off setup task: provision the instructor test account.
// This function is deleted immediately after it is run.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const EMAIL = "healthstaracademy01@gmail.com";
const PASSWORD = "HSAteach2026!";
const FULL_NAME = "Health Star Academy Instructor";

Deno.serve(async () => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, service);
  const log: string[] = [];

  await admin.from("instructor_invites").upsert({ email: EMAIL }, { onConflict: "email" });

  // Find or create the auth user
  let userId: string | null = null;
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users?.find((u) => (u.email ?? "").toLowerCase() === EMAIL);
  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME },
    });
    log.push(error ? `update failed: ${error.message}` : "existing user password reset");
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME },
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    userId = data.user!.id;
    log.push("user created");
  }

  // Role + profile
  await admin.from("user_roles").upsert({ user_id: userId, role: "instructor" }, { onConflict: "user_id,role" });
  await admin.from("profiles").upsert({ user_id: userId, full_name: FULL_NAME }, { onConflict: "user_id" });

  // Enroll as teacher in every course
  const { data: courses } = await admin.from("courses").select("id, title");
  for (const c of courses ?? []) {
    const { error } = await admin
      .from("enrollments")
      .upsert({ course_id: c.id, user_id: userId, role: "teacher" }, { onConflict: "course_id,user_id" });
    log.push(`${c.title}: ${error ? error.message : "enrolled"}`);
  }

  return new Response(JSON.stringify({ userId, log }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
