/* eslint-disable no-case-declarations */
import BLOG from '@/blog.config'
import formatDate from '@/lib/utils/formatDate'
import { siteConfig } from '@/lib/config'
import { deepClone, getTextContent, isUrlLikePath } from '@/lib/utils'
import {
  extractLangPrefix,
  getShortId,
  uuidToId,
  getPageIdBySiteId
} from '@/lib/utils/pageId'
import { getAllSelectOptionsFromSchema } from './getAllSelectOptionsFromSchema'
import { getPostTags, getPageTagOptions } from './getPostTags'

/**
 * 从notion page中读取文章属性
 * 将notion数据页的properties转换成文章需要的属性对象
 * @param {*} page
 * @param {*} tagOptions
 * @returns
 */
export default function getPageProperties(page, tagOptions = null) {
  const properties = {}

  // #region 解析文章 metadata
  // eslint-disable-next-line no-undef
  Object.keys(page?.properties).forEach(key => {
    const prop = page.properties[key]
    if (prop?.type === 'rollup') {
      const rollupType = prop.rollup?.type
      // 根据 rollup 的类型提取值
      if (rollupType === 'array') {
        // 处理 rollup 数组类型
        properties[key] = prop.rollup.array.map(item => {
          if (item.type === 'title') return getTextContent(item.title)
          if (item.type === 'rich_text') return getTextContent(item.rich_text)
          if (item.type === 'number') return item.number
          if (item.type === 'date') return item.date?.start || null
          if (item.type === 'select') return item.select?.name || null
          if (item.type === 'multi_select') {
            return item.multi_select.map(ms => ms.name)
          }
          return null
        })
      } else if (rollupType === 'number') {
        properties[key] = prop.rollup.number
      } else if (rollupType === 'date') {
        properties[key] = prop.rollup.date?.start || null
      } else {
        properties[key] = null
      }
    } else if (prop?.type === 'multi_select') {
      properties[key] = prop.multi_select.map(ms => ms.name)
    } else if (prop?.type === 'select') {
      properties[key] = prop.select?.name
    } else if (prop?.type === 'status') {
      properties[key] = prop.status?.name
    } else if (prop?.type === 'date') {
      properties[key] = prop.date?.start
    } else if (prop?.type === 'created_time') {
      properties[key] = prop.created_time
    } else if (prop?.type === 'last_edited_time') {
      properties[key] = prop.last_edited_time
    } else if (prop?.type === 'checkbox') {
      properties[key] = prop.checkbox
    } else if (prop?.type === 'number') {
      properties[key] = prop.number
    } else if (prop?.type === 'rich_text') {
      properties[key] = getTextContent(prop.rich_text)
    } else if (prop?.type === 'title') {
      properties[key] = getTextContent(prop.title)
    } else if (prop?.type === 'url') {
      properties[key] = prop.url
    } else if (prop?.type === 'email') {
      properties[key] = prop.email
    } else if (prop?.type === 'phone_number') {
      properties[key] = prop.phone_number
    } else if (prop?.type === 'relation') {
      properties[key] = prop.relation.map(r => r.id)
    } else if (prop?.type === 'people') {
      properties[key] = prop.people
    } else if (prop?.type === 'files') {
      properties[key] = prop.files
    } else {
      properties[key] = prop[prop.type]
    }
  })
  // #endregion

  // #region 兼容老版本字段
  // 兼容老版本字段
  // NotionNext v4.9.2.1 之前的版本字段命名为 publishDate
  // v4.9.2.1 之后的版本字段命名为 publishDay
  // publishDay 是显示用字符串（会随 LANG 变成“2026年…”），不可用于 Date 解析
  properties.publishDate = properties.publishDate || properties.publishDay
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)

  // 兼容老版本字段
  properties.status = properties.status || properties.Status
  properties.type = properties.type || properties.Type
  properties.category = properties.category || properties.Category
  properties.icon = properties.icon || properties.Icon
  properties.pageCover = properties.pageCover || properties.PageCover
  properties.slug = properties.slug || properties.Slug
  properties.title = properties.title || properties.Title
  properties.summary = properties.summary || properties.Summary
  properties.tags = properties.tags || properties.Tags
  properties.image = properties.image || properties.Image
  properties.password = properties.password || properties.Password
  properties.date = properties.date || properties.Date
  properties.author = properties.author || properties.Author
  properties.options = properties.options || properties.Options
  // #endregion

  // #region 生成自定义链接（%year%/%month%/%day%）
  const urlPrefix = siteConfig('POST_URL_PREFIX')
  if (urlPrefix && urlPrefix.indexOf('%') > -1) {
    const postProperties = properties
    const urlPrefix = siteConfig('POST_URL_PREFIX')
    let slug = urlPrefix
    if (slug) {
      // publishDay はローカライズ文字列なので Date に入れない
      // publishDate / date.start_date / created_time などを優先して使う
      const baseDateRaw =
        postProperties?.publishDate ||
        postProperties?.date?.start_date ||
        postProperties?.created_time

      const baseDate = baseDateRaw ? new Date(baseDateRaw) : null
      const isValidDate = baseDate && !isNaN(baseDate.getTime())

      if (pattern === '%year%' && isValidDate) {
        const year = baseDate.getFullYear()
        slug = slug.replaceAll(pattern, year)
      } else if (pattern === '%month%' && isValidDate) {
        const month = `${baseDate.getMonth() + 1}`.padStart(2, '0')
        slug = slug.replaceAll(pattern, month)
      } else if (pattern === '%day%' && isValidDate) {
        const day = `${baseDate.getDate()}`.padStart(2, '0')
        slug = slug.replaceAll(pattern, day)
      } else {
        slug = slug.replaceAll(pattern, '')
      }
    }
    properties.slug = slug + (properties.slug || '')
  }
  // #endregion

  // #region tags
  // 标签
  const tags = getPostTags(properties, tagOptions)
  properties.tags = tags
  // #endregion

  // #region 处理文章状态
  properties.status = properties.status || properties.Status
  // #endregion

  // #region 处理文章类型
  properties.type = properties.type || properties.Type
  // #endregion

  // #region 处理封面
  properties.pageCover = properties.pageCover || properties.PageCover
  // #endregion

  // #region 处理icon
  properties.pageIcon = properties.pageIcon || properties.icon || properties.Icon
  // #endregion

  // #region 处理分类
  properties.category = properties.category || properties.Category
  // #endregion

  // #region 处理标题
  properties.title = properties.title || properties.Title
  // #endregion

  // #region 处理摘要
  properties.summary = properties.summary || properties.Summary
  // #endregion

  // #region 处理密码
  properties.password = properties.password || properties.Password
  // #endregion

  // #region 处理作者
  properties.author = properties.author || properties.Author
  // #endregion

  // #region 处理选项
  properties.options = properties.options || properties.Options
  // #endregion

  // #region 处理日期
  properties.date = properties.date || properties.Date
  // #endregion

  // #region 处理语言前缀
  // 多语言：为 slug 生成 prefix
  const langPrefix = extractLangPrefix(getPageIdBySiteId(properties?.pageId))
  if (langPrefix) {
    properties.lang = langPrefix
  }
  // #endregion

  // #region 处理 ID
  properties.id = page?.id
  properties.pageId = page?.id
  // #endregion

  // #region 处理 shortId
  properties.short_id = getShortId(page?.id)
  // #endregion

  // #region 处理 lastEditedTime
  properties.lastEditedTime = page?.last_edited_time
  // #endregion

  // #region 处理 createdTime
  properties.createdTime = page?.created_time
  // #endregion

  // #region 页面标签 options
  properties.pageTagOptions = getPageTagOptions(properties)
  // #endregion

  // #region 处理 URL
  properties.url = page?.url
  // #endregion

  // #region 处理属性 options
  properties.selectOptions = getAllSelectOptionsFromSchema(page)
  // #endregion

  // 兼容处理
  properties.category = properties.category || ''
  properties.tags = properties.tags || []

  // 图片
  if (properties.image) {
    if (isUrlLikePath(properties.image)) {
      properties.pageCover = properties.image
    }
    delete properties.image
  }

  // 兼容：如果 slug 不存在则默认使用 short_id
  properties.slug = properties.slug || properties.short_id || uuidToId(page?.id)

  return properties
}
