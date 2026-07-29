// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './AuthContext';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#6B5C8A', success:'#127A1B', error:'#C0392B', warn:'#B35C00' } as const;

interface Props { courseId?: string; canEdit?: boolean; }

type Row = {
  id: string;
  name: string;
  submitted: number;
  graded: number;
  quizAttempts: number;
  points: number;
  pct: number | null;
  lastActive: string | null;
};

const pctColor = (p: number | null) => p == null ? C.muted : p >= 80 ? C.success : p >= 70 ? C.warn : C.error;

const Bar: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = C.primary }) => (
  <div style={{ background:'#EDE8F7', borderRadius:4, height:8, width:'100%', overflow:'hidden' }}>
    <div style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`, background: color, height:'100%' }} />
  </div>
);

const Stat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:'14px 16px', minWidth:150, flex:'1 1 150px' }}>
    <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{label}</div>
    <div style={{ fontSize:24, fontWeight:700, color:C.text, fontFamily:'sans-serif', lineHeight:1.2 }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{sub}</div>}
  </div>
);

const AnalyticsTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [items, setItems] = useState<Array<{ id:string; title:string; kind:'assignment'|'quiz'; points:number; done:number; avgPct:number|null }>>([]);
  const [totals, setTotals] = useState({ students:0, assignments:0, quizzes:0, discussions:0, needsGrading:0, totalPoints:0 });

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!courseId) { setLoading(false); return; }
      setLoading(true);

      const { data: enrs } = await supabase.from('enrollments')
        .select('user_id').eq('course_id', courseId).eq('role', 'student');
      const uids = (enrs ?? []).map((e:any) => e.user_id);

      const [{ data: profs }, { data: asgns }, { data: qzs }, { data: discs }] = await Promise.all([
        uids.length ? supabase.from('profiles').select('user_id, full_name').in('user_id', uids) : Promise.resolve({ data: [] }),
        supabase.from('assignments').select('id,title,points').eq('course_id', courseId),
        supabase.from('quizzes').select('id,title,total_points').eq('course_id', courseId),
        supabase.from('discussions').select('id').eq('course_id', courseId),
      ]);

      const asgnIds = (asgns ?? []).map((a:any) => a.id);
      const qzIds = (qzs ?? []).map((q:any) => q.id);

      const [{ data: subs }, { data: gradeRows }, { data: attempts }] = await Promise.all([
        asgnIds.length ? supabase.from('submissions').select('assignment_id,user_id,submitted_at').in('assignment_id', asgnIds) : Promise.resolve({ data: [] }),
        asgnIds.length ? supabase.from('grades').select('assignment_id,user_id,score,graded_at').in('assignment_id', asgnIds) : Promise.resolve({ data: [] }),
        qzIds.length ? supabase.from('quiz_attempts').select('quiz_id,user_id,score,submitted_at').in('quiz_id', qzIds).not('submitted_at','is',null) : Promise.resolve({ data: [] }),
      ]);

      if (!alive) return;

      const nameOf: Record<string,string> = {};
      (profs ?? []).forEach((p:any) => { nameOf[p.user_id] = p.full_name || 'Student'; });

      const totalPoints =
        (asgns ?? []).reduce((s:number,a:any) => s + Number(a.points ?? 0), 0) +
        (qzs ?? []).reduce((s:number,q:any) => s + Number(q.total_points ?? 0), 0);

      const bestAttempt: Record<string, { score:number; at:string }> = {};
      (attempts ?? []).forEach((a:any) => {
        const k = `${a.user_id}|${a.quiz_id}`;
        const s = Number(a.score ?? 0);
        if (!bestAttempt[k] || s > bestAttempt[k].score) bestAttempt[k] = { score:s, at:a.submitted_at };
      });

      const built: Row[] = uids.map((uid:string) => {
        const mySubs = (subs ?? []).filter((s:any) => s.user_id === uid);
        const myGrades = (gradeRows ?? []).filter((g:any) => g.user_id === uid);
        const myAttempts = Object.keys(bestAttempt).filter(k => k.startsWith(`${uid}|`)).map(k => bestAttempt[k]);
        const pts =
          myGrades.reduce((s:number,g:any) => s + Number(g.score ?? 0), 0) +
          myAttempts.reduce((s:number,a:any) => s + Number(a.score ?? 0), 0);
        const stamps = [
          ...mySubs.map((s:any) => s.submitted_at),
          ...myGrades.map((g:any) => g.graded_at),
          ...myAttempts.map((a:any) => a.at),
        ].filter(Boolean).sort();
        return {
          id: uid,
          name: nameOf[uid] ?? 'Student',
          submitted: mySubs.length,
          graded: myGrades.length,
          quizAttempts: myAttempts.length,
          points: pts,
          pct: totalPoints > 0 ? Math.round((pts / totalPoints) * 100) : null,
          lastActive: stamps.length ? stamps[stamps.length - 1] : null,
        };
      }).sort((a,b) => (b.pct ?? -1) - (a.pct ?? -1));

      const itemStats = [
        ...(asgns ?? []).map((a:any) => {
          const gs = (gradeRows ?? []).filter((g:any) => g.assignment_id === a.id && g.score != null);
          const pts = Number(a.points ?? 0);
          const avg = gs.length ? gs.reduce((s:number,g:any) => s + Number(g.score), 0) / gs.length : null;
          return { id:a.id, title:a.title, kind:'assignment' as const, points:pts, done:gs.length, avgPct: avg != null && pts > 0 ? Math.round((avg/pts)*100) : null };
        }),
        ...(qzs ?? []).map((q:any) => {
          const at = Object.entries(bestAttempt).filter(([k]) => k.endsWith(`|${q.id}`)).map(([,v]) => v);
          const pts = Number(q.total_points ?? 0);
          const avg = at.length ? at.reduce((s:number,v:any) => s + v.score, 0) / at.length : null;
          return { id:q.id, title:q.title, kind:'quiz' as const, points:pts, done:at.length, avgPct: avg != null && pts > 0 ? Math.round((avg/pts)*100) : null };
        }),
      ].sort((a,b) => a.title.localeCompare(b.title, undefined, { numeric:true, sensitivity:'base' }));

      const gradedKeys = new Set((gradeRows ?? []).map((g:any) => `${g.user_id}|${g.assignment_id}`));
      const needsGrading = (subs ?? []).filter((s:any) => !gradedKeys.has(`${s.user_id}|${s.assignment_id}`)).length;

      setRows(built);
      setItems(itemStats);
      setTotals({
        students: uids.length,
        assignments: (asgns ?? []).length,
        quizzes: (qzs ?? []).length,
        discussions: (discs ?? []).length,
        needsGrading,
        totalPoints,
      });
      setLoading(false);
    };
    run();
    return () => { alive = false; };
  }, [courseId]);

  const classAvg = useMemo(() => {
    const vals = rows.map(r => r.pct).filter(v => v != null) as number[];
    return vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : null;
  }, [rows]);

  const atRisk = rows.filter(r => (r.pct ?? 0) < 70);
  const inactive = rows.filter(r => !r.lastActive || (Date.now() - new Date(r.lastActive).getTime()) > 7 * 864e5);

  if (!canEdit) {
    return <div style={{ padding:32, color:C.muted, fontFamily:'sans-serif' }}>Analytics are available to instructors only.</div>;
  }
  if (!courseId) return <div style={{ padding:32, color:C.muted, fontFamily:'sans-serif' }}>Open a course to view analytics.</div>;
  if (loading) return <div style={{ padding:32, color:C.muted, fontFamily:'sans-serif' }} role="status">Loading analytics…</div>;

  return (
    <div style={{ padding:24, fontFamily:'sans-serif' }}>
      <h2 style={{ margin:'0 0 16px', fontSize:20, fontWeight:700, color:C.text }}>Course Analytics</h2>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
        <Stat label="Students" value={String(totals.students)} />
        <Stat label="Class average" value={classAvg != null ? `${classAvg}%` : '—'} sub={`${totals.totalPoints} pts possible`} />
        <Stat label="Needs grading" value={String(totals.needsGrading)} sub="ungraded submissions" />
        <Stat label="At risk (<70%)" value={String(atRisk.length)} />
        <Stat label="Inactive 7+ days" value={String(inactive.length)} />
        <Stat label="Graded items" value={String(totals.assignments + totals.quizzes)} sub={`${totals.assignments} assignments · ${totals.quizzes} quizzes`} />
      </div>

      <section aria-labelledby="an-students" style={{ marginBottom:24 }}>
        <h3 id="an-students" style={{ fontSize:15, fontWeight:700, color:C.text, margin:'0 0 8px' }}>Student performance</h3>
        <div style={{ overflowX:'auto', border:`1px solid ${C.border}`, borderRadius:6, background:C.white }}>
          <table style={{ borderCollapse:'collapse', width:'100%', minWidth:640 }}>
            <caption className="sr-only">Per-student grade percentage, submissions and last activity</caption>
            <thead>
              <tr style={{ background:'#F0EDF7' }}>
                <th scope="col" style={{ textAlign:'left', padding:'9px 12px', fontSize:12 }}>Student</th>
                <th scope="col" style={{ textAlign:'left', padding:'9px 12px', fontSize:12, minWidth:160 }}>Grade</th>
                <th scope="col" style={{ textAlign:'center', padding:'9px 12px', fontSize:12 }}>Submissions</th>
                <th scope="col" style={{ textAlign:'center', padding:'9px 12px', fontSize:12 }}>Quiz attempts</th>
                <th scope="col" style={{ textAlign:'left', padding:'9px 12px', fontSize:12 }}>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5} style={{ padding:20, textAlign:'center', color:C.muted, fontSize:13 }}>No students enrolled yet.</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.id} style={{ borderTop:`1px solid ${C.border}` }}>
                  <th scope="row" style={{ textAlign:'left', padding:'9px 12px', fontSize:13, fontWeight:600, color:C.text }}>{r.name}</th>
                  <td style={{ padding:'9px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:pctColor(r.pct), width:44 }}>{r.pct != null ? `${r.pct}%` : '—'}</span>
                      <Bar value={r.pct ?? 0} max={100} color={pctColor(r.pct)} />
                    </div>
                  </td>
                  <td style={{ padding:'9px 12px', textAlign:'center', fontSize:13 }}>{r.submitted}</td>
                  <td style={{ padding:'9px 12px', textAlign:'center', fontSize:13 }}>{r.quizAttempts}</td>
                  <td style={{ padding:'9px 12px', fontSize:12, color:C.muted }}>
                    {r.lastActive ? new Date(r.lastActive).toLocaleDateString() : 'No activity'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="an-items">
        <h3 id="an-items" style={{ fontSize:15, fontWeight:700, color:C.text, margin:'0 0 8px' }}>Item difficulty & completion</h3>
        <div style={{ overflowX:'auto', border:`1px solid ${C.border}`, borderRadius:6, background:C.white }}>
          <table style={{ borderCollapse:'collapse', width:'100%', minWidth:640 }}>
            <caption className="sr-only">Average score and completion count per assignment or quiz</caption>
            <thead>
              <tr style={{ background:'#F0EDF7' }}>
                <th scope="col" style={{ textAlign:'left', padding:'9px 12px', fontSize:12 }}>Item</th>
                <th scope="col" style={{ textAlign:'left', padding:'9px 12px', fontSize:12 }}>Type</th>
                <th scope="col" style={{ textAlign:'center', padding:'9px 12px', fontSize:12 }}>Points</th>
                <th scope="col" style={{ textAlign:'center', padding:'9px 12px', fontSize:12 }}>Completed</th>
                <th scope="col" style={{ textAlign:'left', padding:'9px 12px', fontSize:12, minWidth:160 }}>Average</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ padding:20, textAlign:'center', color:C.muted, fontSize:13 }}>No assignments or quizzes yet.</td></tr>
              )}
              {items.map(it => (
                <tr key={`${it.kind}-${it.id}`} style={{ borderTop:`1px solid ${C.border}` }}>
                  <th scope="row" style={{ textAlign:'left', padding:'9px 12px', fontSize:13, fontWeight:600, color:C.text }}>{it.title}</th>
                  <td style={{ padding:'9px 12px', fontSize:12, color:C.muted }}>{it.kind === 'quiz' ? 'Quiz' : 'Assignment'}</td>
                  <td style={{ padding:'9px 12px', textAlign:'center', fontSize:13 }}>{it.points}</td>
                  <td style={{ padding:'9px 12px', textAlign:'center', fontSize:13 }}>{it.done}/{totals.students}</td>
                  <td style={{ padding:'9px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:pctColor(it.avgPct), width:44 }}>{it.avgPct != null ? `${it.avgPct}%` : '—'}</span>
                      <Bar value={it.avgPct ?? 0} max={100} color={pctColor(it.avgPct)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsTab;
