import BLOG from '@/blog.config'
import NotionPage from '@/components/NotionPage'
import { getPostBlocks } from '@/lib/db/getSiteData'
import { Feed } from 'feed'
import fs from 'fs'
import ReactDOMServer from 'react-dom/server'
import { decryptEmail } from '@/lib/plugins/mailEncrypt'

/**
 * 安全に Date を生成するヘルパー
 */
function safeDate(input) {
  if (!input) return new Date(0)

  // ISO 8601 に正規化
  let s = String(input).trim()

  // "2025/02/01" → "2025-02-01"
  s = s.replace(/\//g, '-')

  // Date が valid かチェック
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d

  // タイムスタンプ(number) の可能性
  if (!isNaN(Number(s))) {
    const d2 = new Date(Number(s))
    if (!isNaN(d2.getTime())) return d2
  }

  // それでもダメなら epoch にフォールバック
  return new Date(0)
}

/**
 * 生成RSS内容
 * @param {*} post
 * @returns
 */
const createFeedContent = async post => {
  // パスワード記事は要約のみ
  if (post.password && post.password !== '') {
    return post.summary
  }

  const blockMap = await getPostBlocks(post.id, 'rss-content')
  if (blockMap) {
    post.blockMap = blockMap
    const content = ReactDOMServer.renderToString(<NotionPage post={post} />)

    const regexExp =
      /<div class="notion-collection-row"><div class="notion-collection-row-body"><div class="notion-collection-row-property"><div class="notion-collection-column-title"><svg.*?class="notion-collection-column-title-icon">.*?<\/svg><div class="notion-collection-column-title-body">.*?<\/div><\/div><div class="notion-collection-row-value">.*?<\/div><\/div><\/div><\/div>/g

    return content.replace(regexExp, '')
  }
}

/**
 * 生成RSS数据
 * @param {*} props
 */
export async function generateRss(props) {
  const { NOTION_CONFIG, siteInfo, latestPosts } = props
  const TITLE = siteInfo?.title
  const DESCRIPTION = siteInfo?.description
  const LINK = siteInfo?.link
  const AUTHOR = NOTION_CONFIG?.AUTHOR || BLOG.AUTHOR
  const LANG = NOTION_CONFIG?.LANG || BLOG.LANG
  const SUB_PATH = NOTION_CONFIG?.SUB_PATH || BLOG.SUB_PATH
  const CONTACT_EMAIL = decryptEmail(
    NOTION_CONFIG?.CONTACT_EMAIL || BLOG.CONTACT_EMAIL
  )

  // 10分以内に更新済みならスキップ
  if (isFeedRecentlyUpdated('./public/rss/feed.xml', 10)) {
    return
  }

  console.log('[RSS$8BA2$9605] 生成/rss/feed.xml')
  const year = new Date().getFullYear()

  const feed = new Feed({
    title: TITLE,
    description: DESCRIPTION,
    link: `${LINK}/${SUB_PATH}`,
    language: LANG,
    favicon: `${LINK}/favicon.png`,
    copyright: `All rights reserved ${year}, ${AUTHOR}`,
    author: {
      name: AUTHOR,
      email: CONTACT_EMAIL,
      link: LINK
    }
  })

  for (const post of latestPosts) {
    // publishDay/publishDate がどちらも壊れていても安全
    const pubDate =
      safeDate(post?.publishDay) ||
      safeDate(post?.publishDate) ||
      new Date(0)

    feed.addItem({
      title: post.title,
      link: `${LINK}/${post.slug}`,
      description: post.summary,
      content: await createFeedContent(post),
      //date: pubDate
      date: new Date(post?.publishDay)	
    })
  }

  try {
    fs.mkdirSync('./public/rss', { recursive: true })
    fs.writeFileSync('./public/rss/feed.xml', feed.rss2())
    fs.writeFileSync('./public/rss/atom.xml', feed.atom1())
    fs.writeFileSync('./public/rss/feed.json', feed.json1())
  } catch (error) {
    // Vercel 本番環境は read-only のためここは無視
  }
}

/**
 * feed.xml の更新チェック
 */
function isFeedRecentlyUpdated(filePath, intervalMinutes = 60) {
  try {
    const stats = fs.statSync(filePath)
    const now = new Date()
    const lastModified = new Date(stats.mtime)
    const timeDifference = (now - lastModified) / (1000 * 60)
    return timeDifference < intervalMinutes
  } catch (error) {
    return false
  }
}
