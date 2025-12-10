import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, ClipboardCheck, CreditCard, GraduationCap, ArrowRight, ChevronDown, ChevronUp, HelpCircle, Download } from "lucide-react";
import heroPrograms from "@/assets/hero-programs.jpg";
import { useState } from "react";

const AdmissionsPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const enrollmentSteps = [
    { step: 1, icon: FileText, title: "Submit Application", description: "Complete our online application with $175 non-refundable fee. An admissions advisor will contact you within one business hour." },
    { step: 2, icon: Users, title: "Gather Documents", description: "Provide: Government ID, Social Security Card, and pass LiveScan background check." },
    { step: 3, icon: ClipboardCheck, title: "Health Clearance", description: "Submit proof of good health: physical examination, PPD TB Test or Chest X-ray clearance." },
    { step: 4, icon: CreditCard, title: "Complete Enrollment", description: "Finalize payment arrangements. Payment plans available through Self-Help Credit Union or Denefits financing." },
    { step: 5, icon: GraduationCap, title: "Start Class!", description: "Attend your first online theory session and begin your journey to becoming a CNA!" },
  ];

  const requirements = [
    "Must be at least 18 years of age (parental consent required if younger)",
    "Physical Government Issued ID (Driver's License, CA ID, Passport, Green Card)",
    "Social Security Card",
    "Must Pass Criminal Background Check (LiveScan)",
    "Proof of good health (physical exam, PPD TB Test or Chest X-ray)",
    "GED/High School Diploma preferred (or pass entrance exam with 75% or above)",
    "$175 non-refundable application fee",
  ];

  const faqs = [
    { question: "Do you offer payment plans?", answer: "Yes! We've partnered with Self-Help Federal Credit Union and Denefits for flexible payment options. Denefits offers no credit check financing with guaranteed approvals and instant pre-approval decisions." },
    { question: "What if I have a criminal record?", answer: "Certain offenses may prevent state CNA certification. Contact us to discuss your situation confidentially. We'll help you understand your options." },
    { question: "Can I work while attending?", answer: "Absolutely! Our hybrid format with flexible online theory and scheduled clinicals is designed for working adults." },
    { question: "Do I need a high school diploma?", answer: "A GED/High School Diploma is preferred but not required. If you don't have one, you can pass our entrance exam with 75% or above to qualify." },
    { question: "How long is the program?", answer: "The program is 160 total hours: 60 hours online theory + 100 hours clinical. Daytime program takes ~6 weeks, weekend program takes ~9 weeks." },
    { question: "Where are the clinical sites?", answer: "Clinical training is held at Meadowood Health and Rehabilitation Center (Stockton) and Lodi Creek Post-Acute (Lodi). Bay Area locations coming soon!" },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section - Marketing Style */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 flex flex-col lg:flex-row">
          {/* Image Side */}
          <div className="w-full lg:w-1/2 h-64 lg:h-full relative">
            <img
              src={heroPrograms}
              alt="Health Star Academy students ready to enroll"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Gradient Side */}
          <div className="w-full lg:w-1/2 h-full bg-gradient-to-br from-purple via-purple/90 to-magenta flex items-center justify-center py-12 lg:py-0">
            <div className="text-center px-8 lg:px-12">
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in-up uppercase tracking-wide">
                Your Application<br />
                Checklist:<br />
                <span className="text-cyan">Simple & Clear</span>
              </h1>
              <p className="text-primary-foreground/90 text-lg animate-fade-in-up animation-delay-100">
                New Classes Start Monthly!
              </p>
            </div>
          </div>
        </div>
        <div className="relative z-10 container-custom py-32 lg:py-40" />
      </section>

      {/* 5-Step Enrollment Process */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">5-Step Enrollment Process</h2>
            <p className="text-gray-dark max-w-2xl mx-auto">From inquiry to your first day of class, we guide you through every step.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {enrollmentSteps.map((item, index) => (
              <div key={item.step} className="flex gap-6 mb-8 last:mb-0 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple rounded-full flex items-center justify-center shadow-medium flex-shrink-0">
                    <item.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  {index < enrollmentSteps.length - 1 && <div className="w-0.5 h-full bg-purple/20 mt-4" />}
                </div>
                <div className="pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-cyan/10 text-cyan px-3 py-1 rounded-full text-sm font-semibold">Step {item.step}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">{item.title}</h3>
                  <p className="text-gray-dark leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prerequisites & Requirements */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">Enrollment Requirements</h2>
              <p className="text-gray-dark mb-8 leading-relaxed">To enroll in our CNA program, you'll need to meet these requirements. Our admissions team will help you gather everything.</p>
              <ul className="space-y-4">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="w-6 h-6 bg-purple/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-purple rounded-full" />
                    </div>
                    <span className="text-charcoal">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col justify-center">
              <div className="bg-background rounded-xl p-8 shadow-soft text-center">
                <div className="w-20 h-20 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="h-10 w-10 text-cyan" />
                </div>
                <h3 className="font-heading font-semibold text-2xl text-charcoal mb-4">Ready to Enroll?</h3>
                <p className="text-gray-dark mb-6">Contact us today to start your application and secure your spot in the next class.</p>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/contact">Contact Admissions <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <p className="text-sm text-gray-medium mt-4">Call: (209) 323-4169</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-dark max-w-2xl mx-auto">We understand you have questions. Here are answers to the most common ones.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border last:border-0 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <button className="w-full py-6 flex items-center justify-between text-left" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <div className="flex items-center gap-4">
                    <HelpCircle className="h-5 w-5 text-purple flex-shrink-0" />
                    <span className="font-semibold text-charcoal pr-4">{faq.question}</span>
                  </div>
                  {openFaq === index ? <ChevronUp className="h-5 w-5 text-purple flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-gray-medium flex-shrink-0" />}
                </button>
                {openFaq === index && (
                  <div className="pb-6 pl-9 animate-fade-in">
                    <p className="text-gray-dark leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-accent section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Take the First Step?</h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">Start your journey today. New classes start monthly - limited seats available!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/contact">Start Your Application <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button variant="purple-outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-magenta" asChild>
              <a href="tel:2093234169">Call (209) 323-4169</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdmissionsPage;