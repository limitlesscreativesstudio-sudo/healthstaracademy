import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2, Phone, MessageSquare } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import cnaStudentsConfident from "@/assets/cna-students-confident.jpg";

const PATH = "/blog/programs-2027-hha-and-cna";
const TITLE = "Our Programs for 2027: Start With HHA, Grow Into CNA";
const DESC = "Health Star Academy's career pathway now starts with Home Health Aide (pending CDPH approval, planned for 2027) and continues to our CDPH approved hybrid CNA program.";

const Programs2027HhaAndCna = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESC,
    author: { "@type": "Organization", name: "Health Star Academy" },
    publisher: { "@type": "Organization", name: "Health Star Academy" },
    datePublished: "2026-10-19",
    dateModified: "2026-10-19",
  };

  return (
    <>
      <SEO
        title="Programs for 2027: HHA First, Then CNA | Health Star Academy"
        description={DESC}
        canonical={PATH}
        keywords="Home Health Aide program California, HHA training 2027, CNA program Stockton, HHA to CNA pathway, Health Star Academy programs"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-10-19"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "Programs for 2027", path: PATH }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Programs</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">{TITLE}</h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> October 19, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 5 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={cnaStudentsConfident} alt="Health Star Academy students in training" className="w-full h-auto object-cover" />
              </div>

              <p className="text-lg text-gray-dark leading-relaxed mb-10">
                Health Star Academy is expanding its course list. Our career pathway now starts with Home Health Aide and continues to Certified Nursing Assistant, so you can begin your healthcare career with confidence and keep growing from there.
              </p>

              <section className="rounded-2xl border border-border bg-neutral-light p-6 md:p-8 shadow-soft mb-10">
                <p className="text-sm font-semibold uppercase tracking-wider text-purple mb-2">Step 1</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3">Home Health Aide (HHA), 120 hours</h2>
                <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold mb-5">Pending CDPH approval. Planned for 2027.</span>
                <ul className="space-y-3 mb-6">
                  {[
                    "No prior certification needed.",
                    "Minimum age 16, with parental consent required under 18.",
                    "59 hours of classroom theory and 61 hours of supervised clinical practice.",
                    "Taught by Registered Nurses at approved home health, skilled nursing, or hospital sites, with an emphasis on care in the home.",
                    "After you complete the program and pass the program exam, Health Star Academy submits graduates to CDPH for the Home Health Aide certificate.",
                    "No start date or price has been set yet.",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 text-gray-dark"><CheckCircle2 className="h-5 w-5 text-cyan shrink-0 mt-0.5" />{t}</li>
                  ))}
                </ul>
                <Button size="lg" asChild>
                  <Link to="/pre-qualification?program=hha">Join the HHA priority list <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </section>

              <section className="rounded-2xl border border-border bg-neutral-light p-6 md:p-8 shadow-soft mb-10">
                <p className="text-sm font-semibold uppercase tracking-wider text-purple mb-2">Step 2</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3">Certified Nursing Assistant (CNA)</h2>
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-5">CDPH approved hybrid program</span>
                <ul className="space-y-3 mb-6">
                  {[
                    "Online theory plus in person clinicals.",
                    "Finish in as little as 6 weeks (Daytime) or 8 weekends.",
                    "Next daytime cohort starts January 4, 2027.",
                    "Apply by December 21, 2026 at 11:59 PM.",
                    "Financing available through Denefits.",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 text-gray-dark"><CheckCircle2 className="h-5 w-5 text-cyan shrink-0 mt-0.5" />{t}</li>
                  ))}
                </ul>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/pre-qualification?program=cna">Start your CNA application <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </section>

              <section className="mb-10 border-l-4 border-cyan pl-5">
                <h2 className="font-heading text-xl font-bold text-charcoal mb-2">A note on certification</h2>
                <p className="text-gray-dark">
                  HHA certification does not by itself grant CNA certification. CNA is a separate program, and many HHA graduates take it next.
                </p>
              </section>

              <section className="rounded-2xl gradient-hero p-6 md:p-8 text-center">
                <h2 className="font-heading text-2xl font-bold text-primary-foreground mb-3">Questions? We are here to help.</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center text-primary-foreground">
                  <a href="tel:+12093234169" className="inline-flex items-center justify-center gap-2 font-semibold hover:underline"><Phone className="h-5 w-5" /> Call (209) 323 4169</a>
                  <a href="sms:+19162088097" className="inline-flex items-center justify-center gap-2 font-semibold hover:underline"><MessageSquare className="h-5 w-5" /> Text (916) 208 8097</a>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
    </>
  );
};

export default Programs2027HhaAndCna;
