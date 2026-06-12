import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert, ShieldCheck, LogIn } from "lucide-react";

interface AuditRow {
  id: string;
  user_id: string | null;
  email: string | null;
  event_type: string;
  path: string | null;
  required_role: string | null;
  user_role: string | null;
  user_agent: string | null;
  created_at: string;
}

const EVENT_FILTERS: Array<{ id: "all" | "denied" | "login"; label: string }> = [
  { id: "all",    label: "All events" },
  { id: "denied", label: "Denied access" },
  { id: "login",  label: "Successful logins" },
];

const AuthAuditLog = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "denied" | "login">("all");

  const load = async () => {
    setLoading(true);
    let query = supabase.from("auth_audit_log").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter === "denied") query = query.eq("event_type", "denied_route");
    if (filter === "login")  query = query.eq("event_type", "login_success");
    const { data, error } = await query;
    if (!error && data) setRows(data as AuditRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const iconFor = (t: string) => {
    if (t === "denied_route") return <ShieldAlert className="h-4 w-4 text-red-600" />;
    if (t === "login_success") return <ShieldCheck className="h-4 w-4 text-green-600" />;
    return <LogIn className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="bg-background rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h2 className="font-heading text-lg font-bold">Auth Audit Log</h2>
          <p className="text-sm text-muted-foreground">Last 200 events. Denied route attempts + role-based logins.</p>
        </div>
        <div className="flex items-center gap-2">
          {EVENT_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs px-3 py-1.5 rounded border ${filter === f.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
            >{f.label}</button>
          ))}
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-6 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center">No audit events yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border text-muted-foreground">
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">Event</th>
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Path</th>
                <th className="py-2 pr-3">Required</th>
                <th className="py-2 pr-3">Has Role</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      {iconFor(r.event_type)}
                      {r.event_type}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    <div className="font-medium">{r.email || "—"}</div>
                    <div className="text-muted-foreground font-mono">{r.user_id?.slice(0, 8) || "anon"}</div>
                  </td>
                  <td className="py-2 pr-3 text-xs font-mono">{r.path || "—"}</td>
                  <td className="py-2 pr-3 text-xs">{r.required_role || "—"}</td>
                  <td className="py-2 pr-3 text-xs">{r.user_role || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuthAuditLog;
