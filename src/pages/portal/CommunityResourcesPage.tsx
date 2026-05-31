import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  GraduationCap,
  HandHeart,
  Utensils,
  Bus,
  Baby,
  ArrowRight,
  ExternalLink,
  Phone,
  Info,
} from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import diverseStudents from "@/assets/diverse-students-training.jpg";

interface Resource {
  name: string;
  helps: string;
  eligibility?: string;
  url: string;
  phone?: string;
}

interface ResourceCategory {
  id: string;
  title: string;
  icon: typeof Briefcase;
  intro: string;
  accent: "purple" | "cyan" | "magenta";
  resources: Resource[];
}

const CATEGORIES: ResourceCategory[] = [
  {
    id: "workforce",
    title: "Workforce & Tuition Assistance",
    icon: Briefcase,
    accent: "purple",
    intro:
      "Government-funded programs that may cover all or part of your CNA tuition for qualifying adults, dislocated workers, and veterans.",
    resources: [
      {
        name: "San Joaquin County WorkNet (WIOA)",
        helps: "Tuition assistance for healthcare training in Stockton, Lodi, Tracy, and Manteca.",
        eligibility: "Adults, dislocated workers, low-income job seekers in San Joaquin County.",
        url: "https://www.sjcworknet.org/",
        phone: "(209) 468-3500",
      },
      {
        name: "Sacramento Works (WIOA)",
        helps: "Funding for short-term healthcare training and career services across Sacramento County.",
        eligibility: "Sacramento County residents who meet WIOA income or dislocated-worker criteria.",
        url: "https://www.sacramentoworks.org/",
        phone: "(916) 263-3800",
      },
      {
        name: "Eden Area Career Center / Alameda County WDB (WIOA)",
        helps: "Tuition assistance for residents of Hayward, San Leandro, and surrounding Alameda County areas.",
        eligibility: "Adults and dislocated workers in Alameda County.",
        url: "https://www.acwdb.org/",
        phone: "(510) 259-3800",
      },
      {
        name: "California Department of Rehabilitation (DOR)",
        helps: "Vocational training funding for individuals with a documented disability.",
        eligibility: "California residents with a physical or mental disability that limits employment.",
        url: "https://www.dor.ca.gov/",
        phone: "(916) 324-1313",
      },
      {
        name: "CalWORKs Welfare-to-Work",
        helps: "Education and training support for parents receiving CalWORKs cash assistance.",
        eligibility: "Active CalWORKs recipients — apply through your county social services office.",
        url: "https://www.cdss.ca.gov/calworks",
      },
      {
        name: "Veterans Education Benefits (CalVet / GI Bill)",
        helps: "Tuition and living-stipend benefits for veterans and qualifying dependents.",
        eligibility: "Veterans, active-duty service members, and certain dependents.",
        url: "https://www.calvet.ca.gov/VetServices/Pages/Education.aspx",
        phone: "(800) 952-5626",
      },
    ],
  },
  {
    id: "scholarships",
    title: "Scholarships & Grants",
    icon: GraduationCap,
    accent: "magenta",
    intro:
      "Healthcare-focused grants and community scholarships that can help offset tuition costs.",
    resources: [
      {
        name: "California Health Care Workforce — HCAI",
        helps: "State grants and scholarships for entry-level healthcare workers, including CNAs.",
        eligibility: "California residents pursuing healthcare careers; varies by program.",
        url: "https://hcai.ca.gov/workforce/health-workforce/",
      },
      {
        name: "Kaiser Permanente Community Scholarships",
        helps: "Local scholarships supporting underrepresented students entering healthcare.",
        eligibility: "Varies by region and program — check current cycles.",
        url: "https://about.kaiserpermanente.org/community-health/improving-community-conditions/educational-pathways",
      },
      {
        name: "Local Community Foundation Scholarships",
        helps: "Search regional foundations (San Joaquin, Sacramento Region, East Bay) for healthcare-specific scholarships.",
        eligibility: "Varies — typically based on residency, financial need, or career field.",
        url: "https://www.cof.org/community-foundation-locator",
      },
    ],
  },
  {
    id: "childcare",
    title: "Childcare Assistance",
    icon: Baby,
    accent: "cyan",
    intro:
      "Subsidized childcare so parents can attend class and clinicals without putting their family on hold.",
    resources: [
      {
        name: "California Alternative Payment Program (APP)",
        helps: "Subsidized childcare while you attend school or training.",
        eligibility: "Income-eligible families enrolled in approved education or training.",
        url: "https://www.cdss.ca.gov/inforesources/child-care-and-development/alternative-payment-program",
      },
      {
        name: "Family Resource & Referral Center — San Joaquin",
        helps: "Local childcare subsidies, referrals, and family support in Stockton and surrounding areas.",
        url: "https://www.frrcsj.org/",
        phone: "(209) 461-2908",
      },
      {
        name: "BANANAS Child Care — Alameda County",
        helps: "Childcare subsidies and referrals for families in Hayward and the East Bay.",
        url: "https://bananasbunch.org/",
        phone: "(510) 658-0381",
      },
    ],
  },
  {
    id: "food",
    title: "Food Assistance",
    icon: Utensils,
    accent: "purple",
    intro:
      "Free groceries and meal programs so financial stress doesn't get in the way of your studies.",
    resources: [
      {
        name: "Second Harvest of the Greater Valley",
        helps: "Free food distributions throughout San Joaquin County.",
        url: "https://www.localfoodbank.org/",
        phone: "(209) 464-7369",
      },
      {
        name: "Sacramento Food Bank & Family Services",
        helps: "Food assistance, CalFresh enrollment help, and family support in the Sacramento region.",
        url: "https://www.sacramentofoodbank.org/",
        phone: "(916) 925-3240",
      },
      {
        name: "Alameda County Community Food Bank",
        helps: "Free groceries and a food helpline for residents of Hayward and the East Bay.",
        url: "https://www.accfb.org/",
        phone: "(510) 635-3663",
      },
      {
        name: "CalFresh (SNAP)",
        helps: "Monthly food benefits — many adult students in approved training qualify.",
        eligibility: "Income-eligible California residents; college students in qualifying programs may also be eligible.",
        url: "https://www.getcalfresh.org/",
      },
    ],
  },
  {
    id: "transportation",
    title: "Transportation Support",
    icon: Bus,
    accent: "cyan",
    intro:
      "Help getting to class and to clinicals in Stockton, Lodi, and Hayward.",
    resources: [
      {
        name: "San Joaquin RTD",
        helps: "Local and regional bus service throughout San Joaquin County, with reduced-fare passes available.",
        url: "https://sanjoaquinrtd.com/",
        phone: "(209) 943-1111",
      },
      {
        name: "AC Transit (East Bay)",
        helps: "Bus service across Hayward and Alameda County, with discount programs for low-income riders.",
        url: "https://www.actransit.org/",
        phone: "(510) 891-4777",
      },
      {
        name: "Sacramento Regional Transit (SacRT)",
        helps: "Bus and light rail service throughout Sacramento County.",
        url: "https://www.sacrt.com/",
        phone: "(916) 321-2877",
      },
    ],
  },
];

