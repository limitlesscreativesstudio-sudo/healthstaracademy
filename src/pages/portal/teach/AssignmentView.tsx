// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect } from 'react';
import { supabase } from './AuthContext';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Assignment {
  id: string; name: string; type: string; group_name: string;
  points: number; due_at: string | null; published: boolean; created_at: string;
}
interface Props { courseId?: string; canEdit?: boolean; }

const typeIcon = (t: string) => ({ quiz:'❓', exam:'📋', discussion:'💬', assignment:'📝' }[t] ?? '📝');

const AssignmentView: React.FC<Props> = ({ courseId, canEdit }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState({
    name:'', type:'assignment', group_name:'Assignments',
    points:'100', due_at:'', published: false,
  });

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('assignments')
      .select('*').eq('course_id', courseId).order('created_at');
    if (data) setAssignments(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const save = async () => {
    if (!form.name.trim() || !courseId) return;
    setSaving(true);
    const { data, error } = await supabase.from('assignments')
      .insert({
        course_id: courseId, title: form.name.trim(), submission_type: form.type,
        group_name: form.group_name, points: parseInt(form.points) || 0,
        due_at: form.due_at || null, published: form.published,
      }).select().single();
    if (!error && data) setAssignments(p => [...p, data]);
    setForm({ name:'', type:'assignment', group_name:'Assignments', points:'100', due_at:'', published:false });
    setShowForm(false); setSaving(false);
  };

  const togglePub = async (id: string, current: boolean) => {
    setAssignments(p => p.map(a => a.id === id ? { ...a, published: !current } : a));
    await supabase.from('assignments').update({ published: !current }).eq('id', id);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    setAssignments(p => p.filter(a => a.id !== id));
    await supabase.from('assignments').delete().eq('id', id);
  };

  const groups = [...new Set(assignments.map(a => a.group_name))];

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Assignments</h2>
        {canEdit && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
            + Assignment
          </button>
        )}
      </div>

      {/* New assignment form */}
      {showForm && canEdit && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:8, padding:20, marginBottom:20 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, fontFamily:'sans-serif', color:C.text }}>New Assignment</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Case Study w/ Questions"
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
            </div>
            {[['Type','type',['assignment','quiz','exam','discussion']],['Group','group_name',['Assignments','Quizzes','Clinical Skills','Exams','Written Assignments']]].map(([label, key, opts]) => (
              <div key={key as string}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>{label as string}</label>
                <select value={(form as any)[key as string]} onChange={e => setForm(p => ({ ...p, [key as string]: e.target.value }))}
                  style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif' }}>
                  {(opts as string[]).map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Points</label>
              <input type="number" value={form.points} onChange={e => setForm(p => ({ ...p, points: e.target.value }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Due Date</label>
              <input type="datetime-local" value={form.due_at} onChange={e => setForm(p => ({ ...p, due_at: e.target.value }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box' }}/>
            </div>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontFamily:'sans-serif', marginTop:12, marginBottom:14, cursor:'pointer' }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} style={{ accentColor:C.primary }}/>
            Publish immediately
          </label>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={save} disabled={saving}
              style={{ padding:'8px 20px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontWeight:600, fontFamily:'sans-serif', cursor:'pointer', opacity:saving?.7:1 }}>
              {saving ? 'Saving…' : 'Save Assignment'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding:'8px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading assignments…</div>
      ) : assignments.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, borderRadius:8, border:`1px dashed ${C.border}` }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:6 }}>No assignments yet</div>
          {canEdit && <button onClick={() => setShowForm(true)} style={{ padding:'8px 20px', border:'none', borderRadius:6, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', marginTop:8 }}>+ Create Assignment</button>}
        </div>
      ) : groups.map(group => (
        <div key={group} style={{ marginBottom:20 }}>
          <div style={{ padding:'8px 14px', background:'#F0EDF7', border:`1px solid ${C.border}`, borderBottom:'none', borderRadius:'6px 6px 0 0', fontWeight:700, fontSize:13, fontFamily:'sans-serif', color:C.text }}>{group}</div>
          <div style={{ border:`1px solid ${C.border}`, borderRadius:'0 0 6px 6px', overflow:'hidden', background:C.white }}>
            {assignments.filter(a => a.group_name === group).map((a, i, arr) => (
              <div key={a.id} style={{ padding:'12px 14px', borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : 'none', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:18 }}>{typeIcon(a.submission_type)}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>{a.title}</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>
                    {a.points} pts
                    {a.due_at && ` • Due ${new Date(a.due_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}`}
                    {!a.published && <span style={{ color:C.error, marginLeft:8, fontWeight:600 }}>UNPUBLISHED</span>}
                  </div>
                </div>
                {canEdit && (
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <div onClick={() => togglePub(a.id, a.published)} title={a.published ? 'Published' : 'Unpublished'}
                      style={{ width:16, height:16, borderRadius:'50%', background: a.published ? C.success : C.border, cursor:'pointer', flexShrink:0 }}/>
                    <button onClick={() => del(a.id)}
                      style={{ padding:'3px 8px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.error }}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentView;
