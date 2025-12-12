import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, Users, Stethoscope, HeartHandshake, ArrowRight, CheckCircle } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import instructorTeachingMannequin from "@/assets/instructor-teaching-mannequin.jpg";
import instructorStethoscopeTraining from "@/assets/instructor-stethoscope-training.jpg";
import diverseStudentsTraining from "@/assets/diverse-students-training.jpg";
import cnaPatientCare from "@/assets/cna-patient-care.png";

const AboutPage = () => {
  const whyChooseUs = [
    { text: "100% CDPH Approved Curriculum", link: "https://www.cdph.ca.gov/Programs/CHCQ/LCP/Pages/Certified-Nurse-Assistant-Training-Programs.aspx" },
    { text: "Experienced RN & LPN Instructors", link: null },
    { text: "Hybrid Format - Online + In-Person", link: null },
    { text: "Clinical Training at Approved Facilities", link: null },
    { text: "Chromebook Included ($249 Value)", link: null },
    { text: "No Prerequisites Required", link: null },
  ];

  const leadership = [
    {
      name: "Agnes Adebe, MSN",
      role: "Co-Owner & Program Director",
      image: instructorTeachingMannequin,
      bio: "With over 30 years of experience in healthcare, Agnes brings a wealth of clinical knowledge and a passion for mentoring the next generation of CNAs.",
    },
    {
      name: "Kimberly Nelson, RN",
      role: "Co-Owner & Program Administrator",
      image: instructorStethoscopeTraining,
      bio: "With over 30 years of nursing experience, Kimberly ensures our program delivers excellence in both education and student support.",
    },
  ];

  const instructors = [
    {
      name: "RN Instructor",
      role: "Lead Instructor",
      image: instructorTeachingMannequin,
      bio: "Our lead instructors bring years of bedside nursing experience and a passion for training the next generation of CNAs with real-world, hands-on skills.",
    },
    {
      name: "Clinical Instructor",
      role: "Clinical Training",
      image: instructorStethoscopeTraining,
      bio: "Our clinical instructors provide supportive, personalized guidance at approved healthcare facilities to build your confidence for your first CNA position.",
    },
  ];

  return (
    <main className="pt-28 md:pt-32">
      {/* Hero Section - 16:9 */}
      <HeroBanner
        imageSrc={cnaPatientCare}
        imageAlt="Health Star Academy CNA providing compassionate patient care"
        title={
          <>
            Quality, Affordable<br />
            <span className="text-cyan">CNA Training</span>
          </>
        }
        subtitle="Empowering Future Healthcare Professionals"
      />

      {/* Mission Statement */}
      <section className="bg-gradient-to-r from-purple via-magenta to-cyan py-12">
        <div className="container-custom text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-4">Our Mission</h2>
          <p className="text-primary-foreground/95 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            To empower individuals from all backgrounds with accessible, high-quality CNA training that opens doors to meaningful healthcare careers. We are committed to fostering compassionate, skilled caregivers who make a positive impact in their communities.
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
              <img src={diverseStudentsTraining} alt="Health Star Academy diverse students in clinical training" className="rounded-xl shadow-medium w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">Our Leadership</h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Health Star Academy was founded by two experienced healthcare professionals with a combined 60+ years in the field.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {leadership.map((leader, index) => (
              <div key={leader.name} className="bg-background rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <img src={leader.image} alt={leader.name} className="w-full h-64 object-cover object-top" />
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl text-charcoal">{leader.name}</h3>
                  <p className="text-purple font-medium text-sm mb-4">{leader.role}</p>
                  <p className="text-gray-dark text-sm leading-relaxed">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">Our Instructors</h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Our team is made up of experienced clinical professionals who bring real-world expertise and a passion for teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {instructors.map((instructor, index) => (
              <div key={instructor.name} className="bg-background rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <img src={instructor.image} alt={instructor.name} className="w-full h-64 object-cover object-top" />
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
                  <div key={item.text} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <CheckCircle className="h-5 w-5 text-purple flex-shrink-0" />
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-charcoal font-medium hover:text-purple underline">
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-charcoal font-medium">{item.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, label: "CDPH Approved", value: "100%" },
                { icon: Users, label: "Clinical Hours", value: "100" },
                { icon: Stethoscope, label: "Theory Hours", value: "60" },
                { icon: HeartHandshake, label: "Career Support", value: "Yes" },
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