import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import studentCareTraining from "@/assets/student-care-training.jpg";
import diverseStudentsTraining from "@/assets/diverse-students-training.jpg";

const DayInTheLifeOfCna = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "A Day in the Life of a CNA: What 8 and 12-Hour Shifts Really Look Like",
    "description": "Hour-by-hour breakdown of a real CNA shift in a California skilled nursing facility and hospital — what tasks, breaks, and patient loads to expect.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-06-10",
    "dateModified": "2026-06-10",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How many patients does a CNA care for per shift?", "acceptedAnswer": { "@type": "Answer", "text": "In a California skilled nursing facility, CNAs typically care for 8–12 residents on day shift and 12–15 on PM/NOC shifts. Hospital CNAs usually have 6–10 patients per shift." }},
      { "@type": "Question", "name": "How long is a typical CNA shift?", "acceptedAnswer": { "@type": "Answer", "text": "CNA shifts are usually 8 hours in skilled nursing (3 shifts/day) or 12 hours in hospitals (2 shifts/day). 12-hour shifts mean a 3-day work week, which most CNAs prefer." }},
      { "@type": "Question", "name": "Is being a CNA physically hard?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — CNAs walk 4–7 miles per shift, lift and reposition patients, and stand most of the day. Proper body mechanics and team-lift culture make it sustainable as a long-term career." }}
    ]
  };

  return (
    <>
      <SEO
        title="A Day in the Life of a CNA: 8 & 12-Hour Shifts | Health Star"
        description="What a real California CNA shift looks like hour by hour — patient loads, breaks, charting, and what to expect on day, PM, and NOC shifts."
        canonical="/blog/day-in-the-life-of-a-cna"
        keywords="day in the life CNA, CNA shift schedule, what does a CNA do, CNA 12 hour shift, CNA day shift, CNA NOC shift, California CNA daily tasks"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-06-10"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "Day in the Life of a CNA", path: "/blog/day-in-the-life-of-a-cna" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Career Insight</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                A Day in the Life of a CNA: What 8 and 12-Hour Shifts Really Look Like
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> June 10, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 10 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={studentCareTraining} alt="CNA providing patient care during a typical shift" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                <strong>Quick answer:</strong> A typical California CNA day shift is 8–12 hours, caring for 6–15 patients depending on the setting. The day flows through three predictable rhythms: <strong>morning care + breakfast</strong>, <strong>mid-day rounds + lunch</strong>, and <strong>charting + handoff</strong>.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Day Shift in a Skilled Nursing Facility (6:45 AM – 3:15 PM)</h2>
              <ul className="space-y-3 mb-6 text-gray-dark">
                <li><strong>6:45 AM</strong> — Clock in. Receive handoff report from NOC shift CNA — overnight changes, fall risks, new admits.</li>
                <li><strong>7:00 AM</strong> — Round on assigned residents. Vitals, toileting, weights, and quick safety check on each room.</li>
                <li><strong>7:30 AM</strong> — Morning care begins — bathing, dressing, oral care, transfers from bed to chair.</li>
                <li><strong>8:30 AM</strong> — Breakfast assistance in dining room. Document intake and any swallowing concerns.</li>
                <li><strong>10:00 AM</strong> — Second round: toileting, repositioning bed-bound residents, snacks, ambulation.</li>
                <li><strong>11:30 AM</strong> — Pre-lunch ADLs, hand hygiene, set residents up for lunch.</li>
                <li><strong>12:00 PM</strong> — Lunch service + feeding assistance.</li>
                <li><strong>12:45 PM</strong> — Lunch break (30 min).</li>
                <li><strong>1:30 PM</strong> — Afternoon round, charting, restorative ambulation, fresh linens.</li>
                <li><strong>2:30 PM</strong> — Final vitals, repositioning, prepare for PM shift handoff.</li>
                <li><strong>3:00 PM</strong> — Verbal report to oncoming shift, finish electronic charting.</li>
                <li><strong>3:15 PM</strong> — Clock out.</li>
              </ul>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={diverseStudentsTraining} alt="Diverse CNA team supporting each other during shift" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">12-Hour Hospital Shift (6:45 AM – 7:15 PM)</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                Hospital CNAs typically work three 12s — giving you four days off every week. The patient load is smaller (6–10) but pace is faster.
              </p>
              <ul className="space-y-3 mb-6 text-gray-dark">
                <li><strong>7:00 AM</strong> — Bedside handoff with off-going CNA and RN.</li>
                <li><strong>7:30 AM</strong> — Vitals on all assigned patients, blood sugars, intake/output.</li>
                <li><strong>8:30 AM</strong> — Bathing, ambulation, support for discharges and new admits.</li>
                <li><strong>11:00 AM</strong> — Repeat vitals, toileting, lunch trays.</li>
                <li><strong>1:00 PM</strong> — Lunch break (30 min).</li>
                <li><strong>3:00 PM</strong> — Afternoon vitals, repositioning, fall-risk rounding.</li>
                <li><strong>5:00 PM</strong> — Dinner trays, oral care.</li>
                <li><strong>6:30 PM</strong> — Final charting and report.</li>
                <li><strong>7:15 PM</strong> — Clock out.</li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">What You'll Learn That School Can't Teach</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-dark mb-6">
                <li>How to read a resident's mood before they tell you anything is wrong</li>
                <li>Team-lift culture — when to call for help every single time</li>
                <li>Reporting hierarchy: who hears what, and when</li>
                <li>How to chart fast without missing a thing</li>
                <li>Building trust with families in 90 seconds</li>
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Frequently Asked Questions</h2>
              <div className="space-y-5 mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Do CNAs get bathroom breaks?</h3>
                  <p className="text-gray-dark">Yes — but they're often informal. Most CNAs ask a partner to cover their assignment for 5 minutes. The 30-minute meal break is required by California law.</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Is the work emotionally heavy?</h3>
                  <p className="text-gray-dark">It can be. Residents become family. We cover grief, boundary-setting, and self-care in our program so you start your career with the emotional toolkit, not just the clinical one.</p>
                </div>
              </div>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Get Real Clinical Experience Before Day One</h3>
                <p className="text-gray-dark mb-6">100 hours of supervised clinicals at our Stockton, Lodi, or Hayward partner sites means you walk in confident on your first shift.</p>
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

export default DayInTheLifeOfCna;
