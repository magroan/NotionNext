import BLOG from '@/blog.config'
import { extractLangPrefix } from './pageId'

const isBrowser = typeof window !== 'undefined'

// 构造多语言词典
export const generateLocaleDict = lang => {
  switch (lang) {
    case 'zh-CN':
      return require('@/public/locales/zh-CN.json')
    case 'en-US':
      return require('@/public/locales/en-US.json')
    case 'ja-JP':
      return require('@/public/locales/ja-JP.json')
    case 'fr-FR':
      return require('@/public/locales/fr-FR.json')
    default:
      return require('@/public/locales/zh-CN.json')
  }
}

// 初始化语言
export const initLocale = updateLocale => {
  if (!isBrowser) {
    return
  }
  const locale = window.localStorage.getItem('locale') || BLOG.LANG
  updateLocale(locale)
}

// NOTE: 呼び出し側は pageId（NOTION_PAGE_ID）だけ渡してくる設計。
// 以前の実装は (lang, pageId) だったが、lang を使っていなかったため整理する。
export const redirectUserLang = pageId => {
  if (!isBrowser) {
    return
  }
  // 只在首页处理跳转
  if (window.location.pathname !== '/') {
    return
  }
  // 没有开启多语言
  if (!pageId || String(pageId).indexOf(',') < 0) {
    return
  }
  // 获取用户浏览器语言
  const userLang = navigator.language || navigator.userLanguage
  const siteIds = String(pageId).split(',')
  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const prefix = extractLangPrefix(siteId)
    if (!prefix) continue

    const match =
      prefix === userLang ||
      (userLang &&
        (userLang.startsWith(prefix + '-') || userLang.startsWith(prefix + '_')))

    if (match && window.location.pathname.indexOf(prefix) < 0) {
      window.location.href = '/' + prefix
    }
  }
}
