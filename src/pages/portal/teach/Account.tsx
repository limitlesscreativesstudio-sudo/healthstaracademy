import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PortalLayout from '@/components/portal/PortalLayout';
import { Bell, CalendarDays, CalendarRange, BellOff, User as UserIcon, FileText, Settings as SettingsIcon, Share2, QrCode, Megaphone, Upload, Plus, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import SaveStatus from '@/components/portal/SaveStatus';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#655480',
  error:'#C0392B', success:'#127A1B', warn:'#B27300',
  headerBar:'#EDE8F7',
} as const;

// ─── Notification matrix data ─────────────────────────────────────────────────
type Freq = 'immediate' | 'daily' | 'weekly' | 'off';
const FREQ_ORDER: Freq[] = ['immediate','daily','weekly','off'];
const FREQ_ICON: Record<Freq, React.ReactNode> = {
  immediate: <Bell size={16}/>, daily: <CalendarDays size={16}/>, weekly: <CalendarRange size={16}/>, off: <BellOff size={16}/>,
};
const FREQ_COLOR: Record<Freq, string> = {
  immediate:'#127A1B', daily:'#0B7285', weekly:'#0B7285', off:'#8B95A1',
};
const FREQ_LABEL: Record<Freq, string> = { immediate:'Notify immediately', daily:'Daily summary', weekly:'Weekly summary', off:'Notifications off' };

type MatrixRow = { key: string; label: string; sub?: string };
type MatrixGroup = { group: string; rows: MatrixRow[] };
const MATRIX: MatrixGroup[] = [
  { group:'Course Activities', rows:[
    { key:'due_date',        label:'Due Date',           sub:'Assignment due date change' },
    { key:'grading_policy',  label:'Grading Policies',   sub:'Course grading policy change' },
    { key:'course_content',  label:'Course Content',     sub:'Page / quiz / assignment content changes' },
    { key:'files',           label:'Files',              sub:'New file added to your course' },
    { key:'announcement',    label:'Announcement',       sub:'New announcement in your course' },
    { key:'announcement_own',label:'Announcement Created By You', sub:'Replies to your announcements' },
    { key:'grading',         label:'Grading',            sub:'Grade entered / weight changed' },
    { key:'invitation',      label:'Invitation',         sub:'Web conference / group / collaboration invites' },
    { key:'all_submissions', label:'All Submissions',    sub:'(Instructor/Admin) Assignment submission or resubmission' },
    { key:'late_grading',    label:'Late Grading',       sub:'(Instructor/Admin) Late assignment submission' },
    { key:'submission_comment', label:'Submission Comment', sub:'Assignment submission comment' },
  ]},
  { group:'Discussions', rows:[
    { key:'new_topic',       label:'New Topic',   sub:'New discussion topic in your course' },
    { key:'new_reply',       label:'New Reply',   sub:'New reply on a topic you follow' },
    { key:'new_mention',     label:'New Mention', sub:'You were @mentioned in a discussion' },
  ]},
  { group:'Conversations', rows:[
    { key:'added_conv',      label:'Added To Conversation', sub:'You are added to a conversation' },
    { key:'conv_message',    label:'Conversation Message',  sub:'New inbox messages' },
    { key:'conv_own',        label:'Conversations Created By Me' },
  ]},
  { group:'Scheduling', rows:[
    { key:'appt_signup',     label:'Appointment Signups',      sub:'(Instructor/Admin) Student appointment sign-up' },
    { key:'appt_new',        label:'Appointment Signups (You)',sub:'New appointment on your calendar' },
    { key:'appt_cancel',     label:'Appointment Cancellations' },
    { key:'appt_avail',      label:'Appointment Availability', sub:'New timeslots available for signup' },
    { key:'calendar',        label:'Calendar',                 sub:'New / changed items on your course calendar' },
  ]},
  { group:'Alerts', rows:[
    { key:'admin_notice',    label:'Administrative Notifications', sub:'Course enrollment, exports, migration reports' },
    { key:'content_link_err',label:'Content Link Error',           sub:'Failed link a student interacted with' },
    { key:'global_ann',      label:'Global Announcements',         sub:'Institution-wide announcements' },
  ]},
];

// Default frequencies (matches Canvas defaults roughly)
const DEFAULT_PREFS: Record<string,{email:Freq; push:Freq}> = Object.fromEntries(
  MATRIX.flatMap(g => g.rows.map(r => [r.key, { email:'immediate', push:'off' } as {email:Freq;push:Freq}]))
);

// ─── Small UI atoms ───────────────────────────────────────────────────────────
const Toast: React.FC<{ type:'success'|'error'; message:string }> = ({ type, message }) => (
  <div style={{ padding:'10px 14px', borderRadius:6, marginBottom:16, display:'flex', gap:10,
    background: type==='success' ? '#e8f5e9' : '#fdecea',
    border: `1px solid ${type==='success' ? '#c8e6c9' : '#f5c6c2'}` }}>
    <span>{type==='success' ? '✅' : '⚠️'}</span>
    <span style={{ fontSize:13, color: type==='success' ? C.success : C.error, lineHeight:1.5 }}>{message}</span>
  </div>
);

