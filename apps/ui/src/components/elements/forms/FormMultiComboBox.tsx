import React, { useCallback, useEffect, useState } from 'react'
import { Combobox as ComboBox, Transition } from '@headlessui/react'
import { useController, UseControllerProps } from 'react-hook-form'
import clsx from 'clsx'

import { CheckIcon, PlusIcon, XCircleIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

const LABELS = {
  NO_FILTER_QUERY_MATCHES_FOUND: 'No matches found',
}

export interface FormMultiComboBoxOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface FormMultiComboBoxProps extends UseControllerProps {
  label: string
  options: FormMultiComboBoxOption[]
  hideLabel?: boolean
  disabled?: boolean // currently not part of react-hook-form useController/Controller
  appendClassName?: string
}

export interface ComboBoxItemsButtonProps {
  label: string
  selectedItems: FormMultiComboBoxOption[] | undefined
  disabled?: boolean
  onItemDeselect: (value: string | number) => React.MouseEventHandler
}

export interface ComboBoxFilterQueryInputButtonProps {
  disabled?: boolean
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

interface ComboBoxSelectedItemPillProps {
  item: FormMultiComboBoxOption
  disabled?: boolean
  onItemDeselect: (value: string | number) => React.MouseEventHandler
}

const ComboBoxSelectedItemPill: React.FC<ComboBoxSelectedItemPillProps> = ({ item, disabled, onItemDeselect }) => {
  return (
    <button
      type="button"
      className={clsx(
        'group inline-flex items-center text-slate-800 bg-slate-200 transition-colors py-1.5 pl-2 leading-none rounded-md text-sm fx-focus-ring',
        {
          ['hover:text-slate-700 hover:bg-error-200']: !disabled,
        },
      )}
      onClick={onItemDeselect(item.value)}
      disabled={disabled}
    >
      <span className="inline-block flex-1">{item.label}</span>
      <span className="inline-block pl-1.5 pr-2">
        <XCircleIcon
          className={clsx('h-4 w-4 text-slate-400 pt-0.5', { ['group-hover:text-error']: !disabled })}
          aria-hidden="true"
        />
      </span>
    </button>
  )
}

const ComboBoxItemsButton: React.FC<ComboBoxItemsButtonProps> = ({
  label,
  selectedItems,
  disabled,
  onItemDeselect,
}) => {
  return (
    <ComboBox.Button
      as="div"
      // headlessui current version overrides the ComboBox.Button tabIndex to -1 in the source...
      tabIndex={0}
      className={clsx(
        'relative w-full cursor-default pl-3 pr-10',
        'fx-input-border fx-focus-ring',
        'text-left bg-white',
        // 'focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300',
      )}
    >
      <span className="block">
        {!!(selectedItems && selectedItems.length) ? (
          <ul className={clsx('inline-flex space-x-2 list-none py-1.5', { ['opacity-70']: disabled })}>
            {selectedItems.map((item) => (
              <li key={`${item.value}-${item.label}`}>
                <ComboBoxSelectedItemPill item={item} onItemDeselect={onItemDeselect} />
              </li>
            ))}
          </ul>
        ) : (
          <span className="inline-block text-slate-500 py-2">{label}</span>
        )}
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronUpDownIcon
          className={clsx('h-5 w-5 text-slate-400', {
            ['group-hover:text-slate-600 group-active:text-slate-800']: !!(selectedItems && selectedItems.length),
          })}
          aria-hidden="true"
        />
      </span>
    </ComboBox.Button>
  )
}

const ComboBoxFilterQueryInputButton: React.FC<ComboBoxFilterQueryInputButtonProps> = ({
  disabled,
  onFilterQueryChange,
}) => {
  return (
    <>
      <ComboBox.Input
        className="w-full fx-input-border fx-focus-ring py-2 pl-3 pr-10 text-slate-900"
        onChange={onFilterQueryChange}
        placeholder="Select Option&hellip;"
        disabled={disabled}
        // displayValue={(items: FormMultiComboBoxOption[]) => items.map((item) => item.name).join(', ')}
      />
      <ComboBox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </ComboBox.Button>
    </>
  )
}

export interface ComboBoxFilterQuerySelectionButtonProps {
  label: string
  selectedItems: FormMultiComboBoxOption[]
  disabled?: boolean
  onFilterQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onItemDeselect: (value: string | number) => React.MouseEventHandler
}

/**
 * WIP MultiSelect type component w/ `ComboBoxSelectedItemPill` pills to remove selections.
 * @param param0
 * @returns
 */
const ComboBoxFilterQuerySelectionButton: React.FC<ComboBoxFilterQuerySelectionButtonProps> = ({
  // label,
  selectedItems,
  disabled,
  onFilterQueryChange,
  onItemDeselect,
}) => {
  return (
    <div className="relative flex fx-input-border" tabIndex={0}>
      <div className="flex flex-wrap flex-1 space-x-2 py-2 px-3">
        {!!selectedItems.length && (
          <ul className={clsx('inline-flex space-x-2 list-none py-1.5', { ['opacity-70']: disabled })}>
            {selectedItems.map((item) => (
              <li key={`${item.value}-${item.label}`}>
                <ComboBoxSelectedItemPill item={item} onItemDeselect={onItemDeselect} />
              </li>
            ))}
          </ul>
        )}
        <ComboBox.Input
          className={clsx(
            'fx-custom-input fx-focus-ring fx-input-border',
            'flex-1 min-w-1/4 py-2 pl-3 pr-10',
            'border border-slate-200 text-slate-900',
          )}
          onChange={onFilterQueryChange}
          placeholder="Select Option&hellip;"
          disabled={disabled}
        />
      </div>
      <ComboBox.Button
        // className="absolute inset-y-0 right-0 flex items-center pr-2"
        className="flex items-center pr-2"
      >
        <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </ComboBox.Button>
    </div>
  )
}

/**
 * **WIP** yet somewhat functional multi-select combo box component compatible with react-hook-form.
 *
 * Has a few UI/UX ideas in it such as showing selections in 'pill' style w/ deselect.
 *
 * @todo push for even tighter generics + types for FormMultiComboBox
 * @todo
 */
export const FormMultiComboBox: React.FC<FormMultiComboBoxProps> = ({
  label,
  options,
  hideLabel,
  disabled,
  appendClassName,
  ...restReactHookFormProps
}) => {
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
      const fieldMatchedOption = ((field.value ?? []) as FormMultiComboBoxOption[]).find(
        (item) => item.value === option.value,
      )
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
          return item.label.toLowerCase().includes(filterQuery.toLowerCase())
        })

  const handleFilterQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(event.target.value)
  }

  const handleDeselectItem = useCallback(
    (value: string | number): React.MouseEventHandler =>
      (event: React.MouseEvent) => {
        event.stopPropagation()
        field.onChange(field.value.filter((item: FormMultiComboBoxOption) => item.value !== value))
      },
    [field.onChange, field.value],
  )

  return (
    <ComboBox
      ref={field.ref} // ref enables react-hook-form to focus on input on error (@todo check if headless indeed forwards to underlying input)
      as="div"
      className={clsx('group w-full', appendClassName)}
      multiple
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      // defaultValue={field.value}
      disabled={disabled}
    >
      <div className="relative">
        <ComboBox.Label className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>{label}</ComboBox.Label>
        {/* <SelectedItemsCommaList selectedItems={field.value} /> */}
        <div className="relative w-full cursor-default bg-white text-left text-base">
          {true && ( // original contender for the ui element:
            <ComboBoxItemsButton
              label={label}
              selectedItems={field.value}
              disabled={disabled}
              onItemDeselect={handleDeselectItem}
            />
          )}
          {false && ( // alternate style with text input for search filter:
            <ComboBoxFilterQueryInputButton onFilterQueryChange={handleFilterQueryChange} />
          )}
          {false && ( // new wip for a MultiSelect
            <ComboBoxFilterQuerySelectionButton
              label={label}
              selectedItems={field.value}
              disabled={disabled}
              onItemDeselect={handleDeselectItem}
              onFilterQueryChange={handleFilterQueryChange}
            />
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
                  key={`${item.value}-${item.label}`}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-10 pr-4 overflow-hidden',
                      active ? 'bg-blue-600 text-white' : 'text-palette-form-input',
                    )
                  }
                  value={item}
                >
                  {({ active, selected }) => (
                    <>
                      <span className={clsx('block truncate', selected ? 'font-medium' : 'font-normal')}>
                        {item.label}
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
