import BLOG from '@/blog.config'
import { cleanCache } from '@/lib/cache/local_file_cache'

function normalizeRecentCommentsResponse(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (data && data.errno === 0 && Array.isArray(data.data)) {
    return data.data
  }

  if (data && Array.isArray(data.comments)) {
    return data.comments
  }

  if (data && data.data) {
    if (Array.isArray(data.data)) {
      return data.data
    }

    if (Array.isArray(data.data.comments)) {
      return data.data.comments
    }

    if (Array.isArray(data.data.list)) {
      return data.data.list
    }
  }

  return []
}

/**
 * キャッシュ削除と Waline 最新コメント取得を処理する
 * @param {*} req
 * @param {*} res
 */
export default async function handler(req, res) {
  const type = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type

  if (type === 'walineRecent') {
    const countRaw = Array.isArray(req.query.count)
      ? req.query.count[0]
      : req.query.count

    const count = Number.parseInt(countRaw || '5', 10)
    const safeCount = Number.isFinite(count) && count > 0 ? count : 5

    const serverURL =
      process.env.NEXT_PUBLIC_WALINE_SERVER_URL ||
      BLOG.COMMENT_WALINE_SERVER_URL ||
      'https://comment.asami.chiba.jp'

    const baseURL = String(serverURL).replace(/\/$/, '')
    const targetURL = `${baseURL}/api/comment?type=recent&count=${safeCount}`

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

    try {
      const response = await fetch(targetURL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NotionNext Waline Recent Proxy',
          Referer: BLOG.LINK || 'https://asami.chiba.jp/'
        }
      })

      const text = await response.text()

      if (!response.ok) {
        return res.status(response.status).json({
          ok: false,
          error: `Waline recent API error: ${response.status} ${response.statusText}`,
          targetURL
        })
      }

      let json = null
      try {
        json = JSON.parse(text)
      } catch (error) {
        return res.status(502).json({
          ok: false,
          error: 'Waline recent API returned invalid JSON',
          targetURL
        })
      }

      const comments = normalizeRecentCommentsResponse(json)

      return res.status(200).json({
        ok: true,
        comments
      })
    } catch (error) {
      return res.status(502).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        targetURL
      })
    }
  }

  try {
    await cleanCache()
    res.status(200).json({
      status: 'success',
      message: 'Clean cache successful!'
    })
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Clean cache failed!',
      error
    })
  }
}