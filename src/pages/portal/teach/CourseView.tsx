// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect } from 'react';
import AttendanceTab     from './AttendanceTab';
import CareerPortal      from './CareerPortal';
import ClinicalSkillsTab from './ClinicalSkillsTab';
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
import { useAuth, supabase } from './AuthContext';

const C = {
  nav:'#3D1B6E', primary:'#7B4DB5', accent:'#5BC8E8',
  bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8',
  text:'#2D1B4E', muted:'#8878A8', success:'#127A1B',
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

// ── Announcements panel ───────────────────────────────────────────────────────
const AnnouncementsPanel: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const [anns, setAnns] = useState([
    { id:1, title:'Week 3 Clinical Prep Reminder',     body:'Please review the hand washing technique video before your clinical visit this Friday. Bring your signed skills checklist.', date:'May 26, 2026', replies:3 },
    { id:2, title:'Vital Signs Lab Rescheduled',       body:'Due to facility maintenance, the Vital Signs Lab has been moved to June 22. Please update your calendars.',                   date:'May 24, 2026', replies:7 },
    { id:3, title:'Welcome to the 2026-1 Cohort!',     body:'Welcome! Please read through the syllabus and complete the Student Handbook acknowledgement before Day 2.',                   date:'Jan 26, 2026', replies:12 },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title:'', body:'' });

  const post = () => {
    if (!form.title || !form.body) return;
    setAnns(p => [{ id:Date.now(), title:form.title, body:form.body, date:'Today', replies:0 }, ...p]);
    setForm({ title:'', body:'' });
    setOpen(false);
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
      {open && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:20, marginBottom:16 }}>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title:e.target.value }))}
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Message *</label>
            <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body:e.target.value }))} rows={4}
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }}/>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={post} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Post</button>
            <button onClick={() => setOpen(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      {anns.map(a => (
        <div key={a.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:18, marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.primary, fontFamily:'sans-serif' }}>{a.title}</h3>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{a.date}</span>
              {canEdit && (
                <button onClick={() => setAnns(p => p.filter(x => x.id !== a.id))}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.error, fontSize:14 }}>✕</button>
              )}
            </div>
          </div>
          <p style={{ margin:'0 0 8px', fontSize:13, color:C.text, fontFamily:'sans-serif', lineHeight:1.65 }}>{a.body}</p>
          <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{a.replies} replies</div>
        </div>
      ))}
    </div>
  );
};

