#!/usr/bin/env node
/**
 * Castallio One - Static Blog Page, Sitemap & GEO Generator
 * ---------------------------------------------------------
 * Generates static, crawlable HTML pages for all published blogs:
 *   - public/blog/{slug}/index.html
 *   - public/blog/index.html
 *   - public/resources/{slug}/index.html (alias / hub support)
 *   - public/resources/index.html
 *   - public/sitemap-blogs.xml
 *   - Updates public/sitemap-index.xml
 *   - Updates public/llms.txt with all 30 AEC guides for AI search engines
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

const CONFIG = {
  siteName: 'Castallio One',
  baseUrl: 'https://castallioone.com',
  blogsFile: path.join(__dirname, 'blogs.json'),
  outDir: path.join(rootDir, 'public'),
  favicon: '/favicon-48x48.png',
  ogImage: '/favicon-512x512.png',
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/**
 * Lightweight Markdown to clean semantic HTML parser
 */
function renderMarkdownToHtml(markdown) {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  const out = []
  let inUl = false
  let inOl = false

  function closeLists() {
    if (inUl) {
      out.push('</ul>')
      inUl = false
    }
    if (inOl) {
      out.push('</ol>')
      inOl = false
    }
  }

  function inlineFormat(text) {
    return text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
  }

  for (let raw of lines) {
    const line = raw.trim()

    if (!line) {
      closeLists()
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      closeLists()
      out.push(`<h3>${inlineFormat(escapeHtml(line.slice(4)))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      closeLists()
      out.push(`<h2>${inlineFormat(escapeHtml(line.slice(3)))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      closeLists()
      // Skip h1 as article h1 is rendered in header template
      continue
    }

    // Unordered lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inOl) {
        out.push('</ol>')
        inOl = false
      }
      if (!inUl) {
        out.push('<ul>')
        inUl = true
      }
      const itemContent = line.slice(2).trim()
      out.push(`<li>${inlineFormat(escapeHtml(itemContent))}</li>`)
      continue
    }

    // Ordered lists (e.g. "1. ")
    const olMatch = line.match(/^\d+\.\s+(.+)$/)
    if (olMatch) {
      if (inUl) {
        out.push('</ul>')
        inUl = false
      }
      if (!inOl) {
        out.push('<ol>')
        inOl = true
      }
      out.push(`<li>${inlineFormat(escapeHtml(olMatch[1]))}</li>`)
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeLists()
      out.push(`<blockquote><p>${inlineFormat(escapeHtml(line.slice(2)))}</p></blockquote>`)
      continue
    }

    // Normal paragraph
    closeLists()
    out.push(`<p>${inlineFormat(escapeHtml(line))}</p>`)
  }

  closeLists()
  return out.join('\n')
}

/**
 * Generates an individual blog post HTML page
 */
