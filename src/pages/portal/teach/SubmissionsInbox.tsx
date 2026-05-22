import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePortalAuth } from "@/hooks/usePortalAuth";

type Assignment = { id: string; course_id: string; title: string; points: number; instructions: string };
type Submission = { id: string; user_id: string; body: string; file_url: string | null; file_name: string | null; submitted_at: string };
type Grade = { id: string; user_id: string; score: number; feedback: string; assignment_id: string | null };

const SubmissionsInbox = () => {
  const { courseId, assignmentId } = useParams();
  const { user } = usePortalAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null }>>({});
  const [grades, setGrades] = useState<Record<string, Grade>>({});

  const load = async () => {
    const { data: a } = await supabase.from("assignments").select("*").eq("id", assignmentId!).maybeSingle();
    setAssignment(a as any);
    const { data: subs } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId!)
      .order("submitted_at", { ascending: false });
    setSubmissions((subs ?? []) as any);
    if (subs?.length) {
      const userIds = subs.map(s => s.user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const pmap: any = {};
      (profs ?? []).forEach(p => { pmap[p.user_id] = p; });
      setProfiles(pmap);
      const { data: gs } = await supabase
        .from("grades")
        .select("*")
        .eq("assignment_id", assignmentId!);
      const gmap: any = {};
      (gs ?? []).forEach(g => { gmap[g.user_id] = g; });
      setGrades(gmap);
    }
  };
  useEffect(() => { load(); }, [assignmentId]);

  const saveGrade = async (userId: string, score: number, feedback: string) => {
    const existing = grades[userId];
    if (existing) {
      const { error } = await supabase.from("grades").update({
        score, feedback, graded_by: user?.id, graded_at: new Date().toISOString(),
      }).eq("id", existing.id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("grades").insert({
        course_id: courseId!, user_id: userId, assignment_id: assignmentId!,
        score, max_score: assignment?.points ?? 100, feedback, graded_by: user?.id,
      });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    toast({ title: "Grade saved" });
    load();
  };

  if (!assignment) return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;

  return (
    <PortalLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Link to={`/portal/teach/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
        <h1 className="font-heading text-3xl font-bold mb-1">{assignment.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{assignment.points} pts · {submissions.length} submission{submissions.length === 1 ? "" : "s"}</p>

        {submissions.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No submissions yet.</CardContent></Card>
        ) : submissions.map(s => (
          <SubmissionRow
            key={s.id}
            submission={s}
            profile={profiles[s.user_id]}
            grade={grades[s.user_id]}
            maxScore={assignment.points}
            onSave={(score, fb) => saveGrade(s.user_id, score, fb)}
          />
        ))}
      </div>
    </PortalLayout>
  );
};

const SubmissionRow = ({ submission, profile, grade, maxScore, onSave }: any) => {
  const [score, setScore] = useState<number>(grade?.score ?? 0);
  const [feedback, setFeedback] = useState<string>(grade?.feedback ?? "");

  useEffect(() => {
    setScore(grade?.score ?? 0);
    setFeedback(grade?.feedback ?? "");
  }, [grade?.id]);

  return (
    <Card className="mb-3">
      <CardContent className="pt-5 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">{profile?.full_name ?? "Student"}</div>
            <div className="text-xs text-muted-foreground">Submitted {new Date(submission.submitted_at).toLocaleString()}</div>
          </div>
          {grade && <div className="text-sm text-primary font-medium">Graded: {grade.score}/{maxScore}</div>}
        </div>
        {submission.body && (
          <div className="bg-muted/30 rounded p-3 text-sm whitespace-pre-wrap">{submission.body}</div>
        )}
        {submission.file_url && (
          <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
            📎 {submission.file_name ?? "Attachment"}
          </a>
        )}
        <div className="grid grid-cols-[120px_1fr] gap-3 items-end">
          <div>
            <Label className="text-xs">Score (of {maxScore})</Label>
            <Input type="number" min={0} max={maxScore} value={score} onChange={e => setScore(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Feedback</Label>
            <Textarea rows={2} value={feedback} onChange={e => setFeedback(e.target.value)} />
          </div>
        </div>
        <Button size="sm" onClick={() => onSave(score, feedback)}>
          <Check className="h-4 w-4 mr-1" /> Save grade
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubmissionsInbox;
