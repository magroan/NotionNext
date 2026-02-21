import BLOG from '@/blog.config'
import { isBrowser } from './utils'

/**
 * 简易多语言词典
 */
export function useTranslation() {
  let currentLocale
  if (isBrowser) {
    currentLocale = window.localStorage.getItem('LANG')
  }
  if (!currentLocale) {
    currentLocale = BLOG.LANG
  }

  if (!currentLocale) {
    currentLocale = 'en-US' // 默认英语
  }

  // 根据 currentLocale 加载词典
  let dictionary = {}
  switch (currentLocale) {
    case 'zh-CN':
      dictionary = require('../lang/zh-CN').default
      break
    case 'zh-HK':
      dictionary = require('../lang/zh-HK').default
      break
    case 'zh-TW':
      dictionary = require('../lang/zh-TW').default
      break
    case 'ja-JP':
      dictionary = require('../lang/ja-JP').default
      break
    default:
      dictionary = require('../lang/en-US').default
      break
  }

  /**
   * 翻译函数，通过键获取翻译文本
   * @param {string} key
   * @param {string} defaultText
   * @returns {string}
   */
  function t(key, defaultText = '') {
    return dictionary[key] || defaultText || key
  }

  return { t }
}
