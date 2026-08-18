# Align questionnaire, spreadsheet, and emails

The on-screen questionnaire becomes the single source of truth for question order, and a new question is added about the $175 non-refundable application fee.

## New eligibility question

Added as the last eligibility question on Step 2:

> Are you able to pay the $175 non-refundable program application fee if you qualify for enrollment?

Answering "No" does **not** disqualify the applicant. It is recorded as an informational flag so admissions can follow up about payment options (Denefits / payment plan). Say the word if you'd rather it count as a disqualifier.

## Final order (form, sheet, and emails all match)

Personal info
1. First name / Last name (written to the sheet as one "Name" cell)
2. Date of birth
3. Email
4. Address
5. Phone

Eligibility
6. Are you at least 18?
7. Valid physical government-issued ID
8. Physical Social Security card
9. Can pass LiveScan background check
10. Proof of good health
11. GED or High School Diploma
12. Reliable transportation to clinical sites
13. Able to pay the $175 non-refundable application fee

Cohort and outcome
14. Cohort selected
15. False-information disclaimer acknowledged
16. How did you hear about us
17. Consent given
18. Qualified / Disqualified
19. Parental consent needed
20. Entrance exam needed
21. Missing / disqualifying items

## Spreadsheet columns

Written to the "2025 Responses" tab, range A:V (one column wider than before because of the fee question):

```text
A Timestamp        I  SSN Card          Q  How Did You Hear
B Name             J  Background        R  Consent
C DOB              K  Health Proof      S  Qualified/Disqualified
D Email            L  Diploma           T  Parental Consent Needed
E Address          M  Transportation    U  Entrance Exam Needed
F Phone            N  Can Pay $175 Fee  V  Missing Items
G Over 18          O  Cohort Selected
H Valid ID         P  Disclaimer
```

One thing to confirm: you mentioned the fee question as "row M". In the layout above, M is Transportation and N is the fee, because Transportation still sits between Diploma and the fee in the on-screen order. If the fee should come before Transportation instead, tell me and I'll swap those two everywhere.

Existing rows in the sheet are left untouched — only new submissions use this order.

## Technical notes

- `src/pages/portal/PreQualificationPage.tsx`: add `can_pay_fee` to the eligibility state, question list, and validation, and reorder the Step 1 fields to Name → DOB → Email → Address → Phone. Include `can_pay_fee` in the submit payload.
- `supabase/functions/enrollment-webhook/index.ts`: reorder the sheet row array to the layout above, add the fee column, and widen the append range from `A:U` to `A:V`. Store the flag on the student record and pass it through to the qualification result without changing qualified/disqualified logic.
- Database: add a `can_pay_fee` boolean to `students` so the answer is queryable in the admin pipeline.
- `supabase/functions/send-enrollment-email/index.ts`: the admin notification lists answers in the same order, with a note when the applicant cannot pay the fee up front.
- `src/pages/admin/components/StudentPipeline.tsx`: surface the fee answer on the applicant record.