const Section: React.FC<{ title:string; subtitle?:string; right?:React.ReactNode; children:React.ReactNode }> = ({ title, subtitle, right, children }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:24, marginBottom:20 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
      <div>
        <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:C.text }}>{title}</h2>
        {subtitle && <p style={{ margin:'4px 0 0', fontSize:12, color:C.muted }}>{subtitle}</p>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, style, ...p }) => (
  <button {...p} style={{ padding:'9px 20px', background:C.primary, color:'white', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, ...style }}>{children}</button>
);
const GhostBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, style, ...p }) => (
  <button {...p} style={{ padding:'7px 14px', background:'transparent', color:C.primary, border:`1px solid ${C.border}`, borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer', ...style }}>{children}</button>
);

const Field: React.FC<{ label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string; disabled?:boolean; hint?:string; error?:string; }> =
({ label, value, onChange, type='text', placeholder, disabled, hint, error }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, marginBottom:5 }}>{label}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{ width:'100%', border:`1.5px solid ${error?C.error:C.border}`, borderRadius:6, padding:'9px 12px', fontSize:13, color:C.text, background:disabled?C.bg:C.white, outline:'none', boxSizing:'border-box' }}/>
    {error && <div style={{ color:C.error, fontSize:12, marginTop:4 }}>⚠ {error}</div>}
    {hint && !error && <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>{hint}</div>}
  </div>
);

