import { useState, useEffect } from 'react'

/**
 * Tracks how many pixels the visual viewport's bottom sits above the layout
 * viewport's bottom. On mobile, this value grows when the on-screen keyboard
 * opens (the keyboard pushes the visual viewport upward).
 *
 * Use this to push a position:fixed element above the keyboard:
 *   style={{ bottom: `${offsetBottom + 8}px` }}
 */
export default function useVisualViewport() {
  const [offsetBottom, setOffsetBottom] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport)
      return

    const update = () => {
      const vv = window.visualViewport!
      // Distance from the bottom of the visual viewport to the bottom of the
      // layout viewport. Positive when the keyboard is visible.
      const fromBottom = window.innerHeight - (vv.offsetTop + vv.height)
      setOffsetBottom(Math.max(0, fromBottom))
    }

    window.visualViewport.addEventListener('resize', update)
    window.visualViewport.addEventListener('scroll', update)
    // Initial read
    update()

    return () => {
      window.visualViewport!.removeEventListener('resize', update)
      window.visualViewport!.removeEventListener('scroll', update)
    }
  }, [])

  return { offsetBottom }
}
