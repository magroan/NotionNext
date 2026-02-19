import { siteConfig } from '@/lib/config'
import { compressImage, mapImgUrl } from '@/lib/db/notion/mapImage'
import { isBrowser, loadExternalResource } from '@/lib/utils'
import mediumZoom from '@fisch0920/medium-zoom'
import 'katex/dist/katex.min.css'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { NotionRenderer } from 'react-notion-x'
import { applyRubyForNotionPage } from '@/lib/plugins/ruby'

/**
 * サイト全体の中核コンポーネント
 * Notion のデータを Web ページとして描画する
 */
const NotionPage = ({ post, className }) => {
  // ギャラリー画像のクリック遷移を無効化するか
  const POST_DISABLE_GALLERY_CLICK = siteConfig('POST_DISABLE_GALLERY_CLICK')

  // データベース（表形式）のクリック遷移を無効化するか
  const POST_DISABLE_DATABASE_CLICK = siteConfig('POST_DISABLE_DATABASE_CLICK')

  // スポイラーテキストのトリガー文字
  const SPOILER_TEXT_TAG = siteConfig('SPOILER_TEXT_TAG')

  // Medium Zoom（画像拡大）
  const zoom =
    isBrowser &&
    mediumZoom({
      background: 'rgba(0, 0, 0, 0.2)',
      margin: getMediumZoomMargin()
    })

  const zoomRef = useRef(zoom ? zoom.clone() : null)
  const IMAGE_ZOOM_IN_WIDTH = siteConfig('IMAGE_ZOOM_IN_WIDTH', 1200)

  /**
   * 初回レンダー時：URL の #hash に自動スクロールする
   */
  useEffect(() => {
    autoScrollToHash()
  }, [])

  /**
   * 記事が切り替わった時に実行される
   */
  useEffect(() => {
    // ギャラリー画像のリンク無効化
    if (POST_DISABLE_GALLERY_CLICK) {
      processGalleryImg(zoomRef?.current)
    }

    // データベースのリンク無効化
    if (POST_DISABLE_DATABASE_CLICK) {
      processDisableDatabaseUrl()
    }

    /**
     * 拡大表示した画像を、高解像度版に置き換える
     */
    const observer = new MutationObserver(mutationsList => {
      mutationsList.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          if (mutation.target.classList.contains('medium-zoom-image--opened')) {
            setTimeout(() => {
              const src = mutation?.target?.getAttribute('src')
              mutation?.target?.setAttribute(
                'src',
                compressImage(src, IMAGE_ZOOM_IN_WIDTH)
              )
            }, 800)
          }
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [post])

  /**
   * スポイラーテキスト等の処理 + 不要プロパティの削除 + ルビ変換
   */
  useEffect(() => {
    // Spoiler（テキスト伏せ字）
    if (SPOILER_TEXT_TAG) {
      import('lodash/escapeRegExp').then(escapeRegExp => {
        Promise.all([
          loadExternalResource('/js/spoilerText.js', 'js'),
          loadExternalResource('/css/spoiler-text.css', 'css')
        ]).then(() => {
          window.textToSpoiler &&
            window.textToSpoiler(escapeRegExp.default(SPOILER_TEXT_TAG))
        })
      })
    }

    /**
     * Notion 内部プロパティ（タイトル下のやつ）を削除
     */
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(
        '.notion-collection-page-properties'
      )
      elements?.forEach(e => e?.remove())

      /**
       * ? ルビ変換をここで実行
       * NotionRenderer が DOM を吐き出した後で実行する必要があるため
       */
      applyRubyForNotionPage()
    }, 1000)

    return () => clearTimeout(timer)
  }, [post])

  // const cleanBlockMap = cleanBlocksWithWarn(post?.blockMap);
  // console.log('NotionPage render with post:', post);

  return (
    <div
      id='notion-article'
      className={`mx-auto overflow-hidden ${className || ''}`}>
      <NotionRenderer
        recordMap={post?.blockMap}
        mapPageUrl={mapPageUrl}
        mapImageUrl={mapImgUrl}
        components={{
          Code,
          Collection,
          Equation,
          Modal,
          Pdf,
          Tweet
        }}
      />

      <AdEmbed />
      <PrismMac />
    </div>
  )
}


/**
 * データベース（表）内の URL を無効化する
 */
const processDisableDatabaseUrl = () => {
  if (isBrowser) {
    const links = document.querySelectorAll('.notion-table a')
    for (const e of links) {
      e.removeAttribute('href')
    }
  }
}

/**
 * ギャラリー画像のクリック遷移を無効化し、Zoom 対応にする
 */
const processGalleryImg = zoom => {
  setTimeout(() => {
    if (isBrowser) {
      const imgList = document?.querySelectorAll(
        '.notion-collection-card-cover img'
      )
      if (imgList && zoom) {
        for (let i = 0; i < imgList.length; i++) {
          zoom.attach(imgList[i])
        }
      }

      const cards = document.getElementsByClassName('notion-collection-card')
      for (const e of cards) {
        e.removeAttribute('href')
      }
    }
  }, 800)
}

/**
 * URL の #hash に自動スクロール
 */
const autoScrollToHash = () => {
  setTimeout(() => {
    const hash = window?.location?.hash
    if (hash && hash.length > 0) {
      const tocNode = document.getElementById(hash.substring(1))
      if (tocNode && tocNode?.className?.includes('notion')) {
        tocNode.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    }
  }, 180)
}

/**
 * Notion のページID → ブログ内リンクへ変換
 */
const mapPageUrl = id => {
  return '/' + id.replace(/-/g, '')
}

/**
 * Medium Zoom のマージン
 */
function getMediumZoomMargin() {
  const width = window.innerWidth

  if (width < 500) return 8
  if (width < 800) return 20
  if (width < 1280) return 30
  if (width < 1600) return 40
  if (width < 1920) return 48
  return 72
}

// コードブロック
const Code = dynamic(
  () =>
    import('react-notion-x/build/third-party/code').then(m => m.Code),
  { ssr: false }
)

// 数式（KaTeX）
const Equation = dynamic(
  () =>
    import('@/components/Equation').then(async m => {
      await import('@/lib/plugins/mhchem') // 化学式対応
      return m.Equation
    }),
  { ssr: false }
)

// PDF ビューア
const Pdf = dynamic(() => import('@/components/Pdf').then(m => m.Pdf), {
  ssr: false
})

// コード装飾
const PrismMac = dynamic(() => import('@/components/PrismMac'), {
  ssr: false
})

// Tweet 埋め込み
const TweetEmbed = dynamic(() => import('react-tweet-embed'), {
  ssr: false
})
const Tweet = ({ id }) => <TweetEmbed tweetId={id} />

// Google Adsense
const AdEmbed = dynamic(
  () => import('@/components/GoogleAdsense').then(m => m.AdEmbed),
  { ssr: true }
)

// Notion のコレクション
const Collection = dynamic(
  () =>
    import('react-notion-x/build/third-party/collection').then(
      m => m.Collection
    ),
  {
    ssr: true
  }
)

const Modal = dynamic(
  () => import('react-notion-x/build/third-party/modal').then(m => m.Modal),
  { ssr: false }
)

export default NotionPage
