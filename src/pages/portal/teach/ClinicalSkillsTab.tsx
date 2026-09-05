// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#655480', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

interface Props { courseId?: string; canEdit?: boolean; }

interface Student { userId: string; name: string; }
interface Skill { id: string; name: string; category: string; cdph_module: string | null; position: number; }
interface SignOff { status: string; signed_off_at?: string | null; evaluator_name?: string | null; }

const STOP = new Set(['a','an','and','the','of','for','with','on','one','to','in','from','using','provide','providing','measure','record','client','resident','who','has','use','assist','their','not','self','care']);
const words = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));

/** Pull "Skill 9B.2: Providing Catheter Care for a Female: <vimeo url>" pairs out of page HTML. */
function extractVideos(html: string): { label: string; url: string }[] {
  const out: { label: string; url: string }[] = [];
  const text = (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  const re = /Skill\s+([0-9]+[A-Za-z]?\.?[0-9]*)\s*:\s*([^:]{3,120}?)\s*:\s*(https?:\/\/\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    out.push({ label: `Skill ${m[1]}: ${m[2].trim()}`, url: m[3].replace(/[.,)]+$/, '') });
  }
  return out;
}

function matchVideo(skillName: string, videos: { label: string; url: string }[]) {
  const sw = words(skillName);
  if (!sw.length) return null;
  let best: { label: string; url: string } | null = null;
  let bestScore = 0;
  for (const v of videos) {
    const vw = new Set(words(v.label));
    const score = sw.filter(w => vw.has(w)).length / sw.length;
    if (score > bestScore) { bestScore = score; best = v; }
  }
  return bestScore >= 0.4 ? best : null;
}

