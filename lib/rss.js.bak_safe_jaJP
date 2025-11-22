import BLOG from '@/blog.config'
import NotionPage from '@/components/NotionPage'
import { getPostBlocks } from '@/lib/db/getSiteData'
import { Feed } from 'feed'
import fs from 'fs'
import ReactDOMServer from 'react-dom/server'
import { decryptEmail } from '@/lib/plugins/mailEncrypt'

/**
 * 与えられた値から安全に Date オブジェクトを生成する
 * - 文字列 / 数値 / undefined などを許容し、無効な場合は null を返す
 * @param {*} value
 * @returns {Date|null}
 */
function safeParseDate(value) {
  if (!value) return null

  // すでに Date の場合
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  // 数値（タイムスタンプ）の場合
  if (typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }

  // 文字列の場合（"YYYY-MM-DD" / ISO 文字列 など）
  if (typeof value === 'string') {
    // まずはそのままパース
    let d = new Date(value)
    if (!isNaN(d.getTime())) return d

    // "YYYY-MM-DDTHH:mm:ss" のような文字列から日付部分だけ抜き出す保険
    const m = value.match(/\d{4}-\d{2}-\d{2}/)
    if (m) {
      d = new Date(m[0])
      if (!isNaN(d.getTime())) return d
    }
  }

  return null
}

/**
 * 投稿オブジェクトから RSS 用の日付を安全に取得する
 * 優先順:
 *   1. post.publishDay
 *   2. post.publishDate
 *   3. post.date.start_date
 * いずれもダメな場合は、ビルドが落ちないように「現在時刻」を返す
 * @param {*} post
 * @returns {Date}
 */
function getPostDateForFeed(post) {
  const candidates = [
    post?.publishDay,
    post?.publishDate,
    post?.date?.start_date,
    post?.date
  ]

  for (const c of candidates) {
    const d = safeParseDate(c)
    if (d) return d
  }

  // どうしても正しい日付が取れない場合は現在時刻でフォールバック
  return new Date()
}

/**
 * RSS 用の HTML コンテンツ生成
 * @param {*} post
 * @returns
 */
const createFeedContent = async post => {
  // パスワード付き記事は概要だけ
  if (post.password && post.password !== '') {
    return post.summary
  }

  const blockMap = await getPostBlocks(post.id, 'rss-content')
  if (blockMap) {
    post.blockMap = blockMap
    const content = ReactDOMServer.renderToString(<NotionPage post={post} />)

    // コレクションビュー(一覧テーブル)だけを削除する正規表現
    const regexExp =
      /<div class="notion-collection-row"><div class="notion-collection-row-body"><div class="notion-collection-row-property"><div class="notion-collection-column-title"><svg.*?class="notion-collection-column-title-icon">.*?<\/svg><div class="notion-collection-column-title-body">.*?<\/div><\/div><div class="notion-collection-row-value">.*?<\/div><\/div><\/div><\/div>/g

    return content.replace(regexExp, '')
  }
}

/**
 * RSS データ生成
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

  // 直近 interval 分以内に更新済みならスキップ
  if (isFeedRecentlyUpdated('./public/rss/feed.xml', 10)) {
    return
  }

  console.log('[RSS購読] 生成/rss/feed.xml')
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

  // 各記事を RSS に追加
  for (const post of latestPosts || []) {
    const date = getPostDateForFeed(post) // ★ここで必ず有効な Date を渡す

    feed.addItem({
      title: post.title,
      link: `${LINK}/${post.slug}`,
      description: post.summary,
      content: await createFeedContent(post),
      date
    })
  }

  try {
    fs.mkdirSync('./public/rss', { recursive: true })
    fs.writeFileSync('./public/rss/feed.xml', feed.rss2())
    fs.writeFileSync('./public/rss/atom.xml', feed.atom1())
    fs.writeFileSync('./public/rss/feed.json', feed.json1())
  } catch (error) {
    // Vercel のサーバーレス環境では書き込みに失敗しても問題ない
    // VPS 等で動かす場合のみ実際にファイルが生成される
  }
}

/**
 * 前回更新から intervalMinutes 分以内なら true を返す
 * @param {*} filePath
 * @param {*} intervalMinutes
 * @returns
 */
function isFeedRecentlyUpdated(filePath, intervalMinutes = 60) {
  try {
    const stats = fs.statSync(filePath)
    const now = new Date()
    const lastModified = new Date(stats.mtime)
    const timeDifference = (now - lastModified) / (1000 * 60) // 分
    return timeDifference < intervalMinutes
  } catch (error) {
    // ファイルがない場合は常に再生成
    return false
  }
}
