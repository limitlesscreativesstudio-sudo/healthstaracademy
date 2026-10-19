import { z } from "https://esm.sh/zod@3.23.8";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildHhaSheetRow, qualifyHha, type HhaApplication } from "../_shared/hha.ts";
export const HhaSchema = z.object({
  program: z.literal("HHA"), event_type: z.literal("pre_qualification"),
  first_name: z.string().trim().min(1).max(100), last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255), address: z.string().trim().min(1).max(500),
  phone: z.string().max(20).refine(v => v.replace(/\D/g, "").length === 10),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === v && d <= new Date(); }),
  is_over_16: z.boolean(), is_under_18: z.boolean(), has_valid_id: z.boolean(), has_ssn: z.boolean(),
  can_pass_background: z.boolean(), has_health_proof: z.boolean(), physically_able: z.boolean(), has_diploma: z.boolean(),
  has_transportation: z.boolean(), can_pay_fee: z.boolean(), is_cna: z.boolean(), wants_cna_next: z.boolean(),
  preferred_schedule: z.enum(["Daytime", "Weekend", "Either"]), disclaimer_acknowledged: z.literal(true),
  consent_given: z.literal(true), referral_source: z.string().max(100).default(""),
});
export async function handleHhaSubmission(payload: HhaApplication, db: ReturnType<typeof createClient>, append: (key: string, id: string, rows: string[][], range?: string) => Promise<unknown>, cors: Record<string,string>) {
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });
  const qualification = qualifyHha(payload);
  const row = buildHhaSheetRow(payload, new Date().toISOString());
  const { data: student, error } = await db.from("students").upsert({
    program: "HHA", first_name: payload.first_name, last_name: payload.last_name, email: payload.email.toLowerCase(),
    phone: payload.phone, date_of_birth: payload.date_of_birth, shipping_address: payload.address,
    is_over_16: payload.is_over_16, is_over_18: !payload.is_under_18, has_valid_id: payload.has_valid_id,
    has_ssn: payload.has_ssn, can_pass_background: payload.can_pass_background, has_health_proof: payload.has_health_proof,
    physically_able: payload.physically_able, has_diploma: payload.has_diploma, has_transportation: payload.has_transportation,
    can_pay_fee: payload.can_pay_fee, is_cna: payload.is_cna, wants_cna_next: payload.wants_cna_next,
    preferred_schedule: payload.preferred_schedule, selected_cohort_date: null, orientation_date: null, cohort_id: null,
    qualification_status: qualification.status, qualification_notes: qualification.notes,
    needs_entrance_exam: qualification.needsExam, needs_parent_consent: qualification.needsConsent,
    enrollment_status: qualification.status === "qualified" ? "pre_qualified" : "disqualified", updated_at: new Date().toISOString(),
  }, { onConflict: "email,program" }).select("id").single();
  if (error || !student) { console.error("HHA applicant save failed", error?.code); return json({ error: "Unable to save application" }, 500); }
  let sheetSynced = false;
  const key = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
  if (key) { try { await append(key, "1E5B5-Zi1q7EEZmuDzE6PCQifrH49EZUdEfwFShhPByA", [row], "HHA Responses!A:AD"); sheetSynced = true; } catch { console.error("HHA spreadsheet sync failed"); } }
  await db.from("webhook_logs").insert({ source: "website", event_type: "hha_pre_qualification", payload: { ...payload, sheet_synced: sheetSynced }, processed: sheetSynced, error_message: sheetSynced ? null : "HHA spreadsheet sync failed" });
  const url = Deno.env.get("SUPABASE_URL"); const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let emailSent = false;
  if (url && service) {
    const common = { program: "HHA", student_name: `${payload.first_name} ${payload.last_name}`, qualification_status: qualification.status, qualification_notes: qualification.notes, needs_entrance_exam: qualification.needsExam, needs_parent_consent: qualification.needsConsent };
    const send = async (body: Record<string,unknown>) => { const r = await fetch(`${url}/functions/v1/send-enrollment-email`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${service}` }, body: JSON.stringify(body) }); const data = await r.json(); return r.ok && data.status === "sent"; };
    try { emailSent = await send({ ...common, student_id: student.id, student_email: payload.email, email_type: qualification.status === "qualified" ? "hha_qualified" : "hha_disqualified" }); await send({ ...common, student_id: student.id, student_email: "healthstaracademy01@gmail.com", email_type: "admin_notification", hha_sheet_row: row }); } catch { console.error("HHA email dispatch failed"); }
  }
  return json({ success: true, program: "HHA", sheet_synced: sheetSynced, email_sent: emailSent, qualification_status: qualification.status, qualification_notes: qualification.notes, needs_exam: qualification.needsExam, needs_consent: qualification.needsConsent });
}
