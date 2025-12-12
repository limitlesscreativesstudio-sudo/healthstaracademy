import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import heroPrograms from "@/assets/hero-programs.jpg";

const BlogPage = () => {
  const articles = [
    {
      slug: "healthcare-career-path",
      title: "The Healthcare Career Path: Your Complete Guide to Starting a Rewarding Career in Healthcare",
      excerpt: "Discover the many opportunities available in healthcare and learn why becoming a Certified Nursing Assistant is the perfect first step toward a fulfilling career helping others.",
      author: "Health Star Academy",
      date: "December 10, 2024",
      readTime: "12 min read",
      category: "Career Guide",
    },
    {
      slug: "cna-training-excellence",
      title: "CNA Training Excellence: What Makes a Quality Certified Nursing Assistant Program",
      excerpt: "Learn what to look for in a CNA training program and discover how Health Star Academy's comprehensive curriculum prepares you for success in the healthcare industry.",
      author: "Health Star Academy",
      date: "December 8, 2024",
      readTime: "10 min read",
      category: "Training",
    },
    {
      slug: "nursing-career-foundations",
      title: "Nursing Career Foundations: Building Your Path from CNA to Advanced Nursing Roles",
      excerpt: "Explore how starting as a CNA can open doors to LVN, RN, and advanced nursing positions. Learn about career advancement opportunities in the nursing profession.",
      author: "Health Star Academy",
      date: "December 5, 2024",
      readTime: "11 min read",
      category: "Career Advancement",
    },
  ];

  return (
    <main className="pt-28 md:pt-32">
      {/* Hero Section - 16:9 */}
      <HeroBanner
        imageSrc={heroPrograms}
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
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Latest Articles
            </h2>
            <p className="text-gray-dark max-w-2xl mx-auto">
              Expert insights on healthcare careers, CNA training, and professional development to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article
                key={article.slug}
                className="bg-neutral-light rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
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

      {/* CTA Section */}
      <section className="gradient-accent section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Healthcare Career?
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
            Turn your interest into action. Enroll in our CDPH-approved CNA program today!
          </p>
          <Button variant="secondary" size="lg" asChild>
            <a href="https://docs.google.com/forms/d/1FSLGdKSFD6HWoUUBYxLNLMxYXvoiDz0LVCFbrfX4Gj0/viewform?edit_requested=true" target="_blank" rel="noopener noreferrer">
              Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default BlogPage;
