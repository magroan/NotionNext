import BLOG from '@/blog.config'
import { uploadDataToAlgolia } from '@/lib/plugins/algolia'
import { compressImageIfNeed } from '@/lib/plugins/image'
import { saveDataToMongoDB } from '@/lib/plugins/mongodb'
import {
  getNotionDateValue,
  getNotionNumberValue,
  getNotionPageId,
  getNotionPages,
  getNotionSelectValue,
  getNotionTagValues,
  getNotionTextValue
} from '@/lib/plugins/notion/getNotionValue'
import { getPostTags } from '@/lib/plugins/notion/getPostTags'
import { getPostPropertiesSchema } from '@/lib/plugins/notion/getPostPropertiesSchema'
import { getAllSelectOptionsFromSchema } from '@/lib/plugins/notion/getAllSelectOptionsFromSchema'
import {
  checkStartWithHttp,
  deepClone,
  formatDate,
  generateMd5,
  isBrowser,
  randomString
} from '@/lib/utils'

/**
 * 获取文章的属性
 */
export default async function getPageProperties(id, block) {
  const rawProperties = deepClone(block?.value?.properties)

  const propertySchema = await getPostPropertiesSchema(BLOG.NOTION_PAGE_ID)
  if (!propertySchema) {
    return null
  }

  // 从Notion中读取的大部分属性值
  let properties =
    getPropertiesValue(rawProperties, propertySchema, block) || null

  // 网站基础信息
  if (id === BLOG.NOTION_PAGE_ID && !block?.value?.parent_id) {
    const slug = ''
    properties.slug = slug
    properties.type = 'Page'
    properties.title = BLOG.TITLE
    properties.status = 'Published'

    // 旧的占位符用法
    if (BLOG.LINK && BLOG.LINK.startsWith('http')) {
      properties.link = BLOG.LINK
    }
  }

  // 文章在data对象中的ID
  properties.id = id

  // 为空过滤
  if (
    properties?.slug &&
    (properties.slug === 'null' || properties.slug === 'undefined')
  ) {
    delete properties.slug
  }

  // 生成文章slug
  properties = adjustPageProperties(properties)
  if (!properties?.slug || properties.slug === 'null') {
    properties.slug = id
  }

  // 把slug规范化，并补全的
  properties.slug = properties.slug
    ?.replaceAll(' ', '-')
    ?.replaceAll('--', '-')
    ?.replaceAll('__', '-')
    ?.replaceAll('｜', '-')
    ?.replaceAll('|', '-')
    ?.replaceAll('\\', '-')
    ?.replaceAll('#', '-')
    ?.replaceAll('%', '-')

  // 把属性中的逗号替换成空格
  properties.category = properties.category?.replaceAll(',', ' ')
  properties.tags = properties.tags?.replaceAll(',', ' ')
  properties.summary = properties.summary?.replaceAll(',', ' ')
  properties.title = properties.title?.replaceAll(',', ' ')
  properties.description = properties.description?.replaceAll(',', ' ')
  properties.slug = properties.slug?.replaceAll(',', ' ')
  properties.icon = properties.icon?.replaceAll(',', ' ')
  properties.pageCover = properties.pageCover?.replaceAll(',', ' ')
  properties.pageCoverThumbnail = properties.pageCoverThumbnail?.replaceAll(
    ',',
    ' '
  )

  // 去重
  if (properties.tags) {
    const tags = properties.tags.split(' ')
    properties.tags = [...new Set(tags)].join(' ')
  }

  // 页面封面
  const pageCover = block?.value?.format?.page_cover
  if (pageCover) {
    properties.pageCover = checkStartWithHttp(pageCover)
  }

  // 页面图标
  const pageIcon = block?.value?.format?.page_icon
  if (pageIcon) {
    properties.pageIcon = pageIcon
  }

  // 文章摘要
  if (!properties.summary) {
    const rawSummary = rawProperties?.summary?.[0]?.[0]
    if (rawSummary) {
      properties.summary = rawSummary
    }
  }

  // 生成随机摘要
  if (!properties.summary) {
    // Notion文章内容目前不支持渲染后再抓取摘要,因此注释掉以下方法
    // const content = await getBlockBlocks(id, 'slug-props')
    // properties.summary = generateSummaryFromContent(content, BLOG.POST_PREVIEW_LINES)
    properties.summary = randomString(40)
  }

  // 如果页面是Tweet则格式化
  const isTweet = block?.value?.type === 'tweet'
  if (isTweet) {
    properties = adjustTweetProperties(properties, block)
  }

  // TODO 如果是谷歌日历，则格式化
  // const isCalendar = block?.value?.type === 'google_calendar'

  // 显示目录
  if (block?.value?.content?.length > 0) {
    properties.showContents = true
  }

  if (block?.value?.type === 'page') {
    properties.type = 'Page'
  }

  // 多语言处理
  const multiLangMap = BLOG?.POST_URL_PREFIX_MAPPING_CATEGORY || {}
  for (const key in multiLangMap) {
    if (properties?.category?.includes(key)) {
      properties.category = properties.category?.replaceAll(key, multiLangMap[key])
    }
  }

  // 自动生成文章标题icon
  if (!properties?.pageIcon) {
    properties.pageIcon = properties?.icon
  }

  // 文章时间
  properties.createdTime = new Date(block?.value?.created_time)?.getTime()
  properties.lastEditedTime = new Date(block?.value?.last_edited_time)?.getTime()
  if (properties?.date?.start_date) {
    properties.publishDate = new Date(properties?.date?.start_date).getTime()
  } else {
    properties.publishDate = new Date(properties?.createdTime).getTime()
  }

  // 文章更新时间
  if (!properties.lastEditedDate) {
    properties.lastEditedDate = new Date(properties.lastEditedTime).getTime()
  }
  // 文章发布日期
  if (!properties.publishDate) {
    properties.publishDate = new Date(properties.createdTime).getTime()
  }

  // 文章的日期文本
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
  properties.lastEditedDay = formatDate(properties.lastEditedDate, BLOG.LANG)

  // 删除一些不需要的属性
  delete properties.icon
  delete properties.type

  // 缓存文章标签
  await getPostTags(properties)

  // 搜索引擎同步
  if (!isBrowser) {
    // 同步全文索引到Algolia
    if (BLOG.ALGOLIA_APP_ID && BLOG.ALGOLIA_ADMIN_KEY) {
      await uploadDataToAlgolia(properties)
    }

    // 数据同步到MongoDB
    if (BLOG.MONGO_DB_URL) {
      await saveDataToMongoDB(properties)
    }
  }

  // 压缩图片
  if (!isBrowser && BLOG.IMAGE_COMPRESS_ENABLE) {
    // 如果是文章页面
    if (properties.type === 'Post' && properties.pageCover) {
      properties.pageCoverThumbnail =
        (await compressImageIfNeed(properties.pageCover)) || properties.pageCover
    }
  }

  return properties
}

