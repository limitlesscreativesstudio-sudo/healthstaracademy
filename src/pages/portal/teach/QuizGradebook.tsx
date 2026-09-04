// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './AuthContext';
import { toast } from 'sonner';

const C = { primary:'#7B4DB5', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const pctColor = (p: number) => p >= 80 ? C.success : p >= 70 ? C.warn : C.error;

interface Props { courseId?: string; canEdit?: boolean; selfOnly?: boolean; }
interface Quiz { id: string; title: string; total_points: number; attempts_allowed: number; }
interface Student { id: string; name: string; }
interface Cell { attemptId: string | null; score: number | null; max: number | null; used: number; inProgress: number; awaiting: number; startedAt: string | null; }

const QuizGradebook: React.FC<Props> = ({ courseId, canEdit, selfOnly }) => {
  const [quizzes, setQuizzes]   = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [cells, setCells]       = useState<Record<string, Cell>>({}); // `${uid}|${qid}`
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [editing, setEditing]   = useState<{ uid: string; qid: string } | null>(null);
  const [editVal, setEditVal]   = useState('');

  const key = (uid: string, qid: string) => `${uid}|${qid}`;

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);

    let userIds: string[] = [];
    if (selfOnly) {
      const { data: auth } = await supabase.auth.getUser();
      userIds = auth?.user?.id ? [auth.user.id] : [];
    } else {
      const { data: enrs } = await supabase.from('enrollments')
        .select('user_id').eq('course_id', courseId).eq('role', 'student');
      userIds = (enrs ?? []).map((e: any) => e.user_id);
    }

    let studs: Student[] = [];
    if (userIds.length) {
      const { data: profs } = await supabase.from('profiles')
        .select('user_id, full_name').in('user_id', userIds);
      const byId = new Map((profs ?? []).map((p: any) => [p.user_id, p.full_name]));
      studs = userIds
        .map(id => ({ id, name: byId.get(id) || 'Student' }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    setStudents(studs);

    const { data: qzs } = await supabase.from('quizzes')
      .select('id,title,total_points,attempts_allowed,created_at')
      .eq('course_id', courseId).order('created_at');
    const qList: Quiz[] = (qzs ?? []).map((q: any) => ({
      id: q.id, title: q.title,
      total_points: Number(q.total_points ?? 0),
      attempts_allowed: Math.max(1, Number(q.attempts_allowed ?? 1)),
    })).sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));
    setQuizzes(qList);

    const map: Record<string, Cell> = {};
    if (qList.length && studs.length) {
      const { data: attempts } = await supabase.from('quiz_attempts')
        .select('id,user_id,quiz_id,score,max_score,submitted_at,started_at,grading_status')
        .in('quiz_id', qList.map(q => q.id))
        .order('started_at');
      for (const a of (attempts ?? [])) {
        const k = key(a.user_id, a.quiz_id);
        const cur = map[k] ?? { attemptId: null, score: null, max: null, used: 0, inProgress: 0, awaiting: 0, startedAt: null };
        cur.used += 1;
        if (!a.submitted_at) {
          cur.inProgress += 1;
          if (!cur.startedAt || a.started_at < cur.startedAt) cur.startedAt = a.started_at;
        } else if (a.grading_status !== 'released') {
          // Submitted but the instructor has not released a grade yet.
          cur.awaiting += 1;
          if (!cur.attemptId) cur.attemptId = a.id;
        } else {
          const s = a.score == null ? null : Number(a.score);
          if (cur.score == null || (s != null && s > cur.score)) {
            cur.score = s; cur.max = a.max_score == null ? null : Number(a.max_score); cur.attemptId = a.id;
          }
        }
        map[k] = cur;
      }
    }
    setCells(map);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId, selfOnly]);

  const needsAttention = useMemo(
    () => Object.values(cells).reduce((n, c) => n + (c.inProgress || 0), 0),
    [cells]
  );
  const awaitingGrading = useMemo(
    () => Object.values(cells).reduce((n, c) => n + (c.awaiting || 0), 0),
    [cells]
  );

  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? students.filter(s => s.name.toLowerCase().includes(q)) : students;
  }, [students, search]);

  const startEdit = (uid: string, qid: string) => {
    if (!canEdit || selfOnly) return;
    const c = cells[key(uid, qid)];
    if (!c?.attemptId) { toast.info('No submitted attempt yet — a score can be set once the student submits.'); return; }
    setEditing({ uid, qid });
    setEditVal(c.score == null ? '' : String(c.score));
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { uid, qid } = editing;
    const quiz = quizzes.find(q => q.id === qid);
    const cell = cells[key(uid, qid)];
    const raw = editVal.trim();
    setEditing(null);
    if (!cell?.attemptId || raw === '') return;
    const score = Number(raw);
    const max = cell.max ?? quiz?.total_points ?? 0;
    if (!isFinite(score) || score < 0) { toast.error('Score must be a non-negative number'); return; }
    if (max > 0 && score > max) { toast.error(`Score exceeds max (${max})`); return; }

    const prev = cell.score;
    setCells(p => ({ ...p, [key(uid, qid)]: { ...p[key(uid, qid)], score } }));

    const { error } = await supabase.from('quiz_attempts')
      .update({ score, max_score: max || null }).eq('id', cell.attemptId);
    if (error) {
      setCells(p => ({ ...p, [key(uid, qid)]: { ...p[key(uid, qid)], score: prev } }));
      toast.error('Save failed: ' + error.message);
      return;
    }
    const { data: g } = await supabase.from('grades')
      .select('id').eq('quiz_attempt_id', cell.attemptId).maybeSingle();
    if (g?.id) {
      await supabase.from('grades')
        .update({ score, max_score: max || 0, feedback: 'Manually adjusted by instructor', graded_at: new Date().toISOString() })
        .eq('id', g.id);
    } else if (courseId) {
      await supabase.from('grades').insert({
        course_id: courseId, user_id: uid, quiz_attempt_id: cell.attemptId,
        score, max_score: max || 0, feedback: 'Manually adjusted by instructor',
      });
    }
    toast.success('Quiz score updated');
  };

  const rowTotals = (uid: string) => {
    let got = 0, poss = 0;
    for (const q of quizzes) {
      const c = cells[key(uid, q.id)];
      if (!c || c.score == null) continue;
      got += c.score; poss += (c.max ?? q.total_points ?? 0);
    }
    return { got, poss, pct: poss > 0 ? Math.round((got / poss) * 100) : null };
  };

  const th: React.CSSProperties = { padding:'10px 12px', textAlign:'left', fontSize:12, fontWeight:700, color:C.text, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' };
  const td: React.CSSProperties = { padding:'8px 12px', fontSize:13, color:C.text, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' };

  if (loading) return <div style={{ padding:32, color:C.muted, fontFamily:'sans-serif' }}>Loading quiz gradebook…</div>;

  return (
    <div style={{ padding:24, fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:14 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text }}>{selfOnly ? 'My Quiz Scores' : 'Quiz Gradebook'}</h2>
          <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
            Best score per quiz, attempts remaining{canEdit && !selfOnly ? ', and manual score edits (click a score)' : ''}.
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {!selfOnly && (
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
              aria-label="Search students"
              style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, minWidth:170 }} />
          )}
          <button onClick={load} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>🔄 Refresh</button>
        </div>
      </div>

      {!selfOnly && (needsAttention > 0 || awaitingGrading > 0) && (
        <div style={{ marginBottom:12, padding:'9px 13px', background:'#FFF6E8', border:`1px solid ${C.warn}55`, borderRadius:6, fontSize:12.5, color:C.text }}>
          ⚠️ Needs attention:{' '}
          {awaitingGrading > 0 && <><strong>{awaitingGrading}</strong> submission{awaitingGrading === 1 ? '' : 's'} awaiting your grading. </>}
          {needsAttention > 0 && <><strong>{needsAttention}</strong> unfinished attempt{needsAttention === 1 ? '' : 's'} still in progress. </>}
          Open the quiz&rsquo;s Grade panel to score and release results.
        </div>
      )}

      {(!quizzes.length || !students.length) ? (
        <div style={{ padding:36, textAlign:'center', color:C.muted, background:C.white, border:`1px solid ${C.border}`, borderRadius:8 }}>
          {quizzes.length ? 'No students enrolled in this course yet.' : 'No quizzes in this course yet.'}
        </div>
      ) : (
        <div style={{ overflowX:'auto', background:C.white, border:`1px solid ${C.border}`, borderRadius:8 }}>
          <table style={{ borderCollapse:'collapse', width:'100%', minWidth:600 }}>
            <thead style={{ background:C.bg }}>
              <tr>
                <th style={{ ...th, position:'sticky', left:0, background:C.bg, zIndex:2 }}>Student</th>
                {quizzes.map(q => (
                  <th key={q.id} style={th}>
                    <div>{q.title}</div>
                    <div style={{ fontWeight:400, fontSize:11, color:C.muted }}>
                      /{q.total_points} · {q.attempts_allowed} attempt{q.attempts_allowed === 1 ? '' : 's'}
                    </div>
                  </th>
                ))}
                <th style={th}>Quiz Total</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map(s => {
                const t = rowTotals(s.id);
                return (
                  <tr key={s.id}>
                    <td style={{ ...td, position:'sticky', left:0, background:C.white, fontWeight:600, zIndex:1 }}>{s.name}</td>
                    {quizzes.map(q => {
                      const c = cells[key(s.id, q.id)];
                      const used = c?.used ?? 0;
                      const left = Math.max(0, q.attempts_allowed - used);
                      const isEditing = editing?.uid === s.id && editing?.qid === q.id;
                      return (
                        <td key={q.id} style={td}>
                          {isEditing ? (
                            <input autoFocus value={editVal} inputMode="decimal"
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={saveEdit}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
                              style={{ width:64, padding:'4px 6px', border:`1px solid ${C.primary}`, borderRadius:4, fontSize:13 }} />
                          ) : (
                            <button
                              onClick={() => startEdit(s.id, q.id)}
                              disabled={!canEdit || selfOnly}
                              title={canEdit && !selfOnly ? 'Click to edit score' : undefined}
                              style={{ border:'none', background:'transparent', padding:0, textAlign:'left', cursor: canEdit && !selfOnly ? 'pointer' : 'default', fontFamily:'inherit' }}>
                              <div style={{ fontWeight:600, color: c?.score == null ? C.muted : pctColor(((c.score) / (c.max || q.total_points || 1)) * 100) }}>
                                {c?.score == null ? '—' : `${c.score} / ${c.max ?? q.total_points}`}
                              </div>
                              <div style={{ fontSize:11, color: left === 0 ? C.error : C.muted }}>
                                {used} used · {left} left
                              </div>
                              {c?.inProgress ? (
                                <div style={{ fontSize:11, color:C.warn, fontWeight:600 }}
                                  title={c.startedAt ? `Started ${new Date(c.startedAt).toLocaleString()}` : undefined}>
                                  ⏳ in progress
                                </div>
                              ) : null}
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ ...td, fontWeight:700, color: t.pct == null ? C.muted : pctColor(t.pct) }}>
                      {t.pct == null ? '—' : `${t.got}/${t.poss} · ${t.pct}%`}
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

export default QuizGradebook;
