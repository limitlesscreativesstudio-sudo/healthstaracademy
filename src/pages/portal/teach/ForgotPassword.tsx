import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from './AuthContext';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8',
  success:'#127A1B', error:'#C0392B',
} as const;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/portal/teach/update-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      toast.error(`Could not send reset email: ${err.message}`);
      return;
    }
    setSent(true);
    toast.success('Reset link sent — check your inbox.');
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:440, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.32)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 14px', display:'block' }}/>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Reset your password</h1>
          <p style={{ margin:'8px 0 0', color:C.muted, fontSize:13, fontFamily:'sans-serif' }}>
            Enter the email you use for the HSA portal. We'll send you a secure link to set a new password.
          </p>
        </div>

        {sent ? (
          <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:6, padding:'14px 16px', marginBottom:16, color:C.success, fontFamily:'sans-serif', fontSize:13, lineHeight:1.6 }}>
            ✅ Check your inbox at <strong>{email}</strong>. Click the link in the email to set a new password. The link expires in 1 hour.
          </div>
        ) : (
          <>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Email Address *</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@healthstaracademy.org"
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}/>
            </div>
            {error && (
              <div style={{ background:'#fdecea', border:'1px solid #f5c6c2', borderRadius:6, padding:'10px 14px', marginBottom:16, color:C.error, fontSize:13, fontFamily:'sans-serif' }}>
                ⚠️ {error}
              </div>
            )}
            <button onClick={submit} disabled={loading}
              style={{ width:'100%', padding:'12px', background:loading ? C.muted : C.primary, color:'white', border:'none', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', cursor:loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </>
        )}

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
