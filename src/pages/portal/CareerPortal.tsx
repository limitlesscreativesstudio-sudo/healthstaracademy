import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Award, Calendar, Building2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

type JobRow = {
  id: string; stage: string; state_exam_date: string | null;
  state_exam_location: string | null; state_exam_result: string | null;
  certification_number: string | null; certification_date: string | null;
  certification_expires: string | null; job_search_status: string | null;
  employer_name: string | null; employer_city: string | null;
  hire_date: string | null; hourly_wage: number | null;
  shift_type: string | null; job_title: string | null;
};

const STAGES: { key: string; label: string }[] = [
  { key: "scheduled_exam", label: "Exam Scheduled" },
  { key: "passed_exam", label: "Passed Exam" },
  { key: "certified", label: "CDPH Certified" },
  { key: "applying", label: "Applying" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Job Offer" },
  { key: "hired", label: "Hired" },
];

const CareerPortal = () => {
  const { user, loading: authLoading } = usePortalAuth();
  const [row, setRow] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("job_pipeline").select("*").eq("portal_user_id", user.id)
      .order("updated_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { setRow(data as JobRow | null); setLoading(false); });
  }, [user]);

  if (authLoading || loading) {
    return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;
  }

  const stageIdx = row ? STAGES.findIndex(s => s.key === row.stage) : -1;
  const certExp = row?.certification_expires ? new Date(row.certification_expires) : null;
  const daysToExp = certExp ? Math.ceil((certExp.getTime() - Date.now()) / 86400000) : null;
  const expWarn = daysToExp !== null && daysToExp <= 90 && daysToExp >= 0;
  const expired = daysToExp !== null && daysToExp < 0;

  return (
    <PortalLayout>
      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-6 w-6 text-purple" />
          <h1 className="font-heading text-3xl font-bold">Career Portal</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Track your state exam, CDPH certification, and job placement progress.
        </p>

        {!row ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
            Your career record will appear here after you complete the program and your instructor schedules your state exam.
          </CardContent></Card>
        ) : (
          <div className="space-y-6">
            {/* Pipeline visualization */}
            <Card><CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">Your Pipeline</div>
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                {STAGES.map((s, i) => {
                  const done = stageIdx >= 0 && i <= stageIdx;
                  const current = i === stageIdx;
                  return (
                    <div key={s.key} className="flex-1 min-w-[80px] flex flex-col items-center text-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      } ${current ? "ring-2 ring-purple ring-offset-2" : ""}`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <div className={`text-[10px] mt-1 ${current ? "font-bold text-purple" : "text-muted-foreground"}`}>
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent></Card>

            {/* Exam */}
            <Card><CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-purple" />
                <h3 className="font-semibold">State Exam</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <Stat label="Date" value={row.state_exam_date ? new Date(row.state_exam_date).toLocaleDateString() : "—"} />
                <Stat label="Location" value={row.state_exam_location || "—"} />
                <Stat label="Result" value={row.state_exam_result || "Pending"} />
              </div>
            </CardContent></Card>

            {/* Certification */}
            <Card><CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-purple" />
                <h3 className="font-semibold">CDPH Certification</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <Stat label="Cert #" value={row.certification_number || "—"} />
                <Stat label="Issued" value={row.certification_date ? new Date(row.certification_date).toLocaleDateString() : "—"} />
                <Stat label="Expires" value={certExp ? certExp.toLocaleDateString() : "—"} />
              </div>
              {expired && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-rose-900">
                    <strong>Certification expired.</strong> Renewal is required to continue working as a CNA.
                  </div>
                </div>
              )}
              {expWarn && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <strong>Renewal coming up.</strong> Your certification expires in {daysToExp} days. Submit renewal paperwork to CDPH.
                  </div>
                </div>
              )}
            </CardContent></Card>

            {/* Employment */}
            <Card><CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-purple" />
                <h3 className="font-semibold">Employment</h3>
              </div>
              {row.employer_name ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <Stat label="Employer" value={row.employer_name} />
                  <Stat label="City" value={row.employer_city || "—"} />
                  <Stat label="Title" value={row.job_title || "CNA"} />
                  <Stat label="Shift" value={row.shift_type || "—"} />
                  <Stat label="Hired" value={row.hire_date ? new Date(row.hire_date).toLocaleDateString() : "—"} />
                  <Stat label="Wage" value={row.hourly_wage ? `$${row.hourly_wage}/hr` : "—"} />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Status: <Badge variant="secondary">{row.job_search_status?.replace(/_/g, " ") || "not started"}</Badge>
                  <p className="mt-2">Once you land a position, your employer info will appear here.</p>
                </div>
              )}
            </CardContent></Card>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
    <div className="text-sm font-medium mt-0.5">{value}</div>
  </div>
);

export default CareerPortal;
