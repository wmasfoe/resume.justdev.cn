import { useEffect, useRef } from 'react'

export default function useMobileViewport(isExpanded: boolean) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isExpanded)
      return

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const textarea = inputRef.current
    if (!isMobile || !textarea)
      return

    const handleVisualViewport = () => {
      const viewport = window.visualViewport
      if (!viewport)
        return

      requestAnimationFrame(() => {
        const rect = textarea.getBoundingClientRect()
        if (rect.bottom > viewport.height) {
          textarea.scrollIntoView({
            block: 'center',
            behavior: 'smooth',
          })
        }
      })
    }

    const focusTimeout = setTimeout(() => {
      textarea.focus()
    }, 100)

    const viewport = window.visualViewport
    if (viewport) {
      viewport.addEventListener('resize', handleVisualViewport)
      viewport.addEventListener('scroll', handleVisualViewport)
    }

    handleVisualViewport()

    return () => {
      clearTimeout(focusTimeout)
      if (viewport) {
        viewport.removeEventListener('resize', handleVisualViewport)
        viewport.removeEventListener('scroll', handleVisualViewport)
      }
    }
  }, [isExpanded])

  return { inputRef }
}