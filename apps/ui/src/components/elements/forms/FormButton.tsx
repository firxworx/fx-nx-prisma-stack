import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'

import { Spinner } from '../feedback/Spinner'
import type { ButtonSharedProps } from '../../../types/components/ButtonSharedProps.interface'

export interface FormButtonProps
  extends Exclude<ButtonSharedProps, 'isSubmitting'>,
    React.ComponentPropsWithoutRef<'button'> {
  /**
   * Explicitly set the underlying `button` element's `type` prop to protect against cross-browser corner-cases.
   */
  type: React.ComponentPropsWithoutRef<'button'>['type']
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
export const FormButton: React.FC<FormButtonProps> = ({
  type,
  variant,
  appendClassName,
  disabled,
  isLoading,
  children,
  ...restProps
}) => {
  const {
    formState: { isSubmitting },
  } = useFormContext()
  const renderDisabled = !!disabled || isLoading || isSubmitting

  return (
    <button
      className={clsx('fx-button-base', {
        // conditional animation
        'animate-pulse': isLoading || isSubmitting,

        // button variant styles
        ['fx-button-solid-primary']: variant === 'solid' && !renderDisabled,
        ['fx-button-solid-primary-disabled']: variant === 'solid' && renderDisabled,
        ['fx-button-outline-primary']: variant === 'outline' && !renderDisabled,
        ['fx-button-outline-primary-disabled']: variant === 'outline' && renderDisabled,
        ['fx-button-transparent-primary']: variant === 'transparent' && !renderDisabled,
        ['fx-button-transparent-primary-disabled']: variant === 'transparent' && renderDisabled,
      })}
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

FormButton.defaultProps = {
  variant: 'solid',
}
