import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCohortsByType } from "@/data/cohortSchedule";
import {
  Clock,
  Calendar,
  BookOpen,
  Stethoscope,
  FileCheck,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Laptop,
  MapPin,
  Monitor,
  Wifi,
  GraduationCap,
  ClipboardCheck,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import { WEEKENDS_PAUSED } from "@/data/cohortPause";
import diverseStudentsTraining from "@/assets/diverse-students-training.jpg";
import cnaStudentsGroup from "@/assets/cna-students-group.png";

const ProgramsPage = () => {
  const ENROLLMENT_LINK = "/pre-qualification";

  const programDetails = [
    { label: "Program Length", value: "160 Hours | 6 Weeks", icon: Clock },
    { label: "Theory Hours", value: "60 Hours Online", icon: BookOpen },
    { label: "Clinical Hours", value: "100 Hours In-Person", icon: Stethoscope },
    { label: "Certification", value: "CDPH Approved", icon: FileCheck },
  ];

  const daytimeDates = getCohortsByType("daytime");
  const weekendDates = getCohortsByType("weekend");

  const curriculum = [
    { module: "Module 1", title: "Introductions" },
    { module: "Module 2", title: "Patients' Rights" },
    { module: "Module 3", title: "Interpersonal Skills" },
    { module: "Module 4", title: "Prevention and Management of Catastrophe and Unusual Occurrences" },
    { module: "Module 5", title: "Body Mechanics" },
    { module: "Module 6", title: "Medical and Surgical Asepsis" },
    { module: "Module 7", title: "Weights and Measures" },
    { module: "Module 8", title: "Patient Care Skills" },
    { module: "Module 9", title: "Patient Care Procedures" },
    { module: "Module 10", title: "Vital Signs" },
    { module: "Module 11", title: "Nutrition" },
    { module: "Module 12", title: "Emergency Procedures" },
    { module: "Module 13", title: "Long-Term Care Patient" },
    { module: "Module 14", title: "Rehabilitative Nursing" },
    { module: "Module 15", title: "Observation and Charting" },
    { module: "Module 16", title: "Death and Dying" },
    { module: "Module 17", title: "Abuse" },
  ];

  const requiredCoursework = [
    { course: "Patient Rights & Independence", hours: "4" },
    { course: "Interpersonal Skills", hours: "4" },
    { course: "Prevention & Management of Catastrophe & Unusual Occurrences", hours: "2" },
    { course: "Body Mechanics", hours: "2" },
    { course: "Medical & Surgical Asepsis", hours: "2" },
    { course: "Weights & Measures", hours: "2" },
    { course: "Patient Care Skills", hours: "14" },
    { course: "Patient Care Procedures", hours: "7" },
    { course: "Vital Signs", hours: "4" },
    { course: "Nutrition", hours: "4" },
    { course: "Emergency Procedures", hours: "2" },
    { course: "Long-Term Care Patient", hours: "3" },
    { course: "Rehabilitative Nursing", hours: "3" },
    { course: "Observation & Charting", hours: "3" },
    { course: "Death & Dying", hours: "2" },
    { course: "Abuse", hours: "2" },
  ];

  const gradingScale = [
    { numerical: "100-90", letter: "A", points: "4.0" },
    { numerical: "89-80", letter: "B", points: "3.0" },
    { numerical: "79-70", letter: "C", points: "2.0" },
    { numerical: "69-60", letter: "D", points: "1.0" },
    { numerical: "Below 60", letter: "F", points: "0.0" },
    { numerical: "Incomplete", letter: "I", points: "0.0" },
    { numerical: "Withdraw", letter: "W", points: "0.0" },
  ];

  const graduationRequirements = [
    { requirement: "Attendance", description: "Minimum 90% attendance for all theory and clinical sessions" },
    { requirement: "Theory Completion", description: "Complete all 60 hours of online theory coursework with passing scores" },
    { requirement: "Clinical Hours", description: "Complete all 100 hours of supervised clinical training" },
    { requirement: "Skills Competency", description: "Demonstrate proficiency in all 22 required CNA skills" },
    { requirement: "Final Exam", description: "Pass the final written examination with a score of 75% or higher" },
    { requirement: "Clinical Evaluation", description: "Receive satisfactory evaluation from clinical instructor" },
  ];

  const clinicalLocations = [
    { city: "Stockton", facility: "Meadowood Health and Rehabilitation Center", url: "https://maps.google.com/?q=Meadowood+Health+and+Rehabilitation+Center+Stockton+CA" },
    { city: "Lodi", facility: "Lodi Creek Post-Acute", url: "https://maps.google.com/?q=Lodi+Creek+Post-Acute+Lodi+CA" },
    { city: "Hayward", facility: "Bay Area Skilled Nursing Facility", url: "https://maps.google.com/?q=Hayward+CA" },
  ];

  const [isCourseworkOpen, setIsCourseworkOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);

  const tuitionBreakdown = [
    { item: "Tuition", cost: "$2,184" },
    { item: "Chromebook (Program Use Only)", cost: "Included" },
    { item: "Lab Supplies", cost: "$100" },
    { item: "LiveScan Background Check", cost: "$80" },
    { item: "Textbook", cost: "$45" },
    { item: "Uniform (Scrubs)", cost: "$35" },
    { item: "Workbook", cost: "$30" },
    { item: "Blood Pressure Cuff & Stethoscope", cost: "$25" },
  ];

  const courseStructuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Certified Nursing Assistant Training Program",
    "description": "160-hour CDPH-approved hybrid CNA program with 60 hours online theory and 100 hours clinical training. Complete in 6 weeks.",
    "provider": {
      "@type": "Organization",
      "name": "Health Star Academy",
      "sameAs": "https://www.healthstaracademy.org"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "blended",
      "duration": "P6W",
      "courseWorkload": "PT160H"
    },
    "occupationalCredentialAwarded": "Certified Nursing Assistant (CNA)",
    "educationalCredentialAwarded": "CDPH-approved CNA Certificate",
    "offers": {
      "@type": "Offer",
      "price": "2499",
      "priceCurrency": "USD"
    }
  };

  const programFaqs = [
    { question: "Is Health Star Academy's CNA program approved by the CDPH?", answer: "Yes. Our 160-hour CNA training program is fully approved by the California Department of Public Health (CDPH) and meets all state requirements to qualify graduates to sit for the California CNA state competency exam." },
    { question: "How long does it take to complete the CNA program?", answer: "The program totals 160 hours (60 hours online theory + 100 hours in-person clinicals). Our Daytime track finishes in 6 weeks, and our Weekend track finishes in 8 weekends, giving working adults flexibility." },
    { question: "What is a hybrid CNA program?", answer: "Hybrid means the 60 hours of theory are completed online through our learning portal, while the 100 hours of clinical training are completed in person at our partner facilities in Stockton, Lodi, or Hayward (Bay Area Skilled Nursing)." },
    { question: "How much does the CNA program cost?", answer: "Total tuition is $2,499, which includes textbooks, workbook, uniform, BP cuff/stethoscope, lab supplies, and Chromebook use. A separate $175 application/enrollment fee is required to apply, and a $495 administrative fee applies in specific refund scenarios outlined in our refund policy." },
    { question: "Where are the clinical sites located?", answer: "Clinical training is held at approved partner facilities in Stockton, Lodi, and Hayward (Bay Area Skilled Nursing). Students attend the location assigned to their cohort." },
    { question: "When does the next cohort start?", answer: "We launch new Daytime and Weekend cohorts on a rolling schedule. Visit our Cohorts page for upcoming start dates and application deadlines (applications close 14 days before each cohort start date)." },
    { question: "What are the requirements to enroll?", answer: "Applicants must be 16+, pass a LiveScan background check, provide a physical original government-issued ID, and either hold a high school diploma/GED or pass our entrance exam with 75% or higher." },
    { question: "Will I be qualified to take the California CNA state exam?", answer: "Yes. Upon successful completion of the 160-hour program, you will receive a CDPH-approved certificate of completion that qualifies you to sit for the California CNA state competency exam." }
  ];

  const programFaqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": programFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <SEO
        title="160-Hour CDPH-Approved CNA Program | Health Star Academy"
        description="160-hour CDPH-approved CNA program: 60 hrs online theory + 100 hrs clinicals in Stockton, Lodi & Hayward. Finish in 6 weeks or 8 weekends."
        canonical="/programs"
        keywords="CNA program Stockton, CDPH approved CNA training, 160 hour CNA course, hybrid CNA California, CNA curriculum, CNA clinical training Lodi, weekend CNA program"
        structuredData={[courseStructuredData, programFaqStructuredData, buildBreadcrumbSchema([{ name: "Programs", path: "/programs" }])]}
      />
      <main className="pt-28 md:pt-32">
      {/* Hero Section - 16:9 */}
      <HeroBanner
        imageSrc={cnaStudentsGroup}
        imageAlt="Health Star Academy CNA students in scrubs ready for their healthcare career"
        title={
          <>
            Comprehensive CNA Training<br />
            <span className="text-cyan">Designed for Your Success</span>
          </>
        }
        subtitle="CDPH-approved hybrid program with hands-on clinical experience"
      />

      {/* Program Overview */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Program Overview
              </h2>
              <p className="text-gray-dark mb-5 leading-relaxed">
                Health Star Academy's CDPH-approved Online CNA Program offers the perfect blend of flexibility and hands-on training. Complete online coursework at your own pace while gaining real-world experience at our clinical training sites in Stockton, Lodi, and Hayward—with plans to expand throughout California.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {programDetails.map((detail, index) => (
                  <div
                    key={detail.label}
                    className="bg-neutral-light rounded-lg p-3 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <detail.icon className="h-5 w-5 text-purple mb-1" />
                    <p className="text-xs text-gray-dark">{detail.label}</p>
                    <p className="font-semibold text-charcoal text-sm">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src={diverseStudentsTraining}
                alt="CNA students practicing clinical skills with instructor"
                className="rounded-xl shadow-medium w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Chromebook Highlight */}
      <section className="bg-cyan/10 py-10">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-cyan rounded-full flex items-center justify-center flex-shrink-0">
              <Laptop className="h-10 w-10 text-charcoal" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-2xl text-charcoal mb-2">Chromebook Provided During Program</h3>
              <p className="text-gray-dark max-w-xl">Every student is provided a Chromebook during orientation to access course materials throughout the program. Chromebooks must be returned upon program completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hybrid Education Model */}
      <section className="py-12 bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
              Hybrid Education Model
            </h2>
            <p className="text-gray-dark max-w-3xl mx-auto">
              Our program combines the convenience of <strong>online theory coursework</strong> with hands-on <strong>clinical training at approved local nursing facilities</strong>. This hybrid approach gives you the flexibility to learn at your own pace while gaining real-world experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-background rounded-xl p-5 shadow-soft text-center">
              <div className="w-14 h-14 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Monitor className="h-7 w-7 text-purple" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-charcoal mb-1">Online Theory</h3>
              <p className="text-2xl font-bold text-purple mb-1">60 Hours</p>
              <p className="text-gray-dark text-sm">Complete coursework online at your own pace via Canvas LMS</p>
            </div>
            <div className="bg-background rounded-xl p-5 shadow-soft text-center">
              <div className="w-14 h-14 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="h-7 w-7 text-cyan" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-charcoal mb-1">Clinical Training</h3>
              <p className="text-2xl font-bold text-cyan-deep mb-1">100 Hours</p>
              <p className="text-gray-dark text-sm">Hands-on training at approved skilled nursing facilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* State Exam Prep CTA */}
      <section className="py-12 bg-gradient-to-r from-purple/10 to-cyan/10">
        <div className="container-custom">
          <div className="bg-background rounded-xl p-8 shadow-soft flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-purple rounded-full flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-heading font-bold text-2xl text-charcoal mb-2">
                California State Exam Prep Tool
              </h3>
              <p className="text-gray-dark mb-4">
                Practice with 175+ CDPH-aligned questions. Choose from Study Mode, Timed Exam simulations, or Category Drills to master every topic before your certification exam.
              </p>
              <Button asChild>
                <Link to="/programs/exam-prep">
                  Start Practicing Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Training Locations */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
              Clinical Training Locations
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Complete your 100 hours of clinical training at one of our approved partner facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
            {clinicalLocations.map((location, index) => (
              <a
                key={location.city}
                href={location.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-light rounded-xl p-5 text-center animate-fade-in-up hover:bg-purple/5 hover:shadow-md transition-all group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MapPin className="h-7 w-7 text-purple mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-heading font-semibold text-lg text-charcoal mb-1">{location.city}, CA</h3>
                <p className="text-gray-dark text-sm mb-2">{location.facility}</p>
                <span className="inline-flex items-center gap-1 text-purple text-xs font-medium">
                  <ExternalLink className="h-3 w-3" /> View on Map
                </span>
              </a>
            ))}
          </div>
          <p className="text-center text-gray-dark text-sm italic">
            Additional locations coming soon throughout California
          </p>
        </div>
      </section>

      {/* Schedule & Start Dates */}
      <section className="py-12 bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
              Class Schedule
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Choose the schedule that fits your life — daytime or weekend classes.
            </p>
          </div>

          <div className={`grid grid-cols-1 ${WEEKENDS_PAUSED ? "" : "md:grid-cols-2"} gap-6 max-w-3xl mx-auto mb-10`}>
            <div className="bg-background rounded-xl p-6 shadow-soft text-center">
              <Calendar className="h-10 w-10 text-purple mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
                Daytime Program
              </h3>
              <p className="text-purple font-medium mb-1">Monday – Thursday</p>
              <p className="text-gray-dark text-sm mb-1">Classroom & Clinical: 6:00 AM – 2:30 PM</p>
              <p className="text-charcoal font-semibold">6 Weeks</p>
            </div>
            {!WEEKENDS_PAUSED && (
              <div className="bg-background rounded-xl p-6 shadow-soft text-center border-2 border-cyan">
                <Calendar className="h-10 w-10 text-cyan mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
                  Weekend Program
                </h3>
                <span className="inline-block bg-cyan/20 text-cyan text-xs font-bold px-2 py-0.5 rounded mb-2">NEW</span>
                <p className="text-cyan font-medium mb-1">Saturday & Sunday</p>
                <p className="text-gray-dark text-sm mb-1">Classroom & Clinical: 6:00 AM – 6:00 PM</p>
                <p className="text-charcoal font-semibold mb-3">8 Weekends (16 class days)</p>
                <div className="bg-cyan/5 border border-cyan/20 rounded-lg p-2 text-xs text-muted-foreground">
                  ⚠️ Minimum 15 students required per cohort
                </div>
              </div>
            )}
          </div>

          {/* Daytime Start Dates */}
          <div className="bg-background rounded-xl p-6 shadow-soft max-w-3xl mx-auto mb-6">
            <h3 className="font-heading font-semibold text-xl text-charcoal mb-2 text-center">
              Daytime — Upcoming Class Dates
            </h3>
            <p className="text-gray-dark text-sm text-center mb-4">
              Application deadline: 14 days prior to start date
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {daytimeDates.map((item) => (
                <div
                  key={item.startISO}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple" />
                    <span className="font-medium text-charcoal text-sm">{item.startDate}</span>
                  </div>
                  <span className="text-gray-dark text-xs">
                    Ends: {item.endDate}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-5">
              <Button variant="default" asChild>
                <Link to={ENROLLMENT_LINK}>Enroll for Daytime Class</Link>
              </Button>
            </div>
          </div>

          {/* Weekend Start Dates */}
          {!WEEKENDS_PAUSED && (
            <div className="bg-background rounded-xl p-6 shadow-soft max-w-3xl mx-auto border-2 border-cyan/30">
              <h3 className="font-heading font-semibold text-xl text-charcoal mb-2 text-center">
                Weekend — Upcoming Class Dates
              </h3>
              <p className="text-gray-dark text-sm text-center mb-4">
                Application deadline: 14 days prior to start date
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {weekendDates.map((item) => (
                  <div
                    key={item.startISO}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-cyan" />
                      <span className="font-medium text-charcoal text-sm">{item.startDate}</span>
                    </div>
                    <span className="text-gray-dark text-xs">
                      Ends: {item.endDate}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-5">
                <Button variant="default" className="bg-cyan hover:bg-cyan/90 text-charcoal" asChild>
                  <Link to={ENROLLMENT_LINK}>Enroll for Weekend Class</Link>
                </Button>
              </div>
            </div>
          )}
          {WEEKENDS_PAUSED && (
            <div className="bg-neutral-light rounded-xl p-6 max-w-3xl mx-auto border border-cyan/20 text-center">
              <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">
                Weekend cohorts are paused
              </h3>
              <p className="text-gray-dark text-sm mb-4">
                We're restructuring the Weekend track and folding in our upcoming Psych Tech program. Daytime cohorts continue on schedule.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/pre-qualification">Join the Weekend interest list</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Technical Requirements */}
      <section className="py-12 bg-gradient-to-br from-purple via-magenta to-cyan relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-primary-foreground px-4 py-2 rounded-full font-semibold text-sm mb-4 animate-bounce">
              <Monitor className="h-4 w-4" />
              IMPORTANT - READ BEFORE ENROLLING
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Technical Requirements
            </h2>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto">
              To access our online learning systems, students must meet the following requirements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Hardware Requirements */}
            <div className="bg-background/95 backdrop-blur rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple/10 rounded-full flex items-center justify-center">
                  <Laptop className="h-6 w-6 text-purple" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-charcoal">Hardware Requirements</h3>
              </div>
              <ul className="space-y-3 text-gray-dark text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple mt-0.5 flex-shrink-0" />
                  <span>2 GHz processor or faster</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple mt-0.5 flex-shrink-0" />
                  <span>High-speed internet (minimum 3 Mbps upload/download)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple mt-0.5 flex-shrink-0" />
                  <span>2 GB RAM or greater</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple mt-0.5 flex-shrink-0" />
                  <span>32 GB system storage or larger</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple mt-0.5 flex-shrink-0" />
                  <span>Built-in or external speakers (wired or Bluetooth)</span>
                </li>
              </ul>
            </div>

            {/* Software & Browser */}
            <div className="bg-background/95 backdrop-blur rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan/10 rounded-full flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-cyan" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-charcoal">Software & Browser</h3>
              </div>
              <ul className="space-y-3 text-gray-dark text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" />
                  <span>Any computer manufactured within the last 10 years</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" />
                  <span>Latest version of Google Chrome (required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" />
                  <span>Android and iPhone users can access via Canvas mobile app</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" />
                  <span>Canvas LMS login credentials provided after enrollment</span>
                </li>
              </ul>
            </div>

            {/* Webcam Requirements */}
            <div className="bg-background/95 backdrop-blur rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-magenta/10 rounded-full flex items-center justify-center">
                  <Wifi className="h-6 w-6 text-magenta" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-charcoal">Webcam Requirements</h3>
              </div>
              <ul className="space-y-3 text-gray-dark text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-magenta mt-0.5 flex-shrink-0" />
                  <span>Interface: USB 2.0</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-magenta mt-0.5 flex-shrink-0" />
                  <span>Focus: Automatic or Manual</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-magenta mt-0.5 flex-shrink-0" />
                  <span>Integrated microphone required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-magenta mt-0.5 flex-shrink-0" />
                  <span>Minimum Resolution: HD 720p</span>
                </li>
              </ul>
            </div>

            {/* Class Participation */}
            <div className="bg-background/95 backdrop-blur rounded-xl p-6 shadow-lg border-2 border-cyan">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-cyan" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-charcoal">Class Participation</h3>
              </div>
              <ul className="space-y-3 text-gray-dark text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" />
                  <span><strong>Video must be ON</strong> throughout class time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" />
                  <span>Students must mute and turn off camera during scheduled breaks only</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" />
                  <span>Chromebook provided for use during the program, or use your own device</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Required Coursework */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple/10 text-purple-dark px-4 py-2 rounded-full font-semibold text-sm mb-3">
              <ClipboardCheck className="h-4 w-4" />
              CDPH REQUIRED COURSEWORK
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
              Required Course Content
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              All students must complete the following state-mandated coursework as required by the California Department of Public Health.
            </p>
          </div>

          <Collapsible open={isCourseworkOpen} onOpenChange={setIsCourseworkOpen} className="max-w-3xl mx-auto mb-10">
            <CollapsibleTrigger className="w-full">
              <div className="bg-purple text-primary-foreground px-6 py-4 rounded-t-xl flex justify-between items-center cursor-pointer hover:bg-purple/90 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">View All Course Requirements</span>
                  <span className="bg-purple-dark px-2 py-0.5 rounded text-xs">16 courses • 60 hours</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isCourseworkOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-neutral-light rounded-b-xl overflow-hidden shadow-soft">
                <div className="divide-y divide-border">
                  {requiredCoursework.map((item, index) => (
                    <div
                      key={item.course}
                      className="flex justify-between items-center px-6 py-3 hover:bg-background transition-colors"
                    >
                      <span className="text-charcoal">{item.course}</span>
                      <span className="font-medium text-purple">{item.hours}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-6 py-4 bg-purple/5 font-semibold">
                    <span className="text-charcoal">Total Theory Hours</span>
                    <span className="text-purple">60</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* What You'll Learn - Modules */}
          <Collapsible open={isModulesOpen} onOpenChange={setIsModulesOpen} className="max-w-4xl mx-auto">
            <div className="text-center mb-4">
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-2">
                Curriculum Modules
              </h3>
              <p className="text-gray-dark max-w-2xl mx-auto">
                17 comprehensive modules covering everything you need to become a skilled, confident CNA.
              </p>
            </div>
            <CollapsibleTrigger className="w-full">
              <div className="bg-cyan text-charcoal px-6 py-4 rounded-t-xl flex justify-between items-center cursor-pointer hover:bg-cyan/90 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">View All 17 Modules</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isModulesOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-neutral-light rounded-b-xl overflow-hidden shadow-soft">
                <div className="divide-y divide-border">
                  {curriculum.map((item, index) => (
                    <div
                      key={item.module}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-background transition-colors"
                    >
                      <span className="bg-purple text-primary-foreground px-3 py-1 rounded-lg font-semibold text-sm flex-shrink-0 min-w-[90px] text-center">
                        {item.module}
                      </span>
                      <span className="text-charcoal">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      {/* Graduation Requirements */}
      <section className="py-12 bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan/10 text-cyan-deep-deep px-4 py-2 rounded-full font-semibold text-sm mb-3">
              <GraduationCap className="h-4 w-4" />
              GRADUATION REQUIREMENTS
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
              Requirements to Graduate
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Students must meet all of the following requirements to successfully complete the CNA program and be eligible for state certification.
            </p>
          </div>

          <div className="bg-background rounded-xl overflow-hidden shadow-soft max-w-3xl mx-auto">
            <div className="bg-cyan text-charcoal px-6 py-3">
              <div className="flex gap-4">
                <span className="font-semibold w-1/3">Requirement</span>
                <span className="font-semibold w-2/3">Description</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {graduationRequirements.map((item, index) => (
                <div
                  key={item.requirement}
                  className="flex gap-4 px-6 py-3 hover:bg-neutral-light transition-colors"
                >
                  <span className="font-medium text-purple w-1/3">{item.requirement}</span>
                  <span className="text-gray-dark w-2/3">{item.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grading Scale */}
          <div className="mt-10">
            <h3 className="font-heading text-2xl font-bold text-charcoal mb-4 text-center">
              Grading Scale
            </h3>
            <p className="text-gray-dark text-center max-w-2xl mx-auto mb-6">
              Grades are evaluated separately for classroom, lab, and clinicals. Students must receive an overall course grade of 75% or higher to pass and receive a certificate of completion.
            </p>
            <div className="bg-background rounded-xl overflow-hidden shadow-soft max-w-xl mx-auto">
              <div className="bg-purple text-primary-foreground px-6 py-3">
                <div className="grid grid-cols-3 text-center">
                  <span className="font-semibold">Numerical Grade</span>
                  <span className="font-semibold">Letter Grade</span>
                  <span className="font-semibold">Grade Point</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {gradingScale.map((grade, index) => (
                  <div
                    key={grade.numerical}
                    className="grid grid-cols-3 text-center px-6 py-2 hover:bg-neutral-light transition-colors"
                  >
                    <span className="text-charcoal">{grade.numerical}</span>
                    <span className="font-bold text-purple">{grade.letter}</span>
                    <span className="text-gray-dark">{grade.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tuition & Financial Info */}
      <section className="py-12 bg-neutral-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Tuition Card */}
            <div className="bg-background rounded-xl p-8 shadow-soft">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-cyan/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-cyan" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-2xl text-charcoal">
                    Tuition & Fees
                  </h3>
                  <p className="text-gray-dark">All-inclusive program cost</p>
                </div>
              </div>
              
              <div className="bg-purple/5 rounded-lg p-6 mb-6">
                <p className="text-4xl font-bold text-purple mb-2">$2,499</p>
                <p className="text-gray-dark text-sm">Total Program Cost (Everything Included)</p>
              </div>

              <h4 className="font-semibold text-charcoal mb-4">What's Included:</h4>
              <ul className="space-y-3">
                {tuitionBreakdown.map((item) => (
                  <li key={item.item} className="flex items-center justify-between">
                    <span className="text-gray-dark text-sm">{item.item}</span>
                    <span className="font-medium text-charcoal">{item.cost}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Options */}
            <div className="bg-background rounded-xl p-8 shadow-soft">
              <h3 className="font-heading font-semibold text-2xl text-charcoal mb-6">
                Financial Assistance & Payment Options
              </h3>
              <p className="text-gray-dark mb-6 leading-relaxed">
                We believe financial barriers should never hold you back. We accept payments through Stripe and have partnered with trusted organizations to provide affordable payment solutions.
              </p>

              <div className="space-y-4 mb-8">
                <div className="bg-neutral-light rounded-lg p-4">
                  <h4 className="font-semibold text-charcoal mb-1">Stripe Payment Processing</h4>
                  <p className="text-sm text-gray-dark">Full tuition or payment plans via Klarna, Afterpay, Zip, Apple Pay & more</p>
                </div>
                <div className="bg-neutral-light rounded-lg p-4">
                  <h4 className="font-semibold text-charcoal mb-1">Self-Help Federal Credit Union</h4>
                  <p className="text-sm text-gray-dark">Payment plans, loans, and financing support available</p>
                </div>
                <a 
                  href="https://request.denefits.com/finance-panel?product_code=pc_f28b592da1a9&auth_token=e8e50ae34c588f3dbea2c194d7e8440a" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-cyan/20 to-magenta/20 rounded-lg p-5 hover:from-cyan/30 hover:to-magenta/30 transition-all border-2 border-cyan shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-cyan text-charcoal text-xs font-bold px-2 py-1 rounded">RECOMMENDED</span>
                    <span className="text-xs text-gray-dark">No Credit Check Required</span>
                  </div>
                  <h4 className="font-bold text-charcoal text-lg mb-1">Denefits Financing</h4>
                  <p className="text-sm text-gray-dark mb-2">Guaranteed approvals • Instant pre-approval • Affordable monthly payments</p>
                  <span className="text-purple font-semibold text-sm">Click here to apply now →</span>
                </a>
              </div>

              <p className="text-sm text-gray-dark italic mb-4">
                Have questions? Call our Admissions Team at (209) 323-4169 for personalized guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero section-padding">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Have Questions? Ready to Begin?
              </h2>
              <p className="text-primary-foreground/90 text-lg">
                Our admissions team is here to help you every step of the way.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/programs/admissions">
                  See Full Enrollment Process <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="purple-outline" 
                size="lg" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-charcoal" 
                asChild
              >
                <Link to={ENROLLMENT_LINK}>Enroll Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
};

export default ProgramsPage;
