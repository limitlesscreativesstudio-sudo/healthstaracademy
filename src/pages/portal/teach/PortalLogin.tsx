import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const C = {
  nav:'#3D1B6E', primary:'#7B4DB5', accent:'#5BC8E8',
  bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8',
  text:'#2D1B4E', muted:'#8878A8', error:'#C0392B',
} as const;

const PortalLogin: React.FC = () => {
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Read ?redirect= param so we can land on the right page after login
  const getRedirect = () => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    // Safety check — only allow relative paths within our app
    if (r && r.startsWith('/portal/teach')) return r;
    return '/portal/teach';
  };

  // Already logged in — skip straight to portal
  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace(getRedirect());
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setError('');
    if (!email.trim())    { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Success — navigate to intended destination
    window.location.replace(getRedirect());
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:440, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.32)' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy"
            style={{ width:88, height:88, borderRadius:'50%', objectFit:'cover', margin:'0 auto 14px', display:'block', filter:'drop-shadow(0 6px 18px rgba(91,200,232,0.5))' }}/>
          <h1 style={{ margin:0, fontSize:23, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Health Star Academy</h1>
          <p style={{ margin:'5px 0 0', color:C.muted, fontSize:13, fontFamily:'sans-serif' }}>Instructor Portal — HSA LMS</p>
        </div>

        {/* Email */}
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Email Address *</label>
          <input
            type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="you@healthstaracademy.org"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', border:`1.5px solid ${error && !email ? C.error : C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', transition:'border-color .2s' }}
            onFocus={e  => (e.target.style.borderColor = C.primary)}
            onBlur={e   => (e.target.style.borderColor = C.border)}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom:8, position:'relative' }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Password *</label>
          <input
            type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', border:`1.5px solid ${error && !password ? C.error : C.border}`, borderRadius:6, padding:'10px 40px 10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', transition:'border-color .2s' }}
            onFocus={e  => (e.target.style.borderColor = C.primary)}
            onBlur={e   => (e.target.style.borderColor = C.border)}
          />
          <button onClick={() => setShowPass(!showPass)}
            style={{ position:'absolute', right:10, top:34, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:12, fontFamily:'sans-serif', padding:'2px 4px' }}>
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Forgot password link */}
        <div style={{ textAlign:'right', marginBottom:18 }}>
          <a href="/portal/teach/reset" style={{ fontSize:12, color:C.primary, fontFamily:'sans-serif', textDecoration:'none' }}>
            Forgot password?
          </a>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background:'#fdecea', border:'1px solid #f5c6c2', borderRadius:6, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
            <span style={{ color:C.error, fontSize:13, fontFamily:'sans-serif', lineHeight:1.5 }}>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button onClick={handleLogin} disabled={loading}
          style={{ width:'100%', padding:'12px', background:loading ? C.muted : C.primary, color:'white', border:'none', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', cursor:loading ? 'not-allowed' : 'pointer', transition:'background .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading ? (
            <>
              <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', display:'inline-block', animation:'hsa-spin 0.7s linear infinite' }}/>
              Signing in…
            </>
          ) : 'Sign In'}
        </button>

        <style>{`@keyframes hsa-spin { to { transform: rotate(360deg); } }`}</style>

        <p style={{ textAlign:'center', fontSize:12, color:C.muted, fontFamily:'sans-serif', marginTop:20, lineHeight:1.6 }}>
          Don't have an account?{' '}
          <a href="/portal/teach/invite" style={{ color:C.primary, textDecoration:'none', fontWeight:600 }}>Accept an invitation</a>
          <br/>
          Need access? Contact your HSA administrator.
        </p>
      </div>
    </div>
  );
};

export default PortalLogin;
