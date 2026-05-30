import React, { useState } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const gColor = (p:number) => p>=80?C.success:p>=70?C.warn:C.error;

type Role = 'Student'|'Teacher'|'TA';
interface Person { id:number; name:string; av:string; email:string; role:Role; section:string; grade:number; attendance:number; lastActive:string; status:string; pending:boolean; }

// Matches real Canvas People section from screenshot
const INIT_PEOPLE: Person[] = [
  { id:1,  name:'Agnes Namitala',    av:'AN', email:'a.namitala@healthstaracademy.org',  role:'Teacher',  section:'Hybrid Day NATP', grade:0,  attendance:100, lastActive:'May 6 at 11:52am', status:'on-track', pending:false },
  { id:2,  name:'Aly',               av:'A',  email:'aly@healthstaracademy.org',           role:'Teacher',  section:'Hybrid Day NATP', grade:0,  attendance:100, lastActive:'Active',           status:'on-track', pending:false },
  { id:3,  name:'HSA CDPH Account',  av:'HC', email:'cdph@healthstaracademy.org',          role:'TA',       section:'Hybrid Day NATP', grade:0,  attendance:100, lastActive:'Active',           status:'on-track', pending:false },
  { id:4,  name:'Maria Angeles',     av:'MA', email:'m.angeles@healthstaracademy.org',     role:'TA',       section:'Hybrid Day NATP', grade:0,  attendance:100, lastActive:'—',                status:'on-track', pending:true  },
  { id:5,  name:'ELRU CDPH',         av:'EC', email:'elru@cdph.ca.gov',                    role:'TA',       section:'Hybrid Day NATP', grade:0,  attendance:100, lastActive:'Mar 21 at 11:56am',status:'on-track', pending:false },
  { id:6,  name:'Aaliyah Johnson',   av:'AJ', email:'a.johnson@student.hsa.edu',           role:'Student',  section:'Hybrid Day NATP', grade:92, attendance:98,  lastActive:'Today',            status:'on-track', pending:false },
  { id:7,  name:'Carlos Martinez',   av:'CM', email:'c.martinez@student.hsa.edu',          role:'Student',  section:'Hybrid Day NATP', grade:87, attendance:95,  lastActive:'Yesterday',        status:'on-track', pending:false },
  { id:8,  name:'Destiny Williams',  av:'DW', email:'d.williams@student.hsa.edu',          role:'Student',  section:'Hybrid Day NATP', grade:74, attendance:82,  lastActive:'3 days ago',       status:'at-risk',  pending:false },
  { id:9,  name:'Emmanuel Okafor',   av:'EO', email:'e.okafor@student.hsa.edu',            role:'Student',  section:'Hybrid Day NATP', grade:95, attendance:100, lastActive:'Today',            status:'on-track', pending:false },
  { id:10, name:'Fatima Hassan',     av:'FH', email:'f.hassan@student.hsa.edu',            role:'Student',  section:'Hybrid Day NATP', grade:81, attendance:90,  lastActive:'2 days ago',       status:'on-track', pending:false },
  { id:11, name:'Gloria Chen',       av:'GC', email:'g.chen@student.hsa.edu',              role:'Student',  section:'Hybrid Day NATP', grade:68, attendance:78,  lastActive:'5 days ago',       status:'critical', pending:false },
  { id:12, name:'Henry Brown',       av:'HB', email:'h.brown@student.hsa.edu',             role:'Student',  section:'Hybrid Day NATP', grade:88, attendance:94,  lastActive:'Yesterday',        status:'on-track', pending:false },
  { id:13, name:'Isabella Reyes',    av:'IR', email:'i.reyes@student.hsa.edu',             role:'Student',  section:'Hybrid Day NATP', grade:91, attendance:97,  lastActive:'Today',            status:'on-track', pending:false },
];

const roleColor = (r:Role) => r==='Teacher'?C.primary:r==='TA'?C.accent:'#555';
const statusColor = (s:string) => s==='on-track'?C.success:s==='at-risk'?C.warn:C.error;

