import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Clock,
  HandHeart,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Quote,
  Laptop,
} from "lucide-react";
import heroImage from "@/assets/hero-home.jpg";
import heroPrograms from "@/assets/hero-programs.jpg";
import graduateMaria from "@/assets/graduate-maria.jpg";
import studentDavid from "@/assets/student-david.jpg";
import trainingLab from "@/assets/training-lab.jpg";

const ENROLLMENT_LINK = "https://docs.google.com/forms/d/1FSLGdKSFD6HWoUUBYxLNLMxYXvoiDz0LVCFbrfX4Gj0/viewform?edit_requested=true";

const HomePage = () => {
  const advantages = [
    {
      icon: Clock,
      title: "Fast & Flexible",
      description: "Daytime classes available. Complete in just 6 weeks with our hybrid format.",
    },
    {
      icon: HandHeart,
      title: "Hands-On Training",
      description: "100 hours of clinical training at approved facilities in Stockton, Lodi, and Hayward.",
    },
    {
      icon: GraduationCap,
      title: "CDPH Approved",
      description: "100% California Department of Public Health approved curriculum with experienced RN instructors.",
    },
    {
      icon: Briefcase,
      title: "Job Placement Support",
      description: "Job placement support. Many graduates secure positions before completing the program.",
    },
    {
      icon: Laptop,
      title: "Chromebook Included",
      description: "Every student receives a Chromebook ($499 value) during orientation to access course materials.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Apply & Enroll",
      description: "Complete our straightforward application with required documents. Payment plans available.",
    },
    {
      number: "02",
      title: "Train & Learn",
      description: "60 hours online theory + 100 hours hands-on clinical at approved healthcare facilities.",
    },
    {
      number: "03",
      title: "Get Certified & Hired",
      description: "Pass your state exam with our prep and access job opportunities immediately.",
    },
  ];

  const testimonials = [
    {
      quote: "Amazing program! The instructors are up to date with knowledge, teach well, and are generous with their ideas!",
      name: "Trevor H.",
      role: "CNA Graduate",
      image: graduateMaria,
    },
    {
      quote: "Excellent learning tool, concise and clear videos, explained well. Highly recommend this program to anyone looking to start their healthcare career.",
      name: "Jenna K.",
      role: "CNA Graduate",
      image: studentDavid,
    },
  ];

  return (
    <main className="pt-10">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-purple via-purple/90 to-cyan/80">
        <div className="container-custom relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
                Start Your CNA{" "}
                <span className="text-cyan">Journey Today!</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in-up animation-delay-100">
                Enroll in our state-certified hybrid CNA training program and begin your path to a rewarding healthcare career. Complete in just 6 weeks!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-200">
                <Button variant="secondary" size="lg" asChild>
                  <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">
                    Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button variant="purple-outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-charcoal" asChild>
                  <Link to="/programs">View Our Program</Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in-up animation-delay-300">
              <div className="relative rounded-2xl overflow-hidden shadow-strong">
                <img
                  src={heroPrograms}
                  alt="Health Star Academy CNA students in training"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-cyan text-charcoal px-6 py-3 rounded-xl shadow-medium font-heading font-semibold">
                CDPH Approved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Why Choose Health Star Academy?
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              State-approved hybrid CNA training – Start in just a few weeks with flexible online classes and in-person clinicals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={advantage.title}
                className="bg-background rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-purple/10 rounded-xl flex items-center justify-center mb-4">
                  <advantage.icon className="h-7 w-7 text-purple" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
                  {advantage.title}
                </h3>
                <p className="text-gray-dark text-sm">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Your Path from Curiosity to Certified
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              It's simpler than you think. Our 160-hour program includes 60 hours theory and 100 hours clinical training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple via-cyan to-purple" />
            
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple to-cyan rounded-full flex items-center justify-center mb-6 shadow-medium relative z-10">
                  <span className="font-heading text-4xl font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-xl text-charcoal mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-dark text-sm max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="default" size="lg" asChild>
              <Link to="/programs/admissions">
                See Full Enrollment Process <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Training Lab Image Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={trainingLab}
          alt="Health Star Academy clinical training at approved healthcare facilities"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent flex items-end">
          <div className="container-custom pb-12">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              Clinical Training at Approved Facilities
            </h3>
            <p className="text-primary-foreground/80 max-w-xl">
              Hands-on experience at approved healthcare facilities in Stockton, Lodi, and Hayward.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              What Others Say About Us
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Real stories from real students who transformed their lives through Health Star Academy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-background rounded-xl p-8 shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Quote className="h-10 w-10 text-purple/30 mb-4" />
                <p className="text-charcoal mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-heading font-semibold text-charcoal">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-dark">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="cyan-outline" size="lg" asChild>
              <Link to="/gallery">
                View Our Gallery <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="gradient-hero section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Your New Career in Healthcare Starts with a Single Decision
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
            No prerequisites required. Payment plans available. New classes start monthly.
          </p>
          <Button variant="secondary" size="xl" asChild>
            <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">
              Secure Your Spot in the Next Class <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