/**
 * 处理文章的属性
 * @param {*} properties
 * @returns
 */
function adjustPageProperties(properties) {
  const newProperties = properties
  // 如果不是站点的首页，则生成slug
  if (!newProperties?.slug && newProperties?.type !== 'Page') {
    // 如果是 Post 且有 title，则用 title 生成 slug
    if (newProperties?.type === 'Post' && newProperties?.title) {
      const safeSlug = newProperties?.title?.replaceAll(' ', '-')
      newProperties.slug = safeSlug
    } else {
      newProperties.slug = newProperties.id
    }
  }

  // 如果是 Page 且没有 title，则用 id 生成 slug
  if (newProperties?.type === 'Page' && !newProperties?.title) {
    newProperties.slug = newProperties.id
  }

  // slug 自动拼接多语言前缀
  if (newProperties?.slug && BLOG.POST_URL_PREFIX) {
    newProperties.slug = BLOG.POST_URL_PREFIX + '/' + newProperties.slug
  }

  // slug 自动拼接多语言前缀映射
  if (
    newProperties?.slug &&
    BLOG.POST_URL_PREFIX_MAPPING_CATEGORY &&
    newProperties?.category
  ) {
    const mappingCategory = BLOG.POST_URL_PREFIX_MAPPING_CATEGORY
    for (const key in mappingCategory) {
      if (newProperties?.category?.includes(key)) {
        newProperties.slug =
          mappingCategory[key] + '/' + newProperties.slug.replace(BLOG.POST_URL_PREFIX + '/', '')
      }
    }
  }

  // 根据配置生成slug
  if (BLOG.POST_URL_PREFIX_MAPPING_CATEGORY) {
    newProperties.slug = generateCustomizeSlug(newProperties)
  }

  return newProperties
}

/**
 * 生成自定义slug
 * @param {*} postProperties
 * @returns
 */
