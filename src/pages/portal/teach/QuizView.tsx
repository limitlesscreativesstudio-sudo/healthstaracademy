// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase, useAuth } from './AuthContext';
import { toast } from 'sonner';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B' } as const;

type QType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
interface Question {
  id?: string; position: number; question_type: QType; prompt: string;
  options: { text:string }[]; correct_answer: any; points: number;
}
interface Quiz { id:string; title:string; due_at:string|null; total_points:number; published:boolean; }

interface Props { courseId?: string; canEdit?: boolean; }

const emptyQuestion = (pos:number): Question => ({
  position: pos, question_type:'multiple_choice',
  prompt:'', options:[{text:''},{text:''},{text:''},{text:''}],
  correct_answer: 0, points: 1,
});

const QuizView: React.FC<Props> = ({ courseId, canEdit }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title:'', due_at:'', total_points:10 });
  const [taking, setTaking] = useState<Quiz | null>(null);
  const [attemptQs, setAttemptQs] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [lastScore, setLastScore] = useState<{score:number; max:number} | null>(null);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('quizzes').select('*').eq('course_id', courseId).order('created_at');
    setQuizzes(data ?? []);
    if (!canEdit && user?.id && data?.length) {
      const { data: att } = await supabase.from('quiz_attempts')
        .select('quiz_id,score,max_score').in('quiz_id', data.map(q => q.id)).eq('user_id', user.id);
      setAttemptedIds(new Set((att ?? []).map(a => a.quiz_id)));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId, user?.id]);

  const loadQuestions = async (quizId: string): Promise<Question[]> => {
    const { data } = await supabase.from('quiz_questions')
      .select('*').eq('quiz_id', quizId).order('position');
    return (data ?? []).map(q => ({
      id: q.id, position: q.position, question_type: q.question_type,
      prompt: q.prompt, options: q.options ?? [], correct_answer: q.correct_answer,
      points: Number(q.points ?? 1),
    }));
  };

  const startEdit = async (q: Quiz) => {
    setEditing(q);
    setQuestions(await loadQuestions(q.id));
  };

  const startTake = async (q: Quiz) => {
    setTaking(q);
    setLastScore(null);
    setAnswers({});
    setAttemptQs(await loadQuestions(q.id));
  };

  const createQuiz = async () => {
    if (!createForm.title.trim() || !courseId) return;
    const { data, error } = await supabase.from('quizzes').insert({
      course_id: courseId, title: createForm.title.trim(),
      due_at: createForm.due_at || null, total_points: createForm.total_points,
      published: false,
    }).select().single();
    if (error) return toast.error('Could not create quiz');
    setQuizzes(p => [...p, data]);
    setCreateForm({ title:'', due_at:'', total_points:10 });
    setShowCreate(false);
    toast.success('Quiz created');
    startEdit(data);
  };

  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion(qs.length)]);

  const updateQuestion = (idx:number, patch: Partial<Question>) => {
    setQuestions(qs => qs.map((q,i) => i===idx ? { ...q, ...patch } : q));
  };

  const removeQuestion = (idx:number) => setQuestions(qs => qs.filter((_,i) => i!==idx).map((q,i) => ({...q, position:i})));

  const saveQuestions = async () => {
    if (!editing) return;
    // Delete existing then bulk insert - simple approach
    await supabase.from('quiz_questions').delete().eq('quiz_id', editing.id);
    const rows = questions.map((q,i) => ({
      quiz_id: editing.id, position: i, question_type: q.question_type,
      prompt: q.prompt,
      options: q.question_type === 'true_false' ? [{text:'True'},{text:'False'}] : q.options,
      correct_answer: q.correct_answer, points: q.points,
    }));
    if (rows.length) {
      const { error } = await supabase.from('quiz_questions').insert(rows);
      if (error) return toast.error('Failed to save questions');
    }
    const total = rows.reduce((a,r) => a + Number(r.points||0), 0);
    await supabase.from('quizzes').update({ total_points: total }).eq('id', editing.id);
    setEditing(null);
    toast.success('Quiz saved');
    load();
  };

  const togglePub = async (q: Quiz) => {
    const { error } = await supabase.from('quizzes').update({ published: !q.published }).eq('id', q.id);
    if (error) return toast.error('Failed');
    setQuizzes(p => p.map(x => x.id===q.id ? { ...x, published: !x.published } : x));
    toast.success(q.published ? 'Unpublished' : 'Published');
  };

  const del = async (q: Quiz) => {
    if (!confirm('Delete this quiz?')) return;
    const { error } = await supabase.from('quizzes').delete().eq('id', q.id);
    if (error) return toast.error('Failed');
    setQuizzes(p => p.filter(x => x.id !== q.id));
    toast.success('Deleted');
  };

  const submitAttempt = async () => {
    if (!taking || !user?.id) return;
    // auto-grade MC/TF
    let score = 0, max = 0;
    attemptQs.forEach(q => {
      max += q.points;
      const a = answers[q.id!];
      if (q.question_type === 'multiple_choice' && a !== undefined && Number(a) === Number(q.correct_answer)) score += q.points;
      if (q.question_type === 'true_false' && a !== undefined && Number(a) === Number(q.correct_answer)) score += q.points;
    });
    const { error } = await supabase.from('quiz_attempts').insert({
      quiz_id: taking.id, user_id: user.id, answers, score, max_score: max,
      started_at: new Date().toISOString(), submitted_at: new Date().toISOString(),
    });
    if (error) return toast.error('Could not submit');
    setLastScore({ score, max });
    setAttemptedIds(s => new Set(s).add(taking.id));
    toast.success('Quiz submitted');
  };

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Select a course.</div>;
  if (loading) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading quizzes…</div>;

  // Taking a quiz (student) — Canvas-style layout with right-rail + sticky submit bar
  if (taking) {
    const answeredCount = attemptQs.filter(q => answers[q.id!] !== undefined && answers[q.id!] !== '').length;
    const startedAt = (taking as any)._startedAt as number | undefined;
    return (
      <div style={{ padding:'20px 24px 96px', maxWidth:1200, margin:'0 auto', fontFamily:'sans-serif', display:'grid', gridTemplateColumns:'minmax(0,1fr) 220px', gap:24 }}>
        <div style={{ minWidth:0 }}>
          <button onClick={() => { setTaking(null); setLastScore(null); }} style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', marginBottom:8, fontSize:13 }}>← Back to quizzes</button>
          <h2 style={{ margin:'0 0 6px', color:C.text }}>{taking.title}</h2>
          {canEdit && (
            <div style={{ background:'#FDECEA', border:'1px solid #F5C6CB', color:'#8A1F11', borderRadius:4, padding:'8px 12px', fontSize:12, marginBottom:12 }}>
              ⓘ This is a preview of the quiz — attempts are still recorded.
            </div>
          )}
          {taking.instructions && (
            <>
              <h3 style={{ margin:'12px 0 6px', fontSize:15, color:C.text }}>Quiz Instructions</h3>
              <p style={{ margin:'0 0 16px', fontSize:13, color:C.text, lineHeight:1.55 }}>{taking.instructions}</p>
            </>
          )}
          {lastScore ? (
            <div style={{ background:C.white, border:`2px solid ${C.success}`, borderRadius:8, padding:24, textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:10 }}>🎉</div>
              <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:6 }}>Your score: {lastScore.score} / {lastScore.max}</div>
              <div style={{ fontSize:14, color:C.muted }}>{Math.round((lastScore.score/Math.max(lastScore.max,1))*100)}%</div>
            </div>
          ) : attemptQs.length === 0 ? (
            <p style={{ color:C.muted }}>No questions.</p>
          ) : (
            <>
              {attemptQs.map((q,qi) => (
                <div id={`q-${qi+1}`} key={q.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#F8F6FC', borderBottom:`1px solid ${C.border}`, borderRadius:'6px 6px 0 0' }}>
                    <strong style={{ fontSize:14, color:C.text }}>Question {qi+1}</strong>
                    <span style={{ fontSize:12, color:C.muted }}>{q.points} pt{q.points===1?'':'s'}</span>
                  </div>
                  <div style={{ padding:16 }}>
                    <p style={{ margin:'0 0 12px', fontSize:14, color:C.text }}>{q.prompt}</p>
                    {q.question_type === 'multiple_choice' && q.options.map((o,oi) => (
                      <label key={oi} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', cursor:'pointer', fontSize:13, color:C.text, borderTop:oi===0?'none':`1px solid ${C.border}` }}>
                        <input type="radio" name={`q-${q.id}`} checked={answers[q.id!]===oi} onChange={() => setAnswers(a => ({ ...a, [q.id!]: oi }))} style={{ accentColor:C.primary }}/>
                        {o.text}
                      </label>
                    ))}
                    {q.question_type === 'true_false' && [{v:0,l:'True'},{v:1,l:'False'}].map((o,oi) => (
                      <label key={o.v} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', cursor:'pointer', fontSize:13, borderTop:oi===0?'none':`1px solid ${C.border}` }}>
                        <input type="radio" name={`q-${q.id}`} checked={answers[q.id!]===o.v} onChange={() => setAnswers(a => ({ ...a, [q.id!]: o.v }))} style={{ accentColor:C.primary }}/>
                        {o.l}
                      </label>
                    ))}
                    {(q.question_type === 'short_answer' || q.question_type === 'essay') && (
                      <textarea value={answers[q.id!] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id!]: e.target.value }))}
                        rows={q.question_type==='essay'?5:2}
                        style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', resize:'vertical', outline:'none' }}/>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right rail: question jump list */}
        {!lastScore && attemptQs.length > 0 && (
          <aside style={{ position:'sticky', top:16, alignSelf:'start', background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:14, fontSize:13 }}>
            <div style={{ fontWeight:700, color:C.text, marginBottom:8 }}>Questions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:'50vh', overflowY:'auto' }}>
              {attemptQs.map((q, qi) => {
                const answered = answers[q.id!] !== undefined && answers[q.id!] !== '';
                return (
                  <a key={q.id} href={`#q-${qi+1}`} style={{ color: answered ? C.success : C.primary, textDecoration:'none', padding:'3px 4px', borderRadius:3 }}>
                    {answered ? '● ' : '○ '}Question {qi+1}
                  </a>
                );
              })}
            </div>
            <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${C.border}`, fontSize:12, color:C.muted }}>
              Answered: <strong style={{ color:C.text }}>{answeredCount} / {attemptQs.length}</strong>
            </div>
          </aside>
        )}

        {/* Sticky submit bar */}
        {!lastScore && attemptQs.length > 0 && (
          <div style={{ position:'fixed', left:0, right:0, bottom:0, background:C.white, borderTop:`1px solid ${C.border}`, padding:'10px 20px', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:12, boxShadow:'0 -2px 8px rgba(0,0,0,.05)', zIndex:20 }}>
            <span style={{ fontSize:12, color:C.muted }}>Quiz autosaved locally</span>
            <button onClick={submitAttempt} style={{ padding:'8px 22px', border:'none', borderRadius:4, background:C.primary, color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>Submit Quiz</button>
          </div>
        )}
      </div>
    );
  }


  // Editing (instructor)
  if (editing) {
    return (
      <div style={{ padding:24, maxWidth:820, margin:'0 auto', fontFamily:'sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:C.text }}>{editing.title}</h2>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setEditing(null)} style={{ padding:'7px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>Cancel</button>
            <button onClick={saveQuestions} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, cursor:'pointer' }}>Save Quiz</button>
          </div>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:16, marginBottom:12 }}>
            <div style={{ display:'flex', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.muted, padding:'6px 0' }}>Q{qi+1}</span>
              <select value={q.question_type} onChange={e => updateQuestion(qi, { question_type: e.target.value as QType, correct_answer: 0 })}
                style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'5px 8px', fontSize:12 }}>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
                <option value="essay">Essay</option>
              </select>
              <input type="number" value={q.points} onChange={e => updateQuestion(qi, { points: parseInt(e.target.value)||1 })}
                style={{ width:70, border:`1px solid ${C.border}`, borderRadius:4, padding:'5px 8px', fontSize:12 }}/>
              <button onClick={() => removeQuestion(qi)} style={{ marginLeft:'auto', background:'none', border:'none', color:C.error, cursor:'pointer', fontSize:14 }}>✕</button>
            </div>
            <textarea value={q.prompt} onChange={e => updateQuestion(qi, { prompt: e.target.value })} rows={2} placeholder="Question prompt…"
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, boxSizing:'border-box', resize:'vertical', outline:'none', marginBottom:10 }}/>
            {q.question_type === 'multiple_choice' && (
              <div>
                {q.options.map((o, oi) => (
                  <div key={oi} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <input type="radio" name={`c-${qi}`} checked={q.correct_answer===oi} onChange={() => updateQuestion(qi, { correct_answer: oi })} style={{ accentColor:C.primary }}/>
                    <input value={o.text} onChange={e => updateQuestion(qi, { options: q.options.map((x,i) => i===oi ? { text:e.target.value } : x) })}
                      placeholder={`Choice ${oi+1}`}
                      style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 9px', fontSize:13, outline:'none' }}/>
                  </div>
                ))}
              </div>
            )}
            {q.question_type === 'true_false' && (
              <div>
                {[{v:0,l:'True'},{v:1,l:'False'}].map(o => (
                  <label key={o.v} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, fontSize:13 }}>
                    <input type="radio" name={`c-${qi}`} checked={q.correct_answer===o.v} onChange={() => updateQuestion(qi, { correct_answer: o.v })} style={{ accentColor:C.primary }}/>
                    {o.l} {q.correct_answer===o.v && <span style={{ color:C.success, fontSize:11 }}>(correct)</span>}
                  </label>
                ))}
              </div>
            )}
            {(q.question_type === 'short_answer' || q.question_type === 'essay') && (
              <div style={{ fontSize:11, color:C.muted, fontStyle:'italic' }}>Manually graded.</div>
            )}
          </div>
        ))}

        <button onClick={addQuestion} style={{ width:'100%', padding:11, border:`2px dashed ${C.border}`, borderRadius:6, background:'transparent', color:C.primary, fontSize:13, cursor:'pointer', fontWeight:600 }}>+ Add Question</button>
      </div>
    );
  }

  // List
  return (
    <div style={{ padding:24, fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text }}>Quizzes</h2>
        {canEdit && <button onClick={() => setShowCreate(v => !v)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, cursor:'pointer' }}>+ New Quiz</button>}
      </div>

      {showCreate && canEdit && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:20, marginBottom:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 100px', gap:12 }}>
            <input value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title:e.target.value }))} placeholder="Quiz name *"
              style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, outline:'none' }}/>
            <input type="datetime-local" value={createForm.due_at} onChange={e => setCreateForm(p => ({ ...p, due_at:e.target.value }))}
              style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, outline:'none' }}/>
            <input type="number" value={createForm.total_points} onChange={e => setCreateForm(p => ({ ...p, total_points:parseInt(e.target.value)||10 }))}
              style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, outline:'none' }}/>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={createQuiz} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, cursor:'pointer' }}>Create & Add Questions</button>
            <button onClick={() => setShowCreate(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', color:C.muted, background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>No quizzes yet.</div>
      ) : (
        <div style={{ display:'grid', gap:10 }}>
          {quizzes.map(q => {
            const taken = attemptedIds.has(q.id);
            const visible = canEdit || q.published;
            if (!visible) return null;
            return (
              <div key={q.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:22 }}>❓</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:C.primary }}>{q.title}</div>
                  <div style={{ fontSize:12, color:C.muted }}>
                    {q.due_at && `Due ${new Date(q.due_at).toLocaleDateString()} • `}{Number(q.total_points||0)} pts
                    {!canEdit && taken && <span style={{ color:C.success, marginLeft:8, fontWeight:600 }}>✓ Submitted</span>}
                  </div>
                </div>
                {canEdit ? (
                  <>
                    <span onClick={() => togglePub(q)} style={{ fontSize:11, padding:'2px 10px', borderRadius:20, background:q.published?'#e8f5e9':'#f5f3fa', color:q.published?C.success:C.muted, cursor:'pointer' }}>
                      {q.published?'● Published':'○ Unpublished'}
                    </span>
                    <button onClick={() => startEdit(q)} style={{ padding:'5px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>Edit</button>
                    <button onClick={() => del(q)} style={{ padding:'5px 10px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer', color:C.error }}>✕</button>
                  </>
                ) : (
                  <button onClick={() => startTake(q)} disabled={taken}
                    style={{ padding:'6px 14px', border:'none', borderRadius:5, background:taken?C.border:C.primary, color:'white', fontSize:13, cursor:taken?'not-allowed':'pointer', opacity:taken?.7:1 }}>
                    {taken ? 'Done' : 'Start Quiz'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizView;
