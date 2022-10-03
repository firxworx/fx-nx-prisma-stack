import React from 'react'
import clsx from 'clsx'

import { BarsArrowDownIcon, BarsArrowUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { DropDownMenu } from '../menus/DropDownMenu'

export interface SearchSortInputProps {
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
const SortMenuButton: React.FC = React.forwardRef<HTMLButtonElement>(function SortMenuButton(props, forwardRef) {
  return (
    <button
      ref={forwardRef}
      type="button"
      className={clsx(
        'relative -ml-px flex items-center',
        'min-h-full', // important for full height within parent SearchSortInput
        'rounded-r-md border border-slate-300 bg-slate-50',
        'px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100',
        'fx-focus-ring-form focus:bg-sky-50',
      )}
      {...props}
    >
      <BarsArrowUpIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      <span className="ml-2 text-slate-600">{LABELS.SORT}</span>
      <ChevronDownIcon className="ml-2.5 -mr-1.5 h-5 w-5 text-slate-400" aria-hidden="true" />
    </button>
  )
})

/**
 * Search + sort input component.
 *
 * Ref is forwarded to the underlying search input element.
 */
export const SearchSortInput: React.FC<SearchSortInputProps> = React.forwardRef<HTMLInputElement, SearchSortInputProps>(
  function SearchSortInput({ label, placeholder, onSearchInputChange, onSortAscClick, onSortDescClick }, forwardRef) {
    return (
      <div className="max-w-lg">
        <label htmlFor="list-search-sort" className="sr-only">
          {label}
        </label>
        <div className="flex rounded-md shadow-sm">
          <div className="relative flex-grow focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              ref={forwardRef}
              type="text"
              name="list-search-sort"
              id="list-search-sort"
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
  },
)
