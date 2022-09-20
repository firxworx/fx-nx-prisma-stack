import React from 'react'

/**
 * React hook that merges multiple refs into one. Returns the merged ref when given >1 refs as arguments.
 * From the MIT-licensed react-hook npm package <https://github.com/jaredLunde/react-hook>
 */
export function useMergedRef<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
  return React.useCallback(
    (element: T) => {
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i]
        if (typeof ref === 'function') ref(element)
        else if (ref && typeof ref === 'object') (ref as React.MutableRefObject<T>).current = element
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  )
}
