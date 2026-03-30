import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCohortsByType, type CohortSchedule } from "@/data/cohortSchedule";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  CalendarIcon,
  Loader2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
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
  referral_source: string;
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

const formatShortDate = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
};

const getOrientationDate = (startDateStr: string) => {
  const d = new Date(startDateStr + "T00:00:00");
  d.setDate(d.getDate() - 10);
  return formatShortDate(startDateStr.slice(0, 4) + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"));
};

const getEndDate = (startDateStr: string) => {
  const d = new Date(startDateStr + "T00:00:00");
  d.setDate(d.getDate() + 42);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
};

const PreQualificationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"qualified" | "disqualified" | null>(null);
  const [needsExam, setNeedsExam] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [qualificationNotes, setQualificationNotes] = useState("");
  const [cohortDateLabel, setCohortDateLabel] = useState("");
  const [programTrack, setProgramTrack] = useState<"daytime" | "weekend" | "">("");

  const daytimeCohortDates = useMemo(() => getCohortsByType("daytime"), []);
  const weekendCohortDates = useMemo(() => getCohortsByType("weekend"), []);

  const [personal, setPersonal] = useState<PersonalInfo>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    referral_source: "",
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
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

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

  const phoneDigits = personal.phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email);
  const isStep1Valid = personal.first_name && personal.last_name && isEmailValid && isPhoneValid && personal.date_of_birth;

  const isStep2Valid = Object.values(eligibility).every((v) => v === "yes" || v === "no");

  const isStep3Valid = !!programTrack && !!selectedCohort && disclaimerAcknowledged && consentGiven;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        first_name: personal.first_name,
        last_name: personal.last_name,
        email: personal.email,
        phone: personal.phone,
        date_of_birth: personal.date_of_birth,
        address: personal.address,
        is_over_18: eligibility.is_over_18 === "yes",
        has_valid_id: eligibility.has_valid_id === "yes",
        has_ssn: eligibility.has_ssn === "yes",
        can_pass_background: eligibility.can_pass_background === "yes",
        has_health_proof: eligibility.has_health_proof === "yes",
        has_diploma: eligibility.has_diploma === "yes",
        has_transportation: eligibility.has_transportation === "yes",
        selected_cohort_date: selectedCohort,
        referral_source: personal.referral_source,
        event_type: "pre_qualification",
        source: "website",
      };

      const { data, error } = await supabase.functions.invoke("enrollment-webhook", {
        body: payload,
      });

      if (error) throw error;

      setNeedsExam(data.needs_exam || false);
      setNeedsConsent(data.needs_consent || false);
      setQualificationNotes(data.qualification_notes || "");
      // Build cohort date label
      const cohort = cohorts.find(c => c.start_date === selectedCohort);
      if (cohort) {
        const startDate = new Date(cohort.start_date + "T00:00:00");
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 42);
        const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        setCohortDateLabel(`${fmt(startDate)} – ${fmt(endDate)}`);
      } else if (selectedCohort) {
        // Weekend cohort - build from schedule data
        const startDate = new Date(selectedCohort + "T00:00:00");
        const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        setCohortDateLabel(fmt(startDate));
      }
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
    { key: "has_valid_id" as const, label: "Do you have a valid, physical government-issued ID?", note: "You must bring the original document — Driver's License, CA ID, Passport, or Green Card (no photocopies)" },
    { key: "has_ssn" as const, label: "Do you have your physical Social Security Card?", note: "You must bring the original card — no photocopies or digital versions accepted" },
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
                🎉 Congratulations, {personal.first_name}!
              </h1>
              <p className="text-gray-dark text-lg mb-6 leading-relaxed">
                We are excited to inform you that you have <strong>QUALIFIED</strong> for enrollment in the Health Star Academy Certified Nursing Assistant (CNA) Program!
              </p>

              {/* Program Details Card */}
              <div className="bg-cyan/10 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-heading font-semibold text-lg text-charcoal mb-3">Your Program Details:</h3>
                <ul className="space-y-2 text-gray-dark">
                  <li><strong>Student Name:</strong> {personal.first_name} {personal.last_name}</li>
                  {cohortDateLabel && <li><strong>Cohort Start Date:</strong> {cohortDateLabel}</li>}
                  <li><strong>Qualification Status:</strong> <span className="text-green-600 font-semibold">QUALIFIED</span></li>
                </ul>
              </div>

              {/* Conditional Notices */}
              {(needsExam || needsConsent) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-3">⚠️ Additional Requirements:</h3>
                  <ul className="space-y-2 text-gray-dark">
                    {needsExam && (
                      <li className="flex gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span><strong>Entrance Exam Required:</strong> Since you don't have a GED/High School Diploma, you'll need to pass our entrance exam with 75% or above before starting the program.</span>
                      </li>
                    )}
                    {needsConsent && (
                      <li className="flex gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span><strong>Parent/Guardian Consent Required:</strong> Since you are under 18, a signed parental consent form must be submitted with your enrollment application.</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-neutral-light rounded-xl p-6 mb-6 text-left">
                <h3 className="font-heading font-semibold text-lg text-charcoal mb-4">Next Steps — Enrollment Process:</h3>
                <ol className="space-y-3 text-gray-dark">
                  <li className="flex gap-3">
                    <span className="font-bold text-purple min-w-[24px]">1.</span>
                    <span><strong>Complete Enrollment Application:</strong> Click the link below to access and submit your enrollment application</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-purple min-w-[24px]">2.</span>
                    <span><strong>Pay Enrollment Fee:</strong> Submit your $175 non-refundable application fee using the payment link below</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-purple min-w-[24px]">3.</span>
                    <span><strong>Submit Required Documents:</strong> We will send you detailed instructions for document submission after receiving your application</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-purple min-w-[24px]">4.</span>
                    <span><strong>Complete LiveScan:</strong> Background check instructions will be provided once documents are received</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-purple min-w-[24px]">5.</span>
                    <span><strong>Attend Orientation:</strong> Mandatory orientation will be scheduled 10 days before your cohort start date</span>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button variant="secondary" size="lg" asChild>
                  <a href="https://drive.google.com/file/d/1Y5RPD8ur2DedLR-4C3FYkF7vUdiEEqX7/view?usp=drive_link" target="_blank" rel="noopener noreferrer">
                    📋 Enrollment Application
                  </a>
                </Button>
                <Button variant="default" size="lg" asChild>
                  <a href="https://buy.stripe.com/dRm28k2j1fwx9Kv36X6sw02" target="_blank" rel="noopener noreferrer">
                    💳 Pay Enrollment Fee ($175)
                  </a>
                </Button>
              </div>

              <div className="bg-purple/5 border border-purple/20 rounded-xl p-4 mb-6">
                <p className="text-gray-dark text-sm">
                  ⏰ <strong>Important Reminder:</strong> Please watch for our next communication with detailed instructions for document submission and further enrollment steps.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Questions? Call <a href="tel:9162088097" className="text-purple hover:underline">(916) 208-8097</a> or email <a href="mailto:info@healthstaracademy.org" className="text-purple hover:underline">info@healthstaracademy.org</a>
              </p>
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
        structuredData={buildBreadcrumbSchema([{ name: "Pre-Qualification", path: "/pre-qualification" }])}
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
                  <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input id="dob" type="date" value={personal.date_of_birth} onChange={(e) => updatePersonal("date_of_birth", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={personal.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="you@example.com" />
                    {personal.email && !isEmailValid && (
                      <p className="text-sm text-destructive mt-1">Please enter a valid email address</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" value={personal.address} onChange={(e) => updatePersonal("address", e.target.value)} placeholder="123 Main St, Stockton, CA" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={personal.phone}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
                        const formatted = raw.length > 6
                          ? `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`
                          : raw.length > 3
                            ? `(${raw.slice(0, 3)}) ${raw.slice(3)}`
                            : raw.length > 0
                              ? `(${raw}`
                              : "";
                        updatePersonal("phone", formatted);
                      }}
                      placeholder="(209) 555-0123"
                      maxLength={14}
                    />
                    {personal.phone && !isPhoneValid && (
                      <p className="text-sm text-destructive mt-1">Please enter a 10-digit phone number</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="referral_source">How Did You Hear About Us?</Label>
                    <Select value={personal.referral_source} onValueChange={(val) => updatePersonal("referral_source", val)}>
                      <SelectTrigger id="referral_source" className="bg-background">
                        <SelectValue placeholder="Select one..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="Google Search">Google Search</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Friend or Family">Friend or Family</SelectItem>
                        <SelectItem value="School Counselor">School Counselor</SelectItem>
                        <SelectItem value="Job Fair">Job Fair</SelectItem>
                        <SelectItem value="Flyer or Poster">Flyer or Poster</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">Choose Your Program Track & Start Date</h2>
                  <p className="text-gray-dark">Select your preferred schedule, then pick a start date.</p>
                </div>

                {/* Document Reminder Banner */}
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-charcoal mb-1">📋 Document Reminder</p>
                      <p className="text-sm text-charcoal">
                        You must have your <strong>physical, original government-issued ID</strong> and <strong>physical Social Security Card</strong> ready — no photocopies or digital versions accepted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Program Track Selection */}
                <div className="mb-6">
                  <Label className="mb-3 block font-semibold">Select Your Program Track *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setProgramTrack("daytime"); setSelectedCohort(""); }}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        programTrack === "daytime"
                          ? "border-purple bg-purple/5"
                          : "border-border bg-background hover:border-purple/40"
                      }`}
                    >
                      <p className="font-semibold text-charcoal">☀️ Daytime Program</p>
                      <p className="text-sm text-muted-foreground">Mon–Thu, 6:00 AM – 2:30 PM</p>
                      <p className="text-xs text-muted-foreground">6 weeks</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setProgramTrack("weekend"); setSelectedCohort(""); }}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        programTrack === "weekend"
                          ? "border-cyan bg-cyan/5"
                          : "border-border bg-background hover:border-cyan/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-charcoal">🌙 Weekend Program</p>
                        <span className="bg-cyan/20 text-cyan text-xs font-bold px-2 py-0.5 rounded">NEW</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Sat & Sun, 6:00 AM – 6:00 PM</p>
                      <p className="text-xs text-muted-foreground">7 weekends (14 class days)</p>
                    </button>
                  </div>
                </div>

                {/* Weekend minimum notice */}
                {programTrack === "weekend" && (
                  <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-4 mb-6">
                    <p className="text-sm text-charcoal">
                      ℹ️ <strong>Weekend cohorts require a minimum of 15 enrolled students</strong> to proceed. If the minimum is not met, students will be moved to the next available weekend cohort.
                    </p>
                  </div>
                )}

                {/* Cohort Date Selection */}
                {programTrack && (
                  <div>
                    <Label className="mb-3 block">Select Your Preferred Start Date *</Label>
                    <RadioGroup value={selectedCohort} onValueChange={setSelectedCohort} className="space-y-3">
                      {programTrack === "daytime" ? (
                        cohorts.map((c) => {
                          const startDate = new Date(c.start_date + "T00:00:00");
                          const endDate = new Date(startDate);
                          endDate.setDate(endDate.getDate() + 42);
                          return (
                            <label
                              key={c.id}
                              htmlFor={`cohort-${c.id}`}
                              className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                                selectedCohort === c.start_date
                                  ? "border-purple bg-purple/5"
                                  : "border-border bg-background hover:border-purple/40"
                              }`}
                            >
                              <RadioGroupItem value={c.start_date} id={`cohort-${c.id}`} />
                              <div>
                                <p className="font-semibold text-charcoal">
                                  {formatShortDate(c.start_date)} — {formatCohortDate(c.start_date)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Ends {getEndDate(c.start_date)} · 6 weeks
                                </p>
                              </div>
                            </label>
                          );
                        })
                      ) : (
                        weekendCohortDates
                          .filter((w) => new Date(w.deadlineISO + "T23:59:59") >= new Date())
                          .map((w) => (
                            <label
                              key={w.startISO}
                              htmlFor={`cohort-weekend-${w.startISO}`}
                              className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                                selectedCohort === w.startISO
                                  ? "border-cyan bg-cyan/5"
                                  : "border-border bg-background hover:border-cyan/40"
                              }`}
                            >
                              <RadioGroupItem value={w.startISO} id={`cohort-weekend-${w.startISO}`} />
                              <div>
                                <p className="font-semibold text-charcoal">
                                  {w.startDate} — {w.endDate}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  7 weekends · Sat & Sun 6 AM – 6 PM
                                </p>
                                <p className="text-xs text-cyan font-medium mt-1">
                                  ⏰ Apply by: {w.deadline}
                                </p>
                              </div>
                            </label>
                          ))
                      )}
                    </RadioGroup>
                  </div>
                )}

                {/* Selected cohort details */}
                {selectedCohort && (
                  <div className="bg-purple/5 border border-purple/20 rounded-xl p-5 mt-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-purple flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-charcoal space-y-2">
                        <p>
                          <strong>Cohort Start:</strong> {formatShortDate(selectedCohort)} &nbsp;|&nbsp; <strong>Cohort End:</strong> {getEndDate(selectedCohort)}
                        </p>
                        <p>
                          ⚠️ <strong>All documents must be submitted by cohort orientation on {(() => {
                            const d = new Date(selectedCohort + "T00:00:00");
                            d.setDate(d.getDate() - 10);
                            const mm = String(d.getMonth() + 1).padStart(2, "0");
                            const dd = String(d.getDate()).padStart(2, "0");
                            const yy = String(d.getFullYear()).slice(-2);
                            return `${mm}/${dd}/${yy}`;
                          })()}.</strong>
                        </p>
                        <p>
                          💳 <strong>Students must select and pay the program tuition ($2,499) by 03/02/26</strong> to secure their seat in this cohort.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimer Acknowledgment (Column O) */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="disclaimer"
                      checked={disclaimerAcknowledged}
                      onCheckedChange={(checked) => setDisclaimerAcknowledged(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="disclaimer" className="text-sm text-charcoal cursor-pointer leading-relaxed">
                      I understand that providing false or misleading information on this questionnaire may result in disqualification from the program. All information provided is truthful and accurate to the best of my knowledge. *
                    </Label>
                  </div>
                </div>

                {/* Consent (Column Q) */}
                <div className="bg-cyan/10 rounded-xl p-5 mt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent"
                      checked={consentGiven}
                      onCheckedChange={(checked) => setConsentGiven(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="consent" className="text-sm text-charcoal cursor-pointer leading-relaxed">
                      I consent to Health Star Academy collecting and processing my personal information for enrollment purposes in accordance with the <a href="/privacy-policy" target="_blank" className="text-purple hover:underline">Privacy Policy</a>. A <strong>non-refundable $175 application fee</strong> is required if you meet eligibility and wish to proceed with full enrollment. *
                    </Label>
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
