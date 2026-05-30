import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', error:'#C0392B', success:'#127A1B' } as const;

const Inp: React.FC<{ label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string; disabled?:boolean }> = ({ label, value, onChange, type='text', placeholder, disabled }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'9px 12px', fontSize:13, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', background:disabled ? C.bg : C.white, opacity:disabled ? 0.7 : 1 }}/>
  </div>
);

const Section: React.FC<{ title:string; children:React.ReactNode }> = ({ title, children }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:24, marginBottom:20 }}>
    <h2 style={{ margin:'0 0 20px', fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif', paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>{title}</h2>
    {children}
  </div>
);

const Account: React.FC = () => {
  const [name, setName]         = useState('Ms. Thompson');
  const [email]                 = useState('thompson@healthstaracademy.org');
  const [title, setTitle]       = useState('CNA Lead Instructor');
  const [phone, setPhone]       = useState('(323) 555-0192');
  const [bio, setBio]           = useState('California-licensed CNA instructor with 8+ years teaching experience at CDPH-approved programs.');
  const [curPass, setCurPass]   = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confPass, setConfPass] = useState('');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSub, setNotifSub]     = useState(true);
  const [notifGrade, setNotifGrade] = useState(false);
  const [saved, setSaved]       = useState('');
  const [passErr, setPassErr]   = useState('');

  const saveProfile = () => { setSaved('profile'); setTimeout(() => setSaved(''), 3000); };
  const changePass  = () => {
    setPassErr('');
    if (!curPass) { setPassErr('Enter your current password.'); return; }
    if (newPass.length < 8) { setPassErr('New password must be at least 8 characters.'); return; }
    if (newPass !== confPass) { setPassErr('Passwords do not match.'); return; }
    // SWAP: await supabase.auth.updateUser({ password: newPass });
    setSaved('pass'); setCurPass(''); setNewPass(''); setConfPass('');
    setTimeout(() => setSaved(''), 3000);
  };

  const SaveBtn: React.FC<{ onClick:()=>void; savedKey:string }> = ({ onClick, savedKey }) => (
    <button onClick={onClick}
      style={{ padding:'9px 22px', background:saved === savedKey ? '#127A1B' : C.primary, color:'white', border:'none', borderRadius:6, fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer', transition:'background .2s' }}>
      {saved === savedKey ? '✓ Saved' : 'Save Changes'}
    </button>
  );

  return (
    <div style={{ padding:28, maxWidth:740, margin:'0 auto' }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 24px' }}>Account Settings</h1>

      <Section title="Profile Information">
        <div style={{ display:'flex', gap:20, marginBottom:20, alignItems:'center' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#9B6DD0,#5BC8E8)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ color:'white', fontSize:26, fontWeight:700, fontFamily:'sans-serif' }}>{name[0]}</span>
          </div>
          <div>
            <button style={{ padding:'7px 16px', border:`1px solid ${C.border}`, borderRadius:6, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor:'pointer', marginRight:8 }}>Change Photo</button>
            <button style={{ padding:'7px 16px', border:`1px solid ${C.error}22`, borderRadius:6, background:C.white, fontSize:12, fontFamily:'sans-serif', cursor:'pointer', color:C.error }}>Remove</button>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
          <Inp label="Full Name" value={name} onChange={setName}/>
          <Inp label="Email Address" value={email} onChange={()=>{}} disabled/>
          <Inp label="Job Title" value={title} onChange={setTitle} placeholder="e.g. CNA Lead Instructor"/>
          <Inp label="Phone Number" value={phone} onChange={setPhone} placeholder="(XXX) XXX-XXXX"/>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'9px 12px', fontSize:13, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', resize:'vertical', outline:'none' }}/>
        </div>
        <SaveBtn onClick={saveProfile} savedKey="profile"/>
      </Section>

      <Section title="Change Password">
        <Inp label="Current Password" value={curPass} onChange={setCurPass} type="password" placeholder="Your current password"/>
        <Inp label="New Password" value={newPass} onChange={setNewPass} type="password" placeholder="Min. 8 characters"/>
        <Inp label="Confirm New Password" value={confPass} onChange={setConfPass} type="password" placeholder="Re-enter new password"/>
        {passErr && <p style={{ color:C.error, fontSize:12, fontFamily:'sans-serif', marginBottom:12 }}>{passErr}</p>}
        <SaveBtn onClick={changePass} savedKey="pass"/>
      </Section>

      <Section title="Notification Preferences">
        {([['notifEmail', 'Email me when a student submits an assignment', notifEmail, setNotifEmail],
           ['notifSub',   'Email me when a student sends a message',       notifSub,   setNotifSub],
           ['notifGrade', 'Email me grade export summaries weekly',        notifGrade, setNotifGrade]] as const).map(([key, label, val, set]) => (
          <label key={key} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontFamily:'sans-serif', color:C.text, marginBottom:14, cursor:'pointer' }}>
            <input type="checkbox" checked={val as boolean} onChange={e => (set as Function)(e.target.checked)} style={{ accentColor:C.primary, width:16, height:16 }}/>
            {label}
          </label>
        ))}
        <SaveBtn onClick={()=>{ setSaved('notif'); setTimeout(()=>setSaved(''),3000); }} savedKey="notif"/>
      </Section>
    </div>
  );
};

export default Account;
