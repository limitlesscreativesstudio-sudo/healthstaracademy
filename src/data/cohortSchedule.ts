export interface CohortSchedule {
  startDate: string; // e.g. "May 4, 2026"
  endDate: string;
  deadline: string; // e.g. "Monday, April 20, 2026"
  deadlineISO: string; // e.g. "2026-04-20" for date comparison
  startISO: string; // e.g. "2026-05-04"
}

export const cohortSchedule: CohortSchedule[] = [
  // 2026
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
  // 2027
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
