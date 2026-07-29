// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const STUDENTS = ['Aaliyah Johnson','Carlos Martinez','Destiny Williams','Emmanuel Okafor','Fatima Hassan','Gloria Chen','Henry Brown','Isabella Reyes','James Nakamura','Keisha Thompson'];

const SKILLS = [
  { category:'Infection Control', items:['Hand washing (15+ seconds)','Gloving & PPE donning/doffing','Isolation precautions setup'] },
  { category:'Vital Signs', items:['Oral temperature (thermometer)','Radial pulse (1 min count)','Respiration rate (1 min count)','Manual blood pressure','Pulse oximetry reading'] },
  { category:'Personal Care', items:['Complete bed bath','Partial bed bath','Perineal care','Oral hygiene / denture care','Hair care & shaving','Nail care'] },
  { category:'Mobility & Safety', items:['Assist ambulation with gait belt','Wheelchair transfers','Bed to chair transfer','Repositioning in bed','Side rails operation'] },
  { category:'Elimination', items:['Bedpan & urinal use','Indwelling catheter care','Ostomy bag change','Urine specimen collection'] },
  { category:'Nutrition & Hydration', items:['Feeding assistance technique','I&O documentation','Thickened liquid prep'] },
  { category:'Documentation', items:['Intake & output charting','Vital signs charting','Incident report completion'] },
];

type SignOff = { signed: boolean; date?: string; initials?: string };

const ClinicalSkillsTab: React.FC = () => {
  const [selStudent, setSelStudent] = useState(STUDENTS[0]);
  const [signoffs, setSignoffs] = useState<Record<string,Record<string,SignOff>>>(() => {
    const s: Record<string,Record<string,SignOff>> = {};
    STUDENTS.forEach(st => {
      s[st] = {};
      SKILLS.forEach(cat => cat.items.forEach(item => {
        s[st][item] = { signed: Math.random() > 0.45, date: 'May 2026', initials: 'MT' };
      }));
    });
    return s;
  });
  const [selCategory, setSelCategory] = useState<string|null>(null);

  const toggleSkill = (item: string) => {
    setSignoffs(prev => ({
      ...prev,
      [selStudent]: {
        ...prev[selStudent],
        [item]: { signed: !prev[selStudent][item]?.signed, date: 'May 29, 2026', initials: 'MT' }
      }
    }));
  };

  const completedCount = (st: string) => SKILLS.flatMap(c => c.items).filter(i => signoffs[st]?.[i]?.signed).length;
  const totalSkills = SKILLS.flatMap(c => c.items).length;
  const pct = (st: string) => Math.round((completedCount(st) / totalSkills) * 100);

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Clinical Skills Sign-Off</h2>
        <button style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>Export Report</button>
      </div>

      <div style={{ display:'flex', gap:20 }}>
        {/* Student list */}
        <div style={{ width:220, flexShrink:0 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontFamily:'sans-serif', marginBottom:8 }}>Students</div>
          {STUDENTS.map(st => {
            const p = pct(st);
            const isActive = st === selStudent;
            return (
              <div key={st} onClick={() => setSelStudent(st)}
                style={{ padding:'10px 12px', borderRadius:6, cursor:'pointer', marginBottom:4, background:isActive ? '#EDE8F7' : C.white, border:`1px solid ${isActive ? C.primary : C.border}` }}>
                <div style={{ fontSize:13, fontWeight:600, color:isActive ? C.primary : C.text, fontFamily:'sans-serif', marginBottom:4 }}>
                  {st.split(' ')[0]}
                </div>
                <div style={{ height:4, borderRadius:2, background:C.border, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${p}%`, background: p >= 80 ? C.success : p >= 50 ? C.warn : C.error, transition:'width .3s' }}/>
                </div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginTop:3 }}>{completedCount(st)}/{totalSkills} skills • {p}%</div>
              </div>
            );
          })}
        </div>

        {/* Skills panel */}
        <div style={{ flex:1 }}>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ margin:'0 0 4px', fontSize:16, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{selStudent}</h3>
                <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif' }}>{completedCount(selStudent)} of {totalSkills} skills completed</div>
              </div>
              <div style={{ fontSize:28, fontWeight:800, color: pct(selStudent) >= 80 ? C.success : C.warn, fontFamily:'sans-serif' }}>{pct(selStudent)}%</div>
            </div>
            <div style={{ height:8, borderRadius:4, background:C.border, marginTop:12, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct(selStudent)}%`, background: pct(selStudent) >= 80 ? C.success : C.warn, transition:'width .4s' }}/>
            </div>
          </div>

          {SKILLS.map(cat => (
            <div key={cat.category} style={{ border:`1px solid ${C.border}`, borderRadius:6, marginBottom:10, overflow:'hidden', background:C.white }}>
              <div onClick={() => setSelCategory(selCategory === cat.category ? null : cat.category)}
                style={{ padding:'11px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', background:'#F0EDF7' }}>
                <span style={{ flex:1, fontWeight:700, fontSize:13, color:C.text, fontFamily:'sans-serif' }}>{cat.category}</span>
                <span style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>
                  {cat.items.filter(i => signoffs[selStudent]?.[i]?.signed).length}/{cat.items.length}
                </span>
                <span style={{ color:C.muted }}>{selCategory === cat.category ? '▲' : '▼'}</span>
              </div>
              {(selCategory === cat.category || true) && (
                <div>
                  {cat.items.map((item, i) => {
                    const s = signoffs[selStudent]?.[item];
                    return (
                      <div key={item} style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:12, borderTop:`1px solid ${C.border}`, cursor:'pointer' }}
                        onClick={() => toggleSkill(item)}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fc'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                        <div style={{ width:22, height:22, borderRadius:4, border:`2px solid ${s?.signed ? C.success : C.border}`, background:s?.signed ? C.success : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                          {s?.signed && <span style={{ color:'white', fontSize:13, fontWeight:700 }}>✓</span>}
                        </div>
                        <span style={{ flex:1, fontSize:13, color:C.text, fontFamily:'sans-serif' }}>{item}</span>
                        {s?.signed && (
                          <span style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>
                            {s.initials} • {s.date}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicalSkillsTab;