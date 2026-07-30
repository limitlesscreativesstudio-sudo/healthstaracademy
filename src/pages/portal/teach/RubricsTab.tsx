// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase, useAuth } from './AuthContext';
import { toast } from 'sonner';
import InlineTitle from '@/components/portal/InlineTitle';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', error:'#C0392B', success:'#127A1B' } as const;

interface Rubric  { id:string; title:string; description:string|null; created_at:string; criteria_count?:number; total_points?:number; }
interface Crit    { id?:string; rubric_id?:string; position:number; title:string; description:string; points:number; }

interface Props { courseId?: string; canEdit?: boolean; }

const RubricsTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const { user } = useAuth();
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [open, setOpen] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<Crit[]>([]);
  const [form, setForm] = useState({ title:'', description:'' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('rubrics')
      .select('id,title,description,created_at')
      .eq('course_id', courseId).order('created_at', { ascending:false });
    const rs = (data ?? []) as Rubric[];
    if (rs.length) {
      const { data: crits } = await supabase.from('rubric_criteria')
        .select('rubric_id,points').in('rubric_id', rs.map(r => r.id));
      const counts: Record<string, { n:number; pts:number }> = {};
      (crits ?? []).forEach((c:any) => {
        const o = counts[c.rubric_id] ?? { n:0, pts:0 };
        o.n += 1; o.pts += Number(c.points || 0);
        counts[c.rubric_id] = o;
      });
      rs.forEach(r => { r.criteria_count = counts[r.id]?.n || 0; r.total_points = counts[r.id]?.pts || 0; });
    }
    setRubrics(rs);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const renameRubric = async (r: Rubric, title: string) => {
    const { error } = await supabase.from('rubrics').update({ title }).eq('id', r.id);
    if (error) return toast.error('Could not rename');
    setRubrics(p => p.map(x => x.id === r.id ? { ...x, title } : x));
    setOpen(o => (o && o.id === r.id ? { ...o, title } : o));
    toast.success('Title updated');
  };

  const openRubric = async (r: Rubric) => {
    setOpen(r);
    const { data } = await supabase.from('rubric_criteria')
      .select('id,rubric_id,position,title,description,points')
      .eq('rubric_id', r.id).order('position');
    setCriteria((data ?? []) as Crit[]);
  };

  const createRubric = async () => {
    if (!form.title.trim() || !courseId || !user?.id) return;
    setSaving(true);
    const { data, error } = await supabase.from('rubrics')
      .insert({ course_id: courseId, title: form.title.trim(), description: form.description.trim() || null, created_by: user.id })
      .select().single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Rubric created');
    setShowNew(false); setForm({ title:'', description:'' });
    await load();
    openRubric(data as Rubric);
  };

  const addCriterion = () => {
    setCriteria(cs => [...cs, { position: cs.length, title:'New criterion', description:'', points:5 }]);
  };

  const updateCrit = (idx:number, patch: Partial<Crit>) => {
    setCriteria(cs => cs.map((c,i) => i===idx ? { ...c, ...patch } : c));
  };

  const removeCrit = async (idx:number) => {
    const c = criteria[idx];
    if (c.id) await supabase.from('rubric_criteria').delete().eq('id', c.id);
    setCriteria(cs => cs.filter((_,i) => i!==idx));
  };

  const saveCriteria = async () => {
    if (!open) return;
    setSaving(true);
    for (let i=0; i<criteria.length; i++) {
      const c = criteria[i];
      const row = {
        rubric_id: open.id,
        position: i,
        title: c.title || 'Untitled',
        description: c.description || '',
        points: Number(c.points) || 0,
      };
      if (c.id) {
        await supabase.from('rubric_criteria').update(row).eq('id', c.id);
      } else {
        const { data } = await supabase.from('rubric_criteria').insert(row).select().single();
        if (data) criteria[i] = { ...c, id: data.id };
      }
    }
    setSaving(false);
    toast.success('Rubric saved');
    load();
  };

  const deleteRubric = async (id: string) => {
    if (!confirm('Delete this rubric? Assignments using it will be detached.')) return;
    const { error } = await supabase.from('rubrics').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    if (open?.id === id) setOpen(null);
    load();
  };

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Open a course to manage rubrics.</div>;
  if (loading)   return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading rubrics…</div>;

  // Rubric detail / editor
  if (open) {
    const totalPts = criteria.reduce((s,c) => s + (Number(c.points)||0), 0);
    return (
      <div style={{ padding:24, maxWidth:900, margin:'0 auto', fontFamily:'sans-serif' }}>
        <button onClick={() => { setOpen(null); load(); }} style={{ background:'none', border:'none', color:C.primary, fontSize:13, cursor:'pointer', marginBottom:14 }}>← Back to rubrics</button>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:22, marginBottom:16 }}>
          <h2 style={{ margin:'0 0 6px', fontSize:20, fontWeight:700, color:C.text }}>{open.title}</h2>
          {open.description && <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.6 }}>{open.description}</p>}
          <div style={{ marginTop:10, fontSize:12, color:C.muted }}>
            {criteria.length} criteria • {totalPts} total points
          </div>
        </div>

        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 3fr 90px 40px', background:'#F0EDF7', padding:'8px 12px', fontSize:11, fontWeight:700, color:C.text, textTransform:'uppercase', letterSpacing:0.5 }}>
            <div>Criterion</div><div>Description</div><div style={{ textAlign:'center' }}>Points</div><div/>
          </div>
          {criteria.length === 0 ? (
            <div style={{ padding:32, textAlign:'center', color:C.muted, fontSize:13 }}>No criteria yet. Add one below.</div>
          ) : criteria.map((c, idx) => (
            <div key={idx} style={{ display:'grid', gridTemplateColumns:'2fr 3fr 90px 40px', gap:8, padding:'10px 12px', borderTop:`1px solid ${C.border}`, alignItems:'start' }}>
              <input value={c.title} onChange={e => updateCrit(idx, { title:e.target.value })} placeholder="Criterion title" disabled={!canEdit}
                style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 8px', fontSize:13, outline:'none' }}/>
              <textarea value={c.description} onChange={e => updateCrit(idx, { description:e.target.value })} placeholder="What earns full points?" rows={2} disabled={!canEdit}
                style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 8px', fontSize:13, outline:'none', resize:'vertical', fontFamily:'sans-serif' }}/>
              <input type="number" value={c.points} onChange={e => updateCrit(idx, { points:Number(e.target.value) })} disabled={!canEdit}
                style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 8px', fontSize:13, textAlign:'center', outline:'none' }}/>
              {canEdit && (
                <button onClick={() => removeCrit(idx)} title="Remove"
                  style={{ background:'none', border:`1px solid ${C.error}33`, color:C.error, borderRadius:4, cursor:'pointer', fontSize:14 }}>×</button>
              )}
            </div>
          ))}
        </div>

        {canEdit && (
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            <button onClick={addCriterion}
              style={{ padding:'8px 16px', border:`1px solid ${C.primary}`, background:C.white, color:C.primary, borderRadius:5, fontSize:13, cursor:'pointer', fontWeight:600 }}>
              + Add Criterion
            </button>
            <button onClick={saveCriteria} disabled={saving}
              style={{ padding:'8px 20px', border:'none', background:C.primary, color:'white', borderRadius:5, fontSize:13, cursor:'pointer', fontWeight:700, opacity:saving?0.7:1, marginLeft:'auto' }}>
              {saving ? 'Saving…' : 'Save Rubric'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div style={{ padding:24, fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ margin:'0 0 2px', fontSize:20, fontWeight:700, color:C.text }}>Rubrics</h2>
          <div style={{ fontSize:12, color:C.muted }}>{rubrics.length} rubric{rubrics.length!==1?'s':''} in this course</div>
        </div>
        {canEdit && (
          <button onClick={() => setShowNew(v => !v)}
            style={{ padding:'8px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, cursor:'pointer', fontWeight:600 }}>
            + New Rubric
          </button>
        )}
      </div>

      {showNew && canEdit && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:8, padding:20, marginBottom:16 }}>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title:e.target.value }))} placeholder="Rubric title *"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:10 }}/>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description:e.target.value }))} rows={3} placeholder="Description (optional)"
            style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'9px 12px', fontSize:13, boxSizing:'border-box', outline:'none', resize:'vertical', fontFamily:'sans-serif' }}/>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={createRubric} disabled={saving || !form.title.trim()}
              style={{ padding:'8px 18px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, cursor:'pointer', fontWeight:600, opacity:(!form.title.trim()||saving)?0.6:1 }}>
              {saving ? 'Creating…' : 'Create'}
            </button>
            <button onClick={() => { setShowNew(false); setForm({ title:'', description:'' }); }}
              style={{ padding:'8px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {rubrics.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}`, color:C.muted }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          No rubrics yet. Create one to standardize grading.
        </div>
      ) : rubrics.map(r => (
        <div key={r.id} onClick={() => openRubric(r)}
          style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:16, marginBottom:8, cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fd'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
          <span style={{ fontSize:22 }}>📋</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.primary }}>
              <InlineTitle value={r.title} disabled={!canEdit} label="rubric title" onSave={(t) => renameRubric(r, t)} />
            </div>
            <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
              {r.criteria_count} criteria • {r.total_points} points • created {new Date(r.created_at).toLocaleDateString()}
            </div>
            {r.description && <div style={{ fontSize:12, color:C.text, marginTop:4, opacity:0.8 }}>{r.description.slice(0,120)}{r.description.length>120?'…':''}</div>}
          </div>
          {canEdit && (
            <button onClick={e => { e.stopPropagation(); deleteRubric(r.id); }}
              style={{ padding:'6px 10px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, color:C.error, cursor:'pointer' }}>Delete</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default RubricsTab;
