import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle2, X, Activity, Shield, MessageSquare, Megaphone, Search, GraduationCap, Users } from "lucide-react";
import AgentChat from "@/components/agents/AgentChat";

type Finding = {
  id: string; agent: string; severity: string; title: string; detail: string | null;
  suggested_fix: string | null; status: string; created_at: string;
};
type Run = { id: string; agent: string; status: string; started_at: string; finished_at: string | null; summary: string | null };
type GbpPost = { id: string; title: string | null; body: string; status: string; scheduled_for: string | null; created_at: string };

const AGENTS = [
  { id: "sentinel", name: "Sentinel", desc: "Site health & pipeline monitor", icon: Shield, fn: "agent-sentinel" },
  { id: "concierge", name: "Concierge", desc: "Public site chat", icon: MessageSquare, fn: null },
  { id: "advocate", name: "Advocate", desc: "Student support", icon: Users, fn: null },
  { id: "mentor", name: "Mentor", desc: "Instructor LMS copilot", icon: GraduationCap, fn: null },
  { id: "scribe", name: "Scribe", desc: "Content & SEO audit", icon: Search, fn: "agent-scribe" },
  { id: "broadcaster", name: "Broadcaster", desc: "Weekly GBP post drafts", icon: Megaphone, fn: "agent-broadcaster" },
];

const sevColor: Record<string,string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-blue-100 text-blue-800",
  info: "bg-slate-100 text-slate-700",
};

const AgentsHub = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [posts, setPosts] = useState<GbpPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [tab, setTab] = useState<"findings" | "runs" | "chat" | "gbp">("findings");
  const [chatAgent, setChatAgent] = useState<"advocate" | "mentor">("mentor");

  const load = async () => {
    const [{ data: f }, { data: r }, { data: g }] = await Promise.all([
      supabase.from("agent_findings").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(50),
      supabase.from("agent_runs").select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("gbp_posts").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    setFindings((f ?? []) as Finding[]);
    setRuns((r ?? []) as Run[]);
    setPosts((g ?? []) as GbpPost[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

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

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agents Hub</h2>
        <p className="text-muted-foreground text-sm">Your AI team watching the site, the portal, and your students.</p>
      </div>

      {/* Agent cards */}
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

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["findings","runs","chat","gbp"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {t === "findings" && `Findings (${findings.length})`}
            {t === "runs" && "Recent runs"}
            {t === "chat" && "Chat with an agent"}
            {t === "gbp" && `GBP drafts (${posts.length})`}
          </button>
        ))}
      </div>

      {tab === "findings" && (
        <div className="space-y-2">
          {findings.length === 0 && <div className="text-sm text-muted-foreground p-4 border rounded-lg">No open findings. The agents will report here as they spot issues.</div>}
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
        <div className="space-y-2">
          {posts.length === 0 && <div className="text-sm text-muted-foreground p-4 border rounded-lg">No GBP drafts yet. Click "Run now" on Broadcaster to generate one.</div>}
          {posts.map(p => (
            <div key={p.id} className="border rounded-lg p-4 bg-background">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{p.title ?? "Untitled"}</span>
                <Badge>{p.status}</Badge>
              </div>
              <div className="text-sm whitespace-pre-wrap">{p.body}</div>
              {p.scheduled_for && <div className="text-xs text-muted-foreground mt-2">Scheduled: {p.scheduled_for}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentsHub;
