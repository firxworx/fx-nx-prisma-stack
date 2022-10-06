import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

export interface ActionLinkProps extends Exclude<React.HTMLAttributes<HTMLAnchorElement>, 'className'> {
  appendClassName?: string
}

/**
 * Wrapper for a link (anchor) element that applies project styles for nav links.
 *
 * This component is intended for link-styled actions that respond to click events.
 * Use alernative `NavLink` for NextJS link to navigate to other pages or URLs.
 *
 * The `appendClassName` prop is passed to the underlying anchor (`a`) tag.
 *
 * @see NavLink
 */
const ActionLinkComponent: React.FC<PropsWithChildren<ActionLinkProps>> = ({
  appendClassName,
  children,
  ...restProps
}) => {
  return (
    <a className={clsx('inline-block cursor-pointer fx-link', appendClassName)} {...restProps}>
      {children}
    </a>
  )
}

export const ActionLink = React.memo(ActionLinkComponent)
