import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchBlogPosts,
  fetchBlogPostBySlug,
  formatBlogDate,
  type BlogPost,
} from '../lib/blogService'
import './Blog.css'

const SITE_NAME = 'Castallio One'

/** Sets (or creates) a <meta> tag in <head>. Returns a cleanup that removes it if we created it. */
function setMeta(attr: 'name' | 'property', key: string, value: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  const created = !el
  const previous = el?.getAttribute('content') ?? null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
  return () => {
    if (!el) return
    if (created) el.remove()
    else if (previous !== null) el.setAttribute('content', previous)
  }
}

/** Applies per-post SEO: title, description, robots, canonical, Open Graph, Twitter and JSON-LD. */
function useBlogSeo(post: BlogPost | null) {
  useEffect(() => {
    if (!post) return
    const origin = window.location.origin
    const url = post.canonical_url || `${origin}/blog/${post.slug}`
    const title = post.seo_title || post.title
    const description = post.meta_description || post.excerpt
    const image = post.featured_image_url || ''

    const previousTitle = document.title
    document.title = title

    const cleanups: Array<() => void> = [
      setMeta('name', 'description', description),
      setMeta('name', 'robots', post.robots || 'index, follow'),
      setMeta('name', 'keywords', [post.primary_keyword, ...post.secondary_keywords].filter(Boolean).join(', ')),
      setMeta('property', 'og:type', 'article'),
      setMeta('property', 'og:site_name', SITE_NAME),
      setMeta('property', 'og:title', title),
      setMeta('property', 'og:description', description),
      setMeta('property', 'og:url', url),
      setMeta('name', 'twitter:card', 'summary_large_image'),
      setMeta('name', 'twitter:title', title),
      setMeta('name', 'twitter:description', description),
    ]
    if (image) {
      cleanups.push(setMeta('property', 'og:image', image), setMeta('name', 'twitter:image', image))
    }

    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = url
    document.head.appendChild(canonical)

    const graph: Array<Record<string, unknown>> = [
      {
        '@type': 'Article',
        headline: post.title,
        description,
        image: image || undefined,
        author: { '@type': 'Organization', name: post.author_name },
        publisher: { '@type': 'Organization', name: SITE_NAME },
        datePublished: post.published_at,
        dateModified: post.updated_at,
        mainEntityOfPage: url,
        keywords: post.secondary_keywords.join(', '),
        wordCount: post.word_count,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Blog', item: `${origin}/blog` },
          { '@type': 'ListItem', position: 2, name: post.title, item: url },
        ],
      },
    ]
    if (post.faq.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: post.faq.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      })
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    document.head.appendChild(script)

    return () => {
      document.title = previousTitle
      cleanups.forEach((c) => c())
      canonical.remove()
      script.remove()
    }
  }, [post])
}

const BlogHeader: React.FC = () => (
  <header className="blog-header">
    <div className="blog-header-inner">
      <Link to="/blog" className="blog-brand" aria-label="Castallio One Blog">
        <img src="/app_icon.png" alt="" className="blog-brand-icon" />
        <span className="blog-brand-name">Castallio One</span>
        <span className="blog-brand-tag">Blog</span>
      </Link>
      <Link to="/signin" className="blog-signin-btn">
        Sign In
      </Link>
    </div>
  </header>
)

const BlogFooter: React.FC = () => (
  <footer className="blog-footer">
    <p>© {new Date().getFullYear()} Castallio One. Precision talent for the AEC industry.</p>
    <nav className="blog-footer-links" aria-label="Footer">
      <Link to="/terms">Terms</Link>
      <Link to="/privacy">Privacy</Link>
    </nav>
  </footer>
)

const PostMeta: React.FC<{ post: BlogPost }> = ({ post }) => (
  <div className="blog-meta">
    <span>{formatBlogDate(post.published_at)}</span>
    <span className="blog-dot" aria-hidden="true">•</span>
    <span>{post.reading_time_minutes} min read</span>
  </div>
)

/**
 * Renders content: "## " h2, "### " h3, consecutive "- " lines as a list,
 * everything else as paragraphs.
 */
const PostContent: React.FC<{ content: string }> = ({ content }) => {
  const nodes = useMemo(() => {
    const out: React.ReactNode[] = []
    let bullets: string[] = []
    const flush = (key: string) => {
      if (bullets.length > 0) {
        out.push(
          <ul key={key}>
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )
        bullets = []
      }
    }
    content.split('\n').forEach((raw, i) => {
      const line = raw.trim()
      if (!line) return flush(`ul-${i}`)
      if (line.startsWith('- ')) {
        bullets.push(line.slice(2))
        return
      }
      flush(`ul-${i}`)
      if (line.startsWith('### ')) out.push(<h3 key={i}>{line.slice(4)}</h3>)
      else if (line.startsWith('## ')) out.push(<h2 key={i}>{line.slice(3)}</h2>)
      else out.push(<p key={i}>{line}</p>)
    })
    flush('ul-end')
    return out
  }, [content])

  return <div className="blog-article-body">{nodes}</div>
}

