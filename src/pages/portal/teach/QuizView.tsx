import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B' } as const;

interface Answer   { id:number; text:string; correct:boolean; }
interface Question { id:number; question:string; type:'mc'|'tf'|'short'|'essay'; pts:number; answers:Answer[]; }
interface Quiz     { id:number; name:string; due:string; pts:number; published:boolean; questions:Question[]; }

const mkQuiz = (name:string, due:string): Quiz => ({
  id:Date.now()+Math.random(), name, due, pts:10, published:true,
  questions:[
    { id:1, question:'What does CNA stand for?', type:'mc', pts:2, answers:[
      { id:1,text:'Certified Nursing Assistant',correct:true},{id:2,text:'Clinical Nursing Associate',correct:false},
      { id:3,text:'Certified Nursing Aide',correct:false},{id:4,text:'Care Nursing Attendant',correct:false}]},
    { id:2, question:'A CNA works under the direct supervision of a Registered Nurse.', type:'tf', pts:2, answers:[
      {id:5,text:'True',correct:true},{id:6,text:'False',correct:false}]},
    { id:3, question:'Describe the importance of hand hygiene in infection control.', type:'essay', pts:6, answers:[] },
  ],
});

const INIT_QUIZZES: Quiz[] = [
  mkQuiz('Day 1 Quiz','Day 1'),
  mkQuiz('Module 01 Quiz','Day 2'),
  mkQuiz('Module 02 Quiz','Day 3'),
  mkQuiz('Module 03 Quiz','Day 4'),
];
INIT_QUIZZES.forEach((q,i) => { q.id=i+1; q.pts=10; });

