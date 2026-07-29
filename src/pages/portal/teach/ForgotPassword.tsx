import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './AuthContext';
import { showAuthError, showAuthSuccess } from '@/lib/authFeedback';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#655480',
  success:'#127A1B', error:'#C0392B',
} as const;

const Spinner = () => (
  <span style={{
    display:'inline-block', width:14, height:14, marginRight:8, verticalAlign:'-2px',
    border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%',
    animation:'hsa-spin 0.7s linear infinite',
  }}/>
);

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    const clean = email.trim().toLowerCase();
    if (!clean) {
      setError('Please enter your email address.');
      showAuthError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Please enter a valid email address.');
      showAuthError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(clean, {
      redirectTo: `${window.location.origin}/portal/teach/update-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      showAuthError('Could not send reset email', err);
      return;
    }
    showAuthSuccess('Reset link sent — check your inbox.');
    navigate('/portal/teach/reset/sent', { state: { email: clean }, replace: true });
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <style>{`@keyframes hsa-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:440, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.32)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 14px', display:'block' }}/>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Reset your password</h1>
          <p style={{ margin:'8px 0 0', color:C.muted, fontSize:13, fontFamily:'sans-serif' }}>
            Enter the email you use for the HSA portal. We'll send you a secure link to set a new password.
          </p>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Email Address *</label>
          <input type="email" value={email} disabled={loading}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="you@healthstaracademy.org"
            onKeyDown={e => e.key === 'Enter' && !loading && submit()}
            style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none', background: loading ? '#f4f2fa' : '#fff' }}/>
        </div>
        {error && (
          <div style={{ background:'#fdecea', border:'1px solid #f5c6c2', borderRadius:6, padding:'10px 14px', marginBottom:16, color:C.error, fontSize:13, fontFamily:'sans-serif' }}>
            ⚠️ {error}
          </div>
        )}
        <button onClick={submit} disabled={loading || !email.trim()}
          style={{ width:'100%', padding:'12px', background: loading || !email.trim() ? C.muted : C.primary, color:'white', border:'none', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', cursor: loading || !email.trim() ? 'not-allowed' : 'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
          {loading ? <><Spinner/>Sending reset link…</> : 'Send Reset Link'}
        </button>

        <div style={{ textAlign:'center', marginTop:18 }}>
          <a href="/portal/teach/login" style={{ fontSize:13, color:C.primary, fontFamily:'sans-serif', textDecoration:'none' }}>
            ← Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
