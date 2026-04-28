import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import instructorTeachingMannequin from "@/assets/instructor-teaching-mannequin.jpg";
import studentCareTraining from "@/assets/student-care-training.jpg";

const CdphApprovedCnaSacramento = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "CDPH-Approved CNA Training in Sacramento — Hybrid Program for 2026",
    "description": "Find CDPH-approved CNA training serving the Sacramento area. Online theory plus in-person clinicals in Stockton and Lodi. 6-week and weekend tracks available.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-05-12",
    "dateModified": "2026-05-12",
  };

  return (
    <>
      <SEO
        title="CDPH-Approved CNA Training in Sacramento | Hybrid 6-Week Program"
        description="CDPH-approved CNA training serving Sacramento students. Online theory + in-person clinicals in Stockton and Lodi. State-exam ready in 6 weeks."
        canonical="/blog/cdph-approved-cna-training-sacramento"
        keywords="CDPH approved CNA training Sacramento, CNA classes Sacramento, certified nursing assistant Sacramento, CNA program Sacramento CA, hybrid CNA Sacramento, CNA school Sacramento"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-05-12"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "CDPH-Approved CNA Training Sacramento", path: "/blog/cdph-approved-cna-training-sacramento" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Sacramento</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                CDPH-Approved CNA Training in Sacramento: Your Hybrid Path to Certification
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> May 12, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 9 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={instructorTeachingMannequin} alt="CDPH-approved CNA training instructor demonstrating skills" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                Searching for <strong>CDPH-approved CNA training in Sacramento</strong>? Health Star Academy offers a fully approved hybrid program that lets Sacramento-area students complete classroom theory online and clinicals at nearby skilled nursing facilities in <strong>Stockton and Lodi</strong> — both within easy driving distance of downtown Sacramento, Elk Grove, and Roseville.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Why CDPH Approval Matters</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                The California Department of Public Health (CDPH) is the only agency that can approve CNA training programs in California. If a school is not CDPH-approved, <strong>your hours don’t count</strong> toward state certification and you cannot sit for the state exam. Always verify a program’s CDPH approval before paying tuition. Health Star Academy is fully <a href="https://www.cdph.ca.gov/Programs/CHCQ/LCP/Pages/NATP.aspx" target="_blank" rel="noopener noreferrer" className="text-purple font-semibold hover:underline">CDPH-approved</a>.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">How the Hybrid Format Works for Sacramento Students</h2>
              <ul className="space-y-3 mb-6">
                {[
                  "60 hours of theory completed 100% online — no Sacramento commute",
                  "100 hours of in-person clinicals in Stockton or Lodi (≈45–60 min from Sacramento)",
                  "6-week daytime cohort or 8-weekend track",
                  "Live instructor-led virtual sessions, not pre-recorded videos",
                  "All required textbooks, scrubs, and equipment included",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={studentCareTraining} alt="CNA student practicing patient care during clinical training" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Clinical Sites Near Sacramento</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Sacramento, Elk Grove, Roseville, Galt, and Lodi-area students typically choose our <strong>Lodi clinical site</strong> — a quick drive down Highway 99. Our <strong>Stockton site</strong> is also a popular option. Both facilities give you real patient interaction, which is exactly what the state exam evaluates.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Sacramento CNA Salary & Demand</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                CNAs in the Sacramento metro earn an average of <strong>$21–$26 per hour</strong>, with hospital and union positions paying significantly more. Major employers include Sutter Health, Dignity Health, UC Davis Medical Center, and dozens of skilled nursing facilities throughout Sacramento County.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Tuition, Fees, and Financing</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Total tuition is <strong>$2,499</strong>, plus a one-time <strong>$175 application fee</strong>. We offer <Link to="/programs/admissions" className="text-purple font-semibold hover:underline">Denefits financing</Link> with no credit check, so most Sacramento students pay nothing down to start.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Enrollment Steps for Sacramento Students</h2>
              <ol className="list-decimal pl-6 mb-6 text-gray-dark space-y-2">
                <li>Complete the free 2-minute pre-qualification questionnaire</li>
                <li>Take our entrance exam (75% passing score required)</li>
                <li>Submit your physical, original government-issued ID</li>
                <li>Complete Live Scan and TB testing</li>
                <li>Attend orientation (held the second Friday before each cohort)</li>
              </ol>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Sacramento Students — Get Started Today</h3>
                <p className="text-gray-dark mb-6">CDPH-approved. Online theory. Local clinicals. Career support after graduation.</p>
                <Button variant="default" size="lg" asChild>
                  <Link to="/pre-qualification">Begin Pre-Qualification <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
};

export default CdphApprovedCnaSacramento;
