/**
 * Study Helper — the student-side assistant.
 *
 * Runs a quick self-check for the signed-in student and surfaces anything
 * that needs their attention: unfinished quizzes, work waiting on a grade,
 * missing profile details, missed attendance and what opens next.
 * Everything is read with the student's own session, so it can only ever
 * see the student's own data.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles } from 'lucide-react';

type Level = 'action' | 'info' | 'good';

interface Tip {
  level: Level;
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const STYLE: Record<Level, { bg: string; fg: string; icon: string }> = {
  action: { bg: '#FFF4E5', fg: '#A15C00', icon: '⚠️' },
  info:   { bg: '#EAF3FF', fg: '#0B5CAD', icon: 'ℹ️' },
  good:   { bg: '#E9F7EF', fg: '#1B6B45', icon: '✅' },
};

const StudentAssistant: React.FC<{ userId?: string }> = ({ userId }) => {
  const navigate = useNavigate();
  const [tips, setTips] = useState<Tip[]>([]);
  const [busy, setBusy] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string>('');

  const run = useCallback(async () => {
    if (!userId) return;
    setBusy(true);
    const found: Tip[] = [];
    try {
      const { data: enrolls } = await supabase
        .from('enrollments')
        .select('course_id, courses ( id, title )')
        .eq('user_id', userId);
      const courses = ((enrolls ?? []) as any[]).map(e => e.courses).filter(Boolean);
      const courseIds = courses.map((c: any) => c.id);
      const titleOf = (id: string) => courses.find((c: any) => c.id === id)?.title ?? 'your class';

      if (courseIds.length === 0) {
        found.push({
          level: 'action',
          title: 'You are not in a class yet',
          detail: 'Contact your instructor at info@healthstaracademy.org so they can add you to your cohort.',
        });
      }

      const [{ data: profile }, { data: attempts }, { data: quizzes }, { data: attendance }] = await Promise.all([
        supabase.from('profiles').select('full_name, phone').eq('user_id', userId).maybeSingle(),
        supabase.from('quiz_attempts')
          .select('id, quiz_id, submitted_at, grading_status, score, max_score, started_at')
          .eq('user_id', userId),
        courseIds.length
          ? supabase.from('quizzes').select('id, course_id, title, due_at, published').in('course_id', courseIds).eq('published', true)
          : Promise.resolve({ data: [] as any[] }),
        supabase.from('attendance').select('id, status, session_date').eq('student_id', userId),
      ]);

      // 1. Profile completeness
      if (!profile?.full_name || !profile.full_name.trim()) {
        found.push({
          level: 'action',
          title: 'Add your full name to your profile',
          detail: 'Your name appears on your records and certificate, so it must be correct.',
          actionLabel: 'Open profile',
          onAction: () => navigate('/portal/teach/account'),
        });
      } else if (!profile.phone) {
        found.push({
          level: 'info',
          title: 'Add a phone number',
          detail: 'Your instructor uses it to reach you about clinical days and schedule changes.',
          actionLabel: 'Open profile',
          onAction: () => navigate('/portal/teach/account'),
        });
      }

      const list = (attempts ?? []) as any[];
      const quizTitle = (id: string) => ((quizzes ?? []) as any[]).find(q => q.id === id)?.title ?? 'a quiz';

      // 2. Quizzes started but never turned in
      const unfinished = list.filter(a => !a.submitted_at);
      unfinished.forEach(a => {
        found.push({
          level: 'action',
          title: `You started "${quizTitle(a.quiz_id)}" but never turned it in`,
          detail: 'It still counts as your attempt. Open it and press Submit, or ask your instructor to reopen it.',
        });
      });

      // 3. Work waiting on the instructor
      const awaiting = list.filter(a => a.submitted_at && a.grading_status !== 'released');
      if (awaiting.length) {
        found.push({
          level: 'info',
          title: `${awaiting.length} quiz${awaiting.length > 1 ? 'zes' : ''} turned in and waiting to be graded`,
          detail: 'Your instructor grades these by hand. Your score appears here once it is released.',
        });
      }

      // 4. Quizzes that are open and not yet started
      const started = new Set(list.map(a => a.quiz_id));
      const openTodo = ((quizzes ?? []) as any[]).filter(q => !started.has(q.id));
      if (openTodo.length) {
        const next = openTodo[0];
        found.push({
          level: 'action',
          title: `${openTodo.length} quiz${openTodo.length > 1 ? 'zes are' : ' is'} open for you to take`,
          detail: `Start with "${next.title}" in ${titleOf(next.course_id)}. You get one attempt unless your instructor gives you another.`,
          actionLabel: 'Go to quizzes',
          onAction: () => navigate(`/portal/teach?course=${next.course_id}&tab=quizzes`),
        });
      }

      // 5. Attendance
      const absences = ((attendance ?? []) as any[]).filter(a => a.status === 'absent');
      if (absences.length) {
        found.push({
          level: 'action',
          title: `${absences.length} day${absences.length > 1 ? 's' : ''} marked absent`,
          detail: 'Missed hours must be made up to finish the program. Talk to your instructor about a make-up day.',
          actionLabel: 'View attendance',
          onAction: () => courseIds[0] && navigate(`/portal/teach?course=${courseIds[0]}&tab=attendance`),
        });
      }

      if (found.length === 0) {
        found.push({
          level: 'good',
          title: 'You are all caught up',
          detail: 'Nothing needs your attention right now. Keep going with the next day in Modules.',
        });
      }
    } catch {
      found.push({ level: 'info', title: 'Could not finish the check', detail: 'Try again in a moment.' });
    }
    setTips(found);
    setCheckedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    setBusy(false);
  }, [userId, navigate]);

  useEffect(() => { run(); }, [run]);

  if (!userId) return null;

  return (
    <Card className="mb-6 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Study Helper</h2>
            {checkedAt && <span className="text-xs text-muted-foreground">checked {checkedAt}</span>}
          </div>
          <Button variant="ghost" size="sm" onClick={run} disabled={busy}>
            <RefreshCw className={`h-4 w-4 mr-1 ${busy ? 'animate-spin' : ''}`} /> Check again
          </Button>
        </div>

        <div className="space-y-2">
          {tips.map((t, i) => (
            <div key={i} className="rounded-md p-3 flex flex-wrap items-start gap-3"
                 style={{ background: STYLE[t.level].bg }}>
              <span aria-hidden>{STYLE[t.level].icon}</span>
              <div className="flex-1 min-w-[180px]">
                <div className="text-sm font-semibold" style={{ color: STYLE[t.level].fg }}>{t.title}</div>
                {t.detail && <div className="text-xs mt-0.5 text-foreground/70">{t.detail}</div>}
              </div>
              {t.actionLabel && t.onAction && (
                <Button size="sm" variant="secondary" onClick={t.onAction}>{t.actionLabel}</Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAssistant;
