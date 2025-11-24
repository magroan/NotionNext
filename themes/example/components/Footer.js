// themes/example/components/Footer.js
import DarkModeButton from '@/components/DarkModeButton'
import CopyRightDate from '@/components/CopyRightDate'
import PoweredBy from '@/components/PoweredBy'
import BeiAnSite from '@/components/BeiAnSite'
import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import { siteConfig } from '@/lib/config'

/**
 * example テーマのフッター
 * - c 年号部分: CopyRightDate
 * - Powered by NotionNext: PoweredBy
 * - RSS リンク: ENABLE_RSS が true のときのみ表示
 */
export const Footer = () => {
  const enableRSS = siteConfig('ENABLE_RSS')

  return (
    <footer className='z-10 relative w-full bg-white px-6 space-y-1 border-t dark:border-hexo-black-gray dark:bg-hexo-black-gray'>
      {/* テーマ切り替えボタン */}
      <DarkModeButton className='text-center pt-4' />

      <div className='container mx-auto max-w-4xl py-6 md:flex items-center justify-between text-gray-600 dark:text-gray-300'>
        {/* 左側: コピーライト */}
        <div className='md:flex-shrink-0 text-center md:text-left text-sm'>
          <CopyRightDate />
        </div>

        {/* 右側: RSS / 備案 / PoweredBy */}
        <div className='md:p-0 text-center md:text-right text-xs mt-4 md:mt-0'>
          <div className='flex flex-wrap justify-center md:justify-end items-center gap-x-2 mb-1'>
            {/* ★ RSS ボタン ★ */}
            {enableRSS && (
              <a
                href='/rss/feed.xml'
                target='_blank'
                rel='noreferrer'
                title='RSS'
                className='inline-flex items-center hover:underline'
              >
                <i className='fas fa-rss mr-1' />
                <span>RSS</span>
              </a>
            )}

            {/* 備案情報 */}
            <BeiAnSite />
            <BeiAnGongAn />
          </div>

          {/* Powered by NotionNext x.x.x */}
          <PoweredBy />
        </div>
      </div>
    </footer>
  )
}

export default Footer
