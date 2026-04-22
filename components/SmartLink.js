import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { normalizeTaxonomyHref } from '@/lib/utils/taxonomy'

// 过滤 <a> 标签不能识别的 props
const filterDOMProps = props => {
  const { passHref, legacyBehavior, ...rest } = props
  return rest
}

const SmartLink = ({ href, children, ...rest }) => {
  const LINK = siteConfig('LINK')
  const normalizedHref = normalizeTaxonomyHref(href)

  // 获取 URL 字符串用于判断是否是外链
  let urlString = ''

  if (typeof normalizedHref === 'string') {
    urlString = normalizedHref
  } else if (
    typeof normalizedHref === 'object' &&
    normalizedHref !== null &&
    typeof normalizedHref.pathname === 'string'
  ) {
    urlString = normalizedHref.pathname
  }

  const isExternal = urlString.startsWith('http') && !urlString.startsWith(LINK)

  if (isExternal) {
    // 对于外部链接，必须是 string 类型
    const externalUrl =
      typeof normalizedHref === 'string'
        ? normalizedHref
        : new URL(normalizedHref.pathname, LINK).toString()

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
    <Link href={normalizedHref} {...rest}>
      {children}
    </Link>
  )
}

export default SmartLink