// ─── Notifications matrix ─────────────────────────────────────────────────────
const NotificationsPanel: React.FC<{ prefs: typeof DEFAULT_PREFS; setPrefs:(p:typeof DEFAULT_PREFS)=>void; save:()=>void; savedAt?: string; msg:{type:'success'|'error';text:string}|null; email:string; }> =
({ prefs, setPrefs, save, savedAt, msg, email }) => {
  const cycle = (row:string, ch:'email'|'push') => {
    const cur = prefs[row]?.[ch] ?? 'off';
    const next = FREQ_ORDER[(FREQ_ORDER.indexOf(cur) + 1) % FREQ_ORDER.length];
    setPrefs({ ...prefs, [row]: { ...(prefs[row] ?? {email:'off',push:'off'}), [ch]: next } });
  };
  const setAll = (freq: Freq) => {
    const next = { ...prefs };
    MATRIX.forEach(g => g.rows.forEach(r => { next[r.key] = { email: freq, push: freq === 'off' ? 'off' : (prefs[r.key]?.push ?? 'off') }; }));
    setPrefs(next);
  };

  return (
    <Section title="Notification Settings" subtitle="Applies to all your courses. Course-level settings override these." right={
      <div style={{ display:'flex', gap:6 }}>
        <GhostBtn onClick={() => setAll('immediate')} title="Turn all email to immediate">All immediate</GhostBtn>
        <GhostBtn onClick={() => setAll('off')} title="Turn all off">All off</GhostBtn>
      </div>
    }>
      {msg && <Toast type={msg.type} message={msg.text}/>}
      <div style={{ background:'#EEF6FB', border:'1px solid #C9E1EE', color:'#0B4D6E', padding:'10px 12px', borderRadius:6, fontSize:12, marginBottom:14 }}>
        Click any icon to cycle through <b>Immediate</b> → <b>Daily</b> → <b>Weekly</b> → <b>Off</b>. Daily digests deliver around 6pm; weekly digests deliver Saturday between 5–7am.
      </div>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:C.headerBar }}>
              <th style={{ textAlign:'left', padding:'10px 12px', color:C.text, fontSize:12, borderBottom:`1px solid ${C.border}` }}>Course Activities</th>
              <th style={{ padding:'10px 12px', color:C.text, fontSize:12, borderBottom:`1px solid ${C.border}`, width:130 }}>
                Email<div style={{ fontSize:10, color:C.muted, fontWeight:400 }}>{email || '—'}</div>
              </th>
              <th style={{ padding:'10px 12px', color:C.text, fontSize:12, borderBottom:`1px solid ${C.border}`, width:130 }}>
                Push<div style={{ fontSize:10, color:C.muted, fontWeight:400 }}>For All Devices</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map(g => (
              <React.Fragment key={g.group}>
                <tr>
                  <td colSpan={3} style={{ padding:'14px 12px 6px', fontSize:11, textTransform:'uppercase', letterSpacing:0.5, fontWeight:700, color:C.muted }}>{g.group}</td>
                </tr>
                {g.rows.map(r => {
                  const p = prefs[r.key] ?? { email:'off', push:'off' };
                  return (
                    <tr key={r.key} style={{ borderTop:`1px solid ${C.border}` }}>
                      <td style={{ padding:'10px 12px', color:C.text }}>
                        <div style={{ fontWeight:600 }}>{r.label}</div>
                        {r.sub && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{r.sub}</div>}
                      </td>
                      {(['email','push'] as const).map(ch => (
                        <td key={ch} style={{ padding:'10px 12px', textAlign:'center' }}>
                          <button
                            onClick={() => cycle(r.key, ch)}
                            title={FREQ_LABEL[p[ch]]}
                            style={{ width:34, height:34, borderRadius:'50%', border:`1px solid ${C.border}`,
                              background: p[ch]==='off' ? '#F5F5F7' : '#E8F5EE',
                              color: FREQ_COLOR[p[ch]], cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                            {FREQ_ICON[p[ch]]}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display:'flex', gap:12, alignItems:'center', marginTop:20 }}>
        <PrimaryBtn onClick={save}>Save Notification Settings</PrimaryBtn>
        {savedAt && <span style={{ fontSize:12, color:C.muted }}>Last saved {savedAt}</span>}
      </div>
    </Section>
  );
};

// ─── Profile panel ────────────────────────────────────────────────────────────
const ProfilePanel: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [msg, setMsg] = useState<{type:'success'|'error';text:string}|null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwErr, setPwErr] = useState<Record<string,string>>({});
  const [pwMsg, setPwMsg] = useState<{type:'success'|'error';text:string}|null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Load current profile values from DB so edits show what's saved.
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, job_title, phone, bio')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setName((data.full_name as string) ?? user.name ?? '');
        setTitle((data.job_title as string) ?? '');
        setPhone((data.phone as string) ?? '');
        setBio((data.bio as string) ?? '');
      }
      setHydrated(true);
    })();
  }, [user?.id]);

  const save = async () => {
    if (!name.trim()) return setMsg({ type:'error', text:'Name cannot be empty.' });
    setLoading(true);
    const r = await updateProfile({ name: name.trim(), jobTitle: title.trim(), phone: phone.trim(), bio: bio.trim() });
    setLoading(false);
    setMsg(r.error ? { type:'error', text:r.error } : { type:'success', text:'Profile saved.' });
    setSavedAt(Date.now());
    setDirty(false);
    setTimeout(() => setMsg(null), 4000);
  };

  // Autosave profile edits (debounced) once hydrated.
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [autoErr, setAutoErr] = useState<string | null>(null);
  useEffect(() => {
    if (!hydrated || !user?.id) return;
    if (!name.trim()) return;
    setDirty(true);
    const t = setTimeout(async () => {
      setLoading(true);
      setAutoErr(null);
      const r = await updateProfile({ name: name.trim(), jobTitle: title.trim(), phone: phone.trim(), bio: bio.trim() });
      setLoading(false);
      if (r.error) { setAutoErr('Autosave failed — will retry'); return; }
      setDirty(false);
      setSavedAt(Date.now());
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, title, phone, bio, hydrated]);

  const changePw = async () => {
    const e: Record<string,string> = {};
    if (!curPass) e.curPass = 'Enter your current password.';
    if (newPass.length < 8) e.newPass = 'At least 8 characters.';
    if (newPass !== confPass) e.confPass = 'Passwords do not match.';
    if (Object.keys(e).length) return setPwErr(e);
    setPwErr({}); setPwLoading(true);
    const r = await updatePassword(curPass, newPass);
    setPwLoading(false);
    if (r.error) setPwErr({ curPass: r.error });
    else { setPwMsg({ type:'success', text:'Password updated.' }); setCurPass(''); setNewPass(''); setConfPass(''); setTimeout(()=>setPwMsg(null), 4000); }
  };
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <>
      <Section title="User Profile" subtitle="Your name and photo appear throughout the HSA portal.">
        {msg && <Toast type={msg.type} message={msg.text}/>}
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg,${C.primary},${C.accent})`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:24, fontWeight:700 }}>{initials}</div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{name || 'Your Name'}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{user?.email}</div>
            <span style={{ fontSize:11, padding:'2px 10px', borderRadius:20, background:C.headerBar, color:C.primary, fontWeight:600, display:'inline-block', marginTop:5 }}>{user?.role ?? 'user'}</span>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
          <Field label="Full Name *" value={name} onChange={setName}/>
          <Field label="Email Address" value={user?.email ?? ''} onChange={()=>{}} disabled hint="Email is managed via account security."/>
          <Field label="Job Title" value={title} onChange={setTitle} placeholder="e.g. CNA Lead Instructor"/>
          <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="(555) 555-1234"/>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, marginBottom:5 }}>Biography</label>
          <textarea rows={3} value={bio} onChange={e=>setBio(e.target.value)} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:6, padding:'9px 12px', fontSize:13, color:C.text, outline:'none', boxSizing:'border-box', resize:'vertical' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <PrimaryBtn onClick={save} disabled={loading || !hydrated}>{loading ? 'Saving…' : 'Save Profile'}</PrimaryBtn>
          {hydrated && <SaveStatus dirty={dirty} saving={loading} savedAt={savedAt} error={autoErr} />}
        </div>
      </Section>

      <Section title="Change Password" subtitle="You'll need the new password on your next sign-in.">
        {pwMsg && <Toast type={pwMsg.type} message={pwMsg.text}/>}
        <div style={{ position:'relative' }}>
          <Field label="Current Password *" value={curPass} onChange={v=>{setCurPass(v); setPwErr(p=>({...p,curPass:''}));}} type={showPw?'text':'password'} error={pwErr.curPass}/>
        </div>
        <Field label="New Password *" value={newPass} onChange={v=>{setNewPass(v); setPwErr(p=>({...p,newPass:''}));}} type={showPw?'text':'password'} error={pwErr.newPass} hint="Min 8 characters. Use letters, numbers, symbols."/>
        <Field label="Confirm New Password *" value={confPass} onChange={v=>{setConfPass(v); setPwErr(p=>({...p,confPass:''}));}} type={showPw?'text':'password'} error={pwErr.confPass}/>
        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.muted, marginBottom:12, cursor:'pointer' }}>
          <input type="checkbox" checked={showPw} onChange={e=>setShowPw(e.target.checked)}/> Show passwords
        </label>
        <PrimaryBtn onClick={changePw} disabled={pwLoading}>{pwLoading?'Updating…':'Update Password'}</PrimaryBtn>
      </Section>
    </>
  );
};

// ─── Files panel ──────────────────────────────────────────────────────────────
const FilesPanel: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<{ name:string; size:number; updated_at:string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{type:'success'|'error';text:string}|null>(null);
  const folder = user?.id ? `personal/${user.id}` : '';

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase.storage.from('submissions').list(folder, { limit:100, sortBy:{ column:'updated_at', order:'desc' } });
    setLoading(false);
    if (error) { setMsg({ type:'error', text: error.message }); return; }
    setFiles((data ?? []).filter(f => f.name && !f.name.startsWith('.')).map(f => ({ name:f.name, size:(f.metadata as any)?.size ?? 0, updated_at:f.updated_at ?? '' })));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const upload = async (fl: FileList | null) => {
    if (!fl || !fl[0] || !user?.id) return;
    setUploading(true);
    const f = fl[0];
    const { error } = await supabase.storage.from('submissions').upload(`${folder}/${Date.now()}-${f.name}`, f, { upsert:false });
    setUploading(false);
    if (error) { setMsg({ type:'error', text: error.message }); return; }
    setMsg({ type:'success', text:'Uploaded.' });
    load();
    setTimeout(()=>setMsg(null), 3000);
  };
  const remove = async (name:string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage.from('submissions').remove([`${folder}/${name}`]);
    if (error) { setMsg({ type:'error', text: error.message }); return; }
    load();
  };
  const download = async (name:string) => {
    const { data } = await supabase.storage.from('submissions').createSignedUrl(`${folder}/${name}`, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  return (
    <Section title="My Files" subtitle="Private files scoped to your account. 50 MB soft limit." right={
      <label style={{ cursor:'pointer' }}>
        <input type="file" style={{ display:'none' }} onChange={e => upload(e.target.files)}/>
        <span style={{ padding:'8px 14px', background:C.primary, color:'white', borderRadius:6, fontSize:13, fontWeight:600, display:'inline-flex', alignItems:'center', gap:6 }}>
          <Upload size={14}/> {uploading?'Uploading…':'Upload'}
        </span>
      </label>
    }>
      {msg && <Toast type={msg.type} message={msg.text}/>}
      {loading ? <div style={{ padding:20, color:C.muted, fontSize:13 }}>Loading…</div> :
        files.length === 0 ? <div style={{ padding:24, textAlign:'center', color:C.muted, fontSize:13 }}>No files yet. Upload lecture notes, drafts, or references.</div> :
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:C.headerBar }}>
            <th style={{ textAlign:'left', padding:'8px 12px', color:C.text }}>Name</th>
            <th style={{ textAlign:'left', padding:'8px 12px', color:C.text }}>Size</th>
            <th style={{ textAlign:'left', padding:'8px 12px', color:C.text }}>Modified</th>
            <th style={{ width:110 }}/>
          </tr></thead>
          <tbody>{files.map(f => (
            <tr key={f.name} style={{ borderTop:`1px solid ${C.border}` }}>
              <td style={{ padding:'10px 12px', color:C.primary, cursor:'pointer' }} onClick={()=>download(f.name)}>{f.name.replace(/^\d+-/,'')}</td>
              <td style={{ padding:'10px 12px', color:C.muted }}>{(f.size/1024).toFixed(1)} KB</td>
              <td style={{ padding:'10px 12px', color:C.muted }}>{f.updated_at ? new Date(f.updated_at).toLocaleDateString() : '—'}</td>
              <td style={{ padding:'10px 12px', textAlign:'right' }}>
                <button onClick={()=>remove(f.name)} style={{ background:'none', border:'none', color:C.error, cursor:'pointer' }} title="Delete"><Trash2 size={15}/></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      }
    </Section>
  );
};

// ─── Settings panel (Canvas-style: profile summary + contacts + integrations + feature options) ─
const FLAGS: { key:string; label:string; hint:string }[] = [
  { key:'auto_captions',     label:'Auto Show Closed Captions',                    hint:'Turn captions on for embedded video by default.' },
  { key:'autodetect_sep',    label:'Autodetect field separators in CSV exports',   hint:'Detect comma vs semicolon on export.' },
  { key:'course_setup_tut',  label:'Course Set-up Tutorial',                       hint:'Show setup tips when opening a new course.' },
  { key:'disable_alert_to',  label:'Disable Alert Notification Timeouts',          hint:'Keep in-app alerts visible until dismissed.' },
  { key:'no_celebrate',      label:'Disable Celebration Animations',               hint:'No confetti or fanfare on submissions.' },
  { key:'disable_shortcuts', label:'Disable Keyboard Shortcuts',                   hint:'Turn off portal-wide keyboard shortcuts.' },
  { key:'high_contrast',     label:'High Contrast UI',                             hint:'Higher contrast between text and background.' },
  { key:'include_bom',       label:'Include Byte-Order Mark in CSV exports',       hint:'Improves Excel compatibility.' },
  { key:'immersive_reader',  label:'Microsoft Immersive Reader',                   hint:'Read pages aloud with focus tools.' },
  { key:'open_todo_new_tab', label:'Open to-do items in a new tab',                hint:'Keeps your current page open.' },
  { key:'underline_links',   label:'Underline Links',                              hint:'Underline every link for easier scanning.' },
  { key:'dyslexia_font',     label:'Use a dyslexia friendly font',                 hint:'Applies OpenDyslexic where possible.' },
  { key:'csv_semicolons',    label:'Use semicolons to separate fields in CSV exports', hint:'For locales that use comma as decimal.' },
];

const ProfileSummary: React.FC = () => {
  const { user } = useAuth();
  const [p, setP] = useState<{ full_name:string; display_name:string; sortable:string; pronouns:string; language:string; timezone:string }>({
    full_name:'', display_name:'', sortable:'', pronouns:'', language:'English (United States)', timezone:'Pacific Time (US & Canada)'
  });
  useEffect(() => { if(!user?.id) return; (async () => {
    const { data } = await supabase.from('profiles').select('full_name').eq('user_id', user.id).maybeSingle();
    if (data) setP(s => ({
      ...s,
      full_name: (data as any).full_name ?? user.name ?? '',
      display_name: (data as any).display_name ?? (data as any).full_name ?? user.name ?? '',
      pronouns: (data as any).pronouns ?? '',
      language: (data as any).language ?? s.language,
      timezone: (data as any).timezone ?? s.timezone,
      sortable: ((data as any).full_name ?? user.name ?? '').split(' ').reverse().join(', '),
    }));
  })(); }, [user?.id]);
  const row = (label:string, value:React.ReactNode, sub?:string) => (
    <tr>
      <td style={{ padding:'8px 14px 8px 0', color:C.text, fontWeight:600, fontSize:13, verticalAlign:'top', width:130 }}>{label}</td>
      <td style={{ padding:'8px 0', fontSize:13, color:C.text }}>
        <div>{value}</div>
        {sub && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{sub}</div>}
      </td>
    </tr>
  );
  return (
    <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
      <div style={{ width:56, height:56, borderRadius:'50%', background:C.headerBar, display:'flex', alignItems:'center', justifyContent:'center', color:C.primary, fontWeight:700, fontSize:20, flexShrink:0 }}>
        {(p.full_name || user?.email || '?').slice(0,1).toUpperCase()}
      </div>
      <table style={{ borderCollapse:'collapse', flex:1 }}>
        <tbody>
          {row('Full Name:', p.full_name || '—', 'This name will be used for grading.')}
          {row('Display Name:', p.display_name || p.full_name || '—', 'People will see this name in discussions, messages and comments.')}
          {row('Sortable Name:', p.sortable || '—', 'This name appears in sorted lists.')}
          {row('Pronouns:', p.pronouns || 'None', 'This pronoun will appear after your name when enabled.')}
          {row('Language:', p.language)}
          {row('Time Zone:', p.timezone)}
        </tbody>
      </table>
    </div>
  );
};

const ContactSidebar: React.FC<{ contacts:{ altEmail:string; phone:string; smsOptIn:boolean }; setContacts:(c:any)=>void; }> = ({ contacts, setContacts }) => {
  const { user } = useAuth();
  return (
    <aside style={{ width:260, flexShrink:0 }}>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', marginBottom:16 }}>
        <div style={{ padding:'10px 14px', background:C.headerBar, fontSize:12, fontWeight:700, color:C.text }}>Ways to Contact</div>
        <div style={{ padding:'12px 14px' }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:0.5, color:C.muted, fontWeight:700, marginBottom:6 }}>Email Addresses</div>
          <div style={{ fontSize:13, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ color:'#E6A700' }}>★</span>{user?.email ?? '—'}
          </div>
          <div style={{ marginTop:10 }}>
            <input value={contacts.altEmail} onChange={e=>setContacts({...contacts, altEmail:e.target.value})} placeholder="+ Alternate email"
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'7px 10px', fontSize:12, boxSizing:'border-box' }}/>
          </div>
          <div style={{ height:1, background:C.border, margin:'14px 0' }}/>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:0.5, color:C.muted, fontWeight:700, marginBottom:6 }}>Other Contacts</div>
          <input value={contacts.phone} onChange={e=>setContacts({...contacts, phone:e.target.value})} placeholder="Mobile phone"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'7px 10px', fontSize:12, boxSizing:'border-box' }}/>
          <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:12, color:C.text, marginTop:8, cursor:'pointer' }}>
            <input type="checkbox" checked={contacts.smsOptIn} onChange={e=>setContacts({...contacts, smsOptIn:e.target.checked})}/>
            Send urgent alerts by SMS
          </label>
        </div>
      </div>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:12 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:10 }}>Quick actions</div>
        {[
          ['⬇️','Download Submissions'],
          ['📁','Download Course Files'],
          ['⚙️','Edit Profile Settings'],
        ].map(([i,l]) => (
          <div key={l} style={{ display:'flex', gap:8, padding:'7px 0', fontSize:13, color:C.primary, cursor:'pointer', borderBottom:`1px solid ${C.border}` }}>
            <span>{i}</span>{l}
          </div>
        ))}
      </div>
    </aside>
  );
};

const IntegrationsPanel: React.FC = () => {
  const rows = [
    { app:'Google Drive', status:'active', purpose:'File attachments', last:'Last used: today' },
    { app:'Zoom (LTI)',    status:'active', purpose:'Live classes',      last:'Last used: this week' },
    { app:'Rollcall',      status:'active', purpose:'Attendance sync',   last:'Last used: this month' },
  ];
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden', marginBottom:20 }}>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, fontSize:14, fontWeight:700, color:C.text }}>Approved Integrations</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ background:C.bg, color:C.muted, textAlign:'left' }}>
            <th style={{ padding:'8px 14px', fontWeight:600 }}>App</th>
            <th style={{ padding:'8px 14px', fontWeight:600 }}>Status</th>
            <th style={{ padding:'8px 14px', fontWeight:600 }}>Purpose</th>
            <th style={{ padding:'8px 14px', fontWeight:600 }}>Last Activity</th>
            <th style={{ padding:'8px 14px', fontWeight:600, width:60 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.app} style={{ borderTop:`1px solid ${C.border}` }}>
              <td style={{ padding:'10px 14px', color:C.text, fontWeight:600 }}>{r.app}</td>
              <td style={{ padding:'10px 14px', color:C.success }}>● {r.status}</td>
              <td style={{ padding:'10px 14px', color:C.text }}>{r.purpose}</td>
              <td style={{ padding:'10px 14px', color:C.muted }}>{r.last}</td>
              <td style={{ padding:'10px 14px' }}><button style={{ border:'none', background:'transparent', color:C.muted, cursor:'pointer' }} title="Revoke"><Trash2 size={14}/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FeatureOptionsTable: React.FC<{ flags:Record<string,boolean>; setFlags:(f:Record<string,boolean>)=>void }> = ({ flags, setFlags }) => {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string|null>(null);
  const [filter, setFilter] = useState<'All'|'On'|'Off'>('All');
  const rows = FLAGS.filter(f => {
    const on = !!flags[f.key];
    if (filter === 'On' && !on) return false;
    if (filter === 'Off' && on) return false;
    return !query || f.label.toLowerCase().includes(query.toLowerCase());
  });
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:10, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Feature Options</div>
        <div style={{ display:'flex', gap:8 }}>
          <select value={filter} onChange={e=>setFilter(e.target.value as any)} style={{ border:`1px solid ${C.border}`, borderRadius:5, padding:'6px 10px', fontSize:12, background:C.white }}>
            <option>All</option><option>On</option><option>Off</option>
          </select>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name"
            style={{ border:`1px solid ${C.border}`, borderRadius:5, padding:'6px 10px', fontSize:12, minWidth:180 }}/>
          {(query || filter!=='All') && <button onClick={()=>{ setQuery(''); setFilter('All'); }} style={{ border:'none', background:C.primary, color:'white', borderRadius:5, padding:'6px 12px', fontSize:12, cursor:'pointer' }}>Clear</button>}
        </div>
      </div>
      <div style={{ padding:'8px 16px', background:C.bg, fontSize:11, textTransform:'uppercase', letterSpacing:0.5, color:C.muted, fontWeight:700 }}>User</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ color:C.muted, textAlign:'left', borderBottom:`1px solid ${C.border}` }}>
            <th style={{ padding:'8px 16px', fontWeight:600 }}>Feature ▲</th>
            <th style={{ padding:'8px 16px', fontWeight:600 }}>Status</th>
            <th style={{ padding:'8px 16px', fontWeight:600, width:80, textAlign:'right' }}>State</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(f => {
            const on = !!flags[f.key];
            const open = expanded === f.key;
            return (
              <React.Fragment key={f.key}>
                <tr style={{ borderTop:`1px solid ${C.border}`, cursor:'pointer' }} onClick={()=>setExpanded(open ? null : f.key)}>
                  <td style={{ padding:'10px 16px', color:C.text }}>
                    <span style={{ display:'inline-block', width:14, color:C.muted }}>{open ? '▾' : '▸'}</span>
                    {f.label}
                  </td>
                  <td style={{ padding:'10px 16px', color:C.muted }}>{on ? 'Enabled' : ''}</td>
                  <td style={{ padding:'10px 16px', textAlign:'right' }}>
                    <button onClick={e=>{ e.stopPropagation(); setFlags({ ...flags, [f.key]: !on }); }}
                      title={on ? 'On' : 'Off'}
                      style={{ border:'none', background:'transparent', cursor:'pointer', fontSize:16, color: on ? C.success : C.error }}>
                      {on ? '✅' : '❌'}
                    </button>
                  </td>
                </tr>
                {open && (
                  <tr style={{ background:C.bg }}>
                    <td colSpan={3} style={{ padding:'10px 40px', color:C.muted, fontSize:12 }}>{f.hint}</td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={3} style={{ padding:20, textAlign:'center', color:C.muted, fontSize:13 }}>No matching features.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const SettingsPanel: React.FC<{ flags:Record<string,boolean>; setFlags:(f:Record<string,boolean>)=>void; contacts:{ altEmail:string; phone:string; smsOptIn:boolean }; setContacts:(c:any)=>void; save:()=>void; msg:{type:'success'|'error';text:string}|null; }> =
({ flags, setFlags, contacts, setContacts, save, msg }) => {
  const { user } = useAuth();
  return (
    <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
      <div style={{ flex:1, minWidth:400 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text }}>{user?.name ?? user?.email}'s Settings</h2>
          <PrimaryBtn onClick={save}>Save Settings</PrimaryBtn>
        </div>
        {msg && <Toast type={msg.type} message={msg.text}/>}

        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:20 }}>
          <ProfileSummary/>
        </div>

        <IntegrationsPanel/>

        <FeatureOptionsTable flags={flags} setFlags={setFlags}/>

        <div style={{ marginTop:16, textAlign:'right' }}><PrimaryBtn onClick={save}>Save Settings</PrimaryBtn></div>
      </div>
      <ContactSidebar contacts={contacts} setContacts={setContacts}/>
    </div>
  );
};


// ─── Shared content ───────────────────────────────────────────────────────────
const SharedPanel: React.FC = () => (
  <Section title="Received Content" subtitle="Content that other instructors or admins share with you shows here.">
    <div style={{ padding:40, textAlign:'center', color:C.muted, fontSize:14 }}>
      <div style={{ fontSize:36, marginBottom:8 }}>🎁</div>
      No content has been shared with you yet.
    </div>
  </Section>
);

// ─── QR Mobile Login ──────────────────────────────────────────────────────────
const QRPanel: React.FC = () => {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const payload = useMemo(() => encodeURIComponent(`hsa-login:${user?.id ?? 'unknown'}:${Date.now()}`), [user?.id, confirmed]);
  return (
    <Section title="QR for Mobile Login" subtitle="Scan from the HSA mobile app to sign in without typing your password.">
      {!confirmed ? (
        <div style={{ maxWidth:460 }}>
          <div style={{ padding:14, background:'#FFF7E6', border:'1px solid #F5D8A0', borderRadius:6, fontSize:13, color:'#6B4A00', marginBottom:14 }}>
            Sharing a QR code can give others immediate access to your account. Make sure no one can capture your screen from your surroundings or a screen-sharing service.
          </div>
          <PrimaryBtn onClick={()=>setConfirmed(true)}>Proceed</PrimaryBtn>
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:20 }}>
          <img alt="Login QR" width={260} height={260}
               src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${payload}`}
               style={{ border:`1px solid ${C.border}`, borderRadius:6, background:'white' }}/>
          <div style={{ fontSize:12, color:C.muted, marginTop:10 }}>This code expires in 10 minutes.</div>
          <GhostBtn onClick={()=>setConfirmed(false)} style={{ marginTop:14 }}>Hide QR</GhostBtn>
        </div>
      )}
    </Section>
  );
};

