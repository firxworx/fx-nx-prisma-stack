import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

export interface ActionButtonProps extends Exclude<React.HTMLAttributes<HTMLButtonElement>, 'type' | 'className'> {
  variant?: 'solid' | 'outline' | 'transparent'
  disabled?: boolean
  appendClassName?: string
}

/**
 * Reusable button component (`type='button'`) with a base set of styles.
 *
 * Set `variant` to `solid` (default) or `outline`.
 *
 * The `appendClassName` prop supports adding additional style classes. The value is appended to `className`
 * after the component's built-in classes. It can be useful for adding classes for margins/spacing.
 */
export const ActionButton: React.FC<PropsWithChildren<ActionButtonProps>> = ({
  variant,
  appendClassName,
  children,
  disabled,
  ...restProps
}) => {
  return (
    <button
      type="button"
      className={clsx(
        'fx-button-base',
        {
          ['fx-button-solid-primary']: variant === 'solid' && !disabled,
          ['fx-button-solid-primary-disabled']: variant === 'solid' && disabled,
          ['fx-button-outline-primary']: variant === 'outline' && !disabled,
          ['fx-button-outline-primary-disabled']: variant === 'outline' && disabled,
          ['fx-button-transparent-primary']: variant === 'transparent' && !disabled,
          ['fx-button-transparent-primary-disabled']: variant === 'transparent' && disabled,
        },
        appendClassName,
      )}
      {...restProps}
    >
      {children}
    </button>
  )
}

ActionButton.defaultProps = {
  variant: 'solid',
}
