import BLOG from '@/blog.config'
import { getPostBlocks } from '@/lib/notion'
import { deepClone, getTextContent } from './index'
import { siteConfig } from '../config'
import { isUrlLikePath } from './url'

const parseDate = v => {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

/**
 * RSS 订阅
 */
export async function generateRssXml({ allPages, postCount, NOTION_CONFIG }) {
  const link = siteConfig('LINK', BLOG.LINK, NOTION_CONFIG)
  const rssFeed = {
    title: siteConfig('TITLE', BLOG.TITLE, NOTION_CONFIG),
    link: link,
    description: siteConfig('DESCRIPTION', BLOG.DESCRIPTION, NOTION_CONFIG),
    language: siteConfig('LANG', BLOG.LANG, NOTION_CONFIG),
    pubDate: new Date().toUTCString(),
    lastBuildDate: new Date().toUTCString()
  }

  const rssItems = []
  const maxCount = Math.min(postCount || 10, 9999)
  const posts = deepClone(allPages)
    .filter(post => post.type === 'Post' && post.status === 'Published')
    .slice(0, maxCount)

  for (const post of posts) {
    const blocks = await getPostBlocks(post?.id, 'rss')
    const content = blocks?.map(b => getTextContent(b?.paragraph?.text))?.join('\n')

    // publishDay はローカライズ文字列になり得るため、Date には publishDate 等を使う
    const d =
      parseDate(post?.publishDate) ||
      parseDate(post?.lastEditedTime) ||
      parseDate(post?.date?.start_date) ||
      new Date()

    rssItems.push({
      title: post.title,
      link: `${link}/${post.slug}`,
      guid: post.id,
      pubDate: d.toUTCString(),
      description: post.summary,
      content: content
    })
  }

  const rss = createRssXml(rssFeed, rssItems)
  return rss
}

function createRssXml(rssFeed, rssItems) {
  const itemsXml = rssItems
    .map(item => {
      return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid>${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      <content:encoded><![CDATA[${item.content}]]></content:encoded>
    </item>
    `
    })
    .join('')

  return `
  <rss version="2.0"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title><![CDATA[${rssFeed.title}]]></title>
      <link>${rssFeed.link}</link>
      <description><![CDATA[${rssFeed.description}]]></description>
      <language>${rssFeed.language}</language>
      <pubDate>${rssFeed.pubDate}</pubDate>
      <lastBuildDate>${rssFeed.lastBuildDate}</lastBuildDate>
      <atom:link href="${rssFeed.link}/rss/feed.xml" rel="self" type="application/rss+xml" />
      ${itemsXml}
    </channel>
  </rss>
  `
}
