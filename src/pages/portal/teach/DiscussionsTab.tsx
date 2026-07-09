// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase, useAuth } from './AuthContext';
import { toast } from 'sonner';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', error:'#C0392B' } as const;

interface Discussion { id:string; title:string; body:string|null; author_id:string; created_at:string; author_name?:string; reply_count?:number; last_activity?:string; }
interface Reply { id:string; body:string; author_id:string; created_at:string; author_name?:string; }

interface Props { courseId?: string; canEdit?: boolean; }

const DiscussionsTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [nf, setNf] = useState({ title:'', body:'' });

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data: d } = await supabase.from('discussions')
      .select('id,title,body,author_id,created_at')
      .eq('course_id', courseId).order('created_at',{ ascending:false });
    const ds = d ?? [];
    // reply counts
    const ids = ds.map(x => x.id);
    let counts: Record<string, { n:number; last:string }> = {};
    let names: Record<string, string> = {};
    if (ids.length) {
      const { data: r } = await supabase.from('discussion_replies')
        .select('discussion_id,created_at').in('discussion_id', ids);
      (r ?? []).forEach(row => {
        const c = counts[row.discussion_id] ?? { n:0, last:'' };
        c.n += 1; if (row.created_at > c.last) c.last = row.created_at;
        counts[row.discussion_id] = c;
      });
    }
    const authorIds = [...new Set(ds.map(x => x.author_id))];
    if (authorIds.length) {
      const { data: p } = await supabase.from('profiles').select('user_id,full_name').in('user_id', authorIds);
      (p ?? []).forEach(pr => { names[pr.user_id] = pr.full_name; });
    }
    setItems(ds.map(x => ({
      ...x,
      author_name: names[x.author_id] || 'User',
      reply_count: counts[x.id]?.n || 0,
      last_activity: counts[x.id]?.last || x.created_at,
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const openThread = async (d: Discussion) => {
    setOpen(d);
    const { data } = await supabase.from('discussion_replies')
      .select('id,body,author_id,created_at').eq('discussion_id', d.id)
      .order('created_at', { ascending:true });
    const authorIds = [...new Set((data ?? []).map(r => r.author_id))];
    let names: Record<string,string> = {};
    if (authorIds.length) {
      const { data: p } = await supabase.from('profiles').select('user_id,full_name').in('user_id', authorIds);
      (p ?? []).forEach(pr => { names[pr.user_id] = pr.full_name; });
    }
    setReplies((data ?? []).map(r => ({ ...r, author_name: names[r.author_id] || 'User' })));
  };

  const postReply = async () => {
    if (!open || !replyBody.trim() || !user?.id) return;
    const { data, error } = await supabase.from('discussion_replies')
      .insert({ discussion_id: open.id, author_id: user.id, body: replyBody.trim() })
      .select().single();
    if (error) return toast.error('Could not post reply');
    setReplies(p => [...p, { ...data, author_name: user.name || 'You' }]);
    setReplyBody('');
    toast.success('Reply posted');
  };

  const createTopic = async () => {
    if (!nf.title.trim() || !courseId || !user?.id) return;
    const { data, error } = await supabase.from('discussions')
      .insert({ course_id: courseId, author_id: user.id, title: nf.title.trim(), body: nf.body.trim() || null })
      .select().single();
    if (error) return toast.error('Could not create discussion');
    setItems(p => [{ ...data, author_name: user.name || 'You', reply_count: 0, last_activity: data.created_at }, ...p]);
    setShowNew(false); setNf({ title:'', body:'' });
    toast.success('Discussion created');
  };

  const del = async (id: string) => {
    if (!confirm('Delete this discussion?')) return;
    const { error } = await supabase.from('discussions').delete().eq('id', id);
    if (error) return toast.error('Could not delete');
    setItems(p => p.filter(x => x.id !== id));
    if (open?.id === id) setOpen(null);
    toast.success('Deleted');
  };

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Select a course first.</div>;
  if (loading) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading discussions…</div>;

  // Thread view
  if (open) {
    return (
      <div style={{ padding:24, maxWidth:820, margin:'0 auto' }}>
        <button onClick={() => setOpen(null)} style={{ background:'none', border:'none', color:C.primary, fontSize:13, cursor:'pointer', marginBottom:14, fontFamily:'sans-serif' }}>← Back to discussions</button>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:22, marginBottom:16 }}>
          <h2 style={{ margin:'0 0 6px', fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{open.title}</h2>
          <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginBottom:12 }}>
            {open.author_name} • {new Date(open.created_at).toLocaleString()}
          </div>
          {open.body && <p style={{ margin:0, fontSize:14, color:C.text, fontFamily:'sans-serif', lineHeight:1.65, whiteSpace:'pre-wrap' }}>{open.body}</p>}
        </div>

        <div style={{ marginBottom:8, fontSize:13, color:C.muted, fontFamily:'sans-serif', fontWeight:600 }}>{replies.length} {replies.length===1?'reply':'replies'}</div>
        {replies.map(r => (
          <div key={r.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:14, marginBottom:8 }}>
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginBottom:6 }}>
              <strong style={{ color:C.primary }}>{r.author_name}</strong> • {new Date(r.created_at).toLocaleString()}
            </div>
            <div style={{ fontSize:13, color:C.text, fontFamily:'sans-serif', whiteSpace:'pre-wrap', lineHeight:1.6 }}>{r.body}</div>
          </div>
        ))}

        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:14, marginTop:12 }}>
          <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} placeholder="Write a reply…" rows={3}
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }}/>
          <div style={{ marginTop:8, textAlign:'right' }}>
            <button onClick={postReply} disabled={!replyBody.trim()} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', opacity:replyBody.trim()?1:.5 }}>Post Reply</button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Discussions</h2>
        <button onClick={() => setShowNew(v => !v)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ Discussion</button>
      </div>

      {showNew && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:20, marginBottom:16 }}>
          <input value={nf.title} onChange={e => setNf(p => ({ ...p, title:e.target.value }))} placeholder="Topic title *"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:14, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none', marginBottom:10 }}/>
          <textarea value={nf.body} onChange={e => setNf(p => ({ ...p, body:e.target.value }))} rows={4} placeholder="Description…"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }}/>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={createTopic} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Post</button>
            <button onClick={() => setShowNew(false)} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}`, color:C.muted, fontFamily:'sans-serif' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
          No discussions yet. Start one above.
        </div>
      ) : items.map(d => (
        <div key={d.id} onClick={() => openThread(d)}
          style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:16, marginBottom:8, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fd'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
          <span style={{ fontSize:22 }}>💬</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>{d.title}</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginTop:3 }}>
              by {d.author_name} • {d.reply_count} {d.reply_count===1?'reply':'replies'} • last activity {new Date(d.last_activity!).toLocaleDateString()}
            </div>
          </div>
          {(canEdit || d.author_id === user?.id) && (
            <button onClick={e => { e.stopPropagation(); del(d.id); }}
              style={{ padding:'4px 10px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, color:C.error, cursor:'pointer' }}>✕</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DiscussionsTab;
