// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect } from 'react';
import { supabase } from './AuthContext';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8',
  success:'#127A1B', error:'#C0392B', warn:'#E67E22',
} as const;

interface Person {
  enrollmentId: string;
  profileId:    string;
  name:         string;
  email:        string;
  role:         string;
  section:      string;
  pending:      boolean;
  avatarInitials: string;
}

interface Props {
  courseId?: string;
  canEdit?:  boolean;
}

const roleColor = (r: string) =>
  r === 'admin' || r === 'teacher' ? C.primary : r === 'instructor' ? C.accent : C.muted;

const StudentDashboard: React.FC<Props> = ({ courseId, canEdit }) => {
  const [people,       setPeople]       = useState<Person[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [showModal,    setShowModal]    = useState(false);
  const [emails,       setEmails]       = useState('');
  const [addRole,      setAddRole]      = useState('student');
  const [addSection,   setAddSection]   = useState('Hybrid Day NATP');
  const [addingPeople, setAddingPeople] = useState(false);
  const [addError,     setAddError]     = useState('');
  const [selected,     setSelected]     = useState<string[]>([]);

  // ── Load enrollments + pending invites ─────────────────────────────────────
  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const [enrRes, pendRes] = await Promise.all([
      supabase
        .from('enrollments')
        .select(`id, role, section_id, user_id, profiles ( id, full_name )`)
        .eq('course_id', courseId),
      supabase
        .from('pending_enrollments')
        .select('id, email, section, status, invited_at')
        .eq('course_id', courseId)
        .eq('status', 'pending'),
    ]);

    const built: Person[] = [];
    if (!enrRes.error && enrRes.data) {
      for (const row of enrRes.data as any[]) {
        const p = row.profiles;
        const name = p?.full_name ?? 'Student';
        const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
        built.push({
          enrollmentId:   row.id,
          profileId:      p?.id ?? '',
          name,
          email:          '',
          role:           row.role ?? 'student',
          section:        '',
          pending:        false,
          avatarInitials: initials || 'S',
        });
      }
    }
    if (!pendRes.error && pendRes.data) {
      for (const row of pendRes.data as any[]) {
        const initials = row.email.slice(0, 2).toUpperCase();
        built.push({
          enrollmentId:   `pending:${row.id}`,
          profileId:      '',
          name:           row.email.split('@')[0],
          email:          row.email,
          role:           'student',
          section:        row.section ?? '',
          pending:        true,
          avatarInitials: initials,
        });
      }
    }
    setPeople(built);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  // ── Add people by email ────────────────────────────────────────────────────
  const addPeople = async () => {
    if (!emails.trim() || !courseId) return;
    setAddingPeople(true);
    setAddError('');

    const list = emails.split(/[,\n]/).map(e => e.trim()).filter(Boolean);
    const errors: string[] = [];

    for (const email of list) {
      // Look up profile by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('email', email.toLowerCase())
        .single();

      if (!profile) {
        errors.push(`${email} — not found. They must have a Supabase account first.`);
        continue;
      }

      // Check not already enrolled
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', profile.id)
        .single();

      if (existing) {
        errors.push(`${email} — already enrolled.`);
        continue;
      }

      // Enroll them
      await supabase.from('enrollments').insert({
        course_id:  courseId,
        student_id: profile.id,
        section:    addSection,
      });
    }

    if (errors.length > 0) {
      setAddError(errors.join('\n'));
    } else {
      setShowModal(false);
      setEmails('');
    }
    await load();
    setAddingPeople(false);
  };

  // ── Remove (unenroll) ──────────────────────────────────────────────────────
  const removePerson = async (enrollmentId: string) => {
    setPeople(p => p.filter(x => x.enrollmentId !== enrollmentId));
    await supabase.from('enrollments').delete().eq('id', enrollmentId);
  };

  const removeSelected = async () => {
    if (!selected.length) return;
    if (!confirm(`Remove ${selected.length} person${selected.length > 1 ? 's' : ''} from this course?`)) return;
    for (const id of selected) await supabase.from('enrollments').delete().eq('id', id);
    setPeople(p => p.filter(x => !selected.includes(x.enrollmentId)));
    setSelected([]);
  };

  const toggleSelect = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const toggleAll = () =>
    setSelected(selected.length === visible.length ? [] : visible.map(p => p.enrollmentId));

  // ── Filter ─────────────────────────────────────────────────────────────────
  const visible = people.filter(p =>
    (roleFilter === 'all' || p.role === roleFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.email.toLowerCase().includes(search.toLowerCase()))
  );

  const students = people.filter(p => p.role === 'student');

  return (
    <div style={{ padding:24 }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h2 style={{ margin:'0 0 2px', fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>
            People
          </h2>
          <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>
            {people.length} enrolled • {students.length} student{students.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {selected.length > 0 && canEdit && (
            <button onClick={removeSelected}
              style={{ padding:'7px 14px', border:`1px solid ${C.error}`, borderRadius:5,
                background:'#fdecea', color:C.error, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
              🗑 Remove {selected.length} selected
            </button>
          )}
          {canEdit && (
            <button onClick={() => { setShowModal(true); setAddError(''); }}
              style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary,
                color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              + Add People
            </button>
          )}
        </div>
      </div>

      {/* No course warning */}
      {!courseId && (
        <div style={{ background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:6,
          padding:'12px 16px', marginBottom:16, fontSize:13, fontFamily:'sans-serif', color:'#7B6000' }}>
          ⚠️ Open a course first to manage its people.
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:C.white,
          border:`1px solid ${C.border}`, borderRadius:5, padding:'7px 12px', flex:1, maxWidth:340 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search people…"
            style={{ border:'none', outline:'none', flex:1, fontSize:13, fontFamily:'sans-serif', color:C.text }}/>
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px',
            fontSize:13, fontFamily:'sans-serif', color:C.text, background:C.white }}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>
          Loading people…
        </div>
      ) : people.length === 0 && courseId ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8,
          border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
          <div style={{ fontSize:16, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>
            No one enrolled yet
          </div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', marginBottom:20 }}>
            Add students, teachers, and TAs to this course.
          </div>
          {canEdit && (
            <button onClick={() => setShowModal(true)}
              style={{ padding:'9px 22px', border:'none', borderRadius:6, background:C.primary,
                color:'white', fontSize:14, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer' }}>
              + Add People
            </button>
          )}
        </div>
      ) : (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'sans-serif' }}>
            <thead>
              <tr style={{ background:'#F0EDF7', borderBottom:`1px solid ${C.border}` }}>
                {canEdit && (
                  <th style={{ padding:'9px 14px', width:40 }}>
                    <input type="checkbox"
                      checked={selected.length === visible.length && visible.length > 0}
                      onChange={toggleAll}
                      style={{ accentColor:C.primary }}/>
                  </th>
                )}
                {['Name','Role','Section','Last Activity',''].map(h => (
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11,
                    fontWeight:700, color:C.text }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.enrollmentId}
                  style={{ borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : 'none',
                    background: selected.includes(p.enrollmentId) ? '#F0EDF7' : C.white }}
                  onMouseEnter={e => { if (!selected.includes(p.enrollmentId)) (e.currentTarget as HTMLElement).style.background = '#faf9fc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected.includes(p.enrollmentId) ? '#F0EDF7' : C.white; }}>

                  {canEdit && (
                    <td style={{ padding:'10px 14px' }}>
                      <input type="checkbox"
                        checked={selected.includes(p.enrollmentId)}
                        onChange={() => toggleSelect(p.enrollmentId)}
                        style={{ accentColor:C.primary }}/>
                    </td>
                  )}

                  {/* Name */}
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
                        background: p.role === 'student' ? '#9B6DD0' : C.primary,
                        color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight:700 }}>
                        {p.avatarInitials}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:C.primary }}>{p.name}</div>
                        <div style={{ fontSize:11, color:C.muted }}>{p.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600,
                      background: roleColor(p.role) + '22', color: roleColor(p.role) }}>
                      {p.role.charAt(0).toUpperCase() + p.role.slice(1)}
                    </span>
                  </td>

                  {/* Section */}
                  <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>{p.section || '—'}</td>

                  {/* Last activity */}
                  <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>—</td>

                  {/* Actions */}
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button style={{ padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4,
                        background:C.white, fontSize:11, cursor:'pointer', color:C.text, fontFamily:'sans-serif' }}>
                        ✉ Message
                      </button>
                      {canEdit && (
                        <button onClick={() => {
                          if (confirm(`Remove ${p.name} from this course?`)) removePerson(p.enrollmentId);
                        }}
                          style={{ padding:'4px 8px', border:`1px solid ${C.error}33`, borderRadius:4,
                            background:C.white, fontSize:11, cursor:'pointer', color:C.error }}>
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div style={{ padding:24, textAlign:'center', color:C.muted, fontFamily:'sans-serif', fontSize:13 }}>
              No people match your filter.
            </div>
          )}
        </div>
      )}

      {/* Add People Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:C.white, borderRadius:10, padding:32, width:520,
            maxWidth:'95vw', maxHeight:'85vh', overflowY:'auto',
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>
                Add People
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:C.muted }}>×</button>
            </div>

            <div style={{ background:'#EDE8F7', borderRadius:6, padding:'10px 14px', marginBottom:18,
              fontSize:12, color:C.text, fontFamily:'sans-serif', lineHeight:1.6 }}>
              💡 The person must already have a Supabase account. Enter their email address below.
              If they don't have an account yet, create one in Supabase → Auth → Users first.
            </div>

            {addError && (
              <div style={{ background:'#fdecea', border:'1px solid #f5c6c6', borderRadius:6,
                padding:'10px 14px', marginBottom:16, fontSize:12, color:C.error,
                fontFamily:'sans-serif', whiteSpace:'pre-line' }}>
                {addError}
              </div>
            )}

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text,
                fontFamily:'sans-serif', marginBottom:6 }}>Email Addresses *</label>
              <textarea value={emails} onChange={e => setEmails(e.target.value)} rows={4}
                placeholder="student@example.com, another@example.com"
                style={{ width:'100%', border:`2px solid ${C.primary}`, borderRadius:5,
                  padding:'10px 12px', fontSize:13, fontFamily:'sans-serif',
                  boxSizing:'border-box', resize:'vertical', outline:'none', color:C.text }}/>
              <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginTop:4 }}>
                Separate multiple emails with a comma or new line.
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text,
                  fontFamily:'sans-serif', marginBottom:6 }}>Role</label>
                <select value={addRole} onChange={e => setAddRole(e.target.value)}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5,
                    padding:'9px 10px', fontSize:13, fontFamily:'sans-serif' }}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text,
                  fontFamily:'sans-serif', marginBottom:6 }}>Section</label>
                <select value={addSection} onChange={e => setAddSection(e.target.value)}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5,
                    padding:'9px 10px', fontSize:13, fontFamily:'sans-serif' }}>
                  <option>Hybrid Day NATP</option>
                  <option>Weekend NATP</option>
                </select>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding:'9px 22px', border:`1px solid ${C.border}`, borderRadius:5,
                  background:C.white, fontSize:14, fontFamily:'sans-serif', cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={addPeople} disabled={addingPeople || !emails.trim()}
                style={{ padding:'9px 22px', border:'none', borderRadius:5, background:C.primary,
                  color:'white', fontSize:14, fontWeight:700, fontFamily:'sans-serif',
                  cursor: addingPeople ? 'not-allowed' : 'pointer', opacity: addingPeople ? 0.7 : 1 }}>
                {addingPeople ? 'Adding…' : 'Add People'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;