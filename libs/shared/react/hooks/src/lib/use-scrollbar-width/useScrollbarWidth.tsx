import React, { useEffect } from 'react'

/**
 * Compute the width of the scrollbar in the user's browser/environment and return the pixel value.
 *
 * Implemented with a technique adds a hidden temporary element with a forced scrollbar and then measures
 * the differences in offset width of that element vs. an inner child element.
 *
 * This hook only computes the scrollbar width once and stashes the value in a ref.
 * If your app does not force scrollbars (e.g. no `overflow-y: scroll` on body) you may need to determine
 * if a scrollbar is present before using the scrollbar width value as an offset e.g. in modal a implemenation.
 *
 * Thanks to David Walsh for the approach (circa 2011!) + Robin Wieruch for foundations of the hook
 * converted by yours truly to running in an SSR-friendly useEffect.
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
