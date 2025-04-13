import {useState, useCallback} from 'react'

export function useSharedState<T>(initialValue: T): [T, (newValue: T) => void] {
  const [state, setState] = useState(initialValue)
  const setSharedState = useCallback((newValue: T) => {
    setState(newValue)
  }, [])
    
  return [state, setSharedState]
}