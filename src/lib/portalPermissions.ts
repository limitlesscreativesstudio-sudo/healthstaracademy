export type PortalRole = "admin" | "instructor" | "student";

/**
 * Tabs an instructor may edit. Anything not listed here is admin-only
 * (roster/invites, course settings, analytics), and students may never edit.
 */
export const INSTRUCTOR_EDITABLE_TABS = [
  "home",
  "modules",
  "announcements",
  "assignments",
  "quizzes",
  "grades",
  "pages",
  "files",
  "syllabus",
  "attendance",
  "clinical",
  "readiness",
  "required",
  "discussions",
  "outcomes",
  "rubrics",
  "calendar",
] as const;

const INSTRUCTOR_SET = new Set<string>(INSTRUCTOR_EDITABLE_TABS);

/** Can the given role edit content on the given course tab? */
export const canEditTab = (role: PortalRole | null | undefined, tab: string): boolean => {
  if (role === "admin") return true;
  if (role === "instructor") return INSTRUCTOR_SET.has(tab || "home");
  return false; // students are always read-only
};
