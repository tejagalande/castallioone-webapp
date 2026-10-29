/**
 * Types representing pagination items in the sliding window.
 */
export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end'

/**
 * Calculates a windowed list of page numbers and ellipsis markers.
 * Prevents UI overflowing when total pages is large.
 *
 * @param currentPage Current active page (1-indexed)
 * @param totalPages Total number of pages
 * @param siblingCount Number of sibling pages to show around current page (default: 1)
 */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const shouldShowLeftDots = leftSiblingIndex > 2
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1

  // Case 1: Beginning range (e.g. [1, 2, 3, 4, 5, '...', 38])
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
    return [...leftRange, 'ellipsis-end', totalPages]
  }

  // Case 2: Ending range (e.g. [1, '...', 34, 35, 36, 37, 38])
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    )
    return [1, 'ellipsis-start', ...rightRange]
  }

  // Case 3: Middle range (e.g. [1, '...', 14, 15, 16, '...', 38])
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange: number[] = []
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      middleRange.push(i)
    }
    return [1, 'ellipsis-start', ...middleRange, 'ellipsis-end', totalPages]
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1)
}

