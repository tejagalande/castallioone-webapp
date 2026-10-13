import { useEffect } from 'react'

export type SchemaObject = Record<string, unknown>

export interface SEOPageOptions {
  title?: string
  description?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: string
  robots?: string
  keywords?: string
}

/**
 * Custom React Hook to inject and update Schema.org structured data (JSON-LD)
 * and optional standard SEO tags (title, description, canonical, open graph).
 */
export function useSchema(
  schema: SchemaObject | SchemaObject[] | null | undefined,
  scriptId: string = 'page-ldjson-schema',
  seoOptions?: SEOPageOptions
) {
  useEffect(() => {
    // 1. Manage Head Schema Script
    if (schema) {
      const payload = Array.isArray(schema)
        ? { '@context': 'https://schema.org', '@graph': schema }
        : {
            '@context': 'https://schema.org',
            ...schema,
          }

      let script = document.getElementById(scriptId) as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.text = JSON.stringify(payload)
    }

    // 2. Manage SEO meta tags if provided
    const cleanups: Array<() => void> = []

    if (seoOptions) {
      const previousTitle = document.title
      if (seoOptions.title) {
        document.title = seoOptions.title
      }

      const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
        let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null
        const created = !meta
        const previousContent = meta?.getAttribute('content') ?? ''

        if (!meta) {
          meta = document.createElement('meta')
          meta.setAttribute(attrName, attrValue)
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', content)

        return () => {
          if (created && meta && meta.parentNode) {
            meta.remove()
          } else if (meta) {
            meta.setAttribute('content', previousContent)
          }
        }
      }

      if (seoOptions.description) {
        cleanups.push(setMeta('name', 'description', seoOptions.description))
        cleanups.push(setMeta('property', 'og:description', seoOptions.description))
        cleanups.push(setMeta('name', 'twitter:description', seoOptions.description))
      }

      if (seoOptions.robots) {
        cleanups.push(setMeta('name', 'robots', seoOptions.robots))
      }

      if (seoOptions.keywords) {
        cleanups.push(setMeta('name', 'keywords', seoOptions.keywords))
      }

      if (seoOptions.title) {
        cleanups.push(setMeta('property', 'og:title', seoOptions.title))
        cleanups.push(setMeta('name', 'twitter:title', seoOptions.title))
      }

      if (seoOptions.ogType) {
        cleanups.push(setMeta('property', 'og:type', seoOptions.ogType))
      }

      if (seoOptions.ogImage) {
        cleanups.push(setMeta('property', 'og:image', seoOptions.ogImage))
        cleanups.push(setMeta('name', 'twitter:image', seoOptions.ogImage))
      }

      if (seoOptions.canonicalUrl) {
        cleanups.push(setMeta('property', 'og:url', seoOptions.canonicalUrl))

        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
        const created = !canonical
        const previousHref = canonical?.getAttribute('href') ?? ''

        if (!canonical) {
          canonical = document.createElement('link')
          canonical.rel = 'canonical'
          document.head.appendChild(canonical)
        }
        canonical.href = seoOptions.canonicalUrl

        cleanups.push(() => {
          if (created && canonical && canonical.parentNode) {
            canonical.remove()
          } else if (canonical) {
            canonical.href = previousHref
          }
        })
      }

      cleanups.push(() => {
        document.title = previousTitle
      })
    }

    return () => {
      const existingScript = document.getElementById(scriptId)
      if (existingScript) {
        existingScript.remove()
      }
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [schema, scriptId, seoOptions])
}
