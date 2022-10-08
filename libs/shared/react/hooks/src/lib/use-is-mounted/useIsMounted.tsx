import { useCallback, useEffect, useRef } from 'react'

/**
 * React hook that returns a stable function that, when executed, returns a boolean indicating if the invoking
 * component is mounted or not. The hook is implemented using a ref to store mounted state.
 *
 * Take care to not use this hook as part of a React anti-pattern to workaround "Can't perform a React state update
 * on an unmounted component" warnings seen in earlier versions of React (these warnings have since been removed
 * from React). Take care to prevent memory leaks.
 *
 * Valid use-cases for this hook can include not overwhelming the NextJS router or related to checks in components
 * that may be holding a reference after they are unmounted.
 *
 * @see {@link https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html}
 * @see {@link https://github.com/facebook/react/pull/22114#issuecomment-929191048}
 * @see {@link https://medium.com/doctolib/react-stop-checking-if-your-component-is-mounted-3bb2568a4934}
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
