import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

type Page = {
  slug: string; title: string; meta_description: string | null;
  tldr: string | null; hero_image_url: string | null; body_markdown: string;
  faq: Array<{ q: string; a: string }> | null; published_at: string | null;
};

const CompetitorPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("competitor_pages").select("*").eq("slug", slug!).eq("status", "published").maybeSingle();
      setPage((data as any) ?? null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin" /></div>;
  if (!page) return <div className="max-w-2xl mx-auto py-24 px-4 text-center">
    <h1 className="text-2xl font-bold mb-3">Comparison not found</h1>
    <Button asChild variant="outline"><Link to="/compare"><ArrowLeft className="h-4 w-4 mr-1" />See all comparisons</Link></Button>
  </div>;

  const canonical = `https://healthstaracademy.org/compare/${page.slug}`;
  const faqJsonLd = page.faq && page.faq.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.faq.map((f) => ({
      "@type": "Question", "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  } : null;

  return (
    <>
      <Helmet>
        <title>{page.title}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.title} />
        {page.meta_description && <meta property="og:description" content={page.meta_description} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/compare" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="h-3 w-3" /> All comparisons
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{page.title}</h1>
        {page.tldr && <p className="text-lg text-muted-foreground mb-6">{page.tldr}</p>}
        {page.hero_image_url && <img src={page.hero_image_url} alt={page.title} className="w-full rounded-lg mb-8" loading="lazy" />}

        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-teal-600 prose-table:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body_markdown}</ReactMarkdown>
        </div>

        {page.faq && page.faq.length > 0 && (
          <div className="mt-10 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Frequently asked</h2>
            <div className="space-y-4">
              {page.faq.map((f, i) => (
                <div key={i}>
                  <div className="font-semibold">{f.q}</div>
                  <div className="text-muted-foreground text-sm mt-1">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">Ready to enroll at Health Star Academy?</h3>
          <p className="text-muted-foreground mb-4">Start with our free 60-second pre-qualification.</p>
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700"><Link to="/pre-qualification">Check My Eligibility</Link></Button>
        </div>
      </article>
    </>
  );
};

export default CompetitorPage;
