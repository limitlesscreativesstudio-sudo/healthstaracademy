// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AttendanceTab     from './AttendanceTab';
import CareerPortal      from './CareerPortal';
import ClinicalSkillsTab from './ClinicalSkillsTab';
import DiscussionsTab    from './DiscussionsTab';
import FilesTab          from './FilesTab';
import PagesTab          from './PagesTab';
import QuizView          from './QuizView';
import ReadinessTab      from './ReadinessTab';
import RequiredWork      from './RequiredWork';
import StudentDashboard  from './StudentDashboard';
import StudentGrades     from './StudentGrades';
import SyllabusTab       from './SyllabusTab';
import AssignmentView    from './AssignmentView';
import Dashboard         from './Dashboard';
import SettingsTab       from './SettingsTab';
import CalendarTab       from './CalendarTab';
import RubricsTab        from './RubricsTab';
import OutcomesTab       from './OutcomesTab';
import StudentProgress   from './StudentProgress';
import AnalyticsTab      from './AnalyticsTab';
import Account           from './Account';
import { useAuth, supabase } from './AuthContext';
import ContentViewer, { type ContentSource } from '@/components/portal/ContentViewer';
import ChooseHomePageDialog from '@/components/portal/ChooseHomePageDialog';
import HomeRouter from '@/components/portal/HomeRouter';
import ModulesTabAuthor from '@/components/portal/ModulesTabAuthor';
import { toast, Toaster } from 'sonner';
import { canEditTab, canViewTab } from '@/lib/portalPermissions';

const useIsMobile = () => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const on = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return m;
};

