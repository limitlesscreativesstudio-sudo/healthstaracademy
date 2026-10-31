// Health Star Academy on Cloudflare.
// The public site keeps working when the Lovable Cloud database is paused:
// cohorts, blog posts and applications have a Cloudflare backup, and the
// chat bubble and blog writer run on Cloudflare's own AI.
import { supabase } from "@/integrations/supabase/client";
import { cohortSchedule } from "@/data/cohortSchedule";

export const HSA_API: string =
  (import.meta.env.VITE_HSA_API_BASE as string | undefined) ??
  "https://healthstaracademy.limitlessgrowthco.workers.dev";

/** Set only on the Cloudflare build: where the student and instructor portal lives. */
export const PORTAL_ORIGIN = (import.meta.env.VITE_PORTAL_ORIGIN as string | undefined) || "";

export function withTimeout<T>(work: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    Promise.resolve(work).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

export async function cloudGet<T>(path: string, ms = 8000): Promise<T> {
  const res = await withTimeout(fetch(`${HSA_API}${path}`), ms);
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return (await res.json()) as T;
}

export async function cloudPost<T>(path: string, body: unknown, ms = 30000): Promise<T> {
  const res = await withTimeout(
    fetch(`${HSA_API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    ms,
  );
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return (await res.json()) as T;
}

export interface PublicCohort {
  id: string;
  name: string;
  start_date: string;
  status: string;
  capacity: number;
  program_type: string;
  enrollment_deadline: string | null;
  paid_in_full_link: string;
  payment_plan_link: string;
}

/** Cohorts built from the schedule in src/data/cohortSchedule.ts (last resort). */
export function scheduleCohorts(): PublicCohort[] {
  return cohortSchedule.map((c) => ({
    id: `schedule-${c.startISO}`,
    name: `${c.programType === "weekend" ? "Weekend" : "Daytime"} cohort ${c.startDate}`,
    start_date: c.startISO,
    status: c.programType === "weekend" ? "paused" : "open",
    capacity: 0,
    program_type: c.programType ?? "daytime",
    enrollment_deadline: c.deadlineISO,
    paid_in_full_link: "",
    payment_plan_link: "",
  }));
}

/**
 * Public cohort list: the live database first, then the Cloudflare copy
 * (refreshed every 15 minutes), then the built in schedule.
 */
export async function loadPublicCohorts(): Promise<PublicCohort[]> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("cohorts")
        .select("id, name, start_date, status, capacity, program_type, enrollment_deadline, paid_in_full_link, payment_plan_link")
        .order("start_date", { ascending: true }),
      8000,
    );
    if (error) throw error;
    if (data && data.length) return data as PublicCohort[];
  } catch {
    /* fall through to the Cloudflare copy */
  }
  try {
    const cached = await cloudGet<{ cohorts: PublicCohort[] }>("/api/cohorts");
    if (cached.cohorts?.length) return cached.cohorts;
  } catch {
    /* fall through to the schedule */
  }
  return scheduleCohorts();
}

export interface EnrollmentResult {
  success?: boolean;
  queued?: boolean;
  qualification_status: string;
  qualification_notes: string;
  needs_exam: boolean;
  needs_consent: boolean;
  email_sent?: boolean;
}

/**
 * Send a CNA or HHA application. Cloudflare saves it first and passes it to the
 * enrollment system; if that system is down, Cloudflare keeps it and delivers it
 * as soon as the system is back, so no application is lost.
 */
export async function submitEnrollment(payload: Record<string, unknown>): Promise<EnrollmentResult> {
  try {
    return await cloudPost<EnrollmentResult>("/api/enroll", payload, 40000);
  } catch {
    const { data, error } = await withTimeout(
      supabase.functions.invoke("enrollment-webhook", { body: payload }),
      25000,
    );
    if (error) throw error;
    return data as EnrollmentResult;
  }
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  tldr: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  category: string | null;
  read_time: string | null;
  body_markdown: string;
  published_at: string | null;
  target_city: string | null;
  target_keyword: string | null;
}

export type BlogSummary = Omit<BlogPost, "body_markdown">;

/** Published AI blog posts from Cloudflare and the database, newest first. */
export async function loadBlogList(): Promise<BlogSummary[]> {
  const bySlug = new Map<string, BlogSummary>();
  const [cloud, db] = await Promise.allSettled([
    cloudGet<{ posts: BlogSummary[] }>("/api/blog"),
    withTimeout(
      supabase
        .from("blog_drafts")
        .select("id,slug,title,tldr,meta_description,category,read_time,published_at,hero_image_url,hero_image_alt,target_city,target_keyword")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
      8000,
    ),
  ]);
  if (db.status === "fulfilled" && db.value.data) {
    for (const p of db.value.data as BlogSummary[]) bySlug.set(p.slug, p);
  }
  if (cloud.status === "fulfilled") {
    for (const p of cloud.value.posts ?? []) if (!bySlug.has(p.slug)) bySlug.set(p.slug, p);
  }
  return [...bySlug.values()].sort(
    (a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime(),
  );
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const { post } = await cloudGet<{ post: BlogPost | null }>(`/api/blog/${encodeURIComponent(slug)}`);
    if (post) return post;
  } catch {
    /* try the database */
  }
  try {
    const { data } = await withTimeout(
      supabase.from("blog_drafts").select("*").eq("slug", slug).eq("status", "published").maybeSingle(),
      8000,
    );
    return (data as BlogPost | null) ?? null;
  } catch {
    return null;
  }
}
