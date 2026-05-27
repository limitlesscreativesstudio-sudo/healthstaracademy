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
import { Plus, Trash2, Eye, EyeOff, Inbox, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUnsavedGuard } from "@/hooks/useUnsavedGuard";
import SaveStatus from "@/components/portal/SaveStatus";
import DraftRestoreBanner from "@/components/portal/DraftRestoreBanner";

type Assignment = {
  id: string;
  title: string;
  instructions: string;
  due_at: string | null;
  points: number;
  submission_type: string;
  published: boolean;
};

const toLocal = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AssignmentsTab = ({ courseId }: { courseId: string }) => {
  const [items, setItems] = useState<Assignment[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Assignment | null>(null);

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

  const filtered = items.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center gap-3">
        <Input
          placeholder="Search for Assignment"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <AssignmentDialog courseId={courseId} onSaved={load} />
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
          {items.length === 0 ? "No assignments yet. Create one to get started." : "No matches."}
        </CardContent></Card>
      )}
      {filtered.map(a => (
        <Card key={a.id}>
          <CardContent className="pt-5 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {!a.published && <span className="mr-2">Closed</span>}
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
                <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>
                  <Pencil className="h-4 w-4" />
                </Button>
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

      {editing && (
        <AssignmentDialog
          courseId={courseId}
          existing={editing}
          open
          onOpenChange={(o) => { if (!o) setEditing(null); }}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
};

const AssignmentDialog = ({
  courseId, onSaved, existing, open: controlledOpen, onOpenChange,
}: {
  courseId: string;
  onSaved: () => void;
  existing?: Assignment;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) => {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;

  const initial = {
    title: existing?.title ?? "",
    instructions: existing?.instructions ?? "",
    points: existing?.points ?? 100,
    dueAt: toLocal(existing?.due_at ?? null),
    submissionType: existing?.submission_type ?? "text",
  };
  const [title, setTitle] = useState(initial.title);
  const [instructions, setInstructions] = useState(initial.instructions);
  const [points, setPoints] = useState(initial.points);
  const [dueAt, setDueAt] = useState(initial.dueAt);
  const [submissionType, setSubmissionType] = useState(initial.submissionType);
  const [busy, setBusy] = useState(false);

  const draftKey = open
    ? `lms:assignment-draft:${courseId}:${existing?.id ?? "new"}`
    : null;
  const guard = useUnsavedGuard(
    draftKey,
    { title, instructions, points, dueAt, submissionType },
    initial,
  );

  const setOpen = (o: boolean) => {
    if (!o && guard.dirty && !busy) {
      if (!guard.confirmDiscard()) return;
    }
    isControlled ? onOpenChange?.(o) : setInternalOpen(o);
  };

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const payload = {
      title,
      instructions,
      points,
      submission_type: submissionType,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
    };
    const { error } = existing
      ? await supabase.from("assignments").update(payload).eq("id", existing.id)
      : await supabase.from("assignments").insert({ ...payload, course_id: courseId });
    setBusy(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({
      title: existing ? "Assignment saved" : "Assignment created",
      description: "Stored in the database.",
    });
    guard.markSaved({ title, instructions, points, dueAt, submissionType });
    isControlled ? onOpenChange?.(false) : setInternalOpen(false);
    if (!existing) {
      setTitle(""); setInstructions(""); setPoints(100); setDueAt(""); setSubmissionType("text");
    }
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button><Plus className="h-4 w-4 mr-1" /> New Assignment</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle>{existing ? "Edit Assignment" : "New Assignment"}</DialogTitle>
            <SaveStatus dirty={guard.dirty} saving={busy} savedAt={guard.savedAt} />
          </div>
        </DialogHeader>
        <DraftRestoreBanner
          loadDraft={guard.loadDraft}
          clearDraft={guard.clearDraft}
          isDifferent={(d: any) =>
            d.title !== initial.title ||
            d.instructions !== initial.instructions ||
            d.points !== initial.points ||
            d.dueAt !== initial.dueAt ||
            d.submissionType !== initial.submissionType
          }
          onRestore={(d: any) => {
            setTitle(d.title ?? ""); setInstructions(d.instructions ?? "");
            setPoints(d.points ?? 100); setDueAt(d.dueAt ?? "");
            setSubmissionType(d.submissionType ?? "text");
          }}
          label="Restore your unsaved assignment draft?"
        />
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
          <Button onClick={submit} disabled={busy || !guard.dirty} className="w-full">
            {busy ? "Saving…" : existing ? "Save changes" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentsTab;