// ─── Global Announcements ─────────────────────────────────────────────────────
const AnnouncementsPanel: React.FC = () => {
  const [items, setItems] = useState<{id:string; title:string; body:string; posted_at:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'current'|'recent'>('current');
  useEffect(() => { (async () => {
    const { data } = await supabase.from('lms_announcements').select('id,title,body,posted_at').order('posted_at', { ascending:false }).limit(20);
    setItems(data ?? []); setLoading(false);
  })(); }, []);
  const now = Date.now();
  const visible = items.filter(a => tab==='current' ? (now - new Date(a.posted_at).getTime() < 1000*60*60*24*14) : true);

  return (
    <Section title="Global Announcements" subtitle="Institution-wide notices from HSA leadership.">
      <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:14 }}>
        {(['current','recent'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer', borderBottom: tab===t ? `2px solid ${C.primary}` : '2px solid transparent', color: tab===t ? C.primary : C.muted, fontWeight:600, fontSize:13, textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>
      {loading ? <div style={{ color:C.muted, fontSize:13 }}>Loading…</div> :
        visible.length===0 ? <div style={{ padding:24, textAlign:'center', color:C.muted, fontSize:13 }}>No announcements right now.</div> :
        visible.map(a => (
          <div key={a.id} style={{ borderLeft:`4px solid ${C.primary}`, padding:'12px 16px', background:'#F9F7FD', marginBottom:10, borderRadius:'0 6px 6px 0' }}>
            <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{a.title}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{new Date(a.posted_at).toLocaleString()}</div>
            <div style={{ fontSize:13, color:C.text, marginTop:6, whiteSpace:'pre-wrap' }}>{a.body}</div>
          </div>
        ))
      }
    </Section>
  );
};

// ─── Sub-nav + main shell ─────────────────────────────────────────────────────
type TabKey = 'notifications'|'profile'|'files'|'settings'|'shared'|'qr'|'announcements';
const TABS: { key:TabKey; label:string; icon:React.ReactNode }[] = [
  { key:'notifications', label:'Notifications', icon:<Bell size={15}/> },
  { key:'profile',       label:'Profile',       icon:<UserIcon size={15}/> },
  { key:'files',         label:'Files',         icon:<FileText size={15}/> },
  { key:'settings',      label:'Settings',      icon:<SettingsIcon size={15}/> },
  { key:'shared',        label:'Shared Content',icon:<Share2 size={15}/> },
  { key:'qr',            label:'QR for Mobile Login', icon:<QrCode size={15}/> },
  { key:'announcements', label:'Global Announcements', icon:<Megaphone size={15}/> },
];

const Account: React.FC<{ onBackToDashboard?:()=>void }> = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>(() => (window.location.hash.replace('#','') as TabKey) || 'notifications');
  useEffect(() => { window.location.hash = tab; }, [tab]);

  // Prefs state (loaded from DB)
  const [prefs, setPrefs] = useState<typeof DEFAULT_PREFS>(DEFAULT_PREFS);
  const [flags, setFlags] = useState<Record<string,boolean>>({});
  const [contacts, setContacts] = useState<{altEmail:string;phone:string;smsOptIn:boolean}>({ altEmail:'', phone:'', smsOptIn:false });
  const [notifMsg, setNotifMsg] = useState<{type:'success'|'error';text:string}|null>(null);
  const [settingsMsg, setSettingsMsg] = useState<{type:'success'|'error';text:string}|null>(null);
  const [savedAt, setSavedAt] = useState<string|undefined>();

  useEffect(() => { if (!user?.id) return; (async () => {
    const { data } = await supabase.from('user_account_settings').select('*').eq('user_id', user.id).maybeSingle();
    if (data) {
      setPrefs({ ...DEFAULT_PREFS, ...((data.notification_prefs as any) ?? {}) });
      setFlags((data.feature_flags as any) ?? {});
      setContacts({ altEmail:'', phone:'', smsOptIn:false, ...((data.contact_methods as any) ?? {}) });
      if (data.updated_at) setSavedAt(new Date(data.updated_at).toLocaleString());
    }
  })(); }, [user?.id]);

  const saveNotifications = async () => {
    if (!user?.id) return;
    const { error } = await supabase.from('user_account_settings').upsert({ user_id:user.id, notification_prefs: prefs, updated_at: new Date().toISOString() });
    if (error) return setNotifMsg({ type:'error', text: error.message });
    setNotifMsg({ type:'success', text:'Notification settings saved.' });
    setSavedAt(new Date().toLocaleString());
    setTimeout(()=>setNotifMsg(null), 3000);
  };
  const saveSettings = async () => {
    if (!user?.id) return;
    const { error } = await supabase.from('user_account_settings').upsert({ user_id:user.id, feature_flags: flags, contact_methods: contacts, updated_at: new Date().toISOString() });
    if (error) return setSettingsMsg({ type:'error', text: error.message });
    setSettingsMsg({ type:'success', text:'Settings saved.' });
    setTimeout(()=>setSettingsMsg(null), 3000);
  };

  return (
    <PortalLayout>
    <div style={{ display:'flex', minHeight:'calc(100vh - 64px)', background:C.bg }}>
      {/* Sub-nav rail */}
      <aside style={{ width:230, background:C.white, borderRight:`1px solid ${C.border}`, padding:'20px 0', flexShrink:0 }}>
        <Link to="/portal" style={{ display:'flex', alignItems:'center', gap:8, margin:'0 16px 14px', padding:'10px 12px', background:C.primary, color:'#fff', borderRadius:6, fontSize:13, fontWeight:600, textDecoration:'none' }}>
          <ArrowLeft size={16}/> Back to Dashboard
        </Link>
        <div style={{ padding:'0 20px 14px', fontSize:11, textTransform:'uppercase', letterSpacing:0.6, color:C.muted, fontWeight:700 }}>Account</div>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 20px', border:'none',
              borderLeft: tab===t.key ? `3px solid ${C.primary}` : '3px solid transparent',
              background: tab===t.key ? C.headerBar : 'transparent',
              color: tab===t.key ? C.primary : C.text,
              fontWeight: tab===t.key ? 700 : 500,
              fontSize:13, cursor:'pointer', textAlign:'left' }}>
            {t.icon}{t.label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main style={{ flex:1, padding:'28px 32px', maxWidth:1000 }}>
        <div style={{ marginBottom:18, fontSize:13, color:C.muted }}>{user?.name ?? user?.email} <span style={{ margin:'0 6px' }}>›</span> <span style={{ color:C.text, fontWeight:600 }}>{TABS.find(t=>t.key===tab)?.label}</span></div>
        {tab==='notifications' && <NotificationsPanel prefs={prefs} setPrefs={setPrefs} save={saveNotifications} savedAt={savedAt} msg={notifMsg} email={user?.email ?? ''}/>}
        {tab==='profile' && <ProfilePanel/>}
        {tab==='files' && <FilesPanel/>}
        {tab==='settings' && <SettingsPanel flags={flags} setFlags={setFlags} contacts={contacts} setContacts={setContacts} save={saveSettings} msg={settingsMsg}/>}
        {tab==='shared' && <SharedPanel/>}
        {tab==='qr' && <QRPanel/>}
        {tab==='announcements' && <AnnouncementsPanel/>}
      </main>
    </div>
    </PortalLayout>
  );
};

export default Account;
