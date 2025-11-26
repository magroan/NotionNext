import BLOG from '@/blog.config'
import { getOrSetDataWithCache } from '@/lib/cache/cache_manager'
import { getAllCategories } from '@/lib/notion/getAllCategories'
import getAllPageIds from '@/lib/notion/getAllPageIds'
import { getAllTags } from '@/lib/notion/getAllTags'
import { getConfigMapFromConfigPage } from '@/lib/notion/getNotionConfig'
import getPageProperties, {
  adjustPageProperties
} from '@/lib/notion/getPageProperties'
import { fetchInBatches, getPage } from '@/lib/notion/getPostBlocks'
import { compressImage, mapImgUrl } from '@/lib/notion/mapImage'
import { deepClone } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import { siteConfig } from '../config'
import { extractLangId, extractLangPrefix, getShortId } from '../utils/pageId'

export { getAllTags } from '../notion/getAllTags'
export { getPost } from '../notion/getNotionPost'
export { getPage as getPostBlocks } from '../notion/getPostBlocks'

/**
 * ブログ全体のデータを取得する（Notion ベースの実装）
 * @param {*} pageId
 * @param {*} from
 * @param {*} locale ロケール（zh / en / jp など）
 * @returns
 *
 */
export async function getGlobalData({
  pageId = BLOG.NOTION_PAGE_ID,
  from,
  locale
}) {
  // サイトデータを取得する。pageId にカンマ区切りで複数指定されている場合は分割して順番に処理する
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
      // 最初の id のサイトがデフォルト言語
      if (index === 0 || locale === prefix) {
        data = await getSiteDataByPageId({
          pageId: id,
          from
        })
      }
    }
  } catch (error) {
    console.error('異常', error)
  }
  return handleDataBeforeReturn(deepClone(data))
}

/**
 * 指定した Notion データベースのデータを取得する
 * @param pageId
 * @param from 取得元（呼び出し元識別用）
 * @returns {Promise<JSX.Element|*|*[]>}
 */
export async function getSiteDataByPageId({ pageId, from }) {
  // Notion の生データを取得する。この処理はメモリキャッシュに対応
  return await getOrSetDataWithCache(
    `site_data_${pageId}`,
    async (pageId, from) => {
      const pageRecordMap = await getPage(pageId, from)
      return convertNotionToSiteData(pageId, from, deepClone(pageRecordMap))
    },
    pageId,
    from
  )
}

/**
 * お知らせ用ページの取得
 */
async function getNotice(post) {
  if (!post) {
    return null
  }

  post.blockMap = await getPage(post.id, 'data-notice')
  return post
}

/**
 * データ取得に失敗したときの空デフォルトデータ
 * @param {*} pageId
 * @returns
 */
