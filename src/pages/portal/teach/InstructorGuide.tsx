// @ts-nocheck
import React from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Link } from 'react-router-dom';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', white:'#FFFFFF', bg:'#F4F2FA', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', warn:'#E67E22' } as const;

interface Section { id: string; title: string; intro?: string; steps: string[]; tip?: string; }

const SECTIONS: Section[] = [
  {
    id: 'start',
    title: '1. Signing in and finding your way around',
    intro: 'Instructors sign in at the same portal address students use, then land on the course list.',
    steps: [
      'Go to the portal sign-in page and use your Health Star Academy email and password.',
      'The purple strip at the top always tells you which portal you are in — Instructor Portal, Student Portal, or Student Preview.',
      'Pick a cohort from the course list. Everything for that cohort lives inside its tabs.',
      'The tabs across the top are the whole course: Home, Modules, Quizzes, Grades, People, Files, Attendance and more. On a phone they collapse into the menu button.',
    ],
    tip: 'Click every tab once. Nothing you open breaks anything, and looking around for ten minutes teaches you more than any manual.',
  },
  {
    id: 'modules',
    title: '2. Modules — the daily road map',
    steps: [
      'Modules are the class days: Orientation, Day 1 through Day 23, Final Exam, Course Evaluation.',
      'Each day starts collapsed. Click the day title to expand it and see the items inside.',
      'Click any item — a page, a video, a document, a quiz — to open it right there. Use Previous / Next at the bottom to move through the day without going back out.',
      'Drag items by the handle to reorder them, or drag them into another day.',
      'The circle next to an item is the publish switch: filled means students can see it, empty means it is hidden.',
    ],
    tip: 'Publishing a day does not publish everything inside it. Check the items too.',
  },
  {
    id: 'publish',
    title: '3. Opening and locking work for students',
    steps: [
      'Every quiz and case study starts locked. Students see the title and a "Locked" notice until you open it.',
      'In the Quizzes tab, use the publish button on a quiz row to open it. Use it again to lock it back.',
      'Students get one attempt by default. To give someone another try, use the attempts control on the quiz row.',
      'Locking a quiz never deletes student work already submitted.',
    ],
  },
  {
    id: 'grading',
    title: '4. Grading quizzes and case studies',
    intro: 'Nothing is auto-scored. Every submission waits for you, and the student sees no score until you release it.',
    steps: [
      'Open Quizzes, then the Grade / Responses panel on a quiz to see who submitted.',
      'Open a student attempt to read their answers question by question, add points and a comment, and save a draft while you work.',
      'Click Release grade when you are done. That publishes the score to the student and notifies them.',
      'If a student left an attempt unfinished, you can close it out on their behalf and grade what they did.',
    ],
  },
  {
    id: 'paper',
    title: '5. Entering a grade for a quiz taken on paper',
    intro: 'When a student takes a quiz away from the computer, you can enter the corrected score directly — no online attempt needed.',
    steps: [
      'Open the course and go to the Quiz Gradebook tab.',
      'Find the student row and the quiz column. The cell will show a dash if they never took it online.',
      'Click the cell, type the score you graded on paper, and press Enter.',
      'The score saves as a released grade marked "Completed on paper — graded and entered by instructor" and appears in the student\'s grades right away.',
    ],
    tip: 'You can also click an existing score to correct it. Every change is kept in the record log for CDPH.',
  },
  {
    id: 'attendance',
    title: '6. Attendance and hours',
    steps: [
      'Open the Attendance tab, pick the class date, and mark each student Present, Absent, Late or Excused.',
      'Save. Theory hours roll up automatically — each attended day counts as 8 hours.',
      'Clinical hours and skill sign-offs live in the Clinical tab and feed the same progress totals.',
      'The Progress tab shows each student\'s milestones: attendance, theory hours, clinical hours, quizzes and sign-offs.',
    ],
  },
  {
    id: 'people',
    title: '7. Adding and managing students',
    steps: [
      'Open the People tab. You can add a student yourself — no admin needed.',
      'Enter their name and email to create the account, or send an invite they accept by email.',
      'New students appear in People, Modules, Gradebook and Attendance immediately.',
      'Click a student\'s name to open their profile: grades, attendance, clinical hours, skills and submissions in one place.',
    ],
  },
  {
    id: 'content',
    title: '8. Pages, files and content',
    steps: [
      'Files holds the course folders — presentations, curriculum resources, checklists and uploaded media.',
      'Pages holds written content such as conference and Zoom access pages. Titles can be renamed in place by clicking them.',
      'Word, PowerPoint, PDF and video files open inside the portal — students do not need to download anything.',
      'Edits save automatically about a second after you stop typing; watch the save indicator.',
    ],
  },
  {
    id: 'help',
    title: '9. When something looks wrong',
    steps: [
      'Open the Diagnostics tab (Portal Doctor) inside a course. It scans the roster, quizzes, modules, links and grading backlog and lists what needs fixing.',
      'Admins also get a pop-up when the watchdog finds an issue, with a Confirm & correct button.',
      'Anything you cannot resolve: message the office from the Inbox or email Healthstaracademy01@gmail.com.',
    ],
  },
];

const InstructorGuide: React.FC = () => (
  <PortalLayout>
    <div style={{ padding:24, fontFamily:'sans-serif', maxWidth:900 }}>
      <h1 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:C.text }}>Instructor Guide to the LMS</h1>
      <p style={{ margin:'0 0 18px', color:C.muted, fontSize:13.5, lineHeight:1.6 }}>
        Everything you need to run a cohort in the portal. Read what you need, then go click around —
        opening tabs and previewing items changes nothing for students.
      </p>

      <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'14px 18px', marginBottom:22 }}>
        <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:8 }}>Jump to</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ fontSize:12.5, color:C.primary, textDecoration:'none', fontWeight:600 }}>{s.title}</a>
          ))}
        </div>
      </div>

      {SECTIONS.map(s => (
        <section key={s.id} id={s.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:'18px 20px', marginBottom:16 }}>
          <h2 style={{ margin:'0 0 8px', fontSize:16.5, fontWeight:700, color:C.text }}>{s.title}</h2>
          {s.intro && <p style={{ margin:'0 0 10px', fontSize:13, color:C.muted, lineHeight:1.6 }}>{s.intro}</p>}
          <ol style={{ margin:0, paddingLeft:20, color:C.text, fontSize:13.5, lineHeight:1.75 }}>
            {s.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          {s.tip && (
            <div style={{ marginTop:12, background:'#FFF6E8', border:`1px solid ${C.warn}55`, borderRadius:6, padding:'9px 13px', fontSize:12.5, color:C.text }}>
              💡 {s.tip}
            </div>
          )}
        </section>
      ))}

      <section style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:'18px 20px' }}>
        <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:8 }}>Print this guide</div>
        <p style={{ fontSize:13, color:C.muted, margin:'0 0 12px' }}>
          Use your browser&rsquo;s print option to save a paper or PDF copy for new instructors.
        </p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={() => window.print()} style={{ padding:'8px 18px', background:C.primary, color:'white', border:'none', borderRadius:5, fontWeight:600, fontSize:13, cursor:'pointer' }}>🖨 Print / Save as PDF</button>
          <Link to="/portal/help" style={{ padding:'8px 18px', background:C.white, border:`1px solid ${C.border}`, color:C.text, borderRadius:5, textDecoration:'none', fontWeight:600, fontSize:13 }}>Back to Help</Link>
        </div>
      </section>
    </div>
  </PortalLayout>
);

export default InstructorGuide;
