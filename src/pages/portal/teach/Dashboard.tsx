// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from './AuthContext';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8',
  success:'#127A1B', error:'#C0392B', warn:'#E67E22',
  nav:'#3D1B6E',
} as const;

const COLORS = [
  '#7B4DB5','#5BC8E8','#9B6DD0','#E8963C',
  '#CC4499','#3A7BD5','#2C3E6B','#127A1B',
  '#C0392B','#E67E22',
];

interface DBCourse {
  id: string;          // real Supabase UUID
  name: string;
  code: string;
  color: string;
  published: boolean;
  term: string;
  description: string;
  created_at: string;
}

interface Props {
  onEnterCourse: (course: DBCourse) => void;
}

// ── Course Card ───────────────────────────────────────────────────────────────
const CourseCard: React.FC<{
  course: DBCourse;
  onEnter: () => void;
  onPublishToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}> = ({ course, onEnter, onPublishToggle, onDelete, canEdit }) => {
  const [menu, setMenu] = useState(false);

  return (
    <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', background:C.white,
      cursor:'pointer', transition:'box-shadow .2s', width:220, flexShrink:0 }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(61,27,110,0.18)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>

      {/* Color band */}
      <div onClick={onEnter}
        style={{ height:130, background:course.color, display:'flex', alignItems:'center',
          justifyContent:'center', position:'relative' }}>
        <img src="/hsa-logo.png" alt="HSA"
          style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover',
            border:'3px solid rgba(255,255,255,0.4)', opacity:0.9 }}/>
        {!course.published && (
          <div style={{ position:'absolute', top:8, left:8,
            background:'rgba(0,0,0,0.5)', borderRadius:4, padding:'2px 8px',
            color:'white', fontSize:11, fontFamily:'sans-serif', fontWeight:600 }}>
            Unpublished
          </div>
        )}
        {/* ⋯ menu */}
        {canEdit && (
          <div style={{ position:'absolute', top:8, right:8 }}>
            <button onClick={e => { e.stopPropagation(); setMenu(m => !m); }}
              style={{ background:'rgba(0,0,0,0.35)', border:'none', borderRadius:4,
                color:'white', fontSize:16, cursor:'pointer', width:28, height:28,
                display:'flex', alignItems:'center', justifyContent:'center' }}>⋯</button>
            {menu && (
              <div style={{ position:'absolute', top:32, right:0, background:C.white,
                border:`1px solid ${C.border}`, borderRadius:6, boxShadow:'0 6px 20px rgba(0,0,0,0.15)',
                zIndex:50, minWidth:160, overflow:'hidden' }}
                onClick={e => e.stopPropagation()}>
                <div onClick={() => { onPublishToggle(course.id, course.published); setMenu(false); }}
                  style={{ padding:'9px 14px', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', color:C.text }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                  {course.published ? '🔒 Unpublish' : '✅ Publish'}
                </div>
                <div onClick={() => { if (confirm(`Delete "${course.name}"? This cannot be undone.`)) { onDelete(course.id); } setMenu(false); }}
                  style={{ padding:'9px 14px', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', color:C.error }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fdecea'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                  🗑️ Delete Course
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card body */}
      <div onClick={onEnter} style={{ padding:'12px 12px 8px' }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.primary, fontFamily:'sans-serif',
          lineHeight:1.35, marginBottom:3 }}>{course.name}</div>
        <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginBottom:4 }}>
          {course.code}
        </div>
        {course.term && (
          <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{course.term}</div>
        )}
      </div>

      {/* Footer icons */}
      <div style={{ padding:'7px 12px', borderTop:`1px solid ${C.border}`, display:'flex', gap:10 }}>
        {['📝','💬','👥','📁'].map((icon,i) => (
          <span key={i} style={{ fontSize:15, cursor:'pointer', opacity:0.55 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.55'}>
            {icon}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Create Course Modal ───────────────────────────────────────────────────────
const CreateCourseModal: React.FC<{
  onClose: () => void;
  onCreated: (course: DBCourse) => void;
  userId: string;
}> = ({ onClose, onCreated, userId }) => {
  const [name,      setName]      = useState('Health Star Academy Hybrid Day NATP (');
  const [code,      setCode]      = useState('HSA-NATP-');
  const [term,      setTerm]      = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [color,     setColor]     = useState<string>(C.primary);
  const [desc,      setDesc]      = useState('Online & Hybrid CNA Training');
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState('');

  // Auto-fill term when dates are set
  useEffect(() => {
    if (startDate && endDate) {
      const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month:'numeric', day:'numeric', year:'numeric' });
      setTerm(`${fmt(startDate)} – ${fmt(endDate)}`);
    }
  }, [startDate, endDate]);

  const save = async () => {
    if (!name.trim()) { setErr('Course name is required.'); return; }
    if (!code.trim()) { setErr('Course code is required.'); return; }
    setSaving(true); setErr('');

    const { data, error } = await supabase
      .from('courses')
      .insert({
        name:        name.trim(),
        code:        code.trim(),
        description: desc.trim(),
        term:        term.trim(),
        color,
        teacher_id:  userId,
        published:   false,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('unique')) {
        setErr(`Course code "${code}" already exists. Choose a different code.`);
      } else {
        setErr(error.message);
      }
      setSaving(false);
      return;
    }

    onCreated(data as DBCourse);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:C.white, borderRadius:12, padding:32, width:520,
        maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>
            Create New Course
          </h2>
          <button onClick={onClose}
            style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:C.muted }}>×</button>
        </div>

        {err && (
          <div style={{ background:'#fdecea', border:'1px solid #f5c6c6', borderRadius:6,
            padding:'10px 14px', marginBottom:16, fontSize:13, color:C.error, fontFamily:'sans-serif' }}>
            {err}
          </div>
        )}

        {/* Course name */}
        {[
          ['Course Name *', name, setName, 'e.g. Health Star Academy Hybrid Day NATP (2026-5)'],
          ['Course Code *', code, setCode, 'e.g. HSA-NATP-2026-5 (must be unique)'],
          ['Description',   desc, setDesc, 'e.g. Online & Hybrid CNA Training'],
        ].map(([label, val, set, ph]) => (
          <div key={label as string} style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text,
              fontFamily:'sans-serif', marginBottom:5 }}>{label as string}</label>
            <input value={val as string}
              onChange={e => (set as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
              placeholder={ph as string}
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6,
                padding:'9px 12px', fontSize:13, fontFamily:'sans-serif', color:C.text,
                boxSizing:'border-box', outline:'none' }}/>
          </div>
        ))}

        {/* Dates */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          {[['Start Date', startDate, setStartDate], ['End Date', endDate, setEndDate]].map(([label, val, set]) => (
            <div key={label as string}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text,
                fontFamily:'sans-serif', marginBottom:5 }}>{label as string}</label>
              <input type="date" value={val as string}
                onChange={e => (set as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6,
                  padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box' }}/>
            </div>
          ))}
        </div>

        {term && (
          <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginBottom:16 }}>
            Term: {term}
          </div>
        )}

        {/* Color picker */}
        <div style={{ marginBottom:24 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text,
            fontFamily:'sans-serif', marginBottom:8 }}>Course Color</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)}
                style={{ width:32, height:32, borderRadius:'50%', background:c, cursor:'pointer',
                  border: color === c ? `3px solid ${C.text}` : '3px solid transparent',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  transition:'all .15s' }}/>
            ))}
          </div>

          {/* Preview */}
          <div style={{ marginTop:12, borderRadius:8, overflow:'hidden', border:`1px solid ${C.border}`, width:160 }}>
            <div style={{ height:60, background:color, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/hsa-logo.png" alt="HSA"
                style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', opacity:0.9 }}/>
            </div>
            <div style={{ padding:'6px 10px', fontSize:11, fontFamily:'sans-serif', color:C.text,
              fontWeight:600, background:C.white }}>
              {name.slice(0, 28) || 'Course Name'}...
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button onClick={onClose}
            style={{ padding:'9px 20px', border:`1px solid ${C.border}`, borderRadius:6,
              background:C.white, fontSize:14, fontFamily:'sans-serif', cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            style={{ padding:'9px 24px', border:'none', borderRadius:6, background:C.primary,
              color:'white', fontSize:14, fontWeight:700, fontFamily:'sans-serif',
              cursor:saving ? 'not-allowed' : 'pointer', opacity:saving ? 0.7 : 1 }}>
            {saving ? 'Creating...' : '✅ Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard: React.FC<Props> = ({ onEnterCourse }) => {
  const { user } = useAuth();
  const canEdit = user?.canEdit ?? false;

  const [courses,     setCourses]     = useState<DBCourse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [dismissed,   setDismissed]   = useState<number[]>([]);

  const TODO_ITEMS = [
    { id:1, text:'Grade attendance records',      course:'Check each course', pts:'', due:'Today',         color:C.primary },
    { id:2, text:'Review submitted assignments',  course:'Check gradebook',   pts:'', due:'This week',     color:C.accent  },
    { id:3, text:'Update course materials',       course:'Modules tab',       pts:'', due:'As needed',     color:C.warn    },
  ];

  // ── Load courses from Supabase ─────────────────────────────────────────────
  const loadCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('id,name,code,color,published,term,description,created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setCourses(data as DBCourse[]);
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, []);

  // ── Publish toggle ─────────────────────────────────────────────────────────
  const handlePublishToggle = async (id: string, current: boolean) => {
    setCourses(p => p.map(c => c.id === id ? { ...c, published: !current } : c));
    await supabase.from('courses').update({ published: !current }).eq('id', id);
  };

  // ── Delete course ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setCourses(p => p.filter(c => c.id !== id));
    await supabase.from('courses').delete().eq('id', id);
  };

  const published   = courses.filter(c => c.published);
  const unpublished = courses.filter(c => !c.published);
  const visible     = TODO_ITEMS.filter(t => !dismissed.includes(t.id));

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg }}>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div style={{ flex:1, padding:'28px 28px 40px', overflowY:'auto', maxWidth:'calc(100% - 280px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>
            Dashboard
          </h1>
          {canEdit && (
            <button onClick={() => setShowCreate(true)}
              style={{ padding:'9px 20px', border:'none', borderRadius:6, background:C.primary,
                color:'white', fontSize:14, fontWeight:700, fontFamily:'sans-serif', cursor:'pointer',
                display:'flex', alignItems:'center', gap:8 }}>
              + New Course
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:C.muted, fontFamily:'sans-serif' }}>
            Loading your courses...
          </div>
        ) : courses.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign:'center', padding:64, background:C.white, borderRadius:12,
            border:`2px dashed ${C.border}` }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📚</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px' }}>
              No courses yet
            </h2>
            <p style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif', margin:'0 0 24px', lineHeight:1.6 }}>
              Create your first course to get started.<br/>
              Students won't see it until you publish it.
            </p>
            {canEdit && (
              <button onClick={() => setShowCreate(true)}
                style={{ padding:'12px 28px', border:'none', borderRadius:8, background:C.primary,
                  color:'white', fontSize:15, fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>
                + Create Your First Course
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Published */}
            {published.length > 0 && (
              <div style={{ marginBottom:32 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 16px' }}>
                  Published Courses ({published.length})
                </h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
                  {published.map(c => (
                    <CourseCard key={c.id} course={c}
                      onEnter={() => onEnterCourse(c)}
                      onPublishToggle={handlePublishToggle}
                      onDelete={handleDelete}
                      canEdit={canEdit}/>
                  ))}
                </div>
              </div>
            )}

            {/* Unpublished */}
            {unpublished.length > 0 && (
              <div>
                <h2 style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 16px' }}>
                  Unpublished Courses ({unpublished.length})
                </h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
                  {unpublished.map(c => (
                    <CourseCard key={c.id} course={c}
                      onEnter={() => onEnterCourse(c)}
                      onPublishToggle={handlePublishToggle}
                      onDelete={handleDelete}
                      canEdit={canEdit}/>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Right sidebar ─────────────────────────────────────────────────── */}
      <div style={{ width:280, borderLeft:`1px solid ${C.border}`, background:C.white,
        padding:'24px 16px', overflowY:'auto', flexShrink:0 }}>

        {/* To Do */}
        <div style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 12px' }}>
            To Do
          </h3>
          {visible.length === 0 ? (
            <p style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>You're all caught up! 🎉</p>
          ) : visible.map(item => (
            <div key={item.id} style={{ padding:'10px 0', borderBottom:`1px solid ${C.border}`,
              display:'flex', gap:8 }}>
              <div style={{ width:4, borderRadius:2, background:item.color, flexShrink:0, alignSelf:'stretch' }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif',
                  lineHeight:1.3, marginBottom:2 }}>{item.text}</div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{item.course}</div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{item.due}</div>
              </div>
              <button onClick={() => setDismissed(p => [...p, item.id])}
                style={{ background:'none', border:'none', cursor:'pointer', color:C.muted,
                  fontSize:16, padding:2, alignSelf:'flex-start' }}>×</button>
            </div>
          ))}
        </div>

        {/* Coming Up */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:0 }}>
              Coming Up
            </h3>
            <a href="#" style={{ fontSize:11, color:C.primary, fontFamily:'sans-serif', textDecoration:'none' }}>
              View Calendar
            </a>
          </div>
          <p style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', margin:0 }}>
            Nothing for the next week
          </p>
        </div>

        {/* Stats */}
        <div style={{ background:C.bg, borderRadius:8, padding:14 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px' }}>
            Overview
          </h3>
          {[
            ['Total Courses',   courses.length],
            ['Published',       published.length],
            ['Unpublished',     unpublished.length],
          ].map(([label, val]) => (
            <div key={label as string} style={{ display:'flex', justifyContent:'space-between',
              fontSize:13, fontFamily:'sans-serif', marginBottom:6 }}>
              <span style={{ color:C.muted }}>{label as string}</span>
              <span style={{ color:C.primary, fontWeight:700 }}>{val as number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Create Course Modal ────────────────────────────────────────────── */}
      {showCreate && user && (
        <CreateCourseModal
          userId={user.id}
          onClose={() => setShowCreate(false)}
          onCreated={course => {
            setCourses(p => [course, ...p]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;