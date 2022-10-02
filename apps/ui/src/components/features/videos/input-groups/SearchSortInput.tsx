import clsx from 'clsx'

import { BarsArrowUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'

export interface SearchSortInputProps {
  label: string
  placeholder: string
}

const LABELS = {
  SORT: 'Sort',
}

/**
 * Standalone search input with sort.
 *
 * @todo implement sort dropdown + actions.
 */
export const SearchSortInput: React.FC<SearchSortInputProps> = ({ label, placeholder }) => {
  return (
    <div className="max-w-lg">
      <label htmlFor="mobile-search-sort" className="sr-only">
        {label}
      </label>
      <label htmlFor="desktop-search-sort" className="sr-only">
        {placeholder}
      </label>
      <div className="flex rounded-md shadow-sm">
        <div className="relative flex-grow focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="mobile-search-sort"
            id="mobile-search-sort"
            className={clsx(
              'block sm:hidden w-full pl-10 rounded-none rounded-l-md border-slate-300',
              'placeholder:tracking-tight', // fx-focus-ring form fails re specificity??
              'focus:outline-none focus:ring-2 focus:border-slate-300 focus:ring-sky-100',
              'text-slate-800',
              // 'focus:border-indigo-500 focus:ring-indigo-500',
            )}
            placeholder="Search"
          />
          <input
            type="text"
            name="desktop-search-sort"
            id="desktop-search-sort"
            className={clsx(
              'hidden sm:block w-full pl-10 rounded-none rounded-l-md border-slate-300',
              'placeholder:tracking-tight', // fx-focus-ring form fails re specificity??
              'focus:outline-none focus:ring-2 focus:border-slate-300 focus:ring-sky-100',
              'text-slate-800',
            )}
            placeholder="Search"
          />
        </div>
        <button
          type="button"
          className={clsx(
            'relative -ml-px inline-flex items-center',
            'rounded-r-md border border-slate-300 bg-slate-50',
            'px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100',
            'fx-focus-ring-form focus:bg-sky-50',
          )}
        >
          <BarsArrowUpIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <span className="ml-2 text-slate-600">{LABELS.SORT}</span>
          <ChevronDownIcon className="ml-2.5 -mr-1.5 h-5 w-5 text-slate-400" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
