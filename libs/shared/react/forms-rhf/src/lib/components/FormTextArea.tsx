import React, { useId } from 'react'
import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

import { useMergedRef } from '@firx/react-hooks'
import type { FormElementCommonProps } from '../types/form-element-common-props.interface'

export interface FormTextAreaProps
  extends Omit<React.ComponentPropsWithRef<'textarea'>, 'name'>,
    FormElementCommonProps {}

/**
 * Form textarea (textbox) for use with react-hook-form.
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed foundation for this component.
 *
 * @see {@link https://react-hook-form.com/api/useformcontext}
 */
export const FormTextArea = React.forwardRef<HTMLTextAreaElement, FormTextAreaProps>(function TextArea(
  {
    id,
    name,
    label,
    placeholder = '',
    helperText,
    readOnly = false,
    hideLabel = false,
    hideErrorMessage = false,
    appendClassName,
    validationOptions,
    ...restProps
  },
  forwardedRef,
) {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext()

  const safeId = useId()
  const componentId = id ?? safeId

  const { ref: formRef, ...registerProps } = register(name, validationOptions)
  const mergedRef = useMergedRef(forwardedRef, formRef)

  const showErrorMessage = errors[name] && !hideErrorMessage

  return (
    <div className={appendClassName}>
      <label htmlFor={id} className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>
        {label}
      </label>
      <div className="relative mt-1 text-left">
        <textarea
          ref={mergedRef}
          id={componentId}
          disabled={restProps.disabled || isSubmitting}
          {...registerProps}
          rows={3} // default to be overridden by `...restProps` if a value is provided via props
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
        {errors[name] && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-error-500" aria-hidden />
          </div>
        )}
      </div>
      {(helperText || showErrorMessage) && (
        <div className="mt-1 text-left">
          {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
          {errors[name] && <span className="text-sm text-error-600">{String(errors[name]?.message)}</span>}
        </div>
      )}
    </div>
  )
})
