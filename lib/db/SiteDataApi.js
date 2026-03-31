import BLOG from '@/blog.config'
import { getOrSetDataWithCache } from '../cache/cache_manager'
import { getAllCategories } from '@/lib/db/notion/getAllCategories'
import getAllPageIds from '@/lib/db/notion/getAllPageIds'
import { getAllTags } from '@/lib/db/notion/getAllTags'
import { getConfigMapFromConfigPage } from '@/lib/db/notion/getNotionConfig'
import getPageProperties, {
  adjustPageProperties
} from '@/lib/db/notion/getPageProperties'
import {
  fetchInBatches,
  fetchNotionPageBlocks,
  formatNotionBlock
} from '@/lib/db/notion/getPostBlocks'
import { compressImage, mapImgUrl } from '@/lib/db/notion/mapImage'
import { deepClone } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import { siteConfig } from '../config'
import {
  extractLangId,
  extractLangPrefix,
  getShortId
} from '../utils/pageId'
import {
  normalizeNotionMetadata,
  normalizeCollection,
  normalizeSchema,
  normalizePageBlock
} from './notion/normalizeUtil'

import { fetchPageFromNotion } from './notion/getNotionPost'
import { processPostData } from '../utils/post'
import { adapterNotionBlockMap } from '../utils/notion.util'

export { getAllTags } from './notion/getAllTags'
export { fetchPageFromNotion as getPost } from './notion/getNotionPost'
export { fetchNotionPageBlocks as getPostBlocks } from './notion/getPostBlocks'

export async function getAllPosts(params = {}) {
  return await fetchGlobalAllData(params)
}

export async function fetchGlobalAllData({
  pageId = BLOG.NOTION_PAGE_ID,
  from,
  locale
}) {
  const siteIds = pageId?.split(',') || []
  let data = EmptyData(pageId)

  if (BLOG.BUNDLE_ANALYZER) {
    return data
  }

  try {
    for (let index = 0; index < siteIds.length; index++) {
      const siteId = siteIds[index]
      const id = extractLangId(siteId)
      const prefix = extractLangPrefix(siteId)

      if (index === 0 || locale === prefix) {
        data = await getSiteDataByPageId({
          pageId: id,
          from
        })
      }
    }
  } catch (error) {
    console.error('全体データ取得中に例外が発生しました', error)
  }

  return handleDataBeforeReturn(deepClone(data))
}

export async function getSiteDataByPageId({ pageId, from }) {
  const originalPageRecordMap = await getOrSetDataWithCache(
    `site_data_${pageId}`,
    async (pageIdValue, fromValue) => {
      const pageRecordMap = await fetchNotionPageBlocks(pageIdValue, fromValue)
      return pageRecordMap
    },
    pageId,
    from
  )

  return convertNotionToSiteData(
    pageId,
    from,
    deepClone(originalPageRecordMap)
  )
}

async function getNotice(post) {
  if (!post) {
    return null
  }

  try {
    const blockMap = await fetchNotionPageBlocks(post.id, 'data-notice')
    if (blockMap?.block) {
      post.blockMap = blockMap
    } else {
      post.blockMap = null
      console.warn('お知らせページの本文取得に失敗しました', post.id)
    }
  } catch (error) {
    post.blockMap = null
    console.warn('お知らせページの本文取得中に例外が発生しました', post.id, error)
  }

  return post
}

const EmptyData = pageId => {
  return {
    notice: null,
    siteInfo: getSiteInfo({}),
    allPages: [
      {
        id: 1,
        title: `Notionのデータを取得できませんでした。Notion IDを確認してください。現在の値: ${pageId}`,
        summary: '設定を確認してください。',
        status: 'Published',
        type: 'Post',
        slug: 'oops',
        publishDay: '2024-11-13',
        pageCoverThumbnail: BLOG.HOME_BANNER_IMAGE || '/bg_image.jpg',
        date: {
          start_date: '2023-04-24',
          lastEditedDay: '2023-04-24',
          tagItems: []
        }
      }
    ],
    allNavPages: [],
    collection: [],
    collectionQuery: {},
    collectionId: null,
    collectionView: {},
    viewIds: [],
    block: {},
    schema: {},
    tagOptions: [],
    categoryOptions: [],
    rawMetadata: {},
    customNav: [],
    customMenu: [],
    postCount: 1,
    pageIds: [],
    latestPosts: []
  }
}

