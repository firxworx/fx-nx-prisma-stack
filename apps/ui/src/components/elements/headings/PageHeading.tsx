import clsx from 'clsx'

export interface PageHeadingProps {
  appendClassName?: string
}

/**
 * Responsive page heading that renders an h1 with text size and margins set.
 */
export const PageHeading: React.FC<React.PropsWithChildren<PageHeadingProps>> = ({ appendClassName, children }) => {
  return <h1 className={clsx('text-xl sm:text-2xl mb-4', appendClassName)}>{children}</h1>
}
