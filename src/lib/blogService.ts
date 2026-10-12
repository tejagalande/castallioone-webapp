import { supabase } from './supabase'

export interface BlogFaq {
  question: string
  answer: string
}

export interface BlogLink {
  label: string
  url: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  seo_title: string | null
  meta_description: string | null
  primary_keyword: string | null
  secondary_keywords: string[]
  category: string
  tags: string[]
  excerpt: string
  content: string
  featured_image_url: string | null
  featured_image_alt: string | null
  canonical_url: string | null
  robots: string
  faq: BlogFaq[]
  internal_links: BlogLink[]
  external_links: BlogLink[]
  author_name: string
  word_count: number
  reading_time_minutes: number
  published_at: string
  updated_at: string
}

const COLUMNS =
  'id, slug, title, seo_title, meta_description, primary_keyword, secondary_keywords, category, tags, excerpt, content, featured_image_url, featured_image_alt, canonical_url, robots, faq, internal_links, external_links, author_name, word_count, reading_time_minutes, published_at, updated_at'

/** Public: lists published blog posts (no authentication required). */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select(COLUMNS)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as BlogPost[]
}

/** Public: fetches a single published blog post by slug. */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blogs')
    .select(COLUMNS)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as BlogPost | null) ?? null
}

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
