import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  RefreshCw, Users, MapPin, AlertTriangle, CheckCircle2, CalendarClock,
  ClipboardList, Save, Stethoscope,
} from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  capacity: number;
  status: string;
  program_type: string;
  clinical_site: string | null;
  enrollment_deadline: string | null;
  min_to_run: number | null;
  notes: string | null;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  enrollment_status: string;
  payment_status: string;
  qualification_status: string;
  orientation_date: string | null;
}

const CLINICAL_SITES = ["Stockton", "Lodi", "Hayward"];

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    enrolled: "bg-green-100 text-green-800",
    pre_qualification: "bg-yellow-100 text-yellow-800",
    qualified: "bg-blue-100 text-blue-800",
    disqualified: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    unpaid: "bg-red-100 text-red-800",
    partial: "bg-yellow-100 text-yellow-800",
  };
  return map[s] || "bg-muted text-muted-foreground";
};

const daysUntil = (iso: string | null) => {
  if (!iso) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso + "T00:00:00");
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
};

const CohortOpsHub = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // editable ops fields
  const [clinicalSite, setClinicalSite] = useState("");
  const [enrollmentDeadline, setEnrollmentDeadline] = useState("");
  const [minToRun, setMinToRun] = useState<string>("");
  const [notes, setNotes] = useState("");

  const selected = useMemo(() => cohorts.find(c => c.id === selectedId) || null, [cohorts, selectedId]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cohorts")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const list = (data as Cohort[]) || [];
      setCohorts(list);
      if (!selectedId && list.length) {
        const today = new Date().toISOString().slice(0, 10);
        const next = list.find(c => c.start_date >= today) || list[0];
        setSelectedId(next.id);
      }
    }
    setLoading(false);
  };

  const loadStudents = async (cohortId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("id, first_name, last_name, email, phone, enrollment_status, payment_status, qualification_status, orientation_date")
      .eq("cohort_id", cohortId)
      .order("last_name", { ascending: true });
    if (error) {
      toast({ title: "Error loading roster", description: error.message, variant: "destructive" });
    } else {
      setStudents((data as Student[]) || []);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selected) return;
    setClinicalSite(selected.clinical_site || "");
    setEnrollmentDeadline(selected.enrollment_deadline || "");
    setMinToRun(selected.min_to_run?.toString() || (selected.program_type === "weekend" ? "15" : ""));
    setNotes(selected.notes || "");
    loadStudents(selected.id);
  }, [selectedId]);

  const saveOps = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("cohorts")
      .update({
        clinical_site: clinicalSite || null,
        enrollment_deadline: enrollmentDeadline || null,
        min_to_run: minToRun ? parseInt(minToRun, 10) : null,
        notes: notes || "",
      })
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cohort updated" });
      load();
    }
  };

  // Roster metrics
  const enrolledCount = students.filter(s => s.enrollment_status === "enrolled").length;
  const qualifiedCount = students.filter(s => s.enrollment_status === "qualified").length;
  const paidCount = students.filter(s => s.payment_status === "paid").length;
  const partialCount = students.filter(s => s.payment_status === "partial").length;
  const unpaidCount = students.filter(s => s.payment_status === "unpaid" && s.enrollment_status === "enrolled").length;

  const min = selected ? (selected.min_to_run ?? (selected.program_type === "weekend" ? 15 : 0)) : 0;
  const meetsMin = min === 0 ? true : enrolledCount >= min;
  const seatsLeft = selected ? Math.max(0, selected.capacity - enrolledCount) : 0;
  const deadlineDays = daysUntil(selected?.enrollment_deadline || null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">Cohort Operations Hub</h2>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Cohort selector */}
      <div className="mb-6 max-w-md">
        <label className="text-sm font-medium mb-1 block">Select Cohort</label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger><SelectValue placeholder="Choose a cohort" /></SelectTrigger>
          <SelectContent>
            {cohorts.map(c => {
              const d = new Date(c.start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <SelectItem key={c.id} value={c.id}>
                  {d} — {c.program_type === "weekend" ? "Weekend" : "Daytime"} ({c.status})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {!selected ? (
        <div className="text-muted-foreground text-sm">No cohort selected.</div>
      ) : (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-1">
                <Users className="h-3 w-3" /> Enrolled
              </div>
              <div className="text-2xl font-bold text-foreground">{enrolledCount}<span className="text-sm font-normal text-muted-foreground"> / {selected.capacity}</span></div>
              <div className="text-xs text-muted-foreground mt-1">{seatsLeft} seats left</div>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-1">
                <CheckCircle2 className="h-3 w-3" /> Qualified (pending pay)
              </div>
              <div className="text-2xl font-bold text-foreground">{qualifiedCount}</div>
              <div className="text-xs text-muted-foreground mt-1">{unpaidCount} enrolled unpaid</div>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-1">
                <CalendarClock className="h-3 w-3" /> Deadline
              </div>
              <div className="text-2xl font-bold text-foreground">
                {deadlineDays === null ? "—" : deadlineDays < 0 ? "Passed" : `${deadlineDays}d`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{selected.enrollment_deadline || "No deadline set"}</div>
            </div>

            <div className={`border rounded-lg p-4 ${meetsMin ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-1 text-muted-foreground">
                {meetsMin ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                Min to Run
              </div>
              <div className={`text-2xl font-bold ${meetsMin ? "text-green-700" : "text-red-700"}`}>
                {enrolledCount} / {min || "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {min === 0 ? "No minimum" : meetsMin ? "Cohort will run" : `Need ${min - enrolledCount} more`}
              </div>
            </div>
          </div>

          {/* Auto-cancel warning */}
          {selected.program_type === "weekend" && !meetsMin && deadlineDays !== null && deadlineDays < 14 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-800">Auto-cancel risk</div>
                <div className="text-sm text-red-700">
                  Weekend cohort minimum is {min}. With {enrolledCount} enrolled and {deadlineDays} days until deadline,
                  this cohort is at risk of cancellation. Notify enrolled students and trigger outreach.
                </div>
              </div>
            </div>
          )}

          {/* Ops settings */}
          <div className="bg-background border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Operations Settings</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Clinical Site
                </label>
                <Select value={clinicalSite || "none"} onValueChange={v => setClinicalSite(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Not assigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not assigned</SelectItem>
                    {CLINICAL_SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Enrollment Deadline</label>
                <Input type="date" value={enrollmentDeadline} onChange={e => setEnrollmentDeadline(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min Enrollment to Run</label>
                <Input type="number" min="0" value={minToRun} onChange={e => setMinToRun(e.target.value)} placeholder={selected.program_type === "weekend" ? "15" : "0"} />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1 block">Operations Notes</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Internal notes: schedule changes, transport coordination, instructor coverage..." />
            </div>
            <Button onClick={saveOps} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          {/* Roster */}
          <div className="bg-background border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Roster ({students.length})</h3>
              </div>
              {clinicalSite && (
                <Badge className="bg-cyan/20 text-cyan flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" /> {clinicalSite}
                </Badge>
              )}
            </div>
            {students.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">No students assigned to this cohort yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Orientation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.last_name}, {s.first_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{s.email}</div>
                        {s.phone && <div>{s.phone}</div>}
                      </TableCell>
                      <TableCell><Badge className={statusColor(s.enrollment_status)}>{s.enrollment_status}</Badge></TableCell>
                      <TableCell><Badge className={statusColor(s.payment_status)}>{s.payment_status}</Badge></TableCell>
                      <TableCell className="text-xs">{s.orientation_date || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Payment funnel */}
          <div className="bg-background border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-4">Payment Funnel</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{paidCount}</div>
                <div className="text-xs text-muted-foreground">Paid in Full</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{partialCount}</div>
                <div className="text-xs text-muted-foreground">Payment Plan</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{unpaidCount}</div>
                <div className="text-xs text-muted-foreground">Enrolled Unpaid</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CohortOpsHub;
