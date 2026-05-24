import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Link, useParams, NavLink, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, BookOpen, FileText, ChevronRight, FileIcon, Link as LinkIcon, Video, ClipboardList, GraduationCap, BarChart3, MessageSquare, Users as UsersIcon, FolderOpen, ScrollText, Target, Grid3x3, Settings as SettingsIcon, ClipboardCheck, LineChart, PenSquare, Handshake } from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";

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
        {/* Course sidebar - Canvas style */}
        <aside className="w-56 bg-background border-r border-border py-4 shrink-0">
          <div className="px-4 mb-3">
            <Link to="/portal" className="text-xs text-muted-foreground hover:underline">← All Courses</Link>
            <h2 className="font-heading font-bold text-base mt-2 line-clamp-2">{course.title}</h2>
            {course.code && <div className="text-xs text-muted-foreground font-mono mt-1">{course.code}</div>}
          </div>
          <nav className="text-sm">
            <CourseNav to={`/portal/courses/${courseId}`} end icon={BookOpen}>Home</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/announcements`} icon={Megaphone}>Announcements</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/discussions`} icon={MessageSquare}>Discussions</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/grades`} icon={BarChart3}>Grades</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/people`} icon={UsersIcon}>People</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/pages`} icon={FileText}>Pages</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/files`} icon={FolderOpen}>Files</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/syllabus`} icon={ScrollText}>Syllabus</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/outcomes`} icon={Target}>Outcomes</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/rubrics`} icon={Grid3x3}>Rubrics</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/quizzes`} icon={GraduationCap}>Quizzes</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/modules`} icon={BookOpen}>Modules</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/bigbluebutton`} icon={Video}>BigBlueButton</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/collaborations`} icon={Handshake}>Collaborations</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/attendance`} icon={ClipboardCheck}>Attendance</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/analytics`} icon={LineChart}>New Analytics</CourseNav>
            <CourseNav to={`/portal/courses/${courseId}/lucid`} icon={PenSquare}>Lucid (Whiteboard)</CourseNav>
            {isInstructor && <CourseNav to={`/portal/teach/courses/${courseId}`} icon={SettingsIcon}>Settings</CourseNav>}
          </nav>
        </aside>
        <div className="flex-1 p-6 max-w-5xl min-w-0">
          <Routes>
            <Route index element={<CourseHome course={course} isInstructor={isInstructor} />} />
            <Route path="modules" element={<ModulesTab courseId={course.id} isInstructor={isInstructor} />} />
            <Route path="modules/:itemId" element={<ItemViewer courseId={course.id} />} />
            <Route path="assignments" element={<AssignmentsList courseId={course.id} />} />
            <Route path="quizzes" element={<QuizzesList courseId={course.id} />} />
            <Route path="grades" element={<StudentGrades courseId={course.id} />} />
            <Route path="announcements" element={<AnnouncementsTab courseId={course.id} />} />
            <Route path="discussions" element={<ComingSoon title="Discussions" />} />
            <Route path="people" element={<ComingSoon title="People" />} />
            <Route path="pages" element={<ComingSoon title="Pages" />} />
            <Route path="files" element={<ComingSoon title="Files" />} />
            <Route path="syllabus" element={<ComingSoon title="Syllabus" />} />
            <Route path="outcomes" element={<ComingSoon title="Outcomes" />} />
            <Route path="rubrics" element={<ComingSoon title="Rubrics" />} />
            <Route path="bigbluebutton" element={<ComingSoon title="BigBlueButton" />} />
            <Route path="collaborations" element={<ComingSoon title="Collaborations" />} />
            <Route path="attendance" element={<ComingSoon title="Attendance" />} />
            <Route path="analytics" element={<ComingSoon title="New Analytics" />} />
            <Route path="lucid" element={<ComingSoon title="Lucid (Whiteboard)" />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </div>
      </div>
    </PortalLayout>
  );
};

const ComingSoon = ({ title }: { title: string }) => (
  <div>
    <h2 className="font-heading text-2xl font-bold mb-2">{title}</h2>
    <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">Nothing here yet.</CardContent></Card>
  </div>
);

const CourseNav = ({ to, end, icon: Icon, children }: any) => (
  <NavLink to={to} end={end} className={({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 border-l-2 ${isActive ? "border-purple bg-purple/5 text-purple font-medium" : "border-transparent hover:bg-muted text-foreground"}`}>
    <Icon className="h-4 w-4" /> {children}
  </NavLink>
);

