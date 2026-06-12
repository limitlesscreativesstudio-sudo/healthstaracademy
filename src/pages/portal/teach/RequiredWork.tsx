// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const STUDENTS = ['Aaliyah Johnson','Carlos Martinez','Destiny Williams','Emmanuel Okafor','Fatima Hassan','Gloria Chen','Henry Brown','Isabella Reyes','James Nakamura','Keisha Thompson'];

interface WorkItem { id:number; name:string; type:string; due:string; pts:number; required:boolean; }

const WORK: WorkItem[] = [
  { id:1,  name:'Student Handbook Acknowledgement',  type:'form',       due:'Day 1',   pts:0,   required:true  },
  { id:2,  name:'Day 1 Quiz',                        type:'quiz',       due:'Day 1',   pts:10,  required:true  },
  { id:3,  name:'Module 01 Quiz',                    type:'quiz',       due:'Day 2',   pts:10,  required:true  },
  { id:4,  name:'Case Study 1',                      type:'assignment', due:'Day 3',   pts:20,  required:true  },
  { id:5,  name:'Case Study w/ Questions 1',         type:'assignment', due:'Day 3',   pts:20,  required:true  },
  { id:6,  name:'Module 02 Quiz',                    type:'quiz',       due:'Day 3',   pts:10,  required:true  },
  { id:7,  name:'Module 03 Quiz',                    type:'quiz',       due:'Day 4',   pts:10,  required:true  },
  { id:8,  name:'Grade Roll Call Attendance',        type:'form',       due:'Daily',   pts:100, required:true  },
  { id:9,  name:'Mid-Program Self Assessment',       type:'assignment', due:'Day 5',   pts:10,  required:true  },
  { id:10, name:'Case Study 2',                      type:'assignment', due:'Day 6',   pts:20,  required:true  },
  { id:11, name:'Module 04–05 Quiz',                 type:'quiz',       due:'Day 6',   pts:20,  required:true  },
  { id:12, name:'Clinical Skills Pre-Check',         type:'assignment', due:'Pre-Clin',pts:30,  required:true  },
];

type Completion = Record<string, Record<number, boolean>>;

const RequiredWork: React.FC = () => {
  const [completion, setCompletion] = useState<Completion>(() => {
    const c: Completion = {};
    STUDENTS.forEach(s => { c[s] = {}; WORK.forEach(w => { c[s][w.id] = Math.random() > 0.35; }); });
    return c;
  });
  const [selStudent, setSelStudent] = useState('');
  const [filter, setFilter] = useState<'all'|'missing'|'complete'>('all');

  const doneCount = (s: string) => WORK.filter(w => completion[s]?.[w.id]).length;
  const totalPts = (s: string) => WORK.filter(w => completion[s]?.[w.id]).reduce((sum, w) => sum + w.pts, 0);
  const toggle = (s: string, id: number) => setCompletion(prev => ({ ...prev, [s]: { ...prev[s], [id]: !prev[s][id] } }));

  const visible = WORK.filter(w => {
    if (!selStudent) return true;
    if (filter === 'missing') return !completion[selStudent]?.[w.id];
    if (filter === 'complete') return !!completion[selStudent]?.[w.id];
    return true;
  });

  const exportCSV = () => {
    const headers = ['Student', 'Done', 'Missing', 'Progress %', 'Points Earned',
      ...WORK.map(w => `${w.name} (${w.due})`)];
    const rows = STUDENTS.map(s => {
      const done = doneCount(s);
      const pct = Math.round((done / WORK.length) * 100);
      return [s, done, WORK.length - done, pct, totalPts(s),
        ...WORK.map(w => completion[s]?.[w.id] ? '✓' : '')];
    });
    const csv = [headers, ...rows].map(r =>
      r.map(cell => {
        const v = String(cell ?? '');
        return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `required-work-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Required Work</h2>
        <button onClick={exportCSV} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Export Report</button>
      </div>

      {/* Overview grid */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', marginBottom:20 }}>
        <div style={{ padding:'10px 16px', background:'#F0EDF7', borderBottom:`1px solid ${C.border}`, fontWeight:700, fontSize:13, fontFamily:'sans-serif', color:C.text }}>
          Completion Overview
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ borderCollapse:'collapse', fontFamily:'sans-serif', width:'100%' }}>
            <thead>
              <tr>
                <th style={{ padding:'8px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:C.text, borderBottom:`1px solid ${C.border}`, minWidth:170, position:'sticky', left:0, background:C.white }}>Student</th>
                <th style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600, color:C.muted, borderBottom:`1px solid ${C.border}` }}>Done</th>
                <th style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600, color:C.muted, borderBottom:`1px solid ${C.border}` }}>Missing</th>
                <th style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600, color:C.muted, borderBottom:`1px solid ${C.border}` }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s, i) => {
                const done = doneCount(s);
                const pct = Math.round((done / WORK.length) * 100);
                return (
                  <tr key={s} style={{ background: i % 2 === 0 ? C.white : '#FDFCFF', cursor:'pointer' }}
                    onClick={() => setSelStudent(selStudent === s ? '' : s)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#EDE8F7'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? C.white : '#FDFCFF'}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color: selStudent === s ? C.primary : C.text, position:'sticky', left:0, background:'inherit', borderBottom:`1px solid ${C.border}` }}>{s}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center', fontSize:13, color:C.success, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{done}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center', fontSize:13, color:WORK.length - done > 0 ? C.error : C.muted, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{WORK.length - done}</td>
                    <td style={{ padding:'9px 14px', borderBottom:`1px solid ${C.border}`, minWidth:120 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:6, borderRadius:3, background:C.border, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background: pct >= 80 ? C.success : pct >= 50 ? C.warn : C.error, transition:'width .3s' }}/>
                        </div>
                        <span style={{ fontSize:11, color:C.muted, width:34 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selStudent && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:8, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', background:'#EDE8F7', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:700, fontSize:14, color:C.text, fontFamily:'sans-serif' }}>{selStudent} — Work Detail</span>
            <div style={{ display:'flex', gap:6 }}>
              {([['all','All'],['missing','Missing'],['complete','Complete']] as const).map(([k,l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  style={{ padding:'4px 12px', border:`1px solid ${filter === k ? C.primary : C.border}`, borderRadius:20, background:filter === k ? C.primary : C.white, color:filter === k ? 'white' : C.text, fontSize:11, fontFamily:'sans-serif', cursor:'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
          {visible.map((w, i) => {
            const done = completion[selStudent]?.[w.id];
            return (
              <div key={w.id} style={{ padding:'11px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
                <button onClick={() => toggle(selStudent, w.id)}
                  style={{ width:22, height:22, borderRadius:4, border:`2px solid ${done ? C.success : C.border}`, background:done ? C.success : 'transparent', cursor:'pointer', flexShrink:0, fontSize:12, color:'white' }}>
                  {done ? '✓' : ''}
                </button>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:C.text, fontFamily:'sans-serif' }}>{w.name}</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{w.type} • Due: {w.due}{w.pts > 0 ? ` • ${w.pts} pts` : ' • Required'}</div>
                </div>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:done ? '#e8f5e9' : '#fdecea', color:done ? C.success : C.error, fontFamily:'sans-serif', fontWeight:600 }}>
                  {done ? 'Complete' : 'Missing'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequiredWork;