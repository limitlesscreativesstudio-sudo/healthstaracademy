import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar as CalendarIcon, ClipboardList, FolderOpen, MessageSquare, Star } from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";

type Course = {
  id: string;
  title: string;
  code: string | null;
  term: string | null;
  cover_image_url: string | null;
  instructor_id: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
      const enrolledIds = (enrollments ?? []).map(e => e.course_id);
      const { data } = await supabase
        .from("courses")
        .select("id, title, code, term, cover_image_url, instructor_id")
        .or(`instructor_id.eq.${user.id}${enrolledIds.length ? `,id.in.(${enrolledIds.join(",")})` : ""}`);
      setCourses(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <PortalLayout>
      <div className="px-6 py-5 max-w-[1400px] mx-auto w-full">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-5">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main column */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">
              Published Courses ({courses.length})
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {courses.map((c, idx) => {
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
                            <div className="text-sm font-bold leading-tight line-clamp-4 drop-shadow">
                              {c.title}
                            </div>
                          )}
                        </div>
                        <CardContent className="pt-3 pb-3">
                          <h3 className="font-semibold text-sm text-purple line-clamp-1">{c.title}</h3>
                          {c.code && <div className="text-xs text-muted-foreground mt-0.5">{c.code}</div>}
                          <div className="flex items-center gap-3 mt-3 text-muted-foreground">
                            <ClipboardList className="h-4 w-4" />
                            <MessageSquare className="h-4 w-4" />
                            <FolderOpen className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

            )}

            <h2 className="text-base font-semibold text-foreground mt-8 mb-3">
              Unpublished Courses (0)
            </h2>
            <p className="text-sm text-muted-foreground">No courses to display</p>
          </div>

          {/* Right rail */}
          <aside className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">Coming Up</h3>
                <Link to="/portal/calendar" className="text-xs text-purple hover:underline flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> View Calendar
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">Nothing for the next week</p>
            </div>

            <div className="space-y-2">
              {isInstructor && (
                <Link to="/portal/teach" className="block">
                  <div className="text-sm text-purple hover:underline">Start a New Course</div>
                </Link>
              )}
              <Link to="/portal/grades" className="flex items-center gap-2 text-sm text-purple hover:underline">
                <Star className="h-4 w-4" /> View Grades
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PortalLayout>
  );
};

export default StudentDashboard;