function renderPostHtml(post, allPosts) {
  const canonicalUrl = `${CONFIG.baseUrl}/blog/${post.slug}`
  const baseTitle = post.seo_title || post.title
  const seoTitle = baseTitle.includes(CONFIG.siteName) ? baseTitle : `${baseTitle} | ${CONFIG.siteName}`
  const metaDesc = post.meta_description || post.excerpt
  const publishedDate = post.published_at ? post.published_at.slice(0, 10) : ''
  const updatedDate = post.updated_at ? post.updated_at.slice(0, 10) : publishedDate
  const isUpdated =
    post.updated_at &&
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 86400000

  // JSON-LD Graph: BlogPosting + BreadcrumbList + FAQPage
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: metaDesc,
      image: post.featured_image_url || `${CONFIG.baseUrl}${CONFIG.ogImage}`,
      author: {
        '@type': 'Person',
        name: post.author_name || CONFIG.siteName,
      },
      publisher: {
        '@type': 'Organization',
        name: CONFIG.siteName,
        url: CONFIG.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${CONFIG.baseUrl}${CONFIG.ogImage}`,
        },
      },
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      keywords: [post.primary_keyword, ...(post.secondary_keywords || [])].filter(Boolean).join(', '),
      wordCount: post.word_count || 1200,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: CONFIG.baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${CONFIG.baseUrl}/blog` },
        { '@type': 'ListItem', position: 3, name: post.category || 'Career', item: `${CONFIG.baseUrl}/blog` },
        { '@type': 'ListItem', position: 4, name: post.title, item: canonicalUrl },
      ],
    },
  ]

  if (post.faq && Array.isArray(post.faq) && post.faq.length > 0) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    })
  }

  const contentHtml = renderMarkdownToHtml(post.content)

  // FAQs HTML for AEO
  let faqHtml = ''
  if (post.faq && Array.isArray(post.faq) && post.faq.length > 0) {
    const items = post.faq
      .map(
        (f) => `
        <details class="blog-faq-item">
          <summary>${escapeHtml(f.question)}</summary>
          <p>${escapeHtml(f.answer)}</p>
        </details>`
      )
      .join('')
    faqHtml = `
      <section class="blog-faq" aria-labelledby="blog-faq-title">
        <h2 id="blog-faq-title">Frequently asked questions</h2>
        ${items}
      </section>`
  }

  // Related internal links
  let internalLinksHtml = ''
  if (post.internal_links && Array.isArray(post.internal_links) && post.internal_links.length > 0) {
    const list = post.internal_links
      .map((l) => `<li><a href="${escapeHtml(l.url)}">${escapeHtml(l.label)}</a></li>`)
      .join('')
    internalLinksHtml = `
      <section class="blog-links-section" aria-labelledby="blog-related-title">
        <h3 id="blog-related-title">Related on Castallio One</h3>
        <ul>${list}</ul>
      </section>`
  }

  // External citations
  let externalLinksHtml = ''
  if (post.external_links && Array.isArray(post.external_links) && post.external_links.length > 0) {
    const list = post.external_links
      .map(
        (l) =>
          `<li><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
            l.label
          )}</a></li>`
      )
      .join('')
    externalLinksHtml = `
      <section class="blog-links-section" aria-labelledby="blog-sources-title">
        <h3 id="blog-sources-title">Sources &amp; further reading</h3>
        <ul>${list}</ul>
      </section>`
  }

  // Tags
  let tagsHtml = ''
  if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
    tagsHtml = `
      <div class="blog-tags" aria-label="Tags">
        ${post.tags.map((t) => `<span class="blog-tag">#${escapeHtml(t)}</span>`).join(' ')}
      </div>`
  }

  // Related recommended articles (same category or next posts)
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .filter((p) => p.category === post.category || true)
    .slice(0, 3)

  let relatedArticlesHtml = ''
  if (relatedPosts.length > 0) {
    const cards = relatedPosts
      .map(
        (rp) => `
        <a href="/blog/${escapeHtml(rp.slug)}" class="blog-related-card">
          <span class="blog-related-cat">${escapeHtml(rp.category)}</span>
          <h4>${escapeHtml(rp.title)}</h4>
          <span class="blog-related-time">${rp.reading_time_minutes || 5} min read →</span>
        </a>`
      )
      .join('')
    relatedArticlesHtml = `
      <section class="blog-related-articles">
        <h3>Recommended AEC Guides</h3>
        <div class="blog-related-grid">${cards}</div>
      </section>`
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(seoTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <meta name="robots" content="${escapeHtml(post.robots || 'index, follow')}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(seoTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:image" content="${escapeHtml(post.featured_image_url || `${CONFIG.baseUrl}${CONFIG.ogImage}`)}">
  <meta property="og:site_name" content="${escapeHtml(CONFIG.siteName)}">
  <meta property="article:published_time" content="${escapeHtml(post.published_at)}">
  <meta property="article:modified_time" content="${escapeHtml(post.updated_at || post.published_at)}">
  <meta property="article:section" content="${escapeHtml(post.category)}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(seoTitle)}">
  <meta name="twitter:description" content="${escapeHtml(metaDesc)}">
  <meta name="twitter:image" content="${escapeHtml(post.featured_image_url || `${CONFIG.baseUrl}${CONFIG.ogImage}`)}">

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
${JSON.stringify(graph, null, 2)}
  </script>

  <link rel="icon" type="image/png" href="${CONFIG.favicon}">
  <link rel="stylesheet" href="/assets/index-Dyr1OwUz.css" onerror="this.onerror=null;">
  <style>
    /* Standalone Bot-Safe Styling */
    body { margin: 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fdfdfd; color: #1e293b; line-height: 1.6; }
    .blog-header { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 14px 24px; position: sticky; top: 0; z-index: 50; }
    .blog-header-inner { max-width: 1040px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .blog-brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #0f172a; font-weight: 700; font-size: 17px; }
    .blog-brand-icon { width: 28px; height: 28px; border-radius: 6px; }
    .blog-brand-tag { font-size: 11px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; }
    .blog-signin-btn { background: #00418f; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13.5px; font-weight: 600; }
    .blog-article-wrap { max-width: 860px; margin: 0 auto; padding: 32px 20px 64px; }
    .blog-breadcrumb { font-size: 13px; color: #64748b; margin-bottom: 24px; display: flex; gap: 8px; align-items: center; }
    .blog-breadcrumb a { color: #00418f; text-decoration: none; }
    .blog-category-chip { display: inline-block; font-size: 12px; font-weight: 700; color: #00418f; background: #dbeafe; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 14px; }
    .blog-article h1 { font-size: 32px; font-weight: 800; line-height: 1.25; color: #0f172a; margin: 0 0 16px; letter-spacing: -0.02em; }
    .blog-article-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 13.5px; color: #64748b; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
    .blog-article-body { font-size: 16px; color: #334155; line-height: 1.75; }
    .blog-article-body h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 36px 0 14px; }
    .blog-article-body h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin: 24px 0 10px; }
    .blog-article-body p { margin: 0 0 16px; }
    .blog-article-body ul, .blog-article-body ol { margin: 0 0 20px; padding-left: 24px; }
    .blog-article-body li { margin-bottom: 8px; }
    .blog-article-body blockquote { margin: 20px 0; padding: 12px 20px; background: #f8fafc; border-left: 4px solid #00418f; font-style: italic; }
    .blog-faq { margin: 44px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .blog-faq h2 { font-size: 20px; font-weight: 700; margin: 0 0 16px; color: #0f172a; }
    .blog-faq-item { margin-bottom: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
    .blog-faq-item summary { font-weight: 600; cursor: pointer; color: #0f172a; outline: none; }
    .blog-faq-item p { margin: 10px 0 0; font-size: 14.5px; color: #475569; }
    .blog-links-section { margin-top: 24px; padding: 18px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; }
    .blog-links-section h3 { margin: 0 0 10px; font-size: 16px; color: #0f172a; }
    .blog-links-section ul { margin: 0; padding-left: 20px; }
    .blog-links-section li { margin-bottom: 6px; }
    .blog-links-section a { color: #00418f; text-decoration: none; font-weight: 500; }
    .blog-links-section a:hover { text-decoration: underline; }
    .blog-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 28px 0; }
    .blog-tag { font-size: 12.5px; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; }
    .blog-cta { background: linear-gradient(135deg, #00418f 0%, #0284c7 100%); color: #fff; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 44px 0; }
    .blog-cta h3 { margin: 0 0 8px; font-size: 22px; font-weight: 700; }
    .blog-cta p { margin: 0 0 20px; font-size: 14.5px; opacity: 0.95; }
    .blog-cta-btn { display: inline-block; background: #ffffff; color: #00418f; font-weight: 700; font-size: 14px; padding: 10px 24px; border-radius: 8px; text-decoration: none; }
    .blog-related-articles { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 32px; }
    .blog-related-articles h3 { font-size: 20px; font-weight: 700; margin: 0 0 20px; }
    .blog-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .blog-related-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-decoration: none; color: inherit; transition: border-color 0.15s ease; }
    .blog-related-card:hover { border-color: #00418f; }
    .blog-related-cat { font-size: 11px; font-weight: 700; color: #00418f; text-transform: uppercase; }
    .blog-related-card h4 { margin: 8px 0 10px; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.35; }
    .blog-related-time { font-size: 12px; color: #0284c7; font-weight: 600; }
    .blog-footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 28px 20px; text-align: center; font-size: 13px; color: #64748b; margin-top: 60px; }
    .blog-footer-links { display: flex; justify-content: center; gap: 16px; margin-top: 8px; }
    .blog-footer-links a { color: #475569; text-decoration: none; }
  </style>
</head>
<body>
  <div id="root">
    <header class="blog-header">
      <div class="blog-header-inner">
        <a href="/blog" class="blog-brand" aria-label="Castallio One Blog">
          <img src="/app_icon.png" alt="" class="blog-brand-icon">
          <span>Castallio One</span>
          <span class="blog-brand-tag">AEC Blog</span>
        </a>
        <div style="display: flex; gap: 12px; align-items: center;">
          <a href="/jobs" style="color: #475569; text-decoration: none; font-size: 13.5px; font-weight: 600;">Browse Jobs</a>
          <a href="/signin" class="blog-signin-btn">Sign In</a>
        </div>
      </div>
    </header>

    <main class="blog-article-wrap">
      <nav class="blog-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="/blog">Blog</a>
        <span aria-hidden="true">/</span>
        <span>${escapeHtml(post.category)}</span>
      </nav>

      <article class="blog-article">
        <span class="blog-category-chip">${escapeHtml(post.category)}</span>
        <h1>${escapeHtml(post.title)}</h1>

        <div class="blog-article-meta">
          <span>By <strong>${escapeHtml(post.author_name || 'Castallio One Editorial Team')}</strong></span>
          <span aria-hidden="true">•</span>
          <span>Published <time datetime="${escapeHtml(post.published_at)}">${formatDate(post.published_at)}</time></span>
          ${isUpdated ? `<span aria-hidden="true">•</span><span>Updated <time datetime="${escapeHtml(post.updated_at)}">${formatDate(post.updated_at)}</time></span>` : ''}
          <span aria-hidden="true">•</span>
          <span>${post.reading_time_minutes || 6} min read</span>
        </div>

        <div class="blog-article-body">
          ${contentHtml}
        </div>

        ${faqHtml}

        ${internalLinksHtml}

        ${externalLinksHtml}

        ${tagsHtml}

        <aside class="blog-cta">
          <h3>Build Your AEC Career With Castallio One</h3>
          <p>Get matched with top AEC &amp; BIM employers across India based on your verified skills.</p>
          <a href="/signup" class="blog-cta-btn">Explore Opportunities</a>
        </aside>

        ${relatedArticlesHtml}
      </article>
    </main>

    <footer class="blog-footer">
      <p>&copy; ${new Date().getFullYear()} Castallio One. Precision hiring for Architecture, Engineering &amp; Construction.</p>
      <nav class="blog-footer-links" aria-label="Footer">
        <a href="/jobs">Jobs Directory</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
        <a href="/blog">Blog Index</a>
      </nav>
    </footer>
  </div>

  <!-- Client-side SPA Hydration -->
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`
}

