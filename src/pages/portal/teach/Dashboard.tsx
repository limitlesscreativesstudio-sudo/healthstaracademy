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

// Stable auto-color from course id/title (Canvas-style varied cards)
const autoColor = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
};
const colorFor = (c: { id: string; color?: string | null; name?: string }) =>
  c.color && c.color.trim() ? c.color : autoColor((c.id || '') + (c.name || ''));

interface DBCourse {
  id: string;          // real Supabase UUID
  name: string;
  code: string;
  color: string;
  image_url?: string | null;
  published: boolean;
  term: string;
  description: string;
  created_at: string;
}

type EnterTab = 'home' | 'announcements' | 'assignments' | 'discussions' | 'files' | 'grades' | 'people';

interface Props {
  onEnterCourse: (course: DBCourse, tab?: EnterTab) => void;
}


// ── Course Card ───────────────────────────────────────────────────────────────
const CourseCard: React.FC<{
  course: DBCourse;
  onEnter: (tab?: EnterTab) => void;
  onPublishToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onDuplicate: (course: DBCourse) => Promise<void>;
  canEdit: boolean;
}> = ({ course, onEnter, onPublishToggle, onDelete, onDuplicate, canEdit }) => {
  const [menu, setMenu] = useState(false);
  const bandColor = colorFor(course);

  const quickActions: { icon: string; tab: EnterTab; label: string }[] = [
    { icon: '📣', tab: 'announcements', label: 'Announcements' },
    { icon: '📝', tab: 'assignments',   label: 'Assignments' },
    { icon: '💬', tab: 'discussions',   label: 'Discussions' },
    { icon: '📁', tab: 'files',         label: 'Files' },
  ];

  return (
    <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', background:C.white,
      cursor:'pointer', transition:'box-shadow .2s', width:220, flexShrink:0 }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(61,27,110,0.18)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>

      {/* Course cover — image if present, colored band otherwise */}
      <div onClick={() => onEnter()}
        style={{
          height:130,
          background: course.image_url
            ? `${bandColor} url("${course.image_url}") center/cover no-repeat`
            : bandColor,
          display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
        }}>
        {!course.image_url && (
          <img src="/hsa-logo.png" alt="HSA"
            style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover',
              border:'3px solid rgba(255,255,255,0.4)', opacity:0.9 }}/>
        )}
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
                <div onClick={() => { onEnter(); setMenu(false); }}
                  style={{ padding:'9px 14px', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', color:C.text }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                  ✏️ Edit Modules
                </div>
                <div onClick={async () => { setMenu(false); await onDuplicate(course); }}
                  style={{ padding:'9px 14px', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', color:C.text }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                  ⧉ Duplicate to New Cohort
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
      <div onClick={() => onEnter()} style={{ padding:'12px 12px 8px' }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.primary, fontFamily:'sans-serif',
          lineHeight:1.35, marginBottom:3 }}>{course.name}</div>
        <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginBottom:4 }}>
          {course.code}
        </div>
        {course.term && (
          <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{course.term}</div>
        )}
      </div>

      {/* Footer quick-actions (Canvas-style) */}
      <div style={{ padding:'7px 12px', borderTop:`1px solid ${C.border}`, display:'flex', gap:14 }}>
        {quickActions.map(qa => (
          <span key={qa.tab} title={qa.label}
            onClick={e => { e.stopPropagation(); onEnter(qa.tab); }}
            style={{ fontSize:15, cursor:'pointer', opacity:0.55, transition:'opacity .15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.55'}>
            {qa.icon}
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
        title:         name.trim(),
        code:          code.trim(),
        description:   desc.trim(),
        term:          term.trim(),
        color,
        instructor_id: userId,
        status:        'draft',
      })
      .select('id,title,code,color,image_url,status,term,description,created_at')
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

    onCreated({ ...(data as any), name: (data as any).title, published: (data as any).status === 'published' } as DBCourse);
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
  const { user, logout } = useAuth();
  const canEdit = user?.canEdit ?? false;

  const [courses,     setCourses]     = useState<DBCourse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [dismissed,   setDismissed]   = useState<number[]>([]);
  const [coursesFlyout, setCoursesFlyout] = useState(false);
  const [recentFeedback, setRecentFeedback] = useState<Array<{ id: string; course: string; assignment: string; score: number; max: number; when: string; courseObj: DBCourse }>>([]);

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
      .select('id,title,code,color,image_url,status,term,description,created_at')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setCourses(data.map((c: any) => ({ ...c, name: c.title, published: c.status === 'published' })) as DBCourse[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, []);

  // ── Load recent graded feedback (last 5) ───────────────────────────────────
  useEffect(() => {
    if (!user?.id || courses.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from('grades')
        .select('id, course_id, assignment_id, score, max_score, graded_at, assignments(title)')
        .order('graded_at', { ascending: false })
        .limit(5);
      if (!data) return;
      const byId = new Map(courses.map(c => [c.id, c]));
      setRecentFeedback(
        (data as any[])
          .filter(g => byId.has(g.course_id))
          .map(g => ({
            id: g.id,
            course: byId.get(g.course_id)!.name,
            courseObj: byId.get(g.course_id)!,
            assignment: g.assignments?.title || 'Graded work',
            score: Number(g.score || 0),
            max: Number(g.max_score || 0),
            when: g.graded_at ? new Date(g.graded_at).toLocaleDateString() : '',
          }))
      );
    })();
  }, [courses, user?.id]);


  // ── Publish toggle ─────────────────────────────────────────────────────────
  const handlePublishToggle = async (id: string, current: boolean) => {
    const nextStatus = !current ? 'published' : 'draft';
    setCourses(p => p.map(c => c.id === id ? { ...c, published: !current } : c));
    await supabase.from('courses').update({ status: nextStatus }).eq('id', id);
  };

  // ── Delete course ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setCourses(p => p.filter(c => c.id !== id));
    await supabase.from('courses').delete().eq('id', id);
  };

  // ── Duplicate course (deep-clones course content + module links) ───────────
  const handleDuplicate = async (src: DBCourse) => {
    const newName = prompt(`Duplicate "${src.name}" as a new cohort. New course name:`, src.name + ' (Copy)');
    if (!newName) return;
    const newCode = prompt('New course code (must be unique):', src.code + '-COPY');
    if (!newCode) return;

    try {
      const { data: newCourse, error: cErr } = await supabase.from('courses').insert({
        title: newName.trim(), code: newCode.trim(), description: (src as any).description ?? '',
        term: src.term, color: src.color, image_url: src.image_url ?? null, instructor_id: user?.id, status: 'draft',
      }).select('id,title,code,color,image_url,status,term,description,created_at').single();
      if (cErr || !newCourse) throw new Error(cErr?.message ?? 'Failed to create course.');

      const rubricMap = new Map<string, string>();
      const pageMap = new Map<string, string>();
      const quizMap = new Map<string, string>();
      const assignmentMap = new Map<string, string>();
      const discussionMap = new Map<string, string>();
      const folderMap = new Map<string, string>();
      const fileMap = new Map<string, string>();

      const [rubricsRes, pagesRes, quizzesRes, assignmentsRes, discussionsRes, foldersRes, filesRes, modsRes] = await Promise.all([
        supabase.from('rubrics').select('id,title,description,created_by').eq('course_id', src.id).order('created_at'),
        supabase.from('lms_pages').select('id,title,body_html,front_page,published,position').eq('course_id', src.id).order('position'),
        supabase.from('quizzes').select('id,title,instructions,due_at,total_points,published,attempts_allowed,time_limit_minutes').eq('course_id', src.id).order('created_at'),
        supabase.from('assignments').select('id,title,instructions,due_at,points,published,submission_type,group_name,rubric_id').eq('course_id', src.id).order('created_at'),
        supabase.from('discussions').select('id,title,body,author_id,pinned,locked').eq('course_id', src.id).order('created_at'),
        supabase.from('lms_folders').select('id,name,parent_id,position,created_by').eq('course_id', src.id).order('position'),
        supabase.from('lms_files').select('id,name,file_name,file_type,file_url,file_size,mime_type,size_bytes,storage_provider,storage_path,external_url,drive_file_id,folder,folder_id,uploaded_by,modified_by').eq('course_id', src.id).order('name'),
        supabase.from('modules').select('id,title,published,position').eq('course_id', src.id).order('position'),
      ]);

      for (const r of (rubricsRes.data ?? []) as any[]) {
        const { data: nr, error } = await supabase.from('rubrics').insert({
          course_id: newCourse.id,
          title: r.title,
          description: r.description,
          created_by: user?.id ?? r.created_by ?? null,
        }).select('id').single();
        if (error) throw error;
        if (!nr) continue;
        rubricMap.set(r.id, nr.id);
        const { data: criteria } = await supabase.from('rubric_criteria')
          .select('title,description,points,position,levels').eq('rubric_id', r.id).order('position');
        if (criteria?.length) {
          const { error: critErr } = await supabase.from('rubric_criteria').insert(
            criteria.map((c: any) => ({ ...c, rubric_id: nr.id }))
          );
          if (critErr) throw critErr;
        }
      }

      for (const p of (pagesRes.data ?? []) as any[]) {
        const { data: np, error } = await supabase.from('lms_pages').insert({
          course_id: newCourse.id,
          title: p.title,
          body_html: p.body_html ?? '',
          front_page: p.front_page,
          published: p.published,
          position: p.position,
        }).select('id').single();
        if (error) throw error;
        if (np) pageMap.set(p.id, np.id);
      }

      for (const q of (quizzesRes.data ?? []) as any[]) {
        const { data: nq, error } = await supabase.from('quizzes').insert({
          course_id: newCourse.id,
          title: q.title,
          instructions: q.instructions,
          due_at: q.due_at,
          total_points: q.total_points,
          published: q.published,
          attempts_allowed: q.attempts_allowed,
          time_limit_minutes: q.time_limit_minutes,
        }).select('id').single();
        if (error) throw error;
        if (!nq) continue;
        quizMap.set(q.id, nq.id);
        const { data: qs } = await supabase.from('quiz_questions')
          .select('position,question_type,prompt,options,correct_answer,points').eq('quiz_id', q.id).order('position');
        if (qs?.length) {
          const { error: qsErr } = await supabase.from('quiz_questions').insert(
            qs.map((question: any) => ({ ...question, quiz_id: nq.id }))
          );
          if (qsErr) throw qsErr;
        }
      }

      for (const a of (assignmentsRes.data ?? []) as any[]) {
        const { data: na, error } = await supabase.from('assignments').insert({
          course_id: newCourse.id,
          title: a.title,
          instructions: a.instructions,
          due_at: a.due_at,
          points: a.points,
          published: a.published,
          submission_type: a.submission_type,
          group_name: a.group_name,
          rubric_id: a.rubric_id ? (rubricMap.get(a.rubric_id) ?? null) : null,
        }).select('id').single();
        if (error) throw error;
        if (na) assignmentMap.set(a.id, na.id);
      }

      for (const d of (discussionsRes.data ?? []) as any[]) {
        const { data: nd, error } = await supabase.from('discussions').insert({
          course_id: newCourse.id,
          title: d.title,
          body: d.body,
          author_id: user?.id ?? d.author_id,
          pinned: d.pinned,
          locked: d.locked,
        }).select('id').single();
        if (error) throw error;
        if (nd) discussionMap.set(d.id, nd.id);
      }

      const pendingFolders = [...((foldersRes.data ?? []) as any[])];
      let safety = 0;
      while (pendingFolders.length && safety < 20) {
        safety++;
        for (let i = pendingFolders.length - 1; i >= 0; i--) {
          const f = pendingFolders[i];
          if (f.parent_id && !folderMap.has(f.parent_id)) continue;
          const { data: nf, error } = await supabase.from('lms_folders').insert({
            course_id: newCourse.id,
            name: f.name,
            parent_id: f.parent_id ? folderMap.get(f.parent_id) : null,
            position: f.position,
            created_by: user?.id ?? f.created_by ?? null,
          }).select('id').single();
          if (error) throw error;
          if (nf) folderMap.set(f.id, nf.id);
          pendingFolders.splice(i, 1);
        }
      }

      if (filesRes.data?.length) {
        const { data: newFiles, error: fileErr } = await supabase.from('lms_files').insert(
          (filesRes.data as any[]).map(f => ({
            course_id: newCourse.id,
            name: f.name,
            file_name: f.file_name,
            file_type: f.file_type,
            file_url: f.file_url,
            file_size: f.file_size,
            mime_type: f.mime_type,
            size_bytes: f.size_bytes,
            storage_provider: f.storage_provider,
            storage_path: f.storage_path,
            external_url: f.external_url,
            drive_file_id: f.drive_file_id,
            folder: f.folder,
            folder_id: f.folder_id ? (folderMap.get(f.folder_id) ?? null) : null,
            uploaded_by: user?.id ?? f.uploaded_by ?? null,
            modified_by: user?.id ?? f.modified_by ?? null,
          }))
        ).select('id,name,file_name,storage_path');
        if (fileErr) throw fileErr;
        (filesRes.data as any[]).forEach((oldFile, index) => {
          const newFile = newFiles?.[index];
          if (newFile) fileMap.set(oldFile.id, newFile.id);
        });
      }

      for (const m of (modsRes.data ?? []) as any[]) {
        const { data: nm, error: modErr } = await supabase.from('modules').insert({
          course_id: newCourse.id, title: m.title, published: m.published, position: m.position,
        }).select('id').single();
        if (modErr) throw modErr;
        if (!nm) continue;

        const { data: srcItems, error: itemsErr } = await supabase.from('module_items')
          .select('id,item_type,title,content_ref,url,description,published,position,file_url,file_name,file_type,indent')
          .eq('module_id', m.id).order('position');
        if (itemsErr) throw itemsErr;

        for (const it of (srcItems ?? []) as any[]) {
          const nextRef =
            it.item_type === 'quiz' ? (quizMap.get(it.content_ref) ?? it.content_ref) :
            it.item_type === 'assignment' ? (assignmentMap.get(it.content_ref) ?? it.content_ref) :
            it.item_type === 'page' ? (pageMap.get(it.content_ref) ?? it.content_ref) :
            it.item_type === 'discussion' ? (discussionMap.get(it.content_ref) ?? it.content_ref) :
            it.item_type === 'file' ? (fileMap.get(it.content_ref) ?? it.content_ref) :
            it.content_ref;

          const { data: newItem, error: itemErr } = await supabase.from('module_items').insert({
            module_id: nm.id,
            item_type: it.item_type,
            title: it.title,
            content_ref: nextRef,
            url: it.url,
            description: it.description,
            published: it.published,
            position: it.position,
            file_url: it.file_url,
            file_name: it.file_name,
            file_type: it.file_type,
            indent: it.indent ?? 0,
          }).select('id').single();
          if (itemErr) throw itemErr;

          if (newItem?.id && it.item_type === 'quiz' && nextRef) {
            await supabase.from('quizzes').update({ module_item_id: newItem.id }).eq('id', nextRef);
          }
          if (newItem?.id && it.item_type === 'assignment' && nextRef) {
            await supabase.from('assignments').update({ module_item_id: newItem.id }).eq('id', nextRef);
          }
        }
      }

      await loadCourses();
      alert(`Created "${newName}" as a full sandbox copy with modules, files, pages, quizzes, assignments, discussions, and rubrics.`);
    } catch (err: any) {
      alert('Course duplication could not be completed: ' + (err?.message ?? 'unknown error'));
    }
  };

  const published   = courses.filter(c => c.published);
  const unpublished = courses.filter(c => !c.published);
  const visible     = TODO_ITEMS.filter(t => !dismissed.includes(t.id));

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg }}>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <aside style={{ width:220, flexShrink:0, background:C.nav, minHeight:'100vh', display:'flex', flexDirection:'column', padding:'20px 0', position:'sticky', top:0, alignSelf:'flex-start', zIndex:20 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'0 16px 18px', borderBottom:'1px solid rgba(255,255,255,0.15)', marginBottom:12 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:56, height:56, borderRadius:'50%', objectFit:'cover', marginBottom:10 }}/>
          <div style={{ color:'#fff', fontSize:13, fontWeight:700, fontFamily:'sans-serif', textAlign:'center' }}>Health Star Academy</div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:11, fontFamily:'sans-serif', marginTop:2 }}>Instructor Portal</div>
        </div>
        <a href="/portal/account" style={{ color:'#fff', fontSize:13, fontFamily:'sans-serif', padding:'11px 22px', textDecoration:'none' }}>👤 Account</a>
        <a href="/portal/teach" style={{ color:'#fff', fontSize:13, fontFamily:'sans-serif', padding:'11px 22px', textDecoration:'none' }}>🏠 Dashboard</a>
        <button onClick={() => setCoursesFlyout(v => !v)}
          style={{ textAlign:'left', color:'#fff', fontSize:13, fontFamily:'sans-serif', padding:'11px 22px',
            background: coursesFlyout ? 'rgba(255,255,255,0.12)' : 'transparent', border:'none', cursor:'pointer' }}>
          📚 Courses ▸
        </button>
        <a href="/portal/career" style={{ color:'#fff', fontSize:13, fontFamily:'sans-serif', padding:'11px 22px', textDecoration:'none' }}>💼 Career</a>
        <a href="/portal/calendar" style={{ color:'#fff', fontSize:13, fontFamily:'sans-serif', padding:'11px 22px', textDecoration:'none' }}>📅 Calendar</a>
        <a href="/portal/inbox" style={{ color:'#fff', fontSize:13, fontFamily:'sans-serif', padding:'11px 22px', textDecoration:'none' }}>📥 Inbox</a>
        <a href="/portal/history" style={{ color:'#fff', fontSize:13, fontFamily:'sans-serif', padding:'11px 22px', textDecoration:'none' }}>🕘 History</a>
        <a href="/portal/help" style={{ color:'#fff', fontSize:13, fontFamily:'sans-serif', padding:'11px 22px', textDecoration:'none' }}>❔ Help</a>
        <div style={{ flex:1 }} />
        {user?.email && <div style={{ color:'rgba(255,255,255,0.6)', fontSize:10, fontFamily:'sans-serif', padding:'0 22px 8px', wordBreak:'break-all' }}>{user.email}</div>}
        <button onClick={() => logout()} style={{ margin:'0 16px', padding:'10px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.25)', borderRadius:6, fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer' }}>↩ Sign out</button>
      </aside>

      {/* ── Courses Flyout (Canvas-style) ─────────────────────────────────── */}
      {coursesFlyout && (
        <>
          <div onClick={() => setCoursesFlyout(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.25)', zIndex:30 }}/>
          <div style={{ position:'fixed', top:0, left:220, bottom:0, width:320, background:C.white,
            borderRight:`1px solid ${C.border}`, boxShadow:'6px 0 24px rgba(0,0,0,0.12)', zIndex:40,
            overflowY:'auto', padding:'20px 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px 14px', borderBottom:`1px solid ${C.border}` }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Courses</h3>
              <button onClick={() => setCoursesFlyout(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:C.muted }}>×</button>
            </div>
            <a href="/portal/teach" onClick={() => setCoursesFlyout(false)}
              style={{ display:'block', padding:'12px 20px', color:C.primary, fontSize:13, fontWeight:700,
                fontFamily:'sans-serif', textDecoration:'none', borderBottom:`1px solid ${C.border}` }}>
              All Courses
            </a>
            {[
              { label:'Published Courses', list: published },
              { label:'Unpublished Courses', list: unpublished },
            ].map(section => section.list.length > 0 && (
              <div key={section.label} style={{ padding:'12px 0 4px' }}>
                <div style={{ padding:'6px 20px', fontSize:11, fontWeight:700, color:C.muted,
                  fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:0.5 }}>
                  {section.label}
                </div>
                {section.list.map(c => (
                  <div key={c.id} onClick={() => { onEnterCourse(c); setCoursesFlyout(false); }}
                    style={{ display:'flex', gap:10, padding:'10px 20px', cursor:'pointer', alignItems:'flex-start' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div style={{ width:6, borderRadius:2, background: colorFor(c), alignSelf:'stretch', flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif',
                        lineHeight:1.3, marginBottom:2, wordBreak:'break-word' }}>{c.name}</div>
                      {c.term && <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{c.term}</div>}
                      {c.code && <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{c.code}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

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
                      onEnter={(tab) => onEnterCourse(c, tab)}

                      onPublishToggle={handlePublishToggle}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
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
                      onEnter={(tab) => onEnterCourse(c, tab)}
                      onPublishToggle={handlePublishToggle}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
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

        {/* Recent Feedback (Canvas parity) */}
        <div style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px' }}>
            Recent Feedback
          </h3>
          {recentFeedback.length === 0 ? (
            <p style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', margin:0 }}>Nothing for now</p>
          ) : recentFeedback.map(fb => (
            <div key={fb.id} onClick={() => onEnterCourse(fb.courseObj, 'grades')}
              style={{ padding:'8px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer', display:'flex', gap:8 }}>
              <div style={{ width:4, borderRadius:2, background: colorFor(fb.courseObj), flexShrink:0, alignSelf:'stretch' }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.primary, fontFamily:'sans-serif', lineHeight:1.3 }}>{fb.assignment}</div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', wordBreak:'break-word' }}>{fb.course}</div>
                <div style={{ fontSize:11, color:C.text, fontFamily:'sans-serif' }}>
                  {fb.score}/{fb.max} • {fb.when}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions (Canvas parity) */}
        <div style={{ marginBottom:24, display:'flex', flexDirection:'column', gap:8 }}>
          {canEdit && (
            <button onClick={() => setShowCreate(true)}
              style={{ padding:'10px 12px', border:`1px solid ${C.border}`, borderRadius:6, background:C.white,
                color:C.text, fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer', textAlign:'left' }}>
              + Start a New Course
            </button>
          )}
          <a href="/portal/teach#grades"
            style={{ padding:'10px 12px', border:`1px solid ${C.border}`, borderRadius:6, background:C.white,
              color:C.text, fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer',
              textDecoration:'none', display:'block' }}>
            View Grades
          </a>
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
