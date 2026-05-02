export interface CohortSchedule {
  startDate: string; // e.g. "May 4, 2026"
  endDate: string;
  deadline: string; // e.g. "Monday, April 20, 2026"
  deadlineISO: string; // e.g. "2026-04-20" for date comparison
  startISO: string; // e.g. "2026-05-04"
  programType?: "daytime" | "weekend"; // defaults to "daytime"
}

export const cohortSchedule: CohortSchedule[] = [
  // 2026 — Daytime (6 weeks each, 1 week gap)
  {
    startDate: "June 22, 2026",
    endDate: "July 30, 2026",
    deadline: "Monday, June 8, 2026",
    deadlineISO: "2026-06-08",
    startISO: "2026-06-22",
  },
  {
    startDate: "August 10, 2026",
    endDate: "September 17, 2026",
    deadline: "Monday, July 27, 2026",
    deadlineISO: "2026-07-27",
    startISO: "2026-08-10",
  },
  {
    startDate: "September 28, 2026",
    endDate: "November 5, 2026",
    deadline: "Monday, September 14, 2026",
    deadlineISO: "2026-09-14",
    startISO: "2026-09-28",
  },
  {
    startDate: "November 16, 2026",
    endDate: "December 24, 2026",
    deadline: "Monday, November 2, 2026",
    deadlineISO: "2026-11-02",
    startISO: "2026-11-16",
  },
  // 2027 — Daytime
  {
    startDate: "January 4, 2027",
    endDate: "February 11, 2027",
    deadline: "Monday, December 21, 2026",
    deadlineISO: "2026-12-21",
    startISO: "2027-01-04",
  },
  {
    startDate: "February 22, 2027",
    endDate: "April 1, 2027",
    deadline: "Monday, February 8, 2027",
    deadlineISO: "2027-02-08",
    startISO: "2027-02-22",
  },
  {
    startDate: "April 12, 2027",
    endDate: "May 20, 2027",
    deadline: "Monday, March 29, 2027",
    deadlineISO: "2027-03-29",
    startISO: "2027-04-12",
  },
  {
    startDate: "May 31, 2027",
    endDate: "July 8, 2027",
    deadline: "Monday, May 17, 2027",
    deadlineISO: "2027-05-17",
    startISO: "2027-05-31",
  },
  {
    startDate: "July 19, 2027",
    endDate: "August 26, 2027",
    deadline: "Monday, July 5, 2027",
    deadlineISO: "2027-07-05",
    startISO: "2027-07-19",
  },
  {
    startDate: "September 6, 2027",
    endDate: "October 14, 2027",
    deadline: "Monday, August 23, 2027",
    deadlineISO: "2027-08-23",
    startISO: "2027-09-06",
  },
  {
    startDate: "October 25, 2027",
    endDate: "December 2, 2027",
    deadline: "Monday, October 11, 2027",
    deadlineISO: "2027-10-11",
    startISO: "2027-10-25",
  },
  {
    startDate: "December 13, 2027",
    endDate: "January 20, 2028",
    deadline: "Monday, November 29, 2027",
    deadlineISO: "2027-11-29",
    startISO: "2027-12-13",
  },
  // 2028 — Daytime
  {
    startDate: "January 31, 2028",
    endDate: "March 9, 2028",
    deadline: "Monday, January 17, 2028",
    deadlineISO: "2028-01-17",
    startISO: "2028-01-31",
  },
  {
    startDate: "March 20, 2028",
    endDate: "April 27, 2028",
    deadline: "Monday, March 6, 2028",
    deadlineISO: "2028-03-06",
    startISO: "2028-03-20",
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
