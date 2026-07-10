// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './AuthContext';
import { toast } from 'sonner';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const letter = (p: number) => p>=93?'A':p>=90?'A-':p>=87?'B+':p>=83?'B':p>=80?'B-':p>=77?'C+':p>=73?'C':p>=70?'C-':'F';
const gColor = (p: number) => p>=80?C.success:p>=70?C.warn:C.error;

interface Props { courseId?: string; canEdit?: boolean; }
interface Student { id: string; name: string; initials: string; }
interface Column { id: string; name: string; points: number; kind: 'assignment' | 'quiz'; }
type GradeMap = Record<string, Record<string, number | null>>;

const StudentGrades: React.FC<Props> = ({ courseId, canEdit }) => {
  const [students,    setStudents]    = useState<Student[]>([]);
  const [columns,     setColumns]     = useState<Column[]>([]);
  const [grades,      setGrades]      = useState<GradeMap>({});
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState<{ s: string; a: string } | null>(null);
  const [editVal,     setEditVal]     = useState('');
  const [filter,      setFilter]      = useState<'all'|'assignment'|'quiz'>('all');
  const [search,      setSearch]      = useState('');
  const [rejects,     setRejects]     = useState<Array<{ id: string; student: string; column: string; value: string; reason: string; at: Date }>>([]);
  const [showRejects, setShowRejects] = useState(false);


  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);

    // 1) Enrollments (students only) — do NOT rely on nested embed
    const { data: enrs } = await supabase.from('enrollments')
      .select('user_id, role').eq('course_id', courseId).eq('role', 'student');
    const userIds = (enrs ?? []).map((e: any) => e.user_id);

    // 2) Profiles for those users
    let studs: Student[] = [];
    if (userIds.length) {
      const { data: profs } = await supabase.from('profiles')
        .select('user_id, full_name').in('user_id', userIds);
      studs = (profs ?? []).map((p: any) => {
        const nm = p.full_name || 'Student';
        return {
          id: p.user_id,
          name: nm,
          initials: nm.split(' ').filter(Boolean).map((w:string) => w[0]).join('').slice(0,2).toUpperCase(),
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
    }
    setStudents(studs);

    // 3) Assignments + Quizzes as columns
    const [{ data: asgns }, { data: qzs }] = await Promise.all([
      supabase.from('assignments').select('id,title,points,created_at').eq('course_id', courseId).order('created_at'),
      supabase.from('quizzes').select('id,title,total_points,created_at').eq('course_id', courseId).order('created_at'),
    ]);
    const cols: Column[] = [
      ...(asgns ?? []).map((a: any) => ({ id: a.id, name: a.title, points: Number(a.points ?? 0), kind: 'assignment' as const })),
      ...(qzs ?? []).map((q: any) => ({ id: q.id, name: q.title, points: Number(q.total_points ?? 0), kind: 'quiz' as const })),
    ];
    setColumns(cols);

    // 4) Grades (assignments) + best quiz attempt (quizzes)
    const asgnIds = (asgns ?? []).map((a: any) => a.id);
    const qzIds   = (qzs ?? []).map((q: any) => q.id);
    const [{ data: gradeRows }, { data: attempts }] = await Promise.all([
      asgnIds.length
        ? supabase.from('grades').select('user_id, assignment_id, score').in('assignment_id', asgnIds)
        : Promise.resolve({ data: [] as any[] }),
      qzIds.length
        ? supabase.from('quiz_attempts').select('user_id, quiz_id, score, submitted_at').in('quiz_id', qzIds).not('submitted_at','is',null)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const map: GradeMap = {};
    for (const s of studs) { map[s.id] = {}; for (const c of cols) map[s.id][c.id] = null; }
    for (const g of (gradeRows ?? [])) {
      if (!map[g.user_id]) map[g.user_id] = {};
      map[g.user_id][g.assignment_id] = g.score == null ? null : Number(g.score);
    }
    // best attempt per user/quiz
    const best: Record<string, number> = {};
    for (const a of (attempts ?? [])) {
      const k = `${a.user_id}|${a.quiz_id}`;
      const s = Number(a.score ?? 0);
      if (best[k] == null || s > best[k]) best[k] = s;
    }
    for (const k of Object.keys(best)) {
      const [uid, qid] = k.split('|');
      if (!map[uid]) map[uid] = {};
      map[uid][qid] = best[k];
    }
    setGrades(map);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId]);

  const logReject = (target: { s: string; a: string }, value: string, reason: string) => {
    const student = students.find(x => x.id === target.s)?.name ?? target.s;
    const column = columns.find(x => x.id === target.a)?.name ?? target.a;
    setRejects(p => [{ id: crypto.randomUUID(), student, column, value, reason, at: new Date() }, ...p].slice(0, 50));
    toast.error(`${reason} — ${student} / ${column}`);
  };

  const saveGrade = async () => {
    if (!editing || !courseId) { setEditing(null); return; }
    const col = columns.find(c => c.id === editing.a);
    const raw = editVal.trim();
    const target = editing;
    if (raw === '') { setEditing(null); return; }
    const score = Number(raw);
    if (!isFinite(score) || isNaN(score)) { logReject(target, raw, 'Score must be a number'); return; }
    if (score < 0) { logReject(target, raw, 'Score cannot be negative'); return; }
    if (col && col.points > 0 && score > col.points) {
      logReject(target, raw, `Score exceeds max (${col.points})`); return;
    }
    const prev = grades[target.s]?.[target.a] ?? null;
    setGrades(p => ({ ...p, [target.s]: { ...(p[target.s] ?? {}), [target.a]: score } }));
    setEditing(null);
    if (col?.kind === 'assignment') {
      const { error } = await supabase.from('grades').upsert({
        course_id: courseId,
        user_id: target.s,
        assignment_id: target.a,
        score,
        max_score: col.points || null,
        graded_at: new Date().toISOString(),
      }, { onConflict: 'assignment_id,user_id' });
      if (error) {
        setGrades(p => ({ ...p, [target.s]: { ...(p[target.s] ?? {}), [target.a]: prev } }));
        logReject(target, raw, 'Save failed: ' + error.message);
      } else {
        toast.success('Grade saved');
      }
    }
  };


  const visibleCols = useMemo(
    () => columns.filter(c => filter === 'all' || c.kind === filter),
    [columns, filter]
  );
  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? students.filter(s => s.name.toLowerCase().includes(q)) : students;
  }, [students, search]);

  const totalPts = visibleCols.reduce((s, a) => s + (a.points || 0), 0);
  const studentTotal = (sId: string) =>
    visibleCols.reduce((s, a) => s + (grades[sId]?.[a.id] ?? 0), 0);

  const exportCsv = () => {
    const header = ['Student', ...visibleCols.map(c => `${c.name} (/${c.points})`), `Total (/${totalPts})`, '%', 'Letter'];
    const rows = visibleStudents.map(s => {
      const tot = studentTotal(s.id);
      const pct = totalPts > 0 ? Math.round((tot / totalPts) * 100) : 0;
      return [
        s.name,
        ...visibleCols.map(c => grades[s.id]?.[c.id] ?? ''),
        tot, `${pct}%`, letter(pct),
      ];
    });
    const csv = [header, ...rows].map(r => r.map(v => {
      const str = String(v ?? '');
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `gradebook-${courseId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Gradebook</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, fontFamily:'sans-serif', minWidth:180 }} />
          {(['all','assignment','quiz'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'6px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:filter===f?C.primary:C.white, color:filter===f?'white':C.text, fontSize:12, cursor:'pointer', textTransform:'capitalize', fontFamily:'sans-serif' }}>
              {f === 'all' ? 'All' : f === 'assignment' ? 'Assignments' : 'Quizzes'}
            </button>
          ))}
          <button onClick={exportCsv} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>📤 Export CSV</button>
          <button onClick={load} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>🔄 Refresh</button>
        </div>
      </div>

      {!courseId ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Open a course to view the gradebook.</div>
      ) : loading ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading gradebook…</div>
      ) : students.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📊</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif' }}>No students enrolled yet</div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', marginTop:6 }}>Add students in the People tab to see the gradebook.</div>
        </div>
      ) : visibleCols.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📝</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif' }}>No graded work yet</div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', marginTop:6 }}>Create assignments or quizzes first.</div>
        </div>
      ) : (
        <div style={{ overflowX:'auto', border:`1px solid ${C.border}`, borderRadius:6 }}>
          <table style={{ borderCollapse:'collapse', fontFamily:'sans-serif', minWidth:'100%' }}>
            <thead>
              <tr style={{ background:'#F0EDF7' }}>
                <th style={{ padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:C.text,
                  borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                  position:'sticky', left:0, background:'#F0EDF7', minWidth:200, zIndex:10 }}>
                  Student ({visibleStudents.length})
                </th>
                {visibleCols.map(a => (
                  <th key={a.id} title={a.name} style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600,
                    color:C.text, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, minWidth:100 }}>
                    <div style={{ color:C.primary, marginBottom:2, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.name}</div>
                    <div style={{ color:C.muted, fontWeight:400 }}>{a.kind === 'quiz' ? '🎯' : '📝'} / {a.points}</div>
                  </th>
                ))}
                <th style={{ padding:'10px', textAlign:'center', fontSize:12, fontWeight:700,
                  color:C.text, borderBottom:`1px solid ${C.border}`, minWidth:110, position:'sticky', right:0, background:'#F0EDF7' }}>
                  Total / {totalPts}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((s, si) => {
                const tot = studentTotal(s.id);
                const pct = totalPts > 0 ? Math.round((tot / totalPts) * 100) : 0;
                const bg = si % 2 === 0 ? C.white : '#FDFCFF';
                return (
                  <tr key={s.id} style={{ background: bg }}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600,
                      borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                      position:'sticky', left:0, background: bg, zIndex:5 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'#9B6DD0',
                          color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, fontWeight:700, flexShrink:0 }}>{s.initials}</div>
                        <span style={{ color:C.primary }}>{s.name}</span>
                      </div>
                    </td>
                    {visibleCols.map(a => {
                      const g = grades[s.id]?.[a.id];
                      const isEd = editing?.s === s.id && editing?.a === a.id;
                      const pctCell = g != null && a.points > 0 ? Math.round((g / a.points) * 100) : null;
                      const editable = canEdit && a.kind === 'assignment';
                      return (
                        <td key={a.id}
                          title={a.kind === 'quiz' ? 'Auto-graded from quiz attempt (best)' : (editable ? 'Click to edit' : '')}
                          onClick={() => { if (!editable) return; setEditing({ s: s.id, a: a.id }); setEditVal(g?.toString() ?? ''); }}
                          style={{ padding:'7px 9px', textAlign:'center', cursor: editable ? 'pointer' : 'default',
                            borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                            background: isEd ? '#EDE8F7' : 'inherit' }}>
                          {isEd ? (
                            <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                              onBlur={saveGrade}
                              onKeyDown={e => { if (e.key === 'Enter') saveGrade(); if (e.key === 'Escape') setEditing(null); }}
                              style={{ width:52, textAlign:'center', border:`2px solid ${C.primary}`, borderRadius:3, padding:'2px 4px', fontSize:13 }}/>
                          ) : (
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color: pctCell != null ? gColor(pctCell) : C.muted }}>
                                {g != null ? g : '—'}
                              </div>
                              {pctCell != null && <div style={{ fontSize:10, color:C.muted }}>{pctCell}%</div>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ padding:'9px', textAlign:'center', borderBottom:`1px solid ${C.border}`, fontWeight:700, position:'sticky', right:0, background: bg }}>
                      <div style={{ fontSize:14, color: gColor(pct) }}>{pct}%</div>
                      <div style={{ fontSize:12, color:C.muted }}>{letter(pct)} • {tot.toFixed(1)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
