export interface CohortSchedule {
  startDate: string; // e.g. "May 4, 2026"
  endDate: string;
  deadline: string; // e.g. "Monday, April 20, 2026"
  deadlineISO: string; // e.g. "2026-04-20" for date comparison
  startISO: string; // e.g. "2026-05-04"
  programType?: "daytime" | "weekend"; // defaults to "daytime"
}

export const cohortSchedule: CohortSchedule[] = [
  // 2026 — Daytime
  {
    startDate: "May 4, 2026",
    endDate: "June 19, 2026",
    deadline: "Monday, April 20, 2026",
    deadlineISO: "2026-04-20",
    startISO: "2026-05-04",
  },
  {
    startDate: "July 6, 2026",
    endDate: "August 17, 2026",
    deadline: "Monday, June 22, 2026",
    deadlineISO: "2026-06-22",
    startISO: "2026-07-06",
  },
  {
    startDate: "August 24, 2026",
    endDate: "October 5, 2026",
    deadline: "Monday, August 10, 2026",
    deadlineISO: "2026-08-10",
    startISO: "2026-08-24",
  },
  {
    startDate: "October 12, 2026",
    endDate: "November 23, 2026",
    deadline: "Monday, September 28, 2026",
    deadlineISO: "2026-09-28",
    startISO: "2026-10-12",
  },
  {
    startDate: "December 7, 2026",
    endDate: "January 18, 2027",
    deadline: "Monday, November 23, 2026",
    deadlineISO: "2026-11-23",
    startISO: "2026-12-07",
  },
  // 2027 — Daytime
  {
    startDate: "February 8, 2027",
    endDate: "March 22, 2027",
    deadline: "Monday, January 25, 2027",
    deadlineISO: "2027-01-25",
    startISO: "2027-02-08",
  },
  {
    startDate: "May 3, 2027",
    endDate: "June 14, 2027",
    deadline: "Monday, April 19, 2027",
    deadlineISO: "2027-04-19",
    startISO: "2027-05-03",
  },
  {
    startDate: "July 5, 2027",
    endDate: "August 16, 2027",
    deadline: "Monday, June 21, 2027",
    deadlineISO: "2027-06-21",
    startISO: "2027-07-05",
  },
  {
    startDate: "August 23, 2027",
    endDate: "October 4, 2027",
    deadline: "Monday, August 9, 2027",
    deadlineISO: "2027-08-09",
    startISO: "2027-08-23",
  },
  {
    startDate: "October 11, 2027",
    endDate: "November 22, 2027",
    deadline: "Monday, September 27, 2027",
    deadlineISO: "2027-09-27",
    startISO: "2027-10-11",
  },
  {
    startDate: "December 6, 2027",
    endDate: "January 17, 2028",
    deadline: "Monday, November 22, 2027",
    deadlineISO: "2027-11-22",
    startISO: "2027-12-06",
  },
  // 2026 — Weekend
  {
    startDate: "July 11, 2026",
    endDate: "August 23, 2026",
    deadline: "Saturday, June 27, 2026",
    deadlineISO: "2026-06-27",
    startISO: "2026-07-11",
    programType: "weekend",
  },
  {
    startDate: "October 3, 2026",
    endDate: "November 15, 2026",
    deadline: "Saturday, September 19, 2026",
    deadlineISO: "2026-09-19",
    startISO: "2026-10-03",
    programType: "weekend",
  },
  // 2027 — Weekend
  {
    startDate: "January 9, 2027",
    endDate: "February 21, 2027",
    deadline: "Saturday, December 26, 2026",
    deadlineISO: "2026-12-26",
    startISO: "2027-01-09",
    programType: "weekend",
  },
  {
    startDate: "April 3, 2027",
    endDate: "May 16, 2027",
    deadline: "Saturday, March 20, 2027",
    deadlineISO: "2027-03-20",
    startISO: "2027-04-03",
    programType: "weekend",
  },
  {
    startDate: "July 10, 2027",
    endDate: "August 22, 2027",
    deadline: "Saturday, June 26, 2027",
    deadlineISO: "2027-06-26",
    startISO: "2027-07-10",
    programType: "weekend",
  },
  {
    startDate: "October 2, 2027",
    endDate: "November 14, 2027",
    deadline: "Saturday, September 18, 2027",
    deadlineISO: "2027-09-18",
    startISO: "2027-10-02",
    programType: "weekend",
  },
];

/**
 * Returns the next cohort whose deadline hasn't passed yet.
 * Optionally filters by programType (defaults to any).
 */
export function getNextUpcomingCohort(programType?: "daytime" | "weekend"): CohortSchedule {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const cohort of cohortSchedule) {
    const cohortType = cohort.programType || "daytime";
    if (programType && cohortType !== programType) continue;
    const deadline = new Date(cohort.deadlineISO + "T23:59:59");
    if (deadline >= today) {
      return cohort;
    }
  }

  const filtered = cohortSchedule.filter(c => (c.programType || "daytime") === (programType || "daytime"));
  return filtered[filtered.length - 1];
}

/**
 * Returns all cohorts of a given type.
 */
export function getCohortsByType(programType: "daytime" | "weekend"): CohortSchedule[] {
  return cohortSchedule.filter(c => (c.programType || "daytime") === programType);
}
