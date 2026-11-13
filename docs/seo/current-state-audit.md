# Castallio One — SEO, AEO, GEO & Google Jobs Current State Audit

**Document:** \`docs/seo/current-state-audit.md\`  
**Date:** March 2026 (Updated Baseline)  
**Target Domain:** \`https://castallioone.com\`  
**Platform Brand:** **Castallio One** (product identifier: \`CastallioOne\`)  
**Scope:** Full-stack architectural audit covering React 19 / Vite SPA, routing, prerendering, bot crawlability, Google Jobs structured data, Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and App Store Optimization (ASO).

---

## 1. Framework & Architecture Audit

### 1.1 Web Stack Overview
- **Core Frontend:** React 19 SPA powered by Vite 8 and TypeScript.
- **Styling:** Tailwind CSS with Lucide React iconography.
- **Backend / Database:** Supabase PostgreSQL instance (Project Ref: \`pmqtsplqnwexxnojeezg\`).
- **Authentication:** Supabase Auth (OAuth + email passwordless/magic link & session JWT).
- **Deployment & Hosting:** Client-side static hosting with edge CDN fallback.

### 1.2 The SPA Bot-Crawlability Hazard
React 19 SPAs compiled via Vite traditionally output a minimal single-page HTML shell:
\`\`\`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Castallio One</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
\`\`\`
**The Hazard:** When search engine crawlers (Googlebot, Bingbot) and AI retrieval engines (GPTBot, ClaudeBot, PerplexityBot) request URLs like \`/resources/how-to-find-bim-engineer-jobs-in-india\` or \`/job/bim-modeler-pune-123\`, pure client-side SPAs return an empty \`<div id="root">\`. Although Googlebot renders JavaScript with a delayed second pass, secondary engines and AI answer engines do NOT reliably execute heavy client hydration, resulting in:
1. Complete omission from AI Overviews and answer engine citations (Perplexity, ChatGPT Search).
2. Failure to parse synchronous JSON-LD metadata for Google Jobs.
3. Blank Open Graph previews when shared across LinkedIn, WhatsApp, or Twitter.

### 1.3 The Prerendering Architecture Solution
Castallio One solves this without abandoning Vite SPA agility via an automated build-time static page generator pipeline (\`scripts/seo-generator/\`):
- Generates pre-rendered crawlable HTML files under \`public/blog/[slug]/index.html\`, \`public/resources/[slug]/index.html\`, and \`public/job/[id]/index.html\`.
- Injects fully populated \`<title>\`, \`<meta name="description">\`, \`<link rel="canonical">\`, Open Graph tags, semantic H1, author byline, full sanitized HTML article/job body, and structured JSON-LD into the raw HTML.
- When an anonymous bot or CDN requests the page, the static server serves the physical \`index.html\` immediately with HTTP 200, full text, and valid schema.
- Once a human browser loads the page, React smoothly mounts to \`<div id="root">\` without flicker, preserving logged-in user state and SPA interactivity.

---

## 2. Route Inventory & Crawlability Matrix

| Route Pattern | Target Page Purpose | Indexability Policy | Schema Markup | Prerender Status |
|---|---|---|---|---|
| \`/\` | Platform Homepage | \`index, follow\` | \`Organization\`, \`WebSite\` | Static (\`index.html\`) |
| \`/jobs\` | National AEC Job Directory | \`index, follow\` | \`CollectionPage\`, \`BreadcrumbList\` | Client SPA |
| \`/job/:slug-:id\` | Individual AEC Job Detail | \`index, follow\` (if active) | \`JobPosting\`, \`BreadcrumbList\` | Programmatic generator (\`scripts/seo-generator/generate-seo-pages.mjs\`) |
| \`/blog\` | Editorial Resource Hub (Alias) | \`index, follow\` | \`CollectionPage\`, \`BreadcrumbList\` | Pre-rendered (\`public/blog/index.html\`) |
| \`/resources\` | Editorial Resource Hub (Canonical) | \`index, follow\` | \`CollectionPage\`, \`BreadcrumbList\` | Pre-rendered (\`public/resources/index.html\`) |
| \`/blog/:slug\` | Blog / Guide Detail (Mirror) | \`index, follow\` | \`BlogPosting\`, \`BreadcrumbList\`, \`FAQPage\` | Pre-rendered (33 static pages) |
| \`/resources/:slug\` | Blog / Guide Detail (Canonical) | \`index, follow\` | \`BlogPosting\`, \`BreadcrumbList\`, \`FAQPage\` | Pre-rendered (33 static pages) |
| \`/companies\` | AEC Employers Directory | \`index, follow\` | \`CollectionPage\` | Client SPA |
| \`/for-employers\` | Recruiter / Employer Landing | \`index, follow\` | \`WebPage\` | Client SPA |
| \`/auth/*\` | Authentication & Login Flows | \`noindex, nofollow\` | None | Excluded from Sitemaps |
| \`/talent/*\` | Talent Dashboard & Profile | \`noindex, nofollow\` | None | Protected Route |
| \`/company/*\` | Employer Dashboard & Job Postings | \`noindex, nofollow\` | None | Protected Route |

---

## 3. Data Quality & Content Inventory

### 3.1 Blog & Editorial Knowledge Base
- **Total Published Posts in Database:** 33 posts
- **Master Prompt Pillar Articles:** 30 posts (complete coverage across BIM, Civil, Mechanical, Electrical, MEP, Structural, Construction Management, and Top Metro Hubs)
- **Pre-existing Platform Guides:** 3 posts (BIM Skills for Civil, Architect Talent Profile, Hire AEC Professionals Faster)
- **Content Fields Populated:** All 33 posts contain:
  - Valid ASCII slug
  - SEO Title (50-65 chars, formatted with \`| Castallio One\`)
  - Meta Description (140-165 chars, factual, unique)
  - Primary & Secondary keywords
  - Topic cluster & category tags
  - Excerpt & full HTML body
  - Minimum 2 visible FAQs per article
  - Internal job links pointing to real job discovery filters
  - Authoritative external citations (buildingSMART, Autodesk, NCS India, BIS, ISHRAE)
  - Estimated reading time and word counts (1,000 to 1,800 words)

### 3.2 Job Vacancies Data Model
- **Database Table:** \`jobs\`
- **Mandatory Fields for Google Jobs:** \`id\`, \`title\`, \`description\`, \`employment_type\`, \`location\`, \`created_at\`, \`status\`.
- **Hiring Employer:** Linked to \`companies\` table; verified employer identity rendered in schema.
- **Salary Data:** Formatted as \`baseSalary\` (INR) ONLY when provided by the employer; omitted when absent to strictly prevent Google spam penalties.
- **Expiration Policy:** Jobs marked \`closed\` or \`filled\` omit active \`JobPosting\` schema to eliminate dead clicks.

---

## 4. Search & Analytics Integration Baseline

| Integration / Service | Current State | Connection Action Required |
|---|---|---|
| **Google Search Console** | \`NEEDS_OWNER_ACCESS\` | Add TXT record to DNS for \`castallioone.com\` (Domain Property) |
| **Bing Webmaster Tools** | \`NEEDS_OWNER_ACCESS\` | Verify via GSC import or DNS meta verification; enable IndexNow |
| **Google Cloud (Indexing API)** | Ready in Code | Service Account credentials (\`GOOGLE_APPLICATION_CREDENTIALS\`) required for live push |
| **Google Analytics 4** | Configured in App | Verify stream measurement ID in production env |
| **Google Play Console** | Ready in Package | Package ID \`com.castallioone.app\` ASO listing copy prepared for submission |

---

## 5. Verification Checkpoints

1. **Build Status:** \`tsc -b && vite build\` compiles cleanly with zero TypeScript errors.
2. **Sitemaps:**
   - \`public/sitemap-index.xml\` references \`sitemap-1.xml\` and \`sitemap-blogs.xml\`.
   - \`public/sitemap-blogs.xml\` lists all 33 static blog URLs.
3. **AI Discovery:**
   - \`public/llms.txt\` contains markdown directory of all 30 AEC guides for AI search engines.