export async function resolvePostProps({
  prefix,
  slug,
  suffix,
  locale,
  from
}) {
  const segments = []
  if (prefix) segments.push(prefix)
  if (slug) segments.push(slug)
  if (Array.isArray(suffix)) segments.push(...suffix)

  const fullSlug = segments.join('/')
  const source = from || `slug-props-${fullSlug}`
  const lastSegment = segments[segments.length - 1]

  const slugCandidates = new Set([fullSlug, lastSegment, slug, prefix])

  for (const value of Array.from(slugCandidates)) {
    if (!value) {
      slugCandidates.delete(value)
    }
  }

  const props = await fetchGlobalAllData({ from: source, locale })

  let post = props?.allPages?.find(p => {
    if (!p || p?.type?.includes('Menu')) return false

    return (
      slugCandidates.has(p.slug) ||
      slugCandidates.has(p.slug?.split('/').pop()) ||
      slugCandidates.has(p.id) ||
      slugCandidates.has(idToUuid(p.id)) ||
      slugCandidates.has(idToUuid(fullSlug))
    )
  })

  if (!post && typeof lastSegment === 'string' && lastSegment.length >= 32) {
    try {
      post = await fetchPageFromNotion(lastSegment)
    } catch (error) {
      console.warn('ページIDからの記事取得に失敗しました', lastSegment, error)
    }
  }

  if (post && post.id && !post?.blockMap) {
    try {
      const rawBlockMap = await fetchNotionPageBlocks(post.id, source)

      if (rawBlockMap?.block) {
        const adaptedBlockMap = adapterNotionBlockMap(rawBlockMap)

        if (adaptedBlockMap?.block) {
          post.blockMap = {
            ...adaptedBlockMap,
            block: formatNotionBlock(adaptedBlockMap.block)
          }
        } else {
          post.blockMap = null
          console.warn('記事本文の変換後データが空でした', post.id)
        }
      } else {
        post.blockMap = null
        console.warn('記事本文の取得結果が空でした', post.id)
      }
    } catch (error) {
      post.blockMap = null
      console.warn('記事本文の取得に失敗しました', post.id, error)
    }
  }

  if (post) {
    props.post = post
    try {
      await processPostData(props, source)
    } catch (error) {
      console.warn('記事データの後処理に失敗しました', post.id, error)
    }
  } else {
    props.post = null
  }

  delete props.allPages

  return props
}

async function convertNotionToSiteData(
  SITE_DATABASE_PAGE_ID,
  from,
  pageRecordMap
) {
  if (!pageRecordMap) {
    console.error('Notionのデータを取得できませんでした', SITE_DATABASE_PAGE_ID)
    return {}
  }

  SITE_DATABASE_PAGE_ID = idToUuid(SITE_DATABASE_PAGE_ID)
  let block = pageRecordMap.block || {}
  const rawMetadata = normalizeNotionMetadata(block, SITE_DATABASE_PAGE_ID)

  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.error(`pageId "${SITE_DATABASE_PAGE_ID}" はデータベースではありません`)
    return EmptyData(SITE_DATABASE_PAGE_ID)
  }

  const collectionId = rawMetadata?.collection_id
  const rawCollection =
    pageRecordMap.collection?.[collectionId] ||
    pageRecordMap.collection?.[idToUuid(collectionId)] ||
    {}

  const collection = normalizeCollection(rawCollection)
  const collectionQuery = pageRecordMap.collection_query
  const collectionView = pageRecordMap.collection_view
  const schema = normalizeSchema(collection?.schema || {})
  const viewIds = rawMetadata?.view_ids
  const collectionData = []

  const pageIds = getAllPageIds(
    collectionQuery,
    collectionId,
    collectionView,
    viewIds
  )

  if (pageIds?.length === 0) {
    console.error(
      '記事一覧が空です。Notionのテンプレートまたは権限を確認してください',
      collectionQuery,
      collection,
      collectionView,
      viewIds,
      pageRecordMap
    )
  }

  const blockIdsNeedFetch = []
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const pageBlock = normalizePageBlock(block[id])
    if (!pageBlock) {
      blockIdsNeedFetch.push(id)
    }
  }

  const fetchedBlocks = await fetchInBatches(blockIdsNeedFetch)
  block = Object.assign({}, block, fetchedBlocks)

  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const rawBlock = block[id]
    const pageBlock = normalizePageBlock(rawBlock)

    if (!pageBlock) {
      console.warn('ページブロックを解析できませんでした', id)
      continue
    }

    const properties =
      (await getPageProperties(
        id,
        pageBlock,
        schema,
        null,
        getTagOptions(schema)
      )) || null

    if (properties) {
      collectionData.push(properties)
    }
  }

  const NOTION_CONFIG = (await getConfigMapFromConfigPage(collectionData)) || {}

  collectionData.forEach(element => {
    adjustPageProperties(element, NOTION_CONFIG)
  })

  const siteInfo = getSiteInfo({ collection, block, NOTION_CONFIG })

  let postCount = 0

  const allPages = collectionData.filter(post => {
    if (post?.type === 'Post' && post.status === 'Published') {
      postCount++
    }

    return (
      post &&
      post?.slug &&
      (post?.status === 'Invisible' || post?.status === 'Published')
    )
  })

  if (siteConfig('POSTS_SORT_BY', null, NOTION_CONFIG) === 'date') {
    allPages.sort((a, b) => {
      return getSortTimestamp(b) - getSortTimestamp(a)
    })
  }

  const notice = await getNotice(
    collectionData.filter(post => {
      return (
        post &&
        post?.type &&
        post?.type === 'Notice' &&
        post.status === 'Published'
      )
    })?.[0]
  )

  const categoryOptions = getAllCategories({
    allPages,
    categoryOptions: getCategoryOptions(schema)
  })

  const tagSchemaOptions = getTagOptions(schema)
  const tagOptions =
    getAllTags({
      allPages: allPages ?? [],
      tagOptions: tagSchemaOptions ?? [],
      NOTION_CONFIG
    }) ?? null

  const customNav = getCustomNav({
    allPages: collectionData.filter(
      post => post?.type === 'Page' && post.status === 'Published'
    )
  })

  const customMenu = getCustomMenu({ collectionData, NOTION_CONFIG })
  const latestPosts = getLatestPosts({ allPages, latestPostCount: 6 })
  const allNavPages = getNavPages({ allPages })

  return {
    NOTION_CONFIG,
    notice,
    siteInfo,
    allPages,
    allNavPages,
    collection,
    collectionQuery,
    collectionId,
    collectionView,
    viewIds,
    block,
    schema,
    tagOptions,
    categoryOptions,
    rawMetadata,
    customNav,
    customMenu,
    postCount,
    pageIds,
    latestPosts
  }
}

