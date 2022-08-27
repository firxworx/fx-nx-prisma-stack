import React, { type PropsWithChildren } from 'react'
import Link, { type LinkProps } from 'next/link'
import clsx from 'clsx'

export interface LinkButtonProps extends LinkProps {
  href: string
  appendClassName: string
}

/**
 * NextJS Link component styled like a button.
 *
 * Append an additional className string to the underlying anchor element via the
 * `appendClassName` prop (e.g. to specify a color).
 */
export const LinkButton: React.FC<PropsWithChildren<LinkButtonProps>> = ({
  href,
  appendClassName,
  children,
  ...restProps
}) => {
  return (
    <Link href={href} {...restProps}>
      <a className={clsx('fx-button fx-palette-button-primary', appendClassName)}>{children}</a>
    </Link>
  )
}
