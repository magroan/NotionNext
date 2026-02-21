import BLOG from '@/blog.config'
import { getDataFromCache, setDataToCache } from '@/lib/cache/cache_local'
import { isBrowser } from '@/lib/utils'

// 1. 为了保持数据最新，build期间禁用缓存
// 2. 本地开发环境禁用缓存
const enableCacheInVercel =
  process.env.npm_lifecycle_event === 'build' ||
  process.env.npm_lifecycle_event === 'export' ||
  !BLOG['isProd']

// Accept boolean-like values from env (e.g. true/false, True/False, 1/0, yes/no)
const toBool = v => {
  if (typeof v === 'boolean') return v
  if (v === null || v === undefined) return false
  const s = String(v).trim().toLowerCase()
  return ['true', '1', 'yes', 'y', 'on'].includes(s)
}

/**
 * 缓存封装，可用于服务端和客户端
 * @param key
 * @param getDataFunction
 * @param getDataArgs
 * @returns {Promise<any|*>}
 */
export async function getOrSetDataWithCache(
  key,
  getDataFunction,
  getDataArgs = [],
  force = false
) {
  let data
  // 先获取缓存
  if (!enableCacheInVercel) {
    data = await getDataFromCache(key)
  }

  // 无缓存则重新获取
  if (!data || force) {
    data = await getDataFunction(...getDataArgs)
    // 设置缓存
    if (!enableCacheInVercel) {
      await setDataToCache(key, data)
    }
  }
  return data
}

/**
 * 从缓存读取数据
 * @param key
 * @returns {Promise<*>}
 */
export async function getDataFromCacheWithCacheManager(key) {
  if (!toBool(BLOG.ENABLE_CACHE)) {
    return null
  }
  if (!key) {
    return null
  }

  // 服务端缓存
  if (!isBrowser) {
    // return await getDataFromCache(key)
    return null
  }

  // 浏览器端缓存
  return getDataFromCache(key)
}

/**
 * 设置缓存数据
 * @param key
 * @param data
 * @returns {Promise<void>}
 */
export async function setDataToCacheWithCacheManager(key, data) {
  if (!toBool(BLOG.ENABLE_CACHE)) {
    return
  }
  if (!key) {
    return
  }

  // 服务端缓存
  if (!isBrowser) {
    // await setDataToCache(key, data)
    return
  }

  // 浏览器端缓存
  await setDataToCache(key, data)
}
