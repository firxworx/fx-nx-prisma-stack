import * as React from 'react'
import clsx from 'clsx'
import { type RegisterOptions, useFormContext } from 'react-hook-form'
import { ExclamationCircleIcon } from '@heroicons/react/outline'

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  /** id to initialize with react-hook-form */
  id: string
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
  /** disable error style (does not disable error validation) */
  hideError?: boolean
  /** manual validation using react-hook-form, it is encouraged to use yup resolver instead */
  validation?: RegisterOptions
}

/**
 * Form input component that's compatible with react-hook-form.
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed foundation code for this component that was
 * customized for this project.
 */
export const Input = ({
  id,
  label,
  placeholder = '',
  helperText,
  type = 'text',
  readOnly = false,
  hideError = false,
  validation,
  ...rest
}: InputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-normal text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          {...register(id, validation)}
          {...rest}
          type={type}
          name={id}
          id={id}
          readOnly={readOnly}
          className={clsx(
            readOnly
              ? 'bg-gray-100 focus:ring-0 cursor-not-allowed border-gray-300 focus:border-gray-300'
              : errors[id]
              ? 'focus:ring-red-500 border-red-500 focus:border-red-500'
              : 'focus:ring-primary-500 border-gray-300 focus:border-primary-500',
            'block w-full rounded-md shadow-sm',
          )}
          placeholder={placeholder}
          aria-describedby={id}
        />

        {!hideError && errors[id] && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="text-xl text-red-500" />
          </div>
        )}
      </div>
      <div className="mt-1">
        {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        {!hideError && errors[id] && <span className="text-sm text-red-500">{String(errors[id].message)}</span>}
      </div>
    </div>
  )
}
