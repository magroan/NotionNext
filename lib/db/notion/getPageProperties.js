// lib/db/notion/getPageProperties.js

import BLOG from '@/blog.config'
import {
  getAllSelectTags,
  getDateValue,
  getTextContent
} from '@/lib/notion/getNotionValue'
import { siteConfig } from '@/lib/config'
import {
  convertUrlStartWithOneSlash,
  getLastSegmentFromUrl,
  isHttpLink,
  isMailOrTelLink
} from '../../utils'
import { extractLangPrefix } from '../../utils/pageId'
import { mapImgUrl } from '../../plugins/image'

// import { createHash } from 'crypto'

/**
 * getPageProperties 获取Notion Page的属性
 * @param {*} id
 * @param {*} page
 * @param {*} block
 * @param {*} tagOptions
 * @param {*} NOTION_CONFIG
 * @returns
 */
export async function getPageProperties(
  id,
  page,
  block,
  tagOptions,
  NOTION_CONFIG
) {
  const props = page?.properties

  // console.log('page: ', id, page)
  // console.log('block: ', id, block)
  // console.log('props: ', id, props)

  // Notion Page 原始数据
  const value = {
    // Notion PageId
    id,
    // Notion Page的URL
    // 原版 Notion URL for restore.
    // pageUrl: `https://www.notion.so/${id.replace(/-/g, '')}`,
    // pageUrl: `https://www.notion.so/${BLOG.NOTION_PAGE_ID.replace(
    //   /-/g,
    //   ''
    // )}?p=${id.replace(/-/g, '')}`,

    // 生成Notion Pageurl
    // 对于数据库类型id的URL则兼容pageId方式，便于区分路由
    pageUrl: `https://www.notion.so/${BLOG.NOTION_PAGE_ID.replace(
      /-/g,
      ''
    )}?p=${id.replace(/-/g, '')}${
      extractLangPrefix(NOTION_CONFIG) === 'en-US' ? '&locale=en' : ''
    }`,

    // 生成短链，缩短url
    // short_id: createHash('md5').update(id).digest('hex'),
    // source_id: createHash('md5').update(id).digest('hex'),

    // This is the created time of the page, not the created time of the post.
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    // Notion Page标题
    title: getTextContent(props?.title),
    // Notion Page摘要/简介
    summary: props?.summary?.rich_text
      ? getTextContent(props?.summary)
      : props?.summary?.title
        ? getTextContent(props?.summary)
        : null,
    // Notion Page 的完整内容
    // content: block,

    // Notion Page 标签
    // tags: getAllTags(props?.tags, tagOptions),
    tags: getAllSelectTags(props?.tags) || getAllSelectTags(props?.tag),
    // 主题
    category: getAllSelectTags(props?.category),
    // slug
    slug: getTextContent(props?.slug) || getLastSegmentFromUrl(props?.pageUrl),
    // publishDate
    publishDate: getDateValue(props?.publishDate || props?.date, value),
    // Notion Page 封面图
    pageCover: page.cover?.external?.url || page.cover?.file?.url,
    // Notion Page Icon
    pageIcon: page.icon?.external?.url || page.icon?.file?.url || page.icon?.emoji,
    // Notion Page图片/附件
    // pageImgSrc: pageImgSrc,
    // Notion Page短摘要
    // short_description: short_description,
    // Notion Page是否置顶
    isTop: props?.top ? !!props?.top?.checkbox : false,
    // Notion Page是否推荐
    isRecommend: props?.recommend ? !!props?.recommend?.checkbox : false,
    // Notion Page是否隐藏
    isHidden: props?.hidden ? !!props?.hidden?.checkbox : false,
    // Notion Page是否允许评论
    allowComment: props?.allowComment ? !!props?.allowComment?.checkbox : true,
    // Notion Page状态
    status: getTextContent(props?.status)
      ? getTextContent(props?.status)
      : null,
    // Notion Page类型
    type: getTextContent(props?.type)
      ? getTextContent(props?.type)
      : null,
    // Notion Page阅读次数
    // viewCount: 0,
    // Notion Page点赞次数
    // likeCount: 0,
    // Notion Page评论次数
    // commentCount: 0,
    // Notion Page留言次数
    // commentCount: 0,
    // Notion Page内容是否全文展示
    fullWidth: props?.fullWidth ? !!props?.fullWidth?.checkbox : false,
    // Notion Page是否允许分享
    allowShare: props?.allowShare ? !!props?.allowShare?.checkbox : true,
    // Notion Page是否允许下载
    allowDownload: props?.allowDownload ? !!props?.allowDownload?.checkbox : true
  }

  // 其他兼容字段
  value.pageCoverThumbnail = mapImgUrl(value.pageCover, NOTION_CONFIG)
  value.pageCover = mapImgUrl(value.pageCover, NOTION_CONFIG)
  value.pageIcon = mapImgUrl(value.pageIcon, NOTION_CONFIG)

  // 将 Notion Config 表里所有字段都纳入 value （以便主题使用自定义字段）
  for (const key in props) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      // rich_text 或 title
      if (props[key]?.rich_text || props[key]?.title) {
        value[key] = getTextContent(props[key])
      } else if (props[key]?.checkbox !== undefined) {
        value[key] = !!props[key]?.checkbox
      } else if (props[key]?.number !== undefined) {
        value[key] = props[key]?.number
      } else if (props[key]?.select || props[key]?.multi_select) {
        value[key] = getAllSelectTags(props[key])
      } else if (props[key]?.date) {
        value[key] = getDateValue(props[key], value)
      } else {
        // fallback
        value[key] = props[key]
      }
    }
  }

  return adjustPageProperties(value, block, tagOptions, NOTION_CONFIG)
}

