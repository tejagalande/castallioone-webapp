# Castallio One — Structured Data Entity Graph Specifications (JSON-LD)

**Document:** \`docs/seo/structured-data.md\`  
**Target Domain:** \`https://castallioone.com\`  
**Standards Body:** [Schema.org](https://schema.org) & [Google Search Central Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

---

## 1. Global Entities & Architectural Rules

### 1.1 Strict Entity Isolation Policy
1. **\`JobPosting\` schema appears ONLY on individual job pages (\`/job/{slug}-{id}\`)**:
   - NEVER add \`JobPosting\` to search results, category pages, city directories, or blog posts.
   - Doing so violates Google's Spam Policies for structured data and triggers rich result penalties.
2. **Text / Schema Parity**:
   - Every value in the JSON-LD payload must be visible to a human reader on the page.
   - Never inject hidden keywords or fake salaries into schema.
3. **Canonical Identification (\`@id\`)**:
   - Use persistent URIs with \`#organization\` or \`#website\` anchors to enable search engines to build an interconnected entity knowledge graph.

---

## 2. Organization Schema (Homepage & Sitewide Entity)

Rendered on the root layout / homepage to declare brand identity, verified logos, and official company attributes.

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://castallioone.com/#organization",
  "name": "Castallio One",
  "alternateName": "CastallioOne",
  "url": "https://castallioone.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://castallioone.com/castallio-logo.png",
    "width": "512",
    "height": "512"
  },
  "description": "AI-powered hiring and job discovery platform for Architecture, Engineering & Construction (AEC) professionals across India.",
  "sameAs": [
    "https://www.linkedin.com/company/castallioone",
    "https://twitter.com/castallioone",
    "https://play.google.com/store/apps/details?id=com.castallioone.app"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://castallioone.com/contact"
  }
}
\`\`\`

---

## 3. BlogPosting Schema (Editorial & Career Guides)

Rendered on each guide under \`/resources/{slug}\` and \`/blog/{slug}\`.

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://castallioone.com/resources/how-to-find-bim-engineer-jobs-in-india"
  },
  "headline": "How to Find BIM Engineer Jobs in India",
  "description": "Explore BIM engineer jobs in India with practical skills, portfolio tips, interview preparation and safer applications. A focused AEC career guide.",
  "image": "https://castallioone.com/images/blog/bim-careers.jpg",
  "author": {
    "@type": "Organization",
    "name": "Castallio One AEC Career Editorial Team",
    "url": "https://castallioone.com"
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://castallioone.com/#organization",
    "name": "Castallio One",
    "logo": {
      "@type": "ImageObject",
      "url": "https://castallioone.com/castallio-logo.png"
    }
  },
  "datePublished": "2026-03-01T08:00:00+05:30",
  "dateModified": "2026-03-01T08:00:00+05:30",
  "articleSection": "BIM",
  "keywords": "BIM engineer jobs in India, BIM jobs, Revit jobs, BIM engineer career, BIM hiring India",
  "wordCount": 1450,
  "inLanguage": "en-US"
}
\`\`\`

---

## 4. BreadcrumbList Schema (Navigation Hierarchy)

Rendered on all interior pages to facilitate breadcrumb rich results in Google search snippets.

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://castallioone.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Resources",
      "item": "https://castallioone.com/resources"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "How to Find BIM Engineer Jobs in India",
      "item": "https://castallioone.com/resources/how-to-find-bim-engineer-jobs-in-india"
    }
  ]
}
\`\`\`

---

## 5. FAQPage Schema (Answer Engine Optimization)

Rendered when an article features structured Question and Answer sections. Answers match visible HTML copy.

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What software skills are most critical for BIM Engineer jobs in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Employers primarily look for demonstrated expertise in Autodesk Revit (Architecture/Structure/MEP), Navisworks for clash coordination, and familiarity with IFC standards and common data environments (CDE)."
      }
    },
    {
      "@type": "Question",
      "name": "Do Indian employers require international BIM certification?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "While certifications from Autodesk or buildingSMART can validate proficiency, Indian AEC hiring managers prioritize verified project portfolios showing real drawing sheets, modeling LODs, and clash resolution workflows."
      }
    }
  ]
}
\`\`\`

---

## 6. JobPosting Schema (Individual Real Jobs Only)

Applied exclusively to single active job detail pages (\`/job/{slug}-{id}\`).

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "BIM Modeler - Electrical & MEP",
  "description": "<p>We are seeking a BIM Modeler with 2+ years of experience in Revit MEP modeling, cable tray layouts, and lighting fixtures...</p>",
  "datePosted": "2026-03-01T10:00:00+05:30",
  "validThrough": "2026-04-30T23:59:59+05:30",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Pinnacle Engineering Services",
    "sameAs": "https://example.com",
    "logo": "https://castallioone.com/companies/pinnacle.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Pune",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "INR",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 450000,
      "maxValue": 650000,
      "unitText": "YEAR"
    }
  },
  "identifier": {
    "@type": "PropertyValue",
    "name": "Pinnacle Engineering Services",
    "value": "JOB-PNQ-2026-089"
  },
  "directApply": false
}
\`\`\`

> [!NOTE]
> If \`baseSalary\` is not supplied by the employer, the entire \`baseSalary\` block is omitted. Never generate synthetic salary numbers.

---

## 7. QA & Testing Procedures

1. **Schema Markup Validator (validator.schema.org):** Tests syntax conformance.
2. **Google Rich Results Test (search.google.com/test/rich-results):** Verifies search feature eligibility.
3. **Parity Check:** Run automated tests to assert that every string in JSON-LD is present in the rendered HTML body.

