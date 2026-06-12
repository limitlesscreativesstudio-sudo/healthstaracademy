// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect } from 'react';
import { supabase } from './AuthContext';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const letter  = (p: number) => p>=93?'A':p>=90?'A-':p>=87?'B+':p>=83?'B':p>=80?'B-':p>=77?'C+':p>=73?'C':p>=70?'C-':'F';
const gColor  = (p: number) => p>=80?C.success:p>=70?C.warn:C.error;

interface Props { courseId?: string; canEdit?: boolean; }
interface Student { id: string; name: string; initials: string; }
interface Assignment { id: string; name: string; points: number; }
interface GradeMap { [studentId: string]: { [assignmentId: string]: number | null } }

const StudentGrades: React.FC<Props> = ({ courseId, canEdit }) => {
  const [students,    setStudents]    = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades,      setGrades]      = useState<GradeMap>({});
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState<{ s: string; a: string } | null>(null);
  const [editVal,     setEditVal]     = useState('');

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);

      // Load students
      const { data: enrollments } = await supabase.from('enrollments')
        .select('profiles(id, full_name, role)')
        .eq('course_id', courseId);
      const studs: Student[] = (enrollments ?? [])
        .map((e: any) => e.profiles)
        .filter((p: any) => p?.role === 'student')
        .map((p: any) => ({
          id: p.id, name: p.full_name,
          initials: p.full_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        }));
      setStudents(studs);

      // Load assignments
      const { data: asgns } = await supabase.from('assignments')
        .select('id, name, points').eq('course_id', courseId).order('created_at');
      setAssignments(asgns ?? []);

      // Load grades
      const { data: gradeRows } = await supabase.from('grades')
        .select('student_id, assignment_id, score').eq('course_id', courseId);
      const map: GradeMap = {};
      for (const s of studs) {
        map[s.id] = {};
        for (const a of (asgns ?? [])) map[s.id][a.id] = null;
      }
      for (const g of (gradeRows ?? [])) {
        if (!map[g.student_id]) map[g.student_id] = {};
        map[g.student_id][g.assignment_id] = g.score;
      }
      setGrades(map);
      setLoading(false);
    };
    load();
  }, [courseId]);

  const saveGrade = async () => {
    if (!editing || !courseId) return;
    const score = parseFloat(editVal);
    if (isNaN(score)) { setEditing(null); return; }
    // Optimistic update
    setGrades(p => ({ ...p, [editing.s]: { ...(p[editing.s] ?? {}), [editing.a]: score } }));
    setEditing(null);
    await supabase.from('grades').upsert({
      course_id: courseId, student_id: editing.s,
      assignment_id: editing.a, score,
    }, { onConflict: 'student_id,assignment_id' });
  };

  const totalPts = assignments.reduce((s, a) => s + a.points, 0);
  const studentTotal = (sId: string) =>
    assignments.reduce((s, a) => s + (grades[sId]?.[a.id] ?? 0), 0);

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Gradebook</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>📥 Import</button>
          <button style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>📤 Export</button>
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
      ) : assignments.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📝</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif' }}>No assignments yet</div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', marginTop:6 }}>Create assignments first, then enter grades here.</div>
        </div>
      ) : (
        <div style={{ overflowX:'auto', border:`1px solid ${C.border}`, borderRadius:6 }}>
          <table style={{ borderCollapse:'collapse', fontFamily:'sans-serif', minWidth:'100%' }}>
            <thead>
              <tr style={{ background:'#F0EDF7' }}>
                <th style={{ padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:C.text,
                  borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                  position:'sticky', left:0, background:'#F0EDF7', minWidth:180, zIndex:10 }}>
                  Student
                </th>
                {assignments.map(a => (
                  <th key={a.id} style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600,
                    color:C.text, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, minWidth:100 }}>
                    <div style={{ color:C.primary, marginBottom:2 }}>{a.name}</div>
                    <div style={{ color:C.muted, fontWeight:400 }}>/ {a.points}</div>
                  </th>
                ))}
                <th style={{ padding:'10px', textAlign:'center', fontSize:12, fontWeight:700,
                  color:C.text, borderBottom:`1px solid ${C.border}`, minWidth:110 }}>
                  Total / {totalPts}
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, si) => {
                const tot = studentTotal(s.id);
                const pct = totalPts > 0 ? Math.round((tot / totalPts) * 100) : 0;
                return (
                  <tr key={s.id} style={{ background: si % 2 === 0 ? C.white : '#FDFCFF' }}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600,
                      borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                      position:'sticky', left:0, background: si % 2 === 0 ? C.white : '#FDFCFF', zIndex:5 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'#9B6DD0',
                          color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, fontWeight:700, flexShrink:0 }}>{s.initials}</div>
                        <span style={{ color:C.primary }}>{s.name}</span>
                      </div>
                    </td>
                    {assignments.map(a => {
                      const g = grades[s.id]?.[a.id];
                      const isEd = editing?.s === s.id && editing?.a === a.id;
                      const pctCell = g != null ? Math.round((g / a.points) * 100) : null;
                      return (
                        <td key={a.id} onClick={() => { if (!canEdit) return; setEditing({ s: s.id, a: a.id }); setEditVal(g?.toString() ?? ''); }}
                          style={{ padding:'7px 9px', textAlign:'center', cursor: canEdit ? 'pointer' : 'default',
                            borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                            background: isEd ? '#EDE8F7' : 'inherit' }}
                          onMouseEnter={e => { if (!isEd && canEdit) (e.currentTarget as HTMLElement).style.background = '#F0EDF7'; }}
                          onMouseLeave={e => { if (!isEd) (e.currentTarget as HTMLElement).style.background = 'inherit'; }}>
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
                    <td style={{ padding:'9px', textAlign:'center', borderBottom:`1px solid ${C.border}`, fontWeight:700 }}>
                      <div style={{ fontSize:14, color: gColor(pct) }}>{pct}%</div>
                      <div style={{ fontSize:12, color:C.muted }}>{letter(pct)}</div>
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