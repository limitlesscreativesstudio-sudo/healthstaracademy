import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
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
    <main className="pt-30">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 h-64 lg:h-full relative">
            <img
              src={heroPrograms}
              alt="Health Star Academy blog and resources"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full lg:w-1/2 h-full bg-gradient-to-br from-purple via-purple/90 to-magenta flex items-center justify-center py-12 lg:py-0">
            <div className="text-center px-8 lg:px-12">
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in-up uppercase tracking-wide">
                Health Star<br />
                Academy<br />
                <span className="text-cyan">Blog</span>
              </h1>
              <p className="text-primary-foreground/90 text-lg animate-fade-in-up animation-delay-100">
                Insights, Tips & Career Guidance
              </p>
            </div>
          </div>
        </div>
        <div className="relative z-10 container-custom py-32 lg:py-40" />
      </section>

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
