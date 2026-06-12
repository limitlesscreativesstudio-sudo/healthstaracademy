// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState } from 'react';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8',
  success:'#127A1B', error:'#C0392B', warn:'#E67E22',
} as const;

const COHORT_COLORS: Record<string, string> = {
  '2026-1':'#7B4DB5', '2026-2':'#5BC8E8', '2025-4':'#9B6DD0',
  '2025-3':'#E8963C', '2025-2':'#CC4499', '2025-1':'#E8963C',
};

interface CalEvent {
  id: number; title: string; date: string; cohort: string;
  type: 'quiz'|'assignment'|'attendance'|'clinical'; time?: string;
}

// Based on real Canvas calendar data from screenshots
const EVENTS: CalEvent[] = [
  { id:1,  title:'Day 1 Quiz',         date:'2026-05-04', cohort:'2026-1', type:'quiz' },
  { id:2,  title:'Module01 Quiz',      date:'2026-05-04', cohort:'2026-1', type:'quiz' },
  { id:3,  title:'Module02 Quiz',      date:'2026-05-04', cohort:'2026-1', type:'quiz' },
  { id:4,  title:'Module03 Quiz',      date:'2026-05-04', cohort:'2026-1', type:'quiz' },
  { id:5,  title:'Case Study w/ Questions (6 students)', date:'2026-05-04', cohort:'2026-1', type:'assignment' },
  { id:6,  title:'Module04 Quiz',      date:'2026-05-05', cohort:'2026-1', type:'quiz' },
  { id:7,  title:'Module05 Quiz',      date:'2026-05-05', cohort:'2026-1', type:'quiz' },
  { id:8,  title:'Module06 Quiz',      date:'2026-05-05', cohort:'2026-1', type:'quiz' },
  { id:9,  title:'Module07 Quiz',      date:'2026-05-05', cohort:'2026-1', type:'quiz' },
  { id:10, title:'Day 2 Quiz',         date:'2026-05-05', cohort:'2026-1', type:'quiz' },
  { id:11, title:'8. Case Study w/ Questions', date:'2026-05-06', cohort:'2026-2', type:'assignment' },
  { id:12, title:'Day 4 Quiz',         date:'2026-05-06', cohort:'2026-2', type:'quiz' },
  { id:13, title:'Module08 Quiz',      date:'2026-05-06', cohort:'2026-2', type:'quiz' },
  { id:14, title:'Module09 Quiz',      date:'2026-05-06', cohort:'2026-2', type:'quiz' },
  { id:15, title:'Module01 Quiz',      date:'2026-05-07', cohort:'2026-2', type:'quiz', time:'11:30a' },
  { id:16, title:'Module02 Quiz',      date:'2026-05-08', cohort:'2026-2', type:'quiz', time:'11:30p' },
  { id:17, title:'Grade Roll Call Attendance', date:'2026-05-04', cohort:'2026-1', type:'attendance' },
  { id:18, title:'Grade Roll Call Attendance', date:'2026-05-05', cohort:'2026-1', type:'attendance' },
];

const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type ViewMode = 'month' | 'week' | 'agenda';

