// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './AuthContext';
import PortalLayout from '@/components/portal/PortalLayout';
import { toast } from 'sonner';

const C = { primary:'#7B4DB5', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', unread:'#FEF3C7' } as const;

interface Convo {
  id: string; subject: string; last_message_at: string; created_by: string;
  course_id: string | null;
  participants: { user_id: string; last_read_at: string | null; archived: boolean; starred: boolean; email?: string; full_name?: string }[];
  preview?: string;
  unread?: boolean;
}

interface Msg { id:string; sender_id:string; body:string; created_at:string; sender_email?:string; }

const Inbox: React.FC = () => {
  const [me, setMe] = useState<any>(null);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'inbox'|'starred'|'sent'|'archived'>('inbox');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState('');
  const [composing, setComposing] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<{id:string; title:string}[]>([]);
  const [directory, setDirectory] = useState<{id:string; email:string; full_name:string|null}[]>([]);

  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCourse, setNewCourse] = useState<string>('');
  const [newRecipients, setNewRecipients] = useState<string[]>([]);

  const loadConvos = async (userId: string) => {
    setLoading(true);
    const { data: parts } = await supabase.from('portal_conversation_participants')
      .select('conversation_id,last_read_at,archived,starred').eq('user_id', userId);
    const ids = (parts ?? []).map(p => p.conversation_id);
    if (ids.length === 0) { setConvos([]); setLoading(false); return; }
    const { data: cs } = await supabase.from('portal_conversations')
      .select('*').in('id', ids).order('last_message_at', { ascending: false });
    const { data: allParts } = await supabase.from('portal_conversation_participants')
      .select('conversation_id,user_id,last_read_at,archived,starred').in('conversation_id', ids);
    const { data: previews } = await supabase.from('portal_messages')
      .select('conversation_id,body,created_at,sender_id').in('conversation_id', ids).order('created_at', { ascending: false });
    const previewMap: Record<string,{body:string;created_at:string;sender_id:string}> = {};
    (previews ?? []).forEach(m => { if (!previewMap[m.conversation_id]) previewMap[m.conversation_id] = m; });

    // fetch participant emails
    const uids = Array.from(new Set((allParts ?? []).map(p => p.user_id)));
    const { data: profs } = await supabase.from('profiles').select('id,email,full_name').in('id', uids);
    const profMap: Record<string,{email:string; full_name:string|null}> = {};
    (profs ?? []).forEach((p:any) => profMap[p.id] = { email: p.email, full_name: p.full_name });

    const mine = new Map((parts ?? []).map(p => [p.conversation_id, p]));
    const withParts: Convo[] = (cs ?? []).map(c => {
      const my = mine.get(c.id);
      const pv = previewMap[c.id];
      const unread = pv && (!my?.last_read_at || new Date(pv.created_at) > new Date(my.last_read_at));
      return {
        ...c,
        participants: (allParts ?? []).filter(ap => ap.conversation_id === c.id)
          .map(ap => ({ ...ap, email: profMap[ap.user_id]?.email, full_name: profMap[ap.user_id]?.full_name })),
        preview: pv?.body?.slice(0, 100),
        unread: !!unread,
      };
    });
    setConvos(withParts);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      setMe(u.user);
      await loadConvos(u.user.id);
      const { data: enrs } = await supabase.from('enrollments').select('course_id').eq('user_id', u.user.id);
      const cids = Array.from(new Set((enrs ?? []).map((e:any) => e.course_id)));
      if (cids.length) {
        const { data: cs } = await supabase.from('courses').select('id,title').in('id', cids);
        setEnrolledCourses((cs ?? []) as any);
        // pull course-mates for directory
        const { data: mates } = await supabase.from('enrollments').select('user_id').in('course_id', cids);
        const mateIds = Array.from(new Set((mates ?? []).map((m:any) => m.user_id))).filter(id => id !== u.user.id);
        if (mateIds.length) {
          const { data: profs } = await supabase.from('profiles').select('id,email,full_name').in('id', mateIds);
          setDirectory((profs ?? []) as any);
        }
      }
    })();
  }, []);

  const openConvo = async (id: string) => {
    setSelectedId(id);
    setComposing(false);
    const { data: msgs } = await supabase.from('portal_messages')
      .select('*').eq('conversation_id', id).order('created_at', { ascending: true });
    const uids = Array.from(new Set((msgs ?? []).map((m:any) => m.sender_id)));
    const { data: profs } = await supabase.from('profiles').select('id,email').in('id', uids);
    const pmap: Record<string,string> = {}; (profs ?? []).forEach((p:any) => pmap[p.id] = p.email);
    setMessages((msgs ?? []).map((m:any) => ({ ...m, sender_email: pmap[m.sender_id] })));
    if (me) {
      await supabase.from('portal_conversation_participants').update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', id).eq('user_id', me.id);
      setConvos(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedId || !me) return;
    const { error } = await supabase.from('portal_messages').insert({
      conversation_id: selectedId, sender_id: me.id, body: reply.trim(),
    });
    if (error) { toast.error('Could not send: ' + error.message); return; }
    setReply('');
    await openConvo(selectedId);
    toast.success('Message sent');
  };

  const sendNew = async () => {
    if (!me) return;
    if (newRecipients.length === 0) { toast.error('Pick at least one recipient'); return; }
    if (!newBody.trim()) { toast.error('Message body required'); return; }
    const { data: convo, error } = await supabase.from('portal_conversations').insert({
      subject: newSubject.trim() || '(no subject)',
      course_id: newCourse || null,
      created_by: me.id,
    }).select().single();
    if (error || !convo) { toast.error(error?.message || 'Failed'); return; }
    const parts = Array.from(new Set([me.id, ...newRecipients])).map(uid => ({
      conversation_id: convo.id, user_id: uid,
      last_read_at: uid === me.id ? new Date().toISOString() : null,
    }));
    await supabase.from('portal_conversation_participants').insert(parts);
    await supabase.from('portal_messages').insert({
      conversation_id: convo.id, sender_id: me.id, body: newBody.trim(),
    });
    // notify recipients
    await supabase.from('notifications').insert(newRecipients.map(uid => ({
      user_id: uid, kind: 'message', title: `New message: ${newSubject || '(no subject)'}`,
      body: newBody.slice(0, 140), link: `/portal/inbox`,
    })));
    setComposing(false); setNewSubject(''); setNewBody(''); setNewRecipients([]); setNewCourse('');
    await loadConvos(me.id);
    openConvo(convo.id);
    toast.success('Message sent');
  };

  const toggle = async (convoId: string, field: 'starred'|'archived') => {
    if (!me) return;
    const cur = convos.find(c => c.id === convoId);
    const my = cur?.participants.find(p => p.user_id === me.id);
    const next = !my?.[field];
    await supabase.from('portal_conversation_participants').update({ [field]: next })
      .eq('conversation_id', convoId).eq('user_id', me.id);
    setConvos(prev => prev.map(c => c.id !== convoId ? c : {
      ...c, participants: c.participants.map(p => p.user_id === me.id ? { ...p, [field]: next } : p),
    }));
  };

  const filteredConvos = useMemo(() => {
    if (!me) return [];
    return convos.filter(c => {
      const my = c.participants.find(p => p.user_id === me.id);
      if (filter === 'archived' && !my?.archived) return false;
      if (filter !== 'archived' && my?.archived) return false;
      if (filter === 'starred' && !my?.starred) return false;
      if (filter === 'sent' && c.created_by !== me.id) return false;
      if (courseFilter !== 'all' && (c.course_id || '') !== courseFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!c.subject.toLowerCase().includes(q) && !(c.preview ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [convos, filter, courseFilter, search, me]);

  const selected = selectedId ? convos.find(c => c.id === selectedId) : null;
  const otherNames = (c: Convo) => c.participants.filter(p => p.user_id !== me?.id)
    .map(p => p.full_name || p.email || 'User').join(', ');

  return (
    <PortalLayout>
      <div style={{ padding:24, fontFamily:'sans-serif' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:C.text }}>Inbox</h2>
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            <button onClick={() => { setComposing(true); setSelectedId(null); }}
              style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', cursor:'pointer', fontSize:12, fontWeight:600 }}>Compose</button>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:16, minHeight:'70vh' }}>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, display:'flex', flexDirection:'column' }}>
            <div style={{ padding:10, borderBottom:`1px solid ${C.border}`, display:'flex', flexDirection:'column', gap:8 }}>
              <select aria-label="Filter by course" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
                style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}>
                <option value="all">All Courses</option>
                {enrolledCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select aria-label="Filter messages" value={filter} onChange={e => setFilter(e.target.value as any)}
                style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }}>
                <option value="inbox">Inbox</option>
                <option value="starred">Starred</option>
                <option value="sent">Sent</option>
                <option value="archived">Archived</option>
              </select>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:12 }} />
            </div>
            <div style={{ overflowY:'auto', flex:1 }}>
              {loading ? <div style={{ padding:40, textAlign:'center', color:C.muted, fontSize:12 }}>Loading…</div> :
               filteredConvos.length === 0 ? <div style={{ padding:40, textAlign:'center', color:C.muted, fontSize:12 }}>No Conversations to Show</div> :
               filteredConvos.map(c => {
                 const my = c.participants.find(p => p.user_id === me?.id);
                 return (
                   <div key={c.id} onClick={() => openConvo(c.id)}
                     style={{ padding:12, borderBottom:`1px solid ${C.border}`, cursor:'pointer',
                       background: selectedId===c.id ? '#EDE8F7' : c.unread ? C.unread : C.white }}>
                     <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                       <button onClick={(e) => { e.stopPropagation(); toggle(c.id, 'starred'); }}
                         style={{ background:'none', border:'none', cursor:'pointer', color: my?.starred ? '#F59E0B' : C.muted, fontSize:14 }}>★</button>
                       <div style={{ fontSize:13, fontWeight: c.unread?700:600, color:C.text, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                         {otherNames(c) || '(you)'}
                       </div>
                       <div style={{ fontSize:10, color:C.muted }}>{new Date(c.last_message_at).toLocaleDateString()}</div>
                     </div>
                     <div style={{ fontSize:12, color:C.text, marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.subject}</div>
                     <div style={{ fontSize:11, color:C.muted, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.preview}</div>
                   </div>
                 );
               })
              }
            </div>
          </div>

          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, display:'flex', flexDirection:'column' }}>
            {composing ? (
              <div style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
                <h3 style={{ margin:0, color:C.text }}>New Message</h3>
                <select aria-label="Course for new message" value={newCourse} onChange={e => setNewCourse(e.target.value)}
                  style={{ padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13 }}>
                  <option value="">Course (optional)</option>
                  {enrolledCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <div>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>To:</div>
                  <select aria-label="Recipients" multiple value={newRecipients} onChange={e => setNewRecipients(Array.from(e.target.selectedOptions).map(o => o.value))}
                    style={{ padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, width:'100%', minHeight:100 }}>
                    {directory.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                  </select>
                  <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>Hold Cmd/Ctrl to select multiple</div>
                </div>
                <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Subject"
                  style={{ padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13 }} />
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Message…" rows={8}
                  style={{ padding:10, border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, resize:'vertical', fontFamily:'inherit' }} />
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={sendNew} style={{ padding:'8px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', cursor:'pointer', fontWeight:600 }}>Send</button>
                  <button onClick={() => setComposing(false)} style={{ padding:'8px 18px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : !selected ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:13 }}>
                Select a conversation
              </div>
            ) : (
              <>
                <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{selected.subject}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{otherNames(selected)}</div>
                  </div>
                  <button onClick={() => toggle(selected.id, 'starred')} style={{ background:'none', border:'none', cursor:'pointer', color:selected.participants.find(p => p.user_id===me?.id)?.starred?'#F59E0B':C.muted, fontSize:18 }}>★</button>
                  <button onClick={async () => { await toggle(selected.id, 'archived'); setSelectedId(null); }}
                    style={{ padding:'5px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, cursor:'pointer', fontSize:11 }}>
                    {selected.participants.find(p => p.user_id===me?.id)?.archived ? 'Unarchive' : 'Archive'}
                  </button>
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:20 }}>
                  {messages.map(m => (
                    <div key={m.id} style={{ marginBottom:16, display:'flex', gap:10, flexDirection: m.sender_id === me?.id ? 'row-reverse' : 'row' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:C.primary, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                        {(m.sender_email || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ maxWidth:'70%', background: m.sender_id === me?.id ? '#EDE8F7' : '#F4F2FA', borderRadius:8, padding:'10px 14px' }}>
                        <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{m.sender_email} • {new Date(m.created_at).toLocaleString()}</div>
                        <div style={{ fontSize:13, color:C.text, whiteSpace:'pre-wrap' }}>{m.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:12, borderTop:`1px solid ${C.border}`, display:'flex', gap:8 }}>
                  <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply…" rows={2}
                    style={{ flex:1, padding:10, border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, resize:'vertical', fontFamily:'inherit' }} />
                  <button onClick={sendReply} style={{ padding:'0 20px', border:'none', borderRadius:5, background:C.primary, color:'white', cursor:'pointer', fontWeight:600 }}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default Inbox;
