import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Briefcase, Award, Calendar, MapPin, DollarSign, Search,
  RefreshCw, ChevronDown, ChevronUp, TrendingUp, Users, CheckCircle2,
} from "lucide-react";

type Stage =
  | "scheduled_exam"
  | "passed_exam"
  | "certified"
  | "job_searching"
  | "interviewing"
  | "hired"
  | "not_placed";

const STAGE_LABEL: Record<Stage, string> = {
  scheduled_exam: "Scheduled Exam",
  passed_exam: "Passed Exam",
  certified: "Certified",
  job_searching: "Job Searching",
  interviewing: "Interviewing",
  hired: "Hired",
  not_placed: "Not Placed",
};

const STAGE_COLORS: Record<Stage, string> = {
  scheduled_exam: "bg-blue-100 text-blue-800",
  passed_exam: "bg-indigo-100 text-indigo-800",
  certified: "bg-purple-100 text-purple-800",
  job_searching: "bg-yellow-100 text-yellow-800",
  interviewing: "bg-orange-100 text-orange-800",
  hired: "bg-green-200 text-green-900",
  not_placed: "bg-red-100 text-red-800",
};

const STAGES: Stage[] = [
  "scheduled_exam", "passed_exam", "certified",
  "job_searching", "interviewing", "hired", "not_placed",
];

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  cohort_id: string | null;
  portal_user_id: string | null;
  enrollment_status: string;
}

interface PipelineRow {
  id: string;
  student_id: string;
  portal_user_id: string | null;
  cohort_id: string | null;
  stage: Stage;
  state_exam_date: string | null;
  state_exam_location: string | null;
  state_exam_result: string | null;
  certification_number: string | null;
  certification_date: string | null;
  certification_expires: string | null;
  employer_name: string | null;
  employer_city: string | null;
  job_title: string | null;
  hire_date: string | null;
  hourly_wage: number | null;
  shift_type: string | null;
  placement_source: string | null;
  notes: string | null;
  follow_up_date: string | null;
}

