import React, { useEffect, useState } from 'react';
import { supabase } from './AuthContext';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8',
  success:'#127A1B', error:'#C0392B',
} as const;

const UpdatePassword: React.FC = () => {
  const [ready, setReady]       = useState(false);
  const [validLink, setValid]   = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  // Supabase parses the recovery token from the URL hash on page load
  // and fires PASSWORD_RECOVERY through onAuthStateChange.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setValid(true);
      }
      setReady(true);
    });
    // Also check existing session in case the event already fired
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValid(true);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async () => {
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => { window.location.replace('/portal/teach/login'); }, 2500);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:440, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.32)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 14px', display:'block' }}/>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Set a new password</h1>
        </div>

        {!ready ? (
          <p style={{ textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Verifying link…</p>
        ) : done ? (
          <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:6, padding:'14px 16px', color:C.success, fontFamily:'sans-serif', fontSize:13 }}>
            ✅ Password updated. Redirecting to sign in…
          </div>
        ) : !validLink ? (
          <div style={{ background:'#fdecea', border:'1px solid #f5c6c2', borderRadius:6, padding:'14px 16px', color:C.error, fontFamily:'sans-serif', fontSize:13, lineHeight:1.6 }}>
            ⚠️ This password reset link is invalid or has expired.<br/>
            <a href="/portal/teach/reset" style={{ color:C.primary, fontWeight:600 }}>Request a new link →</a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>New Password *</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="At least 8 characters"
                style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}/>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Confirm New Password *</label>
              <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }}
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
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;
