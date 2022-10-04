import React, { useId } from 'react'
import clsx from 'clsx'

import { BarsArrowDownIcon, BarsArrowUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { DropDownMenu } from '../menus/DropDownMenu'

export interface SearchSortInputProps {
  id?: string
  name?: string
  label: string
  placeholder: string
  onSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSortAscClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
  onSortDescClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

const LABELS = {
  SORT: 'Sort',
  SORT_ASCENDING: 'Sort A-Z Ascending',
  SORT_DESCENDING: 'Sort Z-A Descending',
}

/**
 * Sort menu button to activate the sort options dropdown of its parent `SearchSortInput` component.
 *
 * Ref + props are forwarded to the underlying button element to facilitate integration with third-party libraries
 * including @headlessui/react.
 *
 * @see SearchSortInput
 */
const SortMenuButton = React.forwardRef<HTMLButtonElement>(function SortMenuButton(props, forwardRef) {
  return (
    <button
      ref={forwardRef}
      type="button"
      className={clsx(
        'group relative -ml-px flex items-center px-4 py-2 border rounded-r-md',
        'min-h-full', // important for full height within parent SearchSortInput
        'border-slate-300 bg-slate-50 hover:bg-slate-100 focus:bg-sky-50',
        'text-sm font-medium text-slate-700 hover:text-brand-primary-darker focus:text-brand-primary-darker',
        'fx-focus-ring-form',

        // custom tailwindcss variants courtesy of the plugin `@headlessui/tailwindcss`
        'ui-open:bg-sky-50 ui-open:text-slate-400',
        'ui-open:outline-none ui-open:border-slate-300 ui-open:ring-2 ui-open:ring-sky-100',
      )}
      {...props}
    >
      <BarsArrowUpIcon className="h-5 w-5 text-slate-400 ui-open:text-slate-400/60" aria-hidden="true" />
      <span className="ml-2 text-slate-600 ui-open:text-slate-500/80">{LABELS.SORT}</span>
      <ChevronDownIcon className="ml-2.5 -mr-1.5 h-5 w-5 text-slate-400 ui-open:text-slate-400/60" aria-hidden="true" />
    </button>
  )
})

/**
 * Search + sort input component.
 *
 * Ref is forwarded to the underlying search input element.
 */
export const SearchSortInput = React.forwardRef<HTMLInputElement, SearchSortInputProps>(function SearchSortInput(
  { id, name, label, placeholder, onSearchInputChange, onSortAscClick, onSortDescClick },
  forwardRef,
) {
  const safeId = useId()
  const searchInputId = id ?? safeId

  return (
    <div className="max-w-lg">
      <label htmlFor="list-search-sort" className="sr-only">
        {label}
      </label>
      <div className="flex rounded-md shadow-sm">
        <div className="group relative flex-grow focus-within:z-10">
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
              'text-slate-400 group-focus-within:text-brand-primary-darkest/70 transition-colors',
            )}
          >
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <input
            ref={forwardRef}
            type="search"
            id={searchInputId}
            name={name ?? 'list-search-sort'}
            className={clsx(
              // note: .fx-focus-ring is overridden due to specificity so explicit classes added below for now
              'block w-full pl-10 rounded-none rounded-l-md border-slate-300',
              'placeholder:tracking-tight',
              'focus:outline-none focus:ring-2 focus:border-slate-300 focus:ring-sky-100',
              'text-slate-800',
            )}
            placeholder={placeholder}
            spellCheck={false}
            onChange={onSearchInputChange}
          />
        </div>
        <DropDownMenu
          items={[
            {
              label: LABELS.SORT_ASCENDING,
              SvgIcon: BarsArrowUpIcon,
              onClick: onSortAscClick,
            },
            {
              label: LABELS.SORT_DESCENDING,
              SvgIcon: BarsArrowDownIcon,
              onClick: onSortDescClick,
            },
          ]}
          MenuButton={SortMenuButton}
        />
      </div>
    </div>
  )
})
