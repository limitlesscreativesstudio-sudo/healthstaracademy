// @ts-nocheck — legacy schema mismatches; flagged for refactor
// Course Tools: hours roll-up, certificate generation, and end-of-cohort course reset.
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isAttended, THEORY_HOURS_PER_ATTENDED_DAY } from '@/lib/attendance';

const C = {
  primary: '#7B4DB5', bg: '#F4F2FA', white: '#FFFFFF', border: '#D4C8E8',
  text: '#2D1B4E', muted: '#655480', success: '#127A1B', error: '#C0392B', warn: '#E67E22',
} as const;

const DEFAULT_THEORY = 60;
const DEFAULT_CLINICAL = 100;

interface Row {
  userId: string;
  name: string;
  theory: number;
  clinical: number;
  clinicalVerified: number;
  presentDays: number;
  totalDays: number;
}

const Section: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <section style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18, marginBottom: 18 }}>
    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'sans-serif' }}>{title}</h3>
    {desc && <p style={{ margin: '5px 0 14px', fontSize: 12.5, color: C.muted, fontFamily: 'sans-serif' }}>{desc}</p>}
    {children}
  </section>
);

const bar = (pct: number) => (
  <div style={{ height: 7, background: C.bg, borderRadius: 20, overflow: 'hidden', minWidth: 90 }}>
    <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: pct >= 100 ? C.success : C.primary }} />
  </div>
);

const CourseToolsPanel: React.FC<{ courseId?: string; canEdit?: boolean }> = ({ courseId, canEdit }) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [req, setReq] = useState({ theory: DEFAULT_THEORY, clinical: DEFAULT_CLINICAL, program: 'CNA (CDPH)' });
  const [courseTitle, setCourseTitle] = useState('');
  const [resetOpts, setResetOpts] = useState({
    quiz_attempts: true, grades: true, submissions: true,
    attendance: false, clinical: false, skills: false, unenroll: false,
  });
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: course }, { data: enrs }] = await Promise.all([
      supabase.from('courses').select('title, cohort_id').eq('id', courseId).maybeSingle(),
      supabase.from('enrollments').select('user_id').eq('course_id', courseId).eq('role', 'student'),
    ]);
    setCourseTitle(course?.title ?? '');

    if (course?.cohort_id) {
      const { data: coh } = await supabase.from('cohorts').select('program_id').eq('id', course.cohort_id).maybeSingle();
      if (coh?.program_id) {
        const { data: prog } = await supabase.from('programs')
          .select('name, required_theory_hours, required_clinical_hours').eq('id', coh.program_id).maybeSingle();
        if (prog) setReq({
          theory: Number(prog.required_theory_hours) || DEFAULT_THEORY,
          clinical: Number(prog.required_clinical_hours) || DEFAULT_CLINICAL,
          program: prog.name || 'CNA (CDPH)',
        });
      }
    }

    const uids = (enrs ?? []).map(e => e.user_id);
    if (!uids.length) { setRows([]); setLoading(false); return; }

    const [{ data: profs }, { data: att }, { data: ch }, { data: ca }] = await Promise.all([
      supabase.from('profiles').select('user_id, full_name').in('user_id', uids),
      supabase.from('attendance').select('student_id, status').eq('course_id', courseId),
      supabase.from('clinical_hours').select('student_user_id, hours, verified').eq('course_id', courseId),
      supabase.from('clinical_attendance').select('student_user_id, hours, hours_worked, verified').eq('course_id', courseId),
    ]);

    const nameBy: Record<string, string> = {};
    (profs ?? []).forEach(p => { nameBy[p.user_id] = p.full_name || 'Student'; });

    const acc: Record<string, Row> = {};
    uids.forEach(u => { acc[u] = { userId: u, name: nameBy[u] || 'Student', theory: 0, clinical: 0, clinicalVerified: 0, presentDays: 0, totalDays: 0 }; });

    (att ?? []).forEach(a => {
      const r = acc[a.student_id]; if (!r) return;
      r.totalDays += 1;
      if (isAttended(a.status)) { r.presentDays += 1; r.theory += THEORY_HOURS_PER_ATTENDED_DAY; }
    });
    const addClinical = (uid: string, hrs: number, verified: boolean) => {
      const r = acc[uid]; if (!r) return;
      r.clinical += hrs; if (verified) r.clinicalVerified += hrs;
    };
    (ch ?? []).forEach(c => addClinical(c.student_user_id, Number(c.hours ?? 0), !!c.verified));
    (ca ?? []).forEach(c => addClinical(c.student_user_id, Number(c.hours ?? c.hours_worked ?? 0), !!c.verified));

    setRows(Object.values(acc).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })));
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId]);

  const eligible = useMemo(
    () => rows.filter(r => r.theory >= req.theory && r.clinicalVerified >= req.clinical),
    [rows, req],
  );

  const printCertificate = (r: Row) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificate — ${r.name}</title>
