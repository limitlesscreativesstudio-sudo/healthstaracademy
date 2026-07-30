// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect } from 'react';
import { supabase } from './AuthContext';
import StudentProfilePanel from '@/components/portal/StudentProfilePanel';

const C = {
  primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF',
  border:'#D4C8E8', text:'#2D1B4E', muted:'#655480',
  success:'#127A1B', error:'#C0392B', warn:'#E67E22',
} as const;

interface Person {
  enrollmentId: string;
  profileId:    string;
  userId:       string;
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
  const [cohortInfo,   setCohortInfo]   = useState<{ id: string; name: string; courseCount: number } | null>(null);
  const [enrollInCohort, setEnrollInCohort] = useState(true);
  const [resendingId,  setResendingId]  = useState<string | null>(null);
  const [resendMsg,    setResendMsg]    = useState<{ id: string; ok: boolean; text: string } | null>(null);
  const [instantMode,  setInstantMode]  = useState(false);
  const [credentials,  setCredentials]  = useState<Array<{ email: string; password: string }>>([]);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [profilePerson, setProfilePerson] = useState<Person | null>(null);



  // ── Load enrollments + pending invites ─────────────────────────────────────
  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    setAddError('');
    const [enrRes, pendRes] = await Promise.all([
      supabase
        .from('enrollments')
        .select('id, role, section_id, user_id')
        .eq('course_id', courseId),
      supabase
        .from('pending_enrollments')
        .select('id, email, section, role, status, invited_at')
        .eq('course_id', courseId)
        .eq('status', 'pending'),
    ]);

    if (enrRes.error || pendRes.error) {
      setAddError(`Could not load the roster: ${(enrRes.error ?? pendRes.error)?.message}`);
    }

