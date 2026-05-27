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
import { useUnsavedGuard } from "@/hooks/useUnsavedGuard";
import SaveStatus from "@/components/portal/SaveStatus";
import DraftRestoreBanner from "@/components/portal/DraftRestoreBanner";

type Quiz = {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  due_at: string | null;
  time_limit_minutes: number | null;
  attempts_allowed: number;
  total_points: number;
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
        <p className="text-sm text-muted-foreground mb-4">Total: {quiz.total_points} pts · {questions.length} question{questions.length === 1 ? "" : "s"}</p>

        <QuizSettingsCard quiz={quiz} onSaved={load} />

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

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <AddQuestionDialog quizId={quizId!} position={questions.length} onAdded={async () => { await load(); }} />
          <BulkImportDialog quizId={quizId!} startPosition={questions.length} onAdded={async () => { await load(); }} />
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

const BulkImportDialog = ({ quizId, startPosition, onAdded }: { quizId: string; startPosition: number; onAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [defaultPoints, setDefaultPoints] = useState(1);
  const [busy, setBusy] = useState(false);

  const parse = (raw: string) => {
    // Format per question (blocks separated by blank line OR ---):
    //   Q: What is 2 + 2?
    //   A) 3
    //   B) 4 *
    //   C) 5
    //   D) 22
    // True/False:
    //   Q: The sky is blue.
    //   T/F: true
    // Short answer:
    //   Q: Capital of California?
    //   SA: Sacramento
    const blocks = raw
      .split(/\n\s*(?:---+|\n)\s*\n/)
      .map(b => b.trim())
      .filter(Boolean);
    const rows: any[] = [];
    let pos = startPosition;
    for (const block of blocks) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (!lines.length) continue;
      const promptLine = lines.shift()!;
      const prompt = promptLine.replace(/^Q\s*[:.)-]\s*/i, "").trim();
      if (!prompt) continue;

      // True / False
      const tfLine = lines.find(l => /^T\s*\/\s*F\s*[:.)-]/i.test(l));
      if (tfLine) {
        const val = tfLine.replace(/^T\s*\/\s*F\s*[:.)-]\s*/i, "").trim().toLowerCase();
        rows.push({
          quiz_id: quizId, position: pos++, question_type: "true_false",
          prompt, options: [], correct_answer: val.startsWith("t"), points: defaultPoints,
        });
        continue;
      }
      // Short answer
      const saLine = lines.find(l => /^(SA|ANS|ANSWER)\s*[:.)-]/i.test(l));
      if (saLine) {
        const ans = saLine.replace(/^(SA|ANS|ANSWER)\s*[:.)-]\s*/i, "").trim();
        rows.push({
          quiz_id: quizId, position: pos++, question_type: "short_answer",
          prompt, options: [], correct_answer: ans || null, points: defaultPoints,
        });
        continue;
      }
      // Multiple choice
      const opts: string[] = [];
      let correctIdx = -1;
      for (const l of lines) {
        const m = l.match(/^([A-Za-z])\s*[).:-]\s*(.+)$/);
        if (!m) continue;
        let body = m[2].trim();
        const starred = /\s\*$|\s\(correct\)$|\s\[correct\]$/i.test(body) || body.endsWith("*");
        if (starred) {
          body = body.replace(/\s*\*$|\s*\(correct\)$|\s*\[correct\]$/i, "").trim();
          correctIdx = opts.length;
        }
        opts.push(body);
      }
      if (opts.length >= 2 && correctIdx >= 0) {
        rows.push({
          quiz_id: quizId, position: pos++, question_type: "multiple_choice",
          prompt, options: opts, correct_answer: correctIdx, points: defaultPoints,
        });
      }
    }
    return rows;
  };

  const preview = parse(text);

  const submit = async () => {
    if (!preview.length) return;
    setBusy(true);
    const { error } = await supabase.from("quiz_questions").insert(preview);
    if (error) {
      setBusy(false);
      return toast({ title: "Import failed", description: error.message, variant: "destructive" });
    }
    const { data: all } = await supabase.from("quiz_questions").select("points").eq("quiz_id", quizId);
    const total = (all ?? []).reduce((s: number, x: any) => s + Number(x.points || 0), 0);
    await supabase.from("quizzes").update({ total_points: total }).eq("id", quizId);
    setBusy(false);
    toast({ title: `Imported ${preview.length} question${preview.length === 1 ? "" : "s"}` });
    setOpen(false); setText(""); onAdded();
  };

  const sample = `Q: What is the normal adult oral temperature range (°F)?
A) 96.0 – 97.0
B) 97.6 – 99.6 *
C) 99.7 – 101.4
D) 101.5 – 103.0

Q: Hand hygiene is the single most important infection-control measure.
T/F: true

Q: What does CNA stand for?
SA: Certified Nursing Assistant`;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setText(""); }}>
      <DialogTrigger asChild>
        <Button variant="purple-outline" className="w-full"><Plus className="h-4 w-4 mr-1" /> Bulk Import Questions</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Bulk Import Questions</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Separate questions with a blank line or <code className="bg-muted px-1 rounded">---</code>. Mark the correct multiple-choice option with <code className="bg-muted px-1 rounded">*</code>.</p>
            <p>Supported: Multiple choice (<code>A) … *</code>), True/False (<code>T/F: true</code>), Short answer (<code>SA: …</code>).</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Default points per question</Label>
            <Input type="number" min={0} className="w-20 h-8"
              value={defaultPoints} onChange={e => setDefaultPoints(Number(e.target.value))} />
            <Button size="sm" variant="ghost" className="ml-auto h-8 text-xs"
              onClick={() => setText(sample)}>Insert sample</Button>
          </div>
          <Textarea rows={14} value={text} onChange={e => setText(e.target.value)} placeholder={sample}
            className="font-mono text-xs" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Parsed: <strong className="text-foreground">{preview.length}</strong> question{preview.length === 1 ? "" : "s"}</span>
          </div>
          <Button onClick={submit} disabled={busy || preview.length === 0} className="w-full">
            {busy ? "Importing…" : `Import ${preview.length} question${preview.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const toLocal = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const QuizSettingsCard = ({ quiz, onSaved }: { quiz: Quiz; onSaved: () => void }) => {
  const [title, setTitle] = useState(quiz.title);
  const [instructions, setInstructions] = useState(quiz.instructions ?? "");
  const [dueAt, setDueAt] = useState(toLocal(quiz.due_at));
  const [timeLimit, setTimeLimit] = useState<string>(quiz.time_limit_minutes ? String(quiz.time_limit_minutes) : "");
  const [attempts, setAttempts] = useState(quiz.attempts_allowed ?? 1);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Keep form state in sync if the quiz reloads (e.g. after save).
  useEffect(() => {
    setTitle(quiz.title);
    setInstructions(quiz.instructions ?? "");
    setDueAt(toLocal(quiz.due_at));
    setTimeLimit(quiz.time_limit_minutes ? String(quiz.time_limit_minutes) : "");
    setAttempts(quiz.attempts_allowed ?? 1);
  }, [quiz.id, quiz.title, quiz.instructions, quiz.due_at, quiz.time_limit_minutes, quiz.attempts_allowed]);

  const dirty =
    title !== quiz.title ||
    instructions !== (quiz.instructions ?? "") ||
    dueAt !== toLocal(quiz.due_at) ||
    timeLimit !== (quiz.time_limit_minutes ? String(quiz.time_limit_minutes) : "") ||
    attempts !== (quiz.attempts_allowed ?? 1);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("quizzes").update({
      title,
      instructions,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      time_limit_minutes: timeLimit ? Number(timeLimit) : null,
      attempts_allowed: attempts,
    }).eq("id", quiz.id);
    setBusy(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Quiz settings saved", description: "Stored in the database." });
    onSaved();
  };

  return (
    <Card className="mb-6">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30 text-left hover:bg-muted/50"
      >
        <span className="font-semibold text-sm">
          Quiz settings
          {dirty && <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600">Unsaved</span>}
        </span>
        <span className="text-xs text-muted-foreground">{expanded ? "Hide" : "Edit"}</span>
      </button>
      {expanded && (
        <CardContent className="pt-5 space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><Label>Instructions</Label><Textarea rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Due date</Label><Input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} /></div>
            <div><Label>Time limit (min)</Label><Input type="number" min={0} value={timeLimit} placeholder="Optional" onChange={e => setTimeLimit(e.target.value)} /></div>
          </div>
          <div><Label>Attempts allowed</Label><Input type="number" min={1} value={attempts} onChange={e => setAttempts(Number(e.target.value))} /></div>
          <Button onClick={save} disabled={busy || !dirty}>{busy ? "Saving…" : dirty ? "Save settings" : "Saved"}</Button>
        </CardContent>
      )}
    </Card>
  );
};

export default QuizEditor;
