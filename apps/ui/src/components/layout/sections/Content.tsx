import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

export interface ContentProps {
  appendClassName?: string
}

/**
 * Content wrapper of ProjectLayout that sets responsive max widths, padding, etc. and renders its
 * children inside of a `<main>..</main>` block.
 *
 * @todo - consider customizing the tailwind '.container' utility class in preset
 */
export const Content: React.FC<PropsWithChildren<ContentProps>> = ({ appendClassName, children }) => {
  return (
    <main
      className={clsx(
        'flex-1 w-full mx-auto',
        'fx-layout-max-width fx-layout-padding-x fx-layout-padding-y',
        appendClassName,
      )}
    >
      {children}
    </main>
  )
}
