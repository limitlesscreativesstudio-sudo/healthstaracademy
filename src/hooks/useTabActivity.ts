import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/pages/portal/teach/AuthContext';

// Tracks the newest content timestamp per course tab and compares it against
// the last time this user opened that tab (stored locally). Tabs with newer
// content show a "new" dot in the course sidebar until they are clicked.
const SOURCES: { tab: string; table: string }[] = [
  { tab: 'modules', table: 'modules' },
  { tab: 'quizzes', table: 'quizzes' },
  { tab: 'assignments', table: 'assignments' },
  { tab: 'pages', table: 'lms_pages' },
  { tab: 'files', table: 'lms_files' },
  { tab: 'discussions', table: 'discussions' },
];

const seenKey = (courseId: string, tab: string) => `hsa.tabseen.${courseId}.${tab}`;

export function useTabActivity(courseId?: string, refreshKey: number = 0) {
  const [newTabs, setNewTabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!courseId) { setNewTabs({}); return; }
    let cancelled = false;
    (async () => {
      const results = await Promise.all(SOURCES.map(async (s) => {
        const { data } = await supabase
          .from(s.table as never)
          .select('created_at, updated_at')
          .eq('course_id', courseId)
          .order('updated_at', { ascending: false })
          .limit(1);
        const row: any = data?.[0];
        const latest = row ? new Date(row.updated_at || row.created_at).getTime() : 0;
        const seen = Number(localStorage.getItem(seenKey(courseId, s.tab)) || 0);
        return [s.tab, latest > 0 && latest > seen] as const;
      }));
      if (cancelled) return;
      setNewTabs(Object.fromEntries(results));
    })();
    return () => { cancelled = true; };
  }, [courseId, refreshKey]);

  const markSeen = useCallback((tab: string) => {
    if (!courseId) return;
    localStorage.setItem(seenKey(courseId, tab), String(Date.now()));
    setNewTabs(prev => (prev[tab] ? { ...prev, [tab]: false } : prev));
  }, [courseId]);

  return { newTabs, markSeen };
}
