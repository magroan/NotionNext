import BLOG from '@/blog.config'
import fs from 'fs'
import { siteConfig } from '../config'

const toYMD = d => d.toISOString().split('T')[0]

const parseDate = value => {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const getPostLastmodYMD = (post, fallbackYMD) => {
  const d =
    parseDate(post?.publishDay) ||
    parseDate(post?.lastEditedDay) ||
    parseDate(post?.lastEditedTime) ||
    parseDate(post?.createdTime) ||
    parseDate(post?.createdDay)

  return d ? toYMD(d) : fallbackYMD
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

  const todayYMD = toYMD(new Date())

  const urls = [
    {
      loc: `${link}`,
      lastmod: todayYMD,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${link}/archive`,
      lastmod: todayYMD,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${link}/category`,
      lastmod: todayYMD,
      changefreq: 'daily'
    },
    {
      loc: `${link}/tag`,
      lastmod: todayYMD,
      changefreq: 'daily'
    }
  ]

  // 循环页面生成
  allPages?.forEach(post => {
    const slug = post?.slug
    if (!slug) return

    const slugWithoutLeadingSlash = slug.startsWith('/') ? slug.slice(1) : slug

    urls.push({
      loc: `${link}/${slugWithoutLeadingSlash}`,
      // publishDay が無い/壊れている記事でも落ちないようにする
      lastmod: getPostLastmodYMD(post, todayYMD),
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