const ClinicalSkillsTab: React.FC<Props> = ({ courseId, canEdit = false }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [videos, setVideos] = useState<{ label: string; url: string }[]>([]);
  const [signoffs, setSignoffs] = useState<Record<string, Record<string, SignOff>>>({});
  const [selStudent, setSelStudent] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [{ data: enrs }, { data: sks }, { data: pages }, { data: sos }] = await Promise.all([
        supabase.from('enrollments').select('user_id, role').eq('course_id', courseId).eq('role', 'student'),
        supabase.from('cna_skills').select('id, name, category, cdph_module, position').eq('active', true).order('position'),
        supabase.from('lms_pages').select('body_html').eq('course_id', courseId).ilike('title', '%skills video%'),
        supabase.from('student_skill_signoffs').select('student_user_id, skill_id, status, signed_off_at, evaluator_name').eq('course_id', courseId),
      ]);

      const uids = (enrs ?? []).map(e => e.user_id);
      let roster: Student[] = [];
      if (uids.length) {
        const { data: profs } = await supabase.from('profiles').select('user_id, full_name').in('user_id', uids);
        const nameBy: Record<string, string> = {};
        (profs ?? []).forEach(p => { nameBy[p.user_id] = p.full_name || 'Student'; });
        roster = uids.map(u => ({ userId: u, name: nameBy[u] || 'Student' }))
                     .sort((a, b) => a.name.localeCompare(b.name));
      }
      setStudents(roster);
      setSelStudent(prev => prev && roster.some(r => r.userId === prev) ? prev : (roster[0]?.userId ?? null));
      setSkills((sks ?? []) as Skill[]);
      setVideos((pages ?? []).flatMap(p => extractVideos(p.body_html || '')));

      const map: Record<string, Record<string, SignOff>> = {};
      (sos ?? []).forEach(s => {
        map[s.student_user_id] = map[s.student_user_id] || {};
        map[s.student_user_id][s.skill_id] = { status: s.status, signed_off_at: s.signed_off_at, evaluator_name: s.evaluator_name };
      });
      setSignoffs(map);
      setLoading(false);
    })();
  }, [courseId]);

  const categories = useMemo(() => {
    const byCat: Record<string, Skill[]> = {};
    skills.forEach(s => { (byCat[s.category || 'Other'] ||= []).push(s); });
    return Object.entries(byCat);
  }, [skills]);

  const isSigned = (uid: string, skillId: string) => {
    const st = signoffs[uid]?.[skillId]?.status;
    return st === 'signed' || st === 'completed' || st === 'passed';
  };
  const completedCount = (uid: string) => skills.filter(s => isSigned(uid, s.id)).length;
  const pct = (uid: string) => skills.length ? Math.round((completedCount(uid) / skills.length) * 100) : 0;

  const toggleSkill = async (skill: Skill) => {
    if (!canEdit || !selStudent || !courseId) return;
    const next = isSigned(selStudent, skill.id) ? 'pending' : 'signed';
    setSaving(skill.id);
    setSignoffs(prev => ({
      ...prev,
      [selStudent]: { ...(prev[selStudent] || {}), [skill.id]: { status: next, signed_off_at: next === 'signed' ? new Date().toISOString() : null } },
    }));
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from('student_skill_signoffs').upsert({
      student_user_id: selStudent,
      course_id: courseId,
      skill_id: skill.id,
      status: next,
      signed_off_by: next === 'signed' ? auth?.user?.id ?? null : null,
      signed_off_at: next === 'signed' ? new Date().toISOString() : null,
    }, { onConflict: 'student_user_id,course_id,skill_id' });
    if (error) {
      setSignoffs(prev => ({
        ...prev,
        [selStudent]: { ...(prev[selStudent] || {}), [skill.id]: { status: next === 'signed' ? 'pending' : 'signed' } },
      }));
      toast.error(`Skill sign-off was not saved: ${error.message}`);
      setSaving(null);
      return;
    }
    window.dispatchEvent(new CustomEvent('hsa:progress-updated', { detail: { courseId } }));
    toast.success(next === 'signed' ? 'Skill sign-off saved' : 'Skill sign-off reopened');
    setSaving(null);
  };

  if (!courseId) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Select a course.</div>;
  if (loading) return <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading clinical skills…</div>;

  const selName = students.find(s => s.userId === selStudent)?.name ?? '';

  return (
    <div style={{ padding:24, fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.text }}>Clinical Skills Sign-Off</h2>
        <span style={{ fontSize:12, color:C.muted }}>{skills.length} CDPH skills · {videos.length} linked skill videos</span>
      </div>
      <p style={{ margin:'0 0 18px', fontSize:12, color:C.muted }}>
        Students enrolled in this course populate automatically. Video links come from the course’s Skills Videos page.
      </p>

      {students.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:C.white, border:`1px dashed ${C.border}`, borderRadius:8, color:C.muted }}>
          No students enrolled in this course yet. Add them in the People tab and they’ll appear here automatically.
        </div>
      ) : (
      <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
        {/* Student list */}
        <div style={{ width:220, flexShrink:0 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Students</div>
          {students.map(st => {
            const p = pct(st.userId);
            const isActive = st.userId === selStudent;
            return (
              <button key={st.userId} onClick={() => setSelStudent(st.userId)} aria-pressed={isActive}
                style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 12px', borderRadius:6, cursor:'pointer', marginBottom:4, background:isActive ? '#EDE8F7' : C.white, border:`1px solid ${isActive ? C.primary : C.border}` }}>
                <div style={{ fontSize:13, fontWeight:600, color:isActive ? C.primary : C.text, marginBottom:4 }}>{st.name}</div>
                <div style={{ height:4, borderRadius:2, background:C.border, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${p}%`, background: p >= 80 ? C.success : p >= 50 ? C.warn : C.error, transition:'width .3s' }}/>
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{completedCount(st.userId)}/{skills.length} skills • {p}%</div>
              </button>
            );
          })}
        </div>

        {/* Skills panel */}
        <div style={{ flex:1, minWidth:320 }}>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ margin:'0 0 4px', fontSize:16, fontWeight:700, color:C.text }}>{selName}</h3>
                <div style={{ fontSize:13, color:C.muted }}>{completedCount(selStudent!)} of {skills.length} skills completed</div>
              </div>
              <div style={{ fontSize:28, fontWeight:800, color: pct(selStudent!) >= 80 ? C.success : C.warn }}>{pct(selStudent!)}%</div>
            </div>
            <div style={{ height:8, borderRadius:4, background:C.border, marginTop:12, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct(selStudent!)}%`, background: pct(selStudent!) >= 80 ? C.success : C.warn, transition:'width .4s' }}/>
            </div>
          </div>

          {categories.map(([cat, items]) => (
            <div key={cat} style={{ border:`1px solid ${C.border}`, borderRadius:6, marginBottom:10, overflow:'hidden', background:C.white }}>
              <div onClick={() => setCollapsed(p => ({ ...p, [cat]: !p[cat] }))}
                style={{ padding:'11px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', background:'#F0EDF7' }}>
                <span style={{ flex:1, fontWeight:700, fontSize:13, color:C.text }}>{cat}</span>
                <span style={{ fontSize:12, color:C.muted }}>
                  {items.filter(i => isSigned(selStudent!, i.id)).length}/{items.length}
                </span>
                <span style={{ color:C.muted }}>{collapsed[cat] ? '▼' : '▲'}</span>
              </div>
              {!collapsed[cat] && (
                <div>
                  {items.map(item => {
                    const signed = isSigned(selStudent!, item.id);
                    const so = signoffs[selStudent!]?.[item.id];
                    const vid = matchVideo(item.name, videos);
                    return (
                      <div key={item.id} style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:12, borderTop:`1px solid ${C.border}` }}>
                        <button onClick={() => toggleSkill(item)} disabled={!canEdit || saving === item.id}
                          aria-label={`${signed ? 'Unsign' : 'Sign off'} ${item.name}`}
                          style={{ width:22, height:22, borderRadius:4, border:`2px solid ${signed ? C.success : C.border}`, background:signed ? C.success : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:canEdit ? 'pointer' : 'default', padding:0 }}>
                          {signed && <span style={{ color:'white', fontSize:13, fontWeight:700 }}>✓</span>}
                        </button>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:C.text }}>{item.name}</div>
                          {item.cdph_module && <div style={{ fontSize:11, color:C.muted }}>{item.cdph_module}</div>}
                        </div>
                        {vid && (
                          <a href={vid.url} target="_blank" rel="noopener noreferrer" title={vid.label}
                            style={{ fontSize:11, color:C.primary, fontWeight:600, textDecoration:'none', border:`1px solid ${C.border}`, borderRadius:4, padding:'3px 8px' }}>
                            ▶ Watch skill video
                          </a>
                        )}
                        {signed && so?.signed_off_at && (
                          <span style={{ fontSize:11, color:C.muted }}>
                            {new Date(so.signed_off_at).toLocaleDateString()}
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
      )}
    </div>
  );
};

export default ClinicalSkillsTab;
