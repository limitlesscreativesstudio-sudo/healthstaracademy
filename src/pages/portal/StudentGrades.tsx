import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const letter = (p:number) => p>=93?'A':p>=90?'A-':p>=87?'B+':p>=83?'B':p>=80?'B-':p>=77?'C+':p>=73?'C':p>=70?'C-':'F';
const gColor = (p:number) => p>=80?C.success:p>=70?C.warn:C.error;

const STUDENTS = ['Aaliyah Johnson','Carlos Martinez','Destiny Williams','Emmanuel Okafor','Fatima Hassan','Gloria Chen','Henry Brown','Isabella Reyes','James Nakamura','Keisha Thompson'];

// Real Canvas column names from screenshots: Module01 Quiz through Module09 Quiz (with leading zeros)
const COLS = [
  { id:'m01q',  name:'Module01 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'m02q',  name:'Module02 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'m03q',  name:'Module03 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'m04q',  name:'Module04 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'m05q',  name:'Module05 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'m06q',  name:'Module06 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'m07q',  name:'Module07 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'m08q',  name:'Module08 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'m09q',  name:'Module09 Quiz',  pts:10,  group:'Quizzes',       published:true  },
  { id:'cs1',   name:'Case Study 1',   pts:20,  group:'Assignments',   published:true  },
  { id:'cs2',   name:'Case Study 2',   pts:20,  group:'Assignments',   published:true  },
  { id:'atd',   name:'Grade Roll Call Attendance', pts:100, group:'Participation', published:true },
  { id:'clin',  name:'Clinical Skills',pts:100, group:'Clinical',      published:true  },
  { id:'exam',  name:'Theory Exam',    pts:100, group:'Exams',         published:false },
];

const TOTAL_PTS = COLS.reduce((s,c) => s+c.pts, 0);

const mkGrades = () => {
  const g: Record<string,Record<string,number>> = {};
  STUDENTS.forEach(s => { g[s] = {}; COLS.forEach(c => { g[s][c.id] = Math.round(c.pts * (0.6 + Math.random() * 0.4)); }); });
  return g;
};

