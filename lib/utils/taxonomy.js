export function normalizeTaxonomyValue(value) {
  if (typeof value !== 'string') return ''

  let normalized = value.trim()

  try {
    normalized = decodeURIComponent(normalized)
  } catch (error) {
    // Keep original value when it is already decoded.
  }

  if (typeof normalized.normalize === 'function') {
    normalized = normalized.normalize('NFC')
  }

  return normalized
}

export function encodeTaxonomySegment(value) {
  const normalized = normalizeTaxonomyValue(value)
  return encodeURIComponent(normalized)
}

export function normalizeTaxonomyHref(href) {
  if (typeof href === 'string') {
    return normalizeTaxonomyHrefString(href)
  }

  if (href && typeof href === 'object' && typeof href.pathname === 'string') {
    return {
      ...href,
      pathname: normalizeTaxonomyHrefString(href.pathname)
    }
  }

  return href
}

export function taxonomyFieldMatches(fieldValue, routeValue) {
  const normalizedRouteValue = normalizeTaxonomyValue(routeValue)

  if (!normalizedRouteValue) {
    return false
  }

  if (Array.isArray(fieldValue)) {
    return fieldValue.some(item => {
      return normalizeTaxonomyValue(item) === normalizedRouteValue
    })
  }

  return normalizeTaxonomyValue(fieldValue) === normalizedRouteValue
}

function normalizeTaxonomyHrefString(href) {
  if (typeof href !== 'string') {
    return href
  }

  const match = href.match(/^(\/(?:tag|category)\/)([^/?#]+)(.*)?$/)

  if (!match) {
    return href
  }

  const [, prefix, rawSegment, suffix = ''] = match
  return `${prefix}${encodeTaxonomySegment(rawSegment)}${suffix}`
}
