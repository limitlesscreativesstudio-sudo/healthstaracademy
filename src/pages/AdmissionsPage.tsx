import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Download,
} from "lucide-react";
import { useState } from "react";

const AdmissionsPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const enrollmentSteps = [
    {
      step: 1,
      icon: FileText,
      title: "Submit Inquiry Form",
      description: "Fill out our simple online inquiry form to get started. An admissions advisor will contact you within one business hour.",
    },
    {
      step: 2,
      icon: Users,
      title: "Attend Info Session",
      description: "Join a brief information session (in-person or virtual) to learn about the program and get your questions answered.",
    },
    {
      step: 3,
      icon: ClipboardCheck,
      title: "Submit Documents",
      description: "Provide required documents: valid ID, high school diploma or GED, immunization records, and background check authorization.",
    },
    {
      step: 4,
      icon: CreditCard,
      title: "Complete Enrollment",
      description: "Finalize your enrollment by completing payment arrangements. We offer flexible payment plans to fit your budget.",
    },
    {
      step: 5,
      icon: GraduationCap,
      title: "Start Class!",
      description: "Attend orientation and begin your exciting journey toward becoming a Certified Nursing Assistant.",
    },
  ];

  const requirements = [
    "Must be at least 18 years of age (or 16 with parental consent)",
    "High school diploma or GED equivalent",
    "Valid government-issued photo ID",
    "Social Security card or work authorization",
    "Up-to-date immunization records (Hepatitis B, TB test, flu shot)",
    "Pass background check (required for clinical rotations)",
    "Basic English reading and comprehension skills",
    "Physical ability to perform CNA duties (lifting, standing, etc.)",
  ];

  const faqs = [
    {
      question: "Do you offer financial aid or payment plans?",
      answer: "While we don't participate in federal financial aid programs, we offer flexible payment plans that allow you to break tuition into 2-4 manageable monthly payments. We also accept third-party funding from workforce development programs, scholarships, and employer tuition assistance. Contact us to discuss your options.",
    },
    {
      question: "What if I have a criminal record?",
      answer: "Certain criminal offenses may prevent state CNA certification. However, eligibility varies by state and the nature of the offense. We encourage you to contact us directly to discuss your situation confidentially. We'll help you understand your options and whether pursuing CNA certification is viable for you.",
    },
    {
      question: "Can I work while attending classes?",
      answer: "Absolutely! Our flexible schedule options are specifically designed for working adults. We offer day, evening, and weekend classes so you can maintain your current job while training for your new career. Many of our students work full-time while completing the program.",
    },
    {
      question: "What happens if I fail the state exam?",
      answer: "Our 95% first-time pass rate speaks to the quality of our exam preparation. However, if you don't pass on your first attempt, we offer free remediation and will help you prepare to retake the exam. We're committed to your success until you achieve certification.",
    },
    {
      question: "How soon after graduation can I start working?",
      answer: "Many of our students receive job offers before they even complete the program! Once you pass your state exam, you can begin working immediately. Our career services team actively connects graduates with hiring employers in our network.",
    },
    {
      question: "Do you provide job placement assistance?",
      answer: "Yes! Our comprehensive career support includes resume writing workshops, interview preparation, and direct connections to hiring managers at hospitals, nursing homes, home health agencies, and rehabilitation centers. Over 90% of our graduates find employment within 3 months.",
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
            Your Application Checklist:<br />
            <span className="text-coral">Simple, Clear, and Supported</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            We've made the enrollment process straightforward so you can focus on what matters most—starting your healthcare career.
          </p>
        </div>
      </section>

      {/* 5-Step Enrollment Process */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              5-Step Enrollment Process
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              From inquiry to your first day of class, we guide you through every step.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {enrollmentSteps.map((item, index) => (
              <div
                key={item.step}
                className="flex gap-6 mb-8 last:mb-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center shadow-medium flex-shrink-0">
                    <item.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  {index < enrollmentSteps.length - 1 && (
                    <div className="w-0.5 h-full bg-teal/20 mt-4" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-coral/10 text-coral px-3 py-1 rounded-full text-sm font-semibold">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
                    {item.title}
                  </h3>
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
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">
                Prerequisites & Requirements
              </h2>
              <p className="text-gray-dark mb-8 leading-relaxed">
                To enroll in our CNA program, you'll need to meet the following requirements. 
                Don't worry—our admissions team will help you gather everything you need.
              </p>
              <ul className="space-y-4">
                {requirements.map((req, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-6 h-6 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-teal rounded-full" />
                    </div>
                    <span className="text-charcoal">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download Checklist CTA */}
            <div className="flex flex-col justify-center">
              <div className="bg-background rounded-xl p-8 shadow-soft text-center">
                <div className="w-20 h-20 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="h-10 w-10 text-coral" />
                </div>
                <h3 className="font-heading font-semibold text-2xl text-charcoal mb-4">
                  Get the Full Checklist
                </h3>
                <p className="text-gray-dark mb-6">
                  Download our complete admissions checklist to keep track of all required documents and steps.
                </p>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/contact">
                    Download Checklist <Download className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-medium mt-4">
                  Or call us: (555) 123-HEAL
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              We understand you have questions. Here are answers to the most common ones.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-border last:border-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  className="w-full py-6 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex items-center gap-4">
                    <HelpCircle className="h-5 w-5 text-teal flex-shrink-0" />
                    <span className="font-semibold text-charcoal pr-4">{faq.question}</span>
                  </div>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-teal flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-medium flex-shrink-0" />
                  )}
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
      <section className="gradient-coral section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Ready to Take the First Step?
          </h2>
          <p className="text-secondary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
            Start your journey today. Fill out our inquiry form and an admissions advisor will contact you within one business hour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="lg" asChild>
              <Link to="/contact">
                Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="coral-outline" 
              size="lg" 
              className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-coral" 
              asChild
            >
              <a href="tel:5551234325">Call (555) 123-HEAL</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdmissionsPage;
