import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import cnaStudentsConfident from "@/assets/cna-students-confident.jpg";
import graduationCelebration from "@/assets/graduation-celebration.jpg";

const FastCnaCertificationBayArea = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Fast CNA Certification Program in the Bay Area — Get Certified in 6 Weeks",
    "description": "Looking for a fast CNA certification program in the Bay Area? Health Star Academy offers a 6-week CDPH-approved hybrid CNA program with clinicals in Hayward.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-05-05",
    "dateModified": "2026-05-05",
  };

  return (
    <>
      <SEO
        title="Fast CNA Certification in the Bay Area | 6-Week Hybrid"
        description="Get CNA certified fast in the Bay Area. CDPH-approved 6-week hybrid program with online theory and in-person clinicals at our Hayward partner facility."
        canonical="/blog/fast-cna-certification-bay-area"
        keywords="fast CNA certification Bay Area, accelerated CNA program Bay Area, 6 week CNA course Hayward, CNA training Bay Area, quick CNA certification California, fast track CNA Hayward"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-05-05"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "Fast CNA Certification Bay Area", path: "/blog/fast-cna-certification-bay-area" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Bay Area</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Fast CNA Certification Program in the Bay Area: Certified in 6 Weeks
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> May 5, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 9 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={cnaStudentsConfident} alt="Confident CNA students completing fast certification in the Bay Area" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                Bay Area healthcare facilities are hiring CNAs faster than ever — and you don’t need months of school to qualify. Health Star Academy offers a <strong>fast CNA certification program in the Bay Area</strong> that gets you trained, tested, and working in as little as <strong>6 weeks</strong>. Here’s how it works and why it’s the smartest way to launch a healthcare career in Hayward, Fremont, Oakland, and the surrounding cities.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Why Speed Matters in CNA Certification</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Bay Area skilled nursing facilities, hospitals, and home-health agencies are facing severe staffing shortages. The faster you get certified, the sooner you start earning $22–$30/hour as a CNA. A traditional CNA program can take 3–6 months — our accelerated hybrid format compresses that to 6 weeks without cutting any of the 160 CDPH-required hours.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">What Makes Health Star Academy’s Program Fast?</h2>
              <ul className="space-y-3 mb-6">
                {[
                  "Hybrid model — 60 hours of theory delivered online so you study on your schedule",
                  "100 hours of in-person clinicals at our Bay Area Skilled Nursing Facility in Hayward",
                  "Daytime track completes in just 6 weeks (Mon–Fri)",
                  "Weekend track available for working students (8 weekends)",
                  "Built-in CNA state exam prep with 175 practice questions",
                  "Career support to help you land your first job after passing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Bay Area Clinical Site: Hayward</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Our Bay Area students complete their clinicals at the <strong>Bay Area Skilled Nursing Facility in Hayward</strong>, conveniently located for residents of Fremont, San Leandro, Union City, Oakland, and surrounding cities. You’ll work directly with real patients under licensed-nurse supervision — the same skills the state exam will test.
              </p>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={graduationCelebration} alt="Bay Area CNA graduates celebrating fast certification" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Total Cost & Financing</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Tuition is <strong>$2,499</strong> total, with a <strong>$175 application fee</strong>. We accept <Link to="/programs/admissions" className="text-purple font-semibold hover:underline">Denefits financing with no credit check</Link>, so you can start training immediately and pay over time.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">CDPH-Approved — That Matters</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                California will only let you sit for the state CNA exam if you complete a <strong>CDPH-approved program</strong>. Health Star Academy is fully approved by the California Department of Public Health, so your training counts toward state certification — not just a generic certificate.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Bay Area CNA Job Outlook</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Bay Area CNAs earn some of the highest wages in California, with hourly rates ranging from <strong>$22 to $30+</strong>. Top employers include skilled nursing facilities, Kaiser Permanente, Sutter Health, Stanford Health Care, and home-health agencies — all of whom routinely hire newly certified CNAs.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Enrollment Deadlines</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Each cohort closes enrollment <strong>14 days before the start date</strong>. Seats fill quickly — see our <Link to="/programs/cohorts" className="text-purple font-semibold hover:underline">upcoming cohort calendar</Link> for current dates.
              </p>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Reserve Your Bay Area Seat</h3>
                <p className="text-gray-dark mb-6">Take our 2-minute pre-qualification and see if you can start in the next cohort.</p>
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

export default FastCnaCertificationBayArea;
