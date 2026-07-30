// Slide-over student profile: grades, attendance, clinical hours, skills, submissions.
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const C = {
  primary: '#7B4DB5', bg: '#F4F2FA', white: '#FFFFFF',
  border: '#D4C8E8', text: '#2D1B4E', muted: '#655480',
  success: '#127A1B', error: '#C0392B', warn: '#E67E22',
} as const;

export interface StudentProfilePanelProps {
  userId: string;
  courseId: string;
  name: string;
  email?: string;
  onClose: () => void;
}

interface GradeRow { id: string; title: string; score: number; max: number; graded_at: string | null }
interface AttendRow { date: string; status: string }
interface ClinicalRow { id: string; date: string; site: string; hours: number; verified: boolean }
interface SkillRow { id: string; name: string; status: string; attempts: number }
interface SubRow { id: string; title: string; submitted_at: string }

const Card: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <section style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 14, overflow: 'hidden' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 14px', background: '#F0EDF7', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title}</span>
      {right && <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{right}</span>}
    </header>
    <div style={{ padding: '10px 14px' }}>{children}</div>
  </section>
);

const Empty: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ fontSize: 12, color: C.muted, padding: '6px 0' }}>{label}</div>
);

const StudentProfilePanel: React.FC<StudentProfilePanelProps> = ({ userId, courseId, name, email, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [attendance, setAttendance] = useState<AttendRow[]>([]);
  const [clinical, setClinical] = useState<ClinicalRow[]>([]);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [gRes, aRes, cRes, sRes, subRes, asgRes, skRes] = await Promise.all([
        supabase.from('grades').select('id, assignment_id, score, max_score, graded_at')
          .eq('course_id', courseId).eq('user_id', userId),
        supabase.from('attendance').select('session_date, status')
          .eq('course_id', courseId).eq('student_id', userId).order('session_date', { ascending: false }),
        supabase.from('clinical_hours').select('id, shift_date, clinical_site, hours, verified')
          .eq('course_id', courseId).eq('student_user_id', userId).order('shift_date', { ascending: false }),
        supabase.from('student_skill_signoffs').select('id, skill_id, status, attempts')
          .eq('course_id', courseId).eq('student_user_id', userId),
        supabase.from('submissions').select('id, assignment_id, submitted_at').eq('user_id', userId)
          .order('submitted_at', { ascending: false }),
        supabase.from('assignments').select('id, title').eq('course_id', courseId),
        supabase.from('cna_skills').select('id, name'),
      ]);
      if (!alive) return;

      const asgMap: Record<string, string> = {};
      for (const a of (asgRes.data ?? []) as any[]) asgMap[a.id] = a.title;
      const skMap: Record<string, string> = {};
      for (const s of (skRes.data ?? []) as any[]) skMap[s.id] = s.name;

      setGrades(((gRes.data ?? []) as any[]).map(g => ({
        id: g.id, title: asgMap[g.assignment_id] ?? 'Quiz / other', score: Number(g.score ?? 0),
        max: Number(g.max_score ?? 0), graded_at: g.graded_at,
      })));
      setAttendance(((aRes.data ?? []) as any[]).map(a => ({ date: a.session_date, status: a.status })));
      setClinical(((cRes.data ?? []) as any[]).map(c => ({
        id: c.id, date: c.shift_date, site: c.clinical_site, hours: Number(c.hours ?? 0), verified: !!c.verified,
      })));
      setSkills(((sRes.data ?? []) as any[]).map(s => ({
        id: s.id, name: skMap[s.skill_id] ?? 'Skill', status: s.status, attempts: s.attempts ?? 0,
      })));
      setSubs(((subRes.data ?? []) as any[])
        .filter(s => asgMap[s.assignment_id])
        .map(s => ({ id: s.id, title: asgMap[s.assignment_id], submitted_at: s.submitted_at })));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [userId, courseId]);

  const totalPts = grades.reduce((n, g) => n + g.score, 0);
  const totalMax = grades.reduce((n, g) => n + g.max, 0);
  const pct = totalMax > 0 ? Math.round((totalPts / totalMax) * 1000) / 10 : null;
  const present = attendance.filter(a => a.status === 'present').length;
  const attPct = attendance.length ? Math.round((present / attendance.length) * 100) : null;
  const clinicalTotal = clinical.reduce((n, c) => n + c.hours, 0);
  const clinicalVerified = clinical.filter(c => c.verified).reduce((n, c) => n + c.hours, 0);
  const skillsDone = skills.filter(s => s.status === 'passed' || s.status === 'completed' || s.status === 'signed_off').length;

  const initials = (name || email || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div role="dialog" aria-label={`Profile for ${name}`}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', justifyContent: 'flex-end' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 560, maxWidth: '100vw', height: '100%', background: C.bg, overflowY: 'auto',
          fontFamily: 'sans-serif', boxShadow: '-10px 0 40px rgba(0,0,0,0.25)' }}>

        <header style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '18px 20px',
          background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 2 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.primary, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{name}</div>
            <div style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email || '—'}</div>
          </div>
          <button onClick={onClose} aria-label="Close profile"
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: C.muted }}>×</button>
        </header>

        <div style={{ padding: 18 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading student record…</div>
          ) : (
            <>
              {/* Summary strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Grade', value: pct === null ? '—' : `${pct}%` },
                  { label: 'Attendance', value: attPct === null ? '—' : `${attPct}%` },
                  { label: 'Clinical hrs', value: clinicalTotal ? clinicalTotal.toFixed(1) : '0' },
                  { label: 'Skills', value: `${skillsDone}/${skills.length || 0}` },
                ].map(s => (
                  <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <Card title="Grades" right={totalMax ? `${totalPts} / ${totalMax}` : undefined}>
                {grades.length === 0 ? <Empty label="No graded work yet." /> : grades.map(g => (
                  <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: C.text, padding: '4px 0', borderBottom: `1px solid ${C.bg}` }}>
                    <span>{g.title}</span>
                    <span style={{ fontWeight: 600 }}>{g.score} / {g.max}</span>
                  </div>
                ))}
              </Card>

              <Card title="Attendance" right={attendance.length ? `${present}/${attendance.length} present` : undefined}>
                {attendance.length === 0 ? <Empty label="No attendance recorded." /> : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {attendance.slice(0, 40).map(a => (
                      <span key={a.date} title={`${a.date} — ${a.status}`}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20,
                          background: a.status === 'present' ? '#E8F6EC' : a.status === 'late' ? '#FFF3CD' : '#FDECEA',
                          color: a.status === 'present' ? C.success : a.status === 'late' ? '#8A6D00' : C.error }}>
                        {a.date}
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Clinical hours"
                right={clinical.length ? `${clinicalVerified.toFixed(1)} verified / ${clinicalTotal.toFixed(1)} logged` : undefined}>
                {clinical.length === 0 ? <Empty label="No clinical hours logged." /> : clinical.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: C.text, padding: '4px 0', borderBottom: `1px solid ${C.bg}` }}>
                    <span>{c.date} • {c.site}</span>
                    <span style={{ fontWeight: 600, color: c.verified ? C.success : C.warn }}>
                      {c.hours.toFixed(1)}h {c.verified ? '✓' : 'pending'}
                    </span>
                  </div>
                ))}
              </Card>

              <Card title="Skill sign-offs" right={skills.length ? `${skillsDone} complete` : undefined}>
                {skills.length === 0 ? <Empty label="No skill sign-offs yet." /> : skills.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: C.text, padding: '4px 0', borderBottom: `1px solid ${C.bg}` }}>
                    <span>{s.name}</span>
                    <span style={{ fontWeight: 600, color: skillsDone && s.status !== 'not_started' ? C.success : C.muted }}>
                      {s.status}{s.attempts ? ` · ${s.attempts} attempt${s.attempts === 1 ? '' : 's'}` : ''}
                    </span>
                  </div>
                ))}
              </Card>

              <Card title="Submissions" right={subs.length ? `${subs.length}` : undefined}>
                {subs.length === 0 ? <Empty label="No submissions in this course." /> : subs.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: C.text, padding: '4px 0', borderBottom: `1px solid ${C.bg}` }}>
                    <span>{s.title}</span>
                    <span style={{ color: C.muted }}>{new Date(s.submitted_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePanel;