function handleDataBeforeReturn(db) {
  delete db.block
  delete db.schema
  delete db.rawMetadata
  delete db.pageIds
  delete db.viewIds
  delete db.collection
  delete db.collectionQuery
  delete db.collectionId
  delete db.collectionView

  if (db?.notice) {
    db.notice = cleanBlock(db.notice)
    delete db.notice?.id
  }

  db.categoryOptions = cleanIds(db?.categoryOptions)
  db.customMenu = cleanIds(db?.customMenu)
  db.allNavPages = shortenIds(db?.allNavPages)

  db.allNavPages = cleanPages(db?.allNavPages, db.tagOptions)
  db.allPages = cleanPages(db.allPages, db.tagOptions)
  db.latestPosts = cleanPages(db.latestPosts, db.tagOptions)
  db.tagOptions = cleanTagOptions(db?.tagOptions)

  const POST_SCHEDULE_PUBLISH = siteConfig(
    'POST_SCHEDULE_PUBLISH',
    null,
    db.NOTION_CONFIG
  )

  if (POST_SCHEDULE_PUBLISH) {
    db.allPages?.forEach(p => {
      const publish = isInRange(p.title, p.date)
      if (!publish) {
        p.status = 'Invisible'
      }
    })
  }

  return db
}

function cleanPages(allPages, tagOptions) {
  if (!Array.isArray(allPages) || !Array.isArray(tagOptions)) {
    console.warn('allPagesまたはtagOptionsが配列ではありません')
    return allPages || []
  }

  const validTags = new Set(
    tagOptions
      .map(tag => (typeof tag.name === 'string' ? tag.name : null))
      .filter(Boolean)
  )

  allPages.forEach(page => {
    if (Array.isArray(page.tagItems)) {
      page.tagItems = page.tagItems.filter(tagItem => {
        return (
          validTags.has(tagItem?.name) &&
          typeof tagItem.name === 'string'
        )
      })
    }
  })

  return allPages
}

function shortenIds(items) {
  if (items && Array.isArray(items)) {
    return deepClone(
      items.map(item => {
        item.short_id = getShortId(item.id)
        delete item.id
        return item
      })
    )
  }
  return items
}

function cleanIds(items) {
  if (items && Array.isArray(items)) {
    return deepClone(
      items.map(item => {
        delete item.id
        return item
      })
    )
  }
  return items
}

