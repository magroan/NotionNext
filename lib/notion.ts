import BLOG from '@/blog.config'
import { fetchSite } from '@/lib/site/site.service'
import type { BasePage } from '@/lib/site/site.types'

type SitemapPost = {
  id?: string
  slug: string
  status?: string
  type?: string
  publishDay?: string
  lastEditedDay?: string
}

/**
 * BLOG.NOTION_PAGE_ID が "xxx,ja-JP:yyy,en-US:zzz" のような形式でも拾う
 */
export function extractNotionPageIds(): string[] {
  const raw = String((BLOG as any).NOTION_PAGE_ID || '').trim()
  if (!raw) return []
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const idx = s.indexOf(':')
      return idx >= 0 ? s.slice(idx + 1).trim() : s
    })
    .filter(Boolean)
}

/**
 * 安全に YYYY-MM-DD を作る（不正なら undefined）
 * - number は ms/秒の両方を許容（秒っぽければ ms に補正）
 */
function toYMD(input: unknown): string | undefined {
  if (input == null) return undefined

  let d: Date | null = null

  if (typeof input === 'number') {
    const ms = input < 1e12 ? input * 1000 : input
    d = new Date(ms)
  } else if (input instanceof Date) {
    d = input
  } else if (typeof input === 'string') {
    d = new Date(input)
  }

  if (!d || Number.isNaN(d.getTime())) return undefined
  return d.toISOString().split('T')[0]
}

function hasVal<T>(v: T | null | undefined): v is T {
  return v !== undefined && v !== null
}

/**
 * site.service の BasePage から sitemap が期待する形へ寄せる
 * - exactOptionalPropertyTypes 対応：
 *   undefined の値は「プロパティを付けない」
 */
function normalizeForSitemap(p: BasePage): SitemapPost {
  const publishDay =
    // もし既に day 文字列が載っている実装なら優先
    toYMD((p as any).publishDay) ||
    // 新系: publishDate / lastEditedDate（数値）を優先
    toYMD((p as any).publishDate) ||
    toYMD((p as any).date?.start_date)

  const lastEditedDay =
    toYMD((p as any).lastEditedDay) ||
    toYMD((p as any).lastEditedDate) ||
    toYMD((p as any).date?.lastEditedDay)

  const out: SitemapPost = {
    // slug は sitemap 的に必須。呼び出し側で slug ありのみを渡す想定
    slug: String((p as any)?.slug || '')
  }

  // optional は undefined を入れない
  const id = (p as any)?.id
  if (hasVal(id) && String(id).trim()) out.id = String(id)

  const status = (p as any)?.status
  if (hasVal(status) && String(status).trim()) out.status = String(status)

  const type = (p as any)?.type
  if (hasVal(type) && String(type).trim()) out.type = String(type)

  if (hasVal(publishDay)) out.publishDay = publishDay
  if (hasVal(lastEditedDay)) out.lastEditedDay = lastEditedDay

  return out
}

/**
 * pages/sitemap.xml.js が呼ぶ想定の関数
 */
export async function getAllPosts(
  opts?: { includePages?: boolean }
): Promise<SitemapPost[]> {
  const includePages = Boolean(opts?.includePages)
  const pageIds = extractNotionPageIds()
  if (pageIds.length === 0) return []

  const sites = await Promise.all(
    pageIds.map(pageId =>
      fetchSite({ pageId, from: 'sitemap:getAllPosts' } as any)
    )
  )

  // allPages を結合（重複は id で除去）
  const merged = sites.flatMap(s => (s as any)?.allPages || []) as BasePage[]
  const dedup = new Map<string, BasePage>()

  for (const p of merged) {
    const key = String(
      (p as any)?.id || `${(p as any)?.type || ''}:${(p as any)?.slug || ''}`
    )
    if (!dedup.has(key)) dedup.set(key, p)
  }

  let pages = Array.from(dedup.values())

  // includePages=false なら "Page" っぽいものを除外（命名揺れを吸収）
  if (!includePages) {
    pages = pages.filter(
      p => String((p as any)?.type || '').toLowerCase() !== 'page'
    )
  }

  return pages
    .filter(p => Boolean((p as any)?.slug))
    .map(normalizeForSitemap)
}

type CategoryOption = { name?: string; count?: number }

export async function getAllCategories(
  opts?: { includePostCount?: boolean }
): Promise<Array<{ name: string; count: number }> | string[]> {
  const includePostCount = opts?.includePostCount !== false
  const pageIds = extractNotionPageIds()
  if (pageIds.length === 0) return []

  const sites = await Promise.all(
    pageIds.map(pageId =>
      fetchSite({ pageId, from: 'sitemap:getAllCategories' } as any)
    )
  )

  const merged = sites.flatMap(
    s => (s as any)?.categoryOptions || []
  ) as CategoryOption[]

  // name で集約（count は足し合わせ）
  const acc = new Map<string, number>()
  for (const c of merged) {
    const name = String(c?.name || '').trim()
    if (!name) continue
    const count = Number(c?.count || 0)
    acc.set(name, (acc.get(name) || 0) + (Number.isFinite(count) ? count : 0))
  }

  if (!includePostCount) return Array.from(acc.keys())
  return Array.from(acc.entries()).map(([name, count]) => ({ name, count }))
}
