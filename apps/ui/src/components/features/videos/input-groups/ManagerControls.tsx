import clsx from 'clsx'
import { SearchSortInput } from './SearchSortInput'

export interface ManagerControlsProps {
  labels: {
    search: {
      inputLabel: string
      inputPlaceholder: string
    }
    actions: {
      addButtonCaption: string
    }
  }
  onAddClick: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * Top control/action bar for groups of items (e.g. Videos, Video Groups) featuring a `SearchSortInput`
 * and an 'Add Item' button.
 */
export const ManagerControls: React.FC<ManagerControlsProps> = ({ labels, onAddClick }) => {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1 md:mt-0">
        <SearchSortInput label={labels.search.inputLabel} placeholder={labels.search.inputPlaceholder} />
      </div>
      <div className="flex md:mt-0 md:ml-4">
        <button
          type="button"
          className={clsx(
            'inline-flex items-center px-4 py-2 rounded-md border bg-white',
            'font-medium tracking-tight text-brand-primary-darkest shadow-sm', // text-slate-700
            'fx-focus-ring-form hover:bg-slate-100 hover:border-brand-primary',
            'border-slate-300',
            // 'border-brand-primary',
            'transition-colors focus:bg-sky-50 focus:text-brand-primary-darker',
          )}
          onClick={onAddClick}
        >
          {labels.actions.addButtonCaption}
        </button>
        {/* <button
          type="button"
          className={clsx(
            'ml-3 inline-flex items-center px-4 py-2 rounded-md border border-transparent',
            'font-medium tracking-tight text-white shadow-sm',
            'fx-focus-ring-form hover:bg-brand-primary-darkest',
            'transition-colors bg-brand-primary-darker',
            'focus:text-sky-100',
          )}
        >
          Add Video
        </button> */}
      </div>
    </div>
  )
}
