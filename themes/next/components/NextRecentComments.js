import { useEffect, useState } from 'react'

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
  if (data && data.ok && Array.isArray(data.comments)) {
    return data.comments
  }

  if (Array.isArray(data)) {
    return data
  }

  return []
}

export default function WalineRecentComments({ count = 5 }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadRecentComments() {
      try {
        const response = await fetch(`/api/cache?type=walineRecent&count=${count}`, {
          method: 'GET',
          credentials: 'same-origin'
        })

        const json = await response.json()

        if (!response.ok || !json?.ok) {
          const message =
            json?.error ||
            `最近のコメントの取得に失敗しました status=${response.status}`

          if (!cancelled) {
            setItems([])
            setError(message)
            setLoading(false)
          }
          return
        }

        const comments = normalizeRecentCommentsResponse(json)

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
    }
  }, [count])

  if (loading) {
    return <div className='text-sm text-gray-500'>読み込み中...</div>
  }

  if (error) {
    return (
      <div className='text-sm text-red-600'>
        最近のコメントの取得に失敗しました。
        <br />
        <span className='break-all opacity-80'>{error}</span>
      </div>
    )
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