/**
 * adjustPageProperties 校验与兼容字段
 * @param {*} properties
 * @param {*} block
 * @param {*} tagOptions
 * @param {*} NOTION_CONFIG
 * @returns
 */
export function adjustPageProperties(properties, block, tagOptions, NOTION_CONFIG) {
  const currentTime = new Date().getTime()

  // 兼容
  properties.date = properties.publishDate
    ? { start_date: formatDate(properties.publishDate, BLOG.LANG) }
    : properties.date
  properties.createdTime = properties.created_time
  properties.lastEditedTime = properties.last_edited_time

  // 发布日期(用于前端展示的字符串)
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)

  // 文章目录
  // properties.toc = getPageTableOfContents(block)
  // 所有标签字段都统一为 tags
  // properties.tags = getAllTags(properties.tags, tagOptions)
  // 兼容多标签字段
  properties.tags = getAllSelectTags(properties.tags) || getAllSelectTags(properties.tag)
  // 分类字段统一为 category
  properties.category = getAllSelectTags(properties.category) || []
  // properties.category = getAllTags(properties.category, tagOptions)

  // 置顶字段统一为 isTop
  properties.isTop = !!properties.isTop || !!properties.top
  // 推荐字段统一为 isRecommend
  properties.isRecommend = !!properties.isRecommend || !!properties.recommend
  // 隐藏字段统一为 isHidden
  properties.isHidden = !!properties.isHidden || !!properties.hidden
  // 评论字段统一为 allowComment
  properties.allowComment =
    properties.allowComment !== undefined
      ? properties.allowComment
      : properties.allowComment === undefined && properties.allowComment === null
        ? true
        : properties?.allowComment

  // 兼容 Notion 的 url（用于数据库类型文章）
  properties.slug = getLastSegmentFromUrl(properties.slug)

  // 自定义 URL 前缀（解决 Invalid time value：publishDay 不是 ISO 时不可 new Date）
  properties.slug = generateCustomizeSlug(properties, NOTION_CONFIG)

  // 标题 & 摘要缺失时兜底
  properties.title = properties.title || properties.name || properties.slug || ''
  properties.summary = properties.summary || properties.description || ''

  // 防止 publishDate 为空导致排序/比较异常
  if (!properties.publishDate) {
    properties.publishDate = currentTime
    properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
  }

  // 根据隐藏字段过滤
  if (properties.isHidden) {
    properties.status = 'Hidden'
  }

  return properties
}

/**
 * 格式化日期
 * @param {*} timestamp
 * @param {*} locale
 * @returns
 */
function formatDate(timestamp, locale = 'en-US') {
  if (!timestamp) return ''
  try {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return ''
    // en-US：MM/DD/YYYY, ja-JP：YYYY/MM/DD など locale 依存
    return date.toLocaleDateString(locale)
  } catch (e) {
    return ''
  }
}

