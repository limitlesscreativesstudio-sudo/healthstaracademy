import { z } from "zod";
export const hhaPersonalSchema = z.object({
  first_name: z.string().trim().min(1).max(100), last_name: z.string().trim().min(1).max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === v && d <= new Date(); }, "Enter a valid date of birth"),
  email: z.string().trim().email().max(255), address: z.string().trim().min(1).max(500),
  phone: z.string().max(20).refine(v => v.replace(/\D/g, "").length === 10, "Enter a 10 digit phone number"),
});
