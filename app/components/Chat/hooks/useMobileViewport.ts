import { useEffect, useRef } from 'react'

export default function useMobileViewport(isExpanded: boolean) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isExpanded && inputRef.current)
      inputRef.current.focus()
  }, [isExpanded])

  return { inputRef }
}
