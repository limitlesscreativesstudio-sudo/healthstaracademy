import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import HeroBanner from "@/components/HeroBanner";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, Clock } from "lucide-react";

type Post = {
  id: string; title: string; slug: string; meta_description: string | null;
  tldr: string | null; hero_image_url: string | null; category: string | null;
  read_time: string | null; body_markdown: string; published_at: string | null;
  target_city: string | null; target_keyword: string | null;
};

const AgentBlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("blog_drafts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!data) { setNotFound(true); setLoading(false); return; }
      setPost(data as Post);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (notFound || !post) {
    // Let App-level 404 handle unknown slugs
    navigate("/blog", { replace: true });
    return null;
  }

  const published = post.published_at ? new Date(post.published_at) : new Date();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description ?? post.tldr ?? "",
    datePublished: published.toISOString(),
    dateModified: published.toISOString(),
    author: { "@type": "Organization", name: "Health Star Academy" },
    publisher: { "@type": "Organization", name: "Health Star Academy", logo: { "@type": "ImageObject", url: "https://healthstaracademy.org/favicon.png" } },
    mainEntityOfPage: `https://healthstaracademy.org/blog/${post.slug}`,
    articleSection: post.category ?? undefined,
    keywords: post.target_keyword ?? undefined,
  };

  return (
    <>
      <SEO
        title={`${post.title} | Health Star Academy`}
        description={post.meta_description ?? post.tldr ?? ""}
        canonical={`/blog/${post.slug}`}
        jsonLd={jsonLd}
      />
      <HeroBanner
        title={post.title}
        subtitle={post.tldr ?? undefined}
        image={post.hero_image_url ?? "/placeholder.svg"}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{published.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          {post.read_time && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.read_time}</span>}
          {post.category && <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">{post.category}</span>}
        </div>

        <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body_markdown}</ReactMarkdown>
        </div>

        <div className="mt-10 p-6 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to start your CNA career?</h2>
          <p className="text-muted-foreground mb-4">Get pre-qualified in under 2 minutes.</p>
          <Button asChild size="lg"><Link to="/pre-qualification">Start Pre-Qualification</Link></Button>
        </div>

        <div className="mt-8">
          <Button variant="ghost" asChild><Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" />All articles</Link></Button>
        </div>
      </article>
    </>
  );
};

export default AgentBlogPost;
