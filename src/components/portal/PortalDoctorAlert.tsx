/**
 * Portal Doctor alert — always-on watchdog pop-up for the admin side.
 *
 * The scheduled health scan writes anything that looks wrong to agent_findings.
 * This component watches that list live and pops up the important ones so an
 * admin can confirm the correction on the spot. Nothing is ever deleted:
 * corrections only lock, close, re-order or restore records.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail?: string | null;
  suggested_fix?: string | null;
  target_table?: string | null;
  target_id?: string | null;
  created_at?: string;
};

const SEV: Record<Severity, { label: string; bg: string; fg: string; icon: string }> = {
  critical: { label: 'Needs fixing now', bg: '#FDECEC', fg: '#B3261E', icon: '⛔' },
  high: { label: 'Important', bg: '#FFF4E5', fg: '#A15C00', icon: '⚠️' },
  medium: { label: 'Worth a look', bg: '#EAF3FF', fg: '#0B5CAD', icon: 'ℹ️' },
  low: { label: 'Minor', bg: '#F1F3F4', fg: '#5F6771', icon: '·' },
};

const POLL_MS = 90_000;
const SNOOZE_KEY = 'hsa_doctor_snoozed';

const readSnoozed = (): string[] => {
  try { return JSON.parse(sessionStorage.getItem(SNOOZE_KEY) || '[]'); } catch { return []; }
};

const PortalDoctorAlert: React.FC = () => {
  const [queue, setQueue] = useState<Finding[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(true);
  const snoozed = useRef<string[]>(readSnoozed());

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('agent_findings')
      .select('id,severity,title,detail,suggested_fix,target_table,target_id,created_at')
      .eq('agent', 'diagnostics')
      .eq('status', 'open')
      .in('severity', ['critical', 'high'])
      .order('created_at', { ascending: false })
      .limit(50);
    const rows = ((data ?? []) as Finding[]).filter(f => !snoozed.current.includes(f.id));
    setQueue(rows);
    if (rows.length) setOpen(true);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    const channel = supabase
      .channel('portal-doctor-findings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_findings' }, () => load())
      .subscribe();
    return () => { clearInterval(t); supabase.removeChannel(channel); };
  }, [load]);

  const current = queue[0];
  if (!current || !open) {
    return current ? (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', right: 18, bottom: 18, zIndex: 3000, borderRadius: 999,
          border: 'none', background: '#B3261E', color: '#fff', fontWeight: 700,
          fontSize: 13, padding: '10px 16px', cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,.22)',
        }}
      >
        🩺 {queue.length} portal issue{queue.length === 1 ? '' : 's'}
      </button>
    ) : null;
  }

  const sev = SEV[current.severity] ?? SEV.medium;

  const confirmFix = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('agent-diagnostics', {
        body: { action: 'fix', findingId: current.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success((data as any)?.message ?? 'Corrected');
      setQueue(q => q.slice(1));
    } catch (e: any) {
      toast.error(`Could not correct it: ${e.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  const snooze = () => {
    snoozed.current = [...snoozed.current, current.id];
    sessionStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozed.current));
    setQueue(q => q.slice(1));
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      style={{
        position: 'fixed', right: 18, bottom: 18, zIndex: 3000, width: 'min(400px, calc(100vw - 32px))',
        background: '#fff', border: '1px solid #E5E7EA', borderTop: `4px solid ${sev.fg}`,
        borderRadius: 12, boxShadow: '0 12px 34px rgba(0,0,0,.20)', padding: 16, fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ background: sev.bg, color: sev.fg, borderRadius: 6, padding: '3px 9px', fontSize: 11.5, fontWeight: 800 }}>
          {sev.icon} {sev.label}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {queue.length > 1 && (
            <span style={{ fontSize: 11.5, color: '#6B7780' }}>1 of {queue.length}</span>
          )}
          <button onClick={() => setOpen(false)} aria-label="Hide"
            style={{ border: 'none', background: 'transparent', fontSize: 16, color: '#6B7780', cursor: 'pointer' }}>×</button>
        </div>
      </div>

      <div style={{ fontSize: 14.5, fontWeight: 700, color: '#2D3B45' }}>{current.title}</div>
      {current.detail && (
        <div style={{ fontSize: 13, color: '#6B7780', marginTop: 5, lineHeight: 1.45 }}>{current.detail}</div>
      )}
      {current.suggested_fix && (
        <div style={{ fontSize: 13, color: '#0B5CAD', marginTop: 8 }}>👉 {current.suggested_fix}</div>
      )}

      <div style={{ fontSize: 11.5, color: '#6B7780', marginTop: 10 }}>
        Student records are never deleted — corrections only lock, close or restore items.
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button onClick={confirmFix} disabled={busy}
          style={{ flex: 1, minWidth: 130, padding: '10px 14px', borderRadius: 8, border: 'none',
                   background: busy ? '#9AA5AD' : '#319795', color: '#fff', fontWeight: 700, fontSize: 13.5,
                   cursor: busy ? 'default' : 'pointer' }}>
          {busy ? 'Correcting…' : 'Confirm & correct'}
        </button>
        <button onClick={snooze} disabled={busy}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EA', background: '#fff',
                   color: '#6B7780', fontSize: 13, cursor: 'pointer' }}>
          Not now
        </button>
      </div>
    </div>
  );
};

export default PortalDoctorAlert;