const EmptyData = pageId => {
  const empty = {
    notice: null,
    siteInfo: getSiteInfo({}),
    allPages: [
      {
        id: 1,
        title: `Notionデータを取得できません。Notion_IDを確認してください：  
 現在${pageId}`,
        summary:
          'ドキュメントにアクセスしてヘルプを取得 → https://docs.tangly1024.com/article/vercel-deploy-notion-next',
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
  return empty
}

/**
 * Notion のデータ構造をサイト用のデータ構造へ変換する
 * ここですべてのデータを一括で整形する
 * @returns {Promise<JSX.Element|null|*>}
 */
async function convertNotionToSiteData(pageId, from, pageRecordMap) {
  if (!pageRecordMap) {
    console.error('can`t get Notion Data ; Which id is: ', pageId)
    return {}
  }
  pageId = idToUuid(pageId)
  let block = pageRecordMap.block || {}
  const rawMetadata = block[pageId]?.value
  // Page-Database と Inline-Database のタイプを判定
  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.error(`pageId "${pageId}" is not a database`)
    return EmptyData(pageId)
  }
  const collection = Object.values(pageRecordMap.collection)[0]?.value || {}
  const collectionId = rawMetadata?.collection_id
  const collectionQuery = pageRecordMap.collection_query
  const collectionView = pageRecordMap.collection_view
  const schema = collection?.schema

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
      '取得した記事リストは空です。Notionテンプレートを確認してください。',
      collectionQuery,
      collection,
      collectionView,
      viewIds,
      pageRecordMap
    )
  } else {
    // console.log('有効なページ数', pageIds?.length)
  }
  // メインのデータベースからは最大 1000 ブロックまで取得し、溢れた分はあとから個別に取得する
  const blockIdsNeedFetch = []
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const value = block[id]?.value
    if (!value) {
      blockIdsNeedFetch.push(id)
    }
  }
  const fetchedBlocks = await fetchInBatches(blockIdsNeedFetch)
  block = Object.assign({}, block, fetchedBlocks)

  // 各記事の基本情報を取得
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const value = block[id]?.value || fetchedBlocks[id]?.value
    const properties =
      (await getPageProperties(id, value, schema, null, getTagOptions(schema))) ||
      null

    if (properties) {
      collectionData.push(properties)
    }
  }

  // サイトの設定は、まず設定テーブルから読み込み、なければ blog.config.js を使う
  const NOTION_CONFIG =
    (await getConfigMapFromConfigPage(collectionData)) || {}

  // 各記事のフィールドを補正
  collectionData.forEach(function (element) {
    adjustPageProperties(element, NOTION_CONFIG)
  })

  // サイトの基本情報
  const siteInfo = getSiteInfo({ collection, block, NOTION_CONFIG })

  // 記事数カウンタ
  let postCount = 0

  // すべての Post と Page を抽出
  const allPages = collectionData.filter(post => {
    if (post?.type === 'Post' && post.status === 'Published') {
      postCount++
    }

    return (
      post &&
      post?.slug &&
      //   !post?.slug?.startsWith('http') &&
      (post?.status === 'Invisible' || post?.status === 'Published')
    )
  })

  // 日付順にソート
