/* eslint-disable */
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getPostBlocks } from '@/lib/notion'
import { createHash } from 'crypto'
import fs from 'fs'
import { Feed } from 'feed'
import NotionPage from '@/components/NotionPage'
import ReactDOMServer from 'react-dom/server'

function toValidDate(input) {
  if (input == null) return null

  // number: ms or seconds
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

function getPostDate(post) {
  // 新系: publishDate / lastEditedDate（数値）
  // 旧系: publishDay / lastEditedDay（文字列）
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
    if (d) return d
  }
  return new Date()
}

function joinUrl(base, ...paths) {
  const b = String(base || '').replace(/\/+$/, '')
  const p = paths
    .filter(Boolean)
    .map(s => String(s).replace(/^\/+/, '').replace(/\/+$/, ''))
    .filter(Boolean)
    .join('/')
  return p ? `${b}/${p}` : b
}

async function createFeedContent(post) {
  // Password-protected support (same behavior as upstream)
  if (BLOG.POST_LIST_PREVIEW === 'true' && post?.password) {
    return post?.summary || ''
  }

  const authToken = createHash('md5').update(post?.password || '').digest('hex')
  const blockMap =
    post?.password && authToken !== post?.authToken ? null : await getPostBlocks(post?.id, 'rss')

  // 取得できない場合は summary にフォールバック
  if (!blockMap) return post?.summary || ''

  // NotionPage を SSR して HTML にする（引数なし renderToString を避ける）
  const html = ReactDOMServer.renderToString(<NotionPage post={post} blockMap={blockMap} />)

  // RSS向けに不要になりがちなものを掃除（既存の方針を維持）
  const regexExp =
    /<div class="notion-viewport">.*?<\/div>|<div class="notion-table-of-contents">.*?<\/div>|<div class="notion-bookmark">.*?<\/div>|<div class="notion-code-copy">.*?<\/div>|<div class="notion-equation">.*?<\/div>|<div class="notion-callout-text">.*?<\/div>|<div class="notion-sync-block">.*?<\/div>|<div class="notion-header">.*?<\/div>|<div class="notion-footer">.*?<\/div>|<div class="notion-content">.*?<\/div>|<div class="notion-recommend">.*?<\/div>|<div class="notion-nav">.*?<\/div>|<div class="notion-breadcrumb">.*?<\/div>|<div class="notion-copyright">.*?<\/div>|<div class="notion-collection">.*?<\/div>/gms

  return String(html || '').replace(regexExp, '')
}

export default async function generateRss(props) {
  const config = props?.siteInfo || props?.NOTION_CONFIG

  const LINK = siteConfig('LINK', BLOG.LINK, config)
  const SUB_PATH = siteConfig('SUB_PATH', BLOG.SUB_PATH, config)
  const AUTHOR = siteConfig('AUTHOR', BLOG.AUTHOR, config)
  const DESCRIPTION = siteConfig('DESCRIPTION', BLOG.DESCRIPTION, config)
  const SINCE_DATE = siteConfig('SINCE_DATE', BLOG.SINCE_DATE, config)

  const baseLink = joinUrl(LINK, SUB_PATH)

  const feed = new Feed({
    title: AUTHOR,
    description: DESCRIPTION,
    id: baseLink,
    link: baseLink,
    language: BLOG.LANG,
    favicon: joinUrl(LINK, 'favicon.ico'),
    copyright: 'All rights reserved 2025, ' + AUTHOR,
    updated: new Date(),
    feedLinks: {
      rss2: joinUrl(baseLink, 'rss/feed.xml')
    },
    author: {
      name: AUTHOR
    }
  })

  const allPages = props?.allPages || []
  allPages
    .filter(p => !p?.password)
    .filter(post => {
      if (!SINCE_DATE) return true
      const since = toValidDate(SINCE_DATE)
      if (!since) return true
      return getPostDate(post).getTime() >= since.getTime()
    })
    .forEach(async post => {
      try {
        feed.addItem({
          title: post?.title || '',
          id: joinUrl(LINK, post?.slug),
          link: joinUrl(LINK, post?.slug),
          description: post?.summary || '',
          content: await createFeedContent(post),
          date: getPostDate(post)
        })
      } catch (e) {
        // RSS生成で1件落ちても全体を殺さない
        console.warn('[RSS] skip post due to error:', post?.id, e?.message || e)
      }
    })

  const rssDir = `${process.cwd()}/public/rss`
  if (!fs.existsSync(rssDir)) fs.mkdirSync(rssDir, { recursive: true })

  fs.writeFileSync(`${rssDir}/feed.xml`, feed.rss2())
  console.log('[RSS订阅] 生成/rss/feed.xml')
}
