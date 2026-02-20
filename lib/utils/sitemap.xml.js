/* eslint-disable */
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { extractNotionPageIds, getAllPosts } from '@/lib/notion'
import fs from 'fs'

function toValidDate(input) {
  if (input == null) return null

  if (typeof input === 'number') {
    const ms = input < 1e12 ? input * 1000 : input
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  if (typeof input === 'string') {
    const d = new Date(input)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

function ymd(d) {
  return d.toISOString().split('T')[0]
}

function getPostLastmodYMD(post) {
  const candidates = [
    post?.publishDate,
    post?.publishDay,
    post?.date?.start_date,
    post?.lastEditedDate,
    post?.lastEditedDay,
    post?.date?.lastEditedDay,
    post?.createdTime
  ]
  for (const v of candidates) {
    const d = toValidDate(v)
    if (d) return ymd(d)
  }
  return ymd(new Date())
}

function createSitemapXml(urls) {
  const body = urls
    .map(u => {
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''
      const priority = u.priority ? `<priority>${u.priority}</priority>` : ''
      return `<url><loc>${u.loc}</loc>${lastmod}${changefreq}${priority}</url>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`
}

export default async function generateSitemapXml(props) {
  const config = props?.siteInfo || props?.NOTION_CONFIG
  const LINK = siteConfig('LINK', BLOG.LINK, config)
  const SUB_PATH = siteConfig('SUB_PATH', BLOG.SUB_PATH, config)

  const POST_IDS_INCLUDE_FOR_SITEMAP = siteConfig(
    'POST_IDS_INCLUDE_FOR_SITEMAP',
    BLOG.POST_IDS_INCLUDE_FOR_SITEMAP,
    config
  )
  const POST_IDS_EXCLUDE_FOR_SITEMAP = siteConfig(
    'POST_IDS_EXCLUDE_FOR_SITEMAP',
    BLOG.POST_IDS_EXCLUDE_FOR_SITEMAP,
    config
  )

  const includePostIds = extractNotionPageIds(POST_IDS_INCLUDE_FOR_SITEMAP)
  const excludePostIds = extractNotionPageIds(POST_IDS_EXCLUDE_FOR_SITEMAP)

  const allPosts = await getAllPosts({ includePages: true })

  const posts = allPosts
    .filter(p => p?.slug)
    .filter(p => {
      if (includePostIds?.length) return includePostIds.includes(p.id)
      return true
    })
    .filter(p => {
      if (excludePostIds?.length) return !excludePostIds.includes(p.id)
      return true
    })

  const base = String(LINK || '').replace(/\/+$/, '')
  const sub = String(SUB_PATH || '').replace(/^\/+/, '').replace(/\/+$/, '')
  const basePath = sub ? `${base}/${sub}` : base

  const urls = posts.map(p => ({
    loc: `${basePath}/${String(p.slug).replace(/^\/+/, '')}`,
    lastmod: getPostLastmodYMD(p),
    changefreq: 'weekly',
    priority: '0.7'
  }))

  const xml = createSitemapXml(urls)

  const outDir = `${process.cwd()}/public`
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(`${outDir}/sitemap.xml`, xml)
  console.log('[Sitemap] generated /sitemap.xml')
}
