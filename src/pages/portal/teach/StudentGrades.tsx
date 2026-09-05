// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './AuthContext';
import { toast } from 'sonner';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const letter = (p: number) => p>=93?'A':p>=90?'A-':p>=87?'B+':p>=83?'B':p>=80?'B-':p>=77?'C+':p>=73?'C':p>=70?'C-':'F';
const gColor = (p: number) => p>=80?C.success:p>=70?C.warn:C.error;

interface Props { courseId?: string; canEdit?: boolean; /** Students only ever see their own row */ selfOnly?: boolean; }
interface Student { id: string; name: string; initials: string; }
interface Column { id: string; name: string; points: number; kind: 'assignment' | 'quiz'; }
type GradeMap = Record<string, Record<string, number | null>>;

const StudentGrades: React.FC<Props> = ({ courseId, canEdit, selfOnly }) => {
  const [students,    setStudents]    = useState<Student[]>([]);
  const [columns,     setColumns]     = useState<Column[]>([]);
  const [grades,      setGrades]      = useState<GradeMap>({});
  const [submissions, setSubmissions] = useState<Record<string, { status: string; at: string }>>({});

  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState<{ s: string; a: string } | null>(null);
  const [editVal,     setEditVal]     = useState('');
  const [filter,      setFilter]      = useState<'all'|'assignment'|'quiz'>('all');
  const [search,      setSearch]      = useState('');
  const [colSearch,   setColSearch]   = useState('');
  const [rejects,     setRejects]     = useState<Array<{ id: string; student: string; column: string; value: string; reason: string; at: Date }>>([]);
  const [showRejects, setShowRejects] = useState(false);
  // ── Bulk entry + grading policies
  const [showBulk,    setShowBulk]    = useState(false);
  const [bulkCol,     setBulkCol]     = useState('');
  const [bulkMode,    setBulkMode]    = useState<'ungraded'|'all'>('ungraded');
  const [bulkVal,     setBulkVal]     = useState('0');
  const [bulkBusy,    setBulkBusy]    = useState(false);
  const policyKey = `hsa.gradebook.policy.${courseId ?? 'none'}`;
  const [policy, setPolicy] = useState<{ dropLowest: number; curve: number; latePenalty: number }>(() => {
    try { return { dropLowest: 0, curve: 0, latePenalty: 0, ...JSON.parse(localStorage.getItem(policyKey) || '{}') }; }
    catch { return { dropLowest: 0, curve: 0, latePenalty: 0 }; }
  });
  useEffect(() => { try { localStorage.setItem(policyKey, JSON.stringify(policy)); } catch {} }, [policy, policyKey]);
  const natSort = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });


  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);

    // 1) Enrollments (students only) — do NOT rely on nested embed
    let userIds: string[] = [];
    if (selfOnly) {
      const { data: auth } = await supabase.auth.getUser();
      userIds = auth?.user?.id ? [auth.user.id] : [];
    } else {
      const { data: enrs } = await supabase.from('enrollments')
        .select('user_id, role').eq('course_id', courseId).eq('role', 'student');
      userIds = (enrs ?? []).map((e: any) => e.user_id);
    }

    // 2) Profiles for those users
    let studs: Student[] = [];
    if (userIds.length) {
      const { data: profs } = await supabase.from('profiles')
        .select('user_id, full_name').in('user_id', userIds);
      studs = (profs ?? []).map((p: any) => {
        const nm = p.full_name || 'Student';
        return {
          id: p.user_id,
          name: nm,
          initials: nm.split(' ').filter(Boolean).map((w:string) => w[0]).join('').slice(0,2).toUpperCase(),
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
    }
    setStudents(studs);

    // 3) Assignments + Quizzes as columns
    const [{ data: asgns }, { data: qzs }] = await Promise.all([
      supabase.from('assignments').select('id,title,points,created_at').eq('course_id', courseId).order('created_at'),
      supabase.from('quizzes').select('id,title,total_points,created_at').eq('course_id', courseId).order('created_at'),
    ]);
    const cols: Column[] = [
      ...(asgns ?? []).map((a: any) => ({ id: a.id, name: a.title, points: Number(a.points ?? 0), kind: 'assignment' as const })),
      ...(qzs ?? []).map((q: any) => ({ id: q.id, name: q.title, points: Number(q.total_points ?? 0), kind: 'quiz' as const })),
    ].sort((a, b) => natSort(a.name, b.name));
    setColumns(cols);

    // 4) Grades (assignments) + best quiz attempt (quizzes)
    const asgnIds = (asgns ?? []).map((a: any) => a.id);
    const qzIds   = (qzs ?? []).map((q: any) => q.id);
    const [{ data: gradeRows }, { data: attempts }] = await Promise.all([
      asgnIds.length
        ? supabase.from('grades').select('user_id, assignment_id, score').in('assignment_id', asgnIds)
        : Promise.resolve({ data: [] as any[] }),
      qzIds.length
        ? supabase.from('quiz_attempts').select('user_id, quiz_id, score, submitted_at, grading_status').in('quiz_id', qzIds).not('submitted_at','is',null)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const map: GradeMap = {};
    for (const s of studs) { map[s.id] = {}; for (const c of cols) map[s.id][c.id] = null; }
    for (const g of (gradeRows ?? [])) {
      if (!map[g.user_id]) map[g.user_id] = {};
      map[g.user_id][g.assignment_id] = g.score == null ? null : Number(g.score);
    }
    // best attempt per user/quiz + submission status (so ungraded submissions are still visible)
    const best: Record<string, number> = {};
    const subs: Record<string, { status: string; at: string }> = {};
    for (const a of (attempts ?? [])) {
      const k = `${a.user_id}|${a.quiz_id}`;
      if (a.score != null) {
        const s = Number(a.score);
        if (best[k] == null || s > best[k]) best[k] = s;
      }
      const prevAt = subs[k]?.at;
      if (!prevAt || String(a.submitted_at) > prevAt) subs[k] = { status: a.grading_status ?? 'awaiting', at: String(a.submitted_at) };
    }
    setSubmissions(subs);
    for (const k of Object.keys(best)) {
      const [uid, qid] = k.split('|');
      if (!map[uid]) map[uid] = {};
      map[uid][qid] = best[k];
    }

    setGrades(map);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId, selfOnly]);

  const logReject = (target: { s: string; a: string }, value: string, reason: string) => {
    const student = students.find(x => x.id === target.s)?.name ?? target.s;
    const column = columns.find(x => x.id === target.a)?.name ?? target.a;
    setRejects(p => [{ id: crypto.randomUUID(), student, column, value, reason, at: new Date() }, ...p].slice(0, 50));
    toast.error(`${reason} — ${student} / ${column}`);
  };

  const saveGrade = async () => {
    if (!editing || !courseId) { setEditing(null); return; }
    const col = columns.find(c => c.id === editing.a);
    const raw = editVal.trim();
    const target = editing;
    if (raw === '') { setEditing(null); return; }
    const score = Number(raw);
    if (!isFinite(score) || isNaN(score)) { logReject(target, raw, 'Score must be a number'); return; }
    if (score < 0) { logReject(target, raw, 'Score cannot be negative'); return; }
    if (col && col.points > 0 && score > col.points) {
      logReject(target, raw, `Score exceeds max (${col.points})`); return;
    }
    const prev = grades[target.s]?.[target.a] ?? null;
    setGrades(p => ({ ...p, [target.s]: { ...(p[target.s] ?? {}), [target.a]: score } }));
    setEditing(null);
    if (col?.kind === 'assignment') {
      const { error } = await supabase.from('grades').upsert({
        course_id: courseId,
        user_id: target.s,
        assignment_id: target.a,
        score,
        max_score: col.points || null,
        graded_at: new Date().toISOString(),
      }, { onConflict: 'assignment_id,user_id' });
      if (error) {
        setGrades(p => ({ ...p, [target.s]: { ...(p[target.s] ?? {}), [target.a]: prev } }));
        logReject(target, raw, 'Save failed: ' + error.message);
      } else {
        toast.success('Grade saved');
      }
    }
  };


  // ── Bulk grade entry (assignment columns only)
  const applyBulk = async () => {
    const col = columns.find(c => c.id === bulkCol);
    if (!col || !courseId) { toast.error('Pick an assignment column first'); return; }
    if (col.kind !== 'assignment') { toast.error('Quiz scores are auto-graded and cannot be bulk-edited'); return; }
    const score = Number(bulkVal);
    if (!isFinite(score) || score < 0) { toast.error('Enter a valid, non-negative score'); return; }
    if (col.points > 0 && score > col.points) { toast.error(`Score exceeds max (${col.points})`); return; }

    const targets = visibleStudents.filter(s =>
      bulkMode === 'all' ? true : (grades[s.id]?.[col.id] == null)
    );
    if (!targets.length) { toast.info('No students match this bulk action'); return; }

    setBulkBusy(true);
    const rowsToSave = targets.map(s => ({
      course_id: courseId,
      user_id: s.id,
      assignment_id: col.id,
      score,
      max_score: col.points || null,
      graded_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('grades').upsert(rowsToSave, { onConflict: 'assignment_id,user_id' });
    setBulkBusy(false);
    if (error) { toast.error('Bulk save failed: ' + error.message); return; }
    setGrades(p => {
      const next = { ...p };
      targets.forEach(s => { next[s.id] = { ...(next[s.id] ?? {}), [col.id]: score }; });
      return next;
    });
    toast.success(`Set ${score} for ${targets.length} student${targets.length === 1 ? '' : 's'} on ${col.name}`);
  };

  const visibleCols = useMemo(() => {
    const q = colSearch.trim().toLowerCase();
    return columns
      .filter(c => filter === 'all' || c.kind === filter)
      .filter(c => !q || c.name.toLowerCase().includes(q));
  }, [columns, filter, colSearch]);
  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? students.filter(s => s.name.toLowerCase().includes(q)) : students;
  }, [students, search]);

  // Grading policy: drop N lowest-scoring columns per student, then apply a flat curve.
  const droppedFor = (sId: string): Set<string> => {
    const n = Math.max(0, Number(policy.dropLowest) || 0);
    if (!n) return new Set();
    const scored = visibleCols
      .filter(c => (c.points || 0) > 0)
      .map(c => ({ id: c.id, pct: ((grades[sId]?.[c.id] ?? 0) / c.points) }))
      .sort((a, b) => a.pct - b.pct)
      .slice(0, n);
    return new Set(scored.map(x => x.id));
  };

  const totalPtsFor = (sId: string) => {
    const dropped = droppedFor(sId);
    return visibleCols.reduce((s, a) => s + (dropped.has(a.id) ? 0 : (a.points || 0)), 0);
  };
  const totalPts = visibleCols.reduce((s, a) => s + (a.points || 0), 0);
  const studentTotal = (sId: string) => {
    const dropped = droppedFor(sId);
    return visibleCols.reduce((s, a) => s + (dropped.has(a.id) ? 0 : (grades[sId]?.[a.id] ?? 0)), 0);
  };
  const studentPct = (sId: string) => {
    const denom = totalPtsFor(sId);
    const base = denom > 0 ? (studentTotal(sId) / denom) * 100 : 0;
    return Math.max(0, Math.min(100, Math.round(base + (Number(policy.curve) || 0))));
  };


  const exportCsv = () => {
    const header = [
      'Student',
      ...visibleCols.map(c => `${c.name} [${c.kind === 'quiz' ? 'Quiz' : 'Assignment'}] (/${c.points})`),
      `Total (/${totalPts})`, '%', 'Letter',
    ];
    const rows = visibleStudents.map(s => {
      const tot = studentTotal(s.id);
      const pct = studentPct(s.id);
      return [
        s.name,
        ...visibleCols.map(c => {
          const g = grades[s.id]?.[c.id];
          // Validation-safe: strip anything out of range so the CSV never contains an invalid score
          if (g == null || !isFinite(g)) return '';
          if (g < 0) return '';
          if (c.points > 0 && g > c.points) return c.points;
          return g;
        }),
        tot, `${pct}%`, letter(pct),
      ];
    });
    // Append a small rejected-edits log so anyone reviewing the export sees which entries were blocked
    const rejectRows: any[][] = [];
    if (rejects.length) {
      rejectRows.push([]);
      rejectRows.push(['Rejected edits (this session)']);
      rejectRows.push(['Time', 'Student', 'Column', 'Value entered', 'Reason']);
      rejects.forEach(r => rejectRows.push([r.at.toISOString(), r.student, r.column, r.value, r.reason]));
    }
    const csv = [header, ...rows, ...rejectRows].map(r => r.map(v => {
      const str = String(v ?? '');
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url; a.download = `gradebook-${courseId}-${stamp}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${visibleStudents.length} students × ${visibleCols.length} columns`);
  };


  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>{selfOnly ? 'My Grades' : 'Gradebook'}</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {!selfOnly && (<>
          <label htmlFor="gb-student-search" className="sr-only">Search students</label>
          <input id="gb-student-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, fontFamily:'sans-serif', minWidth:160 }} />
          </>)}
          <label htmlFor="gb-col-search" className="sr-only">Search assignments</label>

          <input id="gb-col-search" value={colSearch} onChange={e => setColSearch(e.target.value)} placeholder="Search assignments…"
            style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, fontFamily:'sans-serif', minWidth:180 }} />
          {(['all','assignment','quiz'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter===f}
              style={{ padding:'6px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:filter===f?C.primary:C.white, color:filter===f?'white':C.text, fontSize:12, cursor:'pointer', textTransform:'capitalize', fontFamily:'sans-serif' }}>
              {f === 'all' ? 'All' : f === 'assignment' ? 'Assignments' : 'Quizzes'}
            </button>
          ))}
          {canEdit && (
            <button onClick={() => setShowBulk(v => !v)} aria-expanded={showBulk}
              style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:showBulk?C.primary:C.white, color:showBulk?'white':C.text, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
              ⚡ Bulk entry &amp; policies
            </button>
          )}
          {!selfOnly && (<>
          <button onClick={exportCsv} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>📤 Export CSV</button>
          <button onClick={() => setShowRejects(v => !v)} style={{ padding:'7px 14px', border:`1px solid ${rejects.length?C.error:C.border}`, borderRadius:5, background:rejects.length?'#FDECEA':C.white, color:rejects.length?C.error:C.text, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
            ⚠️ Rejected edits{rejects.length ? ` (${rejects.length})` : ''}
          </button>
          </>)}

          <button onClick={load} style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>🔄 Refresh</button>
        </div>
      </div>

      {canEdit && showBulk && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:14, marginBottom:14, fontFamily:'sans-serif' }}>
          <strong style={{ fontSize:13, color:C.text }}>Bulk grade entry</strong>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end', marginTop:10 }}>
            <div>
              <label htmlFor="bulk-col" style={{ display:'block', fontSize:11, color:C.muted, marginBottom:3 }}>Assignment</label>
              <select id="bulk-col" value={bulkCol} onChange={e => setBulkCol(e.target.value)}
                style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, minWidth:220 }}>
                <option value="">Select an assignment…</option>
                {columns.filter(c => c.kind === 'assignment').map(c => (
                  <option key={c.id} value={c.id}>{c.name} (/{c.points})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bulk-mode" style={{ display:'block', fontSize:11, color:C.muted, marginBottom:3 }}>Apply to</label>
              <select id="bulk-mode" value={bulkMode} onChange={e => setBulkMode(e.target.value as any)}
                style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13 }}>
                <option value="ungraded">Ungraded students only</option>
                <option value="all">All visible students (overwrite)</option>
              </select>
            </div>
            <div>
              <label htmlFor="bulk-val" style={{ display:'block', fontSize:11, color:C.muted, marginBottom:3 }}>Score</label>
              <input id="bulk-val" value={bulkVal} onChange={e => setBulkVal(e.target.value)} inputMode="decimal"
                style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, width:80 }} />
            </div>
            <button onClick={applyBulk} disabled={bulkBusy}
              style={{ padding:'8px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, cursor: bulkBusy ? 'wait' : 'pointer' }}>
              {bulkBusy ? 'Applying…' : 'Apply'}
            </button>
          </div>

          <hr style={{ border:0, borderTop:`1px dashed ${C.border}`, margin:'14px 0' }} />

          <strong style={{ fontSize:13, color:C.text }}>Grading policies</strong>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-end', marginTop:10 }}>
            <div>
              <label htmlFor="pol-drop" style={{ display:'block', fontSize:11, color:C.muted, marginBottom:3 }}>Drop lowest scores</label>
              <input id="pol-drop" type="number" min={0} max={10} value={policy.dropLowest}
                onChange={e => setPolicy(p => ({ ...p, dropLowest: Math.max(0, Number(e.target.value) || 0) }))}
                style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, width:80 }} />
            </div>
            <div>
              <label htmlFor="pol-curve" style={{ display:'block', fontSize:11, color:C.muted, marginBottom:3 }}>Curve (+ percentage points)</label>
              <input id="pol-curve" type="number" min={0} max={25} value={policy.curve}
                onChange={e => setPolicy(p => ({ ...p, curve: Math.max(0, Number(e.target.value) || 0) }))}
                style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, width:80 }} />
            </div>
            <button onClick={() => setPolicy({ dropLowest: 0, curve: 0, latePenalty: 0 })}
              style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>
              Reset policies
            </button>
          </div>
          <p style={{ fontSize:11, color:C.muted, marginTop:8, marginBottom:0 }}>
            Policies affect displayed totals, letter grades and CSV exports for this course. Raw per-item scores in the database are never changed.
          </p>
        </div>
      )}


      {showRejects && (
        <div style={{ background:C.white, border:`1px solid ${C.error}55`, borderRadius:6, padding:14, marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <strong style={{ color:C.error, fontFamily:'sans-serif', fontSize:13 }}>Rejected grade edits ({rejects.length})</strong>
            {rejects.length > 0 && (
              <button onClick={() => setRejects([])} style={{ padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>Clear</button>
            )}
          </div>
          {rejects.length === 0 ? (
            <div style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>No rejected edits in this session.</div>
          ) : (
            <div style={{ maxHeight:180, overflowY:'auto' }}>
              {rejects.map(r => (
                <div key={r.id} style={{ fontSize:12, color:C.text, fontFamily:'sans-serif', padding:'6px 0', borderBottom:`1px dashed ${C.border}` }}>
                  <strong>{r.student}</strong> · {r.column} · entered <code>{r.value}</code> — <span style={{ color:C.error }}>{r.reason}</span>
                  <span style={{ color:C.muted, marginLeft:8 }}>{r.at.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(() => {
        const awaiting = Object.entries(submissions).filter(([k]) => grades[k.split('|')[0]]?.[k.split('|')[1]] == null).length;
        if (!awaiting) return null;
        return (
          <div style={{ background:'#FFF7E6', border:`1px solid ${C.warn}`, borderRadius:6, padding:'10px 14px', marginBottom:12, fontFamily:'sans-serif', fontSize:13, color:C.text }}>
            ⏳ <strong>{awaiting}</strong> submitted {awaiting === 1 ? 'quiz' : 'quizzes'} {selfOnly ? 'waiting on your instructor to grade.' : 'awaiting grading — click any ⏳ cell to open and grade it.'}
          </div>
        );
      })()}


      {!courseId ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Open a course to view the gradebook.</div>
      ) : loading ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading gradebook…</div>
      ) : students.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📊</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif' }}>No students enrolled yet</div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', marginTop:6 }}>Add students in the People tab to see the gradebook.</div>
        </div>
      ) : visibleCols.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📝</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif' }}>No graded work yet</div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'sans-serif', marginTop:6 }}>Create assignments or quizzes first.</div>
        </div>
      ) : (
        <div style={{ overflowX:'auto', border:`1px solid ${C.border}`, borderRadius:6 }}>
          <table style={{ borderCollapse:'collapse', fontFamily:'sans-serif', minWidth:'100%' }}>
            <thead>
              <tr style={{ background:'#F0EDF7' }}>
                <th style={{ padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:C.text,
                  borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                  position:'sticky', left:0, background:'#F0EDF7', minWidth:200, zIndex:10 }}>
                  Student ({visibleStudents.length})
                </th>
                {visibleCols.map(a => (
                  <th key={a.id} title={a.name} style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600,
                    color:C.text, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, minWidth:100 }}>
                    <div style={{ color:C.primary, marginBottom:2, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.name}</div>
                    <div style={{ color:C.muted, fontWeight:400 }}>{a.kind === 'quiz' ? '🎯' : '📝'} / {a.points}</div>
                  </th>
                ))}
                <th style={{ padding:'10px', textAlign:'center', fontSize:12, fontWeight:700,
                  color:C.text, borderBottom:`1px solid ${C.border}`, minWidth:110, position:'sticky', right:0, background:'#F0EDF7' }}>
                  Total / {totalPts}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((s, si) => {
                const tot = studentTotal(s.id);
                const pct = studentPct(s.id);
                const bg = si % 2 === 0 ? C.white : '#FDFCFF';
                return (
                  <tr key={s.id} style={{ background: bg }}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600,
                      borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                      position:'sticky', left:0, background: bg, zIndex:5 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'#9B6DD0',
                          color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, fontWeight:700, flexShrink:0 }}>{s.initials}</div>
                        <span style={{ color:C.primary }}>{s.name}</span>
                      </div>
                    </td>
                    {visibleCols.map(a => {
                      const g = grades[s.id]?.[a.id];
                      const sub = a.kind === 'quiz' ? submissions[`${s.id}|${a.id}`] : undefined;
                      const isEd = editing?.s === s.id && editing?.a === a.id;
                      const pctCell = g != null && a.points > 0 ? Math.round((g / a.points) * 100) : null;
                      const editable = canEdit && a.kind === 'assignment';
                      const goGrade = () => { if (a.kind === 'quiz' && !selfOnly && sub) window.location.href = `/portal/courses/${courseId}/quizzes/${a.id}`; };
                      return (
                        <td key={a.id}
                          title={sub ? `Submitted ${new Date(sub.at).toLocaleString()}${g == null ? ' — awaiting grading' : ''}` : (a.kind === 'quiz' ? 'No submission yet' : (editable ? 'Click to edit' : ''))}
                          onClick={() => {
                            if (editable) { setEditing({ s: s.id, a: a.id }); setEditVal(g?.toString() ?? ''); return; }
                            goGrade();
                          }}
                          style={{ padding:'7px 9px', textAlign:'center', cursor: (editable || (sub && !selfOnly)) ? 'pointer' : 'default',
                            borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                            background: isEd ? '#EDE8F7' : (g == null && sub ? '#FFF7E6' : 'inherit') }}>
                          {isEd ? (
                            <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                              onBlur={saveGrade}
                              onKeyDown={e => { if (e.key === 'Enter') saveGrade(); if (e.key === 'Escape') setEditing(null); }}
                              style={{ width:52, textAlign:'center', border:`2px solid ${C.primary}`, borderRadius:3, padding:'2px 4px', fontSize:13 }}/>
                          ) : g == null && sub ? (
                            <div>
                              <div style={{ fontSize:12, fontWeight:700, color:C.warn }}>⏳ Submitted</div>
                              <div style={{ fontSize:10, color:C.muted }}>{selfOnly ? 'awaiting grading' : 'grade it'}</div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color: pctCell != null ? gColor(pctCell) : C.muted }}>
                                {g != null ? g : '—'}
                              </div>
                              {pctCell != null && <div style={{ fontSize:10, color:C.muted }}>{pctCell}%</div>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ padding:'9px', textAlign:'center', borderBottom:`1px solid ${C.border}`, fontWeight:700, position:'sticky', right:0, background: bg }}>
                      <div style={{ fontSize:14, color: gColor(pct) }}>{pct}%</div>
                      <div style={{ fontSize:12, color:C.muted }}>{letter(pct)} • {tot.toFixed(1)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {!selfOnly && (
            <tfoot>
              <tr style={{ background:'#F0EDF7', fontWeight:700 }}>
                <td style={{ padding:'10px 14px', fontSize:12, color:C.text, borderTop:`2px solid ${C.border}`, borderRight:`1px solid ${C.border}`, position:'sticky', left:0, background:'#F0EDF7', zIndex:5 }}>
                  Class Average
                </td>
                {visibleCols.map(a => {
                  const vals = visibleStudents.map(s => grades[s.id]?.[a.id]).filter(v => v != null) as number[];
                  const avg = vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
                  const pctCell = avg != null && a.points > 0 ? Math.round((avg / a.points) * 100) : null;
                  return (
                    <td key={a.id} style={{ padding:'8px', textAlign:'center', fontSize:12, color: pctCell != null ? gColor(pctCell) : C.muted, borderTop:`2px solid ${C.border}`, borderRight:`1px solid ${C.border}` }}>
                      {avg != null ? avg.toFixed(1) : '—'}
                      {pctCell != null && <div style={{ fontSize:10, color:C.muted, fontWeight:400 }}>{pctCell}%</div>}
                    </td>
                  );
                })}
                <td style={{ padding:'8px', textAlign:'center', fontSize:12, borderTop:`2px solid ${C.border}`, position:'sticky', right:0, background:'#F0EDF7' }}>
                  {(() => {
                    const totals = visibleStudents.map(s => studentTotal(s.id)).filter(v => v > 0);
                    const avgTot = totals.length ? totals.reduce((x, y) => x + y, 0) / totals.length : 0;
                    const avgPct = totalPts > 0 ? Math.round((avgTot / totalPts) * 100) : 0;
                    return <><div style={{ color: gColor(avgPct) }}>{avgPct}%</div><div style={{ fontSize:10, color:C.muted, fontWeight:400 }}>{letter(avgPct)}</div></>;
                  })()}
                </td>
              </tr>
            </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
