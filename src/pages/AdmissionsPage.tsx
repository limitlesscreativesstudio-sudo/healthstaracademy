import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, ClipboardCheck, CreditCard, GraduationCap, ArrowRight, ChevronDown, ChevronUp, HelpCircle, Download, Laptop, CheckCircle, BookOpen, CalendarCheck, UserCheck } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import studentBloodPressure from "@/assets/student-blood-pressure.jpg";
import { useState } from "react";

const ENROLLMENT_LINK = "https://docs.google.com/forms/d/1FSLGdKSFD6HWoUUBYxLNLMxYXvoiDz0LVCFbrfX4Gj0/viewform?edit_requested=true";

const AdmissionsPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const enrollmentSteps = [
    { step: 1, icon: ClipboardCheck, title: "Pre-Qualification Questionnaire", description: "Complete our pre-qualification questionnaire to ensure you have everything needed to start the program. If anything is missing, you'll need to obtain it and resubmit before moving to the next step." },
    { step: 2, icon: BookOpen, title: "Student Handbook Review", description: "Once qualified, you'll receive the student handbook to review and sign. Return the signed handbook to the admissions team to proceed." },
    { step: 3, icon: FileText, title: "Enrollment Application & Fee", description: "Complete and sign the enrollment application, submit necessary documents, and pay the $175 enrollment fee to secure your spot." },
    { step: 4, icon: UserCheck, title: "LiveScan Background Check", description: "You'll receive an email with instructions to complete your LiveScan background check at an approved location." },
    { step: 5, icon: CalendarCheck, title: "Select Cohort & Pay Tuition", description: "Choose your preferred cohort start date and complete tuition payment using available payment options including Stripe, Klarna, Afterpay, Zip, or Apple Pay." },
    { step: 6, icon: GraduationCap, title: "Enrollment & Orientation", description: "Once payment is complete, you're enrolled in Canvas LMS to access your course. You'll receive your orientation date where you'll get all tools needed—including your Chromebook ($249 value)—to access course materials." },
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
    { question: "Do you offer payment plans?", answer: "Yes! We accept payments through Stripe, which offers flexible options including Klarna, Afterpay, Zip, and Apple Pay for full tuition payment or payment plans. We've also partnered with Self-Help Federal Credit Union and Denefits for additional financing. Denefits offers no credit check financing with guaranteed approvals and instant pre-approval decisions." },
    { question: "What is the refund policy?", answer: "Students are entitled to a refund up to 5 days after the program start date, minus a $495 administrative fee. After 5 days from the program start date, no refund is available." },
    { question: "Is there a separate, non-refundable application or registration fee?", answer: "Yes, there is a $175 non-refundable application fee that must be paid when submitting your enrollment application." },
    { question: "What is the attendance policy, and what are the procedures for making up missed classes or clinical hours?", answer: "Students may miss no more than 2 days throughout the program. Any missed days must be made up to complete the program requirements." },
    { question: "What if I have a criminal record?", answer: "Certain offenses may prevent state CNA certification. Contact us to discuss your situation confidentially. We'll help you understand your options." },
    { question: "Can I work while attending?", answer: "Absolutely! Our hybrid format with flexible online theory and scheduled clinicals is designed for working adults." },
    { question: "Do I need a high school diploma?", answer: "A GED/High School Diploma is preferred but not required. If you don't have one, you can pass our entrance exam with 75% or above to qualify." },
    { question: "How long is the program?", answer: "The program is 160 total hours: 60 hours online theory + 100 hours clinical. Our daytime program takes 6 weeks." },
    { question: "Where are the clinical sites?", answer: "Clinical training is held at approved healthcare facilities in Stockton, Lodi, and Hayward—with plans to expand throughout California." },
    { question: "Do I get any equipment or materials?", answer: "Yes! All students receive a Chromebook valued at $249 during orientation to access course materials. Your tuition also includes textbooks, workbook, uniform, BP cuff/stethoscope, and lab supplies." },
  ];

  return (
    <main className="pt-28 md:pt-32">
      {/* Hero Section - 16:9 */}
      <HeroBanner
        imageSrc={studentBloodPressure}
        imageAlt="Health Star Academy student practicing vital signs"
        title={
          <>
            Your Application<br />
            Checklist:<br />
            <span className="text-cyan">Simple & Clear</span>
          </>
        }
        subtitle="New Classes Start Monthly!"
      />

      {/* 6-Step Enrollment Process */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">6-Step Enrollment Process</h2>
            <p className="text-gray-dark max-w-2xl mx-auto">From pre-qualification to your first day of class, we guide you through every step.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {enrollmentSteps.map((item, index) => (
              <div key={item.step} className="flex gap-6 mb-6 last:mb-0 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
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

      {/* Chromebook Highlight */}
      <section className="bg-cyan/10 py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-cyan rounded-full flex items-center justify-center flex-shrink-0">
              <Laptop className="h-10 w-10 text-charcoal" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-2xl text-charcoal mb-2">Chromebook Included — $249 Value!</h3>
              <p className="text-gray-dark max-w-xl">Every student receives a Chromebook during orientation to access course materials. It's part of our commitment to removing barriers and setting you up for success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prerequisites & Requirements */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">Enrollment Requirements</h2>
              <p className="text-gray-dark mb-6 leading-relaxed">To enroll in our CNA program, you'll need to meet these requirements. Our admissions team will help you gather everything.</p>
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
              <div className="bg-background rounded-xl p-6 shadow-soft text-center">
                <div className="w-16 h-16 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-cyan" />
                </div>
                <h3 className="font-heading font-semibold text-2xl text-charcoal mb-3">Ready to Enroll?</h3>
                <p className="text-gray-dark mb-6">Start your application today and secure your spot in the next class.</p>
                <Button variant="secondary" size="lg" asChild>
                  <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">Enroll Now <ArrowRight className="ml-2 h-5 w-5" /></a>
                </Button>
                <p className="text-sm text-gray-medium mt-4">
                  Call: <a href="tel:2093234169" className="text-purple hover:underline">(209) 323-4169</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">Payment Options</h2>
            <p className="text-gray-dark max-w-2xl mx-auto">We've partnered with trusted payment providers to make your education accessible.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-neutral-light rounded-xl p-6 text-center">
              <CreditCard className="h-10 w-10 text-purple mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Stripe Payments</h3>
              <p className="text-gray-dark text-sm">Full tuition or payment plans via Klarna, Afterpay, Zip, Apple Pay & more</p>
            </div>
            <div className="bg-neutral-light rounded-xl p-6 text-center">
              <CheckCircle className="h-10 w-10 text-purple mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">Self-Help Credit Union</h3>
              <p className="text-gray-dark text-sm">Payment plans, loans, and financing support available</p>
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
              <Users className="h-10 w-10 text-purple mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg text-charcoal mb-2">Denefits Financing</h3>
              <p className="text-gray-dark text-sm mb-2">No credit check, guaranteed approvals</p>
              <span className="text-purple font-semibold text-sm">Click to apply now →</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">Frequently Asked Questions</h2>
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
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Ready to Take the First Step?</h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-6 text-lg">Start your journey today. New classes start monthly - limited seats available!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">Start Your Application <ArrowRight className="ml-2 h-5 w-5" /></a>
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
