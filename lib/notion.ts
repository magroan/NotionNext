import BLOG from '@/blog.config'
import { fetchSite } from '@/lib/site/site.service'
import type { BasePage } from '@/lib/site/site.types'

type SitemapPost = {
  id?: string
  slug?: string
  status?: any
  type?: any
  publishDay?: string
  lastEditedDay?: string
}

const toYMD = (d: any): string | undefined => {
  if (!d) return undefined
  const dt = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(dt.getTime())) return undefined
  return dt.toISOString().split('T')[0]
}

/**
 * 環境変数（NOTION_PAGE_ID / NOTION_PAGE_ID_2 ...）と BLOG.NOTION_PAGE_ID をまとめて取得
 */
function extractNotionPageIds(): string[] {
  const ids: string[] = []

  if (BLOG.NOTION_PAGE_ID) ids.push(String(BLOG.NOTION_PAGE_ID).trim())

  // NOTION_PAGE_ID, NOTION_PAGE_ID_2, NOTION_PAGE_ID_3...
  for (const [k, v] of Object.entries(process.env || {})) {
    if (!v) continue
    if (k === 'NOTION_PAGE_ID' || /^NOTION_PAGE_ID_\d+$/.test(k)) {
      ids.push(String(v).trim())
    }
  }

  // 重複排除
  return Array.from(new Set(ids.filter(Boolean)))
}

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

  // exactOptionalPropertyTypes=true の場合、
  // optional なプロパティに「undefined を明示代入」すると型エラーになるため、
  // 値があるものだけを詰める。
  const out: SitemapPost = {}

  const set = (k: keyof SitemapPost, v: any) => {
    if (v === undefined || v === null) return
    ;(out as any)[k] = v
  }

  set('id', (p as any).id)
  set('slug', (p as any).slug)
  set('status', (p as any).status)
  set('type', (p as any).type)
  set('publishDay', publishDay)
  set('lastEditedDay', lastEditedDay)

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

  // 何も取れない場合でも落とさない
  if (pageIds.length === 0) return []

  const sites = await Promise.all(
    pageIds.map(pageId => fetchSite({ pageId, from: 'sitemap:getAllPosts' } as any))
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
    pages = pages.filter(p => String((p as any)?.type || '').toLowerCase() !== 'page')
  }

  return pages
    .filter(p => (p as any)?.slug) // sitemap 生成的に最低限
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

  const merged = sites.flatMap(s => (s as any)?.categoryOptions || []) as CategoryOption[]

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
