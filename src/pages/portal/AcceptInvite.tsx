import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', error:'#C0392B', success:'#127A1B' } as const;

const AcceptInvite: React.FC = () => {
  const [step, setStep]         = useState<'verify'|'setup'|'done'>('verify');
  const [token, setToken]       = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const verify = async () => {
    if (!token.trim()) { setError('Please enter your invite code.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 700));
    // SWAP: verify token against supabase invites table
    setStep('setup'); setLoading(false);
  };

  const setup = async () => {
    if (!name.trim() || !password) { setError('Please fill in all fields.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 900));
    // SWAP: create account via supabase and mark invite used
    setStep('done'); setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E,#7B4DB5,#5BC8E8)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:460, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:68, height:68, borderRadius:'50%', margin:'0 auto 12px', background:'linear-gradient(135deg,#9B6DD0,#5BC8E8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'white', fontWeight:900, fontSize:22, fontFamily:'Georgia,serif' }}>H★</span>
          </div>
          <h1 style={{ margin:0, fontSize:21, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Accept Your Invitation</h1>
          <p style={{ margin:'5px 0 0', color:C.muted, fontSize:13, fontFamily:'sans-serif' }}>Health Star Academy — Instructor Portal</p>
        </div>

        {step === 'verify' && (
          <>
            <p style={{ fontSize:14, color:C.text, fontFamily:'sans-serif', marginBottom:18, lineHeight:1.6 }}>
              Enter the invite code from your email to get started.
            </p>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Invite Code *</label>
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="HSA-XXXX-XXXX"
              style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', marginBottom:16, outline:'none', letterSpacing:2 }}/>
            {error && <div style={{ color:C.error, fontSize:13, fontFamily:'sans-serif', marginBottom:12 }}>{error}</div>}
            <button onClick={verify} disabled={loading}
              style={{ width:'100%', padding:'11px', background:C.primary, color:'white', border:'none', borderRadius:6, fontSize:14, fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>
              {loading ? 'Verifying…' : 'Verify Code'}
            </button>
          </>
        )}

        {step === 'setup' && (
          <>
            <p style={{ fontSize:14, color:C.success, fontFamily:'sans-serif', marginBottom:18, fontWeight:600 }}>✓ Invite verified! Set up your account below.</p>
            {[['Full Name','text',name,setName,'Your full name'],['Password','password',password,setPassword,'Min. 8 characters'],['Confirm Password','password',confirm,setConfirm,'Re-enter password']].map(([label,type,val,set,ph]) => (
              <div key={label as string} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>{label as string} *</label>
                <input type={type as string} value={val as string} onChange={e => (set as Function)(e.target.value)} placeholder={ph as string}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}/>
              </div>
            ))}
            {error && <div style={{ color:C.error, fontSize:13, fontFamily:'sans-serif', marginBottom:12 }}>{error}</div>}
            <button onClick={setup} disabled={loading}
              style={{ width:'100%', padding:'11px', background:C.primary, color:'white', border:'none', borderRadius:6, fontSize:14, fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>
              {loading ? 'Creating account…' : 'Create My Account'}
            </button>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>🎉</div>
            <h2 style={{ fontSize:20, color:C.success, fontFamily:'sans-serif', marginBottom:8 }}>You're all set!</h2>
            <p style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif', marginBottom:24, lineHeight:1.6 }}>Your instructor account has been created. You can now sign in to the HSA LMS.</p>
            <a href="/portal/teach/login" style={{ display:'inline-block', padding:'11px 28px', background:C.primary, color:'white', borderRadius:6, fontSize:14, fontWeight:700, fontFamily:'sans-serif', textDecoration:'none' }}>Go to Sign In</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
