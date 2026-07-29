import React, { useState, useEffect } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', error:'#C0392B', success:'#127A1B', warn:'#E67E22' } as const;

type InviteStatus = 'checking' | 'valid' | 'invalid' | 'expired' | 'already_used';
type Step = 'verify' | 'setup' | 'done';

// ── Simulated token validation ────────────────────────────────────────────────
const validateToken = async (token: string): Promise<{ status: InviteStatus; email?: string; role?: string }> => {
  await new Promise(r => setTimeout(r, 900)); // simulate network

  // SWAP: const { data, error } = await supabase.from('invites')
  //   .select('*').eq('token', token).single();
  // SWAP: if (error || !data) return { status: 'invalid' };
  // SWAP: if (data.used_at) return { status: 'already_used' };
  // SWAP: if (new Date(data.expires_at) < new Date()) return { status: 'expired' };
  // SWAP: return { status: 'valid', email: data.email, role: data.role };

  if (!token || token.length < 6)          return { status: 'invalid' };
  if (token.toLowerCase() === 'expired')   return { status: 'expired' };
  if (token.toLowerCase() === 'used')      return { status: 'already_used' };
  return { status: 'valid', email: 'instructor@healthstaracademy.org', role: 'Teacher' };
};

// ── Error states ──────────────────────────────────────────────────────────────
const InviteError: React.FC<{ status: InviteStatus; onRetry: () => void }> = ({ status, onRetry }) => {
  const configs: Record<string, { icon:string; title:string; body:string; color:string }> = {
    invalid: {
      icon: '🔗',
      title: 'Invalid Invitation Link',
      body: 'This invite link doesn\'t exist or may have been typed incorrectly. Please check your email and try again, or contact your HSA administrator for a new link.',
      color: C.error,
    },
    expired: {
      icon: '⏰',
      title: 'This Invitation Has Expired',
      body: 'Invite links are valid for 7 days. This one has expired. Please contact your HSA administrator to send you a fresh invitation.',
      color: C.warn,
    },
    already_used: {
      icon: '✅',
      title: 'Invitation Already Used',
      body: 'This invite link has already been used to create an account. If that was you, please sign in. If you didn\'t do this, contact your administrator.',
      color: C.primary,
    },
  };

  const cfg = configs[status] ?? configs.invalid;

  return (
    <div style={{ textAlign:'center', padding:'10px 0' }}>
      <div style={{ fontSize:52, marginBottom:16 }}>{cfg.icon}</div>
      <h2 style={{ fontSize:20, fontWeight:700, color:cfg.color, fontFamily:'sans-serif', margin:'0 0 12px' }}>{cfg.title}</h2>
      <p style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif', lineHeight:1.7, margin:'0 0 24px' }}>{cfg.body}</p>
      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <button onClick={onRetry}
          style={{ padding:'10px 22px', border:`1.5px solid ${C.border}`, borderRadius:6, background:C.white, fontSize:14, fontFamily:'sans-serif', cursor:'pointer', color:C.text }}>
          Try a Different Code
        </button>
        <a href="/portal/teach/login"
          style={{ padding:'10px 22px', border:'none', borderRadius:6, background:C.primary, color:'white', fontSize:14, fontFamily:'sans-serif', cursor:'pointer', textDecoration:'none', display:'inline-block' }}>
          Sign In Instead
        </a>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const AcceptInvite: React.FC = () => {
  const [step, setStep]           = useState<Step>('verify');
  const [inviteStatus, setStatus] = useState<InviteStatus>('checking');
  const [tokenInput, setTokenInput] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('');
  const [name, setName]           = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string,string>>({});

  // Auto-read token from URL query param ?token=xxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      setTokenInput(t);
      checkToken(t);
    } else {
      setStatus('checking'); // wait for manual entry
      // Small delay to avoid flicker then show form
      setTimeout(() => setStatus('valid'), 100);
    }
  }, []);

  const checkToken = async (t: string) => {
    setLoading(true); setStatus('checking');
    const result = await validateToken(t);
    setStatus(result.status);
    if (result.status === 'valid') {
      if (result.email) setInviteEmail(result.email);
      if (result.role)  setInviteRole(result.role);
    }
    setLoading(false);
  };

  const verifyManual = async () => {
    if (!tokenInput.trim()) { setErrors({ token:'Please enter your invite code.' }); return; }
    setErrors({});
    await checkToken(tokenInput.trim());
  };

  const validateSetup = () => {
    const e: Record<string,string> = {};
    if (!name.trim())        e.name     = 'Full name is required.';
    if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (password !== confirm) e.confirm  = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const setup = async () => {
    if (!validateSetup()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    // SWAP: await supabase.auth.signUp({ email: inviteEmail, password });
    // SWAP: await supabase.from('profiles').insert({ full_name: name, role: inviteRole, ... });
    // SWAP: await supabase.from('invites').update({ used_at: new Date() }).eq('token', tokenInput);
    setStep('done');
    setLoading(false);
  };

  const Field: React.FC<{ label:string; id:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string; disabled?:boolean; hint?:string }> =
    ({ label, id, value, onChange, type='text', placeholder, disabled, hint }) => (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>{label} *</label>
      <input type={type} value={value} onChange={e => { onChange(e.target.value); setErrors(p => ({ ...p, [id]:'' })); }}
        placeholder={placeholder} disabled={disabled}
        style={{ width:'100%', border:`1.5px solid ${errors[id] ? C.error : C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', background:disabled ? C.bg : C.white }}
        onFocus={e => (e.target.style.borderColor = errors[id] ? C.error : C.primary)}
        onBlur={e  => (e.target.style.borderColor = errors[id] ? C.error : C.border)}
      />
      {errors[id] && <div style={{ color:C.error, fontSize:12, fontFamily:'sans-serif', marginTop:4, display:'flex', gap:4 }}><span>⚠</span>{errors[id]}</div>}
      {hint && !errors[id] && <div style={{ color:C.muted, fontSize:11, fontFamily:'sans-serif', marginTop:3 }}>{hint}</div>}
    </div>
  );

  // ── Checking token spinner ──
  if (inviteStatus === 'checking' && loading) {
    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E,#7B4DB5,#5BC8E8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:C.white, borderRadius:14, padding:44, width:420, textAlign:'center', boxShadow:'0 28px 90px rgba(0,0,0,0.3)' }}>
          <img src="/hsa-logo.png" alt="HSA" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', marginBottom:16 }}/>
          <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:14 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:C.primary, animation:`hsa-b 0.9s ease-in-out ${i*0.2}s infinite alternate` }}/>
            ))}
          </div>
          <p style={{ color:C.muted, fontFamily:'sans-serif', fontSize:14 }}>Validating your invitation…</p>
          <style>{`@keyframes hsa-b { from { opacity:.3; transform:translateY(0); } to { opacity:1; transform:translateY(-6px); } }`}</style>
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
          <h1 style={{ margin:0, fontSize:21, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Accept Your Invitation</h1>
          <p style={{ margin:'5px 0 0', color:C.muted, fontSize:13, fontFamily:'sans-serif' }}>Health Star Academy — Instructor Portal</p>
        </div>

        {/* Step: verify — manual token entry (no URL param) */}
        {step === 'verify' && (inviteStatus === 'valid' || inviteStatus === 'checking') && !loading && !window.location.search.includes('token') && (
          <>
            <p style={{ fontSize:14, color:C.text, fontFamily:'sans-serif', marginBottom:18, lineHeight:1.6 }}>
              Enter the invite code from your HSA welcome email to get started.
            </p>
            <Field label="Invite Code" id="token" value={tokenInput} onChange={setTokenInput} placeholder="e.g. HSA-XXXX-XXXX"/>
            <button onClick={verifyManual} disabled={loading}
              style={{ width:'100%', padding:'11px', background:C.primary, color:'white', border:'none', borderRadius:6, fontSize:14, fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>
              {loading ? 'Verifying…' : 'Verify Code →'}
            </button>
          </>
        )}

        {/* Step: error states */}
        {['invalid','expired','already_used'].includes(inviteStatus) && (
          <InviteError status={inviteStatus} onRetry={() => { setStatus('valid'); setTokenInput(''); }} />
        )}

        {/* Step: setup account */}
        {step === 'verify' && inviteStatus === 'valid' && (window.location.search.includes('token') || tokenInput) && !loading && (
          <>
            <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:6, padding:'10px 14px', marginBottom:20, display:'flex', gap:10, alignItems:'center' }}>
              <span style={{ fontSize:18 }}>✅</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.success, fontFamily:'sans-serif' }}>Invitation verified!</div>
                {inviteEmail && <div style={{ fontSize:12, color:C.success, fontFamily:'sans-serif' }}>Setting up account for: {inviteEmail}</div>}
                {inviteRole  && <div style={{ fontSize:12, color:C.success, fontFamily:'sans-serif' }}>Role: {inviteRole}</div>}
              </div>
            </div>

            <Field label="Full Name" id="name" value={name} onChange={setName} placeholder="Your full legal name"/>
            <div style={{ position:'relative' }}>
              <Field label="Password" id="password" value={password} onChange={setPassword} type={showPass?'text':'password'} placeholder="Min. 8 characters" hint="Use a mix of letters, numbers, and symbols."/>
              <button onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:10, top:28, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:12 }}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <Field label="Confirm Password" id="confirm" value={confirm} onChange={setConfirm} type={showPass?'text':'password'} placeholder="Re-enter password"/>

            <button onClick={setup} disabled={loading}
              style={{ width:'100%', padding:'11px', background:loading ? C.muted : C.primary, color:'white', border:'none', borderRadius:6, fontSize:14, fontWeight:700, fontFamily:'sans-serif', cursor:loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? (
                <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', display:'inline-block', animation:'hsa-spin 0.7s linear infinite' }}/>Creating account…</>
              ) : 'Create My Account →'}
            </button>
            <style>{`@keyframes hsa-spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'10px 0' }}>
            <div style={{ fontSize:56, marginBottom:14 }}>🎉</div>
            <h2 style={{ fontSize:22, color:C.success, fontFamily:'sans-serif', margin:'0 0 10px', fontWeight:700 }}>You're all set!</h2>
            <p style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif', marginBottom:28, lineHeight:1.7 }}>
              Your instructor account has been created for Health Star Academy. Click below to sign in.
            </p>
            <a href="/portal/teach/login"
              style={{ display:'inline-block', padding:'12px 32px', background:C.primary, color:'white', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', textDecoration:'none' }}>
              Go to Sign In →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
