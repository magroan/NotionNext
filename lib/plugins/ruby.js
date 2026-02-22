// lib/plugins/ruby.js
import { isBrowser } from '@/lib/utils'

// {本文|ルビ} / {本文｜ルビ} / ｛本文｜ルビ｝ を検出
const RUBY_PATTERN = /[{｛]([^{}｛｝|｜]+)[|｜]([^{}｛｝]+)[}｝]/g

function getContainer() {
  return (
    document.getElementById('notion-article') ||
    document.querySelector('#notion-article') ||
    document.querySelector('.notion-page') ||
    document.querySelector('article')
  )
}

/**
 * root 配下の textContent オフセット(start,end)を DOM Range に変換
 * end は「排他的」（Pythonのスライスと同じ）
 */
function rangeFromTextOffsets(root, start, end) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  let pos = 0

  let startNode = null
  let startOffset = 0
  let endNode = null
  let endOffset = 0

  while (node) {
    const text = node.nodeValue || ''
    const nextPos = pos + text.length

    if (!startNode && start < nextPos) {
      startNode = node
      startOffset = start - pos
    }
    if (!endNode && end <= nextPos) {
      endNode = node
      endOffset = end - pos
      break
    }

    pos = nextPos
    node = walker.nextNode()
  }

  if (!startNode || !endNode) return null

  const range = document.createRange()
  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)
  return range
}

/**
 * #notion-article 配下のテキストから {本文|ルビ} を探して
 * <ruby class="notion-ruby">本文<rt>ルビ</rt></ruby> に置換する
 *
 * ※ NotionRenderer が DOM を吐いた「後」に走らせる
 */
export function applyRubyForNotionPage() {
  if (!isBrowser) return

  const container = getContainer()
  if (!container) return

  const targets = container.querySelectorAll(
    'p, span, div, li, h1, h2, h3, h4, h5, h6, figcaption, th, td'
  )

  targets.forEach(el => {
    // コードや数式、既にruby化済みは触らない
    if (el.closest('.notion-code, .notion-equation')) return
    if (el.closest('ruby')) return
    if (el.dataset?.rubyProcessed === 'true') return

    const text = el.textContent || ''
    if (!text) return
    if (!/[{｛]/.test(text) || !/[|｜]/.test(text) || !/[}｝]/.test(text)) return

    // マッチ収集（後ろから処理する）
    RUBY_PATTERN.lastIndex = 0
    const matches = []
    let m
    while ((m = RUBY_PATTERN.exec(text)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        base: String(m[1] || '').trim(),
        rt: String(m[2] || '').trim()
      })
    }
    if (!matches.length) return

    // 後ろから置換（前方のindexがズレない）
    for (let i = matches.length - 1; i >= 0; i--) {
      const { start, end, base, rt } = matches[i]
      const range = rangeFromTextOffsets(el, start, end)
      if (!range) continue

      const ruby = document.createElement('ruby')
      ruby.className = 'notion-ruby'
      ruby.append(document.createTextNode(base))

      const rtEl = document.createElement('rt')
      rtEl.textContent = rt
      ruby.append(rtEl)

      range.deleteContents()
      range.insertNode(ruby)
    }

    if (el.dataset) el.dataset.rubyProcessed = 'true'
  })
}
