

# SEO Optimization Plan for Health Star Academy Website

## Current State Assessment

The website has a solid SEO foundation with `react-helmet-async` and a reusable `SEO.tsx` component. However, there are several areas that need improvement for optimal search engine visibility.

### What's Already Working
- SEO component with dynamic meta tags (title, description, keywords, canonical, Open Graph, Twitter Cards)
- Structured data (JSON-LD) in index.html for EducationalOrganization schema
- Geo-location tags for local SEO
- Blog articles with article-specific metadata (author, publishedTime)

### Issues Identified

| Page | Issue |
|------|-------|
| **LocationsPage** | Missing `canonical` prop in SEO component |
| **ExamPrepPage** | Missing `canonical` and `keywords` props |
| **GalleryPage** | Already has full SEO implementation |
| **NotFound** | No SEO component (users shouldn't index 404 pages, but needs noindex meta) |
| **index.html** | Uses placeholder Lovable OG image instead of Health Star Academy branded image |
| **All Pages** | Open Graph image is Lovable default, not academy-branded |
| **SEO Component** | Missing robots meta tag support for noindex pages |

---

## Implementation Plan

### 1. Fix Missing SEO Props on Pages

**LocationsPage.tsx**
- Add missing `canonical="/locations"` prop

**ExamPrepPage.tsx**  
- Add `canonical="/programs/exam-prep"`
- Add relevant keywords: `"CNA practice exam, California CNA test prep, nursing assistant certification exam, CDPH CNA questions, CNA study guide, state exam practice"`

### 2. Enhance SEO Component with Additional Features

**SEO.tsx Updates:**
- Add `robots` prop for controlling indexing (noindex, nofollow support)
- Add `viewport` meta tag (fallback)
- Add structured data support for pages (Course, FAQPage schemas)

### 3. Add SEO to NotFound Page

**NotFound.tsx:**
- Add SEO component with `robots="noindex, nofollow"` to prevent search engines from indexing 404 pages
- Add proper title and description for user experience

### 4. Update Open Graph Images

Currently all pages use the default Lovable OG image: `https://lovable.dev/opengraph-image-p98pqg.png`

**Recommendation:**
- Upload a branded Health Star Academy OG image (1200x630px recommended)
- Update default image in SEO.tsx component
- Update OG image in index.html

### 5. Add Page-Specific Structured Data

**ProgramsPage.tsx:**
Add Course schema for the CNA program:
```json
{
  "@type": "Course",
  "name": "Certified Nursing Assistant Training Program",
  "description": "160-hour CDPH-approved hybrid CNA program",
  "provider": { "@type": "Organization", "name": "Health Star Academy" },
  "courseMode": "blended",
  "duration": "P6W"
}
```

**AdmissionsPage.tsx:**
Add FAQPage schema for the FAQ section to enable rich snippets in Google search results.

**LocationsPage.tsx:**
Add LocalBusiness schema for each training location.

### 6. Improve Keywords Consistency

Ensure all pages have comprehensive, location-specific keywords that target:
- Primary: CNA training + location (Stockton, Lodi, Hayward, California)
- Secondary: CDPH approved, hybrid program, online CNA
- Long-tail: "how to become a CNA in California", "CNA certification near me"

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/SEO.tsx` | Add `robots` prop, enhance structured data support |
| `src/pages/LocationsPage.tsx` | Add `canonical` prop |
| `src/pages/ExamPrepPage.tsx` | Add `canonical` and `keywords` props |
| `src/pages/NotFound.tsx` | Add SEO component with noindex directive |
| `index.html` | Update OG image URL (once branded image is available) |

### SEO.tsx Enhanced Props

```typescript
interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  type?: "website" | "article";
  image?: string;
  author?: string;
  publishedTime?: string;
  robots?: string; // NEW: "index, follow" | "noindex, nofollow" | etc.
  structuredData?: object; // NEW: Page-specific JSON-LD
}
```

### Updated NotFound.tsx SEO

```tsx
<SEO
  title="Page Not Found | Health Star Academy"
  description="The page you're looking for doesn't exist. Return to Health Star Academy's homepage to explore our CDPH-approved CNA training programs."
  robots="noindex, nofollow"
/>
```

---

## Summary of All SEO Fixes

1. **LocationsPage** - Add canonical URL
2. **ExamPrepPage** - Add canonical URL and keywords
3. **NotFound** - Add SEO component with noindex
4. **SEO Component** - Add robots meta tag support
5. **All pages** - Verify OG image strategy (user may need to provide branded image)

### Additional Recommendations (Optional/Future)

- Create and upload a branded Open Graph image (1200x630px)
- Add sitemap.xml for better crawling
- Add robots.txt configuration
- Consider adding LocalBusiness schema for each clinical location
- Add BreadcrumbList schema for navigation hierarchy
- Implement FAQ schema on Admissions page for rich snippets

