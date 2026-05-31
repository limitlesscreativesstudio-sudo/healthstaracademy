import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8',
  success:'#127A1B', error:'#C0392B', warn:'#E67E22',
  nav:'#3D1B6E',
} as const;

interface CourseCard {
  id: number; name: string; subtitle: string; code: string;
  color: string; published: boolean; startDate: string; endDate: string;
  students: number; teachers: number;
}

const COURSES: CourseCard[] = [
  { id:1,  name:'Health Star Academy Hybrid Day NATP (2026-1)', subtitle:'Online & Hybrid CNA Training...', code:'HSA-NATP-2026-1', color:'#7B4DB5', published:true,  startDate:'1/26/2026', endDate:'3/9/2026',    students:12, teachers:2 },
  { id:2,  name:'Health Star Academy Hybrid Day NATP (2026-2)', subtitle:'Online & Hybrid CNA Training...', code:'HSA-NATP-2026-2', color:'#5BC8E8', published:true,  startDate:'3/16/2026', endDate:'4/7/2026',   students:10, teachers:2 },
  { id:3,  name:'Health Star Academy Hybrid Day NATP (2025-4)', subtitle:'Online & Hybrid CNA Training...', code:'HSA-NATP-2025-4', color:'#9B6DD0', published:true,  startDate:'10/13/2025',endDate:'11/25/2025', students:11, teachers:2 },
  { id:4,  name:'Health Star Academy Hybrid Day NATP (2025-3)', subtitle:'Online & Hybrid CNA Training...', code:'HSA-NATP-2025-3', color:'#E8963C', published:true,  startDate:'8/25/2025', endDate:'10/6/2025',  students:9,  teachers:2 },
  { id:5,  name:'Health Star Academy Hybrid Day NATP (2025-2)', subtitle:'CNA Class Group: 2025-2 (Daytime)', code:'HSA-NATP-2025-2', color:'#CC4499', published:true,  startDate:'7/7/2025',  endDate:'8/18/2025',  students:8,  teachers:2 },
  { id:6,  name:'Health Star Academy Hybrid Day NATP (2025-1)', subtitle:'CNA Class Group: 2025-1 (Daytime)', code:'HSA-NATP-2025-1', color:'#E8963C', published:true,  startDate:'5/19/2025', endDate:'6/30/2025',  students:10, teachers:2 },
  { id:7,  name:'Health Star Academy Hybrid Day NATP (2026-3)', subtitle:'Online & Hybrid CNA Training...', code:'HSA-NATP-2026-3', color:'#3A7BD5', published:false, startDate:'5/4/2026',  endDate:'6/15/2026',  students:0,  teachers:1 },
  { id:8,  name:'Health Star Academy Hybrid Day NATP (2026-4)', subtitle:'Online & Hybrid CNA Training...', code:'HSA-NATP-2026-4', color:'#3A7BD5', published:false, startDate:'7/6/2026',  endDate:'8/17/2026',  students:0,  teachers:1 },
  { id:9,  name:'Health Star Academy Hybrid Weekend NATP',      subtitle:'Hybrid Weekend NATP',             code:'HSA-NATP-WE',     color:'#2C3E6B', published:false, startDate:'TBD',       endDate:'TBD',        students:0,  teachers:1 },
];

const TODO_ITEMS = [
  { id:1, text:'Grade 8. Case Study w/ Questions', course:'Hybrid Day NATP (2026-1)', pts:'3 pts', due:'No Due Date', color:C.primary },
  { id:2, text:'Grade 8. Case Study w/ Questions', course:'Hybrid Day NATP (2026-1)', pts:'3 pts', due:'No Due Date', color:C.primary },
  { id:3, text:'Grade 8. Case Study w/ Questions', course:'Hybrid Day NATP (2026-2)', pts:'3 pts', due:'No Due Date', color:'#5BC8E8' },
  { id:4, text:'Grade Roll Call Attendance',        course:'Hybrid Day NATP (2026-2)', pts:'100 pts', due:'No Due Date', color:'#5BC8E8' },
  { id:5, text:'Grade 8. Case Study w/ Questions', course:'Hybrid Day NATP (2025-2)', pts:'3 pts', due:'Jul 15, 2025 at 4am', color:'#CC4499' },
];

