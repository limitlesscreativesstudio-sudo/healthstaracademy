// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './AuthContext';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', warn:'#E67E22', error:'#C0392B' } as const;

// CNA regulatory milestones (CDPH / California)
const REG = {
  theoryHoursRequired: 60,      // classroom hours
  clinicalHoursRequired: 100,   // clinical hands-on
  skillsRequired: 22,           // 22 CDPH skill checkoffs
  quizPassPct: 75,              // 75% minimum
  attendanceMinPct: 90,         // 90% minimum
};

interface Props { courseId?: string; }

interface Row {
  userId: string;
  name: string;
  initials: string;
  modulesPct: number;
  assignmentsPct: number;
  quizPct: number;
  quizPassed: number;
  quizTotal: number;
  attendancePct: number;
  clinicalHours: number;
  skillsSigned: number;
  overallPct: number;
  atRisk: boolean;
}

const bar = (pct: number, color: string) => (
  <div style={{ background:'#EDE8F7', borderRadius:3, height:6, overflow:'hidden' }}>
    <div style={{ width:`${Math.min(100, Math.max(0, pct))}%`, background:color, height:'100%', transition:'width .3s' }}/>
  </div>
);

const pctColor = (p: number) => p >= 85 ? C.success : p >= 70 ? C.warn : C.error;

