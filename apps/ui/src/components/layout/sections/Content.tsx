import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

export interface ContentProps {
  contentConstraintStyle: string
  containerXPaddingStyle: string
  containerYPaddingStyle: string
  extraClassName?: string
}

/**
 * Content wrapper of ProjectLayout that sets responsive max widths, padding, etc. and renders its
 * children inside of a `<main>..</main>` block.
 *
 * @todo - consider customizing the tailwind '.container' utility class in preset
 */
export const Content: React.FC<PropsWithChildren<ContentProps>> = ({
  contentConstraintStyle,
  containerXPaddingStyle,
  containerYPaddingStyle,
  extraClassName,
  children,
}) => {
  return (
    <main
      className={clsx(
        'flex-1 w-full mx-auto',
        contentConstraintStyle,
        containerXPaddingStyle,
        containerYPaddingStyle,
        extraClassName,
      )}
    >
      {children}
    </main>
  )
}
