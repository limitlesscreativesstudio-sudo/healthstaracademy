import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { usePortalAuth } from "@/hooks/usePortalAuth";

const StudentGrades = ({ courseId }: { courseId: string }) => {
  const { user } = usePortalAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: grades } = await supabase
        .from("grades")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .order("graded_at", { ascending: false });
      const assignmentIds = (grades ?? []).map(g => g.assignment_id).filter(Boolean);
      const attemptIds = (grades ?? []).map(g => g.quiz_attempt_id).filter(Boolean);
      const [{ data: assigns }, { data: attempts }] = await Promise.all([
        assignmentIds.length
          ? supabase.from("assignments").select("id, title").in("id", assignmentIds)
          : Promise.resolve({ data: [] as any[] }),
        attemptIds.length
          ? supabase.from("quiz_attempts").select("id, quiz_id, quizzes(title)").in("id", attemptIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      setRows((grades ?? []).map(g => {
        const label = g.assignment_id
          ? assigns?.find((a: any) => a.id === g.assignment_id)?.title ?? "Assignment"
          : attempts?.find((a: any) => a.id === g.quiz_attempt_id)?.quizzes?.title ?? "Quiz";
        return { ...g, label };
      }));
    })();
  }, [courseId, user?.id]);

  const total = rows.reduce((s, r) => s + Number(r.score), 0);
  const max = rows.reduce((s, r) => s + Number(r.max_score), 0);
  const pct = max ? Math.round((total / max) * 100) : null;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Grades</h2>
      {rows.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No grades yet.</CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Item</th>
                <th className="text-right p-3">Score</th>
                <th className="text-right p-3">Out of</th>
                <th className="text-left p-3">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-medium">{r.label}</td>
                  <td className="p-3 text-right">{r.score}</td>
                  <td className="p-3 text-right">{r.max_score}</td>
                  <td className="p-3 text-muted-foreground">{r.feedback || "—"}</td>
                </tr>
              ))}
              {pct !== null && (
                <tr className="border-t border-border bg-muted/30 font-semibold">
                  <td className="p-3">Total</td>
                  <td className="p-3 text-right">{total}</td>
                  <td className="p-3 text-right">{max}</td>
                  <td className="p-3">{pct}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  );
};

export default StudentGrades;
