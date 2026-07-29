// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useRef, useEffect } from 'react';
import { useAuth, supabase } from './AuthContext';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#655480',
  success:'#127A1B', error:'#C0392B',
} as const;

const TABS = ['Course Details','Sections','Navigation','Apps','Feature Options','Integrations'] as const;
type Tab = typeof TABS[number];

const ACCEPTED_TYPES = ['image/jpeg','image/png','image/webp','image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const COURSE_IMAGE_BUCKET = 'page-images'; // public bucket allowed by workspace policy

const CourseImageUploader: React.FC<{ courseId?: string; canEdit: boolean }> = ({ courseId, canEdit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!courseId) { setImageUrl(null); return; }
    let cancel = false;
    (async () => {
      const { data } = await supabase.from('courses').select('image_url').eq('id', courseId).maybeSingle();
      if (!cancel) setImageUrl((data as any)?.image_url ?? null);
    })();
    return () => { cancel = true; };
  }, [courseId]);

  const handleFile = async (file: File) => {
    setError('');
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, WEBP, or GIF.'); return;
    }
    if (file.size > MAX_BYTES) {
      setError(`File too large (${(file.size/1024/1024).toFixed(1)}MB). Max 5MB.`); return;
    }
    if (!courseId) { setError('No course selected.'); return; }

    setUploading(true);
    const ext = (file.name.split('.').pop() || file.type.split('/')[1] || 'jpg').toLowerCase();
    const path = `course-images/${courseId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(COURSE_IMAGE_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (upErr) { setError(upErr.message); setUploading(false); return; }

    const { data: pub } = supabase.storage.from(COURSE_IMAGE_BUCKET).getPublicUrl(path);
    const url = pub.publicUrl;

    const { error: dbErr } = await supabase.from('courses').update({ image_url: url }).eq('id', courseId);
    if (dbErr) { setError(dbErr.message); setUploading(false); return; }

    setImageUrl(url);
    setUploading(false);
  };

  const onPick = () => { if (canEdit && !uploading && inputRef.current) inputRef.current.click(); };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (!canEdit || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const remove = async () => {
    if (!courseId || !canEdit || uploading) return;
    setError('');
    const { error: dbErr } = await supabase.from('courses').update({ image_url: null }).eq('id', courseId);
    if (dbErr) { setError(dbErr.message); return; }
    setImageUrl(null);
  };

  return (
    <div style={{ marginBottom:22 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:8 }}>Image:</label>
      <input
        ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} style={{ display:'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      <div
        onClick={imageUrl ? undefined : onPick}
        onDragOver={e => { e.preventDefault(); if (canEdit && !uploading) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          width:260, height:160, position:'relative', overflow:'hidden',
          border:`2px dashed ${dragOver ? C.primary : C.border}`, borderRadius:8,
          background: imageUrl ? '#000' : C.bg,
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor: canEdit && !imageUrl && !uploading ? 'pointer' : 'default',
          transition: 'border-color .15s',
        }}>
        {uploading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, color:C.muted, fontFamily:'sans-serif', fontSize:12 }}>
            <span style={{ width:26, height:26, border:`3px solid ${C.border}`, borderTopColor:C.primary, borderRadius:'50%', display:'inline-block', animation:'hsa-img-spin 0.8s linear infinite' }}/>
            Uploading…
            <style>{`@keyframes hsa-img-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt="Course cover" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            {canEdit && (
              <div style={{ position:'absolute', bottom:8, right:8, display:'flex', gap:6 }}>
                <button onClick={onPick}
                  style={{ padding:'6px 12px', border:'none', borderRadius:4, background:C.primary, color:'white', fontSize:12, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer' }}>
                  Change
                </button>
                <button onClick={remove}
                  style={{ padding:'6px 12px', border:'none', borderRadius:4, background:'rgba(0,0,0,0.65)', color:'white', fontSize:12, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer' }}>
                  Remove
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:C.muted, fontFamily:'sans-serif', fontSize:12, textAlign:'center', padding:12 }}>
            <span style={{ fontSize:30 }}>🖼️</span>
            {canEdit ? (
              <>
                <span style={{ fontWeight:600, color:C.text }}>Choose Image</span>
                <span>or drag &amp; drop here</span>
                <span style={{ fontSize:11 }}>JPG, PNG, WEBP, GIF · max 5MB</span>
              </>
            ) : (
              <span>No image uploaded</span>
            )}
          </div>
        )}
      </div>
      {error && (
        <div style={{ marginTop:8, fontSize:12, color:C.error, fontFamily:'sans-serif' }}>⚠️ {error}</div>
      )}
      {!courseId && canEdit && (
        <div style={{ marginTop:8, fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>Select a course to enable uploads.</div>
      )}
    </div>
  );
};

const CourseDetails: React.FC<{ canEdit: boolean; courseId?: string }> = ({ canEdit, courseId }) => {
  const [name, setName]       = useState('Health Star Academy Hybrid Day NATP Sandbox');
  const [code, setCode]       = useState('Hybrid Day NATP');
  const [tz, setTz]           = useState('Pacific Time (US & Canada) (-08:00/-07:00)');
  const [status, setStatus]   = useState<'published'|'unpublished'>('published');
  const [start, setStart]     = useState('');
  const [end, setEnd]         = useState('');
  const [saved, setSaved]     = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
      {/* Left form */}
      <div style={{ flex:1, minWidth:320, maxWidth:680 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 24px' }}>Course Details</h2>

        {saved && (
          <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:6, padding:'10px 14px', marginBottom:16, fontSize:13, color:C.success, fontFamily:'sans-serif' }}>
            ✅ Course details updated successfully.
          </div>
        )}

        <CourseImageUploader courseId={courseId} canEdit={canEdit} />


        {/* Name */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Name:</label>
          <input value={name} onChange={e => setName(e.target.value)} disabled={!canEdit}
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', background:canEdit?C.white:C.bg }}/>
        </div>

        {/* Course code */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Course Code:</label>
          <input value={code} onChange={e => setCode(e.target.value)} disabled={!canEdit}
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', background:canEdit?C.white:C.bg }}/>
        </div>

        {/* Blueprint */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Blueprint Course:</label>
          <span style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>No</span>
        </div>

        {/* Timezone */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Time Zone:</label>
          <select value={tz} onChange={e => setTz(e.target.value)} disabled={!canEdit}
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:13, fontFamily:'sans-serif', color:C.text, background:canEdit?C.white:C.bg }}>
            <option>Pacific Time (US & Canada) (-08:00/-07:00)</option>
            <option>Mountain Time (US & Canada) (-07:00/-06:00)</option>
            <option>Central Time (US & Canada) (-06:00/-05:00)</option>
            <option>Eastern Time (US & Canada) (-05:00/-04:00)</option>
          </select>
        </div>

        {/* Participation */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Participation:</label>
          <select disabled={!canEdit}
            style={{ border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 12px', fontSize:13, fontFamily:'sans-serif', background:canEdit?C.white:C.bg }}>
            <option>Term</option><option>Course</option><option>Unrestricted</option>
          </select>
          <p style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', margin:'5px 0 0' }}>
            Course participation is limited to <strong>term</strong> start and end dates.
          </p>
        </div>

        {/* Dates */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:22 }}>
          {[['Start', start, setStart],['End', end, setEnd]].map(([label, val, set]) => (
            <div key={label as string}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>{label as string}</label>
              <input type="date" value={val as string} onChange={e => (set as Function)(e.target.value)} disabled={!canEdit}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', background:canEdit?C.white:C.bg }}/>
            </div>
          ))}
        </div>

        {/* Restrict checkbox */}
        <label style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:24, cursor:'pointer' }}>
          <input type="checkbox" disabled={!canEdit} style={{ marginTop:2, accentColor:C.primary }}/>
          <span style={{ fontSize:13, color:C.text, fontFamily:'sans-serif', lineHeight:1.5 }}>
            Restrict students from viewing course before term start date
          </span>
        </label>

        {canEdit && (
          <button onClick={save}
            style={{ padding:'10px 28px', border:'none', borderRadius:6, background:C.primary, color:'white', fontSize:14, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer' }}>
            Update Course Details
          </button>
        )}
      </div>

      {/* Right sidebar */}
      <div style={{ width:220, flexShrink:0 }}>
        {/* Course Status */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:16, marginBottom:16 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 12px' }}>Course Status</h3>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:status==='published'?C.success:C.muted }}/>
            <span style={{ fontSize:13, fontFamily:'sans-serif', color:C.text, fontWeight:600 }}>
              {status === 'published' ? 'Published' : 'Unpublished'}
            </span>
          </div>
          {canEdit && (
            <button onClick={() => setStatus(s => s === 'published' ? 'unpublished' : 'published')}
              style={{ width:'100%', padding:'7px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor:'pointer', color:C.text }}>
              {status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          )}
        </div>

        {/* Course actions */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:16, marginBottom:16 }}>
          {[
            ['📊','Course Statistics'],['📅','Course Calendar'],['🏁','Conclude this Course'],
            ['🗑️','Delete this Course'],['📋','Copy this Course'],['📥','Import Course Content'],
            ['📤','Export Course Content'],['🔄','Reset Course Content'],['🔗','Validate Links in Content'],
          ].map(([icon, label]) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer', fontSize:13, fontFamily:'sans-serif', color:C.primary }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.text}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.primary}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>

        {/* Current Users */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:16 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 10px' }}>Current Users</h3>
          {[['Students','None'],['Teachers','2'],['TAs','3'],['Designers','None'],['Observers','None']].map(([role, count]) => (
            <div key={role} style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontFamily:'sans-serif', marginBottom:5 }}>
              <span style={{ color:C.text }}>{role}:</span>
              <span style={{ color:count==='None'?C.muted:C.primary, fontWeight:count!=='None'?600:400 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Sections: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const [sections, setSections] = useState(['Hybrid Day NATP','Weekend NATP']);
  const [newSec, setNewSec]     = useState('');
  return (
    <div style={{ maxWidth:600 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 20px' }}>Course Sections</h2>
      {sections.map(s => (
        <div key={s} style={{ padding:'12px 16px', border:`1px solid ${C.border}`, borderRadius:6, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.white }}>
          <span style={{ fontSize:14, fontFamily:'sans-serif', color:C.text }}>{s}</span>
          {canEdit && (
            <div style={{ display:'flex', gap:8 }}>
              <button style={{ padding:'4px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>Edit</button>
              <button onClick={() => setSections(p => p.filter(x => x !== s))}
                style={{ padding:'4px 10px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer', color:C.error }}>✕</button>
            </div>
          )}
        </div>
      ))}
      {canEdit && (
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <input value={newSec} onChange={e => setNewSec(e.target.value)} placeholder="New section name"
            style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', outline:'none' }}/>
          <button onClick={() => { if(newSec.trim()){ setSections(p=>[...p,newSec.trim()]); setNewSec(''); } }}
            style={{ padding:'8px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
            + Add Section
          </button>
        </div>
      )}
    </div>
  );
};

const Navigation: React.FC = () => {
  const navItems = [
    'Home','Announcements','Assignments','Discussions','Grades','People',
    'Pages','Files','Syllabus','Outcomes','Rubrics','Quizzes','Modules',
    'BigBlueButton','Collaborations','Attendance','New Analytics','Lucid (Whiteboard)','Settings',
  ];
  const [hidden, setHidden] = useState(['Outcomes','Rubrics','Collaborations']);
  return (
    <div style={{ maxWidth:600 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 8px' }}>Navigation</h2>
      <p style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', marginBottom:20 }}>Drag items to reorder them in the course navigation.</p>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
        {navItems.map((item, i) => (
          <div key={item} style={{ padding:'10px 16px', borderBottom:i<navItems.length-1?`1px solid ${C.border}`:'none', display:'flex', alignItems:'center', gap:12, opacity:hidden.includes(item)?0.4:1 }}>
            <span style={{ color:C.muted, cursor:'grab', fontSize:14 }}>⠿</span>
            <span style={{ flex:1, fontSize:13, fontFamily:'sans-serif', color:C.text }}>{item}</span>
            <button onClick={() => setHidden(p => p.includes(item) ? p.filter(x=>x!==item) : [...p, item])}
              style={{ fontSize:11, padding:'3px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, cursor:'pointer', color:hidden.includes(item)?C.primary:C.muted }}>
              {hidden.includes(item) ? 'Enable' : 'Disable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsTab: React.FC<{ courseId?: string }> = ({ courseId }) => {
  const { user } = useAuth();
  const canEdit = user?.canEdit ?? false;
  const [activeTab, setActiveTab] = useState<Tab>('Course Details');

  return (
    <div style={{ padding:24 }}>
      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:`2px solid ${C.border}`, marginBottom:28, gap:0, flexWrap:'wrap' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding:'10px 18px', border:'none', borderBottom:activeTab===tab?`3px solid ${C.primary}`:'3px solid transparent', background:'transparent', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', color:activeTab===tab?C.primary:C.muted, fontWeight:activeTab===tab?600:400, marginBottom:-2 }}>
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'Course Details' && <CourseDetails canEdit={canEdit} courseId={courseId}/>}

      {activeTab === 'Sections'       && <Sections canEdit={canEdit}/>}
      {activeTab === 'Navigation'     && <Navigation/>}
      {activeTab === 'Apps'           && <div style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif' }}>No external apps configured. Connect apps via LTI integration.</div>}
      {activeTab === 'Feature Options'&& <div style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif' }}>Feature flags and experimental options will appear here.</div>}
      {activeTab === 'Integrations'   && <div style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif' }}>Supabase, Zoom, and other integrations will be configured here.</div>}
    </div>
  );
};

export default SettingsTab;