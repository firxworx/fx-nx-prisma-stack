import { useEffect, useRef } from 'react'

/**
 * React hook that returns a boolean ref where `ref.current` is a boolean value indicating
 * if the component invoking the hook is mounted or not.
 */
export function useIsMountedRef() {
  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return isMountedRef
}
