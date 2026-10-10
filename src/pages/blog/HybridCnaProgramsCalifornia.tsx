import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import heroDiverseStudents from "@/assets/hero-diverse-students.jpg";
import studentCareTraining from "@/assets/student-care-training.jpg";

const PUBLISHED = "2026-09-21";

const faqs = [
  {
    q: "What is a hybrid CNA program?",
    a: "A hybrid CNA program delivers the required nursing-theory hours online through live, instructor-led classes, while the hands-on clinical hours are completed in person at an approved skilled nursing facility. You learn from home and practice patient care locally.",
  },
  {
    q: "Are hybrid CNA schools approved in California?",
    a: "Yes. California CNA programs are approved by the California Department of Public Health (CDPH). Health Star Academy is a CDPH-approved Nurse Assistant Training Program, so the theory and clinical hours you complete qualify you to sit for the state certification exam.",
  },
  {
    q: "How long does a hybrid CNA program take?",
    a: "Health Star Academy offers a 6-week daytime track and an 8-weekend track. Both cover the full state-required 60 theory hours and 100 clinical hours.",
  },
  {
    q: "How much does a hybrid CNA program cost?",
    a: "Tuition at Health Star Academy is $2,499 total, plus a $175 non-refundable application fee. Denefits financing with no credit check is available.",
  },
  {
    q: "Can I work while taking a hybrid CNA class?",
    a: "Yes. The hybrid format is built for working adults and parents. Theory is online on a set schedule, and clinicals are grouped into blocks at a local site, so most students keep their job while training.",
  },
];

