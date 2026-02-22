import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/config'

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildHref(item) {
  const rawUrl = item?.url || item?.path || item?.pathname || ''
  const rawLink = item?.link || ''

  try {
    // url が絶対URLならそれを優先
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl

    // link があれば base として使う
    if (rawLink) {
      const base = /^https?:\/\//i.test(rawLink) ? rawLink : `https://${rawLink}`
      return new URL(rawUrl || '/', base).toString()
    }

    // link が無い場合は相対として扱う
    if (!rawUrl) return '#'
    return rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  } catch {
    return rawUrl || '#'
  }
}

function normalizeRecentResponse(res) {
  // パターンA: 配列を直接返す
  if (Array.isArray(res)) return res

  // パターンB: { errno: 0, data: [...] }
  if (res && res.errno === 0 && Array.isArray(res.data)) return res.data

  // パターンC: { data: [...] } / { data: { list: [...] } } / { data: { comments: [...] } }
  if (res && res.data) {
    if (Array.isArray(res.data)) return res.data
    if (Array.isArray(res.data.list)) return res.data.list
    if (Array.isArray(res.data.comments)) return res.data.comments
  }

  return []
}

export default function WalineRecentComments({ count = 5 }) {
  // loading / items / error を明示して「空白」を絶対に作らない
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const server = siteConfig('COMMENT_WALINE_SERVER_URL', false)
        if (!server) {
          if (!cancelled) {
            setError('COMMENT_WALINE_SERVER_URL が未設定です')
            setLoading(false)
          }
          return
        }

        const base = server.replace(/\/$/, '')
        const candidates = [
          `${base}/comment?type=recent&count=${count}`,
          `${base}/api/comment?type=recent&count=${count}` // 環境差吸収
        ]

        let lastErr = null
        for (const url of candidates) {
          try {
            const r = await fetch(url, { mode: 'cors', credentials: 'omit' })
            if (!r.ok) {
              lastErr = `${r.status} ${r.statusText} (${url})`
              continue
            }
            const json = await r.json()
            const list = normalizeRecentResponse(json)

            if (!cancelled) {
              setItems(list)
              setError(null)
              setLoading(false)
            }
            return
          } catch (e) {
            lastErr = String(e)
          }
        }

        if (!cancelled) {
          setItems([])
          setError(lastErr || 'Waline recent API の取得に失敗しました')
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setItems([])
          setError(String(e))
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [count])

  if (loading) {
    return <div className='text-sm text-gray-500'>読み込み中…</div>
  }

  // エラーは「空白」ではなく原因が見えるように出す
  if (error) {
    return (
      <div className='text-sm text-red-600'>
        最近のコメントの取得に失敗しました。<br />
        <span className='break-all opacity-80'>{error}</span>
      </div>
    )
  }

  if (!items.length) {
    return <div className='text-sm text-gray-500'>まだコメントはありません。</div>
  }

  return (
    <ul className='space-y-2 text-sm'>
      {items.map((item, idx) => {
        const href = buildHref(item)
        const nick = item?.nick || item?.user?.nick || '匿名'
        const preview = stripHtml(item?.orig ?? item?.comment ?? item?.content ?? '')
        const short = preview.length > 48 ? `${preview.slice(0, 48)}…` : preview

        return (
          <li key={item?.objectId || item?.id || `${idx}`}>
            <a href={href} className='hover:underline'>
              <span className='font-semibold'>{nick}</span>
              {short && <span className='ml-1 text-gray-500'>「{short}」</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
