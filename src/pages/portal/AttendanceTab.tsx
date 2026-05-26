import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ClipboardCheck, MapPin, LogIn, LogOut } from "lucide-react";

type Att = {
  id: string; student_user_id: string; course_id: string; clinical_site: string;
  shift_date: string; clock_in_at: string | null; clock_out_at: string | null;
  hours_worked: number | null; verified: boolean;
  clock_in_lat: number | null; clock_in_lng: number | null;
};

const SITES = ["Stockton", "Lodi", "Hayward"];

const getCoords = (): Promise<{ lat: number; lng: number } | null> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });

const AttendanceTab = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const { user } = usePortalAuth();
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck className="h-6 w-6 text-purple" />
        <h2 className="font-heading text-2xl font-bold">Attendance</h2>
      </div>
      {isInstructor
        ? <InstructorAttendance courseId={courseId} />
        : <StudentAttendance courseId={courseId} userId={user?.id ?? ""} />}
    </div>
  );
};

const StudentAttendance = ({ courseId, userId }: { courseId: string; userId: string }) => {
  const [records, setRecords] = useState<Att[]>([]);
  const [site, setSite] = useState(SITES[0]);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const { data } = await supabase.from("clinical_attendance")
      .select("*").eq("student_user_id", userId).eq("course_id", courseId)
      .order("shift_date", { ascending: false }).limit(50);
    setRecords((data ?? []) as Att[]);
  };
  useEffect(() => { if (userId) reload(); }, [userId, courseId]);

  const open = records.find(r => r.clock_in_at && !r.clock_out_at);
  const totalHours = records.reduce((a, r) => a + Number(r.hours_worked ?? 0), 0);

  const clockIn = async () => {
    setBusy(true);
    const coords = await getCoords();
    const { error } = await supabase.from("clinical_attendance").insert({
      student_user_id: userId, course_id: courseId, clinical_site: site,
      clock_in_at: new Date().toISOString(),
      clock_in_lat: coords?.lat ?? null, clock_in_lng: coords?.lng ?? null,
    });
    setBusy(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Clocked in", description: site }); reload(); }
  };

  const clockOut = async () => {
    if (!open) return;
    setBusy(true);
    const coords = await getCoords();
    const out = new Date();
    const hrs = open.clock_in_at
      ? Math.max(0, (out.getTime() - new Date(open.clock_in_at).getTime()) / 3600000)
      : 0;
    const { error } = await supabase.from("clinical_attendance").update({
      clock_out_at: out.toISOString(),
      clock_out_lat: coords?.lat ?? null, clock_out_lng: coords?.lng ?? null,
      hours_worked: Number(hrs.toFixed(2)),
    }).eq("id", open.id);
    setBusy(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Clocked out", description: `${hrs.toFixed(2)} hrs` }); reload(); }
  };

  return (
    <div className="space-y-6">
      <Card><CardContent className="pt-6 space-y-4">
        <div className="text-sm font-semibold">Clock In / Out</div>
        {open ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">On shift</Badge>
              <span>{open.clinical_site} · Since {new Date(open.clock_in_at!).toLocaleTimeString()}</span>
            </div>
            <Button onClick={clockOut} disabled={busy} variant="destructive">
              <LogOut className="h-4 w-4" /> Clock Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Select value={site} onValueChange={setSite}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={clockIn} disabled={busy}>
              <LogIn className="h-4 w-4" /> Clock In
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Location is captured for verification.
        </p>
      </CardContent></Card>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Recent Shifts</h3>
          <span className="text-xs text-muted-foreground">Total: {totalHours.toFixed(2)} hrs</span>
        </div>
        <Card><CardContent className="p-0">
          {records.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">No shifts yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr><th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">Site</th>
                  <th className="text-left px-4 py-2">In</th><th className="text-left px-4 py-2">Out</th>
                  <th className="text-left px-4 py-2">Hours</th><th className="text-left px-4 py-2">Status</th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-2">{new Date(r.shift_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{r.clinical_site}</td>
                    <td className="px-4 py-2">{r.clock_in_at ? new Date(r.clock_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="px-4 py-2">{r.clock_out_at ? new Date(r.clock_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="px-4 py-2">{r.hours_worked ? Number(r.hours_worked).toFixed(2) : "—"}</td>
                    <td className="px-4 py-2">
                      {r.verified
                        ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">Verified</Badge>
                        : <Badge variant="secondary" className="bg-amber-100 text-amber-900">Pending</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent></Card>
      </div>
    </div>
  );
};

const InstructorAttendance = ({ courseId }: { courseId: string }) => {
  const [records, setRecords] = useState<(Att & { full_name?: string })[]>([]);
  const reload = async () => {
    const { data: att } = await supabase.from("clinical_attendance")
      .select("*").eq("course_id", courseId).order("shift_date", { ascending: false }).limit(200);
    const list = (att ?? []) as Att[];
    const ids = Array.from(new Set(list.map(a => a.student_user_id)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("user_id, full_name").in("user_id", ids)
      : { data: [] };
    const nameMap = Object.fromEntries((profs ?? []).map((p: any) => [p.user_id, p.full_name ?? "(no name)"]));
    setRecords(list.map(r => ({ ...r, full_name: nameMap[r.student_user_id] })));
  };
  useEffect(() => { reload(); }, [courseId]);

  const toggleVerify = async (id: string, verified: boolean) => {
    const { error } = await supabase.from("clinical_attendance").update({
      verified, verified_at: verified ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else reload();
  };

  if (records.length === 0) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No attendance recorded yet.</CardContent></Card>;
  }
  return (
    <Card><CardContent className="p-0">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr><th className="text-left px-4 py-2">Student</th><th className="text-left px-4 py-2">Site</th>
            <th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">In/Out</th>
            <th className="text-left px-4 py-2">Hours</th><th className="text-left px-4 py-2">GPS</th>
            <th className="px-4 py-2"></th></tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id} className="border-t border-border">
              <td className="px-4 py-2 font-medium">{r.full_name}</td>
              <td className="px-4 py-2">{r.clinical_site}</td>
              <td className="px-4 py-2">{new Date(r.shift_date).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-xs">
                {r.clock_in_at ? new Date(r.clock_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"} →{" "}
                {r.clock_out_at ? new Date(r.clock_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
              </td>
              <td className="px-4 py-2">{r.hours_worked ? Number(r.hours_worked).toFixed(2) : "—"}</td>
              <td className="px-4 py-2 text-xs">
                {r.clock_in_lat ? (
                  <a className="text-purple hover:underline" target="_blank" rel="noreferrer"
                    href={`https://maps.google.com/?q=${r.clock_in_lat},${r.clock_in_lng}`}>
                    <MapPin className="inline h-3 w-3" /> view
                  </a>
                ) : "—"}
              </td>
              <td className="px-4 py-2 text-right">
                <Button size="sm" variant={r.verified ? "outline" : "default"} onClick={() => toggleVerify(r.id, !r.verified)}>
                  {r.verified ? "Unverify" : "Verify"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  );
};

export default AttendanceTab;
