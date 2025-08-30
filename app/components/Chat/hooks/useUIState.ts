import { useCallback, useState } from 'react'

export default function useUIState() {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)

  const handleFocus = useCallback(() => {
    if (isExpanded)
      return

    setIsExpanding(true)
    setIsExpanded(true)

    setTimeout(() => {
      setIsExpanding(false)
    }, 500)
  }, [isExpanded])

  const handleCollapse = useCallback(() => {
    setIsExpanded(false)
    setIsExpanding(false)
  }, [])

  return {
    message,
    setMessage,
    isExpanded,
    isExpanding,
    handleFocus,
    handleCollapse,
  }
}
