import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HHA_QUESTIONS, HHA_STATUS, type HhaApplication, type HhaAnswerKey } from "../../supabase/functions/_shared/hha";
import { hhaPersonalSchema } from "@/lib/hhaValidation";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

export default function HhaQuestionnaire({ onChangeProgram }: { onChangeProgram: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState({ first_name: "", last_name: "", date_of_birth: "", email: "", address: "", phone: "" });
  const [answers, setAnswers] = useState<Partial<Record<HhaAnswerKey, boolean>>>({});
  const [schedule, setSchedule] = useState<HhaApplication["preferred_schedule"] | "">("");
  const [disclaimer, setDisclaimer] = useState(false);
  const [consent, setConsent] = useState(false);
  const [referral, setReferral] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ qualification_status: string; qualification_notes: string; needs_exam: boolean; needs_consent: boolean; email_sent: boolean } | null>(null);
  const personalValid = hhaPersonalSchema.safeParse(personal).success;
  const answered = HHA_QUESTIONS.every(q => typeof answers[q.key] === "boolean");
  const submit = async () => {
    if (!personalValid || !answered || !schedule || !disclaimer || !consent || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("enrollment-webhook", { body: { ...personal, ...answers, program: "HHA", preferred_schedule: schedule, disclaimer_acknowledged: disclaimer, consent_given: consent, referral_source: referral, event_type: "pre_qualification", source: "website" } });
      if (error || !data?.success) throw new Error("Submission failed");
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast({ title: "Submission not completed", description: "Please try again or call (209) 323 4169.", variant: "destructive" });
    } finally { setBusy(false); }
  };
  return <>
    <SEO title="HHA Priority List | Health Star Academy" description={`120 hour Home Health Aide program. ${HHA_STATUS} Join the priority list.`} canonical="/pre-qualification" />
    <main className="pt-28 md:pt-32 bg-background">
      <section className="section-padding"><div className="container-custom max-w-2xl">
        <Button variant="ghost" onClick={onChangeProgram} className="mb-5"><ArrowLeft className="mr-2 h-4 w-4" /> Choose another program</Button>
        <h1 className="font-heading text-3xl font-bold text-charcoal mb-3">Home Health Aide (HHA), 120 hours</h1>
        <p className="text-purple font-semibold mb-6">{HHA_STATUS}</p>
        {result ? <div className="space-y-6">
          {result.qualification_status === "qualified" ? <>
            <CheckCircle className="h-12 w-12 text-primary" />
            <h2 className="font-heading text-2xl font-bold">You are on the HHA priority list</h2>
            <p className="text-gray-dark leading-relaxed">You are on the HHA priority list. The program is pending CDPH approval and planned for 2027. We will email you when enrollment opens.</p>
          </> : <>
            <AlertTriangle className="h-12 w-12 text-secondary" />
            <h2 className="font-heading text-2xl font-bold">Items to address, {personal.first_name}</h2>
            <p className="text-gray-dark">These requirements must be met before you can qualify for the HHA priority list.</p>
            {HHA_QUESTIONS.flatMap(q => "reason" in q && result.qualification_notes.includes(q.reason) ? [<div key={q.key} className="border border-border rounded-lg p-5"><h3 className="font-semibold mb-2">{q.reason}</h3><p className="text-sm text-gray-dark"><strong>How to resolve: </strong>{q.resolution}</p></div>] : [])}
            <Button onClick={() => { setResult(null); setStep(2); }}>Review answers</Button>
          </>}
          {!result.email_sent && <p className="text-muted-foreground">Your application is saved. The confirmation email could not be delivered. Please contact admissions if you need a copy.</p>}
          {result.needs_consent && <p className="text-gray-dark">Parental consent is required because you are under 18.</p>}
          {result.needs_exam && <p className="text-gray-dark">Without a diploma or GED, an entrance exam score of 70 or above is required.</p>}
        </div> : <>
          <p className="text-sm text-muted-foreground mb-6">Step {step} of 3</p>
          {step === 1 && <><h2 className="font-heading text-2xl font-semibold mb-5">Personal information</h2><div className="space-y-4">
            {([{ key: "first_name", label: "First name", type: "text", max: 100 }, { key: "last_name", label: "Last name", type: "text", max: 100 }, { key: "date_of_birth", label: "Date of birth", type: "date", max: 10 }, { key: "email", label: "Email", type: "email", max: 255 }, { key: "address", label: "Address", type: "text", max: 500 }, { key: "phone", label: "Phone", type: "tel", max: 20 }] as const).map(f => <div key={f.key}><Label htmlFor={`hha-${f.key}`}>{f.label} *</Label><Input className="mt-1 h-12" id={`hha-${f.key}`} type={f.type} maxLength={f.max} required value={personal[f.key]} onChange={e => setPersonal({ ...personal, [f.key]: e.target.value })} /></div>)}
          </div></>}
          {step === 2 && <><h2 className="font-heading text-2xl font-semibold mb-5">Eligibility checklist</h2><div className="space-y-4">{HHA_QUESTIONS.map((q, i) => <fieldset key={q.key} className="border border-border rounded-lg p-5"><legend className="sr-only">{q.label}</legend><p className="font-semibold mb-2">{i + 1}. {q.label}</p>{"note" in q && <p className="text-sm text-muted-foreground mb-3">{q.note}</p>}<RadioGroup value={answers[q.key] === undefined ? "" : answers[q.key] ? "yes" : "no"} onValueChange={v => setAnswers({ ...answers, [q.key]: v === "yes" })} className="flex gap-8">{["yes", "no"].map(v => <div className="flex items-center gap-2" key={v}><RadioGroupItem id={`hha-${q.key}-${v}`} value={v} /><Label htmlFor={`hha-${q.key}-${v}`}>{v === "yes" ? "Yes" : "No"}</Label></div>)}</RadioGroup></fieldset>)}</div></>}
          {step === 3 && <div className="space-y-6"><h2 className="font-heading text-2xl font-semibold">Preferred schedule</h2><RadioGroup value={schedule} onValueChange={v => { if (v === "Daytime" || v === "Weekend" || v === "Either") setSchedule(v); }}>{["Daytime", "Weekend", "Either"].map(v => <div key={v} className="flex gap-3 items-center"><RadioGroupItem value={v} id={`hha-schedule-${v}`} /><Label htmlFor={`hha-schedule-${v}`}>{v}</Label></div>)}</RadioGroup>
            <p className="text-gray-dark">HHA start dates will be announced after CDPH approval. We will contact you first.</p>
            <div className="flex gap-3"><Checkbox id="hha-disclaimer" checked={disclaimer} onCheckedChange={v => setDisclaimer(v === true)} /><Label htmlFor="hha-disclaimer" className="leading-relaxed">I understand that providing false or misleading information on this questionnaire may result in disqualification from the program. All information provided is truthful and accurate to the best of my knowledge. *</Label></div>
            <div><Label htmlFor="hha-referral">How did you hear about us?</Label><Select value={referral} onValueChange={setReferral}><SelectTrigger id="hha-referral" className="mt-1"><SelectValue placeholder="Select one" /></SelectTrigger><SelectContent>{["Google Search", "Facebook", "Instagram", "Friend or Family", "School Counselor", "Job Fair", "Flyer or Poster", "Other"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex gap-3"><Checkbox id="hha-consent" checked={consent} onCheckedChange={v => setConsent(v === true)} /><Label htmlFor="hha-consent" className="leading-relaxed">I consent to Health Star Academy collecting and processing my personal information for enrollment purposes in accordance with the <a href="/privacy-policy" className="text-purple underline">Privacy Policy</a>. A non refundable program application fee is required if you meet eligibility and wish to proceed with full enrollment. *</Label></div>
          </div>}
          <div className="flex justify-between gap-3 mt-8"><Button variant="outline" onClick={() => step === 1 ? onChangeProgram() : setStep(step - 1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>{step < 3 ? <Button disabled={step === 1 ? !personalValid : !answered} onClick={() => { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button disabled={!schedule || !disclaimer || !consent || busy} onClick={submit}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit questionnaire</Button>}</div>
        </>}
      </div></section>
    </main>
  </>;
}
