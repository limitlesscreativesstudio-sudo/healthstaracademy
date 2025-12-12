import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  BookOpen,
  Stethoscope,
  FileCheck,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Laptop,
} from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import diverseStudentsTraining from "@/assets/diverse-students-training.jpg";
import cnaStudentsGroup from "@/assets/cna-students-group.png";

const ProgramsPage = () => {
  const ENROLLMENT_LINK = "https://docs.google.com/forms/d/1FSLGdKSFD6HWoUUBYxLNLMxYXvoiDz0LVCFbrfX4Gj0/viewform?edit_requested=true";

  const programDetails = [
    { label: "Program Length", value: "160 Hours | 6 Weeks", icon: Clock },
    { label: "Theory Hours", value: "60 Hours Online", icon: BookOpen },
    { label: "Clinical Hours", value: "100 Hours In-Person", icon: Stethoscope },
    { label: "Certification", value: "CDPH Approved", icon: FileCheck },
  ];

  const upcomingDates = [
    { date: "January 26, 2025", endDate: "March 7, 2025" },
    { date: "March 17, 2025", endDate: "April 28, 2025" },
    { date: "May 5, 2025", endDate: "June 16, 2025" },
    { date: "June 23, 2025", endDate: "August 4, 2025" },
  ];

  const curriculum = [
    { module: "Module 1-3", title: "Introductions, Patients' Rights & Interpersonal Skills" },
    { module: "Module 4-6", title: "Catastrophe Prevention, Body Mechanics & Asepsis" },
    { module: "Module 7-9", title: "Weights/Measures, Patient Care Skills & Procedures" },
    { module: "Module 10-12", title: "Vital Signs, Nutrition & Emergency Procedures" },
    { module: "Module 13-17", title: "Long-Term Care, Rehab Nursing, Charting, Death/Dying & Abuse" },
  ];

  const tuitionBreakdown = [
    { item: "Tuition", cost: "$2,184" },
    { item: "Lab Supplies", cost: "$100" },
    { item: "LiveScan Background Check", cost: "$80" },
    { item: "Textbook", cost: "$45" },
    { item: "Uniform (Scrubs)", cost: "$35" },
    { item: "Workbook", cost: "$30" },
    { item: "Blood Pressure Cuff & Stethoscope", cost: "$25" },
  ];

  return (
    <main className="pt-28 md:pt-32">
      {/* Hero Section - 16:9 */}
      <HeroBanner
        imageSrc={cnaStudentsGroup}
        imageAlt="Health Star Academy CNA students in scrubs ready for their healthcare career"
        title={
          <>
            Comprehensive CNA Training<br />
            <span className="text-cyan">Designed for Your Success</span>
          </>
        }
        subtitle="CDPH-approved hybrid program with hands-on clinical experience"
      />

      {/* Program Overview */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">
                Program Overview
              </h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Health Star Academy's CDPH-approved Online CNA Program offers the perfect blend of flexibility and hands-on training. Complete online coursework at your own pace while gaining real-world experience at our clinical training sites in Stockton, Lodi, and Hayward—with plans to expand throughout California.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {programDetails.map((detail, index) => (
                  <div
                    key={detail.label}
                    className="bg-neutral-light rounded-lg p-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <detail.icon className="h-6 w-6 text-purple mb-2" />
                    <p className="text-sm text-gray-dark">{detail.label}</p>
                    <p className="font-semibold text-charcoal">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src={diverseStudentsTraining}
                alt="CNA students practicing clinical skills with instructor"
                className="rounded-xl shadow-medium w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Chromebook Highlight */}
      <section className="bg-cyan/10 py-12">
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

      {/* Schedule & Start Dates */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Daytime Program Schedule
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Our daytime program runs Monday through Thursday, allowing you to complete your training in 6 weeks.
            </p>
          </div>

          <div className="bg-background rounded-xl p-6 shadow-soft max-w-md mx-auto mb-12 text-center">
            <Calendar className="h-10 w-10 text-purple mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
              Daytime Program
            </h3>
            <p className="text-purple font-medium mb-1">Monday - Thursday</p>
            <p className="text-gray-dark text-sm mb-2">6:00 AM - 2:30 PM</p>
            <p className="text-charcoal font-semibold">6 Weeks</p>
          </div>

          {/* Next Start Dates */}
          <div className="bg-background rounded-xl p-8 shadow-soft max-w-2xl mx-auto">
            <h3 className="font-heading font-semibold text-xl text-charcoal mb-6 text-center">
              Upcoming Class Dates
            </h3>
            <div className="space-y-4">
              {upcomingDates.map((item, index) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-purple" />
                    <span className="font-medium text-charcoal">{item.date}</span>
                  </div>
                  <span className="text-gray-dark text-sm">
                    Ends: {item.endDate}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button variant="default" asChild>
                <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">Enroll for Next Class</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              What You'll Learn
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              17 comprehensive modules covering everything you need to become a skilled, confident CNA.
            </p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {curriculum.map((item, index) => (
              <div
                key={item.module}
                className="bg-neutral-light rounded-xl p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <span className="bg-purple text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0">
                    {item.module}
                  </span>
                  <h3 className="font-heading font-semibold text-lg text-charcoal">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tuition & Financial Info */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Tuition Card */}
            <div className="bg-background rounded-xl p-8 shadow-soft">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-cyan/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-cyan" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-2xl text-charcoal">
                    Tuition & Fees
                  </h3>
                  <p className="text-gray-dark">All-inclusive program cost</p>
                </div>
              </div>
              
              <div className="bg-purple/5 rounded-lg p-6 mb-6">
                <p className="text-4xl font-bold text-purple mb-2">$2,499</p>
                <p className="text-gray-dark text-sm">Total Program Cost (Everything Included)</p>
              </div>

              <h4 className="font-semibold text-charcoal mb-4">What's Included:</h4>
              <ul className="space-y-3">
                {tuitionBreakdown.map((item) => (
                  <li key={item.item} className="flex items-center justify-between">
                    <span className="text-gray-dark text-sm">{item.item}</span>
                    <span className="font-medium text-charcoal">{item.cost}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Options */}
            <div className="bg-background rounded-xl p-8 shadow-soft">
              <h3 className="font-heading font-semibold text-2xl text-charcoal mb-6">
                Financial Assistance & Payment Options
              </h3>
              <p className="text-gray-dark mb-6 leading-relaxed">
                We believe financial barriers should never hold you back. We accept payments through Stripe and have partnered with trusted organizations to provide affordable payment solutions.
              </p>

              <div className="space-y-4 mb-8">
                <div className="bg-neutral-light rounded-lg p-4">
                  <h4 className="font-semibold text-charcoal mb-1">Stripe Payment Processing</h4>
                  <p className="text-sm text-gray-dark">Full tuition or payment plans via Klarna, Afterpay, Zip, Apple Pay & more</p>
                </div>
                <div className="bg-neutral-light rounded-lg p-4">
                  <h4 className="font-semibold text-charcoal mb-1">Self-Help Federal Credit Union</h4>
                  <p className="text-sm text-gray-dark">Payment plans, loans, and financing support available</p>
                </div>
                <a 
                  href="https://request.denefits.com/finance-panel?product_code=pc_f28b592da1a9&auth_token=e8e50ae34c588f3dbea2c194d7e8440a" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-cyan/20 to-magenta/20 rounded-lg p-5 hover:from-cyan/30 hover:to-magenta/30 transition-all border-2 border-cyan shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-cyan text-charcoal text-xs font-bold px-2 py-1 rounded">RECOMMENDED</span>
                    <span className="text-xs text-gray-dark">No Credit Check Required</span>
                  </div>
                  <h4 className="font-bold text-charcoal text-lg mb-1">Denefits Financing</h4>
                  <p className="text-sm text-gray-dark mb-2">Guaranteed approvals • Instant pre-approval • Affordable monthly payments</p>
                  <span className="text-purple font-semibold text-sm">Click here to apply now →</span>
                </a>
              </div>

              <p className="text-sm text-gray-dark italic mb-4">
                Have questions? Call our Admissions Team at (209) 323-4169 for personalized guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero section-padding">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Have Questions? Ready to Begin?
              </h2>
              <p className="text-primary-foreground/90 text-lg">
                Our admissions team is here to help you every step of the way.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/programs/admissions">
                  See Full Enrollment Process <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="purple-outline" 
                size="lg" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-charcoal" 
                asChild
              >
                <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">Enroll Now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProgramsPage;
