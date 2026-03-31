import { siteConfig } from '@/lib/config'
import { compressImage, mapImgUrl } from '@/lib/db/notion/mapImage'
import { isBrowser, loadExternalResource } from '@/lib/utils'
import mediumZoom from '@fisch0920/medium-zoom'
import 'katex/dist/katex.min.css'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { NotionRenderer } from 'react-notion-x'
import { applyRubyForNotionPage } from '@/lib/plugins/ruby'
import RubyText from '@/components/RubyText'

/**
 * Notionの本文を表示する
 * @param {*} param0
 * @returns
 */
const NotionPage = ({ post, className }) => {
  const POST_DISABLE_GALLERY_CLICK = siteConfig('POST_DISABLE_GALLERY_CLICK')
  const POST_DISABLE_DATABASE_CLICK = siteConfig('POST_DISABLE_DATABASE_CLICK')
  const SPOILER_TEXT_TAG = siteConfig('SPOILER_TEXT_TAG')

  const zoom =
    isBrowser &&
    mediumZoom({
      background: 'rgba(0, 0, 0, 0.2)',
      margin: getMediumZoomMargin()
    })

  const zoomRef = useRef(zoom ? zoom.clone() : null)
  const IMAGE_ZOOM_IN_WIDTH = siteConfig('IMAGE_ZOOM_IN_WIDTH', 1200)

  useEffect(() => {
    autoScrollToHash()
  }, [])

  useEffect(() => {
    if (!post?.blockMap?.block || !isBrowser) {
      return
    }

    if (POST_DISABLE_GALLERY_CLICK) {
      processGalleryImg(zoomRef?.current)
    }

    if (POST_DISABLE_DATABASE_CLICK) {
      processDisableDatabaseUrl()
    }

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

    return () => {
      observer.disconnect()
    }
  }, [post, POST_DISABLE_GALLERY_CLICK, POST_DISABLE_DATABASE_CLICK, IMAGE_ZOOM_IN_WIDTH])

  useEffect(() => {
    if (!post?.blockMap?.block || !isBrowser) {
      return
    }

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

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(
        '.notion-collection-page-properties'
      )

      elements?.forEach(element => {
        element?.remove()
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [post, SPOILER_TEXT_TAG])

  useEffect(() => {
    if (!post?.blockMap?.block) {
      return
    }

    const t1 = setTimeout(() => applyRubyForNotionPage(), 50)
    const t2 = setTimeout(() => applyRubyForNotionPage(), 400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [post?.id, post?.blockMap?.block])

  if (!post?.blockMap?.block) {
    return (
      <div
        id='notion-article'
        className={`mx-auto overflow-hidden ${className || ''}`}>
        <div className='py-8 text-sm text-gray-500'>
          本文の取得に失敗したため、表示できませんでした。
        </div>
      </div>
    )
  }

  return (
    <div
      id='notion-article'
      className={`mx-auto overflow-hidden ${className || ''}`}>
      <NotionRenderer
        recordMap={post.blockMap}
        mapPageUrl={mapPageUrl}
        mapImageUrl={mapImgUrl}
        components={{
          Code,
          Text: RubyText,
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
 * ページ内のデータベースリンクを無効化する
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
 * ギャラリー画像のクリック時を拡大表示にする
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
 * URLのハッシュ位置まで自動スクロールする
 */
const autoScrollToHash = () => {
  if (!isBrowser) {
    return
  }

  setTimeout(() => {
    const hash = window?.location?.hash
    const needToJumpToTitle = hash && hash.length > 0
    if (needToJumpToTitle) {
      const tocNode = document.getElementById(hash.substring(1))
      if (tocNode && tocNode?.className?.indexOf('notion') > -1) {
        tocNode.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    }
  }, 180)
}

/**
 * ページIDを記事URLへ変換する
 * @param {*} id
 * @returns
 */
const mapPageUrl = id => {
  return '/' + id
}

const Tweet = dynamic(
  () =>
    import('react-tweet').then(m => {
      return m.Tweet
    }),
  { ssr: false }
)

const Code = dynamic(() => import('@/components/PrismMac'))

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    m => m.Collection
  )
)

const Equation = dynamic(() => import('@/components/KatexReact'), {
  ssr: false
})

const Modal = dynamic(
  () =>
    import('react-notion-x/build/third-party/modal').then(m => {
      return m.Modal
    }),
  { ssr: false }
)

const Pdf = dynamic(() => import('@/components/Pdf'), {
  ssr: false
})

const PrismMac = dynamic(() => import('@/components/PrismMac'))
const AdEmbed = dynamic(() => import('@/components/GoogleAdsense').then(m => m.AdEmbed), {
  ssr: false
})

function getMediumZoomMargin() {
  if (!isBrowser) {
    return 0
  }

  if (window.innerWidth < 640) {
    return 8
  }

  if (window.innerWidth < 1024) {
    return 24
  }

  return 40
}

export default NotionPage