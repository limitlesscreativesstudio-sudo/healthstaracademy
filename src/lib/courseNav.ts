import {
  BookOpen, Megaphone, MessageSquare, BarChart3, Users, FileText, FolderOpen,
  ScrollText, Target, Grid3x3, GraduationCap, Video, Handshake, ClipboardCheck,
  LineChart, PenSquare,
} from "lucide-react";

export type NavKey =
  | "home" | "announcements" | "discussions" | "grades" | "people" | "pages"
  | "files" | "syllabus" | "outcomes" | "rubrics" | "quizzes" | "modules"
  | "bigbluebutton" | "collaborations" | "attendance" | "analytics" | "lucid";

export type NavItem = {
  key: NavKey;
  label: string;
  path: string; // suffix appended to /portal/courses/:id
  icon: any;
  /** Hidden from students by default in Canvas */
  hiddenByDefault?: boolean;
  /** Cannot be hidden (Home is always visible) */
  required?: boolean;
};

export const COURSE_NAV_ITEMS: NavItem[] = [
  { key: "home",           label: "Home",            path: "",                icon: BookOpen, required: true },
  { key: "announcements",  label: "Announcements",   path: "announcements",   icon: Megaphone },
  { key: "discussions",    label: "Discussions",     path: "discussions",     icon: MessageSquare },
  { key: "grades",         label: "Grades",          path: "grades",          icon: BarChart3 },
  { key: "people",         label: "People",          path: "people",          icon: Users },
  { key: "pages",          label: "Pages",           path: "pages",           icon: FileText, hiddenByDefault: true },
  { key: "files",          label: "Files",           path: "files",           icon: FolderOpen, hiddenByDefault: true },
  { key: "syllabus",       label: "Syllabus",        path: "syllabus",        icon: ScrollText },
  { key: "outcomes",       label: "Outcomes",        path: "outcomes",        icon: Target, hiddenByDefault: true },
  { key: "rubrics",        label: "Rubrics",         path: "rubrics",         icon: Grid3x3, hiddenByDefault: true },
  { key: "quizzes",        label: "Quizzes",         path: "quizzes",         icon: GraduationCap },
  { key: "modules",        label: "Modules",         path: "modules",         icon: BookOpen },
  { key: "bigbluebutton",  label: "BigBlueButton",   path: "bigbluebutton",   icon: Video },
  { key: "collaborations", label: "Collaborations",  path: "collaborations",  icon: Handshake, hiddenByDefault: true },
  { key: "attendance",     label: "Attendance",      path: "attendance",      icon: ClipboardCheck },
  { key: "analytics",      label: "New Analytics",   path: "analytics",       icon: LineChart },
  { key: "lucid",          label: "Lucid (Whiteboard)", path: "lucid",        icon: PenSquare, hiddenByDefault: true },
];

export const defaultNavOrder = (): NavKey[] => COURSE_NAV_ITEMS.map(i => i.key);

export const isNavVisibleToStudent = (
  key: NavKey,
  visibility: Record<string, boolean> | null | undefined
): boolean => {
  const item = COURSE_NAV_ITEMS.find(i => i.key === key);
  if (!item) return false;
  if (item.required) return true;
  const v = visibility?.[key];
  if (v === undefined) return !item.hiddenByDefault;
  return v;
};

export const orderedNavKeys = (order: NavKey[] | null | undefined): NavKey[] => {
  const all = defaultNavOrder();
  if (!order || order.length === 0) return all;
  const seen = new Set<NavKey>();
  const out: NavKey[] = [];
  for (const k of order) {
    if (all.includes(k) && !seen.has(k)) { out.push(k); seen.add(k); }
  }
  for (const k of all) if (!seen.has(k)) out.push(k);
  return out;
};
