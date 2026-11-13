# Castallio One — Google Play Store App Store Optimization (ASO) Strategy

**Document:** \`docs/seo/aso-play-store.md\`  
**Target Package ID:** \`com.castallioone.app\`  
**Store Platform:** Google Play Store (Android)  
**Guidelines Reference:** [Google Play Metadata Policy](https://support.google.com/googleplay/android-developer/answer/9898842) & [Store Listing Limits](https://support.google.com/googleplay/android-developer/answer/9859152)

---

## 1. Production-Ready Store Listing Metadata

### 1.1 App Title (Max 30 characters)
\`\`\`text
Castallio One: AEC Jobs
\`\`\`
*Character count: 23 / 30. Clear, descriptive, compliant with Google Play title length restrictions.*

### 1.2 Short Description (Max 80 characters)
\`\`\`text
Find Civil, BIM, MEP, Architecture and Engineering jobs across India.
\`\`\`
*Character count: 68 / 80. Highlights primary disciplines, target geography, and clear value proposition.*

### 1.3 Full Description (Max 4,000 characters)
\`\`\`text
Discover Architecture, Engineering & Construction (AEC) career opportunities across India with Castallio One.

Castallio One connects engineers, architects, designers, and site supervisors directly with hiring employers in civil infrastructure, MEP building services, and digital construction.

EXPLORE SPECIALIZED AEC ROLES:
• BIM & Digital Construction: BIM Engineer, BIM Modeler, Revit Architect, Navisworks Clash Coordinator, Tekla Steel Detailer, 4D BIM Planner.
• Civil & Infrastructure: Site Engineer, Civil Project Engineer, Quality Control (QA/QC), Quantity Surveyor, Estimation & Billing, Land Surveyor, Highway & Bridge Engineer.
• MEP & Building Services: MEP Coordinator, HVAC Design Engineer, Electrical Site Engineer, Plumbing & Fire Fighting Engineer, ELV & BMS Engineer.
• Architecture & Planning: Junior Architect, Architectural Designer, 3D Visualizer, Interior Design Execution, Landscape Architect.
• Freshers & Graduates: Entry-level openings, graduate trainee engineer programs, and diploma apprentice opportunities.

KEY APP FEATURES:
• Focused Search: Filter genuine vacancies by role discipline, verified city location, experience tier, and software requirements.
• Verified Job Details: View complete job responsibilities, project types, employer information, and qualification criteria.
• Direct Applications: Apply with your structured profile and project portfolio directly from your mobile device.
• Job Alerts: Set notification alerts for new openings in your city and discipline (Pune, Mumbai, Bengaluru, Hyderabad, Delhi NCR, Chennai, Ahmedabad, and more).
• Employer Direct Connect: Direct communication with verified recruiters and engineering consultants.

TRUTHFUL & EVIDENCE-BASED:
Job availability varies by city and industry demand. Vacancies are posted and updated directly by participating employers. Castallio One does not guarantee placement or charge candidate registration fees.

Download Castallio One today to explore AEC opportunities matched to your technical skills.
\`\`\`
*Character count: 1,940 / 4,000. Factual, professional, no spammy buzzwords ("#1 app", "100% placement"), and fully compliant with Google Play Developer Policies.*

---

## 2. High-Intent ASO Keyword Universe

| Keyword Term | Intent Category | Placement in Listing |
|---|---|---|
| **AEC jobs** | Primary Brand & Industry | App Title & Short Description |
| **BIM engineer jobs** | Specialized Role Intent | Short & Full Description |
| **civil engineering jobs** | High-Volume Core Discipline | Short & Full Description |
| **Revit jobs** | Software Skill Intent | Full Description |
| **MEP engineer jobs** | Core Discipline | Short & Full Description |
| **architecture jobs in India** | Discipline & Geo | Full Description |
| **site engineer vacancy** | Core Construction Discipline | Full Description |
| **HVAC design jobs** | Specialized Sub-discipline | Full Description |
| **civil fresher jobs** | Experience Tier Intent | Full Description |

---

## 3. Screenshot & Creative Asset Plan (6-8 Mobile Screens)

1. **Screen 1 (Search & Discovery):** Clean interface showing search bar with chips for *BIM, Civil Site, MEP, Architecture*. Caption: *"Search 30+ AEC Specialized Disciplines"*.
2. **Screen 2 (City Filter):** Interactive city selector showing real vacancies across *Pune, Bengaluru, Mumbai, Hyderabad, Delhi NCR*. Caption: *"Find Openings in Top Construction Hubs"*.
3. **Screen 3 (Job Detail View):** Clean card showing full job description, software requirements (Revit, AutoCAD), and company overview. Caption: *"Verified Job Requirements & Responsibilities"*.
4. **Screen 4 (Candidate Talent Profile):** Profile screen showing candidate skills, software badges, and uploaded drawing sheets/portfolio. Caption: *"Showcase Your Projects & Technical Skills"*.
5. **Screen 5 (Application Flow):** Simple 1-click apply confirmation with resume attachment. Caption: *"Apply Directly to Verified Engineering Employers"*.
6. **Screen 6 (Job Alerts):** Mobile push notification preview for newly posted matching vacancies. Caption: *"Instant Alerts for New Open Roles"*.

---

## 4. Android App Links & Deep Linking Setup

To ensure seamless browser-to-app routing without redirecting search bot crawlers:
- **Domain Verification:** \`https://castallioone.com/.well-known/assetlinks.json\`
- **Assetlinks Specification:**
\`\`\`json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.castallioone.app",
      "sha256_cert_fingerprints": [
        "PASTE_RELEASE_KEYSTORE_SHA256_FINGERPRINT_HERE"
      ]
    }
  }
]
\`\`\`
- **Route Mapping:**
  - Web: \`https://castallioone.com/job/{slug}-{id}\` -> App: \`castallioone://job/{id}\`
  - Deep link fallback: If app is installed, open directly; if uninstalled, render the full web job page with an optional subtle "Open in App" banner. **Googlebot is never forced or redirected to the Play Store.**

