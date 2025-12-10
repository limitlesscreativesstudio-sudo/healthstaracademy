import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, Users, Stethoscope, HeartHandshake, ArrowRight, CheckCircle } from "lucide-react";
import instructorJane from "@/assets/instructor-jane.jpg";
import instructorJohn from "@/assets/instructor-john.jpg";
import trainingLab from "@/assets/training-lab.jpg";

const AboutPage = () => {
  const whyChooseUs = [
    "100% CDPH Approved Curriculum",
    "Experienced RN Instructors",
    "Flexible Hybrid Format - Online + In-Person",
    "Clinical Training at Approved Facilities",
    "Job Placement Assistance",
    "No Prerequisites Required",
  ];

  const instructors = [
    {
      name: "RN Instructor",
      role: "Lead Instructor",
      image: instructorJane,
      bio: "Our lead instructors bring years of bedside nursing experience and a passion for training the next generation of CNAs with real-world, hands-on skills.",
    },
    {
      name: "Clinical Instructor",
      role: "Clinical Training",
      image: instructorJohn,
      bio: "Our clinical instructors provide supportive, personalized guidance at approved healthcare facilities to build your confidence for your first CNA position.",
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
            Our Mission: Quality, Affordable<br />
            <span className="text-cyan">CNA Training for Everyone</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            At Health Star Academy, we empower students with the knowledge, skills, and confidence to build a stable career in healthcare and make a lasting impact in their communities.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">Our Story</h2>
              <p className="text-gray-dark mb-4 leading-relaxed">
                Health Star Academy was founded to be a leading provider of online CNA education, equipping students with the knowledge, skills, and confidence needed to begin a successful career in healthcare.
              </p>
              <p className="text-gray-dark mb-4 leading-relaxed">
                We are committed to delivering high-quality, flexible training that prepares future Certified Nursing Assistants to excel in patient care. Our program is designed not just to teach skills, but to set students up for long-term success.
              </p>
              <p className="text-gray-dark leading-relaxed">
                Many of our graduates have gone on to secure CNA positions immediately after completing the program, working in hospitals, skilled nursing facilities, home health care, assisted living, hospice, and more.
              </p>
            </div>
            <div className="animate-slide-in-right">
              <img src={trainingLab} alt="HealthStar Academy clinical training" className="rounded-xl shadow-medium w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Instructors */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">Our Team</h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Our team is made up of experienced clinical professionals who bring real-world expertise and a passion for teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {instructors.map((instructor, index) => (
              <div key={instructor.name} className="bg-background rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <img src={instructor.image} alt={instructor.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl text-charcoal">{instructor.name}</h3>
                  <p className="text-purple font-medium text-sm mb-4">{instructor.role}</p>
                  <p className="text-gray-dark text-sm leading-relaxed">"{instructor.bio}"</p>
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
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6">Why Choose Health Star Academy?</h2>
              <p className="text-gray-dark mb-8">We provide a supportive learning environment that prepares future healthcare professionals to thrive.</p>
              <div className="grid grid-cols-1 gap-4">
                {whyChooseUs.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <CheckCircle className="h-5 w-5 text-purple flex-shrink-0" />
                    <span className="text-charcoal font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, label: "CDPH Approved", value: "100%" },
                { icon: Users, label: "Clinical Hours", value: "100" },
                { icon: Stethoscope, label: "Theory Hours", value: "60" },
                { icon: HeartHandshake, label: "Job Placement", value: "Yes" },
              ].map((stat, index) => (
                <div key={stat.label} className="bg-neutral-light rounded-xl p-6 text-center animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <stat.icon className="h-8 w-8 text-purple mx-auto mb-3" />
                  <p className="font-heading text-2xl font-bold text-charcoal mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-dark">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-accent section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Learn from the Best?</h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">Discover our comprehensive CNA program and see how we can help you achieve your healthcare career goals.</p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/programs">Explore Our Program <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;