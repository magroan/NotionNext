import BLOG from '@/blog.config'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useState } from 'react'
import { generateLocaleDict, initLocale, redirectUserLang } from './utils/lang'

// NotionConfig / env 由来の boolean 風値（True/False 等）を安全に boolean へ
const parseBoolLike = (v, fallback = false) => {
  if (v === undefined || v === null) return fallback
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  const s = String(v).trim()
  if (s === '') return fallback
  const lower = s.toLowerCase()
  if (['true', '1', 'yes', 'y', 'on'].includes(lower)) return true
  if (['false', '0', 'no', 'n', 'off'].includes(lower)) return false
  return fallback
}

const GlobalContext = createContext()

export const GlobalContextProvider = props => {
  const router = useRouter()
  const themeQuery = router.query.theme
  const [isLoading, setOnLoading] = useState(true)
  const [blogData, updateBlogData] = useState({
    // 默认指向blog.config.js的配置文件
    NOTION_CONFIG: BLOG,
    THEME_CONFIG: {},
    siteInfo: {},
    notice: null,
    // 菜单
    customNav: null,
    // 分类
    categoryOptions: [],
    // 标签
    tagOptions: [],
    // 自定义字体
    customFont: null,
    // 页面数据
    pageMeta: {},
    // 文章列表
    allPages: [],
    // 文章总数
    postCount: 0,
    // 文章总数
    postCountByGroup: 0,
    // 推荐文章
    topPosts: [],
    // 动态
    latestPosts: [],
    // 最新评论
    latestComments: [],
    // 最新回复
    latestRecommends: [],
    // 是否整页
    fullWidth: false,
    // 字典
    localeDict: generateLocaleDict(BLOG.LANG),
    // 是否夜间模式
    isDarkMode: false,
    // 是否折叠菜单
    isCollapsed: false,
    // API请求处理次数
    processingCount: 0
  })

  const updateBlog = (data = {}) => {
    // 如果从页面?theme=xxx 进入,则强制覆盖主题
    if (themeQuery) {
      data = { ...data, NOTION_CONFIG: { ...data.NOTION_CONFIG, THEME: themeQuery } }
    }
    // console.log('UpdateBlogData', data)
    updateBlogData(prevData => ({ ...prevData, ...data }))
  }

  const updateLocale = lang => {
    updateBlogData(prevData => ({
      ...prevData,
      localeDict: generateLocaleDict(lang)
    }))
  }

  const updateDarkMode = isDarkMode => {
    updateBlogData(prevData => ({
      ...prevData,
      isDarkMode: isDarkMode
    }))
  }

  const updateCollapse = isCollapsed => {
    updateBlogData(prevData => ({
      ...prevData,
      isCollapsed: isCollapsed
    }))
  }

  const updateProcessingCount = processingCount => {
    updateBlogData(prevData => ({
      ...prevData,
      processingCount: processingCount
    }))
  }

  // 默认深色模式
  const defaultDarkMode = BLOG.DEFAULT_DARK_MODE

  useEffect(() => {
    // 处理主题?theme=xxx 写入cookie
    if (themeQuery) {
      const cookie = `theme=${themeQuery};path=/;max-age=31536000`
      document.cookie = cookie
    }
  }, [themeQuery])

  useEffect(() => {
    initDarkMode(updateDarkMode, defaultDarkMode)
    // 处理多语言自动重定向
    // - JSON.parse('False') のようなケースで落ちないようにする
    if (parseBoolLike(blogData.NOTION_CONFIG?.REDIRECT_LANG)) {
      redirectUserLang(blogData.NOTION_CONFIG?.NOTION_PAGE_ID)
    }
    setOnLoading(false)
  }, [])

  const initDarkMode = (updateDarkMode, defaultDarkMode) => {
    // 本地cookie主题优先
    const cookieTheme = getCookie('theme')
    if (cookieTheme) {
      updateBlogData(prevData => ({
        ...prevData,
        NOTION_CONFIG: { ...prevData.NOTION_CONFIG, THEME: cookieTheme }
      }))
    }

    // 默认深色模式
    if (!defaultDarkMode) {
      return
    }

    // 初始化深色模式
    const isDarkMode =
      localStorage.getItem('theme') === 'dark' ||
      (window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    // 如果没设置过则按默认深色模式
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', defaultDarkMode ? 'dark' : 'light')
      if (defaultDarkMode) {
        document.documentElement.classList.add('dark')
      }
    }

    // 如果设置过则按设置
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    updateDarkMode(isDarkMode)
  }

  const getCookie = name => {
    if (typeof document === 'undefined') return undefined
    const cookies = document.cookie ? document.cookie.split('; ') : []
    for (const c of cookies) {
      const eq = c.indexOf('=')
      if (eq < 0) continue
      const k = c.slice(0, eq)
      if (k === name) {
        return decodeURIComponent(c.slice(eq + 1))
      }
    }
    return undefined
  }
  return (
    <GlobalContext.Provider
      value={{
        ...blogData,
        isLoading,
        updateBlog,
        updateLocale,
        updateDarkMode,
        updateCollapse,
        updateProcessingCount
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  )
}

export const useGlobal = () => useContext(GlobalContext)
