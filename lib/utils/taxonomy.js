export function safeDecodeURIComponent(value) {
  if (typeof value !== 'string') return value
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function normalizeTaxonomyTerm(value) {
  if (typeof value !== 'string') return ''
  return safeDecodeURIComponent(value).trim()
}

export function matchesCategory(post, category) {
  const normalizedCategory = normalizeTaxonomyTerm(category)
  if (!normalizedCategory || typeof post?.category !== 'string') return false
  return normalizeTaxonomyTerm(post.category) === normalizedCategory
}

export function matchesTag(post, tag) {
  const normalizedTag = normalizeTaxonomyTerm(tag)
  if (!normalizedTag || !Array.isArray(post?.tags)) return false
  return post.tags.some(item => normalizeTaxonomyTerm(item) === normalizedTag)
}

export function buildTaxonomyPath(kind, value) {
  const normalizedValue = normalizeTaxonomyTerm(value)
  if (!normalizedValue) return `/${kind}`
  return `/${kind}/${encodeURIComponent(normalizedValue)}`
}
