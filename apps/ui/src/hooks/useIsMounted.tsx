import { useCallback, useEffect, useRef } from 'react'

/**
 * React hook that returns a function that returns a boolean indicating if the component that invoked
 * the hook and called its function is mounted or not. Implemented using a ref to store mounted state.
 */
export function useIsMounted(): () => boolean {
  const ref = useRef<boolean>(false)

  useEffect(() => {
    ref.current = true

    return () => {
      ref.current = false
    }
  }, [])

  return useCallback(() => ref.current, [])
}
