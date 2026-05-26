import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import instructorsHealthcare from "@/assets/instructors-healthcare.jpg";
import studentBloodPressure from "@/assets/student-blood-pressure.jpg";

const CnaVsHhaVsMedTech = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "CNA vs HHA vs Medical Assistant: Which California Healthcare Role Fits You?",
    "description": "Side-by-side comparison of CNA, HHA, and Medical Assistant roles in California — pay, training time, scope of practice, and which leads to the best long-term career.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-06-24",
    "dateModified": "2026-06-24",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is the difference between a CNA and an HHA?", "acceptedAnswer": { "@type": "Answer", "text": "A CNA (Certified Nursing Assistant) is state-certified through CDPH and can work in hospitals, skilled nursing facilities, and home health. An HHA (Home Health Aide) is an add-on certification CNAs can earn — HHA-only certification limits you to in-home care and pays less." }},
      { "@type": "Question", "name": "Is a Medical Assistant the same as a CNA?", "acceptedAnswer": { "@type": "Answer", "text": "No. Medical Assistants work in doctor's offices doing clinical and clerical tasks — injections, blood draws, scheduling. CNAs work bedside in hospitals and nursing facilities providing direct patient care. MAs are not licensed in California; CNAs are state-certified." }},
      { "@type": "Question", "name": "Which has the highest pay: CNA, HHA, or MA?", "acceptedAnswer": { "@type": "Answer", "text": "In California 2026: CNAs $20–$32/hr, Medical Assistants $19–$26/hr, HHAs $18–$24/hr. CNAs typically earn the most because of hospital shift differentials and union jobs." }},
      { "@type": "Question", "name": "Which role is the best stepping stone to RN?", "acceptedAnswer": { "@type": "Answer", "text": "CNA. Most California nursing schools prefer or require prior CNA experience for LVN and ADN programs. CNAs work bedside with nurses — direct exposure to nursing scope of practice." }}
    ]
  };

  return (
    <>
      <SEO
        title="CNA vs HHA vs Medical Assistant in California | Compare"
        description="Side-by-side comparison of CNA, HHA, and Medical Assistant roles — pay, training time, scope of practice, and which path leads to the best California healthcare career."
        canonical="/blog/cna-vs-hha-vs-medical-assistant"
        keywords="CNA vs HHA, CNA vs medical assistant, healthcare career California, which healthcare role pays most, CNA versus MA California, home health aide vs nursing assistant"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-06-24"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "CNA vs HHA vs MA", path: "/blog/cna-vs-hha-vs-medical-assistant" }]),
          articleSchema,
          faqSchema,
        ]}
      />
      <main className="pt-30">
        <section className="gradient-hero py-16 md:py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <Link to="/blog" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
              </Link>
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Career Decisions</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                CNA vs HHA vs Medical Assistant: Which California Healthcare Role Fits You?
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> June 24, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 11 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={instructorsHealthcare} alt="Comparing California healthcare career paths" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                <strong>Quick answer:</strong> CNA offers the best pay, broadest job market, and clearest path to RN. HHA is the fastest and cheapest credential but limited to in-home work. Medical Assistant fits clinic-based, office-hour preferences. In California 2026, CNA is the most career-flexible choice for almost everyone.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Side-by-Side Comparison</h2>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border border-border rounded-lg">
                  <thead className="bg-neutral-light">
                    <tr>
                      <th className="text-left p-3 font-semibold text-charcoal"></th>
                      <th className="text-left p-3 font-semibold text-charcoal">CNA</th>
                      <th className="text-left p-3 font-semibold text-charcoal">HHA</th>
                      <th className="text-left p-3 font-semibold text-charcoal">Medical Assistant</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-dark">
                    {[
                      ["State certified?", "Yes (CDPH)", "Yes (CDPH)", "No (employer cert only)"],
                      ["Training hours", "160 hrs", "120 hrs", "720+ hrs"],
                      ["Time to complete", "6 weeks", "4 weeks", "6–12 months"],
                      ["Tuition range", "$1.2k–$3.5k", "$700–$1.5k", "$4k–$15k"],
                      ["Hourly pay 2026", "$20–$32", "$18–$24", "$19–$26"],
                      ["Where you work", "Hospitals, SNFs, home health", "Patient homes only", "Clinics, doctor's offices"],
                      ["Schedule", "Shift work, weekends", "Daytime, flexible", "Office hours, M–F"],
                      ["Pathway to RN", "Strongest", "Limited", "Indirect"],
                    ].map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        {row.map((cell, j) => (
                          <td key={j} className={`p-3 ${j === 0 ? "font-semibold text-charcoal" : ""}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Choose CNA If You Want…</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>The highest paying entry-level healthcare role</li>
                <li>Job flexibility — hospitals, SNFs, hospice, home health all open</li>
                <li>A real path to LVN, RN, or specialty roles (dialysis, surgical tech)</li>
                <li>Union benefits at Bay Area hospitals (Kaiser, Sutter, Stanford)</li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Choose HHA If You Want…</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>The cheapest, fastest credential</li>
                <li>To work one-on-one in people's homes</li>
                <li>Flexible daytime hours, no shift work</li>
                <li>To care for a family member professionally (IHSS pays HHAs)</li>
              </ul>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={studentBloodPressure} alt="CNA student measuring blood pressure" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Choose Medical Assistant If You Want…</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>Monday–Friday office hours with no weekends</li>
                <li>A mix of clinical and front-desk/billing work</li>
                <li>To work in primary care, specialty clinics, or urgent care</li>
                <li>To eventually move into clinic administration or coding</li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">The Smart Move: Start as a CNA, Add Endorsements Later</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Many of our graduates start as CNAs, then layer on HHA, phlebotomy, EKG, or pursue LVN/RN — using employer tuition reimbursement to pay for further education. The CNA credential opens doors the other two simply don't.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Frequently Asked Questions</h2>
              <div className="space-y-5 mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Can I become a CNA and HHA at the same time?</h3>
                  <p className="text-gray-dark">Yes — CNAs in California can apply for HHA certification through a short bridge add-on. Many home-health agencies prefer dual-certified candidates.</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Do I need a high school diploma for CNA training?</h3>
                  <p className="text-gray-dark">Not in California. You need to be 16+, pass a background check, complete a TB test, and pass our entrance exam at 75% or higher.</p>
                </div>
              </div>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Start With the Strongest Credential</h3>
                <p className="text-gray-dark mb-6">CNA opens the most doors in California healthcare. Find out if our 6-week hybrid program is right for you.</p>
                <Button variant="default" size="lg" asChild>
                  <Link to="/pre-qualification">Check Eligibility <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
};

export default CnaVsHhaVsMedTech;
