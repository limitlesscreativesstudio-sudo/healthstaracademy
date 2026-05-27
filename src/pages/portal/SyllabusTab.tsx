import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ClipboardList, GraduationCap, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

type SummaryRow = {
  id: string;
  kind: "assignment" | "quiz";
  title: string;
  due_at: string | null;
};

const SyllabusTab = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const [syllabusHtml, setSyllabusHtml] = useState<string>("");
  const [showSummary, setShowSummary] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftHtml, setDraftHtml] = useState("");
  const [draftShowSummary, setDraftShowSummary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<SummaryRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("courses")
        .select("syllabus_html, syllabus_show_summary")
        .eq("id", courseId)
        .maybeSingle();
      setSyllabusHtml(data?.syllabus_html ?? "");
      setShowSummary(data?.syllabus_show_summary ?? true);
      setLoading(false);
    })();
  }, [courseId]);

  useEffect(() => {
    (async () => {
      const [{ data: assigns }, { data: quizzes }] = await Promise.all([
        supabase.from("assignments").select("id, title, due_at, published").eq("course_id", courseId),
        supabase.from("quizzes").select("id, title, due_at, published").eq("course_id", courseId),
      ]);
      const rows: SummaryRow[] = [
        ...(assigns ?? [])
          .filter(a => isInstructor || a.published)
          .map(a => ({ id: a.id, kind: "assignment" as const, title: a.title, due_at: a.due_at })),
        ...(quizzes ?? [])
          .filter(q => isInstructor || q.published)
          .map(q => ({ id: q.id, kind: "quiz" as const, title: q.title, due_at: q.due_at })),
      ];
      rows.sort((a, b) => {
        if (!a.due_at && !b.due_at) return 0;
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      });
      setSummary(rows);
    })();
  }, [courseId, isInstructor]);

  const draftKey = `lms:syllabus-draft:${courseId}`;
  const initialDraft = { html: syllabusHtml, showSummary };
  const guard = useUnsavedGuard(
    editing ? draftKey : null,
    { html: draftHtml, showSummary: draftShowSummary },
    initialDraft,
  );

  const openEditor = () => {
    setDraftHtml(syllabusHtml);
    setDraftShowSummary(showSummary);
    setEditing(true);
    // Offer recovered draft
    const recovered = guard.loadDraft();
    if (recovered && recovered.html !== syllabusHtml) {
      if (window.confirm("Restore your unsaved syllabus draft from last session?")) {
        setDraftHtml(recovered.html as string);
        setDraftShowSummary(recovered.showSummary as boolean);
      } else {
        guard.clearDraft();
      }
    }
  };

  const cancelEdit = () => {
    if (guard.confirmDiscard()) setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("courses")
      .update({ syllabus_html: draftHtml, syllabus_show_summary: draftShowSummary })
      .eq("id", courseId);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setSyllabusHtml(draftHtml);
    setShowSummary(draftShowSummary);
    guard.markSaved({ html: draftHtml, showSummary: draftShowSummary });
    setEditing(false);
    toast({ title: "Syllabus saved", description: "Stored in the database." });
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const sanitized = DOMPurify.sanitize(syllabusHtml || "");

  return (
    <div>
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3 mb-4">
        <h1 className="font-heading text-2xl font-bold">Course Syllabus</h1>
        {isInstructor && !editing && (
          <Button size="sm" variant="outline" onClick={openEditor}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <Card><CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Syllabus Description</div>
            <span className={`text-xs ${guard.dirty ? "text-amber-600" : "text-muted-foreground"}`}>
              {saving ? "Saving…" : guard.dirty ? "Unsaved changes" : "All changes saved"}
            </span>
          </div>
          <Textarea
            rows={16}
            value={draftHtml}
            onChange={(e) => setDraftHtml(e.target.value)}
            placeholder="Paste your syllabus here. Basic HTML is supported (e.g. <h2>, <p>, <ul>, <li>, <a href>, <strong>)."
            className="font-mono text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={draftShowSummary}
              onCheckedChange={(c) => setDraftShowSummary(c === true)}
            />
            Show Course Summary
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={cancelEdit} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !guard.dirty}>{saving ? "Saving…" : "Update Syllabus"}</Button>
          </div>
        </CardContent></Card>
      ) : sanitized.trim() ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitized }} />
      ) : (
        <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
          {isInstructor
            ? "No syllabus posted yet. Click Edit to add one."
            : "Your instructor has not posted a syllabus yet."}
        </CardContent></Card>
      )}

      {showSummary && (
        <div className="mt-10">
          <h2 className="font-heading text-xl font-bold mb-3">Course Summary:</h2>
          {summary.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">
              No assignments or quizzes scheduled.
            </CardContent></Card>
          ) : (
            <div className="border border-border rounded-md overflow-hidden">
              <div className="grid grid-cols-[140px_1fr_180px] bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <div className="px-4 py-2">Date</div>
                <div className="px-4 py-2">Details</div>
                <div className="px-4 py-2 text-right">Due</div>
              </div>
              {summary.map(row => {
                const date = row.due_at ? new Date(row.due_at) : null;
                const Icon = row.kind === "quiz" ? GraduationCap : ClipboardList;
                const to = row.kind === "quiz"
                  ? `/portal/courses/${courseId}/quizzes/${row.id}`
                  : `/portal/courses/${courseId}/assignments/${row.id}`;
                return (
                  <Link key={`${row.kind}-${row.id}`} to={to}
                    className="grid grid-cols-[140px_1fr_180px] border-t border-border hover:bg-muted/30 text-sm">
                    <div className="px-4 py-3 text-muted-foreground">
                      {date ? date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "—"}
                    </div>
                    <div className="px-4 py-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-purple" />
                      <span className="font-medium">{row.title}</span>
                    </div>
                    <div className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {date ? `due by ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyllabusTab;
