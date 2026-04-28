import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  CheckCircle, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Heart, 
  Users, 
  ArrowRight,
  Mail,
  Phone
} from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import instructorTeaching from "@/assets/instructor-teaching-mannequin.jpg";

const CareersPage = () => {
  const benefits = [
    "Competitive compensation",
    "Flexible scheduling options",
    "Professional development opportunities",
    "Supportive work environment",
    "Make a real difference in students' lives",
    "Be part of a growing healthcare education team",
  ];

  const qualifications = [
    {
      title: "Active Nursing License",
      description: "Must hold a current and active California license as a Registered Nurse (RN) or Licensed Vocational Nurse (LVN)",
    },
    {
      title: "Nursing Experience",
      description: "Minimum of two (2) years of full-time nursing experience as a licensed nurse",
    },
    {
      title: "Long-Term Care Experience",
      description: "At least one (1) year of direct patient care experience in a long-term care setting (skilled nursing facility, intermediate care facility, home care, hospice, or chronic care unit)",
    },
    {
      title: "Teaching Certification",
      description: "Either one year of experience planning, implementing, and evaluating educational programs in nursing, OR completion of a 24-hour BRN-approved course in 'Planning, Implementing, and Evaluating Educational Programs in Nursing'",
    },
  ];

  const responsibilities = [
    "Deliver engaging classroom instruction following CDPH-approved curriculum",
    "Provide hands-on clinical training and supervision (max 15:1 student ratio)",
    "Evaluate student performance and provide constructive feedback",
    "Maintain accurate records of student attendance and progress",
    "Prepare students for the California CNA certification exam",
    "Create a positive, inclusive learning environment",
    "Stay current with CDPH regulations and nursing best practices",
    "Participate in program development and improvement initiatives",
  ];

  return (
    <>
      <SEO
        title="Careers at Health Star Academy | RN & LVN Instructor Jobs"
        description="Join Health Star Academy as a Classroom Instructor. Hiring experienced RNs and LVNs to train the next generation of CNAs. Competitive, meaningful work."
        canonical="/careers"
        keywords="CNA instructor jobs Stockton, RN teaching jobs California, LVN instructor positions, nursing educator Sacramento, Health Star Academy careers"
        structuredData={buildBreadcrumbSchema([{ name: "Careers", path: "/careers" }])}
      />
      <main className="pt-28 md:pt-32">
        {/* Hero Section */}
        <HeroBanner
          imageSrc={instructorTeaching}
          imageAlt="Health Star Academy instructor teaching CNA students"
          title={
            <>
              Join Our<br />
              <span className="text-cyan">Team</span>
            </>
          }
          subtitle="Shape the future of healthcare — one student at a time"
        />

        {/* Current Openings */}
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-cyan/10 text-cyan px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Briefcase className="h-4 w-4" />
                Now Hiring
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
                Current Openings
              </h2>
              <p className="text-gray-dark max-w-2xl mx-auto">
                We're looking for passionate healthcare professionals to join our growing team.
              </p>
            </div>

            {/* Job Posting Card */}
            <div className="max-w-4xl mx-auto bg-neutral-light rounded-2xl overflow-hidden shadow-soft border-2 border-purple">
              {/* Job Header */}
              <div className="bg-gradient-to-r from-purple to-magenta text-white p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-2xl font-bold mb-2">
                      CNA Instructor
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Stockton, CA
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Part-Time / Full-Time
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        RN or LVN Required
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                    <span className="text-sm">Competitive</span>
                    <p className="font-bold">Salary DOE</p>
                  </div>
                </div>
              </div>

              {/* Job Content */}
              <div className="p-6 md:p-8">
                {/* About the Role */}
                <div className="mb-8">
                  <h4 className="font-heading font-bold text-lg text-charcoal mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-purple" />
                    About the Role
                  </h4>
                  <p className="text-gray-dark leading-relaxed">
                    Health Star Academy is seeking dedicated and experienced CNA Instructors to join our team. 
                    As a CNA Instructor, you will play a vital role in training the next generation of Certified 
                    Nursing Assistants, preparing them for rewarding careers in healthcare. This position offers 
                    the opportunity to make a meaningful impact on students' lives while working in a supportive, 
                    collaborative environment.
                  </p>
                </div>

                {/* Qualifications */}
                <div className="mb-8">
                  <h4 className="font-heading font-bold text-lg text-charcoal mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple" />
                    CDPH Required Qualifications
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {qualifications.map((qual, index) => (
                      <div key={index} className="bg-background rounded-lg p-4 border border-border">
                        <h5 className="font-semibold text-charcoal mb-2">{qual.title}</h5>
                        <p className="text-sm text-gray-dark">{qual.description}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-medium mt-4 italic">
                    * All instructors must be approved by CDPH via the Instructor Application (CDPH 279)
                  </p>
                </div>

                {/* Responsibilities */}
                <div className="mb-8">
                  <h4 className="font-heading font-bold text-lg text-charcoal mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple" />
                    Key Responsibilities
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {responsibilities.map((resp, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-cyan flex-shrink-0 mt-1" />
                        <span className="text-sm text-gray-dark">{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-8">
                  <h4 className="font-heading font-bold text-lg text-charcoal mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-purple" />
                    What We Offer
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 bg-cyan/10 rounded-lg px-3 py-2">
                        <CheckCircle className="h-4 w-4 text-cyan flex-shrink-0" />
                        <span className="text-sm text-charcoal">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply CTA */}
                <div className="bg-gradient-to-r from-purple/10 to-cyan/10 rounded-xl p-6 text-center">
                  <h4 className="font-heading font-bold text-xl text-charcoal mb-2">
                    Ready to Make a Difference?
                  </h4>
                  <p className="text-gray-dark mb-4">
                    Send your resume and cover letter to our hiring team.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button variant="default" size="lg" asChild>
                      <a href="mailto:careers@healthstaracademy.org?subject=CNA Instructor Application">
                        <Mail className="h-5 w-5 mr-2" />
                        Apply via Email
                      </a>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <a href="tel:2093234169">
                        <Phone className="h-5 w-5 mr-2" />
                        Call (209) 323-4169
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="py-12 bg-neutral-light">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
                Why Work at Health Star Academy?
              </h2>
              <p className="text-gray-dark max-w-2xl mx-auto">
                Join a team that's committed to excellence in healthcare education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-background rounded-xl p-6 text-center shadow-soft">
                <div className="w-14 h-14 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-7 w-7 text-purple" />
                </div>
                <h3 className="font-heading font-bold text-lg text-charcoal mb-2">
                  Meaningful Work
                </h3>
                <p className="text-gray-dark text-sm">
                  Help students launch careers in healthcare and make a real difference in your community.
                </p>
              </div>

              <div className="bg-background rounded-xl p-6 text-center shadow-soft">
                <div className="w-14 h-14 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-cyan" />
                </div>
                <h3 className="font-heading font-bold text-lg text-charcoal mb-2">
                  Supportive Team
                </h3>
                <p className="text-gray-dark text-sm">
                  Work alongside passionate educators who share your commitment to student success.
                </p>
              </div>

              <div className="bg-background rounded-xl p-6 text-center shadow-soft">
                <div className="w-14 h-14 bg-magenta/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-7 w-7 text-magenta" />
                </div>
                <h3 className="font-heading font-bold text-lg text-charcoal mb-2">
                  Growth Opportunities
                </h3>
                <p className="text-gray-dark text-sm">
                  Develop your teaching skills and grow with us as we expand our programs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* General CTA */}
        <section className="py-12 bg-background">
          <div className="container-custom text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3">
              Don't See the Right Position?
            </h2>
            <p className="text-gray-dark max-w-xl mx-auto mb-6">
              We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" asChild>
                <a href="mailto:careers@healthstaracademy.org?subject=General Employment Inquiry">
                  Send Your Resume <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default CareersPage;
