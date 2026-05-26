import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Clock, ArrowLeft, Stethoscope } from "lucide-react";

type Skill = {
  id: string; category: string; name: string; description: string | null;
  cdph_module: string | null; required_for_certification: boolean; position: number;
};
type Signoff = {
  id: string; student_user_id: string; course_id: string; skill_id: string;
  status: "not_started" | "in_progress" | "competent" | "needs_remediation";
  clinical_site: string | null; attempts: number; signed_off_by: string | null;
  signed_off_at: string | null; notes: string | null;
  photo_url?: string | null; video_url?: string | null;
  evaluator_signature?: string | null; evaluator_name?: string | null;
};
type ClinicalHour = {
  id: string; student_user_id: string; course_id: string; shift_date: string;
  clinical_site: string; hours: number; supervisor_name: string | null;
  activity_summary: string | null; verified: boolean; verified_by: string | null;
};

const SITES = ["Stockton", "Lodi", "Hayward"];
const CDPH_REQUIRED_HOURS = 100; // CDPH minimum clinical hours

const statusBadge = (s: Signoff["status"]) => {
  const map: Record<string, { label: string; cls: string }> = {
    not_started: { label: "Not Started", cls: "bg-muted text-muted-foreground" },
    in_progress: { label: "In Progress", cls: "bg-amber-100 text-amber-900" },
    competent: { label: "Competent", cls: "bg-emerald-100 text-emerald-900" },
    needs_remediation: { label: "Needs Remediation", cls: "bg-rose-100 text-rose-900" },
  };
  const m = map[s];
  return <Badge variant="secondary" className={m.cls}>{m.label}</Badge>;
};

const ClinicalSkillsTab = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const { user } = usePortalAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  useEffect(() => {
    supabase.from("cna_skills").select("*").eq("active", true).order("position")
      .then(({ data }) => setSkills(data ?? []));
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="h-6 w-6 text-purple" />
        <h2 className="font-heading text-2xl font-bold">Clinical & Skills</h2>
      </div>
      {isInstructor
        ? <InstructorView courseId={courseId} skills={skills} />
        : <StudentView courseId={courseId} skills={skills} userId={user?.id ?? ""} />}
    </div>
  );
};

/* ---------------- STUDENT VIEW ---------------- */

const StudentView = ({ courseId, skills, userId }: { courseId: string; skills: Skill[]; userId: string }) => {
  const [signoffs, setSignoffs] = useState<Signoff[]>([]);
  const [hours, setHours] = useState<ClinicalHour[]>([]);
  const reload = async () => {
    const [s, h] = await Promise.all([
      supabase.from("student_skill_signoffs").select("*").eq("student_user_id", userId).eq("course_id", courseId),
      supabase.from("clinical_hours").select("*").eq("student_user_id", userId).eq("course_id", courseId).order("shift_date", { ascending: false }),
    ]);
    setSignoffs((s.data ?? []) as Signoff[]);
    setHours((h.data ?? []) as ClinicalHour[]);
  };
  useEffect(() => { if (userId) reload(); }, [userId, courseId]);

  const competent = signoffs.filter(s => s.status === "competent").length;
  const required = skills.filter(s => s.required_for_certification).length;
  const skillPct = required ? Math.round((competent / required) * 100) : 0;
  const totalHours = hours.reduce((a, h) => a + Number(h.hours), 0);
  const verifiedHours = hours.filter(h => h.verified).reduce((a, h) => a + Number(h.hours), 0);
  const hoursPct = Math.min(100, Math.round((verifiedHours / CDPH_REQUIRED_HOURS) * 100));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex justify-between mb-2"><span className="font-semibold text-sm">Skill Competency</span>
            <span className="text-xs text-muted-foreground">{competent} / {required} signed off</span></div>
          <Progress value={skillPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{skillPct}% of CDPH-required skills demonstrated.</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex justify-between mb-2"><span className="font-semibold text-sm">Clinical Hours (verified)</span>
            <span className="text-xs text-muted-foreground">{verifiedHours.toFixed(1)} / {CDPH_REQUIRED_HOURS}</span></div>
          <Progress value={hoursPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{totalHours.toFixed(1)} logged · {(totalHours - verifiedHours).toFixed(1)} awaiting instructor verification.</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="skills">
        <TabsList><TabsTrigger value="skills">Skills Checklist</TabsTrigger><TabsTrigger value="hours">Clinical Hours</TabsTrigger></TabsList>
        <TabsContent value="skills" className="mt-4">
          <SkillsChecklist skills={skills} signoffs={signoffs} readOnly />
        </TabsContent>
        <TabsContent value="hours" className="mt-4 space-y-4">
          <LogHoursForm courseId={courseId} userId={userId} onSaved={reload} />
          <HoursTable hours={hours} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ---------------- INSTRUCTOR VIEW ---------------- */

const InstructorView = ({ courseId, skills }: { courseId: string; skills: Skill[] }) => {
  const [roster, setRoster] = useState<{ user_id: string; full_name: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: enr } = await supabase.from("enrollments").select("user_id").eq("course_id", courseId).eq("role", "student");
      const ids = (enr ?? []).map(e => e.user_id);
      if (!ids.length) { setRoster([]); return; }
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      setRoster((profs ?? []).map(p => ({ user_id: p.user_id, full_name: p.full_name ?? "(no name)" })));
    })();
  }, [courseId]);

  if (selected) {
    const student = roster.find(r => r.user_id === selected);
    return (
      <div>
        <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to roster
        </button>
        <StudentDetailForInstructor
          courseId={courseId}
          studentId={selected}
          studentName={student?.full_name ?? ""}
          skills={skills}
        />
      </div>
    );
  }

  return <InstructorRoster courseId={courseId} roster={roster} skills={skills} onSelect={setSelected} />;
};