const C = {
  nav:'#3D1B6E', primary:'#7B4DB5', accent:'#5BC8E8',
  bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8',
  text:'#2D1B4E', muted:'#655480', success:'#127A1B',
  error:'#C0392B', warn:'#E67E22',
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Course {
  id: number; uuid?: string; name: string; code: string;
  color: string; term: string; students: number; published: boolean;
}
interface ModuleItem {
  id: string; type: string; name: string;
  pts?: number; published: boolean; indent: number;
  file_url?: string | null; file_name?: string | null;
}
interface Module {
  id: string; name: string; published: boolean;
  expanded: boolean; items: ModuleItem[];
  position: number;
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const COURSES: Course[] = [
  { id:1, name:'Health Star Academy Hybrid Day NATP (2026-1)', code:'HSA-NATP-2026-1', color:'#7B4DB5', term:'1/26/2026–3/9/2026',    students:12, published:true  },
  { id:2, name:'Health Star Academy Hybrid Day NATP (2026-2)', code:'HSA-NATP-2026-2', color:'#5BC8E8', term:'3/16/2026–4/7/2026',   students:10, published:true  },
  { id:3, name:'Health Star Academy Hybrid Day NATP (2025-4)', code:'HSA-NATP-2025-4', color:'#9B6DD0', term:'10/13/2025–11/25/2025', students:11, published:false },
];

const itemIcon = (t: string) =>
  ({ assignment:'📝', quiz:'❓', page:'📄', file:'📎', video:'🎥', discussion:'💬', external_url:'🔗' }[t] ?? '📄');

// ── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton: React.FC<{ w?: string | number; h?: number; radius?: number; mb?: number }> =
  ({ w = '100%', h = 14, radius = 4, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: radius, marginBottom: mb,
    background: 'linear-gradient(90deg,#e8e4f0 25%,#f0edf8 50%,#e8e4f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'hsa-shimmer 1.4s ease infinite',
  }}/>
);

const CourseViewSkeleton: React.FC = () => (
  <div style={{ display:'flex', minHeight:'100vh', background:C.bg }}>
    <div style={{ width:52, background:'#3D1B6E', minHeight:'100vh' }}/>
    <div style={{ width:200, background:C.white, borderRight:`1px solid ${C.border}`, padding:'16px 12px' }}>
      {Array.from({ length:12 }).map((_,i) => <Skeleton key={i} w="85%" h={12} mb={14} radius={3}/>)}
    </div>
    <div style={{ flex:1, padding:28 }}>
      <Skeleton w={320} h={24} mb={20} radius={6}/>
      {Array.from({ length:4 }).map((_,i) => (
        <div key={i} style={{ marginBottom:16, border:`1px solid ${C.border}`, borderRadius:6, padding:16 }}>
          <Skeleton w="60%" h={14} mb={10}/>
          <Skeleton w="90%" h={11} mb={6}/>
          <Skeleton w="75%" h={11} mb={0}/>
        </div>
      ))}
    </div>
    <style>{`@keyframes hsa-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
  </div>
);

// ── Error screen ──────────────────────────────────────────────────────────────
const CourseViewError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ background:C.white, borderRadius:12, padding:44, textAlign:'center', maxWidth:440, boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px' }}>Something went wrong</h2>
      <p style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif', lineHeight:1.7, margin:'0 0 24px' }}>{message}</p>
      <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
        <button onClick={onRetry} style={{ padding:'10px 24px', border:'none', borderRadius:6, background:C.primary, color:'white', fontSize:14, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer' }}>
          Try Again
        </button>
        <a href="/portal/teach/login" style={{ padding:'10px 24px', border:`1px solid ${C.border}`, borderRadius:6, background:C.white, color:C.text, fontSize:14, fontFamily:'sans-serif', textDecoration:'none', display:'inline-block' }}>
          Sign In Again
        </a>
      </div>
    </div>
  </div>
);


// ── Announcements panel (Supabase-wired) ──────────────────────────────────────
const AnnouncementsPanel: React.FC<{ canEdit: boolean; courseId?: string }> = ({ canEdit, courseId }) => {
  const { user } = useAuth();
  const [anns, setAnns] = useState<any[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title:'', body:'' });

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('lms_announcements')
      .select('id,title,body,posted_by,posted_at').eq('course_id', courseId).order('posted_at',{ ascending:false });
    setAnns(data ?? []);
    const ids = [...new Set((data ?? []).map(a => a.posted_by).filter(Boolean))];
    if (ids.length) {
      const { data: p } = await supabase.from('profiles').select('user_id,full_name').in('user_id', ids as any);
      const n: Record<string,string> = {};
      (p ?? []).forEach(pr => { n[pr.user_id] = pr.full_name; });
      setNames(n);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);
  useEffect(() => { (window as any).__hsaOpenAnn = () => setOpen(true); return () => { delete (window as any).__hsaOpenAnn; }; }, []);

  const post = async () => {
    if (!form.title || !form.body || !courseId || !user?.id) return;
    const { data, error } = await supabase.from('lms_announcements')
      .insert({ course_id: courseId, title: form.title, body: form.body, posted_by: user.id }).select().single();
    if (error) return toast.error('Could not post announcement');
    setAnns(p => [data, ...p]);
    setForm({ title:'', body:'' }); setOpen(false);
    toast.success('Announcement posted');
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('lms_announcements').delete().eq('id', id);
    if (error) return toast.error('Failed to delete');
    setAnns(p => p.filter(x => x.id !== id));
    toast.success('Deleted');
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Announcements</h2>
        {canEdit && (
          <button onClick={() => setOpen(!open)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
            + Announcement
          </button>
        )}
      </div>
      {open && canEdit && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:20, marginBottom:16 }}>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title:e.target.value }))} placeholder="Title *"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:14, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none', marginBottom:10 }}/>
          <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body:e.target.value }))} rows={4} placeholder="Message *"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }}/>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={post} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Post</button>
            <button onClick={() => setOpen(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      {loading ? <p style={{ color:C.muted, fontFamily:'sans-serif' }}>Loading…</p> :
       anns.length === 0 ? <p style={{ color:C.muted, fontFamily:'sans-serif' }}>No announcements yet.</p> :
       anns.map(a => (
        <div key={a.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:18, marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.primary, fontFamily:'sans-serif' }}>{a.title}</h3>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{new Date(a.posted_at).toLocaleDateString()}</span>
              {canEdit && (
                <button onClick={() => del(a.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.error, fontSize:14 }}>✕</button>
              )}
            </div>
          </div>
          <p style={{ margin:'0 0 8px', fontSize:13, color:C.text, fontFamily:'sans-serif', lineHeight:1.65, whiteSpace:'pre-wrap' }}>{a.body}</p>
          <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>Posted by {names[a.posted_by] || 'Instructor'}</div>
        </div>
      ))}
    </div>
  );
};

// ── Modules home ──────────────────────────────────────────────────────────────
const ModulesHome: React.FC<{ canEdit: boolean; courseUuid?: string; openAddOnMount?: number; onCourseAction?: (a: string) => void }> = ({ canEdit, courseUuid, openAddOnMount, onCourseAction }) => {
  const [mods, setMods]       = useState<Module[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState('');
  const [addMod, setAddMod]   = useState(false);
  const [newName, setNewName] = useState('');
  const [addItem, setAddItem] = useState<string | null>(null);
  const [ni, setNi]           = useState<{ title: string; type: string; pts: string; file: File | null }>({ title:'', type:'page', pts:'', file: null }); const [editId, setEditId] = useState<string | null>(null); const [editName, setEditName] = useState('');
  const [viewer, setViewer] = useState<{ src: ContentSource; name: string; type: string } | null>(null);

  const openItem = (it: ModuleItem) => {
    if (!it.file_url) return;
    const path = it.file_url.split('/course-files/')[1];
    const cleanPath = path ? decodeURIComponent(path.split('?')[0]) : null;
    const ext = (it.file_name || '').split('.').pop() || '';
    if (cleanPath) setViewer({ src: { bucket: 'course-files', path: cleanPath }, name: it.file_name || it.name, type: ext });
    else setViewer({ src: { url: it.file_url }, name: it.file_name || it.name, type: ext });
  };

  // Open Add Module form on demand (when top "+ Module" button is clicked)
  useEffect(() => { if (openAddOnMount && canEdit) setAddMod(true); }, [openAddOnMount, canEdit]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!courseUuid) { setDbLoading(false); return; }
    const load = async () => {
      setDbLoading(true);
      setDbError('');
      const { data: modRows } = await supabase
        .from('modules').select('id,title,published,position')
        .eq('course_id', courseUuid).order('position');
      if (!modRows) { setMods([]); setDbLoading(false); return; }
      const moduleIds = modRows.map(m => m.id);
      const { data: itemRows, error: itemErr } = moduleIds.length
        ? await supabase
          .from('module_items')
          .select('id,module_id,item_type,title,published,position,file_url,file_name,file_type,content_ref,url')
          .in('module_id', moduleIds)
          .order('position')
        : { data: [], error: null } as any;
      if (itemErr) setDbError(itemErr.message);
      setMods(modRows.map(m => ({
        id: m.id, name: m.title, published: m.published,
        expanded: true, position: m.position,
        items: (itemRows ?? []).filter(it => it.module_id === m.id).map((it: any) => ({
          id: it.id, type: it.item_type, name: it.title,
          pts: it.points ?? undefined, published: it.published, indent: 0,
          file_url: it.file_url, file_name: it.file_name,
        })),
      })));
      setDbLoading(false);
    };
    load();
    const ch = supabase
      .channel(`course-modules:${courseUuid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'modules', filter: `course_id=eq.${courseUuid}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'module_items' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseUuid]);

  const toggle = (id: string) =>
    setMods(p => p.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));

  const togglePub = async (id: string, current: boolean) => {
    setMods(p => p.map(m => m.id === id ? { ...m, published: !current } : m));
    if (courseUuid) await supabase.from('modules').update({ published: !current }).eq('id', id);
  };

  const toggleIPub = async (iid: string, current: boolean) => {
    setMods(p => p.map(m => ({ ...m, items: m.items.map(it => it.id === iid ? { ...it, published: !current } : it) })));
    if (courseUuid) await supabase.from('module_items').update({ published: !current }).eq('id', iid);
  };

  const saveMod = async () => {
    if (!newName.trim()) return;
    if (!courseUuid) { alert('Open a saved course from the Dashboard before adding modules.'); return; }
    if (courseUuid) {
      const { data, error } = await supabase.from('modules')
        .insert({ course_id: courseUuid, title: newName.trim(), published: false, position: mods.length })
        .select().single();
      if (!error && data) {
        setMods(p => [...p, { id: data.id, name: data.title, published: false, expanded: true, position: mods.length, items: [] }]);
      }
    }
    setNewName(''); setAddMod(false);
  };

  const saveItem = async () => {
    if (!ni.title.trim() || !addItem) return;
    const mod = mods.find(m => m.id === addItem);
    if (!courseUuid) { setNi({ title:'', type:'page', pts:'', file: null }); setAddItem(null); return; }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;

    // Upload attachment if File/Video type and file provided
    if ((ni.type === 'file' || ni.type === 'video') && ni.file) {
      const ext = ni.file.name.split('.').pop() ?? 'bin';
      const path = `${courseUuid}/module-items/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('course-files')
        .upload(path, ni.file, { contentType: ni.file.type, upsert: false });
      if (upErr) { alert('Upload failed: ' + upErr.message); return; }
      const { data: signed } = await supabase.storage.from('course-files').createSignedUrl(path, 60 * 60 * 24 * 365);
      fileUrl = signed?.signedUrl ?? null;
      fileName = ni.file.name;
      fileType = ni.file.type;
    }

    const { data, error } = await supabase.from('module_items')
      .insert({ module_id: addItem, item_type: ni.type, title: ni.title.trim(),
        published: false, position: mod?.items.length ?? 0,
        content_ref: ni.contentRef || null,
        file_url: fileUrl, file_name: fileName, file_type: fileType })
      .select().single();
    if (!error && data) {
      setMods(p => p.map(m => m.id === addItem ? {
        ...m, items: [...m.items, { id: data.id, type: data.item_type, name: data.title,
          pts: data.points ?? undefined, published: false, indent: 0,
          file_url: (data as any).file_url, file_name: (data as any).file_name } as any]
      } : m));
    } else if (error) {
      alert('Failed to add item: ' + error.message);
    }
    setNi({ title:'', type:'page', pts:'', file: null }); setAddItem(null);
  };

  const deleteMod = async (id: string) => {
    setMods(p => p.filter(m => m.id !== id));
    if (courseUuid) await supabase.from('modules').delete().eq('id', id); }; const renameMod = async (id: string, title: string) => { setMods(p => p.map(m => m.id === id ? { ...m, name: title } : m)); if (courseUuid) await supabase.from('modules').update({ title }).eq('id', id); }; const duplicateMod = async (src: Module) => { if (!courseUuid) return; const { data: nm } = await supabase.from('modules').insert({ course_id: courseUuid, title: src.name + ' (Copy)', published: false, position: mods.length }).select().single(); if (!nm) return; const its = src.items.map((it, idx) => ({ module_id: nm.id, item_type: it.type, title: it.name, published: false, position: idx })); if (its.length) await supabase.from('module_items').insert(its); const { data: nits } = await supabase.from('module_items').select('id,module_id,item_type,title,published,position').eq('module_id', nm.id); setMods(p => [...p, { id: nm.id, name: nm.title, published: false, expanded: true, position: mods.length, items: (nits ?? []).map((it) => ({ id: it.id, type: it.item_type, name: it.title, pts: undefined, published: false, indent: 0 })) }]);
  };

  if (dbLoading) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading modules...</div>;

  return (
    <div style={{ display:'flex' }}>
      <div style={{ flex:1, padding:24 }}>
        {!courseUuid ? (
          <div style={{ marginBottom:16, padding:'10px 14px', background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:6, fontSize:13, color:'#7B4DB5', fontFamily:'sans-serif' }}>
            {canEdit
              ? 'Open a saved course from the Dashboard before adding modules.'
              : 'Your course content isn’t available yet. Your instructor will publish it shortly.'}
          </div>
        ) : (
          <ModulesTabAuthor courseId={courseUuid} isInstructor={canEdit} openAddOnMount={openAddOnMount} />
        )}
      </div>
      {canEdit && (
      <div style={{ width:200, flexShrink:0, padding:'24px 12px', borderLeft:`1px solid ${C.border}` }}>

        <div style={{ marginBottom:16 }}>
          <h3 style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:0.5 }}>Course Status</h3>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:C.success }}/>
            <span style={{ fontSize:13, fontFamily:'sans-serif', color:C.text, fontWeight:600 }}>Published</span>
            <span style={{ fontSize:11, color:C.muted }}>▾</span>
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <h3 style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:0.5 }}>Course Actions</h3>
          {([
            ['📥','Import Existing Content','import'],
            ['🔄','Import from Commons','commons'],
            ['🏠','Choose Home Page','home-page'],
            ['📊','View Course Stream','stream'],
            ['📢','New Announcement','new-announcement'],
            ['📈','New Analytics','analytics'],
            ['🔔','View Notifications','notifications'],
          ] as const).map(([icon, label, action]) => (
            <div key={label} onClick={() => onCourseAction?.(action)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer', fontSize:12, fontFamily:'sans-serif', color:C.primary }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.text}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.primary}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:0.5 }}>Coming Up</h3>
          <p style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', margin:0 }}>Nothing for the next week</p>
          <button type="button" onClick={() => onCourseAction?.('calendar')}
            style={{ background:'none', border:'none', padding:0, fontSize:11, color:C.primary, fontFamily:'sans-serif', cursor:'pointer', marginTop:6 }}>
            View Calendar →
          </button>
        </div>
      </div>
      )}
    </div>

  );

  return (
    <>
    <div style={{ display:'flex' }}>
    <div style={{ flex:1, padding:24 }}>
      {!courseUuid && (
        <div style={{ marginBottom:16, padding:'10px 14px', background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:6, fontSize:13, color:'#7B4DB5', fontFamily:'sans-serif' }}>
          💡 This course hasn't been saved to the database yet. Modules you add here will be saved once the course is created in Supabase.
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Modules</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setMods(p => p.map(m => ({ ...m, expanded:false })))}
            style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
            Collapse All
          </button>
          <button onClick={() => setMods(p => p.map(m => ({ ...m, expanded:true })))}
            style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
            Expand All
          </button>
          {canEdit && (
            <button onClick={() => setAddMod(true)}
              style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
              + Module
            </button>
          )}
        </div>
      </div>
      {dbError && (
        <div style={{ marginBottom:14, padding:'10px 14px', background:'#FDEDED', border:'1px solid #F5C2C7', borderRadius:6, fontSize:13, color:C.error, fontFamily:'sans-serif' }}>
          Modules could not fully load: {dbError}
        </div>
      )}

      {addMod && canEdit && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:5, padding:16, marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Module Name *</label>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Day 11 [...]"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', marginBottom:10, outline:'none' }}/>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={saveMod} style={{ padding:'6px 16px', border:'none', borderRadius:4, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Add Module</button>
            <button onClick={() => setAddMod(false)} style={{ padding:'6px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {mods.length === 0 && !addMod ? (
        <div style={{ background:C.white, border:`1px dashed ${C.border}`, borderRadius:8, padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif', fontSize:13 }}>
          No modules are saved for this course yet.
        </div>
      ) : mods.map(m => (
        <div key={m.id} style={{ border:`1px solid ${C.border}`, borderRadius:5, marginBottom:10, overflow:'hidden', background:C.white }}>
          {/* Module header row */}
          <div style={{ padding:'11px 14px', background:'#F0EDF7', display:'flex', alignItems:'center', gap:10, borderBottom:m.expanded ? `1px solid ${C.border}` : 'none' }}>
            <button onClick={() => toggle(m.id as string)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:C.text, fontSize:14, flexShrink:0 }}>
              {m.expanded ? '▼' : '▶'}
            </button>
            <span style={{ flex:1, fontWeight:700, fontSize:13, fontFamily:'sans-serif', color:C.text, lineHeight:1.4 }}>{editId === m.id ? (<input autoFocus value={editName} onChange={e => setEditName(e.target.value)} onBlur={() => { if (editName.trim()) renameMod(m.id as string, editName.trim()); setEditId(null); }} onKeyDown={e => { if (e.key === 'Enter') { if (editName.trim()) renameMod(m.id as string, editName.trim()); setEditId(null); } if (e.key === 'Escape') setEditId(null); }} style={{ flex:1, fontWeight:700, fontSize:13, fontFamily:'sans-serif', padding:'2px 6px', border:'1px solid '+C.primary, borderRadius:4 }} />) : (<span onDoubleClick={() => { setEditId(m.id as string); setEditName(m.name); }} title='Double-click to rename'>{m.name}</span>)}</span>
            {!m.published && (
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:C.bg, color:C.muted, fontFamily:'sans-serif' }}>Unpublished</span>
            )}
            {canEdit && (
              <div
                onClick={() => togglePub(m.id as string, m.published)}
                title={m.published ? 'Published' : 'Unpublished'}
                style={{ width:18, height:18, borderRadius:'50%', background:m.published ? C.success : C.border, cursor:'pointer', flexShrink:0 }}
              />
            )}
            {canEdit && (
              <>
                <button onClick={() => { setEditId(m.id as string); setEditName(m.name); }} title='Rename' style={{ background:'none', border:'none', cursor:'pointer', color:C.primary, fontSize:13, padding:'2px 4px' }}>✏️</button>
                <button onClick={() => duplicateMod(m)} title='Duplicate' style={{ background:'none', border:'none', cursor:'pointer', color:C.primary, fontSize:13, padding:'2px 4px' }}>⧉</button>
                <button onClick={() => setAddItem(m.id as string)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.primary, fontSize:12, fontFamily:'sans-serif', padding:'2px 6px' }}>
                  + Item
                </button>
              </>
            )}
            {canEdit && (
              <button onClick={() => deleteMod(m.id as string)}
                style={{ background:'none', border:'none', cursor:'pointer', color:C.error, padding:3, fontSize:14 }}>
                ✕
              </button>
            )}
          </div>

          {/* Module items */}
          {m.expanded && (
            <>
              {m.items.map((it, i) => (
                <div key={it.id}
                  onClick={() => { if (it.file_url) openItem(it); }}
                  style={{ padding:'9px 14px', paddingLeft:14 + (it.indent * 20), display:'flex', alignItems:'center', gap:10, borderBottom:i < m.items.length - 1 ? `1px solid ${C.border}` : 'none', cursor:'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                  <span style={{ fontSize:13 }}>{itemIcon(it.type)}</span>
                  <span style={{ flex:1, fontSize:13, color:C.primary, fontFamily:'sans-serif', fontWeight:500 }}>
                    {it.name}
                    {it.file_name && <span style={{ marginLeft:8, color:C.muted, fontWeight:400, fontSize:11 }}>📎 {it.file_name}</span>}
                  </span>
                  {it.pts && <span style={{ fontSize:12, color:C.muted }}>{it.pts} pts</span>}
                  <div
                    onClick={(e) => { e.stopPropagation(); toggleIPub(it.id as string, it.published); }}
                    title={it.published ? 'Published' : 'Unpublished'}
                    style={{ width:16, height:16, borderRadius:'50%', background:it.published ? C.success : C.border, cursor:'pointer', flexShrink:0 }}
                  />
                </div>
              ))}

              {/* Add item form */}
              {addItem === m.id && canEdit ? (
                <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.border}`, background:'#faf9fc' }}>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <select value={ni.type} onChange={e => setNi(p => ({ ...p, type:e.target.value, file: null }))}
                      style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 8px', fontSize:12, fontFamily:'sans-serif', color:C.text }}>
                      {['page','assignment','quiz','file','video','discussion'].map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                    <input value={ni.title} onChange={e => setNi(p => ({ ...p, title:e.target.value }))} placeholder="Item title"
                      style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 9px', fontSize:13, fontFamily:'sans-serif', color:C.text, outline:'none' }}/>
                    <input value={ni.pts} onChange={e => setNi(p => ({ ...p, pts:e.target.value }))} placeholder="pts"
                      style={{ width:52, border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 7px', fontSize:13, fontFamily:'sans-serif', color:C.text, outline:'none' }}/>
                  </div>
                  {(ni.type === 'file' || ni.type === 'video') && (
                    <div style={{ marginBottom:8 }}>
                      <input type="file" onChange={e => setNi(p => ({ ...p, file: e.target.files?.[0] ?? null }))}
                        accept={ni.type === 'video' ? 'video/*' : undefined}
                        style={{ fontSize:12, fontFamily:'sans-serif' }}/>
                      {ni.file && <span style={{ marginLeft:8, fontSize:11, color:C.muted }}>{ni.file.name} ({Math.round(ni.file.size/1024)} KB)</span>}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={saveItem} style={{ padding:'5px 14px', border:'none', borderRadius:4, background:C.primary, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>Add</button>
                    <button onClick={() => { setAddItem(null); setNi({ title:'', type:'page', pts:'', file: null }); }} style={{ padding:'5px 11px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                canEdit && (
                  <div onClick={() => setAddItem(m.id as string)}
                    style={{ padding:'8px 14px', borderTop:`1px dashed ${C.border}`, cursor:'pointer', color:C.primary, fontSize:12, fontFamily:'sans-serif', display:'flex', alignItems:'center', gap:5 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f1fc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                    + Add Item
                  </div>
                )
              )}
            </>
          )}
        </div>
      ))}
    </div>
    {/* Right sidebar — Course Status */}
    <div style={{ width:200, flexShrink:0, padding:'24px 12px', borderLeft:`1px solid ${C.border}` }}>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:0.5 }}>Course Status</h3>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:C.success }}/>
          <span style={{ fontSize:13, fontFamily:'sans-serif', color:C.text, fontWeight:600 }}>Published</span>
          <span style={{ fontSize:11, color:C.muted }}>▾</span>
        </div>
      </div>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:0.5 }}>Course Actions</h3>
        {([
          ['📥','Import Existing Content','import'],
          ['🔄','Import from Commons','commons'],
          ['🏠','Choose Home Page','home-page'],
          ['📊','View Course Stream','stream'],
          ['📢','New Announcement','new-announcement'],
          ['📈','New Analytics','analytics'],
          ['🔔','View Notifications','notifications'],
        ] as const).map(([icon, label, action]) => (
          <div key={label} onClick={() => onCourseAction?.(action)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer', fontSize:12, fontFamily:'sans-serif', color:C.primary }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.text}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.primary}>
            <span>{icon}</span>{label}
          </div>
        ))}
      </div>
      <div>
        <h3 style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:0.5 }}>Coming Up</h3>
        <p style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', margin:0 }}>Nothing for the next week</p>
        <a href="#" style={{ fontSize:11, color:C.primary, fontFamily:'sans-serif', textDecoration:'none', display:'block', marginTop:6 }}>View Calendar →</a>
      </div>
    </div>
    </div>
    <ContentViewer
      open={!!viewer}
      onClose={() => setViewer(null)}
      source={viewer?.src ?? null}
      fileName={viewer?.name}
      fileType={viewer?.type}
    />
    </>
  );
};

// ── Placeholder ───────────────────────────────────────────────────────────────
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding:48, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>
    <div style={{ fontSize:38, marginBottom:14 }}>🚧</div>
    <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13 }}>This section is ready to connect to Supabase.</div>
  </div>
);

// ── Nav items ─────────────────────────────────────────────────────────────────
// Health Star-specific order: daily-used tabs first, then a divider, then
// planning / administration / infrequently-used tabs.
const NAV_ITEMS = [
  { id:'home',          label:'Home',               icon:'🏠' },
  { id:'modules',       label:'Modules',            icon:'📦' },
  { id:'announcements', label:'Announcements',      icon:'📢' },
  { id:'assignments',   label:'Assignments',        icon:'✅' },
  { id:'quizzes',       label:'Quizzes',            icon:'❓' },
  { id:'discussions',   label:'Discussions',        icon:'💬' },
  { id:'grades',        label:'Grades',             icon:'📊' },
  { id:'calendar',      label:'Calendar',           icon:'📅' },
  { id:'attendance',    label:'Attendance',         icon:'✔️' },
  { type:'divider' },
  { id:'progress',      label:'Progress',           icon:'📈' },
  { id:'people',        label:'People',             icon:'👥' },
  { id:'pages',         label:'Pages',              icon:'📄' },
  { id:'files',         label:'Files',              icon:'📁' },
  { id:'syllabus',      label:'Syllabus',           icon:'📋' },
  { id:'outcomes',      label:'Outcomes',           icon:'🎯' },
  { id:'rubrics',       label:'Rubrics',            icon:'📏' },
  { id:'clinical',      label:'Clinical Skills',    icon:'🩺' },
  { id:'readiness',     label:'Exam Readiness',     icon:'🏆' },
  { id:'required',      label:'Required Work',      icon:'📌' },
  { id:'career',        label:'Career Portal',      icon:'💼' },
  { id:'analytics',     label:'New Analytics',      icon:'📈' },
  { id:'lucid',         label:'Lucid (Whiteboard)', icon:'✏️' },
  { id:'settings',      label:'Settings',           icon:'⚙️' },
];

// ── Main CourseView ───────────────────────────────────────────────────────────
const CourseView: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const routeParams = useParams<{ courseId?: string }>();

  // Keep course + tab in the URL so leaving for a quiz/case study and pressing
  // browser Back returns to the same opened course/module context.
  const [searchParams, setSearchParams] = useSearchParams();
  const courseParam = searchParams.get('course') || routeParams.courseId || '';

  const realCanEdit    = authUser?.canEdit        ?? false;
  const canManageUsers = authUser?.canManageUsers  ?? false;

  const [activeCourse, setActiveCourse] = useState<Course>(COURSES[0]);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const activeTab = searchParams.get('tab') || 'home';
  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!tab || tab === 'home') next.delete('tab'); else next.set('tab', tab);
      return next;
    });
  };
  const [showCourses, setShowCourses]   = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const [showDashboard, setShowDashboard] = useState(!courseParam);
  const [pageLoading, setPageLoading]   = useState(true);
  const [pageError, setPageError]       = useState('');
  const [studentView, setStudentView]   = useState(false);
  const [openAddModule, setOpenAddModule] = useState(0);
  const canEdit = realCanEdit && !studentView;
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<{ id:string; title:string; sub:string; link?:string }[]>([]);
  const [notifsSeen, setNotifsSeen] = useState(false);
  const [homePageType, setHomePageType] = useState<string>('modules');
  const [hasFrontPage, setHasFrontPage] = useState(false);
  const [homePageDlgOpen, setHomePageDlgOpen] = useState(false);

  const openDashboard = () => {
    setShowDashboard(true);
    setShowCourses(false);
    setShowProfile(false);
    setMobileNavOpen(false);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('course');
      next.delete('tab');
      return next;
    });
  };

  const openCourse = (course: Course, tab: string = 'home') => {
    setActiveCourse(course);
    setCourseOptions(prev => prev.some(c => c.uuid === course.uuid) ? prev : [course, ...prev]);
    setShowDashboard(false);
    setShowCourses(false);
    setShowProfile(false);
    setMobileNavOpen(false);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (course.uuid) next.set('course', course.uuid);
      if (!tab || tab === 'home') next.delete('tab'); else next.set('tab', tab);
      return next;
    });
  };

  useEffect(() => {
    if (courseParam) setShowDashboard(false);
  }, [courseParam]);

  // Load per-course home_page_type + front-page availability
  useEffect(() => {
    const cid = activeCourse?.uuid;
    if (!cid) return;
    let cancelled = false;
    (async () => {
      const [{ data: c }, { data: fp }] = await Promise.all([
        supabase.from('courses').select('home_page_type').eq('id', cid).maybeSingle(),
        supabase.from('lms_pages').select('id').eq('course_id', cid).eq('front_page', true).eq('published', true).limit(1),
      ]);
      if (cancelled) return;
      setHomePageType((c as any)?.home_page_type || 'modules');
      setHasFrontPage((fp?.length ?? 0) > 0);
    })();
    return () => { cancelled = true; };
  }, [activeCourse?.uuid]);

  // Load notifications: recent submissions (instructor) + upcoming due-in-48h
  useEffect(() => {
    const cid = activeCourse?.uuid;
    if (!cid) return;
    let cancelled = false;
    const load = async () => {
      const in48 = new Date(Date.now() + 48*3600*1000).toISOString();
      const nowIso = new Date().toISOString();
      const items: any[] = [];
      const { data: dues } = await supabase.from('assignments')
        .select('id,title,due_at').eq('course_id', cid).eq('published', true)
        .gte('due_at', nowIso).lte('due_at', in48).order('due_at');
      (dues ?? []).forEach(a => items.push({ id:`due-${a.id}`, title:`Due soon: ${a.title}`, sub:new Date(a.due_at).toLocaleString() }));
      if (canEdit) {
        const { data: asgnRows } = await supabase.from('assignments').select('id,title').eq('course_id', cid);
        const ids = (asgnRows ?? []).map(a => a.id);
        if (ids.length) {
          const { data: subs } = await supabase.from('submissions')
            .select('id,assignment_id,submitted_at,user_id').in('assignment_id', ids)
            .order('submitted_at',{ ascending:false }).limit(5);
          (subs ?? []).forEach(s => {
            const asg = (asgnRows ?? []).find(a => a.id === s.assignment_id);
            items.push({ id:`sub-${s.id}`, title:`New submission: ${asg?.title || 'Assignment'}`, sub:new Date(s.submitted_at).toLocaleString() });
          });
        }
      }
      if (!cancelled) { setNotifs(items); setNotifsSeen(false); }
    };
    load();
  }, [activeCourse?.uuid, canEdit]);

  const unreadCount = notifsSeen ? 0 : notifs.length;

  // Simulate initial data load
  // SWAP: fetch courses from Supabase here
  React.useEffect(() => {
    const load = async () => {
      try {
        setPageLoading(true);
        const { data } = await supabase
          .from('courses')
          .select('id,title,code,color,status,term')
          .order('created_at', { ascending: false });
        if (data?.length) {
          const mapped = data.map((c: any, index: number) => ({
            id: index + 1,
            uuid: c.id,
            name: c.title,
            code: c.code,
            color: c.color || C.primary,
            term: c.term || '',
            students: 0,
            published: c.status === 'published',
          }));
          setCourseOptions(mapped);
          setActiveCourse(prev => {
            if (courseParam) return mapped.find(c => c.uuid === courseParam) ?? prev;
            return prev.uuid ? (mapped.find(c => c.uuid === prev.uuid) ?? prev) : mapped[0];
          });
        }
        await new Promise(r => setTimeout(r, 700));
        setPageLoading(false);
      } catch (err: any) {
        setPageError(err?.message ?? 'Failed to load course data. Please try again.');
        setPageLoading(false);
      }
    };
    load();
  }, [courseParam]);

  const handleLogout = () => {
    logout();
    window.location.replace('/portal/teach/login');
  };

  if (pageLoading) return <CourseViewSkeleton />;
  if (showDashboard) return (
    <Dashboard onEnterCourse={(course, tab) => {
      const selected = { id: 1, uuid: course.id, name: course.name, code: course.code,
        color: course.color || C.primary, term: course.term, students: 0, published: course.published };
      openCourse(selected, tab || 'home');
    }}/>
  );

  if (pageError)   return (
    <CourseViewError
      message={pageError}
      onRetry={() => { setPageError(''); setPageLoading(true); setTimeout(() => setPageLoading(false), 700); }}
    />
  );

  const handleCourseAction = (action: string) => {
    switch (action) {
      case 'home-page':       setHomePageDlgOpen(true); break;
      case 'stream':          setActiveTab('announcements'); break;
      case 'new-announcement': setActiveTab('announcements'); setTimeout(() => { (window as any).__hsaOpenAnn?.(); }, 50); break;
      case 'analytics':       setActiveTab('analytics'); break;
      case 'notifications':   setActiveTab('announcements'); break;
      case 'import':          alert('Import Existing Content is coming soon. For now, use Duplicate to New Cohort from the Dashboard.'); break;
      case 'commons':         alert('Import from Commons is not yet enabled.'); break;
    }
  };

  const switcherCourses = courseOptions.length ? courseOptions : (activeCourse.uuid ? [activeCourse] : COURSES);

  // Build sections map inside component so canEdit is available.
  // Per-tab authorization: students never edit; instructors only edit the tabs
  // they are authorized for; admins can edit everything.
  const cid = activeCourse?.uuid;
  const asStudent = authUser?.role === 'student' || studentView;
  const tabCan = (tab: string) => canEdit && canEditTab(authUser?.role as never, tab);
  const tabVisible = (tab: string) => !asStudent || canViewTab('student', tab);
  const navItems = NAV_ITEMS.filter(i => i.type === 'divider' ? !asStudent : tabVisible(i.id as string));
  const SECTIONS: Record<string, React.ReactNode> = {
    home:          <HomeRouter
                      type={homePageType}
                      courseId={cid}
                      modules={cid ? <ModulesTabAuthor courseId={cid} isInstructor={tabCan('modules')} openAddOnMount={openAddModule} /> : <ModulesHome canEdit={tabCan('modules')} courseUuid={cid} openAddOnMount={openAddModule} onCourseAction={handleCourseAction} />}
                      syllabus={<SyllabusTab courseUuid={cid} canEdit={tabCan('syllabus')} />}
                      assignments={<AssignmentView courseId={cid} canEdit={tabCan('assignments')} />}
                      activity={<AnnouncementsPanel canEdit={tabCan('announcements')} courseId={cid} />}
                   />,
    modules:       cid ? <ModulesTabAuthor courseId={cid} isInstructor={tabCan('modules')} openAddOnMount={openAddModule} /> : <ModulesHome canEdit={tabCan('modules')} courseUuid={cid} openAddOnMount={openAddModule} onCourseAction={handleCourseAction} />,
    announcements: <AnnouncementsPanel canEdit={tabCan('announcements')} courseId={cid} />,
    assignments:   <AssignmentView courseId={cid} canEdit={tabCan('assignments')} />,
    quizzes:       <QuizView courseId={cid} canEdit={tabCan('quizzes')} />,
    grades:        <StudentGrades  courseId={cid} canEdit={tabCan('grades')} selfOnly={asStudent} />,
    people:        <StudentDashboard courseId={cid} canEdit={tabCan('people')} />,
    pages:         <PagesTab       courseId={cid} canEdit={tabCan('pages')} />,
    files:         <FilesTab       courseId={cid} canEdit={tabCan('files')} />,
    syllabus:      <SyllabusTab courseUuid={cid} canEdit={tabCan('syllabus')} />,
    attendance:    <AttendanceTab  courseId={cid} canEdit={tabCan('attendance')} />,
    clinical:      <ClinicalSkillsTab courseId={cid} canEdit={tabCan('clinical')} />,
    readiness:     <ReadinessTab courseId={cid} canEdit={tabCan('readiness')} />,
    required:      <RequiredWork courseId={cid} canEdit={tabCan('required')} />,
    career:        <CareerPortal />,
    discussions:   <DiscussionsTab courseId={cid} canEdit={tabCan('discussions')} />,
    outcomes:      <OutcomesTab courseId={cid} canEdit={tabCan('outcomes')} />,
    rubrics:       <RubricsTab courseId={cid} canEdit={tabCan('rubrics')} />,
    analytics:     <AnalyticsTab courseId={cid} canEdit={tabCan('analytics')} />,
    lucid:         <Placeholder title="Lucid (Whiteboard)" />,
    settings:      <SettingsTab courseId={cid} />,
    account:       <Account onBackToDashboard={() => { setActiveTab('home'); setShowDashboard(true); }} isAdmin={authUser?.role === 'admin'} />,
    progress:      <StudentProgress courseId={cid} />,
    calendar:      <CalendarTab courseId={cid} canEdit={tabCan('calendar')} />,
  };


  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg }}>

      {/* Fixed purple left rail */}
      <div style={{ width:52, background:C.nav, minHeight:'100vh', position:'fixed', left:0, top:0, zIndex:100, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:10 }}>
        <img src="/hsa-logo.png" alt="HSA" onClick={openDashboard}
          title="Go to Dashboard"
          style={{ width:38, height:38, borderRadius:'50%', marginBottom:16, cursor:'pointer', objectFit:'cover', border:'2px solid rgba(255,255,255,0.3)', display:'block' }}/>
        {[
          { icon:'🏠', title:'Home',     onClick:openDashboard },
          { icon:'📚', title:'Courses',  onClick:() => { openCourse(activeCourse, 'home'); setShowCourses(true); } },
          ...(asStudent ? [] : [{ icon:'📅', title:'Calendar', onClick:() => { setActiveTab('calendar');     setMobileNavOpen(false); setShowDashboard(false); setShowProfile(false); } }]),
          { icon:'👤', title:'Account',  onClick:() => { setActiveTab('account');      setMobileNavOpen(false); setShowDashboard(false); setShowProfile(false); } },
          ...(asStudent ? [] : [{ icon:'💼', title:'Career',   onClick:() => { setActiveTab('career');       setMobileNavOpen(false); setShowDashboard(false); setShowProfile(false); } }]),
        ].map(({ icon, title, onClick }) => (
          <div key={title} onClick={onClick} title={title}
            style={{ width:52, height:48, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:17, borderLeft:'3px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            {icon}
          </div>
        ))}
        <div style={{ marginTop:'auto', marginBottom:10, position:'relative' }}>
          <button onClick={() => setShowProfile(!showProfile)}
            style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#9B6DD0,#5BC8E8)', border:'2px solid rgba(255,255,255,0.4)', cursor:'pointer', color:'white', fontSize:12, fontWeight:700, fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {authUser?.avatarInitials ?? '?'}
          </button>
          {showProfile && (
            <div style={{ position:'absolute', bottom:'110%', left:58, background:'white', border:'1px solid #D4C8E8', borderRadius:8, boxShadow:'0 8px 28px rgba(0,0,0,0.2)', zIndex:200, width:220, overflow:'hidden' }}>
              {/* Profile header */}
              <div style={{ padding:'14px 16px', borderBottom:'1px solid #D4C8E8', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#9B6DD0,#5BC8E8)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:700, flexShrink:0 }}>
                  {authUser?.avatarInitials ?? '?'}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#2D1B4E', fontFamily:'sans-serif' }}>{authUser?.name}</div>
                  <div style={{ fontSize:11, color:'#655480', fontFamily:'sans-serif', textTransform:'capitalize' }}>{authUser?.role}</div>
                </div>
              </div>
              {/* Accessibility */}
              <div style={{ padding:'10px 16px', borderBottom:'1px solid #D4C8E8' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#655480', textTransform:'uppercase', letterSpacing:0.5, fontFamily:'sans-serif', marginBottom:8 }}>Accessibility</div>
                {[['Use High Contrast UI'],['Use a Dyslexia Friendly Font']].map(([label]) => (
                  <label key={label} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, fontFamily:'sans-serif', color:'#2D1B4E', marginBottom:6, cursor:'pointer' }}>
                    <input type="checkbox" style={{ accentColor:'#7B4DB5' }}/>{label}
                  </label>
                ))}
              </div>
              {/* Menu items */}
              {[['🔔','Notifications'],['👤','Profile'],['📁','Files'],['⚙️','Settings']].map(([icon, label]) => (
                <div key={label}
                  onClick={() => { if(label==='Settings') setActiveTab('settings'); if(label==='Profile') setActiveTab('settings'); setShowProfile(false); setShowDashboard(false); }}
                  style={{ padding:'9px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13, fontFamily:'sans-serif', color:'#2D1B4E', borderBottom:'1px solid #f0edf7' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f5f3fa'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>
                  <span>{icon}</span>{label}
                </div>
              ))}
              <div onClick={() => { handleLogout(); setShowProfile(false); }}
                style={{ padding:'9px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13, fontFamily:'sans-serif', color:'#C0392B' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fdecea'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>
                <span>↩</span> Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div style={{ marginLeft:52, flex:1, display:'flex', flexDirection:'column' }}>

        {/* Course header bar */}
        <div style={{ background:activeCourse.color, borderBottom:`1px solid ${C.border}`, padding:'14px 20px 0', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>

            {/* User greeting + role badge */}
            {authUser && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.85)', fontFamily:'sans-serif' }}>
                  👋 {authUser.name}
                </span>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,0.2)', color:'white', fontFamily:'sans-serif', fontWeight:600, textTransform:'capitalize' }}>
                  {authUser.role}
                </span>
              </div>
            )}

            {/* Course selector dropdown */}
            <div style={{ position:'relative', marginLeft: authUser ? 8 : 0 }}>
              <button onClick={() => setShowCourses(!showCourses)}
                style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:5, padding:'5px 12px', cursor:'pointer', color:'white', fontFamily:'sans-serif', fontSize:13, fontWeight:600 }}>
                <span style={{ maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {activeCourse.name}
                </span>
                <span style={{ fontSize:10 }}>▼</span>
              </button>
              {showCourses && (
                <div style={{ position:'absolute', top:'110%', left:0, background:C.white, border:`1px solid ${C.border}`, borderRadius:6, boxShadow:'0 8px 28px rgba(0,0,0,0.18)', zIndex:200, minWidth:380 }}>
                  <div style={{ padding:'8px 14px', fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontFamily:'sans-serif', borderBottom:`1px solid ${C.border}` }}>
                    Switch Course
                  </div>
                  {switcherCourses.map(course => (
                    <div key={course.uuid ?? course.id}
                      onClick={() => openCourse(course, 'home')}
                      style={{ padding:'11px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:course.id === activeCourse.id ? '#EDE8F7' : C.white, borderBottom:`1px solid ${C.border}` }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f2fa'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = course.id === activeCourse.id ? '#EDE8F7' : C.white}>
                      <div style={{ width:6, height:38, background:course.color, borderRadius:3, flexShrink:0 }}/>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>{course.name}</div>
                        <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>
                          {course.term} • {course.students} students{!course.published ? ' • Unpublished' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
              {/* Notification bell */}
              <div style={{ position:'relative' }}>
                <button onClick={() => { setNotifOpen(v => !v); if (!notifOpen) setNotifsSeen(true); }}
                  style={{ position:'relative', padding:'5px 10px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:5, color:'white', fontSize:14, cursor:'pointer' }}
                  aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}>
                  🔔
                  {unreadCount > 0 && (
                    <span style={{ position:'absolute', top:-4, right:-4, minWidth:18, height:18, padding:'0 5px', borderRadius:9, background:C.error, color:'white', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{ position:'absolute', top:'110%', right:0, width:320, background:C.white, border:`1px solid ${C.border}`, borderRadius:8, boxShadow:'0 8px 28px rgba(0,0,0,0.18)', zIndex:200, overflow:'hidden' }}>
                    <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:700, fontSize:13, color:C.text, fontFamily:'sans-serif' }}>Notifications</span>
                      {notifs.length > 0 && <button onClick={() => { setNotifsSeen(true); }} style={{ background:'none', border:'none', color:C.primary, fontSize:11, cursor:'pointer' }}>Mark all read</button>}
                    </div>
                    <div style={{ maxHeight:340, overflowY:'auto' }}>
                      {notifs.length === 0 ? (
                        <div style={{ padding:24, textAlign:'center', color:C.muted, fontSize:12, fontFamily:'sans-serif' }}>You're all caught up.</div>
                      ) : notifs.map(n => (
                        <div key={n.id} style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`, fontFamily:'sans-serif' }}>
                          <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{n.title}</div>
                          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{n.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {realCanEdit && !isMobile && (
                <button onClick={() => setStudentView(v => !v)}
                  style={{ padding:'5px 14px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:5, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>
                  {studentView ? '↩ Back to Instructor View' : '👁 View as Student'}
                </button>
              )}
              {canEdit && !isMobile && (
                <button onClick={() => { setActiveTab('modules'); setOpenAddModule(n => n + 1); }}
                  style={{ padding:'5px 14px', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:5, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
                  + Module
                </button>
              )}
              {isMobile && (
                <button onClick={() => setMobileNavOpen(true)}
                  style={{ padding:'5px 10px', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:5, color:'white', fontSize:16, cursor:'pointer' }} aria-label="Open menu">
                  ☰
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar + content */}
        <div style={{ display:'flex', flex:1 }}>

          {/* Course sidebar nav (desktop) or drawer (mobile) */}
          {!isMobile && (
            <div style={{ width:200, background:C.white, borderRight:`1px solid ${C.border}`, flexShrink:0, minHeight:'calc(100vh - 76px)', overflowY:'auto' }}>
              {navItems.map((item, idx) => {
                if (item.type === 'divider') {
                  return <div key={`divider-${idx}`} style={{ height:12, margin:'4px 14px', borderTop:`1px solid ${C.border}` }} />;
                }
                const active = activeTab === item.id || (item.id === 'modules' && activeTab === 'home');
                return (
                  <div key={item.id} onClick={() => setActiveTab(item.id)}
                    style={{ padding:'9px 14px', display:'flex', alignItems:'center', gap:9, cursor:'pointer', borderLeft:active ? `3px solid ${C.primary}` : '3px solid transparent', background:active ? '#EDE8F7' : 'transparent', color:active ? C.primary : C.text, fontFamily:'sans-serif', fontSize:13, fontWeight:active ? 600 : 400 }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f5f3fa'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <span style={{ fontSize:13 }}>{item.icon}</span>
                    {item.label}
                  </div>
                );
              })}
            </div>
          )}

          {isMobile && mobileNavOpen && (
            <div onClick={() => setMobileNavOpen(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:250 }}>
              <div onClick={e => e.stopPropagation()}
                style={{ position:'absolute', top:0, left:0, bottom:0, width:260, background:C.white, overflowY:'auto', paddingBottom:20, boxShadow:'2px 0 10px rgba(0,0,0,0.15)' }}>
                <div style={{ padding:'14px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Course Menu</span>
                  <button onClick={() => setMobileNavOpen(false)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer' }}>✕</button>
                </div>
                {navItems.map((item, idx) => {
                  if (item.type === 'divider') {
                    return <div key={`m-divider-${idx}`} style={{ height:12, margin:'4px 16px', borderTop:`1px solid ${C.border}` }} />;
                  }
                  const active = activeTab === item.id || (item.id === 'modules' && activeTab === 'home');
                  return (
                    <div key={item.id} onClick={() => { setActiveTab(item.id); setMobileNavOpen(false); }}
                      style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', background:active?'#EDE8F7':'transparent', color:active?C.primary:C.text, fontFamily:'sans-serif', fontSize:14, fontWeight:active?600:400 }}>
                      <span>{item.icon}</span>{item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab content */}
          <div style={{ flex:1, background:C.bg, overflowY:'auto', paddingBottom: isMobile ? 64 : 0 }}>
            {tabVisible(activeTab)
              ? (SECTIONS[activeTab] ?? <Placeholder title={activeTab} />)
              : <Placeholder title="Not available" />}
          </div>
        </div>

        {/* Mobile bottom nav */}
        {isMobile && (
          <div style={{ position:'fixed', bottom:0, left:52, right:0, height:56, background:C.white, borderTop:`1px solid ${C.border}`, display:'flex', zIndex:150, boxShadow:'0 -2px 10px rgba(0,0,0,0.08)' }}>
            {[
              { id:'home', icon:'🏠', label:'Home' },
              { id: asStudent ? 'modules' : 'people', icon: asStudent ? '📦' : '👥', label: asStudent ? 'Modules' : 'People' },
              { id:'grades', icon:'📊', label:'Grades' },
              { id:'attendance', icon:'✔️', label:'Attend' },
              { id: asStudent ? 'quizzes' : 'settings', icon: asStudent ? '❓' : '⚙️', label: asStudent ? 'Quizzes' : 'More' },
            ].map(t => {
              const active = activeTab === t.id || (t.id==='home' && activeTab==='modules');
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ flex:1, border:'none', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:active?C.primary:C.muted, fontSize:10, fontFamily:'sans-serif', cursor:'pointer', gap:2 }}>
                  <span style={{ fontSize:18 }}>{t.icon}</span>{t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {cid && (
        <ChooseHomePageDialog
          courseId={cid}
          current={homePageType}
          hasFrontPage={hasFrontPage}
          open={homePageDlgOpen}
          onOpenChange={setHomePageDlgOpen}
          onChanged={(next) => setHomePageType(next)}
        />
      )}
      <Toaster position="bottom-right" richColors />
      <style>{`@keyframes hsa-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
};

export default CourseView;
