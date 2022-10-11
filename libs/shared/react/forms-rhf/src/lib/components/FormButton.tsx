import React, { useId } from 'react'
import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'

import { Spinner } from '@firx/react-feedback'
import type { ButtonCommonProps } from '../types/button-common-props.interface'

export interface FormButtonProps
  extends Exclude<ButtonCommonProps, 'isSubmitting'>,
    React.ComponentPropsWithRef<'button'> {
  /**
   * The `type` prop of the underlying `button` element is explicitly set to avoid certain cross-browser
   * corner-case behaviors. Default type: "submit".
   */
  type?: React.ComponentPropsWithRef<'button'>['type']
}

/**
 * Form button component for use with react-hook-form. Forms that use this component must be wrapped with the
 * `<FormProvider>..</FormProvider>` component from react-hook-form.
 *
 * This component will conditionally render a spinner + animation if the `isLoading` prop is `true` or if the
 * form's `isSubmitting` state as managed by react-hook-form is `true`.
 *
 * An explicit `type` prop is required by this component to protect against cross-browser corner-cases.
 *
 * @see ActionButton for a standalone button that can be used outside the context of a form.
 * @see LinkButton for a nextjs-compatible anchor (link) styled as a button.
 */
export const FormButton = React.forwardRef<HTMLButtonElement, FormButtonProps>(function FormButton(
  { id, type, variant, border, appendClassName, disabled, isLoading, children, ...restProps },
  forwardedRef,
) {
  const {
    formState: { isSubmitting },
  } = useFormContext()

  const safeId = useId()
  const componentId = id ?? safeId

  const renderDisabled = !!disabled || isLoading || isSubmitting

  return (
    <button
      ref={forwardedRef}
      id={componentId}
      type={type ?? 'submit'}
      className={clsx(
        'fx-button-base',
        {
          // conditional animation
          'animate-pulse': isLoading || isSubmitting,

          // border style
          'fx-button-standard-border': border === 'standard',
          'fx-button-thin-border': border === 'thin',

          // button variant styles
          'fx-button-solid-primary': variant === 'solid' && !renderDisabled,
          'fx-button-solid-primary-disabled': variant === 'solid' && renderDisabled,
          'fx-button-outline-primary': variant === 'outline' && !renderDisabled,
          'fx-button-outline-primary-disabled': variant === 'outline' && renderDisabled,
          'fx-button-transparent-primary': variant === 'transparent' && !renderDisabled,
          'fx-button-transparent-primary-disabled': variant === 'transparent' && renderDisabled,
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
        children
      )}
    </button>
  )
})

FormButton.defaultProps = {
  variant: 'solid',
  border: 'standard',
}
