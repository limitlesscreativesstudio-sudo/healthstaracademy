import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const C = {
  primary: '#7B4DB5', accent: '#5BC8E8',
  white: '#FFFFFF', border: '#D4C8E8',
  text: '#2D1B4E', muted: '#8878A8', error: '#C0392B',
} as const;

export default function CustomLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Login successful! The Supabase session is now set, so RoleGuard will
    // recognize the user. Redirect to the portal.
    if (data.user) {
      window.location.href = '/portal';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 14, padding: 44, width: 440, maxWidth: '100%', boxShadow: '0 28px 90px rgba(0,0,0,0.32)' }}>

        {/* Logo / heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy"
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block', filter: 'drop-shadow(0 6px 18px rgba(91,200,232,0.5))' }} />
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: C.text, fontFamily: 'sans-serif' }}>Health Star Academy</h1>
          <p style={{ margin: '5px 0 0', color: C.muted, fontSize: 13, fontFamily: 'sans-serif' }}>Portal Login — HSA LMS</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'sans-serif', marginBottom: 5 }}>Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@healthstaracademy.org"
              required
              style={{ width: '100%', border: \`1.5px solid \${C.border}\`, borderRadius: 6, padding: '10px 12px', fontSize: 14, fontFamily: 'sans-serif', color: C.text, boxSizing: 'border-box', outline: 'none' }}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'sans-serif', marginBottom: 5 }}>Password *</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              required
              style={{ width: '100%', border: \`1.5px solid \${C.border}\`, borderRadius: 6, padding: '10px 40px 10px 12px', fontSize: 14, fontFamily: 'sans-serif', color: C.text, boxSizing: 'border-box', outline: 'none' }}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 10, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 12, fontFamily: 'sans-serif' }}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: 18 }}>
            <a href="/portal/teach/reset" style={{ fontSize: 12, color: C.primary, fontFamily: 'sans-serif', textDecoration: 'none' }}>Forgot password?</a>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fdecea', border: '1px solid #f5c6c2', borderRadius: 6, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <span style={{ color: C.error, fontSize: 13, fontFamily: 'sans-serif', lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* Sign in button */}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: loading ? C.muted : C.primary, color: 'white', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 700, fontFamily: 'sans-serif', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'hsa-spin 0.7s linear infinite' }} />Signing in…</>
              : 'Sign In'}
          </button>
        </form>

        <style>{\`@keyframes hsa-spin { to { transform: rotate(360deg); } }\`}</style>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 11, color: C.muted, fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>Don't have an account?</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* Create account */}
        <a href="/portal/teach/create-account"
          style={{ display: 'block', width: '100%', padding: '11px', border: \`1.5px solid \${C.primary}\`, borderRadius: 6, fontSize: 14, fontWeight: 600, fontFamily: 'sans-serif', color: C.primary, textAlign: 'center', textDecoration: 'none', background: 'transparent', boxSizing: 'border-box' }}>
          Create Instructor / Admin Account
        </a>
      </div>
    </div>
  );
}
