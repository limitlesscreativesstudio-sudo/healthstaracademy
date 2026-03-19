import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Clock, CheckCircle, ArrowRight, DollarSign, Users } from "lucide-react";
import WeekendEnrollmentCounter from "@/components/WeekendEnrollmentCounter";
import { cn } from "@/lib/utils";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import { getNextUpcomingCohort } from "@/data/cohortSchedule";
import cnaStudentsGroup from "@/assets/cna-students-group.png";


import cohortStudentFemale3 from "@/assets/cohort-student-female-3.jpg";
import cohortStudentFemale4 from "@/assets/cohort-student-female-4.jpg";

import cohortStudentMale2 from "@/assets/cohort-student-male-2.jpg";
import cohortStudentMale3 from "@/assets/cohort-student-male-3.jpg";

const CohortsPage = () => {
  const denefitsLink = "https://request.denefits.com/finance-panel?product_code=pc_f28b592da1a9&auth_token=e8e50ae34c588f3dbea2c194d7e8440a";

  const cohorts = [
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "May 4, 2026",
      endDate: "June 19, 2026",
      deadline: "Monday, April 20, 2026",
      paidInFullLink: "https://buy.stripe.com/4gM4gs9Ltckl8Gr22T6sw03",
      paymentPlanLink: "https://buy.stripe.com/14A6oA9Lt5VX4qb9vl6sw0a",
      image: cohortStudentMale2,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "July 6, 2026",
      endDate: "August 17, 2026",
      deadline: "Monday, June 22, 2026",
      paidInFullLink: "https://buy.stripe.com/28E9AM4r9cklg8T9vl6sw01",
      paymentPlanLink: "https://buy.stripe.com/5kQeV61eX4RTe0L6j96sw09",
      image: cohortStudentFemale3,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "August 24, 2026",
      endDate: "October 5, 2026",
      deadline: "Monday, August 10, 2026",
      paidInFullLink: "https://buy.stripe.com/6oUdR23n5estf4P7nd6sw05",
      paymentPlanLink: "https://buy.stripe.com/00w7sEg9R701e0Lazp6sw0c",
      image: cohortStudentFemale4,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "October 12, 2026",
      endDate: "November 23, 2026",
      deadline: "Monday, September 28, 2026",
      paidInFullLink: "https://buy.stripe.com/eVqaEQ2j1ckl09VbDt6sw04",
      paymentPlanLink: "https://buy.stripe.com/4gM3co9Lt989e0L36X6sw0b",
      image: cohortStudentMale3,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "December 7, 2026",
      endDate: "January 18, 2027",
      deadline: "Monday, November 23, 2026",
      paidInFullLink: "https://buy.stripe.com/4gM4gs9Ltckl8Gr22T6sw03",
      paymentPlanLink: "https://buy.stripe.com/14A6oA9Lt5VX4qb9vl6sw0a",
      image: cohortStudentMale2,
      isClosed: false,
    },
    // 2027
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "February 8, 2027",
      endDate: "March 22, 2027",
      deadline: "Monday, January 25, 2027",
      paidInFullLink: "https://buy.stripe.com/4gM4gs9Ltckl8Gr22T6sw03",
      paymentPlanLink: "https://buy.stripe.com/14A6oA9Lt5VX4qb9vl6sw0a",
      image: cohortStudentFemale3,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "May 3, 2027",
      endDate: "June 14, 2027",
      deadline: "Monday, April 19, 2027",
      paidInFullLink: "https://buy.stripe.com/28E9AM4r9cklg8T9vl6sw01",
      paymentPlanLink: "https://buy.stripe.com/5kQeV61eX4RTe0L6j96sw09",
      image: cohortStudentFemale4,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "July 5, 2027",
      endDate: "August 16, 2027",
      deadline: "Monday, June 21, 2027",
      paidInFullLink: "https://buy.stripe.com/6oUdR23n5estf4P7nd6sw05",
      paymentPlanLink: "https://buy.stripe.com/00w7sEg9R701e0Lazp6sw0c",
      image: cohortStudentMale3,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "August 23, 2027",
      endDate: "October 4, 2027",
      deadline: "Monday, August 9, 2027",
      paidInFullLink: "https://buy.stripe.com/eVqaEQ2j1ckl09VbDt6sw04",
      paymentPlanLink: "https://buy.stripe.com/4gM3co9Lt989e0L36X6sw0b",
      image: cohortStudentMale2,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "October 11, 2027",
      endDate: "November 22, 2027",
      deadline: "Monday, September 27, 2027",
      paidInFullLink: "https://buy.stripe.com/4gM4gs9Ltckl8Gr22T6sw03",
      paymentPlanLink: "https://buy.stripe.com/14A6oA9Lt5VX4qb9vl6sw0a",
      image: cohortStudentFemale3,
      isClosed: false,
    },
    {
      title: "HSA Certified Nursing Assistant (CNA)",
      startDate: "December 6, 2027",
      endDate: "January 17, 2028",
      deadline: "Monday, November 22, 2027",
      paidInFullLink: "https://buy.stripe.com/28E9AM4r9cklg8T9vl6sw01",
      paymentPlanLink: "https://buy.stripe.com/5kQeV61eX4RTe0L6j96sw09",
      image: cohortStudentFemale4,
      isClosed: false,
    },
  ];

  const weekendCohorts = [
    {
      title: "HSA CNA — Weekend Program",
      startDate: "July 11, 2026",
      endDate: "August 23, 2026",
      deadline: "Saturday, June 27, 2026",
      paidInFullLink: "https://buy.stripe.com/4gM4gs9Ltckl8Gr22T6sw03",
      paymentPlanLink: "https://buy.stripe.com/14A6oA9Lt5VX4qb9vl6sw0a",
      image: cohortStudentFemale3,
      isClosed: false,
    },
    {
      title: "HSA CNA — Weekend Program",
      startDate: "October 3, 2026",
      endDate: "November 15, 2026",
      deadline: "Saturday, September 19, 2026",
      paidInFullLink: "https://buy.stripe.com/28E9AM4r9cklg8T9vl6sw01",
      paymentPlanLink: "https://buy.stripe.com/5kQeV61eX4RTe0L6j96sw09",
      image: cohortStudentMale3,
      isClosed: false,
    },
    {
      title: "HSA CNA — Weekend Program",
      startDate: "January 9, 2027",
      endDate: "February 21, 2027",
      deadline: "Saturday, December 26, 2026",
      paidInFullLink: "https://buy.stripe.com/6oUdR23n5estf4P7nd6sw05",
      paymentPlanLink: "https://buy.stripe.com/00w7sEg9R701e0Lazp6sw0c",
      image: cohortStudentFemale4,
      isClosed: false,
    },
    {
      title: "HSA CNA — Weekend Program",
      startDate: "April 3, 2027",
      endDate: "May 16, 2027",
      deadline: "Saturday, March 20, 2027",
      paidInFullLink: "https://buy.stripe.com/eVqaEQ2j1ckl09VbDt6sw04",
      paymentPlanLink: "https://buy.stripe.com/4gM3co9Lt989e0L36X6sw0b",
      image: cohortStudentMale2,
      isClosed: false,
    },
    {
      title: "HSA CNA — Weekend Program",
      startDate: "July 10, 2027",
      endDate: "August 22, 2027",
      deadline: "Saturday, June 26, 2027",
      paidInFullLink: "https://buy.stripe.com/4gM4gs9Ltckl8Gr22T6sw03",
      paymentPlanLink: "https://buy.stripe.com/14A6oA9Lt5VX4qb9vl6sw0a",
      image: cohortStudentFemale3,
      isClosed: false,
    },
    {
      title: "HSA CNA — Weekend Program",
      startDate: "October 2, 2027",
      endDate: "November 14, 2027",
      deadline: "Saturday, September 18, 2027",
      paidInFullLink: "https://buy.stripe.com/28E9AM4r9cklg8T9vl6sw01",
      paymentPlanLink: "https://buy.stripe.com/5kQeV61eX4RTe0L6j96sw09",
      image: cohortStudentMale3,
      isClosed: false,
    },
  ];

  const includedItems = [
    "160-Hour CDPH Approved Program",
    "60 Hours Online Theory",
    "100 Hours Clinical Training",
    "Chromebook (Program Use Only)",
    "Textbook & Workbook",
    "Uniform (Scrubs)",
    "Blood Pressure Cuff & Stethoscope",
    "Lab Supplies",
    "LiveScan Background Check",
    "State Exam Preparation",
  ];

  return (
    <>
      <SEO
        title="Cohorts & Pricing | CNA Program Enrollment | Health Star Academy"
        description="Choose your CNA training cohort and payment option. Total tuition $2,499 - pay in full or use our weekly payment plan. New classes start monthly at Health Star Academy."
        canonical="/programs/cohorts"
        keywords="CNA program cost, CNA tuition payment, nursing assistant training price, CNA class schedule, Health Star Academy enrollment, CNA payment plan"
        structuredData={buildBreadcrumbSchema([{ name: "Programs", path: "/programs" }, { name: "Cohorts & Pricing", path: "/programs/cohorts" }])}
      />
      <main className="pt-28 md:pt-32">
        {/* Hero Section */}
        <HeroBanner
          imageSrc={cnaStudentsGroup}
          imageAlt="Health Star Academy CNA students ready for their healthcare career"
          title={
            <>
              Cohorts &<br />
              <span className="text-cyan">Tuition</span>
            </>
          }
          subtitle="Select your start date and payment option below"
        />

        {/* Pricing Overview */}
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
                Program Tuition
              </h2>
              <p className="text-gray-dark max-w-2xl mx-auto">
                Our all-inclusive tuition covers everything you need to become a Certified Nursing Assistant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              {/* Paid in Full Option */}
              <div className="bg-neutral-light rounded-xl p-6 border-2 border-purple shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-charcoal">Paid in Full</h3>
                    <p className="text-sm text-gray-dark">One-time payment</p>
                  </div>
                </div>
                <div className="bg-purple/10 rounded-lg p-4 mb-4">
                  <p className="text-4xl font-bold text-purple">$2,499</p>
                  <p className="text-sm text-gray-dark">Total Program Cost</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-dark">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple" />
                    Best value - save on payment plan fees
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple" />
                    Immediate enrollment confirmation
                  </li>
                </ul>
              </div>

              {/* Payment Plan Option */}
              <div className="bg-neutral-light rounded-xl p-6 border-2 border-cyan shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cyan rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-charcoal">Weekly Payment Plan</h3>
                    <p className="text-sm text-gray-dark">5 weekly payments</p>
                  </div>
                </div>
                <div className="bg-cyan/10 rounded-lg p-4 mb-4">
                  <p className="text-4xl font-bold text-cyan">$499.80</p>
                  <p className="text-sm text-gray-dark">Per Week × 5 Payments</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-dark">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan" />
                    First payment initiates enrollment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan" />
                    Spread the cost over 5 weeks
                  </li>
                </ul>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-background rounded-xl p-6 shadow-soft max-w-4xl mx-auto">
              <h3 className="font-heading font-bold text-xl text-charcoal mb-4 text-center">What's Included in Your Tuition</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {includedItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-neutral-light rounded-lg p-3">
                    <CheckCircle className="h-4 w-4 text-purple flex-shrink-0" />
                    <span className="text-sm text-charcoal">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cohort Selection */}
        <section className="py-12 bg-neutral-light">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
                Daytime Cohorts
              </h2>
              <p className="text-gray-dark max-w-2xl mx-auto">
                Monday – Thursday, 6:00 AM – 2:30 PM · 6.5 weeks (23 class days)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {cohorts.map((cohort, index) => (
                <div
                  key={index}
                  className={cn(
                    "bg-background rounded-xl overflow-hidden shadow-soft transition-shadow flex flex-col",
                    cohort.isClosed ? "opacity-75" : "hover:shadow-medium"
                  )}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={cohort.image} 
                      alt={`CNA Training Student - ${cohort.startDate}`}
                      className={cn("w-full h-full object-cover", cohort.isClosed && "grayscale")}
                    />
                    {cohort.isClosed && (
                      <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-bold text-lg px-6 py-2 rounded-lg transform -rotate-12 shadow-lg">
                          CLOSED
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        cohort.isClosed ? "bg-gray-200" : "bg-purple/10"
                      )}>
                        <Calendar className={cn("h-5 w-5", cohort.isClosed ? "text-gray-400" : "text-purple")} />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-charcoal">
                          {cohort.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-dark font-medium">
                        {cohort.startDate} – {cohort.endDate}
                      </p>
                      <p className="text-sm text-gray-medium">6.5 weeks (23 class days)</p>
                      {!cohort.isClosed && (
                        <p className="text-sm text-purple font-semibold mt-1">
                          ⏰ Apply by: {cohort.deadline}
                        </p>
                      )}
                    </div>

                    {cohort.isClosed ? (
                      <div className="flex flex-col gap-2 mt-auto">
                        <div className="bg-gray-100 rounded-lg p-4 text-center">
                          <p className="font-bold text-red-600 mb-1">Registration Closed</p>
                          <p className="text-sm text-gray-dark">This cohort is no longer accepting applications</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2 mt-auto">
                          <Button variant="default" size="default" asChild className="w-full">
                            <a href={cohort.paidInFullLink} target="_blank" rel="noopener noreferrer">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Pay in Full - $2,499
                            </a>
                          </Button>
                          <Button variant="secondary" size="default" asChild className="w-full">
                            <a href={cohort.paymentPlanLink} target="_blank" rel="noopener noreferrer">
                              <Clock className="h-4 w-4 mr-1" />
                              Weekly Plan - $499.80/wk
                            </a>
                          </Button>
                        </div>
                        
                        <a
                          href={denefitsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 bg-gradient-to-r from-cyan/20 to-magenta/20 rounded-lg p-4 text-center hover:from-cyan/30 hover:to-magenta/30 transition-all border border-cyan/50"
                        >
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <CreditCard className="h-4 w-4 text-purple" />
                            <span className="font-semibold text-charcoal text-sm">Denefits Financing</span>
                          </div>
                          <p className="text-xs text-gray-dark">No credit check • Guaranteed approval</p>
                          <span className="text-purple font-semibold text-xs mt-1 block">Apply Now →</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Weekend Cohorts */}
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
                Weekend Cohorts
                <span className="ml-3 inline-block bg-cyan/20 text-cyan text-sm font-bold px-3 py-1 rounded-full align-middle">NEW</span>
              </h2>
              <p className="text-gray-dark max-w-2xl mx-auto">
                Saturday & Sunday, 6:00 AM – 6:00 PM · 7 weekends (14 class days)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {weekendCohorts.map((cohort, index) => (
                <div
                  key={index}
                  className={cn(
                    "bg-background rounded-xl overflow-hidden shadow-soft transition-shadow flex flex-col border-2 border-cyan/20",
                    cohort.isClosed ? "opacity-75" : "hover:shadow-medium"
                  )}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={cohort.image} 
                      alt={`CNA Weekend Training Student - ${cohort.startDate}`}
                      className={cn("w-full h-full object-cover", cohort.isClosed && "grayscale")}
                    />
                    <div className="absolute top-3 right-3 bg-cyan text-charcoal text-xs font-bold px-2 py-1 rounded">
                      WEEKEND
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        cohort.isClosed ? "bg-gray-200" : "bg-cyan/10"
                      )}>
                        <Calendar className={cn("h-5 w-5", cohort.isClosed ? "text-gray-400" : "text-cyan")} />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-charcoal">
                          {cohort.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-dark font-medium">
                        {cohort.startDate} – {cohort.endDate}
                      </p>
                      <p className="text-sm text-gray-medium">7 weekends (14 class days)</p>
                      {!cohort.isClosed && (
                        <p className="text-sm text-cyan font-semibold mt-1">
                          ⏰ Apply by: {cohort.deadline}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                      <Button variant="default" size="default" asChild className="w-full">
                        <a href={cohort.paidInFullLink} target="_blank" rel="noopener noreferrer">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pay in Full - $2,499
                        </a>
                      </Button>
                      <Button variant="secondary" size="default" asChild className="w-full">
                        <a href={cohort.paymentPlanLink} target="_blank" rel="noopener noreferrer">
                          <Clock className="h-4 w-4 mr-1" />
                          Weekly Plan - $499.80/wk
                        </a>
                      </Button>
                    </div>
                    
                    <a
                      href={denefitsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 bg-gradient-to-r from-cyan/20 to-magenta/20 rounded-lg p-4 text-center hover:from-cyan/30 hover:to-magenta/30 transition-all border border-cyan/50"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-purple" />
                        <span className="font-semibold text-charcoal text-sm">Denefits Financing</span>
                      </div>
                      <p className="text-xs text-gray-dark">No credit check • Guaranteed approval</p>
                      <span className="text-purple font-semibold text-xs mt-1 block">Apply Now →</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              {(() => {
                const next = getNextUpcomingCohort("daytime");
                const nextWeekend = getNextUpcomingCohort("weekend");
                return (
                  <>
                    <p className="text-charcoal text-lg md:text-xl font-bold mb-2">
                      ⚠️ Next daytime deadline: {next.deadline} ({next.startDate} start)
                    </p>
                    <p className="text-charcoal text-lg md:text-xl font-bold mb-4">
                      ⚠️ Next weekend deadline: {nextWeekend.deadline} ({nextWeekend.startDate} start)
                    </p>
                  </>
                );
              })()}
              <p className="text-gray-medium text-xs">
                Have questions? Call <a href="tel:2093234169" className="text-purple hover:underline">(209) 323-4169</a> or email <a href="mailto:info@healthstaracademy.org" className="text-purple hover:underline">info@healthstaracademy.org</a>
              </p>
            </div>
          </div>
        </section>

        {/* Additional Financing */}
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
                Need Additional Financing?
              </h2>
              <p className="text-gray-dark max-w-2xl mx-auto">
                We've partnered with trusted organizations to provide additional payment solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="bg-neutral-light rounded-xl p-6 text-center">
                <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Self-Help Credit Union</h3>
                <p className="text-gray-dark text-sm mb-4">Payment plans, loans, and financing support available</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contact">Contact Us for Details</Link>
                </Button>
              </div>
              <a
                href="https://request.denefits.com/finance-panel?product_code=pc_f28b592da1a9&auth_token=e8e50ae34c588f3dbea2c194d7e8440a"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-cyan/20 to-magenta/20 rounded-xl p-6 text-center hover:from-cyan/30 hover:to-magenta/30 transition-all border-2 border-cyan shadow-md hover:shadow-lg"
              >
                <div className="mb-2">
                  <span className="bg-cyan text-charcoal text-xs font-bold px-2 py-1 rounded">RECOMMENDED</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-charcoal mb-2">Denefits Financing</h3>
                <p className="text-gray-dark text-sm mb-2">No credit check, guaranteed approvals</p>
                <span className="text-purple font-semibold text-sm">Click to apply now →</span>
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-neutral-light">
          <div className="container-custom text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3">
              Have Questions About Enrollment?
            </h2>
            <p className="text-gray-dark max-w-xl mx-auto mb-6">
              View our complete enrollment process or contact our admissions team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" asChild>
                <Link to="/programs/admissions">
                  View Enrollment Process <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="tel:2093234169">Call (209) 323-4169</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default CohortsPage;
