import React, { useEffect, useState } from 'react'
import { Combobox as ComboBox, Transition } from '@headlessui/react'
import { useController, UseControllerProps } from 'react-hook-form'
import clsx from 'clsx'

import { SelectorIcon } from '@heroicons/react/outline'
import { CheckIcon, PlusIcon, XCircleIcon } from '@heroicons/react/solid'

import type { ApiObject } from '../../../types/api-object.interface'

const LABELS = {
  NO_FILTER_QUERY_MATCHES_FOUND: 'No matches found',
}

export interface FormMultiComboBoxOption extends ApiObject {
  name: string // @todo genericize to label or have component options for dev to specify labelKey (for now can map if there's not a name)
}

export interface FormMultiComboBoxProps extends UseControllerProps {
  label: string
  options: FormMultiComboBoxOption[]
}

export interface ComboBoxItemsButtonProps {
  label: string
  selectedItems: FormMultiComboBoxOption[]
  onItemDeselect: (uuid: string) => React.MouseEventHandler
}

export interface ComboBoxFilterQueryInputButtonProps {
  onFilterQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

// for dev/debug purposes (see commented out usage below)
// const SelectedItemsCommaList: React.FC<{ selectedItems: FormMultiComboBoxOption[] }> = ({ selectedItems }) => {
//   return (
//     <div className="text-sm">
//       {selectedItems.length > 0 && <span>Selected items: {selectedItems.map((item) => item.name).join(', ')}</span>}
//     </div>
//   )
// }

const ComboBoxItemsButton: React.FC<ComboBoxItemsButtonProps> = ({ label, selectedItems, onItemDeselect }) => {
  return (
    <ComboBox.Button
      as="div"
      className={clsx(
        'relative w-full cursor-default fx-input-border bg-white pl-3 pr-10',
        'text-left',
        'focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300',
      )}
    >
      <span className="block truncate">
        {!!selectedItems.length ? (
          <ul className="inline-flex space-x-2 list-none py-1.5">
            {selectedItems.map((item) => (
              <li key={item.uuid}>
                <button
                  type="button"
                  className="group inline-flex items-center text-slate-800 bg-slate-200 hover:text-slate-700 hover:bg-error-200 transition-colors py-1.5 pl-2 leading-none rounded-md text-sm"
                  onClick={onItemDeselect(item.uuid)}
                >
                  <span className="inline-block flex-1">{item.name}</span>
                  <span className="inline-block pl-1.5 pr-2">
                    <XCircleIcon className="h-4 w-4 text-slate-400 group-hover:text-error" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <span className="inline-block text-slate-500 py-2">{label}</span>
        )}
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <SelectorIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </span>
    </ComboBox.Button>
  )
}

const ComboBoxFilterQueryInputButton: React.FC<ComboBoxFilterQueryInputButtonProps> = ({ onFilterQueryChange }) => {
  return (
    <>
      <ComboBox.Input
        className="w-full fx-input-border py-2 pl-3 pr-10 text-slate-900"
        onChange={onFilterQueryChange}
        placeholder="Select Option&hellip;"
        // displayValue={(items: Thing[]) => items.map((item) => item.name).join(', ')}
      />
      <ComboBox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
        <SelectorIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </ComboBox.Button>
    </>
  )
}

// @todo even tighter generics + types for FormMultiComboBox
export const FormMultiComboBox: React.FC<FormMultiComboBoxProps> = ({ label, options, ...restReactHookFormProps }) => {
  const [filterQuery, setFilterQuery] = useState<string>('')
  const [stableOptions, setStableOptions] = useState<FormMultiComboBoxOption[]>(options)

  const {
    field,
    // field: { name, value, onChange, onBlur, ref },
    // fieldState: { isTouched, isDirty }, // reminder - `invalid` is deprecated
    // formState: { touchedFields, dirtyFields },
  } = useController(restReactHookFormProps) // { name, control, rule, defaultValue }

  useEffect(() => {
    // interestingly it seems headlessui does a literal compare on field value vs. options to determine 'selected'
    // so a stable reference that matches any field values vs. the available options list 1:1 is required in order for
    // the selected property to be correctly set -- otherwise the dropdown does not show already-selected options as selected
    // and this will result in a duplicate key violation (among other problems) if the user selects a selected item vs. expected deselect behavior
    //
    // one alternative is to always use primitive values such as id/uuid with headlessui but this can make things less flexible
    const matched: FormMultiComboBoxOption[] = options.map((option) => {
      const fieldMatchedOption = (field.value as FormMultiComboBoxOption[]).find((item) => item.uuid === option.uuid)
      return fieldMatchedOption ?? option
    })

    setStableOptions(matched)
  }, [options, field.value])

  // const filteredItems: FormMultiComboBoxOption[] =
  //   filterQuery === ''
  //     ? options
  //     : options.filter((item) => {
  //         return item.name.toLowerCase().includes(filterQuery.toLowerCase())
  //       })

  const filteredItems: FormMultiComboBoxOption[] =
    filterQuery === ''
      ? stableOptions
      : stableOptions.filter((item) => {
          return item.name.toLowerCase().includes(filterQuery.toLowerCase())
        })

  const handleFilterQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(event.target.value)
  }

  const handleDeselectItem =
    (uuid: string): React.MouseEventHandler =>
    (event: React.MouseEvent) => {
      event.stopPropagation()
      field.onChange(field.value.filter((item: ApiObject) => item.uuid !== uuid))
    }

  console.log('field.value', field.value)
  return (
    <ComboBox
      ref={field.ref} // ref enables react-hook-form to focus on input on error (@todo check if headless indeed forwards to underlying input)
      as="div"
      className="space-y-1"
      multiple
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      // defaultValue={field.value}
      disabled={false}
    >
      <div className="relative">
        {/* <SelectedItemsCommaList selectedItems={field.value} /> */}
        <div className="relative w-full cursor-default bg-white text-left text-base">
          <ComboBoxItemsButton label={label} selectedItems={field.value} onItemDeselect={handleDeselectItem} />
          {false && ( // alternate style with text input for search filter:
            <ComboBoxFilterQueryInputButton onFilterQueryChange={handleFilterQueryChange} />
          )}
        </div>
        <Transition
          as={React.Fragment}
          unmount={false}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setFilterQuery('')}
        >
          <ComboBox.Options
            // static
            className={clsx(
              'absolute mt-1 max-h-60 w-full overflow-auto rounded-md py-1',
              'sm:text-sm bg-white shadow-lg',
              'ring-1 ring-slate-300 focus:outline-none',
            )}
          >
            {filteredItems.length === 0 && filterQuery !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-slate-700">
                {LABELS.NO_FILTER_QUERY_MATCHES_FOUND}
              </div>
            ) : (
              filteredItems.map((item) => (
                <ComboBox.Option
                  key={item.uuid}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-10 pr-4 overflow-hidden',
                      active ? 'bg-blue-600 text-white' : 'text-slate-900',
                    )
                  }
                  value={item}
                >
                  {({ active, selected }) => (
                    <>
                      <span className={clsx('block truncate', selected ? 'font-medium' : 'font-normal')}>
                        {item.name}
                      </span>
                      {selected ? (
                        <span
                          className={clsx(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-white' : 'text-blue-600',
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : (
                        <span
                          className={clsx(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-white' : 'text-slate-200',
                          )}
                        >
                          <PlusIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </ComboBox.Option>
              ))
            )}
          </ComboBox.Options>
        </Transition>
      </div>
    </ComboBox>
  )
}
