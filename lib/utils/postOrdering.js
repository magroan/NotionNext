function normalizeToList(value) {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.flatMap(item => normalizeToList(item))
  }

  if (typeof value === 'string') {
    return [value]
  }

  if (typeof value === 'object') {
    if (typeof value.name === 'string') {
      return [value.name]
    }

    if (typeof value.title === 'string') {
      return [value.title]
    }

    if (typeof value.value === 'string') {
      return [value.value]
    }
  }

  return []
}

function collectPostLabels(post) {
  if (!post) {
    return []
  }

  return [
    ...normalizeToList(post.category),
    ...normalizeToList(post.categories),
    ...normalizeToList(post.tag),
    ...normalizeToList(post.tags)
  ].map(value => String(value).trim()).filter(Boolean)
}

function normalizeDateValue(value) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (typeof value === 'object') {
    if (value.start_date) {
      return value.start_date
    }

    if (value.start) {
      return value.start
    }

    if (value.date) {
      return normalizeDateValue(value.date)
    }
  }

  return null
}

export function isFeaturedPost(post) {
  const featuredNames = ['注目', 'featured', 'Featured', 'FEATURED']
  const labels = collectPostLabels(post)

  return labels.some(label => featuredNames.includes(label))
}

export function getPostTimestamp(post) {
  const candidates = [
    post?.publishDay,
    post?.publishDate,
    post?.date,
    post?.createdTime,
    post?.createdAt,
    post?.lastEditedTime,
    post?.updatedAt
  ]

  for (const candidate of candidates) {
    const normalized = normalizeDateValue(candidate)
    if (!normalized) {
      continue
    }

    const date = new Date(normalized)
    if (!Number.isNaN(date.getTime())) {
      return date.getTime()
    }
  }

  return 0
}

export function sortHomePosts(posts) {
  if (!Array.isArray(posts)) {
    return posts
  }

  return posts
    .map((post, index) => ({ post, index }))
    .sort((a, b) => {
      const aFeatured = isFeaturedPost(a.post)
      const bFeatured = isFeaturedPost(b.post)

      if (aFeatured !== bFeatured) {
        return aFeatured ? -1 : 1
      }

      const dateDiff = getPostTimestamp(b.post) - getPostTimestamp(a.post)
      if (dateDiff !== 0) {
        return dateDiff
      }

      return a.index - b.index
    })
    .map(item => item.post)
}

export function shouldSortHomePosts(router) {
  const rawPath = router?.asPath || '/'
  const path = rawPath.split('?')[0].replace(/\/$/, '') || '/'

  return path === '/' || path === '/ja-JP'
}
