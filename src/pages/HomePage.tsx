import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Clock,
  HandHeart,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Quote,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import studentsTrainingGroup from "@/assets/students-training-group.png";
import cnaStudentsGroup from "@/assets/cna-students-group.png";

const ENROLLMENT_LINK = "https://docs.google.com/forms/d/1FSLGdKSFD6HWoUUBYxLNLMxYXvoiDz0LVCFbrfX4Gj0/viewform?edit_requested=true";

const DENEFITS_LINK = "https://request.denefits.com/finance-panel?product_code=pc_f28b592da1a9&auth_token=e8e50ae34c588f3dbea2c194d7e8440a";

const HomePage = () => {
  const advantages = [
    {
      icon: Clock,
      title: "Fast-Track Training",
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
      icon: Laptop,
      title: "Chromebook Provided",
      description: "Every student receives a Chromebook ($249 value) to use while in the program.",
    },
    {
      icon: Briefcase,
      title: "Career Resources",
      description: "Resume support and career guidance. Many graduates secure positions before completing the program.",
    },
    {
      icon: Users,
      title: "Small Class Sizes",
      description: "Personalized attention with small class sizes ensures you get the support you need to succeed.",
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
      quote: "Highly qualified instructors, extremely knowledgeable.",
      name: "Sheila L.",
      role: "Google Review ★★★★★",
    },
    {
      quote: "It's been an experience I'll remember for the rest of my life.",
      name: "Chiara N.",
      role: "Google Review ★★★★★",
    },
    {
      quote: "Healthcare delivery thrives with thoroughly trained CNAs!",
      name: "Sheremoya RN",
      role: "Google Review ★★★★★",
    },
    {
      quote: "Amazing program! The instructors are up to date with knowledge, teach well, and are generous with their ideas!",
      name: "Trevor H.",
      role: "CNA Graduate",
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <main className="pt-28 md:pt-32">
      {/* Hero Section - 16:9 */}
      <HeroBanner
        imageSrc={studentsTrainingGroup}
        imageAlt="Health Star Academy CNA students in clinical training"
        title={
          <>
            Start Your CNA<br />
            <span className="text-cyan">Journey Today!</span>
          </>
        }
        subtitle="Enroll in our state-certified hybrid CNA training program"
      />

      {/* Quick CTA below hero */}
      <section className="py-8 bg-purple">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <p className="text-primary-foreground font-medium text-center">
              Complete in just 6 weeks! CDPH Approved Program.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" asChild>
                <a href={ENROLLMENT_LINK} target="_blank" rel="noopener noreferrer">
                  Start Your Application <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="purple-outline" size="sm" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-charcoal" asChild>
                <Link to="/programs">View Program</Link>
              </Button>
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
          src={cnaStudentsGroup}
          alt="Health Star Academy diverse CNA students ready for their healthcare careers"
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

      {/* Testimonials Section - Carousel */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl font-bold text-charcoal">5.0</span>
              <span className="text-yellow-500 text-xl">★★★★★</span>
              <span className="text-gray-dark text-sm">(10 Google Reviews)</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              What Others Say About Us
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Real stories from real students who transformed their lives through Health Star Academy.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="bg-background rounded-xl p-8 shadow-soft">
              <Quote className="h-10 w-10 text-purple/30 mb-4" />
              <p className="text-charcoal mb-6 leading-relaxed italic text-lg">
                "{testimonials[currentTestimonial].quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-purple/10 flex items-center justify-center">
                  <span className="text-purple font-bold text-xl">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-semibold text-charcoal">
                    {testimonials[currentTestimonial].name}
                  </p>
                  <p className="text-sm text-gray-dark">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>
            
            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center hover:bg-purple hover:text-primary-foreground transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTestimonial ? "bg-purple" : "bg-purple/30"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center hover:bg-purple hover:text-primary-foreground transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
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
