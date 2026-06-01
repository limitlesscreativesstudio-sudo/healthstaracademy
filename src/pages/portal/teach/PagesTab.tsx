import React, { useState, useEffect } from 'react';
import { supabase } from './AuthContext';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Page { id: string; title: string; body: string; published: boolean; front_page: boolean; updated_at: string; }
interface Props { courseId?: string; canEdit?: boolean; }

const PagesTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const [pages,    setPages]    = useState<Page[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState({ title:'', body:'', published:false, front_page:false });
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('pages')
      .select('*').eq('course_id', courseId).order('updated_at', { ascending:false });
    if (data) setPages(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const savePage = async () => {
    if (!form.title.trim() || !courseId) return;
    setSaving(true);
    if (editing) {
      const { data } = await supabase.from('pages')
        .update({ title:form.title, body:form.body, published:form.published, front_page:form.front_page, updated_at: new Date().toISOString() })
        .eq('id', editing.id).select().single();
      if (data) setPages(p => p.map(x => x.id === editing.id ? data : x));
    } else {
      const { data } = await supabase.from('pages')
        .insert({ course_id:courseId, title:form.title, body:form.body, published:form.published, front_page:form.front_page })
        .select().single();
      if (data) setPages(p => [data, ...p]);
    }
    setEditing(null); setCreating(false);
    setForm({ title:'', body:'', published:false, front_page:false });
    setSaving(false);
  };

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    setPages(p => p.filter(x => x.id !== id));
    await supabase.from('pages').delete().eq('id', id);
  };

  const openEdit = (page: Page) => {
    setEditing(page);
    setForm({ title:page.title, body:page.body || '', published:page.published, front_page:page.front_page });
    setCreating(true);
  };

  const togglePub = async (id: string, current: boolean) => {
    setPages(p => p.map(x => x.id === id ? { ...x, published: !current } : x));
    await supabase.from('pages').update({ published: !current }).eq('id', id);
  };

  const isEditorOpen = creating || editing !== null;

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Pages</h2>
        {canEdit && !isEditorOpen && (
          <button onClick={() => { setCreating(true); setEditing(null); setForm({ title:'', body:'', published:false, front_page:false }); }}
            style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
            + New Page
          </button>
        )}
      </div>

      {/* Editor */}
      {isEditorOpen && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:8, padding:24, marginBottom:20 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:16, fontFamily:'sans-serif', color:C.text }}>
            {editing ? 'Edit Page' : 'New Page'}
          </h3>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Video Conference Info"
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:14, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Content</label>
            <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              rows={10} placeholder="Write page content here…"
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'10px 12px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', resize:'vertical', outline:'none', lineHeight:1.7 }}/>
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
      ) : pages.length === 0 && !isEditorOpen ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📄</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>No pages yet</div>
          {canEdit && <button onClick={() => setCreating(true)} style={{ padding:'8px 20px', border:'none', borderRadius:6, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', marginTop:8 }}>+ Create First Page</button>}
        </div>
      ) : (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
          {pages.map((page, i) => (
            <div key={page.id} style={{ padding:'13px 16px', borderBottom: i < pages.length-1 ? `1px solid ${C.border}` : 'none',
              display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fc'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
              <span style={{ fontSize:18 }}>📄</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>
                  {page.front_page && <span style={{ fontSize:10, background:'#EDE8F7', color:C.primary, padding:'1px 6px', borderRadius:20, marginRight:6, fontWeight:700 }}>Front Page</span>}
                  {page.title}
                </div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>
                  Updated {new Date(page.updated_at).toLocaleDateString()}
                  {!page.published && <span style={{ color:C.error, marginLeft:8, fontWeight:600 }}>UNPUBLISHED</span>}
                </div>
              </div>
              {canEdit && (
                <div style={{ display:'flex', gap:6 }}>
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
    </div>
  );
};

export default PagesTab;
