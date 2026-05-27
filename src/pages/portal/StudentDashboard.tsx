import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar as CalendarIcon, ClipboardList, FolderOpen, MessageSquare, Star, Briefcase, AlertCircle, Megaphone, ArrowRight, GraduationCap, CheckCircle2, Clock, Activity, Trophy } from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { formatDistanceToNow, isPast, differenceInDays } from "date-fns";

type Course = {
  id: string;
  title: string;
  code: string | null;
  term: string | null;
  cover_image_url: string | null;
  instructor_id: string;
  published?: boolean | null;
};

type SubmissionStatus = "graded" | "submitted" | "missing" | "not_started";

type UpcomingAssignment = {
  id: string;
  title: string;
  due_at: string;
  course_id: string;
  points: number;
  course_title?: string;
  status: SubmissionStatus;
  score?: number | null;
  max_score?: number | null;
  submitted_at?: string | null;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  posted_at: string;
  course_id: string;
  course_title?: string;
};

type CourseProgress = {
  completion: number;
  completed: number;
  total: number;
  nextMilestone?: { title: string; due_at: string | null; type: "assignment" | "quiz" };
};

// Canvas-style rotating card header colors
const CARD_COLORS = [
  "from-orange-500 to-rose-500",
  "from-rose-500 to-pink-600",
  "from-amber-600 to-yellow-700",
  "from-blue-700 to-indigo-800",
  "from-indigo-700 to-purple-800",
  "from-teal-600 to-cyan-700",
];

