import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroBanner from "@/components/HeroBanner";
import heroImage from "@/assets/hero-programs.jpg";

const sections = [
  { title: "How the program works", text: "Our CNA program is hybrid. 60 hours of online theory you complete from home; students receive a laptop to use for the length of their cohort. 100 hours of in person clinical training at partner skilled nursing facilities in Stockton, Lodi and Hayward. California approved CNA programs include at least 60 hours of classroom instruction and 100 hours of supervised clinical training, and ours follows that structure." },
  { title: "Two schedules", text: "Daytime track: finish in as little as 6 weeks. Weekend track: 8 weekends." },
  { title: "What it costs", text: "Tuition is $2,499 plus a $175 enrollment fee. No credit check financing is available through Denefits." },
  { title: "Do I qualify?", text: "At least 17 years old; High school diploma or GED; Background check with fingerprints, paid for by Health Star Academy; A TB test, a physical exam and immunizations; Completion of the online theory portion. CPR certification is not required to attend or while in the program." },
  { title: "Exam prep", text: "California CNA exam prep with a 175 question bank across 15 categories and all 22 clinical skills. The California CNA competency exam has a written (or oral) knowledge test and a clinical skills test, administered by Credentia. CNA certificates in California are renewed every two years." },
  { title: "California nursing assistant outlook", text: "California employed about 111,300 nursing assistants in 2024 and projects 122,800 by 2034, with about 17,270 openings a year from 2024 to 2034." },
];

export default function StocktonMarketingContent() {
  return (
    <main className="pt-28 md:pt-32">
      <HeroBanner imageSrc={heroImage} imageAlt="Health Star Academy CNA training" title="CNA Training in Stockton, CA" />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-lg text-foreground/90 leading-relaxed mb-4">Health Star Academy is a state approved CNA school in Stockton, California, serving the Central Valley and Bay Area. Our CNA program is approved by the California Department of Public Health (CDPH).</p>
          <p className="text-foreground/90 leading-relaxed mb-6">Next cohort: January 4, 2027. Daytime cohort application deadline: December 21, 2026 at 11:59 PM.</p>
          <Button asChild size="lg" className="h-auto min-h-11 whitespace-normal text-center">
            <Link to="/pre-qualification">Take the 2 minute eligibility check</Link>
          </Button>
        </div>
      </section>
      {sections.map((section, index) => (
        <section key={section.title} className={`py-12 ${index % 2 === 0 ? "bg-muted/30" : "bg-background"}`}>
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">{section.title}</h2>
            <p className="text-foreground/90 leading-relaxed">{section.text}</p>
          </div>
        </section>
      ))}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Visit or contact us</h2>
          <p className="text-foreground/90 leading-relaxed">Address 5250 Claremont Avenue, Sherwood Executive Center, Suite 127, Stockton, CA 95207. Office hours Monday to Friday, 9:00 am to 2:00 pm. Call <a href="tel:2093234169" className="text-primary hover:underline">(209) 323 4169</a> (calls only). Text <a href="sms:9162088097" className="text-primary hover:underline">(916) 208 8097</a>. Email <a href="mailto:info@healthstaracademy.org" className="text-primary hover:underline">info@healthstaracademy.org</a>. All upcoming start dates and enrollment deadlines are listed at <Link to="/programs/cohorts" className="text-primary hover:underline">healthstaracademy.org/programs/cohorts</Link>. When you are ready, complete the enrollment questionnaire on <Link to="/pre-qualification" className="text-primary hover:underline">healthstaracademy.org</Link>.</p>
        </div>
      </section>
    </main>
  );
}