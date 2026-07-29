// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect } from 'react';
import { supabase } from './AuthContext';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

type Status = 'P' | 'A' | 'L' | 'E';
interface Student { id: string; name: string; email: string; initials: string; }
interface AttRow  { studentId: string; status: Status; }
interface Props   { courseId?: string; canEdit?: boolean; }

const STATUS_LABELS: Record<Status, string> = { P:'Present', A:'Absent', L:'Late', E:'Excused' };
const STATUS_COLORS: Record<Status, string> = { P:C.success, A:C.error, L:C.warn, E:C.accent };

const AttendanceTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const [students,   setStudents]   = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttRow[]>([]);
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  // Load enrolled students
  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const loadStudents = async () => {
      setLoading(true);
      const { data: enr } = await supabase.from('enrollments')
        .select('user_id, role')
        .eq('course_id', courseId)
        .eq('role', 'student');
      const ids = (enr ?? []).map((r: any) => r.user_id).filter(Boolean);
      if (ids.length) {
        const { data: profs } = await supabase.from('profiles')
          .select('user_id, full_name')
          .in('user_id', ids);
        const studs: Student[] = (profs ?? []).map((p: any) => {
          const name = p.full_name || 'Student';
          return {
            id: p.user_id, name, email: '',
            initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          };
        });
        setStudents(studs);
        setAttendance(studs.map(s => ({ studentId: s.id, status: 'P' })));
      } else {
        setStudents([]);
        setAttendance([]);
      }
      setLoading(false);
    };
    loadStudents();
  }, [courseId]);

  // Load existing attendance for selected date
  useEffect(() => {
    if (!courseId || students.length === 0) return;
    const loadAtt = async () => {
      const { data } = await supabase.from('attendance')
        .select('student_id, status')
        .eq('course_id', courseId)
        .eq('session_date', sessionDate);
      if (data && data.length > 0) {
        setAttendance(students.map(s => {
          const row = data.find((d: any) => d.student_id === s.id);
          return { studentId: s.id, status: (row?.status ?? 'P') as Status };
        }));
      } else {
        setAttendance(students.map(s => ({ studentId: s.id, status: 'P' })));
      }
    };
    loadAtt();
  }, [sessionDate, students]);

  const setStatus = (studentId: string, status: Status) =>
    setAttendance(p => p.map(r => r.studentId === studentId ? { ...r, status } : r));

  const markAll = (status: Status) =>
    setAttendance(p => p.map(r => ({ ...r, status })));

  const saveAttendance = async () => {
    if (!courseId) return;
    setSaving(true);
    for (const row of attendance) {
      await supabase.from('attendance').upsert({
        course_id:    courseId,
        student_id:   row.studentId,
        session_date: sessionDate,
        status:       row.status,
      }, { onConflict: 'course_id,student_id,session_date' });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const counts = attendance.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ padding:24 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ margin:'0 0 4px', fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Roll Call</h2>
          <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>
            {students.length} student{students.length !== 1 ? 's' : ''} •
            P:{counts.P ?? 0} A:{counts.A ?? 0} L:{counts.L ?? 0} E:{counts.E ?? 0}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input aria-label="Session date" type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
            style={{ border:`1px solid ${C.border}`, borderRadius:5, padding:'7px 10px', fontSize:13, fontFamily:'sans-serif' }}/>
          {canEdit && (
            <button onClick={saveAttendance} disabled={saving}
              style={{ padding:'8px 20px', border:'none', borderRadius:5, background: saved ? C.success : C.primary,
                color:'white', fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer', opacity:saving?.7:1 }}>
              {saving ? 'Saving…' : saved ? '✅ Saved!' : 'Save Attendance'}
            </button>
          )}
        </div>
      </div>

      {/* Mark All buttons */}
      {canEdit && (
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          <span style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', alignSelf:'center' }}>Mark all:</span>
          {(['P','A','L','E'] as Status[]).map(s => (
            <button key={s} onClick={() => markAll(s)}
              style={{ padding:'5px 14px', border:`1px solid ${STATUS_COLORS[s]}`, borderRadius:5,
                background: STATUS_COLORS[s] + '18', color: STATUS_COLORS[s],
                fontSize:12, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {!courseId ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Open a course to take attendance.</div>
      ) : loading ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading students…</div>
      ) : students.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>No students enrolled</div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>Add students in the People tab first.</div>
        </div>
      ) : (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
          {students.map((s, i) => {
            const row = attendance.find(r => r.studentId === s.id);
            const status = row?.status ?? 'P';
            return (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:14,
                padding:'12px 16px', borderBottom: i < students.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                {/* Avatar */}
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#9B6DD0',
                  color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:700, flexShrink:0 }}>{s.initials}</div>
                {/* Name */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif' }}>{s.name}</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{s.email}</div>
                </div>
                {/* Status buttons */}
                <div style={{ display:'flex', gap:6 }}>
                  {(['P','A','L','E'] as Status[]).map(st => (
                    <button key={st} onClick={() => canEdit && setStatus(s.id, st)}
                      style={{ width:36, height:36, border:'none', borderRadius:6, cursor: canEdit ? 'pointer' : 'default',
                        background: status === st ? STATUS_COLORS[st] : C.bg,
                        color: status === st ? 'white' : C.muted,
                        fontSize:12, fontWeight:700, fontFamily:'sans-serif',
                        transition:'all .15s' }}>
                      {st}
                    </button>
                  ))}
                </div>
                {/* Status label */}
                <div style={{ width:64, fontSize:12, fontFamily:'sans-serif',
                  color: STATUS_COLORS[status], fontWeight:600, textAlign:'right' }}>
                  {STATUS_LABELS[status]}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;