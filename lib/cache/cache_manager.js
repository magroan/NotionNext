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

// @link /data pretty json format
export async function getDataFromCache(key, force) {
  if (parseBoolLike(BLOG.ENABLE_CACHE) || force) {
    const dataFromCache = await getApi().getCache(key)
    if (!dataFromCache || JSON.stringify(dataFromCache) === '[]') {
      return null
    }
    return dataFromCache
  }
  return null
}

// @link /data pretty json format
export async function setDataToCache(key, data) {
  // Disable cache while prebuilding
  if (parseBoolLike(BLOG.ENABLE_CACHE)) {
    await getApi().setCache(key, data)
  }
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
  if (!parseBoolLike(BLOG.ENABLE_CACHE)) {
    return
  }
  await getApi().delCache(key)
}
