import React, { useId } from 'react'
import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'

import { useMergedRef } from '@firx/react-hooks'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import type { FormElementCommonProps } from '../../../types/components/form-element-common-props.interface'

export interface FormInputProps extends Omit<React.ComponentPropsWithRef<'input'>, 'name'>, FormElementCommonProps {
  /**
   * Input `type` attribute e.g. 'text', 'email', 'password', 'search'.
   * Defaults to "text" if no value is provided.
   */
  type?: React.HTMLInputTypeAttribute
}

/**
 * Form input component for use with react-hook-form.
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed foundation for this component.
 *
 * @see {@link https://react-hook-form.com/api/useformcontext}
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  {
    id,
    name,
    label,
    helperText,
    type = 'text',
    readOnly = false,
    hideErrorMessage = false,
    hideLabel = false,
    appendClassName,
    validationOptions,
    ...restProps
  }: FormInputProps,
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

  const isInputDisabled = restProps.disabled || isSubmitting
  const showErrorMessage = errors[name] && !hideErrorMessage

  return (
    <div
      className={clsx(
        'group',
        {
          ['opacity-80']: restProps.disabled,
        },
        appendClassName,
      )}
    >
      <label htmlFor={componentId} className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={mergedRef}
          id={componentId}
          disabled={isInputDisabled}
          {...registerProps}
          {...restProps}
          type={type}
          readOnly={readOnly}
          className={clsx(
            'block w-full rounded-md', // fx-form-input fx-focus-ring-form @todo specificity vs. tailwind + better system for common class or use theme
            'border rounded-md border-palette-form-border text-palette-form-input placeholder:text-palette-form-placeholder',
            'focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-sky-100', // fx-focus-ring-form
            // @todo FormInput classNames revision of styling logic for fx-form-input to work alongside conditional styles
            // probably need to split into multiple general styles and group them where it works
            readOnly
              ? 'bg-slate-100 cursor-not-allowed' // focus:ring-0 focus:border-slate-300
              : 'bg-white',
            {
              ['animate-pulse cursor-progress']: isSubmitting,
              // editable field + no error
              ['border-slate-300']: !readOnly && !errors[name],
              // editable field + error
              ['border-error-400']: !readOnly && errors[name],
            },
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
          {helperText && <div className="text-xs text-slate-500">{helperText}</div>}
          {errors[name] && (
            <div className="text-sm pl-1 text-error-600">
              {errors[name]?.type === 'required' && !errors[name]?.message
                ? 'Field is required'
                : errors[name]?.type === 'pattern' && !errors[name]?.message
                ? 'Invalid value'
                : String(errors[name]?.message)
                ? String(errors[name]?.message)
                : 'Invalid input'}
            </div>
          )}
        </div>
      )}
    </div>
  )
})
