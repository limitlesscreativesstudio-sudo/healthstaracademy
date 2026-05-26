import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import scholarshipBanner from "@/assets/scholarship-banner.png";
import studentSmilingStethoscope from "@/assets/student-smiling-stethoscope.jpg";

const FinancingCnaTraining = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Financing Your CNA Training: Denefits, Payment Plans, and Free Program Options Explained",
    "description": "Real ways to pay for CNA school in California — Denefits no-credit-check financing, payment plans, WIOA grants, and employer-paid options.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-06-17",
    "dateModified": "2026-06-17",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Can I get CNA training for free in California?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — WIOA workforce grants, some employer-sponsored programs, and certain skilled nursing facilities pay for CNA training in exchange for a 6-12 month work commitment. Eligibility varies by county." }},
      { "@type": "Question", "name": "Does CNA training require a credit check?", "acceptedAnswer": { "@type": "Answer", "text": "At Health Star Academy, no. We accept Denefits financing which uses no-credit-check, soft-pull approval, so your score isn't affected and prior credit issues don't disqualify you." }},
      { "@type": "Question", "name": "How much does CNA training cost in California?", "acceptedAnswer": { "@type": "Answer", "text": "California CDPH-approved CNA programs range from $1,200 to $3,500. Health Star Academy charges $2,499 plus a $175 application fee — total $2,674 — with hybrid online theory included." }},
      { "@type": "Question", "name": "Is FAFSA available for CNA programs?", "acceptedAnswer": { "@type": "Answer", "text": "FAFSA is typically not available for short CNA certificate programs because they fall below federal financial-aid hour thresholds. Use Denefits, WIOA, or employer reimbursement instead." }}
    ]
  };

  return (
    <>
      <SEO
        title="How to Pay for CNA Training in California | Financing Guide"
        description="Every way to pay for CNA school in California — Denefits no-credit-check financing, WIOA grants, payment plans, and employer-paid CNA training options."
        canonical="/blog/financing-cna-training-california"
        keywords="how to pay for CNA training, Denefits CNA financing, free CNA training California, WIOA CNA grant, CNA payment plan, CNA tuition financing no credit check"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-06-17"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "Financing CNA Training", path: "/blog/financing-cna-training-california" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Financing</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Financing Your CNA Training: Denefits, Payment Plans & Free Options
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> June 17, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 9 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={scholarshipBanner} alt="CNA training financing and scholarship options in California" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                <strong>Quick answer:</strong> California students have four real ways to pay for CNA training: <strong>Denefits no-credit-check financing</strong>, <strong>in-house payment plans</strong>, <strong>WIOA workforce grants</strong>, and <strong>employer-paid programs</strong>. Cost is rarely the real reason someone doesn't start — confusion about options is.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Option 1: Denefits Financing (Most Popular)</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                Health Star Academy partners with <strong>Denefits</strong>, a healthcare-focused financing platform built for situations where traditional loans don't fit:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "No credit check — soft pull only, won't affect your score",
                  "Approved in minutes, fully online",
                  "Pay over 6, 12, or 24 months",
                  "Start training immediately — no waiting for funds",
                  "Bad credit, no credit, prior bankruptcies all accepted",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Option 2: In-House Payment Plan</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Prefer to pay us directly? We offer a <strong>2-payment plan</strong> ($175 application fee + 2 installments of $1,249.50) and a <strong>4-payment plan</strong> for working students. No interest, no third-party platform.
              </p>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={studentSmilingStethoscope} alt="CNA student starting career through financing" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Option 3: WIOA Workforce Grants</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                The <strong>Workforce Innovation and Opportunity Act</strong> can cover the full cost of CNA training for qualifying California residents. You typically qualify if you are:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>Currently unemployed or underemployed</li>
                <li>A dislocated worker (recently laid off)</li>
                <li>Receiving CalWORKs, SNAP, or SSI</li>
                <li>A veteran or eligible spouse</li>
                <li>Low-income youth (18–24)</li>
              </ul>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Visit your local <strong>America's Job Center of California</strong> (AJCC) to apply. Approval can take 3–6 weeks — start now if you think you qualify.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Option 4: Employer-Paid CNA Training</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Many skilled nursing facilities in the Central Valley and Bay Area now pay for CNA training in exchange for a <strong>6–12 month work commitment</strong>. You apply, they sponsor your tuition, you train, you work for them after passing. Examples in our market: Brookdale, Genesis HealthCare, Ensign Services, and Avamere.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">What About FAFSA?</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                FAFSA generally isn't available for short certificate programs — CNA courses fall below the federal financial-aid hour threshold. Skip FAFSA, use the four options above.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Frequently Asked Questions</h2>
              <div className="space-y-5 mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Will I be in debt for years?</h3>
                  <p className="text-gray-dark">Almost never. Most students pay off Denefits in 6–12 months, often using their new CNA paycheck. At $24/hour, two shifts a month cover the payment.</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">What if I lose my job after enrolling?</h3>
                  <p className="text-gray-dark">Denefits offers payment-pause options. We also work with students on temporary payment-plan adjustments — talk to us, don't disappear.</p>
                </div>
              </div>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Don't Let Cost Stop You</h3>
                <p className="text-gray-dark mb-6">Get pre-qualified in 2 minutes and we'll walk you through the financing option that fits your situation.</p>
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

export default FinancingCnaTraining;