const StudentDashboard = () => {
  const { user, isInstructor } = usePortalAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [publishedCourseIds, setPublishedCourseIds] = useState<Set<string>>(new Set());
  const [upcoming, setUpcoming] = useState<UpcomingAssignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [progressByCourse, setProgressByCourse] = useState<Record<string, CourseProgress>>({});
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [lastVisited, setLastVisited] = useState<{ courseId: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
      const enrolledIds = (enrollments ?? []).map(e => e.course_id);
      const { data: courseData } = await supabase
        .from("courses")
        .select("id, title, code, term, cover_image_url, instructor_id")
        .or(`instructor_id.eq.${user.id}${enrolledIds.length ? `,id.in.(${enrolledIds.join(",")})` : ""}`);
      const myCourses = (courseData ?? []) as Course[];
      setCourses(myCourses);

      const courseIds = myCourses.map(c => c.id);
      if (courseIds.length) {
        const { data: pubMods } = await supabase
          .from("modules").select("course_id").in("course_id", courseIds).eq("published", true);
        setPublishedCourseIds(new Set((pubMods ?? []).map((m: any) => m.course_id as string)));
        const titleMap = Object.fromEntries(myCourses.map(c => [c.id, c.title]));
        const nowIso = new Date().toISOString();
        const in14 = new Date(Date.now() + 14 * 86400000).toISOString();

        const [{ data: asgn }, { data: ann }, { data: allAsgn }, { data: allQuizzes }, { data: mySubs }, { data: myGrades }, { data: myAttempts }] = await Promise.all([
          supabase
            .from("assignments")
            .select("id, title, due_at, course_id, points, published")
            .in("course_id", courseIds)
            .eq("published", true)
            .not("due_at", "is", null)
            .gte("due_at", nowIso)
            .lte("due_at", in14)
            .order("due_at", { ascending: true })
            .limit(8),
          supabase
            .from("lms_announcements")
            .select("id, title, body, posted_at, course_id")
            .in("course_id", courseIds)
            .order("posted_at", { ascending: false })
            .limit(5),
          supabase
            .from("assignments")
            .select("id, title, due_at, course_id, published")
            .in("course_id", courseIds)
            .eq("published", true),
          supabase
            .from("quizzes")
            .select("id, title, due_at, course_id, published")
            .in("course_id", courseIds)
            .eq("published", true),
          supabase.from("submissions").select("assignment_id, submitted_at").eq("user_id", user.id),
          supabase.from("grades").select("assignment_id, score, max_score").eq("user_id", user.id),
          supabase.from("quiz_attempts").select("quiz_id, submitted_at, score, started_at").eq("user_id", user.id),
        ]);

        const subByAsgn = new Map((mySubs ?? []).map(s => [s.assignment_id as string, s]));
        const gradeByAsgn = new Map((myGrades ?? []).map(g => [g.assignment_id as string, g]));
        const attemptByQuiz = new Map<string, any>();
        (myAttempts ?? []).forEach(a => {
          const prev = attemptByQuiz.get(a.quiz_id);
          if (!prev || (a.submitted_at && !prev.submitted_at)) attemptByQuiz.set(a.quiz_id, a);
        });

        // Upcoming with status
        const upcomingWithStatus: UpcomingAssignment[] = (asgn ?? []).map(a => {
          const g = gradeByAsgn.get(a.id);
          const s = subByAsgn.get(a.id);
          let status: SubmissionStatus = "not_started";
          if (g) status = "graded";
          else if (s) status = "submitted";
          else if (a.due_at && isPast(new Date(a.due_at))) status = "missing";
          return {
            ...a,
            course_title: titleMap[a.course_id],
            status,
            score: g?.score ?? null,
            max_score: g?.max_score ?? null,
            submitted_at: s?.submitted_at ?? null,
          };
        });
        setUpcoming(upcomingWithStatus);
        setAnnouncements((ann ?? []).map(a => ({ ...a, course_title: titleMap[a.course_id] })));

        // Per-course progress: completed = has submission/grade or attempt
        const progress: Record<string, CourseProgress> = {};
        for (const c of myCourses) {
          const cAsgns = (allAsgn ?? []).filter(a => a.course_id === c.id);
          const cQuizzes = (allQuizzes ?? []).filter(q => q.course_id === c.id);
          const total = cAsgns.length + cQuizzes.length;
          const completed =
            cAsgns.filter(a => subByAsgn.has(a.id) || gradeByAsgn.has(a.id)).length +
            cQuizzes.filter(q => attemptByQuiz.get(q.id)?.submitted_at).length;
          // Next milestone: soonest upcoming due item not yet completed
          const candidates: { title: string; due_at: string | null; type: "assignment" | "quiz" }[] = [
            ...cAsgns
              .filter(a => a.due_at && new Date(a.due_at) >= new Date() && !subByAsgn.has(a.id) && !gradeByAsgn.has(a.id))
              .map(a => ({ title: a.title, due_at: a.due_at, type: "assignment" as const })),
            ...cQuizzes
              .filter(q => q.due_at && new Date(q.due_at) >= new Date() && !attemptByQuiz.get(q.id)?.submitted_at)
              .map(q => ({ title: q.title, due_at: q.due_at, type: "quiz" as const })),
          ].sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());
          progress[c.id] = {
            completion: total ? Math.round((completed / total) * 100) : 0,
            completed,
            total,
            nextMilestone: candidates[0],
          };
        }
        setProgressByCourse(progress);

        // Last activity = latest submission/attempt timestamp
        const stamps: number[] = [];
        (mySubs ?? []).forEach(s => s.submitted_at && stamps.push(new Date(s.submitted_at).getTime()));
        (myAttempts ?? []).forEach(a => {
          if (a.submitted_at) stamps.push(new Date(a.submitted_at).getTime());
          else if (a.started_at) stamps.push(new Date(a.started_at).getTime());
        });
        if (stamps.length) setLastActivity(new Date(Math.max(...stamps)));
      }

      // Last visited course from localStorage (set by CourseView)
      try {
        const stored = localStorage.getItem("hsa:lastCourse");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (myCourses.find(c => c.id === parsed.courseId)) setLastVisited(parsed);
        }
      } catch { /* ignore */ }

      setLoading(false);
    })();
  }, [user]);

  return (
    <PortalLayout>
      <div className="px-6 py-5 max-w-[1400px] mx-auto w-full">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-5">Welcome back. Pick up where you left off.</p>

        {/* Progress metrics strip */}
        {!loading && courses.length > 0 && (() => {
          const totals = Object.values(progressByCourse).reduce(
            (acc, p) => ({ completed: acc.completed + p.completed, total: acc.total + p.total }),
            { completed: 0, total: 0 }
          );
          const overall = totals.total ? Math.round((totals.completed / totals.total) * 100) : 0;
          const nextMs = Object.entries(progressByCourse)
            .map(([cid, p]) => p.nextMilestone ? { ...p.nextMilestone, course_id: cid, course_title: courses.find(c => c.id === cid)?.title } : null)
            .filter(Boolean)
            .sort((a: any, b: any) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())[0] as any;
          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <Card>
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Trophy className="h-3.5 w-3.5 text-purple" /> Overall Completion
                  </div>
                  <div className="text-2xl font-bold text-foreground">{overall}%</div>
                  <Progress value={overall} className="h-1.5 mt-2" />
                  <div className="text-[11px] text-muted-foreground mt-1">{totals.completed} of {totals.total} items complete</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5 text-cyan" /> Next Milestone
                  </div>
                  {nextMs ? (
                    <Link to={`/portal/courses/${nextMs.course_id}`} className="block">
                      <div className="text-sm font-semibold text-foreground line-clamp-1">{nextMs.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{nextMs.course_title}</div>
                      <div className="text-xs text-coral font-medium mt-1">
                        Due {formatDistanceToNow(new Date(nextMs.due_at), { addSuffix: true })}
                      </div>
                    </Link>
                  ) : (
                    <div className="text-sm text-muted-foreground">No upcoming milestones</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Activity className="h-3.5 w-3.5 text-purple" /> Last Activity
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {lastActivity ? formatDistanceToNow(lastActivity, { addSuffix: true }) : "No activity yet"}
                  </div>
                  {lastActivity && (
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {lastActivity.toLocaleDateString()} · {lastActivity.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Resume card */}
        {lastVisited && (
          <Card className="mb-6 border-purple/30 bg-gradient-to-r from-purple/5 to-cyan/5">
            <CardContent className="py-4 px-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple/15 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Continue where you left off</div>
                  <div className="font-semibold text-foreground">{lastVisited.title}</div>
                </div>
              </div>
              <Link
                to={`/portal/courses/${lastVisited.courseId}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-purple hover:underline"
              >
                Resume <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main column */}
          <div>
            {(() => {
              const publishedCourses = courses.filter(c => publishedCourseIds.has(c.id) || c.instructor_id !== user?.id);
              const unpublishedCourses = courses.filter(c => !publishedCourseIds.has(c.id) && c.instructor_id === user?.id);
              const renderCard = (c: Course, idx: number) => {
                const gradient = CARD_COLORS[idx % CARD_COLORS.length];
                const linkTo = `/portal/courses/${c.id}`;
                return (
                  <Link key={c.id} to={linkTo}>
                    <Card className="overflow-hidden hover:shadow-medium transition-shadow h-full border">
                      <div
                        className={`h-36 bg-gradient-to-br ${gradient} flex items-start p-3 text-white relative`}
                        style={c.cover_image_url ? { backgroundImage: `url(${c.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                      >
                        {!c.cover_image_url && (
                          <div className="text-sm font-bold leading-tight line-clamp-4 drop-shadow">{c.title}</div>
                        )}
                      </div>
                      <CardContent className="pt-3 pb-3">
                        <h3 className="font-semibold text-sm text-purple line-clamp-1">{c.title}</h3>
                        {c.code && <div className="text-xs text-muted-foreground mt-0.5">{c.code}</div>}
                        {progressByCourse[c.id] && progressByCourse[c.id].total > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                              <span>{progressByCourse[c.id].completion}% complete</span>
                              <span>{progressByCourse[c.id].completed}/{progressByCourse[c.id].total}</span>
                            </div>
                            <Progress value={progressByCourse[c.id].completion} className="h-1" />
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-muted-foreground">
                          <ClipboardList className="h-4 w-4" />
                          <MessageSquare className="h-4 w-4" />
                          <FolderOpen className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              };
              return (
                <>
                  <h2 className="text-base font-semibold text-foreground mb-3">
                    Published Courses ({publishedCourses.length})
                  </h2>
                  {loading ? (
                    <div className="text-muted-foreground text-sm">Loading courses…</div>
                  ) : courses.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-semibold mb-1">No courses yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {isInstructor
                            ? "Create your first course to get started."
                            : "You haven't been enrolled in any courses yet. Your instructor will add you."}
                        </p>
                        {isInstructor && (
                          <Link to="/portal/teach" className="text-purple underline">Go to Teach</Link>
                        )}
                      </CardContent>
                    </Card>
                  ) : publishedCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No published courses to display.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {publishedCourses.map((c, idx) => renderCard(c, idx))}
                    </div>
                  )}

                  {isInstructor && !loading && (
                    <>
                      <h2 className="text-base font-semibold text-foreground mt-8 mb-3">
                        Unpublished Courses ({unpublishedCourses.length})
                      </h2>
                      {unpublishedCourses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No courses to display</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {unpublishedCourses.map((c, idx) => renderCard(c, idx))}
                        </div>
                      )}
                    </>
                  )}
                </>
              );
            })()}



            {/* Recent Announcements */}
            <h2 className="text-base font-semibold text-foreground mt-8 mb-3 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-purple" /> Recent Announcements
            </h2>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent announcements.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <Card key={a.id} className="border-l-4 border-l-purple">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-[10px]">{a.course_title}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(a.posted_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="font-semibold text-sm text-foreground line-clamp-1">{a.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.body}</div>
                        </div>
                        <Link to={`/portal/courses/${a.course_id}`} className="text-xs text-purple hover:underline whitespace-nowrap">
                          Open
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right rail */}
          <aside className="space-y-6">
            {/* To-do list (upcoming assignments next 14 days) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-purple" /> To Do
                </h3>
                <Link to="/portal/calendar" className="text-xs text-purple hover:underline flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> Calendar
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nothing due in the next 14 days.</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((a) => {
                    const due = new Date(a.due_at);
                    const days = differenceInDays(due, new Date());
                    const urgent = days <= 2;
                    const statusMeta: Record<SubmissionStatus, { label: string; cls: string; Icon: any }> = {
                      graded: { label: a.score != null ? `${a.score}/${a.max_score} graded` : "Graded", cls: "bg-purple/15 text-purple border-purple/30", Icon: CheckCircle2 },
                      submitted: { label: "Submitted", cls: "bg-cyan/15 text-cyan border-cyan/30", Icon: CheckCircle2 },
                      missing: { label: "Missing", cls: "bg-coral/15 text-coral border-coral/30", Icon: AlertCircle },
                      not_started: { label: "Not started", cls: "bg-muted text-muted-foreground border-border", Icon: Clock },
                    };
                    const sm = statusMeta[a.status];
                    return (
                      <Link key={a.id} to={`/portal/courses/${a.course_id}/assignments/${a.id}`} className="block">
                        <Card className={`hover:shadow-soft transition-shadow ${urgent && a.status === "not_started" ? "border-coral/40 bg-coral/5" : ""}`}>
                          <CardContent className="py-3 px-3">
                            <div className="flex items-start gap-2">
                              {urgent && a.status === "not_started" && <AlertCircle className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" />}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm text-foreground line-clamp-1">{a.title}</div>
                                <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{a.course_title}</div>
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${sm.cls}`}>
                                    <sm.Icon className="h-3 w-3" /> {sm.label}
                                  </span>
                                  <span className={`text-xs ${urgent && a.status === "not_started" ? "text-coral font-semibold" : "text-muted-foreground"}`}>
                                    · Due {isPast(due) ? "now" : formatDistanceToNow(due, { addSuffix: true })}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground ml-auto">{a.points} pts</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Quick Links</h3>
              <div className="space-y-2">
                {isInstructor && (
                  <Link to="/portal/teach" className="flex items-center gap-2 text-sm text-purple hover:underline">
                    <GraduationCap className="h-4 w-4" /> Teach Dashboard
                  </Link>
                )}
                <Link to="/portal/required" className="flex items-center gap-2 text-sm text-purple hover:underline">
                  <ClipboardList className="h-4 w-4" /> Required Work
                </Link>
                <Link to="/portal/grades" className="flex items-center gap-2 text-sm text-purple hover:underline">
                  <Star className="h-4 w-4" /> View Grades
                </Link>
                <Link to="/portal/career" className="flex items-center gap-2 text-sm text-purple hover:underline">
                  <Briefcase className="h-4 w-4" /> Career Portal
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PortalLayout>
  );
};

export default StudentDashboard;
