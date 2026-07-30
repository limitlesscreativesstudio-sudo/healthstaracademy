// Admin: import an entire class list into every course of a cohort at once.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Users } from "lucide-react";

interface Cohort { id: string; name: string; start_date: string | null; status: string | null }
interface CourseLite { id: string; title: string }
interface ResultRow { email: string; ok: boolean; message: string; tempPassword?: string | null }

const parseRoster = (text: string) => {
  const names: Record<string, string> = {};
  const list: string[] = [];
  for (const rawLine of text.split(/[\n;]+/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const found = line.match(/[^\s,<>"]+@[^\s,<>"]+\.[^\s,<>"]+/g) ?? [];
    for (const addr of found) {
      const em = addr.trim().toLowerCase();
      if (!list.includes(em)) list.push(em);
      const label = line.replace(addr, "").replace(/[,<>"]/g, " ").trim();
      if (label) names[em] = label;
    }
  }
  return { list, names };
};

const CohortRosterImport = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortId, setCohortId] = useState<string>("");
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [instant, setInstant] = useState(true);
  const [role, setRole] = useState("student");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ResultRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cohorts")
        .select("id, name, start_date, status")
        .order("start_date", { ascending: false });
      setCohorts((data ?? []) as Cohort[]);
      if (data?.length) setCohortId(data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!cohortId) { setCourses([]); setEnrolledCount(null); return; }
    (async () => {
      const { data: cs } = await supabase.from("courses").select("id, title").eq("cohort_id", cohortId);
      const list = (cs ?? []) as CourseLite[];
      setCourses(list);
      if (list.length) {
        const { data: enr } = await supabase
          .from("enrollments").select("user_id").in("course_id", list.map(c => c.id));
        setEnrolledCount(new Set((enr ?? []).map((e: any) => e.user_id)).size);
      } else setEnrolledCount(0);
    })();
  }, [cohortId]);

  const parsed = useMemo(() => parseRoster(text), [text]);

  const runImport = async () => {
    setError(""); setResults([]);
    if (!courses.length) { setError("This cohort has no courses linked yet — create or link a course first."); return; }
    if (!parsed.list.length) { setError("No email addresses found in the list."); return; }
    setBusy(true);
    const { data, error: fnErr } = await supabase.functions.invoke("invite-student", {
      body: {
        courseId: courses[0].id,
        cohortId,
        emails: parsed.list,
        names: parsed.names,
        role,
        mode: instant ? "instant" : "invite",
        redirectTo: `${window.location.origin}/portal/teach/login`,
      },
    });
    if (fnErr || (data as any)?.error) {
      setError(fnErr?.message || String((data as any)?.error));
    } else {
      setResults(((data as any)?.results ?? []) as ResultRow[]);
      setText("");
      const { data: enr } = await supabase
        .from("enrollments").select("user_id").in("course_id", courses.map(c => c.id));
      setEnrolledCount(new Set((enr ?? []).map((e: any) => e.user_id)).size);
    }
    setBusy(false);
  };

  const creds = results.filter(r => r.tempPassword);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-lg font-bold text-foreground">Class List Import</h2>
        <p className="text-sm text-muted-foreground">
          Add students to every course in a cohort at once — no course-by-course setup.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="cohort-select" className="text-sm font-medium text-foreground">Cohort</label>
          <select id="cohort-select" value={cohortId} onChange={e => setCohortId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            {cohorts.length === 0 && <option value="">No cohorts found</option>}
            {cohorts.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.start_date ? ` — starts ${c.start_date}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="role-select" className="text-sm font-medium text-foreground">Role</label>
          <select id="role-select" value={role} onChange={e => setRole(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            {["student", "ta", "teacher", "instructor", "observer", "designer"].map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-3 text-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Users className="h-4 w-4" />
          {courses.length} course{courses.length === 1 ? "" : "s"} in this cohort
          {enrolledCount !== null && <span className="text-muted-foreground">· {enrolledCount} unique people enrolled</span>}
        </div>
        {courses.length > 0 && (
          <div className="mt-1 text-xs text-muted-foreground">{courses.map(c => c.title).join(" · ")}</div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="roster-text" className="text-sm font-medium text-foreground">
          Class list ({parsed.list.length} email{parsed.list.length === 1 ? "" : "s"} detected)
        </label>
        <textarea id="roster-text" rows={8} value={text} onChange={e => setText(e.target.value)}
          placeholder={"Jane Doe, jane@example.com\nCarlos Reyes, carlos@example.com"}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono" />
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary px-3 py-1.5 text-xs font-medium text-primary">
            <Upload className="h-3.5 w-3.5" /> Upload CSV
            <input type="file" accept=".csv,text/csv,text/plain" className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const content = await file.text();
                const lines = content.split(/\r?\n/).filter(l => /@/.test(l));
                setText(prev => (prev ? prev + "\n" : "") + lines.join("\n"));
                e.currentTarget.value = "";
              }} />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={instant} onChange={e => setInstant(e.target.checked)} />
            Create accounts instantly (temporary passwords, no email required)
          </label>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive whitespace-pre-line">
          {error}
        </div>
      )}

      <Button onClick={runImport} disabled={busy || !cohortId || !parsed.list.length}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Import {parsed.list.length || ""} into cohort
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-background">
            {results.map(r => (
              <div key={r.email} className="flex justify-between gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0">
                <span className="font-medium text-foreground">{r.email}</span>
                <span className={r.ok ? "text-muted-foreground" : "text-destructive"}>{r.message}</span>
              </div>
            ))}
          </div>
          {creds.length > 0 && (
            <div className="rounded-md border border-border bg-muted p-3">
              <div className="mb-2 text-sm font-semibold text-foreground">Temporary passwords — save these now</div>
              <pre className="whitespace-pre-wrap text-xs text-foreground">
{creds.map(c => `${c.email}  →  ${c.tempPassword}`).join("\n")}
              </pre>
              <Button variant="outline" size="sm" className="mt-2"
                onClick={() => navigator.clipboard?.writeText(creds.map(c => `${c.email}\t${c.tempPassword}`).join("\n"))}>
                Copy all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CohortRosterImport;
