# Castallio One — SEO, AEO, GEO & Google Jobs Implementation Plan

**Document:** \`docs/seo/implementation-plan.md\`  
**Target Domain:** \`https://castallioone.com\`  
**Version:** 2.0 (Phased P0 to P3 Execution Roadmap)  

---

## 1. Plan Overview & Principles

This implementation plan establishes Castallio One as India's premier, technically authoritative job discovery and career intelligence engine for Architecture, Engineering & Construction (AEC).

### Strict Safety & Evidence Guardrails
1. **Never fabricate numbers**: No synthetic job counts, fake salary averages, or unverified keyword search volumes.
2. **Truthful zero states**: When a location/role has 0 open jobs, the platform states zero plainly and provides related options.
3. **No black-hat link schemes**: Link earning is strictly editorial, based on high-value tools, guides, and college career cell partnerships.
4. **Google Search Essentials & JobPosting compliance**: Schema markup mirrors visible page text 1:1.

---

## 2. Phase P0: Foundation & Current Page Repair

**Objective:** Ensure every public route is indexable, valid, secure, and resilient to SPA crawlability bottlenecks.

| Milestone | Key Tasks | Files Involved | Status |
|---|---|---|---|
| **P0.1 Brand & Domain Canonicalization** | Standardize canonical host to \`https://castallioone.com\`; ensure all static files and metadata link consistently without www/non-www loops. | \`index.html\`, \`scripts/seo-generator/\` | **COMPLETED** |
| **P0.2 Prerendered Static Generation** | Build automated Node.js generators that read Supabase data and compile crawlable static HTML files with pre-rendered meta, H1, body, and schema. | \`scripts/seo-generator/generate-blog-pages.mjs\`, \`scripts/seo-generator/generate-seo-pages.mjs\` | **COMPLETED** |
| **P0.3 XML Sitemap Index & Sharding** | Implement \`sitemap-index.xml\` linking to sharded sitemaps (\`sitemap-1.xml\` for jobs, \`sitemap-blogs.xml\` for editorial). | \`public/sitemap-index.xml\`, \`public/sitemap-blogs.xml\` | **COMPLETED** |
| **P0.4 Robots.txt Configuration** | Protect private routes (\`/talent/*\`, \`/company/*\`, \`/auth/*\`) while granting full access to search and AI crawlers with explicit sitemap directive. | \`public/robots.txt\` | **COMPLETED** |

---

## 3. Phase P1: Google Jobs Integration & Job Detail Engine

**Objective:** Maximize Google Jobs rich-result eligibility for every legitimate, open AEC vacancy.

| Milestone | Key Tasks | Files Involved | Status |
|---|---|---|---|
| **P1.1 Individual Job URLs** | Canonical URL format: \`/job/{job-slug}-{job-id}\` ensuring direct public access to full job descriptions without mandatory login barriers. | \`src/App.tsx\`, \`src/pages/JobDetail.tsx\` | **COMPLETED** |
| **P1.2 Schema.org JobPosting Generator** | Inject verified JobPosting schema: \`title\`, \`description\` (sanitized HTML), \`datePosted\`, \`employmentType\`, \`hiringOrganization\`, and worksite \`jobLocation\`. | \`scripts/seo-generator/generate-seo-pages.mjs\` | **COMPLETED** |
| **P1.3 Strict Schema Isolation** | Enforce rule: \`JobPosting\` JSON-LD appears ONLY on individual job pages, NEVER on search results, category hubs, or blog posts. | \`scripts/seo-generator/generate-blog-pages.mjs\` | **COMPLETED** |
| **P1.4 Expired Job Handling** | Automatically drop \`JobPosting\` schema when status changes from \`open\` to \`closed\` or \`filled\`, preventing dead-click penalties. | Job status pipeline & database triggers | **COMPLETED** |
| **P1.5 Google Indexing API Adapter** | Adapter for \`POST https://indexing.googleapis.com/v3/urlNotifications:publish\` ready for service account activation. | \`scripts/seo-generator/\`, \`docs/seo/gsc-setup.md\` | **READY FOR ACCESS** |

---

## 4. Phase P2: Local & AEC Role Taxonomy Engine

**Objective:** Programmatic landing pages covering 28 Indian States, 8 UTs, and specialized AEC disciplines.

| Milestone | Key Tasks | Files Involved | Status |
|---|---|---|---|
| **P2.1 Geographic Coverage** | Normalized taxonomy covering all 28 states, 8 Union Territories, and 280 verified seed cities/towns with verified geodata and alias handling (e.g. Bangalore -> Bengaluru). | \`scripts/seo-generator/generate-seo-pages.mjs\` | **COMPLETED** |
| **P2.2 AEC Job Role Architecture** | Normalized hierarchy across 7 major clusters: BIM/VDC, Civil/Site/Structural, Architecture/Interiors, Mechanical/HVAC, Electrical/ELV/MEP, Freshers, and Construction Tech. | \`scripts/seo-generator/seo-config.mjs\` | **COMPLETED** |
| **P2.3 Honest Zero-Inventory Handling** | Programmatic location-role pages evaluate live open jobs: if count is 0, display an honest zero notice, offer job alert subscriptions, and set \`noindex, follow\`. | Page templates | **COMPLETED** |

---

## 5. Phase P3: AEO, GEO, Content Authority & App Growth

**Objective:** Answer Engine Optimization, Generative Engine Optimization, and Google Play Store growth.

| Milestone | Key Tasks | Files Involved | Status |
|---|---|---|---|
| **P3.1 30 Master Pillar Guides** | Ingest, format, and static-prerender all 30 AEC comprehensive career and technical guides into Supabase and \`public/resources/[slug]\`. | \`public/blog/*\`, \`public/resources/*\`, \`blogs.json\` | **COMPLETED** |
| **P3.2 Answer Engine Optimization (AEO)** | Structured visible FAQ sections on every guide answering common AEC candidate queries; \`FAQPage\` schema added for semantic parsing. | \`scripts/seo-generator/generate-blog-pages.mjs\` | **COMPLETED** |
| **P3.3 Generative Engine Optimization (GEO)** | Deploy \`public/llms.txt\` with clean semantic Markdown categorization of all guides for AI retrieval systems (ChatGPT Search, Perplexity, Claude, Gemini). | \`public/llms.txt\` | **COMPLETED** |
| **P3.4 Play Store ASO Strategy** | Prepare production-ready Play Store title (≤30 chars), short description (≤80 chars), long description (≤4000 chars), and screenshot strategy. | \`docs/seo/aso-play-store.md\` | **COMPLETED** |
| **P3.5 White-Hat Link Earning** | Author linkable assets plan and university outreach tracking system targeting college placement cells and engineering societies. | \`docs/seo/linkable-assets-plan.md\`, \`docs/seo/link-outreach-tracker.csv\` | **COMPLETED** |
| **P3.6 Verification & Audit Suite** | Complete automated build and validation reports documenting test results, schema integrity, and console setup guides. | \`docs/seo/verification-report.md\` | **COMPLETED** |

