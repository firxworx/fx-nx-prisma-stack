import React, { useEffect } from 'react'

/**
 * Compute the width of the scrollbar in the user's browser/environment and return the pixel value.
 *
 * Implemented with a technique adds a hidden temporary element with a forced scrollbar and then measures
 * the differences in offset width of that element vs. an inner child element.
 *
 * Returns 0 if the computed width is not available yet or if the hook is run server-side: the calculation
 * is performed inside of a useEffect and is therefore only applicable to the client-side.
 *
 * This hook only computes the scrollbar width once and stashes the value in a ref.
 * If your app does not force scrollbars (e.g. no `overflow-y: scroll` on body) you may need to determine
 * if a scrollbar is/was present before using the returned width value as an offset e.g. in a modal implemenation.
 *
 * Acknowledgement to David Walsh for the approach (circa 2011) + Robin Wieruch for foundations of the hook,
 * revised by yours truly (@firxworx) for TS + to run inside a useEffect for SSR + NextJS.
 */
export const useScrollbarWidth = (): number => {
  const didComputeRef = React.useRef<boolean>(false)
  const widthRef = React.useRef<number>(0)

  useEffect(() => {
    if (didComputeRef.current) {
      return
    }

    const outer = document.createElement('div')

    outer.style.visibility = 'hidden'
    outer.style.overflow = 'scroll'
    // note the following may be required to support legacy win-js / msie apps
    // outer.style.msOverflowStyle = 'scrollbar'

    document.body.appendChild(outer)

    // add inner child of the hidden div
    const inner = document.createElement('div')
    outer.appendChild(inner)

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth

    // clean-up temporary elements from the DOM
    outer.parentNode?.removeChild(outer)

    didComputeRef.current = true
    widthRef.current = scrollbarWidth
  }, [])

  return widthRef.current
}