function cleanTagOptions(tagOptions) {
  if (tagOptions && Array.isArray(tagOptions)) {
    return deepClone(
      tagOptions
        .filter(tagOption => tagOption.source === 'Published')
        .map(({ id, source, ...newTagOption }) => newTagOption)
    )
  }
  return tagOptions
}

function cleanBlock(item) {
  const post = deepClone(item)
  const pageBlock = post?.blockMap?.block

  if (pageBlock) {
    for (const key in pageBlock) {
      pageBlock[key] = cleanBlock(pageBlock[key])
      delete pageBlock[key]?.role
      delete pageBlock[key]?.value?.version
      delete pageBlock[key]?.value?.created_by_table
      delete pageBlock[key]?.value?.created_by_id
      delete pageBlock[key]?.value?.last_edited_by_table
      delete pageBlock[key]?.value?.last_edited_by_id
      delete pageBlock[key]?.value?.space_id
      delete pageBlock[key]?.value?.format?.copied_from_pointer
      delete pageBlock[key]?.value?.format?.block_locked_by
      delete pageBlock[key]?.value?.parent_table
      delete pageBlock[key]?.value?.copied_from_pointer
      delete pageBlock[key]?.value?.copied_from
      delete pageBlock[key]?.value?.permissions
      delete pageBlock[key]?.value?.alive
    }
  }

  return post
}

function getLatestPosts({ allPages, latestPostCount }) {
  const allPosts = allPages?.filter(page => {
    return page.type === 'Post' && page.status === 'Published'
  })

  const latestPosts = Object.create(allPosts).sort((a, b) => {
    return getSortTimestamp(b) - getSortTimestamp(a)
  })

  return latestPosts.slice(0, latestPostCount)
}

function getCustomNav({ allPages }) {
  const customNav = []
  if (allPages && allPages.length > 0) {
    allPages.forEach(p => {
      p.to = p.slug
      customNav.push({
        icon: p.icon || null,
        name: p.title || p.name || '',
        href: p.href,
        target: p.target,
        show: true
      })
    })
  }
  return customNav
}

function getCustomMenu({ collectionData, NOTION_CONFIG }) {
  const menuPages = collectionData.filter(post => {
    return (
      post.status === 'Published' &&
      (post?.type === 'Menu' || post?.type === 'SubMenu')
    )
  })

  const menus = []
  if (menuPages && menuPages.length > 0) {
    menuPages.forEach(e => {
      e.show = true
      if (e.type === 'Menu') {
        menus.push(e)
      } else if (e.type === 'SubMenu') {
        const parentMenu = menus[menus.length - 1]
        if (parentMenu) {
          if (parentMenu.subMenus) {
            parentMenu.subMenus.push(e)
          } else {
            parentMenu.subMenus = [e]
          }
        }
      }
    })
  }

  return menus
}

function getTagOptions(schema) {
  if (!schema) return {}
  const tagSchema = Object.values(schema).find(e => {
    return e.name === BLOG.NOTION_PROPERTY_NAME.tags
  })
  return tagSchema?.options || []
}

function getCategoryOptions(schema) {
  if (!schema) return {}
  const categorySchema = Object.values(schema).find(e => {
    return e.name === BLOG.NOTION_PROPERTY_NAME.category
  })
  return categorySchema?.options || []
}

function getSiteInfo({ collection, block, NOTION_CONFIG }) {
  const defaultTitle = NOTION_CONFIG?.TITLE || 'NotionNext BLOG'
  const defaultDescription =
    NOTION_CONFIG?.DESCRIPTION || 'これはNotionNextで生成されたサイトです'
  const defaultPageCover = NOTION_CONFIG?.HOME_BANNER_IMAGE || '/bg_image.jpg'
  const defaultIcon = NOTION_CONFIG?.AVATAR || '/avatar.svg'
  const defaultLink = NOTION_CONFIG?.LINK || BLOG.LINK

  if (!collection && !block) {
    return {
      title: defaultTitle,
      description: defaultDescription,
      pageCover: defaultPageCover,
      icon: defaultIcon,
      link: defaultLink
    }
  }

  const title = collection?.name?.[0][0] || defaultTitle
  const description = collection?.description
    ? Object.assign(collection).description[0][0]
    : defaultDescription

  const pageCover = collection?.cover
    ? mapImgUrl(collection.cover, collection, 'collection')
    : defaultPageCover

  let icon = compressImage(
    collection?.icon
      ? mapImgUrl(collection.icon, collection, 'collection')
      : defaultIcon
  )

  const link = NOTION_CONFIG?.LINK || defaultLink

  const emojiPattern = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g
  if (!icon || emojiPattern.test(icon)) {
    icon = defaultIcon
  }

  return { title, description, pageCover, icon, link }
}

