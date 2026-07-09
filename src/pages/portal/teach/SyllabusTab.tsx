// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useEffect, useState } from 'react';
import { supabase } from './AuthContext';
import ContentViewer, { type ContentSource } from '@/components/portal/ContentViewer';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B' } as const;

interface WeekItem { day: string; topics: string[]; materials: string[]; hours: number; }

const SYLLABUS: WeekItem[] = [
  { day:'Day 1', topics:['Orientation','CNA Role & Responsibilities','CDPH Regulations'], materials:['Student Handbook','State Exam Handbook','Zoom Setup Guide'], hours:8 },
  { day:'Day 2', topics:['Infection Control','Standard Precautions','Hand Hygiene'], materials:['California Module 1 PDF','Module01_PowerPoint.pptx'], hours:8 },
  { day:'Day 3', topics:['Safety & Emergency Procedures','Patient Rights','HIPAA'], materials:['California Module 2 PDF','Module02_PowerPoint.pptx'], hours:8 },
  { day:'Day 4', topics:['Basic Nursing Skills','Vital Signs','TPR & BP'], materials:['California Module 3 PDF','Module03_PowerPoint.pptx'], hours:8 },
  { day:'Day 5', topics:['Personal Care & ADLs','Bed Bath','Oral Hygiene'], materials:['Case Study 1','Case Study w/ Questions'], hours:8 },
  { day:'Day 6', topics:['Mobility & Transfers','Body Mechanics','Positioning'], materials:['California Module 4 PDF','Module04_PowerPoint.pptx'], hours:8 },
  { day:'Day 7', topics:['Nutrition & Hydration','Feeding Assistance','Special Diets'], materials:['California Module 5 PDF','Module05_PowerPoint.pptx'], hours:8 },
  { day:'Day 8', topics:['Elimination Needs','Catheter Care','Specimen Collection'], materials:['California Module 6 PDF','Module06_PowerPoint.pptx'], hours:8 },
  { day:'Day 9', topics:['Restorative Care','ROM Exercises','Assistive Devices'], materials:['California Module 7 PDF','Module07_PowerPoint.pptx'], hours:8 },
  { day:'Day 10',topics:['Mental Health & Social Needs','Dementia Care','End of Life'], materials:['California Module 8 PDF','Module08_PowerPoint.pptx'], hours:8 },
  { day:'Clinical Week 1', topics:['Supervised Clinical Practice','Skills Demonstration'], materials:['Clinical Skills Checklist','Skills Sign-off Sheet'], hours:40 },
  { day:'Clinical Week 2', topics:['Independent Clinical Practice','State Exam Prep'], materials:['State Exam Study Guide','Practice Questions'], hours:40 },
];

interface Props { courseUuid?: string; canEdit?: boolean; }

