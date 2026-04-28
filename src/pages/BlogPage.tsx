import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Instagram, Facebook } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbs";
import studentsVitalsPractice from "@/assets/students-vitals-practice.jpg";
import instructorTeachingMannequin from "@/assets/instructor-teaching-mannequin.jpg";
import cnaStudentsConfident from "@/assets/cna-students-confident.jpg";
import studentCareTraining from "@/assets/student-care-training.jpg";

const BlogPage = () => {
  const allArticles = [
    {
      slug: "how-to-become-cna-in-california",
      title: "How to Become a CNA in California: Step-by-Step Certification Guide",
      excerpt: "The complete 2026 guide to becoming a Certified Nursing Assistant in California — CDPH requirements, training hours, state exam, costs, and timeline.",
      author: "Health Star Academy",
      date: "April 28, 2026",
      publishDate: new Date("2026-04-28"),
      readTime: "11 min read",
      category: "Career Guide",
      image: studentsVitalsPractice,
    },
    {
      slug: "fast-cna-certification-bay-area",
      title: "Fast CNA Certification Program in the Bay Area: Certified in 6 Weeks",
      excerpt: "Get CDPH-approved CNA certification fast. Hybrid 6-week program with online theory and Bay Area clinicals in Hayward.",
      author: "Health Star Academy",
      date: "May 5, 2026",
      publishDate: new Date("2026-05-05"),
      readTime: "9 min read",
      category: "Bay Area",
      image: cnaStudentsConfident,
    },
    {
      slug: "cdph-approved-cna-training-sacramento",
      title: "CDPH-Approved CNA Training in Sacramento: Your Hybrid Path",
      excerpt: "CDPH-approved hybrid CNA training serving Sacramento students. Online theory plus clinicals in Stockton and Lodi.",
      author: "Health Star Academy",
      date: "May 12, 2026",
      publishDate: new Date("2026-05-12"),
      readTime: "9 min read",
      category: "Sacramento",
      image: instructorTeachingMannequin,
    },
    {
      slug: "hybrid-cna-classes-near-stockton",
      title: "Hybrid CNA Classes Near Stockton, CA: Study Online, Clinicals Local",
      excerpt: "Stockton's home for hybrid CNA training. Online theory plus in-person clinicals at our local Stockton facility.",
      author: "Health Star Academy",
      date: "May 19, 2026",
      publishDate: new Date("2026-05-19"),
      readTime: "8 min read",
      category: "Stockton",
      image: studentCareTraining,
    },
    {
      slug: "healthcare-career-path",
      title: "The Healthcare Career Path: Your Complete Guide to Starting a Rewarding Career in Healthcare",
      excerpt: "Discover the many opportunities available in healthcare and learn why becoming a Certified Nursing Assistant is the perfect first step toward a fulfilling career helping others.",
      author: "Health Star Academy",
      date: "December 10, 2024",
      publishDate: new Date("2024-12-10"),
      readTime: "12 min read",
      category: "Career Guide",
      image: studentsVitalsPractice,
    },
    {
      slug: "cna-training-excellence",
      title: "CNA Training Excellence: What Makes a Quality Certified Nursing Assistant Program",
      excerpt: "Learn what to look for in a CNA training program and discover how Health Star Academy's comprehensive curriculum prepares you for success in the healthcare industry.",
      author: "Health Star Academy",
      date: "December 8, 2024",
      publishDate: new Date("2024-12-08"),
      readTime: "10 min read",
      category: "Training",
      image: instructorTeachingMannequin,
    },
    {
      slug: "nursing-career-foundations",
      title: "Nursing Career Foundations: Building Your Path from CNA to Advanced Nursing Roles",
      excerpt: "Explore how starting as a CNA can open doors to LVN, RN, and advanced nursing positions. Learn about career advancement opportunities in the nursing profession.",
      author: "Health Star Academy",
      date: "December 5, 2024",
      publishDate: new Date("2024-12-05"),
      readTime: "11 min read",
      category: "Career Advancement",
      image: cnaStudentsConfident,
    },
  ];

  // Only show articles whose scheduled publish date has arrived
  const now = new Date();
  const articles = allArticles
    .filter((a) => a.publishDate <= now)
    .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

  return (
    <>
      <SEO
        title="CNA Blog: Careers, Certification & Training Tips | Health Star"
        description="Expert articles on CNA careers, California certification, exam prep, and hybrid training tips from Health Star Academy. Start your healthcare journey today."
        canonical="/blog"
        keywords="CNA blog California, nursing assistant career tips, CNA certification guide, CNA exam prep articles, healthcare career advice, CNA training blog"
        structuredData={buildBreadcrumbSchema([{ name: "Blog", path: "/blog" }])}
      />
      <main className="pt-28 md:pt-32">
      {/* Hero Section - 16:9 */}
      <HeroBanner
        imageSrc={studentCareTraining}
        imageAlt="Health Star Academy blog and resources"
        title={
          <>
            Health Star<br />
            Academy<br />
            <span className="text-cyan">Blog</span>
          </>
        }
        subtitle="Insights, Tips & Career Guidance"
      />

      {/* Articles Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
              Latest Articles
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Expert insights on healthcare careers, CNA training, and professional development to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <article
                key={article.slug}
                className="bg-neutral-light rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Article Thumbnail */}
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-purple/10 text-purple px-3 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-charcoal mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-dark text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-medium mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <Button variant="cyan-outline" size="sm" asChild>
                    <Link to={`/blog/${article.slug}`}>
                      Read Article <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="section-padding bg-neutral-light">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
              Follow Us on Social Media
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Stay connected! Follow Health Star Academy for the latest updates, student highlights, and healthcare tips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Instagram Card */}
            <a 
              href="https://www.instagram.com/healthstaracademy/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-background rounded-xl p-6 shadow-soft hover:shadow-medium transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple via-magenta to-cyan rounded-xl flex items-center justify-center">
                  <Instagram className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal">@healthstaracademy</h3>
                  <p className="text-sm text-gray-dark">Follow on Instagram</p>
                </div>
              </div>
              <p className="text-gray-dark text-sm mb-4">
                Become a Certified Nursing Assistant (CNA)! Online classes with in-person clinicals in Lodi & Stockton, CA!
              </p>
              <span className="text-purple font-semibold text-sm group-hover:underline">
                View Profile →
              </span>
            </a>

            {/* Facebook Card */}
            <a 
              href="https://www.facebook.com/healthstaracademy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-background rounded-xl p-6 shadow-soft hover:shadow-medium transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#1877F2] rounded-xl flex items-center justify-center">
                  <Facebook className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-charcoal">Health Star Academy LLC</h3>
                  <p className="text-sm text-gray-dark">Follow on Facebook</p>
                </div>
              </div>
              <p className="text-gray-dark text-sm mb-4">
                Stockton's newest Certified Nursing Assistant (CNA) training school, dedicated to preparing the next generation of healthcare heroes.
              </p>
              <span className="text-purple font-semibold text-sm group-hover:underline">
                View Page →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className="py-12 bg-background">
        <div className="container-custom text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3">
            Ready to Start Your Healthcare Career?
          </h2>
          <p className="text-gray-dark max-w-2xl mx-auto mb-6">
            Turn your interest into action. Enroll in our CDPH-approved CNA program today!
          </p>
          <Button variant="default" size="lg" asChild>
            <Link to="/pre-qualification">
              Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
    </>
  );
};

export default BlogPage;
