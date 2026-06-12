import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', white:'#FFFFFF',
  text:'#2D1B4E', muted:'#8878A8', success:'#127A1B',
} as const;

/**
 * Confirmation screen shown after the user requests a password reset email.
 * The email address is passed via router state from ForgotPassword.tsx.
 */
const ResetEmailSent: React.FC = () => {
  const { state } = useLocation() as { state?: { email?: string } };
  const email = state?.email || 'your email address';

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#3D1B6E 0%,#7B4DB5 55%,#5BC8E8 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, borderRadius:14, padding:44, width:460, maxWidth:'100%', boxShadow:'0 28px 90px rgba(0,0,0,0.32)', textAlign:'center' }}>
        <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 14px', display:'block' }}/>
        <div style={{ fontSize:56, lineHeight:1, marginBottom:10 }}>📬</div>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.text, fontFamily:'sans-serif' }}>Check your inbox</h1>
        <p style={{ margin:'12px 0 0', color:C.text, fontSize:14, fontFamily:'sans-serif', lineHeight:1.6 }}>
          We sent a password reset link to<br/>
          <strong style={{ color:C.primary }}>{email}</strong>
        </p>

        <div style={{ background:'#f6f1fc', border:`1px solid ${C.primary}30`, borderRadius:8, padding:'14px 16px', margin:'22px 0 18px', textAlign:'left', fontSize:13, fontFamily:'sans-serif', color:C.text, lineHeight:1.6 }}>
          <strong style={{ color:C.success }}>✓ Email sent successfully.</strong><br/>
          1. Open the email titled "Reset your HSA password".<br/>
          2. Click the secure link inside. It expires in <strong>1 hour</strong>.<br/>
          3. Choose a new password and sign in.
        </div>

        <p style={{ margin:'0 0 18px', color:C.muted, fontSize:12, fontFamily:'sans-serif' }}>
          Didn't receive it? Check your spam folder, or request a new link.
        </p>

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/portal/teach/reset" style={{ padding:'10px 18px', background:C.primary, color:'white', borderRadius:6, fontSize:13, fontWeight:700, fontFamily:'sans-serif', textDecoration:'none' }}>
            Resend Email
          </Link>
          <Link to="/portal/teach/login" style={{ padding:'10px 18px', background:'transparent', color:C.primary, border:`1.5px solid ${C.primary}`, borderRadius:6, fontSize:13, fontWeight:700, fontFamily:'sans-serif', textDecoration:'none' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetEmailSent;
