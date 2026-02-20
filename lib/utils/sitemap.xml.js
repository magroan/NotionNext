import BLOG from '@/blog.config'
import fs from 'fs'
import { siteConfig } from '../config'

const ymd = d => d.toISOString().split('T')[0]

const safeYMDFromPost = post => {
  const candidates = [
    post?.publishDate,
    post?.lastEditedTime,
    post?.lastEditedDate,
    post?.createdTime,
    post?.date?.start_date
  ]
  for (const v of candidates) {
    if (!v) continue
    const d = new Date(v)
    if (!Number.isNaN(d.getTime())) return ymd(d)
  }
  return ymd(new Date())
}

/**
 * 生成站点地图
 * @param {*} param0
 */
export function generateSitemapXml({ allPages, NOTION_CONFIG }) {
  let link = siteConfig('LINK', BLOG.LINK, NOTION_CONFIG)
  if (link && link.endsWith('/')) link = link.slice(0, -1)

  const today = ymd(new Date())
  const urls = [
    { loc: `${link}`, lastmod: today, changefreq: 'daily', priority: 1.0 },
    { loc: `${link}/archive`, lastmod: today, changefreq: 'daily', priority: 1.0 },
    { loc: `${link}/category`, lastmod: today, changefreq: 'daily' },
    { loc: `${link}/tag`, lastmod: today, changefreq: 'daily' }
  ]

  allPages?.forEach(post => {
    if (!post?.slug) return
    const slugWithoutLeadingSlash = post.slug.startsWith('/')
      ? post.slug.slice(1)
      : post.slug

    urls.push({
      loc: `${link}/${slugWithoutLeadingSlash}`,
      lastmod: safeYMDFromPost(post),
      changefreq: 'daily'
    })
  })

  const xml = createSitemapXml(urls)
  try {
    fs.writeFileSync('sitemap.xml', xml)
    fs.writeFileSync('./public/sitemap.xml', xml)
  } catch (error) {
    console.warn('无法写入文件', error)
  }
}

function createSitemapXml(urls) {
  let urlsXml = ''
  urls.forEach(u => {
    urlsXml += `<url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    </url>
    `
  })

  return `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${urlsXml}
    </urlset>
    `
}