const CourseHome = ({ course, isInstructor }: { course: Course; isInstructor: boolean }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      let modQuery = supabase.from("modules").select("*").eq("course_id", course.id).order("position");
      if (!isInstructor) modQuery = modQuery.eq("published", true);
      const { data: mods } = await modQuery;
      const list = mods ?? [];
      setModules(list);
      setOpen(Object.fromEntries(list.map(m => [m.id, true])));
      const ids = list.map(m => m.id);
      if (ids.length) {
        let itQuery = supabase.from("module_items").select("*").in("module_id", ids).order("position");
        if (!isInstructor) itQuery = itQuery.eq("published", true);
        const { data: its } = await itQuery;
        setItems(its ?? []);
      }
    })();
  }, [course.id, isInstructor]);


  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-border pb-3">
        <h1 className="font-heading text-2xl font-bold">{course.title}</h1>
        {course.code && <div className="text-xs text-muted-foreground font-mono mt-1">{course.code}</div>}
      </div>

      {modules.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No content published yet.</CardContent></Card>
      ) : (
        <div className="border border-border rounded-md overflow-hidden bg-background">
          {modules.map(m => {
            const isOpen = open[m.id] ?? true;
            const modItems = items.filter(i => i.module_id === m.id);
            return (
              <div key={m.id} className="border-b border-border last:border-0">
                <button
                  onClick={() => setOpen(o => ({ ...o, [m.id]: !isOpen }))}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-muted/40 hover:bg-muted/60 text-left"
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="font-semibold text-sm">{m.title}</span>
                </button>
                {isOpen && (
                  <div>
                    {modItems.length === 0 ? (
                      <div className="px-12 py-3 text-xs text-muted-foreground">No items.</div>
                    ) : modItems.map(i => (
                      <Link
                        key={i.id}
                        to={`/portal/courses/${course.id}/modules/${i.id}`}
                        className={`flex items-center gap-3 pl-12 pr-4 py-2.5 border-t border-border/50 hover:bg-muted/30 text-sm ${!i.published ? "opacity-60" : ""}`}
                      >
                        <span className="text-emerald-600">{itemIcon(i.item_type)}</span>
                        <span className="flex-1 font-medium">{i.title}</span>
                        {isInstructor && !i.published && (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5">Hidden</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
  const [fileUrl, setFileUrl] = useState<string | null>(null);

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
          setFileUrl(url ?? null);
          setBody("");
        }
      }
    })();
  }, [itemId]);

  if (!item) return <div>Loading…</div>;

  // Only allow http(s) URLs in the iframe — block javascript:, data:, etc.
  const safeFileUrl = fileUrl && /^https?:\/\//i.test(fileUrl) ? fileUrl : null;
  const sanitizedBody = body ? DOMPurify.sanitize(body) : "";

  return (
    <div>
      <Link to={`/portal/courses/${courseId}/modules`} className="text-sm text-muted-foreground hover:underline">← Back to Modules</Link>
      <h1 className="font-heading text-2xl font-bold mt-2 mb-4">{item.title}</h1>
      {(item.item_type === "link" || item.item_type === "video") && item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-purple underline">{item.url}</a>
      )}
      {safeFileUrl && (
        <iframe src={safeFileUrl} className="w-full h-[80vh] border rounded" allow="autoplay" />
      )}
      {!safeFileUrl && body && (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
      )}
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
