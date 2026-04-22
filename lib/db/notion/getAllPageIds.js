import BLOG from '@/blog.config'

export default function getAllPageIds(
  collectionQuery,
  collectionId,
  collectionView,
  viewIds
) {
  if (!collectionQuery && !collectionView) {
    return []
  }

  let pageIds = []

  try {
    const groupIndex = BLOG.NOTION_INDEX || 0
    const collectionViews = collectionQuery?.[collectionId] || {}

    if (Array.isArray(viewIds) && viewIds.length > 0) {
      const selectedViewId = viewIds[groupIndex] || viewIds[0]
      const selectedView = collectionViews?.[selectedViewId]

      const preferredIds =
        selectedView?.collection_group_results?.blockIds ||
        selectedView?.blockIds ||
        []

      if (Array.isArray(preferredIds) && preferredIds.length > 0) {
        return preferredIds.filter(id => typeof id === 'string' && id.length > 0)
      }
    }
  } catch (error) {
    console.error('Error fetching page IDs:', {
      collectionId,
      viewIds,
      hasCollectionQuery: Boolean(collectionQuery),
      hasCollectionView: Boolean(collectionView)
    }, error)
  }

  if (collectionQuery?.[collectionId]) {
    const pageSet = new Set()
    Object.values(collectionQuery[collectionId]).forEach(view => {
      view?.blockIds?.forEach(id => {
        if (typeof id === 'string' && id.length > 0) pageSet.add(id)
      })
      view?.collection_group_results?.blockIds?.forEach(id => {
        if (typeof id === 'string' && id.length > 0) pageSet.add(id)
      })
    })
    pageIds = [...pageSet]
  }

  return pageIds
}