/*
  if (siteConfig('POSTS_SORT_BY', null, NOTION_CONFIG) === 'date') {
    allPages.sort((a, b) => {
      return b?.publishDate - a?.publishDate
    })
  }
*/
  // 日付順にソート,DB基準
  if (siteConfig('POSTS_SORT_BY', null, NOTION_CONFIG) === 'date') {
    allPages.sort((a, b) => {
      // Notion の date プロパティ（created_time）を最優先で使う
      const aDate = a?.date?.start_date || a?.publishDate || a?.createdTime
      const bDate = b?.date?.start_date || b?.publishDate || b?.createdTime

      const aTime = aDate ? new Date(aDate).getTime() : 0
      const bTime = bDate ? new Date(bDate).getTime() : 0

      // 新しいものが先頭に来るように降順
      return bTime - aTime
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
  // すべてのカテゴリ
  const categoryOptions = getAllCategories({
    allPages,
    categoryOptions: getCategoryOptions(schema)
  })
  // すべてのタグ
  const tagSchemaOptions = getTagOptions(schema)
  const tagOptions =
    getAllTags({
      allPages: allPages ?? [],
      tagOptions: tagSchemaOptions ?? [],
      NOTION_CONFIG
    }) ?? null
  // 旧ナビゲーションメニュー（type=Page から生成）
  const customNav = getCustomNav({
    allPages: collectionData.filter(
      post => post?.type === 'Page' && post.status === 'Published'
    )
  })
  // 新ナビゲーションメニュー（type=Menu/SubMenu）
  const customMenu = getCustomMenu({ collectionData, NOTION_CONFIG })
  const latestPosts = getLatestPosts({ allPages, from, latestPostCount: 6 })
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

/**
 * 日本語日付などを吸収して、安全な日付文字列に正規化する
 *  - 入力:
 *    - '2025-11-20'
 *    - '2025/11/20'
 *    - '2025年11月20日'
 *    - Date/number
 *  - 出力:
 *    - 'YYYY-MM-DD' 形式の文字列 もしくは null
 */
function normalizeDateString(value) {
  if (!value) return null

  // すでに Date 型ならそのまま ISO へ
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null
    // ここでは日付部分だけ使えればよいので toISOString() から YYYY-MM-DD を抜き出しても良い
    return value.toISOString().slice(0, 10)
  }

  // タイムスタンプ(number)の可能性
  if (typeof value === 'number') {
    const d = new Date(value)
    if (isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  }

  if (typeof value !== 'string') return null

  const raw = value.trim()
  if (!raw) return null

  // まずは標準 Date パーサーで判定（ISO, 2025/11/20 など）
  const d1 = new Date(raw)
  if (!isNaN(d1.getTime())) {
    // パースできたものはそのまま使う（元の文字列を返す）
    return raw
  }

  // 「2025年11月20日」形式
  const jp = raw.match(
    /^(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/
  )
  if (jp) {
    const y = jp[1]
    const m = jp[2].padStart(2, '0')
    const d = jp[3].padStart(2, '0')
    return `${y}-${m}-${d}` // ここは Date('YYYY-MM-DD') で安全にパース可能
  }

  // それ以外は一旦あきらめて null
  return null
}

/**
 * 投稿配列の中で、日付関連フィールドを一括で正規化する
 *  - publishDay / publishDate / lastEditedDate
 *  - date.start_date / date.lastEditedDay も補正
 * 補正不能なものだけをログに出す
 */
function normalizePostDates(pages) {
  if (!Array.isArray(pages)) return
  const invalidPosts = []

  pages.forEach(post => {
    if (!post || typeof post !== 'object') return

    const targetFields = ['publishDay', 'publishDate', 'lastEditedDate']

    targetFields.forEach(field => {
      const raw = post[field]
      if (!raw) return
      const normalized = normalizeDateString(raw)
      if (normalized) {
        post[field] = normalized
      } else {
        invalidPosts.push({
          slug: post.slug,
          title: post.title,
          field,
          value: raw
        })
      }
    })

    // Notion の date プロパティ内部も最低限補正しておく
    if (post.date && typeof post.date === 'object') {
      if (typeof post.date.start_date === 'string') {
        const n = normalizeDateString(post.date.start_date)
        if (n) post.date.start_date = n
      }
      if (typeof post.date.lastEditedDay === 'string') {
        const n2 = normalizeDateString(post.date.lastEditedDay)
        if (n2) post.date.lastEditedDay = n2
      }
    }
  })

  if (invalidPosts.length > 0) {
    console.log('==== [DEBUG] invalid date posts detected ====') // ← デバッグ用
    console.log(JSON.stringify(invalidPosts, null, 2))
    invalidPosts.forEach(p => {
      console.log(
        `[normalizePostDates] invalid date field ${p.field} slug = ${p.slug} raw = ${p.value}`
      )
    })
  }
}

/**
 * フロント（ブラウザ）に返す前に行う最終加工
 * ・必要に応じてマスキング
 * ・不要なフィールドを削減してデータ量を小さくする
 * ・その他の整形
 * @param {*} db
 */
function handleDataBeforeReturn(db) {
  // まず日付を正規化して、日本語表記などを吸収する
  normalizePostDates(db.allPages)
  normalizePostDates(db.latestPosts)
  normalizePostDates(db.allNavPages)

  // 不要な生データを削除
  delete db.block
  delete db.schema
  delete db.rawMetadata
  delete db.pageIds
  delete db.viewIds
  delete db.collection
  delete db.collectionQuery
  delete db.collectionId
  delete db.collectionView

  // notice の余計なフィールドを削る
  if (db?.notice) {
    db.notice = cleanBlock(db?.notice)
    delete db.notice?.id
  }
  db.categoryOptions = cleanIds(db?.categoryOptions)
  db.customMenu = cleanIds(db?.customMenu)

  //   db.latestPosts = shortenIds(db?.latestPosts)
  db.allNavPages = shortenIds(db?.allNavPages)
  //   db.allPages = cleanBlocks(db?.allPages)

  db.allNavPages = cleanPages(db?.allNavPages, db.tagOptions)
  db.allPages = cleanPages(db.allPages, db.tagOptions)
  db.latestPosts = cleanPages(db.latestPosts, db.tagOptions)
  // すべての処理が終わったあとに tagOptions を最適化
  db.tagOptions = cleanTagOptions(db?.tagOptions)

  const POST_SCHEDULE_PUBLISH = siteConfig(
    'POST_SCHEDULE_PUBLISH',
    null,
    db.NOTION_CONFIG
  )
  if (POST_SCHEDULE_PUBLISH) {
    //   console.log('[定時公開] チェック開始')
    db.allPages?.forEach(p => {
      // 新機能: 記事の公開・非公開時間を見て、有効期間外なら自動的に非表示にする
      const publish = isInRange(p.title, p.date)
      if (!publish) {
        const currentTimestamp = Date.now()
        const startTimestamp = getTimestamp(
          p.date.start_date,
          p.date.start_time || '00:00',
          p.date.time_zone
        )
        const endTimestamp = getTimestamp(
          p.date.end_date,
          p.date.end_time || '23:59',
          p.date.time_zone
        )
        console.log(
          '[定時公開] 非表示 --> 記事:',
          p.title,
          '現在のタイムスタンプ:',
          currentTimestamp,
          '目標タイムスタンプ:',
          startTimestamp,
          '-',
          endTimestamp
        )
        console.log(
          '[定時公開] 非表示 --> 記事:',
          p.title,
          '現在の時刻:',
          new Date(),
          '目標時間:',
          p.date
        )
        // 非表示にする
        p.status = 'Invisible'
      }
    })
  }

  return db
}

/**
 * 記事リスト中の異常なデータを整形する
 * @param {Array} allPages - 全ページデータ
 * @param {Array} tagOptions - タグの候補一覧
 * @returns {Array} 処理後の allPages
 */
function cleanPages(allPages, tagOptions) {
  // 引数が配列かどうかをチェック
  if (!Array.isArray(allPages) || !Array.isArray(tagOptions)) {
    console.warn('Invalid input: allPages and tagOptions should be arrays.')
    return allPages || [] // 空配列か元の値を返す
  }

  // tagOptions から有効なタグ名をすべて抽出
  const validTags = new Set(
    tagOptions
      .map(tag => (typeof tag.name === 'string' ? tag.name : null))
      .filter(Boolean) // 文字列だけ残す
  )

  // すべてのページを走査
  allPages.forEach(page => {
    // tagItems が配列であることを保証
    if (Array.isArray(page.tagItems)) {
      // 各ページの tagItems をフィルタリング
      page.tagItems = page.tagItems.filter(
        tagItem =>
          validTags.has(tagItem?.name) && typeof tagItem.name === 'string'
      )
    }
  })

  return allPages
}

/**
 * 配列内の id を短縮する（short_id を付与し、元の id を削除）
 * @param {*} items
 * @returns
 */
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

/**
 * 配列内の id フィールドを削除する
 * @param {*} items
 * @returns
 */
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

/**
 * tagOptions をフィルタリング＆簡略化する
 * @param {*} tagOptions
 * @returns
 */
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

/**
 * block データの余計なフィールドを削る
 */
function cleanBlock(item) {
  const post = deepClone(item)
  const pageBlock = post?.blockMap?.block
  //   delete post?.id
  //   delete post?.blockMap?.collection

  if (pageBlock) {
    for (const i in pageBlock) {
      pageBlock[i] = cleanBlock(pageBlock[i])
      delete pageBlock[i]?.role
      delete pageBlock[i]?.value?.version
      delete pageBlock[i]?.value?.created_by_table
      delete pageBlock[i]?.value?.created_by_id
      delete pageBlock[i]?.value?.last_edited_by_table
      delete pageBlock[i]?.value?.last_edited_by_id
      delete pageBlock[i]?.value?.space_id
      delete pageBlock[i]?.value?.version
      delete pageBlock[i]?.value?.format?.copied_from_pointer
      delete pageBlock[i]?.value?.format?.block_locked_by
      delete pageBlock[i]?.value?.parent_table
      delete pageBlock[i]?.value?.copied_from_pointer
      delete pageBlock[i]?.value?.copied_from
      delete pageBlock[i]?.value?.created_by_table
      delete pageBlock[i]?.value?.created_by_id
      delete pageBlock[i]?.value?.last_edited_by_table
      delete pageBlock[i]?.value?.last_edited_by_id
      delete pageBlock[i]?.value?.permissions
      delete pageBlock[i]?.value?.alive
    }
  }
  return post
}

/**
 * 最新記事を取得する。最終更新日時で降順ソート
 * @param {*}} param0
 * @returns
 */
function getLatestPosts({ allPages, from, latestPostCount }) {
  const allPosts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )

  const latestPosts = Object.create(allPosts).sort((a, b) => {
    const dateA = new Date(a?.lastEditedDate || a?.publishDate)
    const dateB = new Date(b?.lastEditedDate || b?.publishDate)
    return dateB - dateA
  })
  return latestPosts.slice(0, latestPostCount)
}

/**
 * ユーザー定義の単一ページメニューを取得する
 * 旧バージョンでは Menu テーブルではなく type=Page からメニューを生成する
 * @param notionPageData
 * @returns {Promise<[]|*[]>}
 */
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

/**
 * 自作メニュー（Menu / SubMenu タイプ）を取得する
 * @param {*} allPages
 * @returns
 */
function getCustomMenu({ collectionData, NOTION_CONFIG }) {
  const menuPages = collectionData.filter(
    post =>
      post.status === 'Published' &&
      (post?.type === 'Menu' || post?.type === 'SubMenu')
  )
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

/**
 * タグの候補一覧を取得する
 * @param schema
 * @returns {undefined}
 */
function getTagOptions(schema) {
  if (!schema) return {}
  const tagSchema = Object.values(schema).find(
    e => e.name === BLOG.NOTION_PROPERTY_NAME.tags
  )
  return tagSchema?.options || []
}

/**
 * カテゴリの候補一覧を取得する
 * @param schema
 * @returns {{}|*|*[]}
 */
function getCategoryOptions(schema) {
  if (!schema) return {}
  const categorySchema = Object.values(schema).find(
    e => e.name === BLOG.NOTION_PROPERTY_NAME.category
  )
  return categorySchema?.options || []
}

/**
 * サイト情報を組み立てる
 * @param notionPageData
 * @param from
 * @returns {Promise<{title,description,pageCover,icon}>}
 */
function getSiteInfo({ collection, block, NOTION_CONFIG }) {
  const defaultTitle = NOTION_CONFIG?.TITLE || 'NotionNext BLOG'
  const defaultDescription =
    NOTION_CONFIG?.DESCRIPTION || 'これはNotionNextによって生成されたサイトです'
  const defaultPageCover =
    NOTION_CONFIG?.HOME_BANNER_IMAGE || '/bg_image.jpg'
  const defaultIcon = NOTION_CONFIG?.AVATAR || '/avatar.svg'
  const defaultLink = NOTION_CONFIG?.LINK || BLOG.LINK
  // 空データの場合はデフォルト値を返す
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
    ? mapImgUrl(collection?.cover, collection, 'collection')
    : defaultPageCover

  // サイトアイコンを軽く圧縮する
  let icon = compressImage(
    collection?.icon
      ? mapImgUrl(collection?.icon, collection, 'collection')
      : defaultIcon
  )
  // サイト URL
  const link = NOTION_CONFIG?.LINK || defaultLink

  // サイトのロゴは emoji にならないようにする
  const emojiPattern = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g
  if (!icon || emojiPattern.test(icon)) {
    icon = defaultIcon
  }
  return { title, description, pageCover, icon, link }
}

/**
 * 記事が公開期間内かどうかを判定する
 * @param {string} title - 記事タイトル
 * @param {Object} date - 時間範囲パラメータ
 * @param {string} date.start_date - 開始日（YYYY-MM-DD）
 * @param {string} date.start_time - 開始時刻（任意、HH:mm）
 * @param {string} date.end_date - 終了日（YYYY-MM-DD）
 * @param {string} date.end_time - 終了時刻（任意、HH:mm）
 * @param {string} date.time_zone - タイムゾーン（IANA 形式、例 "Asia/Shanghai"）
 * @returns {boolean} 範囲内なら true
 */
function isInRange(title, date = {}) {
  const {
    start_date,
    start_time = '00:00',
    end_date,
    end_time = '23:59',
    time_zone = 'Asia/Shanghai'
  } = date

  // 現在時刻（ミリ秒タイムスタンプ）
  const currentTimestamp = Date.now()

  // 開始・終了時刻をタイムゾーン込みでタイムスタンプ化
  const startTimestamp = getTimestamp(start_date, start_time, time_zone)
  const endTimestamp = getTimestamp(end_date, end_time, time_zone)

  // 範囲外なら false
  if (startTimestamp && currentTimestamp < startTimestamp) {
    return false
  }

  if (endTimestamp && currentTimestamp > endTimestamp) {
    return false
  }

  return true
}

/**
 * 指定タイムゾーンの日付文字列を UTC 時刻に変換する
 * @param {string} dateStr - 日付文字列（YYYY-MM-DD HH:mm:ss）
 * @param {string} timeZone - タイムゾーン名（例: "Asia/Shanghai"）
 * @returns {Date} 変換後の Date オブジェクト（UTC 基準）
 */
function convertToUTC(dateStr, timeZone = 'Asia/Shanghai') {
  // シンプルなタイムゾーン→オフセット（時間）のマッピング
  const timeZoneOffsets = {
    // UTC 基準
    UTC: 0,
    'Etc/GMT': 0,
    'Etc/GMT+0': 0,

    // アジア地域
    'Asia/Shanghai': 8, // 中国
    'Asia/Taipei': 8, // 台湾
    'Asia/Tokyo': 9, // 日本
    'Asia/Seoul': 9, // 韓国
    'Asia/Kolkata': 5.5, // インド
    'Asia/Jakarta': 7, // インドネシア
    'Asia/Singapore': 8, // シンガポール
    'Asia/Hong_Kong': 8, // 香港
    'Asia/Bangkok': 7, // タイ
    'Asia/Dubai': 4, // UAE
    'Asia/Tehran': 3.5, // イラン
    'Asia/Riyadh': 3, // サウジアラビア

    // ヨーロッパ地域
    'Europe/London': 0, // 英国（GMT）
    'Europe/Paris': 1, // フランス（CET）
    'Europe/Berlin': 1, // ドイツ
    'Europe/Moscow': 3, // ロシア
    'Europe/Amsterdam': 1, // オランダ

    // アメリカ地域
    'America/New_York': -5, // 米東部（EST）
    'America/Chicago': -6, // 米中部（CST）
    'America/Denver': -7, // 米山岳部（MST）
    'America/Los_Angeles': -8, // 米西部（PST）
    'America/Sao_Paulo': -3, // ブラジル
    'America/Argentina/Buenos_Aires': -3, // アルゼンチン

    // アフリカ地域
    'Africa/Johannesburg': 2, // 南アフリカ
    'Africa/Cairo': 2, // エジプト
    'Africa/Nairobi': 3, // ケニア

    // オセアニア地域
    'Australia/Sydney': 10, // オーストラリア東部
    'Australia/Perth': 8, // オーストラリア西部
    'Pacific/Auckland': 13, // ニュージーランド
    'Pacific/Fiji': 12, // フィジー

    // 極地
    'Antarctica/Palmer': -3, // 南極（Palmer）
    'Antarctica/McMurdo': 13 // 南極（McMurdo）
  }

  // 大陸ごとのデフォルトタイムゾーン
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

  // 対応しているタイムゾーンかどうか調べる
  let offsetHours = timeZoneOffsets[timeZone]

  // 未対応タイムゾーンは、大陸単位でフォールバック
  if (offsetHours === undefined) {
    // "Continent/City" → "Continent" を取り出す
    const continent = timeZone.split('/')[0]

    // 該当大陸のデフォルトタイムゾーン or UTC
    const fallbackZone = continentDefaults[continent] || 'UTC'
    offsetHours = timeZoneOffsets[fallbackZone]

    console.warn(
      `Warning: Unsupported time zone "${timeZone}". Using default "${fallbackZone}" for continent "${continent}".`
    )
  }

  // ローカル時刻として Date を作る
  const localDate = new Date(`${dateStr.replace(' ', 'T')}Z`)
  if (isNaN(localDate.getTime())) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }

  // UTC に変換（オフセット時間を引く）
  const utcTimestamp = localDate.getTime() - offsetHours * 60 * 60 * 1000
  return new Date(utcTimestamp)
}

// 補助関数：指定日付・時刻（タイムゾーン付き）からタイムスタンプを生成
function getTimestamp(date, time = '00:00', time_zone) {
  if (!date) return null
  return convertToUTC(`${date} ${time}:00`, time_zone).getTime()
}

/**
 * ナビゲーション用の軽量な記事リストを取得する
 * gitbook 風のトップページで使用。タイトル・カテゴリ・タグなどだけ保持し、
 * 要約やパスワード、日付などは削ってサイズを小さくする
 * 対象となるのは type=Post の記事のみ
 * @param {*} param0
 */
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
