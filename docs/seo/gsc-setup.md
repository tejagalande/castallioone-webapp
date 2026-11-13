# Castallio One — Search Console, Bing & Google Indexing API Setup Guide

**Document:** \`docs/seo/gsc-setup.md\`  
**Target Domain:** \`https://castallioone.com\`  
**Status:** \`NEEDS_OWNER_ACCESS\` (Requires DNS & Google Cloud Console Admin Permissions)

---

## 1. Google Search Console (GSC) Domain Property Verification

### 1.1 Step-by-Step DNS Verification
1. Log in to [Google Search Console](https://search.google.com/search-console).
2. Choose **Domain** property (enter \`castallioone.com\` without \`https://\` or \`www\`).
3. Copy the TXT verification record provided by Google (e.g. \`google-site-verification=...\`).
4. Log in to your DNS provider (Cloudflare, GoDaddy, Namecheap, AWS Route 53, etc.).
5. Add a **TXT Record**:
   - **Name / Host:** \`@\` (or \`castallioone.com\`)
   - **Type:** \`TXT\`
   - **Value:** \`google-site-verification=[YOUR_TOKEN_HERE]\`
   - **TTL:** Auto or 3600
6. Wait 5-10 minutes and click **Verify** in Search Console.

### 1.2 Sitemap Submission
Once verified, navigate to **Sitemaps** in the left menu:
- Submit the primary index: \`https://castallioone.com/sitemap-index.xml\`
- Confirm that Google discovers child sitemaps:
  - \`https://castallioone.com/sitemap-1.xml\` (Job vacancies)
  - \`https://castallioone.com/sitemap-blogs.xml\` (Editorial & career guides)

---

## 2. Bing Webmaster Tools & IndexNow Integration

### 2.1 Bing Verification
1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Click **Import from Google Search Console** (recommended for instant automatic verification).
3. If importing is not possible, add a meta tag or CNAME record following Bing's instructions.
4. Submit sitemap: \`https://castallioone.com/sitemap-index.xml\`.

### 2.2 IndexNow Setup
IndexNow instantly notifies Bing and Yandex when new URLs are published or updated:
1. Generate an IndexNow API Key (a 32-character hex key).
2. Place the key file at root: \`public/[YOUR_API_KEY].txt\` containing only the key string.
3. Test manual ping:
\`\`\`bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "host": "castallioone.com",
    "key": "[YOUR_API_KEY]",
    "keyLocation": "https://castallioone.com/[YOUR_API_KEY].txt",
    "urlList": [
      "https://castallioone.com/resources/how-to-find-bim-engineer-jobs-in-india"
    ]
  }'
\`\`\`

---

## 3. Google Cloud Service Account for Google Indexing API

The **Google Indexing API** allows direct real-time notification to Google when individual \`JobPosting\` URLs are created, updated, or deleted.

> [!CAUTION]
> **Permitted Scope:** The Google Indexing API is strictly permitted **ONLY for URLs with \`JobPosting\` markup**. NEVER submit blog pages, category hubs, or the homepage via the Indexing API. Violations can revoke API access.

### 3.1 Google Cloud Setup Steps
1. Navigate to [Google Cloud Console](https://console.cloud.google.com).
2. Create or select project: \`castallioone-indexing\`.
3. Enable the **Web Search Indexing API**:
   - Go to **APIs & Services > Library**.
   - Search for **Web Search Indexing API** and click **Enable**.
4. Create a Service Account:
   - Go to **APIs & Services > Credentials > Create Credentials > Service Account**.
   - Service account name: \`castallioone-job-indexer\`.
   - Role: \`Project > Viewer\` or leave blank.
5. Create a Key:
   - Click into the newly created service account.
   - Go to the **Keys** tab > **Add Key > Create new key > JSON**.
   - Download the key file securely (e.g. \`service-account.json\`).

### 3.2 Authorize Service Account in Google Search Console
1. Open Google Search Console > **Settings > Users and permissions**.
2. Click **Add User**.
3. Enter the email address of the service account (e.g. \`castallioone-job-indexer@castallioone-indexing.iam.gserviceaccount.com\`).
4. Set Permission to **Owner** (Google requires Owner permission to publish indexing notifications on behalf of the domain).
5. Click **Add**.

### 3.3 Environment Variable Configuration
Store the service account credentials in your secure production environment variables (e.g. Supabase Edge Functions or backend environment):
\`\`\`env
GOOGLE_INDEXING_CLIENT_EMAIL="castallioone-job-indexer@castallioone-indexing.iam.gserviceaccount.com"
GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
\`\`\`

---

## 4. Operational Quota Management

- **Default Google Quota:** 200 publish requests per day per project.
- **Priority Rules:**
  1. *Priority 1 (URL_DELETED):* Expired or filled jobs removed from Google Jobs to eliminate bad user experience.
  2. *Priority 2 (URL_UPDATED):* Newly posted active vacancies with valid \`JobPosting\` schema.
  3. Throttled with backoff and retry queue.