const HybridCnaProgramsCalifornia = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Hybrid CNA Programs in California: How Hybrid CNA Schools Work in 2027",
    description:
      "How hybrid CNA programs work in California: online theory, in-person clinicals, CDPH approval, cost, schedule and how to choose a hybrid CNA school.",
    image: "https://www.healthstaracademy.org/og-image.png",
    author: { "@type": "Organization", name: "Health Star Academy" },
    publisher: { "@type": "Organization", name: "Health Star Academy" },
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Hybrid CNA Program (Certified Nurse Assistant Training)",
    description:
      "CDPH-approved hybrid CNA program with online theory and in-person clinicals in Stockton, Lodi, Hayward and the greater Sacramento and Bay Area regions.",
    provider: { "@type": "EducationalOrganization", name: "Health Star Academy", sameAs: "https://healthstaracademy.org" },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "blended",
      courseWorkload: "P160H",
    },
    offers: { "@type": "Offer", price: "2499", priceCurrency: "USD", category: "Tuition" },
  };

  return (
    <>
      <SEO
        title="Hybrid CNA Training in California | Fast-Track Program"
        description="Explore CDPH-approved hybrid CNA training with online theory, hands-on clinical practice and a 6-week fast-track option."
        canonical="/blog/hybrid-cna-programs-california"
        keywords="hybrid CNA training, hybrid CNA program, hybrid CNA schools, fast-track CNA program, CDPH approved CNA program, state-certified CNA, hands-on clinical training"
        type="article"
        author="Health Star Academy"
        publishedTime={PUBLISHED}
        structuredData={[
          buildBreadcrumbSchema([
            { name: "Blog", path: "/blog" },
            { name: "Hybrid CNA Programs in California", path: "/blog/hybrid-cna-programs-california" },
          ]),
          articleSchema,
          faqSchema,
          courseSchema,
        ]}
      />
      <main className="pt-30">
        <section className="gradient-hero py-16 md:py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <Link to="/blog" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
              </Link>
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Hybrid Programs</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Hybrid CNA Programs in California: How Hybrid CNA Schools Work
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> September 21, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 9 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={heroDiverseStudents} alt="Students in a hybrid CNA program attending live online theory class" className="w-full h-64 md:h-80 object-cover" loading="lazy" />
              </div>

              <div className="bg-neutral-light rounded-xl p-6 mb-10">
                <h2 className="font-heading text-lg font-bold text-charcoal mb-2">Short answer</h2>
                <p className="text-gray-dark leading-relaxed">
                  <strong>Hybrid CNA training</strong> teaches the state-required nursing theory online through live classes and
                  schedules your hands-on clinical hours at a local skilled nursing facility. In California the program must be
                  approved by CDPH. Health Star Academy runs a CDPH-approved hybrid CNA program with clinicals in Stockton, Lodi
                  and Hayward, priced at $2,499 with a 6-week fast-track daytime or 8-weekend track.
                </p>
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">What is a hybrid CNA program?</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                California requires every Certified Nurse Assistant candidate to complete <strong>60 hours of theory</strong> and{" "}
                <strong>100 hours of supervised clinical practice</strong>. A hybrid CNA school splits those two halves. Theory —
                anatomy, infection control, patient rights, communication, documentation — is delivered online in live,
                instructor-led sessions. Clinicals — bathing, transfers, vital signs, feeding, range of motion — must be done in
                person with real residents under a licensed nurse.
              </p>
              <p className="text-gray-dark mb-6 leading-relaxed">
                That is the key difference between a hybrid CNA program and a so-called "online CNA program". No California
                program can be fully online. If a school advertises 100% online certification, it cannot lead to a valid
                California CNA certificate.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Hybrid vs traditional CNA classes</h2>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left text-sm border border-border rounded-lg overflow-hidden">
                  <thead className="bg-neutral-light">
                    <tr>
                      <th className="p-3 font-semibold text-charcoal">&nbsp;</th>
                      <th className="p-3 font-semibold text-charcoal">Hybrid CNA program</th>
                      <th className="p-3 font-semibold text-charcoal">Traditional in-person</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-dark">
                    <tr className="border-t border-border"><td className="p-3 font-medium">Theory</td><td className="p-3">Live online classes from home</td><td className="p-3">On campus, daily</td></tr>
                    <tr className="border-t border-border"><td className="p-3 font-medium">Clinicals</td><td className="p-3">In person at a local facility</td><td className="p-3">In person at a local facility</td></tr>
                    <tr className="border-t border-border"><td className="p-3 font-medium">Commute</td><td className="p-3">Clinical days only</td><td className="p-3">Every class day</td></tr>
                    <tr className="border-t border-border"><td className="p-3 font-medium">Works with a job</td><td className="p-3">Yes — weekend track available</td><td className="p-3">Harder</td></tr>
                    <tr className="border-t border-border"><td className="p-3 font-medium">State exam eligibility</td><td className="p-3">Same, when CDPH-approved</td><td className="p-3">Same</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={studentCareTraining} alt="CNA student practicing patient care during in-person clinical hours" className="w-full h-64 md:h-80 object-cover" loading="lazy" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">How to choose a hybrid CNA school</h2>
              <ul className="space-y-3 mb-6">
                {[
                  "Confirm the program is CDPH-approved — ask for the program number",
                  "Ask where clinicals happen and how far you will drive",
                  "Check whether online classes are live or just recorded videos",
                  "Get the full price in writing: tuition, application fee, scrubs, exam fee",
                  "Ask about the state exam pass rate and career support after graduation",
                  "Look for real hands-on clinical practice",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">What a hybrid CNA program costs in California</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Hybrid CNA programs in California typically run between $1,800 and $3,500 once fees are included. Health Star
                Academy charges <strong>$2,499 total tuition</strong> plus a <strong>$175 non-refundable application fee</strong>,
                and offers <Link to="/programs/admissions" className="text-purple font-semibold hover:underline">Denefits financing</Link>{" "}
                with no credit check so you can start on a payment plan.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Where our hybrid students train</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Theory is online for everyone. Clinicals take place at partner skilled nursing facilities in{" "}
                <strong>Stockton, Lodi and Hayward</strong>, serving students across San Joaquin County, Sacramento, Fremont and
                the greater East Bay. <Link to="/locations" className="text-purple font-semibold hover:underline">See all clinical locations</Link>{" "}
                or compare us with other schools on our{" "}
                <Link to="/compare" className="text-purple font-semibold hover:underline">program comparison page</Link>.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Frequently asked questions</h2>
              <div className="space-y-5 mb-10">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-heading text-lg font-bold text-charcoal mb-1">{f.q}</h3>
                    <p className="text-gray-dark leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Ready for a hybrid CNA program that fits your life?</h3>
                <p className="text-gray-dark mb-6">Online theory. Local clinicals. CDPH-approved. Career support after you certify.</p>
                <Button variant="default" size="lg" asChild>
                  <Link to="/pre-qualification">Pre-Qualify in 2 Minutes <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
};

export default HybridCnaProgramsCalifornia;
