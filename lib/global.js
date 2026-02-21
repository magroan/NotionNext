import BLOG from '@/blog.config'
import { siteConfigMap } from '@/lib/config'
import { fetchSite } from '@/lib/site/site.service'
import { createContext, useContext } from 'react'
import { getQueryParam, isBrowser, mergeDeep } from './utils'

// 全局上下文
const GlobalContext = createContext()

/**
 * 全局上下文
 * @returns
 */
export const useGlobal = () => useContext(GlobalContext)

/**
 * 全局 Provider
 * @param children
 * @param globalData
 * @returns {JSX.Element}
 * @constructor
 */
export const GlobalContextProvider = props => {
  const { children, siteInfo } = props
  const global = mergeDeep({}, props)
  const customConfig = siteInfo?.customConfig

  if (customConfig) {
    const userConfig = {}
    Object.keys(customConfig).forEach(key => {
      const value = customConfig[key]
      userConfig[key] = value
      if (isBrowser) {
        // 主题本地化配置
        if (key.startsWith(BLOG.THEME)) {
          localStorage.setItem(key, value)
        } else {
          // 用户自定义配置
          localStorage.setItem(key, value)
        }
      }
    })

    // 合并自定义配置
    global.NOTION_CONFIG = mergeDeep(siteConfigMap(), userConfig)
    // 合并主题自定义配置
    global.THEME_CONFIG = mergeDeep({}, props.THEME_CONFIG, userConfig)
  }

  if (isBrowser) {
    global.isProd = process.env.VERCEL_ENV === 'production'
    // 修复本地环境中数据没有更新的问题
    global.isProd = global.isProd && process.env.VERCEL_ENV !== 'preview'
  } else {
    // eslint-disable-next-line no-undef
    global.isProd = BLOG.isProd
  }

  return (
    <GlobalContext.Provider value={global}>{children}</GlobalContext.Provider>
  )
}

/**
 * 统一处理服务端和客户端的获取站点信息的方法
 */
export async function fetchGlobalAllData(props, from) {
  const global = mergeDeep({}, props)

  // 获取站点数据
  const siteInfo = await fetchSiteData(props, from)

  // 合并站点数据到 global
  mergeDeep(global, siteInfo)

  return global
}

/**
 * 统一处理服务端和客户端的获取站点信息的方法
 */
export async function fetchSiteData(props, from) {
  let global = mergeDeep({}, props)
  let siteInfo = props?.siteInfo

  // 服务器端运行
  if (!isBrowser) {
    const siteData = await fetchSite(props.NOTION_PAGE_ID, from)
    siteInfo = siteData?.siteInfo
    mergeDeep(global, siteData)
  }

  // 客户端运行
  if (isBrowser && !siteInfo) {
    const url = getQueryParam(window.location.href, 'from')
    const siteData = await fetchSite(props.NOTION_PAGE_ID, url)
    siteInfo = siteData?.siteInfo
    mergeDeep(global, siteData)
  }

  return global
}
