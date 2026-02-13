import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  User,
  ShieldCheck,
  CalendarCheck,
  Loader2,
} from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import studentBloodPressure from "@/assets/student-blood-pressure.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const COHORT_OPTIONS_QUERY = async () => {
  const { data, error } = await supabase
    .from("cohorts")
    .select("id, name, start_date, status, capacity")
    .eq("status", "open")
    .order("start_date", { ascending: true });
  if (error) throw error;
  return data;
};

type FormStep = 1 | 2 | 3;

interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
}

interface EligibilityInfo {
  is_over_18: string;
  has_valid_id: string;
  has_ssn: string;
  can_pass_background: string;
  has_health_proof: string;
  has_diploma: string;
  has_transportation: string;
}

const formatCohortDate = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const PreQualificationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"qualified" | "disqualified" | null>(null);

  const [personal, setPersonal] = useState<PersonalInfo>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
  });

  const [eligibility, setEligibility] = useState<EligibilityInfo>({
    is_over_18: "",
    has_valid_id: "",
    has_ssn: "",
    can_pass_background: "",
    has_health_proof: "",
    has_diploma: "",
    has_transportation: "",
  });

  const [selectedCohort, setSelectedCohort] = useState("");

  const { data: cohorts = [] } = useQuery({
    queryKey: ["open-cohorts"],
    queryFn: COHORT_OPTIONS_QUERY,
  });

  const updatePersonal = (field: keyof PersonalInfo, value: string) => {
    setPersonal((prev) => ({ ...prev, [field]: value }));
  };

  const updateEligibility = (field: keyof EligibilityInfo, value: string) => {
    setEligibility((prev) => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = personal.first_name && personal.last_name && personal.email && personal.phone && personal.date_of_birth;

  const isStep2Valid = Object.values(eligibility).every((v) => v === "yes" || v === "no");

  const isStep3Valid = !!selectedCohort;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        first_name: personal.first_name,
        last_name: personal.last_name,
        email: personal.email,
        phone: personal.phone,
        date_of_birth: personal.date_of_birth,
        is_over_18: eligibility.is_over_18 === "yes",
        has_valid_id: eligibility.has_valid_id === "yes",
        has_ssn: eligibility.has_ssn === "yes",
        can_pass_background: eligibility.can_pass_background === "yes",
        has_health_proof: eligibility.has_health_proof === "yes",
        has_diploma: eligibility.has_diploma === "yes",
        has_transportation: eligibility.has_transportation === "yes",
        selected_cohort_date: selectedCohort,
        event_type: "pre_qualification",
        source: "website",
      };

      const { data, error } = await supabase.functions.invoke("enrollment-webhook", {
        body: payload,
      });

      if (error) throw error;

      setSubmitResult(data.qualification_status === "qualified" ? "qualified" : "disqualified");
    } catch (err) {
      console.error("Submission error:", err);
      toast({
        title: "Submission Error",
        description: "Something went wrong. Please try again or call (209) 323-4169.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eligibilityQuestions = [
    { key: "is_over_18" as const, label: "Are you at least 18 years of age?", note: "Parental consent required if younger" },
    { key: "has_valid_id" as const, label: "Do you have a valid government-issued ID?", note: "Driver's License, CA ID, Passport, or Green Card" },
    { key: "has_ssn" as const, label: "Do you have a Social Security Card?", note: "" },
    { key: "can_pass_background" as const, label: "Can you pass a criminal background check (LiveScan)?", note: "" },
    { key: "has_health_proof" as const, label: "Can you provide proof of good health?", note: "Physical exam, PPD TB Test, or Chest X-ray" },
    { key: "has_diploma" as const, label: "Do you have a GED or High School Diploma?", note: "If no, you can qualify by passing an entrance exam (75%+)" },
    { key: "has_transportation" as const, label: "Do you have reliable transportation to clinical sites?", note: "Stockton, Lodi, or Hayward" },
  ];

  // Success / disqualified screens
  if (submitResult === "qualified") {
    return (
      <>
        <SEO title="Pre-Qualification Complete | Health Star Academy" description="You've been pre-qualified for Health Star Academy's CNA program." canonical="/pre-qualification" />
        <main className="pt-28 md:pt-32">
          <section className="section-padding bg-background">
            <div className="container-custom max-w-2xl text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Congratulations, {personal.first_name}! 🎉
              </h1>
              <p className="text-gray-dark text-lg mb-6 leading-relaxed">
                You've been <strong>pre-qualified</strong> for Health Star Academy's CNA program! Check your email at <strong>{personal.email}</strong> for next steps, including your enrollment application and document checklist.
              </p>
              <div className="bg-cyan/10 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-heading font-semibold text-lg text-charcoal mb-3">What happens next:</h3>
                <ol className="space-y-2 text-gray-dark">
                  <li className="flex gap-3"><span className="font-bold text-purple">1.</span> Check your email for your welcome packet</li>
                  <li className="flex gap-3"><span className="font-bold text-purple">2.</span> Complete & sign the enrollment application</li>
                  <li className="flex gap-3"><span className="font-bold text-purple">3.</span> Submit documents & pay the $175 application fee</li>
                  <li className="flex gap-3"><span className="font-bold text-purple">4.</span> Complete your LiveScan background check</li>
                </ol>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" size="lg" onClick={() => navigate("/programs/admissions")}>
                  View Enrollment Steps <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="tel:2093234169">Call (209) 323-4169</a>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (submitResult === "disqualified") {
    return (
      <>
        <SEO title="Pre-Qualification | Health Star Academy" description="Pre-qualification results for Health Star Academy's CNA program." canonical="/pre-qualification" />
        <main className="pt-28 md:pt-32">
          <section className="section-padding bg-background">
            <div className="container-custom max-w-2xl text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-amber-600" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Almost There, {personal.first_name}
              </h1>
              <p className="text-gray-dark text-lg mb-6 leading-relaxed">
                Based on your responses, there are a few items you'll need to address before enrolling. Don't worry — our admissions team is here to help! Check your email at <strong>{personal.email}</strong> for details on what's needed.
              </p>
              <div className="bg-neutral-light rounded-xl p-6 mb-8">
                <p className="text-gray-dark">
                  Have questions or think there's been a mistake? Contact our admissions team — we'll work with you to find a path forward.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" size="lg" asChild>
                  <a href="tel:2093234169">Call (209) 323-4169</a>
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
                  Contact Us
                </Button>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Pre-Qualification Questionnaire | CNA Program | Health Star Academy"
        description="Complete our quick pre-qualification questionnaire to check your eligibility for Health Star Academy's CNA program. Find out in minutes if you're ready to enroll!"
        canonical="/pre-qualification"
        keywords="CNA pre-qualification, nursing assistant eligibility, CNA program requirements, Health Star Academy enrollment"
      />
      <main className="pt-28 md:pt-32">
        <HeroBanner
          imageSrc={studentBloodPressure}
          imageAlt="Student practicing clinical skills at Health Star Academy"
          title={<>Pre-Qualification<br /><span className="text-cyan">Questionnaire</span></>}
          subtitle="Find out if you're ready to enroll — takes less than 2 minutes!"
        />

        {/* Progress indicator */}
        <section className="bg-background border-b border-border">
          <div className="container-custom py-6">
            <div className="flex items-center justify-center gap-2 md:gap-4 max-w-lg mx-auto">
              {[
                { num: 1, label: "Personal Info", icon: User },
                { num: 2, label: "Eligibility", icon: ShieldCheck },
                { num: 3, label: "Cohort", icon: CalendarCheck },
              ].map(({ num, label, icon: Icon }) => (
                <div key={num} className="flex items-center gap-2 md:gap-4">
                  {num > 1 && <div className={`h-0.5 w-6 md:w-10 ${step >= num ? "bg-purple" : "bg-border"}`} />}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= num ? "bg-purple text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {step > num ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${step >= num ? "text-purple" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="section-padding bg-background">
          <div className="container-custom max-w-2xl">

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Personal Information</h2>
                  <p className="text-gray-dark">Tell us a little about yourself to get started.</p>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input id="first_name" value={personal.first_name} onChange={(e) => updatePersonal("first_name", e.target.value)} placeholder="First name" />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input id="last_name" value={personal.last_name} onChange={(e) => updatePersonal("last_name", e.target.value)} placeholder="Last name" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={personal.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" value={personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} placeholder="(209) 555-0123" />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input id="dob" type="date" value={personal.date_of_birth} onChange={(e) => updatePersonal("date_of_birth", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" value={personal.address} onChange={(e) => updatePersonal("address", e.target.value)} placeholder="123 Main St, Stockton, CA" />
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <Button variant="default" size="lg" disabled={!isStep1Valid} onClick={() => setStep(2)}>
                    Next: Eligibility <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Eligibility */}
            {step === 2 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Eligibility Checklist</h2>
                  <p className="text-gray-dark">Answer each question honestly — we'll let you know your eligibility instantly.</p>
                </div>
                <div className="space-y-6">
                  {eligibilityQuestions.map((q) => (
                    <div key={q.key} className="bg-neutral-light rounded-xl p-5">
                      <p className="font-semibold text-charcoal mb-1">{q.label}</p>
                      {q.note && <p className="text-sm text-muted-foreground mb-3">{q.note}</p>}
                      <RadioGroup
                        value={eligibility[q.key]}
                        onValueChange={(val) => updateEligibility(q.key, val)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id={`${q.key}-yes`} />
                          <Label htmlFor={`${q.key}-yes`} className="cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id={`${q.key}-no`} />
                          <Label htmlFor={`${q.key}-no`} className="cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-8">
                  <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                  <Button variant="default" size="lg" disabled={!isStep2Valid} onClick={() => setStep(3)}>
                    Next: Select Cohort <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Cohort selection */}
            {step === 3 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Choose Your Start Date</h2>
                  <p className="text-gray-dark">Select the cohort you'd like to join. New classes start regularly!</p>
                </div>
                <div>
                  <Label htmlFor="cohort">Preferred Cohort Start Date *</Label>
                  <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a start date..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cohorts.map((c) => (
                        <SelectItem key={c.id} value={c.start_date}>
                          {formatCohortDate(c.start_date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-cyan/10 rounded-xl p-5 mt-6">
                  <div className="flex items-start gap-3">
                    <ClipboardCheck className="h-5 w-5 text-cyan flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-dark">
                      By submitting, you confirm the information above is accurate. A <strong>non-refundable $175 application fee</strong> is required if you meet eligibility and wish to proceed with full enrollment.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                  <Button variant="default" size="lg" disabled={!isStep3Valid || isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                    ) : (
                      <>Submit Questionnaire <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default PreQualificationPage;