const InstructorRoster = ({ courseId, roster, skills, onSelect }: {
  courseId: string; roster: { user_id: string; full_name: string }[]; skills: Skill[];
  onSelect: (id: string) => void;
}) => {
  const [signoffs, setSignoffs] = useState<Signoff[]>([]);
  const [hours, setHours] = useState<ClinicalHour[]>([]);
  useEffect(() => {
    (async () => {
      const [s, h] = await Promise.all([
        supabase.from("student_skill_signoffs").select("*").eq("course_id", courseId),
        supabase.from("clinical_hours").select("*").eq("course_id", courseId),
      ]);
      setSignoffs((s.data ?? []) as Signoff[]);
      setHours((h.data ?? []) as ClinicalHour[]);
    })();
  }, [courseId]);

  const required = skills.filter(s => s.required_for_certification).length;
  if (roster.length === 0) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No students enrolled yet.</CardContent></Card>;
  }
  return (
    <Card><CardContent className="p-0">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr><th className="text-left px-4 py-2">Student</th>
            <th className="text-left px-4 py-2">Skills Competent</th>
            <th className="text-left px-4 py-2">Verified Hours</th>
            <th className="text-left px-4 py-2">Status</th></tr>
        </thead>
        <tbody>
          {roster.map(r => {
            const sCompetent = signoffs.filter(s => s.student_user_id === r.user_id && s.status === "competent").length;
            const vHours = hours.filter(h => h.student_user_id === r.user_id && h.verified).reduce((a, h) => a + Number(h.hours), 0);
            const pendingHrs = hours.filter(h => h.student_user_id === r.user_id && !h.verified).length;
            return (
              <tr key={r.user_id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => onSelect(r.user_id)}>
                <td className="px-4 py-3 font-medium">{r.full_name}</td>
                <td className="px-4 py-3">{sCompetent} / {required}</td>
                <td className="px-4 py-3">{vHours.toFixed(1)} / {CDPH_REQUIRED_HOURS}</td>
                <td className="px-4 py-3">
                  {pendingHrs > 0 && <Badge variant="secondary" className="bg-amber-100 text-amber-900">{pendingHrs} hrs pending</Badge>}
                  {sCompetent >= required && vHours >= CDPH_REQUIRED_HOURS && <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">Ready</Badge>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CardContent></Card>
  );
};

const StudentDetailForInstructor = ({ courseId, studentId, studentName, skills }: {
  courseId: string; studentId: string; studentName: string; skills: Skill[];
}) => {
  const [signoffs, setSignoffs] = useState<Signoff[]>([]);
  const [hours, setHours] = useState<ClinicalHour[]>([]);
  const reload = async () => {
    const [s, h] = await Promise.all([
      supabase.from("student_skill_signoffs").select("*").eq("student_user_id", studentId).eq("course_id", courseId),
      supabase.from("clinical_hours").select("*").eq("student_user_id", studentId).eq("course_id", courseId).order("shift_date", { ascending: false }),
    ]);
    setSignoffs((s.data ?? []) as Signoff[]);
    setHours((h.data ?? []) as ClinicalHour[]);
  };
  useEffect(() => { reload(); }, [studentId, courseId]);

  return (
    <div className="space-y-4">
      <div><h3 className="font-heading text-xl font-bold">{studentName}</h3>
        <p className="text-xs text-muted-foreground">Tap any skill to update sign-off. Verify clinical hours below.</p></div>
      <Tabs defaultValue="skills">
        <TabsList><TabsTrigger value="skills">Skills Sign-Off</TabsTrigger><TabsTrigger value="hours">Clinical Hours</TabsTrigger></TabsList>
        <TabsContent value="skills" className="mt-4">
          <SkillsChecklist
            skills={skills}
            signoffs={signoffs}
            onSignoff={async (skillId, patch) => {
              const existing = signoffs.find(s => s.skill_id === skillId);
              const payload = {
                student_user_id: studentId, course_id: courseId, skill_id: skillId,
                signed_off_at: patch.status === "competent" ? new Date().toISOString() : null,
                ...patch,
              };
              const { error } = existing
                ? await supabase.from("student_skill_signoffs").update(payload).eq("id", existing.id)
                : await supabase.from("student_skill_signoffs").insert(payload);
              if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
              else { toast({ title: "Sign-off saved" }); reload(); }
            }}
          />
        </TabsContent>
        <TabsContent value="hours" className="mt-4 space-y-3">
          <HoursTable
            hours={hours}
            onVerify={async (id, verified) => {
              const { error } = await supabase.from("clinical_hours").update({
                verified, verified_at: verified ? new Date().toISOString() : null,
              }).eq("id", id);
              if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
              else reload();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ---------------- SHARED COMPONENTS ---------------- */

const SkillsChecklist = ({ skills, signoffs, readOnly, onSignoff }: {
  skills: Skill[]; signoffs: Signoff[]; readOnly?: boolean;
  onSignoff?: (skillId: string, patch: Partial<Signoff>) => void;
}) => {
  const grouped = useMemo(() => {
    const m: Record<string, Skill[]> = {};
    skills.forEach(s => { (m[s.category] ??= []).push(s); });
    return m;
  }, [skills]);
  const soMap = useMemo(() => Object.fromEntries(signoffs.map(s => [s.skill_id, s])), [signoffs]);
  const [openSkill, setOpenSkill] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, list]) => (
        <Card key={cat}>
          <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</div>
          <div>
            {list.map(skill => {
              const so = soMap[skill.id];
              const status = so?.status ?? "not_started";
              return (
                <div key={skill.id} className="border-b border-border last:border-0">
                  <button
                    onClick={() => !readOnly && setOpenSkill(openSkill === skill.id ? null : skill.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${!readOnly ? "hover:bg-muted/30" : ""}`}
                  >
                    {status === "competent"
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      : status === "needs_remediation"
                      ? <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      : <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{skill.name}</div>
                      {skill.cdph_module && <div className="text-[11px] text-muted-foreground">{skill.cdph_module}</div>}
                    </div>
                    {statusBadge(status)}
                  </button>
                  {!readOnly && openSkill === skill.id && (
                    <SignoffEditor signoff={so} onSave={(patch) => { onSignoff?.(skill.id, patch); setOpenSkill(null); }} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};

const SignoffEditor = ({ signoff, onSave }: {
  signoff?: Signoff; onSave: (patch: Partial<Signoff>) => void;
}) => {
  const [status, setStatus] = useState<Signoff["status"]>(signoff?.status ?? "not_started");
  const [site, setSite] = useState(signoff?.clinical_site ?? "");
  const [attempts, setAttempts] = useState(signoff?.attempts ?? 0);
  const [notes, setNotes] = useState(signoff?.notes ?? "");
  const [evaluatorName, setEvaluatorName] = useState(signoff?.evaluator_name ?? "");
  const [evaluatorSig, setEvaluatorSig] = useState(signoff?.evaluator_signature ?? "");
  const [photoUrl, setPhotoUrl] = useState(signoff?.photo_url ?? "");
  const [uploading, setUploading] = useState(false);

  const handlePhoto = async (file: File) => {
    if (!signoff) { toast({ title: "Save sign-off first before uploading evidence" }); return; }
    setUploading(true);
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) { setUploading(false); return; }
    const path = `${uid}/${signoff.skill_id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("skill-evidence").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    setPhotoUrl(path);
    toast({ title: "Photo uploaded" });
  };

  return (
    <div className="px-4 py-4 bg-muted/20 border-t border-border space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="competent">Competent</SelectItem>
              <SelectItem value="needs_remediation">Needs Remediation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Clinical Site</Label>
          <Select value={site || "none"} onValueChange={(v) => setSite(v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Attempts</Label>
          <Input type="number" min={0} value={attempts} onChange={e => setAttempts(Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Evaluator Name (RN)</Label>
          <Input value={evaluatorName} onChange={e => setEvaluatorName(e.target.value)} placeholder="e.g. Jane Smith, RN" />
        </div>
        <div>
          <Label className="text-xs">Evaluator Signature</Label>
          <Input value={evaluatorSig} onChange={e => setEvaluatorSig(e.target.value)} placeholder="Type full name to sign" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Photo Evidence (CDPH skill demonstration)</Label>
        <div className="flex items-center gap-3 mt-1">
          <Input type="file" accept="image/*,video/*" capture="environment"
            onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])}
            disabled={uploading || !signoff} />
          {photoUrl && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">Evidence on file</Badge>
          )}
        </div>
        {!signoff && <p className="text-[11px] text-muted-foreground mt-1">Save sign-off once before uploading photo evidence.</p>}
      </div>
      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional remediation notes, supervisor feedback…" />
      </div>
      <Button size="sm" onClick={() => onSave({
        status, clinical_site: site || null, attempts, notes,
        evaluator_name: evaluatorName || null,
        evaluator_signature: evaluatorSig || null,
        photo_url: photoUrl || null,
      })}>
        Save Sign-Off
      </Button>
    </div>
  );
};

const LogHoursForm = ({ courseId, userId, onSaved }: { courseId: string; userId: string; onSaved: () => void }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [site, setSite] = useState(SITES[0]);
  const [hrs, setHrs] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!hrs || Number(hrs) <= 0) { toast({ title: "Enter hours", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("clinical_hours").insert({
      student_user_id: userId, course_id: courseId, shift_date: date,
      clinical_site: site, hours: Number(hrs), supervisor_name: supervisor, activity_summary: summary,
    });
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Hours logged", description: "Awaiting instructor verification." });
      setHrs(""); setSupervisor(""); setSummary(""); onSaved(); }
  };
  return (
    <Card><CardContent className="pt-6 space-y-3">
      <div className="font-semibold text-sm">Log Clinical Shift</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div><Label className="text-xs">Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div><Label className="text-xs">Site</Label>
          <Select value={site} onValueChange={setSite}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select></div>
        <div><Label className="text-xs">Hours</Label><Input type="number" step="0.25" min="0" value={hrs} onChange={e => setHrs(e.target.value)} placeholder="6.5" /></div>
        <div><Label className="text-xs">Supervisor</Label><Input value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="RN name" /></div>
      </div>
      <div><Label className="text-xs">Activity Summary</Label><Textarea rows={2} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Skills practiced, patients assisted…" /></div>
      <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Log Shift"}</Button>
    </CardContent></Card>
  );
};

const HoursTable = ({ hours, onVerify }: { hours: ClinicalHour[]; onVerify?: (id: string, verified: boolean) => void }) => {
  if (hours.length === 0) return <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No clinical hours logged yet.</CardContent></Card>;
  return (
    <Card><CardContent className="p-0">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr><th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">Site</th>
            <th className="text-left px-4 py-2">Hours</th><th className="text-left px-4 py-2">Supervisor</th>
            <th className="text-left px-4 py-2">Status</th>{onVerify && <th className="px-4 py-2"></th>}</tr>
        </thead>
        <tbody>
          {hours.map(h => (
            <tr key={h.id} className="border-t border-border">
              <td className="px-4 py-2">{new Date(h.shift_date).toLocaleDateString()}</td>
              <td className="px-4 py-2">{h.clinical_site}</td>
              <td className="px-4 py-2">{Number(h.hours).toFixed(2)}</td>
              <td className="px-4 py-2">{h.supervisor_name || "—"}</td>
              <td className="px-4 py-2">
                {h.verified
                  ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">Verified</Badge>
                  : <Badge variant="secondary" className="bg-amber-100 text-amber-900">Pending</Badge>}
              </td>
              {onVerify && (
                <td className="px-4 py-2 text-right">
                  <Button size="sm" variant={h.verified ? "outline" : "default"} onClick={() => onVerify(h.id, !h.verified)}>
                    {h.verified ? "Unverify" : "Verify"}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  );
};

export default ClinicalSkillsTab;
