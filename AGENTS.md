# Assessment integrity

- Import changed assessments as locked revised versions; preserve attempted quiz and question IDs because saved answers reference them.
- A verified answer key bypasses the repeated-choice heuristic because legitimate uploaded keys may mark every answer with the same choice.
- Course duplication must reject populated targets and authorize both courses because replacement can destroy saved student history.
- Display released quiz grades using the attempt's original maximum because later assessment edits must not change earned percentages.- Questions flagged key_unverified are never auto-scored because their stored answer was not confirmed by an instructor document.
- New sign-ups get the student role only when an invite exists (pending enrollment or course invite), because self-registered accounts must not reach the LMS.
- Quiz answer drafts are scoped to the open quiz's question IDs, because unscoped state leaked one quiz's answers into another attempt.
