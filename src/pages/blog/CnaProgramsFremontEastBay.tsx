import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, MapPin } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import sherwoodBuilding from "@/assets/sherwood-building.jpg";
import cohortStudentFemale2 from "@/assets/cohort-student-female-2.jpg";

const CnaProgramsFremontEastBay = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "CNA Programs in Fremont & the East Bay: Hybrid Options That Work With Your Schedule",
    "description": "Find CDPH-approved CNA programs serving Fremont, Hayward, Union City, and the East Bay. Hybrid online theory plus local clinicals — finish in 6 weeks.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-07-01",
    "dateModified": "2026-07-01",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is there a CNA program in Fremont, California?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Health Star Academy serves Fremont students with a CDPH-approved hybrid CNA program — online theory plus in-person clinicals at our Hayward partner facility, about 15 minutes from downtown Fremont." }},
      { "@type": "Question", "name": "How long are East Bay CNA programs?", "acceptedAnswer": { "@type": "Answer", "text": "Health Star Academy's daytime track completes in 6 weeks. A weekend track is available for working students and takes 8 weekends. Both meet California's 160-hour CDPH requirement." }},
      { "@type": "Question", "name": "Where are East Bay clinicals held?", "acceptedAnswer": { "@type": "Answer", "text": "Our East Bay students complete their 100 clinical hours at our Bay Area skilled nursing partner facility in Hayward, easily accessible from Fremont, Union City, San Leandro, and Oakland." }},
      { "@type": "Question", "name": "How much does CNA training cost in the East Bay?", "acceptedAnswer": { "@type": "Answer", "text": "Health Star Academy's hybrid CNA program is $2,499 plus a $175 application fee. We accept Denefits no-credit-check financing so you can start training immediately and pay over time." }}
    ]
  };

  return (
    <>
      <SEO
        title="CNA Programs Fremont & East Bay | 6-Week Hybrid | Health Star"
        description="CDPH-approved CNA training serving Fremont, Hayward, Union City, San Leandro, and the East Bay. Online theory + local clinicals. Finish in 6 weeks."
        canonical="/blog/cna-programs-fremont-east-bay"
        keywords="CNA programs Fremont, CNA classes East Bay, CNA training Union City, CNA school Hayward, CDPH CNA Fremont, hybrid CNA East Bay"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-07-01"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "CNA Programs Fremont East Bay", path: "/blog/cna-programs-fremont-east-bay" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">East Bay</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                CNA Programs in Fremont & the East Bay: Hybrid Options That Work With Your Schedule
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> July 1, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 8 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={sherwoodBuilding} alt="East Bay CNA clinical training facility in Hayward" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                <strong>Quick answer:</strong> Fremont and East Bay students don't need to commute to San Francisco or San Jose for high-quality CNA training. Health Star Academy's hybrid model delivers <strong>online theory</strong> plus <strong>in-person clinicals in Hayward</strong> — about 15 minutes from downtown Fremont. You can finish in 6 weeks and be working at a Bay Area hospital paying $26–$32/hour shortly after.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Cities We Serve in the East Bay</h2>
              <ul className="grid grid-cols-2 gap-3 mb-6">
                {["Fremont", "Hayward", "Union City", "Newark", "San Leandro", "Oakland", "Castro Valley", "Milpitas"].map((city) => (
                  <li key={city} className="flex items-center gap-2 text-gray-dark">
                    <MapPin className="h-4 w-4 text-teal" />
                    <span>{city}</span>
                  </li>
                ))}
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Why Hybrid Works for East Bay Commuters</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                East Bay traffic is brutal. Traditional in-person CNA programs ask you to commute 5 days a week for 6+ weeks. Our hybrid format means:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>60 hours of theory completed online — anywhere, anytime, on your phone or laptop</li>
                <li>Only the 100 hands-on clinical hours require commute</li>
                <li>Hayward clinical site is freeway-accessible from I-880, I-238, and 92</li>
                <li>Carpool networks form naturally within each cohort</li>
              </ul>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={cohortStudentFemale2} alt="East Bay CNA student succeeding in hybrid program" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">East Bay Hospital and SNF Hiring</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                After certification, East Bay CNAs have one of the strongest job markets in the country. Major employers actively hiring:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>Kaiser Permanente (Fremont, Hayward, San Leandro)</li>
                <li>Stanford Health Care – ValleyCare (Pleasanton)</li>
                <li>Washington Hospital (Fremont)</li>
                <li>St. Rose Hospital (Hayward)</li>
                <li>Eden Medical Center (Castro Valley)</li>
                <li>Brookdale, Carlton Senior Living, Aegis Living (across the East Bay)</li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Tuition & Financing</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Total program cost is $2,499 plus a $175 application fee. East Bay students have full access to <Link to="/programs/admissions" className="text-purple font-semibold hover:underline">Denefits no-credit-check financing</Link>, in-house payment plans, and WIOA workforce grants through Alameda County's AJCC offices.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Frequently Asked Questions</h2>
              <div className="space-y-5 mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Can I attend clinicals on weekends?</h3>
                  <p className="text-gray-dark">Yes — our weekend track holds clinicals on Saturdays and Sundays across 8 weekends, designed for students who work Monday–Friday jobs.</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">How far is Hayward from Fremont?</h3>
                  <p className="text-gray-dark">About 15 minutes via I-880 in non-rush-hour traffic — typically 25–35 minutes during commute hours. Our clinical schedule avoids peak traffic windows.</p>
                </div>
              </div>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Reserve Your East Bay Seat</h3>
                <p className="text-gray-dark mb-6">Cohorts close 14 days before each start date. Pre-qualify in 2 minutes and see if our next East Bay cohort fits your schedule.</p>
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

export default CnaProgramsFremontEastBay;
