import { useEffect, useState } from "react";
import { Link, useParams, NavLink, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, BookOpen, FileText, Home, ChevronRight, FileIcon, Link as LinkIcon, Video, ClipboardList, GraduationCap, BarChart3 } from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Button } from "@/components/ui/button";
import StudentGrades from "./StudentGrades";

type Course = { id: string; title: string; code: string | null; description: string | null; instructor_id: string };
type Module = { id: string; title: string; position: number; published: boolean };
type ModuleItem = { id: string; module_id: string; title: string; item_type: string; content_ref: string | null; url: string | null; position: number; published: boolean };
type Announcement = { id: string; title: string; body: string; posted_at: string };

const itemIcon = (t: string) => {
  const map: Record<string, any> = { page: FileText, file: FileIcon, link: LinkIcon, video: Video, assignment: ClipboardList, quiz: GraduationCap };
  const I = map[t] ?? FileText;
  return <I className="h-4 w-4" />;
};

const CourseView = () => {
  const { courseId } = useParams();
  const { user } = usePortalAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    supabase.from("courses").select("id, title, code, description, instructor_id").eq("id", courseId).maybeSingle()
      .then(({ data }) => { setCourse(data); setLoading(false); });
  }, [courseId]);

  if (loading) return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;
  if (!course) return <PortalLayout><div className="p-6">Course not found.</div></PortalLayout>;

  const isInstructor = user?.id === course.instructor_id;

  return (
    <PortalLayout>
      <div className="flex min-h-[calc(100vh)]">
        {/* Course sidebar */}
        <aside className="w-48 bg-background border-r border-border p-4">
          <Link to="/portal" className="text-xs text-muted-foreground hover:underline">← All Courses</Link>
          <h2 className="font-heading font-bold text-base mt-2 mb-4 line-clamp-2">{course.title}</h2>
          <nav className="space-y-1 text-sm">
            <CourseNav to={`/portal/courses/${courseId}`} end icon={Home}>Home</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/modules`} icon={BookOpen}>Modules</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/assignments`} icon={ClipboardList}>Assignments</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/quizzes`} icon={GraduationCap}>Quizzes</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/grades`} icon={BarChart3}>Grades</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/announcements`} icon={Megaphone}>Announcements</CourseNav>
          </nav>
          {isInstructor && (
            <div className="mt-6 pt-4 border-t border-border">
              <Link to={`/portal/teach/courses/${courseId}`}>
                <Button size="sm" variant="purple-outline" className="w-full">Edit Course</Button>
              </Link>
            </div>
          )}
        </aside>
        <div className="flex-1 p-6 max-w-4xl">
          <Routes>
            <Route index element={<CourseHome course={course} />} />
            <Route path="modules" element={<ModulesTab courseId={course.id} />} />
            <Route path="modules/:itemId" element={<ItemViewer courseId={course.id} />} />
            <Route path="assignments" element={<AssignmentsList courseId={course.id} />} />
            <Route path="quizzes" element={<QuizzesList courseId={course.id} />} />
            <Route path="grades" element={<StudentGrades courseId={course.id} />} />
            <Route path="announcements" element={<AnnouncementsTab courseId={course.id} />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </div>
      </div>
    </PortalLayout>
  );
};

const CourseNav = ({ to, end, icon: Icon, children }: any) => (
  <NavLink to={to} end={end} className={({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded ${isActive ? "bg-purple/10 text-purple font-medium" : "hover:bg-muted text-foreground"}`}>
    <Icon className="h-4 w-4" /> {children}
  </NavLink>
);

const CourseHome = ({ course }: { course: Course }) => (
  <div>
    <h1 className="font-heading text-3xl font-bold mb-2">{course.title}</h1>
    {course.code && <div className="text-sm text-muted-foreground font-mono mb-4">{course.code}</div>}
    {course.description && <p className="text-foreground/80 whitespace-pre-wrap">{course.description}</p>}
  </div>
);

