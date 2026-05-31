import React, { useState } from 'react';
import AttendanceTab    from './AttendanceTab';
import CareerPortal     from './CareerPortal';
import ClinicalSkillsTab from './ClinicalSkillsTab';
import FilesTab         from './FilesTab';
import PagesTab         from './PagesTab';
import QuizView         from './QuizView';
import ReadinessTab     from './ReadinessTab';
import RequiredWork     from './RequiredWork';
import StudentDashboard from './StudentDashboard';
import StudentGrades    from './StudentGrades';
import SyllabusTab      from './SyllabusTab';
import AssignmentView   from './AssignmentView';
import { useAuth }       from './AuthContext';

const C = { nav:'#3D1B6E', primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Course { id:number; name:string; code:string; color:string; term:string; students:number; published:boolean; }

const COURSES: Course[] = [
  { id:1, name:'Health Star Academy Hybrid Day NATP (2026-1)', code:'HSA-NATP-2026-1', color:'#7B4DB5', term:'1/26/2026–3/9/2026',  students:12, published:true  },
  { id:2, name:'Health Star Academy Hybrid Day NATP (2026-2)', code:'HSA-NATP-2026-2', color:'#5BC8E8', term:'3/16/2026–4/7/2026', students:10, published:true  },
  { id:3, name:'Health Star Academy Hybrid Day NATP (2025-4)', code:'HSA-NATP-2025-4', color:'#9B6DD0', term:'10/13/2025–11/25/2025',students:11,published:false },
];

interface ModuleItem { id:number; type:string; name:string; pts?:number; published:boolean; indent:number; }
interface Module     { id:number; name:string; published:boolean; expanded:boolean; items:ModuleItem[]; }

const MODULES: Module[] = [
  { id:1, name:'Day 1 [Orientation 6AM–7AM, Theory 7AM–3PM; Module 1 [2 hrs], Module 2 [3 hrs], Module 3 [2 hrs]]', published:true, expanded:true, items:[
    { id:1,  type:'page',       name:'How to Join Live Lecture via Zoom',         published:true,  indent:0 },
    { id:2,  type:'page',       name:'Student Handbook Policies and Acknowledgement', published:true,  indent:0 },
    { id:3,  type:'file',       name:'State Exam Student Handbook',               published:true,  indent:0 },
    { id:4,  type:'quiz',       name:'Day 1 Quiz', pts:10,                        published:true,  indent:1 },
  ]},
  { id:2, name:'Video Conference Info', published:true, expanded:true, items:[
    { id:5,  type:'page',       name:'Video Conference Info',                      published:true,  indent:0 },
  ]},
  { id:3, name:'Learning Resources, Curriculum, and Learning Objectives', published:true, expanded:true, items:[
    { id:6,  type:'file',       name:'California Module 1.pdf',                   published:true,  indent:0 },
    { id:7,  type:'file',       name:'Module01_PowerPoint.pptx',                  published:true,  indent:0 },
    { id:8,  type:'file',       name:'California Module 2.pdf',                   published:true,  indent:0 },
    { id:9,  type:'file',       name:'Module02_PowerPoint.pptx',                  published:true,  indent:0 },
    { id:10, type:'file',       name:'California Module 3.pdf',                   published:true,  indent:0 },
    { id:11, type:'file',       name:'Module03_PowerPoint.pptx',                  published:true,  indent:0 },
  ]},
  { id:4, name:'Case Study', published:true, expanded:true, items:[
    { id:12, type:'page',       name:'1. Case Study',                             published:true,  indent:0 },
    { id:13, type:'assignment', name:'2. Case Study w/ Questions', pts:3,         published:true,  indent:1 },
    { id:14, type:'assignment', name:'3. Case Study (Part 2)', pts:3,             published:true,  indent:1 },
  ]},
  { id:5, name:'Module Quizzes', published:true, expanded:false, items:[
    { id:15, type:'quiz',       name:'Module01 Quiz', pts:10,                     published:true,  indent:0 },
    { id:16, type:'quiz',       name:'Module02 Quiz', pts:10,                     published:true,  indent:0 },
    { id:17, type:'quiz',       name:'Module03 Quiz', pts:10,                     published:true,  indent:0 },
  ]},
];

const itemIcon = (t:string) => ({ assignment:'📝', quiz:'❓', page:'📄', file:'📎', video:'🎥', discussion:'💬', external_url:'🔗' }[t] ?? '📄');

const ModulesHome: React.FC = () => {
  const [mods, setMods]       = useState<Module[]>(MODULES);
  const [addMod, setAddMod]   = useState(false);
  const [newName, setNewName] = useState('');
  const [addItem, setAddItem] = useState<number|null>(null);
  const [ni, setNi]           = useState({ title:'', type:'page', pts:'' });

  const toggle     = (id:number) => setMods(p => p.map(m => m.id===id?{...m,expanded:!m.expanded}:m));
  const togglePub  = (id:number) => setMods(p => p.map(m => m.id===id?{...m,published:!m.published}:m));
  const toggleIPub = (mid:number,iid:number) => setMods(p => p.map(m => m.id===mid?{...m,items:m.items.map(it=>it.id===iid?{...it,published:!it.published}:it)}:m));
  const saveMod    = () => { if(!newName.trim())return; setMods(p=>[...p,{id:Date.now(),name:newName,published:false,expanded:true,items:[]}]); setNewName('');setAddMod(false); };
  const saveItem   = () => { if(!ni.title.trim())return; setMods(p=>p.map(m=>m.id===addItem?{...m,items:[...m.items,{id:Date.now(),type:ni.type,name:ni.title,pts:ni.pts?parseInt(ni.pts):undefined,published:false,indent:0}]}:m)); setNi({title:'',type:'page',pts:''});setAddItem(null); };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Modules</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setMods(p=>p.map(m=>({...m,expanded:false})))} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Collapse All</button>
          <button onClick={()=>setMods(p=>p.map(m=>({...m,expanded:true})))} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Expand All</button>
          <button onClick={()=>setAddMod(true)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ Module</button>
        </div>
      </div>

      {addMod && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:5, padding:16, marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Module Name *</label>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Day 11 [...]"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', marginBottom:10, outline:'none' }}/>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={saveMod} style={{ padding:'6px 16px', border:'none', borderRadius:4, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Add Module</button>
            <button onClick={()=>setAddMod(false)} style={{ padding:'6px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {mods.map(m => (
        <div key={m.id} style={{ border:`1px solid ${C.border}`, borderRadius:5, marginBottom:10, overflow:'hidden', background:C.white }}>
          <div style={{ padding:'11px 14px', background:'#F0EDF7', display:'flex', alignItems:'center', gap:10, borderBottom:m.expanded?`1px solid ${C.border}`:'none' }}>
            <button onClick={()=>toggle(m.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:C.text, fontSize:14, flexShrink:0 }}>{m.expanded?'▼':'▶'}</button>
            <span style={{ flex:1, fontWeight:700, fontSize:13, fontFamily:'sans-serif', color:C.text, lineHeight:1.4 }}>{m.name}</span>
            {!m.published && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:C.bg, color:C.muted, fontFamily:'sans-serif' }}>Unpublished</span>}
            <div onClick={()=>togglePub(m.id)} title={m.published?'Published':'Unpublished'}
              style={{ width:18, height:18, borderRadius:'50%', background:m.published?C.success:C.border, cursor:'pointer', flexShrink:0 }}/>
            <button onClick={()=>setAddItem(m.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.primary, fontSize:12, fontFamily:'sans-serif', padding:'2px 6px' }}>+ Item</button>
            <button onClick={()=>setMods(p=>p.filter(x=>x.id!==m.id))} style={{ background:'none', border:'none', cursor:'pointer', color:C.error, padding:3, fontSize:14 }}>✕</button>
          </div>
          {m.expanded && <>
            {m.items.map((it, i) => (
              <div key={it.id} style={{ padding:'9px 14px', paddingLeft:14+(it.indent*20), display:'flex', alignItems:'center', gap:10, borderBottom:i<m.items.length-1?`1px solid ${C.border}`:'none', cursor:'pointer' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#faf9fc'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=C.white}>
                <span style={{ fontSize:13 }}>{itemIcon(it.type)}</span>
                <span style={{ flex:1, fontSize:13, color:C.primary, fontFamily:'sans-serif', fontWeight:500 }}>{it.name}</span>
                {it.pts && <span style={{ fontSize:12, color:C.muted }}>{it.pts} pts</span>}
                <div onClick={()=>toggleIPub(m.id,it.id)} title={it.published?'Published':'Unpublished'}
                  style={{ width:16, height:16, borderRadius:'50%', background:it.published?C.success:C.border, cursor:'pointer', flexShrink:0 }}/>
              </div>
            ))}
            {addItem===m.id?(
              <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.border}`, background:'#faf9fc' }}>
                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <select value={ni.type} onChange={e=>setNi(p=>({...p,type:e.target.value}))}
                    style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 8px', fontSize:12, fontFamily:'sans-serif', color:C.text }}>
                    {['page','assignment','quiz','file','video','discussion'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                  <input value={ni.title} onChange={e=>setNi(p=>({...p,title:e.target.value}))} placeholder="Item title"
                    style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 9px', fontSize:13, fontFamily:'sans-serif', color:C.text, outline:'none' }}/>
                  <input value={ni.pts} onChange={e=>setNi(p=>({...p,pts:e.target.value}))} placeholder="pts" style={{ width:52, border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 7px', fontSize:13, fontFamily:'sans-serif', color:C.text, outline:'none' }}/>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={saveItem} style={{ padding:'5px 14px', border:'none', borderRadius:4, background:C.primary, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>Add</button>
                  <button onClick={()=>setAddItem(null)} style={{ padding:'5px 11px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            ):(
              <div onClick={()=>setAddItem(m.id)} style={{ padding:'8px 14px', borderTop:`1px dashed ${C.border}`, cursor:'pointer', color:C.primary, fontSize:12, fontFamily:'sans-serif', display:'flex', alignItems:'center', gap:5 }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f4f1fc'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=C.white}>
                + Add Item
              </div>
            )}
          </>}
        </div>
      ))}
    </div>
  );
};

const AnnouncementsPanel: React.FC = () => {
  const [anns, setAnns] = useState([
    { id:1, title:'Week 3 Clinical Prep Reminder', body:'Please review the hand washing technique video before your clinical visit this Friday. Bring your signed skills checklist.', date:'May 26, 2026', replies:3 },
    { id:2, title:'Vital Signs Lab Rescheduled', body:'Due to facility maintenance, the Vital Signs Lab has been moved to June 22. Please update your calendars.', date:'May 24, 2026', replies:7 },
    { id:3, title:'Welcome to the 2026-1 Cohort!', body:'Welcome! Please read through the syllabus and complete the Student Handbook acknowledgement before Day 2.', date:'Jan 26, 2026', replies:12 },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title:'', body:'' });
  const post = () => { if(!form.title||!form.body)return; setAnns(p=>[{id:Date.now(),title:form.title,body:form.body,date:'Today',replies:0},...p]); setForm({title:'',body:''});setOpen(false); };
  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Announcements</h2>
        <button onClick={()=>setOpen(!open)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ Announcement</button>
      </div>
      {open && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:20, marginBottom:16 }}>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Title *</label>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Message *</label>
            <textarea value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))} rows={4} style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }}/>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={post} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Post</button>
            <button onClick={()=>setOpen(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      {anns.map(a => (
        <div key={a.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:18, marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.primary, fontFamily:'sans-serif' }}>{a.title}</h3>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{a.date}</span>
              <button onClick={()=>setAnns(p=>p.filter(x=>x.id!==a.id))} style={{ background:'none', border:'none', cursor:'pointer', color:C.error, fontSize:14 }}>✕</button>
            </div>
          </div>
          <p style={{ margin:'0 0 8px', fontSize:13, color:C.text, fontFamily:'sans-serif', lineHeight:1.65 }}>{a.body}</p>
          <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{a.replies} replies</div>
        </div>
      ))}
    </div>
  );
};

const Placeholder: React.FC<{ title:string }> = ({ title }) => (
  <div style={{ padding:48, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>
    <div style={{ fontSize:38, marginBottom:14 }}>🚧</div>
    <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13 }}>This section is ready to connect to Supabase.</div>
  </div>
);

const NAV_ITEMS = [
  { id:'home',          label:'Home',            icon:'🏠' },
  { id:'announcements', label:'Announcements',   icon:'📢' },
  { id:'assignments',   label:'Assignments',     icon:'✅' },
  { id:'discussions',   label:'Discussions',     icon:'💬' },
  { id:'grades',        label:'Grades',          icon:'📊' },
  { id:'people',        label:'People',          icon:'👥' },
  { id:'pages',         label:'Pages',           icon:'📄' },
  { id:'files',         label:'Files',           icon:'📁' },
  { id:'syllabus',      label:'Syllabus',        icon:'📋' },
  { id:'outcomes',      label:'Outcomes',        icon:'🎯' },
  { id:'rubrics',       label:'Rubrics',         icon:'📏' },
  { id:'quizzes',       label:'Quizzes',         icon:'❓' },
  { id:'modules',       label:'Modules',         icon:'📦' },
  { id:'attendance',    label:'Attendance',      icon:'✔️' },
  { id:'clinical',      label:'Clinical Skills', icon:'🩺' },
  { id:'readiness',     label:'Exam Readiness',  icon:'🏆' },
  { id:'required',      label:'Required Work',   icon:'📌' },
  { id:'career',        label:'Career Portal',   icon:'💼' },
  { id:'analytics',     label:'New Analytics',   icon:'📈' },
  { id:'lucid',         label:'Lucid (Whiteboard)',icon:'✏️' },
  { id:'settings',      label:'Settings',        icon:'⚙️' },
];

const SECTIONS: Record<string, React.ReactNode> = {
  home:          <ModulesHome/>,
  modules:       <ModulesHome/>,
  announcements: <AnnouncementsPanel/>,
  assignments:   <AssignmentView/>,
  quizzes:       <QuizView/>,
  grades:        <StudentGrades/>,
  people:        <StudentDashboard/>,
  pages:         <PagesTab/>,
  files:         <FilesTab/>,
  syllabus:      <SyllabusTab/>,
  attendance:    <AttendanceTab/>,
  clinical:      <ClinicalSkillsTab/>,
  readiness:     <ReadinessTab/>,
  required:      <RequiredWork/>,
  career:        <CareerPortal/>,
  discussions:   <Placeholder title="Discussions"/>,
  outcomes:      <Placeholder title="Outcomes"/>,
  rubrics:       <Placeholder title="Rubrics"/>,
  analytics:     <Placeholder title="New Analytics"/>,
  lucid:         <Placeholder title="Lucid (Whiteboard)"/>,
  settings:      <Placeholder title="Settings"/>,
};

const C_LOAD = { primary:'#7B4DB5', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', error:'#C0392B' } as const;

// ── Skeleton loader ────────────────────────────────────────────────────────────
const Skeleton: React.FC<{ w?:string|number; h?:number; radius?:number; mb?:number }> = ({ w='100%', h=14, radius=4, mb=0 }) => (
  <div style={{ width:w, height:h, borderRadius:radius, background:'linear-gradient(90deg,#e8e4f0 25%,#f0edf8 50%,#e8e4f0 75%)', backgroundSize:'200% 100%', animation:'hsa-shimmer 1.4s ease infinite', marginBottom:mb }}/>
);

const CourseViewSkeleton: React.FC = () => (
  <div style={{ display:'flex', minHeight:'100vh', background:C_LOAD.bg }}>
    {/* Left rail skeleton */}
    <div style={{ width:52, background:'#3D1B6E', minHeight:'100vh' }}/>
    {/* Sidebar skeleton */}
    <div style={{ width:200, background:C_LOAD.white, borderRight:`1px solid ${C_LOAD.border}`, padding:'16px 12px' }}>
      {Array.from({length:12}).map((_,i) => <Skeleton key={i} w="85%" h={12} mb={14} radius={3}/>)}
    </div>
    {/* Main content skeleton */}
    <div style={{ flex:1, padding:28 }}>
      <Skeleton w={320} h={24} mb={20} radius={6}/>
      {Array.from({length:4}).map((_,i) => (
        <div key={i} style={{ marginBottom:16, border:`1px solid ${C_LOAD.border}`, borderRadius:6, padding:16 }}>
          <Skeleton w="60%" h={14} mb={10}/>
          <Skeleton w="90%" h={11} mb={6}/>
          <Skeleton w="75%" h={11} mb={0}/>
        </div>
      ))}
    </div>
    <style>{`@keyframes hsa-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
  </div>
);

// ── Error screen ───────────────────────────────────────────────────────────────
const CourseViewError: React.FC<{ message:string; onRetry:()=>void }> = ({ message, onRetry }) => (
  <div style={{ minHeight:'100vh', background:C_LOAD.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ background:C_LOAD.white, borderRadius:12, padding:44, textAlign:'center', maxWidth:440, boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C_LOAD.text, fontFamily:'sans-serif', margin:'0 0 10px' }}>Something went wrong</h2>
      <p style={{ fontSize:14, color:C_LOAD.muted, fontFamily:'sans-serif', lineHeight:1.7, margin:'0 0 24px' }}>{message}</p>
      <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
        <button onClick={onRetry}
          style={{ padding:'10px 24px', border:'none', borderRadius:6, background:C_LOAD.primary, color:'white', fontSize:14, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer' }}>
          Try Again
        </button>
        <a href="/portal/teach/login"
          style={{ padding:'10px 24px', border:`1px solid ${C_LOAD.border}`, borderRadius:6, background:C_LOAD.white, color:C_LOAD.text, fontSize:14, fontFamily:'sans-serif', cursor:'pointer', textDecoration:'none', display:'inline-block' }}>
          Sign In Again
        </a>
      </div>
    </div>
  </div>
);

interface CourseViewProps { user?: { name:string; email:string; role:string }; onLogout?: ()=>void; }

const CourseView: React.FC<CourseViewProps> = ({ onLogout }) => {
  const { user: authUser, logout } = useAuth();
  const [activeCourse, setActiveCourse] = useState<Course>(COURSES[0]);
  const [activeTab, setActiveTab]       = useState('home');
  const [showCourses, setShowCourses]   = useState(false);
  const [pageLoading, setPageLoading]   = useState(true);
  const [pageError, setPageError]       = useState('');

  // Simulate initial data load (SWAP: fetch courses from Supabase here)
  React.useEffect(() => {
    const load = async () => {
      try {
        setPageLoading(true);
        // SWAP: const { data: courses, error } = await supabase
        //   .from('courses').select('*').eq('instructor_id', authUser?.id);
        // SWAP: if (error) throw error;
        // SWAP: setCourses(courses);
        await new Promise(r => setTimeout(r, 800)); // remove when Supabase is live
        setPageLoading(false);
      } catch (err: any) {
        setPageError(err?.message ?? 'Failed to load course data. Please try again.');
        setPageLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.replace('/portal/teach/login');
  };

  if (pageLoading) return <CourseViewSkeleton />;
  if (pageError)   return <CourseViewError message={pageError} onRetry={() => { setPageError(''); setPageLoading(true); setTimeout(() => setPageLoading(false), 800); }} />;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg }}>
      {/* Global left rail */}
      <div style={{ width:52, background:C.nav, minHeight:'100vh', position:'fixed', left:0, top:0, zIndex:100, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:10 }}>
        <img src="/hsa-logo.png" alt="HSA" style={{ width:38, height:38, borderRadius:'50%', marginBottom:16, cursor:'pointer', objectFit:'cover', border:'2px solid rgba(255,255,255,0.3)', display:'block' }}/>
        {['🏠','📚','📅','✉️','⏱️'].map((icon,i) => (
          <div key={i} style={{ width:52, height:48, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:17, borderLeft:'3px solid transparent' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='white';(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.6)';(e.currentTarget as HTMLElement).style.background='transparent';}}>{icon}</div>
        ))}
        <div style={{ marginTop:'auto', marginBottom:10 }}>
          <button onClick={onLogout} onClick={handleLogout} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.55)', fontSize:16, width:52, height:40 }}>↩</button>
        </div>
      </div>

      <div style={{ marginLeft:52, flex:1, display:'flex', flexDirection:'column' }}>
        {/* Course header */}
        <div style={{ background:activeCourse.color, borderBottom:`1px solid ${C.border}`, padding:'14px 20px 0', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
            {authUser && <span style={{ fontSize:12, color:'rgba(255,255,255,0.8)', fontFamily:'sans-serif', marginRight:4 }}>👋 {authUser.name}</span>}
            {/* Course selector */}
            <div style={{ position:'relative' }}>
              <button onClick={()=>setShowCourses(!showCourses)}
                style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:5, padding:'5px 12px', cursor:'pointer', color:'white', fontFamily:'sans-serif', fontSize:13, fontWeight:600, backdropFilter:'blur(4px)' }}>
                <span style={{ maxWidth:320, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activeCourse.name}</span>
                <span style={{ fontSize:10 }}>▼</span>
              </button>
              {showCourses && (
                <div style={{ position:'absolute', top:'110%', left:0, background:C.white, border:`1px solid ${C.border}`, borderRadius:6, boxShadow:'0 8px 28px rgba(0,0,0,0.18)', zIndex:200, minWidth:380 }}>
                  <div style={{ padding:'8px 14px', fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontFamily:'sans-serif', borderBottom:`1px solid ${C.border}` }}>Switch Course</div>
                  {COURSES.map(c => (
                    <div key={c.id} onClick={()=>{setActiveCourse(c);setShowCourses(false);setActiveTab('home');}}
                      style={{ padding:'11px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:c.id===activeCourse.id?'#EDE8F7':C.white, borderBottom:`1px solid ${C.border}` }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f4f2fa'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=c.id===activeCourse.id?'#EDE8F7':C.white}>
                      <div style={{ width:6, height:38, background:c.color, borderRadius:3, flexShrink:0 }}/>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>{c.name}</div>
                        <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{c.term} • {c.students} students{!c.published?' • Unpublished':''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              <button style={{ padding:'5px 14px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:5, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>View as Student</button>
              <button style={{ padding:'5px 14px', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:5, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>+ Module</button>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flex:1 }}>
          {/* Course sidebar */}
          <div style={{ width:200, background:C.white, borderRight:`1px solid ${C.border}`, flexShrink:0, minHeight:'calc(100vh - 76px)', overflowY:'auto' }}>
            {NAV_ITEMS.map(item => {
              const on = activeTab === item.id || (item.id==='modules'&&activeTab==='home');
              return (
                <div key={item.id} onClick={()=>setActiveTab(item.id)}
                  style={{ padding:'9px 14px', display:'flex', alignItems:'center', gap:9, cursor:'pointer', borderLeft:on?`3px solid ${C.primary}`:'3px solid transparent', background:on?'#EDE8F7':'transparent', color:on?C.primary:C.text, fontFamily:'sans-serif', fontSize:13, fontWeight:on?600:400 }}
                  onMouseEnter={e=>{if(!on)(e.currentTarget as HTMLElement).style.background='#f5f3fa';}}
                  onMouseLeave={e=>{if(!on)(e.currentTarget as HTMLElement).style.background='transparent';}}>
                  <span style={{ fontSize:13 }}>{item.icon}</span>{item.label}
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex:1, background:C.bg, overflowY:'auto' }}>
            {SECTIONS[activeTab] ?? <Placeholder title={activeTab}/>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
