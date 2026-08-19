import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  cohortSchedule,
  getCohortDeadlines,
  resolveApplyByISO,
  isDeadlinePassed,
  formatDeadlineLabel,
} from "../cohortSchedule";

const ROOT = path.resolve(__dirname, "../../..");

function walk(dir: string, exts: string[], acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, exts, acc);
    else if (exts.some((e) => entry.name.endsWith(e))) acc.push(full);
  }
  return acc;
}

// Files allowed to contain the legacy 14-day fallback rule (the shared config itself).
const ALLOWED_FALLBACK_FILES = [
  "src/data/cohortSchedule.ts",
  "src/data/__tests__/deadlineConfig.test.ts",
  "supabase/functions/_shared/cohort-deadline.ts",
];

describe("shared deadline config", () => {
  it("uses the stored cohort deadline over the 14-day rule", () => {
    expect(resolveApplyByISO("2026-08-31", "2026-08-23")).toBe("2026-08-23");
    expect(resolveApplyByISO("2026-08-31")).toBe("2026-08-17"); // fallback only
  });

  it("shows the Aug 31, 2026 cohort as Apply by August 23, 2026 at 11:59 PM", () => {
    const aug31 = cohortSchedule.find((c) => c.startISO === "2026-08-31");
    expect(aug31).toBeDefined();
    const dl = getCohortDeadlines(aug31!);
    expect(dl.applyByISO).toBe("2026-08-23");
    expect(dl.applyByLabel).toBe("August 23, 2026 at 11:59 PM");
    expect(dl.applyByAt.getHours()).toBe(23);
    expect(dl.applyByAt.getMinutes()).toBe(59);
  });

  it("keeps a cohort open until 11:59 PM on the deadline date", () => {
    const start = "2026-08-31";
    const deadline = "2026-08-23";
    expect(isDeadlinePassed(start, deadline, new Date("2026-08-23T23:58:00"))).toBe(false);
    expect(isDeadlinePassed(start, deadline, new Date("2026-08-24T00:01:00"))).toBe(true);
    // The old rule would have closed it on Aug 17 — it must not.
    expect(isDeadlinePassed(start, deadline, new Date("2026-08-18T09:00:00"))).toBe(false);
  });

  it("always renders deadlines with the 11:59 PM cutoff", () => {
    expect(formatDeadlineLabel("2026-08-23")).toContain("11:59 PM");
  });

  it("no cohort in the schedule silently relies on the 14-day fallback", () => {
    for (const c of cohortSchedule) {
      expect(c.deadlineISO, `${c.startDate} is missing a stored deadline`).toBeTruthy();
    }
  });
});

describe("regression: no hardcoded 14-day deadline math", () => {
  const files = [
    ...walk(path.join(ROOT, "src"), [".ts", ".tsx"]),
    ...walk(path.join(ROOT, "supabase/functions"), [".ts"]),
  ];

  // Patterns that recompute an apply-by date instead of reading the shared config.
  const BAD_PATTERNS: Array<{ re: RegExp; label: string }> = [
    { re: /setDate\([^)]*-\s*14\s*\)/, label: "manual start-minus-14 date math" },
    { re: /APPLY_BY_OFFSET_DAYS\s*=\s*14/, label: "duplicate 14-day offset constant" },
    { re: /August\s+17,?\s+2026/i, label: "stale August 17, 2026 deadline" },
  ];

  it("no page or edge function recomputes the apply-by deadline", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const rel = path.relative(ROOT, file).replace(/\\/g, "/");
      if (ALLOWED_FALLBACK_FILES.includes(rel)) continue;
      const src = fs.readFileSync(file, "utf8");
      for (const { re, label } of BAD_PATTERNS) {
        if (re.test(src)) offenders.push(`${rel}: ${label}`);
      }
    }
    expect(offenders, `Use the shared deadline config instead:\n${offenders.join("\n")}`).toEqual([]);
  });
});
