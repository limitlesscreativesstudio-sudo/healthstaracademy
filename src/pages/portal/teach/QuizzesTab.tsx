import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Quiz = {
  id: string;
  title: string;
  instructions: string;
  due_at: string | null;
  total_points: number;
  time_limit_minutes: number | null;
  attempts_allowed: number;
  published: boolean;
};

const QuizzesTab = ({ courseId }: { courseId: string }) => {
  const [items, setItems] = useState<Quiz[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, [courseId]);

  const togglePublish = async (q: Quiz) => {
    await supabase.from("quizzes").update({ published: !q.published }).eq("id", q.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this quiz and all attempts?")) return;
    await supabase.from("quizzes").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Quizzes ({items.length})</h3>
        <NewQuizDialog courseId={courseId} onCreated={load} />
      </div>
      {items.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
          No quizzes yet. Create one to get started.
        </CardContent></Card>
      )}
      {items.map(q => (
        <Card key={q.id}>
          <CardContent className="pt-5 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{q.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {q.total_points} pts · {q.attempts_allowed} attempt{q.attempts_allowed === 1 ? "" : "s"}
                {q.time_limit_minutes && <> · {q.time_limit_minutes} min</>}
                {q.due_at && <> · Due {new Date(q.due_at).toLocaleDateString()}</>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Link to={`/portal/teach/courses/${courseId}/quizzes/${q.id}`}>
                <Button size="sm" variant="purple-outline"><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => togglePublish(q)}>
                {q.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(q.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const NewQuizDialog = ({ courseId, onCreated }: { courseId: string; onCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [timeLimit, setTimeLimit] = useState<string>("");
  const [attempts, setAttempts] = useState(1);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("quizzes").insert({
      course_id: courseId,
      title,
      instructions,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      time_limit_minutes: timeLimit ? Number(timeLimit) : null,
      attempts_allowed: attempts,
    });
    setBusy(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Quiz created — add questions next" });
    setOpen(false);
    setTitle(""); setInstructions(""); setDueAt(""); setTimeLimit(""); setAttempts(1);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" /> New Quiz</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New Quiz</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><Label>Instructions</Label><Textarea rows={4} value={instructions} onChange={e => setInstructions(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Due date</Label><Input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} /></div>
            <div><Label>Time limit (min)</Label><Input type="number" min={0} value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="Optional" /></div>
          </div>
          <div><Label>Attempts allowed</Label><Input type="number" min={1} value={attempts} onChange={e => setAttempts(Number(e.target.value))} /></div>
          <Button onClick={submit} disabled={busy} className="w-full">{busy ? "Saving…" : "Create"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizzesTab;
