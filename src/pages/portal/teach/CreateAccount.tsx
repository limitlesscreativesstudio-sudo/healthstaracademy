import React, { useState } from 'react';
import { UserRole } from './AuthContext';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', error:'#C0392B', success:'#127A1B',
} as const;

// ── Only these domains / emails can self-register ─────────────────────────────
// SWAP: remove this check and handle via Supabase email allowlist or invite tokens
const ALLOWED_SELF_REGISTER: string[] = [
  'healthstaracademy.org',
  'healthstaracademy01@gmail.com',
  'limitlesscreativesstudio@gmail.com',
];

const canSelfRegister = (email: string): boolean => {
  const lower = email.trim().toLowerCase();
  return ALLOWED_SELF_REGISTER.some(rule =>
    rule.startsWith('@') ? lower.endsWith(rule) : lower === rule || lower.endsWith('@' + rule)
  );
};

const ROLE_OPTIONS: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value:'admin',      label:'Administrator', icon:'🛡️', desc:'Full access — manage courses, users, settings, and reports.' },
  { value:'instructor', label:'Instructor',    icon:'🎓', desc:'Create and edit modules, grade students, manage attendance.' },
];

const CreateAccount: React.FC = () => {
  const [step, setStep]       = useState<'form'|'done'>('form');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [role, setRole]       = useState<UserRole>('instructor');
  const [password, setPass]   = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowP]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!name.trim())         e.name    = 'Full name is required.';
    if (!email.trim())        e.email   = 'Email address is required.';
    else if (!email.includes('@')) e.email = 'Enter a valid email address.';
    else if (!canSelfRegister(email)) {
      e.email = 'This email is not authorised to create an account. Students must use an invitation link. Contact your HSA administrator if you need access.';
    }
    if (password.length < 8)  e.password = 'Password must be at least 8 characters.';
    if (password !== confirm)  e.confirm  = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    // SWAP: const { data, error } = await supabase.auth.signUp({ email, password });
    // SWAP: if (error) { setErrors({ email: error.message }); setLoading(false); return; }
    // SWAP: await supabase.from('profiles').insert({ id: data.user.id, full_name: name, role, email });
    setStep('done');
    setLoading(false);
  };

  const Field: React.FC<{ label:string; id:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string }> =
    ({ label, id, value, onChange, type='text', placeholder }) => (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>{label} *</label>
      <input type={type} value={value} onChange={e => { onChange(e.target.value); setErrors(p => ({ ...p, [id]:'' })); }}
        placeholder={placeholder}
        style={{ width:'100%', border:`1.5px solid ${errors[id] ? C.error : C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}
        onFocus={e => (e.target.style.borderColor = errors[id] ? C.error : C.primary)}
        onBlur={e  => (e.target.style.borderColor = errors[id] ? C.error : C.border)}/>
      {errors[id] && (
        <div style={{ color:C.error, fontSize:12, fontFamily:'sans-serif', marginTop:4, display:'flex', gap:4, alignItems:'flex-start' }}>
          <span style={{ flexShrink:0 }}>⚠</span>{errors[id]}
        </div>
      )}
    </div>
  );

  if (step === 'done') {
    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E,#7B4DB5,#5BC8E8)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ background:C.white, borderRadius:14, padding:44, width:440, maxWidth:'100%', textAlign:'center', boxShadow:'0 28px 90px rgba(0,0,0,0.3)' }}>
          <img src="/hsa-logo.png" alt="HSA" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 14px', display:'block' }}/>
          <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
          <h2 style={{ fontSize:22, fontWeight:700, color:C.success, fontFamily:'sans-serif', margin:'0 0 10px' }}>Account Created!</h2>
          <p style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif', lineHeight:1.7, margin:'0 0 8px' }}>
            Welcome to Health Star Academy, <strong style={{ color:C.text }}>{name}</strong>!
          </p>
          <div style={{ display:'inline-block', padding:'3px 14px', background:'#EDE8F7', borderRadius:20, fontSize:12, color:C.primary, fontFamily:'sans-serif', fontWeight:600, marginBottom:24 }}>
            Role: {role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
          <br/>
          <a href="/portal/teach/login"
            style={{ display:'inline-block', padding:'12px 32px', background:C.primary, color:'white', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', textDecoration:'none' }}>
            Sign In Now →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E,#7B4DB5,#5BC8E8)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:480, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy"
            style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 12px', display:'block', filter:'drop-shadow(0 4px 14px rgba(91,200,232,0.45))' }}/>
          <h1 style={{ margin:0, fontSize:21, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Create Your Account</h1>
          <p style={{ margin:'5px 0 0', color:C.muted, fontSize:13, fontFamily:'sans-serif' }}>Health Star Academy — Instructor Portal</p>
        </div>

        {/* Student notice */}
        <div style={{ background:'#fff8e1', border:'1px solid #ffe082', borderRadius:6, padding:'10px 14px', marginBottom:20, display:'flex', gap:8 }}>
          <span style={{ flexShrink:0 }}>📚</span>
          <p style={{ margin:0, fontSize:12, color:'#7b6000', fontFamily:'sans-serif', lineHeight:1.6 }}>
            <strong>Students:</strong> you cannot create an account here. Ask your instructor for an invitation link.
          </p>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:8 }}>I am a… *</label>
          <div style={{ display:'flex', gap:10 }}>
            {ROLE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setRole(opt.value)}
                style={{ flex:1, padding:'12px 10px', border:`2px solid ${role===opt.value ? C.primary : C.border}`, borderRadius:8, background:role===opt.value ? '#EDE8F7' : C.white, cursor:'pointer', textAlign:'center', transition:'all .15s' }}>
                <div style={{ fontSize:24, marginBottom:5 }}>{opt.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:role===opt.value ? C.primary : C.text, fontFamily:'sans-serif' }}>{opt.label}</div>
                <div style={{ fontSize:10, color:C.muted, fontFamily:'sans-serif', marginTop:3, lineHeight:1.4 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <Field label="Full Name" id="name" value={name} onChange={setName} placeholder="Your full legal name"/>
        <Field label="Email Address" id="email" value={email} onChange={setEmail} type="email" placeholder="you@healthstaracademy.org"/>
        <div style={{ position:'relative' }}>
          <Field label="Password" id="password" value={password} onChange={setPass} type={showPass?'text':'password'} placeholder="Min. 8 characters"/>
          <button onClick={() => setShowP(!showPass)} style={{ position:'absolute', right:10, top:28, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:12 }}>
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>
        <Field label="Confirm Password" id="confirm" value={confirm} onChange={setConfirm} type={showPass?'text':'password'} placeholder="Re-enter password"/>

        {/* Submit */}
        <button onClick={handleCreate} disabled={loading}
          style={{ width:'100%', padding:'12px', background:loading ? C.muted : C.primary, color:'white', border:'none', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', cursor:loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4 }}>
          {loading
            ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', display:'inline-block', animation:'hsa-spin 0.7s linear infinite' }}/>Creating account…</>
            : 'Create Account →'}
        </button>

        <style>{`@keyframes hsa-spin { to { transform: rotate(360deg); } }`}</style>

        <p style={{ textAlign:'center', fontSize:12, color:C.muted, fontFamily:'sans-serif', marginTop:16 }}>
          Already have an account?{' '}
          <a href="/portal/teach/login" style={{ color:C.primary, fontWeight:600, textDecoration:'none' }}>Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default CreateAccount;
