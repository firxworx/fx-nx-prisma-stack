import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

import { Spinner } from '../feedback/Spinner'
import type { ButtonSharedProps } from '../../../types/components/ButtonSharedProps.interface'

export interface ActionButtonProps
  extends ButtonSharedProps,
    Exclude<React.HTMLAttributes<HTMLButtonElement>, 'type' | 'className'> {
  /**
   * Button `type` is explicitly included and required to protect against corner-case differences across browsers.
   */
  type?: React.ComponentPropsWithoutRef<'button'>['type']
}

/**
 * Reusable button component with a standard set of styles for different variants.
 * Renders an actual HTML `button` element with explicitly defined default `type` "button".
 *
 * @see FormButton for a button component integrated with react-hook-form.
 * @see LinkButton for a nextjs-compatible anchor (link) styled as a button.
 */
export const ActionButton: React.FC<PropsWithChildren<ActionButtonProps>> = ({
  variant,
  border,
  appendClassName,
  disabled,
  isLoading,
  isSubmitting,
  children,
  ...restProps
}) => {
  const renderDisabled = !!disabled || isLoading || isSubmitting

  return (
    <button
      className={clsx(
        'fx-button-base',
        {
          // conditional animation
          ['animate-pulse']: isLoading || isSubmitting,

          // border style
          ['fx-button-standard-border']: border === 'standard',
          ['fx-button-thin-border']: border === 'thin',

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
      disabled={renderDisabled}
      {...restProps}
    >
      {isLoading || isSubmitting ? (
        <>
          <Spinner size="sm" appendClassName="mr-2" />
          <div className="inline-flex items-center justify-center">{children}</div>
        </>
      ) : (
        <>{children}</>
      )}
    </button>
  )
}

ActionButton.defaultProps = {
  type: 'button',
  variant: 'solid',
  border: 'standard',
}
