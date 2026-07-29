// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from './AuthContext';
import { uploadViaXhr } from './uploadViaXhr';
import RichTextEditor, { sanitizeHtml } from '@/components/portal/RichTextEditor';
import ContentViewer, { type ContentSource } from '@/components/portal/ContentViewer';
import SaveStatus from '@/components/portal/SaveStatus';

const fileIcon = (t: string) => ({ pdf:'📄', pptx:'📊', ppt:'📊', docx:'📝', doc:'📝', mp4:'🎥', mov:'🎥', jpg:'🖼️', png:'🖼️', xlsx:'📈' }[(t||'').toLowerCase()] ?? '📎');

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Page { id: string; title: string; body_html: string; published: boolean; front_page: boolean; updated_at: string; position?: number; }
interface Props { courseId?: string; canEdit?: boolean; }

// Auto-linkify URLs/emails inside plain text bodies (e.g. Zoom/Meet links).
const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)\]'"])/gi;
const EMAIL_RE = /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/gi;
const renderBody = (raw: string) => {
  const body = raw || '';
  if (/<[a-z][\s\S]*>/i.test(body)) return sanitizeHtml(body);
  const escaped = body
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(URL_RE, (u) => {
      const href = u.startsWith('http') ? u : `https://${u}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#7B4DB5;text-decoration:underline;font-weight:600">${u}</a>`;
    })
    .replace(EMAIL_RE, (e) => `<a href="mailto:${e}" style="color:#7B4DB5;text-decoration:underline">${e}</a>`)
    .replace(/\n/g, '<br/>');
  return sanitizeHtml(escaped);
};

