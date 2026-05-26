import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Link, useParams, NavLink, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, BookOpen, FileText, ChevronRight, FileIcon, Link as LinkIcon, Video, ClipboardList, GraduationCap, BarChart3, MessageSquare, Users as UsersIcon, FolderOpen, ScrollText, Target, Grid3x3, Settings as SettingsIcon, ClipboardCheck, LineChart, PenSquare, Handshake } from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { COURSE_NAV_ITEMS, orderedNavKeys, isNavVisibleToStudent, type NavKey } from "@/lib/courseNav";

import StudentGrades from "./StudentGrades";
import SyllabusTab from "./SyllabusTab";
import ClinicalSkillsTab from "./ClinicalSkillsTab";
import ReadinessTab from "./ReadinessTab";
import AttendanceTab from "./AttendanceTab";
import ModulesTabAuthor from "@/components/portal/ModulesTabAuthor";
import PagesTab from "./PagesTab";
import ChooseHomePageDialog from "@/components/portal/ChooseHomePageDialog";

type Course = {
  id: string; title: string; code: string | null; description: string | null; instructor_id: string;
  nav_order: NavKey[] | null; nav_visibility: Record<string, boolean> | null; default_view: string | null;
  home_page_type: string | null; front_page_html: string | null;
};
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
  const [previewAsStudent, setPreviewAsStudent] = useState(false);

  const loadCourse = () => {
    if (!courseId) return;
    supabase.from("courses").select("id, title, code, description, instructor_id, nav_order, nav_visibility, default_view, home_page_type, front_page_html").eq("id", courseId).maybeSingle()
      .then(({ data }) => {
        setCourse(data as Course | null);
        setLoading(false);
        if (data) {
          try { localStorage.setItem("hsa:lastCourse", JSON.stringify({ courseId, title: data.title })); } catch { /* ignore */ }
        }
      });
  };

  useEffect(() => { loadCourse(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [courseId]);

  if (loading) return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;
  if (!course) return <PortalLayout><div className="p-6">Course not found.</div></PortalLayout>;

  const isInstructor = user?.id === course.instructor_id;
  const viewAsStudent = isInstructor && previewAsStudent;
  const effectiveInstructor = isInstructor && !viewAsStudent;

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
          {isInstructor && (
            <div className="px-4 mb-3">
              <button
                onClick={() => setPreviewAsStudent(v => !v)}
                className={`w-full text-[11px] font-semibold uppercase tracking-wide px-2 py-1.5 rounded border transition ${
                  previewAsStudent
                    ? "bg-purple text-white border-purple"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
                title="Toggle student preview of this sidebar"
              >
                {previewAsStudent ? "👁 Previewing as Student — click to exit" : "Preview sidebar as Student"}
              </button>
            </div>
          )}
          <nav className="text-sm">
            {orderedNavKeys(course.nav_order).map(key => {
              const item = COURSE_NAV_ITEMS.find(i => i.key === key)!;
              const visibleToStudent = isNavVisibleToStudent(key, course.nav_visibility);
              if (!effectiveInstructor && !visibleToStudent) return null;
              const to = item.path ? `/portal/courses/${courseId}/${item.path}` : `/portal/courses/${courseId}`;
              return (
                <CourseNav key={key} to={to} end={!item.path} icon={item.icon}>
                  <span className="flex-1">{item.label}</span>
                  {effectiveInstructor && !visibleToStudent && (
                    <span className="text-[9px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1 py-0.5 ml-1">Hidden</span>
                  )}
                </CourseNav>
              );
            })}
            {effectiveInstructor && (
              <CourseNav to={`/portal/teach/courses/${courseId}`} icon={SettingsIcon}>Settings</CourseNav>
            )}
          </nav>
        </aside>
        <div className="flex-1 p-6 max-w-5xl min-w-0">
          <Routes>
            <Route index element={<CourseHome course={course} isInstructor={effectiveInstructor} reloadCourse={loadCourse} />} />
            <Route path="modules" element={<ModulesTabAuthor courseId={course.id} isInstructor={effectiveInstructor} />} />
            <Route path="modules/:itemId" element={<ItemViewer courseId={course.id} />} />
            <Route path="assignments" element={<AssignmentsList courseId={course.id} />} />
            <Route path="quizzes" element={<QuizzesList courseId={course.id} />} />
            <Route path="grades" element={<StudentGrades courseId={course.id} />} />
            <Route path="announcements" element={<AnnouncementsTab courseId={course.id} />} />
            <Route path="discussions" element={<ComingSoon title="Discussions" />} />
            <Route path="people" element={<ComingSoon title="People" />} />
            <Route path="pages" element={<PagesTab courseId={course.id} isInstructor={effectiveInstructor} />} />
            <Route path="files" element={<ComingSoon title="Files" />} />
            <Route path="syllabus" element={<SyllabusTab courseId={course.id} isInstructor={effectiveInstructor} />} />
            <Route path="outcomes" element={<ComingSoon title="Outcomes" />} />
            <Route path="rubrics" element={<ComingSoon title="Rubrics" />} />
            <Route path="bigbluebutton" element={<ComingSoon title="BigBlueButton" />} />
            <Route path="collaborations" element={<ComingSoon title="Collaborations" />} />
            <Route path="attendance" element={<AttendanceTab courseId={course.id} isInstructor={effectiveInstructor} />} />
            <Route path="clinical" element={<ClinicalSkillsTab courseId={course.id} isInstructor={effectiveInstructor} />} />
            <Route path="readiness" element={<ReadinessTab courseId={course.id} isInstructor={effectiveInstructor} />} />
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

const CourseHome = ({ course, isInstructor, reloadCourse }: { course: Course; isInstructor: boolean; reloadCourse?: () => void }) => {
  const [homeType, setHomeType] = useState<string>(course.home_page_type ?? "modules");
  const [hasFrontPage, setHasFrontPage] = useState<boolean>(!!course.front_page_html);
  useEffect(() => { setHomeType(course.home_page_type ?? "modules"); }, [course.home_page_type]);
  useEffect(() => { setHasFrontPage(!!course.front_page_html); }, [course.front_page_html]);
  useEffect(() => {
    if (!isInstructor) return;
    supabase.from("courses").select("front_page_html").eq("id", course.id).maybeSingle()
      .then(({ data }) => setHasFrontPage(!!data?.front_page_html));
  }, [course.id, isInstructor]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div className="min-w-0 space-y-6">
        <RecentAnnouncements courseId={course.id} />
        <div className="border-b border-border pb-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold">{course.title}</h1>
            {course.code && <div className="text-xs text-muted-foreground font-mono mt-1">{course.code}</div>}
          </div>
          {isInstructor && (
            <ChooseHomePageDialog
              courseId={course.id}
              current={homeType}
              hasFrontPage={hasFrontPage}
              onChanged={(v) => { setHomeType(v); reloadCourse?.(); }}
            />
          )}
        </div>
        {homeType === "front_page" ? (
          <FrontPageView courseId={course.id} isInstructor={isInstructor} />
        ) : homeType === "syllabus" ? (
          <SyllabusTab courseId={course.id} isInstructor={isInstructor} />
        ) : homeType === "assignments" ? (
          <AssignmentsList courseId={course.id} />
        ) : homeType === "activity" ? (
          <ActivityStream courseId={course.id} />
        ) : (
          <ModulesHomeList courseId={course.id} isInstructor={isInstructor} />
        )}
      </div>
      <HomeSidebar course={course} isInstructor={isInstructor} />
    </div>
  );
};

const ActivityStream = ({ courseId }: { courseId: string }) => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("lms_announcements")
      .select("*").eq("course_id", courseId)
      .order("posted_at", { ascending: false }).limit(20)
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, [courseId]);

  if (loading) {
    return <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Loading recent activity…</CardContent></Card>;
  }
  if (items.length === 0) {
    return <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
      No recent activity yet. Post an announcement to populate the stream.
    </CardContent></Card>;
  }
  return (
    <div className="border border-border rounded-md bg-background divide-y divide-border">
      <div className="px-4 py-2 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
        <Megaphone className="h-3.5 w-3.5" /> Recent Activity
      </div>
      {items.map(a => (
        <Link key={a.id} to={`/portal/courses/${courseId}/announcements`} className="block px-4 py-3 hover:bg-muted/30">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-purple shrink-0" />
              <span className="font-semibold text-sm">{a.title}</span>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(a.posted_at).toLocaleString()}</span>
          </div>
          <p className="text-xs text-foreground/70 line-clamp-2 whitespace-pre-wrap ml-6">{a.body}</p>
        </Link>
      ))}
    </div>
  );
};

const FrontPageView = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    supabase.from("courses").select("front_page_html").eq("id", courseId).maybeSingle()
      .then(({ data }) => setHtml(data?.front_page_html ?? ""));
  }, [courseId]);
  if (html === null) {
    return <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">Loading…</CardContent></Card>;
  }
  if (!html) {
    return (
      <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
        {isInstructor ? "No front page content yet. Go to Pages → ⋯ → Use as Front Page on the page you want shown here." : "Welcome! Your instructor hasn't added a front page yet."}
      </CardContent></Card>
    );
  }
  const sanitized = DOMPurify.sanitize(html);
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

const ModulesHomeList = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      let modQuery = supabase.from("modules").select("*").eq("course_id", courseId).order("position");
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
  }, [courseId, isInstructor]);

  if (modules.length === 0) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No content published yet.</CardContent></Card>;
  }
  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      {modules.map(m => {
        const isOpen = open[m.id] ?? true;
        const modItems = items.filter(i => i.module_id === m.id);
        return (
          <div key={m.id} className="border-b border-border last:border-0">
            <button onClick={() => setOpen(o => ({ ...o, [m.id]: !isOpen }))}
              className="w-full flex items-center gap-2 px-4 py-3 bg-muted/40 hover:bg-muted/60 text-left">
              <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              <span className="font-semibold text-sm">{m.title}</span>
            </button>
            {isOpen && (
              <div>
                {modItems.length === 0 ? (
                  <div className="px-12 py-3 text-xs text-muted-foreground">No items.</div>
                ) : modItems.map(i => (
                  <Link key={i.id} to={`/portal/courses/${courseId}/modules/${i.id}`}
                    className={`flex items-center gap-3 pl-12 pr-4 py-2.5 border-t border-border/50 hover:bg-muted/30 text-sm ${!i.published ? "opacity-60" : ""}`}>
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
  );
};

const RecentAnnouncements = ({ courseId }: { courseId: string }) => {
  const [items, setItems] = useState<Announcement[]>([]);
  useEffect(() => {
    supabase.from("lms_announcements").select("*").eq("course_id", courseId).order("posted_at", { ascending: false }).limit(3)
      .then(({ data }) => setItems(data ?? []));
  }, [courseId]);
  if (items.length === 0) return null;
  return (
    <div className="border border-border rounded-md bg-muted/20">
      <div className="px-4 py-2 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
        <Megaphone className="h-3.5 w-3.5" /> Recent Announcements
      </div>
      <div className="divide-y divide-border">
        {items.map(a => (
          <div key={a.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3 mb-1">
              <Link to={`/portal/courses/${courseId}/announcements`} className="font-semibold text-sm hover:underline">{a.title}</Link>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(a.posted_at).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-foreground/70 line-clamp-2 whitespace-pre-wrap">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomeSidebar = ({ course, isInstructor }: { course: Course; isInstructor: boolean }) => {
  const [upcoming, setUpcoming] = useState<{ id: string; title: string; due_at: string; kind: "assignment" | "quiz" }[]>([]);
  useEffect(() => {
    (async () => {
      const now = new Date().toISOString();
      const in7 = new Date(Date.now() + 7 * 86400000).toISOString();
      const [a, q] = await Promise.all([
        supabase.from("assignments").select("id, title, due_at").eq("course_id", course.id).eq("published", true).not("due_at", "is", null).gte("due_at", now).lte("due_at", in7),
        supabase.from("quizzes").select("id, title, due_at").eq("course_id", course.id).eq("published", true).not("due_at", "is", null).gte("due_at", now).lte("due_at", in7),
      ]);
      const merged = [
        ...(a.data ?? []).map((x: any) => ({ ...x, kind: "assignment" as const })),
        ...(q.data ?? []).map((x: any) => ({ ...x, kind: "quiz" as const })),
      ].sort((x, y) => x.due_at.localeCompare(y.due_at));
      setUpcoming(merged);
    })();
  }, [course.id]);

  const SidebarBtn = ({ to, icon: Icon, children }: any) => (
    <Link to={to} className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted/50">
      <Icon className="h-4 w-4 text-muted-foreground" /> {children}
    </Link>
  );

  return (
    <aside className="space-y-4">
      {isInstructor && (
        <div className="space-y-2">
          <SidebarBtn to={`/portal/teach/courses/${course.id}`} icon={SettingsIcon}>Choose Home Page</SidebarBtn>
          <SidebarBtn to={`/portal/courses/${course.id}/announcements`} icon={Megaphone}>New Announcement</SidebarBtn>
          <SidebarBtn to={`/portal/teach/courses/${course.id}`} icon={LineChart}>Course Analytics</SidebarBtn>
        </div>
      )}
      <div className="border border-border rounded-md">
        <div className="px-3 py-2 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coming Up</div>
        <div className="p-3">
          {upcoming.length === 0 ? (
            <div className="text-xs text-muted-foreground">Nothing for the next week</div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map(u => (
                <li key={`${u.kind}-${u.id}`} className="text-xs">
                  <Link to={`/portal/courses/${course.id}/${u.kind === "quiz" ? "quizzes" : "assignments"}/${u.id}`}
                    className="font-medium hover:underline flex items-start gap-2">
                    {u.kind === "quiz" ? <GraduationCap className="h-3.5 w-3.5 mt-0.5 text-purple shrink-0" /> : <ClipboardList className="h-3.5 w-3.5 mt-0.5 text-purple shrink-0" />}
                    <span className="flex-1">{u.title}</span>
                  </Link>
                  <div className="text-muted-foreground ml-5 mt-0.5">Due {new Date(u.due_at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};

// ModulesTab replaced by ModulesTabAuthor (src/components/portal/ModulesTabAuthor.tsx)

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
            const { data } = await supabase.storage.from("course-assets").createSignedUrl(f.storage_path, 3600);
            url = data?.signedUrl ?? null;
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
