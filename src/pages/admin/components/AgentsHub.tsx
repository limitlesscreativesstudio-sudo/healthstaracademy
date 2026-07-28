import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Play, CheckCircle2, X, Activity, Shield, MessageSquare, Megaphone, Search, GraduationCap, Users, FileText, ExternalLink, Sparkles, Scale } from "lucide-react";
import AgentChat from "@/components/agents/AgentChat";
import { Link } from "react-router-dom";

type Finding = { id: string; agent: string; severity: string; title: string; detail: string | null; suggested_fix: string | null; status: string; created_at: string; };
type Run = { id: string; agent: string; status: string; started_at: string; finished_at: string | null; summary: string | null };
type GbpPost = { id: string; title: string | null; body: string; status: string; scheduled_for: string | null; created_at: string };
type BlogDraft = {
  id: string; agent: string; title: string; slug: string; meta_description: string | null;
  tldr: string | null; category: string | null; read_time: string | null;
  target_keyword: string | null; target_city: string | null; body_markdown: string;
  status: string; published_at: string | null; created_at: string;
};
type CompetitorPage = {
  id: string; slug: string; title: string; meta_description: string | null;
  tldr: string | null; body_markdown: string; status: string;
  published_at: string | null; created_at: string;
  competitor_id: string;
};
type CompetitorSchool = { id: string; slug: string; name: string; is_hsa: boolean };

const AGENTS = [
  { id: "sentinel", name: "Sentinel", desc: "Site health & pipeline monitor", icon: Shield, fn: "agent-sentinel" },
  { id: "concierge", name: "Concierge", desc: "Public site chat", icon: MessageSquare, fn: null },
  { id: "advocate", name: "Advocate", desc: "Student support", icon: Users, fn: null },
  { id: "mentor", name: "Mentor", desc: "Instructor LMS copilot", icon: GraduationCap, fn: null },
  { id: "scribe", name: "Scribe", desc: "Content, SEO & blog drafts", icon: Search, fn: "agent-scribe" },
  { id: "broadcaster", name: "Broadcaster", desc: "Weekly GBP post drafts", icon: Megaphone, fn: "agent-broadcaster" },
  { id: "scout", name: "Scout", desc: "Competitor research & compare pages", icon: Scale, fn: "agent-scout" },
];

const sevColor: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-blue-100 text-blue-800",
  info: "bg-slate-100 text-slate-700",
};

const statusColor: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  scheduled: "bg-blue-100 text-blue-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-gray-100 text-gray-600",
};

