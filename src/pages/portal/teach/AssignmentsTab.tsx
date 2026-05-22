import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, EyeOff, Inbox } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Assignment = {
  id: string;
  title: string;
  instructions: string;
  due_at: string | null;
  points: number;
  submission_type: string;
  published: boolean;
};

const AssignmentsTab = ({ courseId }: { courseId: string }) => {
  const [items, setItems] = useState<Assignment[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    if (data?.length) {
      const { data: subs } = await supabase
        .from("submissions")
        .select("assignment_id")
        .in("assignment_id", data.map(a => a.id));
      const c: Record<string, number> = {};
      (subs ?? []).forEach(s => { c[s.assignment_id] = (c[s.assignment_id] ?? 0) + 1; });
      setCounts(c);
    }
  };
  useEffect(() => { load(); }, [courseId]);

  const togglePublish = async (a: Assignment) => {
    await supabase.from("assignments").update({ published: !a.published }).eq("id", a.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this assignment and all submissions?")) return;
    await supabase.from("assignments").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Assignments ({items.length})</h3>
        <NewAssignmentDialog courseId={courseId} onCreated={load} />
      </div>
      {items.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
          No assignments yet. Create one to get started.
        </CardContent></Card>
      )}
      {items.map(a => (
        <Card key={a.id}>
          <CardContent className="pt-5 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {a.points} pts · {a.submission_type}
                {a.due_at && <> · Due {new Date(a.due_at).toLocaleDateString()}</>}
              </div>
              {a.instructions && (
                <p className="text-sm text-foreground/70 mt-2 line-clamp-2 whitespace-pre-wrap">{a.instructions}</p>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end shrink-0">
              <Link to={`/portal/teach/courses/${courseId}/assignments/${a.id}`}>
                <Button size="sm" variant="purple-outline">
                  <Inbox className="h-4 w-4 mr-1" /> {counts[a.id] ?? 0}
                </Button>
              </Link>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => togglePublish(a)}>
                  {a.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const NewAssignmentDialog = ({ courseId, onCreated }: { courseId: string; onCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [points, setPoints] = useState(100);
  const [dueAt, setDueAt] = useState("");
  const [submissionType, setSubmissionType] = useState("text");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("assignments").insert({
      course_id: courseId,
      title,
      instructions,
      points,
      submission_type: submissionType,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
    });
    setBusy(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Assignment created" });
    setOpen(false);
    setTitle(""); setInstructions(""); setPoints(100); setDueAt(""); setSubmissionType("text");
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" /> New Assignment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><Label>Instructions</Label><Textarea rows={5} value={instructions} onChange={e => setInstructions(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Points</Label><Input type="number" min={0} value={points} onChange={e => setPoints(Number(e.target.value))} /></div>
            <div><Label>Due date</Label><Input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} /></div>
          </div>
          <div>
            <Label>Submission type</Label>
            <Select value={submissionType} onValueChange={setSubmissionType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text entry</SelectItem>
                <SelectItem value="file">File upload</SelectItem>
                <SelectItem value="both">Text or file</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={submit} disabled={busy} className="w-full">{busy ? "Saving…" : "Create"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentsTab;
