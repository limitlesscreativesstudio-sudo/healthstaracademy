// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, useAuth } from './AuthContext';
import { toast } from 'sonner';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Assignment {
  id: string; title: string; submission_type: string; group_name: string;
  points: number; due_at: string | null; published: boolean; created_at: string;
}
interface Props { courseId?: string; canEdit?: boolean; }

const typeIcon = (t: string) => ({ quiz:'❓', exam:'📋', discussion:'💬', assignment:'📝' }[t] ?? '📝');

const AssignmentView: React.FC<Props> = ({ courseId, canEdit }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subMap, setSubMap] = useState<Record<string, number>>({});
  const [gradeMap, setGradeMap] = useState<Record<string, { score:number; max:number }>>({});
  const [rosterSize, setRosterSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'published'|'unpublished'>('all');
  const [form, setForm] = useState({
    title:'', submission_type:'assignment', group_name:'Assignments',
    points:'100', due_at:'', published: false,
  });
  const natSort = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: aData }, { data: enr }] = await Promise.all([
      supabase.from('assignments').select('*').eq('course_id', courseId).order('created_at'),
      supabase.from('enrollments').select('user_id').eq('course_id', courseId).eq('role','student'),
    ]);
    const asgn = aData ?? [];
    setAssignments(asgn);
    setRosterSize((enr ?? []).length);

    const ids = asgn.map(a => a.id);
    if (ids.length) {
      if (canEdit) {
        // Instructor: submission counts per assignment
        const { data: subs } = await supabase.from('submissions')
          .select('assignment_id,user_id').in('assignment_id', ids);
        const counts: Record<string, Set<string>> = {};
        (subs ?? []).forEach(s => {
          if (!counts[s.assignment_id]) counts[s.assignment_id] = new Set();
          counts[s.assignment_id].add(s.user_id);
        });
        const map: Record<string, number> = {};
        Object.keys(counts).forEach(k => { map[k] = counts[k].size; });
        setSubMap(map);
      } else if (user?.id) {
        // Student: my grades for these assignments
        const { data: gr } = await supabase.from('grades')
          .select('assignment_id,score,max_score').in('assignment_id', ids).eq('user_id', user.id);
        const gm: Record<string, { score:number; max:number }> = {};
        (gr ?? []).forEach(g => { if (g.assignment_id) gm[g.assignment_id] = { score:Number(g.score||0), max:Number(g.max_score||0) }; });
        setGradeMap(gm);
        // Also fetch my submissions to mark status
        const { data: mine } = await supabase.from('submissions')
          .select('assignment_id').eq('user_id', user.id).in('assignment_id', ids);
        const map: Record<string, number> = {};
        (mine ?? []).forEach(s => { map[s.assignment_id] = 1; });
        setSubMap(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId, user?.id, canEdit]);

  const save = async () => {
    if (!form.title.trim() || !courseId) return;
    setSaving(true);
    const { data, error } = await supabase.from('assignments')
      .insert({
        course_id: courseId, title: form.title.trim(), submission_type: form.submission_type,
        group_name: form.group_name, points: parseInt(form.points) || 0,
        due_at: form.due_at || null, published: form.published,
      }).select().single();
    if (error) { toast.error('Could not create assignment'); setSaving(false); return; }
    if (data) setAssignments(p => [...p, data]);
    setForm({ title:'', submission_type:'assignment', group_name:'Assignments', points:'100', due_at:'', published:false });
    setShowForm(false); setSaving(false);
    toast.success('Assignment saved');
  };

  const togglePub = async (id: string, current: boolean) => {
    setAssignments(p => p.map(a => a.id === id ? { ...a, published: !current } : a));
    const { error } = await supabase.from('assignments').update({ published: !current }).eq('id', id);
    if (error) toast.error('Failed to update'); else toast.success(current ? 'Unpublished' : 'Published');
  };

  const del = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    setAssignments(p => p.filter(a => a.id !== id));
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) toast.error('Failed to delete'); else toast.success('Deleted');
  };

  const openDetail = (a: Assignment) => {
    if (!courseId) return;
    navigate(`/portal/courses/${courseId}/assignments/${a.id}`);
  };

  const groups = useMemo(() => [...new Set(assignments.map(a => a.group_name || 'Assignments'))].sort(natSort), [assignments]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments
      .filter(a => !q || a.title.toLowerCase().includes(q))
      .filter(a => statusFilter === 'all' || (statusFilter === 'published' ? a.published : !a.published))
      .sort((a, b) => natSort(a.title, b.title));
  }, [assignments, search, statusFilter]);

  const statusForStudent = (a: Assignment): { label:string; color:string } => {
    const g = gradeMap[a.id];
    if (g) return { label:`Graded ${g.score}/${g.max}`, color:C.success };
    if (subMap[a.id]) return { label:'Submitted', color:C.accent };
    if (a.due_at && new Date(a.due_at) < new Date()) return { label:'Late', color:C.error };
    return { label:'Not submitted', color:C.muted };
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, gap:8, flexWrap:'wrap' }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>Assignments</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments…"
            style={{ padding:'7px 10px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:13, fontFamily:'sans-serif', minWidth:200 }} />
          {canEdit && (['all','published','unpublished'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              style={{ padding:'6px 12px', border:`1px solid ${C.border}`, borderRadius:5, background:statusFilter===f?C.primary:C.white, color:statusFilter===f?'white':C.text, fontSize:12, cursor:'pointer', textTransform:'capitalize', fontFamily:'sans-serif' }}>
              {f}
            </button>
          ))}
          {canEdit && (
            <button onClick={() => setShowForm(!showForm)}
              style={{ padding:'7px 16px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
              + Assignment
            </button>
          )}
        </div>
      </div>

      {showForm && canEdit && (
        <div style={{ background:C.white, border:`2px solid ${C.primary}`, borderRadius:8, padding:20, marginBottom:20 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, fontFamily:'sans-serif', color:C.text }}>New Assignment</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Name *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Type</label>
              <select value={form.submission_type} onChange={e => setForm(p => ({ ...p, submission_type: e.target.value }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif' }}>
                {['assignment','quiz','exam','discussion'].map(o => <option key={o} value={o}>{o[0].toUpperCase()+o.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.text, fontFamily:'sans-serif', marginBottom:4 }}>Group</label>
              <select value={form.group_name} onChange={e => setForm(p => ({ ...p, group_name: e.target.value }))}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:5, padding:'8px 9px', fontSize:13, fontFamily:'sans-serif' }}>
                {['Assignments','Quizzes','Clinical Skills','Exams','Written Assignments'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
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
            {filtered.filter(a => (a.group_name || 'Assignments') === group).map((a, i, arr) => {
              const stu = !canEdit ? statusForStudent(a) : null;
              const count = subMap[a.id] ?? 0;
              return (
                <div key={a.id} onClick={() => openDetail(a)}
                  style={{ padding:'12px 14px', borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : 'none', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fd'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                  <span style={{ fontSize:18 }}>{typeIcon(a.submission_type)}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.primary, fontFamily:'sans-serif' }}>{a.title}</div>
                    <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>
                      {a.points} pts
                      {a.due_at && ` • Due ${new Date(a.due_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}`}
                      {!a.published && <span style={{ color:C.error, marginLeft:8, fontWeight:600 }}>UNPUBLISHED</span>}
                    </div>
                  </div>
                  {canEdit ? (
                    <>
                      <span style={{ fontSize:11, padding:'3px 8px', borderRadius:12, background:'#EDE8F7', color:C.primary, fontFamily:'sans-serif', fontWeight:600 }}>
                        {count}/{rosterSize} submitted
                      </span>
                      <div onClick={e => { e.stopPropagation(); togglePub(a.id, a.published); }} title={a.published ? 'Published' : 'Unpublished'}
                        style={{ width:16, height:16, borderRadius:'50%', background: a.published ? C.success : C.border, cursor:'pointer', flexShrink:0 }}/>
                      <button onClick={e => { e.stopPropagation(); del(a.id); }}
                        style={{ padding:'3px 8px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.error }}>✕</button>
                    </>
                  ) : (
                    <span style={{ fontSize:11, padding:'3px 10px', borderRadius:12, background:`${stu!.color}22`, color:stu!.color, fontFamily:'sans-serif', fontWeight:600 }}>
                      {stu!.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentView;
