import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Award,
  Users,
  BookOpen,
  Stethoscope,
  Building,
  HeartHandshake,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import instructorJane from "@/assets/instructor-jane.jpg";
import instructorJohn from "@/assets/instructor-john.jpg";
import trainingLab from "@/assets/training-lab.jpg";

const AboutPage = () => {
  const whyChooseUs = [
    "State-Approved & Accredited Curriculum",
    "Experienced Instructors Who Care",
    "Small Class Sizes for Personalized Attention",
    "Modern Skills Lab & Real Clinical Partners",
    "Comprehensive Job Placement Assistance",
    "Flexible Scheduling Options",
  ];

  const instructors = [
    {
      name: "Jane Doe, RN",
      role: "Lead Instructor",
      image: instructorJane,
      bio: "With 15 years of bedside nursing experience, my passion is translating real-world skills to the next generation of CNAs. I believe in hands-on learning and building confidence.",
    },
    {
      name: "John Smith, CNA",
      role: "Clinical Instructor",
      image: instructorJohn,
      bio: "I remember being in your shoes. My goal is to build your confidence so you walk into your first job ready to excel. Every student deserves personalized attention.",
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
            Our Mission: To Train Exceptional,<br />
            <span className="text-coral">Compassionate Caregivers</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            At HealthStar Academy, we believe everyone deserves access to quality healthcare education. 
            We're committed to preparing you for a rewarding career that makes a difference.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">
                Our Story
              </h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                HealthStar Academy was founded with a simple yet powerful vision: to create a pathway for 
                aspiring healthcare professionals to enter the field quickly, affordably, and with the 
                confidence they need to succeed.
              </p>
              <p className="text-gray-dark mb-4 leading-relaxed">
                Our founders recognized that traditional healthcare education often presents barriers—time, 
                cost, and complexity—that prevent motivated individuals from pursuing their calling. 
                We set out to change that.
              </p>
              <p className="text-gray-dark leading-relaxed">
                Today, we've helped hundreds of students launch meaningful careers as Certified Nursing 
                Assistants. Our graduates work in hospitals, nursing homes, home health agencies, and 
                rehabilitation centers across the region, providing compassionate care to those who need it most.
              </p>
            </div>
            <div className="animate-slide-in-right">
              <img
                src={trainingLab}
                alt="HealthStar Academy training facility"
                className="rounded-xl shadow-medium w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Instructors */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Meet Your Instructors
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Learn from experienced healthcare professionals who are passionate about your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {instructors.map((instructor, index) => (
              <div
                key={instructor.name}
                className="bg-background rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl text-charcoal">
                    {instructor.name}
                  </h3>
                  <p className="text-teal font-medium text-sm mb-4">{instructor.role}</p>
                  <p className="text-gray-dark text-sm leading-relaxed">
                    "{instructor.bio}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">
                Why Choose HealthStar Academy?
              </h2>
              <p className="text-gray-dark mb-8">
                We've built our program around your success. Here's what sets us apart from other 
                CNA training programs.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {whyChooseUs.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0" />
                    <span className="text-charcoal font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, label: "State Approved", value: "100%" },
                { icon: Users, label: "Class Size", value: "12 Max" },
                { icon: Stethoscope, label: "Clinical Hours", value: "40+" },
                { icon: HeartHandshake, label: "Job Placement", value: "90%+" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-neutral-light rounded-xl p-6 text-center animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className="h-8 w-8 text-teal mx-auto mb-3" />
                  <p className="font-heading text-2xl font-bold text-charcoal mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-dark">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-coral section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Ready to Learn from the Best?
          </h2>
          <p className="text-secondary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
            Discover our comprehensive CNA program and see how we can help you achieve your healthcare career goals.
          </p>
          <Button variant="default" size="lg" asChild>
            <Link to="/programs">
              Explore Our Program <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
