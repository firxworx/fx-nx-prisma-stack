import clsx from 'clsx'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  appendClassName?: string
}

/**
 * Animated loading spinner implemented with svg + css animation, adapted from an example
 * in the tailwindcss documentation for its 'animate' utilities.
 *
 * Specify `size` 'sm', 'md' (default), or 'lg'. They are respectively 5, 6, and 8 tailwind units.
 *
 * Provide additional classNames with the `appendClassName` prop, which is useful for customizing
 * the color of the spinner (e.g `text-slate-500`).
 */
export const Spinner: React.FC<SpinnerProps> = ({ size, appendClassName }) => {
  return (
    <div className="flex items-center" role="status" aria-label="Loading...">
      <svg
        className={clsx(
          'animate-spin',
          {
            'h-5 w-5': size === 'sm',
            'h-6 w-6': size === 'md',
            'h-8 w-8': size === 'lg',
          },
          appendClassName,
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

Spinner.defaultProps = {
  size: 'md',
  appendClassName: 'text-slate-500',
}
