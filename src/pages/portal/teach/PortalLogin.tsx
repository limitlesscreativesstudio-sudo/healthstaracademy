import React, { useState } from 'react';

const C = {
  nav:'#3D1B6E', primary:'#7B4DB5', accent:'#5BC8E8',
  bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8',
  text:'#2D1B4E', muted:'#8878A8', error:'#C0392B',
} as const;

interface PortalLoginProps { onLogin?: (user: { name: string; email: string; role: string }) => void; }

const PortalLogin: React.FC<PortalLoginProps> = ({ onLogin }) => {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    // SWAP: const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) { setError(error.message); setLoading(false); return; }
    await new Promise(r => setTimeout(r, 800));
    onLogin?.({ name: 'Ms. Thompson', email, role: 'teacher' });
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:440, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.32)' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:88, height:88, borderRadius:'50%', margin:'0 auto 14px', display:'block', objectFit:'cover', filter:'drop-shadow(0 6px 18px rgba(91,200,232,0.5))' }}/>
          <h1 style={{ margin:0, fontSize:23, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Health Star Academy</h1>
          <p style={{ margin:'5px 0 0', color:C.muted, fontSize:13, fontFamily:'sans-serif' }}>Instructor Portal — HSA LMS</p>
        </div>

        {/* Email */}
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@healthstaracademy.org"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}/>
        </div>

        {/* Password */}
        <div style={{ marginBottom:18, position:'relative' }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Password *</label>
          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'10px 40px 10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}/>
          <button onClick={() => setShowPass(!showPass)}
            style={{ position:'absolute', right:10, top:34, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:12, fontFamily:'sans-serif' }}>
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && (
          <div style={{ background:'#fdecea', border:'1px solid #f5c6c2', borderRadius:6, padding:'10px 14px', marginBottom:16, color:C.error, fontSize:13, fontFamily:'sans-serif' }}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          style={{ width:'100%', padding:'12px', background:C.primary, color:'white', border:'none', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', cursor:loading ? 'not-allowed' : 'pointer', opacity:loading ? 0.7 : 1, transition:'all .2s' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p style={{ textAlign:'center', fontSize:12, color:C.muted, fontFamily:'sans-serif', marginTop:18 }}>
          Need access? Contact your HSA administrator.
        </p>
      </div>
    </div>
  );
};

export default PortalLogin;