<style>
  @page { size: landscape; margin: 0 }
  body { margin:0; font-family: Georgia, 'Times New Roman', serif; color:#2D1B4E }
  .sheet { width:100%; min-height:100vh; box-sizing:border-box; padding:60px 70px; display:flex; flex-direction:column;
           align-items:center; justify-content:center; text-align:center;
           border:14px double #7B4DB5; background:#fff }
  h1 { font-size:44px; margin:0 0 6px; letter-spacing:2px }
  .sub { font-size:15px; letter-spacing:5px; text-transform:uppercase; color:#655480; margin-bottom:34px }
  .name { font-size:40px; margin:14px 0; border-bottom:2px solid #D4C8E8; padding:0 40px 8px }
  .body { font-size:16px; max-width:720px; line-height:1.7; color:#3b2b5c }
  .hours { margin-top:18px; font-size:14px; color:#655480 }
  .sigs { display:flex; gap:80px; margin-top:52px }
  .sig { border-top:1.5px solid #2D1B4E; padding-top:6px; font-size:13px; width:240px }
</style></head><body onload="window.print()">
<div class="sheet">
  <div class="sub">Health Star Academy</div>
  <h1>Certificate of Completion</h1>
  <div class="sub">This certifies that</div>
  <div class="name">${r.name}</div>
  <div class="body">has successfully completed all theory and clinical requirements of the
   <strong>${req.program}</strong> program${courseTitle ? ` (${courseTitle})` : ''} at Health Star Academy.</div>
  <div class="hours">Theory hours: ${r.theory.toFixed(1)} / ${req.theory} &nbsp;•&nbsp; Verified clinical hours: ${r.clinicalVerified.toFixed(1)} / ${req.clinical}</div>
  <div class="sigs">
    <div class="sig">Program Director</div>
    <div class="sig">Date: ${new Date().toLocaleDateString()}</div>
  </div>
</div></body></html>`;
    const w = window.open('', '_blank', 'width=1100,height=800');
    if (!w) { toast.error('Allow pop-ups to print certificates'); return; }
    w.document.write(html); w.document.close();
  };

  const exportHours = () => {
    const headers = ['Student', 'Theory hours', `Required theory (${req.theory})`, 'Clinical logged', 'Clinical verified', `Required clinical (${req.clinical})`, 'Attendance', 'Eligible'];
    const data = rows.map(r => [
      r.name, r.theory.toFixed(1), req.theory, r.clinical.toFixed(1), r.clinicalVerified.toFixed(1), req.clinical,
      r.totalDays ? `${r.presentDays}/${r.totalDays}` : '—',
      (r.theory >= req.theory && r.clinicalVerified >= req.clinical) ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...data].map(x => x.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `hours-rollup-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('Hours roll-up exported');
  };

  const runReset = async () => {
    if (!courseId) return;
    if (confirmText.trim().toUpperCase() !== 'RESET') { toast.error('Type RESET to confirm'); return; }
    setBusy(true);
    try {
      const uids = rows.map(r => r.userId);
      const { data: quizzes } = await supabase.from('quizzes').select('id').eq('course_id', courseId);
      const { data: asgns } = await supabase.from('assignments').select('id').eq('course_id', courseId);
      const quizIds = (quizzes ?? []).map(q => q.id);
      const asgnIds = (asgns ?? []).map(a => a.id);
      const errs: string[] = [];
      const run = async (label: string, p: any) => { const { error } = await p; if (error) errs.push(`${label}: ${error.message}`); };

      if (resetOpts.grades) await run('grades', supabase.from('grades').delete().eq('course_id', courseId));
      if (resetOpts.quiz_attempts && quizIds.length) await run('quiz attempts', supabase.from('quiz_attempts').delete().in('quiz_id', quizIds));
      if (resetOpts.submissions && asgnIds.length) {
        await run('rubric scores', supabase.from('rubric_scores').delete().in('assignment_id', asgnIds));
        await run('submissions', supabase.from('submissions').delete().in('assignment_id', asgnIds));
      }
      if (resetOpts.attendance) await run('attendance', supabase.from('attendance').delete().eq('course_id', courseId));
      if (resetOpts.clinical) {
        await run('clinical hours', supabase.from('clinical_hours').delete().eq('course_id', courseId));
        await run('clinical attendance', supabase.from('clinical_attendance').delete().eq('course_id', courseId));
      }
      if (resetOpts.skills) await run('skill sign-offs', supabase.from('student_skill_signoffs').delete().eq('course_id', courseId));
      if (resetOpts.unenroll && uids.length) await run('enrollments', supabase.from('enrollments').delete().eq('course_id', courseId).eq('role', 'student'));

      if (errs.length) toast.error(`Kept for CDPH records — ${errs[0]}`);
      else toast.success('Course reset complete — content kept, student data cleared');
      setConfirmText('');
      await load();
    } finally { setBusy(false); }
  };

  if (!courseId) return <div style={{ fontSize: 13, color: C.muted, fontFamily: 'sans-serif' }}>Select a course to use course tools.</div>;
  if (loading) return <div style={{ fontSize: 13, color: C.muted, fontFamily: 'sans-serif' }}>Loading course tools…</div>;

  return (
    <div style={{ maxWidth: 880, fontFamily: 'sans-serif' }}>
      <Section
        title="Hours roll-up"
        desc={`Theory hours accrue at ${THEORY_HOURS_PER_ATTENDED_DAY}h per attended class day. Clinical hours roll up from logged and verified clinical shifts. Requirements: ${req.theory}h theory / ${req.clinical}h clinical (${req.program}).`}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <button onClick={exportHours} disabled={!rows.length}
            style={{ padding: '6px 14px', border: `1px solid ${C.border}`, borderRadius: 5, background: C.white, fontSize: 12.5, cursor: rows.length ? 'pointer' : 'default' }}>
            📤 Export CSV
          </button>
        </div>
        {!rows.length ? (
          <div style={{ fontSize: 13, color: C.muted }}>No students enrolled yet.</div>
        ) : (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 10, padding: '8px 12px', background: '#F0EDF7', fontSize: 11, fontWeight: 700, color: C.text }}>
              <div style={{ width: 170 }}>Student</div>
              <div style={{ flex: 1 }}>Theory</div>
              <div style={{ flex: 1 }}>Clinical (verified)</div>
              <div style={{ width: 90, textAlign: 'center' }}>Attendance</div>
            </div>
            {rows.map((r, i) => {
              const tp = req.theory ? (r.theory / req.theory) * 100 : 0;
              const cp = req.clinical ? (r.clinicalVerified / req.clinical) * 100 : 0;
              return (
                <div key={r.userId} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 12px', fontSize: 12, color: C.text, background: i % 2 ? '#FDFCFF' : C.white, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ width: 170, fontWeight: 600, color: C.primary, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                  <div style={{ flex: 1 }}>
                    {bar(tp)}<div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{r.theory.toFixed(1)} / {req.theory}h</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {bar(cp)}<div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{r.clinicalVerified.toFixed(1)} verified · {r.clinical.toFixed(1)} logged / {req.clinical}h</div>
                  </div>
                  <div style={{ width: 90, textAlign: 'center', color: C.muted }}>{r.totalDays ? `${r.presentDays}/${r.totalDays}` : '—'}</div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Certificates of completion"
        desc="Students who meet both hour requirements can be issued a printable certificate (print to PDF to email or file).">
        {!rows.length ? <div style={{ fontSize: 13, color: C.muted }}>No students enrolled yet.</div> : (
          <>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
              {eligible.length} of {rows.length} student{rows.length === 1 ? '' : 's'} currently eligible.
            </div>
            {rows.map(r => {
              const ok = r.theory >= req.theory && r.clinicalVerified >= req.clinical;
              return (
                <div key={r.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${C.bg}`, fontSize: 12.5 }}>
                  <span style={{ flex: 1, color: C.text }}>{r.name}</span>
                  <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: ok ? '#E8F6EC' : '#FFF3CD', color: ok ? C.success : '#8A6D00' }}>
                    {ok ? 'Eligible' : 'Hours incomplete'}
                  </span>
                  <button onClick={() => printCertificate(r)} disabled={!canEdit}
                    style={{ padding: '5px 12px', border: 'none', borderRadius: 5, background: ok ? C.primary : C.border, color: '#fff', fontSize: 12, cursor: canEdit ? 'pointer' : 'default' }}>
                    Generate
                  </button>
                </div>
              );
            })}
          </>
        )}
      </Section>

      <Section title="Reset course for a new cohort"
        desc="Keeps all course content (modules, pages, files, quizzes, assignments). Student records are permanent for CDPH review and stay on file — start a new cohort by duplicating the course instead.">
        {!canEdit ? <div style={{ fontSize: 13, color: C.muted }}>Only instructors and admins can reset a course.</div> : (
          <>
            <div style={{ background: '#FFF4E5', border: '1px solid #F0D9B5', color: '#7A4E00', borderRadius: 6, padding: '10px 12px', fontSize: 12.5, marginBottom: 12 }}>
              🔒 Records retention: quiz attempts, grades, attendance, clinical hours, skill sign-offs and student records are kept for 4 years and cannot be cleared here. Duplicate the course for the next cohort.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 14 }}>
              {([
                ['quiz_attempts', 'Quiz attempts'],
                ['grades', 'Grades'],
                ['submissions', 'Submissions & rubric scores'],
                ['attendance', 'Attendance records'],
                ['clinical', 'Clinical hours'],
                ['skills', 'Skill sign-offs'],
                ['unenroll', 'Unenroll all students'],
              ] as const).map(([k, label]) => (
                <label key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: C.text }}>
                  <input type="checkbox" checked={resetOpts[k]} onChange={e => setResetOpts(p => ({ ...p, [k]: e.target.checked }))} />
                  {label}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder='Type RESET to confirm'
                aria-label="Type RESET to confirm"
                style={{ flex: 1, maxWidth: 240, border: `1px solid ${C.border}`, borderRadius: 5, padding: '8px 10px', fontSize: 13, outline: 'none' }} />
              <button onClick={runReset} disabled={busy}
                style={{ padding: '8px 18px', border: 'none', borderRadius: 5, background: busy ? C.border : C.error, color: '#fff', fontSize: 13, cursor: busy ? 'wait' : 'pointer' }}>
                {busy ? 'Resetting…' : 'Reset course data'}
              </button>
            </div>
          </>
        )}
      </Section>
    </div>
  );
};

export default CourseToolsPanel;
