import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPostBlocks } from '@/lib/db/getSiteData'
import { generateRobotsTxt } from '@/lib/robots.txt'
import { generateRss } from '@/lib/rss'
import { generateSitemapXml } from '@/lib/sitemap.xml'
import { DynamicLayout } from '@/themes/theme'
import { generateRedirectJson } from '@/lib/redirect'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'

/**
 * 首页布局
 * @param {*} props
 * @returns
 */
const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

/**
 * help: 日付が壊れている post を探す
 */
function findInvalidDatePosts(posts) {
  if (!Array.isArray(posts)) return []

  const bad = []

  for (const p of posts) {
    // publishDate / lastEditedDate / publishDay を検査
    const candidates = [
      ['publishDate', p?.publishDate],
      ['lastEditedDate', p?.lastEditedDate],
      ['publishDay', p?.publishDay]
    ]

    for (const [name, value] of candidates) {
      if (!value) continue
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) {
        bad.push({
          slug: p.slug,
          title: p.title,
          field: name,
          value
        })
      }
    }
  }

  return bad
}

/**
 * help: NaN になる日付をとりあえず安全な値に補正する
 */
function normalizePostDates(posts) {
  if (!Array.isArray(posts)) return posts

  return posts.map(p => {
    const fixed = { ...p }

    const fixField = fieldName => {
      const v = fixed[fieldName]
      if (!v) return
      const d = new Date(v)
      if (Number.isNaN(d.getTime())) {
        // フォーマットがおかしい or 文字列じゃない
        console.warn(
          '[normalizePostDates] invalid date field',
          fieldName,
          'slug =',
          fixed.slug,
          'raw =',
          v
        )
        // とりあえず 1970-01-01 に補正
        fixed[fieldName] = '1970-01-01'
      }
    }

    fixField('publishDate')
    fixField('lastEditedDate')
    fixField('publishDay')

    return fixed
  })
}

/**
 * SSG 获取数据
 * @returns
 */
export async function getStaticProps(req) {
  const { locale } = req
  const from = 'index'
  const props = await getGlobalData({ from, locale })
  const POST_PREVIEW_LINES = siteConfig(
    'POST_PREVIEW_LINES',
    12,
    props?.NOTION_CONFIG
  )
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )

  // ★ ここで「壊れた日付を検出」してログを出す
  const bad = findInvalidDatePosts(props.posts)
  if (bad.length > 0) {
    console.warn('==== [DEBUG] invalid date posts detected ====')
    console.warn(JSON.stringify(bad, null, 2))
  }

  // ★ 暫定対処：壊れた日付を安全な値にしておく
  props.posts = normalizePostDates(props.posts)

  // 处理分页
  if (siteConfig('POST_LIST_STYLE') === 'scroll') {
    // 滚动列表默认给前端返回所有数据
  } else if (siteConfig('POST_LIST_STYLE') === 'page') {
    props.posts = props.posts?.slice(
      0,
      siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
    )
  }

  // 预览文章内容
  if (siteConfig('POST_LIST_PREVIEW', false, props?.NOTION_CONFIG)) {
    for (const i in props.posts) {
      const post = props.posts[i]
      if (post.password && post.password !== '') {
        continue
      }
      post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
    }
  }

  // 生成robotTxt
  generateRobotsTxt(props)
  // 生成Feed订阅
  generateRss(props)
  // 生成
  generateSitemapXml(props)
  // 检查数据是否需要从algolia删除
  checkDataFromAlgolia(props)
  if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
    // 生成重定向 JSON
    generateRedirectJson(props)
  }

  delete props.allPages

  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default Index
