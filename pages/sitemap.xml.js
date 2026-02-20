import { getAllPosts, getAllCategories } from '@/lib/notion'
import BLOG from '@/blog.config'

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

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml')
  const fields = await getPageSitemapFields()
  const uniqueFields = getUniqueFields(fields)
  const xml = getSitemapXml(uniqueFields)
  res.write(xml)
  res.end()
  return { props: {} }
}

const getSitemapXml = fields =>
  `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${fields
      .map(
        field => `
    <url>
      <loc>${field.loc}</loc>
      <lastmod>${field.lastmod}</lastmod>
      <changefreq>${field.changefreq}</changefreq>
      <priority>${field.priority}</priority>
    </url>
    `
      )
      .join('')}
  </urlset>
  `

async function getPageSitemapFields() {
  const dateNow = toYMD(new Date())
  const link = BLOG.LINK

  const defaultFields = [
    { loc: link, lastmod: dateNow, changefreq: 'daily', priority: '1.0' },
    {
      loc: link + '/archive',
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '0.7'
    },
    {
      loc: link + '/category',
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '0.7'
    },
    { loc: link + '/tag', lastmod: dateNow, changefreq: 'daily', priority: '0.7' }
  ]

  // 获取分类列表，并生成对应的 category 页面链接
  const allCategories = await getAllCategories({ includePostCount: false })
  const categoryFields =
    allCategories
      ?.map(category => {
        return {
          loc: `${link}/category/${encodeURIComponent(category)}`,
          lastmod: dateNow,
          changefreq: 'daily',
          priority: '0.7'
        }
      })
      ?.flat() ?? []

  const allPosts = await getAllPosts({ includePages: true })
  const postFields =
    allPosts
      ?.filter(post => post?.status === 'Published')
      ?.map(post => {
        return {
          loc: `${link}/${post?.slug}`,
          // publishDay が無い/壊れている記事でも落ちないようにする
          lastmod: getPostLastmodYMD(post, dateNow),
          changefreq: 'daily',
          priority: '0.7'
        }
      }) ?? []

  return defaultFields.concat(postFields, categoryFields)
}

function getUniqueFields(fields) {
  const uniqueFieldsMap = new Map()

  const timeOf = ymd => {
    const d = new Date(ymd)
    const t = d.getTime()
    return Number.isNaN(t) ? 0 : t
  }

  fields.forEach(field => {
    const existingField = uniqueFieldsMap.get(field.loc)
    if (!existingField || timeOf(field.lastmod) > timeOf(existingField.lastmod)) {
      uniqueFieldsMap.set(field.loc, field)
    }
  })

  return Array.from(uniqueFieldsMap.values())
}

export default () => {}
