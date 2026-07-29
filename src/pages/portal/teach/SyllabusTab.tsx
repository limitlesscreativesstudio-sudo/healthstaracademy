// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useEffect, useState } from 'react';
import { supabase } from './AuthContext';
import ContentViewer, { type ContentSource } from '@/components/portal/ContentViewer';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B' } as const;

interface Props { courseUuid?: string; canEdit?: boolean; }

const S = {
  section: { background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:20 } as React.CSSProperties,
  h3: { margin:'0 0 12px', fontSize:15, fontWeight:700, color:C.text, fontFamily:'sans-serif' } as React.CSSProperties,
  p: { margin:'0 0 10px', fontSize:13.5, lineHeight:1.65, color:C.text, fontFamily:'sans-serif' } as React.CSSProperties,
  li: { fontSize:13.5, lineHeight:1.7, color:C.text, fontFamily:'sans-serif' } as React.CSSProperties,
  label: { fontSize:11, color:C.muted, fontFamily:'sans-serif', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:0.5, marginBottom:3 },
  value: { fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif' } as React.CSSProperties,
};

const SyllabusTab: React.FC<Props> = ({ courseUuid, canEdit = false }) => {
  const [syllabusUrl, setSyllabusUrl] = useState<string | null>(null);
  const [syllabusName, setSyllabusName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [moduleNames, setModuleNames] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);

  const syllabusPath = syllabusUrl ? (syllabusUrl.split('/course-files/')[1] ? decodeURIComponent(syllabusUrl.split('/course-files/')[1].split('?')[0]) : null) : null;
  const syllabusSource: ContentSource | null = syllabusUrl
    ? (syllabusPath ? { bucket: 'course-files', path: syllabusPath } : { url: syllabusUrl })
    : null;

  useEffect(() => {
    if (!courseUuid) return;
    (async () => {
      const { data: course } = await supabase.from('courses')
        .select('syllabus_url,syllabus_name').eq('id', courseUuid).maybeSingle();
      if (course) { setSyllabusUrl(course.syllabus_url ?? null); setSyllabusName(course.syllabus_name ?? null); }
      const { data: mods } = await supabase.from('modules')
        .select('title').eq('course_id', courseUuid).order('position');
      setModuleNames((mods ?? []).map(m => m.title));
    })();
  }, [courseUuid]);

  const upload = async (file: File) => {
    if (!courseUuid) { alert('Save the course first before uploading a syllabus.'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'pdf';
    const path = `${courseUuid}/syllabus/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('course-files')
      .upload(path, file, { contentType: file.type, upsert: true });
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return; }
    const { data: signed } = await supabase.storage.from('course-files').createSignedUrl(path, 60 * 60 * 24 * 365);
    const url = signed?.signedUrl ?? null;
    await supabase.from('courses').update({ syllabus_url: url, syllabus_name: file.name }).eq('id', courseUuid);
    setSyllabusUrl(url); setSyllabusName(file.name); setUploading(false);
  };

  const removeDoc = async () => {
    if (!courseUuid || !confirm('Remove the uploaded syllabus document?')) return;
    await supabase.from('courses').update({ syllabus_url: null, syllabus_name: null }).eq('id', courseUuid);
    setSyllabusUrl(null); setSyllabusName(null);
  };

  const syllabusExt = (syllabusName?.split('.').pop() ?? '').toLowerCase();

  return (
    <div style={{ padding:24, maxWidth:900 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Course Syllabus</h2>
      </div>

      {/* Uploaded syllabus document */}
      <div style={S.section}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Syllabus Document</h3>
          {canEdit && (
            <label style={{ padding:'7px 14px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:uploading ? 'wait' : 'pointer' }}>
              {uploading ? 'Uploading…' : (syllabusUrl ? '↻ Replace Document' : '📤 Upload Syllabus')}
              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" style={{ display:'none' }}
                disabled={uploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ''; }}/>
            </label>
          )}
        </div>
        {syllabusUrl ? (
          <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontFamily:'sans-serif' }}>
            <span>📎</span>
            <button onClick={() => setViewerOpen(true)} style={{ background:'none', border:'none', padding:0, color:C.primary, fontWeight:600, cursor:'pointer' }}>
              {syllabusName ?? 'Syllabus'}
            </button>
            <button onClick={() => setViewerOpen(true)} style={{ marginLeft:6, padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.text }}>
              👁 Preview
            </button>
            {canEdit && <button onClick={removeDoc} style={{ marginLeft:'auto', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:12 }}>Remove</button>}
          </div>
        ) : (
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>
            {canEdit ? 'No syllabus document uploaded yet. Upload a PDF or Word doc.' : 'The instructor has not uploaded a syllabus document yet.'}
          </div>
        )}
      </div>
      <ContentViewer open={viewerOpen} onClose={() => setViewerOpen(false)} source={syllabusSource} fileName={syllabusName ?? undefined} fileType={syllabusExt} title="Course Syllabus" />

      {/* Course overview */}
      <div style={S.section}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[['Program','Nurse Aide Training Program'],['Theory Hours','60 hrs'],['Clinical Hours','100 hrs'],['Credential','CDPH CNA Certificate']].map(([l,v]) => (
            <div key={l}>
              <div style={S.label}>{l}</div>
              <div style={S.value}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Course description */}
      <div style={S.section}>
        <h3 style={S.h3}>Course Description</h3>
        <p style={S.p}>
          Nurse Aide Training Program in conformance with the California Department of Public Health requirements. This program provides entry-level training that prepares students to care for residents in need — including ADLs such as feeding, bathing, dressing, and toileting.
        </p>
        <p style={S.p}>
          Students also learn infection prevention techniques, proper body mechanics, resident rights, abuse and neglect prevention, and care of dementia and Alzheimer's patients. Successful completers receive a certificate of completion, qualifying them to sit for the California state CNA exam. Graduates may work in nursing homes, hospitals, home care, personal care homes, assisted-living facilities, hospice, and more.
        </p>
        <p style={{ ...S.p, marginBottom:0 }}>
          <strong>Instructor-to-student ratio: 1:15.</strong> Students must sign in for both theory and clinical, and make up any missed hours. Total program length: <strong>160 hours</strong>.
        </p>
      </div>

      {/* Prerequisites */}
      <div style={S.section}>
        <h3 style={S.h3}>Prerequisites</h3>
        <ul style={{ margin:0, paddingLeft:20 }}>
          {['Program Application','Application fee of $175.00 — non-refundable in any event','Physical government-issued ID','Social Security Card','PPD or Negative Chest X-Ray, Live Scan','GED / High School Diploma (preferred but not required)','Entrance Exam','Physical Exam'].map(x => <li key={x} style={S.li}>{x}</li>)}
        </ul>
      </div>

      {/* Class schedule */}
      <div style={S.section}>
        <h3 style={S.h3}>Class Schedule</h3>
        <p style={S.p}><strong>Day Class:</strong> Monday–Friday 6:00 AM–3:00 PM (7.5 days); then Monday–Thursday 6:00 AM–3:00 PM (12.5 days). Total ≈ 4.625 weeks.</p>
        <p style={{ ...S.p, marginBottom:0 }}><strong>Weekend Class:</strong> Saturday & Sunday clinical 7:00 AM–6:00 PM — 16 days over 8 weeks.</p>
      </div>

      {/* Instructors */}
      <div style={S.section}>
        <h3 style={S.h3}>Instructor Information</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            { name:'Agnes Namitala, MSN, RN, FNP-C', phone:'661-472-2394', email:'agnesnamitala@gmail.com' },
            { name:'Kimberly Nelson, BSN, RN', phone:'209-612-2204', email:'knelson4677@gmail.com' },
          ].map(i => (
            <div key={i.name} style={{ padding:12, border:`1px solid ${C.border}`, borderRadius:6, background:C.bg }}>
              <div style={{ ...S.value, marginBottom:6 }}>{i.name}</div>
              <div style={S.li}>Office Hours: By Appointment</div>
              <div style={S.li}>📞 {i.phone}</div>
              <div style={S.li}>✉️ {i.email}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Textbook + uniform */}
      <div style={S.section}>
        <h3 style={S.h3}>Textbook & Uniform</h3>
        <p style={S.p}><strong>Textbook:</strong> Nursing Assistant Certification, California Edition — Carrie Jarosinski, RN, CNE, CWP. ISBN 978-1-941626-03-0.</p>
        <p style={{ ...S.p, marginBottom:0 }}><strong>Uniform:</strong> Navy blue scrub tops and bottoms. Shoes must be closed-toe (black or white). A watch with a second hand is recommended.</p>
      </div>

      {/* Methods */}
      <div style={S.section}>
        <h3 style={S.h3}>Methods of Instruction</h3>
        <p style={{ ...S.p, marginBottom:0 }}>
          Lecture, class discussion, group discussion, guest speakers, oral reports, group assignments, case studies, written assignments, skills lab, demonstrations, and clinical practice.
        </p>
      </div>

      {/* Academic policies */}
      <div style={S.section}>
        <h3 style={S.h3}>Academic Policies</h3>
        <ul style={{ margin:'0 0 12px', paddingLeft:20 }}>
          {['Participate in all class and clinical sessions.','Maintain a minimum overall 75% grade in theory.','Satisfactorily complete the required clinical hours and skills.','Successfully pass all clinical skills.'].map(x => <li key={x} style={S.li}>{x}</li>)}
        </ul>
      </div>

      {/* Grading scale */}
      <div style={S.section}>
        <h3 style={S.h3}>Grading Scale</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
          {[['A','100–90'],['B','89–80'],['C','79–70'],['D','69–60'],['F','59 & Below']].map(([g,r]) => (
            <div key={g} style={{ textAlign:'center', padding:10, border:`1px solid ${C.border}`, borderRadius:6 }}>
              <div style={{ fontSize:22, fontWeight:800, color:C.primary, fontFamily:'sans-serif' }}>{g}</div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{r}</div>
            </div>
          ))}
        </div>
        <p style={{ ...S.p, marginTop:14, marginBottom:0, fontSize:12.5, color:C.muted }}>
          Any unsafe or grossly negligent clinical performance results in dismissal from the clinical area, an "F" for the course, and ineligibility for readmission. Withdrawal following an unsafe clinical incident also results in ineligibility for readmission.
        </p>
      </div>

      {/* Student progress */}
      <div style={S.section}>
        <h3 style={S.h3}>Student Progress</h3>
        <p style={{ ...S.p, marginBottom:0 }}>
          Theory is measured by written quizzes, in-class assignments, and workbook assignments. A mid-term progress report is provided for theory and clinical. Any midterm below 75% (theory) or unsatisfactory (clinical) triggers a required meeting and remediation plan. Final theory grade must be ≥ 75% and clinical performance must be satisfactory to pass and be eligible for the state exam.
        </p>
      </div>

      {/* Modules currently in this course */}
      {moduleNames.length > 0 && (
        <div style={S.section}>
          <h3 style={S.h3}>Modules in this Course</h3>
          <ol style={{ margin:0, paddingLeft:20 }}>
            {moduleNames.map(n => <li key={n} style={S.li}>{n}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
};

export default SyllabusTab;
