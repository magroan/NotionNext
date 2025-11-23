import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {
  FacebookIcon,
  FacebookShareButton,
  LineIcon,
  LineShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton
} from 'react-share'

const QrCode = dynamic(() => import('@/components/QrCode'), { ssr: false })

/**
 * @author https://github.com/txs
 * @param {*} param0
 * @returns
 */
const ShareButtons = ({ post }) => {
  const router = useRouter()
  const [shareUrl, setShareUrl] = useState(siteConfig('LINK') + router.asPath)
  const title = post?.title || siteConfig('TITLE')
  const tags = post.tags || []
  const hashTags = tags.map(tag => `#${tag}`).join(',')

  const services = siteConfig('POSTS_SHARE_SERVICES').split(',')
  const titleWithSiteInfo = title + ' | ' + siteConfig('TITLE')
  const { locale } = useGlobal()

  const [qrCodeShow, setQrCodeShow] = useState(false)

  const copyUrl = () => {
    const decodedUrl = decodeURIComponent(shareUrl)
    navigator?.clipboard?.writeText(decodedUrl)
    alert(locale.COMMON.URL_COPIED + ' \n' + decodedUrl)
  }

  const openPopover = () => setQrCodeShow(true)
  const closePopover = () => setQrCodeShow(false)

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  return (
    <>
      {services.map(singleService => {
        switch (singleService) {

          /*** Facebook ***/
          case 'facebook':
            return (
              <FacebookShareButton
                key={singleService}
                url={shareUrl}
                hashtag={hashTags}
                className='mx-1'>
                <FacebookIcon size={32} round />
              </FacebookShareButton>
            )

          /*** LINE ***/
          case 'line':
            return (
              <LineShareButton key={singleService} url={shareUrl} className='mx-1'>
                <LineIcon size={32} round />
              </LineShareButton>
            )

          /*** Twitter(X) ***/
          case 'twitter':
            return (
              <TwitterShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                hashtags={tags}
                className='mx-1'>
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            )

          /*** LinkedIn ***/
          case 'linkedin':
            return (
              <LinkedinShareButton key={singleService} url={shareUrl} className='mx-1'>
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
            )

          /*** QRコード（wechat 表示） ***/
          case 'wechat':
            return (
              <button
                onMouseEnter={openPopover}
                onMouseLeave={closePopover}
                aria-label={singleService}
                key={singleService}
                className='cursor-pointer bg-green-600 text-white rounded-full mx-1 relative'>
                <div id='wechat-button'>
                  <i className='fab fa-weixin w-8' />
                </div>
                <div className='absolute'>
                  <div
                    id='pop'
                    className={
                      (qrCodeShow ? 'opacity-100 ' : ' invisible opacity-0') +
                      ' z-40 absolute bottom-10 -left-10 bg-white shadow-xl transition-all duration-200 text-center'
                    }>
                    <div className='p-2 mt-1 w-28 h-28'>
                      {qrCodeShow && <QrCode value={shareUrl} />}
                    </div>
                    <span className='text-black font-semibold p-1 rounded-t-lg text-sm mx-auto mb-1'>
                      {locale.COMMON.SCAN_QR_CODE}
                    </span>
                  </div>
                </div>
              </button>
            )

          /*** URL コピー ***/
          case 'link':
            return (
              <button
                aria-label={singleService}
                key={singleService}
                className='cursor-pointer bg-yellow-500 text-white rounded-full mx-1'>
                <div alt={locale.COMMON.URL_COPIED} onClick={copyUrl}>
                  <i className='fas fa-link w-8' />
                </div>
              </button>
            )

          /*** その他すべて無効化 ***/
          default:
            return <></>
        }
      })}
    </>
  )
}

export default ShareButtons
