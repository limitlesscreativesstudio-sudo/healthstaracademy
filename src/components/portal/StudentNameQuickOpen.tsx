// Instructors: click any student's name anywhere in the course and their
// progress panel opens. Works by matching clicked text to the enrolled roster.
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StudentProfilePanel from './StudentProfilePanel';

interface Stu { id: string; name: string; email?: string }

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const StudentNameQuickOpen: React.FC<{ courseId?: string; enabled: boolean }> = ({ courseId, enabled }) => {
  const [open, setOpen] = useState<Stu | null>(null);
  const byName = useRef<Map<string, Stu>>(new Map());

  useEffect(() => {
    byName.current = new Map();
    if (!enabled || !courseId) return;
    (async () => {
      const { data: enrs } = await supabase.from('enrollments')
        .select('user_id').eq('course_id', courseId).eq('role', 'student');
      const ids = (enrs ?? []).map((e: any) => e.user_id);
      if (!ids.length) return;
      const { data: profs } = await supabase.from('profiles')
        .select('user_id, full_name, email').in('user_id', ids);
      const m = new Map<string, Stu>();
      for (const p of (profs ?? []) as any[]) {
        if (!p.full_name) continue;
        m.set(norm(p.full_name), { id: p.user_id, name: p.full_name, email: p.email });
      }
      byName.current = m;
    })();
  }, [courseId, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const match = (el: HTMLElement | null): Stu | null => {
      for (let i = 0; el && i < 3; i++, el = el.parentElement) {
        if (el.closest('input,textarea,select,[contenteditable="true"],[data-student-panel]')) return null;
        const t = norm(el.innerText || '');
        if (!t || t.length > 80) return null;
        const s = byName.current.get(t);
        if (s) return s;
      }
      return null;
    };
    const onClick = (e: MouseEvent) => {
      if (!byName.current.size) return;
      const s = match(e.target as HTMLElement);
      if (!s) return;
      e.preventDefault(); e.stopPropagation();
      setOpen(s);
    };
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (byName.current.size && match(el)) { el.style.cursor = 'pointer'; el.title ||= 'Open student progress'; }
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('mouseover', onOver);
    return () => { document.removeEventListener('click', onClick, true); document.removeEventListener('mouseover', onOver); };
  }, [enabled]);

  if (!open || !courseId) return null;
  return (
    <div data-student-panel>
      <StudentProfilePanel userId={open.id} courseId={courseId} name={open.name} email={open.email} onClose={() => setOpen(null)} />
    </div>
  );
};

export default StudentNameQuickOpen;
