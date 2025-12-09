import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Clock,
  HandHeart,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Quote,
} from "lucide-react";
import heroImage from "@/assets/hero-home.jpg";
import graduateMaria from "@/assets/graduate-maria.jpg";
import studentDavid from "@/assets/student-david.jpg";
import trainingLab from "@/assets/training-lab.jpg";

const HomePage = () => {
  const advantages = [
    {
      icon: Clock,
      title: "Fast & Flexible",
      description: "Day, evening, and weekend classes. Graduate in 4-8 weeks.",
    },
    {
      icon: HandHeart,
      title: "Hands-On Training",
      description: "Learn essential skills in our lab, then practice during real clinical rotations.",
    },
    {
      icon: GraduationCap,
      title: "High Pass Rates",
      description: "Our focused curriculum prepares you to pass the state exam with confidence. 95% First-Time Pass Rate.",
    },
    {
      icon: Briefcase,
      title: "Career Support",
      description: "From resume writing to job leads, we help you launch your career.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Apply & Enroll",
      description: "Complete our straightforward application. We'll guide you through every step.",
    },
    {
      number: "02",
      title: "Train & Learn",
      description: "Master theory in class and skills in our lab and clinical sites.",
    },
    {
      number: "03",
      title: "Get Certified & Hired",
      description: "Pass your state exam with our prep and access our job network.",
    },
  ];

  const testimonials = [
    {
      quote: "I was nervous about going back to school, but the instructors at HealthStar were so patient. They didn't just teach me to pass a test; they taught me to be a good CNA. I had a job offer before I even took my state exam!",
      name: "Maria G.",
      role: "CNA Graduate",
      image: graduateMaria,
    },
    {
      quote: "The payment plan made it possible for me. The class size was small, so I got the help I needed. This program changed my life.",
      name: "David T.",
      role: "Current CNA Student",
      image: studentDavid,
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/40" />
        </div>
        
        <div className="container-custom relative z-10 pt-20">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
              Launch Your Healthcare Career in Just{" "}
              <span className="text-coral">4-8 Weeks</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in-up animation-delay-100">
              Get the hands-on training, state-approved certification, and job placement support you need to become a sought-after Certified Nursing Assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-200">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/admissions">
                  Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="teal-outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-charcoal" asChild>
                <Link to="/programs">View Our Program</Link>
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
              Why HealthStar Academy is Your Smartest First Step
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              We've designed our program to remove barriers and accelerate your success in healthcare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={advantage.title}
                className="bg-background rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-teal/10 rounded-xl flex items-center justify-center mb-4">
                  <advantage.icon className="h-7 w-7 text-teal" />
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
              It's simpler than you think. We've streamlined the process so you can focus on learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-teal via-coral to-teal" />
            
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-teal to-teal-dark rounded-full flex items-center justify-center mb-6 shadow-medium relative z-10">
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
              <Link to="/admissions">
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
          alt="HealthStar Academy modern skills training lab with medical equipment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent flex items-end">
          <div className="container-custom pb-12">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              State-of-the-Art Training Facilities
            </h3>
            <p className="text-primary-foreground/80 max-w-xl">
              Practice on the same equipment you'll use in real healthcare settings.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Hear From Our Graduates
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Real stories from real students who transformed their lives through HealthStar Academy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-background rounded-xl p-8 shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Quote className="h-10 w-10 text-coral/30 mb-4" />
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
            <Button variant="coral-outline" size="lg" asChild>
              <Link to="/success-stories">
                Read More Success Stories <ArrowRight className="ml-2 h-5 w-5" />
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
            Don't just dream about a stable, rewarding job where you help others. Make it a reality.
          </p>
          <Button variant="secondary" size="xl" asChild>
            <Link to="/admissions">
              Secure Your Spot in the Next Class <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
