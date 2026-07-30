// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Props { courseId?: string; canEdit?: boolean; }
interface Student { userId: string; name: string; }
interface WorkItem { key: string; id: string; name: string; type: 'quiz' | 'assignment'; due: string; pts: number; }

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
const fmtDue = (d: string | null) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date';

const RequiredWork: React.FC<Props> = ({ courseId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [work, setWork] = useState<WorkItem[]>([]);
  const [completion, setCompletion] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [selStudent, setSelStudent] = useState('');
  const [filter, setFilter] = useState<'all'|'missing'|'complete'>('all');

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: enrs }, { data: quizzes }, { data: assignments }] = await Promise.all([
        supabase.from('enrollments').select('user_id').eq('course_id', courseId).eq('role', 'student'),
        supabase.from('quizzes').select('id, title, due_at, total_points, published').eq('course_id', courseId),
        supabase.from('assignments').select('id, title, due_at, points, published').eq('course_id', courseId),
      ]);

      const uids = (enrs ?? []).map(e => e.user_id);
      let roster: Student[] = [];
      if (uids.length) {
        const { data: profs } = await supabase.from('profiles').select('user_id, full_name').in('user_id', uids);
        const nameBy: Record<string, string> = {};
        (profs ?? []).forEach(p => { nameBy[p.user_id] = p.full_name || 'Student'; });
        roster = uids.map(u => ({ userId: u, name: nameBy[u] || 'Student' })).sort((a, b) => natural(a.name, b.name));
      }

      const items: WorkItem[] = [
        ...(quizzes ?? []).filter(q => q.published).map(q => ({
          key: `q:${q.id}`, id: q.id, name: q.title, type: 'quiz' as const,
          due: fmtDue(q.due_at), pts: Number(q.total_points ?? 0),
        })),
        ...(assignments ?? []).filter(a => a.published).map(a => ({
          key: `a:${a.id}`, id: a.id, name: a.title, type: 'assignment' as const,
          due: fmtDue(a.due_at), pts: Number(a.points ?? 0),
        })),
      ].sort((x, y) => natural(x.name, y.name));

      const map: Record<string, Record<string, boolean>> = {};
      if (uids.length && items.length) {
        const quizIds = items.filter(i => i.type === 'quiz').map(i => i.id);
        const asgnIds = items.filter(i => i.type === 'assignment').map(i => i.id);
        const [{ data: attempts }, { data: subs }] = await Promise.all([
          quizIds.length
            ? supabase.from('quiz_attempts').select('quiz_id, user_id, submitted_at').in('quiz_id', quizIds)
            : Promise.resolve({ data: [] }),
          asgnIds.length
            ? supabase.from('submissions').select('assignment_id, user_id').in('assignment_id', asgnIds)
            : Promise.resolve({ data: [] }),
        ]);
        (attempts ?? []).forEach(a => {
          if (!a.submitted_at) return;
          map[a.user_id] = map[a.user_id] || {};
          map[a.user_id][`q:${a.quiz_id}`] = true;
        });
        (subs ?? []).forEach(s => {
          map[s.user_id] = map[s.user_id] || {};
          map[s.user_id][`a:${s.assignment_id}`] = true;
        });
      }

      if (cancelled) return;
      setStudents(roster);
      setWork(items);
      setCompletion(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  const doneCount = (u: string) => work.filter(w => completion[u]?.[w.key]).length;
  const totalPts  = (u: string) => work.filter(w => completion[u]?.[w.key]).reduce((s, w) => s + w.pts, 0);

  const sel = students.find(s => s.userId === selStudent) || null;
  const visible = useMemo(() => work.filter(w => {
    if (!sel) return true;
    if (filter === 'missing')  return !completion[sel.userId]?.[w.key];
    if (filter === 'complete') return !!completion[sel.userId]?.[w.key];
    return true;
  }), [work, sel, filter, completion]);

  const exportCSV = () => {
    const headers = ['Student', 'Done', 'Missing', 'Progress %', 'Points Earned', ...work.map(w => `${w.name} (${w.due})`)];
    const rows = students.map(s => {
      const done = doneCount(s.userId);
      const pct = work.length ? Math.round((done / work.length) * 100) : 0;
      return [s.name, done, work.length - done, pct, totalPts(s.userId), ...work.map(w => completion[s.userId]?.[w.key] ? '✓' : '')];
    });
    const csv = [headers, ...rows].map(r => r.map(cell => {
      const v = String(cell ?? '');
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `required-work-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding:24, color:C.muted, fontFamily:'sans-serif' }}>Loading required work…</div>;

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Required Work</h2>
        <button onClick={exportCSV} disabled={!students.length}
          style={{ padding:'7px 16px', border:'none', borderRadius:5, background:students.length ? C.primary : C.border, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:students.length ? 'pointer' : 'default' }}>
          Export Report
        </button>
      </div>

      {!students.length ? (
        <div style={{ background:C.white, border:`1px dashed ${C.border}`, borderRadius:8, padding:32, textAlign:'center', fontFamily:'sans-serif' }}>
          <div style={{ fontSize:30, marginBottom:8 }}>👥</div>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>No students enrolled yet</div>
          <div style={{ fontSize:13, color:C.muted }}>
            This tab fills in automatically as students are enrolled in this cohort. Their required quizzes,
            case studies and assignments are tracked here the moment they submit.
          </div>
        </div>
      ) : !work.length ? (
        <div style={{ background:C.white, border:`1px dashed ${C.border}`, borderRadius:8, padding:32, textAlign:'center', fontFamily:'sans-serif', color:C.muted, fontSize:13 }}>
          No published quizzes or assignments in this course yet — publish work and it will appear here.
        </div>
      ) : (
        <>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', marginBottom:20 }}>
            <div style={{ padding:'10px 16px', background:'#F0EDF7', borderBottom:`1px solid ${C.border}`, fontWeight:700, fontSize:13, fontFamily:'sans-serif', color:C.text }}>
              Completion Overview · {work.length} required items
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ borderCollapse:'collapse', fontFamily:'sans-serif', width:'100%' }}>
                <thead>
                  <tr>
                    <th style={{ padding:'8px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:C.text, borderBottom:`1px solid ${C.border}`, minWidth:170 }}>Student</th>
                    <th style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600, color:C.muted, borderBottom:`1px solid ${C.border}` }}>Done</th>
                    <th style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600, color:C.muted, borderBottom:`1px solid ${C.border}` }}>Missing</th>
                    <th style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600, color:C.muted, borderBottom:`1px solid ${C.border}` }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const done = doneCount(s.userId);
                    const pct = work.length ? Math.round((done / work.length) * 100) : 0;
                    return (
                      <tr key={s.userId} style={{ background: i % 2 === 0 ? C.white : '#FDFCFF', cursor:'pointer' }}
                        onClick={() => setSelStudent(selStudent === s.userId ? '' : s.userId)}>
                        <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color: selStudent === s.userId ? C.primary : C.text, borderBottom:`1px solid ${C.border}` }}>{s.name}</td>
                        <td style={{ padding:'9px 10px', textAlign:'center', fontSize:13, color:C.success, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{done}</td>
                        <td style={{ padding:'9px 10px', textAlign:'center', fontSize:13, color:work.length - done > 0 ? C.error : C.muted, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{work.length - done}</td>
                        <td style={{ padding:'9px 14px', borderBottom:`1px solid ${C.border}`, minWidth:120 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, height:6, borderRadius:3, background:C.border, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${pct}%`, background: pct >= 80 ? C.success : pct >= 50 ? C.warn : C.error, transition:'width .3s' }}/>
                            </div>
                            <span style={{ fontSize:11, color:C.muted, width:34 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {sel && (
            <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:8, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', background:'#EDE8F7', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.text, fontFamily:'sans-serif' }}>{sel.name} — Work Detail</span>
                <div style={{ display:'flex', gap:6 }}>
                  {([['all','All'],['missing','Missing'],['complete','Complete']] as const).map(([k,l]) => (
                    <button key={k} onClick={() => setFilter(k)}
                      style={{ padding:'4px 12px', border:`1px solid ${filter === k ? C.primary : C.border}`, borderRadius:20, background:filter === k ? C.primary : C.white, color:filter === k ? 'white' : C.text, fontSize:11, fontFamily:'sans-serif', cursor:'pointer' }}>{l}</button>
                  ))}
                </div>
              </div>
              {visible.map(w => {
                const done = !!completion[sel.userId]?.[w.key];
                return (
                  <div key={w.key} style={{ padding:'11px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
                    <div aria-hidden style={{ width:22, height:22, borderRadius:4, border:`2px solid ${done ? C.success : C.border}`, background:done ? C.success : 'transparent', flexShrink:0, fontSize:12, color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {done ? '✓' : ''}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:C.text, fontFamily:'sans-serif' }}>{w.name}</div>
                      <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{w.type} • Due: {w.due}{w.pts > 0 ? ` • ${w.pts} pts` : ''}</div>
                    </div>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:done ? '#e8f5e9' : '#fdecea', color:done ? C.success : C.error, fontFamily:'sans-serif', fontWeight:600 }}>
                      {done ? 'Complete' : 'Missing'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RequiredWork;
