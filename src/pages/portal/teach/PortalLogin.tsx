import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from './AuthContext';

const C = {
  nav:'#3D1B6E', primary:'#7B4DB5', accent:'#5BC8E8',
  bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8',
  text:'#2D1B4E', muted:'#8878A8', error:'#C0392B', success:'#127A1B',
} as const;

const roleLabels: Record<UserRole, { label:string; icon:string; desc:string }> = {
  admin:      { label:'Administrator', icon:'🛡️', desc:'Full access — manage courses, users & settings' },
  instructor: { label:'Instructor',    icon:'🎓', desc:'Edit modules, grade assignments & manage students' },
  student:    { label:'Student',       icon:'📚', desc:'View courses and submit assignments' },
};

const PortalLogin: React.FC = () => {
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  // Dual-role state — shown when one email has both admin + instructor
  const [needsRole, setNeedsRole]     = useState(false);
  const [availableRoles, setRoles]    = useState<UserRole[]>([]);
  const [chosenRole, setChosenRole]   = useState<UserRole | null>(null);

  const getRedirect = (role?: UserRole) => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    if (r && r.startsWith('/portal')) return r;
    if (role === 'student') return '/portal';
    return '/portal/teach';
  };

  useEffect(() => {
    if (isAuthenticated) window.location.replace(getRedirect());
  }, [isAuthenticated]);

  const handleLogin = async (roleOverride?: UserRole) => {
    setError('');
    if (!email.trim())    { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setLoading(true);
    const result = await login(email.trim(), password, roleOverride);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      setNeedsRole(false);
      return;
    }

    if (result.needsRoleSelect && result.availableRoles) {
      setNeedsRole(true);
      setRoles(result.availableRoles);
      return;
    }

    window.location.replace(getRedirect(result.role));
  };

  const handleRoleSelect = async (role: UserRole) => {
    setChosenRole(role);
    await handleLogin(role);
  };

  // ── Role selector screen ──────────────────────────────────────────────────
  if (needsRole) {
    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ background:C.white, borderRadius:14, padding:44, width:440, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.32)' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', margin:'0 auto 12px', display:'block' }}/>
            <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Which account?</h2>
            <p style={{ margin:'6px 0 0', color:C.muted, fontSize:13, fontFamily:'sans-serif' }}>
              <strong>{email}</strong> has multiple roles.<br/>Select how you want to sign in today.
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {availableRoles.map(role => {
              const cfg = roleLabels[role];
              return (
                <button key={role} onClick={() => handleRoleSelect(role)} disabled={loading}
                  style={{ padding:'16px 18px', border:`2px solid ${chosenRole===role ? C.primary : C.border}`, borderRadius:8, background:chosenRole===role ? '#EDE8F7' : C.white, cursor:'pointer', textAlign:'left', transition:'all .15s', display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:28 }}>{cfg.icon}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:C.primary, fontFamily:'sans-serif' }}>{cfg.label}</div>
                    <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>{cfg.desc}</div>
                  </div>
                  {loading && chosenRole === role && (
                    <span style={{ marginLeft:'auto', width:16, height:16, border:'2px solid rgba(123,77,181,0.3)', borderTop:`2px solid ${C.primary}`, borderRadius:'50%', display:'inline-block', animation:'hsa-spin 0.7s linear infinite' }}/>
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={() => { setNeedsRole(false); setChosenRole(null); }}
            style={{ width:'100%', marginTop:16, padding:'9px', border:`1px solid ${C.border}`, borderRadius:6, background:'transparent', color:C.muted, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
            ← Back to Sign In
          </button>
          <style>{`@keyframes hsa-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Main login form ───────────────────────────────────────────────────────
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
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="you@healthstaracademy.org"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e  => (e.target.style.borderColor = C.border)}/>
        </div>

        {/* Password */}
        <div style={{ marginBottom:8, position:'relative' }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Password *</label>
          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:6, padding:'10px 40px 10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e  => (e.target.style.borderColor = C.border)}/>
          <button onClick={() => setShowPass(!showPass)}
            style={{ position:'absolute', right:10, top:34, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:12, fontFamily:'sans-serif' }}>
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Forgot password */}
        <div style={{ textAlign:'right', marginBottom:18 }}>
          <a href="/portal/teach/reset" style={{ fontSize:12, color:C.primary, fontFamily:'sans-serif', textDecoration:'none' }}>Forgot password?</a>
        </div>

        {/* Preview-only warning: lovable.js fetch proxy can block Supabase auth POSTs */}
        {typeof window !== 'undefined' && window.location.hostname.includes('id-preview--') && (
          <div style={{ background:'#FFF8E1', border:'1px solid #F0D67A', borderRadius:6, padding:'10px 14px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:16, flexShrink:0 }}>ℹ️</span>
            <span style={{ color:'#7A5A00', fontSize:12, fontFamily:'sans-serif', lineHeight:1.5 }}>
              <strong>Preview mode:</strong> Sign-in may fail here due to a preview-only network proxy. Use the live site:{' '}
              <a href="https://healthstaracademy.org/portal/teach/login" style={{ color:C.primary, fontWeight:600 }}>healthstaracademy.org/portal/teach/login</a>
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'#fdecea', border:'1px solid #f5c6c2', borderRadius:6, padding:'10px 14px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
            <span style={{ color:C.error, fontSize:13, fontFamily:'sans-serif', lineHeight:1.5 }}>{error}</span>
          </div>
        )}

        {/* Sign in button */}
        <button onClick={() => handleLogin()} disabled={loading}
          style={{ width:'100%', padding:'12px', background:loading ? C.muted : C.primary, color:'white', border:'none', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', cursor:loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading
            ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', display:'inline-block', animation:'hsa-spin 0.7s linear infinite' }}/>Signing in…</>
            : 'Sign In'}
        </button>

        <style>{`@keyframes hsa-spin { to { transform: rotate(360deg); } }`}</style>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'22px 0 16px' }}>
          <div style={{ flex:1, height:1, background:C.border }}/>
          <span style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', whiteSpace:'nowrap' }}>Don't have an account?</span>
          <div style={{ flex:1, height:1, background:C.border }}/>
        </div>

        {/* Create account — teachers & admins only */}
        <a href="/portal/teach/create-account"
          style={{ display:'block', width:'100%', padding:'11px', border:`1.5px solid ${C.primary}`, borderRadius:6, fontSize:14, fontWeight:600, fontFamily:'sans-serif', color:C.primary, textAlign:'center', textDecoration:'none', background:'transparent', boxSizing:'border-box' }}>
          Create Instructor / Admin Account
        </a>

        {/* Student note */}
        <div style={{ marginTop:14, padding:'10px 14px', background:'#f0edf7', borderRadius:6, display:'flex', gap:8, alignItems:'flex-start' }}>
          <span style={{ fontSize:14, flexShrink:0 }}>📚</span>
          <p style={{ margin:0, fontSize:12, color:C.muted, fontFamily:'sans-serif', lineHeight:1.6 }}>
            <strong style={{ color:C.text }}>Students:</strong> sign in here with the account from your invite email — you'll land on your Student Portal automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
