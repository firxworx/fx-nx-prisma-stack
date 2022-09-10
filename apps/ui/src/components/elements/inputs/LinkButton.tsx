import React, { type PropsWithChildren } from 'react'
import Link, { type LinkProps } from 'next/link'
import clsx from 'clsx'

import { Spinner } from '../feedback/Spinner'
import type { ButtonSharedProps } from '../../../types/components/ButtonSharedProps.interface'

export interface LinkButtonProps extends ButtonSharedProps, LinkProps {}

/**
 * NextJS Link component styled like a button.
 *
 * The `appendClassName` prop supports adding additional style classes. The value is appended to `className`
 * after the component's built-in classes. It can be useful for adding classes for margins/spacing.
 *
 * @see FormButton for a button component integrated with react-hook-form.
 * @see ActionButton for a standalone button that can be used outside the context of a form.
 */
export const LinkButton: React.FC<PropsWithChildren<LinkButtonProps>> = ({
  href,
  variant,
  disabled,
  appendClassName,
  isLoading,
  isSubmitting,
  children,
  ...restProps
}) => {
  const renderDisabled = !!disabled || isLoading

  return (
    <Link href={href} {...restProps}>
      <a
        className={clsx(
          'fx-button-base',
          {
            // implement disabled with pointer events none at the expense of no custom cursor
            ['pointer-events-none']: renderDisabled,

            // conditional animation
            'animate-pulse': isLoading || isSubmitting,

            // button variant styles
            ['fx-button-solid-primary']: variant === 'solid' && !renderDisabled,
            ['fx-button-solid-primary-disabled']: variant === 'solid' && renderDisabled,
            ['fx-button-outline-primary']: variant === 'outline' && !renderDisabled,
            ['fx-button-outline-primary-disabled']: variant === 'outline' && renderDisabled,
            ['fx-button-transparent-primary']: variant === 'transparent' && !renderDisabled,
            ['fx-button-transparent-primary-disabled']: variant === 'transparent' && renderDisabled,
          },
          appendClassName,
        )}
      >
        {isLoading || isSubmitting ? (
          <>
            <Spinner size="sm" appendClassName="mr-1" />
            <div className="inline-flex items-center justify-center">{children}</div>
          </>
        ) : (
          <>{children}</>
        )}
      </a>
    </Link>
  )
}

LinkButton.defaultProps = {
  variant: 'solid',
}