export const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    document.title = 'Blog | Castallio One'
    fetchBlogPosts()
      .then(setPosts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(posts.map((p) => p.category)))], [posts])
  const visible = category === 'All' ? posts : posts.filter((p) => p.category === category)

  return (
    <div className="blog-page">
      <BlogHeader />
      <main>
        <section className="blog-hero">
          <span className="blog-eyebrow">INSIGHTS &amp; GUIDES</span>
          <h1>The Castallio One Blog</h1>
          <p>Hiring trends, career advice and BIM know-how for the AEC community.</p>
        </section>

        <section className="blog-container" aria-label="Blog posts">
          {categories.length > 2 && (
            <div className="blog-filters" role="tablist" aria-label="Filter by category">
              {categories.map((c) => (
                <button
                  key={c}
                  id={`blog-filter-${c.toLowerCase().replace(/\s+/g, '-')}`}
                  role="tab"
                  aria-selected={category === c}
                  className={`blog-chip ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="blog-grid">
              {[0, 1, 2].map((n) => (
                <div key={n} className="blog-card blog-skeleton" />
              ))}
            </div>
          )}

          {!loading && error && <p className="blog-state">Unable to load posts right now. Please try again later.</p>}
          {!loading && !error && visible.length === 0 && <p className="blog-state">No posts published yet.</p>}

          {!loading && !error && visible.length > 0 && (
            <div className="blog-grid">
              {visible.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card" id={`blog-card-${post.slug}`}>
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.featured_image_alt || post.title}
                      className="blog-card-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="blog-card-cover blog-card-cover-fallback" aria-hidden="true">
                      <span>{post.category}</span>
                    </div>
                  )}
                  <div className="blog-card-body">
                    <span className="blog-category">{post.category}</span>
                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>
                    <div className="blog-card-footer">
                      <PostMeta post={post} />
                      <span className="blog-read-more">Read →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <BlogFooter />
    </div>
  )
}

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    fetchBlogPostBySlug(slug)
      .then(setPost)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  useBlogSeo(post)

  return (
    <div className="blog-page">
      <BlogHeader />
      <main className="blog-article-wrap">
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <Link to="/blog">Blog</Link>
          {post && (
            <>
              <span aria-hidden="true">/</span>
              <span>{post.category}</span>
            </>
          )}
        </nav>

        {loading && <div className="blog-skeleton blog-article-skeleton" />}
        {!loading && error && <p className="blog-state">Unable to load this post right now.</p>}
        {!loading && !error && !post && <p className="blog-state">This post could not be found.</p>}

        {!loading && post && (
          <article className="blog-article">
            <span className="blog-category">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="blog-article-meta">
              <span>By {post.author_name}</span>
              <span className="blog-dot" aria-hidden="true">•</span>
              <span>Published {formatBlogDate(post.published_at)}</span>
              {new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 86_400_000 && (
                <>
                  <span className="blog-dot" aria-hidden="true">•</span>
                  <span>Updated {formatBlogDate(post.updated_at)}</span>
                </>
              )}
              <span className="blog-dot" aria-hidden="true">•</span>
              <span>{post.reading_time_minutes} min read</span>
            </div>

            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                className="blog-article-cover"
              />
            )}

            <PostContent content={post.content} />

            {post.faq.length > 0 && (
              <section className="blog-faq" aria-labelledby="blog-faq-title">
                <h2 id="blog-faq-title">Frequently asked questions</h2>
                {post.faq.map((f, i) => (
                  <details key={i} className="blog-faq-item">
                    <summary>{f.question}</summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
              </section>
            )}

            {(post.internal_links.length > 0 || post.external_links.length > 0) && (
              <div className="blog-links">
                {post.internal_links.length > 0 && (
                  <section aria-labelledby="blog-related-title">
                    <h3 id="blog-related-title">Related on Castallio One</h3>
                    <ul>
                      {post.internal_links.map((l) => (
                        <li key={l.url}>
                          <Link to={l.url}>{l.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {post.external_links.length > 0 && (
                  <section aria-labelledby="blog-sources-title">
                    <h3 id="blog-sources-title">Sources &amp; further reading</h3>
                    <ul>
                      {post.external_links.map((l) => (
                        <li key={l.url}>
                          <a href={l.url} target="_blank" rel="noopener noreferrer">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="blog-tags" aria-label="Tags">
                {post.tags.map((t) => (
                  <span key={t} className="blog-tag">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <aside className="blog-cta">
              <h3>Ready to build your AEC career?</h3>
              <p>Create your Talent Passport and get matched with leading firms.</p>
              <Link to="/signup" className="blog-cta-btn">Get Started</Link>
            </aside>
          </article>
        )}
      </main>
      <BlogFooter />
    </div>
  )
}
