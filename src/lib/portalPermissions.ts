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
  "quizgrades",
  "grades",
  "progress",
  "people",
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

/**
 * Tabs a student may open. Everything else in the course shell is hidden from
 * students — they reach assignments/quizzes/exams through their modules when
 * the instructor publishes them.
 */
export const STUDENT_VISIBLE_TABS = [
  "home",
  "modules",
  "quizzes",
  "grades",
  "quizgrades",

  "attendance",
  "account",
] as const;

const STUDENT_SET = new Set<string>(STUDENT_VISIBLE_TABS);

/** Can the given role open the given course tab at all? */
export const canViewTab = (role: PortalRole | null | undefined, tab: string): boolean => {
  if (role === "student") return STUDENT_SET.has(tab || "home");
  return true;
};

/** Can the given role edit content on the given course tab? */
export const canEditTab = (role: PortalRole | null | undefined, tab: string): boolean => {
  if (role === "admin") return true;
  if (role === "instructor") return INSTRUCTOR_SET.has(tab || "home");
  return false; // students are always read-only
};
