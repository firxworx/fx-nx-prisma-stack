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
 *
 * // fx-layout-max-width fx-layout-padding-x fx-layout-padding-y
 */
export const Content: React.FC<PropsWithChildren<ContentProps>> = ({ appendClassName, children }) => {
  return <main className={clsx('flex-1 w-full mx-auto bg-slate-50', appendClassName)}>{children}</main>
}
