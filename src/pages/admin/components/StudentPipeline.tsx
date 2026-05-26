import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Search, ChevronDown, ChevronUp, UserPlus, CheckCircle2 } from "lucide-react";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  qualification_status: string;
  enrollment_status: string;
  payment_status: string;
  needs_entrance_exam: boolean;
  needs_parent_consent: boolean;
  selected_cohort_date: string | null;
  cohort_id: string | null;
  orientation_date: string | null;
  scrub_top_size: string | null;
  scrub_bottom_size: string | null;
  portal_user_id: string | null;
  provisioned_at: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pre_qualification: "bg-muted text-muted-foreground",
  qualified: "bg-green-100 text-green-800",
  application_sent: "bg-blue-100 text-blue-800",
  documents_received: "bg-indigo-100 text-indigo-800",
  livescan_sent: "bg-yellow-100 text-yellow-800",
  livescan_complete: "bg-yellow-200 text-yellow-900",
  tuition_sent: "bg-orange-100 text-orange-800",
  payment_complete: "bg-emerald-100 text-emerald-800",
  orientation_scheduled: "bg-purple-100 text-purple-800",
  scrubs_requested: "bg-pink-100 text-pink-800",
  scrubs_received: "bg-pink-200 text-pink-900",
  welcome_sent: "bg-teal-100 text-teal-800",
  enrolled: "bg-green-200 text-green-900",
  disqualified: "bg-red-100 text-red-800",
};

const ENROLLMENT_STATUSES = [
  "pre_qualification", "qualified", "application_sent", "documents_received",
  "livescan_sent", "livescan_complete", "tuition_sent", "payment_complete",
  "orientation_scheduled", "scrubs_requested", "scrubs_received",
  "welcome_sent", "enrolled", "disqualified",
];

const StudentPipeline = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [provisioning, setProvisioning] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    let query = supabase.from("students").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") {
      query = query.eq("enrollment_status", filterStatus);
    }
    const { data, error } = await query;
    if (error) {
      toast({ title: "Error loading students", description: error.message, variant: "destructive" });
    } else {
      setStudents((data as Student[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [filterStatus]);

  const provisionPortal = async (studentId: string) => {
    setProvisioning(studentId);
    try {
      const { data, error } = await supabase.functions.invoke("provision-student", {
        body: { student_id: studentId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({
        title: "Portal access provisioned",
        description: (data as any)?.enrollment_created
          ? "Invite email sent and student enrolled in their course."
          : "Invite email sent (student was already enrolled in the course).",
      });
      fetchStudents();
    } catch (err: any) {
      toast({ title: "Provision failed", description: err?.message ?? String(err), variant: "destructive" });
    } finally {
      setProvisioning(null);
    }
  };

  const updateStatus = async (studentId: string, newStatus: string) => {
    const { error } = await supabase
      .from("students")
      .update({ enrollment_status: newStatus })
      .eq("id", studentId);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status updated" });
    // Auto-provision portal access when admin marks the student as enrolled
    if (newStatus === "enrolled") {
      const s = students.find(x => x.id === studentId);
      if (s && !s.provisioned_at) {
        await provisionPortal(studentId);
        return;
      }
    }
    fetchStudents();
  };

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ENROLLMENT_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchStudents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_150px_150px_120px_40px] gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <span>Name</span><span>Email</span><span>Enrollment</span><span>Payment</span><span>Cohort</span><span></span>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {loading ? "Loading..." : "No students found."}
          </div>
        )}

        {filtered.map(student => (
          <div key={student.id} className="border-b border-border last:border-0">
            <div
              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_150px_150px_120px_40px] gap-2 md:gap-4 px-4 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
            >
              <span className="font-medium text-foreground flex items-center gap-1.5">
                {student.first_name} {student.last_name}
                {student.provisioned_at && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" aria-label="Portal provisioned" />
                )}
              </span>
              <span className="text-sm text-muted-foreground truncate">{student.email}</span>
              <Badge className={`text-xs justify-center ${STATUS_COLORS[student.enrollment_status] || ""}`}>
                {student.enrollment_status.replace(/_/g, " ")}
              </Badge>
              <Badge variant={student.payment_status === "paid" ? "default" : "outline"} className="text-xs justify-center">
                {student.payment_status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {student.selected_cohort_date ? new Date(student.selected_cohort_date + "T00:00:00").toLocaleDateString() : "—"}
              </span>
              {expandedId === student.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>

            {expandedId === student.id && (
              <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 animate-fade-in">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm">{student.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Orientation</p>
                  <p className="text-sm">{student.orientation_date ? new Date(student.orientation_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Flags</p>
                  <div className="flex gap-1 flex-wrap">
                    {student.needs_entrance_exam && <Badge variant="outline" className="text-xs">Entrance Exam</Badge>}
                    {student.needs_parent_consent && <Badge variant="outline" className="text-xs">Parent Consent</Badge>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Scrubs</p>
                  <p className="text-sm">{student.scrub_top_size ? `Top: ${student.scrub_top_size}, Bottom: ${student.scrub_bottom_size}` : "Not submitted"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Update Status</p>
                  <Select value={student.enrollment_status} onValueChange={v => updateStatus(student.id, v)}>
                    <SelectTrigger className="w-full sm:w-[250px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENROLLMENT_STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 border-t border-border/60 pt-3 mt-2">
                  <p className="text-sm text-muted-foreground mb-2">LMS Portal Access</p>
                  {student.provisioned_at ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-medium">Provisioned</span>
                      <span className="text-muted-foreground">
                        on {new Date(student.provisioned_at).toLocaleDateString()} — invite email sent to {student.email}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-7 text-xs"
                        onClick={() => provisionPortal(student.id)}
                        disabled={provisioning === student.id}
                      >
                        Resend Invite
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => provisionPortal(student.id)}
                      disabled={provisioning === student.id}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {provisioning === student.id ? "Provisioning…" : "Provision Portal Access"}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Creates the student's portal account, sends a magic-link invite email, and enrolls them in their cohort's course.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-4">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
};

export default StudentPipeline;
