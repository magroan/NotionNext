import React from 'react'

import { parsePageId } from 'notion-utils'
import { formatDate, getHashFragmentValue, useNotionContext } from 'react-notion-x'

/**
 * {語句|よみ} 形式の簡易ルビ記法を <ruby> に変換して表示する Text renderer.
 *
 * - 例: "{情報I|一般ウケ}" => <ruby><rb>情報I</rb><rt>一般ウケ</rt></ruby>
 * - インラインコード('c') / 数式('e') では変換しない
 */

// NOTE: base に "|" を含めない想定。ruby 側は "}" までを許容。
const RUBY_RE = /[{｛]\s*([^|｜{}｛｝]+?)\s*[|｜]\s*([^{}｛｝]+?)\s*[}｝]/g

const renderRuby = text => {
  if (!text || typeof text !== 'string') return text
  if (!/[{｛]/.test(text) || !/[|｜]/.test(text) || !/[}｝]/.test(text)) return text

  // IMPORTANT: global regex keeps state; reset per call
  RUBY_RE.lastIndex = 0

  const out = []
  let last = 0
  let m
  while ((m = RUBY_RE.exec(text)) !== null) {
    const idx = m.index
    if (idx > last) out.push(text.slice(last, idx))

    const base = m[1]
    const rt = m[2]
    out.push(
      <ruby className='notion-ruby' key={`ruby-${idx}`}>{base}<rt>{rt}</rt></ruby>
    )

    last = idx + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out.length ? out : text
}

export const RubyText = ({ value, block, linkProps, linkProtocol }) => {
  const { components, recordMap, mapPageUrl, mapImageUrl, rootDomain } =
    useNotionContext()

  if (!value) return null

  const Link = components?.Link
  const PageLink = components?.PageLink
  const Equation = components?.Equation

  return (
    <>
      {value?.map((item, index) => {
        const text = typeof item === 'string' ? item : item?.[0]
        const decorations = typeof item === 'string' ? null : item?.[1]

        // no decorations: plain text
        if (!decorations) {
          // keep original behavior around commas (react-notion-x does this for wrapping)
          if (text === ',') {
            return (
              <span className='notion-text' key={`t-${index}`}>
                ,
              </span>
            )
          }
          return (
            <React.Fragment key={`t-${index}`}>{renderRuby(text)}</React.Fragment>
          )
        }

        // Skip ruby transform if inline code or equation decorations are present.
        const hasNoRubyDecorator =
          Array.isArray(decorations) &&
          decorations.some(d => d && (d[0] === 'c' || d[0] === 'e'))

        const baseElement = (
          <>{hasNoRubyDecorator ? text : renderRuby(text)}</>
        )

        const formatted = decorations.reduce((element, decorator) => {
          if (!decorator) return element
          switch (decorator[0]) {
            case 'p': {
              // internal page / block link
              const blockId = decorator[1]
              const href = mapPageUrl(blockId)
              if (PageLink) {
                return (
                  <PageLink
                    key={`p-${blockId}-${index}`}
                    href={href}
                    className='notion-link'
                    {...(linkProps || {})}>
                    {element}
                  </PageLink>
                )
              }
              return element
            }

            case 'h':
              return (
                <span key={`h-${index}`} className='notion-highlight'>
                  {element}
                </span>
              )

            case 'c':
              return (
                <code key={`c-${index}`} className='notion-inline-code'>
                  {element}
                </code>
              )

            case 'b':
              return (
                <strong key={`b-${index}`}>
                  {element}
                </strong>
              )
            case 'i':
              return (
                <em key={`i-${index}`}>
                  {element}
                </em>
              )
            case 's':
              return (
                <del key={`s-${index}`}>
                  {element}
                </del>
              )
            case '_':
              return (
                <span key={`u-${index}`} className='notion-underline'>
                  {element}
                </span>
              )

            case 'e': {
              // inline equation
              const math = decorator[1]
              if (Equation) {
                return (
                  <Equation
                    key={`e-${index}`}
                    block={block}
                    math={math}
                    inline={true}
                  />
                )
              }
              return element
            }

            case 'm':
              // comment / discussion
              return element

            case 'a': {
              // external / internal URL
              const v = decorator[1]
              const pathname = v?.slice?.(1)
              const id = pathname ? parsePageId(pathname, { uuid: true }) : null
              const isInternal =
                (rootDomain && v?.includes?.(rootDomain)) || (id && v?.[0] === '/')
              const href =
                isInternal && id
                  ? rootDomain && v.includes(rootDomain)
                    ? v
                    : `${mapPageUrl(id)}${getHashFragmentValue(v)}`
                  : v

              // Optional protocol rewrite
              const finalHref =
                linkProtocol && typeof href === 'string'
                  ? href.replace(/^https?:/i, linkProtocol)
                  : href

              if (Link) {
                return (
                  <Link
                    key={`a-${index}`}
                    href={finalHref}
                    className='notion-link'
                    {...(linkProps || {})}>
                    {element}
                  </Link>
                )
              }
              return element
            }

            case 'd': {
              const v = decorator[1]
              const type = v?.type
              if (type === 'date') {
                return formatDate(v.start_date)
              } else if (type === 'datetime') {
                return `${formatDate(v.start_date)} ${v.start_time}`
              } else if (type === 'daterange') {
                return `${formatDate(v.start_date)} → ${formatDate(v.end_date || v.start_date)}`
              }
              return element
            }

            case 'u': {
              // user mention - best effort (fallback to text)
              const userId = decorator[1]
              const user = recordMap?.notion_user?.[userId]?.value
              const name = user
                ? [user.given_name, user.family_name].filter(Boolean).join(' ')
                : null
              const src = user ? mapImageUrl(user.profile_photo, block) : null
              if (name && src) {
                return (
                  <span key={`um-${userId}-${index}`} className='notion-user'>
                    <img
                      className='notion-user-avatar'
                      src={src}
                      alt={name}
                      loading='lazy'
                    />
                    <span className='notion-user-name'>{name}</span>
                  </span>
                )
              }
              return element
            }

            // Unhandled decorators (lm, eoi, si, etc.) fallback
            default:
              return element
          }
        }, baseElement)

        return <React.Fragment key={`f-${index}`}>{formatted}</React.Fragment>
      })}
    </>
  )
}

export default RubyText