const StudentDashboard: React.FC = () => {
  const [people, setPeople]     = useState<Person[]>(INIT_PEOPLE);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState<'all'|Role>('all');
  const [showModal, setShowModal]   = useState(false);
  const [modalTab, setModalTab]     = useState<'email'|'login'|'sis'>('email');
  const [emails, setEmails]         = useState('');
  const [addRole, setAddRole]       = useState<Role>('Student');
  const [addSection, setAddSection] = useState('Hybrid Day NATP');
  const [sectionOnly, setSectionOnly] = useState(false);

  const pendingCount = people.filter(p => p.pending).length;
  const students     = people.filter(p => p.role === 'Student');
  const avgGrade     = students.length ? Math.round(students.reduce((s,p)=>s+p.grade,0)/students.length) : 0;

  const visible = people.filter(p =>
    (roleFilter === 'all' || p.role === roleFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addPeople = () => {
    if (!emails.trim()) return;
    const newPeople = emails.split(/[,\n]/).filter(e=>e.trim()).map((e,i) => ({
      id:Date.now()+i, name:e.trim().split('@')[0], av:e.trim()[0].toUpperCase(), email:e.trim(),
      role:addRole, section:addSection, grade:0, attendance:100, lastActive:'—', status:'on-track', pending:true,
    }));
    setPeople(p => [...p, ...newPeople]);
    setEmails(''); setShowModal(false);
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>People</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ padding:'7px 16px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>⊞ Group Set</button>
          <button onClick={() => setShowModal(true)} style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ People</button>
        </div>
      </div>

      {pendingCount > 0 && (
        <div style={{ background:'#fff8e1', border:'1px solid #ffe082', borderRadius:6, padding:'10px 16px', marginBottom:16, fontSize:13, fontFamily:'sans-serif', color:'#7b6000' }}>
          ⚠ {pendingCount} invitation{pendingCount>1?'s':''} haven't been accepted.
        </div>
      )}

      {/* Tabs: Everyone / Groups */}
      <div style={{ display:'flex', gap:0, border:`1px solid ${C.border}`, borderRadius:5, overflow:'hidden', marginBottom:16, width:'fit-content' }}>
        {(['Everyone','Groups'] as const).map(t => (
          <button key={t} style={{ padding:'7px 22px', border:'none', cursor:'pointer', background:t==='Everyone'?C.primary:C.white, color:t==='Everyone'?'white':C.text, fontSize:13, fontFamily:'sans-serif', fontWeight:t==='Everyone'?600:400 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Search + role filter */}
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:'7px 12px', flex:1, maxWidth:320 }}>
          <span>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search people"
            style={{ border:'none', outline:'none', flex:1, fontSize:13, fontFamily:'sans-serif', color:C.text }}/>
        </div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value as any)}
          style={{ border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', color:C.text, background:C.white }}>
          <option value="all">All Roles</option>
          <option value="Teacher">Teacher</option>
          <option value="TA">TA</option>
          <option value="Student">Student</option>
        </select>
      </div>

      {/* People table */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'sans-serif' }}>
          <thead>
            <tr style={{ background:'#F0EDF7', borderBottom:`1px solid ${C.border}` }}>
              {['Name','Role','Section','Last Activity','Total Activity','Grade','Attendance',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:C.text }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => (
              <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}` }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#faf9fc'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=C.white}>
                <td style={{ padding:'10px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {p.pending && <div style={{ width:8, height:8, borderRadius:'50%', background:C.warn, flexShrink:0 }}/>}
                    <div style={{ width:34, height:34, borderRadius:'50%', background:p.role==='Student'?'#ccc':C.primary, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                      {p.av}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.primary }}>{p.name}</div>
                      <div style={{ fontSize:11, color:C.muted }}>{p.email}</div>
                    </div>
                    {p.pending && <span style={{ fontSize:10, padding:'2px 7px', background:'#fff8e1', border:'1px solid #ffe082', borderRadius:20, color:'#7b6000', fontWeight:600 }}>pending</span>}
                  </div>
                </td>
                <td style={{ padding:'10px 14px' }}>
                  <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:p.role==='Teacher'?'#EDE8F7':p.role==='TA'?'#e3f8fd':'#f5f3fa', color:roleColor(p.role), fontWeight:600 }}>
                    {p.role}
                  </span>
                </td>
                <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>{p.section}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>{p.lastActive}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>{p.role==='Student'?`${p.attendance}%`:'—'}</td>
                <td style={{ padding:'10px 14px', fontSize:13, color:p.role==='Student'?gColor(p.grade):C.muted, fontWeight:p.role==='Student'?700:400 }}>
                  {p.role==='Student' ? `${p.grade}%` : '—'}
                </td>
                <td style={{ padding:'10px 14px' }}>
                  {p.role==='Student' && (
                    <span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:statusColor(p.status)+'22', color:statusColor(p.status), fontWeight:600 }}>
                      {p.status.replace('-',' ')}
                    </span>
                  )}
                </td>
                <td style={{ padding:'10px 14px' }}>
                  <button style={{ padding:'4px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.text, fontFamily:'sans-serif' }}>✉ Message</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <div style={{ padding:28, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>No people match your filter.</div>}
      </div>

      {/* Add People Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:C.white, borderRadius:8, padding:32, width:540, maxWidth:'95vw', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Add People</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:C.muted }}>×</button>
            </div>

            {/* Add by */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:8 }}>Add user(s) by</div>
              <div style={{ display:'flex', gap:18 }}>
                {([['email','Email Address'],['login','Login ID'],['sis','SIS ID']] as const).map(([k,l]) => (
                  <label key={k} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
                    <input type="radio" name="addby" checked={modalTab===k} onChange={()=>setModalTab(k)} style={{ accentColor:C.primary }}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* Email/ID input */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>
                Email Addresses *
              </label>
              <textarea value={emails} onChange={e=>setEmails(e.target.value)} rows={4}
                placeholder="lsmith@myschool.edu, mfoster@myschool.edu"
                style={{ width:'100%', border:`2px solid ${C.primary}`, borderRadius:5, padding:'10px 12px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', resize:'vertical', outline:'none', color:C.text }}/>
              <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginTop:4 }}>
                When adding multiple users, use a comma or line break to separate users.
              </div>
            </div>

            {/* Role & Section */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Role</label>
                <select value={addRole} onChange={e=>setAddRole(e.target.value as Role)}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 10px', fontSize:13, fontFamily:'sans-serif' }}>
                  <option>Student</option><option>Teacher</option><option>TA</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>Section</label>
                <select value={addSection} onChange={e=>setAddSection(e.target.value)}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 10px', fontSize:13, fontFamily:'sans-serif' }}>
                  <option>Hybrid Day NATP</option><option>Weekend NATP</option>
                </select>
              </div>
            </div>

            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontFamily:'sans-serif', color:C.text, marginBottom:22, cursor:'pointer' }}>
              <input type="checkbox" checked={sectionOnly} onChange={e=>setSectionOnly(e.target.checked)} style={{ accentColor:C.primary }}/>
              Can interact with users in their section only
            </label>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={()=>setShowModal(false)} style={{ padding:'9px 22px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:14, fontFamily:'sans-serif', cursor:'pointer' }}>Cancel</button>
              <button onClick={addPeople} style={{ padding:'9px 22px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:14, fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