// ── Modules home ──────────────────────────────────────────────────────────────
const ModulesHome: React.FC<{ canEdit: boolean; courseUuid?: string; openAddOnMount?: number }> = ({ canEdit, courseUuid, openAddOnMount }) => {
  const [mods, setMods]       = useState<Module[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [addMod, setAddMod]   = useState(false);
  const [newName, setNewName] = useState('');
  const [addItem, setAddItem] = useState<string | null>(null);
  const [ni, setNi]           = useState<{ title: string; type: string; pts: string; file: File | null }>({ title:'', type:'page', pts:'', file: null }); const [editId, setEditId] = useState<string | null>(null); const [editName, setEditName] = useState('');

  // Open Add Module form on demand (when top "+ Module" button is clicked)
  useEffect(() => { if (openAddOnMount && canEdit) setAddMod(true); }, [openAddOnMount, canEdit]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!courseUuid) { setDbLoading(false); return; }
    const load = async () => {
      setDbLoading(true);
      const { data: modRows } = await supabase
        .from('modules').select('id,title,published,position')
        .eq('course_id', courseUuid).order('position');
      const { data: itemRows } = await supabase
        .from('module_items').select('id,module_id,item_type,title,published,position,points,file_url,file_name,file_type')
        .eq('course_id', courseUuid).order('position');
      if (modRows) {
        setMods(modRows.map(m => ({
          id: m.id, name: m.title, published: m.published,
          expanded: true, position: m.position,
          items: (itemRows ?? []).filter(it => it.module_id === m.id).map((it: any) => ({
            id: it.id, type: it.item_type, name: it.title,
            pts: it.points ?? undefined, published: it.published, indent: 0,
            file_url: it.file_url, file_name: it.file_name,
          })),
        })));
      }
      setDbLoading(false);
    };
    load();
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
      .insert({ module_id: addItem, course_id: courseUuid, item_type: ni.type, title: ni.title.trim(),
        published: false, position: mod?.items.length ?? 0,
        points: ni.pts ? Number(ni.pts) : null,
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

      {mods.map(m => (
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
                  style={{ padding:'9px 14px', paddingLeft:14 + (it.indent * 20), display:'flex', alignItems:'center', gap:10, borderBottom:i < m.items.length - 1 ? `1px solid ${C.border}` : 'none', cursor:'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                  <span style={{ fontSize:13 }}>{itemIcon(it.type)}</span>
                  <span style={{ flex:1, fontSize:13, color:C.primary, fontFamily:'sans-serif', fontWeight:500 }}>{it.name}</span>
                  {it.pts && <span style={{ fontSize:12, color:C.muted }}>{it.pts} pts</span>}
                  <div
                    onClick={() => toggleIPub(it.id as string, it.published)}
                    title={it.published ? 'Published' : 'Unpublished'}
                    style={{ width:16, height:16, borderRadius:'50%', background:it.published ? C.success : C.border, cursor:'pointer', flexShrink:0 }}
                  />
                </div>
              ))}

              {/* Add item form */}
              {addItem === m.id && canEdit ? (
                <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.border}`, background:'#faf9fc' }}>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <select value={ni.type} onChange={e => setNi(p => ({ ...p, type:e.target.value }))}
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
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={saveItem} style={{ padding:'5px 14px', border:'none', borderRadius:4, background:C.primary, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>Add</button>
                    <button onClick={() => setAddItem(null)} style={{ padding:'5px 11px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
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
        {[
          ['📥','Import Existing Content'],
          ['🔄','Import from Commons'],
          ['🏠','Choose Home Page'],
          ['📊','View Course Stream'],
          ['📢','New Announcement'],
          ['📈','New Analytics'],
          ['🔔','View Notifications'],
        ].map(([icon, label]) => (
          <div key={label as string} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer', fontSize:12, fontFamily:'sans-serif', color:C.primary }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.text}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.primary}>
            <span>{icon as string}</span>{label as string}
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
const NAV_ITEMS = [
  { id:'home',          label:'Home',               icon:'🏠' },
  { id:'announcements', label:'Announcements',      icon:'📢' },
  { id:'assignments',   label:'Assignments',        icon:'✅' },
  { id:'discussions',   label:'Discussions',        icon:'💬' },
  { id:'grades',        label:'Grades',             icon:'📊' },
  { id:'people',        label:'People',             icon:'👥' },
  { id:'pages',         label:'Pages',              icon:'📄' },
  { id:'files',         label:'Files',              icon:'📁' },
  { id:'syllabus',      label:'Syllabus',           icon:'📋' },
  { id:'outcomes',      label:'Outcomes',           icon:'🎯' },
  { id:'rubrics',       label:'Rubrics',            icon:'📏' },
  { id:'quizzes',       label:'Quizzes',            icon:'❓' },
  { id:'modules',       label:'Modules',            icon:'📦' },
  { id:'attendance',    label:'Attendance',         icon:'✔️' },
  { id:'clinical',      label:'Clinical Skills',    icon:'🩺' },
  { id:'readiness',     label:'Exam Readiness',     icon:'🏆' },
  { id:'required',      label:'Required Work',      icon:'📌' },
  { id:'career',        label:'Career Portal',      icon:'💼' },
  { id:'analytics',     label:'New Analytics',      icon:'📈' },
  { id:'lucid',         label:'Lucid (Whiteboard)', icon:'✏️' },
  { id:'calendar',      label:'Calendar',           icon:'📅' },
  { id:'settings',      label:'Settings',           icon:'⚙️' },
];

// ── Main CourseView ───────────────────────────────────────────────────────────
const CourseView: React.FC = () => {
  const { user: authUser, logout } = useAuth();

  const canEdit        = authUser?.canEdit        ?? false;
  const canManageUsers = authUser?.canManageUsers  ?? false;

  const [activeCourse, setActiveCourse] = useState<Course>(COURSES[0]);
  const [activeTab, setActiveTab]       = useState('home');
  const [showCourses, setShowCourses]   = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [pageLoading, setPageLoading]   = useState(true);
  const [pageError, setPageError]       = useState('');

  // Simulate initial data load
  // SWAP: fetch courses from Supabase here
  React.useEffect(() => {
    const load = async () => {
      try {
        setPageLoading(true);
        await new Promise(r => setTimeout(r, 700));
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
  if (showDashboard) return (
    <Dashboard onEnterCourse={(course) => {
      setActiveCourse({ id: 1, uuid: course.id, name: course.name, code: course.code,
        color: course.color, term: course.term, students: 0, published: course.published });
      setShowDashboard(false);
      setActiveTab('home');
    }}/>
  );
  if (pageError)   return (
    <CourseViewError
      message={pageError}
      onRetry={() => { setPageError(''); setPageLoading(true); setTimeout(() => setPageLoading(false), 700); }}
    />
  );

  // Build sections map inside component so canEdit is available
  const cid = activeCourse?.uuid;
  const SECTIONS: Record<string, React.ReactNode> = {
    home:          <ModulesHome    canEdit={canEdit} courseUuid={cid} />,
    modules:       <ModulesHome    canEdit={canEdit} courseUuid={cid} />,
    announcements: <AnnouncementsPanel canEdit={canEdit} />,
    assignments:   <AssignmentView courseId={cid} canEdit={canEdit} />,
    quizzes:       <QuizView />,
    grades:        <StudentGrades  courseId={cid} canEdit={canEdit} />,
    people:        <StudentDashboard courseId={cid} canEdit={canEdit} />,
    pages:         <PagesTab       courseId={cid} canEdit={canEdit} />,
    files:         <FilesTab       courseId={cid} canEdit={canEdit} />,
    syllabus:      <SyllabusTab />,
    attendance:    <AttendanceTab  courseId={cid} canEdit={canEdit} />,
    clinical:      <ClinicalSkillsTab />,
    readiness:     <ReadinessTab />,
    required:      <RequiredWork />,
    career:        <CareerPortal />,
    discussions:   <Placeholder title="Discussions" />,
    outcomes:      <Placeholder title="Outcomes" />,
    rubrics:       <Placeholder title="Rubrics" />,
    analytics:     <Placeholder title="New Analytics" />,
    lucid:         <Placeholder title="Lucid (Whiteboard)" />,
    settings:      <SettingsTab />,
    calendar:      <CalendarTab />,
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg }}>

      {/* Fixed purple left rail */}
      <div style={{ width:52, background:C.nav, minHeight:'100vh', position:'fixed', left:0, top:0, zIndex:100, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:10 }}>
        <img src="/hsa-logo.png" alt="HSA" onClick={() => setShowDashboard(true)}
          title="Go to Dashboard"
          style={{ width:38, height:38, borderRadius:'50%', marginBottom:16, cursor:'pointer', objectFit:'cover', border:'2px solid rgba(255,255,255,0.3)', display:'block' }}/>
        {['🏠','📚','📅','✉️','⏱️'].map((icon, i) => (
          <div key={i}
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
                  <div style={{ fontSize:11, color:'#8878A8', fontFamily:'sans-serif', textTransform:'capitalize' }}>{authUser?.role}</div>
                </div>
              </div>
              {/* Accessibility */}
              <div style={{ padding:'10px 16px', borderBottom:'1px solid #D4C8E8' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#8878A8', textTransform:'uppercase', letterSpacing:0.5, fontFamily:'sans-serif', marginBottom:8 }}>Accessibility</div>
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
                  {COURSES.map(course => (
                    <div key={course.id}
                      onClick={() => { setActiveCourse(course); setShowCourses(false); setActiveTab('home'); }}
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

            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              <button style={{ padding:'5px 14px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:5, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>
                View as Student
              </button>
              {canEdit && (
                <button style={{ padding:'5px 14px', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:5, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
                  + Module
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar + content */}
        <div style={{ display:'flex', flex:1 }}>

          {/* Course sidebar nav */}
          <div style={{ width:200, background:C.white, borderRight:`1px solid ${C.border}`, flexShrink:0, minHeight:'calc(100vh - 76px)', overflowY:'auto' }}>
            {NAV_ITEMS.map(item => {
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

          {/* Tab content */}
          <div style={{ flex:1, background:C.bg, overflowY:'auto' }}>
            {SECTIONS[activeTab] ?? <Placeholder title={activeTab} />}
          </div>
        </div>
      </div>

      <style>{`@keyframes hsa-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
};

export default CourseView;
