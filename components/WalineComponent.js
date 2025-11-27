import { createRef, useEffect } from 'react'
import { init } from '@waline/client'
import { useRouter } from 'next/router'
import '@waline/client/style'
import { siteConfig } from '@/lib/config'

let waline = null
let currentPath = ''

/**
 * Waline コメントコンポーネント
 * @see https://waline.js.org/guide/get-started.html
 */
const WalineComponent = (props) => {
  const containerRef = createRef()
  const router = useRouter()

  // ルートが変わったときに Waline 側のパスを更新
  const updateWaline = (url) => {
    if (waline && url !== currentPath) {
      currentPath = url
      waline.update({ path: url })
    }
  }

  useEffect(() => {
    if (!waline) {
      waline = init({
        ...props,
        el: containerRef.current,
        serverURL: siteConfig('COMMENT_WALINE_SERVER_URL'),
        lang: siteConfig('LANG'),

        reaction: true

        dark: 'html.dark',

        // コメント本文で使えるスタンプセット（必要に応じて調整）
        emoji: [
          '//npm.elemecdn.com/@waline/emojis@1.1.0/tieba',
          '//npm.elemecdn.com/@waline/emojis@1.1.0/weibo',
          '//npm.elemecdn.com/@waline/emojis@1.1.0/bilibili'
        ],
  //リアクションタイトルの文言を上書き
        locale: {
          reactionTitle: 'Comment'
        },
        // 現在のページパス
        path: router.asPath
      })

      currentPath = router.asPath
    }

    // コメント欄へのスクロール用処理を設定
    router.events.on('routeChangeComplete', updateWaline)
    const anchor = window.location.hash

    if (anchor) {
      // 変化を監視したい要素（コメントリスト）を取得
      const targetNode = document.getElementsByClassName('wl-cards')[0]

      // DOM の変化を検知したときに実行するコールバック
      const mutationCallback = (mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const anchorElement = document.getElementById(anchor.substring(1))
            // 対象のコメント要素が見つかったらスクロール＆アニメーション
            if (anchorElement && anchorElement.className === 'wl-item') {
              anchorElement.scrollIntoView({ block: 'end', behavior: 'smooth' })
              setTimeout(() => {
                anchorElement.classList.add('animate__animated')
                anchorElement.classList.add('animate__bounceInRight')
                observer.disconnect()
              }, 300)
            }
          }
        }
      }

      // 子要素の追加・削除を監視する
      const observer = new MutationObserver(mutationCallback)
      if (targetNode) {
        observer.observe(targetNode, { childList: true })
      }
    }

    return () => {
      if (waline) {
        waline.destroy()
        waline = null
        currentPath = ''
      }
      router.events.off('routeChangeComplete', updateWaline)
    }
  }, [])

  return <div ref={containerRef} />
}

export default WalineComponent
