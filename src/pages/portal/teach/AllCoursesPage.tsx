import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Star, Plus, ArrowUpDown, Info, BookOpen, Users, Calendar as CalIcon, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type CourseRow = {
  id: string;
  title: string;
  code: string | null;
  term: string | null;
  status: string;
  color: string | null;
  instructor_id: string;
};

type SortKey = "favorite" | "title" | "nickname" | "term" | "enrolled_as" | "published";
type SortDir = "asc" | "desc";

const FAV_KEY = "hsa_fav_courses";
const NICK_KEY = "hsa_course_nicknames";

const readMap = (k: string): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(k) || "{}"); } catch { return {}; }
};
const readSet = (k: string): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); }
};

const dotColor = (c: string | null, id: string) => {
  if (c) return c;
  // deterministic pastel per course
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 55% 50%)`;
};

export default function AllCoursesPage() {
  const { user, isInstructor, isAdmin } = usePortalAuth(true);
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Set<string>>(() => readSet(FAV_KEY));
  const [nicks, setNicks] = useState<Record<string, string>>(() => readMap(NICK_KEY));
  const [editingNick, setEditingNick] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "favorite", dir: "desc" });
  const [detail, setDetail] = useState<CourseRow | null>(null);
  const [detailData, setDetailData] = useState<{ syllabus:string; enrollmentCount:number; assignments:number; discussions:number; startAt?:string|null; endAt?:string|null } | null>(null);

  const openDetail = async (c: CourseRow) => {
    setDetail(c);
    setDetailData(null);
    const [{ data: full }, { count: enrCount }, { count: asgnCount }, { count: discCount }] = await Promise.all([
      supabase.from("courses").select("syllabus_html,start_at,end_at").eq("id", c.id).maybeSingle(),
      supabase.from("enrollments").select("*", { count:"exact", head:true }).eq("course_id", c.id),
      supabase.from("assignments").select("*", { count:"exact", head:true }).eq("course_id", c.id),
      supabase.from("discussions").select("*", { count:"exact", head:true }).eq("course_id", c.id),
    ]);
    setDetailData({
      syllabus: (full as any)?.syllabus_html ?? "",
      enrollmentCount: enrCount ?? 0,
      assignments: asgnCount ?? 0,
      discussions: discCount ?? 0,
      startAt: (full as any)?.start_at,
      endAt: (full as any)?.end_at,
    });
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      // Instructor: their courses. Student: enrolled courses. Admin: all.
      let coursesQuery = supabase.from("courses").select("id,title,code,term,status,color,instructor_id");
      if (!isAdmin) {
        if (isInstructor) {
          coursesQuery = coursesQuery.eq("instructor_id", user.id);
        }
      }
      const [{ data: courseList }, { data: myEnroll }] = await Promise.all([
        coursesQuery.order("title"),
        supabase.from("enrollments").select("course_id").eq("user_id", user.id),
      ]);

      let list = (courseList ?? []) as CourseRow[];
      const enrolled = new Set((myEnroll ?? []).map((e: any) => e.course_id));

      // If plain student, also include enrolled courses that weren't returned above
      if (!isInstructor && !isAdmin && enrolled.size) {
        const missing = Array.from(enrolled).filter(id => !list.find(c => c.id === id));
        if (missing.length) {
          const { data: extra } = await supabase
            .from("courses")
            .select("id,title,code,term,status,color,instructor_id")
            .in("id", missing);
          if (extra?.length) list = [...list, ...(extra as CourseRow[])];
        }
      }

      setRows(list);
      setEnrolledIds(enrolled);
      setLoading(false);
    })();
  }, [user, isInstructor, isAdmin]);

  const persistFavs = (next: Set<string>) => {
    setFavs(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(next)));
  };
  const toggleFav = (id: string) => {
    const next = new Set(favs);
    next.has(id) ? next.delete(id) : next.add(id);
    persistFavs(next);
  };

  const saveNick = (id: string, value: string) => {
    const next = { ...nicks };
    if (value.trim()) next[id] = value.trim(); else delete next[id];
    setNicks(next);
    localStorage.setItem(NICK_KEY, JSON.stringify(next));
    setEditingNick(null);
  };

  const enrolledAs = (c: CourseRow): string => {
    if (isAdmin) return "Admin";
    if (c.instructor_id === user?.id) return "Teacher";
    if (enrolledIds.has(c.id)) return "Student";
    return "—";
  };

  const sorted = useMemo(() => {
    const copy = [...rows];
    const dir = sort.dir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      let av: any, bv: any;
      switch (sort.key) {
        case "favorite": av = favs.has(a.id) ? 1 : 0; bv = favs.has(b.id) ? 1 : 0; break;
        case "title": av = a.title.toLowerCase(); bv = b.title.toLowerCase(); break;
        case "nickname": av = (nicks[a.id] || "").toLowerCase(); bv = (nicks[b.id] || "").toLowerCase(); break;
        case "term": av = (a.term || "").toLowerCase(); bv = (b.term || "").toLowerCase(); break;
        case "enrolled_as": av = enrolledAs(a); bv = enrolledAs(b); break;
        case "published": av = a.status === "published" ? 1 : 0; bv = b.status === "published" ? 1 : 0; break;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return copy;
  }, [rows, sort, favs, nicks, enrolledIds, user?.id, isAdmin]);

  const setSortKey = (k: SortKey) => {
    setSort(s => s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" });
  };

  const createCourse = async () => {
    if (!user) return;
    const title = prompt("Course name");
    if (!title?.trim()) return;
    const { data, error } = await supabase.from("courses").insert({
      title: title.trim(),
      instructor_id: user.id,
      status: "unpublished",
    }).select().single();
    if (error) return toast.error(error.message);
    setRows(r => [...r, data as CourseRow]);
    toast.success("Course created");
  };

  const courseHref = (id: string) => (isInstructor || isAdmin ? `/portal/teach?course=${id}` : `/portal/courses/${id}`);

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="text-left font-semibold text-charcoal py-3 px-4 border-b border-border">
      <button onClick={() => setSortKey(k)} className="inline-flex items-center gap-1 hover:text-cyan">
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </th>
  );

  return (
    <PortalLayout>
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold text-charcoal mb-6">All Courses</h1>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => toast.info("Course catalog coming soon")}>
            Browse More Courses
          </Button>
          {(isInstructor || isAdmin) && (
            <Button size="sm" onClick={createCourse} className="gap-1 bg-cyan text-charcoal hover:bg-cyan/90">
              <Plus className="h-4 w-4" /> Course
            </Button>
          )}
        </div>

        <div className="bg-background border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <Th k="favorite" label="Favorite" />
                <Th k="title" label="Course" />
                <Th k="nickname" label="Nickname" />
                <Th k="term" label="Term" />
                <Th k="enrolled_as" label="Enrolled as" />
                <Th k="published" label="Published" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Loading courses…</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No courses yet.</td></tr>
              ) : sorted.map(c => {
                const isFav = favs.has(c.id);
                const nick = nicks[c.id] || "";
                const pub = c.status === "published";
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleFav(c.id)}
                        aria-label={isFav ? "Unfavorite" : "Favorite"}
                        className="text-muted-foreground hover:text-yellow-500"
                      >
                        <Star className={`h-5 w-5 ${isFav ? "fill-yellow-400 text-yellow-500" : ""}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-block w-3 h-3 rounded-sm shrink-0"
                          style={{ background: dotColor(c.color, c.id) }}
                        />
                        <Link
                          to={courseHref(c.id)}
                          className="text-cyan hover:underline truncate font-medium"
                        >
                          {nick || c.title}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {editingNick === c.id ? (
                        <input
                          autoFocus
                          defaultValue={nick}
                          onBlur={(e) => saveNick(c.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveNick(c.id, (e.target as HTMLInputElement).value);
                            if (e.key === "Escape") setEditingNick(null);
                          }}
                          className="border border-border rounded px-2 py-1 text-sm w-full max-w-xs"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingNick(c.id)}
                          className="text-left text-muted-foreground hover:text-charcoal"
                        >
                          {nick || <span className="italic opacity-60">Add nickname…</span>}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{c.term || "—"}</td>
                    <td className="py-3 px-4">{enrolledAs(c)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={pub ? "text-green-700 font-medium" : "text-muted-foreground"}>
                          {pub ? "Yes" : "No"}
                        </span>
                        <button
                          onClick={() => openDetail(c)}
                          className="ml-2 text-muted-foreground hover:text-cyan"
                          aria-label="Course details"
                          title="Course details"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Star a course to add it to your Dashboard. Click a nickname to rename it just for you. Click the ⓘ for a details drawer.
        </p>
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: dotColor(detail.color, detail.id) }} />
                  {nicks[detail.id] || detail.title}
                </SheetTitle>
                <SheetDescription>
                  {detail.code ? `${detail.code} • ` : ""}{detail.term || "No term set"} • {detail.status === "published" ? "Published" : "Unpublished"}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <section>
                  <h3 className="text-sm font-semibold text-charcoal mb-2 flex items-center gap-2"><Users className="h-4 w-4" /> Enrollment</h3>
                  {detailData ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md border border-border p-2">
                        <div className="text-xl font-semibold">{detailData.enrollmentCount}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="rounded-md border border-border p-2">
                        <div className="text-xl font-semibold">{detailData.assignments}</div>
                        <div className="text-xs text-muted-foreground">Assignments</div>
                      </div>
                      <div className="rounded-md border border-border p-2">
                        <div className="text-xl font-semibold">{detailData.discussions}</div>
                        <div className="text-xs text-muted-foreground">Discussions</div>
                      </div>
                    </div>
                  ) : <p className="text-xs text-muted-foreground">Loading…</p>}
                  <p className="text-xs text-muted-foreground mt-2">You are enrolled as <strong>{enrolledAs(detail)}</strong>.</p>
                  {detailData?.startAt && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <CalIcon className="h-3 w-3" /> {new Date(detailData.startAt).toLocaleDateString()} – {detailData.endAt ? new Date(detailData.endAt).toLocaleDateString() : "ongoing"}
                    </p>
                  )}
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-charcoal mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Syllabus</h3>
                  {detailData ? (
                    detailData.syllabus ? (
                      <div
                        className="prose prose-sm max-w-none border border-border rounded-md p-3 max-h-64 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: detailData.syllabus }}
                      />
                    ) : <p className="text-xs text-muted-foreground italic">No syllabus posted yet.</p>
                  ) : <p className="text-xs text-muted-foreground">Loading…</p>}
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-charcoal mb-2">Quick actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm"><Link to={courseHref(detail.id)}>Open course</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link to={`${courseHref(detail.id)}#modules`}><BookOpen className="h-3 w-3 mr-1" /> Modules</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link to={`${courseHref(detail.id)}#assignments`}><FileText className="h-3 w-3 mr-1" /> Assignments</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link to={`${courseHref(detail.id)}#discussions`}><MessageSquare className="h-3 w-3 mr-1" /> Discussions</Link></Button>
                    <Button variant="outline" size="sm" onClick={() => toggleFav(detail.id)}>
                      <Star className={`h-3 w-3 mr-1 ${favs.has(detail.id) ? "fill-yellow-400 text-yellow-500" : ""}`} />
                      {favs.has(detail.id) ? "Unfavorite" : "Favorite"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setEditingNick(detail.id); setDetail(null); }}>Edit nickname</Button>
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
}
