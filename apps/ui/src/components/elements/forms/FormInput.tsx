import * as React from 'react'
import clsx from 'clsx'
import { useId } from '@reach/auto-id'
import { type RegisterOptions, useFormContext } from 'react-hook-form'

import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

import useMergedRef from '../../../hooks/useMergedRef'

export interface FormInputProps extends React.ComponentPropsWithoutRef<'input'> {
  /** provide an explicit id for the input element (otherwise a server-render-friendly id will be generated). */
  id?: string
  /** name to register with react-hook-form */
  name: string
  /** input label */
  label: string
  /** input placeholder */
  placeholder?: string
  /** small helper text below input, for any additional information */
  helperText?: string
  /** input type e.g. 'text', 'email', 'password' */
  type?: React.HTMLInputTypeAttribute
  /** disable input and show defaultValue (may be set via react-hook-form) */
  readOnly?: boolean
  /** disable display of the input's label */
  hideLabel?: boolean
  /** disable display of error (does not disable error validation; useful if parent component will handle error display) */
  hideError?: boolean
  /** manual validation options passed to react-hook-form; it is encouraged to use a yup resolver instead */
  validationOptions?: RegisterOptions
}

/**
 * Form input component for use with react-hook-form.
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed foundation for this component.
 *
 * @see {@link https://react-hook-form.com/api/useformcontext}
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      name,
      label,
      placeholder,
      helperText,
      type = 'text',
      readOnly = false,
      hideError = false,
      hideLabel = false,
      validationOptions,
      ...restProps
    }: FormInputProps,
    forwardedRef,
  ) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const id = useId(restProps.id) // @todo consider revision w/ introduction of useId() in React 18+

    const { ref: formRef, ...registerProps } = register(name, validationOptions)
    const mergedRef = useMergedRef(forwardedRef, formRef)

    const isDisabled = restProps.disabled || isSubmitting

    return (
      <div>
        {!hideLabel && ( // @todo more a11y-friendly label hide of FormInput
          <label htmlFor={id} className="block text-sm font-normal text-slate-700">
            {label}
          </label>
        )}
        <div className="relative mt-1">
          <input
            id={id}
            ref={mergedRef}
            disabled={isDisabled}
            {...registerProps}
            {...restProps}
            type={type}
            readOnly={readOnly}
            className={clsx(
              'block border w-full rounded-md shadow-sm focus:outline-none',
              readOnly
                ? 'bg-slate-100 border-slate-300 cursor-not-allowed focus:ring-0 focus:border-slate-300'
                : 'bg-white focus:ring-2',
              {
                ['animate-pulse cursor-progress']: isDisabled,
                // editable field + no error
                ['border-slate-300 focus:ring-blue-100 focus:border-slate-300']: !readOnly && !errors[name],
                // editable field + error
                ['border-error-400 focus:ring-error-200 focus:border-error-400']: !readOnly && errors[name],
              },
            )}
            placeholder={placeholder}
            aria-label={hideLabel ? label : undefined}
            aria-invalid={errors[name] ? 'true' : 'false'}
          />
          {!hideError && errors[name] && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ExclamationCircleIcon className="h-5 w-5 text-error-500" aria-hidden />
            </div>
          )}
        </div>
        <div className="mt-1">
          {helperText && <div className="text-xs text-slate-500">{helperText}</div>}
          {!hideError && errors[name] && (
            <div className="text-sm text-error-600">
              {
                // @ts-expect-error type issue w/ react-hook-form -- type 'required' not supported in types for generic inputs
                errors[name]?.type === 'required' && !errors[name]?.message
                  ? 'Field is required'
                  : // @ts-expect-error type issue w/ react-hook-form -- type 'required' not supported in types for generic inputs
                  errors[name]?.type === 'pattern' && !errors[name]?.message
                  ? 'Invalid value'
                  : String(errors[name]?.message)
                  ? String(errors[name]?.message)
                  : 'Invalid input'
              }
            </div>
          )}
        </div>
      </div>
    )
  },
)

// provide explicit display name (per eslint react/display-name)
FormInput.displayName = 'FormInput'