const StudentProgress: React.FC<Props> = ({ courseId }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'atRisk'|'onTrack'>('all');
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<{ userId: string; name: string } | null>(null);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      // enrollments
      const { data: enrs } = await supabase.from('enrollments')
        .select('user_id, role').eq('course_id', courseId).eq('role', 'student');
      const uids = (enrs ?? []).map(e => e.user_id);
      if (!uids.length) { setRows([]); setLoading(false); return; }
      const { data: profs } = await supabase.from('profiles').select('user_id, full_name').in('user_id', uids);
      const nameById: Record<string, string> = {};
      (profs ?? []).forEach(p => { nameById[p.user_id] = p.full_name || 'Student'; });

      // modules/items for course
      const { data: mods } = await supabase.from('modules').select('id').eq('course_id', courseId);
      const modIds = (mods ?? []).map(m => m.id);
      const { data: items } = modIds.length
        ? await supabase.from('module_items').select('id, module_id, item_type').in('module_id', modIds)
        : { data: [] };
      const totalItems = (items ?? []).length;

      // assignments + grades
      const { data: asgn } = await supabase.from('assignments').select('id, points').eq('course_id', courseId);
      const asgnIds = (asgn ?? []).map(a => a.id);
      const { data: grades } = asgnIds.length
        ? await supabase.from('grades').select('user_id, assignment_id, score, max_score').in('assignment_id', asgnIds)
        : { data: [] };

      // quizzes + best attempts
      const { data: qzs } = await supabase.from('quizzes').select('id, total_points').eq('course_id', courseId);
      const qzIds = (qzs ?? []).map(q => q.id);
      const qzMap: Record<string, number> = Object.fromEntries((qzs ?? []).map(q => [q.id, Number(q.total_points ?? 0)]));
      const { data: attempts } = qzIds.length
        ? await supabase.from('quiz_attempts').select('user_id, quiz_id, score, submitted_at').in('quiz_id', qzIds).not('submitted_at','is',null)
        : { data: [] };
      // best per user/quiz
      const bestByUserQuiz: Record<string, number> = {};
      (attempts ?? []).forEach(a => {
        const k = `${a.user_id}|${a.quiz_id}`;
        const s = Number(a.score ?? 0);
        if (bestByUserQuiz[k] == null || s > bestByUserQuiz[k]) bestByUserQuiz[k] = s;
      });

      // attendance (column is student_id)
      const { data: att } = await supabase.from('attendance').select('student_id, status').eq('course_id', courseId);
      const attByUser: Record<string, { present: number; total: number }> = {};
      (att ?? []).forEach(a => {
        const b = attByUser[a.student_id] ?? { present:0, total:0 };
        b.total += 1;
        if (a.status === 'present' || a.status === 'late') b.present += 1;
        attByUser[a.student_id] = b;
      });

      // clinical hours (column is student_user_id)
      const { data: chs } = await supabase.from('clinical_hours')
        .select('student_user_id, hours').in('student_user_id', uids);
      const clinicalByUser: Record<string, number> = {};
      (chs ?? []).forEach(c => {
        clinicalByUser[c.student_user_id] = (clinicalByUser[c.student_user_id] ?? 0) + Number(c.hours ?? 0);
      });

      // skill signoffs (column is student_user_id)
      const { data: sks } = await supabase.from('student_skill_signoffs')
        .select('student_user_id, status').in('student_user_id', uids);
      const skillsByUser: Record<string, number> = {};
      (sks ?? []).forEach(s => {
        if (s.status === 'signed' || s.status === 'completed' || s.status === 'passed') {
          skillsByUser[s.student_user_id] = (skillsByUser[s.student_user_id] ?? 0) + 1;
        }
      });

      // (module completion tracking not yet stored) — approximate via graded assignments as proxy
      const built: Row[] = uids.map(uid => {
        const asgnGrades = (grades ?? []).filter(g => g.user_id === uid);
        const asgnTotal = (asgn ?? []).reduce((s, a) => s + Number(a.points ?? 0), 0);
        const asgnScore = asgnGrades.reduce((s, g) => s + Number(g.score ?? 0), 0);
        const asgnPct = asgnTotal > 0 ? Math.round((asgnScore / asgnTotal) * 100) : 0;

        let quizPassed = 0;
        (qzs ?? []).forEach(q => {
          const best = bestByUserQuiz[`${uid}|${q.id}`];
          if (best != null && qzMap[q.id] > 0 && (best / qzMap[q.id]) * 100 >= REG.quizPassPct) quizPassed += 1;
        });
        const quizPct = (qzs ?? []).length ? Math.round((quizPassed / (qzs ?? []).length) * 100) : 0;

        const attRec = attByUser[uid] ?? { present:0, total:0 };
        const attPct = attRec.total > 0 ? Math.round((attRec.present / attRec.total) * 100) : 0;

        const clinical = clinicalByUser[uid] ?? 0;
        const skills = skillsByUser[uid] ?? 0;

        // Overall = weighted average of milestones vs regulatory targets
        const modPct = totalItems > 0 ? Math.min(100, Math.round((asgnGrades.length / totalItems) * 100)) : 0;
        const clinicalPct = Math.min(100, Math.round((clinical / REG.clinicalHoursRequired) * 100));
        const skillsPct = Math.min(100, Math.round((skills / REG.skillsRequired) * 100));
        const overallPct = Math.round((modPct + asgnPct + quizPct + attPct + clinicalPct + skillsPct) / 6);

        const atRisk = attPct < REG.attendanceMinPct || quizPct < 60 || clinicalPct < 50 || skillsPct < 50;

        return {
          userId: uid,
          name: nameById[uid] || 'Student',
          initials: (nameById[uid] || 'S').split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase(),
          modulesPct: modPct,
          assignmentsPct: asgnPct,
          quizPct, quizPassed, quizTotal: (qzs ?? []).length,
          attendancePct: attPct,
          clinicalHours: clinical,
          skillsSigned: skills,
          overallPct,
          atRisk,
        };
      });
      built.sort((a,b) => b.overallPct - a.overallPct);
      setRows(built);
      setLoading(false);
    })();
  }, [courseId, tick]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (filter === 'atRisk' && !r.atRisk) return false;
      if (filter === 'onTrack' && r.atRisk) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, filter, search]);

  const cohortStats = useMemo(() => {
    if (!rows.length) return null;
    const avg = (k: keyof Row) => Math.round(rows.reduce((s, r) => s + (r[k] as number), 0) / rows.length);
    return {
      overall: avg('overallPct'),
      attendance: avg('attendancePct'),
      clinical: avg('clinicalHours' as any),
      skills: avg('skillsSigned' as any),
      atRisk: rows.filter(r => r.atRisk).length,
    };
  }, [rows]);

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Select a course.</div>;
  if (loading) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading progress dashboard…</div>;

  return (
    <div style={{ padding:24, fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text }}>Student Progress Dashboard</h2>
          <p style={{ margin:'4px 0 0', fontSize:12, color:C.muted }}>CNA program milestones tracked against CDPH regulatory targets ({REG.theoryHoursRequired}h theory, {REG.clinicalHoursRequired}h clinical, {REG.skillsRequired} skills, {REG.quizPassPct}% quiz pass, {REG.attendanceMinPct}% attendance).</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, minWidth:160 }}/>
          {(['all','onTrack','atRisk'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'5px 12px', border:`1px solid ${filter===f?C.primary:C.border}`, borderRadius:20, background:filter===f?C.primary:C.white, color:filter===f?'white':C.text, fontSize:11, cursor:'pointer' }}>
              {f === 'all' ? 'All' : f === 'atRisk' ? 'At Risk' : 'On Track'}
            </button>
          ))}
          <button onClick={() => setTick(t => t + 1)}
            style={{ padding:'5px 12px', border:`1px solid ${C.border}`, borderRadius:20, background:C.white, color:C.text, fontSize:11, cursor:'pointer' }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {cohortStats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'Cohort Overall', val:`${cohortStats.overall}%`, color: pctColor(cohortStats.overall) },
            { label:'Avg Attendance', val:`${cohortStats.attendance}%`, color: pctColor(cohortStats.attendance) },
            { label:'Avg Clinical Hrs', val:`${cohortStats.clinical}/${REG.clinicalHoursRequired}`, color: C.accent },
            { label:'Avg Skills Signed', val:`${cohortStats.skills}/${REG.skillsRequired}`, color: C.primary },
            { label:'At-Risk Students', val:String(cohortStats.atRisk), color: cohortStats.atRisk > 0 ? C.error : C.success },
          ].map(s => (
            <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:14 }}>
              <div style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontWeight:600 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.color, marginTop:4 }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}`, color:C.muted }}>
          No students match your filters.
        </div>
      ) : (
        <div style={{ display:'grid', gap:10 }}>
          {filtered.map(r => (
            <div key={r.userId} role="button" tabIndex={0}
              onClick={() => setSelected({ userId: r.userId, name: r.name })}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelected({ userId: r.userId, name: r.name }); }}
              title="Open full student record"
              style={{ background:C.white, border:`1px solid ${C.border}`, borderLeft:`4px solid ${r.atRisk ? C.error : pctColor(r.overallPct)}`, borderRadius:8, padding:16, cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#9B6DD0', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{r.initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:C.primary, fontSize:14 }}>{r.name}</div>
                  <div style={{ fontSize:11, color:C.muted }}>
                    {r.atRisk ? <span style={{ color:C.error, fontWeight:600 }}>⚠ At Risk</span> : <span style={{ color:C.success, fontWeight:600 }}>✓ On Track</span>}
                    {' · '}Overall {r.overallPct}%
                  </div>
                </div>
                <div style={{ fontSize:26, fontWeight:700, color:pctColor(r.overallPct) }}>{r.overallPct}%</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
                {[
                  { label:'Modules', pct:r.modulesPct, sub:`${r.modulesPct}% items graded` },
                  { label:'Assignments', pct:r.assignmentsPct, sub:`${r.assignmentsPct}% avg score` },
                  { label:`Quizzes (${REG.quizPassPct}%+)`, pct:r.quizPct, sub:`${r.quizPassed}/${r.quizTotal} passed` },
                  { label:`Attendance (min ${REG.attendanceMinPct}%)`, pct:r.attendancePct, sub:`${r.attendancePct}% present` },
                  { label:`Clinical Hours`, pct:Math.min(100, Math.round((r.clinicalHours/REG.clinicalHoursRequired)*100)), sub:`${r.clinicalHours}/${REG.clinicalHoursRequired} hrs` },
                  { label:`CDPH Skills`, pct:Math.min(100, Math.round((r.skillsSigned/REG.skillsRequired)*100)), sub:`${r.skillsSigned}/${REG.skillsRequired} signed` },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.text, marginBottom:3 }}>
                      <span style={{ fontWeight:600 }}>{m.label}</span>
                      <span style={{ color:C.muted }}>{m.sub}</span>
                    </div>
                    {bar(m.pct, pctColor(m.pct))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <StudentProfilePanel
          userId={selected.userId}
          courseId={courseId}
          name={selected.name}
          onClose={() => { setSelected(null); setTick(t => t + 1); }}
        />
      )}
    </div>
  );
};

export default StudentProgress;
