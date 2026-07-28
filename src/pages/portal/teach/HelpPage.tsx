// @ts-nocheck
import React from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Link } from 'react-router-dom';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8' } as const;

const HelpPage: React.FC = () => {
  const resources = [
    { label: 'Portal Overview', desc: 'A quick tour of Dashboard, Courses, Calendar, and Inbox.', href: '/portal' },
    { label: 'Submit an Assignment', desc: 'Step-by-step guide to uploading your work in a course.', href: '/portal/courses' },
    { label: 'Take a Quiz or Exam', desc: 'What to expect during timed quizzes and CNA exams.', href: '/portal/courses' },
    { label: 'Check Your Grades', desc: 'View your grade matrix, feedback, and rubric scores.', href: '/portal/courses' },
    { label: 'Notifications & Inbox', desc: 'Manage how your instructors reach you.', href: '/portal/account#notifications' },
    { label: 'CNA State Exam Prep', desc: 'Practice questions and skills you must master before testing.', href: '/exam-prep' },
  ];

  return (
    <PortalLayout>
      <div style={{ padding:24, fontFamily:'sans-serif', maxWidth:900 }}>
        <h2 style={{ margin:'0 0 6px', fontSize:22, fontWeight:700, color:C.text }}>Help</h2>
        <p style={{ margin:'0 0 24px', color:C.muted, fontSize:13 }}>Little lost? Try here first.</p>

        <section style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:12 }}>Contact Health Star Academy</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
            <div>
              <div style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Phone</div>
              <a href="tel:2094032907" style={{ fontSize:15, color:C.primary, textDecoration:'none', fontWeight:600 }}>(209) 403-2907</a>
            </div>
            <div>
              <div style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Email</div>
              <a href="mailto:Healthstaracademy01@gmail.com" style={{ fontSize:14, color:C.primary, textDecoration:'none', fontWeight:600 }}>Healthstaracademy01@gmail.com</a>
            </div>
            <div>
              <div style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Office Hours</div>
              <div style={{ fontSize:13, color:C.text }}>Mon–Fri, 9 AM – 5 PM PT</div>
            </div>
          </div>
        </section>

        <section style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, marginBottom:20 }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, fontWeight:700, color:C.text }}>Getting Started</div>
          {resources.map(r => (
            <Link key={r.label} to={r.href} style={{ display:'block', padding:'14px 16px', borderBottom:`1px solid ${C.border}`, textDecoration:'none', color:C.text }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.primary }}>{r.label}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{r.desc}</div>
            </Link>
          ))}
        </section>

        <section style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>Report a Problem</div>
          <p style={{ fontSize:13, color:C.muted, margin:'0 0 12px' }}>
            Something not working? Send an Inbox message to your instructor or email the office directly.
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Link to="/portal/inbox" style={{ padding:'8px 18px', background:C.primary, color:'white', borderRadius:5, textDecoration:'none', fontWeight:600, fontSize:13 }}>Message Instructor</Link>
            <a href="mailto:Healthstaracademy01@gmail.com?subject=LMS%20Portal%20Issue" style={{ padding:'8px 18px', background:C.white, border:`1px solid ${C.border}`, color:C.text, borderRadius:5, textDecoration:'none', fontWeight:600, fontSize:13 }}>Email Support</a>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
};

export default HelpPage;
