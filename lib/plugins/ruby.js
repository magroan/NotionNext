// lib/plugins/ruby.js
import { isBrowser } from '@/lib/utils'

// {本文|ルビ} を検出する正規表現
// 例: {情報I|一般ウケ}
const RUBY_PATTERN = /\{([^{}|]+)\|([^{}]+)\}/g

/**
 * #notion-article 配下のテキストから {本文|ルビ} を探して
 * <ruby><rb>本文</rb><rt>ルビ</rt></ruby> に置き換える
 */
export function applyRubyForNotionPage() {
  if (!isBrowser) return

  const container = document.getElementById('notion-article')
  if (!container) return

  // ルビ候補がありそうなタグだけ対象にする
  const targets = container.querySelectorAll(
    'p, span, div, li, h1, h2, h3, h4, h5, h6, figcaption, th, td'
  )

  targets.forEach(el => {
    // コードブロックや数式ブロックの中は処理しない
    if (el.closest('.notion-code, .notion-equation')) return

    // 二重処理防止
    if (el.dataset && el.dataset.rubyProcessed === 'true') return

    const originalHtml = el.innerHTML
    if (
      !originalHtml ||
      originalHtml.indexOf('{') === -1 ||
      originalHtml.indexOf('|') === -1
    ) {
      return
    }

    // 正規表現を毎回リセット
    RUBY_PATTERN.lastIndex = 0

    let replaced = false
    const newHtml = originalHtml.replace(
      RUBY_PATTERN,
      (_match, base, ruby) => {
        replaced = true

        const baseEscaped = escapeHtml(String(base).trim())
        const rubyEscaped = escapeHtml(String(ruby).trim())

        return `<ruby><rb>${baseEscaped}</rb><rt>${rubyEscaped}</rt></ruby>`
      }
    )

    if (replaced && newHtml !== originalHtml) {
      el.innerHTML = newHtml
      if (el.dataset) {
        el.dataset.rubyProcessed = 'true'
      }
    }
  })
}

/**
 * 最低限の HTML エスケープ
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