const JobPipelineTracker = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, PipelineRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    // Only show students who reached enrolled (eligible for state exam pipeline)
    const [{ data: studentRows }, { data: pipeRows }] = await Promise.all([
      supabase.from("students")
        .select("id, first_name, last_name, email, cohort_id, portal_user_id, enrollment_status")
        .eq("enrollment_status", "enrolled")
        .order("created_at", { ascending: false }),
      supabase.from("job_pipeline").select("*"),
    ]);
    setStudents((studentRows as Student[]) || []);
    const map: Record<string, PipelineRow> = {};
    (pipeRows as PipelineRow[] | null)?.forEach(p => { map[p.student_id] = p; });
    setPipeline(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const upsertPipeline = async (studentId: string, patch: Partial<PipelineRow>) => {
    setSaving(studentId);
    const existing = pipeline[studentId];
    const student = students.find(s => s.id === studentId);
    const row = {
      student_id: studentId,
      portal_user_id: student?.portal_user_id ?? null,
      cohort_id: student?.cohort_id ?? null,
      ...existing,
      ...patch,
    };
    const { data, error } = await supabase
      .from("job_pipeline")
      .upsert(row, { onConflict: "student_id" })
      .select()
      .single();
    setSaving(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setPipeline(prev => ({ ...prev, [studentId]: data as PipelineRow }));
    toast({ title: "Pipeline updated" });
  };

  const kpis = useMemo(() => {
    const total = students.length;
    let scheduled = 0, certified = 0, hired = 0;
    let wageSum = 0, wageCount = 0;
    students.forEach(s => {
      const p = pipeline[s.id];
      if (!p) return;
      if (p.state_exam_date) scheduled++;
      if (p.stage === "certified" || p.stage === "job_searching" || p.stage === "interviewing" || p.stage === "hired") certified++;
      if (p.stage === "hired") hired++;
      if (p.hourly_wage) { wageSum += Number(p.hourly_wage); wageCount++; }
    });
    return {
      total, scheduled, certified, hired,
      placementRate: certified > 0 ? Math.round((hired / certified) * 100) : 0,
      avgWage: wageCount > 0 ? (wageSum / wageCount).toFixed(2) : null,
    };
  }, [students, pipeline]);

  const filtered = students.filter(s => {
    const matchesSearch = `${s.first_name} ${s.last_name} ${s.email}`
      .toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (stageFilter === "all") return true;
    if (stageFilter === "none") return !pipeline[s.id];
    return pipeline[s.id]?.stage === stageFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><Users className="h-3.5 w-3.5" /> Graduates</div>
            <p className="text-2xl font-bold mt-1">{kpis.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><Calendar className="h-3.5 w-3.5" /> Exam Scheduled</div>
            <p className="text-2xl font-bold mt-1">{kpis.scheduled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><Award className="h-3.5 w-3.5" /> Certified</div>
            <p className="text-2xl font-bold mt-1">{kpis.certified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><Briefcase className="h-3.5 w-3.5" /> Hired</div>
            <p className="text-2xl font-bold mt-1">{kpis.hired}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><TrendingUp className="h-3.5 w-3.5" /> Placement Rate</div>
            <p className="text-2xl font-bold mt-1">{kpis.placementRate}%</p>
            {kpis.avgWage && <p className="text-xs text-muted-foreground">avg ${kpis.avgWage}/hr</p>}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search graduates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="none">No Pipeline Entry</SelectItem>
            {STAGES.map(s => <SelectItem key={s} value={s}>{STAGE_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* List */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No enrolled graduates match. Mark students as <code className="text-xs">enrolled</code> in Student Pipeline to track their career outcomes here.
          </div>
        )}
        {filtered.map(student => {
          const p = pipeline[student.id];
          const isOpen = expandedId === student.id;
          return (
            <div key={student.id} className="border-b border-border last:border-0">
              <div
                className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedId(isOpen ? null : student.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                </div>
                {p?.stage === "hired" && p.employer_name && (
                  <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3" /> {p.employer_name}
                  </span>
                )}
                <Badge className={`text-xs ${p ? STAGE_COLORS[p.stage] : "bg-muted text-muted-foreground"}`}>
                  {p ? STAGE_LABEL[p.stage] : "Not started"}
                </Badge>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>

              {isOpen && (
                <PipelineEditor
                  studentId={student.id}
                  row={p}
                  saving={saving === student.id}
                  onSave={(patch) => upsertPipeline(student.id, patch)}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} graduate{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
};

const PipelineEditor = ({
  studentId, row, saving, onSave,
}: {
  studentId: string;
  row: PipelineRow | undefined;
  saving: boolean;
  onSave: (patch: Partial<PipelineRow>) => void;
}) => {
  const [draft, setDraft] = useState<Partial<PipelineRow>>({
    stage: row?.stage ?? "scheduled_exam",
    state_exam_date: row?.state_exam_date ?? null,
    state_exam_location: row?.state_exam_location ?? "",
    state_exam_result: row?.state_exam_result ?? null,
    certification_number: row?.certification_number ?? "",
    certification_date: row?.certification_date ?? null,
    certification_expires: row?.certification_expires ?? null,
    employer_name: row?.employer_name ?? "",
    employer_city: row?.employer_city ?? "",
    job_title: row?.job_title ?? "",
    hire_date: row?.hire_date ?? null,
    hourly_wage: row?.hourly_wage ?? null,
    shift_type: row?.shift_type ?? "",
    placement_source: row?.placement_source ?? "",
    follow_up_date: row?.follow_up_date ?? null,
    notes: row?.notes ?? "",
  });

  const set = (k: keyof PipelineRow, v: any) => setDraft(d => ({ ...d, [k]: v === "" ? null : v }));

  return (
    <div className="px-4 pb-5 pt-2 bg-muted/20 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Current Stage</Label>
          <Select value={draft.stage as string} onValueChange={v => set("stage", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAGES.map(s => <SelectItem key={s} value={s}>{STAGE_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Follow-up Date</Label>
          <Input type="date" value={draft.follow_up_date ?? ""} onChange={e => set("follow_up_date", e.target.value)} />
        </div>
      </div>

      <section className="md:col-span-3">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> State Exam</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Exam Date</Label>
            <Input type="date" value={draft.state_exam_date ?? ""} onChange={e => set("state_exam_date", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Test Site / Location</Label>
            <Input value={draft.state_exam_location ?? ""} onChange={e => set("state_exam_location", e.target.value)} placeholder="e.g. Stockton testing center" />
          </div>
          <div>
            <Label className="text-xs">Result</Label>
            <Select value={draft.state_exam_result ?? "pending"} onValueChange={v => set("state_exam_result", v === "pending" ? null : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed_written">Failed Written</SelectItem>
                <SelectItem value="failed_skills">Failed Skills</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="md:col-span-3">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Award className="h-4 w-4" /> Certification</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">CDPH Certification #</Label>
            <Input value={draft.certification_number ?? ""} onChange={e => set("certification_number", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Cert. Issue Date</Label>
            <Input type="date" value={draft.certification_date ?? ""} onChange={e => set("certification_date", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Cert. Expiration</Label>
            <Input type="date" value={draft.certification_expires ?? ""} onChange={e => set("certification_expires", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="md:col-span-3">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> Employment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Employer</Label>
            <Input value={draft.employer_name ?? ""} onChange={e => set("employer_name", e.target.value)} placeholder="e.g. Sutter Health" />
          </div>
          <div>
            <Label className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> City</Label>
            <Input value={draft.employer_city ?? ""} onChange={e => set("employer_city", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Job Title</Label>
            <Input value={draft.job_title ?? ""} onChange={e => set("job_title", e.target.value)} placeholder="CNA" />
          </div>
          <div>
            <Label className="text-xs">Hire Date</Label>
            <Input type="date" value={draft.hire_date ?? ""} onChange={e => set("hire_date", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs flex items-center gap-1"><DollarSign className="h-3 w-3" /> Hourly Wage</Label>
            <Input
              type="number" step="0.25" min="0"
              value={draft.hourly_wage ?? ""}
              onChange={e => set("hourly_wage", e.target.value ? Number(e.target.value) : null)}
              placeholder="22.50"
            />
          </div>
          <div>
            <Label className="text-xs">Shift</Label>
            <Select value={draft.shift_type || "unset"} onValueChange={v => set("shift_type", v === "unset" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">—</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="noc">NOC / Night</SelectItem>
                <SelectItem value="per_diem">Per Diem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Label className="text-xs">Placement Source</Label>
            <Input
              value={draft.placement_source ?? ""}
              onChange={e => set("placement_source", e.target.value)}
              placeholder="HSA referral, job fair, Indeed, etc."
            />
          </div>
        </div>
      </section>

      <div className="md:col-span-3">
        <Label className="text-xs">Internal Notes</Label>
        <Textarea
          rows={3}
          value={draft.notes ?? ""}
          onChange={e => set("notes", e.target.value)}
          placeholder="Coaching notes, interview prep, etc."
        />
      </div>

      <div className="md:col-span-3 flex justify-end gap-2">
        <Button onClick={() => onSave(draft)} disabled={saving}>
          {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          {row ? "Save Changes" : "Create Pipeline Entry"}
        </Button>
      </div>
    </div>
  );
};

export default JobPipelineTracker;
