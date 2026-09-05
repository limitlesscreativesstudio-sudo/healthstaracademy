/**
 * Portal Doctor — one-click health scan of the course.
 *
 * Calls the agent-diagnostics function, which checks student records,
 * enrollments, instructor access, quizzes, grading backlog, module ordering
 * and broken content links, then lists everything that needs attention.
 */
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Finding = {
  id?: string;
  severity: Severity;
  title: string;
  detail?: string | null;
  suggested_fix?: string | null;
  target_table?: string | null;
  created_at?: string;
};

const C = {
  text: '#2D3B45', muted: '#6B7780', line: '#E5E7EA', card: '#FFFFFF', bg: '#F8F9FA',
};

const SEV: Record<Severity, { label: string; bg: string; fg: string; icon: string; rank: number }> = {
  critical: { label: 'Blocking',   bg: '#FDECEC', fg: '#B3261E', icon: '⛔', rank: 0 },
  high:     { label: 'Important',  bg: '#FFF4E5', fg: '#A15C00', icon: '⚠️', rank: 1 },
  medium:   { label: 'Worth a look', bg: '#EAF3FF', fg: '#0B5CAD', icon: 'ℹ️', rank: 2 },
  low:      { label: 'Minor',      bg: '#F1F3F4', fg: '#5F6771', icon: '·', rank: 3 },
};

const DiagnosticsTab: React.FC<{ courseId?: string; canEdit?: boolean }> = ({ courseId, canEdit = true }) => {
  const [running, setRunning]   = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [summary, setSummary]   = useState<string>('');
  const [checked, setChecked]   = useState<Record<string, number> | null>(null);
  const [lastRun, setLastRun]   = useState<string>('');
  const [scopeAll, setScopeAll] = useState(false);

  /** Show the most recent saved results so the page is never empty. */
  const loadPrevious = async () => {
    const { data } = await supabase
      .from('agent_findings')
      .select('id,severity,title,detail,suggested_fix,target_table,created_at')
      .eq('agent', 'diagnostics').eq('status', 'open')
      .order('created_at', { ascending: false }).limit(200);
    if (data?.length) {
      setFindings(data as Finding[]);
      setLastRun(new Date(data[0].created_at as string).toLocaleString());
    }
  };

  useEffect(() => { loadPrevious(); /* eslint-disable-next-line */ }, [courseId]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('agent-diagnostics', {
        body: { courseId: scopeAll ? null : courseId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setFindings(((data as any).findings ?? []) as Finding[]);
      setSummary((data as any).summary ?? '');
      setChecked((data as any).checked ?? null);
      setLastRun(new Date().toLocaleString());
      toast.success((data as any).summary || 'Scan complete');
    } catch (e: any) {
      toast.error(`Scan failed: ${e.message ?? e}`);
    } finally {
      setRunning(false);
    }
  };

  const dismiss = async (f: Finding) => {
    if (!f.id) { setFindings(p => p.filter(x => x !== f)); return; }
    const { error } = await supabase.from('agent_findings')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', f.id);
    if (error) return toast.error(error.message);
    setFindings(p => p.filter(x => x.id !== f.id));
  };

  /** Apply the safe correction for a finding, after the instructor confirms. */
  const [fixing, setFixing] = useState<string | null>(null);
  const fix = async (f: Finding) => {
    if (!f.id) return;
    if (!window.confirm(`Correct this now?\n\n${f.title}\n\nNo student record is ever deleted.`)) return;
    setFixing(f.id);
    try {
      const { data, error } = await supabase.functions.invoke('agent-diagnostics', {
        body: { action: 'fix', findingId: f.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success((data as any)?.message ?? 'Corrected');
      setFindings(p => p.filter(x => x.id !== f.id));
    } catch (e: any) {
      toast.error(`Could not correct it: ${e.message ?? e}`);
    } finally {
      setFixing(null);
    }
  };

  const sorted = [...findings].sort((a, b) => SEV[a.severity].rank - SEV[b.severity].rank);
  const counts = sorted.reduce<Record<string, number>>((a, f) => {
    a[f.severity] = (a[f.severity] ?? 0) + 1; return a;
  }, {});

  return (
    <div style={{ padding: 20, background: C.bg, minHeight: '100%' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:C.text }}>🩺 Portal Doctor</h2>
          <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>
            Runs automatically every 2 hours and on demand. Checks students, instructors, quizzes, grading, modules and links, then offers a one-click correction.
            {lastRun && <> Last checked {lastRun}.</>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <label style={{ fontSize:12, color:C.muted, display:'flex', gap:6, alignItems:'center' }}>
            <input type="checkbox" checked={scopeAll} onChange={e => setScopeAll(e.target.checked)} />
            Check every course
          </label>
          <button onClick={run} disabled={running}
            style={{ padding:'10px 18px', borderRadius:8, border:'none', background: running ? '#9AA5AD' : '#319795',
                     color:'#fff', fontWeight:700, fontSize:14, cursor: running ? 'default' : 'pointer' }}>
            {running ? 'Checking…' : 'Run check'}
          </button>
        </div>
      </div>

      {checked && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
          {Object.entries(checked).map(([k, v]) => (
            <span key={k} style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:20, padding:'4px 12px', fontSize:12, color:C.muted }}>
              {v} {k.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {summary && (
        <div style={{ marginBottom:16, fontSize:13, color:C.text, fontWeight:600 }}>{summary}</div>
      )}

      {sorted.length > 0 && (
        <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
          {(['critical','high','medium','low'] as Severity[]).filter(s => counts[s]).map(s => (
            <span key={s} style={{ background:SEV[s].bg, color:SEV[s].fg, borderRadius:6, padding:'4px 10px', fontSize:12, fontWeight:700 }}>
              {SEV[s].icon} {counts[s]} {SEV[s].label}
            </span>
          ))}
        </div>
      )}

      {!running && sorted.length === 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:10, padding:32, textAlign:'center', color:C.muted, fontSize:14 }}>
          ✅ Nothing needs attention. Press <strong>Run check</strong> any time you make changes.
        </div>
      )}

      <div style={{ display:'grid', gap:10 }}>
        {sorted.map((f, i) => (
          <div key={f.id ?? i}
            style={{ background:C.card, border:`1px solid ${C.line}`, borderLeft:`4px solid ${SEV[f.severity].fg}`,
                     borderRadius:10, padding:14, display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ fontSize:18, lineHeight:'22px' }}>{SEV[f.severity].icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{f.title}</div>
              {f.detail && <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>{f.detail}</div>}
              {f.suggested_fix && (
                <div style={{ fontSize:13, color:'#0B5CAD', marginTop:6 }}>👉 {f.suggested_fix}</div>
              )}
            </div>
            {canEdit && f.id && (
              <button onClick={() => fix(f)} disabled={fixing === f.id} title="Apply the safe correction"
                style={{ border:'none', background:'#319795', color:'#fff', borderRadius:6, padding:'5px 12px',
                         fontSize:12, fontWeight:700, cursor:'pointer', marginRight:6 }}>
                {fixing === f.id ? 'Fixing…' : 'Confirm & correct'}
              </button>
            )}
            {canEdit && (
              <button onClick={() => dismiss(f)} title="Mark as handled"
                style={{ border:`1px solid ${C.line}`, background:'transparent', borderRadius:6, padding:'4px 10px',
                         fontSize:12, color:C.muted, cursor:'pointer' }}>
                Done
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticsTab;
