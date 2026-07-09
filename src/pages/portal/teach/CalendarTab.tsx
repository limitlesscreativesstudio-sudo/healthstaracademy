// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './AuthContext';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', warn:'#E67E22', success:'#127A1B' } as const;

interface Ev { id:string; refId:string; title:string; date:Date; type:'assignment'|'quiz'|'attendance'; color:string; }

interface Props { courseId?: string; canEdit?: boolean; }

const CalendarTab: React.FC<Props> = ({ courseId }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month'|'agenda'>('month');
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState<Ev | null>(null);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const [{ data: asgn }, { data: qz }, { data: att }] = await Promise.all([
        supabase.from('assignments').select('id,title,due_at,submission_type').eq('course_id', courseId).not('due_at','is',null),
        supabase.from('quizzes').select('id,title,due_at').eq('course_id', courseId).not('due_at','is',null),
        supabase.from('attendance').select('id,session_date').eq('course_id', courseId),
      ]);
      const evs: Ev[] = [];
      (asgn ?? []).forEach(a => {
        const isQuiz = a.submission_type === 'quiz' || a.submission_type === 'exam';
        evs.push({ id:`a-${a.id}`, refId:a.id, title:a.title, date:new Date(a.due_at), type:isQuiz?'quiz':'assignment', color: isQuiz?C.warn:C.primary });
      });
      (qz ?? []).forEach(q => evs.push({ id:`q-${q.id}`, refId:q.id, title:q.title, date:new Date(q.due_at), type:'quiz', color:C.warn }));
      // dedupe attendance dates
      const attDates = new Set((att ?? []).map(a => a.session_date));
      attDates.forEach(d => evs.push({ id:`att-${d}`, refId:'', title:'Class Session', date:new Date(d+'T09:00:00'), type:'attendance', color:C.accent }));
      evs.sort((a,b) => a.date.getTime() - b.date.getTime());
      setEvents(evs);
      setLoading(false);
    };
    load();
  }, [courseId]);

  const monthGrid = useMemo(() => {
    const start = new Date(monthCursor); start.setDate(1);
    const startWeekday = start.getDay();
    const daysInMonth = new Date(start.getFullYear(), start.getMonth()+1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i=0;i<startWeekday;i++) cells.push(null);
    for (let d=1; d<=daysInMonth; d++) cells.push(new Date(start.getFullYear(), start.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthCursor]);

  const eventsOnDay = (d: Date) => events.filter(e =>
    e.date.getFullYear()===d.getFullYear() && e.date.getMonth()===d.getMonth() && e.date.getDate()===d.getDate()
  );

  const upcoming = useMemo(() => {
    const now = new Date();
    return events.filter(e => e.date >= now).slice(0, 20);
  }, [events]);

  const monthLabel = monthCursor.toLocaleString('default', { month:'long', year:'numeric' });

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Select a course.</div>;
  if (loading) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading calendar…</div>;

  return (
    <div style={{ padding:24, display:'flex', gap:20, fontFamily:'sans-serif' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text }}>Calendar</h2>
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            <button onClick={() => { const d=new Date(); d.setDate(1); setMonthCursor(d); }}
              style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, fontSize:12, cursor:'pointer' }}>Today</button>
            {(['month','agenda'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:view===v?C.primary:C.white, color:view===v?'white':C.text, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === 'month' ? (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', padding:'10px 14px', borderBottom:`1px solid ${C.border}` }}>
              <button onClick={() => setMonthCursor(d => new Date(d.getFullYear(), d.getMonth()-1, 1))} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:4, padding:'4px 10px', cursor:'pointer' }}>‹</button>
              <div style={{ flex:1, textAlign:'center', fontWeight:700, color:C.text }}>{monthLabel}</div>
              <button onClick={() => setMonthCursor(d => new Date(d.getFullYear(), d.getMonth()+1, 1))} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:4, padding:'4px 10px', cursor:'pointer' }}>›</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#F0EDF7' }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} style={{ padding:'6px 8px', fontSize:11, fontWeight:700, color:C.muted, textAlign:'center' }}>{d}</div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
              {monthGrid.map((d, i) => {
                const dayEvs = d ? eventsOnDay(d) : [];
                const isToday = d && d.toDateString() === new Date().toDateString();
                return (
                  <div key={i} style={{ minHeight:88, borderTop:`1px solid ${C.border}`, borderRight:(i%7!==6)?`1px solid ${C.border}`:'none', padding:6, background: isToday?'#EDE8F7':C.white }}>
                    {d && (
                      <>
                        <div style={{ fontSize:11, fontWeight:isToday?700:500, color:isToday?C.primary:C.text, marginBottom:4 }}>{d.getDate()}</div>
                        {dayEvs.slice(0,3).map(e => (
                          <div key={e.id} onClick={() => setSelected(e)}
                            style={{ fontSize:10, padding:'2px 5px', marginBottom:2, borderRadius:3, background:`${e.color}22`, color:e.color, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:600 }}>
                            {e.title}
                          </div>
                        ))}
                        {dayEvs.length > 3 && <div style={{ fontSize:10, color:C.muted }}>+{dayEvs.length - 3} more</div>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {upcoming.length === 0 ? (
              <div style={{ padding:48, textAlign:'center', color:C.muted, background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>Nothing coming up.</div>
            ) : upcoming.map(e => (
              <div key={e.id} onClick={() => setSelected(e)} style={{ background:C.white, border:`1px solid ${C.border}`, borderLeft:`4px solid ${e.color}`, borderRadius:6, padding:14, marginBottom:8, display:'flex', gap:12, alignItems:'center', cursor:'pointer' }}>
                <div style={{ textAlign:'center', minWidth:52 }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase' }}>{e.date.toLocaleString('default',{ month:'short' })}</div>
                  <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{e.date.getDate()}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:C.primary }}>{e.title}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{e.date.toLocaleString()} • {e.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width:220, flexShrink:0 }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:C.text, textTransform:'uppercase', letterSpacing:0.5, margin:'0 0 10px' }}>Legend</h3>
        {[
          ['Assignments', C.primary],
          ['Quizzes/Exams', C.warn],
          ['Class Sessions', C.accent],
        ].map(([l,c]) => (
          <div key={l as string} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, fontSize:12, color:C.text }}>
            <div style={{ width:12, height:12, borderRadius:3, background:c as string }}/> {l}
          </div>
        ))}
        <h3 style={{ fontSize:12, fontWeight:700, color:C.text, textTransform:'uppercase', letterSpacing:0.5, margin:'20px 0 8px' }}>Coming Up</h3>
        {upcoming.slice(0,5).length === 0 ? <p style={{ fontSize:12, color:C.muted }}>Nothing yet</p> :
          upcoming.slice(0,5).map(e => (
            <div key={e.id} style={{ fontSize:12, color:C.text, borderLeft:`3px solid ${e.color}`, paddingLeft:8, marginBottom:8 }}>
              <div style={{ fontWeight:600 }}>{e.title}</div>
              <div style={{ color:C.muted, fontSize:11 }}>{e.date.toLocaleDateString()}</div>
            </div>
          ))
        }
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:8, padding:24, minWidth:320, maxWidth:420, borderTop:`4px solid ${selected.color}` }}>
            <h3 style={{ margin:'0 0 6px', color:C.text, fontFamily:'sans-serif' }}>{selected.title}</h3>
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginBottom:12 }}>{selected.date.toLocaleString()}</div>
            <div style={{ fontSize:13, color:C.text, fontFamily:'sans-serif', textTransform:'capitalize' }}>Type: {selected.type}</div>
            <div style={{ marginTop:16, display:'flex', gap:8 }}>
              {selected.refId && selected.type !== 'attendance' && (
                <button onClick={() => {
                  const isQuiz = selected.type === 'quiz' && selected.id.startsWith('q-');
                  const path = isQuiz
                    ? `/portal/courses/${courseId}/quizzes/${selected.refId}`
                    : `/portal/courses/${courseId}/assignments/${selected.refId}`;
                  navigate(path);
                }}
                  style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', cursor:'pointer', fontFamily:'sans-serif' }}>
                  Open
                </button>
              )}
              <button onClick={() => setSelected(null)} style={{ padding:'7px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, cursor:'pointer', fontFamily:'sans-serif' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;
