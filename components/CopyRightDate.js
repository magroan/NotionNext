// components/CopyRightDate.js
import { siteConfig } from '@/lib/config'

/**
 * サイトのコピーライト表記
 * 例: c 2017-2025 @_asami
 */
export default function CopyRightDate() {
  const d = new Date()
  const currentYear = d.getFullYear()

  // blog.config.js から取得される想定
  const since = siteConfig('SINCE')
  const author = siteConfig('AUTHOR') || '@_asami'
  const authorLink = siteConfig('LINK') || 'https://takusuki.com/@_asami'

  // 開始年が設定されていて現在年より小さい場合はレンジ表示
  const displayYear =
    since && parseInt(since) < currentYear
      ? `${since}-${currentYear}`
      : currentYear

  return (
    <span className='whitespace-nowrap flex items-center gap-x-1 text-sm'>
      <i className='fas fa-copyright' />
      <span>{displayYear}</span>
      <a
        href={authorLink}
        target='_blank'
        rel='noreferrer'
        className='ml-1 hover:underline'
      >
        {author}
      </a>
    </span>
  )
}


/**
import { siteConfig } from '@/lib/config'

export default function CopyRightDate() {
  const d = new Date()
  const currentYear = d.getFullYear()
  const since = siteConfig('SINCE')
  const copyrightDate =
    parseInt(since) < currentYear ? since + '-' + currentYear : currentYear

  return (
    <span className='whitespace-nowrap flex items-center gap-x-1'>
      <i className='fas fa-copyright' />
      <span>{copyrightDate}</span>
      <a
        href={BLOG.LINK || 'https://takusuki.com/@_asami'}
        target='_blank'
        rel='noreferrer'
      >
        {_asami}
      </a>
    </span>
  )
}
*/