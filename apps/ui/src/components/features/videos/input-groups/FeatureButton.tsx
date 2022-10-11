import clsx from 'clsx'

export interface FeatureButtonProps extends Exclude<React.HTMLAttributes<HTMLButtonElement>, 'className'> {
  appendClassName?: string
}

/**
 * Smaller less-emphasized button for use in features.
 * Gray border with primary darker text, with evolved focus styling.
 */
export const FeatureButton: React.FC<React.PropsWithChildren<FeatureButtonProps>> = ({
  appendClassName,
  children,
  ...buttonProps
}) => {
  return (
    <button
      type="button"
      className={clsx(
        'hidden xs:inline-flex items-center px-4 py-2 rounded-md border bg-white',
        'font-medium tracking-tight text-brand-primary-darkest shadow-sm',
        'fx-focus-ring-form hover:bg-slate-50 hover:border-brand-primary-darker/30',
        'border-slate-300 text-sm',
        'transition-colors focus:bg-sky-50 focus:text-brand-primary-darker',
        appendClassName,
      )}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
