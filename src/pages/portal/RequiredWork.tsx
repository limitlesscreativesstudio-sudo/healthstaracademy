import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ClipboardList, GraduationCap, CheckCircle2, AlertCircle, Clock,
  Stethoscope, ChevronRight, Trophy,
} from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { formatDistanceToNow, isPast } from "date-fns";

type Status = "graded" | "submitted" | "in_progress" | "missing" | "not_started";

type Task = {
  id: string;
  course_id: string;
  course_title: string;
  title: string;
  type: "assignment" | "quiz" | "skill" | "clinical";
  due_at: string | null;
  points?: number | null;
  status: Status;
  score?: number | null;
  max_score?: number | null;
  href: string;
};

const STATUS_META: Record<Status, { label: string; cls: string; Icon: any }> = {
  graded:      { label: "Graded",      cls: "bg-purple/15 text-purple border-purple/30",      Icon: CheckCircle2 },
  submitted:   { label: "Submitted",   cls: "bg-cyan/15 text-cyan border-cyan/30",            Icon: CheckCircle2 },
  in_progress: { label: "In progress", cls: "bg-amber-100 text-amber-700 border-amber-300",   Icon: Clock },
  missing:     { label: "Missing",     cls: "bg-coral/15 text-coral border-coral/30",         Icon: AlertCircle },
  not_started: { label: "Not started", cls: "bg-muted text-muted-foreground border-border",   Icon: Clock },
};

