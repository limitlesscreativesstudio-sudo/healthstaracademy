// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from './AuthContext';
import RichTextEditor, { sanitizeHtml } from '@/components/portal/RichTextEditor';

const fileIcon = (t: string) => ({ pdf:'📄', pptx:'📊', ppt:'📊', docx:'📝', doc:'📝', mp4:'🎥', mov:'🎥', jpg:'🖼️', png:'🖼️', xlsx:'📈' }[(t||'').toLowerCase()] ?? '📎');

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Page { id: string; title: string; body_html: string; published: boolean; front_page: boolean; updated_at: string; position?: number; }
interface Props { courseId?: string; canEdit?: boolean; }

// Auto-linkify URLs/emails inside plain text bodies so things like
// the Video Conference page render its Zoom/Meet link as a real link.
const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)\]'"])/gi;
const EMAIL_RE = /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/gi;
const renderBody = (raw: string) => {
  const body = raw || '';
  // If it already looks like HTML, sanitize and trust it.
  if (/<[a-z][\s\S]*>/i.test(body)) return sanitizeHtml(body);
  // Otherwise: escape, linkify, preserve newlines.
  const escaped = body
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(URL_RE, (u) => {
      const href = u.startsWith('http') ? u : `https://${u}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#7B4DB5;text-decoration:underline">${u}</a>`;
    })
    .replace(EMAIL_RE, (e) => `<a href="mailto:${e}" style="color:#7B4DB5;text-decoration:underline">${e}</a>`)
    .replace(/\n/g, '<br/>');
  return sanitizeHtml(escaped);
};

// Smart-order: Video Conference Info first, then Module N → PowerPoint N → Module N+1 …
// Falls back to manual `position`, then alphabetical title for anything outside the pattern.
const smartCompare = (a: Page, b: Page) => {
  const score = (p: Page): [number, number, number, string] => {
    const t = (p.title || '').trim();
    if (/^video\s*conference/i.test(t)) return [0, 0, 0, t];
    const m = t.match(/^(module|power\s*point|powerpoint|ppt)\s*(\d+)/i);
    if (m) {
      const isPpt = /^p/i.test(m[1]);
      return [1, parseInt(m[2], 10), isPpt ? 1 : 0, t];
    }
    return [2, p.position ?? 9999, 0, t];
  };
  const sa = score(a), sb = score(b);
  for (let i = 0; i < 3; i++) if (sa[i] !== sb[i]) return (sa[i] as number) - (sb[i] as number);
  return (sa[3] as string).localeCompare(sb[3] as string);
};

const PagesTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const [pages,    setPages]    = useState<Page[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState({ title:'', body:'', published:false, front_page:false });
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);
  const [upError,  setUpError]  = useState('');
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  // Display order: position first; if everything is 0 use smart sort.
  const orderedPages = useMemo(() => {
    const all = [...pages];
    const allZero = all.every(p => !p.position);
    if (allZero) return all.sort(smartCompare);
    return all.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [pages]);

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
      if (data) setPages(p => [...p, data]);
    }
    setEditing(null); setCreating(false);
    setForm({ title:'', body:'', published:false, front_page:false });
    setSaving(false);
  };

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    setPages(p => p.filter(x => x.id !== id));
    await supabase.from('lms_pages').delete().eq('id', id);
  };

  const openEdit = (page: Page) => {
    setEditing(page);
    setForm({ title:page.title, body:page.body_html || '', published:page.published, front_page:page.front_page });
    setCreating(true);
  };

  const togglePub = async (id: string, current: boolean) => {
    setPages(p => p.map(x => x.id === id ? { ...x, published: !current } : x));
    await supabase.from('lms_pages').update({ published: !current }).eq('id', id);
  };

  // Persist a new ordering (10, 20, 30…) so future loads keep it.
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

  const movePage = async (id: string, dir: -1 | 1) => {
    const list = [...orderedPages];
    const i = list.findIndex(p => p.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    await persistOrder(list);
  };

  const smartSort = async () => {
    const list = [...pages].sort(smartCompare);
    await persistOrder(list);
  };

  const isEditorOpen = creating || editing !== null;

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:8 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Pages</h2>
        {canEdit && !isEditorOpen && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={smartSort} title="Order: Video Conference → Module 1 → PowerPoint 1 → Module 2 → PowerPoint 2 …"
              style={{ padding:'7px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              ↕ Smart Sort
            </button>
            <input ref={fileRef} type="file" style={{ display:'none' }} multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.mp4,.mov"
              onChange={async e => {
                const files = e.target.files; if (!files || !courseId) return;
                setUploading(true); setUpError('');
                const newPages: Page[] = [];
                let pos = (orderedPages[orderedPages.length - 1]?.position ?? orderedPages.length * 10) + 10;
                for (let i = 0; i < files.length; i++) {
                  const f = files[i];
                  const ext = f.name.split('.').pop() ?? '';
                  const path = `${courseId}/pages/${Date.now()}_${f.name}`;
                  const { error: upErr } = await supabase.storage.from('course-files').upload(path, f);
                  if (upErr) { setUpError(`Failed: ${f.name} – ${upErr.message}`); continue; }
                  const { data: { publicUrl } } = supabase.storage.from('course-files').getPublicUrl(path);
                  const isPdf = ext.toLowerCase() === 'pdf';
                  const isImg = ['png','jpg','jpeg','gif','webp'].includes(ext.toLowerCase());
                  const body = isPdf
                    ? `<iframe src="${publicUrl}" style="width:100%;height:800px;border:1px solid #ccc;border-radius:6px"></iframe><p><a href="${publicUrl}" target="_blank" rel="noopener">Open ${f.name} in new tab</a></p>`
                    : isImg
                    ? `<img src="${publicUrl}" alt="${f.name}" style="max-width:100%;height:auto;border-radius:6px"/>`
                    : `<p>${fileIcon(ext)} <a href="${publicUrl}" target="_blank" rel="noopener" download>${f.name}</a> (${(f.size/1024).toFixed(0)} KB)</p>`;
                  const title = f.name.replace(/\.[^.]+$/, '');
                  const { data: row } = await supabase.from('lms_pages').insert({
                    course_id: courseId, title, body_html: body, published: true, front_page: false, position: pos,
                  }).select().single();
                  if (row) { newPages.push(row); pos += 10; }
                }
                setPages(p => [...p, ...newPages]);
                setUploading(false);
                if (fileRef.current) fileRef.current.value = '';
              }}/>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ padding:'7px 14px', border:`1px solid ${C.primary}`, borderRadius:5, background:C.white, color:C.primary, fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600, opacity: uploading?0.7:1 }}>
              {uploading ? 'Uploading…' : '⬆ Upload Document'}
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

      {/* Pages list */}
      {loading ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading pages…</div>
      ) : orderedPages.length === 0 && !isEditorOpen ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📄</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>No pages yet</div>
          {canEdit && <button onClick={() => setCreating(true)} style={{ padding:'8px 20px', border:'none', borderRadius:6, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', marginTop:8 }}>+ Create First Page</button>}
        </div>
      ) : (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
          {orderedPages.map((page, i) => (
            <div key={page.id} style={{ padding:'13px 16px', borderBottom: i < orderedPages.length-1 ? `1px solid ${C.border}` : 'none',
              display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:11, color:C.muted, width:22, textAlign:'right', fontFamily:'monospace' }}>{i + 1}.</span>
              <span style={{ fontSize:18 }}>📄</span>
              <div style={{ flex:1, cursor:'pointer' }} onClick={() => setPreviewIdx(i)}>
                <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>
                  {page.front_page && <span style={{ fontSize:10, background:'#EDE8F7', color:C.primary, padding:'1px 6px', borderRadius:20, marginRight:6, fontWeight:700 }}>Front Page</span>}
                  {page.title}
                </div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>
                  Click to preview · Updated {new Date(page.updated_at).toLocaleDateString()}
                  {!page.published && <span style={{ color:C.error, marginLeft:8, fontWeight:600 }}>UNPUBLISHED</span>}
                </div>
              </div>
              {canEdit && (
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <button onClick={() => movePage(page.id, -1)} disabled={i===0} title="Move up"
                    style={{ padding:'2px 8px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor: i===0?'not-allowed':'pointer', color:C.text, opacity: i===0?0.4:1 }}>↑</button>
                  <button onClick={() => movePage(page.id, 1)} disabled={i===orderedPages.length-1} title="Move down"
                    style={{ padding:'2px 8px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor: i===orderedPages.length-1?'not-allowed':'pointer', color:C.text, opacity: i===orderedPages.length-1?0.4:1 }}>↓</button>
                  <div onClick={() => togglePub(page.id, page.published)} title={page.published ? 'Published' : 'Unpublished'}
                    style={{ width:16, height:16, borderRadius:'50%', background: page.published ? C.success : C.border, cursor:'pointer', flexShrink:0 }}/>
                  <button onClick={() => openEdit(page)}
                    style={{ padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.text }}>Edit</button>
                  <button onClick={() => deletePage(page.id)}
                    style={{ padding:'4px 8px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.error }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview modal with prev/next slide navigation */}
      {previewIdx !== null && orderedPages[previewIdx] && (
        <div onClick={() => setPreviewIdx(null)}
          style={{ position:'fixed', inset:0, background:'rgba(20,12,40,0.72)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:C.white, borderRadius:10, width:'min(960px, 100%)', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>Slide {previewIdx + 1} of {orderedPages.length}</div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {orderedPages[previewIdx].title}
                </div>
              </div>
              <button onClick={() => setPreviewIdx(null)} title="Close"
                style={{ width:32, height:32, border:`1px solid ${C.border}`, borderRadius:6, background:C.white, fontSize:16, cursor:'pointer', color:C.text }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px', overflow:'auto', flex:1 }}>
              <div className="prose max-w-none"
                style={{ fontFamily:'sans-serif', color:C.text, lineHeight:1.7 }}
                dangerouslySetInnerHTML={{ __html: renderBody(orderedPages[previewIdx].body_html) }}/>
            </div>
            <div style={{ padding:'12px 18px', borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <button onClick={() => setPreviewIdx(i => (i! > 0 ? i! - 1 : i))} disabled={previewIdx === 0}
                style={{ padding:'8px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor: previewIdx === 0 ? 'not-allowed' : 'pointer', color:C.text, opacity: previewIdx === 0 ? 0.4 : 1, fontWeight:600 }}>
                ← Previous
              </button>
              <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>
                {orderedPages.map((_, i) => (
                  <span key={i} onClick={() => setPreviewIdx(i)}
                    style={{ display:'inline-block', width:8, height:8, margin:'0 3px', borderRadius:'50%', cursor:'pointer',
                      background: i === previewIdx ? C.primary : C.border }}/>
                ))}
              </div>
              <button onClick={() => setPreviewIdx(i => (i! < orderedPages.length - 1 ? i! + 1 : i))} disabled={previewIdx === orderedPages.length - 1}
                style={{ padding:'8px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor: previewIdx === orderedPages.length - 1 ? 'not-allowed' : 'pointer', opacity: previewIdx === orderedPages.length - 1 ? 0.4 : 1, fontWeight:600 }}>
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesTab;
