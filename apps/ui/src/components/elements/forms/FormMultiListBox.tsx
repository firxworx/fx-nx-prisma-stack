import React from 'react'
import clsx from 'clsx'
import { useController, type UseControllerProps } from 'react-hook-form'
import { Listbox, Transition } from '@headlessui/react'

import { CheckIcon, ChevronUpDownIcon, PlusIcon } from '@heroicons/react/20/solid'

import type { FormListBoxOption } from './FormListBox'
import { ActionButton } from '../inputs/ActionButton'

export interface FormMultiListBoxProps extends UseControllerProps {
  name: string
  label: string
  helperText?: string
  options: FormListBoxOption[]
  hideLabel?: boolean
  disabled?: boolean
  appendClassName?: string
  onAddItemClick?: (event: React.MouseEvent) => void
  // placeholder?: string
  // readOnly?: boolean
  // validation?: RegisterOptions
}

/**
 * Multi-select dropdown component integrated with react-hook-form.
 *
 * Provide select options via props as an array of objects, each with a required `value` and a `label`
 * The form value provided to react-hook-form is an array of `value`'s.
 *
 * Note: HeadlessUI form components manage creation and association of isomorphic-friendly `id`'s.
 *
 * @see {@link https://headlessui.com/react/listbox#listbox}
 * @see {@link https://github.com/tailwindlabs/headlessui/discussions/1041}
 */
export const FormMultiListBox: React.FC<FormMultiListBoxProps> = ({
  name,
  label,
  helperText,
  // placeholder,
  options,
  // readOnly = false,
  hideLabel = false,
  disabled,
  appendClassName,
  onAddItemClick,
  // validation,
  ...restReactHookFormProps
}: FormMultiListBoxProps) => {
  const { field } = useController({ name, ...restReactHookFormProps }) // { name, control, rule, defaultValue }

  return (
    <div>
      <Listbox
        name={field.name}
        value={field.value ?? []}
        onChange={(val: unknown): void => {
          field.onChange(val ?? [])
        }}
        multiple
        as="div"
        disabled={disabled}
        className={clsx('w-full', appendClassName)}
      >
        {({ open }): JSX.Element => (
          <>
            <Listbox.Label className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>{label}</Listbox.Label>
            <div className="relative">
              <div className="flex w-full">
                <Listbox.Button
                  ref={field.ref} // setting ref enables react-hook-form to focus on input on error
                  className={clsx(
                    'group relative w-full cursor-default rounded-md border text-base',
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
                        ['group-hover:text-slate-600 group-active:text-palette-form-input']: !!(
                          options && options.length
                        ),
                      })}
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                {typeof onAddItemClick === 'function' && (
                  <div className="flex items-center">
                    <ActionButton
                      variant="outline"
                      border="thin"
                      appendClassName="min-w-content ml-2"
                      onClick={onAddItemClick}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </ActionButton>
                  </div>
                )}
              </div>
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
                    'bg-white text-base text-left',
                    'ring-1 ring-black ring-opacity-5 focus:outline-none shadow-lg', // dropdown menu border
                  )}
                >
                  {options.map((option) => (
                    <Listbox.Option
                      key={`${option.label}-${option.value}`}
                      className={({ active }): string =>
                        clsx(
                          active ? 'bg-sky-100' : 'text-text-palette-form-input',
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
      {helperText && ( // @todo showErrorMessage show FormMultiListBox errors
        <div className="mt-1 text-left">{helperText && <div className="text-xs text-slate-500">{helperText}</div>}</div>
      )}
    </div>
  )
}