/**
 * 自定义 slug 生成（POST_URL_PREFIX: "%year%/%month%/%day%" 等）
 * NOTE:
 * - publishDay は「表示用文字列」で locale により JS Date が解釈できず RangeError になり得る。
 * - そのため publishDate(ms) / ISO 日付を優先して利用する。
 * @param {*} postProperties
 * @param {*} NOTION_CONFIG
 * @returns
 */
function generateCustomizeSlug(postProperties, NOTION_CONFIG) {
  // 外链不处理
  if (isHttpLink(postProperties?.slug)) {
    return postProperties?.slug
  }

  // URL 前缀既可能来自 NotionConfig 表，也可能来自 blog.config.js
  // 重要：NOTION_CONFIG 可能为空，必须做兜底
  const postUrlPrefix =
    NOTION_CONFIG?.POST_URL_PREFIX ||
    siteConfig('POST_URL_PREFIX', BLOG.POST_URL_PREFIX, NOTION_CONFIG)

  // 未自定义（或等同默认）则保持原 slug
  if (!postUrlPrefix || postUrlPrefix === BLOG.POST_URL_PREFIX) {
    return postProperties?.slug
  }

  // 映射表：Category -> URL segment
  const prefixCategoryMap = siteConfig(
    'POST_URL_PREFIX_MAPPING_CATEGORY',
    {},
    NOTION_CONFIG
  )

  // slug 本体
  const slugPart = postProperties?.slug || postProperties?.id
  if (!slugPart) {
    return postProperties?.slug
  }

  // ---- 安全な日付解釈 -------------------------------------------------
  const pickDate = (...candidates) => {
    for (const v of candidates) {
      if (!v) continue

      // number (epoch ms)
      if (typeof v === 'number' && Number.isFinite(v)) {
        const d = new Date(v)
        if (!Number.isNaN(d.getTime())) return d
        continue
      }

      // string: ISO date/time
      if (typeof v === 'string') {
        const s = v.trim()
        if (!s) continue
        const d = new Date(s)
        if (!Number.isNaN(d.getTime())) return d
        continue
      }

      // object like { start_date: 'YYYY-MM-DD' }
      if (typeof v === 'object') {
        const s = v?.start_date || v?.date || v?.start
        if (typeof s === 'string' && s.trim()) {
          const d = new Date(s.trim())
          if (!Number.isNaN(d.getTime())) return d
        }
      }
    }
    return null
  }

  const d = pickDate(
    postProperties?.publishDate, // number (ms)
    postProperties?.date?.start_date, // ISO string
    postProperties?.created_time, // ISO string
    postProperties?.lastEditedTime, // ISO string
    postProperties?.publishDay // display string (last resort)
  )

  const ymd = d
    ? {
        year: d.getUTCFullYear().toString(),
        month: (d.getUTCMonth() + 1).toString().padStart(2, '0'),
        day: d.getUTCDate().toString().padStart(2, '0')
      }
    : null
  // ---------------------------------------------------------------------

  // "/%year%/%month%/%day%" のような値を想定
  const patterns = String(postUrlPrefix)
    .split('/')
    .map(s => s.trim())
    .filter(Boolean)

  const parts = []
  for (const pattern of patterns) {
    switch (pattern) {
      case '%year%':
        if (ymd) parts.push(ymd.year)
        break
      case '%month%':
        if (ymd) parts.push(ymd.month)
        break
      case '%day%':
        if (ymd) parts.push(ymd.day)
        break
      case '%category%': {
        const categories = Array.isArray(postProperties?.category)
          ? postProperties.category
          : postProperties?.category
            ? [postProperties.category]
            : []

        if (categories.length > 0) {
          const c0 = categories[0]
          const mapped = prefixCategoryMap?.[c0] ?? c0
          if (mapped) parts.push(mapped)
        }
        break
      }
      case '%slug%':
        parts.push(slugPart)
        break
      default:
        // そのまま固定文字列として扱う
        parts.push(pattern)
        break
    }
  }

  // prefix を組み立て（空要素を除去）
  const prefix = '/' + parts.filter(Boolean).join('/')

  // %slug% を含まない場合のみ末尾に slug を付ける（二重 slug 防止）
  const finalPath = patterns.includes('%slug%')
    ? prefix
    : `${prefix}/${slugPart}`

  // スラッシュ正規化
  return convertUrlStartWithOneSlash(finalPath.replace(/\/+/g, '/'))
}