const CalendarTab: React.FC = () => {
  const [viewDate, setViewDate]   = useState(new Date(2026, 4, 1)); // May 2026
  const [view, setView]           = useState<ViewMode>('month');
  const [selCohorts, setSelCohorts] = useState<string[]>(Object.keys(COHORT_COLORS));
  const [selEvent, setSelEvent]   = useState<CalEvent | null>(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday   = () => setViewDate(new Date(2026, 4, 1));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsOnDate = (d: number) => {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return EVENTS.filter(e => e.date === key && selCohorts.includes(e.cohort));
  };

  const toggleCohort = (c: string) =>
    setSelCohorts(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const typeIcon = (t: string) => ({ quiz:'❓', assignment:'📝', attendance:'✔️', clinical:'🩺' }[t] ?? '📅');

  // Build agenda items sorted by date
  const agendaItems = EVENTS
    .filter(e => selCohorts.includes(e.cohort))
    .sort((a,b) => a.date.localeCompare(b.date));

  return (
    <div style={{ display:'flex', height:'100%' }}>
      {/* Main calendar */}
      <div style={{ flex:1, padding:20, overflowY:'auto' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={goToday}
              style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
              Today
            </button>
            <button onClick={prevMonth}
              style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:14, cursor:'pointer' }}>‹</button>
            <button onClick={nextMonth}
              style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:14, cursor:'pointer' }}>›</button>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>
              {MONTHS[month]} {year}
            </h2>
          </div>
          {/* View toggle */}
          <div style={{ display:'flex', border:`1px solid ${C.border}`, borderRadius:5, overflow:'hidden' }}>
            {(['week','month','agenda'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:'6px 16px', border:'none', cursor:'pointer', background:view===v?C.primary:C.white, color:view===v?'white':C.text, fontSize:12, fontFamily:'sans-serif', fontWeight:view===v?600:400, textTransform:'capitalize' }}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {view === 'month' && (
          <>
            {/* Day headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
              {DAYS.map(d => (
                <div key={d} style={{ padding:'6px 8px', textAlign:'center', fontSize:11, fontWeight:700, color:C.muted, fontFamily:'sans-serif' }}>{d}</div>
              ))}
            </div>
            {/* Grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, background:C.border, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
              {/* Empty cells */}
              {Array.from({ length: firstDay }).map((_,i) => (
                <div key={`e${i}`} style={{ background:C.bg, minHeight:100, padding:4 }}/>
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_,i) => {
                const day = i + 1;
                const evs = eventsOnDate(day);
                const isToday = day === 29 && month === 4 && year === 2026;
                return (
                  <div key={day} style={{ background:C.white, minHeight:100, padding:4, overflow:'hidden' }}>
                    <div style={{ fontSize:12, fontWeight:isToday?700:400, color:isToday?C.white:C.text, fontFamily:'sans-serif', width:22, height:22, borderRadius:'50%', background:isToday?C.primary:'transparent', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:3 }}>
                      {day}
                    </div>
                    {evs.slice(0,5).map(ev => (
                      <div key={ev.id} onClick={() => setSelEvent(ev)}
                        style={{ fontSize:9, padding:'2px 4px', marginBottom:2, borderRadius:3, background:COHORT_COLORS[ev.cohort]+'22', color:COHORT_COLORS[ev.cohort], fontFamily:'sans-serif', cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', borderLeft:`3px solid ${COHORT_COLORS[ev.cohort]}` }}>
                        {ev.time && <span style={{ fontWeight:700 }}>{ev.time} </span>}{ev.title}
                      </div>
                    ))}
                    {evs.length > 5 && (
                      <div style={{ fontSize:9, color:C.muted, fontFamily:'sans-serif', padding:'1px 4px' }}>+{evs.length-5} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === 'agenda' && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
            {agendaItems.length === 0 ? (
              <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>No events to show.</div>
            ) : (
              agendaItems.map((ev, i) => (
                <div key={ev.id} style={{ padding:'12px 16px', borderBottom:i<agendaItems.length-1?`1px solid ${C.border}`:'none', display:'flex', alignItems:'center', gap:14, cursor:'pointer' }}
                  onClick={() => setSelEvent(ev)}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                  <div style={{ width:4, height:36, borderRadius:2, background:COHORT_COLORS[ev.cohort], flexShrink:0 }}/>
                  <div style={{ width:80, flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>
                      {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                    </div>
                    {ev.time && <div style={{ fontSize:11, color:C.muted }}>{ev.time}</div>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>{ev.title}</div>
                    <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>
                      NATP ({ev.cohort}) • {ev.type.charAt(0).toUpperCase()+ev.type.slice(1)}
                    </div>
                  </div>
                  <span style={{ fontSize:18 }}>{typeIcon(ev.type)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'week' && (() => {
          const start = new Date(year, month, viewDate.getDate());
          start.setDate(start.getDate() - start.getDay());
          const weekDays = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
          });
          const keyFor = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          return (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:`1px solid ${C.border}`, background:'#F0EDF7' }}>
                {weekDays.map(d => (
                  <div key={d.toISOString()} style={{ padding:'10px 8px', textAlign:'center', borderRight:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:C.muted, fontFamily:'sans-serif' }}>{DAYS[d.getDay()]}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{d.getDate()}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', minHeight:380 }}>
                {weekDays.map(d => {
                  const evs = EVENTS.filter(e => e.date === keyFor(d) && selCohorts.includes(e.cohort));
                  return (
                    <div key={d.toISOString()} style={{ borderRight:`1px solid ${C.border}`, padding:6, display:'flex', flexDirection:'column', gap:4 }}>
                      {evs.length === 0 ? (
                        <div style={{ fontSize:10, color:C.border, fontFamily:'sans-serif', textAlign:'center', marginTop:12 }}>—</div>
                      ) : evs.map(ev => (
                        <div key={ev.id} onClick={() => setSelEvent(ev)}
                          style={{ fontSize:11, padding:'5px 7px', borderRadius:4, background:COHORT_COLORS[ev.cohort]+'22', color:COHORT_COLORS[ev.cohort], fontFamily:'sans-serif', cursor:'pointer', borderLeft:`3px solid ${COHORT_COLORS[ev.cohort]}`, lineHeight:1.3 }}>
                          {ev.time && <div style={{ fontWeight:700, fontSize:10 }}>{ev.time}</div>}
                          <div>{ev.title}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Right sidebar — calendars */}
      <div style={{ width:220, borderLeft:`1px solid ${C.border}`, padding:16, background:C.white, flexShrink:0 }}>
        {/* Mini calendar */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <button onClick={prevMonth} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color:C.muted }}>‹</button>
            <span style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{MONTHS[month].slice(0,3)} {year}</span>
            <button onClick={nextMonth} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color:C.muted }}>›</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:9, color:C.muted, fontFamily:'sans-serif', padding:2 }}>{d[0]}</div>)}
            {Array.from({ length: firstDay }).map((_,i) => <div key={`m${i}`}/>)}
            {Array.from({ length: daysInMonth }).map((_,i) => {
              const day = i+1;
              const hasEvent = eventsOnDate(day).length > 0;
              const isToday  = day === 29 && month === 4;
              return (
                <div key={day} style={{ textAlign:'center', fontSize:10, fontFamily:'sans-serif', padding:2, borderRadius:3, background:isToday?C.primary:hasEvent?'#EDE8F7':'transparent', color:isToday?'white':hasEvent?C.primary:C.text, fontWeight:hasEvent||isToday?700:400, cursor:hasEvent?'pointer':'default' }}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cohort filters */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontFamily:'sans-serif', marginBottom:10 }}>CALENDARS</div>
          {Object.entries(COHORT_COLORS).map(([cohort, color]) => (
            <label key={cohort} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer', fontSize:12, fontFamily:'sans-serif', color:C.text }}>
              <input type="checkbox" checked={selCohorts.includes(cohort)} onChange={() => toggleCohort(cohort)} style={{ accentColor:color }}/>
              <div style={{ width:12, height:12, borderRadius:2, background:color, flexShrink:0 }}/>
              Health Star Academy Hybrid Day NATP ({cohort})
            </label>
          ))}
          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer', fontSize:12, fontFamily:'sans-serif', color:C.muted }}>
              <input type="checkbox" defaultChecked style={{ accentColor:C.muted }}/>
              Undated
            </label>
            <span style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>📅 Calendar feed coming soon</span>
          </div>
        </div>
      </div>

      {/* Event detail popup */}
      {selEvent && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500 }}
          onClick={() => setSelEvent(null)}>
          <div style={{ background:C.white, borderRadius:10, padding:28, width:380, boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:18, marginBottom:6 }}>{typeIcon(selEvent.type)}</div>
                <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{selEvent.title}</h2>
              </div>
              <button onClick={() => setSelEvent(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:C.muted }}>×</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                ['Date', new Date(selEvent.date + 'T12:00:00').toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})],
                ['Course', `Health Star Academy Hybrid Day NATP (${selEvent.cohort})`],
                ['Type',   selEvent.type.charAt(0).toUpperCase()+selEvent.type.slice(1)],
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', gap:10, fontSize:13, fontFamily:'sans-serif' }}>
                  <span style={{ color:C.muted, width:60, flexShrink:0 }}>{label}:</span>
                  <span style={{ color:C.text }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              <button style={{ flex:1, padding:'8px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>View Assignment</button>
              <button onClick={() => setSelEvent(null)} style={{ flex:1, padding:'8px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;