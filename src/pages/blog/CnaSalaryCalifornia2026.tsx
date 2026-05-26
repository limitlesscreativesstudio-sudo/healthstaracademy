import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, DollarSign } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import graduationCelebration from "@/assets/graduation-celebration.jpg";
import cnaStudentsConfident from "@/assets/cna-students-confident.jpg";

const CnaSalaryCalifornia2026 = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "CNA Salary in California 2026: Pay by City, Setting, and Shift",
    "description": "What CNAs really earn in California in 2026 — hourly pay by city (Stockton, Sacramento, Hayward, Bay Area), shift differentials, and how to boost your wage.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-06-03",
    "dateModified": "2026-06-03",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How much does a CNA make in California in 2026?", "acceptedAnswer": { "@type": "Answer", "text": "California CNAs earn $20–$32 per hour in 2026, with a statewide median near $24/hour. Bay Area facilities pay the highest wages, followed by Sacramento and the Central Valley." }},
      { "@type": "Question", "name": "Which California city pays CNAs the most?", "acceptedAnswer": { "@type": "Answer", "text": "San Francisco, Oakland, and Hayward typically lead at $26–$32/hour. Sacramento averages $22–$26, and Stockton/Lodi averages $20–$24, with hospitals paying more than skilled nursing facilities." }},
      { "@type": "Question", "name": "Do CNAs get shift differentials?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Most California facilities pay an extra $1.50–$4.00/hour for evening (PM), night (NOC), and weekend shifts. NOC shift in a Bay Area hospital can push a new CNA past $30/hour." }},
      { "@type": "Question", "name": "How can a new CNA earn more?", "acceptedAnswer": { "@type": "Answer", "text": "Work NOC or weekend shifts, target hospitals or sub-acute units instead of long-term care, add a phlebotomy or restorative aide endorsement, and join the union when offered — these moves can add $4–$8/hour within the first year." }}
    ]
  };

  return (
    <>
      <SEO
        title="CNA Salary California 2026: Pay by City & Shift | Health Star"
        description="2026 CNA pay rates in California — hourly wages by city (Stockton, Sacramento, Hayward, Bay Area), shift differentials, and how to maximize your income."
        canonical="/blog/cna-salary-california-2026"
        keywords="CNA salary California 2026, CNA pay Bay Area, CNA hourly wage Sacramento, CNA pay Stockton, California CNA hourly rate, CNA shift differential"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-06-03"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "CNA Salary California 2026", path: "/blog/cna-salary-california-2026" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Career & Salary</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                CNA Salary in California 2026: Pay by City, Setting, and Shift
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> June 3, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 9 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={graduationCelebration} alt="California CNA graduates ready for high-paying healthcare jobs" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                <strong>Quick answer:</strong> California CNAs earn between <strong>$20 and $32 per hour</strong> in 2026, with a statewide median near $24/hour. Bay Area hospitals pay the most; Central Valley skilled nursing facilities sit at the lower end — though shift differentials and union jobs can dramatically change the picture.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Average CNA Pay by City (2026)</h2>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border border-border rounded-lg">
                  <thead className="bg-neutral-light">
                    <tr>
                      <th className="text-left p-3 font-semibold text-charcoal">City / Region</th>
                      <th className="text-left p-3 font-semibold text-charcoal">Hourly Range</th>
                      <th className="text-left p-3 font-semibold text-charcoal">Annual (Full-Time)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["San Francisco / Oakland", "$28 – $32", "$58,000 – $66,000"],
                      ["Hayward / Fremont", "$26 – $30", "$54,000 – $62,000"],
                      ["Sacramento", "$22 – $26", "$46,000 – $54,000"],
                      ["Stockton / Lodi", "$20 – $24", "$42,000 – $50,000"],
                      ["Modesto / Tracy", "$20 – $23", "$42,000 – $48,000"],
                    ].map(([city, hr, yr]) => (
                      <tr key={city} className="border-t border-border">
                        <td className="p-3 text-gray-dark">{city}</td>
                        <td className="p-3 text-gray-dark font-medium">{hr}</td>
                        <td className="p-3 text-gray-dark">{yr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Pay by Work Setting</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">Where you work affects pay almost as much as where you live:</p>
              <ul className="space-y-3 mb-6">
                {[
                  ["Hospitals (acute care)", "$26 – $32/hr — highest pay, fastest pace, often union"],
                  ["Sub-acute / rehab", "$24 – $28/hr — strong skill-building, good benefits"],
                  ["Skilled nursing facilities (SNF)", "$20 – $26/hr — most CNA jobs are here; reliable hours"],
                  ["Home health", "$22 – $28/hr — flexible, often per-visit pay"],
                  ["Hospice", "$23 – $27/hr — meaningful work, smaller caseload"],
                ].map(([setting, range]) => (
                  <li key={setting} className="flex items-start gap-3 text-gray-dark">
                    <DollarSign className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span><strong>{setting}:</strong> {range}</span>
                  </li>
                ))}
              </ul>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={cnaStudentsConfident} alt="Confident CNA student ready to earn top pay in California" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Shift Differentials Add Up Fast</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                Most California facilities pay extra for less popular shifts:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li><strong>Evening (PM) shift:</strong> +$1.50–$2.50/hr</li>
                <li><strong>Night (NOC) shift:</strong> +$2.50–$4.00/hr</li>
                <li><strong>Weekend differential:</strong> +$1.00–$3.00/hr</li>
                <li><strong>On-call / float pool:</strong> +$3.00–$6.00/hr</li>
              </ul>
              <p className="text-gray-dark mb-6 leading-relaxed">
                A new CNA hired at Kaiser Hayward on NOC weekends can realistically clear <strong>$34/hr</strong> in their first year — about $70k full-time.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">5 Ways to Earn More as a New CNA</h2>
              <ol className="list-decimal pl-6 space-y-2 text-gray-dark mb-6">
                <li>Target hospital and sub-acute jobs from day one</li>
                <li>Pick up NOC or weekend shifts during the first 90 days</li>
                <li>Add a phlebotomy or EKG endorsement within year one</li>
                <li>Join SEIU-UHW or CNA union facilities when offered</li>
                <li>Stack PRN shifts at a second facility on your days off</li>
              </ol>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Frequently Asked Questions</h2>
              <div className="space-y-5 mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Do California CNAs get benefits?</h3>
                  <p className="text-gray-dark">Most full-time CNA jobs include medical/dental/vision, paid time off, and 401(k) match. Union hospital jobs add pensions, free continuing education, and tuition reimbursement for LVN/RN bridge programs.</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">How fast can I start earning after enrolling?</h3>
                  <p className="text-gray-dark">Our 6-week daytime track gets you ready to test about 7 weeks from your start date. Most graduates are hired and earning within 30 days of passing the state exam.</p>
                </div>
              </div>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Start Earning CNA Wages in 6 Weeks</h3>
                <p className="text-gray-dark mb-6">Health Star Academy's hybrid program puts you on the path to a $40k–$60k+ healthcare career.</p>
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

export default CnaSalaryCalifornia2026;
