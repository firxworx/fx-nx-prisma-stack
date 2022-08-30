import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'
import { Spinner } from '../feedback/Spinner'

export interface FormButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /** button `type` is explicitly required to protect against corner-case behavior across browsers. */
  type: React.ComponentPropsWithoutRef<'button'>['type']
}

/**
 * Form button component for use with react-hook-form.
 *
 * An explicit `type`
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 */
export const FormButton: React.FC<FormButtonProps> = ({ children, ...props }) => {
  const {
    formState: { isSubmitting },
  } = useFormContext()

  return (
    <button
      className={clsx('fx-button-base', {
        'animate-pulse': isSubmitting,
        'fx-button-solid-primary': !props.disabled,
        'fx-button-solid-primary-disabled': !!props.disabled,
      })}
      disabled={!!props.disabled || isSubmitting}
    >
      {isSubmitting && <Spinner size="sm" appendClassName="mr-1.5" />}
      {children}
    </button>
  )
}
