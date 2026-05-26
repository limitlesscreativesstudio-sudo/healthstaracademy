import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, GraduationCap, Stethoscope, Clock, AlertTriangle, Trophy, ChevronLeft, Target } from "lucide-react";

interface Props { courseId: string; isInstructor: boolean; }

interface Enrollment { user_id: string; profile?: { full_name: string | null } | null }
interface QuizAttempt { user_id: string; score: number | null; max_score: number | null; submitted_at: string | null }
interface Signoff { student_user_id: string; status: string; skill_id: string }
interface ClinicalHour { student_user_id: string; hours: number; verified: boolean }
interface Skill { id: string; required_for_certification: boolean; active: boolean }

const CDPH_HOURS_MINIMUM = 100;
const W_QUIZ = 0.40;
const W_SKILLS = 0.35;
const W_HOURS = 0.25;

interface Readiness {
  quizAvg: number;        // 0-100
  quizCount: number;
  skillPct: number;       // 0-100
  skillsCompetent: number;
  skillsTotal: number;
  hoursVerified: number;
  hoursPct: number;       // 0-100
  composite: number;      // 0-100
}

const computeReadiness = (
  userId: string,
  attempts: QuizAttempt[],
  signoffs: Signoff[],
  hours: ClinicalHour[],
  requiredSkillCount: number,
): Readiness => {
  const myAttempts = attempts.filter(a => a.user_id === userId && a.submitted_at && a.max_score && a.max_score > 0);
  const quizAvg = myAttempts.length === 0 ? 0
    : (myAttempts.reduce((s, a) => s + ((a.score ?? 0) / (a.max_score ?? 1)) * 100, 0) / myAttempts.length);

  const mySignoffs = signoffs.filter(s => s.student_user_id === userId);
  const competent = mySignoffs.filter(s => s.status === "competent").length;
  const skillPct = requiredSkillCount === 0 ? 0 : Math.min(100, (competent / requiredSkillCount) * 100);

  const verified = hours.filter(h => h.student_user_id === userId && h.verified).reduce((s, h) => s + Number(h.hours), 0);
  const hoursPct = Math.min(100, (verified / CDPH_HOURS_MINIMUM) * 100);

  const composite = quizAvg * W_QUIZ + skillPct * W_SKILLS + hoursPct * W_HOURS;

  return {
    quizAvg, quizCount: myAttempts.length,
    skillPct, skillsCompetent: competent, skillsTotal: requiredSkillCount,
    hoursVerified: verified, hoursPct,
    composite,
  };
};

