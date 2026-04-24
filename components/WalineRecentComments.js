import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useEffect, useState } from 'react'

function stripHtml(value) {
  if (!value) {
    return ''
  }

  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function normalizeRecentComments(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.comments)) {
    return payload.comments
  }

  return []
}

function getCommentTime(comment) {
  const value =
    comment?.time ||
    comment?.insertedAt ||
    comment?.createdAt ||
    comment?.created_at ||
    comment?.date

  if (!value) {
    return ''
  }

  const date = typeof value === 'number' ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('ja-JP')
}

export default function WalineRecentComments({ count = 5 }) {
  const serverURL = siteConfig('COMMENT_WALINE_SERVER_URL')
  const enabled = String(siteConfig('COMMENT_WALINE_RECENT')).toLowerCase() === 'true'

  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !serverURL) {
      setItems([])
      setError('')
      return
    }

    let cancelled = false

    async function loadRecentComments() {
      try {
        setLoading(true)

        const base = String(serverURL).replace(/\/$/, '')
        const url = `${base}/api/comment?type=recent&count=${count}&_ts=${Date.now()}`

        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
          credentials: 'omit',
          headers: {
            Accept: 'application/json'
          }
        })

        if (!response.ok) {
          if (!cancelled) {
            setItems([])
            setError(`HTTP ${response.status}`)
          }
          return
        }

        const payload = await response.json()
        const comments = normalizeRecentComments(payload)

        if (!cancelled) {
          setItems(comments)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setItems([])
          setError(err?.message || 'failed to load comments')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRecentComments()
    const timer = setInterval(loadRecentComments, 30000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [enabled, serverURL, count])

  if (!enabled || !serverURL) {
    return null
  }

  return (
    <div className='mb-6 rounded bg-white shadow dark:bg-gray-800'>
      <div className='border-b px-4 py-3 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300'>
        最近のコメント
      </div>

      <div className='px-4 py-3 text-sm text-gray-700 dark:text-gray-300'>
        {loading && items.length === 0 && (
          <div className='text-gray-500'>読み込み中...</div>
        )}

        {!loading && error && (
          <div className='text-gray-500'>
            コメントを取得できませんでした。
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className='text-gray-500'>
            まだコメントはありません。
          </div>
        )}

        {!error && items.length > 0 && (
          <ul className='space-y-3'>
            {items.map((comment, index) => {
              const text = stripHtml(comment.comment || comment.content || comment.text || comment.orig)
              const nick = stripHtml(comment.nick || comment.nickname || comment.author || 'anonymous')
              const path = comment.url || comment.path || comment.link || '/'
              const time = getCommentTime(comment)

              return (
                <li key={comment.objectId || comment.id || index} className='leading-6'>
                  <SmartLink href={path} className='block hover:text-blue-600'>
                    <div className='truncate text-gray-800 dark:text-gray-200'>
                      {text || '(本文なし)'}
                    </div>
                    <div className='truncate text-xs text-gray-500'>
                      {nick}{time ? ` / ${time}` : ''}
                    </div>
                  </SmartLink>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
