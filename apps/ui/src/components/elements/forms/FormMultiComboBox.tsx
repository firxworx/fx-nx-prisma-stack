import React, { useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { SelectorIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import { CheckIcon, PlusIcon, XCircleIcon, XIcon } from '@heroicons/react/solid'

interface Thing {
  uuid: string
  name: string
}

const things: Thing[] = [
  { uuid: 'asdf', name: 'Wade Cooper' },
  { uuid: 'fsda', name: 'Arlene Mccoy' },
  { uuid: 'dddv', name: 'Devon Webb' },
  { uuid: 'fddd', name: 'Tom Cook' },
  { uuid: 'dfew', name: 'Tanya Fox' },
  { uuid: 'schm', name: 'Hellen Schmidt' },
]

const COPY = {
  NO_FILTER_QUERY_MATCHES_FOUND: 'No matches found',
}

export interface FormMultiComboBoxProps {}

export interface ComboBoxItemsButtonProps {
  label: string
  selectedItems: Thing[]
  onItemDeselect: (uuid: string) => React.MouseEventHandler
}

export interface ComboBoxFilterQueryInputButtonProps {
  onFilterQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

// dev/debug
// const SelectedItemsCommaList: React.FC<{ selectedItems: Thing[] }> = ({ selectedItems }) => {
//   return (
//     <div className="text-sm">
//       {selectedItems.length > 0 && <span>Selected items: {selectedItems.map((item) => item.name).join(', ')}</span>}
//     </div>
//   )
// }

const ComboBoxItemsButton: React.FC<ComboBoxItemsButtonProps> = ({ label, selectedItems, onItemDeselect }) => {
  return (
    <Combobox.Button
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
    </Combobox.Button>
  )
}

const ComboBoxFilterQueryInputButton: React.FC<ComboBoxFilterQueryInputButtonProps> = ({ onFilterQueryChange }) => {
  return (
    <>
      <Combobox.Input
        className="w-full fx-input-border py-2 pl-3 pr-10 text-slate-900"
        onChange={onFilterQueryChange}
        placeholder="Select Option&hellip;"
        // displayValue={(items: Thing[]) => items.map((item) => item.name).join(', ')}
      />
      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
        <SelectorIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </Combobox.Button>
    </>
  )
}

export const FormMultiComboBox: React.FC<FormMultiComboBoxProps> = () => {
  const [selectedItems, setSelectedItems] = useState<Thing[]>([])
  const [filterQuery, setFilterQuery] = useState<string>('')

  const filteredItems =
    filterQuery === ''
      ? things
      : things.filter((item) => {
          return item.name.toLowerCase().includes(filterQuery.toLowerCase())
        })

  const handleFilterQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(event.target.value)
  }

  const handleDeselectItem =
    (uuid: string): React.MouseEventHandler =>
    (event: React.MouseEvent) => {
      event.stopPropagation()
      setSelectedItems((prevSelectedItems) => prevSelectedItems.filter((item) => item.uuid !== uuid))
    }

  return (
    <Combobox
      as="div"
      className="space-y-1"
      multiple
      value={selectedItems}
      onChange={setSelectedItems}
      disabled={false}
    >
      <div className="relative">
        <div className="relative w-full cursor-default bg-white text-left text-base">
          <ComboBoxItemsButton label="Video Groups" selectedItems={selectedItems} onItemDeselect={handleDeselectItem} />
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
          <Combobox.Options
            // static
            className={clsx(
              'absolute mt-1 max-h-60 w-full overflow-auto rounded-md py-1',
              'sm:text-sm bg-white shadow-lg',
              'ring-1 ring-slate-300 focus:outline-none',
            )}
          >
            {filteredItems.length === 0 && filterQuery !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-slate-700">
                {COPY.NO_FILTER_QUERY_MATCHES_FOUND}
              </div>
            ) : (
              filteredItems.map((item) => (
                <Combobox.Option
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
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}