// Pull the first http(s) URL out of body_html so we can render an inline viewer.
const extractFileUrl = (html: string): { url: string; ext: string } | null => {
  if (!html) return null;
  const m = html.match(/https?:\/\/[^\s"'<>)]+/i);
  if (!m) return null;
  const url = m[0];
  // Strip query for ext detection
  const path = url.split('?')[0].split('#')[0];
  const extMatch = path.match(/\.([a-z0-9]{2,5})$/i);
  return { url, ext: (extMatch?.[1] || '').toLowerCase() };
};

const officeViewer = (url: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

const googleDocsViewer = (url: string) =>
  `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

// Smart-order: Video Conference Info first, then natural numeric title sort
// (Module 1, Module 2 … Module 10; PowerPoint 1 grouped after its Module N).
const parseNums = (t: string): number[] => {
  const nums: number[] = [];
  const re = /(\d+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) nums.push(parseFloat(m[1]));
  return nums;
};
const smartCompare = (a: Page, b: Page) => {
  const ta = (a.title || '').trim();
  const tb = (b.title || '').trim();
  const va = /^video\s*conference/i.test(ta) ? 0 : 1;
  const vb = /^video\s*conference/i.test(tb) ? 0 : 1;
  if (va !== vb) return va - vb;
  // Group by leading module number, then PowerPoint after Module of same N
  const kindRank = (t: string) => {
    if (/^power\s*point|^powerpoint|^ppt/i.test(t)) return 1;
    if (/^module/i.test(t)) return 0;
    return 2;
  };
  const na = parseNums(ta);
  const nb = parseNums(tb);
  const firstA = na[0] ?? Number.POSITIVE_INFINITY;
  const firstB = nb[0] ?? Number.POSITIVE_INFINITY;
  if (firstA !== firstB) return firstA - firstB;
  const ka = kindRank(ta), kb = kindRank(tb);
  if (ka !== kb) return ka - kb;
  // Compare remaining numeric segments naturally
  const len = Math.max(na.length, nb.length);
  for (let i = 1; i < len; i++) {
    const av = na[i] ?? -1, bv = nb[i] ?? -1;
    if (av !== bv) return av - bv;
  }
  return ta.localeCompare(tb, undefined, { numeric: true, sensitivity: 'base' });
};


const PagesTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const [pages,    setPages]    = useState<Page[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState({ title:'', body:'', published:false, front_page:false });
  const [saving,   setSaving]   = useState(false);
  const [savedAt,  setSavedAt]  = useState<number | null>(null);
  const [autoErr,  setAutoErr]  = useState<string | null>(null);
  const [dirty,    setDirty]    = useState(false);
  const [uploading,setUploading]= useState(false);
  const [upError,  setUpError]  = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [viewerFile, setViewerFile] = useState<{ src: ContentSource; name: string; type: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const skipAutoRef = useRef(true);

  const openInFullViewer = (url: string, name: string, ext: string) => {
    const raw = url.split('/course-files/')[1];
    const path = raw ? decodeURIComponent(raw.split('?')[0]) : null;
    setViewerFile({
      src: path ? { bucket: 'course-files', path } : { url },
      name,
      type: ext,
    });
  };

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('lms_pages')
      .select('*').eq('course_id', courseId)
      .order('position', { ascending: true })
      .order('updated_at', { ascending:false });
    if (data) setPages(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  // Cross-device sync: refresh when another session adds/edits/reorders.
  useEffect(() => {
    if (!courseId) return;
    const ch = supabase
      .channel(`lms_pages:${courseId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lms_pages', filter: `course_id=eq.${courseId}` }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [courseId]);

  const orderedPages = useMemo(() => [...pages].sort(smartCompare), [pages]);


  // Auto-select first page (Video Conference Info will be first after smart sort).
  useEffect(() => {
    if (orderedPages.length === 0) { setSelectedId(null); return; }
    if (!selectedId || !orderedPages.find(p => p.id === selectedId)) {
      setSelectedId(orderedPages[0].id);
    }
  }, [orderedPages, selectedId]);

  const selected = orderedPages.find(p => p.id === selectedId) || null;

  const savePage = async () => {
    if (!form.title.trim() || !courseId) return;
    setSaving(true);
    if (editing) {
      const { data } = await supabase.from('lms_pages')
        .update({ title:form.title, body_html:form.body, published:form.published, front_page:form.front_page, updated_at: new Date().toISOString() })
        .eq('id', editing.id).select().single();
      if (data) setPages(p => p.map(x => x.id === editing.id ? data : x));
    } else {
      const nextPos = (orderedPages[orderedPages.length - 1]?.position ?? orderedPages.length) + 10;
      const { data } = await supabase.from('lms_pages')
        .insert({ course_id:courseId, title:form.title, body_html:form.body, published:form.published, front_page:form.front_page, position: nextPos })
        .select().single();
      if (data) { setPages(p => [...p, data]); setSelectedId(data.id); }
    }
    setEditing(null); setCreating(false);
    setForm({ title:'', body:'', published:false, front_page:false });
    setSaving(false);
    setDirty(false);
    setSavedAt(Date.now());
  };

  // Debounced autosave — only for edits of an existing page.
  useEffect(() => {
    if (skipAutoRef.current) return;
    if (!editing || !form.title.trim()) return;
    setDirty(true);
    const t = setTimeout(async () => {
      setSaving(true);
      setAutoErr(null);
      const { data, error } = await supabase.from('lms_pages')
        .update({ title:form.title, body_html:form.body, published:form.published, front_page:form.front_page, updated_at: new Date().toISOString() })
        .eq('id', editing.id).select().single();
      setSaving(false);
      if (error) { setAutoErr('Autosave failed — will retry'); return; }
      if (data) setPages(p => p.map(x => x.id === editing.id ? data : x));
      setDirty(false);
      setSavedAt(Date.now());
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, form.body, form.published, form.front_page]);

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    setPages(p => p.filter(x => x.id !== id));
    await supabase.from('lms_pages').delete().eq('id', id);
  };

  const openEdit = (page: Page) => {
    skipAutoRef.current = true;
    setEditing(page);
    setForm({ title:page.title, body:page.body_html || '', published:page.published, front_page:page.front_page });
    setCreating(true);
    setDirty(false);
    setSavedAt(null);
    setAutoErr(null);
    // Allow autosave after the initial form state settles.
    setTimeout(() => { skipAutoRef.current = false; }, 300);
  };

  const togglePub = async (id: string, current: boolean) => {
    setPages(p => p.map(x => x.id === id ? { ...x, published: !current } : x));
    await supabase.from('lms_pages').update({ published: !current }).eq('id', id);
  };

  const persistOrder = async (list: Page[]) => {
    const updates = list.map((p, i) => ({ id: p.id, position: (i + 1) * 10 }));
    setPages(prev => prev.map(p => {
      const u = updates.find(x => x.id === p.id);
      return u ? { ...p, position: u.position } : p;
    }));
    await Promise.all(updates.map(u =>
      supabase.from('lms_pages').update({ position: u.position }).eq('id', u.id)
    ));
  };

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    const list = [...orderedPages];
    const from = list.findIndex(p => p.id === dragId);
    const to   = list.findIndex(p => p.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setDragId(null); setOverId(null);
    await persistOrder(list);
  };

  const smartSort = async () => {
    const list = [...pages].sort(smartCompare);
    await persistOrder(list);
  };

  const isEditorOpen = creating || editing !== null;

  // -- Viewer for the selected page --
  const renderViewer = (page: Page) => {
    const file = extractFileUrl(page.body_html);
    if (file) {
      const { url, ext } = file;
      const fileName = page.title + (ext ? `.${ext}` : '');
      const FullscreenBtn = (
        <button onClick={() => openInFullViewer(url, fileName, ext)}
          style={{ position:'absolute', top:10, right:10, zIndex:5, padding:'6px 12px', border:'none', borderRadius:5, background:'rgba(0,0,0,0.65)', color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
          ⛶ Fullscreen
        </button>
      );
      if (ext === 'pdf') {
        return <div style={{ position:'relative', width:'100%', height:'100%' }}>
          {FullscreenBtn}
          <iframe src={url} title={page.title} style={{ width:'100%', height:'100%', border:'none', background:'#525659' }}/>
        </div>;
      }
      if (['ppt','pptx','doc','docx','xls','xlsx'].includes(ext)) {
        return (
          <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', position:'relative' }}>
            {FullscreenBtn}
            <iframe src={officeViewer(url)} title={page.title} style={{ width:'100%', flex:1, border:'none' }}/>
            <div style={{ padding:'6px 10px', background:'#F8F6FC', borderTop:`1px solid ${C.border}`, fontSize:11, fontFamily:'sans-serif', color:C.muted, display:'flex', justifyContent:'space-between' }}>
              <span>Viewer not loading? <a href={googleDocsViewer(url)} target="_blank" rel="noopener noreferrer" style={{ color:C.primary, fontWeight:600 }}>Try Google viewer</a></span>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color:C.primary, fontWeight:600 }}>⬇ Download original</a>
            </div>
          </div>
        );
      }
      if (['png','jpg','jpeg','gif','webp','svg'].includes(ext)) {
        return <div style={{ position:'relative', width:'100%', height:'100%', overflow:'auto', background:'#222', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          {FullscreenBtn}
          <img src={url} alt={page.title} style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:6 }}/>
        </div>;
      }
      if (['mp4','mov','webm','m4v','ogg'].includes(ext)) {
        return <div style={{ position:'relative', width:'100%', height:'100%', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {FullscreenBtn}
          <video src={url} controls style={{ maxWidth:'100%', maxHeight:'100%' }}/>
        </div>;
      }
      if (['mp3','wav','m4a','aac','flac'].includes(ext)) {
        return <div style={{ position:'relative', width:'100%', height:'100%', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          {FullscreenBtn}
          <div style={{ background:'#2a2a2a', padding:24, borderRadius:10, minWidth:320 }}>
            <div style={{ color:'white', fontFamily:'sans-serif', fontSize:14, marginBottom:12, textAlign:'center' }}>🎵 {page.title}</div>
            <audio src={url} controls style={{ width:'100%' }}/>
          </div>
        </div>;
      }
      // Unknown type — offer fullscreen download card
      return <div style={{ position:'relative', width:'100%', height:'100%', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {FullscreenBtn}
        <div style={{ textAlign:'center', fontFamily:'sans-serif' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>📄</div>
          <div style={{ fontSize:14, color:C.text, marginBottom:12 }}>{page.title}</div>
          <a href={url} download target="_blank" rel="noreferrer" style={{ padding:'8px 18px', background:C.primary, color:'white', textDecoration:'none', borderRadius:5, fontSize:13, fontWeight:600 }}>⬇ Download</a>
        </div>
      </div>;
    }
    // Fallback: render HTML body (covers Video Conference info, custom-written pages).
    return (
      <div style={{ padding:'28px 32px', overflow:'auto', height:'100%' }}>
        <div className="prose max-w-none"
          style={{ fontFamily:'sans-serif', color:C.text, lineHeight:1.7, fontSize:15 }}
          dangerouslySetInnerHTML={{ __html: renderBody(page.body_html) }}/>
      </div>
    );
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Pages</h2>
        {canEdit && !isEditorOpen && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={smartSort} title="Order: Video Conference → Module 1 → PowerPoint 1 → Module 2 → PowerPoint 2 …"
              style={{ padding:'7px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              ↕ Smart Sort
            </button>
            <input ref={fileRef} type="file" style={{ display:'none' }} multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.mov,.webm,.m4v,.mp3,.wav,.m4a"
              onChange={async e => {
                const files = e.target.files; if (!files || !courseId) return;
                setUploading(true); setUpError('');
                const newPages: Page[] = [];
                let pos = (orderedPages[orderedPages.length - 1]?.position ?? orderedPages.length * 10) + 10;
                for (let i = 0; i < files.length; i++) {
                  const f = files[i];
                  const ext = (f.name.split('.').pop() ?? '').toLowerCase();
                  const path = `${courseId}/pages/${Date.now()}_${f.name}`;
                  const { error: upErr } = await uploadViaXhr('course-files', path, f);
                  if (upErr) { setUpError(`Failed: ${f.name} – ${upErr.message}`); continue; }
                  // course-files bucket is private — signed URL (1 year) is what Office Viewer / iframes need.
                  const { data: signed } = await supabase.storage.from('course-files').createSignedUrl(path, 60 * 60 * 24 * 365);
                  const url = signed?.signedUrl ?? '';
                  // Store the URL plainly; renderViewer picks the right inline viewer at display time.
                  const body = `<p>${fileIcon(ext)} <a href="${url}" target="_blank" rel="noopener" download>${f.name}</a> (${(f.size/1024).toFixed(0)} KB)</p>`;
                  const title = f.name.replace(/\.[^.]+$/, '');
                  const { data: row } = await supabase.from('lms_pages').insert({
                    course_id: courseId, title, body_html: body, published: true, front_page: false, position: pos,
                  }).select().single();
                  if (row) { newPages.push(row); pos += 10; }
                }
                setPages(p => [...p, ...newPages]);
                if (newPages[0]) setSelectedId(newPages[0].id);
                setUploading(false);
                if (fileRef.current) fileRef.current.value = '';
              }}/>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ padding:'7px 14px', border:`1px solid ${C.primary}`, borderRadius:5, background:C.white, color:C.primary, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600, opacity: uploading?0.7:1 }}>
              {uploading ? 'Uploading…' : '⬆ Upload Document'}
            </button>
            <button onClick={() => load()} title="Refresh from server"
              style={{ padding:'7px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              ⟳ Refresh
            </button>
            <button onClick={() => { setCreating(true); setEditing(null); setForm({ title:'', body:'', published:false, front_page:false }); }}
              style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              + New Page
            </button>
          </div>
        )}
      </div>
      {upError && <div style={{ background:'#FDEDED', color:C.error, padding:'8px 12px', borderRadius:5, fontSize:12, fontFamily:'sans-serif', marginBottom:12 }}>{upError}</div>}

      {/* Editor */}
      {isEditorOpen && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:8, padding:24, marginBottom:20 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:16, fontFamily:'sans-serif', color:C.text }}>
            {editing ? 'Edit Page' : 'New Page'}
          </h3>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Video Conference Info, Module 1, PowerPoint 1"
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:14, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Content</label>
            <RichTextEditor value={form.body} onChange={(html) => setForm(p => ({ ...p, body: html }))} minHeight={360} />
          </div>
          <div style={{ display:'flex', gap:20, marginBottom:18 }}>
            {[['published','Publish this page'],['front_page','Set as front page']].map(([key, label]) => (
              <label key={key} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
                <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} style={{ accentColor:C.primary }}/>
                {label}
              </label>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={savePage} disabled={saving}
              style={{ padding:'8px 20px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer', opacity:saving?.7:1 }}>
              {saving ? 'Saving…' : editing ? 'Update Page' : 'Create Page'}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null); }}
              style={{ padding:'8px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Split layout: drag-reorder list + always-on viewer */}
      {loading ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading pages…</div>
      ) : orderedPages.length === 0 && !isEditorOpen ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📄</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>No pages yet</div>
          {canEdit && <button onClick={() => setCreating(true)} style={{ padding:'8px 20px', border:'none', borderRadius:6, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', marginTop:8 }}>+ Create First Page</button>}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'minmax(260px, 320px) 1fr', gap:16, height:'calc(100vh - 240px)', minHeight:560 }}>
          {/* LEFT: drag-and-drop list */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'auto' }}>
            {canEdit && (
              <div style={{ padding:'8px 12px', borderBottom:`1px solid ${C.border}`, fontSize:11, color:C.muted, fontFamily:'sans-serif', background:'#FAF8FD' }}>
                Drag rows to reorder · Click to preview
              </div>
            )}
            {orderedPages.map((page, i) => {
              const isSel = page.id === selectedId;
              const isOver = overId === page.id && dragId && dragId !== page.id;
              return (
                <div key={page.id}
                  draggable={!!canEdit}
                  onDragStart={(e) => { setDragId(page.id); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { if (canEdit) { e.preventDefault(); setOverId(page.id); } }}
                  onDragLeave={() => { if (overId === page.id) setOverId(null); }}
                  onDrop={(e) => { e.preventDefault(); handleDrop(page.id); }}
                  onDragEnd={() => { setDragId(null); setOverId(null); }}
                  onClick={() => setSelectedId(page.id)}
                  style={{
                    padding:'10px 12px',
                    borderBottom: i < orderedPages.length-1 ? `1px solid ${C.border}` : 'none',
                    borderTop: isOver ? `2px solid ${C.primary}` : '2px solid transparent',
                    display:'flex', alignItems:'center', gap:8,
                    cursor: canEdit ? 'grab' : 'pointer',
                    background: isSel ? '#EDE8F7' : (dragId === page.id ? '#F8F6FC' : C.white),
                    opacity: dragId === page.id ? 0.5 : 1,
                    userSelect:'none',
                  }}>
                  {canEdit && <span style={{ color:C.muted, fontSize:14, cursor:'grab' }} title="Drag to reorder">⋮⋮</span>}
                  <span style={{ fontSize:11, color:C.muted, width:20, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{i + 1}.</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color: isSel ? C.primary : C.text, fontFamily:'sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {page.front_page && <span style={{ fontSize:9, background:'#EDE8F7', color:C.primary, padding:'1px 5px', borderRadius:20, marginRight:5, fontWeight:700 }}>FRONT</span>}
                      {page.title}
                    </div>
                    <div style={{ fontSize:10, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>
                      {new Date(page.updated_at).toLocaleDateString()}
                      {!page.published && <span style={{ color:C.error, marginLeft:6, fontWeight:600 }}>UNPUB</span>}
                    </div>
                  </div>
                  {canEdit && (
                    <div style={{ display:'flex', gap:4, alignItems:'center', flexShrink:0 }} onClick={e => e.stopPropagation()}>
                      <div onClick={() => togglePub(page.id, page.published)} title={page.published ? 'Published' : 'Unpublished'}
                        style={{ width:12, height:12, borderRadius:'50%', background: page.published ? C.success : C.border, cursor:'pointer' }}/>
                      <button onClick={() => openEdit(page)}
                        style={{ padding:'2px 8px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:10, cursor:'pointer', color:C.text }}>Edit</button>
                      <button onClick={() => deletePage(page.id)}
                        style={{ padding:'2px 6px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:10, cursor:'pointer', color:C.error }}>✕</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: always-on viewer */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            {selected ? (
              <>
                <div style={{ padding:'12px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, background:'#FAF8FD' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:10, color:C.muted, fontFamily:'sans-serif', textTransform:'uppercase', letterSpacing:0.5, fontWeight:700 }}>
                      Preview · {(orderedPages.findIndex(p => p.id === selected.id) + 1)} of {orderedPages.length}
                    </div>
                    <div style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {selected.title}
                    </div>
                  </div>
                  <button onClick={() => {
                    const idx = orderedPages.findIndex(p => p.id === selected.id);
                    if (idx > 0) setSelectedId(orderedPages[idx - 1].id);
                  }} disabled={orderedPages[0]?.id === selected.id}
                    style={{ padding:'6px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor: orderedPages[0]?.id === selected.id ? 'not-allowed' : 'pointer', color:C.text, opacity: orderedPages[0]?.id === selected.id ? 0.4 : 1, fontWeight:600 }}>
                    ← Prev
                  </button>
                  <button onClick={() => {
                    const idx = orderedPages.findIndex(p => p.id === selected.id);
                    if (idx < orderedPages.length - 1) setSelectedId(orderedPages[idx + 1].id);
                  }} disabled={orderedPages[orderedPages.length-1]?.id === selected.id}
                    style={{ padding:'6px 12px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:12, fontFamily:'sans-serif', cursor: orderedPages[orderedPages.length-1]?.id === selected.id ? 'not-allowed' : 'pointer', opacity: orderedPages[orderedPages.length-1]?.id === selected.id ? 0.4 : 1, fontWeight:600 }}>
                    Next →
                  </button>
                </div>
                <div style={{ flex:1, minHeight:0, background:'#fff' }}>
                  {renderViewer(selected)}
                </div>
              </>
            ) : (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontFamily:'sans-serif' }}>
                Select a page on the left to preview
              </div>
            )}
          </div>
        </div>
      )}
      <ContentViewer
        open={!!viewerFile}
        onClose={() => setViewerFile(null)}
        source={viewerFile?.src ?? null}
        fileName={viewerFile?.name}
        fileType={viewerFile?.type}
      />
    </div>
  );
};

export default PagesTab;