/**
 * Generates the main Blog Index page (/blog/index.html)
 */
function renderBlogListHtml(posts) {
  const canonicalUrl = `${CONFIG.baseUrl}/blog`
  const title = `The Castallio One Blog | AEC & BIM Insights, Guides & Trends`
  const description = `Authoritative career guides, BIM practices, MEP technical roadmaps, and local engineering job market insights across India.`

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category)))]

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${canonicalUrl}#blog`,
      name: 'The Castallio One Blog',
      description,
      url: canonicalUrl,
      publisher: {
        '@type': 'Organization',
        name: CONFIG.siteName,
        url: CONFIG.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${CONFIG.baseUrl}${CONFIG.ogImage}`,
        },
      },
      blogPost: posts.slice(0, 15).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${CONFIG.baseUrl}/blog/${p.slug}`,
        datePublished: p.published_at,
        description: p.excerpt,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: CONFIG.baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: canonicalUrl },
      ],
    },
  ]

  const postCards = posts
    .map(
      (p) => `
      <article class="blog-card">
        <div class="blog-card-body">
          <span class="blog-category-chip">${escapeHtml(p.category)}</span>
          <h2><a href="/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h2>
          <p>${escapeHtml(p.excerpt)}</p>
          <div class="blog-card-footer">
            <span class="blog-date">${formatDate(p.published_at)}</span>
            <span aria-hidden="true">•</span>
            <span>${p.reading_time_minutes || 5} min read</span>
            <a href="/blog/${escapeHtml(p.slug)}" class="blog-read-link">Read Guide →</a>
          </div>
        </div>
      </article>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta name="robots" content="index, follow">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${CONFIG.baseUrl}${CONFIG.ogImage}">
  <meta property="og:site_name" content="${escapeHtml(CONFIG.siteName)}">

  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>

  <link rel="icon" type="image/png" href="${CONFIG.favicon}">
  <style>
    body { margin: 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fdfdfd; color: #1e293b; line-height: 1.6; }
    .blog-header { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 14px 24px; position: sticky; top: 0; z-index: 50; }
    .blog-header-inner { max-width: 1040px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .blog-brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #0f172a; font-weight: 700; font-size: 17px; }
    .blog-brand-icon { width: 28px; height: 28px; border-radius: 6px; }
    .blog-brand-tag { font-size: 11px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; }
    .blog-signin-btn { background: #00418f; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13.5px; font-weight: 600; }
    .blog-hero { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 48px 20px; text-align: center; }
    .blog-eyebrow { font-size: 12px; font-weight: 700; color: #00418f; letter-spacing: 0.08em; text-transform: uppercase; }
    .blog-hero h1 { font-size: 34px; font-weight: 800; color: #0f172a; margin: 10px 0 12px; letter-spacing: -0.02em; }
    .blog-hero p { font-size: 16px; color: #64748b; max-width: 640px; margin: 0 auto; }
    .blog-container { max-width: 1040px; margin: 0 auto; padding: 40px 20px 80px; }
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 24px; }
    .blog-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: box-shadow 0.2s ease, border-color 0.2s ease; }
    .blog-card:hover { border-color: #93c5fd; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
    .blog-card-body { padding: 22px; flex: 1; display: flex; flex-direction: column; }
    .blog-category-chip { align-self: flex-start; font-size: 11px; font-weight: 700; color: #00418f; background: #e0f2fe; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .blog-card h2 { font-size: 18px; font-weight: 700; line-height: 1.35; margin: 0 0 10px; color: #0f172a; }
    .blog-card h2 a { color: inherit; text-decoration: none; }
    .blog-card h2 a:hover { color: #00418f; }
    .blog-card p { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0 0 16px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .blog-card-footer { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: auto; }
    .blog-read-link { margin-left: auto; color: #00418f; font-weight: 700; text-decoration: none; font-size: 13px; }
    .blog-read-link:hover { text-decoration: underline; }
    .blog-footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 28px 20px; text-align: center; font-size: 13px; color: #64748b; }
    .blog-footer-links { display: flex; justify-content: center; gap: 16px; margin-top: 8px; }
    .blog-footer-links a { color: #475569; text-decoration: none; }
  </style>
</head>
<body>
  <div id="root">
    <header class="blog-header">
      <div class="blog-header-inner">
        <a href="/blog" class="blog-brand" aria-label="Castallio One Blog">
          <img src="/app_icon.png" alt="" class="blog-brand-icon">
          <span>Castallio One</span>
          <span class="blog-brand-tag">AEC Blog</span>
        </a>
        <div style="display: flex; gap: 12px; align-items: center;">
          <a href="/jobs" style="color: #475569; text-decoration: none; font-size: 13.5px; font-weight: 600;">Browse Jobs</a>
          <a href="/signin" class="blog-signin-btn">Sign In</a>
        </div>
      </div>
    </header>

    <main>
      <section class="blog-hero">
        <span class="blog-eyebrow">INSIGHTS &amp; CAREER GUIDES</span>
        <h1>The Castallio One AEC Knowledge Hub</h1>
        <p>Expert career guides, technical roadmaps, and local engineering job market insights for India's AEC community.</p>
      </section>

      <section class="blog-container" aria-label="Blog posts list">
        <div class="blog-grid">
          ${postCards}
        </div>
      </section>
    </main>

    <footer class="blog-footer">
      <p>&copy; ${new Date().getFullYear()} Castallio One. Precision talent for the Architecture, Engineering &amp; Construction industry.</p>
      <nav class="blog-footer-links" aria-label="Footer">
        <a href="/jobs">Jobs Directory</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </nav>
    </footer>
  </div>

  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`
}

