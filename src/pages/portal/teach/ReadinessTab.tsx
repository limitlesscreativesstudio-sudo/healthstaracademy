// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const STUDENTS = ['Aaliyah Johnson','Carlos Martinez','Destiny Williams','Emmanuel Okafor','Fatima Hassan','Gloria Chen','Henry Brown','Isabella Reyes','James Nakamura','Keisha Thompson','Luis Hernandez','Maria Santos'];

const CRITERIA = [
  { id:'attendance', label:'Attendance ≥ 90%', weight:15 },
  { id:'theory',     label:'Theory Exam Passed (≥75%)', weight:20 },
  { id:'skills',     label:'Clinical Skills Complete', weight:25 },
  { id:'modules',    label:'All Module Quizzes Passed', weight:20 },
  { id:'casestudy',  label:'Case Studies Submitted', weight:10 },
  { id:'paperwork',  label:'Required Paperwork Complete', weight:10 },
];

type ReadinessData = Record<string, Record<string, boolean>>;

const ReadinessTab: React.FC = () => {
  const [data, setData] = useState<ReadinessData>(() => {
    const d: ReadinessData = {};
    STUDENTS.forEach(s => { d[s] = {}; CRITERIA.forEach(c => { d[s][c.id] = Math.random() > 0.3; }); });
    return d;
  });
  const [filter, setFilter] = useState<'all'|'ready'|'not'>('all');

  const score = (s: string) => CRITERIA.filter(c => data[s]?.[c.id]).reduce((sum, c) => sum + c.weight, 0);
  const isReady = (s: string) => score(s) === 100 || CRITERIA.every(c => data[s]?.[c.id]);
  const toggle = (s: string, cid: string) => setData(prev => ({ ...prev, [s]: { ...prev[s], [cid]: !prev[s][cid] } }));

  const filtered = STUDENTS.filter(s =>
    filter === 'all' ? true : filter === 'ready' ? isReady(s) : !isReady(s)
  );

  const readyCount   = STUDENTS.filter(isReady).length;
  const notReadyCount = STUDENTS.length - readyCount;

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>State Exam Readiness</h2>
        <button style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Export Report</button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        {[
          ['Total Students', STUDENTS.length.toString(), C.primary, '👥'],
          ['Ready for Exam', readyCount.toString(), C.success, '✅'],
          ['Not Yet Ready', notReadyCount.toString(), C.error, '⚠️'],
        ].map(([label, val, color, icon]) => (
          <div key={label as string} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:16 }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
            <div style={{ fontSize:24, fontWeight:800, color:color as string, fontFamily:'sans-serif' }}>{val}</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {([['all','All Students'],['ready','Ready'],['not','Not Ready']] as const).map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding:'6px 16px', border:`1px solid ${filter === k ? C.primary : C.border}`, borderRadius:20, background:filter === k ? C.primary : C.white, color:filter === k ? 'white' : C.text, fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Criteria header legend */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
        <div style={{ background:'#F0EDF7', padding:'10px 16px', display:'flex', gap:8, alignItems:'center', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ width:180, fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Student</div>
          {CRITERIA.map(c => (
            <div key={c.id} style={{ flex:1, fontSize:10, fontWeight:600, color:C.text, fontFamily:'sans-serif', textAlign:'center', lineHeight:1.3 }}>
              {c.label}<br/><span style={{ color:C.muted, fontWeight:400 }}>{c.weight}%</span>
            </div>
          ))}
          <div style={{ width:80, fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', textAlign:'center' }}>Status</div>
        </div>

        {filtered.map((s, i) => {
          const ready = isReady(s);
          return (
            <div key={s} style={{ padding:'10px 16px', display:'flex', gap:8, alignItems:'center', borderBottom:`1px solid ${C.border}`, background: i % 2 === 0 ? C.white : '#FDFCFF' }}>
              <div style={{ width:180, fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>
                {s.split(' ')[0]} {s.split(' ')[1][0]}.
              </div>
              {CRITERIA.map(c => (
                <div key={c.id} style={{ flex:1, textAlign:'center' }}>
                  <button onClick={() => toggle(s, c.id)}
                    style={{ width:26, height:26, borderRadius:4, border:`2px solid ${data[s]?.[c.id] ? C.success : C.border}`, background:data[s]?.[c.id] ? C.success : 'transparent', cursor:'pointer', fontSize:13, color:'white', transition:'all .15s' }}>
                    {data[s]?.[c.id] ? '✓' : ''}
                  </button>
                </div>
              ))}
              <div style={{ width:80, textAlign:'center' }}>
                <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:ready ? '#e8f5e9' : '#fdecea', color:ready ? C.success : C.error, fontFamily:'sans-serif', fontWeight:700 }}>
                  {ready ? 'Ready' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReadinessTab;