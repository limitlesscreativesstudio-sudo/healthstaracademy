import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B' } as const;

interface Page { id:number; title:string; body:string; published:boolean; frontPage:boolean; updatedAt:string; }

const INIT_PAGES: Page[] = [
  { id:1, title:'Course Home', body:'Welcome to Health Star Academy\'s CNA Hybrid Day NATP program! This page contains your course overview, schedule, and important announcements.\n\n**Program Schedule:** Monday–Friday, 6AM–4PM\n**Total Hours:** 160 Theory + 100 Clinical\n\nPlease read through the Student Handbook and complete the acknowledgment form before Day 2.', published:true, frontPage:true, updatedAt:'May 20' },
  { id:2, title:'How to Join Live Lecture via Zoom', body:'All live theory sessions are conducted via Zoom.\n\n1. Click the Zoom link in your Day 1 module\n2. Use your full legal name as your display name\n3. Keep your camera ON at all times\n4. Mute your microphone when not speaking\n\nZoom Link: [Posted in Video Conference Info module]', published:true, frontPage:false, updatedAt:'Jan 15' },
  { id:3, title:'Student Handbook Policies', body:'This page summarizes key policies from the HSA Student Handbook.\n\n**Attendance:** Students must maintain ≥90% attendance per CDPH regulations.\n**Dress Code:** Solid-color scrubs and closed-toe shoes required for clinical.\n**Academic Integrity:** Any form of cheating will result in immediate dismissal.', published:true, frontPage:false, updatedAt:'Jan 15' },
  { id:4, title:'State Exam Information', body:'The CDPH CNA State Certification Exam consists of:\n- Written Knowledge Test (70 questions)\n- Manual Skills Test (3 randomly selected skills)\n\n**Passing Score:** 70% written, Pass all selected skills\n**Scheduling:** Via Prometric — your instructor will provide authorization codes.', published:true, frontPage:false, updatedAt:'Feb 5' },
  { id:5, title:'Video Conference Info', body:'Meeting ID: 537 940 2049\nhttps://us06web.zoom.us/j/5379402049?pwd=UfHHksbmC0bg7ZQZu0aZB0LBtSWfh2.1\n\nYou will be lectured on the following content in our live lecture. Content in this section is meant to help reinforce what you have learned and serves as homework.\n\nPlease see the curriculum modules below to understand today\'s topics of learning. You can also consult the corresponding module in your textbook.', published:true, frontPage:false, updatedAt:'Jan 15' },
];

const PagesTab: React.FC = () => {
  const [pages, setPages] = useState<Page[]>(INIT_PAGES);
  const [editing, setEditing] = useState<Page|null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<Page>>({});

  const startEdit = (p: Page) => { setEditing(p); setDraft({ ...p }); setCreating(false); };
  const startCreate = () => { setCreating(true); setEditing(null); setDraft({ title:'', body:'', published:false, frontPage:false }); };

  const save = () => {
    if (!draft.title?.trim()) return;
    if (creating) {
      setPages(prev => [...prev, { id:Date.now(), title:draft.title!, body:draft.body??'', published:draft.published??false, frontPage:draft.frontPage??false, updatedAt:'Today' }]);
    } else if (editing) {
      setPages(prev => prev.map(p => p.id === editing.id ? { ...p, ...draft, updatedAt:'Today' } : p));
    }
    setEditing(null); setCreating(false); setDraft({});
  };

  const togglePub = (id:number) => setPages(prev => prev.map(p => p.id === id ? { ...p, published:!p.published } : p));
  const deletePage = (id:number) => setPages(prev => prev.filter(p => p.id !== id));

  if (editing || creating) {
    return (
      <div style={{ padding:24, maxWidth:800, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{creating ? 'New Page' : `Edit: ${editing?.title}`}</h2>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { setEditing(null); setCreating(false); }} style={{ padding:'7px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
            <button onClick={save} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Save Page</button>
          </div>
        </div>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:24 }}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Page Title *</label>
            <input value={draft.title??''} onChange={e => setDraft(p => ({ ...p, title:e.target.value }))}
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'9px 12px', fontSize:15, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Content</label>
            <textarea value={draft.body??''} onChange={e => setDraft(p => ({ ...p, body:e.target.value }))} rows={16}
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:13, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', resize:'vertical', lineHeight:1.7 }}/>
          </div>
          <div style={{ display:'flex', gap:20 }}>
            {[['published','Publish this page'],['frontPage','Set as Front Page']].map(([k,l]) => (
              <label key={k} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontFamily:'sans-serif', color:C.text, cursor:'pointer' }}>
                <input type="checkbox" checked={!!(draft as any)[k]} onChange={e => setDraft(p => ({ ...p, [k]:e.target.checked }))} style={{ accentColor:C.primary }}/>
                {l}
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Pages</h2>
        <button onClick={startCreate} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ New Page</button>
      </div>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
        {pages.map((p, i) => (
          <div key={p.id} style={{ padding:'13px 16px', borderBottom: i < pages.length - 1 ? `1px solid ${C.border}` : 'none', display:'flex', alignItems:'center', gap:12 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fc'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                <span style={{ fontSize:14, fontWeight:600, color:C.primary, fontFamily:'sans-serif', cursor:'pointer' }} onClick={() => startEdit(p)}>{p.title}</span>
                {p.frontPage && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'#EDE8F7', color:C.primary, fontFamily:'sans-serif', fontWeight:600 }}>Front Page</span>}
                {!p.published && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:C.bg, color:C.muted, fontFamily:'sans-serif' }}>Unpublished</span>}
              </div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>Updated {p.updatedAt}</div>
            </div>
            <button onClick={() => togglePub(p.id)}
              style={{ padding:'5px 12px', border:`1px solid ${p.published ? C.success : C.border}`, borderRadius:5, background:C.white, fontSize:12, color:p.published ? C.success : C.muted, fontFamily:'sans-serif', cursor:'pointer' }}>
              {p.published ? '● Published' : '○ Unpublished'}
            </button>
            <button onClick={() => startEdit(p)} style={{ padding:'5px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor:'pointer', color:C.text }}>Edit</button>
            <button onClick={() => deletePage(p.id)} style={{ padding:'5px 10px', border:`1px solid ${C.error}33`, borderRadius:5, background:C.white, fontSize:12, cursor:'pointer', color:C.error }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesTab;
