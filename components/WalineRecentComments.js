// components/WalineRecentComments.js
import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/config'

export default function WalineRecentComments() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const server = siteConfig('COMMENT_WALINE_SERVER_URL')
    if (!server) return

    const base = server.replace(/\/$/, '')
    const url = `${base}/comment?type=recent&count=5`

    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res?.errno === 0 && Array.isArray(res.data)) {
          setItems(res.data)
        }
      })
      .catch(err => {
        console.error('[Waline recent] fetch error', err)
      })
  }, [])

  if (!items.length) {
    // 1件もないときは何も描画しない。枠だけ出したければここを調整
    return null
  }

  return (
    <div className="waline-recent-content">
      <div className="font-bold mb-2">最近のコメント</div>
      <ul className="space-y-2 text-sm">
        {items.map(item => {
          // Waline のレスポンス: link: "asami.chiba.jp", url: "/article/xxx"
          const href = `https://${item.link}${item.url}`

          return (
            <li key={item.objectId}>
              <a href={href} className="hover:underline">
                <span className="font-semibold">{item.nick}</span>
                <span className="ml-1 text-gray-500">
                  「{item.orig}」
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
