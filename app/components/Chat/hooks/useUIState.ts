import { useCallback, useRef, useState } from 'react'

// iOS spring easing — fast start, gentle deceleration
// Open: 380ms, Close: content 260ms then container 320ms
const CLOSE_CONTENT_MS = 260

export default function useUIState() {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleFocus = useCallback(() => {
    if (isExpanded) return

    // Synchronous focus inside gesture — iOS raises keyboard reliably
    inputRef.current?.focus()
    setIsExpanded(true)
  }, [isExpanded])

  const handleCollapse = useCallback(() => {
    if (!isExpanded) return

    // Phase 1: content plays exit animation (CLOSE_CONTENT_MS)
    // Container also starts shrinking simultaneously via CSS transition
    setIsExpanded(false)
    setIsClosing(true)
    inputRef.current?.blur()

    // Phase 2: after content is gone, clean up isClosing flag
    setTimeout(() => {
      setIsClosing(false)
    }, CLOSE_CONTENT_MS)
  }, [isExpanded])

  return {
    message,
    setMessage,
    isExpanded,
    isClosing,
    handleFocus,
    handleCollapse,
    inputRef,
  }
}
