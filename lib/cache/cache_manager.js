import BLOG from '@/blog.config'
import FileCache from './local_file_cache'
import MemoryCache from './memory_cache'
import RedisCache from './redis_cache'

/**
 * NotionConfig / env から来る boolean 風値を安全に boolean にする。
 * - JSON.parse('False') のようなケースで落ちないようにする
 */
const parseBoolLike = (v, fallback = false) => {
  if (v === undefined || v === null) return fallback
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  const s = String(v).trim()
  if (s === '') return fallback
  const lower = s.toLowerCase()
  if (['true', '1', 'yes', 'y', 'on'].includes(lower)) return true
  if (['false', '0', 'no', 'n', 'off'].includes(lower)) return false
  try {
    return Boolean(JSON.parse(lower))
  } catch {
    return fallback
  }
}

// キーを安全に文字列化（念のため）
const normalizeKey = key => {
  if (typeof key === 'string') return key
  try {
    return JSON.stringify(key)
  } catch {
    return String(key)
  }
}

// @link /data pretty json format
export async function getDataFromCache(key, force) {
  const k = normalizeKey(key)
  if (parseBoolLike(BLOG.ENABLE_CACHE) || force) {
    const dataFromCache = await getApi().getCache(k)
    if (!dataFromCache || JSON.stringify(dataFromCache) === '[]') {
      return null
    }
    return dataFromCache
  }
  return null
}

// @link /data pretty json format
export async function setDataToCache(key, data) {
  const k = normalizeKey(key)
  // Disable cache while prebuilding
  if (parseBoolLike(BLOG.ENABLE_CACHE)) {
    await getApi().setCache(k, data)
  }
}

/**
 * Upstream互換：
 * - 2引数: getOrSetDataWithCache(key, async ()=>data)
 * - 4引数: getOrSetDataWithCache(key, async (pageId, from)=>data, pageId, from)
 * - 末尾に boolean を渡した場合は forceCacheRead として扱う（任意）
 *
 * @param {string|any} key
 * @param {Function} getter async (...args) => data
 * @param  {...any} args getter に渡す引数（最後が boolean なら forceCacheRead として扱う）
 */
export async function getOrSetDataWithCache(key, getter, ...args) {
  const k = normalizeKey(key)

  // optional: 末尾 boolean を forceCacheRead として解釈
  let forceCacheRead = false
  if (args.length > 0 && typeof args[args.length - 1] === 'boolean') {
    forceCacheRead = args.pop()
  }

  const cached = await getDataFromCache(k, forceCacheRead)
  if (cached !== null && cached !== undefined) {
    return cached
  }

  const data = await getter(...args)

  // null/undefined はキャッシュしない（安全側）
  if (data !== null && data !== undefined) {
    await setDataToCache(k, data)
  }
  return data
}

let cacheApi = null

const getApi = () => {
  if (!cacheApi) {
    // Cache provider
    if (BLOG.REDIS_URL) {
      cacheApi = RedisCache.create(BLOG.REDIS_URL)
    } else if (BLOG.ENABLE_FILE_CACHE) {
      cacheApi = FileCache.create()
    } else {
      cacheApi = MemoryCache.create()
    }
    console.log('[CACHE]', `type:${cacheApi.type}`)
  }
  return cacheApi
}

export async function delCacheData(key) {
  const k = normalizeKey(key)
  if (!parseBoolLike(BLOG.ENABLE_CACHE)) {
    return
  }
  await getApi().delCache(k)
}
