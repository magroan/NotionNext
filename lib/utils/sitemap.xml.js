import BLOG from '@/blog.config'
import fs from 'fs'
import { siteConfig } from '../config'

/**
 * lastmod を安全に生成する（Invalid Date を避ける）
 * - publishDay が無い/不正でも落ちない
 * - 候補を順に試して、どれもダメなら今日の日付
 * @param {*} post
 * @returns {string} YYYY-MM-DD
 */
function safeLastmod(post) {
  const candidates = [
    post?.publishDay,
    post?.lastEditedTime,
    post?.lastEditedDay,
    post?.date,
    post?.createdTime,
    post?.createTime
  ]

  for (const c of candidates) {
    if (!c) continue
    const d = new Date(c)
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().split('T')[0]
    }
  }

  return new Date().toISOString().split('T')[0]
}

/**
 * 生成站点地图
 * @param {*} param0
 */
export function generateSitemapXml({ allPages, NOTION_CONFIG }) {
  let link = siteConfig('LINK', BLOG.LINK, NOTION_CONFIG)

  // 确保链接不以斜杠结尾
  if (link && link.endsWith('/')) {
    link = link.slice(0, -1)
  }

  const today = new Date().toISOString().split('T')[0]

  const urls = [
    {
      loc: `${link}`,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${link}/archive`,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${link}/category`,
      lastmod: today,
      changefreq: 'daily'
    },
    {
      loc: `${link}/tag`,
      lastmod: today,
      changefreq: 'daily'
    }
  ]

  // 循环页面生成
  allPages?.forEach(post => {
    const slug = post?.slug
    if (!slug) return

    const slugWithoutLeadingSlash = slug.startsWith('/') ? slug.slice(1) : slug
    if (!slugWithoutLeadingSlash) return

    urls.push({
      loc: `${link}/${slugWithoutLeadingSlash}`,
      lastmod: safeLastmod(post),
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

/**
 * 生成站点地图
 * @param {*} urls
 * @returns
 */
function createSitemapXml(urls) {
  let urlsXml = ''
  urls.forEach(u => {
    // lastmod が空になるケースを最終防御
    const lastmod = u?.lastmod || new Date().toISOString().split('T')[0]
    urlsXml += `<url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
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
