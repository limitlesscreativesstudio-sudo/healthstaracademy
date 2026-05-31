import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8',
  error:'#C0392B', success:'#127A1B',
} as const;

// ── Reusable field ────────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string; value: string; onChange: (v:string) => void;
  type?: string; placeholder?: string; disabled?: boolean;
  error?: string; hint?: string;
}> = ({ label, value, onChange, type='text', placeholder, disabled, error, hint }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      style={{ width:'100%', border:`1.5px solid ${error ? C.error : C.border}`, borderRadius:6, padding:'9px 12px', fontSize:13, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', background:disabled ? C.bg : C.white, opacity:disabled ? 0.7 : 1, transition:'border-color .15s' }}
      onFocus={e => { if(!disabled) e.target.style.borderColor = error ? C.error : C.primary; }}
      onBlur={e  => { e.target.style.borderColor = error ? C.error : C.border; }}/>
    {error && <div style={{ color:C.error, fontSize:12, fontFamily:'sans-serif', marginTop:4, display:'flex', gap:4 }}><span>⚠</span>{error}</div>}
    {hint && !error && <div style={{ color:C.muted, fontSize:11, fontFamily:'sans-serif', marginTop:3 }}>{hint}</div>}
  </div>
);

// ── Toast banner ──────────────────────────────────────────────────────────────
const Toast: React.FC<{ type:'success'|'error'; message:string }> = ({ type, message }) => (
  <div style={{ padding:'10px 14px', borderRadius:6, marginBottom:16, display:'flex', alignItems:'flex-start', gap:10,
    background: type==='success' ? '#e8f5e9' : '#fdecea',
    border: `1px solid ${type==='success' ? '#c8e6c9' : '#f5c6c2'}` }}>
    <span style={{ fontSize:16, flexShrink:0 }}>{type==='success' ? '✅' : '⚠️'}</span>
    <span style={{ fontSize:13, fontFamily:'sans-serif', color: type==='success' ? C.success : C.error, lineHeight:1.5 }}>{message}</span>
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section: React.FC<{ title:string; subtitle?:string; children:React.ReactNode }> = ({ title, subtitle, children }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:24, marginBottom:20 }}>
    <div style={{ marginBottom:20, paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
      <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{title}</h2>
      {subtitle && <p style={{ margin:'4px 0 0', fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Account: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth();

  // Profile fields — pre-filled from auth context
  const [name, setName]     = useState(user?.name ?? '');
  const [title, setTitle]   = useState('CNA Lead Instructor');
  const [phone, setPhone]   = useState('');
  const [bio, setBio]       = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type:'success'|'error'; text:string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields
  const [curPass, setCurPass]   = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confPass, setConfPass] = useState('');
  const [showCur, setShowCur]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [passErrors, setPassErrors] = useState<Record<string,string>>({});
  const [passMsg, setPassMsg]   = useState<{ type:'success'|'error'; text:string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSub, setNotifSub]     = useState(true);
  const [notifGrade, setNotifGrade] = useState(false);
  const [notifMsg, setNotifMsg]     = useState<{ type:'success'|'error'; text:string } | null>(null);

  // ── Save profile ────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setProfileMsg(null);
    if (!name.trim()) { setProfileMsg({ type:'error', text:'Name cannot be empty.' }); return; }
    setProfileLoading(true);
    const result = await updateProfile(name.trim());
    setProfileLoading(false);
    if (result.error) {
      setProfileMsg({ type:'error', text: result.error });
    } else {
      setProfileMsg({ type:'success', text:'Profile updated successfully!' });
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const changePassword = async () => {
    setPassMsg(null);
    const e: Record<string,string> = {};
    if (!curPass)           e.curPass  = 'Please enter your current password.';
    if (newPass.length < 8) e.newPass  = 'New password must be at least 8 characters.';
    if (newPass === curPass) e.newPass = 'New password must be different from your current password.';
    if (newPass !== confPass) e.confPass = 'Passwords do not match.';
    if (Object.keys(e).length > 0) { setPassErrors(e); return; }
    setPassErrors({});
    setPassLoading(true);
    const result = await updatePassword(curPass, newPass);
    setPassLoading(false);
    if (result.error) {
      setPassErrors({ curPass: result.error });
    } else {
      setPassMsg({ type:'success', text:'Password changed successfully! Use your new password next time you sign in.' });
      setCurPass(''); setNewPass(''); setConfPass('');
      setTimeout(() => setPassMsg(null), 5000);
    }
  };

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Instructor';

  return (
    <div style={{ padding:28, maxWidth:740, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Account Settings</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>
            Manage your profile, password, and notification preferences.
          </p>
        </div>
      </div>

      {/* ── Profile Information ── */}
      <Section title="Profile Information" subtitle="Your name will appear throughout the HSA portal.">
        {/* Avatar */}
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:22 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg,${C.primary},${C.accent})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(123,77,181,0.35)' }}>
            <span style={{ color:'white', fontSize:24, fontWeight:700, fontFamily:'sans-serif' }}>
              {name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{name || 'Your Name'}</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>{user?.email}</div>
            <span style={{ fontSize:11, padding:'2px 10px', borderRadius:20, background:'#EDE8F7', color:C.primary, fontFamily:'sans-serif', fontWeight:600, display:'inline-block', marginTop:5 }}>
              {roleLabel}
            </span>
          </div>
        </div>

        {profileMsg && <Toast type={profileMsg.type} message={profileMsg.text}/>}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
          <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name"/>
          <Field label="Email Address" value={user?.email ?? ''} onChange={()=>{}} disabled hint="Email cannot be changed here."/>
          <Field label="Job Title" value={title} onChange={setTitle} placeholder="e.g. CNA Lead Instructor"/>
          <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="(XXX) XXX-XXXX"/>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            placeholder="A short bio visible to students and colleagues…"
            style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:6, padding:'9px 12px', fontSize:13, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', resize:'vertical', outline:'none' }}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e  => (e.target.style.borderColor = C.border)}/>
        </div>
        <button onClick={saveProfile} disabled={profileLoading}
          style={{ padding:'9px 24px', background:profileLoading ? C.muted : C.primary, color:'white', border:'none', borderRadius:6, fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:profileLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:8 }}>
          {profileLoading
            ? <><span style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', display:'inline-block', animation:'hsa-spin 0.7s linear infinite' }}/>Saving…</>
            : 'Save Profile'}
        </button>
      </Section>

      {/* ── Change Password ── */}
      <Section title="Change Password" subtitle="After changing your password, you'll need to use the new one on your next sign-in.">
        {passMsg && <Toast type={passMsg.type} message={passMsg.text}/>}

        <div style={{ position:'relative' }}>
          <Field
            label="Current Password *"
            value={curPass} onChange={v => { setCurPass(v); setPassErrors(p => ({ ...p, curPass:'' })); }}
            type={showCur ? 'text' : 'password'}
            placeholder="Your current password"
            error={passErrors.curPass}/>
          <button onClick={() => setShowCur(!showCur)}
            style={{ position:'absolute', right:10, top:28, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:12, fontFamily:'sans-serif' }}>
            {showCur ? 'Hide' : 'Show'}
          </button>
        </div>

        <div style={{ position:'relative' }}>
          <Field
            label="New Password *"
            value={newPass} onChange={v => { setNewPass(v); setPassErrors(p => ({ ...p, newPass:'' })); }}
            type={showNew ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            error={passErrors.newPass}
            hint="Use a mix of letters, numbers, and symbols for a stronger password."/>
          <button onClick={() => setShowNew(!showNew)}
            style={{ position:'absolute', right:10, top:28, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:12, fontFamily:'sans-serif' }}>
            {showNew ? 'Hide' : 'Show'}
          </button>
        </div>

        <Field
          label="Confirm New Password *"
          value={confPass} onChange={v => { setConfPass(v); setPassErrors(p => ({ ...p, confPass:'' })); }}
          type={showNew ? 'text' : 'password'}
          placeholder="Re-enter your new password"
          error={passErrors.confPass}/>

        {/* Password strength indicator */}
        {newPass.length > 0 && (
          <div style={{ marginBottom:16, marginTop:-8 }}>
            <div style={{ display:'flex', gap:4, marginBottom:4 }}>
              {[1,2,3,4].map(i => {
                const strength = newPass.length >= 12 && /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) && /[^a-zA-Z0-9]/.test(newPass) ? 4
                  : newPass.length >= 10 && (/[A-Z]/.test(newPass) || /[0-9]/.test(newPass)) ? 3
                  : newPass.length >= 8 ? 2 : 1;
                const colors = ['','#e74c3c','#e67e22','#f1c40f','#27ae60'];
                return <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i <= strength ? colors[strength] : C.border, transition:'background .2s' }}/>;
              })}
            </div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>
              {newPass.length < 8 ? 'Too short' : newPass.length >= 12 && /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) ? 'Strong password' : newPass.length >= 10 ? 'Good password' : 'Acceptable — consider adding numbers or symbols'}
            </div>
          </div>
        )}

        <button onClick={changePassword} disabled={passLoading}
          style={{ padding:'9px 24px', background:passLoading ? C.muted : C.primary, color:'white', border:'none', borderRadius:6, fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:passLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:8 }}>
          {passLoading
            ? <><span style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', display:'inline-block', animation:'hsa-spin 0.7s linear infinite' }}/>Updating…</>
            : 'Update Password'}
        </button>
      </Section>

      {/* ── Notification Preferences ── */}
      <Section title="Notification Preferences">
        {notifMsg && <Toast type={notifMsg.type} message={notifMsg.text}/>}
        {[
          ['notifEmail', 'Email me when a student submits an assignment', notifEmail, setNotifEmail],
          ['notifSub',   'Email me when a student sends a message',       notifSub,   setNotifSub],
          ['notifGrade', 'Email me weekly grade export summaries',        notifGrade, setNotifGrade],
        ].map(([key, label, val, set]) => (
          <label key={key as string} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontFamily:'sans-serif', color:C.text, marginBottom:14, cursor:'pointer' }}>
            <input type="checkbox" checked={val as boolean} onChange={e => (set as Function)(e.target.checked)}
              style={{ accentColor:C.primary, width:16, height:16 }}/>
            {label as string}
          </label>
        ))}
        <button onClick={() => { setNotifMsg({ type:'success', text:'Notification preferences saved.' }); setTimeout(() => setNotifMsg(null), 3000); }}
          style={{ padding:'9px 24px', background:C.primary, color:'white', border:'none', borderRadius:6, fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer' }}>
          Save Preferences
        </button>
      </Section>

      <style>{`@keyframes hsa-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Account;
