// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { supabase, useAuth } from './AuthContext';
import { toast } from 'sonner';
import InlineTitle from '@/components/portal/InlineTitle';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', error:'#C0392B', success:'#127A1B' } as const;

interface Discussion { id:string; title:string; body:string|null; author_id:string; created_at:string; pinned?:boolean; locked?:boolean; author_name?:string; reply_count?:number; last_activity?:string; }
interface Reply { id:string; body:string; author_id:string; created_at:string; parent_reply_id?:string|null; author_name?:string; }
interface AuditEntry { id:string; action:string; actor_email:string|null; created_at:string; snapshot:any; reply_id:string|null; }

interface Props { courseId?: string; canEdit?: boolean; }

// ── Confirmation dialog ──────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{ open: boolean; title: string; body: string; onCancel: () => void; onConfirm: () => void; }> = ({ open, title, body, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:8, padding:22, minWidth:340, maxWidth:440, borderTop:`4px solid ${C.error}` }}>
        <h3 style={{ margin:'0 0 8px', color:C.text, fontFamily:'sans-serif', fontSize:16 }}>{title}</h3>
        <p style={{ margin:'0 0 16px', color:C.muted, fontFamily:'sans-serif', fontSize:13, lineHeight:1.55 }}>{body}</p>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, color:C.text, cursor:'pointer', fontSize:13, fontFamily:'sans-serif' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.error, color:'white', cursor:'pointer', fontSize:13, fontFamily:'sans-serif' }}>Delete</button>
        </div>
      </div>
    </div>
  );
};

const DiscussionsTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [replyTo, setReplyTo] = useState<Reply | null>(null); // nested reply target
  const [showNew, setShowNew] = useState(false);
  const [nf, setNf] = useState({ title:'', body:'' });
  const [confirm, setConfirm] = useState<{ title: string; body: string; onConfirm: () => void } | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data: d } = await supabase.from('discussions')
      .select('id,title,body,author_id,created_at,pinned,locked')
      .eq('course_id', courseId).order('created_at',{ ascending:false });
    const ds = d ?? [];
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
    setReplyTo(null);
    const { data } = await supabase.from('discussion_replies')
      .select('id,body,author_id,created_at,parent_reply_id').eq('discussion_id', d.id)
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
      .insert({ discussion_id: open.id, author_id: user.id, body: replyBody.trim(), parent_reply_id: replyTo?.id ?? null })
      .select().single();
    if (error) return toast.error('Could not post reply');
    setReplies(p => [...p, { ...data, author_name: user.name || 'You' }]);
    setReplyBody('');
    setReplyTo(null);
    toast.success('Reply posted');
  };

  const doDeleteReply = async (id: string) => {
    const { error } = await supabase.from('discussion_replies').delete().eq('id', id);
    if (error) return toast.error('Could not delete reply');
    setReplies(p => p.filter(r => r.id !== id && r.parent_reply_id !== id));
    toast.success('Reply deleted');
  };

  const askDeleteReply = (r: Reply) => setConfirm({
    title: 'Delete this reply?',
    body: `This will remove the reply${replies.some(x => x.parent_reply_id === r.id) ? ' and any nested replies to it' : ''}. The deletion is recorded in the activity log with your name and the current time.`,
    onConfirm: () => { doDeleteReply(r.id); setConfirm(null); },
  });

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

  const doDeleteDiscussion = async (id: string) => {
    const { error } = await supabase.from('discussions').delete().eq('id', id);
    if (error) return toast.error('Could not delete');
    setItems(p => p.filter(x => x.id !== id));
    if (open?.id === id) setOpen(null);
    toast.success('Discussion deleted');
  };

  const askDeleteDiscussion = (d: Discussion) => setConfirm({
    title: `Delete "${d.title}"?`,
    body: `This removes the discussion and all replies. The action is recorded in the activity log with your name and the current time.`,
    onConfirm: () => { doDeleteDiscussion(d.id); setConfirm(null); },
  });

  const togglePin = async (d: Discussion) => {
    const { error } = await supabase.from('discussions').update({ pinned: !d.pinned }).eq('id', d.id);
    if (error) return toast.error('Could not update');
    setItems(p => p.map(x => x.id === d.id ? { ...x, pinned: !d.pinned } : x));
    toast.success(d.pinned ? 'Unpinned' : 'Pinned to top');
  };

  const toggleLock = async (d: Discussion) => {
    const { error } = await supabase.from('discussions').update({ locked: !d.locked }).eq('id', d.id);
    if (error) return toast.error('Could not update');
    setItems(p => p.map(x => x.id === d.id ? { ...x, locked: !d.locked } : x));
    toast.success(d.locked ? 'Opened for comments' : 'Closed for comments');
  };

  const loadAudit = async () => {
    if (!courseId) return;
    const { data } = await supabase.from('discussion_audit')
      .select('id,action,actor_email,created_at,snapshot,reply_id')
      .eq('course_id', courseId).order('created_at', { ascending:false }).limit(100);
    setAudit(data ?? []);
  };

  // Build nested reply tree
  const replyTree = useMemo(() => {
    const byParent: Record<string, Reply[]> = { root: [] };
    replies.forEach(r => {
      const key = r.parent_reply_id ?? 'root';
      (byParent[key] ??= []).push(r);
    });
    return byParent;
  }, [replies]);

  const renderReplies = (parent: string, depth: number) => {
    const children = replyTree[parent] || [];
    return children.map(r => (
      <div key={r.id} style={{ marginLeft: depth * 24 }}>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderLeft: depth>0 ? `3px solid ${C.accent}` : `1px solid ${C.border}`, borderRadius:6, padding:14, marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6, gap:8 }}>
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>
              <strong style={{ color:C.primary }}>{r.author_name}</strong> • {new Date(r.created_at).toLocaleString()}
              {depth > 0 && <span style={{ marginLeft:6, color:C.accent }}>↳ reply</span>}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => { setReplyTo(r); setTimeout(() => document.getElementById('reply-composer')?.scrollIntoView({ behavior:'smooth' }), 0); }}
                style={{ padding:'2px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:11, color:C.primary, cursor:'pointer' }}>Reply</button>
              {(canEdit || r.author_id === user?.id) && (
                <button onClick={() => askDeleteReply(r)}
                  style={{ padding:'2px 8px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:11, color:C.error, cursor:'pointer' }}>✕</button>
              )}
            </div>
          </div>
          <div style={{ fontSize:13, color:C.text, fontFamily:'sans-serif', whiteSpace:'pre-wrap', lineHeight:1.6 }}>{r.body}</div>
        </div>
        {renderReplies(r.id, depth + 1)}
      </div>
    ));
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
        {renderReplies('root', 0)}

        {open.locked ? (
          <div style={{ background:'#F5F1F9', border:`1px dashed ${C.border}`, borderRadius:6, padding:14, marginTop:12, textAlign:'center', color:C.muted, fontFamily:'sans-serif', fontSize:13 }}>
            🔒 This discussion is closed for comments.
          </div>
        ) : (
          <div id="reply-composer" style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:6, padding:14, marginTop:12 }}>
            {replyTo && (
              <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginBottom:6, display:'flex', justifyContent:'space-between' }}>
                <span>Replying to <strong style={{ color:C.primary }}>{replyTo.author_name}</strong></span>
                <button onClick={() => setReplyTo(null)} style={{ background:'none', border:'none', color:C.error, cursor:'pointer', fontSize:12 }}>Cancel</button>
              </div>
            )}
            <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} placeholder={replyTo ? `Reply to ${replyTo.author_name}…` : 'Write a reply…'} rows={3}
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', resize:'vertical', boxSizing:'border-box', outline:'none' }}/>
            <div style={{ marginTop:8, textAlign:'right' }}>
              <button onClick={postReply} disabled={!replyBody.trim()} style={{ padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', opacity:replyBody.trim()?1:.5 }}>Post Reply</button>
            </div>
          </div>
        )}

        <ConfirmDialog open={!!confirm} title={confirm?.title || ''} body={confirm?.body || ''}
          onCancel={() => setConfirm(null)} onConfirm={() => confirm?.onConfirm()} />
      </div>
    );
  }

  // List view
  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, gap:8, flexWrap:'wrap' }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Discussions</h2>
        <div style={{ display:'flex', gap:8 }}>
          {canEdit && (
            <button onClick={() => { setShowAudit(v => !v); if (!showAudit) loadAudit(); }}
              style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>📋 Activity log</button>
          )}
          <button onClick={() => setShowNew(v => !v)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ Discussion</button>
        </div>
      </div>

      {showAudit && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:14, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <strong style={{ color:C.text, fontFamily:'sans-serif', fontSize:13 }}>Deletion activity log</strong>
            <button onClick={loadAudit} style={{ padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>Refresh</button>
          </div>
          {audit.length === 0 ? (
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>No deletions recorded yet.</div>
          ) : (
            <div style={{ maxHeight:240, overflowY:'auto' }}>
              {audit.map(a => (
                <div key={a.id} style={{ fontSize:12, color:C.text, fontFamily:'sans-serif', padding:'6px 0', borderBottom:`1px dashed ${C.border}` }}>
                  <strong>{a.actor_email || 'Unknown user'}</strong>{' '}
                  <span style={{ color:C.error }}>{a.action === 'delete_discussion' ? 'deleted a discussion' : 'deleted a reply'}</span>{' — '}
                  <span style={{ color:C.muted }}>{a.snapshot?.title || (a.snapshot?.body ? String(a.snapshot.body).slice(0, 80) : '—')}</span>
                  <span style={{ color:C.muted, marginLeft:8 }}>{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
      ) : (() => {
        const pinned = items.filter(d => d.pinned);
        const closed = items.filter(d => !d.pinned && d.locked);
        const main   = items.filter(d => !d.pinned && !d.locked);
        const renderRow = (d: Discussion) => (
          <div key={d.id} onClick={() => openThread(d)}
            style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:16, marginBottom:8, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fd'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
            <span style={{ fontSize:22 }}>{d.locked ? '🔒' : d.pinned ? '📌' : '💬'}</span>
            <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>
              <InlineTitle value={d.title} disabled={!canEdit} label="discussion title" onSave={(t) => renameDiscussion(d, t)} />
            </div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginTop:3 }}>
                by {d.author_name} • {d.reply_count} {d.reply_count===1?'reply':'replies'} • last activity {new Date(d.last_activity!).toLocaleDateString()}
              </div>
            </div>
            {canEdit && (
              <>
                <button onClick={e => { e.stopPropagation(); togglePin(d); }} title={d.pinned ? 'Unpin' : 'Pin to top'}
                  style={{ padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:d.pinned?'#EDE8F7':C.white, fontSize:12, color:C.text, cursor:'pointer' }}>📌</button>
                <button onClick={e => { e.stopPropagation(); toggleLock(d); }} title={d.locked ? 'Reopen' : 'Close for comments'}
                  style={{ padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:d.locked?'#EDE8F7':C.white, fontSize:12, color:C.text, cursor:'pointer' }}>{d.locked ? '🔓' : '🔒'}</button>
              </>
            )}
            {(canEdit || d.author_id === user?.id) && (
              <button onClick={e => { e.stopPropagation(); askDeleteDiscussion(d); }}
                style={{ padding:'4px 10px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, color:C.error, cursor:'pointer' }}>✕</button>
            )}
          </div>
        );
        const Section = ({ title, list, empty }: { title: string; list: Discussion[]; empty: string }) => (
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:'sans-serif', padding:'6px 4px', borderBottom:`1px solid ${C.border}`, marginBottom:10 }}>{title} ({list.length})</div>
            {list.length === 0
              ? <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', padding:'8px 4px' }}>{empty}</div>
              : list.map(renderRow)}
          </div>
        );
        return (
          <>
            <Section title="📌 Pinned Discussions" list={pinned} empty="No pinned discussions." />
            <Section title="Discussions" list={main} empty="No open discussions." />
            <Section title="🔒 Closed for Comments" list={closed} empty="Nothing closed." />
          </>
        );
      })()}

      <ConfirmDialog open={!!confirm} title={confirm?.title || ''} body={confirm?.body || ''}
        onCancel={() => setConfirm(null)} onConfirm={() => confirm?.onConfirm()} />
    </div>
  );
};

export default DiscussionsTab;