const ModulesTab = ({ courseId }: { courseId: string }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [items, setItems] = useState<ModuleItem[]>([]);

  useEffect(() => {
    (async () => {
      const { data: mods } = await supabase.from("modules").select("*").eq("course_id", courseId).order("position");
      setModules(mods ?? []);
      const ids = (mods ?? []).map(m => m.id);
      if (ids.length) {
        const { data: its } = await supabase.from("module_items").select("*").in("module_id", ids).order("position");
        setItems(its ?? []);
      }
    })();
  }, [courseId]);

  if (modules.length === 0) return <Card><CardContent className="py-8 text-center text-muted-foreground">No modules published yet.</CardContent></Card>;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Modules</h2>
      {modules.map(m => (
        <Card key={m.id}>
          <div className="px-5 py-3 border-b border-border bg-muted/30 font-semibold">{m.title}</div>
          <CardContent className="p-0">
            {items.filter(i => i.module_id === m.id).length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No items in this module.</div>
            ) : items.filter(i => i.module_id === m.id).map(i => (
              <Link key={i.id} to={`/portal/courses/${courseId}/modules/${i.id}`}
                className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/40">
                {itemIcon(i.item_type)}
                <span className="flex-1 text-sm">{i.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AssignmentsList = ({ courseId }: { courseId: string }) => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("assignments").select("id, title, points, due_at, published").eq("course_id", courseId).eq("published", true).order("due_at", { ascending: true, nullsFirst: false })
      .then(({ data }) => setItems(data ?? []));
  }, [courseId]);
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-2xl font-bold">Assignments</h2>
      {items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No assignments yet.</CardContent></Card>
      ) : items.map(a => (
        <Link key={a.id} to={`/portal/courses/${courseId}/assignments/${a.id}`}>
          <Card className="hover:bg-muted/30 transition">
            <CardContent className="pt-5 flex justify-between items-center">
              <div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.points} pts{a.due_at && ` · Due ${new Date(a.due_at).toLocaleDateString()}`}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const QuizzesList = ({ courseId }: { courseId: string }) => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("quizzes").select("id, title, total_points, due_at, published").eq("course_id", courseId).eq("published", true).order("due_at", { ascending: true, nullsFirst: false })
      .then(({ data }) => setItems(data ?? []));
  }, [courseId]);
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-2xl font-bold">Quizzes</h2>
      {items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No quizzes yet.</CardContent></Card>
      ) : items.map(q => (
        <Link key={q.id} to={`/portal/courses/${courseId}/quizzes/${q.id}`}>
          <Card className="hover:bg-muted/30 transition">
            <CardContent className="pt-5 flex justify-between items-center">
              <div>
                <div className="font-semibold">{q.title}</div>
                <div className="text-xs text-muted-foreground">{q.total_points} pts{q.due_at && ` · Due ${new Date(q.due_at).toLocaleDateString()}`}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const ItemViewer = ({ courseId }: { courseId: string }) => {
  const { itemId } = useParams();
  const [item, setItem] = useState<ModuleItem | null>(null);
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) return;
    (async () => {
      const { data: it } = await supabase.from("module_items").select("*").eq("id", itemId).maybeSingle();
      setItem(it);
      if (it?.item_type === "page" && it.content_ref) {
        const { data: p } = await supabase.from("lms_pages").select("body_html").eq("id", it.content_ref).maybeSingle();
        setBody(p?.body_html ?? "");
      } else if (it?.item_type === "file" && it.content_ref) {
        const { data: f } = await supabase.from("lms_files").select("*").eq("id", it.content_ref).maybeSingle();
        if (f) {
          let url = f.external_url;
          if (f.storage_provider === "cloud" && f.storage_path) {
            const { data } = supabase.storage.from("course-assets").getPublicUrl(f.storage_path);
            url = data.publicUrl;
          } else if (f.storage_provider === "drive" && f.drive_file_id) {
            url = `https://drive.google.com/file/d/${f.drive_file_id}/preview`;
          }
          setBody(url ? `<iframe src="${url}" class="w-full h-[80vh] border rounded" allow="autoplay"></iframe>` : "<p>File unavailable</p>");
        }
      }
    })();
  }, [itemId]);

  if (!item) return <div>Loading…</div>;

  return (
    <div>
      <Link to={`/portal/courses/${courseId}/modules`} className="text-sm text-muted-foreground hover:underline">← Back to Modules</Link>
      <h1 className="font-heading text-2xl font-bold mt-2 mb-4">{item.title}</h1>
      {(item.item_type === "link" || item.item_type === "video") && item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-purple underline">{item.url}</a>
      )}
      {body !== null && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: body }} />}
    </div>
  );
};

const AnnouncementsTab = ({ courseId }: { courseId: string }) => {
  const [items, setItems] = useState<Announcement[]>([]);
  useEffect(() => {
    supabase.from("lms_announcements").select("*").eq("course_id", courseId).order("posted_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, [courseId]);
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Announcements</h2>
      {items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No announcements yet.</CardContent></Card>
      ) : items.map(a => (
        <Card key={a.id}><CardContent className="pt-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{a.title}</h3>
            <span className="text-xs text-muted-foreground">{new Date(a.posted_at).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{a.body}</p>
        </CardContent></Card>
      ))}
    </div>
  );
};

export default CourseView;