    const built: Person[] = [];
    // Profiles are fetched separately (no FK relationship for a PostgREST embed).
    const userIds = (enrRes.data as any[] | null)?.map(r => r.user_id).filter(Boolean) ?? [];
    const profMap: Record<string, any> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from('profiles').select('id, user_id, full_name').in('user_id', userIds);
      for (const pr of (profs ?? []) as any[]) profMap[pr.user_id] = pr;
    }
    if (!enrRes.error && enrRes.data) {
      for (const row of enrRes.data as any[]) {
        const p = profMap[row.user_id];
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
          role:           row.role ?? 'student',
          section:        row.section ?? '',
          pending:        true,
          avatarInitials: initials,
        });
      }
    }
    // Enrich enrolled rows with real email addresses (auth data, service-role only).
    try {
      const { data: rosterData } = await supabase.functions.invoke('course-roster', {
        body: { action: 'list', courseId },
      });
      const byId: Record<string, any> = {};
      for (const e of (rosterData?.enrollments ?? [])) byId[e.id] = e;
      for (const person of built) {
        const match = byId[person.enrollmentId];
        if (match) {
          person.email = match.email ?? '';
          if (match.full_name) {
            person.name = match.full_name;
            person.avatarInitials = match.full_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
          } else if (match.email) {
            person.name = match.email.split('@')[0];
            person.avatarInitials = match.email.slice(0, 2).toUpperCase();
          }
        }
      }
    } catch { /* roster enrichment is best-effort */ }

    setPeople(built);

    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  // Look up the cohort for the current course + how many courses are linked to it.
  useEffect(() => {
    if (!courseId) { setCohortInfo(null); return; }
    (async () => {
      const { data: course } = await supabase
        .from('courses').select('cohort_id').eq('id', courseId).maybeSingle();
      if (!course?.cohort_id) { setCohortInfo(null); return; }
      const [{ data: cohort }, { count }] = await Promise.all([
        supabase.from('cohorts').select('id, name').eq('id', course.cohort_id).maybeSingle(),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('cohort_id', course.cohort_id),
      ]);
      if (cohort) setCohortInfo({ id: cohort.id, name: cohort.name, courseCount: count ?? 1 });
    })();
  }, [courseId]);

  // ── Add people by email (sends invitation email) ───────────────────────────
  const addPeople = async () => {
    if (!emails.trim() || !courseId) return;
    setAddingPeople(true);
    setAddError('');

    // Accepts "email", "Name <email>", or CSV lines like "First Last, email@x.com".
    const names: Record<string, string> = {};
    const list: string[] = [];
    for (const rawLine of emails.split(/[\n;]+/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const found = line.match(/[^\s,<>"]+@[^\s,<>"]+\.[^\s,<>"]+/g) ?? [];
      for (const addr of found) {
        const em = addr.trim().toLowerCase();
        if (!list.includes(em)) list.push(em);
        const label = line.replace(addr, '').replace(/[,<>"]/g, ' ').trim();
        if (label) names[em] = label;
      }
      if (found.length === 0) {
        for (const token of line.split(/[,\s]+/)) {
          const em = token.trim().toLowerCase();
          if (em && !list.includes(em)) list.push(em);
        }
      }
    }
    const bad = list.filter(e => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
    if (bad.length) {
      setAddError(`These don't look like valid email addresses: ${bad.join(', ')}`);
      setAddingPeople(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('invite-student', {
        body: {
          courseId,
          emails: list,
          names,
          mode: instantMode ? 'instant' : 'invite',
          section: addSection,
          role: addRole,
          cohortId: enrollInCohort && cohortInfo ? cohortInfo.id : null,
          redirectTo: `${window.location.origin}/portal/teach/login`,
        },
      });

      if (error) {
        setAddError(error.message || 'Failed to send invitations.');
      } else if (data?.error) {
        setAddError(String(data.error));
      } else {
        const results = data?.results ?? [];
        const failed = results.filter((r: any) => !r.ok);
        const creds = results
          .filter((r: any) => r.ok && r.tempPassword)
          .map((r: any) => ({ email: r.email, password: r.tempPassword }));
        if (creds.length) setCredentials(creds);
        if (failed.length > 0) {
          setAddError(failed.map((r: any) => `${r.email} — ${r.message}`).join('\n'));
        } else {
          if (!creds.length) setShowModal(false);
          setEmails('');
        }
      }
    } catch (e: any) {
      setAddError(e?.message || 'Failed to send invitations.');
    }

    await load();
    setAddingPeople(false);
  };

  // ── Resend a pending invitation ────────────────────────────────────────────
  const resendInvite = async (p: Person) => {
    if (!courseId || !p.email) return;
    setResendingId(p.enrollmentId);
    setResendMsg(null);
    const { data, error } = await supabase.functions.invoke('invite-student', {
      body: {
        courseId,
        emails: [p.email],
        section: p.section || null,
        role: p.role,
        cohortId: cohortInfo ? cohortInfo.id : null,
        redirectTo: `${window.location.origin}/portal/teach/login`,
      },
    });
    const result = (data?.results ?? [])[0];
    if (error || (result && !result.ok)) {
      setResendMsg({ id: p.enrollmentId, ok: false, text: error?.message || result?.message || 'Could not resend.' });
    } else {
      setResendMsg({ id: p.enrollmentId, ok: true, text: 'Invitation resent' });
    }
    setResendingId(null);
    await load();
    setTimeout(() => setResendMsg(null), 5000);
  };

  // ── Remove (unenroll or cancel invite) ─────────────────────────────────────

  const removeOne = async (id: string) => {
    if (id.startsWith('pending:')) {
      const peId = id.slice('pending:'.length);
      const { error } = await supabase.from('pending_enrollments').delete().eq('id', peId);
      return error?.message ?? null;
    }
    const { error } = await supabase.from('enrollments').delete().eq('id', id);
    return error?.message ?? null;
  };

  // ── Change a person's course role ──────────────────────────────────────────
  const changeRole = async (p: Person, role: string) => {
    if (!courseId) return;
    setSavingRoleId(p.enrollmentId);
    setPeople(list => list.map(x => x.enrollmentId === p.enrollmentId ? { ...x, role } : x));
    const { data, error } = await supabase.functions.invoke('course-roster', {
      body: { action: 'set_role', courseId, enrollmentId: p.enrollmentId, role },
    });
    if (error || data?.error) {
      setAddError(`Could not change role: ${error?.message || data?.error}`);
      await load();
    }
    setSavingRoleId(null);
  };

  const removePerson = async (enrollmentId: string) => {

    setPeople(p => p.filter(x => x.enrollmentId !== enrollmentId));
    const err = await removeOne(enrollmentId);
    if (err) { setAddError(`Could not remove: ${err}`); await load(); }
  };

  const removeSelected = async () => {
    if (!selected.length) return;
    if (!confirm(`Remove ${selected.length} person${selected.length > 1 ? 's' : ''} from this course?`)) return;
    for (const id of selected) await removeOne(id);
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

      {!showModal && addError && (
        <div role="alert" style={{ background:'#fdecea', border:`1px solid ${C.error}`, borderRadius:6,
          padding:'10px 14px', marginBottom:14, fontSize:12, color:C.error, fontFamily:'sans-serif', whiteSpace:'pre-line' }}>
          {addError}
        </div>
      )}


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
            <button onClick={() => { setShowModal(true); setAddError(''); setCredentials([]); }}
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
        <select aria-label="Filter by role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
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
                    <input type="checkbox" aria-label="Select all people"
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
                      <input type="checkbox" aria-label={`Select ${p.name ?? 'person'}`}
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
                        <div style={{ fontSize:13, fontWeight:600, color:C.primary, display:'flex', alignItems:'center', gap:6 }}>
                          {p.name}
                          {p.pending && (
                            <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:700,
                              background:'#FFF3CD', color:'#8A6D00', border:'1px solid #FFE082' }}>
                              PENDING
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:11, color:C.muted }}>{p.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding:'10px 14px' }}>
                    {canEdit && !p.pending ? (
                      <select
                        aria-label={`Role for ${p.name}`}
                        value={p.role}
                        disabled={savingRoleId === p.enrollmentId}
                        onChange={e => changeRole(p, e.target.value)}
                        style={{ fontSize:11, padding:'3px 8px', borderRadius:20, fontWeight:600,
                          border:`1px solid ${roleColor(p.role)}55`, color: roleColor(p.role),
                          background: roleColor(p.role) + '18', cursor:'pointer', fontFamily:'sans-serif' }}>
                        {['student','ta','teacher','instructor','observer','designer'].map(r => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600,
                        background: roleColor(p.role) + '22', color: roleColor(p.role) }}>
                        {p.role.charAt(0).toUpperCase() + p.role.slice(1)}
                      </span>
                    )}
                  </td>


                  {/* Section */}
                  <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>{p.section || '—'}</td>

                  {/* Last activity */}
                  <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>—</td>

                  {/* Actions */}
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                      <button style={{ padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4,
                        background:C.white, fontSize:11, cursor:'pointer', color:C.text, fontFamily:'sans-serif' }}>
                        ✉ Message
                      </button>
                      {canEdit && p.pending && (
                        <button
                          onClick={() => resendInvite(p)}
                          disabled={resendingId === p.enrollmentId}
                          title={`Resend invitation to ${p.email}`}
                          style={{ padding:'4px 10px', border:`1px solid ${C.primary}44`, borderRadius:4,
                            background:C.white, fontSize:11,
                            cursor: resendingId === p.enrollmentId ? 'wait' : 'pointer',
                            color:C.primary, fontWeight:600 }}>
                          {resendingId === p.enrollmentId ? 'Resending…' : '↻ Resend invite'}
                        </button>
                      )}
                      {resendMsg?.id === p.enrollmentId && (
                        <span style={{ fontSize:11, color: resendMsg.ok ? '#1E7A34' : C.error }}>
                          {resendMsg.text}
                        </span>
                      )}

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
              💡 Paste emails, or full rows like <em>Jane Doe, jane@example.com</em> (one per line).
              You can also upload a CSV exported from your enrollment sheet.

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

              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10, flexWrap:'wrap' }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.primary, cursor:'pointer',
                  border:`1px dashed ${C.primary}`, borderRadius:5, padding:'6px 12px', fontFamily:'sans-serif' }}>
                  ⬆ Upload CSV
                  <input type="file" accept=".csv,text/csv,text/plain" style={{ display:'none' }}
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      const lines = text.split(/\r?\n/).filter(l => /@/.test(l));
                      setEmails(prev => (prev ? prev + '\n' : '') + lines.join('\n'));
                      e.currentTarget.value = '';
                    }}/>
                </label>
                <span style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>
                  Any CSV works — rows containing an email address are imported.
                </span>
              </div>

              <label style={{ display:'flex', alignItems:'flex-start', gap:10, marginTop:12,
                padding:'10px 12px', background:'#F4F2FA', border:`1px solid ${C.border}`,
                borderRadius:6, cursor:'pointer', fontFamily:'sans-serif' }}>
                <input type="checkbox" checked={instantMode}
                  onChange={e => setInstantMode(e.target.checked)} style={{ marginTop:2 }}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
                    Create accounts instantly (no email needed)
                  </div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                    Accounts are created and enrolled right away, and you'll get a temporary
                    password for each student to hand out. They can change it after signing in.
                  </div>
                </div>
              </label>

              {credentials.length > 0 && (
                <div style={{ marginTop:12, padding:'12px 14px', background:'#E8F6EC',
                  border:'1px solid #A9DCB8', borderRadius:6, fontFamily:'sans-serif' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#127A1B', marginBottom:8 }}>
                    ✅ Accounts created — save these temporary passwords now
                  </div>
                  <pre style={{ margin:0, fontSize:12, whiteSpace:'pre-wrap', color:C.text }}>
{credentials.map(c => `${c.email}  →  ${c.password}`).join('\n')}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard?.writeText(
                      credentials.map(c => `${c.email}\t${c.password}`).join('\n'))}
                    style={{ marginTop:10, padding:'6px 12px', border:`1px solid ${C.primary}`,
                      borderRadius:5, background:C.white, color:C.primary, fontSize:12,
                      fontWeight:600, cursor:'pointer' }}>
                    📋 Copy all
                  </button>
                </div>
              )}

            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text,
                  fontFamily:'sans-serif', marginBottom:6 }}>Role</label>
                <select aria-label="Role" value={addRole} onChange={e => setAddRole(e.target.value)}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5,
                    padding:'9px 10px', fontSize:13, fontFamily:'sans-serif' }}>
                  <option value="student">Student</option>
                  <option value="ta">TA</option>
                  <option value="instructor">Instructor</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.text,
                  fontFamily:'sans-serif', marginBottom:6 }}>Section</label>
                <select aria-label="Section" value={addSection} onChange={e => setAddSection(e.target.value)}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5,
                    padding:'9px 10px', fontSize:13, fontFamily:'sans-serif' }}>
                  <option>Hybrid Day NATP</option>
                  <option>Weekend NATP</option>
                </select>
              </div>
            </div>

            {cohortInfo && (
              <label style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px',
                background:'#EDE8F7', border:`1px solid ${C.border}`, borderRadius:6,
                marginBottom:16, cursor:'pointer', fontFamily:'sans-serif' }}>
                <input type="checkbox" aria-label="Enroll entire cohort" checked={enrollInCohort}
                  onChange={e => setEnrollInCohort(e.target.checked)}
                  style={{ marginTop:2 }}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
                    Enroll in the entire {cohortInfo.name} cohort
                  </div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                    Student will be added to all {cohortInfo.courseCount} course{cohortInfo.courseCount === 1 ? '' : 's'} in this cohort, not just this one.
                  </div>
                </div>
              </label>
            )}

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