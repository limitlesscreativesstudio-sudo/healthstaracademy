# Portal updates

## HHA public program path
- [x] Add isolated HHA questionnaire and program choice while preserving CNA flow.
- [x] Add program-separated applicant records, HHA sheet and email handling, and pipeline filters.
- [x] Add HHA-first public program and career pathways with pending status and no price or date.
- [x] Verify qualification rules, both real submission paths, same-email isolation, signed-in pipeline readback, desktop/mobile preview and automatic build.
- [ ] Deliver HHA confirmation and admin emails: blocked by unverified sender domain in Resend. Templates are deployed and failures displayed honestly.
- [ ] Request publication after final security check.

## Owner-approved public content, October 10, 2026
- [x] Add the exact admissions eligibility FAQ and Stockton city content, updating only Stockton metadata. Existing Stockton route and sitemap entry retained.
- [x] Replace the Locations LA County block and remove the specified instructor sentence. No remaining exact banned public claims found; the SEO helper's exclusion filter retained.
- [x] Verify public pages, links, single Stockton H1, desktop and phone rendering and automatic build without changing portals or data. Existing admissions content outside the added FAQ remains unchanged.

## Approved public SEO fixes
- [x] Apply the supplied route metadata, public wording cleanup, and exact school/course schema without portal or data changes.
- [x] Assess public-only static rendering safety and add sitemap modification dates. Static rendering skipped: shared imports initialize browser-only auth storage; server rendering would require forbidden auth changes, while a browser-based build adds an unverified Chromium hosting dependency. No build/plugin/router/auth changes made.
- [x] Verify all 21 approved public routes have unique exact metadata, one visible H1, one canonical, matching OG tags and city notices; portal login has no runtime errors and the automatic build passes.

- [x] Add the public Star Chart issue list, embedded Issue 01, exact standalone newsletter HTML, page SEO and footer link without changing existing pages.

- [x] Audit LMS access, assessment saving, grading, files, notifications, attendance, and course connections. Corrected atomic submissions, draft autosave retries, saved-result viewing, manual-grade/open-attempt protection, profile/notification links, attendance normalization, and Files-only document access. Instructor live pages verified; real student submission tests not run against coursework.

- [x] Keep original case studies intact; remove imported student document entries from Modules and document copies from Pages while retaining Files.
- [x] Standardize assessment text rendering; preserve question IDs, response formats, answers, and grades. Instructor view verified without runtime errors.
- [ ] Auto-grade written case-study responses — requires instructor-approved choice versions; existing written submissions cannot safely be converted or exact-text graded.

- [x] Match uploaded Module 1–17 quizzes, case studies, and answer keys to existing course content.
- [x] Add 33 locked revised assessments and 30 verified keys per course across both templates and the active cohort; preserve old question IDs and work.
- [x] Keep student documents in Files only; remove imported worksheet copies from Pages and Modules. Keep reference key files instructor-only.
- [x] Recheck pending submissions for matching questions; none have a complete matching uploaded key, so no grades were changed.
- [x] Correct confirmed copying, private-file viewing, grade-display, and quiz-edit integrity issues; verify instructor pages and private storage access.
- [ ] Complete Module 10 Quiz, Module 14 Quiz/Case Study keys, and Module 2 Case Study key — blocked by missing or mismatched uploads.
- [ ] Correct the eight submitted, unreleased attempts — blocked by answer keys matching the original Day quizzes and Module 01/09 quizzes and Case Study 1.

## Public practice bank update
- [x] Append supplied scenario questions 216 through 260 exactly, without altering existing questions or LMS assessments.
- [x] Derive displayed category counts from the public bank without circular imports.
- [x] Verify data and public category drill preview; report existing hardcoded public totals without changing wording. Automatic build and typecheck passed.
