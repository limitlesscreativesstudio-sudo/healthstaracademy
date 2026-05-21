import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";

type Course = {
  id: string;
  title: string;
  code: string | null;
  term: string | null;
  cover_image_url: string | null;
  instructor_id: string;
};

const StudentDashboard = () => {
  const { user, isInstructor } = usePortalAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Courses user is enrolled in OR teaches
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Your active courses</p>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading courses…</div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c => (
              <Link key={c.id} to={`/portal/courses/${c.id}`}>
                <Card className="overflow-hidden hover:shadow-medium transition-shadow h-full">
                  <div
                    className="h-32 bg-gradient-to-br from-purple to-magenta"
                    style={c.cover_image_url ? { backgroundImage: `url(${c.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                  />
                  <CardContent className="pt-4">
                    {c.code && <div className="text-xs text-muted-foreground font-mono">{c.code}</div>}
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    {c.term && <div className="text-xs text-muted-foreground mt-1">{c.term}</div>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default StudentDashboard;
