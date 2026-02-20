import BLOG from '@/blog.config'
import { fetchSite } from '@/lib/site/site.service'
import type { BasePage, PageTag } from '@/lib/site/site.types'

type SitemapPost = {
  id?: string
  slug?: string
  status?: string
  type?: string
  publishDay?: string
  lastEditedDay?: string
}

// BLOG.NOTION_PAGE_ID が "xxx,ja-JP:yyy,en-US:zzz" のような形式でも拾う
function extractNotionPageIds(): string[] {
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

// 安全に YYYY-MM-DD を作る（不正なら undefined）
function toYMD(input: unknown): string | undefined {
  if (input == null) return undefined

  // number(ms) / Date / string を許容
  const d =
    typeof input === 'number'
      ? new Date(input)
      : input instanceof Date
        ? input
        : typeof input === 'string'
          ? new Date(input)
          : null

  if (!d || Number.isNaN(d.getTime())) return undefined
  return d.toISOString().split('T')[0]
}

// site.service の BasePage から sitemap が期待する形へ寄せる
function normalizeForSitemap(p: BasePage): SitemapPost {
  const publishDay =
    // もし既に day 文字列が載っている実装なら優先
    toYMD((p as any).publishDay) ||
    toYMD((p as any).publishDate) ||
    toYMD((p as any).date?.start_date)

  const lastEditedDay =
    toYMD((p as any).lastEditedDay) ||
    toYMD((p as any).lastEditedDate) ||
    toYMD((p as any).date?.lastEditedDay)

  return {
    id: p.id,
    slug: p.slug,
    status: p.status,
    type: p.type,
    publishDay,
    lastEditedDay
  }
}

// pages/sitemap.xml.js が呼ぶ想定の関数
export async function getAllPosts(opts?: { includePages?: boolean }): Promise<SitemapPost[]> {
  const includePages = Boolean(opts?.includePages)

  const pageIds = extractNotionPageIds()
  // 何も取れない場合でも落とさない
  if (pageIds.length === 0) return []

  const sites = await Promise.all(
    pageIds.map(pageId => fetchSite({ pageId, from: 'sitemap:getAllPosts' } as any))
  )

  // allPages を結合（重複は id で除去）
  const merged = sites.flatMap(s => (s as any)?.allPages || []) as BasePage[]
  const dedup = new Map<string, BasePage>()
  for (const p of merged) {
    const key = String(p?.id || `${p?.type || ''}:${p?.slug || ''}`)
    if (!dedup.has(key)) dedup.set(key, p)
  }

  let pages = Array.from(dedup.values())

  // includePages=false なら "Page" っぽいものを除外（命名揺れを吸収）
  if (!includePages) {
    pages = pages.filter(p => {
      const t = String(p?.type || '').toLowerCase()
      return t !== 'page'
    })
  }

  return pages
    .filter(p => p?.slug) // sitemap 生成的に最低限
    .map(normalizeForSitemap)
}

export async function getAllCategories(opts?: { includePostCount?: boolean }): Promise<string[] | PageTag[]> {
  const includePostCount = opts?.includePostCount !== false

  const pageIds = extractNotionPageIds()
  if (pageIds.length === 0) return includePostCount ? [] : []

  const sites = await Promise.all(
    pageIds.map(pageId => fetchSite({ pageId, from: 'sitemap:getAllCategories' } as any))
  )

  const merged = sites.flatMap(s => (s as any)?.categoryOptions || []) as PageTag[]

  // name で集約（count は足し合わせ）
  const acc = new Map<string, number>()
  for (const c of merged) {
    const name = String((c as any)?.name || '').trim()
    if (!name) continue
    const count = Number((c as any)?.count || 0)
    acc.set(name, (acc.get(name) || 0) + (Number.isFinite(count) ? count : 0))
  }

  if (!includePostCount) {
    return Array.from(acc.keys())
  }

  return Array.from(acc.entries()).map(([name, count]) => ({ name, count }))
}
