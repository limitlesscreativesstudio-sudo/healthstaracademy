import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import stocktonFacility from "@/assets/stockton-facility.jpg";
import studentsBpTraining from "@/assets/students-bp-training.jpg";

const HybridCnaClassesStockton = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Hybrid CNA Classes Near Stockton, CA — Online Theory + Local Clinicals",
    "description": "Hybrid CNA classes near Stockton, CA at Health Star Academy. Online theory and in-person clinicals in Stockton. CDPH-approved 6-week and weekend options.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-05-19",
    "dateModified": "2026-05-19",
  };

  return (
    <>
      <SEO
        title="Hybrid CNA Classes Near Stockton, CA | Online + In-Person"
        description="Hybrid CNA classes near Stockton, CA. CDPH-approved program with online theory and in-person clinicals at our Stockton facility. 6-week and weekend tracks."
        canonical="/blog/hybrid-cna-classes-near-stockton"
        keywords="hybrid CNA classes Stockton, CNA classes near Stockton CA, online CNA Stockton, CNA program Stockton, certified nursing assistant Stockton, hybrid CNA training California"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-05-19"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "Hybrid CNA Classes Stockton", path: "/blog/hybrid-cna-classes-near-stockton" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Stockton</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Hybrid CNA Classes Near Stockton, CA: Study Online, Clinicals Local
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> May 19, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 8 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={stocktonFacility} alt="Health Star Academy Stockton facility for hybrid CNA classes" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                Looking for <strong>hybrid CNA classes near Stockton, CA</strong>? Health Star Academy is Stockton’s home for CDPH-approved hybrid CNA training. Complete your 60 hours of theory online and your 100 hours of clinicals at our partner skilled nursing facility right here in Stockton — no long commutes, no rigid daytime-only schedules.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">What “Hybrid” Actually Means</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                A hybrid CNA program splits your training between two formats: theory (lectures, reading, quizzes) is delivered online through live virtual classes, while clinicals (hands-on patient care) happen in person at an approved skilled nursing facility. You get the convenience of remote learning <em>and</em> the real-world experience the state exam demands.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Why Stockton Students Choose Hybrid</h2>
              <ul className="space-y-3 mb-6">
                {[
                  "Save time and gas — no daily commute for theory days",
                  "Keep working while you train — perfect for parents and full-time employees",
                  "Live, instructor-led online classes (not boring pre-recorded videos)",
                  "Local Stockton clinical site with real patients",
                  "CDPH-approved — your hours qualify you for the state exam",
                  "6-week daytime track or 8-weekend track",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={studentsBpTraining} alt="Stockton CNA students practicing blood pressure measurement" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Our Stockton Clinical Site</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Stockton students complete clinicals at our partner skilled nursing facility right in town. You’ll work alongside licensed nurses and care for real patients — exactly the environment the California state CNA exam evaluates. <Link to="/locations" className="text-purple font-semibold hover:underline">View all clinical locations</Link>.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Schedule Options</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Choose the schedule that fits your life:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-dark space-y-2">
                <li><strong>Daytime track:</strong> 6 weeks, Monday–Friday — fastest path to certification</li>
                <li><strong>Weekend track:</strong> 8 weekends — designed for working students and parents</li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Tuition & Financing</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Program tuition is <strong>$2,499</strong>, with a <strong>$175 application fee</strong>. We accept <Link to="/programs/admissions" className="text-purple font-semibold hover:underline">Denefits financing</Link> with no credit check — most Stockton students start without paying everything upfront.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">CNA Job Market in Stockton</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Stockton CNAs earn an average of <strong>$20–$24 per hour</strong>, with skilled nursing facilities, hospitals (St. Joseph’s, Dameron, Adventist), and home-health agencies actively hiring throughout San Joaquin County. Many of our graduates land jobs at the very facilities where they completed clinicals.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">How to Enroll</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Enrollment closes <strong>14 days before each cohort start</strong>. Complete our free pre-qualification, take the entrance exam (75% to pass), submit your physical, original government-issued ID, and attend orientation.
              </p>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Stockton Students — Start This Cohort</h3>
                <p className="text-gray-dark mb-6">Hybrid format. Local clinicals. Real patients. CDPH-approved.</p>
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

export default HybridCnaClassesStockton;
