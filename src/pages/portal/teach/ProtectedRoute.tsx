import React from 'react';
import { useAuth } from './AuthContext';

const C = { primary:'#7B4DB5', bg:'#F4F2FA', text:'#2D1B4E', muted:'#8878A8', border:'#D4C8E8', white:'#FFFFFF' } as const;

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
    <img src="/hsa-logo.png" alt="Health Star Academy" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', opacity:0.9 }}/>
    <div style={{ display:'flex', gap:6 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:10, height:10, borderRadius:'50%', background:C.primary,
          animation:`hsa-bounce 0.9s ease-in-out ${i * 0.2}s infinite alternate`,
        }}/>
      ))}
    </div>
    <style>{`
      @keyframes hsa-bounce {
        from { opacity: 0.3; transform: translateY(0); }
        to   { opacity: 1;   transform: translateY(-8px); }
      }
    `}</style>
    <p style={{ fontSize:14, color:C.muted, fontFamily:'sans-serif', margin:0 }}>Loading HSA Portal…</p>
  </div>
);

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = '/portal/teach/login' }) => {
  const { isAuthenticated, loading } = useAuth();

  // Still checking stored session — show spinner, don't flash login page
  if (loading) return <Spinner />;

  // Not logged in — redirect to login, preserving the intended destination
  if (!isAuthenticated) {
    const intended = window.location.pathname + window.location.search;
    const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(intended)}`;
    window.location.replace(loginUrl);
    return <Spinner />; // show spinner while redirect happens
  }

  return <>{children}</>;
};

export default ProtectedRoute;
