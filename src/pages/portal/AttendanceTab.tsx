import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const STUDENTS = [
  'Aaliyah Johnson','Carlos Martinez','Destiny Williams','Emmanuel Okafor',
  'Fatima Hassan','Gloria Chen','Henry Brown','Isabella Reyes',
  'James Nakamura','Keisha Thompson','Luis Hernandez','Maria Santos',
];

const COHORTS = [
  'Health Star Academy Hybrid Day NATP (2026-1) 1/26/2026–3/9/2026',
  'Health Star Academy Hybrid Day NATP (2026-2) 3/16/2026–4/7/2026',
  'Health Star Academy Hybrid Day NATP (2025-4) 10/13/2025–11/25/2025',
];

const DAYS_OF_WEEK = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

// Build a list of the course session days (Mon–Fri)
const buildDates = () => {
  const dates: Date[] = [];
  const start = new Date(2026, 0, 26); // Jan 26 2026
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(d);
    if (dates.length >= 10) break;
  }
  return dates;
};
const SESSION_DATES = buildDates();

const fmt = (d: Date) => `${DAYS_OF_WEEK[d.getDay()]} ${d.toLocaleString('default',{month:'short'}).toUpperCase()} ${String(d.getDate()).padStart(2,'0')}`;
const fmtLong = (d: Date) => d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

type ViewMode = 'list' | 'class';

