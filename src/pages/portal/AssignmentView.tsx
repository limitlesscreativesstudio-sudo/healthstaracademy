import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePortalAuth } from "@/hooks/usePortalAuth";

type Assignment = {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  points: number;
  due_at: string | null;
  submission_type: string;
};

const AssignmentView = () => {
  const { courseId, assignmentId } = useParams();
  const { user } = usePortalAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [grade, setGrade] = useState<any>(null);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: a } = await supabase.from("assignments").select("*").eq("id", assignmentId!).maybeSingle();
    setAssignment(a as any);
    if (user) {
      const { data: s } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", assignmentId!)
        .eq("user_id", user.id)
        .maybeSingle();
      setSubmission(s);
      if (s) setBody(s.body ?? "");
      const { data: g } = await supabase
        .from("grades")
        .select("*")
        .eq("assignment_id", assignmentId!)
        .eq("user_id", user.id)
        .maybeSingle();
      setGrade(g);
    }
  };
  useEffect(() => { load(); }, [assignmentId, user?.id]);

  const submit = async () => {
    if (!user || !assignment) return;
    setBusy(true);
    let file_url: string | null = submission?.file_url ?? null;
    let file_name: string | null = submission?.file_name ?? null;
    try {
      if (file) {
        const path = `submissions/${assignment.id}/${user.id}-${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("course-assets").upload(path, file);
        if (upErr) throw upErr;
        file_url = supabase.storage.from("course-assets").getPublicUrl(path).data.publicUrl;
        file_name = file.name;
      }
      const payload = {
        assignment_id: assignment.id,
        user_id: user.id,
        body,
        file_url,
        file_name,
        submitted_at: new Date().toISOString(),
      };
      const { error } = submission
        ? await supabase.from("submissions").update(payload).eq("id", submission.id)
        : await supabase.from("submissions").insert(payload);
      if (error) throw error;
      toast({ title: submission ? "Submission updated" : "Submission received" });
      setFile(null);
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  if (!assignment) return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;

  const overdue = assignment.due_at && new Date(assignment.due_at) < new Date();

  return (
    <PortalLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <Link to={`/portal/courses/${courseId}/modules`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
        <h1 className="font-heading text-3xl font-bold mb-1">{assignment.title}</h1>
        <div className="text-sm text-muted-foreground mb-4">
          {assignment.points} pts
          {assignment.due_at && (
            <span className={overdue ? "text-destructive ml-2" : "ml-2"}>
              · Due {new Date(assignment.due_at).toLocaleString()}
            </span>
          )}
        </div>

        {assignment.instructions && (
          <Card className="mb-4"><CardContent className="pt-5 whitespace-pre-wrap text-sm">{assignment.instructions}</CardContent></Card>
        )}

        {grade && (
          <Card className="mb-4 border-primary/40 bg-primary/5">
            <CardContent className="pt-5">
              <div className="font-semibold">Grade: {grade.score} / {grade.max_score}</div>
              {grade.feedback && <p className="text-sm mt-2 whitespace-pre-wrap">{grade.feedback}</p>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-5 space-y-3">
            <h3 className="font-semibold">{submission ? "Your submission" : "Submit your work"}</h3>
            {submission && (
              <p className="text-xs text-muted-foreground">
                Last submitted {new Date(submission.submitted_at).toLocaleString()}
              </p>
            )}
            {(assignment.submission_type === "text" || assignment.submission_type === "both") && (
              <div>
                <Label>Response</Label>
                <Textarea rows={6} value={body} onChange={e => setBody(e.target.value)} />
              </div>
            )}
            {(assignment.submission_type === "file" || assignment.submission_type === "both") && (
              <div>
                <Label>File {submission?.file_name && <span className="text-xs text-muted-foreground">(current: {submission.file_name})</span>}</Label>
                <Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
            <Button onClick={submit} disabled={busy}>
              <Upload className="h-4 w-4 mr-1" />
              {busy ? "Submitting…" : submission ? "Resubmit" : "Submit"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default AssignmentView;