const CourseCardComp: React.FC<{ course: CourseCard; onEnter: (id:number) => void; canEdit: boolean }> = ({ course, onEnter, canEdit }) => (
  <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', background:C.white, cursor:'pointer', transition:'box-shadow .2s', flexShrink:0, width:220 }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(61,27,110,0.18)'}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
    {/* Card image / color band */}
    <div onClick={() => onEnter(course.id)}
      style={{ height:140, background:course.color, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
      <img src="/hsa-logo.png" alt="HSA" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,0.4)', opacity:0.9 }}/>
      {!course.published && (
        <div style={{ position:'absolute', top:8, left:8 }}>
          <button style={{ padding:'3px 10px', background:'rgba(0,0,0,0.5)', border:'none', borderRadius:4, color:'white', fontSize:11, cursor:'pointer', fontFamily:'sans-serif', fontWeight:600 }}>
            Publish
          </button>
        </div>
      )}
      <div style={{ position:'absolute', top:8, right:8 }}>
        <button style={{ background:'rgba(0,0,0,0.3)', border:'none', borderRadius:4, color:'white', fontSize:16, cursor:'pointer', width:28, height:28 }}>⋯</button>
      </div>
    </div>
    {/* Card body */}
    <div style={{ padding:'12px 12px 8px' }}>
      <div onClick={() => onEnter(course.id)} style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif', lineHeight:1.35, marginBottom:4 }}>
        {course.name.replace('Health Star Academy ','').replace('Hybrid Day NATP','Hybrid Day ...')}
      </div>
      <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginBottom:6 }}>{course.subtitle}</div>
      {(course.startDate !== 'TBD') && (
        <div style={{ fontSize:10, color:C.muted, fontFamily:'sans-serif' }}>
          {course.startDate} – {course.endDate}
        </div>
      )}
    </div>
    {/* Card footer icons */}
    <div style={{ padding:'8px 12px', borderTop:`1px solid ${C.border}`, display:'flex', gap:10 }}>
      {['📝','💬','👥','📁'].map((icon,i) => (
        <span key={i} style={{ fontSize:15, cursor:'pointer', opacity:0.6 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.6'}>
          {icon}
        </span>
      ))}
    </div>
  </div>
);

interface DashboardProps {
  onEnterCourse: (courseId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onEnterCourse }) => {
  const { user } = useAuth();
  const canEdit = user?.canEdit ?? false;

  const [dismissed, setDismissed] = useState<number[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newCourse, setNewCourse] = useState({ name:'', startDate:'', endDate:'' });

  const published   = COURSES.filter(c => c.published);
  const unpublished = COURSES.filter(c => !c.published);
  const visible     = TODO_ITEMS.filter(t => !dismissed.includes(t.id));

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg }}>
      {/* Main area */}
      <div style={{ flex:1, padding:'28px 28px 40px', overflowY:'auto', maxWidth:'calc(100% - 280px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Dashboard</h1>
          <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:C.muted }}>⋯</button>
        </div>

        {/* Published courses */}
        <div style={{ marginBottom:32 }}>
          <h2 style={{ fontSize:16, fontWeight:600, color:C.text, fontFamily:'sans-serif', margin:'0 0 16px' }}>
            Published Courses ({published.length})
          </h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
            {published.map(c => (
              <CourseCardComp key={c.id} course={c} onEnter={onEnterCourse} canEdit={canEdit}/>
            ))}
          </div>
        </div>

        {/* Unpublished courses */}
        {unpublished.length > 0 && (
          <div>
            <h2 style={{ fontSize:16, fontWeight:600, color:C.text, fontFamily:'sans-serif', margin:'0 0 16px' }}>
              Unpublished Courses ({unpublished.length})
            </h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
              {unpublished.map(c => (
                <CourseCardComp key={c.id} course={c} onEnter={onEnterCourse} canEdit={canEdit}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div style={{ width:280, borderLeft:`1px solid ${C.border}`, background:C.white, padding:'24px 16px', overflowY:'auto', flexShrink:0 }}>

        {/* To Do */}
        <div style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 12px' }}>To Do</h3>
          {visible.length === 0 ? (
            <p style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>Nothing to do — you're all caught up! 🎉</p>
          ) : (
            visible.slice(0,7).map(item => (
              <div key={item.id} style={{ padding:'10px 0', borderBottom:`1px solid ${C.border}`, display:'flex', gap:8 }}>
                <div style={{ width:4, borderRadius:2, background:item.color, flexShrink:0, alignSelf:'stretch' }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif', lineHeight:1.3, marginBottom:2 }}>{item.text}</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{item.course}</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{item.pts} • {item.due}</div>
                </div>
                <button onClick={() => setDismissed(p => [...p, item.id])}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:14, padding:2, alignSelf:'flex-start' }}>×</button>
              </div>
            ))
          )}
          {visible.length > 7 && (
            <button style={{ fontSize:12, color:C.primary, fontFamily:'sans-serif', background:'none', border:'none', cursor:'pointer', padding:'8px 0' }}>
              {visible.length - 7} more...
            </button>
          )}
        </div>

        {/* Coming Up */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:0 }}>Coming Up</h3>
            <a href="#" style={{ fontSize:11, color:C.primary, fontFamily:'sans-serif', textDecoration:'none' }}>View Calendar</a>
          </div>
          <p style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', margin:0 }}>Nothing for the next week</p>
        </div>

        {/* Recent Feedback */}
        <div style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 8px' }}>Recent Feedback</h3>
          <p style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', margin:0 }}>Nothing for now</p>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {canEdit && (
            <button onClick={() => setShowCreate(true)}
              style={{ padding:'9px 14px', border:`1px solid ${C.border}`, borderRadius:6, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', textAlign:'left', color:C.text, display:'flex', alignItems:'center', gap:8 }}>
              <span>➕</span> Start a New Course
            </button>
          )}
          <button onClick={() => onEnterCourse(1)}
            style={{ padding:'9px 14px', border:`1px solid ${C.border}`, borderRadius:6, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', textAlign:'left', color:C.text, display:'flex', alignItems:'center', gap:8 }}>
            <span>📊</span> View Grades
          </button>
        </div>

        {/* Create course modal */}
        {showCreate && canEdit && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:C.white, borderRadius:10, padding:32, width:440, maxWidth:'95vw', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
              <h2 style={{ margin:'0 0 20px', fontSize:18, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Start a New Course</h2>
              {[['Course Name','name','e.g. Health Star Academy Hybrid Day NATP (2026-5)'],
                ['Start Date','startDate','e.g. 5/4/2026'],
                ['End Date','endDate','e.g. 6/15/2026']].map(([label, key, ph]) => (
                <div key={key} style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>{label}</label>
                  <input value={(newCourse as any)[key]} onChange={e => setNewCourse(p => ({ ...p, [key]:e.target.value }))}
                    placeholder={ph}
                    style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20 }}>
                <button onClick={() => setShowCreate(false)}
                  style={{ padding:'8px 20px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>Cancel</button>
                <button onClick={() => setShowCreate(false)}
                  style={{ padding:'8px 20px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>Create Course</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
