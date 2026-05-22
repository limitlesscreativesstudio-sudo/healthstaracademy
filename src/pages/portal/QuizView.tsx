import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePortalAuth } from "@/hooks/usePortalAuth";

type Quiz = {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  total_points: number;
  attempts_allowed: number;
  due_at: string | null;
};
type Question = {
  id: string;
  position: number;
  question_type: string;
  prompt: string;
  options: any;
  correct_answer: any;
  points: number;
};

const QuizView = () => {
  const { courseId, quizId } = useParams();
  const { user } = usePortalAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: q } = await supabase.from("quizzes").select("*").eq("id", quizId!).maybeSingle();
    setQuiz(q as any);
    const { data: qs } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId!).order("position");
    setQuestions((qs ?? []) as any);
    if (user) {
      const { data: at } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId!)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setAttempts(at ?? []);
    }
  };
  useEffect(() => { load(); }, [quizId, user?.id]);

  const startAttempt = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({ quiz_id: quizId!, user_id: user.id, answers: {} })
      .select()
      .single();
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setActive(data); setAnswers({});
  };

  const submitAttempt = async () => {
    if (!active || !quiz) return;
    setBusy(true);
    let score = 0;
    let max = 0;
    questions.forEach(q => {
      max += Number(q.points);
      const ans = answers[q.id];
      if (q.question_type === "multiple_choice") {
        if (Number(ans) === Number(q.correct_answer)) score += Number(q.points);
      } else if (q.question_type === "true_false") {
        if (ans === q.correct_answer || String(ans) === String(q.correct_answer)) score += Number(q.points);
      } else if (q.question_type === "short_answer") {
        if (q.correct_answer && String(ans ?? "").trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase()) {
          score += Number(q.points);
        }
      }
    });
    const { error } = await supabase.from("quiz_attempts").update({
      answers, score, max_score: max, submitted_at: new Date().toISOString(),
    }).eq("id", active.id);
    if (error) { setBusy(false); return toast({ title: "Error", description: error.message, variant: "destructive" }); }
    // Save grade snapshot (auto-graded portion)
    if (user) {
      await supabase.from("grades").insert({
        course_id: quiz.course_id, user_id: user.id, quiz_attempt_id: active.id,
        score, max_score: max, feedback: "Auto-graded",
      });
    }
    setBusy(false);
    toast({ title: `Submitted — ${score}/${max}` });
    setActive(null); setAnswers({});
    load();
  };

  if (!quiz) return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;

  const completed = attempts.filter(a => a.submitted_at);
  const canAttempt = completed.length < quiz.attempts_allowed;

  if (active) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <h1 className="font-heading text-2xl font-bold mb-1">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">Answer all questions, then submit.</p>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <Card key={q.id}>
                <CardContent className="pt-5 space-y-3">
                  <div className="text-xs text-muted-foreground">Q{i + 1} · {q.points} pt{q.points === 1 ? "" : "s"}</div>
                  <div className="font-medium whitespace-pre-wrap">{q.prompt}</div>
                  {q.question_type === "multiple_choice" && Array.isArray(q.options) && (
                    <div className="space-y-1">
                      {q.options.map((opt: string, idx: number) => (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/40">
                          <input
                            type="radio"
                            name={q.id}
                            checked={Number(answers[q.id]) === idx}
                            onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.question_type === "true_false" && (
                    <div className="space-y-1">
                      {[true, false].map(val => (
                        <label key={String(val)} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/40">
                          <input
                            type="radio"
                            name={q.id}
                            checked={answers[q.id] === val}
                            onChange={() => setAnswers({ ...answers, [q.id]: val })}
                          />
                          <span>{val ? "True" : "False"}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.question_type === "short_answer" && (
                    <Input value={answers[q.id] ?? ""} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                  )}
                </CardContent>
              </Card>
            ))}
            <Button onClick={submitAttempt} disabled={busy} className="w-full">
              {busy ? "Submitting…" : "Submit Quiz"}
            </Button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <Link to={`/portal/courses/${courseId}/modules`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
        <h1 className="font-heading text-3xl font-bold mb-1">{quiz.title}</h1>
        <div className="text-sm text-muted-foreground mb-4">
          {quiz.total_points} pts · {questions.length} questions · {completed.length}/{quiz.attempts_allowed} attempts used
        </div>

        {quiz.instructions && (
          <Card className="mb-4"><CardContent className="pt-5 whitespace-pre-wrap text-sm">{quiz.instructions}</CardContent></Card>
        )}

        {completed.length > 0 && (
          <Card className="mb-4">
            <CardContent className="pt-5">
              <h3 className="font-semibold mb-2">Previous attempts</h3>
              {completed.map(a => (
                <div key={a.id} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
                  <span>{new Date(a.submitted_at).toLocaleString()}</span>
                  <span className="font-medium">{a.score}/{a.max_score}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {canAttempt ? (
          <Button onClick={startAttempt} disabled={questions.length === 0}>
            {completed.length === 0 ? "Start Quiz" : "Start New Attempt"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">No attempts remaining.</p>
        )}
      </div>
    </PortalLayout>
  );
};

export default QuizView;