const AgentsHub = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [posts, setPosts] = useState<GbpPost[]>([]);
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [comparePages, setComparePages] = useState<CompetitorPage[]>([]);
  const [schools, setSchools] = useState<CompetitorSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [tab, setTab] = useState<"findings" | "runs" | "chat" | "gbp" | "blog" | "compare">("blog");
  const [chatAgent, setChatAgent] = useState<"advocate" | "mentor">("mentor");
  const [editing, setEditing] = useState<BlogDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [scribeAutoPublish, setScribeAutoPublish] = useState(false);
  const [scoutAutoPublish, setScoutAutoPublish] = useState(false);
  const [savingAuto, setSavingAuto] = useState(false);

  const load = async () => {
    const [{ data: f }, { data: r }, { data: g }, { data: b }, { data: cfg }, { data: cfg2 }, { data: cp }, { data: sc }] = await Promise.all([
      supabase.from("agent_findings").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(50),
      supabase.from("agent_runs").select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("gbp_posts").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("blog_drafts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("agent_config").select("auto_publish").eq("agent", "scribe").maybeSingle(),
      supabase.from("agent_config").select("auto_publish").eq("agent", "scout").maybeSingle(),
      (supabase as any).from("competitor_pages").select("*").order("created_at", { ascending: false }).limit(50),
      (supabase as any).from("competitor_schools").select("id,slug,name,is_hsa").order("name"),
    ]);
    setFindings((f ?? []) as Finding[]);
    setRuns((r ?? []) as Run[]);
    setPosts((g ?? []) as GbpPost[]);
    setDrafts((b ?? []) as BlogDraft[]);
    setComparePages((cp ?? []) as CompetitorPage[]);
    setSchools((sc ?? []) as CompetitorSchool[]);
    setScribeAutoPublish(!!cfg?.auto_publish);
    setScoutAutoPublish(!!cfg2?.auto_publish);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleAutoPublish = async (agent: "scribe" | "scout", next: boolean) => {
    setSavingAuto(true);
    try {
      const { error } = await supabase.from("agent_config").upsert({ agent, auto_publish: next, updated_at: new Date().toISOString() });
      if (error) throw error;
      if (agent === "scribe") setScribeAutoPublish(next); else setScoutAutoPublish(next);
      toast({ title: next ? "Auto-publish ON" : "Auto-publish OFF", description: next ? `New ${agent} drafts will publish immediately.` : `New ${agent} drafts will wait for your review.` });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally { setSavingAuto(false); }
  };

  const callComparePublish = async (id: string, action: "publish" | "unpublish" | "archive" | "update", patch?: Record<string, unknown>) => {
    const { error } = await supabase.functions.invoke("publish-competitor-page", { body: { id, action, patch } });
    if (error) throw error;
  };

  const runAgent = async (fn: string, id: string) => {
    setRunning(id);
    try {
      const { error } = await supabase.functions.invoke(fn, { body: {} });
      if (error) throw error;
      toast({ title: `${id} run complete` });
      await load();
    } catch (e: any) {
      toast({ title: "Run failed", description: e.message, variant: "destructive" });
    } finally { setRunning(null); }
  };

  const dismiss = async (id: string) => {
    await supabase.from("agent_findings").update({ status: "dismissed", resolved_at: new Date().toISOString() }).eq("id", id);
    setFindings(findings.filter(f => f.id !== id));
  };
  const markFixed = async (id: string) => {
    await supabase.from("agent_findings").update({ status: "applied", resolved_at: new Date().toISOString() }).eq("id", id);
    setFindings(findings.filter(f => f.id !== id));
  };

  const callPublish = async (id: string, action: "publish" | "unpublish" | "archive" | "update", patch?: Record<string, unknown>) => {
    const { error } = await supabase.functions.invoke("publish-blog-post", { body: { id, action, patch } });
    if (error) throw error;
  };

  const publish = async (d: BlogDraft) => {
    try {
      await callPublish(d.id, "publish");
      toast({ title: "Published", description: `/blog/${d.slug} is live.` });
      await load();
    } catch (e: any) {
      toast({ title: "Publish failed", description: e.message, variant: "destructive" });
    }
  };
  const unpublish = async (d: BlogDraft) => {
    try { await callPublish(d.id, "unpublish"); toast({ title: "Unpublished" }); await load(); }
    catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };
  const archive = async (d: BlogDraft) => {
    try { await callPublish(d.id, "archive"); toast({ title: "Archived" }); await load(); }
    catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };
  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await callPublish(editing.id, "update", {
        title: editing.title,
        meta_description: editing.meta_description,
        tldr: editing.tldr,
        category: editing.category,
        read_time: editing.read_time,
        body_markdown: editing.body_markdown,
      });
      toast({ title: "Saved" });
      setEditing(null);
      await load();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agents Hub</h2>
        <p className="text-muted-foreground text-sm">Your AI team watching the site, the portal, and your students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {AGENTS.map(a => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="border rounded-lg p-4 bg-background flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.desc}</div>
                {a.fn && (
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => runAgent(a.fn!, a.id)} disabled={running === a.id}>
                    {running === a.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                    Run now
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 border-b flex-wrap">
        {(["blog","findings","runs","chat","gbp"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {t === "blog" && <><FileText className="inline h-3 w-3 mr-1" />Blog ({drafts.length})</>}
            {t === "findings" && `Findings (${findings.length})`}
            {t === "runs" && "Recent runs"}
            {t === "chat" && "Chat with an agent"}
            {t === "gbp" && `GBP drafts (${posts.length})`}
          </button>
        ))}
      </div>

      {tab === "blog" && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 p-3 border rounded-lg bg-muted/30 flex-wrap">
            <div className="text-xs text-muted-foreground flex-1 min-w-[220px]">
              <div className="flex items-center gap-2 font-medium text-foreground mb-1"><Sparkles className="h-3 w-3" />Scribe blog engine</div>
              Drafts one full post per week with a freshly generated hero image (no recycled visuals). Posts go live at <code className="bg-background px-1 rounded">/blog/&lt;slug&gt;</code>.
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" className="h-4 w-4 accent-primary" checked={scribeAutoPublish} disabled={savingAuto} onChange={(e) => toggleAutoPublish(e.target.checked)} />
              <span className="font-medium">Auto-publish</span>
              <span className="text-xs text-muted-foreground">{scribeAutoPublish ? "New posts go live automatically" : "Email me to approve"}</span>
            </label>
          </div>
          {drafts.length === 0 && (
            <div className="text-sm text-muted-foreground p-4 border rounded-lg">
              No drafts yet. Click <strong>Run now</strong> on the Scribe card above to generate one right now.
            </div>
          )}
          {drafts.map(d => (
            <div key={d.id} className="border rounded-lg p-4 bg-background">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={statusColor[d.status] ?? ""}>{d.status}</Badge>
                    {d.category && <Badge variant="outline">{d.category}</Badge>}
                    {d.target_keyword && <span className="text-xs text-muted-foreground">🎯 {d.target_keyword}</span>}
                  </div>
                  <div className="font-semibold text-base">{d.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">/blog/{d.slug} · {d.read_time ?? ""} · drafted {new Date(d.created_at).toLocaleDateString()}</div>
                  {d.tldr && <div className="text-sm mt-2 text-muted-foreground">{d.tldr}</div>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => setEditing(d)}>Edit</Button>
                  {d.status !== "published" ? (
                    <Button size="sm" onClick={() => publish(d)}><CheckCircle2 className="h-3 w-3 mr-1" />Publish</Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/blog/${d.slug}`} target="_blank"><ExternalLink className="h-3 w-3 mr-1" />View</Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => unpublish(d)}>Unpublish</Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => archive(d)}><X className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "findings" && (
        <div className="space-y-2">
          {findings.length === 0 && <div className="text-sm text-muted-foreground p-4 border rounded-lg">No open findings.</div>}
          {findings.map(f => (
            <div key={f.id} className="border rounded-lg p-4 bg-background">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={sevColor[f.severity] ?? ""}>{f.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{f.agent}</span>
                  </div>
                  <div className="font-medium">{f.title}</div>
                  {f.detail && <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{f.detail}</div>}
                  {f.suggested_fix && <div className="text-sm mt-2"><span className="font-medium">Fix: </span>{f.suggested_fix}</div>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => markFixed(f.id)}><CheckCircle2 className="h-3 w-3 mr-1" />Fixed</Button>
                  <Button size="sm" variant="ghost" onClick={() => dismiss(f.id)}><X className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "runs" && (
        <div className="space-y-1 text-sm">
          {runs.map(r => (
            <div key={r.id} className="flex items-center gap-3 border rounded p-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium w-24">{r.agent}</span>
              <Badge variant={r.status === "ok" ? "default" : r.status === "error" ? "destructive" : "secondary"}>{r.status}</Badge>
              <span className="text-xs text-muted-foreground">{new Date(r.started_at).toLocaleString()}</span>
              <span className="flex-1 text-xs">{r.summary}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "chat" && (
        <div>
          <div className="flex gap-2 mb-3">
            <Button size="sm" variant={chatAgent === "mentor" ? "default" : "outline"} onClick={() => setChatAgent("mentor")}>Mentor (instructor)</Button>
            <Button size="sm" variant={chatAgent === "advocate" ? "default" : "outline"} onClick={() => setChatAgent("advocate")}>Advocate (student lens)</Button>
          </div>
          {chatAgent === "mentor" && <AgentChat endpoint="agent-mentor" title="Mentor — LMS Copilot" greeting="Ask me to draft a module page, generate quiz questions, or organize files." accent="#7C4DFF" />}
          {chatAgent === "advocate" && <AgentChat endpoint="agent-advocate" title="Advocate — Student lens" greeting="I answer student questions based on their grades, attendance, and assignments." accent="#319795" />}
        </div>
      )}

      {tab === "gbp" && (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground p-3 border rounded-lg bg-muted/30">
            <strong>Hands-off mode:</strong> if a <code className="bg-background px-1 rounded">GBP_WEBHOOK_URL</code> secret is set (Zapier/Make/n8n → Google Business Profile),
            clicking <b>Publish</b> posts to GBP automatically. Without it, use <b>Copy</b> + <b>Open GBP</b> to paste manually, then <b>Mark posted</b>.
            You'll get an email when a new draft is ready and if a publish attempt fails.
          </div>
          {posts.length === 0 && <div className="text-sm text-muted-foreground p-4 border rounded-lg">No GBP drafts yet. Click Run on the Broadcaster card above.</div>}
          {posts.map(p => (
            <div key={p.id} className="border rounded-lg p-4 bg-background">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="font-medium">{p.title ?? "Untitled"}</span>
                <Badge className={statusColor[p.status] ?? ""}>{p.status}</Badge>
              </div>
              <div className="text-sm whitespace-pre-wrap mb-3">{p.body}</div>
              {p.scheduled_for && <div className="text-xs text-muted-foreground mb-2">Scheduled: {p.scheduled_for}</div>}
              <div className="flex gap-2 flex-wrap">
                {p.status !== "published" && p.status !== "archived" && (
                  <Button size="sm" onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke("publish-gbp-post", { body: { id: p.id, action: "publish" } });
                      if (error) throw error;
                      if (data?.mode === "manual") {
                        toast({ title: "Manual publish", description: "No webhook configured — use Copy + Open GBP, then Mark posted." });
                      } else {
                        toast({ title: "Published to GBP" });
                      }
                      await load();
                    } catch (e: any) { toast({ title: "Publish failed", description: e.message, variant: "destructive" }); }
                  }}><CheckCircle2 className="h-3 w-3 mr-1" />Publish</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(`${p.title ?? ""}\n\n${p.body}`);
                  toast({ title: "Copied to clipboard" });
                }}>Copy</Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="https://business.google.com/" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Open GBP</a>
                </Button>
                {p.status !== "published" && (
                  <Button size="sm" variant="ghost" onClick={async () => {
                    await supabase.functions.invoke("publish-gbp-post", { body: { id: p.id, action: "mark_posted" } });
                    toast({ title: "Marked as posted" });
                    await load();
                  }}>Mark posted</Button>
                )}
                {p.status !== "archived" && (
                  <Button size="sm" variant="ghost" onClick={async () => {
                    await supabase.functions.invoke("publish-gbp-post", { body: { id: p.id, action: "discard" } });
                    toast({ title: "Discarded" });
                    await load();
                  }}><X className="h-3 w-3" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit blog draft</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Title (≤60)</label>
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Meta description (≤160)</label>
                  <Textarea rows={2} value={editing.meta_description ?? ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">TL;DR</label>
                  <Textarea rows={2} value={editing.tldr ?? ""} onChange={(e) => setEditing({ ...editing, tldr: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium">Category</label>
                    <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Read time</label>
                    <Input value={editing.read_time ?? ""} onChange={(e) => setEditing({ ...editing, read_time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">Body (markdown)</label>
                  <Textarea rows={22} className="font-mono text-xs" value={editing.body_markdown} onChange={(e) => setEditing({ ...editing, body_markdown: e.target.value })} />
                </div>
              </div>
              <div className="border rounded p-4 bg-muted/30 overflow-y-auto max-h-[70vh]">
                <div className="text-xs text-muted-foreground mb-2">Preview</div>
                <h1 className="text-2xl font-bold mb-2">{editing.title}</h1>
                {editing.tldr && <p className="text-muted-foreground mb-4">{editing.tldr}</p>}
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{editing.body_markdown}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving && <Loader2 className="animate-spin h-3 w-3 mr-1" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentsHub;