const accentClasses = {
  purple: {
    border: "border-purple",
    iconBg: "bg-purple/10",
    iconText: "text-purple",
    link: "text-purple",
  },
  cyan: {
    border: "border-cyan",
    iconBg: "bg-cyan/10",
    iconText: "text-cyan",
    link: "text-cyan",
  },
  magenta: {
    border: "border-magenta",
    iconBg: "bg-magenta/10",
    iconText: "text-magenta",
    link: "text-magenta",
  },
};

const CommunityResourcesPage = () => {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CNA Student Community Resources — California",
    description:
      "Curated list of California organizations offering financial assistance, childcare, food, and transportation support for CNA students.",
    itemListElement: CATEGORIES.flatMap((cat, ci) =>
      cat.resources.map((r, ri) => ({
        "@type": "ListItem",
        position: ci * 100 + ri + 1,
        name: r.name,
        url: r.url,
      })),
    ),
  };

  return (
    <>
      <SEO
        title="Community Resources & Financial Assistance | Health Star Academy"
        description="Local California organizations offering tuition help, childcare, food, and transportation support for CNA students in Stockton, Sacramento, and Hayward."
        canonical="/community-resources"
        keywords="WIOA CNA training California, financial assistance CNA school, CalWORKs healthcare training, CNA scholarships California, childcare assistance students Stockton"
        structuredData={[
          itemListSchema,
          buildBreadcrumbSchema([{ name: "Community Resources", path: "/community-resources" }]),
        ]}
      />
      <main className="pt-28 md:pt-32">
        <HeroBanner
          imageSrc={diverseStudents}
          imageAlt="Diverse Health Star Academy students supporting one another"
          title={
            <>
              Community<br />
              <span className="text-cyan">Resources</span>
            </>
          }
          subtitle="Financial assistance, childcare, food, and transportation support for CNA students."
        />

        {/* Intro */}
        <section className="section-padding bg-background">
          <div className="container-custom max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
                You don't have to do this alone.
              </h2>
              <p className="text-gray-dark leading-relaxed text-lg">
                Cost is one of the biggest reasons people put off becoming a CNA — but it doesn't have to stop you.
                Below are trusted local and statewide California organizations that may help cover tuition, childcare,
                food, and transportation while you train. We've pulled them together in one place so you can apply for
                support and get back to focusing on your career.
              </p>
            </div>

            <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-5 flex gap-3 items-start">
              <Info className="h-5 w-5 text-cyan flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-dark leading-relaxed">
                <strong className="text-charcoal">Please note:</strong> Health Star Academy is not affiliated with these organizations
                and does not administer their programs. Eligibility, availability, and benefits are determined entirely by each
                provider. Always confirm current details directly with the organization before applying.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="pb-16 bg-background">
          <div className="container-custom max-w-5xl space-y-12">
            {CATEGORIES.map((cat) => {
              const a = accentClasses[cat.accent];
              return (
                <div key={cat.id} id={cat.id} className="scroll-mt-32">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full ${a.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <cat.icon className={`h-6 w-6 ${a.iconText}`} />
                    </div>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-charcoal">
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-gray-dark mb-6 leading-relaxed">{cat.intro}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.resources.map((r) => (
                      <div
                        key={r.name}
                        className={`bg-neutral-light rounded-xl p-5 shadow-soft border-t-4 ${a.border} flex flex-col`}
                      >
                        <h4 className="font-heading font-semibold text-lg text-charcoal mb-2">{r.name}</h4>
                        <p className="text-gray-dark text-sm leading-relaxed mb-3">{r.helps}</p>
                        {r.eligibility && (
                          <p className="text-xs text-gray-dark/80 italic mb-3">
                            <strong className="not-italic text-charcoal">Who qualifies:</strong> {r.eligibility}
                          </p>
                        )}
                        <div className="mt-auto pt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-border">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 font-semibold text-sm ${a.link} hover:underline`}
                          >
                            Visit site <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          {r.phone && (
                            <a
                              href={`tel:${r.phone.replace(/[^\d]/g, "")}`}
                              className="inline-flex items-center gap-1 text-sm text-charcoal hover:text-purple"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {r.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="section-padding gradient-hero">
          <div className="container-custom max-w-3xl text-center">
            <HandHeart className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready When You Are
            </h2>
            <p className="text-primary-foreground/90 mb-6 leading-relaxed">
              Once you've explored your options, we're here to help you take the next step.
              Our team can also point you to in-house payment plans and Denefits financing during enrollment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/pre-qualification">
                  Start Pre-Qualification <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="gray-outline" size="lg" asChild className="bg-white/10 text-primary-foreground border-white hover:bg-white hover:text-charcoal">
                <Link to="/programs/admissions">View Payment Options</Link>
              </Button>
            </div>
            <p className="text-primary-foreground/80 text-sm mt-6">
              Questions? Call <a href="tel:2093234169" className="underline">(209) 323-4169</a> or email{" "}
              <a href="mailto:info@healthstaracademy.org" className="underline">info@healthstaracademy.org</a>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default CommunityResourcesPage;
