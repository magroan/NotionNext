// components/Footer.js
import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import CopyRightDate from '@/components/CopyRightDate'
import PoweredBy from '@/components/PoweredBy'
import { siteConfig } from '@/lib/config'
import SocialButton from './SocialButton'

/**
 * フッター
 */
const Footer = () => {
  const BEI_AN = siteConfig('BEI_AN')
  const BEI_AN_LINK = siteConfig('BEI_AN_LINK')
  const BIO = siteConfig('BIO')
  const ENABLE_RSS = siteConfig('ENABLE_RSS') // ← 追加

  return (
    <footer className='relative flex-shrink-0 bg-white dark:bg-[#1a191d] justify-center items-center mt-6 text-gray-600 dark:text-gray-100 text-sm'>
      {/* 上部の色グラデーション（元のまま） */}
      <div className='pointer-events-none absolute inset-x-0 -top-0.5 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-inherit dark:to-inherit' />

      <div className='w-full max-w-5xl mx-auto py-8 px-4'>
        {/* 社交ボタン（元からある SocialButton） */}
        <div className='w-full h-24 flex justify-center'>
          <SocialButton />
        </div>

        <br />

        {/* 下部情報ブロック */}
        <div
          id='footer-bottom'
          className='flex flex-col lg:flex-row items-center justify-between border-t mt-4 pt-4 border-gray-200 dark:border-t-[#3D3D3F]'
        >
          {/* 左側：PoweredBy / 年号 / 著者情報 / RSS */}
          <div
            id='footer-bottom-left'
            className='text-center lg:text-start'
          >
            <PoweredBy />
            <div className='mt-1 flex flex-wrap items-center justify-center lg:justify-start gap-x-1'>
              <CopyRightDate />
              <a
                href={'/about'}
                className='underline font-semibold dark:text-gray-300'
              >
                {siteConfig('AUTHOR')}
              </a>
              {BIO && <span className='mx-1'>| {BIO}</span>}

              {/* ★ ここが追加した RSS ボタン部分 ★ */}
              {ENABLE_RSS && (
                <a
                  href='/rss/feed.xml'
                  target='_blank'
                  rel='noreferrer'
                  title='RSS'
                  className='ml-3 inline-flex items-center hover:underline'
                >
                  <i className='fas fa-rss mr-1' />
                  <span>RSS</span>
                </a>
              )}
            </div>
          </div>

          {/* 右側：備案情報・アクセスカウンタ（元のまま） */}
          <div
            id='footer-bottom-right'
            className='mt-4 lg:mt-0 text-center lg:text-right'
          >
            {BEI_AN && (
              <>
                <i className='fas fa-shield-alt' />{' '}
                <a href={BEI_AN_LINK} className='mr-2'>
                  {BEI_AN}
                </a>
              </>
            )}
            <BeiAnGongAn />

            <span className='hidden busuanzi_container_site_pv'>
              <i className='fas fa-eye' />
              <span className='px-1 busuanzi_value_site_pv'> </span>{' '}
            </span>
            <span className='pl-2 hidden busuanzi_container_site_uv'>
              <i className='fas fa-users' />{' '}
              <span className='px-1 busuanzi_value_site_uv'> </span>{' '}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