function isInRange(title, date = {}) {
  const {
    start_date,
    start_time = '00:00',
    end_date,
    end_time = '23:59',
    time_zone = 'Asia/Shanghai'
  } = date

  const currentTimestamp = Date.now()
  const startTimestamp = getTimestamp(start_date, start_time, time_zone)
  const endTimestamp = getTimestamp(end_date, end_time, time_zone)

  if (startTimestamp && currentTimestamp < startTimestamp) {
    return false
  }

  if (endTimestamp && currentTimestamp > endTimestamp) {
    return false
  }

  return true
}

function convertToUTC(dateStr, timeZone = 'Asia/Shanghai') {
  const timeZoneOffsets = {
    UTC: 0,
    'Etc/GMT': 0,
    'Etc/GMT+0': 0,
    'Asia/Shanghai': 8,
    'Asia/Taipei': 8,
    'Asia/Tokyo': 9,
    'Asia/Seoul': 9,
    'Asia/Kolkata': 5.5,
    'Asia/Jakarta': 7,
    'Asia/Singapore': 8,
    'Asia/Hong_Kong': 8,
    'Asia/Bangkok': 7,
    'Asia/Dubai': 4,
    'Asia/Tehran': 3.5,
    'Asia/Riyadh': 3,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'Europe/Berlin': 1,
    'Europe/Moscow': 3,
    'Europe/Amsterdam': 1,
    'America/New_York': -5,
    'America/Chicago': -6,
    'America/Denver': -7,
    'America/Los_Angeles': -8,
    'America/Sao_Paulo': -3,
    'America/Argentina/Buenos_Aires': -3,
    'Africa/Johannesburg': 2,
    'Africa/Cairo': 2,
    'Africa/Nairobi': 3,
    'Australia/Sydney': 10,
    'Australia/Perth': 8,
    'Pacific/Auckland': 13,
    'Pacific/Fiji': 12,
    'Antarctica/Palmer': -3,
    'Antarctica/McMurdo': 13
  }

  const continentDefaults = {
    Asia: 'Asia/Shanghai',
    Europe: 'Europe/London',
    America: 'America/New_York',
    Africa: 'Africa/Cairo',
    Australia: 'Australia/Sydney',
    Pacific: 'Pacific/Auckland',
    Antarctica: 'Antarctica/Palmer',
    UTC: 'UTC'
  }

  let offsetHours = timeZoneOffsets[timeZone]

  if (offsetHours === undefined) {
    const continent = timeZone.split('/')[0]
    const fallbackZone = continentDefaults[continent] || 'UTC'
    offsetHours = timeZoneOffsets[fallbackZone]

    console.warn(
      `未対応のタイムゾーンです。${timeZone} の代わりに ${fallbackZone} を使用します`
    )
  }

  const localDate = new Date(`${dateStr.replace(' ', 'T')}Z`)
  if (isNaN(localDate.getTime())) {
    throw new Error(`不正な日付文字列です: ${dateStr}`)
  }

  const utcTimestamp = localDate.getTime() - offsetHours * 60 * 60 * 1000
  return new Date(utcTimestamp)
}

function getTimestamp(date, time = '00:00', time_zone) {
  if (!date) return null
  return convertToUTC(`${date} ${time}:00`, time_zone).getTime()
}

function getSortTimestamp(post) {
  const edited = post?.lastEditedDate
    ? new Date(post.lastEditedDate).getTime()
    : 0
  const published = post?.publishDate
    ? new Date(post.publishDate).getTime()
    : 0
  return edited || published || 0
}

export function getNavPages({ allPages }) {
  const allNavPages = allPages?.filter(post => {
    return (
      post &&
      post?.slug &&
      post?.type === 'Post' &&
      post?.status === 'Published'
    )
  })

  return allNavPages.map(item => ({
    id: item.id,
    title: item.title || '',
    pageCoverThumbnail: item.pageCoverThumbnail || '',
    category: item.category || null,
    tags: item.tags || null,
    summary: item.summary || null,
    slug: item.slug,
    href: item.href,
    pageIcon: item.pageIcon || '',
    lastEditedDate: item.lastEditedDate,
    publishDate: item.publishDate,
    ext: item.ext || {}
  }))
}