export const HHA_STATUS = "Pending CDPH approval. Planned for 2027.";
export const HHA_QUESTIONS = [
  { key: "is_over_16", label: "Are you at least 16 years old?", note: "CDPH minimum age for HHA", reason: "Minimum age of 16 not met", resolution: "You can apply when you are at least 16 years old." },
  { key: "is_under_18", label: "Are you under 18?", note: "If yes, parental consent is required" },
  { key: "has_valid_id", label: "Do you have a physical government issued ID card?", reason: "Missing physical government issued ID card", resolution: "Obtain your original government issued ID card from the issuing agency." },
  { key: "has_ssn", label: "Do you have a physical Social Security card?", reason: "Missing physical Social Security card", resolution: "Request your original card or a replacement through ssa.gov." },
  { key: "can_pass_background", label: "Are you willing to complete a Live Scan criminal background check (BCIA 8016) and obtain criminal record clearance?", note: "Required by CDPH before any patient contact", reason: "Live Scan and criminal record clearance requirement not met", resolution: "Contact admissions about completing BCIA 8016 and obtaining clearance before patient contact." },
  { key: "has_health_proof", label: "Can you provide a physical exam and TB clearance (PPD skin test or chest X ray) signed by your healthcare provider?", reason: "Missing physical exam and TB clearance", resolution: "Ask your healthcare provider for a signed physical exam and TB clearance." },
  { key: "physically_able", label: "Are you physically able to perform personal care tasks such as lifting, transferring, bathing and standing for long periods?", reason: "Physical ability requirement not met", resolution: "Discuss personal care tasks and any support needs with admissions and your healthcare provider." },
  { key: "has_diploma", label: "Do you have a high school diploma or GED?", note: "Preferred but not required. Without one you must pass an entrance exam with a score of 70 or above." },
  { key: "has_transportation", label: "Do you have reliable transportation to clinical training sites?" },
  { key: "can_pay_fee", label: "Are you able to pay the non refundable program application fee if you qualify?" },
  { key: "is_cna", label: "Are you currently a Certified Nurse Assistant (CNA)?" },
  { key: "wants_cna_next", label: "Are you interested in continuing to the CNA program after HHA?" },
] as const;
export type HhaAnswerKey = typeof HHA_QUESTIONS[number]["key"];
export type HhaAnswers = Record<HhaAnswerKey, boolean>;
export interface HhaApplication extends HhaAnswers {
  program: "HHA"; first_name: string; last_name: string; date_of_birth: string;
  email: string; address: string; phone: string; preferred_schedule: "Daytime" | "Weekend" | "Either";
  disclaimer_acknowledged: boolean; referral_source: string; consent_given: boolean;
}
export function qualifyHha(data: HhaAnswers) {
  const missing = HHA_QUESTIONS.flatMap(q => "reason" in q && !data[q.key] ? [q.reason] : []);
  return { status: missing.length ? "disqualified" as const : "qualified" as const, missing,
    needsConsent: data.is_under_18, needsExam: !data.has_diploma,
    notes: missing.length ? missing.join("; ") : "Qualified for HHA priority list" };
}
export function sanitizeHhaSheet(value: string): string {
  return value.replace(/^[=+\-@\t\r]+/, "").replace(/[\x00-\x1F\x7F]/g, "");
}
export const HHA_SHEET_HEADERS = ["Timestamp", "Name", "Date Of Birth", "Email", "Street Address", "Phone", "At least 16", "Under 18", "Gov ID", "SSN card", "Live Scan", "Physical and TB", "Physically able", "Diploma/GED", "Transportation", "Can pay application fee", "Currently CNA", "Interested in CNA next", "Preferred schedule", "Disclaimer", "How did you hear", "Consent", "Qualified/Disqualified", "Parental Consent Needed", "Entrance Exam Needed", "Missing Disqualifying Items", "All Requirements Met", "30 day sent", "60 day sent", "90 day sent"];
export function buildHhaSheetRow(data: HhaApplication, timestamp: string) {
  const q = qualifyHha(data);
  const yn = (v: boolean) => v ? "Yes" : "No";
  return [timestamp, `${data.first_name} ${data.last_name}`, data.date_of_birth, data.email, data.address, data.phone,
    ...HHA_QUESTIONS.map(question => yn(data[question.key])), data.preferred_schedule, yn(data.disclaimer_acknowledged),
    data.referral_source || "Website", yn(data.consent_given), q.status === "qualified" ? "Qualified" : "Disqualified",
    yn(q.needsConsent), yn(q.needsExam), q.missing.join("; "), yn(q.status === "qualified" && !q.needsConsent && !q.needsExam), "", "", ""].map(sanitizeHhaSheet);
}
