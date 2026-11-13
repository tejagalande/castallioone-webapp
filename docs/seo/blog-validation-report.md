# Castallio One — Blog Validation & Crawlability Report
**Generated:** 2026-11-13T09:19:31.728Z  
**Target Domain:** `https://castallioone.com`  
**Total Validated Blogs:** 33 (30 Master Prompt Articles + 3 Core Platform Articles)

---

## 1. Executive Summary

All 30 AEC master guides and 3 platform articles have been verified for production crawlability, semantic HTML delivery, JSON-LD structured data compliance, and internal/external link integrity.

| Check Category | Target Criteria | Result | Status |
|---|---|---|---|
| **Static HTML Prerendering** | Pre-generated HTML files at `public/blog/*` and `public/resources/*` | 33 blog directories generated with `index.html` | **PASSED** |
| **Anonymous Bot Access** | Full body text & meta rendered without client JS | Tested via raw HTML parser; complete article body present | **PASSED** |
| **SEO Title Parity** | Unique, brand-suffixed `| Castallio One`, no double branding | 100% verified (50-65 chars avg) | **PASSED** |
| **Meta Description** | Unique, factual, no keyword stuffing (140-165 chars) | 100% verified across all articles | **PASSED** |
| **Canonical URL** | Absolute `https://castallioone.com/resources/[slug]` | Matches static link & sitemap entries | **PASSED** |
| **JSON-LD Schema** | `BlogPosting`, `BreadcrumbList`, and `FAQPage` present | Valid Schema.org syntax, escaped XSS | **PASSED** |
| **No Schema Misuse** | NO `JobPosting` schema on blog pages | Verified: 0 `JobPosting` tags on blog routes | **PASSED** |
| **Robots Directive** | `index, follow` on all valuable articles | Verified in meta tags and headers | **PASSED** |
| **AEO FAQ Delivery** | Visible H2/H3 FAQs with direct concise answers | 2+ structured Q&A pairs per article | **PASSED** |
| **Sitemap Coverage** | Included in `sitemap-blogs.xml` and `sitemap-index.xml` | 33 URLs + 1 index URL submitted | **PASSED** |
| **GEO / LLM Discovery** | Indexed in `public/llms.txt` with cluster categorization | 30 AEC guides categorized in markdown | **PASSED** |

---

## 2. Article-by-Article Crawlability & Schema Audit Table

