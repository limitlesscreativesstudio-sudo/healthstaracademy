import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, TrendingUp, Award, Users } from "lucide-react";
import graduateMaria from "@/assets/graduate-maria.jpg";
import studentDavid from "@/assets/student-david.jpg";
import instructorJane from "@/assets/instructor-jane.jpg";
import instructorJohn from "@/assets/instructor-john.jpg";

const SuccessStoriesPage = () => {
  const spotlights = [
    {
      name: "Maria Gonzalez",
      image: graduateMaria,
      title: "From Retail to Rewarding: Maria's Healthcare Journey",
      previousRole: "Retail Sales Associate",
      currentRole: "CNA at Valley General Hospital",
      story: `After eight years in retail, Maria knew she wanted more from her career. "I was tired of feeling like I wasn't making a real difference," she recalls. "I've always been a caregiver at heart—taking care of my grandmother when I was younger showed me that."

Maria enrolled at Health Star Academy while still working part-time at her retail job. "The evening classes fit perfectly with my schedule. The instructors understood that we had lives outside of school."

The hands-on training was transformative. "When I first practiced taking vital signs, I was so nervous. But by the end, it felt natural. The clinical rotations really prepared me for the real world."

Today, Maria works in the cardiac unit at Valley General Hospital. "Every day I come home knowing I helped someone. That's worth more than any paycheck. Though the paycheck is better too!" she laughs.`,
      quote: "Health Star didn't just teach me to be a CNA—they taught me to believe in myself.",
    },
    {
      name: "David Thompson",
      image: studentDavid,
      title: "A Second Chance: How David Found His Calling",
      previousRole: "Warehouse Worker",
      currentRole: "CNA at Sunrise Senior Living",
      story: `David never imagined he'd work in healthcare. "I thought it wasn't for me—I'm a big guy, and I figured nursing was for... well, not people like me," he admits. A friend who worked as a CNA changed his mind.

"She told me about how much she loved helping people, and about the job security. In the warehouse, I was always worried about layoffs. Healthcare doesn't have that problem."

The biggest challenge? "Honestly, it was believing I could do it. I hadn't been in school for years. But the small class sizes at Health Star made all the difference. The instructors gave me one-on-one attention when I needed it."

The payment plan was essential for David. "I couldn't afford to pay upfront, and Health Star worked with me. They wanted me to succeed."

Now David works at a senior living facility, where he's become a resident favorite. "The families thank me, the residents smile when I walk in—that never gets old. This is what I was meant to do."`,
      quote: "The payment plan made it possible. The small class size made it personal. This program changed my life.",
    },
  ];

  const outcomes = [
    {
      stat: "95%",
      label: "First-Time Exam Pass Rate",
      description: "Our graduates pass the state certification exam on their first attempt.",
    },
    {
      stat: "92%",
      label: "Employment Within 3 Months",
      description: "Based on our 2023 graduate survey, most find jobs quickly.",
    },
    {
      stat: "500+",
      label: "Graduates Since 2018",
      description: "We've helped hundreds of students launch their healthcare careers.",
    },
    {
      stat: "4.9/5",
      label: "Student Satisfaction",
      description: "Our students rate their experience as excellent.",
    },
  ];

  const quickTestimonials = [
    {
      quote: "The instructors genuinely care about your success. They don't just teach—they mentor.",
      name: "Jennifer L.",
      role: "Graduate 2023",
      image: instructorJane,
    },
    {
      quote: "I was scared to go back to school at 45. Health Star made me feel like I belonged.",
      name: "Robert M.",
      role: "Graduate 2023",
      image: instructorJohn,
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
            From Our Classroom to<br />
            <span className="text-coral">Your Career</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Real stories from real students who transformed their lives through Health Star Academy. 
            Your success story could be next.
          </p>
        </div>
      </section>

      {/* Outcomes Data */}
      <section className="py-12 bg-charcoal">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-primary-foreground">
              Our Commitment to Your Success
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {outcomes.map((outcome, index) => (
              <div
                key={outcome.label}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="font-heading text-4xl md:text-5xl font-bold text-coral mb-2">
                  {outcome.stat}
                </p>
                <p className="font-semibold text-primary-foreground mb-1">{outcome.label}</p>
                <p className="text-gray-medium text-sm">{outcome.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-medium text-xs mt-8">
            *Based on 2023 graduate survey data. Individual results may vary.
          </p>
        </div>
      </section>

      {/* Graduate Spotlights */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Graduate Spotlights
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Discover how our graduates transformed their careers and found meaningful work in healthcare.
            </p>
          </div>

          <div className="space-y-16">
            {spotlights.map((spotlight, index) => (
              <div
                key={spotlight.name}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <img
                    src={spotlight.image}
                    alt={spotlight.name}
                    className="rounded-xl shadow-medium w-full max-w-md mx-auto"
                  />
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-teal/10 text-teal px-3 py-1 rounded-full text-sm font-medium">
                      {spotlight.previousRole}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-medium" />
                    <span className="bg-coral/10 text-coral px-3 py-1 rounded-full text-sm font-medium">
                      {spotlight.currentRole}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl md:text-3xl text-charcoal mb-6">
                    {spotlight.title}
                  </h3>
                  <div className="prose prose-gray max-w-none mb-6">
                    {spotlight.story.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-gray-dark leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <blockquote className="border-l-4 border-coral pl-4 italic text-charcoal">
                    "{spotlight.quote}"
                    <footer className="text-sm text-gray-dark mt-2 not-italic">
                      — {spotlight.name}
                    </footer>
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Testimonials */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              What Our Students Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {quickTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-background rounded-xl p-8 shadow-soft animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Quote className="h-10 w-10 text-coral/30 mb-4" />
                <p className="text-charcoal mb-6 leading-relaxed italic text-lg">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Be Our Next Success Story
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
            Join the hundreds of Health Star graduates who have launched meaningful healthcare careers. 
            Your transformation starts with a single step.
          </p>
          <Button variant="secondary" size="xl" asChild>
            <Link to="/admissions">
              Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default SuccessStoriesPage;
