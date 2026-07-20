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
    startDate: "August 31, 2026",
    endDate: "October 12, 2026",
    deadline: "Monday, August 17, 2026",
    deadlineISO: "2026-08-17",
    startISO: "2026-08-31",
  },
  {
    startDate: "October 19, 2026",
    endDate: "November 30, 2026",
    deadline: "Monday, October 5, 2026",
    deadlineISO: "2026-10-05",
    startISO: "2026-10-19",
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
    startDate: "January 25, 2027",
    endDate: "March 8, 2027",
    deadline: "Monday, January 11, 2027",
    deadlineISO: "2027-01-11",
    startISO: "2027-01-25",
  },
  {
    startDate: "March 15, 2027",
    endDate: "April 26, 2027",
    deadline: "Monday, March 1, 2027",
    deadlineISO: "2027-03-01",
    startISO: "2027-03-15",
  },
  {
    startDate: "May 3, 2027",
    endDate: "June 14, 2027",
    deadline: "Monday, April 19, 2027",
    deadlineISO: "2027-04-19",
    startISO: "2027-05-03",
  },
  {
    startDate: "June 21, 2027",
    endDate: "August 2, 2027",
    deadline: "Monday, June 7, 2027",
    deadlineISO: "2027-06-07",
    startISO: "2027-06-21",
  },
  {
    startDate: "August 9, 2027",
    endDate: "September 20, 2027",
    deadline: "Monday, July 26, 2027",
    deadlineISO: "2027-07-26",
    startISO: "2027-08-09",
  },
  {
    startDate: "September 27, 2027",
    endDate: "November 8, 2027",
    deadline: "Monday, September 13, 2027",
    deadlineISO: "2027-09-13",
    startISO: "2027-09-27",
  },
  {
    startDate: "November 15, 2027",
    endDate: "December 27, 2027",
    deadline: "Monday, November 1, 2027",
    deadlineISO: "2027-11-01",
    startISO: "2027-11-15",
  },
  {
    startDate: "January 3, 2028",
    endDate: "February 14, 2028",
    deadline: "Monday, December 20, 2027",
    deadlineISO: "2027-12-20",
    startISO: "2028-01-03",
  },
  // 2028 — Daytime
  {
    startDate: "February 21, 2028",
    endDate: "April 3, 2028",
    deadline: "Monday, February 7, 2028",
    deadlineISO: "2028-02-07",
    startISO: "2028-02-21",
  },
  {
    startDate: "April 10, 2028",
    endDate: "May 22, 2028",
    deadline: "Monday, March 27, 2028",
    deadlineISO: "2028-03-27",
    startISO: "2028-04-10",
  },
  // 2026 — Weekend
  {
    startDate: "July 11, 2026",
    endDate: "August 30, 2026",
    deadline: "Saturday, June 27, 2026",
    deadlineISO: "2026-06-27",
    startISO: "2026-07-11",
    programType: "weekend",
  },
  {
    startDate: "October 3, 2026",
    endDate: "November 22, 2026",
    deadline: "Saturday, September 19, 2026",
    deadlineISO: "2026-09-19",
    startISO: "2026-10-03",
    programType: "weekend",
  },
  // 2027 — Weekend
  {
    startDate: "January 9, 2027",
    endDate: "February 28, 2027",
    deadline: "Saturday, December 26, 2026",
    deadlineISO: "2026-12-26",
    startISO: "2027-01-09",
    programType: "weekend",
  },
  {
    startDate: "April 3, 2027",
    endDate: "May 23, 2027",
    deadline: "Saturday, March 20, 2027",
    deadlineISO: "2027-03-20",
    startISO: "2027-04-03",
    programType: "weekend",
  },
  {
    startDate: "July 10, 2027",
    endDate: "August 29, 2027",
    deadline: "Saturday, June 26, 2027",
    deadlineISO: "2027-06-26",
    startISO: "2027-07-10",
    programType: "weekend",
  },
  {
    startDate: "October 2, 2027",
    endDate: "November 21, 2027",
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