const passBand = (composite: number): { label: string; pct: string; tone: string } => {
  if (composite >= 85) return { label: "High", pct: "90%+", tone: "bg-green-100 text-green-800 border-green-300" };
  if (composite >= 70) return { label: "Moderate", pct: "~75%", tone: "bg-blue-100 text-blue-800 border-blue-300" };
  if (composite >= 55) return { label: "Building", pct: "~60%", tone: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  return { label: "At Risk", pct: "<50%", tone: "bg-red-100 text-red-800 border-red-300" };
};

const ReadinessTab = ({ courseId, isInstructor }: Props) => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [signoffs, setSignoffs] = useState<Signoff[]>([]);
  const [hours, setHours] = useState<ClinicalHour[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [me, setMe] = useState<string>("");
  const [drillUserId, setDrillUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user?.id ?? "");

      // Skills catalog (required count for denominator)
      const { data: sk } = await supabase
        .from("cna_skills")
        .select("id, required_for_certification, active")
        .eq("active", true);
      setSkills((sk as Skill[]) ?? []);

      // Roster
      let enrolls: Enrollment[] = [];
      if (isInstructor) {
        const { data: e } = await supabase.from("enrollments").select("user_id").eq("course_id", courseId).eq("role", "student");
        const ids = (e ?? []).map((x: any) => x.user_id);
        if (ids.length) {
          const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
          enrolls = ids.map((id: string) => ({
            user_id: id,
            profile: (profs ?? []).find((p: any) => p.user_id === id) ?? null,
          }));
        }
      } else if (user?.id) {
        const { data: prof } = await supabase.from("profiles").select("user_id, full_name").eq("user_id", user.id).maybeSingle();
        enrolls = [{ user_id: user.id, profile: prof as any }];
      }
      setEnrollments(enrolls);

      // Quiz attempts for course
      const { data: quizzes } = await supabase.from("quizzes").select("id").eq("course_id", courseId);
      const quizIds = (quizzes ?? []).map((q: any) => q.id);
      if (quizIds.length) {
        const userFilter = isInstructor ? undefined : user?.id;
        let q = supabase.from("quiz_attempts").select("user_id, score, max_score, submitted_at").in("quiz_id", quizIds).not("submitted_at", "is", null);
        if (userFilter) q = q.eq("user_id", userFilter);
        const { data: att } = await q;
        setAttempts((att as QuizAttempt[]) ?? []);
      }

      // Skill sign-offs
      let so = supabase.from("student_skill_signoffs").select("student_user_id, status, skill_id").eq("course_id", courseId);
      if (!isInstructor && user?.id) so = so.eq("student_user_id", user.id);
      const { data: soData } = await so;
      setSignoffs((soData as Signoff[]) ?? []);

      // Clinical hours
      let ch = supabase.from("clinical_hours").select("student_user_id, hours, verified").eq("course_id", courseId);
      if (!isInstructor && user?.id) ch = ch.eq("student_user_id", user.id);
      const { data: chData } = await ch;
      setHours((chData as ClinicalHour[]) ?? []);

      setLoading(false);
    })();
  }, [courseId, isInstructor]);

  const requiredSkillCount = useMemo(
    () => skills.filter(s => s.required_for_certification).length,
    [skills]
  );

  if (loading) return <div className="p-4 text-muted-foreground">Loading readiness…</div>;

  // ====== STUDENT VIEW ======
  if (!isInstructor) {
    const r = computeReadiness(me, attempts, signoffs, hours, requiredSkillCount);
    return <ReadinessDetail name="Your Readiness" r={r} self />;
  }

  // ====== INSTRUCTOR VIEW ======
  if (drillUserId) {
    const target = enrollments.find(e => e.user_id === drillUserId);
    const r = computeReadiness(drillUserId, attempts, signoffs, hours, requiredSkillCount);
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setDrillUserId(null)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to roster
        </Button>
        <ReadinessDetail name={target?.profile?.full_name || "Student"} r={r} />
      </div>
    );
  }

  const rows = enrollments.map(e => ({
    ...e,
    r: computeReadiness(e.user_id, attempts, signoffs, hours, requiredSkillCount),
  })).sort((a, b) => b.r.composite - a.r.composite);

  const atRisk = rows.filter(r => r.r.composite < 55).length;
  const high = rows.filter(r => r.r.composite >= 85).length;
  const avg = rows.length === 0 ? 0 : rows.reduce((s, r) => s + r.r.composite, 0) / rows.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-purple" /> State Exam Readiness
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Composite of quiz performance (40%), skill competency (35%), and verified clinical hours (25%).
          </p>
        </div>
      </div>

      {/* Cohort KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Students" value={rows.length.toString()} icon={<GraduationCap className="h-4 w-4" />} />
        <KpiCard label="Cohort Avg" value={`${Math.round(avg)}%`} icon={<TrendingUp className="h-4 w-4" />} tone={avg >= 70 ? "good" : avg >= 55 ? "warn" : "bad"} />
        <KpiCard label="High Readiness" value={high.toString()} icon={<Trophy className="h-4 w-4" />} tone="good" />
        <KpiCard label="At Risk" value={atRisk.toString()} icon={<AlertTriangle className="h-4 w-4" />} tone={atRisk > 0 ? "bad" : "good"} />
      </div>

      {/* Roster */}
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No enrolled students yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Quizzes</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Clinical Hrs</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead>Projected Pass</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => {
                  const band = passBand(row.r.composite);
                  return (
                    <TableRow key={row.user_id} className="cursor-pointer" onClick={() => setDrillUserId(row.user_id)}>
                      <TableCell className="font-medium">{row.profile?.full_name || row.user_id.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm">{Math.round(row.r.quizAvg)}% <span className="text-xs text-muted-foreground">({row.r.quizCount})</span></TableCell>
                      <TableCell className="text-sm">{row.r.skillsCompetent}/{row.r.skillsTotal}</TableCell>
                      <TableCell className="text-sm">{row.r.hoursVerified.toFixed(1)} / {CDPH_HOURS_MINIMUM}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Progress value={row.r.composite} className="h-2 flex-1" />
                          <span className="text-xs font-semibold w-9 text-right">{Math.round(row.r.composite)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${band.tone} border`}>{band.label} · {band.pct}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const KpiCard = ({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone?: "good" | "warn" | "bad" }) => {
  const toneCls =
    tone === "good" ? "border-green-200 bg-green-50"
    : tone === "warn" ? "border-yellow-200 bg-yellow-50"
    : tone === "bad" ? "border-red-200 bg-red-50"
    : "border-border bg-background";
  return (
    <div className={`rounded-lg border p-4 ${toneCls}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-1">
        {icon} {label}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
};

const ReadinessDetail = ({ name, r, self }: { name: string; r: Readiness; self?: boolean }) => {
  const band = passBand(r.composite);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-purple" /> {name}
        </h2>
        {self && <p className="text-sm text-muted-foreground mt-1">Track your progress toward the CNA state exam.</p>}
      </div>

      {/* Composite hero */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Composite Readiness</div>
              <div className="text-5xl font-bold text-foreground">{Math.round(r.composite)}<span className="text-2xl text-muted-foreground">/100</span></div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Projected Pass</div>
              <Badge className={`${band.tone} border text-base px-3 py-1`}>{band.label} · {band.pct}</Badge>
            </div>
          </div>
          <Progress value={r.composite} className="h-3" />
        </CardContent>
      </Card>

      {/* Component breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <ComponentCard
          icon={<GraduationCap className="h-4 w-4" />}
          title="Quiz Performance"
          weight="40%"
          value={`${Math.round(r.quizAvg)}%`}
          sub={`Across ${r.quizCount} submitted attempt${r.quizCount === 1 ? "" : "s"}`}
          progress={r.quizAvg}
        />
        <ComponentCard
          icon={<Stethoscope className="h-4 w-4" />}
          title="Skill Competency"
          weight="35%"
          value={`${r.skillsCompetent}/${r.skillsTotal}`}
          sub={`${Math.round(r.skillPct)}% of required CDPH skills signed off`}
          progress={r.skillPct}
        />
        <ComponentCard
          icon={<Clock className="h-4 w-4" />}
          title="Clinical Hours"
          weight="25%"
          value={`${r.hoursVerified.toFixed(1)}h`}
          sub={`of ${CDPH_HOURS_MINIMUM}h CDPH minimum (verified only)`}
          progress={r.hoursPct}
        />
      </div>

      {/* Recommendations */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple" /> Next Steps to Boost Readiness</h3>
          <ul className="space-y-2 text-sm">
            {r.quizAvg < 75 && (
              <li className="flex gap-2"><span className="text-purple">•</span> <span><strong>Lift quiz average above 75%</strong> — review missed questions in the State Exam Prep practice modes.</span></li>
            )}
            {r.skillPct < 100 && (
              <li className="flex gap-2"><span className="text-purple">•</span> <span><strong>Complete remaining skill sign-offs</strong> — {r.skillsTotal - r.skillsCompetent} skill{r.skillsTotal - r.skillsCompetent === 1 ? "" : "s"} still need instructor verification.</span></li>
            )}
            {r.hoursVerified < CDPH_HOURS_MINIMUM && (
              <li className="flex gap-2"><span className="text-purple">•</span> <span><strong>Log {(CDPH_HOURS_MINIMUM - r.hoursVerified).toFixed(1)} more verified clinical hours</strong> at your assigned site (Stockton, Lodi, or Hayward).</span></li>
            )}
            {r.composite >= 85 && (
              <li className="flex gap-2"><span className="text-green-600">✓</span> <span>Strong readiness — keep pace and schedule your state exam date.</span></li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

const ComponentCard = ({
  icon, title, weight, value, sub, progress,
}: { icon: React.ReactNode; title: string; weight: string; value: string; sub: string; progress: number }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">{icon} {title}</div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5">{weight}</span>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs text-muted-foreground mb-3">{sub}</div>
      <Progress value={progress} className="h-1.5" />
    </CardContent>
  </Card>
);

export default ReadinessTab;
