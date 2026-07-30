// @ts-nocheck
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import RichTextEditor from "@/components/portal/RichTextEditor";

const GROUPS = ["Assignments", "Quizzes", "Clinical Skills", "Exams", "Written Assignments"];
const TYPES = [
  { v: "assignment", l: "Online" },
  { v: "quiz", l: "Quiz" },
  { v: "exam", l: "Exam" },
  { v: "discussion", l: "Discussion" },
  { v: "on_paper", l: "On Paper" },
  { v: "none", l: "No Submission" },
];
const ENTRY_OPTIONS = [
  { v: "text", l: "Text Entry" },
  { v: "url", l: "Website URL" },
  { v: "media", l: "Media Recordings" },
  { v: "annotation", l: "Student Annotation" },
  { v: "file", l: "File Uploads" },
];
const DISPLAY_AS = ["points", "percentage", "complete/incomplete", "letter grade", "not graded"];

const toLocal = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

const blank = {
  title: "",
  instructions: "",
  points: "0",
  group_name: "Assignments",
  display_grade_as: "points",
  omit_from_final_grade: false,
  submission_type: "assignment",
  online_entry_options: ["text"] as string[],
  allowed_attempts: "-1",
  is_group_assignment: false,
  peer_reviews: false,
  anonymous_grading: false,
  due_at: "",
  available_from: "",
  available_until: "",
  published: false,
};

type Props = {
  open: boolean;
  courseId?: string;
  assignment?: any | null;
  onClose: () => void;
  onSaved: (row: any, isNew: boolean) => void;
};

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid gap-2 md:grid-cols-[160px_1fr] md:gap-4">
    <Label className="pt-2 text-right text-xs font-semibold text-muted-foreground md:text-sm">{label}</Label>
    <div className="rounded-md border border-border p-3">{children}</div>
  </div>
);

export default function AssignmentEditorDialog({ open, courseId, assignment, onClose, onSaved }: Props) {
  const [f, setF] = useState<any>(blank);
  const [saving, setSaving] = useState(false);
  const set = (patch: any) => setF((p: any) => ({ ...p, ...patch }));

  useEffect(() => {
    if (!open) return;
    if (assignment) {
      setF({
        title: assignment.title ?? "",
        instructions: assignment.instructions ?? "",
        points: String(assignment.points ?? 0),
        group_name: assignment.group_name ?? "Assignments",
        display_grade_as: assignment.display_grade_as ?? "points",
        omit_from_final_grade: !!assignment.omit_from_final_grade,
        submission_type: assignment.submission_type ?? "assignment",
        online_entry_options: assignment.online_entry_options ?? ["text"],
        allowed_attempts: String(assignment.allowed_attempts ?? -1),
        is_group_assignment: !!assignment.is_group_assignment,
        peer_reviews: !!assignment.peer_reviews,
        anonymous_grading: !!assignment.anonymous_grading,
        due_at: toLocal(assignment.due_at),
        available_from: toLocal(assignment.available_from),
        available_until: toLocal(assignment.available_until),
        published: !!assignment.published,
      });
    } else {
      setF(blank);
    }
  }, [open, assignment]);

  const toggleEntry = (v: string) =>
    set({
      online_entry_options: f.online_entry_options.includes(v)
        ? f.online_entry_options.filter((x: string) => x !== v)
        : [...f.online_entry_options, v],
    });

  const save = async (publish?: boolean) => {
    if (!f.title.trim()) return toast.error("Assignment name is required");
    if (!courseId) return toast.error("Missing course");
    const payload = {
      course_id: courseId,
      title: f.title.trim(),
      instructions: f.instructions || "",
      points: Number(f.points) || 0,
      group_name: f.group_name,
      display_grade_as: f.display_grade_as,
      omit_from_final_grade: f.omit_from_final_grade,
      submission_type: f.submission_type,
      online_entry_options: f.submission_type === "assignment" ? f.online_entry_options : [],
      allowed_attempts: Number(f.allowed_attempts) || -1,
      is_group_assignment: f.is_group_assignment,
      peer_reviews: f.peer_reviews,
      anonymous_grading: f.anonymous_grading,
      due_at: f.due_at ? new Date(f.due_at).toISOString() : null,
      available_from: f.available_from ? new Date(f.available_from).toISOString() : null,
      available_until: f.available_until ? new Date(f.available_until).toISOString() : null,
      published: publish ?? f.published,
    };
    setSaving(true);
    const q = assignment
      ? supabase.from("assignments").update(payload).eq("id", assignment.id).select().single()
      : supabase.from("assignments").insert(payload).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message || "Could not save assignment");
    toast.success(assignment ? "Assignment updated" : "Assignment created");
    onSaved(data, !assignment);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{assignment ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="asgn-name">Assignment Name *</Label>
            <Input id="asgn-name" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="Assignment Name" />
          </div>

          <div className="space-y-1.5">
            <Label>Instructions</Label>
            <RichTextEditor value={f.instructions} onChange={(html) => set({ instructions: html })} minHeight={200} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="asgn-points">Points</Label>
              <Input id="asgn-points" type="number" min="0" value={f.points} onChange={(e) => set({ points: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asgn-group">Assignment Group</Label>
              <select id="asgn-group" value={f.group_name} onChange={(e) => set({ group_name: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asgn-display">Display Grade as</Label>
              <select id="asgn-display" value={f.display_grade_as} onChange={(e) => set({ display_grade_as: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize">
                {DISPLAY_AS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <Checkbox checked={f.omit_from_final_grade} onCheckedChange={(c) => set({ omit_from_final_grade: !!c })} />
              Do not count this assignment towards the final grade
            </label>
          </div>

          <Section label="Submission Type">
            <select value={f.submission_type} onChange={(e) => set({ submission_type: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
            {f.submission_type === "assignment" && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold">Online Entry Options *</div>
                {ENTRY_OPTIONS.map((o) => (
                  <label key={o.v} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={f.online_entry_options.includes(o.v)} onCheckedChange={() => toggleEntry(o.v)} />
                    {o.l}
                  </label>
                ))}
              </div>
            )}
          </Section>

          <Section label="Submission Attempts">
            <div className="text-xs font-semibold">Allowed Attempts</div>
            <select value={f.allowed_attempts} onChange={(e) => set({ allowed_attempts: e.target.value })}
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="-1">Unlimited</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={String(n)}>{n}</option>)}
            </select>
          </Section>

          <Section label="Options">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={f.is_group_assignment} onCheckedChange={(c) => set({ is_group_assignment: !!c })} />
              This is a Group Assignment
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <Checkbox checked={f.peer_reviews} onCheckedChange={(c) => set({ peer_reviews: !!c })} />
              Require Peer Reviews
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <Checkbox checked={f.anonymous_grading} onCheckedChange={(c) => set({ anonymous_grading: !!c })} />
              Graders cannot view student names
            </label>
          </Section>

          <Section label="Assign Access">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="asgn-due" className="text-xs">Due</Label>
                <Input id="asgn-due" type="datetime-local" value={f.due_at} onChange={(e) => set({ due_at: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="asgn-from" className="text-xs">Available from</Label>
                <Input id="asgn-from" type="datetime-local" value={f.available_from} onChange={(e) => set({ available_from: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="asgn-until" className="text-xs">Until</Label>
                <Input id="asgn-until" type="datetime-local" value={f.available_until} onChange={(e) => set({ available_until: e.target.value })} />
              </div>
            </div>
          </Section>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="secondary" onClick={() => save(false)} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button onClick={() => save(true)} disabled={saving} className="bg-purple text-white hover:bg-purple/90">
            Save &amp; Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
