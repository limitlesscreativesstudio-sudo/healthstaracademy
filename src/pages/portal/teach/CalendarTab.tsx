// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './AuthContext';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', warn:'#E67E22', success:'#127A1B' } as const;

interface Ev { id:string; refId:string; title:string; date:Date; type:'assignment'|'quiz'|'attendance'; color:string; }

interface Props { courseId?: string; canEdit?: boolean; }

interface EvExt extends Ev { section?: string | null; }

const CalendarTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const navigate = useNavigate();
  const filterKey = courseId ? `hsa.calendar.filters.${courseId}` : '';
  const initial = React.useMemo(() => {
    if (!filterKey) return { type: 'all', section: 'all', search: '', view: 'month' } as any;
    try { return { type:'all', section:'all', search:'', view:'month', ...JSON.parse(localStorage.getItem(filterKey) || '{}') }; }
    catch { return { type:'all', section:'all', search:'', view:'month' }; }
  }, [filterKey]);
  const [events, setEvents] = useState<EvExt[]>([]);
  const [undated, setUndated] = useState<Array<{ id:string; title:string; kind:'assignment'|'quiz' }>>([]);
  const [dueDraft, setDueDraft] = useState<string>('');
  const [savingDue, setSavingDue] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month'|'agenda'>(initial.view);
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState<EvExt | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all'|'assignment'|'quiz'|'attendance'>(initial.type);
  const [sectionFilter, setSectionFilter] = useState<string>(initial.section);
  const [search, setSearch] = useState(initial.search);

  // Persist filters per course
  useEffect(() => {
    if (!filterKey) return;
    try { localStorage.setItem(filterKey, JSON.stringify({ type: typeFilter, section: sectionFilter, search, view })); } catch {}
  }, [filterKey, typeFilter, sectionFilter, search, view]);


  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const [{ data: asgn }, { data: qz }, { data: att }] = await Promise.all([
        supabase.from('assignments').select('id,title,due_at,submission_type,group_name').eq('course_id', courseId).not('due_at','is',null),
        supabase.from('quizzes').select('id,title,due_at').eq('course_id', courseId).not('due_at','is',null),
        supabase.from('attendance').select('id,session_date').eq('course_id', courseId),
      ]);
      const evs: EvExt[] = [];
      (asgn ?? []).forEach(a => {
        const isQuiz = a.submission_type === 'quiz' || a.submission_type === 'exam';
        evs.push({ id:`a-${a.id}`, refId:a.id, title:a.title, date:new Date(a.due_at), type:isQuiz?'quiz':'assignment', color: isQuiz?C.warn:C.primary, section: a.group_name || null });
      });
      (qz ?? []).forEach(q => evs.push({ id:`q-${q.id}`, refId:q.id, title:q.title, date:new Date(q.due_at), type:'quiz', color:C.warn, section: null }));
      const attDates = new Set((att ?? []).map(a => a.session_date));
      attDates.forEach(d => evs.push({ id:`att-${d}`, refId:'', title:'Class Session', date:new Date(d+'T09:00:00'), type:'attendance', color:C.accent, section: null }));
      evs.sort((a,b) => a.date.getTime() - b.date.getTime());
      setEvents(evs);

      // Items with no due date yet — instructors can schedule them from here
      const [{ data: ua }, { data: uq }] = await Promise.all([
        supabase.from('assignments').select('id,title').eq('course_id', courseId).is('due_at', null),
        supabase.from('quizzes').select('id,title').eq('course_id', courseId).is('due_at', null),
      ]);
      setUndated([
        ...(ua ?? []).map(a => ({ id:a.id, title:a.title, kind:'assignment' as const })),
        ...(uq ?? []).map(q => ({ id:q.id, title:q.title, kind:'quiz' as const })),
      ].sort((a,b) => a.title.localeCompare(b.title, undefined, { numeric:true })));
      setLoading(false);
    };
    load();
  }, [courseId, reloadKey]);

  const toLocalInput = (d?: Date | null) => {
    if (!d) return '';
    const p = (n:number) => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const saveDueDate = async (kind:'assignment'|'quiz', id:string, localValue:string) => {
    setSavingDue(true);
    const iso = localValue ? new Date(localValue).toISOString() : null;
    const table = kind === 'quiz' ? 'quizzes' : 'assignments';
    const { error } = await supabase.from(table).update({ due_at: iso }).eq('id', id);
    setSavingDue(false);
    if (error) { toast.error(error.message); return false; }
    toast.success(iso ? 'Due date updated' : 'Due date cleared');
    setReloadKey(k => k + 1);
    return true;
  };

  const sectionOptions = useMemo(() => {
    const s = new Set<string>();
    events.forEach(e => { if (e.section) s.add(e.section); });
    return Array.from(s).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter(e => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (sectionFilter !== 'all' && (e.section || '') !== sectionFilter) return false;
      if (q && !e.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [events, typeFilter, sectionFilter, search]);

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

  const eventsOnDay = (d: Date) => filteredEvents.filter(e =>
    e.date.getFullYear()===d.getFullYear() && e.date.getMonth()===d.getMonth() && e.date.getDate()===d.getDate()
  );

  const upcoming = useMemo(() => {
    const now = new Date();
    return filteredEvents.filter(e => e.date >= now).slice(0, 20);
  }, [filteredEvents]);

  const monthLabel = monthCursor.toLocaleString('default', { month:'long', year:'numeric' });

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Select a course.</div>;
  if (loading) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading calendar…</div>;

  return (
    <div style={{ padding:24, display:'flex', gap:20, fontFamily:'sans-serif' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text }}>Calendar</h2>
          <div style={{ marginLeft:'auto', display:'flex', gap:6, flexWrap:'wrap' }}>
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

        {/* Filters */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, fontFamily:'sans-serif', minWidth:160 }}/>
          {(['all','assignment','quiz','attendance'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={{ padding:'5px 12px', border:`1px solid ${typeFilter===t?C.primary:C.border}`, borderRadius:20, background:typeFilter===t?C.primary:C.white, color:typeFilter===t?'white':C.text, fontSize:11, cursor:'pointer', textTransform:'capitalize' }}>
              {t === 'all' ? 'All' : t === 'attendance' ? 'Sessions' : t + 's'}
            </button>
          ))}
          {sectionOptions.length > 0 && (
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
              style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:12, fontFamily:'sans-serif' }}>
              <option value="all">All sections</option>
              {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <span style={{ marginLeft:'auto', fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>
            {filteredEvents.length} event{filteredEvents.length===1?'':'s'}
          </span>
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
