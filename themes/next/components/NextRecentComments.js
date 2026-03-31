import { useEffect, useState } from 'react'
import SmartLink from '@/components/SmartLink'

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
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

/**
 * 最新コメント一覧を表示する
 * @param {*} props
 * @returns
 */
const NextRecentComments = props => {
  const count = props?.count || 5
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadComments = async () => {
      try {
        const response = await fetch(
          `/api/cache?type=walineRecent&count=${count}`,
          {
            method: 'GET',
            credentials: 'same-origin'
          }
        )

        const json = await response.json()

        if (!response.ok || !json?.ok) {
          const message =
            json?.error ||
            `最新コメントの取得に失敗しました status=${response.status}`

          if (!cancelled) {
            setComments([])
            setError(message)
            setLoading(false)
          }
          return
        }

        const list = normalizeRecentCommentsResponse(json)

        if (!cancelled) {
          setComments(list)
          setError('')
          setLoading(false)
        }
      } catch (errorValue) {
        if (!cancelled) {
          setComments([])
          setError(
            errorValue instanceof Error ? errorValue.message : String(errorValue)
          )
          setLoading(false)
        }
      }
    }

    loadComments()

    return () => {
      cancelled = true
    }
  }, [count])

  if (loading) {
    return (
      <div>
        読み込み中
        <i className='ml-2 fas fa-spinner animate-spin' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-sm text-red-600 break-all'>
        最新コメントの取得に失敗しました
        <br />
        {error}
      </div>
    )
  }

  if (!comments || comments.length === 0) {
    return <div>コメントはまだありません</div>
  }

  return (
    <>
      {comments.map(comment => {
        const preview = stripHtml(
          comment?.comment || comment?.orig || comment?.content || ''
        )
        const shortPreview =
          preview.length > 60 ? `${preview.slice(0, 60)}...` : preview

        return (
          <div key={comment.objectId} className='pb-2'>
            <div className='dark:text-gray-300 text-gray-600 text-xs waline-recent-content wl-content'>
              {shortPreview}
            </div>
            <div className='dark:text-gray-400 text-gray-500 text-sm text-right cursor-pointer hover:text-red-500 hover:underline pt-1'>
              <SmartLink
                href={{
                  pathname: comment.url,
                  hash: comment.objectId,
                  query: { target: 'comment' }
                }}>
                --{comment.nick}
              </SmartLink>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default NextRecentComments