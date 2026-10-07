import { useLayoutEffect, type RefObject } from 'react'

interface UseAnchoredMenuOptions {
  isOpen: boolean
  anchorRef: RefObject<HTMLElement | null>
  menuRef: RefObject<HTMLElement | null>
  align?: 'left' | 'right'
  gap?: number
  /** Make the menu exactly as wide as the anchor (e.g. for pickers / selects). */
  matchWidth?: boolean
}

const VIEWPORT_MARGIN = 8

/**
 * Positions a portaled (`position: fixed`) menu next to its anchor element.
 *
 * Rendering menus through a portal into `document.body` lets them escape every
 * `overflow: hidden` container and stacking context, so they always appear above
 * the rest of the UI. The position is applied imperatively (no state) before paint,
 * flips above the anchor when there is no room below, and follows scroll/resize.
 */
export const useAnchoredMenu = ({
  isOpen,
  anchorRef,
  menuRef,
  align = 'left',
  gap = 6,
  matchWidth = false,
}: UseAnchoredMenuOptions): void => {
  useLayoutEffect(() => {
    if (!isOpen) return

    const update = () => {
      const anchor = anchorRef.current
      const menu = menuRef.current
      if (!anchor || !menu) return

      const anchorRect = anchor.getBoundingClientRect()
      if (matchWidth) menu.style.width = `${anchorRect.width}px`

      const menuWidth = menu.offsetWidth
      const menuHeight = menu.offsetHeight
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let left = align === 'right' ? anchorRect.right - menuWidth : anchorRect.left
      left = Math.max(VIEWPORT_MARGIN, Math.min(left, viewportWidth - menuWidth - VIEWPORT_MARGIN))

      let top = anchorRect.bottom + gap
      const overflowsBottom = top + menuHeight > viewportHeight - VIEWPORT_MARGIN
      const fitsAbove = anchorRect.top - gap - menuHeight >= VIEWPORT_MARGIN
      if (overflowsBottom && fitsAbove) {
        top = anchorRect.top - gap - menuHeight
      }

      menu.style.left = `${left}px`
      menu.style.top = `${top}px`
      menu.style.visibility = 'visible'
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen, anchorRef, menuRef, align, gap, matchWidth])
}

/** Inline style every portaled menu starts with (hidden until positioned). */
export const FLOATING_MENU_BASE_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 'auto',
  visibility: 'hidden',
  zIndex: 9000,
} as const
