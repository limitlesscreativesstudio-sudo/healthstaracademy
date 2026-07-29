// Single-assignment page: students submit, instructors grade.
// Replaces the old behavior where /assignments/:id incorrectly showed the full list.
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { uploadViaXhr } from './uploadViaXhr';
import ContentViewer, { type ContentSource } from '@/components/portal/ContentViewer';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, CheckCircle2, Eye, Save } from 'lucide-react';

const C = {
  primary: '#7B4DB5', accent: '#5BC8E8', bg: '#F4F2FA', white: '#fff',
  border: '#D4C8E8', text: '#2D1B4E', muted: '#8878A8',
  success: '#127A1B', error: '#C0392B',
} as const;

interface Assignment {
  id: string; course_id: string; title: string; instructions: string | null;
  points: number; due_at: string | null; submission_type: string; published: boolean;
  rubric_id?: string | null;
}
interface RubricLite { id: string; title: string; description?: string | null; }
interface Criterion { id: string; title: string; description: string | null; points: number; position: number; }
interface Submission {
  id: string; assignment_id: string; user_id: string;
  body: string | null; file_url: string | null; file_name: string | null;
  submitted_at: string; updated_at: string;
}
interface Grade {
  score: number; max_score: number; feedback: string | null; graded_at: string;
}
interface StudentRow {
  user_id: string;
  full_name: string | null;
  submission?: Submission;
  grade?: Grade;
}

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const AssignmentDetail: React.FC = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const { user, isInstructor } = usePortalAuth(true);
  const isStaff = isInstructor;
  const location = useLocation();
  const navigate = useNavigate();
  const backTo = (location.state as { from?: string } | null)?.from
    || (courseId ? `/portal/courses/${courseId}?course=${courseId}&tab=modules` : '/portal/courses');

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Student state
  const [mySub, setMySub] = useState<Submission | null>(null);
  const [myGrade, setMyGrade] = useState<Grade | null>(null);
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Instructor state
  const [roster, setRoster] = useState<StudentRow[]>([]);
  const [viewer, setViewer] = useState<{ source: ContentSource; name: string } | null>(null);

  // Rubric state
  const [rubric, setRubric] = useState<RubricLite | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [courseRubrics, setCourseRubrics] = useState<RubricLite[]>([]);
  const [rubricScores, setRubricScores] = useState<Record<string, Record<string, { score:number; comment:string|null }>>>({});

  const overdue = useMemo(
    () => assignment?.due_at && new Date(assignment.due_at) < new Date(),
    [assignment],
  );

  // ── Load assignment
  useEffect(() => {
    if (!assignmentId) return;
    (async () => {
      setLoading(true); setErr(null);
      const { data, error } = await supabase
        .from('assignments').select('*').eq('id', assignmentId).maybeSingle();
      if (error || !data) { setErr(error?.message ?? 'Assignment not found'); setLoading(false); return; }
      setAssignment(data as Assignment);
      setLoading(false);
    })();
  }, [assignmentId]);

  // ── Student: load own submission + grade
  useEffect(() => {
    if (!assignmentId || !user || isStaff) return;
    (async () => {
      const [{ data: sub }, { data: gr }] = await Promise.all([
        supabase.from('submissions').select('*').eq('assignment_id', assignmentId).eq('user_id', user.id).maybeSingle(),
        supabase.from('grades').select('score,max_score,feedback,graded_at').eq('assignment_id', assignmentId).eq('user_id', user.id).maybeSingle(),
      ]);
      if (sub) { setMySub(sub as Submission); setBody(sub.body ?? ''); }
      if (gr) setMyGrade(gr as Grade);
    })();
  }, [assignmentId, user, isStaff]);

  // ── Rubric: attached rubric + criteria (+ course rubric list for instructors)
  useEffect(() => {
    if (!assignment) return;
    (async () => {
      if (isStaff) {
        const { data: list } = await supabase
          .from('rubrics').select('id,title').eq('course_id', assignment.course_id).order('title');
        setCourseRubrics((list ?? []) as RubricLite[]);
      }
      const rid = (assignment as any).rubric_id as string | null;
      if (!rid) { setRubric(null); setCriteria([]); setRubricScores({}); return; }
      const [{ data: r }, { data: crits }] = await Promise.all([
        supabase.from('rubrics').select('id,title,description').eq('id', rid).maybeSingle(),
        supabase.from('rubric_criteria').select('id,title,description,points,position').eq('rubric_id', rid).order('position'),
      ]);
      setRubric((r as RubricLite) ?? null);
      setCriteria((crits ?? []) as Criterion[]);

      let q = supabase.from('rubric_scores')
        .select('user_id,criterion_id,score,comment').eq('assignment_id', assignment.id);
      if (!isStaff && user) q = q.eq('user_id', user.id);
      const { data: rs } = await q;
      const map: Record<string, Record<string, { score:number; comment:string|null }>> = {};
      (rs ?? []).forEach((row: any) => {
        map[row.user_id] = map[row.user_id] ?? {};
        map[row.user_id][row.criterion_id] = { score: Number(row.score), comment: row.comment };
      });
      setRubricScores(map);
    })();
  }, [assignment, isStaff, user]);

  const attachRubric = async (rid: string) => {
    if (!assignment) return;
    const { error } = await supabase.from('assignments')
      .update({ rubric_id: rid || null }).eq('id', assignment.id);
    if (error) { alert('Could not attach rubric: ' + error.message); return; }
    setAssignment(a => a ? ({ ...a, rubric_id: rid || null } as Assignment) : a);
  };

  // Save criterion-level scores for one student, then roll up into the grade
  const saveRubricScores = async (
    uid: string,
    values: Record<string, { score: number; comment: string }>,
  ) => {
    if (!assignment || !rubric) return 0;
    const rows = criteria.map(c => ({
      assignment_id: assignment.id,
      user_id: uid,
      criterion_id: c.id,
      score: Number(values[c.id]?.score ?? 0),
      comment: values[c.id]?.comment || null,
      graded_by: user?.id ?? null,
      graded_at: new Date().toISOString(),
    }));
    await supabase.from('rubric_scores').delete().eq('assignment_id', assignment.id).eq('user_id', uid);
    const { error } = await supabase.from('rubric_scores').insert(rows);
    if (error) { alert('Rubric save failed: ' + error.message); return 0; }
    setRubricScores(prev => ({
      ...prev,
      [uid]: Object.fromEntries(rows.map(r => [r.criterion_id, { score: r.score, comment: r.comment }])),
    }));
    return rows.reduce((s, r) => s + Number(r.score || 0), 0);
  };

  // ── Instructor: load roster + submissions + grades
  useEffect(() => {
    if (!assignmentId || !courseId || !isStaff) return;
    (async () => {
      const { data: enrolls } = await supabase
        .from('enrollments').select('user_id').eq('course_id', courseId);
      const userIds = (enrolls ?? []).map(e => e.user_id);
      if (userIds.length === 0) { setRoster([]); return; }
      const [{ data: profiles }, { data: subs }, { data: grades }] = await Promise.all([
        supabase.from('profiles').select('user_id,full_name').in('user_id', userIds),
        supabase.from('submissions').select('*').eq('assignment_id', assignmentId),
        supabase.from('grades').select('user_id,score,max_score,feedback,graded_at').eq('assignment_id', assignmentId),
      ]);
      const subMap = new Map((subs ?? []).map(s => [s.user_id, s as Submission]));
      const grMap = new Map((grades ?? []).map(g => [g.user_id, g as any as Grade]));
      const nameMap = new Map((profiles ?? []).map(p => [p.user_id, p.full_name]));
      setRoster(userIds.map(uid => ({
        user_id: uid,
        full_name: nameMap.get(uid) ?? null,
        submission: subMap.get(uid),
        grade: grMap.get(uid),
      })));
    })();
  }, [assignmentId, courseId, isStaff]);

  // ── Student submit
  const handleSubmit = async () => {
    if (!assignment || !user) return;
    setUploading(true); setSaveMsg(null); setProgress(0);
    let file_url = mySub?.file_url ?? null;
    let file_name = mySub?.file_name ?? null;
    try {
      if (file) {
        const safe = file.name.replace(/[^\w.\-]+/g, '_');
        const path = `${assignment.course_id}/${assignment.id}/${user.id}/${Date.now()}-${safe}`;
        const { error } = await uploadViaXhr('submissions', path, file, {
          upsert: true, onProgress: setProgress,
        });
        if (error) throw error;
        file_url = path;
        file_name = file.name;
      }
      const payload = {
        assignment_id: assignment.id,
        user_id: user.id,
        body: body || null,
        file_url, file_name,
        submitted_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('submissions').upsert(payload, { onConflict: 'assignment_id,user_id' })
        .select().single();
      if (error) throw error;
      setMySub(data as Submission);
      setFile(null);
      setSaveMsg('Submitted successfully.');
    } catch (e: any) {
      setSaveMsg(`Error: ${e.message ?? e}`);
    } finally {
      setUploading(false);
    }
  };

  // ── Instructor grade update
  const saveGrade = async (uid: string, score: number, feedback: string) => {
    if (!assignment) return;
    const payload = {
      user_id: uid,
      assignment_id: assignment.id,
      course_id: assignment.course_id,
      score, max_score: assignment.points,
      feedback: feedback || null,
      graded_by: user?.id,
      graded_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('grades').upsert(payload as any, {
      onConflict: 'assignment_id,user_id',
    });
    if (error) { alert('Save failed: ' + error.message); return; }
    setRoster(rs => rs.map(r => r.user_id === uid
      ? { ...r, grade: { score, max_score: assignment.points, feedback, graded_at: payload.graded_at } }
      : r));
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: C.muted }}><Loader2 className="h-6 w-6 animate-spin inline mr-2" />Loading assignment…</div>;
  if (err || !assignment) return <div style={{ padding: 40, color: C.error }}>{err ?? 'Not found'}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', fontFamily: 'sans-serif', color: C.text }}>
      <button onClick={() => navigate(backTo)} style={{ color: C.primary, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>

      <div style={{ marginTop: 12, padding: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{assignment.title}</h1>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              {assignment.points} pts · Due {fmtDate(assignment.due_at)}
              {overdue && <span style={{ color: C.error, marginLeft: 8, fontWeight: 600 }}>OVERDUE</span>}
              {!assignment.published && <span style={{ color: C.error, marginLeft: 8, fontWeight: 600 }}>UNPUBLISHED</span>}
            </div>
          </div>
        </div>
        {assignment.instructions && (
          <div style={{ marginTop: 16, padding: 12, background: C.bg, borderRadius: 6, whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55 }}>
            {assignment.instructions}
          </div>
        )}
      </div>

      {/* ── RUBRIC ── */}
      <div style={{ marginTop: 20, padding: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Rubric</h2>
          {isStaff && (
            <select
              value={assignment.rubric_id ?? ''}
              onChange={e => attachRubric(e.target.value)}
              style={{ marginLeft: 'auto', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 13 }}
            >
              <option value="">No rubric attached</option>
              {courseRubrics.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          )}
        </div>

        {!rubric ? (
          <div style={{ fontSize: 13, color: C.muted, marginTop: 10 }}>
            {isStaff ? 'Attach a rubric to grade this assignment criterion by criterion.' : 'No rubric for this assignment.'}
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{rubric.title}</div>
            {rubric.description && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{rubric.description}</div>}
            <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: `1px solid ${C.border}` }}>Criterion</th>
                  <th style={{ textAlign: 'right', padding: 8, borderBottom: `1px solid ${C.border}`, width: 90 }}>Points</th>
                  {!isStaff && <th style={{ textAlign: 'right', padding: 8, borderBottom: `1px solid ${C.border}`, width: 90 }}>Earned</th>}
                </tr>
              </thead>
              <tbody>
                {criteria.map(c => {
                  const mine = user ? rubricScores[user.id]?.[c.id] : undefined;
                  return (
                    <tr key={c.id}>
                      <td style={{ padding: 8, borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontWeight: 600 }}>{c.title}</div>
                        {c.description && <div style={{ fontSize: 12, color: C.muted }}>{c.description}</div>}
                        {!isStaff && mine?.comment && <div style={{ fontSize: 12, color: C.primary, marginTop: 3 }}>{mine.comment}</div>}
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{c.points}</td>
                      {!isStaff && (
                        <td style={{ padding: 8, textAlign: 'right', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: mine ? C.success : C.muted }}>
                          {mine ? mine.score : '—'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ padding: 8, fontWeight: 700 }}>Total</td>
                  <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>{criteria.reduce((s, c) => s + Number(c.points || 0), 0)}</td>
                  {!isStaff && (
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>
                      {user && rubricScores[user.id]
                        ? Object.values(rubricScores[user.id]).reduce((s, v) => s + Number(v.score || 0), 0)
                        : '—'}
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── STUDENT VIEW ── */}
      {!isStaff && (
        <div style={{ marginTop: 20, padding: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Your Submission</h2>

          {myGrade && (
            <div style={{ padding: 12, background: '#EAF7EB', border: `1px solid ${C.success}33`, borderRadius: 6, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: C.success }}>
                Grade: {myGrade.score} / {myGrade.max_score}
              </div>
              {myGrade.feedback && <div style={{ fontSize: 13, marginTop: 6, whiteSpace: 'pre-wrap' }}><strong>Feedback:</strong> {myGrade.feedback}</div>}
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Graded {fmtDate(myGrade.graded_at)}</div>
            </div>
          )}

          {mySub && (
            <div style={{ padding: 12, background: C.bg, borderRadius: 6, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>
                <CheckCircle2 className="h-4 w-4 inline mr-1 text-green-600" />
                Last submitted {fmtDate(mySub.updated_at ?? mySub.submitted_at)}
              </div>
              {mySub.body && <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, marginBottom: 8 }}>{mySub.body}</div>}
              {mySub.file_url && (
                <button
                  onClick={() => setViewer({ source: { bucket: 'submissions', path: mySub.file_url! }, name: mySub.file_name ?? 'file' })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 5, background: C.white, cursor: 'pointer', fontSize: 13 }}
                >
                  <FileText className="h-4 w-4" /> {mySub.file_name}
                </button>
              )}
            </div>
          )}

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Text response (optional)</label>
          <textarea
            value={body} onChange={e => setBody(e.target.value)} rows={5}
            placeholder="Type your response…"
            style={{ width: '100%', padding: 10, border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
          />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Attach file (optional)</label>
          <input
            type="file"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav"
            style={{ fontSize: 13 }}
          />
          {file && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}

          {uploading && progress > 0 && (
            <div style={{ marginTop: 10, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: C.primary, transition: 'width .2s' }} />
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button onClick={handleSubmit} disabled={uploading || (!body && !file && !mySub)}>
              {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : <><Upload className="h-4 w-4 mr-2" />{mySub ? 'Resubmit' : 'Submit'}</>}
            </Button>
            {saveMsg && <span style={{ fontSize: 13, color: saveMsg.startsWith('Error') ? C.error : C.success }}>{saveMsg}</span>}
          </div>
        </div>
      )}

      {/* ── INSTRUCTOR VIEW ── */}
      {isStaff && (
        <div style={{ marginTop: 20, padding: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>
            Submissions ({roster.filter(r => r.submission).length} / {roster.length})
          </h2>
          {roster.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 14 }}>No students enrolled yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {roster.map(r => (
                <RosterRow
                  key={r.user_id}
                  row={r}
                  points={assignment.points}
                  criteria={criteria}
                  existingRubric={rubricScores[r.user_id]}
                  onSaveRubric={saveRubricScores}
                  onOpenFile={(src, name) => setViewer({ source: src, name })}
                  onSaveGrade={saveGrade}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ContentViewer
        open={!!viewer}
        onClose={() => setViewer(null)}
        source={viewer?.source ?? null}
        fileName={viewer?.name}
        title={viewer?.name}
      />
    </div>
  );
};

const RosterRow: React.FC<{
  row: StudentRow;
  points: number;
  onOpenFile: (src: ContentSource, name: string) => void;
  onSaveGrade: (uid: string, score: number, feedback: string) => void;
}> = ({ row, points, onOpenFile, onSaveGrade }) => {
  const [score, setScore] = useState<string>(row.grade?.score?.toString() ?? '');
  const [feedback, setFeedback] = useState<string>(row.grade?.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const submitted = !!row.submission;
  const graded = !!row.grade;

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, background: C.white }}>
      <div style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{row.full_name ?? row.user_id.slice(0, 8)}</div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {submitted ? `Submitted ${fmtDate(row.submission!.submitted_at)}` : 'Not submitted'}
            {graded && ` · Grade ${row.grade!.score}/${row.grade!.max_score}`}
          </div>
        </div>
        {submitted && (
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 4, background: C.bg, fontSize: 12, cursor: 'pointer' }}
          >
            {expanded ? 'Hide' : 'Review'}
          </button>
        )}
      </div>
      {expanded && submitted && (
        <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, background: C.bg }}>
          {row.submission!.body && (
            <div style={{ padding: 10, background: C.white, borderRadius: 4, whiteSpace: 'pre-wrap', fontSize: 13, marginBottom: 10 }}>
              {row.submission!.body}
            </div>
          )}
          {row.submission!.file_url && (
            <button
              onClick={() => onOpenFile(
                { bucket: 'submissions', path: row.submission!.file_url! },
                row.submission!.file_name ?? 'file',
              )}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: `1px solid ${C.primary}`, borderRadius: 5, background: C.white, cursor: 'pointer', fontSize: 13, color: C.primary, marginBottom: 12 }}
            >
              <Eye className="h-4 w-4" /> View {row.submission!.file_name}
            </button>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 2 }}>Score / {points}</label>
              <input
                type="number" min={0} max={points} value={score}
                onChange={e => setScore(e.target.value)}
                style={{ width: 90, padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 2 }}>Feedback</label>
              <textarea
                value={feedback} onChange={e => setFeedback(e.target.value)} rows={2}
                style={{ width: '100%', padding: 6, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
            <button
              disabled={saving || score === ''}
              onClick={async () => {
                setSaving(true);
                await onSaveGrade(row.user_id, parseFloat(score) || 0, feedback);
                setSaving(false);
              }}
              style={{ alignSelf: 'flex-end', padding: '8px 14px', border: 'none', borderRadius: 4, background: C.primary, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              <Save className="h-3.5 w-3.5 inline mr-1" />{saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail;