function generateCustomizeSlug(postProperties) {
  const POST_URL_PREFIX_MAPPING_CATEGORY = BLOG.POST_URL_PREFIX_MAPPING_CATEGORY

  // 找到匹配的分类
  let prefix = ''
  for (const key in POST_URL_PREFIX_MAPPING_CATEGORY) {
    if (postProperties?.category?.includes(key)) {
      prefix = POST_URL_PREFIX_MAPPING_CATEGORY[key]
      break
    }
  }

  // 没匹配则默认用slug
  if (!prefix) {
    return postProperties.slug
  }

  // 分类拼接slug
  const allSlugPatterns = prefix.split('/')

  let fullPrefix = ''
  const getPostDateForUrl = () => {
    // Prefer numeric timestamp to avoid locale-dependent parsing issues (e.g. ja-JP formatted strings)
    const ts =
      postProperties?.publishDate ??
      (postProperties?.date?.start_date
        ? new Date(postProperties.date.start_date).getTime()
        : null)
    if (typeof ts === 'number' && !Number.isNaN(ts)) {
      const d = new Date(ts)
      if (!Number.isNaN(d.getTime())) return d
    }

    // Fallback (legacy): try publishDay string if it's parseable
    const legacy = postProperties?.publishDay
    if (legacy) {
      const d = new Date(legacy)
      if (!Number.isNaN(d.getTime())) return d
    }
    return null
  }

  const postDate = getPostDateForUrl()

  allSlugPatterns.forEach((pattern, idx) => {
    if (pattern === '%year%' && postDate) {
      fullPrefix += postDate.getUTCFullYear()
    } else if (pattern === '%month%' && postDate) {
      fullPrefix += String(postDate.getUTCMonth() + 1).padStart(2, 0)
    } else if (pattern === '%day%' && postDate) {
      fullPrefix += String(postDate.getUTCDate()).padStart(2, 0)
    } else if (pattern === '%slug%') {
      fullPrefix += postProperties.slug
    } else {
      fullPrefix += pattern
    }

    // 不是最后一个，则拼接 '/'
    if (idx < allSlugPatterns.length - 1) {
      fullPrefix += '/'
    }
  })

  return fullPrefix
}

/**
 * 获取 Notion 中属性值
 * @param rawProperties
 * @param schema
 * @param block
 * @returns {Object}
 */
function getPropertiesValue(rawProperties, schema, block) {
  const properties = {}
  if (!rawProperties) {
    return properties
  }

  // 预先收集 schema 的 select 选项
  const allSelectOptions = getAllSelectOptionsFromSchema(schema)

  // 处理 schema 中的各个属性
  for (const key in schema) {
    const { name, type } = schema[key]
    if (!name || !type) continue

    const rawVal = rawProperties[name]
    if (!rawVal) continue

    // 根据属性类型取值
    switch (type) {
      case 'title':
      case 'text':
      case 'rich_text':
        properties[key] = getNotionTextValue(rawVal)
        break
      case 'number':
        properties[key] = getNotionNumberValue(rawVal)
        break
      case 'select':
        properties[key] = getNotionSelectValue(rawVal, allSelectOptions?.[name])
        break
      case 'multi_select':
        properties[key] = getNotionTagValues(rawVal, allSelectOptions?.[name])
        break
      case 'date':
        properties[key] = getNotionDateValue(rawVal)
        break
      case 'relation':
        properties[key] = getNotionPages(rawVal, schema, block)
        break
      case 'created_time':
      case 'last_edited_time':
        properties[key] = getNotionNumberValue(rawVal)
        break
      default:
        break
    }
  }

  // page_id 等
  properties.pageId = getNotionPageId(block)

  // 补齐 title
  if (!properties.title) {
    properties.title = getNotionTextValue(rawProperties?.title)
  }

  // type
  properties.type = block?.value?.type

  // status
  properties.status = properties?.status || 'Published'

  return properties
}

/**
 * Tweet 属性适配
 * @param {*} properties
 * @param {*} block
 * @returns
 */
function adjustTweetProperties(properties, block) {
  // tweet 内容是 text
  if (!properties?.text) {
    const text = block?.value?.properties?.title?.[0]?.[0]
    properties.text = text
  }

  // tweet 的 slug
  if (!properties?.slug) {
    properties.slug = generateMd5(properties?.text || block?.value?.id)
  }

  properties.type = 'Tweet'
  properties.status = 'Published'
  return properties
}
