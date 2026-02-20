// pages/sitemap.xml.js
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { extractLangId, extractLangPrefix } from '@/lib/utils/pageId'
import { getServerSideSitemap } from 'next-sitemap'

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

export const getServerSideProps = async ctx => {
  let fields = []
  const siteIds = BLOG.NOTION_PAGE_ID.split(',')

  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const id = extractLangId(siteId)
    const locale = extractLangPrefix(siteId)

    const siteData = await fetchGlobalAllData({
      pageId: id,
      from: 'sitemap.xml'
    })
    const link = siteConfig(
      'LINK',
      siteData?.siteInfo?.link,
      siteData.NOTION_CONFIG
    )
    const localeFields = generateLocalesSitemap(link, siteData.allPages, locale)
    fields = fields.concat(localeFields)
  }

  fields = getUniqueFields(fields)

  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=59'
  )
  return getServerSideSitemap(ctx, fields)
}

function generateLocalesSitemap(link, allPages, locale) {
  if (link && link.endsWith('/')) link = link.slice(0, -1)
  if (locale && locale.length > 0 && locale.indexOf('/') !== 0) locale = '/' + locale

  const dateNow = ymd(new Date())
  const defaultFields = [
    { loc: `${link}${locale}`, lastmod: dateNow, changefreq: 'daily', priority: '0.7' },
    { loc: `${link}${locale}/archive`, lastmod: dateNow, changefreq: 'daily', priority: '0.7' },
    { loc: `${link}${locale}/category`, lastmod: dateNow, changefreq: 'daily', priority: '0.7' },
    { loc: `${link}${locale}/rss/feed.xml`, lastmod: dateNow, changefreq: 'daily', priority: '0.7' },
    { loc: `${link}${locale}/search`, lastmod: dateNow, changefreq: 'daily', priority: '0.7' },
    { loc: `${link}${locale}/tag`, lastmod: dateNow, changefreq: 'daily', priority: '0.7' }
  ]

  const postFields =
    allPages
      ?.filter(p => p.status === BLOG.NOTION_PROPERTY_NAME.status_publish)
      ?.map(post => {
        const slugWithoutLeadingSlash = post?.slug?.startsWith('/')
          ? post.slug.slice(1)
          : post.slug
        return {
          loc: `${link}${locale}/${slugWithoutLeadingSlash}`,
          lastmod: safeYMDFromPost(post),
          changefreq: 'daily',
          priority: '0.7'
        }
      }) ?? []

  return defaultFields.concat(postFields)
}

function getUniqueFields(fields) {
  const uniqueFieldsMap = new Map()

  const toTime = s => {
    const d = new Date(s)
    const t = d.getTime()
    return Number.isNaN(t) ? 0 : t
  }

  fields.forEach(field => {
    const existingField = uniqueFieldsMap.get(field.loc)
    if (!existingField || toTime(field.lastmod) > toTime(existingField.lastmod)) {
      uniqueFieldsMap.set(field.loc, field)
    }
  })

  return Array.from(uniqueFieldsMap.values())
}

export default () => {}
