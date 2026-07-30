// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase, useAuth } from './AuthContext';
import { toast } from 'sonner';
import InlineTitle from '@/components/portal/InlineTitle';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', error:'#C0392B', success:'#127A1B', warn:'#B26A00' } as const;

interface Outcome {
  id: string; course_id: string; title: string; description: string | null;
  category: string | null; mastery_threshold: number; points_possible: number; position: number;
}
interface Criterion { id: string; title: string; points: number; rubric_id: string; rubric_title?: string; }
interface Student { user_id: string; full_name: string; }

interface Props { courseId?: string; canEdit?: boolean; }

const OutcomesTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const { user } = useAuth();
  const [view, setView] = useState<'bank' | 'mastery'>('bank');
  const [loading, setLoading] = useState(true);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [links, setLinks] = useState<Record<string, string[]>>({}); // outcome_id -> criterion_ids
  const [scores, setScores] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Outcome | null>(null);
  const [form, setForm] = useState({ title:'', description:'', category:'', mastery_threshold:3, points_possible:5 });
  const [saving, setSaving] = useState(false);
  const [linkFor, setLinkFor] = useState<string | null>(null);

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);

    const [{ data: outs }, { data: rubrics }, { data: enr }] = await Promise.all([
      supabase.from('outcomes').select('*').eq('course_id', courseId).order('position').order('created_at'),
      supabase.from('rubrics').select('id,title').eq('course_id', courseId),
      supabase.from('enrollments').select('user_id,role').eq('course_id', courseId).eq('role', 'student'),
    ]);

    const rubricIds = (rubrics ?? []).map(r => r.id);
    let crits: Criterion[] = [];
    if (rubricIds.length) {
      const { data: cd } = await supabase.from('rubric_criteria')
        .select('id,title,points,rubric_id').in('rubric_id', rubricIds).order('position');
      const titleMap = Object.fromEntries((rubrics ?? []).map(r => [r.id, r.title]));
      crits = (cd ?? []).map((c: any) => ({ ...c, rubric_title: titleMap[c.rubric_id] }));
    }

    const outIds = (outs ?? []).map(o => o.id);
    const linkMap: Record<string, string[]> = {};
    if (outIds.length) {
      const { data: lk } = await supabase.from('outcome_criteria').select('outcome_id,criterion_id').in('outcome_id', outIds);
      (lk ?? []).forEach((l: any) => {
        linkMap[l.outcome_id] = [...(linkMap[l.outcome_id] ?? []), l.criterion_id];
      });
    }

    const uids = (enr ?? []).map((e: any) => e.user_id);
    let roster: Student[] = [];
    if (uids.length) {
      const { data: profs } = await supabase.from('profiles').select('user_id,full_name').in('user_id', uids);
      const nameMap = Object.fromEntries((profs ?? []).map((p: any) => [p.user_id, p.full_name]));
      roster = uids.map(u => ({ user_id: u, full_name: nameMap[u] || 'Student' }));
    }

    let sc: any[] = [];
    const critIds = crits.map(c => c.id);
    if (critIds.length && uids.length) {
      const { data: rs } = await supabase.from('rubric_scores')
        .select('user_id,criterion_id,score').in('criterion_id', critIds).in('user_id', uids);
      sc = rs ?? [];
    }

    setOutcomes((outs ?? []) as Outcome[]);
    setCriteria(crits);
    setLinks(linkMap);
    setStudents(roster);
    setScores(sc);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const resetForm = () => setForm({ title:'', description:'', category:'', mastery_threshold:3, points_possible:5 });

  const renameOutcome = async (id: string, title: string) => {
    const { error } = await supabase.from('outcomes').update({ title }).eq('id', id);
    if (error) return toast.error('Could not rename');
    setOutcomes(p => p.map(o => o.id === id ? { ...o, title } : o));
    toast.success('Title updated');
  };

  const saveOutcome = async () => {
    if (!form.title.trim() || !courseId) return;
    setSaving(true);
    const row = {
      course_id: courseId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      mastery_threshold: Number(form.mastery_threshold) || 0,
      points_possible: Number(form.points_possible) || 0,
    };
    const { error } = editing
      ? await supabase.from('outcomes').update(row).eq('id', editing.id)
      : await supabase.from('outcomes').insert({ ...row, position: outcomes.length, created_by: user?.id ?? null });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? 'Outcome updated' : 'Outcome created');
    setShowNew(false); setEditing(null); resetForm();
    load();
  };

  const deleteOutcome = async (id: string) => {
    if (!confirm('Delete this outcome? Its rubric links will be removed.')) return;
    const { error } = await supabase.from('outcomes').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Outcome deleted');
    load();
  };

  const toggleLink = async (outcomeId: string, criterionId: string) => {
    const current = links[outcomeId] ?? [];
    if (current.includes(criterionId)) {
      const { error } = await supabase.from('outcome_criteria').delete()
        .eq('outcome_id', outcomeId).eq('criterion_id', criterionId);
      if (error) return toast.error(error.message);
      setLinks(l => ({ ...l, [outcomeId]: current.filter(c => c !== criterionId) }));
    } else {
      const { error } = await supabase.from('outcome_criteria').insert({ outcome_id: outcomeId, criterion_id: criterionId });
      if (error) return toast.error(error.message);
      setLinks(l => ({ ...l, [outcomeId]: [...current, criterionId] }));
    }
  };

  // Mastery computation: per student, per outcome -> avg score across linked criteria
  const mastery = (outcomeId: string, userId: string) => {
    const critIds = links[outcomeId] ?? [];
    if (!critIds.length) return null;
    const rows = scores.filter(s => s.user_id === userId && critIds.includes(s.criterion_id));
    if (!rows.length) return null;
    const avg = rows.reduce((s, r) => s + Number(r.score || 0), 0) / rows.length;
    return Math.round(avg * 100) / 100;
  };

  const cellColor = (val: number | null, threshold: number) => {
    if (val === null) return { bg:'#F5F5F7', fg:C.muted, label:'—' };
    if (val >= threshold) return { bg:'#E3F5E5', fg:C.success, label:String(val) };
    if (val >= threshold * 0.7) return { bg:'#FDF3E0', fg:C.warn, label:String(val) };
    return { bg:'#FBE9E7', fg:C.error, label:String(val) };
  };

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Open a course to manage outcomes.</div>;
  if (loading)   return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading outcomes…</div>;

  return (
    <div style={{ padding:24, fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:18 }}>
        <div>
          <h2 style={{ margin:'0 0 2px', fontSize:20, fontWeight:700, color:C.text }}>Outcomes</h2>
          <div style={{ fontSize:12, color:C.muted }}>
            {outcomes.length} outcome{outcomes.length!==1?'s':''} • {criteria.length} rubric criteria available
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div role="tablist" aria-label="Outcomes views" style={{ display:'flex', border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
            {(['bank','mastery'] as const).map(v => (
              <button key={v} role="tab" aria-selected={view===v} onClick={() => setView(v)}
                style={{ padding:'7px 14px', border:'none', background: view===v ? C.primary : C.white, color: view===v ? '#fff' : C.text, fontSize:13, cursor:'pointer', fontWeight:600 }}>
                {v === 'bank' ? 'Outcome Bank' : 'Mastery Report'}
              </button>
            ))}
          </div>
          {canEdit && view === 'bank' && (
            <button onClick={() => { setShowNew(v => !v); setEditing(null); resetForm(); }}
              style={{ padding:'8px 16px', border:'none', borderRadius:5, background:C.primary, color:'#fff', fontSize:13, cursor:'pointer', fontWeight:600 }}>
              + New Outcome
            </button>
          )}
        </div>
      </div>

      {view === 'bank' && (
        <>
          {(showNew || editing) && canEdit && (
            <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:8, padding:20, marginBottom:16 }}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title:e.target.value }))} placeholder="Outcome title * (e.g. Demonstrates proper handwashing)" aria-label="Outcome title"
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:10 }}/>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description:e.target.value }))} rows={3} placeholder="What does mastery look like? (optional)" aria-label="Outcome description"
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:13, boxSizing:'border-box', outline:'none', resize:'vertical', fontFamily:'sans-serif', marginBottom:10 }}/>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <input value={form.category} onChange={e => setForm(p => ({ ...p, category:e.target.value }))} placeholder="Category (e.g. Infection Control)" aria-label="Outcome category"
                  style={{ flex:'1 1 220px', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, outline:'none' }}/>
                <label style={{ fontSize:12, color:C.muted, display:'flex', alignItems:'center', gap:6 }}>
                  Mastery at
                  <input type="number" step="0.5" value={form.mastery_threshold} onChange={e => setForm(p => ({ ...p, mastery_threshold:Number(e.target.value) }))} aria-label="Mastery threshold"
                    style={{ width:70, border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, outline:'none' }}/>
                </label>
                <label style={{ fontSize:12, color:C.muted, display:'flex', alignItems:'center', gap:6 }}>
                  of
                  <input type="number" step="0.5" value={form.points_possible} onChange={e => setForm(p => ({ ...p, points_possible:Number(e.target.value) }))} aria-label="Points possible"
                    style={{ width:70, border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, outline:'none' }}/>
                  pts
                </label>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button onClick={saveOutcome} disabled={saving || !form.title.trim()}
                  style={{ padding:'8px 18px', border:'none', borderRadius:5, background:C.primary, color:'#fff', fontSize:13, cursor:'pointer', fontWeight:600, opacity:(!form.title.trim()||saving)?0.6:1 }}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
                </button>
                <button onClick={() => { setShowNew(false); setEditing(null); resetForm(); }}
                  style={{ padding:'8px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {outcomes.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}`, color:C.muted }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
              No outcomes yet. Create competency statements, then link them to rubric criteria to track mastery.
            </div>
          ) : outcomes.map(o => {
            const linked = links[o.id] ?? [];
            return (
              <div key={o.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:16, marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <span style={{ fontSize:20 }} aria-hidden>🎯</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:C.text }}>
                      <InlineTitle value={o.title} disabled={!canEdit} label="outcome title" onSave={(t) => renameOutcome(o.id, t)} />
                    </div>
                    <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
                      {o.category ? `${o.category} • ` : ''}Mastery at {o.mastery_threshold} of {o.points_possible} pts • {linked.length} linked criteri{linked.length===1?'on':'a'}
                    </div>
                    {o.description && <div style={{ fontSize:12, color:C.text, marginTop:5, opacity:0.85, lineHeight:1.5 }}>{o.description}</div>}
                  </div>
                  {canEdit && (
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <button onClick={() => setLinkFor(linkFor === o.id ? null : o.id)}
                        style={{ padding:'6px 10px', border:`1px solid ${C.primary}`, borderRadius:4, background:C.white, fontSize:12, color:C.primary, cursor:'pointer', fontWeight:600 }}>
                        {linkFor === o.id ? 'Done' : 'Link rubrics'}
                      </button>
                      <button onClick={() => { setEditing(o); setShowNew(false); setForm({ title:o.title, description:o.description ?? '', category:o.category ?? '', mastery_threshold:o.mastery_threshold, points_possible:o.points_possible }); }}
                        style={{ padding:'6px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>Edit</button>
                      <button onClick={() => deleteOutcome(o.id)}
                        style={{ padding:'6px 10px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, color:C.error, cursor:'pointer' }}>Delete</button>
                    </div>
                  )}
                </div>

                {linkFor === o.id && canEdit && (
                  <div style={{ marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
                    {criteria.length === 0 ? (
                      <div style={{ fontSize:12, color:C.muted }}>No rubric criteria in this course yet — create a rubric first in the Rubrics tab.</div>
                    ) : criteria.map(c => (
                      <label key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize:13, color:C.text, cursor:'pointer' }}>
                        <input type="checkbox" checked={linked.includes(c.id)} onChange={() => toggleLink(o.id, c.id)} />
                        <span>{c.title}</span>
                        <span style={{ fontSize:11, color:C.muted }}>({c.rubric_title} • {c.points} pts)</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {view === 'mastery' && (
        outcomes.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}`, color:C.muted }}>
            Create outcomes first — the mastery report rolls up rubric scores per outcome.
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}`, color:C.muted }}>
            No enrolled students yet. This report fills in automatically as students enroll and rubric scores are entered.
          </div>
        ) : (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', width:'100%', fontSize:13 }}>
              <caption className="sr-only">Student mastery by learning outcome</caption>
              <thead>
                <tr style={{ background:'#F0EDF7' }}>
                  <th scope="col" style={{ textAlign:'left', padding:'10px 12px', fontSize:11, textTransform:'uppercase', letterSpacing:0.5, color:C.text, position:'sticky', left:0, background:'#F0EDF7' }}>Student</th>
                  {outcomes.map(o => (
                    <th key={o.id} scope="col" style={{ padding:'10px 12px', fontSize:11, color:C.text, minWidth:130 }}>{o.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.user_id} style={{ borderTop:`1px solid ${C.border}` }}>
                    <th scope="row" style={{ textAlign:'left', padding:'10px 12px', fontWeight:600, color:C.text, position:'sticky', left:0, background:C.white }}>{s.full_name}</th>
                    {outcomes.map(o => {
                      const val = mastery(o.id, s.user_id);
                      const st = cellColor(val, o.mastery_threshold);
                      return (
                        <td key={o.id} style={{ padding:'8px 12px', textAlign:'center' }}>
                          <span style={{ display:'inline-block', minWidth:46, padding:'4px 8px', borderRadius:4, background:st.bg, color:st.fg, fontWeight:700 }}>
                            {st.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ borderTop:`2px solid ${C.border}`, background:C.bg }}>
                  <th scope="row" style={{ textAlign:'left', padding:'10px 12px', fontWeight:700, color:C.text, position:'sticky', left:0, background:C.bg }}>% Mastered</th>
                  {outcomes.map(o => {
                    const vals = students.map(s => mastery(o.id, s.user_id)).filter(v => v !== null) as number[];
                    const pct = vals.length ? Math.round((vals.filter(v => v >= o.mastery_threshold).length / vals.length) * 100) : null;
                    return (
                      <td key={o.id} style={{ padding:'10px 12px', textAlign:'center', fontWeight:700, color: pct === null ? C.muted : pct >= 75 ? C.success : C.warn }}>
                        {pct === null ? '—' : `${pct}%`}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default OutcomesTab;
