import { useState, useEffect, useRef } from 'react'

// Distance from bottom of page (px) that counts as "at bottom"
const BOTTOM_THRESHOLD = 40

/**
 * Returns true when the window is scrolled to (or very near) the bottom.
 * Debounced with requestAnimationFrame to avoid excessive re-renders.
 */
export default function useScrollBottom() {
  const [isAtBottom, setIsAtBottom] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const check = () => {
      const { scrollY, innerHeight } = window
      const { scrollHeight } = document.documentElement
      // Only hide if the page is actually scrollable; if content fits in the
      // viewport there's nothing to scroll and the widget isn't blocking anything.
      const isScrollable = scrollHeight > innerHeight + BOTTOM_THRESHOLD
      setIsAtBottom(isScrollable && scrollY + innerHeight >= scrollHeight - BOTTOM_THRESHOLD)
    }

    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        check()
      })
    }

    // Check once on mount
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return isAtBottom
}
