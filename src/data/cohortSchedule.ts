export interface CohortSchedule {
  startDate: string; // e.g. "May 4, 2026"
  endDate: string;
  deadline: string; // e.g. "Monday, April 20, 2026"
  deadlineISO: string; // e.g. "2026-04-20" for date comparison
  startISO: string; // e.g. "2026-05-04"
}

export const cohortSchedule: CohortSchedule[] = [
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
];

/**
 * Returns the next cohort whose deadline hasn't passed yet.
 * Falls back to the last cohort if all deadlines have passed.
 */
export function getNextUpcomingCohort(): CohortSchedule {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const cohort of cohortSchedule) {
    const deadline = new Date(cohort.deadlineISO + "T23:59:59");
    if (deadline >= today) {
      return cohort;
    }
  }

  return cohortSchedule[cohortSchedule.length - 1];
}
