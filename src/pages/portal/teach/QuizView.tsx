// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase, useAuth } from './AuthContext';
import { toast } from 'sonner';


const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

type QType = 'multiple_choice' | 'multiple_answers' | 'true_false' | 'short_answer' | 'essay';
interface Question {
  id?: string; position: number; question_type: QType; prompt: string;
  options: { text:string }[]; correct_answer: any; points: number;
}
interface Quiz { id:string; title:string; due_at:string|null; total_points:number; published:boolean; instructions?: string; }
interface Stats { attempts:number; submitted:number; avgPct:number; }

interface Props { courseId?: string; canEdit?: boolean; }

const emptyQuestion = (pos:number): Question => ({
  position: pos, question_type:'multiple_choice',
  prompt:'', options:[{text:''},{text:''},{text:''},{text:''}],
  correct_answer: 0, points: 1,
});

const QuizView: React.FC<Props> = ({ courseId: courseIdProp, canEdit: canEditProp }) => {
  const { user } = useAuth();
  const params = useParams<{ courseId?: string; quizId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = courseIdProp ?? params.courseId;
  const canEdit = canEditProp ?? !!user?.canEdit;
  const routeQuizId = params.quizId;
  const [autoOpened, setAutoOpened] = useState(false);
  const moduleReturnPath = (location.state as { from?: string } | null)?.from || (courseId ? `/portal/courses/${courseId}?course=${courseId}&tab=modules` : '/portal/courses');
  const backToList = () => (routeQuizId ? navigate(moduleReturnPath, { replace: true }) : setViewing(null));

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title:'', instructions:'', due_at:'', total_points:10 });
  const [taking, setTaking] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptQs, setAttemptQs] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [results, setResults] = useState<{ score:number; max:number; perQ:{qid:string; correct:boolean; user:any; expected:any; auto:boolean}[] } | null>(null);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Quiz & { attempts_allowed?: number; time_limit_minutes?: number | null } | null>(null);
  const [viewQCount, setViewQCount] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [hideTime, setHideTime] = useState(false);
  const [timeLimitMin, setTimeLimitMin] = useState<number | null>(null);
  const autoSubmittedRef = useRef(false);
  const saveTimer = useRef<any>(null);
  const retryTimer = useRef<any>(null);
  const retryAttempt = useRef<number>(0);
  const inFlight = useRef<boolean>(false);
  const answersRef = useRef<Record<string, any>>({});
  const draftKey = (quizId?: string) => (user?.id && quizId ? `hsa_quiz_draft_${quizId}_${user.id}` : null);
  const loadLocalDraft = (quizId: string): Record<string, any> | null => {
    const k = draftKey(quizId); if (!k) return null;
    try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : null; } catch { return null; }
  };
  const writeLocalDraft = (quizId: string, val: Record<string, any>) => {
    const k = draftKey(quizId); if (!k) return;
    try { localStorage.setItem(k, JSON.stringify(val)); } catch { /* quota */ }
  };
  const clearLocalDraft = (quizId: string) => {
    const k = draftKey(quizId); if (!k) return;
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  };

  const openDetails = async (q: Quiz) => {
    const { data: full } = await supabase.from('quizzes').select('*').eq('id', q.id).maybeSingle();
    setViewing(full ?? q as any);
    const { count } = await supabase.from('quiz_questions').select('id', { count:'exact', head:true }).eq('quiz_id', q.id);
    setViewQCount(count ?? 0);
  };

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('quizzes').select('*').eq('course_id', courseId).order('created_at');
    const sorted = (data ?? []).slice().sort((a: any, b: any) => {
      const parse = (t: string) => {
        const m = String(t || '').match(/^\s*(\d+)(?:\.(\d+))?/);
        return m ? [parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0] : [Number.POSITIVE_INFINITY, 0];
      };
      const [a1, a2] = parse(a.title);
      const [b1, b2] = parse(b.title);
      if (a1 !== b1) return a1 - b1;
      if (a2 !== b2) return a2 - b2;
      return String(a.title).localeCompare(String(b.title));
    });
    setQuizzes(sorted);
    if (data?.length) {
      if (!canEdit && user?.id) {
        const { data: att } = await supabase.from('quiz_attempts')
          .select('quiz_id,submitted_at').in('quiz_id', data.map(q => q.id)).eq('user_id', user.id);
        setAttemptedIds(new Set((att ?? []).filter(a => a.submitted_at).map(a => a.quiz_id)));
      }
      if (canEdit) {
        // load analytics for instructors
        const { data: allAtt } = await supabase.from('quiz_attempts')
          .select('quiz_id,score,max_score,submitted_at').in('quiz_id', data.map(q => q.id));
        const s: Record<string, Stats> = {};
        data.forEach(q => { s[q.id] = { attempts:0, submitted:0, avgPct:0 }; });
        const sums: Record<string, {sum:number; n:number}> = {};
        (allAtt ?? []).forEach(a => {
          const st = s[a.quiz_id]; if (!st) return;
          st.attempts++;
          if (a.submitted_at && a.max_score) {
            st.submitted++;
            const acc = sums[a.quiz_id] ?? {sum:0, n:0};
            acc.sum += (Number(a.score)/Number(a.max_score))*100; acc.n++;
            sums[a.quiz_id] = acc;
          }
        });
        Object.keys(sums).forEach(k => { s[k].avgPct = Math.round(sums[k].sum / sums[k].n); });
        setStats(s);
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId, user?.id]);

  useEffect(() => {
    if (autoOpened || !routeQuizId || !quizzes.length) return;
    const q = quizzes.find(x => x.id === routeQuizId);
    if (q) { openDetails(q); setAutoOpened(true); }
  }, [routeQuizId, quizzes, autoOpened]);


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
    setResults(null);
    setAttemptId(null);
    setSaveState('idle');
    setLastSavedAt(null);
    retryAttempt.current = 0;
    autoSubmittedRef.current = false;
    // Pull optional time_limit_minutes so we can enforce a countdown.
    const { data: full } = await supabase.from('quizzes').select('time_limit_minutes').eq('id', q.id).maybeSingle();
    setTimeLimitMin((full as any)?.time_limit_minutes ?? null);
    const local = loadLocalDraft(q.id) ?? {};
    setAnswers(local);
    answersRef.current = local;
    const qs = await loadQuestions(q.id);
    setAttemptQs(qs);
    if (!user?.id) { setStartedAt(new Date()); return; }
    // Resume open attempt or create a new one
    const { data: open } = await supabase.from('quiz_attempts')
      .select('id, answers, started_at').eq('quiz_id', q.id).eq('user_id', user.id).is('submitted_at', null)
      .order('started_at', { ascending:false }).limit(1).maybeSingle();
    if (open) {
      setAttemptId(open.id);
      setStartedAt(open.started_at ? new Date(open.started_at) : new Date());
      const merged = { ...(open.answers as any || {}), ...local };
      setAnswers(merged);
      answersRef.current = merged;
      writeLocalDraft(q.id, merged);
      toast.info('Resumed your in-progress attempt');
    } else {
      const startIso = new Date().toISOString();
      const { data: made } = await supabase.from('quiz_attempts').insert({
        quiz_id: q.id, user_id: user.id, answers: local, started_at: startIso,
      }).select('id').single();
      if (made) setAttemptId(made.id);
      setStartedAt(new Date(startIso));
    }
  };

  const flushSave = async () => {
    if (!attemptId || inFlight.current) return;
    const snapshot = answersRef.current;
    inFlight.current = true;
    setSaveState('saving');
    const { error } = await supabase.from('quiz_attempts').update({ answers: snapshot }).eq('id', attemptId);
    inFlight.current = false;
    if (error) {
      setSaveState('error');
      retryAttempt.current += 1;
      // Exponential backoff: 2s, 4s, 8s, capped at 30s.
      const delay = Math.min(30000, 2000 * Math.pow(2, retryAttempt.current - 1));
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = setTimeout(flushSave, delay);
    } else {
      retryAttempt.current = 0;
      setSaveState('saved');
      setLastSavedAt(new Date());
    }
  };

  // Persist to localStorage immediately and debounce the server save.
  useEffect(() => {
    if (!taking || results) return;
    answersRef.current = answers;
    writeLocalDraft(taking.id, answers);
    if (!attemptId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, 700);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, attemptId, taking, results]);

  // Retry pending saves when the browser comes back online.
  useEffect(() => {
    if (!taking || results) return;
    const onOnline = () => { if (saveState === 'error') flushSave(); };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taking, results, saveState, attemptId]);

  // Live timer tick — updates every second while a quiz is in progress.
  useEffect(() => {
    if (!taking || results) return;
    const iv = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [taking, results]);

  // Auto-submit when the time limit expires.
  useEffect(() => {
    if (!taking || results || !startedAt || !timeLimitMin || autoSubmittedRef.current) return;
    const remainingMs = startedAt.getTime() + timeLimitMin * 60_000 - nowTick;
    if (remainingMs <= 0) {
      autoSubmittedRef.current = true;
      toast.warning('Time is up — submitting your quiz.');
      submitAttempt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowTick, taking, results, startedAt, timeLimitMin]);


  const createQuiz = async () => {
    if (!createForm.title.trim() || !courseId) return;
    const { data, error } = await supabase.from('quizzes').insert({
      course_id: courseId, title: createForm.title.trim(),
      instructions: createForm.instructions.trim() || null,
      due_at: createForm.due_at || null, total_points: createForm.total_points,
      published: false,
    }).select().single();
    if (error) return toast.error('Could not create quiz');
    setQuizzes(p => [...p, data]);
    setCreateForm({ title:'', instructions:'', due_at:'', total_points:10 });
    setShowCreate(false);
    toast.success('Quiz created');
    startEdit(data);
  };

  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion(qs.length)]);
  const updateQuestion = (idx:number, patch: Partial<Question>) => setQuestions(qs => qs.map((q,i) => i===idx ? { ...q, ...patch } : q));
  const removeQuestion = (idx:number) => setQuestions(qs => qs.filter((_,i) => i!==idx).map((q,i) => ({...q, position:i})));

  const saveQuestions = async () => {
    if (!editing) return;
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
    const { error: metaErr } = await supabase.from('quizzes').update({
      total_points: total,
      title: (editing.title || '').trim() || 'Untitled Quiz',
      instructions: (editing.instructions || '').trim() || null,
      due_at: editing.due_at || null,
    }).eq('id', editing.id);
    if (metaErr) return toast.error('Failed to save quiz details');
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
    if (!taking || !user?.id || !attemptId) return;
    let score = 0, max = 0;
    const perQ: {qid:string; correct:boolean; user:any; expected:any; auto:boolean}[] = [];
    attemptQs.forEach(q => {
      max += q.points;
      const a = answers[q.id!];
      let ok = false; let auto = true;
      if (q.question_type === 'multiple_choice') ok = a !== undefined && Number(a) === Number(q.correct_answer);
      else if (q.question_type === 'true_false') ok = a !== undefined && Number(a) === Number(q.correct_answer);
      else if (q.question_type === 'multiple_answers') {
        const exp = Array.isArray(q.correct_answer) ? [...q.correct_answer].map(Number).sort() : [];
        const got = Array.isArray(a) ? [...a].map(Number).sort() : [];
        ok = exp.length > 0 && exp.length === got.length && exp.every((v,i) => v === got[i]);
      }
      else auto = false; // manually graded
      if (auto && ok) score += q.points;
      perQ.push({ qid:q.id!, correct:ok, user:a, expected:q.correct_answer, auto });
    });
    const { error } = await supabase.from('quiz_attempts').update({
      answers, score, max_score: max, submitted_at: new Date().toISOString(),
    }).eq('id', attemptId);
    if (error) return toast.error('Could not submit');
    clearLocalDraft(taking.id);
    setResults({ score, max, perQ });
    setAttemptedIds(s => new Set(s).add(taking.id));
    toast.success('Quiz submitted');
  };

  const downloadReview = () => {
    if (!taking || !results) return;
    const lines = [`Quiz: ${taking.title}`, `Score: ${results.score} / ${results.max} (${Math.round((results.score/Math.max(results.max,1))*100)}%)`, ''];
    attemptQs.forEach((q, i) => {
      const r = results.perQ.find(x => x.qid === q.id!);
      lines.push(`Q${i+1} (${q.points} pt): ${q.prompt}`);
      const uAns = r?.user;
      const uText = q.question_type === 'multiple_choice' ? q.options[uAns]?.text ?? '(no answer)'
        : q.question_type === 'true_false' ? (uAns===0?'True':uAns===1?'False':'(no answer)')
        : q.question_type === 'multiple_answers' ? (Array.isArray(uAns) && uAns.length ? uAns.map((i:number)=>q.options[i]?.text).filter(Boolean).join('; ') : '(no answer)')
        : (uAns ?? '(no answer)');
      const eText = q.question_type === 'multiple_choice' ? q.options[q.correct_answer]?.text
        : q.question_type === 'true_false' ? (q.correct_answer===0?'True':'False')
        : q.question_type === 'multiple_answers' ? (Array.isArray(q.correct_answer) ? q.correct_answer.map((i:number)=>q.options[i]?.text).filter(Boolean).join('; ') : '')
        : '(manually graded)';
      lines.push(`  Your answer: ${uText}`);
      lines.push(`  Correct:     ${eText}`);
      lines.push(`  ${r?.auto ? (r.correct ? '✓ Correct' : '✗ Incorrect') : '⧗ Pending grading'}`);
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type:'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${taking.title.replace(/[^\w]+/g,'_')}_review.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Select a course.</div>;
  if (loading) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading quizzes…</div>;

  // Quiz details (Canvas-style summary)
  if (viewing && !taking && !editing) {
    const q = viewing;
    const fmtDate = (d: string | null) => d ? new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }) : '—';
    const row = (label:string, value:React.ReactNode) => (
      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ textAlign:'right', paddingRight:16, fontWeight:600, color:C.text, fontSize:13 }}>{label}</div>
        <div style={{ color:C.text, fontSize:13 }}>{value}</div>
      </div>
    );
    return (
      <div style={{ padding:'20px 24px', maxWidth:1100, margin:'0 auto', fontFamily:'sans-serif' }}>
        <button onClick={backToList} style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', marginBottom:8, fontSize:13 }}>← {routeQuizId ? 'Back' : 'Back to quizzes'}</button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:14, flexWrap:'wrap' }}>
          <h2 style={{ margin:0, fontSize:22, color:C.text }}>{q.title}</h2>
          {canEdit && (
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={async () => { await togglePub(q as any); openDetails(q as any); }}
                style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:q.published?'#e8f5e9':C.white, color:q.published?C.success:C.text, fontSize:13, cursor:'pointer', fontWeight:600 }}>
                {q.published ? '● Published' : '○ Publish'}
              </button>
              <button onClick={() => { const cur = q; setViewing(null); startTake(cur as any); }} style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>Preview</button>
              <button onClick={() => { const cur = q; setViewing(null); startEdit(cur as any); }} style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>✎ Edit</button>
              <button onClick={() => { const cur = q; setViewing(null); startEdit(cur as any); }} style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer', color:C.primary, fontWeight:600 }}>✎ Keep Editing This Quiz</button>
            </div>
          )}
        </div>
        {canEdit && !q.published && (
          <div style={{ background:'#FDECEA', border:'1px solid #F5C6CB', color:'#8A1F11', borderRadius:4, padding:'10px 14px', fontSize:12, marginBottom:16 }}>
            <div style={{ fontWeight:700 }}>This quiz is unpublished</div>
            Only teachers can see the quiz until it is published.
          </div>
        )}

        {q.instructions && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:'12px 16px', marginBottom:16, fontSize:13, color:C.text, whiteSpace:'pre-wrap' }}>
            {q.instructions}
          </div>
        )}

        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:'8px 20px', marginBottom:20 }}>
          {row('Quiz Type', 'Graded Quiz')}
          {row('Points', Number(q.total_points || 0))}
          {row('Questions', viewQCount)}
          {row('Assignment Group', 'Assignments')}
          {row('Shuffle Answers', 'No')}
          {row('Time Limit', q.time_limit_minutes ? `${q.time_limit_minutes} minutes` : 'No Time Limit')}
          {row('Multiple Attempts', (q.attempts_allowed ?? 1) > 1 ? `Yes (${q.attempts_allowed} allowed)` : 'No')}
          {row('View Responses', 'Always')}
          {row('Show Correct Answers', 'Immediately')}
          <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', padding:'8px 0' }}>
            <div style={{ textAlign:'right', paddingRight:16, fontWeight:600, color:C.text, fontSize:13 }}>One Question at a Time</div>
            <div style={{ color:C.text, fontSize:13 }}>No</div>
          </div>
        </div>

        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden', marginBottom:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'10px 16px', fontWeight:700, fontSize:12, color:C.text, background:C.bg, borderBottom:`1px solid ${C.border}` }}>
            <div>Due</div><div>For</div><div>Available from</div><div>Until</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'10px 16px', fontSize:13, color:C.text }}>
            <div>{fmtDate(q.due_at)}</div><div>Everyone</div><div>—</div><div>—</div>
          </div>
        </div>

        <div style={{ textAlign:'center', marginBottom:20 }}>
          <button onClick={() => { const cur = q; setViewing(null); startTake(cur as any); }}
            style={{ padding:'10px 28px', border:'none', borderRadius:5, background:C.accent, color:C.text, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            {canEdit ? 'Preview' : (attemptedIds.has(q.id) ? 'Review' : 'Take the Quiz')}
          </button>
        </div>

        {canEdit && (
          <>
            <hr style={{ border:0, borderTop:`1px solid ${C.border}`, margin:'20px 0' }}/>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => toast.info('Open the Rubrics tab to create a rubric, then attach it here.')} style={{ padding:'8px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>+ Create Rubric</button>
              <button onClick={() => toast.info('Open the Rubrics tab to browse rubrics.')} style={{ padding:'8px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>🔍 Find Rubric</button>
            </div>
            {stats[q.id] && (
              <div style={{ marginTop:24, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                <Stat label="Attempts" value={stats[q.id].attempts} />
                <Stat label="Completion" value={stats[q.id].attempts ? `${Math.round((stats[q.id].submitted/stats[q.id].attempts)*100)}%` : '—'} sub={`${stats[q.id].submitted}/${stats[q.id].attempts}`} />
                <Stat label="Avg score" value={stats[q.id].submitted ? `${stats[q.id].avgPct}%` : '—'} />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Taking a quiz
  if (taking) {
    const isAnswered = (v:any) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
    const answeredCount = attemptQs.filter(q => isAnswered(answers[q.id!])).length;
    return (
      <div style={{ padding:'20px 24px 96px', maxWidth:1200, margin:'0 auto', fontFamily:'sans-serif', display:'grid', gridTemplateColumns:'minmax(0,1fr) 220px', gap:24 }}>
        <div style={{ minWidth:0 }}>
          <button onClick={() => { setTaking(null); setResults(null); setAttemptId(null); if (routeQuizId) navigate(moduleReturnPath, { replace: true }); else load(); }} style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', marginBottom:8, fontSize:13 }}>← {routeQuizId ? 'Back' : 'Back to quizzes'}</button>
          <h2 style={{ margin:'0 0 6px', color:C.text }}>{taking.title}</h2>
          {canEdit && !results && (
            <div style={{ background:'#FDECEA', border:'1px solid #F5C6CB', color:'#8A1F11', borderRadius:4, padding:'8px 12px', fontSize:12, marginBottom:12 }}>
              ⓘ Preview mode — attempts are still recorded.
            </div>
          )}
          {!results && startedAt && (
            <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
              Started: {startedAt.toLocaleString([], { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}
            </div>
          )}
          {!results && (taking as any).instructions && (
            <div style={{ marginBottom:14 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'6px 0 8px' }}>Quiz Instructions</h3>
              <div style={{ fontSize:13, color:C.text, whiteSpace:'pre-wrap' }}>{(taking as any).instructions}</div>
              <hr style={{ border:0, borderTop:`1px solid ${C.border}`, marginTop:12 }} />
            </div>
          )}
          {results ? (
            <div>
              <div style={{ background:C.white, border:`2px solid ${C.success}`, borderRadius:8, padding:24, textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:48, marginBottom:10 }}>🎉</div>
                <div style={{ fontSize:22, fontWeight:700, color:C.text, marginBottom:6 }}>{results.score} / {results.max}</div>
                <div style={{ fontSize:14, color:C.muted, marginBottom:14 }}>{Math.round((results.score/Math.max(results.max,1))*100)}% • {results.perQ.filter(p=>p.auto&&p.correct).length} correct of {results.perQ.filter(p=>p.auto).length} auto-graded</div>
                <button onClick={downloadReview} style={{ padding:'8px 18px', border:`1px solid ${C.primary}`, borderRadius:5, background:C.white, color:C.primary, fontSize:13, cursor:'pointer', fontWeight:600 }}>⬇ Download review</button>
              </div>
              <h3 style={{ fontSize:15, color:C.text, marginBottom:10 }}>Question review</h3>
              {attemptQs.map((q, qi) => {
                const r = results.perQ.find(x => x.qid === q.id!);
                const badgeBg = !r?.auto ? '#FEF3C7' : r.correct ? '#E8F5E9' : '#FDECEA';
                const badgeCol = !r?.auto ? C.warn : r.correct ? C.success : C.error;
                return (
                  <div key={q.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#F8F6FC', borderBottom:`1px solid ${C.border}`, borderRadius:'6px 6px 0 0' }}>
                      <strong style={{ fontSize:13, color:C.text }}>Question {qi+1}</strong>
                      <span style={{ fontSize:11, padding:'2px 10px', borderRadius:20, background:badgeBg, color:badgeCol, fontWeight:600 }}>
                        {!r?.auto ? 'Pending grading' : r.correct ? '✓ Correct' : '✗ Incorrect'} • {q.points} pt
                      </span>
                    </div>
                    <div style={{ padding:14, fontSize:13, color:C.text }}>
                      <p style={{ margin:'0 0 10px' }}>{q.prompt}</p>
                      {q.question_type === 'multiple_choice' && q.options.map((o, oi) => {
                        const isU = r?.user === oi; const isC = q.correct_answer === oi;
                        return (
                          <div key={oi} style={{ padding:'6px 10px', borderRadius:4, marginBottom:3, background: isC ? '#E8F5E9' : isU ? '#FDECEA' : 'transparent', color: isC ? C.success : isU ? C.error : C.text }}>
                            {isC ? '✓ ' : isU ? '✗ ' : '  '}{o.text}{isU && !isC && ' (your answer)'}
                          </div>
                        );
                      })}
                      {q.question_type === 'multiple_answers' && q.options.map((o, oi) => {
                        const uArr = Array.isArray(r?.user) ? r!.user.map(Number) : [];
                        const cArr = Array.isArray(q.correct_answer) ? q.correct_answer.map(Number) : [];
                        const isU = uArr.includes(oi); const isC = cArr.includes(oi);
                        const mark = isC && isU ? '✓' : isC && !isU ? '·' : !isC && isU ? '✗' : ' ';
                        const bg = isC ? '#E8F5E9' : isU ? '#FDECEA' : 'transparent';
                        const col = isC ? C.success : isU ? C.error : C.text;
                        return (
                          <div key={oi} style={{ padding:'6px 10px', borderRadius:4, marginBottom:3, background:bg, color:col }}>
                            {mark} {o.text}{isU && !isC && ' (your selection)'}{isC && !isU && ' (missed)'}
                          </div>
                        );
                      })}
                      {q.question_type === 'true_false' && (
                        <div>Your answer: <strong>{r?.user===0?'True':r?.user===1?'False':'—'}</strong> • Correct: <strong>{q.correct_answer===0?'True':'False'}</strong></div>
                      )}
                      {(q.question_type === 'short_answer' || q.question_type === 'essay') && (
                        <div style={{ background:C.bg, padding:10, borderRadius:4, whiteSpace:'pre-wrap' }}>{r?.user || <em style={{ color:C.muted }}>(no answer)</em>}</div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                    {q.question_type === 'multiple_answers' && (
                      <>
                        <div style={{ fontSize:11, color:C.muted, marginBottom:6, fontStyle:'italic' }}>Select all that apply.</div>
                        {q.options.map((o,oi) => {
                          const arr: number[] = Array.isArray(answers[q.id!]) ? answers[q.id!] : [];
                          const checked = arr.includes(oi);
                          return (
                            <label key={oi} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', cursor:'pointer', fontSize:13, color:C.text, borderTop:oi===0?'none':`1px solid ${C.border}` }}>
                              <input type="checkbox" checked={checked} onChange={() => {
                                const next = checked ? arr.filter(x => x !== oi) : [...arr, oi].sort((a,b)=>a-b);
                                setAnswers(a => ({ ...a, [q.id!]: next }));
                              }} style={{ accentColor:C.primary }}/>
                              {o.text}
                            </label>
                          );
                        })}
                      </>
                    )}
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

        {!results && attemptQs.length > 0 && (() => {
          // Format time elapsed / remaining.
          const elapsedSec = startedAt ? Math.max(0, Math.floor((nowTick - startedAt.getTime())/1000)) : 0;
          const remainingSec = startedAt && timeLimitMin ? Math.max(0, timeLimitMin*60 - elapsedSec) : null;
          const fmt = (s:number) => {
            const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
            const parts:string[] = [];
            if (h) parts.push(`${h} Hour${h===1?'':'s'}`);
            parts.push(`${m} Minute${m===1?'':'s'}`);
            parts.push(`${sec} Second${sec===1?'':'s'}`);
            return parts.join(', ');
          };
          const lowTime = remainingSec !== null && remainingSec <= 60;
          return (
            <aside style={{ position:'sticky', top:16, alignSelf:'start', background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:14, fontSize:13 }}>
              <div style={{ fontWeight:700, color:C.text, marginBottom:8 }}>Questions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:'40vh', overflowY:'auto' }}>
                {attemptQs.map((q, qi) => {
                  const answered = isAnswered(answers[q.id!]);
                  return (
                    <a key={q.id} href={`#q-${qi+1}`} style={{ color: answered ? C.success : C.primary, textDecoration:'none', padding:'3px 4px', borderRadius:3, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ display:'inline-block', width:14, textAlign:'center', fontWeight:700 }}>{answered ? '✓' : ''}</span>
                      Question {qi+1}
                    </a>
                  );
                })}
              </div>
              <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${C.border}`, fontSize:12, color:C.muted }}>
                Answered: <strong style={{ color:C.text }}>{answeredCount} / {attemptQs.length}</strong>
              </div>
              <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>
                    {remainingSec !== null ? 'Time Remaining:' : 'Time Elapsed:'}
                  </span>
                  <button onClick={() => setHideTime(v => !v)}
                    style={{ padding:'2px 8px', border:`1px solid ${C.border}`, borderRadius:3, background:C.white, fontSize:11, cursor:'pointer', color:C.text }}>
                    {hideTime ? 'Show Time' : 'Hide Time'}
                  </button>
                </div>
                {!hideTime && (
                  <div style={{ fontSize:13, fontWeight:600, color: lowTime ? C.error : C.text }}>
                    {remainingSec !== null ? fmt(remainingSec) : fmt(elapsedSec)}
                  </div>
                )}
                {timeLimitMin && !hideTime && (
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Limit: {timeLimitMin} min</div>
                )}
              </div>
            </aside>
          );
        })()}


        {!results && attemptQs.length > 0 && (() => {
          const pill = saveState === 'saving'
            ? { bg:'#F1EEF9', fg:C.primary, dot:'●', label:'Saving…' }
            : saveState === 'error'
            ? { bg:'#FDECEA', fg:C.error, dot:'⚠', label:`Save failed — retrying${retryAttempt.current>0?` (attempt ${retryAttempt.current})`:''}` }
            : lastSavedAt
            ? { bg:'#E8F5E9', fg:C.success, dot:'✓', label:`Saved ${lastSavedAt.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })}` }
            : { bg:'#F1EEF9', fg:C.muted, dot:'○', label:'Autosave ready' };
          return (
            <div style={{ position:'fixed', left:0, right:0, bottom:0, background:C.white, borderTop:`1px solid ${C.border}`, padding:'10px 20px', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:12, boxShadow:'0 -2px 8px rgba(0,0,0,.05)', zIndex:20 }}>
              <span style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background:pill.bg, color:pill.fg, fontWeight:600, display:'inline-flex', alignItems:'center', gap:6 }}>
                <span>{pill.dot}</span>{pill.label}
              </span>
              {saveState === 'error' && (
                <button onClick={() => { retryAttempt.current = 0; flushSave(); }}
                  style={{ padding:'6px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>
                  Retry now
                </button>
              )}
              <button onClick={submitAttempt} style={{ padding:'8px 22px', border:'none', borderRadius:4, background:C.primary, color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>Submit Quiz</button>
            </div>
          );
        })()}
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
              <select value={q.question_type} onChange={e => {
                  const nt = e.target.value as QType;
                  updateQuestion(qi, { question_type: nt, correct_answer: nt === 'multiple_answers' ? [] : 0 });
                }}
                style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'5px 8px', fontSize:12 }}>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="multiple_answers">Multiple Answers</option>
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
                    <button onClick={() => updateQuestion(qi, { options: q.options.filter((_,i) => i !== oi) })} disabled={q.options.length <= 2}
                      style={{ background:'none', border:'none', color:C.muted, cursor: q.options.length<=2?'not-allowed':'pointer', fontSize:14 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => updateQuestion(qi, { options: [...q.options, { text:'' }] })}
                  style={{ padding:'4px 10px', border:`1px dashed ${C.border}`, borderRadius:4, background:'transparent', color:C.primary, fontSize:12, cursor:'pointer' }}>+ Add Choice</button>
              </div>
            )}
            {q.question_type === 'multiple_answers' && (
              <div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:6, fontStyle:'italic' }}>Check every correct answer. Students must select them all to earn credit.</div>
                {q.options.map((o, oi) => {
                  const arr: number[] = Array.isArray(q.correct_answer) ? q.correct_answer : [];
                  const checked = arr.includes(oi);
                  return (
                    <div key={oi} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <input type="checkbox" checked={checked} onChange={() => {
                        const next = checked ? arr.filter(x => x !== oi) : [...arr, oi].sort((a,b)=>a-b);
                        updateQuestion(qi, { correct_answer: next });
                      }} style={{ accentColor:C.primary }}/>
                      <input value={o.text} onChange={e => updateQuestion(qi, { options: q.options.map((x,i) => i===oi ? { text:e.target.value } : x) })}
                        placeholder={`Choice ${oi+1}`}
                        style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 9px', fontSize:13, outline:'none' }}/>
                      <button onClick={() => {
                        const filtered = q.options.filter((_,i) => i !== oi);
                        const remapped = arr.filter(x => x !== oi).map(x => x > oi ? x - 1 : x);
                        updateQuestion(qi, { options: filtered, correct_answer: remapped });
                      }} disabled={q.options.length <= 2}
                        style={{ background:'none', border:'none', color:C.muted, cursor: q.options.length<=2?'not-allowed':'pointer', fontSize:14 }}>✕</button>
                    </div>
                  );
                })}
                <button onClick={() => updateQuestion(qi, { options: [...q.options, { text:'' }] })}
                  style={{ padding:'4px 10px', border:`1px dashed ${C.border}`, borderRadius:4, background:'transparent', color:C.primary, fontSize:12, cursor:'pointer' }}>+ Add Choice</button>
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

  // Direct-open via /quizzes/:quizId — skip rendering the full list so the item
  // opens straight into its own details view (no "whole quiz page" flash).
  if (routeQuizId) {
    const missing = quizzes.length > 0 && !quizzes.find(q => q.id === routeQuizId);
    if (missing) {
      return (
        <div style={{ padding:32, textAlign:'center', fontFamily:'sans-serif' }}>
          <div style={{ color:C.muted, marginBottom:12 }}>This quiz couldn't be found.</div>
          <button onClick={() => navigate(moduleReturnPath, { replace: true })} style={{ padding:'8px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, cursor:'pointer', fontSize:13 }}>← Go back</button>
        </div>
      );
    }
    return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Opening quiz…</div>;
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
          <textarea
            value={createForm.instructions}
            onChange={e => setCreateForm(p => ({ ...p, instructions:e.target.value }))}
            placeholder="Description / instructions (optional) — shown to students before they start the quiz"
            rows={4}
            style={{ width:'100%', marginTop:10, border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, outline:'none', resize:'vertical', fontFamily:'inherit' }}
          />
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={createQuiz} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, cursor:'pointer' }}>Create & Add Questions</button>
            <button onClick={() => setShowCreate(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', color:C.muted, background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>No quizzes yet.</div>
      ) : (() => {
        const groupOf = (t: string): { key: string; label: string; order: number } => {
          const s = String(t || '').trim();
          if (/^final\s*exam/i.test(s)) return { key:'final', label:'Final Exam', order: 5 };
          if (/^day\s*\d+/i.test(s)) return { key:'day', label:'Day Quizzes', order: 1 };
          if (/^module\s*\d+/i.test(s)) return { key:'module', label:'Module Quizzes', order: 2 };
          if (/case\s*study/i.test(s)) return { key:'case', label:'Case Study Quizzes', order: 3 };
          return { key:'other', label:'Other Quizzes', order: 4 };
        };
        const groups: Record<string, { label:string; order:number; items: Quiz[] }> = {};
        quizzes.forEach(q => {
          const visible = canEdit || q.published;
          if (!visible) return;
          const g = groupOf(q.title);
          if (!groups[g.key]) groups[g.key] = { label:g.label, order:g.order, items:[] };
          groups[g.key].items.push(q);
        });
        const ordered = Object.entries(groups).sort((a,b) => a[1].order - b[1].order);
        return (
          <div style={{ display:'grid', gap:22 }}>
            {ordered.map(([key, g]) => {
              const collapsed = collapsedGroups.has(key);
              return (
                <section key={key}>
                  <div
                    onClick={() => setCollapsedGroups(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; })}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#EDE7F6', borderRadius:6, cursor:'pointer', marginBottom:8, userSelect:'none' }}
                  >
                    <span style={{ fontSize:12, color:C.muted }}>{collapsed ? '▸' : '▾'}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:C.text, textTransform:'uppercase', letterSpacing:0.4 }}>{g.label}</span>
                    <span style={{ fontSize:12, color:C.muted, marginLeft:'auto' }}>{g.items.length} {g.items.length===1?'quiz':'quizzes'}</span>
                  </div>
                  {!collapsed && (
                    <div style={{ display:'grid', gap:10 }}>
                      {g.items.map(q => {
                        const taken = attemptedIds.has(q.id);
                        const st = stats[q.id];
                        return (
                          <div key={q.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:'14px 18px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                              <span style={{ fontSize:22 }}>❓</span>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div onClick={() => openDetails(q)} style={{ fontSize:14, fontWeight:600, color:C.primary, cursor:'pointer' }}>{q.title}</div>
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
                                  <button onClick={() => startTake(q)} style={{ padding:'5px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>Preview</button>
                                  <button onClick={() => startEdit(q)} style={{ padding:'5px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>Edit</button>
                                  <button onClick={() => del(q)} style={{ padding:'5px 10px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer', color:C.error }}>✕</button>
                                </>
                              ) : (
                                <button onClick={() => startTake(q)}
                                  style={{ padding:'6px 14px', border:'none', borderRadius:5, background:taken?C.border:C.primary, color:'white', fontSize:13, cursor:'pointer' }}>
                                  {taken ? 'Review' : 'Start Quiz'}
                                </button>
                              )}
                            </div>
                            {canEdit && st && (
                              <div style={{ marginTop:10, paddingTop:10, borderTop:`1px dashed ${C.border}`, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
                                <Stat label="Attempts" value={st.attempts} />
                                <Stat label="Completion" value={st.attempts ? `${Math.round((st.submitted/st.attempts)*100)}%` : '—'} sub={`${st.submitted}/${st.attempts}`} />
                                <Stat label="Avg score" value={st.submitted ? `${st.avgPct}%` : '—'} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

const Stat: React.FC<{label:string; value:any; sub?:string}> = ({ label, value, sub }) => (
  <div style={{ background:C.bg, borderRadius:5, padding:'8px 10px' }}>
    <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.4, fontWeight:600 }}>{label}</div>
    <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{value}</div>
    {sub && <div style={{ fontSize:10, color:C.muted }}>{sub}</div>}
  </div>
);

export default QuizView;