const QuizView: React.FC = () => {
  const [quizzes, setQuizzes]     = useState<Quiz[]>(INIT_QUIZZES);
  const [editing, setEditing]     = useState<Quiz|null>(null);
  const [newQText, setNewQText]   = useState('');
  const [newQType, setNewQType]   = useState<'mc'|'tf'|'short'|'essay'>('mc');
  const [newQPts, setNewQPts]     = useState(2);
  const [newAnswers, setNewAnswers] = useState(['','','','']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [showAddQ, setShowAddQ]   = useState(false);
  const [createForm, setCreateForm] = useState({ name:'', due:'', pts:10 });
  const [showCreate, setShowCreate] = useState(false);

  const createQuiz = () => {
    if (!createForm.name.trim()) return;
    const q = mkQuiz(createForm.name, createForm.due || 'TBD');
    q.id = Date.now(); q.pts = createForm.pts; q.questions = [];
    setQuizzes(prev => [...prev, q]); setShowCreate(false);
    setCreateForm({ name:'', due:'', pts:10 });
  };

  const addQuestion = () => {
    if (!editing || !newQText.trim()) return;
    const answers: Answer[] = newQType === 'mc' ? newAnswers.filter(a => a.trim()).map((t,i) => ({ id:Date.now()+i, text:t, correct:i===correctIdx }))
      : newQType === 'tf' ? [{id:1,text:'True',correct:true},{id:2,text:'False',correct:false}] : [];
    const q: Question = { id:Date.now(), question:newQText, type:newQType, pts:newQPts, answers };
    setEditing(prev => prev ? { ...prev, questions:[...prev.questions, q], pts:prev.pts+newQPts } : null);
    setNewQText(''); setNewAnswers(['','','','']); setCorrectIdx(0); setShowAddQ(false);
  };

  const deleteQ = (qid:number) => setEditing(prev => prev ? { ...prev, questions:prev.questions.filter(q => q.id!==qid) } : null);

  const saveQuiz = () => {
    if (!editing) return;
    setQuizzes(prev => prev.map(q => q.id===editing.id ? editing : q)); setEditing(null);
  };

  const togglePub = (id:number) => setQuizzes(prev => prev.map(q => q.id===id ? { ...q, published:!q.published } : q));
  const deleteQuiz = (id:number) => setQuizzes(prev => prev.filter(q => q.id!==id));

  if (editing) {
    return (
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{editing.name}</h2>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setEditing(null)} style={{ padding:'7px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
            <button onClick={saveQuiz} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Save Quiz</button>
          </div>
        </div>

        {editing.questions.map((q,qi) => (
          <div key={q.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:18, marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.muted, fontFamily:'sans-serif' }}>Q{qi+1}</span>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#EDE8F7', color:C.primary, fontFamily:'sans-serif' }}>
                    {q.type==='mc'?'Multiple Choice':q.type==='tf'?'True/False':q.type==='essay'?'Essay':'Short Answer'} • {q.pts} pts
                  </span>
                </div>
                <p style={{ margin:'0 0 10px', fontSize:14, color:C.text, fontFamily:'sans-serif' }}>{q.question}</p>
                {q.answers.map(a => (
                  <div key={a.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${a.correct?C.success:C.border}`, background:a.correct?C.success:'transparent', flexShrink:0 }}/>
                    <span style={{ fontSize:13, color:a.correct?C.success:C.text, fontFamily:'sans-serif', fontWeight:a.correct?600:400 }}>{a.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => deleteQ(q.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.error, fontSize:16, padding:4 }}>✕</button>
            </div>
          </div>
        ))}

        {showAddQ ? (
          <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:20 }}>
            <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Add Question</h3>
            <div style={{ display:'flex', gap:12, marginBottom:12 }}>
              <div style={{ flex:1 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Type</label>
                <select value={newQType} onChange={e => setNewQType(e.target.value as any)}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'7px 8px', fontSize:13, fontFamily:'sans-serif' }}>
                  <option value="mc">Multiple Choice</option><option value="tf">True / False</option>
                  <option value="short">Short Answer</option><option value="essay">Essay</option>
                </select>
              </div>
              <div style={{ width:80 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Points</label>
                <input type="number" value={newQPts} onChange={e => setNewQPts(parseInt(e.target.value)||1)}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'7px 8px', fontSize:13, fontFamily:'sans-serif', outline:'none' }}/>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Question *</label>
              <textarea value={newQText} onChange={e => setNewQText(e.target.value)} rows={2}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }}/>
            </div>
            {newQType === 'mc' && (
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Choices <span style={{ color:C.muted, fontWeight:400 }}>(select correct)</span></label>
                {newAnswers.map((a,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <input type="radio" name="correct" checked={correctIdx===i} onChange={() => setCorrectIdx(i)} style={{ accentColor:C.primary }}/>
                    <input value={a} onChange={e => setNewAnswers(p => p.map((x,j) => j===i ? e.target.value : x))} placeholder={`Choice ${i+1}`}
                      style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 9px', fontSize:13, fontFamily:'sans-serif', outline:'none' }}/>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={addQuestion} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Add Question</button>
              <button onClick={() => setShowAddQ(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddQ(true)}
            style={{ width:'100%', padding:'11px', border:`2px dashed ${C.border}`, borderRadius:6, background:'transparent', color:C.primary, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
            + Add Question
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Quizzes</h2>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ New Quiz</button>
      </div>
      {showCreate && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:20, marginBottom:16 }}>
          <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>New Quiz</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 100px', gap:12 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Quiz Name *</label>
              <input value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name:e.target.value }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Due</label>
              <input value={createForm.due} onChange={e => setCreateForm(p => ({ ...p, due:e.target.value }))} placeholder="e.g. Day 5"
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Points</label>
              <input type="number" value={createForm.pts} onChange={e => setCreateForm(p => ({ ...p, pts:parseInt(e.target.value)||10 }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={createQuiz} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Create</button>
            <button onClick={() => setShowCreate(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ display:'grid', gap:12 }}>
        {quizzes.map(q => (
          <div key={q.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:22 }}>❓</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.primary, fontFamily:'sans-serif', marginBottom:3 }}>{q.name}</div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>Due: {q.due} • {q.questions.length} questions • {q.pts} pts</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:11, padding:'2px 10px', borderRadius:20, background:q.published?'#e8f5e9':'#f5f3fa', color:q.published?C.success:C.muted, fontFamily:'sans-serif', cursor:'pointer' }}
                onClick={() => togglePub(q.id)}>{q.published?'● Published':'○ Unpublished'}</span>
              <button onClick={() => setEditing(q)} style={{ padding:'5px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>Edit</button>
              <button onClick={() => deleteQuiz(q.id)} style={{ padding:'5px 10px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer', color:C.error }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizView;
