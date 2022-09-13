import React from 'react'
import clsx from 'clsx'
import { useController, type UseControllerProps } from 'react-hook-form'
import { Listbox, Transition } from '@headlessui/react'

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import type { FormListBoxOption } from './FormListBox'

export interface FormMultiListBoxProps extends UseControllerProps {
  id?: string
  name: string
  label: string
  placeholder?: string
  helperText?: string
  options: FormListBoxOption[]
  readOnly?: boolean
  hideLabel?: boolean
  disabled?: boolean
  appendClassName?: string
  // validation?: RegisterOptions
}

/**
 * Multi-select dropdown component integrated with react-hook-form.
 *
 * Provide select options via props as an array of objects, each with a required `value` and a `label`
 * The form value provided to react-hook-form is an array of `value`'s.
 */
export const FormMultiListBox = ({
  id,
  name,
  label,
  helperText,
  placeholder,
  options,
  readOnly = false,
  hideLabel = false,
  disabled,
  appendClassName,
  // validation,
  ...restReactHookFormProps
}: FormMultiListBoxProps) => {
  const { field } = useController({ name, ...restReactHookFormProps }) // { name, control, rule, defaultValue }

  return (
    <Listbox
      name={field.name}
      value={field.value ?? []}
      onChange={(val: unknown) => {
        field.onChange(val ?? [])
      }}
      multiple
      as="div"
      disabled={disabled}
      className={clsx('group w-full', appendClassName)}
    >
      {({ open }) => (
        <>
          <Listbox.Label className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>{label}</Listbox.Label>
          <div className="relative">
            <Listbox.Button
              ref={field.ref} // setting ref enables react-hook-form to focus on input on error
              className={clsx(
                'relative gtoup w-full cursor-default rounded-md border text-base',
                'py-2 pl-3 pr-10 text-left shadow-sm',
                'border-slate-300 bg-white',
                'fx-focus-ring-form',
              )}
            >
              <span
                className={clsx('block truncate', {
                  ['text-palette-form-input']: !!(Array.isArray(field.value) && field.value.length),
                  ['text-palette-form-placeholder']:
                    !field.value || (Array.isArray(field.value) && field.value.length === 0),
                })}
              >
                {Array.isArray(field.value) && !!field.value.length
                  ? field.value
                      .map((selectedOption) => options.find((i) => i.value === selectedOption)?.label)
                      .join(', ')
                  : `Select ${label}`}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className={clsx('h-5 w-5 text-slate-400', {
                    ['group-hover:text-slate-600 group-active:text-palette-form-input']: !!(options && options.length),
                  })}
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={React.Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={clsx(
                  'absolute z-10 mt-1 max-h-60 w-full py-1 overflow-auto rounded-md',
                  'bg-white text-base',
                  'ring-1 ring-black ring-opacity-5 focus:outline-none shadow-lg', // dropdown menu border
                )}
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={`${option.label}-${option.value}`}
                    className={({ active }) =>
                      clsx(
                        active ? 'bg-sky-100' : 'text-text-palette-form-input',
                        'relative py-2 pl-8 pr-4 cursor-default select-none',
                      )
                    }
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={clsx(
                            selected ? 'font-medium text-action-primary-darker' : 'font-normal',
                            'block truncate',
                          )}
                        >
                          {option.label}
                        </span>

                        {selected ? (
                          <span
                            className={clsx(
                              active ? 'text-action-primary-darker' : 'text-action-primary',
                              'absolute inset-y-0 left-0 flex items-center pl-1.5',
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}