import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import OnboardingChecklist from '@/components/portal/OnboardingChecklist';
import StudentAssistant from '@/components/portal/StudentAssistant';

import { BookOpen, Calendar, Bell, Briefcase, User, LogOut, GraduationCap } from 'lucide-react';

interface CourseRow {
  id: string;
  title: string;
  code: string;
  cover_image_url: string | null;
  term: string | null;
}

interface UpcomingItem {
  kind: 'assignment' | 'quiz';
  id: string;
  course_id: string;
  course_title: string;
  title: string;
  due_at: string | null;
}

interface AnnouncementRow {
  id: string;
  title: string;
  body: string | null;
  posted_at: string;
  course_id: string;
  course_title?: string;
}

const StudentHome: React.FC = () => {
  const { user, loading, isInstructor } = usePortalAuth(true);
  const navigate = useNavigate();
  // Instructors and admins get their own dashboard — keep student and instructor views separate.
  useEffect(() => {
    if (!loading && isInstructor) navigate('/portal/teach', { replace: true });
  }, [loading, isInstructor, navigate]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoadingData(true);

      const { data: enrolls } = await supabase
        .from('enrollments')
        .select('course_id, courses ( id, title, code, cover_image_url, term )')
        .eq('user_id', user.id);

      const cs: CourseRow[] = ((enrolls ?? []) as any[])
        .map(e => e.courses)
        .filter(Boolean);
      setCourses(cs);

      const courseIds = cs.map(c => c.id);
      if (courseIds.length === 0) {
        setUpcoming([]);
        setAnnouncements([]);
        setLoadingData(false);
        return;
      }

      const nowIso = new Date().toISOString();
      const horizon = new Date(Date.now() + 14 * 86400000).toISOString();

      const [{ data: asgs }, { data: qzs }, { data: anns }] = await Promise.all([
        supabase.from('assignments')
          .select('id, course_id, title, due_at')
          .in('course_id', courseIds)
          .gte('due_at', nowIso)
          .lte('due_at', horizon)
          .order('due_at', { ascending: true }),
        supabase.from('quizzes')
          .select('id, course_id, title, due_at, published')
          .in('course_id', courseIds)
          .eq('published', true)
          .gte('due_at', nowIso)
          .lte('due_at', horizon)
          .order('due_at', { ascending: true }),
        supabase.from('lms_announcements')
          .select('id, title, body, posted_at, course_id')
          .in('course_id', courseIds)
          .order('posted_at', { ascending: false })
          .limit(5),
      ]);

      const byId: Record<string, string> = {};
      cs.forEach(c => { byId[c.id] = c.title; });

      const up: UpcomingItem[] = [
        ...((asgs ?? []) as any[]).map(a => ({
          kind: 'assignment' as const, id: a.id, course_id: a.course_id,
          course_title: byId[a.course_id] ?? 'Course', title: a.title, due_at: a.due_at,
        })),
        ...((qzs ?? []) as any[]).map(q => ({
          kind: 'quiz' as const, id: q.id, course_id: q.course_id,
          course_title: byId[q.course_id] ?? 'Course', title: q.title, due_at: q.due_at,
        })),
      ].sort((a, b) => (a.due_at ?? '').localeCompare(b.due_at ?? ''));
      setUpcoming(up.slice(0, 8));

      setAnnouncements(
        ((anns ?? []) as any[]).map(a => ({ ...a, course_title: byId[a.course_id] ?? 'Course' }))
      );
      setLoadingData(false);
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/portal/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <span className="inline-block h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Student-only portal strip — mirrors the instructor portal's mode banner */}
      <div className="bg-[#319795] text-white text-xs font-sans px-4 py-1.5 flex items-center gap-2">
        <span aria-hidden="true">🎓</span>
        <strong className="uppercase tracking-wide text-[11px]">Student Portal</strong>
        <span className="opacity-85">· Your modules, quizzes, grades and attendance</span>
      </div>
      <header className="bg-background border-b-2 border-[#319795]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/hsa-logo.png" alt="Health Star Academy" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <div className="text-sm font-semibold leading-tight">Health Star Academy</div>
              <div className="text-xs text-muted-foreground">Student Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/portal/career"><Briefcase className="h-4 w-4 mr-1" />Career</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/portal/account"><User className="h-4 w-4 mr-1" />Account</Link></Button>
            <Button onClick={handleLogout} variant="ghost" size="sm"><LogOut className="h-4 w-4 mr-1" />Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">Here's what's coming up in your CNA program.</p>
        </section>

        {!loadingData && (
          <OnboardingChecklist userId={user?.id} courseId={courses[0]?.id} />
        )}

        {!loadingData && <StudentAssistant userId={user?.id} />}



        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> My Courses
          </h2>
          {loadingData ? (
            <p className="text-sm text-muted-foreground">Loading courses…</p>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-60" />
                You're not enrolled in any courses yet. Your instructor will enroll you once your cohort starts.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map(c => (
                <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/portal/courses/${c.id}`)}>
                  <div className="h-24 rounded-t-lg bg-primary" style={c.cover_image_url ? { backgroundImage: `url(${c.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
                  <CardContent className="p-4">
                    <div className="font-semibold text-foreground mb-1 line-clamp-2">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.code}</div>
                    {c.term && <div className="text-xs text-muted-foreground mt-1">{c.term}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Upcoming (next 14 days)
            </h2>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {upcoming.length === 0 ? (
                  <div className="py-6 px-4 text-sm text-muted-foreground text-center">
                    Nothing due in the next two weeks. 🎉
                  </div>
                ) : upcoming.map(item => (
                  <Link
                    key={`${item.kind}-${item.id}`}
                    to={item.kind === 'assignment'
                      ? `/portal/courses/${item.course_id}/assignments/${item.id}`
                      : `/portal/courses/${item.course_id}/quizzes/${item.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {item.kind}
                        </Badge>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{item.course_title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.due_at ? new Date(item.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Recent Announcements
            </h2>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {announcements.length === 0 ? (
                  <div className="py-6 px-4 text-sm text-muted-foreground text-center">
                    No announcements yet.
                  </div>
                ) : announcements.map(a => (
                  <div key={a.id} className="px-4 py-3">
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {a.course_title} · {new Date(a.posted_at).toLocaleDateString()}
                    </div>
                    {a.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{a.body}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentHome;
