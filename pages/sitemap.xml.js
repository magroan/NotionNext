import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getAllPosts } from '@/lib/db/SiteDataApi'

const toYMD = d => d.toISOString().split('T')[0]

const parseDate = v => {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

export default function Sitemap() {
  // getServerSideProps が実体
  return null
}

export async function getServerSideProps({ res }) {
  const data = await getAllPosts({ from: 'sitemap.xml' })
  const allPages = data?.allPages || []
  const NOTION_CONFIG = data?.NOTION_CONFIG || {}

  let link = siteConfig('LINK', BLOG.LINK, NOTION_CONFIG)
  if (link && link.endsWith('/')) link = link.slice(0, -1)

  const urls = [
    {
      loc: `${link}`,
      lastmod: toYMD(new Date()),
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${link}/archive`,
      lastmod: toYMD(new Date()),
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${link}/category`,
      lastmod: toYMD(new Date()),
      changefreq: 'daily'
    },
    {
      loc: `${link}/tag`,
      lastmod: toYMD(new Date()),
      changefreq: 'daily'
    }
  ]

  const seen = new Set()
  for (const post of allPages) {
    const slugWithoutLeadingSlash = post?.slug?.startsWith('/')
      ? post?.slug?.slice(1)
      : post?.slug

    if (!slugWithoutLeadingSlash) continue
    const loc = `${link}/${slugWithoutLeadingSlash}`
    if (seen.has(loc)) continue
    seen.add(loc)

    const d =
      parseDate(post?.publishDate) ||
      parseDate(post?.lastEditedTime) ||
      parseDate(post?.date?.start_date) ||
      new Date()

    urls.push({
      loc,
      lastmod: toYMD(d),
      changefreq: 'daily'
    })
  }

  const xml = createSitemapXml(urls)
  res.setHeader('Content-Type', 'text/xml; charset=utf-8')
  res.write(xml)
  res.end()
  return { props: {} }
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
