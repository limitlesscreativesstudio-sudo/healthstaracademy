import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './AuthContext';
import { showAuthError, showAuthSuccess, logAuthEvent } from '@/lib/authFeedback';
import { evaluatePassword, passwordScore, strengthLabel, isPasswordStrong } from '@/lib/passwordStrength';

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

const CheckRow: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontFamily:'sans-serif', color: ok ? C.success : C.muted }}>
    <span style={{ width:14 }}>{ok ? '✓' : '○'}</span>{label}
  </div>
);

const UpdatePassword: React.FC = () => {
  const [ready, setReady]       = useState(false);
  const [validLink, setValid]   = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setValid(true);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValid(true);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checks = useMemo(() => evaluatePassword(password), [password]);
  const score = passwordScore(checks);
  const { label: sLabel, color: sColor } = strengthLabel(score);
  const matches = confirm.length > 0 && password === confirm;
  const strong = isPasswordStrong(password);
  const canSubmit = strong && matches && !loading;

  const submit = async () => {
    setError('');
    if (!strong) {
      setError('Password does not meet strength requirements.');
      showAuthError('Password does not meet strength requirements.');
      return;
    }
    if (!matches) {
      setError('Passwords do not match.');
      showAuthError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      showAuthError('Update failed', err);
      return;
    }
    setDone(true);
    showAuthSuccess('Password updated — redirecting to sign in…');
    logAuthEvent({
      eventType: 'password_reset_completed',
      userId: user?.id, email: user?.email ?? null,
    });
    setTimeout(() => { window.location.replace('/portal/teach/login'); }, 2500);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <style>{`@keyframes hsa-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:460, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.32)' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 14px', display:'block' }}/>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Set a new password</h1>
        </div>

        {!ready ? (
          <p style={{ textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>
            <Spinner/>Verifying link…
          </p>
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
            <div style={{ marginBottom:10 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>New Password *</label>
              <input type="password" value={password} disabled={loading}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="At least 8 characters"
                style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}/>
            </div>

            {password.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ flex:1, height:6, background:'#eee', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${(score/5)*100}%`, height:'100%', background:sColor, transition:'width 0.2s' }}/>
                  </div>
                  <span style={{ fontSize:11, fontFamily:'sans-serif', color:sColor, fontWeight:700 }}>{sLabel}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2px 12px' }}>
                  <CheckRow ok={checks.length} label="8+ characters" />
                  <CheckRow ok={checks.upper}  label="Uppercase letter" />
                  <CheckRow ok={checks.lower}  label="Lowercase letter" />
                  <CheckRow ok={checks.digit}  label="Number" />
                  <CheckRow ok={checks.symbol} label="Symbol" />
                </div>
              </div>
            )}

            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:5 }}>Confirm New Password *</label>
              <input type="password" value={confirm} disabled={loading}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}
                style={{ width:'100%', border:`1.5px solid ${confirm.length > 0 && !matches ? C.error : C.border}`, borderRadius:6, padding:'10px 12px', fontSize:14, fontFamily:'sans-serif', color:C.text, boxSizing:'border-box', outline:'none' }}/>
              {confirm.length > 0 && (
                <div style={{ fontSize:11, marginTop:4, color: matches ? C.success : C.error, fontFamily:'sans-serif' }}>
                  {matches ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            {error && (
              <div style={{ background:'#fdecea', border:'1px solid #f5c6c2', borderRadius:6, padding:'10px 14px', marginBottom:16, color:C.error, fontSize:13, fontFamily:'sans-serif' }}>
                ⚠️ {error}
              </div>
            )}
            <button onClick={submit} disabled={!canSubmit}
              style={{ width:'100%', padding:'12px', background: canSubmit ? C.primary : C.muted, color:'white', border:'none', borderRadius:6, fontSize:15, fontWeight:700, fontFamily:'sans-serif', cursor: canSubmit ? 'pointer' : 'not-allowed', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
              {loading ? <><Spinner/>Updating password…</> : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;
