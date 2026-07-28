import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, ExternalLink } from "lucide-react";

type School = { id: string; slug: string; name: string; website: string | null; city: string | null; is_hsa: boolean };
type Fact = { school_id: string; attribute: string; value_text: string | null; confidence: string; source_url: string | null };
type Page = { slug: string; title: string; tldr: string | null; competitor_id: string };

const ATTR_LABELS: Array<[string, string]> = [
  ["tuition", "Total Tuition"],
  ["program_length", "Program Length"],
  ["schedule", "Schedule"],
  ["hybrid", "Hybrid Format"],
  ["clinical_sites", "Clinical Sites"],
  ["accreditation", "Accreditation"],
  ["payment_plans", "Payment Plans"],
  ["class_size", "Class Size"],
  ["next_start_date", "Next Start"],
];

const ComparePage = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selected, setSelected] = useState<string[]>([]); // competitor slugs (HSA always first)

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("competitor_schools").select("*").eq("active", true).order("is_hsa", { ascending: false }).order("name"),
        supabase.from("competitor_pages").select("slug,title,tldr,competitor_id").eq("status", "published"),
      ]);
      setSchools((s ?? []) as School[]);
      setPages((p ?? []) as Page[]);
      // Pre-select first two competitors
      const comp = (s ?? []).filter((x: any) => !x.is_hsa).slice(0, 2).map((x: any) => x.slug);
      setSelected(comp);
    })();
  }, []);

  const hsa = schools.find((s) => s.is_hsa);
  const activeSchools = useMemo(() => {
    if (!hsa) return [];
    const comps = selected.map((slug) => schools.find((s) => s.slug === slug)).filter(Boolean) as School[];
    return [hsa, ...comps];
  }, [hsa, selected, schools]);

  useEffect(() => {
    if (activeSchools.length === 0) return;
    (async () => {
      const ids = activeSchools.map((s) => s.id);
      const { data } = await supabase.from("competitor_facts").select("*").in("school_id", ids);
      setFacts((data ?? []) as Fact[]);
    })();
  }, [activeSchools]);

  const factFor = (schoolId: string, attr: string) =>
    facts.find((f) => f.school_id === schoolId && f.attribute === attr)?.value_text ?? "—";

  const toggleSchool = (slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return [...prev.slice(1), slug];
      return [...prev, slug];
    });
  };

  return (
    <>
      <Helmet>
        <title>Compare CNA Programs in California | Health Star Academy</title>
        <meta name="description" content="Side-by-side comparison of California CNA programs. Tuition, length, schedule, and clinical sites for Health Star Academy and other schools." />
        <link rel="canonical" href="https://healthstaracademy.org/compare" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-teal-100 text-teal-800">Independent comparison</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Compare CNA Programs in California</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real numbers, side-by-side. Pick up to 3 schools to compare against Health Star Academy.
          </p>
        </div>

        {/* School picker */}
        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Compare Health Star Academy with:</div>
          <div className="flex flex-wrap gap-2">
            {schools.filter((s) => !s.is_hsa).map((s) => (
              <button
                key={s.slug}
                onClick={() => toggleSchool(s.slug)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  selected.includes(s.slug)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                }`}
              >
                {selected.includes(s.slug) ? <Check className="inline h-3 w-3 mr-1" /> : null}
                {s.name}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">Max 3 competitors. Older selection replaced.</div>
        </div>

        {/* Comparison — desktop table */}
        <div className="hidden md:block overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold w-40">Attribute</th>
                {activeSchools.map((s) => (
                  <th key={s.id} className={`text-left p-3 font-semibold ${s.is_hsa ? "bg-teal-50 border-l-4 border-teal-500" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span>{s.name}</span>
                      {s.is_hsa && <Badge className="bg-teal-500 text-white text-xs">Recommended</Badge>}
                    </div>
                    {s.city && <div className="text-xs text-muted-foreground font-normal">{s.city}, CA</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ATTR_LABELS.map(([attr, label]) => (
                <tr key={attr} className="border-t">
                  <td className="p-3 font-medium text-muted-foreground">{label}</td>
                  {activeSchools.map((s) => (
                    <td key={s.id} className={`p-3 ${s.is_hsa ? "bg-teal-50/50 border-l-4 border-teal-500 font-medium" : ""}`}>
                      {factFor(s.id, attr)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t bg-muted/20">
                <td className="p-3 font-medium">Action</td>
                {activeSchools.map((s) => (
                  <td key={s.id} className={`p-3 ${s.is_hsa ? "bg-teal-50 border-l-4 border-teal-500" : ""}`}>
                    {s.is_hsa ? (
                      <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                        <Link to="/pre-qualification">Apply <Sparkles className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    ) : s.website ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={s.website} target="_blank" rel="noopener noreferrer">Visit <ExternalLink className="h-3 w-3 ml-1" /></a>
                      </Button>
                    ) : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Comparison — mobile card stack */}
        <div className="md:hidden space-y-4">
          {activeSchools.map((s) => (
            <div key={s.id} className={`border rounded-lg p-4 ${s.is_hsa ? "border-teal-500 border-2 bg-teal-50/40" : ""}`}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{s.name}</h3>
                {s.is_hsa && <Badge className="bg-teal-500 text-white">Recommended</Badge>}
              </div>
              {s.city && <div className="text-xs text-muted-foreground mb-3">{s.city}, CA</div>}
              <dl className="space-y-1 text-sm">
                {ATTR_LABELS.map(([attr, label]) => (
                  <div key={attr} className="flex justify-between gap-3 border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium">{factFor(s.id, attr)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3">
                {s.is_hsa ? (
                  <Button asChild className="w-full bg-teal-600 hover:bg-teal-700"><Link to="/pre-qualification">Start My Application</Link></Button>
                ) : s.website ? (
                  <Button asChild variant="outline" className="w-full"><a href={s.website} target="_blank" rel="noopener noreferrer">Visit their site</a></Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Deep comparisons */}
        {pages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">In-depth comparisons</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {pages.map((p) => (
                <Link key={p.slug} to={`/compare/${p.slug}`} className="block border rounded-lg p-4 hover:bg-muted/40 transition">
                  <div className="font-semibold">{p.title}</div>
                  {p.tldr && <div className="text-sm text-muted-foreground mt-1">{p.tldr}</div>}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">Not sure which program fits?</h3>
          <p className="text-muted-foreground mb-4">Take our 60-second pre-qualification and we'll tell you honestly whether Health Star Academy is the right fit.</p>
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700"><Link to="/pre-qualification">Check My Eligibility</Link></Button>
        </div>
      </div>
    </>
  );
};

export default ComparePage;