const AttendanceTab: React.FC = () => {
  const [cohort, setCohort]     = useState(COHORTS[0]);
  const [dateIdx, setDateIdx]   = useState(0);
  const [mode, setMode]         = useState<ViewMode>('list');
  const [present, setPresent]   = useState<Record<string, Record<number, boolean>>>(() => {
    const p: Record<string, Record<number, boolean>> = {};
    STUDENTS.forEach(s => { p[s] = {}; SESSION_DATES.forEach((_, i) => { p[s][i] = Math.random() > 0.12; }); });
    return p;
  });
  const [showCal, setShowCal]   = useState(false);

  const currentDate = SESSION_DATES[dateIdx];
  const markAllPresent = () => setPresent(p => ({ ...p, ...Object.fromEntries(STUDENTS.map(s => [s, { ...p[s], [dateIdx]: true }])) }));
  const unmarkAll      = () => setPresent(p => ({ ...p, ...Object.fromEntries(STUDENTS.map(s => [s, { ...p[s], [dateIdx]: false }])) }));
  const toggleStudent  = (s: string) => setPresent(p => ({ ...p, [s]: { ...p[s], [dateIdx]: !p[s][dateIdx] } }));

  const presentCount = STUDENTS.filter(s => present[s]?.[dateIdx]).length;
  const absentCount  = STUDENTS.length - presentCount;
  const overallRate  = (s: string) => {
    const total = SESSION_DATES.length;
    const done  = SESSION_DATES.reduce((n, _, i) => n + (present[s]?.[i] ? 1 : 0), 0);
    return Math.round((done / total) * 100);
  };

  return (
    <div style={{ padding:0 }}>
      {/* Roll Call header bar */}
      <div style={{ background:'#4a4a4a', color:'white', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:700, fontFamily:'sans-serif' }}>Roll Call</h2>
        <div style={{ display:'flex', gap:4 }}>
          {(['list','class'] as ViewMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ padding:'5px 16px', border:'none', cursor:'pointer', fontFamily:'sans-serif', fontSize:12, fontWeight:600, background:mode===m?'#6c6c6c':'transparent', color:'white', borderRadius:4, textTransform:'uppercase' }}>
              {m === 'list' ? '☰ LIST' : '⊞ CLASS'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 20px' }}>
        {/* Cohort selector */}
        <select value={cohort} onChange={e => setCohort(e.target.value)}
          style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 12px', fontSize:13, fontFamily:'sans-serif', marginBottom:14, color:C.text, background:C.white, cursor:'pointer' }}>
          {COHORTS.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Date navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={markAllPresent}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', border:'1px solid #aaa', borderRadius:4, background:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              <span style={{ color:C.success, fontSize:14 }}>✓</span> MARK ALL PRESENT
            </button>
            <button onClick={unmarkAll}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', border:'1px solid #aaa', borderRadius:4, background:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              <span style={{ color:C.muted, fontSize:14 }}>↩</span> UNMARK ALL
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => setDateIdx(i => Math.max(0, i-1))} disabled={dateIdx === 0}
              style={{ padding:'5px 10px', border:'1px solid #ccc', borderRadius:4, background:'white', cursor:'pointer', fontSize:16, opacity:dateIdx===0?0.4:1 }}>‹</button>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:'sans-serif', color:C.text, minWidth:180, textAlign:'center' }}>
              {currentDate ? fmt(currentDate) : '—'}
            </div>
            <button onClick={() => setDateIdx(i => Math.min(SESSION_DATES.length - 1, i+1))} disabled={dateIdx === SESSION_DATES.length - 1}
              style={{ padding:'5px 10px', border:'1px solid #ccc', borderRadius:4, background:'white', cursor:'pointer', fontSize:16, opacity:dateIdx===SESSION_DATES.length-1?0.4:1 }}>›</button>
            <button onClick={() => setShowCal(!showCal)} title="Jump to date"
              style={{ padding:'5px 10px', border:'1px solid #ccc', borderRadius:4, background:'white', cursor:'pointer', fontSize:16 }}>📅</button>
          </div>
        </div>

        {/* Calendar jump popup */}
        {showCal && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:12, marginBottom:14, display:'flex', gap:8, flexWrap:'wrap' }}>
            {SESSION_DATES.map((d, i) => (
              <button key={i} onClick={() => { setDateIdx(i); setShowCal(false); }}
                style={{ padding:'5px 10px', border:`1px solid ${i===dateIdx?C.primary:C.border}`, borderRadius:4, background:i===dateIdx?C.primary:'white', color:i===dateIdx?'white':C.text, fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>
                {fmt(d)}
              </button>
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display:'flex', gap:14, marginBottom:16 }}>
          <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:6, padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18, color:C.success }}>✓</span>
            <div>
              <div style={{ fontSize:18, fontWeight:700, color:C.success, fontFamily:'sans-serif' }}>{presentCount}</div>
              <div style={{ fontSize:11, color:C.success, fontFamily:'sans-serif' }}>Present</div>
            </div>
          </div>
          <div style={{ background:'#fdecea', border:'1px solid #f5c6c2', borderRadius:6, padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18, color:C.error }}>✗</span>
            <div>
              <div style={{ fontSize:18, fontWeight:700, color:C.error, fontFamily:'sans-serif' }}>{absentCount}</div>
              <div style={{ fontSize:11, color:C.error, fontFamily:'sans-serif' }}>Absent</div>
            </div>
          </div>
          <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:'8px 16px' }}>
            <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>
              {currentDate ? fmtLong(currentDate) : ''} &nbsp;•&nbsp; {presentCount} of {STUDENTS.length} present
            </div>
          </div>
        </div>

        {mode === 'list' && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
            {STUDENTS.map((s, i) => {
              const isP = present[s]?.[dateIdx];
              const rate = overallRate(s);
              return (
                <div key={s} style={{ padding:'12px 16px', borderBottom:i<STUDENTS.length-1?`1px solid ${C.border}`:'none', display:'flex', alignItems:'center', gap:14 }}>
                  {/* Toggle checkbox */}
                  <button onClick={() => toggleStudent(s)}
                    style={{ width:28, height:28, borderRadius:4, border:`2px solid ${isP?C.success:C.border}`, background:isP?C.success:'transparent', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
                    {isP && <span style={{ color:'white', fontSize:16, fontWeight:700 }}>✓</span>}
                  </button>
                  {/* Avatar */}
                  <div style={{ width:36, height:36, borderRadius:'50%', background: isP ? C.success : '#ccc', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
                    {s.split(' ').map(w=>w[0]).join('')}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:C.text, fontFamily:'sans-serif' }}>{s}</div>
                    <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>
                      Overall attendance: <span style={{ color: rate>=90?C.success:rate>=75?C.warn:C.error, fontWeight:600 }}>{rate}%</span>
                      {rate < 90 && <span style={{ color:C.error, marginLeft:8 }}>⚠ Below CDPH 90% requirement</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ fontSize:13, padding:'4px 14px', borderRadius:20, background:isP?'#e8f5e9':'#fdecea', color:isP?C.success:C.error, fontFamily:'sans-serif', fontWeight:700 }}>
                      {isP ? 'Present' : 'Absent'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {mode === 'class' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
            {STUDENTS.map(s => {
              const isP = present[s]?.[dateIdx];
              return (
                <div key={s} onClick={() => toggleStudent(s)}
                  style={{ background:isP?'#e8f5e9':C.white, border:`2px solid ${isP?C.success:C.border}`, borderRadius:8, padding:'14px 12px', textAlign:'center', cursor:'pointer', transition:'all .2s' }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:isP?C.success:'#ccc', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, margin:'0 auto 8px' }}>
                    {s.split(' ').map(w=>w[0]).join('')}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', lineHeight:1.3, marginBottom:4 }}>{s}</div>
                  <div style={{ fontSize:11, color:isP?C.success:C.error, fontFamily:'sans-serif', fontWeight:700 }}>{isP?'Present':'Absent'}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTab;
