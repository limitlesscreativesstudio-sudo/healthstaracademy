import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const letter = (p:number) => p>=93?'A':p>=90?'A-':p>=87?'B+':p>=83?'B':p>=80?'B-':p>=77?'C+':p>=73?'C':p>=70?'C-':'F';
const gColor = (p:number) => p>=80?C.success:p>=70?C.warn:C.error;

const STUDENTS = ['Aaliyah Johnson','Carlos Martinez','Destiny Williams','Emmanuel Okafor','Fatima Hassan','Gloria Chen','Henry Brown','Isabella Reyes','James Nakamura','Keisha Thompson'];

interface Assignment { id:number; name:string; type:string; group:string; due:string; pts:number; subs:number; published:boolean; }

const INIT: Assignment[] = [
  { id:1, name:'Case Study 1',               type:'assignment', group:'Case Studies',  due:'Day 3',   pts:20,  subs:8,  published:true  },
  { id:2, name:'Case Study w/ Questions 1',  type:'assignment', group:'Case Studies',  due:'Day 3',   pts:20,  subs:7,  published:true  },
  { id:3, name:'Case Study 2',               type:'assignment', group:'Case Studies',  due:'Day 6',   pts:20,  subs:5,  published:true  },
  { id:4, name:'Mid-Program Self Assessment',type:'assignment', group:'Assignments',   due:'Day 5',   pts:10,  subs:9,  published:true  },
  { id:5, name:'Clinical Skills Pre-Check',  type:'assignment', group:'Clinical',      due:'Pre-Clin',pts:30,  subs:4,  published:true  },
  { id:6, name:'Grade Roll Call Attendance', type:'form',       group:'Participation', due:'Daily',   pts:100, subs:10, published:true  },
  { id:7, name:'Final Reflection Essay',     type:'assignment', group:'Assignments',   due:'Day 10',  pts:50,  subs:0,  published:false },
];

const typeIcon = (t:string) => ({ quiz:'❓', exam:'📋', form:'📋', assignment:'📝', discussion:'💬' }[t] ?? '📝');

const SpeedGrader: React.FC<{ assignment:Assignment; onBack:()=>void }> = ({ assignment, onBack }) => {
  const [idx, setIdx]         = useState(0);
  const [scores, setScores]   = useState<Record<string,string>>({});
  const [feedback, setFeedback] = useState<Record<string,string>>({});
  const student = STUDENTS[idx];
  const initials = student.split(' ').map(w=>w[0]).join('');

  return (
    <div style={{ display:'flex', height:'calc(100vh - 120px)', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{ width:215, background:C.white, borderRight:`1px solid ${C.border}`, overflowY:'auto', flexShrink:0 }}>
        <div style={{ padding:'11px 13px', borderBottom:`1px solid ${C.border}`, fontWeight:700, fontSize:13, fontFamily:'sans-serif', color:C.text }}>
          Students ({STUDENTS.length})
        </div>
        {STUDENTS.map((s, i) => (
          <div key={s} onClick={() => setIdx(i)}
            style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, cursor:'pointer', background:i===idx?'#EDE8F7':C.white, borderLeft:i===idx?`3px solid ${C.primary}`:'3px solid transparent' }}
            onMouseEnter={e => { if(i!==idx)(e.currentTarget as HTMLElement).style.background='#faf9fc'; }}
            onMouseLeave={e => { if(i!==idx)(e.currentTarget as HTMLElement).style.background=C.white; }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:C.primary, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>
                {s.split(' ').map(w=>w[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:i===idx?C.primary:C.text, fontFamily:'sans-serif' }}>{s.split(' ')[0]}</div>
                <div style={{ fontSize:10, color:scores[s] ? C.success : C.muted, fontFamily:'sans-serif' }}>{scores[s] ? `${scores[s]}/${assignment.pts}` : 'Not graded'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.primary, fontSize:13, fontFamily:'sans-serif', display:'flex', alignItems:'center', gap:4 }}>← Back</button>
          <div style={{ fontWeight:700, fontSize:14, fontFamily:'sans-serif', color:C.text }}>{assignment.name}</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => setIdx(i => Math.max(0,i-1))} disabled={idx===0}
              style={{ padding:'5px 10px', border:`1px solid ${C.border}`, borderRadius:4, cursor:'pointer', background:C.white, opacity:idx===0?0.4:1 }}>‹</button>
            <span style={{ fontSize:13, fontFamily:'sans-serif', color:C.muted }}>{idx+1} / {STUDENTS.length}</span>
            <button onClick={() => setIdx(i => Math.min(STUDENTS.length-1,i+1))} disabled={idx===STUDENTS.length-1}
              style={{ padding:'5px 10px', border:`1px solid ${C.border}`, borderRadius:4, cursor:'pointer', background:C.white, opacity:idx===STUDENTS.length-1?0.4:1 }}>›</button>
          </div>
        </div>

        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {/* Submission */}
          <div style={{ flex:1, padding:24, overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:C.primary, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700 }}>{initials}</div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{student}</div>
                <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>Submitted May 28, 2026 at 10:43 AM</div>
              </div>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#e8f5e9', color:C.success, fontFamily:'sans-serif', fontWeight:600 }}>submitted</span>
            </div>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:22, minHeight:280 }}>
              <p style={{ fontFamily:'sans-serif', fontSize:14, color:C.text, lineHeight:1.8, margin:0 }}>
                This case study explores a 78-year-old male patient admitted with hip fracture following a fall at home. As his CNA, I was responsible for assisting with ADLs, monitoring vital signs every 4 hours, and reporting any changes to the supervising RN. Key observations included complaints of increased pain at the surgical site and a slight elevation in temperature (99.2°F) on Day 2 post-op, which I documented and immediately reported...
              </p>
              <div style={{ marginTop:18, padding:12, background:C.bg, borderRadius:4, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>📎</span>
                <span style={{ fontSize:13, color:C.primary, fontFamily:'sans-serif' }}>{student.split(' ')[0].toLowerCase()}_case_study.pdf</span>
                <button style={{ padding:'4px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', fontFamily:'sans-serif', marginLeft:'auto' }}>View File</button>
              </div>
            </div>
          </div>

          {/* Grade panel */}
          <div style={{ width:255, background:C.white, borderLeft:`1px solid ${C.border}`, padding:20, flexShrink:0, overflowY:'auto' }}>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Grade</label>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input type="number" value={scores[student]??''} min={0} max={assignment.pts}
                  onChange={e => setScores(p => ({ ...p, [student]:e.target.value }))}
                  style={{ width:68, border:`2px solid ${C.primary}`, borderRadius:5, padding:'8px', fontSize:20, fontWeight:800, textAlign:'center', color:C.primary, outline:'none' }}/>
                <span style={{ fontSize:15, color:C.muted, fontFamily:'sans-serif' }}>/ {assignment.pts}</span>
              </div>
              {scores[student] && (
                <div style={{ marginTop:7, fontSize:14, fontWeight:700, color:gColor((parseFloat(scores[student])/assignment.pts)*100), fontFamily:'sans-serif' }}>
                  {Math.round((parseFloat(scores[student])/assignment.pts)*100)}% — {letter((parseFloat(scores[student])/assignment.pts)*100)}
                </div>
              )}
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Feedback</label>
              <textarea value={feedback[student]??''} onChange={e => setFeedback(p => ({ ...p, [student]:e.target.value }))}
                rows={7} placeholder="Leave feedback for this student…"
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px', fontSize:13, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }}/>
            </div>
            <button onClick={() => { alert(`Saved: ${student} — ${scores[student]??'ungraded'}`); if(idx<STUDENTS.length-1)setIdx(i=>i+1); }}
              style={{ width:'100%', padding:'11px', background:C.primary, color:'white', border:'none', borderRadius:5, fontSize:13, fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>
              Save & Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignmentView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(INIT);
  const [grading, setGrading]         = useState<Assignment|null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ name:'', type:'assignment', group:'Assignments', due:'', pts:'20' });

  const groups = [...new Set(assignments.map(a => a.group))];
  const save = () => {
    if (!form.name.trim()) return;
    setAssignments(prev => [...prev, { id:Date.now(), name:form.name, type:form.type, group:form.group, due:form.due||'TBD', pts:parseInt(form.pts)||20, subs:0, published:false }]);
    setForm({ name:'', type:'assignment', group:'Assignments', due:'', pts:'20' }); setShowForm(false);
  };
  const togglePub = (id:number) => setAssignments(prev => prev.map(a => a.id===id ? { ...a, published:!a.published } : a));
  const del = (id:number) => setAssignments(prev => prev.filter(a => a.id!==id));

  if (grading) return <SpeedGrader assignment={grading} onBack={() => setGrading(null)}/>;

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Assignments</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ Assignment</button>
      </div>

      {showForm && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:20, marginBottom:20 }}>
          <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>New Assignment</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', marginBottom:12, outline:'none' }}/>
            </div>
            {[['Type','type',['assignment','quiz','exam','discussion','form']],['Group','group',['Assignments','Case Studies','Clinical','Participation','Exams']]].map(([l,k,opts]) => (
              <div key={k as string}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>{l as string}</label>
                <select value={(form as any)[k as string]} onChange={e => setForm(p => ({ ...p, [k as string]:e.target.value }))}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif', marginBottom:12 }}>
                  {(opts as string[]).map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Due</label>
              <input value={form.due} onChange={e => setForm(p => ({ ...p, due:e.target.value }))} placeholder="e.g. Day 5"
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', marginBottom:12, outline:'none' }}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Points</label>
              <input type="number" value={form.pts} onChange={e => setForm(p => ({ ...p, pts:e.target.value }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', marginBottom:12, outline:'none' }}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={save} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {groups.map(g => (
        <div key={g} style={{ marginBottom:20 }}>
          <div style={{ padding:'8px 14px', background:'#F0EDF7', border:`1px solid ${C.border}`, borderBottom:'none', borderRadius:'5px 5px 0 0', fontWeight:700, fontSize:13, fontFamily:'sans-serif', color:C.text }}>{g}</div>
          <div style={{ border:`1px solid ${C.border}`, borderRadius:'0 0 5px 5px', overflow:'hidden', background:C.white }}>
            {assignments.filter(a => a.group === g).map((a, i, arr) => (
              <div key={a.id} style={{ padding:'12px 14px', borderBottom:i<arr.length-1?`1px solid ${C.border}`:'none', display:'flex', alignItems:'center', gap:12 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fc'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                <span style={{ fontSize:18 }}>{typeIcon(a.type)}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>{a.name}</div>
                  <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>
                    Due: {a.due} • {a.pts} pts{a.subs>0?<span style={{ color:C.success }}> • {a.subs} submitted</span>:null}
                  </div>
                </div>
                {a.subs > 0 && <button onClick={() => setGrading(a)} style={{ padding:'5px 12px', border:`1px solid ${C.primary}`, borderRadius:4, background:C.white, fontSize:12, color:C.primary, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>Grade</button>}
                <span onClick={() => togglePub(a.id)}
                  style={{ fontSize:11, padding:'2px 10px', borderRadius:20, background:a.published?'#e8f5e9':'#f5f3fa', color:a.published?C.success:C.muted, cursor:'pointer', fontFamily:'sans-serif' }}>
                  {a.published ? '● Published' : '○ Unpublished'}
                </span>
                <button onClick={() => del(a.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.error, fontSize:15, padding:3 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentView;
