// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './AuthContext';
import PortalLayout from '@/components/portal/PortalLayout';

const C = { primary:'#7B4DB5', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8' } as const;

interface Notif { id:string; kind:string; title:string; body:string|null; link:string|null; read_at:string|null; created_at:string; }
interface RecentItem { path:string; label:string; visited_at:string; }

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { setLoading(false); return; }
      const { data } = await supabase.from('notifications')
        .select('*').eq('user_id', u.user.id).order('created_at', { ascending: false }).limit(100);
      setNotifs((data ?? []) as any);
      try {
        const raw = localStorage.getItem('hsa.recent.pages');
        if (raw) setRecent(JSON.parse(raw));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const clearRecent = () => { localStorage.removeItem('hsa.recent.pages'); setRecent([]); };

  const markAll = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    await supabase.from('notifications').update({ read_at: new Date().toISOString() })
      .is('read_at', null).eq('user_id', u.user.id);
    setNotifs(n => n.map(x => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
  };

  return (
    <PortalLayout>
      <div style={{ padding:24, fontFamily:'sans-serif', maxWidth:900 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:C.text }}>Recent History</h2>
          <button onClick={markAll} style={{ marginLeft:'auto', padding:'6px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, cursor:'pointer', fontSize:12 }}>Mark all read</button>
        </div>

        <section style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, marginBottom:20 }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, fontWeight:700, color:C.text }}>Notifications</div>
          {loading ? <div style={{ padding:40, textAlign:'center', color:C.muted }}>Loading…</div> :
           notifs.length === 0 ? <div style={{ padding:40, textAlign:'center', color:C.muted }}>No notifications yet</div> :
           notifs.map(n => (
            <div key={n.id} onClick={() => n.link && navigate(n.link)}
              style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, cursor: n.link?'pointer':'default', background: n.read_at ? C.white : '#FEF3C7' }}>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <span style={{ fontSize:10, textTransform:'uppercase', color:C.primary, fontWeight:700, background:'#EDE8F7', padding:'2px 8px', borderRadius:10 }}>{n.kind}</span>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, flex:1 }}>{n.title}</div>
                <div style={{ fontSize:11, color:C.muted }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {n.body && <div style={{ fontSize:12, color:C.muted, marginTop:4, marginLeft:60 }}>{n.body}</div>}
            </div>
          ))}
        </section>

        <section style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8 }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, fontWeight:700, color:C.text, display:'flex', alignItems:'center' }}>
            <span>Recently Viewed Pages</span>
            {recent.length > 0 && <button onClick={clearRecent} style={{ marginLeft:'auto', padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, cursor:'pointer', fontSize:11 }}>Clear</button>}
          </div>
          {recent.length === 0 ? <div style={{ padding:40, textAlign:'center', color:C.muted, fontSize:12 }}>Pages you view will appear here.</div> :
           recent.map((r, i) => (
             <Link key={i} to={r.path} style={{ display:'block', padding:'10px 16px', borderBottom:`1px solid ${C.border}`, textDecoration:'none', color:C.text }}>
               <div style={{ fontSize:13, fontWeight:600 }}>{r.label}</div>
               <div style={{ fontSize:11, color:C.muted }}>{new Date(r.visited_at).toLocaleString()} • {r.path}</div>
             </Link>
           ))
          }
        </section>
      </div>
    </PortalLayout>
  );
};

export default HistoryPage;
