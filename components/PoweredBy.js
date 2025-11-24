// components/PoweredBy.js
import { siteConfig } from '@/lib/config'

/**
 * 「Powered by NotionNext x.x.x」の表記
 */
export default function PoweredBy(props) {
  return (
    <div className={`inline text-sm font-serif ${props.className || ''}`}>
      <span className='mr-1'>Based on</span>
      <a
        href='https://github.com/tangly1024/NotionNext'
        className='underline justify-start'
        target='_blank'
        rel='noreferrer'
      >
        NotionNext {siteConfig('VERSION')}
      </a>
      <span className='ml-1'>customized by</span>
      <a
        href='https://asami.chiba.jp'
        className='underline ml-1'
        target='_blank'
        rel='noreferrer'
      >
        @_asami
      </a>
      <span>.</span>
    </div>
  )
}
