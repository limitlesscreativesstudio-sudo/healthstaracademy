import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, KeyRound, BookOpen, CalendarCheck, GraduationCap, X } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  cta: string;
}

interface OnboardingChecklistProps {
  userId?: string;
  /** First enrolled course, used to deep-link modules and attendance. */
  courseId?: string;
}

const STEP_IDS = ['password', 'modules', 'attendance', 'grades'];

const storageKey = (userId?: string) => `hsa.onboarding.${userId ?? 'anon'}`;

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ userId, courseId }) => {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let nextDone: Record<string, boolean> = {};
      let nextDismissed = false;
      try {
        const raw = localStorage.getItem(storageKey(userId));
        if (raw) {
          const parsed = JSON.parse(raw);
          nextDone = parsed.done ?? {};
          nextDismissed = Boolean(parsed.dismissed);
        }
      } catch {
        /* ignore malformed state */
      }
      if (userId) {
        const { data } = await supabase
          .from('student_onboarding_progress')
          .select('steps, dismissed')
          .eq('user_id', userId)
          .maybeSingle();
        if (data) {
          nextDone = { ...nextDone, ...((data.steps as Record<string, boolean>) ?? {}) };
          nextDismissed = nextDismissed || Boolean(data.dismissed);
        } else {
          await supabase.from('student_onboarding_progress').upsert({
            user_id: userId,
            steps: nextDone,
            dismissed: nextDismissed,
          }, { onConflict: 'user_id' });
        }
      }
      if (cancelled) return;
      setDone(nextDone);
      setDismissed(nextDismissed);
      setReady(true);
    };
    void load();
    return () => { cancelled = true; };
  }, [userId]);

  const persist = useCallback((next: Record<string, boolean>, nextDismissed: boolean) => {
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify({ done: next, dismissed: nextDismissed }));
    } catch {
      /* storage unavailable */
    }
    if (!userId) return;
    const allDone = STEP_IDS.every(id => next[id]);
    // Saved server-side so automated onboarding reminders know what's still open.
    void supabase.from('student_onboarding_progress').upsert({
      user_id: userId,
      steps: next,
      dismissed: nextDismissed,
      completed_at: allDone ? new Date().toISOString() : null,
    }, { onConflict: 'user_id' });
  }, [userId]);

  const steps: Step[] = [
    {
      id: 'password',
      title: 'Set your own password',
      description: 'Replace the temporary password you were emailed with one only you know.',
      icon: KeyRound,
      to: '/portal/teach/update-password',
      cta: 'Set password',
    },
    {
      id: 'modules',
      title: 'Open Modules and start Day 1',
      description: 'Modules hold your daily lessons, readings, and skills videos in order.',
      icon: BookOpen,
      to: courseId ? `/portal/courses/${courseId}?tab=modules` : '/portal',
      cta: 'Go to Modules',
    },
    {
      id: 'attendance',
      title: 'Check your Attendance tab',
      description: 'Attendance and clinical hours are tracked here — review it after each class day.',
      icon: CalendarCheck,
      to: courseId ? `/portal/courses/${courseId}?tab=attendance` : '/portal',
      cta: 'View Attendance',
    },
    {
      id: 'grades',
      title: 'Know where your grades live',
      description: 'Quiz scores and your final exam results post to Grades — only you can see them.',
      icon: GraduationCap,
      to: courseId ? `/portal/courses/${courseId}?tab=grades` : '/portal',
      cta: 'View Grades',
    },
  ];

  const completed = steps.filter(s => done[s.id]).length;
  const pct = Math.round((completed / steps.length) * 100);

  const toggle = (id: string, value: boolean) => {
    const next = { ...done, [id]: value };
    setDone(next);
    persist(next, dismissed);
  };

  const markAndGo = (id: string) => {
    const next = { ...done, [id]: true };
    setDone(next);
    persist(next, dismissed);
  };

  const dismiss = () => {
    setDismissed(true);
    persist(done, true);
  };

  if (!ready || dismissed) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Getting started
            </h2>
            <p className="text-sm text-muted-foreground">
              Four quick steps to set up your Student Portal.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={dismiss} aria-label="Dismiss getting started checklist">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {completed} of {steps.length} done
          </span>
        </div>

        <ul className="space-y-2">
          {steps.map(step => {
            const Icon = step.icon;
            const isDone = Boolean(done[step.id]);
            return (
              <li
                key={step.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
              >
                <Checkbox
                  id={`onboarding-${step.id}`}
                  checked={isDone}
                  onCheckedChange={v => toggle(step.id, Boolean(v))}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`onboarding-${step.id}`}
                    className={`text-sm font-medium flex items-center gap-2 cursor-pointer ${isDone ? 'line-through text-muted-foreground' : ''}`}
                  >
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    {step.title}
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant={isDone ? 'outline' : 'default'}
                  onClick={() => markAndGo(step.id)}
                  className="shrink-0"
                >
                  <Link to={step.to}>{step.cta}</Link>
                </Button>
              </li>
            );
          })}
        </ul>

        {completed === steps.length && (
          <p className="text-xs text-muted-foreground mt-3">
            All set — you can hide this checklist with the ✕ above.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;
