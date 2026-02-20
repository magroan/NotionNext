import NotionIcon from '@/components/NotionIcon'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import CONFIG from '../config'

const normalizeCover = v => {
  if (!v) return null
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return normalizeCover(v[0])
  if (typeof v === 'object') return v.url || v.src || v.preview || null
  return null
}

/**
 * 标题栏
 */
export default function TitleBar(props) {
  const { post } = props
  const { fullWidth, siteInfo } = useGlobal()

  const title = post?.title || siteConfig('TITLE')
  // post.description が空のことが多いので、まず DESCRIPTION を優先し、最後に AUTHOR にフォールバック
  const description =
    post?.description || siteConfig('DESCRIPTION') || siteConfig('AUTHOR')

  const headerImage =
    normalizeCover(post?.pageCoverThumbnail) ||
    normalizeCover(post?.pageCover) ||
    normalizeCover(siteInfo?.pageCover)

  // 正：EXAMPLE_TITLE_BG（旧：EXAMPLE_TITLE_IMAGE を後方互換で拾う）
  const TITLE_BG = siteConfig(
    'EXAMPLE_TITLE_BG',
    siteConfig('EXAMPLE_TITLE_IMAGE', false, CONFIG),
    CONFIG
  )

  return (
    <>
      {/* 标题栏 */}
      {!fullWidth && (
        <div className='relative overflow-hidden text-center px-6 py-12 mb-6 bg-gray-100 dark:bg-hexo-black-gray dark:border-hexo-black-gray border-b'>
          <h1 className='title-1 relative text-xl md:text-4xl pb-4 z-10'>
            {siteConfig('POST_TITLE_ICON') && post?.pageIcon && (
              <NotionIcon icon={post?.pageIcon} />
            )}
            {title}
          </h1>

          {description && (
            <p className='title-2 relative leading-loose text-gray-dark z-10'>
              {description}
            </p>
          )}

          {TITLE_BG && headerImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headerImage}
                alt=''
                className='absolute object-cover top-0 left-0 w-full h-full select-none opacity-70 z-0'
              />
            </>
          )}
        </div>
      )}
    </>
  )
}
