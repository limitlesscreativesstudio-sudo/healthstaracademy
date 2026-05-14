# Community Resources — Financial Assistance Hub

A new dedicated page showcasing local/state organizations that help with tuition, childcare, food, and transportation costs — paired with soft entry points from the pages where prospects feel cost anxiety. **External resources only** (Denefits/payment plans stay on Admissions where they already live).

## Why a dedicated page (not another sticky banner)

You already have a sticky `AnnouncementBar` (cohort countdown) plus the `TopInfoBar`. Adding a third stacked bar would push the hero below the fold and dilute the cohort-deadline urgency that's currently driving conversions. Financial assistance is reference content — people need phone numbers, eligibility info, and links they can copy. That's a page, not a one-liner.

Instead, we'll surface the page through **three contextual touchpoints** where the cost objection actually shows up.

## What gets built

### 1. New page: `/community-resources`

Hero banner (16:9, brand-compliant) → intro paragraph → resource cards organized by category. No fluff, no AI imagery.

**Categories & seeded organizations** (researched, California-focused, verified before launch):

```text
WORKFORCE & TUITION ASSISTANCE
  - WIOA — San Joaquin County WorkNet (Stockton)
  - WIOA — Alameda County / Eden Area Career Center (Hayward)
  - WIOA — Sacramento Works
  - California Department of Rehabilitation (DOR) — vocational training
  - CalWORKs Welfare-to-Work — county social services
  - Veterans Education Benefits (CalVet / GI Bill)

EDUCATION GRANTS & SCHOLARSHIPS
  - Sutter Health / Kaiser community scholarship programs
  - California Healthcare Workforce grants (HCAI)
  - Local community foundation scholarships

WRAPAROUND SUPPORT (so students can attend)
  - Childcare: CA Alternative Payment Program (APP)
  - Food: Second Harvest of San Joaquin, Sacramento Food Bank, Alameda County Community Food Bank
  - Transportation: county transit vouchers, gas-card programs
```

Each card includes: organization name, what they help with, who qualifies (1-line eligibility hint), website link, and phone where public. Clear disclaimer that Health Star Academy is not affiliated with these organizations and eligibility/availability is determined by each provider.

### 2. Soft entry points (no new sticky banners)

- **Admissions page** — Add a fourth Quick Answers card next to Cost/Time/Confidence: *"Need help paying?"* with HandHeart icon, magenta accent, linking to `/community-resources`.
- **Pre-Qualification page** — Reassurance line under the form intro: *"Worried about cost? Explore community resources for financial assistance →"*
- **Global Footer** — Add "Community Resources" link under the existing resources/links column so it's reachable from every page.
- **Header nav** — Add it as a sub-item under the existing "Admissions" or "Resources" dropdown (whichever fits the current nav structure).

### 3. SEO

Standard `<SEO />` metadata + `JSON-LD` for the page. Target queries like *"WIOA CNA training Stockton"*, *"financial assistance for CNA school California"* — fits existing regional SEO strategy (Sacramento, Bay Area, Stockton, Hayward).

## What this is NOT

- Not a sticky top banner — would conflict with cohort countdown
- Not an endorsement — disclaimer makes affiliations clear
- Not financial aid we administer — Denefits/payment plans remain on Admissions
- No backend, no database, no edge function — purely static React page

## Technical notes

- New file: `src/pages/CommunityResourcesPage.tsx` using `HeroBanner`, `Card`, brand color tokens, `lucide-react` icons (HandHeart, Briefcase, GraduationCap, Utensils, Bus, Baby).
- Route added to `src/App.tsx` (`/community-resources`), with `ScrollToTop` and lazy-load pattern matching other pages.
- Resource data lives in a typed array at the top of the page file so you can edit copy without touching layout.
- Header nav update: small edit to `src/components/Header.tsx`.
- Footer update: small edit to `src/components/Footer.tsx`.
- Admissions card: extends the existing Quick Answers grid in `src/pages/AdmissionsPage.tsx` (3-col → 4-col on desktop, 2-col on tablet).
- Pre-Qualification reassurance line: small edit to `src/pages/PreQualificationPage.tsx`.
- All links open in new tab with `rel="noopener noreferrer"`.
- 16:9 hero banner image — I'll reuse an existing brand-compliant photo from your gallery (or you can swap later).

## Open question for after approval

Once you approve, I'll verify each organization's current website URL and public phone number before shipping (so no dead links on launch). If you'd rather provide your own shortlist of partners that you've already vetted, you can drop them in and I'll add them too.
