import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/config'

export default function WalineRecentComments() {
  // null: 未取得 / []: 0件 / [..]: コメントあり
  const [items, setItems] = useState(null)

  useEffect(() => {
    const server = siteConfig('COMMENT_WALINE_SERVER_URL')
    if (!server) return

    const base = server.replace(/\/$/, '')
    const url = `${base}/comment?type=recent&count=5`

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        console.log('[Waline recent] response:', res)

        let list = []

        // パターン1: Waline が配列を直接返す
        //   [ {status: 'approved', ...}, ... ]
        if (Array.isArray(res)) {
          list = res
        }
        // パターン2: { errno: 0, data: [ ... ] } 形式
        else if (res && res.errno === 0 && Array.isArray(res.data)) {
          list = res.data
        }

        setItems(list)
      })
      .catch((err) => {
        console.error('[Waline recent] fetch error', err)
        setItems([]) // エラー時も 0件扱い
      })
  }, [])

  // まだ取得中
  if (items === null) {
    return <div className="text-sm text-gray-500">読み込み中…</div>
  }

  // コメント 0 件
  if (!items.length) {
    return <div className="text-sm text-gray-500">まだコメントはありません。</div>
  }

  // コメントあり
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => {
        // link: "asami.chiba.jp", url: "/article/xxxx"
        const href = `https://${item.link}${item.url}`

        return (
          <li key={item.objectId}>
            <a href={href} className="hover:underline">
              <span className="font-semibold">{item.nick}</span>
              <span className="ml-1 text-gray-500">「{item.orig}」</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
