import React, { useId } from 'react'
import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'

import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useMergedRef } from '@firx/react-hooks'
import type { FormElementCommonProps } from '../../../types/components/form-element-common-props.interface'

export interface FormSelectInputProps
  extends Omit<React.ComponentPropsWithRef<'select'>, 'name'>,
    FormElementCommonProps {
  // @todo resolve FormSelectInput `children?` as ? for FormSelectInput2 which is not currently in project use
  children?: React.ReactNode
}

/**
 * Form select (drop-down) for use with react-hook-form.
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed foundation for this component.
 *
 * @see {@link https://react-hook-form.com/api/useformcontext}
 */
export const FormSelectInput = React.forwardRef<HTMLSelectElement, FormSelectInputProps>(function FormSelectInput(
  {
    id,
    name,
    label,
    helperText,
    placeholder,
    readOnly = false,
    hideErrorMessage = false,
    hideLabel = false,
    appendClassName,
    validationOptions,
    children,
    ...restProps
  },
  forwardedRef,
) {
  const {
    register,
    formState: { isSubmitting, errors },
    watch,
  } = useFormContext()

  const safeId = useId()
  const componentId = id ?? safeId

  const value = watch(componentId)

  const { ref: formRef, ...registerProps } = register(name, validationOptions)
  const mergedRef = useMergedRef(forwardedRef, formRef)

  const showError = errors[name] && !hideErrorMessage

  // add `disabled` and `selected` attribute to option tag -- applies when SelectInput.readOnly is true
  const readOnlyChildren = readOnly
    ? React.Children.map<React.ReactNode, React.ReactNode>(children, (child) => {
        if (React.isValidElement<HTMLOptionElement>(child)) {
          return React.cloneElement(child, {
            disabled: child.props.value !== restProps?.defaultValue,
            // selected: child.props.value === rest?.defaultValue,
          })
        }
      })
    : null

  return (
    <div className={appendClassName}>
      <label htmlFor={id} className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>
        {label}
      </label>
      <div className="relative mt-1">
        <select
          ref={mergedRef}
          id={componentId}
          disabled={restProps.disabled || isSubmitting}
          {...registerProps}
          defaultValue="" // default to be overridden by `...restProps` if a value is provided via props
          {...restProps}
          className={clsx(
            readOnly
              ? 'bg-slate-100 focus:ring-0 cursor-not-allowed border-slate-300 focus:border-slate-300'
              : errors[name]
              ? 'focus:ring-error-500 border-error-500 focus:border-error-500'
              : 'focus:ring-primary-500 border-slate-300 focus:border-primary-500',
            'block w-full rounded-md shadow-sm',
            { 'text-slate-500': value === '' },
          )}
          aria-label={hideLabel ? label : undefined}
          aria-invalid={errors[name] ? 'true' : 'false'}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {readOnly ? readOnlyChildren : children}
        </select>

        {errors[name] && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-error-500" aria-hidden />
          </div>
        )}
      </div>
      {(helperText || showError) && (
        <div className="mt-1">
          {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
          {errors[name] && <span className="text-sm text-error-600">{String(errors[name]?.message)}</span>}
        </div>
      )}
    </div>
  )
})
