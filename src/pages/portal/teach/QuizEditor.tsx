import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Quiz = { id: string; course_id: string; title: string; total_points: number };
type Question = {
  id: string;
  position: number;
  question_type: string;
  prompt: string;
  options: any;
  correct_answer: any;
  points: number;
};

const QuizEditor = () => {
  const { courseId, quizId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const load = async () => {
    const { data: q } = await supabase.from("quizzes").select("*").eq("id", quizId!).maybeSingle();
    setQuiz(q as any);
    const { data: qs } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId!)
      .order("position");
    setQuestions((qs ?? []) as any);
  };
  useEffect(() => { load(); }, [quizId]);

  const recomputeTotal = async (qs: Question[]) => {
    const total = qs.reduce((s, q) => s + Number(q.points || 0), 0);
    await supabase.from("quizzes").update({ total_points: total }).eq("id", quizId!);
  };

  const removeQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await supabase.from("quiz_questions").delete().eq("id", id);
    const next = questions.filter(q => q.id !== id);
    setQuestions(next);
    await recomputeTotal(next);
  };

  if (!quiz) return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;

  return (
    <PortalLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Link to={`/portal/teach/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
        <h1 className="font-heading text-3xl font-bold mb-1">{quiz.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">Total: {quiz.total_points} pts · {questions.length} question{questions.length === 1 ? "" : "s"}</p>

        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="pt-5">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground mb-1">
                      Q{i + 1} · {q.question_type.replace("_", " ")} · {q.points} pts
                    </div>
                    <div className="font-medium whitespace-pre-wrap">{q.prompt}</div>
                    {q.question_type === "multiple_choice" && Array.isArray(q.options) && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {q.options.map((opt: string, idx: number) => (
                          <li key={idx} className={idx === q.correct_answer ? "text-primary font-medium" : "text-foreground/70"}>
                            {idx === q.correct_answer ? "✓ " : "  "}{opt}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.question_type === "true_false" && (
                      <div className="text-sm mt-2 text-primary font-medium">Answer: {q.correct_answer ? "True" : "False"}</div>
                    )}
                    {q.question_type === "short_answer" && q.correct_answer && (
                      <div className="text-sm mt-2 text-primary font-medium">Accepted: {String(q.correct_answer)}</div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4">
          <AddQuestionDialog quizId={quizId!} position={questions.length} onAdded={async () => { await load(); }} />
        </div>
      </div>
    </PortalLayout>
  );
};

const AddQuestionDialog = ({ quizId, position, onAdded }: { quizId: string; position: number; onAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("multiple_choice");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correct, setCorrect] = useState<any>(0);
  const [points, setPoints] = useState(1);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setType("multiple_choice"); setPrompt(""); setOptions(["", "", "", ""]); setCorrect(0); setPoints(1);
  };

  const submit = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    let opts: any = [];
    let correctAnswer: any = null;
    if (type === "multiple_choice") {
      opts = options.filter(o => o.trim());
      if (opts.length < 2) { setBusy(false); return toast({ title: "Need at least 2 options", variant: "destructive" }); }
      correctAnswer = Number(correct);
    } else if (type === "true_false") {
      correctAnswer = correct === true || correct === "true";
    } else if (type === "short_answer") {
      correctAnswer = String(correct).trim() || null;
    }
    const { error } = await supabase.from("quiz_questions").insert({
      quiz_id: quizId, position, question_type: type, prompt, options: opts, correct_answer: correctAnswer, points,
    });
    if (!error) {
      const { data: all } = await supabase.from("quiz_questions").select("points").eq("quiz_id", quizId);
      const total = (all ?? []).reduce((s: number, x: any) => s + Number(x.points || 0), 0);
      await supabase.from("quizzes").update({ total_points: total }).eq("id", quizId);
    }
    setBusy(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Question added" });
    setOpen(false); reset(); onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button className="w-full"><Plus className="h-4 w-4 mr-1" /> Add Question</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => { setType(v); setCorrect(v === "true_false" ? true : v === "multiple_choice" ? 0 : ""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple choice</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="short_answer">Short answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Question</Label><Textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} /></div>

          {type === "multiple_choice" && (
            <div className="space-y-2">
              <Label>Options (select the correct one)</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={Number(correct) === i}
                    onChange={() => setCorrect(i)}
                  />
                  <Input value={opt} placeholder={`Option ${i + 1}`}
                    onChange={e => setOptions(options.map((o, j) => j === i ? e.target.value : o))} />
                </div>
              ))}
            </div>
          )}
          {type === "true_false" && (
            <div>
              <Label>Correct answer</Label>
              <Select value={String(correct)} onValueChange={(v) => setCorrect(v === "true")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {type === "short_answer" && (
            <div>
              <Label>Accepted answer (case-insensitive, exact match)</Label>
              <Input value={correct} onChange={e => setCorrect(e.target.value)} />
            </div>
          )}

          <div><Label>Points</Label><Input type="number" min={0} value={points} onChange={e => setPoints(Number(e.target.value))} /></div>
          <Button onClick={submit} disabled={busy} className="w-full">{busy ? "Saving…" : "Add"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizEditor;
