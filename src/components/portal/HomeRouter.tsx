import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HomePageType = "modules" | "front_page" | "syllabus" | "assignments" | "activity";

/**
 * Renders the appropriate "Home" content based on the course's saved home_page_type.
 * Falls back to the provided <Modules/> node when the type is 'modules' or unknown.
 */
export default function HomeRouter({
  type,
  courseId,
  modules,
  syllabus,
  assignments,
  activity,
}: {
  type: HomePageType | string;
  courseId?: string;
  modules: React.ReactNode;
  syllabus: React.ReactNode;
  assignments: React.ReactNode;
  activity: React.ReactNode;
}) {
  if (type === "syllabus") return <>{syllabus}</>;
  if (type === "assignments") return <>{assignments}</>;
  if (type === "activity") return <>{activity}</>;
  if (type === "front_page") return <FrontPageHome courseId={courseId} />;
  return <>{modules}</>;
}

function FrontPageHome({ courseId }: { courseId?: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("lms_pages")
        .select("title, body_html")
        .eq("course_id", courseId)
        .eq("front_page", true)
        .eq("published", true)
        .maybeSingle();
      if (cancelled) return;
      setTitle(data?.title ?? "");
      setHtml(data?.body_html ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading front page…</div>;
  if (!html) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-sm text-muted-foreground">
        <div className="rounded border border-dashed border-border p-6 text-center">
          <div className="font-semibold text-foreground mb-1">No Front Page set</div>
          Open the <span className="font-medium">Pages</span> tab, create a page, and mark it as the Front Page. Then it will appear here.
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      {title && <h1 className="text-2xl font-semibold mb-4">{title}</h1>}
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
