import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import graduateMaria from "@/assets/graduate-maria.jpg";
import graduationGroup from "@/assets/graduation-group.jpg";

const CnaToRnCalifornia = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "From CNA to RN in California: Bridge Programs, Costs, and Real Timeline",
    "description": "How to use your CNA certification as a launchpad to LVN and RN in California — bridge programs, costs, timeline, and how to minimize debt.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-07-08",
    "dateModified": "2026-07-08",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How long does it take to go from CNA to RN in California?", "acceptedAnswer": { "@type": "Answer", "text": "Most CNAs become RNs in 2–4 years. The CNA-to-LVN bridge takes 12–18 months, then LVN-to-RN takes another 12–18 months. Direct CNA-to-ADN/BSN programs take 2–4 years depending on prerequisites." }},
      { "@type": "Question", "name": "Does being a CNA help me get into nursing school?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, significantly. Most California ADN and BSN programs award admission points for prior CNA experience. Many require or strongly prefer it. CNA hours also count as healthcare experience on TEAS/HESI applications." }},
      { "@type": "Question", "name": "How much does it cost to go from CNA to RN?", "acceptedAnswer": { "@type": "Answer", "text": "Community college ADN: $5k–$15k total. Private LVN/RN: $25k–$60k. Most working CNAs pay through employer tuition reimbursement, federal loans, and grants — total out-of-pocket often stays under $10k." }},
      { "@type": "Question", "name": "Can I work as a CNA while in RN school?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — and most students do. Hospitals often offer reduced schedules for student CNAs, and many hire student nurses into Patient Care Technician roles with even higher pay during nursing school." }}
    ]
  };

  return (
    <>
      <SEO
        title="From CNA to RN in California: Bridge Programs & Timeline | Health Star"
        description="Complete guide to going from CNA to RN in California — bridge programs, costs, timeline, scholarships, and how working CNAs become RNs with minimal debt."
        canonical="/blog/cna-to-rn-california"
        keywords="CNA to RN California, CNA to LVN bridge, nursing school after CNA, LVN to RN California, ADN program CNA, BSN from CNA, California nursing career path"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-07-08"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "CNA to RN California", path: "/blog/cna-to-rn-california" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Career Advancement</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                From CNA to RN in California: Bridge Programs, Costs & Real Timeline
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> July 8, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 11 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={graduateMaria} alt="Health Star Academy graduate on path to becoming a Registered Nurse" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                <strong>Quick answer:</strong> California CNAs can become RNs in <strong>2–4 years</strong>, often while continuing to work. The two main paths are <strong>CNA → LVN → RN</strong> (best for working students) and <strong>CNA → ADN/BSN</strong> (faster but more academic). Most successful nurses use employer tuition reimbursement and stay below $10k total out-of-pocket cost.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">The Two Main Paths</h2>

              <h3 className="font-heading text-xl font-semibold text-charcoal mb-3 mt-6">Path A: CNA → LVN → RN (Working Student Path)</h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Year 1: Work as CNA, complete LVN prerequisites at community college (anatomy, microbiology, English)",
                  "Year 2: LVN program (12–18 months) — apply to vocational nursing schools",
                  "Year 3: Work as LVN ($30–$40/hr), complete LVN-to-RN bridge (12–18 months)",
                  "Year 4: Pass NCLEX-RN, start as new-grad RN ($45–$70/hr in California)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-heading text-xl font-semibold text-charcoal mb-3 mt-6">Path B: CNA → ADN or BSN (Direct Path)</h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Complete nursing prerequisites at community college (1–2 years)",
                  "Apply to ADN (associate) or BSN (bachelor) nursing program",
                  "Complete program: ADN takes 2 years, BSN takes 4 years",
                  "Pass NCLEX-RN and start as RN",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={graduationGroup} alt="Nursing graduates at the next stage of their career" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Top California ADN Programs Friendly to Working CNAs</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>San Joaquin Delta College (Stockton)</li>
                <li>Modesto Junior College</li>
                <li>Sacramento City College</li>
                <li>Sierra College (Rocklin)</li>
                <li>Chabot College (Hayward)</li>
                <li>Ohlone College (Fremont)</li>
                <li>Merritt College (Oakland)</li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">How to Pay Without Crushing Debt</h2>
              <ol className="list-decimal pl-6 space-y-2 text-gray-dark mb-6">
                <li><strong>Work as a CNA during prereqs</strong> — bank cash for nursing school</li>
                <li><strong>Get hospital employer tuition reimbursement</strong> — Kaiser, Sutter, Stanford, Adventist offer $2k–$10k/year</li>
                <li><strong>Apply for nursing scholarships</strong> — Cal Grant, BSN Scholars, Doctors Medical Center, hospital district scholarships</li>
                <li><strong>Use HRSA Nurse Corps Loan Repayment</strong> — up to 85% of loans forgiven for service in shortage areas</li>
                <li><strong>Pick community college ADN over private BSN</strong> — same RN license, fraction of the cost</li>
              </ol>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">RN Pay in California (2026)</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>New-grad RN: <strong>$45–$60/hr</strong></li>
                <li>Experienced RN (3+ years): <strong>$55–$80/hr</strong></li>
                <li>Bay Area Kaiser/Stanford RN: <strong>$70–$110/hr</strong></li>
                <li>Travel/Per-diem RN: <strong>$80–$150/hr</strong></li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Frequently Asked Questions</h2>
              <div className="space-y-5 mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Is CNA work counted toward RN school requirements?</h3>
                  <p className="text-gray-dark">Most California nursing schools award admission points for documented CNA work hours — often 1 point per 100 hours, up to 5–10 points. It also satisfies "healthcare experience" requirements on most applications.</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Can I skip the CNA step?</h3>
                  <p className="text-gray-dark">You can — but you'll start nursing school with zero patient-care experience, lower admission points, and no income to fund prereqs. CNAs almost always have better outcomes in nursing school.</p>
                </div>
              </div>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Start Your Nursing Journey Here</h3>
                <p className="text-gray-dark mb-6">Health Star Academy's CDPH-approved hybrid CNA program is step one. Many of our graduates go on to LVN and RN — and we cheer them on the whole way.</p>
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

export default CnaToRnCalifornia;
