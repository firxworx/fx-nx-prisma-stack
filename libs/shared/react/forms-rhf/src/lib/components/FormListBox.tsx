import React from 'react'
import clsx from 'clsx'
import { Listbox, Transition } from '@headlessui/react'
import { useController, type UseControllerProps } from 'react-hook-form'

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import type { FormOption } from '../types/form-option.interface'

// React.ComponentPropsWithoutRef<'select'> {
export interface FormListBoxProps extends UseControllerProps {
  name: string
  label: string
  helperText?: string
  options: FormOption[]
  hideLabel?: boolean
  appendClassName?: string
  placeholder?: string
  // readOnly?: boolean
  // validation?: RegisterOptions
}

const LABELS = {
  DEFAULT_PLACEHOLDER_PREFIX: 'Select', // usage example: 'Select Language'
}

/**
 *
 * Note: HeadlessUI form components manage creation and association of isomorphic-friendly `id`'s.
 *
 * @see {@link https://headlessui.com/react/listbox#listbox}
 * @see {@link https://github.com/tailwindlabs/headlessui/discussions/1041}
 *
 * @todo ensure label looks good with and without hideLabel
 */
export const FormListBox: React.FC<FormListBoxProps> = ({
  name,
  label,
  helperText,
  options,
  hideLabel = false,
  appendClassName,
  placeholder,
  // readOnly = false,
  // validation,
  ...restReactHookFormProps
}) => {
  const { field } = useController({ name, ...restReactHookFormProps }) // { name, control, rule, defaultValue }

  // const showErrorMessage = errors[name] && !hideErrorMessage

  return (
    <div>
      <Listbox value={field.value} onChange={field.onChange} as="div" className={clsx('group w-full', appendClassName)}>
        {({ open }): JSX.Element => (
          <>
            <Listbox.Label className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>{label}</Listbox.Label>
            <div className="relative">
              <Listbox.Button
                ref={field.ref} // setting ref enables react-hook-form to focus on input on error
                className={clsx(
                  'relative group w-full cursor-default rounded-md border text-base',
                  'py-2 pl-3 pr-10 text-left shadow-sm',
                  'border-palette-form-border bg-white',
                  'fx-focus-ring-form',
                )}
              >
                <span
                  className={clsx('block truncate', {
                    'text-palette-form-input': !!field.value,
                    'text-palette-form-placeholder': !field.value,
                  })}
                >
                  {field.value
                    ? options.find((option) => option.value === field.value)?.label
                    : placeholder ?? `${LABELS.DEFAULT_PLACEHOLDER_PREFIX} ${label}`}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className={clsx('h-5 w-5 text-slate-400', {
                      'group-hover:text-slate-600 group-active:text-palette-form-input': !!(options && options.length),
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
                    'bg-white text-base text-left shadow-lg',
                    'ring-1 ring-black ring-opacity-5 focus:outline-none', // dropdown menu border
                  )}
                >
                  {options.map((option) => (
                    <Listbox.Option
                      key={`${option.label}-${option.value}`}
                      className={({ active }): string =>
                        clsx(
                          active ? 'bg-sky-100' : 'text-palette-form-input',
                          'relative py-2 pl-8 pr-4 cursor-default select-none',
                        )
                      }
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {({ selected, active }): JSX.Element => (
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
      {helperText && ( // @todo showErrorMessage show FormListBox errors
        <div className="mt-1 text-left">{helperText && <div className="text-xs text-slate-500">{helperText}</div>}</div>
      )}
    </div>
  )
}
