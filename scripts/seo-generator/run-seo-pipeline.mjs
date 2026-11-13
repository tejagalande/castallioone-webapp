#!/usr/bin/env node
import { exportJobs } from './export-jobs.mjs'
import { generatePages } from './generate-seo-pages.mjs'
import { exportBlogs } from './export-blogs.mjs'
import { generateBlogPages } from './generate-blog-pages.mjs'
import { generateSeoDocs } from './generate-seo-docs.mjs'

async function runPipeline() {
  console.log('==============================================')
  console.log('🚀 Castallio One SEO / AEO / GEO Automation Pipeline')
  console.log('==============================================\n')

  try {
    // 1. Export fresh jobs from Supabase
    await exportJobs()
  } catch (err) {
    console.warn('⚠️ Supabase jobs export notice:', err.message)
    console.log('👉 Proceeding with existing jobs.json...')
  }

  try {
    // 2. Export fresh blogs from Supabase
    await exportBlogs()
  } catch (err) {
    console.warn('⚠️ Supabase blogs export notice:', err.message)
    console.log('👉 Proceeding with existing blogs.json...')
  }

  // 3. Generate Job SEO landing pages, schemas, and sitemaps
  generatePages()

  // 4. Generate Blog SEO, AEO, and GEO pages, sitemaps, and llms.txt
  generateBlogPages()

  // 5. Generate SEO Documentation, Keyword Maps, and Calendars
  generateSeoDocs()

  console.log('\n==============================================')
  console.log('✅ Pipeline Completed Successfully!')
  console.log('==============================================')
}

runPipeline()
