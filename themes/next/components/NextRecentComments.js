import { useEffect, useState } from 'react'
import { RecentComments } from '@waline/client'
import { siteConfig } from '@/lib/config'

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildHref(item) {
  const rawUrl = item?.url || item?.path || item?.pathname || ''
  const rawLink = item?.link || ''

  try {
    if (/^https?:\/\//i.test(rawUrl)) {
      return rawUrl
    }

    if (rawLink) {
      const base = /^https?:\/\//i.test(rawLink)
        ? rawLink
        : `https://${rawLink}`
      return new URL(rawUrl || '/', base).toString()
    }

    if (!rawUrl) {
      return '#'
    }

    return rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  } catch (error) {
    return rawUrl || '#'
  }
}

function normalizeRecentCommentsResponse(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (data && Array.isArray(data.comments)) {
    return data.comments
  }

  if (data && data.errno === 0 && Array.isArray(data.data)) {
    return data.data
  }

  if (data && data.data) {
    if (Array.isArray(data.data.comments)) {
      return data.data.comments
    }

    if (Array.isArray(data.data.list)) {
      return data.data.list
    }

    if (Array.isArray(data.data)) {
      return data.data
    }
  }

  return null
}

async function fetchRecentCommentsFromAPI(baseURL, count) {
  const candidates = [
    `${baseURL}/comment?type=recent&count=${count}`,
    `${baseURL}/api/comment?type=recent&count=${count}`
  ]

  let lastError = null

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        if ([401, 403, 404].includes(response.status)) {
          return []
        }
        lastError = `Waline recent API error: ${response.status} ${response.statusText}`
        continue
      }

      const json = await response.json()
      const comments = normalizeRecentCommentsResponse(json)

      if (comments !== null) {
        return comments
      }

      lastError = 'Waline recent API returned unsupported payload'
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
  }

  throw new Error(lastError || 'Waline recent API の取得に失敗しました')
}

export default function NextRecentComments({ count = 5 }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    let destroyRecentComments = null

    async function loadRecentComments() {
      try {
        const serverURL = siteConfig('COMMENT_WALINE_SERVER_URL', false)

        if (!serverURL) {
          throw new Error('COMMENT_WALINE_SERVER_URL が未設定です')
        }

        const baseURL = String(serverURL).replace(/\/$/, '')

        try {
          const result = await RecentComments({
            serverURL: baseURL,
            count
          })

          if (typeof result?.destroy === 'function') {
            destroyRecentComments = result.destroy
          }

          const comments = normalizeRecentCommentsResponse(result)

          if (comments !== null) {
            if (!cancelled) {
              setItems(comments)
              setError('')
              setLoading(false)
            }
            return
          }
        } catch (error) {
          // fallback で raw API を試す
        }

        const comments = await fetchRecentCommentsFromAPI(baseURL, count)

        if (!cancelled) {
          setItems(comments)
          setError('')
          setLoading(false)
        }
      } catch (errorValue) {
        if (!cancelled) {
          setItems([])
          setError(
            errorValue instanceof Error ? errorValue.message : String(errorValue)
          )
          setLoading(false)
        }
      }
    }

    loadRecentComments()

    return () => {
      cancelled = true
      if (typeof destroyRecentComments === 'function') {
        destroyRecentComments()
      }
    }
  }, [count])

  if (loading) {
    return <div className='text-sm text-gray-500'>読み込み中...</div>
  }

  if (error) {
    return <div className='text-sm text-gray-500'>コメントは現在利用できません。</div>
  }

  if (!items.length) {
    return <div className='text-sm text-gray-500'>まだコメントはありません。</div>
  }

  return (
    <ul className='space-y-2 text-sm'>
      {items.map((item, index) => {
        const href = buildHref(item)
        const nick = item?.nick || item?.user?.nick || '匿名'
        const preview = stripHtml(
          item?.orig || item?.comment || item?.content || ''
        )
        const short =
          preview.length > 48 ? `${preview.slice(0, 48)}...` : preview

        return (
          <li key={item?.objectId || item?.id || `${index}`}>
            <a href={href} className='hover:underline'>
              <span className='font-semibold'>{nick}</span>
              {short && (
                <span className='ml-1 text-gray-500'>「{short}」</span>
              )}
            </a>
          </li>
        )
      })}
    </ul>
  )
}