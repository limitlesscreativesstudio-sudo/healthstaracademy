// Global switches to pause cohort announcements while the schedule is
// being restructured (instructor break planning, Psych Tech program rollout).

// Full site-wide pause (both daytime and weekend). Leave false when only
// the weekend track is paused.
export const COHORTS_PAUSED = false;

export const COHORT_PAUSE_HEADLINE = "New cohort dates coming soon";

export const COHORT_PAUSE_MESSAGE =
  "We're restructuring our cohort calendar to add built-in breaks for our instructors and to fold in our upcoming Psych Tech program. New start dates will be posted shortly — join the interest list and we'll notify you the moment enrollment reopens.";

export const COHORT_PAUSE_CTA_TEXT = "Join the interest list";
export const COHORT_PAUSE_CTA_LINK = "/pre-qualification";

// Site-wide pause for the Weekend track only. Daytime cohorts continue as
// normal. Flip to false once weekend dates are re-confirmed.
export const WEEKENDS_PAUSED = true;

export const WEEKEND_PAUSE_HEADLINE = "Weekend cohorts are paused";

export const WEEKEND_PAUSE_MESSAGE =
  "We're restructuring the Weekend track calendar and folding in our upcoming Psych Tech program. Join the interest list and we'll notify you the moment new Weekend dates are posted. Daytime cohorts continue on schedule.";
