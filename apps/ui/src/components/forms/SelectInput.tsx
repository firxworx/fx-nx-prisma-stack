import clsx from 'clsx'
import * as React from 'react'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { ExclamationCircleIcon } from '@heroicons/react/outline'

export interface SelectInputProps extends React.ComponentPropsWithoutRef<'select'> {
  label: string
  id: string
  placeholder?: string
  helperText?: string
  type?: string
  readOnly?: boolean
  validation?: RegisterOptions
  children: React.ReactNode
}

/**
 * Form select (drop-down) component that's compatible with react-hook-form.
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed foundation code for this component that was
 * customized for this project.
 */
export const SelectInput = ({
  label,
  helperText,
  id,
  placeholder,
  readOnly = false,
  children,
  validation,
  ...rest
}: SelectInputProps) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext()

  const value = watch(id)

  // add `disabled` and `selected` attribute to option tag, will be used if readonly
  const readOnlyChildren = React.Children.map<React.ReactNode, React.ReactNode>(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        disabled: child.props.value !== rest?.defaultValue,
        // selected: child.props.value === rest?.defaultValue,
      })
    }
  })

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-normal text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <select
          {...register(id, validation)}
          defaultValue="" // initially blank -- to be overridden by `...rest` if provided
          {...rest}
          name={id}
          id={id}
          className={clsx(
            readOnly
              ? 'bg-gray-100 focus:ring-0 cursor-not-allowed border-gray-300 focus:border-gray-300'
              : errors[id]
              ? 'focus:ring-red-500 border-red-500 focus:border-red-500'
              : 'focus:ring-primary-500 border-gray-300 focus:border-primary-500',
            'block w-full rounded-md shadow-sm',
            { 'text-gray-500': value === '' },
          )}
          aria-describedby={id}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {readOnly ? readOnlyChildren : children}
        </select>

        {errors[id] && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="text-xl text-red-500" />
          </div>
        )}
      </div>
      <div className="mt-1">
        {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        {errors[id] && <span className="text-sm text-red-500">{String(errors[id].message)}</span>}
      </div>
    </div>
  )
}