const SyllabusTab: React.FC<Props> = ({ courseUuid, canEdit = false }) => {
  const [expanded, setExpanded] = useState<string|null>('Day 1');
  const [syllabusUrl, setSyllabusUrl] = useState<string | null>(null);
  const [syllabusName, setSyllabusName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [moduleNames, setModuleNames] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);

  const syllabusPath = syllabusUrl ? (syllabusUrl.split('/course-files/')[1] ? decodeURIComponent(syllabusUrl.split('/course-files/')[1].split('?')[0]) : null) : null;
  const syllabusSource: ContentSource | null = syllabusUrl
    ? (syllabusPath ? { bucket: 'course-files', path: syllabusPath } : { url: syllabusUrl })
    : null;

  // Load existing syllabus + modules
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

  const totalHours = SYLLABUS.reduce((s, w) => s + w.hours, 0);
  const syllabusExt = (syllabusName?.split('.').pop() ?? '').toLowerCase();

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Course Syllabus</h2>
      </div>

      {/* Uploaded syllabus document */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:20 }}>
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
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, fontSize:13, fontFamily:'sans-serif' }}>
              <span>📎</span>
              <button onClick={() => setViewerOpen(true)} style={{ background:'none', border:'none', padding:0, color:C.primary, fontWeight:600, cursor:'pointer', textDecoration:'none' }}>
                {syllabusName ?? 'Syllabus'}
              </button>
              <button onClick={() => setViewerOpen(true)} style={{ marginLeft:6, padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.text, fontFamily:'sans-serif' }}>
                👁 Preview
              </button>
              {canEdit && <button onClick={removeDoc} style={{ marginLeft:'auto', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:12 }}>Remove</button>}
            </div>
          </>
        ) : (
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>
            {canEdit ? 'No syllabus document uploaded yet. Upload a PDF, Word doc, or PowerPoint to display it here for students.' : 'The instructor has not uploaded a syllabus document yet.'}
          </div>
        )}
      </div>
      <ContentViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        source={syllabusSource}
        fileName={syllabusName ?? undefined}
        fileType={syllabusExt}
        title="Course Syllabus"
      />

      {/* Course overview */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[['Program','CNA Hybrid Day NATP'],['Schedule','Mon–Fri, 6AM–4PM'],['Total Hours',`${totalHours} hrs`],['Credential','CDPH CNA Certificate']].map(([l,v]) => (
            <div key={l}>
              <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modules currently in this course */}
      {moduleNames.length > 0 && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:20 }}>
          <h3 style={{ margin:'0 0 12px', fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Modules in this Course</h3>
          <ol style={{ margin:0, paddingLeft:20, fontSize:13, color:C.text, fontFamily:'sans-serif', lineHeight:1.7 }}>
            {moduleNames.map(n => <li key={n}>{n}</li>)}
          </ol>
        </div>
      )}

      {/* Grading breakdown */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:20 }}>
        <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Grading Breakdown</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 24px' }}>
          {[['Daily Quizzes','20%'],['Case Studies','20%'],['Module Assignments','20%'],['Clinical Skills','25%'],['State Exam Readiness','15%']].map(([item, pct]) => (
            <div key={item} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${C.border}`, fontSize:13, fontFamily:'sans-serif' }}>
              <span style={{ color:C.text }}>{item}</span>
              <span style={{ fontWeight:700, color:C.primary }}>{pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-day breakdown */}
      <h3 style={{ fontSize:15, fontWeight:700, color:C.text, fontFamily:'sans-serif', margin:'0 0 12px' }}>Daily Schedule</h3>
      {SYLLABUS.map(w => (
        <div key={w.day} style={{ border:`1px solid ${C.border}`, borderRadius:6, marginBottom:8, overflow:'hidden', background:C.white }}>
          <div onClick={() => setExpanded(expanded === w.day ? null : w.day)}
            style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:expanded === w.day ? '#EDE8F7' : C.white }}>
            <div style={{ width:80, flexShrink:0, fontSize:12, fontWeight:700, color:C.primary, fontFamily:'sans-serif' }}>{w.day}</div>
            <div style={{ flex:1, fontSize:13, color:C.text, fontFamily:'sans-serif' }}>{w.topics.join(' • ')}</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif', marginRight:8 }}>{w.hours}h</div>
            <span style={{ color:C.muted, fontSize:12 }}>{expanded === w.day ? '▲' : '▼'}</span>
          </div>
          {expanded === w.day && (
            <div style={{ padding:'14px 16px 16px', borderTop:`1px solid ${C.border}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8, fontFamily:'sans-serif' }}>Topics</div>
                {w.topics.map(t => <div key={t} style={{ fontSize:13, color:C.text, fontFamily:'sans-serif', marginBottom:4, display:'flex', gap:6 }}><span style={{ color:C.primary }}>•</span>{t}</div>)}
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8, fontFamily:'sans-serif' }}>Materials</div>
                {w.materials.map(m => <div key={m} style={{ fontSize:13, color:C.text, fontFamily:'sans-serif', marginBottom:4, display:'flex', gap:6 }}><span style={{ color:C.accent }}>📎</span>{m}</div>)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SyllabusTab;