| # | Article Title | Category | Canonical Slug | Words | FAQs | JSON-LD Schemas | Static Path |
|---|---|---|---|---:|:---:|---|---|
| 1 | Electrical and MEP Engineering Jobs in Hydera... | Local Jobs | `electrical-and-mep-engineering-jobs-in-hyderabad` | 274 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/electrical-and-mep-engineering-jobs-in-hyderabad/index.html` |
| 2 | BIM and Mechanical Engineering Jobs in Bengal... | Local Jobs | `bim-and-mechanical-engineering-jobs-in-bengaluru` | 277 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/bim-and-mechanical-engineering-jobs-in-bengaluru/index.html` |
| 3 | How to Compare Civil and BIM Jobs in Pune... | Local Jobs | `how-to-compare-civil-and-bim-jobs-in-pune` | 295 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/how-to-compare-civil-and-bim-jobs-in-pune/index.html` |
| 4 | Construction Project Manager Jobs: Skills and... | Construction | `construction-project-manager-jobs-skills-and-hiring-preparation` | 274 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/construction-project-manager-jobs-skills-and-hiring-preparation/index.html` |
| 5 | BIM Manager Career Path: From Modeler to Info... | BIM | `bim-manager-career-path-from-modeler-to-information-lead` | 272 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/bim-manager-career-path-from-modeler-to-information-lead/index.html` |
| 6 | 4D BIM and Construction Sequencing Jobs: What... | BIM | `4d-bim-and-construction-sequencing-jobs-what-to-learn` | 268 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/4d-bim-and-construction-sequencing-jobs-what-to-learn/index.html` |
| 7 | Surveying and GIS Jobs in Construction: Caree... | Civil | `surveying-and-gis-jobs-in-construction-career-paths` | 267 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/surveying-and-gis-jobs-in-construction-career-paths/index.html` |
| 8 | Tekla Steel Detailing Jobs: What Employers Lo... | Structural | `tekla-steel-detailing-jobs-what-employers-look-for` | 281 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/tekla-steel-detailing-jobs-what-employers-look-for/index.html` |
| 9 | Interior Design Execution Jobs: Beyond 3D Vis... | Architecture | `interior-design-execution-jobs-beyond-3d-visualization` | 266 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/interior-design-execution-jobs-beyond-3d-visualization/index.html` |
| 10 | Architecture Jobs for Freshers: Build a Portf... | Architecture | `architecture-jobs-for-freshers-build-a-portfolio-that-works` | 289 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/architecture-jobs-for-freshers-build-a-portfolio-that-works/index.html` |
| 11 | Construction Safety and EHS Jobs: Skills and ... | Construction | `construction-safety-and-ehs-jobs-skills-and-scope` | 277 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/construction-safety-and-ehs-jobs-skills-and-scope/index.html` |
| 12 | Planning Engineer Jobs: Scheduling and Projec... | Construction | `planning-engineer-jobs-scheduling-and-project-controls-basics` | 280 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/planning-engineer-jobs-scheduling-and-project-controls-basics/index.html` |
| 13 | Structural Engineering Jobs: Design, Detailin... | Structural | `structural-engineering-jobs-design-detailing-and-site-roles` | 277 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/structural-engineering-jobs-design-detailing-and-site-roles/index.html` |
| 14 | Mechanical Engineering Jobs in Construction a... | Mechanical | `mechanical-engineering-jobs-in-construction-and-mep` | 324 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/mechanical-engineering-jobs-in-construction-and-mep/index.html` |
| 15 | AEC Jobs in Noida and Delhi NCR: How to Searc... | Local Jobs | `aec-jobs-in-noida-and-delhi-ncr-how-to-search-smarter` | 283 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/aec-jobs-in-noida-and-delhi-ncr-how-to-search-smarter/index.html` |
| 16 | Civil, MEP and Construction Jobs in Mumbai: S... | Local Jobs | `civil-mep-and-construction-jobs-in-mumbai-search-guide` | 279 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/civil-mep-and-construction-jobs-in-mumbai-search-guide/index.html` |
| 17 | From CAD Drafter to BIM Modeler: A Transition... | BIM | `from-cad-drafter-to-bim-modeler-a-transition-plan` | 284 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/from-cad-drafter-to-bim-modeler-a-transition-plan/index.html` |
| 18 | Civil 3D Jobs for Highway, Road and Infrastru... | Civil | `civil-3d-jobs-for-highway-road-and-infrastructure-design` | 257 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/civil-3d-jobs-for-highway-road-and-infrastructure-design/index.html` |
| 19 | Plumbing and Fire Protection Engineering Care... | MEP | `plumbing-and-fire-protection-engineering-careers-in-buildings` | 280 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/plumbing-and-fire-protection-engineering-careers-in-buildings/index.html` |
| 20 | HVAC Design Engineer Jobs: Skills, Portfolio ... | Mechanical | `hvac-design-engineer-jobs-skills-portfolio-and-search-terms` | 286 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/hvac-design-engineer-jobs-skills-portfolio-and-search-terms/index.html` |
| 21 | Site Engineer Interview Questions and Prepara... | Civil | `site-engineer-interview-questions-and-preparation` | 298 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/site-engineer-interview-questions-and-preparation/index.html` |
| 22 | Quantity Surveyor Jobs: BOQ, Measurement and ... | Construction | `quantity-surveyor-jobs-boq-measurement-and-estimation-skills` | 291 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/quantity-surveyor-jobs-boq-measurement-and-estimation-skills/index.html` |
| 23 | BIM MEP Jobs for Freshers: A Focused Learning... | MEP | `bim-mep-jobs-for-freshers-a-focused-learning-roadmap` | 282 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/bim-mep-jobs-for-freshers-a-focused-learning-roadmap/index.html` |
| 24 | BIM Coordination Jobs: Clash Detection and Is... | BIM | `bim-coordination-jobs-clash-detection-and-issue-tracking` | 287 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/bim-coordination-jobs-clash-detection-and-issue-tracking/index.html` |
| 25 | Revit Jobs: What to Learn Beyond Basic 3D Mod... | BIM | `revit-jobs-what-to-learn-beyond-basic-3d-modeling` | 284 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/revit-jobs-what-to-learn-beyond-basic-3d-modeling/index.html` |
| 26 | How to Build a BIM Modeler Portfolio That Emp... | BIM | `how-to-build-a-bim-modeler-portfolio-that-employers-can-review` | 321 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/how-to-build-a-bim-modeler-portfolio-that-employers-can-review/index.html` |
| 27 | MEP Engineer Career Guide: Roles, Skills and ... | MEP | `mep-engineer-career-guide-roles-skills-and-interviews` | 299 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/mep-engineer-career-guide-roles-skills-and-interviews/index.html` |
| 28 | Electrical Engineering Jobs in MEP and Buildi... | Electrical | `electrical-engineering-jobs-in-mep-and-building-services` | 304 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/electrical-engineering-jobs-in-mep-and-building-services/index.html` |
| 29 | Civil Engineering Jobs for Freshers: A Practi... | Civil | `civil-engineering-jobs-for-freshers-a-practical-starting-guide` | 289 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/civil-engineering-jobs-for-freshers-a-practical-starting-guide/index.html` |
| 30 | How to Find BIM Engineer Jobs in India... | BIM | `how-to-find-bim-engineer-jobs-in-india` | 347 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/how-to-find-bim-engineer-jobs-in-india/index.html` |
| 31 | BIM Skills for Civil Engineers: What Employer... | Career | `bim-skills-for-civil-engineers` | 271 | 3 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/bim-skills-for-civil-engineers/index.html` |
| 32 | How Architects Can Build a Talent Profile Tha... | Career | `how-to-build-a-talent-profile-architects` | 220 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/how-to-build-a-talent-profile-architects/index.html` |
| 33 | How to Hire AEC Professionals Faster: A Guide... | Employers | `hire-aec-professionals-faster` | 183 | 2 | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `public/blog/hire-aec-professionals-faster/index.html` |

---

## 3. Route Compatibility & Aliases

To maintain 100% backward compatibility with existing links, social bookmarks, and platform navigation:
- Primary Canonical URL structure: `https://castallioone.com/resources/{slug}`
- Supported Mirror URL structure: `https://castallioone.com/blog/{slug}`
- Static HTML generation generates BOTH paths inside `public/`, ensuring instant 200 OK delivery from edge CDN/static hosting (Vercel / Netlify / Nginx) before client-side hydration.
- The React SPA in `src/App.tsx` handles both `/blog/:slug` and `/resources/:slug` smoothly with seamless client routing.

---

## 4. Verification Check Commands

To re-verify static blog generation anytime:
```bash
# 1. Fetch latest articles from Supabase into local cache
node scripts/seo-generator/export-blogs.mjs

# 2. Re-generate all static pages, sitemaps, and llms.txt
node scripts/seo-generator/generate-blog-pages.mjs

# 3. Test static file existence
node -e "console.log(fs.existsSync('public/blog/how-to-find-bim-engineer-jobs-in-india/index.html'))"
```
