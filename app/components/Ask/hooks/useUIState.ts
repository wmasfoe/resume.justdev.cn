import { useState, useEffect, useCallback } from 'react'
import { disableScroll, enableScroll } from '../scrollManage'

export default function useUIState() {
  const [message, setMessage] = useState('')
  const [isExpanding, setIsExpanding] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasChatHistory, setHasChatHistory] = useState(false)
  const [focusTimer, setFocusTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let documentRef: Document | undefined
    const handleClickOutside = () => {
      setIsExpanded(false)
      enableScroll()
    }

    if (typeof document !== 'undefined') {
      documentRef = document
      documentRef.addEventListener('click', handleClickOutside)
    }

    return () => {
      if (documentRef)
        documentRef.removeEventListener('click', handleClickOutside)
    }
  }, [isExpanded])

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setHasChatHistory(false)
    setIsExpanded(false)
  }, [])

  const handleFocus = useCallback((e: React.SyntheticEvent) => {
    if (focusTimer) {
      clearTimeout(focusTimer)
      setFocusTimer(null)
    }

    setIsExpanded(true)

    if (hasChatHistory) {
      requestAnimationFrame(() => {
        setIsExpanding(true)
      })
    }

    e.nativeEvent.stopImmediatePropagation()
    disableScroll()
  }, [focusTimer, hasChatHistory])

  return {
    message,
    setMessage,
    isExpanding,
    setIsExpanding,
    isExpanded,
    setIsExpanded,
    hasChatHistory,
    setHasChatHistory,
    focusTimer,
    setFocusTimer,
    handleClose,
    handleFocus,
  }
}