import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type Col = { id: string; title: string; max: number; kind: "assignment" | "quiz" };
type Row = { userId: string; name: string; email: string; scores: Record<string, { score: number; max: number } | null> };

const GradebookTab = ({ courseId }: { courseId: string }) => {
  const [cols, setCols] = useState<Col[]>([]);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: assigns }, { data: quizzes }, { data: enrolls }] = await Promise.all([
        supabase.from("assignments").select("id, title, points").eq("course_id", courseId),
        supabase.from("quizzes").select("id, title, total_points").eq("course_id", courseId),
        supabase.from("enrollments").select("user_id").eq("course_id", courseId),
      ]);
      const cs: Col[] = [
        ...(assigns ?? []).map((a: any) => ({ id: a.id, title: a.title, max: Number(a.points), kind: "assignment" as const })),
        ...(quizzes ?? []).map((q: any) => ({ id: q.id, title: q.title, max: Number(q.total_points), kind: "quiz" as const })),
      ];
      setCols(cs);

      const userIds = (enrolls ?? []).map(e => e.user_id);
      if (!userIds.length) { setRows([]); return; }
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const { data: grades } = await supabase.from("grades").select("*").eq("course_id", courseId);
      const { data: attempts } = await supabase.from("quiz_attempts").select("user_id, quiz_id, score, max_score").in("user_id", userIds).not("submitted_at", "is", null);

      const rs: Row[] = userIds.map(uid => {
        const prof = profs?.find(p => p.user_id === uid);
        const scores: Row["scores"] = {};
        cs.forEach(c => {
          if (c.kind === "assignment") {
            const g = grades?.find((x: any) => x.user_id === uid && x.assignment_id === c.id);
            scores[c.id] = g ? { score: Number(g.score), max: Number(g.max_score) } : null;
          } else {
            const a = attempts
              ?.filter(x => x.user_id === uid && x.quiz_id === c.id)
              .sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))[0];
            scores[c.id] = a ? { score: Number(a.score ?? 0), max: Number(a.max_score ?? c.max) } : null;
          }
        });
        return { userId: uid, name: prof?.full_name ?? "(no name)", email: "", scores };
      });
      setRows(rs);
    })();
  }, [courseId]);

  const totals = (r: Row) => {
    let s = 0, m = 0;
    cols.forEach(c => {
      const v = r.scores[c.id];
      if (v) { s += v.score; m += v.max; }
    });
    return { s, m, pct: m ? Math.round((s / m) * 100) : null };
  };

  const exportCsv = () => {
    const header = ["Student", ...cols.map(c => `${c.title} (${c.max})`), "Total", "Percent"];
    const lines = [header.join(",")];
    rows.forEach(r => {
      const t = totals(r);
      const row = [
        `"${r.name.replace(/"/g, '""')}"`,
        ...cols.map(c => {
          const v = r.scores[c.id];
          return v ? v.score : "";
        }),
        t.m ? `${t.s}/${t.m}` : "",
        t.pct !== null ? `${t.pct}%` : "",
      ];
      lines.push(row.join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `gradebook-${courseId.slice(0, 8)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Gradebook</h3>
        <Button size="sm" variant="purple-outline" onClick={exportCsv} disabled={!rows.length}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>
      {rows.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No enrolled students yet.</CardContent></Card>
      ) : (
        <Card><CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3 sticky left-0 bg-muted/40">Student</th>
                {cols.map(c => (
                  <th key={c.id} className="text-center p-3 min-w-[100px]" title={c.title}>
                    <div className="truncate max-w-[120px]">{c.title}</div>
                    <div className="text-xs text-muted-foreground font-normal">/{c.max}</div>
                  </th>
                ))}
                <th className="text-center p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const t = totals(r);
                return (
                  <tr key={r.userId} className="border-t border-border">
                    <td className="p-3 font-medium sticky left-0 bg-background">{r.name}</td>
                    {cols.map(c => {
                      const v = r.scores[c.id];
                      return <td key={c.id} className="text-center p-3">{v ? v.score : <span className="text-muted-foreground">—</span>}</td>;
                    })}
                    <td className="text-center p-3 font-semibold">{t.pct !== null ? `${t.pct}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  );
};

export default GradebookTab;
