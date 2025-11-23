import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {
  // EmailIcon,
  // EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  // FacebookMessengerIcon,
  // FacebookMessengerShareButton,
  // HatenaIcon,
  // HatenaShareButton,
  // InstapaperIcon,
  // InstapaperShareButton,
  LineIcon,
  LineShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  // LivejournalIcon,
  // LivejournalShareButton,
  // MailruIcon,
  // MailruShareButton,
  // OKIcon,
  // OKShareButton,
  // PinterestIcon,
  // PinterestShareButton,
  // PocketIcon,
  // PocketShareButton,
  // RedditIcon,
  // RedditShareButton,
  // TelegramIcon,
  // TelegramShareButton,
  // TumblrIcon,
  // TumblrShareButton,
  TwitterIcon,
  TwitterShareButton,
  // ThreadsIcon,
  // ThreadsShareButton,
  // ViberIcon,
  // ViberShareButton,
  // VKIcon,
  // VKShareButton,
  // WeiboIcon,
  // WeiboShareButton,
  // WhatsappIcon,
  // WhatsappShareButton,
  // WorkplaceIcon,
  // WorkplaceShareButton
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
  const image = post?.pageCover
  const tags = post.tags || []
  const hashTags = tags.map(tag => `#${tag}`).join(',')
  const body =
    post?.title + ' | ' + title + ' ' + shareUrl + ' ' + post?.summary

  const services = siteConfig('POSTS_SHARE_SERVICES').split(',')
  const titleWithSiteInfo = title + ' | ' + siteConfig('TITLE')
  const { locale } = useGlobal()
  const [qrCodeShow, setQrCodeShow] = useState(false)

  const copyUrl = () => {
    // ?保 shareUrl 是一个正?的字符串并?行解?
    const decodedUrl = decodeURIComponent(shareUrl)
    navigator?.clipboard?.writeText(decodedUrl)
    alert(locale.COMMON.URL_COPIED + ' \n' + decodedUrl)
  }

  const openPopover = () => {
    setQrCodeShow(true)
  }
  const closePopover = () => {
    setQrCodeShow(false)
  }

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  return (
    <>
      {services.map(singleService => {
        switch (singleService) {
          //Facebook だけ残す
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

          //Messenger 無効化
          // case 'messenger':
          //   return (
          //     <FacebookMessengerShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       appId={siteConfig('FACEBOOK_APP_ID')}
          //       className='mx-1'>
          //       <FacebookMessengerIcon size={32} round />
          //     </FacebookMessengerShareButton>
          //   )

          //LINE 残す
          case 'line':
            return (
              <LineShareButton
                key={singleService}
                url={shareUrl}
                className='mx-1'>
                <LineIcon size={32} round />
              </LineShareButton>
            )

          //Reddit 無効化
          // case 'reddit':
          //   return (
          //     <RedditShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       windowWidth={660}
          //       windowHeight={460}
          //       className='mx-1'>
          //       <RedditIcon size={32} round />
          //     </RedditShareButton>
          //   )

          //Email 無効化
          // case 'email':
          //   return (
          //     <EmailShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       subject={titleWithSiteInfo}
          //       body={body}
          //       className='mx-1'>
          //       <EmailIcon size={32} round />
          //     </EmailShareButton>
          //   )

          //Twitter(X) 残す
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

          //Telegram 無効化
          // case 'telegram':
          //   return (
          //     <TelegramShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       className='mx-1'>
          //       <TelegramIcon size={32} round />
          //     </TelegramShareButton>
          //   )

          //Whatsapp 無効化
          // case 'whatsapp':
          //   return (
          //     <WhatsappShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       separator=':: '
          //       className='mx-1'>
          //       <WhatsappIcon size={32} round />
          //     </WhatsappShareButton>
          //   )

          //LinkedIn 残す
          case 'linkedin':
            return (
              <LinkedinShareButton
                key={singleService}
                url={shareUrl}
                className='mx-1'>
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
            )

          //Pinterest 無効化
          // case 'pinterest':
          //   return (
          //     <PinterestShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       media={image}
          //       className='mx-1'>
          //       <PinterestIcon size={32} round />
          //     </PinterestShareButton>
          //   )

          //VK 無効化
          // case 'vkshare':
          //   return (
          //     <VKShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       image={image}
          //       className='mx-1'>
          //       <VKIcon size={32} round />
          //     </VKShareButton>
          //   )

          //OK 無効化
          // case 'okshare':
          //   return (
          //     <OKShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       image={image}
          //       className='mx-1'>
          //       <OKIcon size={32} round />
          //     </OKShareButton>
          //   )

          //Tumblr 無効化
          // case 'tumblr':
          //   return (
          //     <TumblrShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       tags={tags}
          //       className='mx-1'>
          //       <TumblrIcon size={32} round />
          //     </TumblrShareButton>
          //   )

          //Livejournal 無効化
          // case 'livejournal':
          //   return (
          //     <LivejournalShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       description={shareUrl}
          //       className='mx-1'>
          //       <LivejournalIcon size={32} round />
          //     </LivejournalShareButton>
          //   )

          //Mailru 無効化
          // case 'mailru':
          //   return (
          //     <MailruShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       className='mx-1'>
          //       <MailruIcon size={32} round />
          //     </MailruShareButton>
          //   )

          //Viber 無効化
          // case 'viber':
          //   return (
          //     <ViberShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       className='mx-1'>
          //       <ViberIcon size={32} round />
          //     </ViberShareButton>
          //   )

          //Workplace 無効化
          // case 'workplace':
          //   return (
          //     <WorkplaceShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       quote={titleWithSiteInfo}
          //       hashtag={hashTags}
          //       className='mx-1'>
          //       <WorkplaceIcon size={32} round />
          //     </WorkplaceShareButton>
          //   )

          //Weibo 無効化
          // case 'weibo':
          //   return (
          //     <WeiboShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       image={image}
          //       className='mx-1'>
          //       <WeiboIcon size={32} round />
          //     </WeiboShareButton>
          //   )

          //Pocket 無効化
          // case 'pocket':
          //   return (
          //     <PocketShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       className='mx-1'>
          //       <PocketIcon size={32} round />
          //     </PocketShareButton>
          //   )

          //Instapaper 無効化
          // case 'instapaper':
          //   return (
          //     <InstapaperShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       className='mx-1'>
          //       <InstapaperIcon size={32} round />
          //     </InstapaperShareButton>
          //   )

          //Hatena 無効化
          // case 'hatena':
          //   return (
          //     <HatenaShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       windowWidth={660}
          //       windowHeight={460}
          //       className='mx-1'>
          //       <HatenaIcon size={32} round />
          //     </HatenaShareButton>
          //   )

          //Threads 無効化
          // case 'threads':
          //   return (
          //     <ThreadsShareButton
          //       key={singleService}
          //       url={shareUrl}
          //       title={titleWithSiteInfo}
          //       className='mx-1'>
          //       <ThreadsIcon size={32} round />
          //     </ThreadsShareButton>
          //   )

          //QQ は元から "QQ 共有" アイコンなので、今回は無効化
          // case 'qq':
          //   return (
          //     <button
          //       key={singleService}
          //       className='cursor-pointer bg-blue-600 text-white rounded-full mx-1'>
          //       <a
          //         target='_blank'
          //         rel='noreferrer'
          //         aria-label='Share by QQ'
          //         href={`http://connect.qq.com/widget/shareqq/index.html?url=${shareUrl}&sharesource=qzone&title=${title}&desc=${body}`}>
          //         <i className='fab fa-qq w-8' />
          //       </a>
          //     </button>
          //   )

          //WeChat = QR コード共有として残す
          case 'wechat':
            return (
              <button
                onMouseEnter={openPopover}
                onMouseLeave={closePopover}
                aria-label={singleService}
                key={singleService}
                className='cursor-pointer bg-green-600 text-white rounded-full mx-1'>
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

          //Linkコピー 残す
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

          default:
            return <></>
        }
      })}
    </>
  )
}

export default ShareButtons
