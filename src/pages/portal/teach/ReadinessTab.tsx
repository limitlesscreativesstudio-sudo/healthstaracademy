// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isAttended } from '@/lib/attendance';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Props { courseId?: string; canEdit?: boolean; }

const CRITERIA = [
  { id:'attendance', label:'Attendance ≥ 90%', weight:15 },
  { id:'theory',     label:'Final Exam Passed (≥75%)', weight:20 },
  { id:'skills',     label:'Clinical Skills Complete', weight:25 },
  { id:'modules',    label:'All Module Quizzes Passed', weight:20 },
  { id:'casestudy',  label:'Case Studies Submitted', weight:10 },
  { id:'paperwork',  label:'Assignments Submitted', weight:10 },
];

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

const ReadinessTab: React.FC<Props> = ({ courseId }) => {
  const [rows, setRows] = useState<{ userId: string; name: string; met: Record<string, boolean> }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'ready'|'not'>('all');

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: enrs }, { data: quizzes }, { data: assignments }, { data: skills }] = await Promise.all([
        supabase.from('enrollments').select('user_id').eq('course_id', courseId).eq('role', 'student'),
        supabase.from('quizzes').select('id, title, published').eq('course_id', courseId),
        supabase.from('assignments').select('id, published').eq('course_id', courseId),
        supabase.from('cna_skills').select('id').eq('active', true),
      ]);

      const uids = (enrs ?? []).map(e => e.user_id);
      if (!uids.length) { if (!cancelled) { setRows([]); setLoading(false); } return; }

      const quizList  = (quizzes ?? []).filter(q => q.published);
      const quizIds   = quizList.map(q => q.id);
      const finalIds  = quizList.filter(q => /final exam/i.test(q.title)).map(q => q.id);
      const caseIds   = quizList.filter(q => /case study/i.test(q.title)).map(q => q.id);
      const moduleIds = quizList.filter(q => /module|day/i.test(q.title)).map(q => q.id);
      const asgnIds   = (assignments ?? []).filter(a => a.published).map(a => a.id);
      const skillTotal = (skills ?? []).length;

      const [{ data: profs }, { data: attempts }, { data: subs }, { data: att }, { data: sos }] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name').in('user_id', uids),
        quizIds.length ? supabase.from('quiz_attempts').select('quiz_id, user_id, score, max_score, submitted_at').in('quiz_id', quizIds) : Promise.resolve({ data: [] }),
        asgnIds.length ? supabase.from('submissions').select('assignment_id, user_id').in('assignment_id', asgnIds) : Promise.resolve({ data: [] }),
        supabase.from('attendance').select('student_id, status').eq('course_id', courseId),
        supabase.from('student_skill_signoffs').select('student_user_id, skill_id, status').eq('course_id', courseId),
      ]);

      const nameBy: Record<string, string> = {};
      (profs ?? []).forEach(p => { nameBy[p.user_id] = p.full_name || 'Student'; });

      const pctBy: Record<string, Record<string, number>> = {};
      (attempts ?? []).forEach(a => {
        if (!a.submitted_at || !a.max_score) return;
        const pct = Number(a.score ?? 0) / Number(a.max_score);
        pctBy[a.user_id] = pctBy[a.user_id] || {};
        pctBy[a.user_id][a.quiz_id] = Math.max(pctBy[a.user_id][a.quiz_id] ?? 0, pct);
      });

      const subsBy: Record<string, Set<string>> = {};
      (subs ?? []).forEach(s => {
        (subsBy[s.user_id] = subsBy[s.user_id] || new Set()).add(s.assignment_id);
      });

      const attBy: Record<string, { present: number; total: number }> = {};
      (att ?? []).forEach(a => {
        const r = attBy[a.student_id] = attBy[a.student_id] || { present: 0, total: 0 };
        r.total += 1;
        if (isAttended(a.status)) r.present += 1;
      });

      const skillBy: Record<string, number> = {};
      (sos ?? []).forEach(s => {
        if (s.status === 'completed' || s.status === 'signed_off' || s.status === 'pass') {
          skillBy[s.student_user_id] = (skillBy[s.student_user_id] ?? 0) + 1;
        }
      });

      const built = uids.map(u => {
        const p = pctBy[u] ?? {};
        const a = attBy[u];
        return {
          userId: u,
          name: nameBy[u] || 'Student',
          met: {
            attendance: !!a && a.total > 0 && a.present / a.total >= 0.9,
            theory:     finalIds.length > 0 && finalIds.every(id => (p[id] ?? 0) >= 0.75),
            skills:     skillTotal > 0 && (skillBy[u] ?? 0) >= skillTotal,
            modules:    moduleIds.length > 0 && moduleIds.every(id => (p[id] ?? 0) >= 0.75),
            casestudy:  caseIds.length > 0 && caseIds.every(id => p[id] !== undefined),
            paperwork:  asgnIds.length > 0 && asgnIds.every(id => subsBy[u]?.has(id)),
          },
        };
      }).sort((x, y) => natural(x.name, y.name));

      if (cancelled) return;
      setRows(built);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  const isReady = (r: typeof rows[number]) => CRITERIA.every(c => r.met[c.id]);
  const filtered = rows.filter(r => filter === 'all' ? true : filter === 'ready' ? isReady(r) : !isReady(r));
  const readyCount = rows.filter(isReady).length;

  const exportCSV = () => {
    const headers = ['Student', ...CRITERIA.map(c => c.label), 'Status'];
    const data = rows.map(r => [r.name, ...CRITERIA.map(c => r.met[c.id] ? 'Yes' : 'No'), isReady(r) ? 'Ready' : 'Pending']);
    const csv = [headers, ...data].map(x => x.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : v).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `exam-readiness-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding:24, color:C.muted, fontFamily:'sans-serif' }}>Loading readiness…</div>;

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>State Exam Readiness</h2>
        <button onClick={exportCSV} disabled={!rows.length}
          style={{ padding:'7px 16px', border:'none', borderRadius:5, background:rows.length ? C.primary : C.border, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:rows.length ? 'pointer' : 'default' }}>
          Export Report
        </button>
      </div>

      {!rows.length ? (
        <div style={{ background:C.white, border:`1px dashed ${C.border}`, borderRadius:8, padding:32, textAlign:'center', fontFamily:'sans-serif' }}>
          <div style={{ fontSize:30, marginBottom:8 }}>🎓</div>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>No students enrolled yet</div>
          <div style={{ fontSize:13, color:C.muted }}>
            Readiness is calculated automatically for each student once they're enrolled in this cohort —
            attendance, final exam, clinical skills, module quizzes, case studies and assignments.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
            {[
              ['Total Students', String(rows.length), C.primary, '👥'],
              ['Ready for Exam', String(readyCount), C.success, '✅'],
              ['Not Yet Ready', String(rows.length - readyCount), C.error, '⚠️'],
            ].map(([label, val, color, icon]) => (
              <div key={label as string} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:16 }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:24, fontWeight:800, color:color as string, fontFamily:'sans-serif' }}>{val}</div>
                <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:6, marginBottom:16 }}>
            {([['all','All Students'],['ready','Ready'],['not','Not Ready']] as const).map(([k,l]) => (
              <button key={k} onClick={() => setFilter(k)}
                style={{ padding:'6px 16px', border:`1px solid ${filter === k ? C.primary : C.border}`, borderRadius:20, background:filter === k ? C.primary : C.white, color:filter === k ? 'white' : C.text, fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
            <div style={{ background:'#F0EDF7', padding:'10px 16px', display:'flex', gap:8, alignItems:'center', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:180, fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Student</div>
              {CRITERIA.map(c => (
                <div key={c.id} style={{ flex:1, fontSize:10, fontWeight:600, color:C.text, fontFamily:'sans-serif', textAlign:'center', lineHeight:1.3 }}>
                  {c.label}<br/><span style={{ color:C.muted, fontWeight:400 }}>{c.weight}%</span>
                </div>
              ))}
              <div style={{ width:80, fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', textAlign:'center' }}>Status</div>
            </div>

            {filtered.map((r, i) => {
              const ready = isReady(r);
              return (
                <div key={r.userId} style={{ padding:'10px 16px', display:'flex', gap:8, alignItems:'center', borderBottom:`1px solid ${C.border}`, background: i % 2 === 0 ? C.white : '#FDFCFF' }}>
                  <div style={{ width:180, fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>{r.name}</div>
                  {CRITERIA.map(c => (
                    <div key={c.id} style={{ flex:1, textAlign:'center' }}>
                      <span role="img" aria-label={`${c.label}: ${r.met[c.id] ? 'met' : 'not met'}`}
                        style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:4, border:`2px solid ${r.met[c.id] ? C.success : C.border}`, background:r.met[c.id] ? C.success : 'transparent', fontSize:13, color:'white' }}>
                        {r.met[c.id] ? '✓' : ''}
                      </span>
                    </div>
                  ))}
                  <div style={{ width:80, textAlign:'center' }}>
                    <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:ready ? '#e8f5e9' : '#fdecea', color:ready ? C.success : C.error, fontFamily:'sans-serif', fontWeight:700 }}>
                      {ready ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ReadinessTab;
