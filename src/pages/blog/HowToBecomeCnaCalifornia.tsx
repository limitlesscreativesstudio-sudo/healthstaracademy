import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import diverseStudentsTraining from "@/assets/diverse-students-training.jpg";
import studentsVitalsPractice from "@/assets/students-vitals-practice.jpg";

const HowToBecomeCnaCalifornia = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Become a CNA in California: Step-by-Step Certification Guide (2026)",
    "description": "Complete guide to becoming a Certified Nursing Assistant in California. Requirements, training hours, CDPH approval, state exam, and how to get certified fast.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-04-28",
    "dateModified": "2026-04-28",
  };

  return (
    <>
      <SEO
        title="How to Become a CNA in California: Step-by-Step Guide (2026)"
        description="How to become a CNA in California: CDPH requirements, 160 training hours, state exam steps, costs, and timeline to get certified fast."
        canonical="/blog/how-to-become-cna-in-california"
        keywords="how to become a CNA in California, CNA certification California, CDPH CNA requirements, California CNA state exam, CNA training California, become a certified nursing assistant California"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-04-28"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "How to Become a CNA in California", path: "/blog/how-to-become-cna-in-california" }]),
          articleSchema,
        ]}
      />
      <main className="pt-30">
        <section className="gradient-hero py-16 md:py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <Link to="/blog" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
              </Link>
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Career Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                How to Become a CNA in California: A Step-by-Step Certification Guide
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> April 28, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 11 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={diverseStudentsTraining} alt="Diverse CNA students training in California" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                If you’ve been searching for <strong>how to become a CNA in California</strong>, this guide walks you through every step — from choosing a CDPH-approved training program to passing the state exam and landing your first job. Becoming a Certified Nursing Assistant is one of the fastest, most affordable ways to enter the healthcare field in California, and demand has never been higher.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">What Is a CNA?</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                A Certified Nursing Assistant (CNA) provides hands-on care to patients in skilled nursing facilities, hospitals, hospices, and home-health settings. CNAs work under the supervision of licensed nurses and are often the first point of contact for residents. In California, CNAs are regulated by the <strong>California Department of Public Health (CDPH)</strong>.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">California CNA Requirements at a Glance</h2>
              <ul className="space-y-3 mb-6">
                {[
                  "Be at least 16 years old (most employers prefer 18+)",
                  "Pass a criminal background check and Live Scan fingerprinting",
                  "Provide a valid government-issued photo ID and Social Security number",
                  "Complete a CDPH-approved CNA training program (minimum 160 hours: 60 theory + 100 clinical)",
                  "Pass the California state competency exam (written + skills)",
                  "Submit health screening (TB test, immunizations, physical exam)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Step 1: Choose a CDPH-Approved CNA Program</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Only training completed at a <strong>CDPH-approved program</strong> qualifies you to sit for the California state exam. At <Link to="/programs" className="text-purple font-semibold hover:underline">Health Star Academy</Link>, our hybrid CNA program meets all 160 required hours and is fully CDPH-approved. You complete theory online and clinicals at our partner skilled nursing facilities in <strong>Stockton, Lodi, and Hayward</strong>.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Step 2: Complete Your 160 Hours of Training</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                California requires a minimum of 60 hours of classroom instruction and 100 hours of supervised clinical training. Topics include patient rights, infection control, vital signs, range of motion, nutrition, body mechanics, communication, and emergency procedures. Health Star Academy offers a <strong>6-week daytime track</strong> and an <strong>8-weekend track</strong> so you can earn certification without quitting your job.
              </p>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={studentsVitalsPractice} alt="CNA students practicing vital signs in clinical training" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Step 3: Apply for the California State Exam</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Once you complete training, your school submits your application to CDPH. You’ll receive a packet from the state’s testing vendor with instructions on scheduling your exam. The state exam has two parts:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-dark space-y-2">
                <li><strong>Written test (or oral version)</strong> — 75 multiple-choice questions covering CNA knowledge.</li>
                <li><strong>Skills evaluation</strong> — 5 randomly selected hands-on skills, including handwashing, which is required.</li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Step 4: Pass Your Background Check & Live Scan</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                California requires every CNA candidate to pass a <strong>Live Scan fingerprint and criminal background check</strong>. This is processed through the Department of Justice and FBI. Most disqualifying offenses involve serious felonies; minor or older offenses may still allow certification with proper disclosure.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Step 5: Get Listed on the California CNA Registry</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                After passing both portions of the exam and clearing your background check, your name is added to the <strong>California Nurse Assistant Registry</strong>. You’ll receive your CNA certificate by mail and are eligible to work immediately. Certifications must be renewed every two years with proof of 48 hours of paid CNA work and 24 hours of continuing education.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">How Long Does It Take to Become a CNA in California?</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Most students complete training in <strong>4 to 12 weeks</strong>, depending on the schedule. Health Star Academy’s daytime track finishes in 6 weeks; the weekend track takes 8 weekends. Add 2–4 weeks for state exam scheduling and certificate processing.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">How Much Does CNA Training Cost in California?</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Tuition ranges from $1,800 to $3,500 statewide. Health Star Academy’s total program is <strong>$2,499</strong>, plus a one-time <strong>$175 application fee</strong>. We also offer <Link to="/programs/admissions" className="text-purple font-semibold hover:underline">Denefits financing</Link> with no credit check so you can start without paying everything upfront.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">CNA Salary & Job Outlook in California</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                California CNAs earn an average of <strong>$22–$28 per hour</strong>, with higher rates in the Bay Area and Sacramento metro. The Bureau of Labor Statistics projects 4% growth for nursing assistants nationwide through 2032 — California’s aging population means even faster local demand.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Ready to Start? Enroll With Health Star Academy</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                We make becoming a CNA in California simple. Our hybrid CDPH-approved program lets you study online and complete clinicals locally, with career support to help you land your first job after certification.
              </p>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Begin Your CNA Journey Today</h3>
                <p className="text-gray-dark mb-6">Take our free 2-minute pre-qualification to see if you're eligible to enroll.</p>
                <Button variant="default" size="lg" asChild>
                  <Link to="/pre-qualification">Start Pre-Qualification <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
};

export default HowToBecomeCnaCalifornia;
