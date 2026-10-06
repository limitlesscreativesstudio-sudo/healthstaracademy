// @ts-nocheck — dynamic attendance/clinical rows
// Per-student attendance calendar: theory vs clinical day breakdown, quick status
// editing, and manual clinical-hour entry.
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  attendanceCode, isAttended, THEORY_HOURS_PER_ATTENDED_DAY,
  REQUIRED_THEORY_HOURS, REQUIRED_CLINICAL_HOURS,
  attendanceDayHours,
} from '@/lib/attendance';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22', clinical:'#319795' } as const;
const SITES = ['Stockton', 'Lodi', 'Hayward'];
const CYCLE = ['P', 'A', 'L', 'E', null] as const;
const LABEL = { P:'Present', A:'Absent', L:'Late', E:'Excused' };

interface Props { courseId: string; studentId: string; name: string; canEdit?: boolean; onClose: () => void; onChanged?: () => void; }

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const StudentAttendanceCalendar: React.FC<Props> = ({ courseId, studentId, name, canEdit, onClose, onChanged }) => {
  const [att, setAtt] = useState<Record<string, string>>({});
  const [logged, setLogged] = useState<any[]>([]);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: ymd(new Date()), hours: '8', site: 'Stockton', notes: '' });

  const load = async () => {
    setLoading(true);
    const [{ data: a }, { data: ch }, { data: course }] = await Promise.all([
      supabase.from('attendance').select('session_date, status').eq('course_id', courseId).eq('student_id', studentId),
      supabase.from('clinical_hours').select('id, shift_date, clinical_site, hours, verified, activity_summary')
        .eq('course_id', courseId).eq('student_user_id', studentId).order('shift_date', { ascending: false }),
      supabase.from('courses').select('start_at, end_at').eq('id', courseId).maybeSingle(),
    ]);
    const map: Record<string, string> = {};
    (a ?? []).forEach(r => { map[r.session_date] = attendanceCode(r.status); });
    setAtt(map); setLogged(ch ?? []);
    const dates = [...Object.keys(map), ...(ch ?? []).map(c => c.shift_date)].sort();
    const start = course?.start_at?.slice(0, 10) || dates[0] || ymd(new Date());
    let end = course?.end_at?.slice(0, 10) || dates[dates.length - 1] || ymd(new Date());
    if (dates.length && dates[dates.length - 1] > end) end = dates[dates.length - 1];
    setRange({ start: start < (dates[0] ?? start) ? start : (dates[0] ?? start), end });
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId, studentId]);

  // Per-day hour split: theory until 60h, then clinical.
  const dayHours = useMemo(() =>
    attendanceDayHours(Object.entries(att).map(([session_date, status]) => ({ session_date, status }))),
  [att]);
  const loggedByDay = useMemo(() => {
    const m: Record<string, number> = {};
    logged.forEach(l => { m[l.shift_date] = (m[l.shift_date] ?? 0) + Number(l.hours ?? 0); });
    return m;
  }, [logged]);

  const totals = useMemo(() => {
    const v = Object.values(dayHours);
    const theory = v.reduce((n, x) => n + x.theory, 0);
    const fromAtt = v.reduce((n, x) => n + x.clinical, 0);
    const manual = logged.reduce((n, l) => n + Number(l.hours ?? 0), 0);
    const crossDay = Object.keys(dayHours).sort().find(d => dayHours[d].clinical > 0);
    return { theory, fromAtt, manual, clinical: fromAtt + manual, crossDay };
  }, [dayHours, logged]);

  const months = useMemo(() => {
    if (!range) return [];
    const s = new Date(range.start + 'T00:00:00'), e = new Date(range.end + 'T00:00:00');
    const list: Date[] = [];
    const cur = new Date(s.getFullYear(), s.getMonth(), 1);
    while (cur <= e && list.length < 12) { list.push(new Date(cur)); cur.setMonth(cur.getMonth() + 1); }
    return list;
  }, [range]);

  const cycleDay = async (d: string) => {
    if (!canEdit) return;
    const curr = att[d] ?? null;
    const next = CYCLE[(CYCLE.indexOf(curr as any) + 1) % CYCLE.length];
    const prev = { ...att };
    const upd = { ...att }; if (next) upd[d] = next; else delete upd[d];
    setAtt(upd);
    const { error } = next
      ? await supabase.from('attendance').upsert({ course_id: courseId, student_id: studentId, session_date: d, status: next }, { onConflict: 'course_id,student_id,session_date' })
      : await supabase.from('attendance').delete().eq('course_id', courseId).eq('student_id', studentId).eq('session_date', d);
    if (error) { setAtt(prev); toast.error(`Not saved: ${error.message}`); return; }
    onChanged?.();
    window.dispatchEvent(new CustomEvent('hsa:progress-updated', { detail: { courseId } }));
  };

  const addHours = async () => {
    const hrs = Number(form.hours);
    if (!form.date || !(hrs > 0) || hrs > 24) { toast.error('Enter a date and 0–24 hours'); return; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('clinical_hours').insert({
      course_id: courseId, student_user_id: studentId, shift_date: form.date, hours: hrs,
      clinical_site: form.site, activity_summary: form.notes || null,
      verified: true, verified_by: u?.user?.id ?? null, verified_at: new Date().toISOString(),
    });
    if (error) { toast.error(`Not saved: ${error.message}`); return; }
    toast.success(`${hrs} clinical hours added`);
    setForm(f => ({ ...f, notes: '' }));
    load(); onChanged?.();
  };

  const removeHours = async (id: string) => {
    if (!confirm('Remove this clinical hours entry?')) return;
    const { error } = await supabase.from('clinical_hours').delete().eq('id', id);
    if (error) { toast.error(`Not removed: ${error.message}`); return; }
    load(); onChanged?.();
  };

  const cell = (d: Date) => {
    const k = ymd(d), st = att[k], h = dayHours[k], man = loggedByDay[k];
    const inRange = range && k >= range.start && k <= range.end;
    let bg = inRange ? C.white : C.bg, fg = C.text, tag = '';
    if (h) { if (h.clinical > 0 && h.theory > 0) { bg = `linear-gradient(135deg, ${C.primary} 50%, ${C.clinical} 50%)`; fg = '#fff'; tag = `${h.theory}T·${h.clinical}C`; }
             else if (h.clinical > 0) { bg = C.clinical; fg = '#fff'; tag = `${h.clinical}h C`; }
             else { bg = C.primary; fg = '#fff'; tag = `${h.theory}h T`; } }
    else if (st === 'A') { bg = '#FDECEA'; fg = C.error; tag = 'Absent'; }
    else if (st === 'E') { bg = '#E6F7FC'; fg = '#1A6E85'; tag = 'Excused'; }
    return (
      <button key={k} type="button" onClick={() => cycleDay(k)} disabled={!canEdit}
        title={`${k}${st ? ' · ' + LABEL[st] : ''}${h ? ` · ${h.theory}h theory, ${h.clinical}h clinical` : ''}${man ? ` · +${man}h logged clinical` : ''}`}
        style={{ position:'relative', aspectRatio:'1', minHeight:38, border:`1px solid ${C.border}`, borderRadius:6, background:bg, color:fg,
          cursor: canEdit ? 'pointer' : 'default', padding:2, fontFamily:'sans-serif', textAlign:'left', opacity: inRange ? 1 : .55 }}>
        <div style={{ fontSize:11, fontWeight:700 }}>{d.getDate()}{st === 'L' ? ' ⏱' : ''}</div>
        {tag && <div style={{ fontSize:9, fontWeight:600, lineHeight:1.1 }}>{tag}</div>}
        {man ? <div style={{ position:'absolute', right:2, bottom:2, fontSize:9, fontWeight:700, background:C.warn, color:'#fff', borderRadius:3, padding:'0 3px' }}>+{man}</div> : null}
      </button>
    );
  };

  const inp = { border:`1px solid ${C.border}`, borderRadius:5, padding:'6px 8px', fontSize:13, fontFamily:'sans-serif' } as const;

  return (
    <div role="dialog" aria-label={`${name} attendance calendar`} onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(20,10,40,.45)', zIndex:1000, display:'flex', justifyContent:'center', alignItems:'flex-start', overflowY:'auto', padding:'24px 12px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:10, width:'100%', maxWidth:760, padding:20, fontFamily:'sans-serif', color:C.text }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div>
            <h3 style={{ margin:0, fontSize:18 }}>{name}</h3>
            <div style={{ fontSize:12, color:C.muted }}>{range ? `${range.start} → ${range.end}` : ''}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border:'none', background:'none', fontSize:22, cursor:'pointer', color:C.muted }}>×</button>
        </div>

        {loading ? <div style={{ padding:32, textAlign:'center', color:C.muted }}>Loading…</div> : (<>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10, margin:'14px 0' }}>
            <Stat label="Theory" value={`${totals.theory} / ${REQUIRED_THEORY_HOURS}h`} color={C.primary} />
            <Stat label="Clinical" value={`${totals.clinical} / ${REQUIRED_CLINICAL_HOURS}h`} color={C.clinical}
              sub={`${totals.fromAtt}h from attendance · ${totals.manual}h added`} />
            <Stat label="Clinical began" value={totals.crossDay ?? 'Not yet'} color={C.warn} />
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:10, fontSize:11, color:C.muted, marginBottom:10 }}>
            <Legend c={C.primary} t="Theory day" /><Legend c={C.clinical} t="Clinical day" /><Legend c="#FDECEA" t="Absent" />
            <Legend c="#E6F7FC" t="Excused" /><Legend c={C.warn} t="+ added clinical hrs" />
            {canEdit && <span>· Tap any past day to fix or fill in attendance: Present → Absent → Late → Excused → clear</span>}
          </div>

          {months.map(m => {
            const first = new Date(m.getFullYear(), m.getMonth(), 1);
            const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
            return (
              <div key={ymd(m)} style={{ marginBottom:16 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{m.toLocaleString('en-US', { month:'long', year:'numeric' })}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ fontSize:10, color:C.muted, textAlign:'center' }}>{d}</div>)}
                  {Array.from({ length: first.getDay() }).map((_, i) => <div key={'x' + i} />)}
                  {Array.from({ length: days }).map((_, i) => cell(new Date(m.getFullYear(), m.getMonth(), i + 1)))}
                </div>
              </div>
            );
          })}

          {canEdit && (
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14, marginTop:4 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>Add clinical hours</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
                <input aria-label="Shift date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} />
                <input aria-label="Hours" type="number" min="0.5" max="24" step="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} style={{ ...inp, width:80 }} />
                <select aria-label="Clinical site" value={form.site} onChange={e => setForm({ ...form, site: e.target.value })} style={inp}>
                  {SITES.map(s => <option key={s}>{s}</option>)}
                </select>
                <input aria-label="Notes" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inp, flex:1, minWidth:140 }} />
                <button onClick={addHours} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.clinical, color:'#fff', fontWeight:600, cursor:'pointer' }}>Add hours</button>
              </div>
              <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>Use this for clinical time not covered by roll call (extra shifts, make-up hours). Present days after theory is complete are counted automatically — don't add them twice.</div>
            </div>
          )}

          {logged.length > 0 && (
            <div style={{ marginTop:14 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>Added clinical hours</div>
              {logged.map(l => (
                <div key={l.id} style={{ display:'flex', gap:10, alignItems:'center', fontSize:12, padding:'6px 0', borderBottom:`1px solid ${C.bg}` }}>
                  <span style={{ width:90 }}>{l.shift_date}</span><span style={{ width:50, fontWeight:700 }}>{Number(l.hours)}h</span>
                  <span style={{ width:80 }}>{l.clinical_site}</span><span style={{ flex:1, color:C.muted }}>{l.activity_summary}</span>
                  {canEdit && <button onClick={() => removeHours(l.id)} style={{ border:'none', background:'none', color:C.error, cursor:'pointer', fontSize:12 }}>Remove</button>}
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>
    </div>
  );
};

const Stat = ({ label, value, color, sub }: any) => (
  <div style={{ border:`1px solid ${C.border}`, borderLeft:`4px solid ${color}`, borderRadius:6, padding:'8px 10px' }}>
    <div style={{ fontSize:11, color:C.muted }}>{label}</div>
    <div style={{ fontSize:16, fontWeight:700 }}>{value}</div>
    {sub && <div style={{ fontSize:10, color:C.muted }}>{sub}</div>}
  </div>
);
const Legend = ({ c, t }: any) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><span style={{ width:10, height:10, borderRadius:2, background:c, display:'inline-block' }} />{t}</span>
);

export default StudentAttendanceCalendar;
