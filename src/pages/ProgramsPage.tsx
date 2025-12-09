import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  BookOpen,
  Stethoscope,
  FileCheck,
  Briefcase,
  ArrowRight,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import trainingLab from "@/assets/training-lab.jpg";

const ProgramsPage = () => {
  const programDetails = [
    { label: "Program Length", value: "120 Hours Total | 4-8 Weeks", icon: Clock },
    { label: "Class Size", value: "Maximum 12 Students", icon: BookOpen },
    { label: "Clinical Hours", value: "40+ Hours at Partner Facilities", icon: Stethoscope },
    { label: "Certification", value: "State CNA Exam Preparation", icon: FileCheck },
  ];

  const scheduleOptions = [
    { name: "Day Classes", schedule: "Monday - Thursday", time: "9:00 AM - 2:00 PM", duration: "4 weeks" },
    { name: "Evening Classes", schedule: "Monday - Wednesday", time: "6:00 PM - 9:00 PM", duration: "8 weeks" },
    { name: "Weekend Classes", schedule: "Saturday - Sunday", time: "8:00 AM - 5:00 PM", duration: "6 weeks" },
  ];

  const upcomingDates = [
    { date: "January 8, 2024", type: "Day" },
    { date: "January 15, 2024", type: "Evening" },
    { date: "February 3, 2024", type: "Weekend" },
  ];

  const curriculum = [
    {
      module: "Module 1",
      title: "Foundations of Care",
      topics: ["Role of the CNA", "Ethics & Professionalism", "Communication Skills", "Patient Rights"],
    },
    {
      module: "Module 2",
      title: "Safety & Infection Control",
      topics: ["Standard Precautions", "Emergency Procedures", "Fire Safety", "Ergonomics & Body Mechanics"],
    },
    {
      module: "Module 3",
      title: "Patient Care Skills",
      topics: ["Vital Signs Measurement", "Mobility Assistance", "Personal Hygiene", "Nutrition & Feeding"],
    },
    {
      module: "Module 4",
      title: "Clinical Rotations",
      topics: ["Supervised Patient Care", "Real Healthcare Settings", "Team Collaboration", "Documentation"],
    },
    {
      module: "Module 5",
      title: "Exam Prep & Career Readiness",
      topics: ["State Exam Review", "Skills Competency", "Resume Building", "Interview Preparation"],
    },
  ];

  const tuitionIncludes = [
    "Comprehensive Textbook & Study Materials",
    "Complete Skills Kit (Blood Pressure Cuff, Stethoscope, etc.)",
    "Professional Scrub Uniform",
    "State Exam Application Fee",
    "CPR/BLS Certification",
    "Background Check Processing",
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
            Comprehensive CNA Training<br />
            <span className="text-coral">Designed for Your Success</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Our state-approved program combines classroom instruction, hands-on skills training, 
            and real-world clinical experience to prepare you for a rewarding healthcare career.
          </p>
        </div>
      </section>

      {/* Program Overview */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">
                Program Overview
              </h2>
              <p className="text-gray-dark mb-6 leading-relaxed">
                Our Certified Nursing Assistant (CNA) program is designed to provide you with 
                the knowledge, skills, and confidence you need to excel in the healthcare field. 
                Upon completion, you'll be prepared to take the state certification exam and 
                begin your career immediately.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {programDetails.map((detail, index) => (
                  <div
                    key={detail.label}
                    className="bg-neutral-light rounded-lg p-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <detail.icon className="h-6 w-6 text-teal mb-2" />
                    <p className="text-sm text-gray-dark">{detail.label}</p>
                    <p className="font-semibold text-charcoal">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src={trainingLab}
                alt="CNA students practicing in training lab"
                className="rounded-xl shadow-medium w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Options */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Flexible Schedule Options
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              We offer multiple schedule options to fit your lifestyle. Choose the one that works best for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {scheduleOptions.map((option, index) => (
              <div
                key={option.name}
                className="bg-background rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Calendar className="h-10 w-10 text-teal mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
                  {option.name}
                </h3>
                <p className="text-teal font-medium mb-1">{option.schedule}</p>
                <p className="text-gray-dark text-sm mb-2">{option.time}</p>
                <p className="text-charcoal font-semibold">{option.duration}</p>
              </div>
            ))}
          </div>

          {/* Next Start Dates */}
          <div className="bg-background rounded-xl p-8 shadow-soft max-w-2xl mx-auto">
            <h3 className="font-heading font-semibold text-xl text-charcoal mb-6 text-center">
              Upcoming Start Dates
            </h3>
            <div className="space-y-4">
              {upcomingDates.map((item, index) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-teal" />
                    <span className="font-medium text-charcoal">{item.date}</span>
                  </div>
                  <span className="bg-teal/10 text-teal px-3 py-1 rounded-full text-sm font-medium">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button variant="default" asChild>
                <Link to="/contact">Request More Dates</Link>
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
              Our comprehensive curriculum covers everything you need to become a skilled, confident CNA.
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
                  <div className="flex-shrink-0">
                    <span className="bg-teal text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm">
                      {item.module}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.topics.map((topic) => (
                        <span
                          key={topic}
                          className="bg-background text-gray-dark px-3 py-1 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
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
                <div className="w-14 h-14 bg-coral/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-coral" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-2xl text-charcoal">
                    Tuition & Fees
                  </h3>
                  <p className="text-gray-dark">All-inclusive program cost</p>
                </div>
              </div>
              
              <div className="bg-teal/5 rounded-lg p-6 mb-6">
                <p className="text-4xl font-bold text-teal mb-2">$1,495</p>
                <p className="text-gray-dark text-sm">Total Program Cost (Everything Included)</p>
              </div>

              <h4 className="font-semibold text-charcoal mb-4">What's Included:</h4>
              <ul className="space-y-3">
                {tuitionIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                    <span className="text-gray-dark text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Options */}
            <div className="bg-background rounded-xl p-8 shadow-soft">
              <h3 className="font-heading font-semibold text-2xl text-charcoal mb-6">
                Flexible Payment Options
              </h3>
              <p className="text-gray-dark mb-6 leading-relaxed">
                We believe cost shouldn't be a barrier to your healthcare career. That's why we offer 
                flexible payment plans to make your education affordable.
              </p>

              <div className="space-y-4 mb-8">
                <div className="bg-neutral-light rounded-lg p-4">
                  <h4 className="font-semibold text-charcoal mb-1">Pay in Full</h4>
                  <p className="text-sm text-gray-dark">Save $100 with upfront payment</p>
                  <p className="text-teal font-bold mt-2">$1,395</p>
                </div>
                <div className="bg-neutral-light rounded-lg p-4">
                  <h4 className="font-semibold text-charcoal mb-1">2-Payment Plan</h4>
                  <p className="text-sm text-gray-dark">Split into 2 easy payments</p>
                  <p className="text-charcoal font-bold mt-2">$747.50 x 2</p>
                </div>
                <div className="bg-neutral-light rounded-lg p-4">
                  <h4 className="font-semibold text-charcoal mb-1">4-Payment Plan</h4>
                  <p className="text-sm text-gray-dark">Monthly payments available</p>
                  <p className="text-charcoal font-bold mt-2">$373.75 x 4</p>
                </div>
              </div>

              <p className="text-sm text-gray-dark italic">
                "We work with you to make it affordable. Don't let finances hold you back from your dream career."
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
                <Link to="/contact">
                  Contact an Advisor <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="teal-outline" 
                size="lg" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-charcoal" 
                asChild
              >
                <Link to="/admissions">Enroll Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProgramsPage;
