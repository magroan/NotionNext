import { createRef, useEffect } from 'react'
import { init } from '@waline/client'
import { useRouter } from 'next/router'
import '@waline/client/style'
import { siteConfig } from '@/lib/config'

const path = ''
let waline = null

/**
 * Waline コメント表示
 * @param {*} props
 * @returns
 */
const WalineComponent = props => {
  const containerRef = createRef()
  const router = useRouter()

  const updateWaline = url => {
    if (url !== path && waline) {
      waline.update(props)
    }
  }

  useEffect(() => {
    if (!waline) {
      waline = init({
        ...props,
        el: containerRef.current,
        serverURL: siteConfig('COMMENT_WALINE_SERVER_URL'),
        lang: siteConfig('LANG'),
        reaction: false,
        emoji: [],
        dark: 'html.dark'
      })
    }

    router.events.on('routeChangeComplete', updateWaline)

    const anchor = window.location.hash
    if (anchor) {
      const targetNode = document.getElementsByClassName('wl-cards')[0]

      if (targetNode) {
        const mutationCallback = mutations => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              const anchorElement = document.getElementById(anchor.substring(1))
              if (anchorElement && anchorElement.className === 'wl-item') {
                anchorElement.scrollIntoView({
                  block: 'end',
                  behavior: 'smooth'
                })
                setTimeout(() => {
                  anchorElement.classList.add('animate__animated')
                  anchorElement.classList.add('animate__bounceInRight')
                  observer.disconnect()
                }, 300)
              }
            }
          }
        }

        const observer = new MutationObserver(mutationCallback)
        observer.observe(targetNode, { childList: true })
      }
    }

    return () => {
      if (waline) {
        waline.destroy()
        waline = null
      }
      router.events.off('routeChangeComplete', updateWaline)
    }
  }, [])

  return <div ref={containerRef} />
}

export default WalineComponent