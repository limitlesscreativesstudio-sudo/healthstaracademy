import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import studentsBpTraining from "@/assets/students-bp-training.jpg";
import trainingLab from "@/assets/training-lab.jpg";

const CnaStateExamPrep22Skills = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "CNA State Exam Prep: The 22 CDPH Skills Examiners Test (and How to Pass First Try)",
    "description": "A complete breakdown of the 22 CDPH skills tested on the California CNA state exam, with study tips and the most common reasons candidates fail.",
    "image": "https://www.healthstaracademy.org/og-image.png",
    "author": { "@type": "Organization", "name": "Health Star Academy" },
    "publisher": { "@type": "Organization", "name": "Health Star Academy" },
    "datePublished": "2026-05-27",
    "dateModified": "2026-05-27",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How many skills are tested on the California CNA state exam?", "acceptedAnswer": { "@type": "Answer", "text": "The CDPH clinical skills exam tests 5 randomly selected skills from a pool of 22, plus mandatory handwashing and indirect-care steps such as privacy and call light." }},
      { "@type": "Question", "name": "What is the passing score for the CNA state exam in California?", "acceptedAnswer": { "@type": "Answer", "text": "You must score at least 75% on both the written portion (60 multiple-choice questions) and pass all five randomly assigned clinical skills to earn your CDPH certification." }},
      { "@type": "Question", "name": "What is the most commonly failed CNA skill?", "acceptedAnswer": { "@type": "Answer", "text": "Handwashing and indirect-care steps fail more candidates than any single hands-on skill. Missing the call light, privacy curtain, or signage costs more first-time test takers than incorrect technique." }},
      { "@type": "Question", "name": "How long is the California CNA state exam?", "acceptedAnswer": { "@type": "Answer", "text": "Plan for roughly 2.5 hours total — about 90 minutes for the written exam and 30–40 minutes for the clinical skills demonstration with a state evaluator." }}
    ]
  };

  const skills = [
    "Handwashing", "Donning and removing PPE", "Measuring and recording radial pulse", "Measuring and recording respirations",
    "Measuring and recording blood pressure", "Measuring and recording weight", "Measuring and recording urinary output",
    "Feeding the client", "Providing mouth care", "Providing denture care", "Providing perineal care for female client",
    "Providing catheter care", "Making an occupied bed", "Dressing a client with an affected (weak) right arm",
    "Transferring from bed to wheelchair using a transfer belt", "Ambulating with a transfer belt",
    "Positioning a client on their side", "Passive range of motion for one knee and ankle",
    "Passive range of motion for one shoulder", "Applying one knee-high elastic stocking",
    "Cleaning an upper or lower denture", "Giving modified bed bath (face, one arm, one hand, one underarm)"
  ];

  return (
    <>
      <SEO
        title="CNA State Exam Prep: 22 CDPH Skills & Pass Tips | Health Star"
        description="Complete guide to the 22 CDPH-tested CNA skills, the written exam format, common failure points, and how to pass the California CNA state exam first try."
        canonical="/blog/cna-state-exam-prep-22-skills"
        keywords="CNA state exam California, CDPH 22 skills list, CNA exam prep, California CNA skills test, NNAAP exam California, CNA clinical skills checklist"
        type="article"
        author="Health Star Academy"
        publishedTime="2026-05-27"
        structuredData={[
          buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: "CNA State Exam Prep", path: "/blog/cna-state-exam-prep-22-skills" }]),
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
              <span className="bg-cyan/20 text-cyan px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Exam Prep</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                CNA State Exam Prep: The 22 CDPH Skills Examiners Test
              </h1>
              <div className="flex items-center justify-center gap-6 text-primary-foreground/80 text-sm flex-wrap">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Health Star Academy</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> May 27, 2026</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 10 min read</span>
              </div>
            </div>
          </div>
        </section>

        <article className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 rounded-xl overflow-hidden shadow-soft">
                <img src={studentsBpTraining} alt="CNA student practicing blood pressure measurement for state exam" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <p className="text-gray-dark mb-6 leading-relaxed text-lg">
                <strong>Quick answer:</strong> The California CNA state exam (NNAAP) tests <strong>5 randomly selected hands-on skills</strong> drawn from a list of <strong>22 CDPH-approved competencies</strong>, plus a written exam of 60 multiple-choice questions. You must score 75% or higher on both portions to earn your certification.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">The Two Parts of the California CNA Exam</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                Every CDPH candidate completes two evaluations on test day:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Written exam — 60 multiple-choice questions covering safety, infection control, communication, basic nursing skills, role of the CNA, and resident rights",
                  "Clinical skills exam — 5 hands-on skills demonstrated to a state-trained evaluator, plus mandatory handwashing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">The Full List of 22 CDPH Skills</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                You won't know which 5 you'll perform until exam day — so you must be ready for all 22. Here's the complete list:
              </p>
              <ol className="space-y-2 mb-6 list-decimal pl-6 text-gray-dark">
                {skills.map((s) => (<li key={s}>{s}</li>))}
              </ol>

              <div className="my-10 rounded-xl overflow-hidden shadow-soft">
                <img src={trainingLab} alt="Hands-on CNA skills training lab" className="w-full h-64 md:h-80 object-cover" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">The #1 Reason CNA Candidates Fail</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                It isn't the hands-on technique — it's <strong>indirect care</strong>. Forgetting the call light, leaving the privacy curtain open, skipping the "sharps to back of cart" cue, or missing a single handwash step fails more candidates than any technical mistake. Memorize the indirect-care checklist and you eliminate the most common failure point.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">The Indirect Care Checklist (Memorize This)</h2>
              <ul className="space-y-3 mb-6">
                {[
                  "Knock, introduce yourself, identify the resident",
                  "Explain the procedure before starting",
                  "Wash hands at start and any time gloves change",
                  "Provide privacy (curtain, door, drape)",
                  "Bed in lowest position when finished",
                  "Call light within reach before leaving",
                  "Ask if there's anything else they need",
                  "Wash hands and report observations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-dark">
                    <CheckCircle2 className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">How Health Star Students Prepare</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Our hybrid CNA program includes a built-in <Link to="/cna-exam-prep" className="text-purple font-semibold hover:underline">CNA Exam Prep system</Link> with 175 practice questions across 15 categories and three practice modes — timed, untimed, and category-focused. Combined with in-person skills labs in Stockton, Lodi, and Hayward, our pass rate stays well above the California state average.
              </p>

              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 mt-10">Frequently Asked Questions</h2>
              <div className="space-y-5 mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">How long is the CNA state exam?</h3>
                  <p className="text-gray-dark">Roughly 2.5 hours total — about 90 minutes for the written portion and 30–40 minutes for the clinical skills demonstration.</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Can I retake if I fail?</h3>
                  <p className="text-gray-dark">Yes — you can retake the failed portion up to three times within two years of finishing your training. After the third failed attempt you must repeat training.</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">How much does the CNA exam cost?</h3>
                  <p className="text-gray-dark">The combined written + skills exam in California is $120. Many employers reimburse this once you're hired.</p>
                </div>
              </div>

              <div className="bg-neutral-light rounded-xl p-8 my-10 text-center">
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-3">Train With a CDPH-Approved Program</h3>
                <p className="text-gray-dark mb-6">Health Star Academy's hybrid program prepares you for every one of the 22 skills — and includes full state-exam prep.</p>
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

export default CnaStateExamPrep22Skills;
