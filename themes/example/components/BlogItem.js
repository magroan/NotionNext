import formatDate from '@/lib/formatDate'
import Link from 'next/link'
import { useRouter } from 'next/router'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

const normalizeCover = v => {
  if (!v) return null
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return normalizeCover(v[0])
  if (typeof v === 'object') return v.url || v.src || null
  return null
}

export default function BlogItem({ post }) {
  const router = useRouter()
  const currentLang = router.locale

  const showPageCover = siteConfig('EXAMPLE_POST_LIST_COVER', null, CONFIG)

  // pageCoverThumbnail が無い場合も拾う（環境差/DBプロパティ差の吸収）
  const cover =
    normalizeCover(post?.pageCoverThumbnail) ||
    normalizeCover(post?.pageCover) ||
    normalizeCover(post?.cover) ||
    normalizeCover(post?.thumbnail)

  return (
    <div className='w-full p-3 bg-white border border-gray-100 dark:border-gray-700 dark:bg-neutral-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-300'>
      <div className='flex flex-col md:flex-row'>
        {showPageCover && cover && (
          <div className='w-full md:w-2/5 hidden md:block'>
            <Link href={post?.href || `/${currentLang}/${post?.slug}`}>
              <div className='overflow-hidden rounded-xl'>
                <LazyImage
                  src={cover}
                  alt={post?.title}
                  className='w-full h-48 object-cover hover:scale-105 transition-transform duration-300'
                />
              </div>
            </Link>
          </div>
        )}

        <div className='flex-1 md:pl-4 flex flex-col justify-between'>
          <div>
            <Link href={post?.href || `/${currentLang}/${post?.slug}`}>
              <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                {post?.title}
              </h2>
            </Link>
            <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              {formatDate(post?.publishDay)} ・ {post?.category}
            </div>
            <p className='text-gray-600 dark:text-gray-300 mt-3 line-clamp-2'>
              {post?.summary}
            </p>
          </div>

          <div className='mt-4'>
            <Link
              href={post?.href || `/${currentLang}/${post?.slug}`}
              className='inline-block px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-neutral-800 transition-all'>
              Continue Reading →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
