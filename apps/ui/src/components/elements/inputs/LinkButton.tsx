import React, { type PropsWithChildren } from 'react'
import Link, { type LinkProps } from 'next/link'
import clsx from 'clsx'

export interface LinkButtonProps extends LinkProps {
  href: string
  variant?: 'solid' | 'outline' | 'transparent'
  disabled?: boolean
  appendClassName?: string
  // anchorProps: Exclude<React.HTMLAttributes<HTMLAnchorElement>, 'className'>
}

/**
 * NextJS Link component styled like a button.
 *
 * The `appendClassName` prop supports adding additional style classes. The value is appended to `className`
 * after the component's built-in classes. It can be useful for adding classes for margins/spacing.
 */
export const LinkButton: React.FC<PropsWithChildren<LinkButtonProps>> = ({
  href,
  variant,
  disabled,
  appendClassName,
  children,
  ...restProps
}) => {
  return (
    <Link href={href} {...restProps}>
      <a
        className={clsx(
          'fx-button-base',
          {
            ['pointer-events-none']: disabled,
            ['fx-button-solid-primary']: variant === 'solid' && !disabled,
            ['fx-button-solid-primary-disabled']: variant === 'solid' && disabled,
            ['fx-button-outline-primary']: variant === 'outline' && !disabled,
            ['fx-button-outline-primary-disabled']: variant === 'outline' && disabled,
            ['fx-button-transparent-primary']: variant === 'transparent' && !disabled,
            ['fx-button-transparent-primary-disabled']: variant === 'transparent' && disabled,
          },
          appendClassName,
        )}
      >
        {children}
      </a>
    </Link>
  )
}

LinkButton.defaultProps = {
  variant: 'solid',
}