const RequiredWork = () => {
  const { user } = usePortalAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: enr } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
      const courseIds = (enr ?? []).map(e => e.course_id);
      if (!courseIds.length) { setLoading(false); return; }

      const [{ data: courses }, { data: asgn }, { data: quizzes }, { data: subs }, { data: grades }, { data: attempts }, { data: signoffs }, { data: ch }] = await Promise.all([
        supabase.from("courses").select("id, title").in("id", courseIds),
        supabase.from("assignments").select("id, course_id, title, due_at, points").in("course_id", courseIds).eq("published", true),
        supabase.from("quizzes").select("id, course_id, title, due_at, total_points").in("course_id", courseIds).eq("published", true),
        supabase.from("submissions").select("assignment_id, submitted_at").eq("user_id", user.id),
        supabase.from("grades").select("assignment_id, quiz_attempt_id, score, max_score").eq("user_id", user.id),
        supabase.from("quiz_attempts").select("quiz_id, started_at, submitted_at, score, max_score").eq("user_id", user.id),
        supabase.from("student_skill_signoffs").select("skill_id, course_id, status").eq("student_user_id", user.id),
        supabase.from("clinical_hours").select("course_id, hours, verified").eq("student_user_id", user.id),
      ]);

      const titleMap = Object.fromEntries((courses ?? []).map(c => [c.id, c.title]));
      const subByAsgn = new Map((subs ?? []).map(s => [s.assignment_id as string, s]));
      const gradeByAsgn = new Map((grades ?? []).filter(g => g.assignment_id).map(g => [g.assignment_id as string, g]));
      const attemptByQuiz = new Map<string, any>();
      (attempts ?? []).forEach(a => {
        const prev = attemptByQuiz.get(a.quiz_id);
        if (!prev || (a.submitted_at && !prev.submitted_at)) attemptByQuiz.set(a.quiz_id, a);
      });

      const out: Task[] = [];

      (asgn ?? []).forEach(a => {
        const g = gradeByAsgn.get(a.id);
        const s = subByAsgn.get(a.id);
        let status: Status = "not_started";
        if (g) status = "graded";
        else if (s) status = "submitted";
        else if (a.due_at && isPast(new Date(a.due_at))) status = "missing";
        out.push({
          id: `a-${a.id}`, course_id: a.course_id, course_title: titleMap[a.course_id] ?? "Course",
          title: a.title, type: "assignment", due_at: a.due_at, points: a.points, status,
          score: g?.score ?? null, max_score: g?.max_score ?? null,
          href: `/portal/courses/${a.course_id}/assignments/${a.id}`,
        });
      });

      (quizzes ?? []).forEach(q => {
        const at = attemptByQuiz.get(q.id);
        let status: Status = "not_started";
        if (at?.submitted_at) status = at.score != null ? "graded" : "submitted";
        else if (at?.started_at) status = "in_progress";
        else if (q.due_at && isPast(new Date(q.due_at))) status = "missing";
        out.push({
          id: `q-${q.id}`, course_id: q.course_id, course_title: titleMap[q.course_id] ?? "Course",
          title: q.title, type: "quiz", due_at: q.due_at, points: q.total_points, status,
          score: at?.score ?? null, max_score: at?.max_score ?? q.total_points,
          href: `/portal/courses/${q.course_id}/quizzes/${q.id}`,
        });
      });

      setTasks(out);
      setLoading(false);
    })();
  }, [user]);

  const grouped = useMemo(() => {
    const m = new Map<string, Task[]>();
    tasks.forEach(t => {
      const list = m.get(t.course_id) ?? [];
      list.push(t);
      m.set(t.course_id, list);
    });
    return Array.from(m.entries()).map(([cid, list]) => ({
      course_id: cid,
      course_title: list[0].course_title,
      tasks: list.sort((a, b) => {
        const ad = a.due_at ? new Date(a.due_at).getTime() : Infinity;
        const bd = b.due_at ? new Date(b.due_at).getTime() : Infinity;
        return ad - bd;
      }),
    }));
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "graded" || t.status === "submitted").length;
    const missing = tasks.filter(t => t.status === "missing").length;
    return { total, done, missing, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const filtered = (which: "all" | "todo" | "missing" | "done") => tasks.filter(t => {
    if (which === "all") return true;
    if (which === "done") return t.status === "graded" || t.status === "submitted";
    if (which === "missing") return t.status === "missing";
    return t.status === "not_started" || t.status === "in_progress";
  });

  return (
    <PortalLayout>
      <div className="px-6 py-5 max-w-[1200px] mx-auto w-full">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Required Work</h1>
        <p className="text-sm text-muted-foreground mb-5">
          All mandatory assignments and quizzes across your courses. Complete every item to stay on track for certification.
        </p>

        {/* Overall progress */}
        <Card className="mb-6">
          <CardContent className="py-5 px-5">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple/15 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-purple" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Mandatory work completion</div>
                  <div className="text-2xl font-bold text-foreground">{stats.pct}%</div>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" />{stats.done} complete</Badge>
                <Badge variant="outline">{stats.total - stats.done} remaining</Badge>
                {stats.missing > 0 && (
                  <Badge className="bg-coral/15 text-coral border-coral/30 border">
                    <AlertCircle className="h-3 w-3 mr-1" />{stats.missing} missing
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={stats.pct} className="h-2" />
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading required work…</div>
        ) : tasks.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            No required work yet. Items appear here as your instructor publishes them.
          </CardContent></Card>
        ) : (
          <Tabs defaultValue="todo" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="todo">To Do ({filtered("todo").length})</TabsTrigger>
              <TabsTrigger value="missing">Missing ({filtered("missing").length})</TabsTrigger>
              <TabsTrigger value="done">Done ({filtered("done").length})</TabsTrigger>
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
            </TabsList>

            {(["todo", "missing", "done", "all"] as const).map(key => (
              <TabsContent key={key} value={key} className="space-y-6">
                {grouped.map(g => {
                  const visible = g.tasks.filter(t => filtered(key).some(x => x.id === t.id));
                  if (!visible.length) return null;
                  const cDone = g.tasks.filter(t => t.status === "graded" || t.status === "submitted").length;
                  const cPct = g.tasks.length ? Math.round((cDone / g.tasks.length) * 100) : 0;
                  return (
                    <div key={g.course_id}>
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/portal/courses/${g.course_id}`} className="font-semibold text-foreground hover:text-purple flex items-center gap-1">
                          {g.course_title} <ChevronRight className="h-4 w-4" />
                        </Link>
                        <span className="text-xs text-muted-foreground">{cDone}/{g.tasks.length} · {cPct}%</span>
                      </div>
                      <Progress value={cPct} className="h-1 mb-3" />
                      <div className="space-y-2">
                        {visible.map(t => <TaskRow key={t.id} t={t} />)}
                      </div>
                    </div>
                  );
                })}
                {filtered(key).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Nothing here.</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </PortalLayout>
  );
};

const TaskRow = ({ t }: { t: Task }) => {
  const sm = STATUS_META[t.status];
  const due = t.due_at ? new Date(t.due_at) : null;
  const overdue = due && isPast(due) && t.status !== "graded" && t.status !== "submitted";
  const TypeIcon = t.type === "quiz" ? GraduationCap : t.type === "skill" ? Stethoscope : ClipboardList;
  return (
    <Link to={t.href} className="block">
      <Card className={`hover:shadow-soft transition-shadow ${overdue ? "border-coral/40 bg-coral/5" : ""}`}>
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
              <TypeIcon className="h-4 w-4 text-purple" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm text-foreground line-clamp-1">{t.title}</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${sm.cls}`}>
                  <sm.Icon className="h-3 w-3" />
                  {t.status === "graded" && t.score != null ? `${t.score}/${t.max_score}` : sm.label}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.type}</span>
                {due && (
                  <span className={`text-xs ${overdue ? "text-coral font-semibold" : "text-muted-foreground"}`}>
                    Due {formatDistanceToNow(due, { addSuffix: true })}
                  </span>
                )}
                {!!t.points && <span className="text-[10px] text-muted-foreground ml-auto">{Number(t.points)} pts</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RequiredWork;