/**
 * Builds public/sitemap-blogs.xml
 */
function generateBlogSitemapXml(posts) {
  const urls = [
    `  <url>
    <loc>${CONFIG.baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
    ...posts.map((p) => {
      const lastmod = p.updated_at ? p.updated_at.slice(0, 10) : p.published_at.slice(0, 10)
      return `  <url>
    <loc>${CONFIG.baseUrl}/blog/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    }),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

/**
 * Updates public/sitemap-index.xml to reference both job and blog sitemaps
 */
function updateSitemapIndexXml() {
  const today = new Date().toISOString().slice(0, 10)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${CONFIG.baseUrl}/sitemap-1.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${CONFIG.baseUrl}/sitemap-blogs.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`
  const sitemapIndexPath = path.join(CONFIG.outDir, 'sitemap-index.xml')
  fs.writeFileSync(sitemapIndexPath, xml, 'utf8')
  console.log(`✅ Updated sitemap index at ${sitemapIndexPath}`)
}

/**
 * Updates public/llms.txt with the 30 AEC guides for Generative Engine Optimization (GEO)
 */
function updateLlmsTxt(posts) {
  const today = new Date().toISOString().slice(0, 10)

  // Group blogs by category
  const categories = {}
  for (const post of posts) {
    const cat = post.category || 'General'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push(post)
  }

  let guidesSection = ''
  for (const [cat, catPosts] of Object.entries(categories)) {
    guidesSection += `\n### ${cat}\n`
    for (const p of catPosts) {
      guidesSection += `- [${p.title}](${CONFIG.baseUrl}/blog/${p.slug}): Focus on ${p.primary_keyword || p.category}. ${p.excerpt.slice(0, 140)}...\n`
    }
  }

  const content = `# Castallio One — Architecture, Engineering & Construction Knowledge Graph

> Castallio One is India's dedicated AI-powered AEC (Architecture, Engineering & Construction) job search and career network. It indexes verified opportunities in BIM, Civil, Structural, MEP, Mechanical, Electrical, Architecture, and Construction Management across all 28 Indian states and 8 Union Territories.

## Core Facts
- Website: https://castallioone.com
- Industry: Architecture, Engineering & Construction (AEC)
- Published Career & Technical Guides: ${posts.length}
- Location: India nationwide
- Last Updated: ${today}

## AEC Knowledge Guides & Career Roadmaps (AEO / GEO Index)
${guidesSection}

## Jobs by State
- [Maharashtra](https://castallioone.com/jobs/maharashtra/): Pune, Mumbai, Nagpur, Thane, Nashik, Navi Mumbai
- [Karnataka](https://castallioone.com/jobs/karnataka/): Bengaluru, Mysuru, Mangaluru
- [Tamil Nadu](https://castallioone.com/jobs/tamil-nadu/): Chennai, Coimbatore, Madurai
- [Telangana](https://castallioone.com/jobs/telangana/): Hyderabad, Warangal
- [Delhi NCR & Uttar Pradesh](https://castallioone.com/jobs/uttar-pradesh/): Noida, Greater Noida, Ghaziabad, Lucknow
- [Gujarat](https://castallioone.com/jobs/gujarat/): Ahmedabad, Surat, Vadodara

## Key Roles Indexed
- [BIM Engineer Jobs in India](https://castallioone.com/jobs/role/bim-engineer/)
- [BIM Modeler Jobs in India](https://castallioone.com/jobs/role/bim-modeler/)
- [BIM Coordinator Jobs in India](https://castallioone.com/jobs/role/bim-coordinator/)
- [Structural Engineer Jobs in India](https://castallioone.com/jobs/role/structural-engineer/)
- [Electrical Engineer Jobs in India](https://castallioone.com/jobs/role/electrical-engineer/)
- [Architect Jobs in India](https://castallioone.com/jobs/role/architect/)
- [Civil Site Engineer Jobs in India](https://castallioone.com/jobs/role/site-engineer/)
- [Quantity Surveyor Jobs in India](https://castallioone.com/jobs/role/quantity-surveyor/)

## Sitemaps
- [Sitemap Index](https://castallioone.com/sitemap-index.xml)
- [Job Opportunities Sitemap](https://castallioone.com/sitemap-1.xml)
- [AEC Guides & Blog Sitemap](https://castallioone.com/sitemap-blogs.xml)
`

  const llmsPath = path.join(CONFIG.outDir, 'llms.txt')
  fs.writeFileSync(llmsPath, content, 'utf8')
  console.log(`✅ Updated GEO llms.txt at ${llmsPath}`)
}

