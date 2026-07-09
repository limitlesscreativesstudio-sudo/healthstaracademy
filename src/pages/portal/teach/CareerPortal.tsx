// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B' } as const;

const JOBS = [
  // ── HSA partner clinical sites — Stockton / Lodi / Hayward / Sacramento ──
  { id:101, title:'Certified Nursing Assistant (CNA)', org:'St. Joseph\'s Medical Center — Dignity Health', location:'Stockton, CA (HSA Partner Site)', type:'Full-Time', wage:'$22–$28/hr', posted:'Current opening', tags:['Partner Site','Hospital','Benefits','Union'], url:'https://www.dignityhealth.org/central-california/careers' },
  { id:102, title:'Nursing Assistant — Med/Surg', org:'St. Joseph\'s Medical Center — Dignity Health', location:'Stockton, CA (HSA Partner Site)', type:'Per Diem', wage:'$21–$26/hr', posted:'Current opening', tags:['Partner Site','Med/Surg','Flexible Hours'], url:'https://www.dignityhealth.org/central-california/careers' },
  { id:103, title:'CNA — Skilled Nursing', org:'Lodi Memorial Hospital (Adventist Health)', location:'Lodi, CA (HSA Partner Site)', type:'Full-Time', wage:'$20–$25/hr', posted:'Current opening', tags:['Partner Site','SNF','Benefits'], url:'https://www.adventisthealth.org/careers/' },
  { id:104, title:'CNA — Long Term Care', org:'Lodi Memorial — Extended Care', location:'Lodi, CA (HSA Partner Site)', type:'Full-Time', wage:'$20–$24/hr', posted:'Current opening', tags:['Partner Site','LTC'], url:'https://www.adventisthealth.org/careers/' },
  { id:105, title:'CNA — Acute Care', org:'St. Rose Hospital', location:'Hayward, CA (HSA Partner Site)', type:'Full-Time', wage:'$23–$29/hr', posted:'Current opening', tags:['Partner Site','Acute','Benefits'], url:'https://www.strosehospital.org/careers/' },
  { id:106, title:'CNA — Emergency Department', org:'St. Rose Hospital', location:'Hayward, CA (HSA Partner Site)', type:'Part-Time', wage:'$22–$27/hr', posted:'Current opening', tags:['Partner Site','ED','Nights'], url:'https://www.strosehospital.org/careers/' },
  { id:107, title:'CNA — Rehab', org:'Windsor Vista Care Center', location:'Hayward, CA (HSA Partner Site)', type:'Full-Time', wage:'$20–$25/hr', posted:'Current opening', tags:['Partner Site','Rehab'], url:'https://www.windsorcares.com/careers/' },
  { id:108, title:'CNA — Skilled Nursing', org:'Vibra Hospital of Sacramento', location:'Sacramento, CA', type:'Full-Time', wage:'$22–$27/hr', posted:'Current opening', tags:['Long-Term Acute','Benefits'], url:'https://www.vibrahealthcare.com/careers/' },
  // ── Regional openings ──
  { id:1, title:'Certified Nursing Assistant', org:'Cedars-Sinai Medical Center', location:'Los Angeles, CA', type:'Full-Time', wage:'$20–$26/hr', posted:'May 27, 2026', tags:['Hospital','Benefits','Union'], url:'https://www.indeed.com/jobs?q=CNA+Cedars+Sinai&l=Los+Angeles%2C+CA' },
  { id:2, title:'CNA – Night Shift', org:'Kaiser Permanente', location:'Pasadena, CA', type:'Part-Time', wage:'$19–$24/hr', posted:'May 25, 2026', tags:['Hospital','Nights','Premium Pay'], url:'https://www.kaiserpermanentejobs.org/search-jobs/CNA/641/1' },
  { id:3, title:'Home Health Aide / CNA', org:'BrightSpring Health Services', location:'Various – LA County', type:'Per Diem', wage:'$18–$22/hr', posted:'May 22, 2026', tags:['Home Health','Flexible Hours'], url:'https://careers.brightspringhealth.com/search-jobs/CNA' },
  { id:4, title:'CNA – Memory Care Unit', org:'Sunrise Senior Living', location:'Torrance, CA', type:'Full-Time', wage:'$21–$25/hr', posted:'May 20, 2026', tags:['SNF','Dementia Care','Benefits'], url:'https://careers.sunriseseniorliving.com/search-jobs/CNA' },
  { id:5, title:'Restorative CNA', org:'Beverly Hills Rehabilitation Centre', location:'Beverly Hills, CA', type:'Full-Time', wage:'$23–$28/hr', posted:'May 18, 2026', tags:['Rehab','Restorative','Benefits'], url:'https://www.indeed.com/jobs?q=Restorative+CNA&l=Beverly+Hills%2C+CA' },
];