const StudentGrades: React.FC = () => {
  const [grades, setGrades]       = useState(mkGrades);
  const [editing, setEditing]     = useState<{s:string;c:string}|null>(null);
  const [val, setVal]             = useState('');
  const [searchS, setSearchS]     = useState('');
  const [searchA, setSearchA]     = useState('');
  const [showUnpub, setShowUnpub] = useState(true);

  const saveEdit = () => {
    if (!editing) return;
    const n = parseFloat(val);
    if (!isNaN(n)) setGrades(p => ({ ...p, [editing.s]:{ ...p[editing.s], [editing.c]:n } }));
    setEditing(null);
  };

  const totalFor = (s:string) => COLS.reduce((sum,c) => sum + (grades[s]?.[c.id]??0), 0);
  const pctFor   = (s:string) => Math.round((totalFor(s)/TOTAL_PTS)*100);

  const visStudents = STUDENTS.filter(s => s.toLowerCase().includes(searchS.toLowerCase()));
  const visCols = COLS.filter(c => c.name.toLowerCase().includes(searchA.toLowerCase()) && (showUnpub || c.published));

  return (
    <div style={{ padding:24 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Gradebook</h2>
          <select style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'4px 8px', fontSize:13, fontFamily:'sans-serif', color:C.text }}>
            <option>Gradebook ▾</option>
            <option>Learning Mastery</option>
          </select>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            ↓ Import
          </button>
          <button style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            ↑ Export ▾
          </button>
          <button style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:16, cursor:'pointer' }}>⚙</button>
        </div>
      </div>

      {/* Search + filter row */}
      <div style={{ display:'flex', gap:12, marginBottom:14, alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:'7px 12px', flex:1, maxWidth:360 }}>
          <span>🔍</span>
          <input value={searchS} onChange={e=>setSearchS(e.target.value)} placeholder="Search Students"
            style={{ border:'none', outline:'none', flex:1, fontSize:13, fontFamily:'sans-serif', color:C.text }}/>
          <select style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'2px 6px', fontSize:12, fontFamily:'sans-serif', color:C.text }}>
            <option>All Roles ▾</option>
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:'7px 12px', flex:1, maxWidth:360 }}>
          <span>🔍</span>
          <input value={searchA} onChange={e=>setSearchA(e.target.value)} placeholder="Search Assignments"
            style={{ border:'none', outline:'none', flex:1, fontSize:13, fontFamily:'sans-serif', color:C.text }}/>
        </div>
        <button onClick={()=>{}} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
          ⚡ Apply Filters
        </button>
      </div>

      <p style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', margin:'0 0 12px' }}>Click any grade cell to edit. Columns show actual Canvas assignment names.</p>

      <div style={{ overflowX:'auto', border:`1px solid ${C.border}`, borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ borderCollapse:'collapse', fontFamily:'sans-serif', minWidth:'100%' }}>
          <thead>
            <tr style={{ background:'#F0EDF7' }}>
              <th style={{ padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:C.text, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, position:'sticky', left:0, background:'#F0EDF7', minWidth:175, zIndex:10 }}>
                Student Name
              </th>
              {visCols.map(c => (
                <th key={c.id} style={{ padding:'7px 8px', textAlign:'center', fontSize:10, fontWeight:600, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, minWidth:90, verticalAlign:'bottom' }}>
                  <div style={{ color:C.primary, marginBottom:2, lineHeight:1.3 }}>{c.name}</div>
                  {!c.published && <div style={{ color:C.error, fontSize:9, fontWeight:700 }}>UNPUBLISHED</div>}
                  <div style={{ color:C.muted, fontWeight:400, fontSize:9 }}>/{c.pts}</div>
                </th>
              ))}
              <th style={{ padding:'10px 10px', textAlign:'center', fontSize:11, fontWeight:700, color:C.text, borderBottom:`1px solid ${C.border}`, minWidth:100, position:'sticky', right:0, background:'#F0EDF7', zIndex:10 }}>
                Total<br/><span style={{ fontSize:9, color:C.muted, fontWeight:400 }}>/{TOTAL_PTS}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visStudents.map((s, si) => {
              const tot = totalFor(s);
              const pct = pctFor(s);
              return (
                <tr key={s} style={{ background:si%2===0?C.white:'#FDFCFF' }}>
                  <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, position:'sticky', left:0, background:si%2===0?C.white:'#FDFCFF', zIndex:5, color:C.primary }}>
                    {s}
                  </td>
                  {visCols.map(c => {
                    const g   = grades[s]?.[c.id];
                    const isE = editing?.s===s && editing?.c===c.id;
                    const p   = g !== undefined ? Math.round((g/c.pts)*100) : null;
                    return (
                      <td key={c.id} onClick={() => { setEditing({s,c:c.id}); setVal((g??'').toString()); }}
                        style={{ padding:'7px 8px', textAlign:'center', cursor:'pointer', borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, background:isE?'#EDE8F7':'inherit' }}
                        onMouseEnter={e=>{if(!isE)(e.currentTarget as HTMLElement).style.background='#F0EDF7';}}
                        onMouseLeave={e=>{if(!isE)(e.currentTarget as HTMLElement).style.background='inherit';}}>
                        {isE ? (
                          <input autoFocus value={val} onChange={e=>setVal(e.target.value)}
                            onBlur={saveEdit} onKeyDown={e=>{if(e.key==='Enter')saveEdit();if(e.key==='Escape')setEditing(null);}}
                            style={{ width:54, textAlign:'center', border:`2px solid ${C.primary}`, borderRadius:3, padding:'2px 4px', fontSize:13, outline:'none' }}/>
                        ) : (
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:p!==null?gColor(p):C.muted }}>{g??'—'}</div>
                            {p !== null && <div style={{ fontSize:9, color:C.muted }}>{p}%</div>}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ padding:'9px 10px', textAlign:'center', borderBottom:`1px solid ${C.border}`, position:'sticky', right:0, background:si%2===0?C.white:'#FDFCFF', zIndex:5 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:gColor(pct) }}>{pct}%</div>
                    <div style={{ fontSize:11, color:C.muted }}>{letter(pct)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentGrades;