/**
 * Main execution
 */
export function generateBlogPages() {
  console.log('🔄 Loading blogs from blogs.json...')
  if (!fs.existsSync(CONFIG.blogsFile)) {
    throw new Error(`blogs.json not found at ${CONFIG.blogsFile}. Run export-blogs.mjs first.`)
  }

  const raw = fs.readFileSync(CONFIG.blogsFile, 'utf8')
  const posts = JSON.parse(raw)
  console.log(`📖 Loaded ${posts.length} blog posts.`)

  // 1. Generate /blog/index.html
  const blogListHtml = renderBlogListHtml(posts)
  const blogDir = path.join(CONFIG.outDir, 'blog')
  if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true })
  fs.writeFileSync(path.join(blogDir, 'index.html'), blogListHtml, 'utf8')

  // Also support /resources/index.html
  const resDir = path.join(CONFIG.outDir, 'resources')
  if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true })
  fs.writeFileSync(path.join(resDir, 'index.html'), blogListHtml, 'utf8')

  // 2. Generate each post at public/blog/{slug}/index.html and public/resources/{slug}/index.html
  let count = 0
  for (const post of posts) {
    const postHtml = renderPostHtml(post, posts)

    const postDir = path.join(blogDir, post.slug)
    if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true })
    fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8')

    // Also alias in resources
    const resPostDir = path.join(resDir, post.slug)
    if (!fs.existsSync(resPostDir)) fs.mkdirSync(resPostDir, { recursive: true })
    fs.writeFileSync(path.join(resPostDir, 'index.html'), postHtml, 'utf8')

    count++
  }
  console.log(`✅ Generated ${count} static blog posts in public/blog/ and public/resources/`)

  // 3. Generate sitemap-blogs.xml
  const sitemapXml = generateBlogSitemapXml(posts)
  const sitemapBlogsPath = path.join(CONFIG.outDir, 'sitemap-blogs.xml')
  fs.writeFileSync(sitemapBlogsPath, sitemapXml, 'utf8')
  console.log(`✅ Generated sitemap-blogs.xml at ${sitemapBlogsPath}`)

  // 4. Update sitemap-index.xml
  updateSitemapIndexXml()

  // 5. Update llms.txt for GEO
  updateLlmsTxt(posts)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    generateBlogPages()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
