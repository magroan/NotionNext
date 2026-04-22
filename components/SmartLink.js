import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { buildTaxonomyPath } from '@/lib/utils/taxonomy'

// 过滤 <a> 标签不能识别的 props
const filterDOMProps = props => {
  const { passHref, legacyBehavior, ...rest } = props
  return rest
}

const SmartLink = ({ href, children, ...rest }) => {
  const LINK = siteConfig('LINK')

  const normalizeHref = inputHref => {
    if (typeof inputHref !== 'string') return inputHref

    const categoryMatch = inputHref.match(/^\/category\/(.+)$/)
    if (categoryMatch) {
      return buildTaxonomyPath('category', categoryMatch[1])
    }

    const tagMatch = inputHref.match(/^\/tag\/(.+)$/)
    if (tagMatch) {
      return buildTaxonomyPath('tag', tagMatch[1])
    }

    return inputHref
  }

  href = normalizeHref(href)

  // 获取 URL 字符串用于判断是否是外链
  let urlString = ''

  if (typeof href === 'string') {
    urlString = href
  } else if (
    typeof href === 'object' &&
    href !== null &&
    typeof href.pathname === 'string'
  ) {
    urlString = href.pathname
  }

  const isExternal = urlString.startsWith('http') && !urlString.startsWith(LINK)

  if (isExternal) {
    // 对于外部链接，必须是 string 类型
    const externalUrl =
      typeof href === 'string' ? href : new URL(href.pathname, LINK).toString()

    return (
      <a
        href={externalUrl}
        target='_blank'
        rel='noopener noreferrer'
        {...filterDOMProps(rest)}>
        {children}
      </a>
    )
  }

  // 内部链接（可为对象形式）
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  )
}

export default SmartLink
