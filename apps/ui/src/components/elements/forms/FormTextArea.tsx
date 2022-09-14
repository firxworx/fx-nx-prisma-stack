import clsx from 'clsx'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useId } from '@reach/auto-id'

export interface TextAreaProps extends React.ComponentPropsWithoutRef<'textarea'> {
  id?: string
  name: string
  label: string
  placeholder?: string
  helperText?: string
  readOnly?: boolean
  hideLabel?: boolean
  hideError?: boolean
  validation?: RegisterOptions
}

/**
 * Form textarea (textbox) for use with react-hook-form.
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed foundation for this component.
 *
 * @see {@link https://react-hook-form.com/api/useformcontext}
 */
export const TextArea = ({
  name,
  label,
  placeholder = '',
  helperText,
  readOnly = false,
  hideLabel = false,
  hideError = false,
  validation,
  ...restProps
}: TextAreaProps) => {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext()

  const id = useId(restProps.id)

  return (
    <div>
      <label htmlFor={id} className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>
        {label}
      </label>
      <div className="relative mt-1 text-left">
        <textarea
          id={id}
          disabled={restProps.disabled || isSubmitting}
          {...register(name, validation)}
          rows={3} // default -- overridden by `...restProps` if provided
          {...restProps}
          readOnly={readOnly}
          placeholder={placeholder}
          className={clsx(
            readOnly
              ? 'bg-slate-100 focus:ring-0 cursor-not-allowed border-slate-300 focus:border-slate-300'
              : errors[name]
              ? 'focus:ring-error-500 border-error-500 focus:border-error-500'
              : 'focus:ring-primary-500 border-slate-300 focus:border-primary-500',
            'block w-full rounded-md shadow-sm',
          )}
          aria-label={hideLabel ? label : undefined}
          aria-invalid={errors[name] ? 'true' : 'false'}
        />
        {!hideError && errors[name] && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-error-500" aria-hidden />
          </div>
        )}
      </div>
      <div className="mt-1 text-left">
        {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        {!hideError && errors[name] && <span className="text-sm text-error-600">{String(errors[name]?.message)}</span>}
      </div>
    </div>
  )
}