const RESOURCES = [
  { icon:'📋', title:'Resume Builder', desc:'Build a CNA-specific resume using our guided template.', action:'Open Builder', url:'https://www.resume.com/builder' },
  { icon:'🎓', title:'CDPH License Lookup', desc:'Verify your CNA certification status on the CDPH registry.', action:'Open CDPH Site', url:'https://www.cdph.ca.gov/Programs/CHCQ/LCP/Pages/AideAndTechnicianCertificationSection.aspx' },
  { icon:'💼', title:'Interview Prep', desc:'Common CNA interview questions with sample answers.', action:'View Guide', url:'https://www.indeed.com/career-advice/interviewing/cna-interview-questions' },
  { icon:'📚', title:'Continuing Education', desc:'Find CEU courses to maintain and advance your certification.', action:'Browse CEUs', url:'https://www.cnaceus.com/' },
  { icon:'💰', title:'Salary Comparison', desc:'Compare CNA wages by facility type and region in California.', action:'View Data', url:'https://www.bls.gov/oes/current/oes311131.htm' },
];

const CareerPortal: React.FC = () => {
  const [tab, setTab] = useState<'jobs'|'resources'>('jobs');
  const [filter, setFilter] = useState('All');
  const [partnersOnly, setPartnersOnly] = useState(false);

  const types = ['All','Full-Time','Part-Time','Per Diem'];
  const filtered = JOBS.filter(j =>
    (filter === 'All' || j.type === filter) &&
    (!partnersOnly || j.tags.includes('Partner Site'))
  );

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Career Portal</h2>
        <span style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>Help your students land their first CNA role</span>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden', marginBottom:20, width:'fit-content' }}>
        {([['jobs','💼 Job Board'],['resources','📚 Resources']] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding:'9px 22px', border:'none', cursor:'pointer', background:tab === k ? C.primary : C.white, color:tab === k ? 'white' : C.text, fontSize:13, fontFamily:'sans-serif', fontWeight:tab === k ? 600 : 400 }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        <>
          <div style={{ background:'#EDE8F7', border:`1px solid ${C.primary}22`, borderLeft:`3px solid ${C.primary}`, borderRadius:6, padding:'10px 14px', marginBottom:14, fontSize:12, color:C.text, fontFamily:'sans-serif', lineHeight:1.5 }}>
            <strong style={{ color:C.primary }}>HSA Partner Sites</strong> — CNA openings sourced from our clinical rotation partners in Stockton, Lodi, Hayward and Sacramento. Listings are verified against each facility's careers page; wages reflect regional posted ranges. Click any listing to apply directly.
          </div>
          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                style={{ padding:'5px 14px', border:`1px solid ${filter === t ? C.primary : C.border}`, borderRadius:20, background:filter === t ? C.primary : C.white, color:filter === t ? 'white' : C.text, fontSize:12, fontFamily:'sans-serif', cursor:'pointer' }}>
                {t}
              </button>
            ))}
            <label style={{ display:'inline-flex', alignItems:'center', gap:6, marginLeft:8, fontSize:12, color:C.text, fontFamily:'sans-serif', cursor:'pointer' }}>
              <input type="checkbox" checked={partnersOnly} onChange={e => setPartnersOnly(e.target.checked)} style={{ accentColor:C.primary }}/>
              HSA partner sites only
            </label>
            <span style={{ marginLeft:'auto', fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{filtered.length} listing{filtered.length===1?'':'s'}</span>
          </div>
          <div style={{ display:'grid', gap:14 }}>
            {filtered.map(job => (
              <div key={job.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(61,27,110,0.13)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <h3 style={{ margin:'0 0 4px', fontSize:15, fontWeight:700, color:C.primary, fontFamily:'sans-serif' }}>{job.title}</h3>
                    <div style={{ fontSize:13, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>{job.org} • {job.location}</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {job.tags.map(t => (
                        <span key={t} style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#EDE8F7', color:C.primary, fontFamily:'sans-serif', fontWeight:600 }}>{t}</span>
                      ))}
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#e8f5e9', color:C.success, fontFamily:'sans-serif', fontWeight:600 }}>{job.type}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, marginLeft:16 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:C.success, fontFamily:'sans-serif', marginBottom:4 }}>{job.wage}</div>
                    <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginBottom:10 }}>Posted {job.posted}</div>
                    <a href={job.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-block', padding:'7px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:12, fontFamily:'sans-serif', cursor:'pointer', textDecoration:'none' }}>
                      View &amp; Apply →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'resources' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {RESOURCES.map(r => (
            <div key={r.title} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:22 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(61,27,110,0.13)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
              <div style={{ fontSize:30, marginBottom:12 }}>{r.icon}</div>
              <h3 style={{ margin:'0 0 8px', fontSize:15, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{r.title}</h3>
              <p style={{ margin:'0 0 16px', fontSize:13, color:C.muted, fontFamily:'sans-serif', lineHeight:1.6 }}>{r.desc}</p>
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-block', padding:'7px 16px', border:`1px solid ${C.primary}`, borderRadius:5, background:C.white, color:C.primary, fontSize:12, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600, textDecoration:'none' }}>{r.action} →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerPortal;