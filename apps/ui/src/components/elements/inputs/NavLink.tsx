import React, { type PropsWithChildren } from 'react'
import Link, { type LinkProps } from 'next/link'
import clsx from 'clsx'

export interface NavLinkProps extends LinkProps {
  className: string
  anchorProps?: Exclude<React.HTMLAttributes<HTMLAnchorElement>, 'className'>
}

/**
 * Wrapper for the NextJS Link component.
 *
 * The `className` prop is passed to the underlying anchor (`a`) tag.
 * Additional props specifically for the anchor tag may be supplied via the `anchorProps` prop.
 */
const NavLinkComponent: React.FC<PropsWithChildren<NavLinkProps>> = ({
  className,
  children,
  anchorProps,
  ...restProps
}) => {
  return (
    <Link {...restProps}>
      <a className={clsx('fx-link', className)} {...anchorProps}>
        {children}
      </a>
    </Link>
  )
}

export const NavLink = React.memo(NavLinkComponent)
