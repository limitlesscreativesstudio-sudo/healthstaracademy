// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './AuthContext';
import PortalLayout from '@/components/portal/PortalLayout';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', warn:'#E67E22' } as const;

interface Ev { id:string; refId:string; courseId:string; courseTitle:string; title:string; date:Date; type:'assignment'|'quiz'|'attendance'; color:string; }

const GlobalCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month'|'agenda'>(() => (localStorage.getItem('hsa.gcal.view') as any) || 'month');
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState<Ev | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all'|'assignment'|'quiz'|'attendance'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [courses, setCourses] = useState<{id:string; title:string; color:string}[]>([]);

  useEffect(() => { localStorage.setItem('hsa.gcal.view', view); }, [view]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { setLoading(false); return; }

      const { data: enrs } = await supabase.from('enrollments').select('course_id').eq('user_id', u.user.id);
      const courseIds = Array.from(new Set((enrs ?? []).map((e:any) => e.course_id)));
      if (courseIds.length === 0) { setLoading(false); return; }

      const { data: cs } = await supabase.from('courses').select('id,title').in('id', courseIds);
      const palette = [C.primary, C.accent, C.warn, '#127A1B', '#B84DFF', '#0EA5E9'];
      const cList = (cs ?? []).map((c:any, i:number) => ({ id:c.id, title:c.title, color: palette[i % palette.length] }));
      setCourses(cList);
      const titleMap = Object.fromEntries(cList.map(c => [c.id, c.title]));

      const [{ data: asgn }, { data: qz }, { data: att }] = await Promise.all([
        supabase.from('assignments').select('id,course_id,title,due_at,submission_type').in('course_id', courseIds).not('due_at','is',null),
        supabase.from('quizzes').select('id,course_id,title,due_at').in('course_id', courseIds).not('due_at','is',null),
        supabase.from('attendance').select('id,course_id,session_date').in('course_id', courseIds),
      ]);
      const evs: Ev[] = [];
      (asgn ?? []).forEach((a:any) => {
        const isQuiz = a.submission_type === 'quiz' || a.submission_type === 'exam';
        evs.push({ id:`a-${a.id}`, refId:a.id, courseId:a.course_id, courseTitle:titleMap[a.course_id]||'', title:a.title, date:new Date(a.due_at), type:isQuiz?'quiz':'assignment', color:isQuiz?C.warn:C.primary });
      });
      (qz ?? []).forEach((q:any) => evs.push({ id:`q-${q.id}`, refId:q.id, courseId:q.course_id, courseTitle:titleMap[q.course_id]||'', title:q.title, date:new Date(q.due_at), type:'quiz', color:C.warn }));
      const seen = new Set<string>();
      (att ?? []).forEach((a:any) => {
        const k = `${a.course_id}|${a.session_date}`;
        if (seen.has(k)) return; seen.add(k);
        evs.push({ id:`att-${k}`, refId:'', courseId:a.course_id, courseTitle:titleMap[a.course_id]||'', title:'Class Session', date:new Date(a.session_date+'T09:00:00'), type:'attendance', color:C.accent });
      });
      evs.sort((a,b) => a.date.getTime() - b.date.getTime());
      setEvents(evs);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => events.filter(e =>
    (typeFilter === 'all' || e.type === typeFilter) &&
    (courseFilter === 'all' || e.courseId === courseFilter)
  ), [events, typeFilter, courseFilter]);

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

  const dayEvents = (d: Date) => filtered.filter(e =>
    e.date.getFullYear()===d.getFullYear() && e.date.getMonth()===d.getMonth() && e.date.getDate()===d.getDate()
  );

  const upcoming = useMemo(() => filtered.filter(e => e.date >= new Date()).slice(0, 40), [filtered]);
  const monthLabel = monthCursor.toLocaleString('default', { month:'long', year:'numeric' });

  return (
    <PortalLayout>
      <div style={{ padding:24, fontFamily:'sans-serif', display:'flex', gap:20 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
            <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:C.text }}>Calendar</h2>
            <div style={{ marginLeft:'auto', display:'flex', gap:6, flexWrap:'wrap' }}>
              <button onClick={() => { const d=new Date(); d.setDate(1); setMonthCursor(d); }}
                style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, fontSize:12, cursor:'pointer' }}>Today</button>
              <button onClick={() => setMonthCursor(d => new Date(d.getFullYear(), d.getMonth()-1, 1))} style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, cursor:'pointer' }}>‹</button>
              <button onClick={() => setMonthCursor(d => new Date(d.getFullYear(), d.getMonth()+1, 1))} style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, cursor:'pointer' }}>›</button>
              {(['month','agenda'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:view===v?C.primary:C.white, color:view===v?'white':C.text, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
            {(['all','assignment','quiz','attendance'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                style={{ padding:'5px 12px', border:`1px solid ${typeFilter===t?C.primary:C.border}`, borderRadius:20, background:typeFilter===t?C.primary:C.white, color:typeFilter===t?'white':C.text, fontSize:11, cursor:'pointer', textTransform:'capitalize' }}>
                {t === 'all' ? 'All' : t === 'attendance' ? 'Sessions' : t + 's'}
              </button>
            ))}
            <select aria-label="Filter by course" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
              style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}>
              <option value="all">All courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <span style={{ marginLeft:'auto', fontSize:11, color:C.muted }}>{filtered.length} event{filtered.length===1?'':'s'}</span>
          </div>

          {loading ? <div style={{ padding:48, textAlign:'center', color:C.muted }}>Loading…</div> :
            view === 'month' ? (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`, textAlign:'center', fontWeight:700, color:C.text }}>{monthLabel}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#F0EDF7' }}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d =>
                    <div key={d} style={{ padding:'6px 8px', fontSize:11, fontWeight:700, color:C.muted, textAlign:'center' }}>{d}</div>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
                  {monthGrid.map((d, i) => {
                    const evs = d ? dayEvents(d) : [];
                    const isToday = d && d.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} style={{ minHeight:96, borderTop:`1px solid ${C.border}`, borderRight:(i%7!==6)?`1px solid ${C.border}`:'none', padding:6, background:isToday?'#EDE8F7':C.white }}>
                        {d && <>
                          <div style={{ fontSize:11, fontWeight:isToday?700:500, color:isToday?C.primary:C.text, marginBottom:4 }}>{d.getDate()}</div>
                          {evs.slice(0,3).map(e => (
                            <div key={e.id} onClick={() => setSelected(e)}
                              style={{ fontSize:10, padding:'2px 5px', marginBottom:2, borderRadius:3, background:`${e.color}22`, color:e.color, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:600 }}>{e.title}</div>
                          ))}
                          {evs.length > 3 && <div style={{ fontSize:10, color:C.muted }}>+{evs.length - 3} more</div>}
                        </>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                {upcoming.length === 0 ? <div style={{ padding:48, textAlign:'center', color:C.muted, background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>Nothing coming up.</div>
                : upcoming.map(e => (
                  <div key={e.id} onClick={() => setSelected(e)} style={{ background:C.white, border:`1px solid ${C.border}`, borderLeft:`4px solid ${e.color}`, borderRadius:6, padding:14, marginBottom:8, display:'flex', gap:12, alignItems:'center', cursor:'pointer' }}>
                    <div style={{ textAlign:'center', minWidth:52 }}>
                      <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase' }}>{e.date.toLocaleString('default',{ month:'short' })}</div>
                      <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{e.date.getDate()}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:C.primary }}>{e.title}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{e.courseTitle} • {e.date.toLocaleString()} • {e.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div style={{ width:220, flexShrink:0 }}>
          <h3 style={{ fontSize:12, fontWeight:700, color:C.text, textTransform:'uppercase', letterSpacing:0.5, margin:'0 0 10px' }}>Calendars</h3>
          {courses.length === 0 ? <p style={{ fontSize:12, color:C.muted }}>No courses yet</p> :
            courses.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, fontSize:12, color:C.text }}>
                <div style={{ width:12, height:12, borderRadius:3, background:c.color }}/> {c.title}
              </div>
            ))
          }
          <h3 style={{ fontSize:12, fontWeight:700, color:C.text, textTransform:'uppercase', letterSpacing:0.5, margin:'20px 0 8px' }}>Legend</h3>
          {[['Assignments', C.primary],['Quizzes/Exams', C.warn],['Class Sessions', C.accent]].map(([l,c]:any) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, fontSize:12, color:C.text }}>
              <div style={{ width:12, height:12, borderRadius:3, background:c }}/> {l}
            </div>
          ))}
        </div>

        {selected && (
          <div onClick={() => setSelected(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
            <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:8, padding:24, minWidth:320, maxWidth:420, borderTop:`4px solid ${selected.color}` }}>
              <h3 style={{ margin:'0 0 6px', color:C.text }}>{selected.title}</h3>
              <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>{selected.courseTitle}</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>{selected.date.toLocaleString()}</div>
              <div style={{ fontSize:13, color:C.text, textTransform:'capitalize' }}>Type: {selected.type}</div>
              <div style={{ marginTop:16, display:'flex', gap:8 }}>
                {selected.refId && selected.type !== 'attendance' && (
                  <button onClick={() => {
                    const path = selected.type === 'quiz' && selected.id.startsWith('q-')
                      ? `/portal/courses/${selected.courseId}/quizzes/${selected.refId}`
                      : `/portal/courses/${selected.courseId}/assignments/${selected.refId}`;
                    navigate(path);
                  }} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', cursor:'pointer' }}>Open</button>
                )}
                <button onClick={() => navigate(`/portal/courses/${selected.courseId}`)} style={{ padding:'7px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, cursor:'pointer' }}>Go to Course</button>
                <button onClick={() => setSelected(null)} style={{ padding:'7px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, cursor:'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default GlobalCalendar;
