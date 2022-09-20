import { useCallback, useEffect, useRef } from 'react'

/**
 * React hook that returns a function that, when executed, returns a boolean indicating if the invoking component
 * is mounted or not.
 *
 * This hook is implemented using a ref to store mounted state.
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
