#!/usr/bin/env node
import { exportJobs } from './export-jobs.mjs'
import { generatePages } from './generate-seo-pages.mjs'

async function runPipeline() {
  console.log('==============================================')
  console.log('🚀 Castallio One SEO / AEO / GEO Automation Pipeline')
  console.log('==============================================\n')

  try {
    // 1. Export fresh jobs from Supabase
    await exportJobs()
  } catch (err) {
    console.warn('⚠️ Supabase export failed or was skipped:', err.message)
    console.log('👉 Proceeding with existing jobs.json or sample dataset...')
  }

  // 2. Generate SEO landing pages, schemas, and sitemaps
  generatePages()

  console.log('\n==============================================')
  console.log('✅ Pipeline Completed Successfully!')
  console.log('==============================================')
}

runPipeline()
