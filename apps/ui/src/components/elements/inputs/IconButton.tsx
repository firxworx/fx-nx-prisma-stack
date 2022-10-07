import React from 'react'
import clsx from 'clsx'

export interface IconButtonProps extends Exclude<React.ComponentPropsWithRef<'button'>, 'type' | 'className'> {
  a11y?: {
    label: string
  }
  SvgIcon: React.FC<React.ComponentProps<'svg'>>
  appendClassName?: string
}

const className = clsx(
  'group flex items-center p-2 rounded-md border',
  'text-action-primary hover:text-action-primary-hover',
  'fx-focus-ring-form focus:shadow-sm hover:shadow-sm hover:bg-slate-50 hover:border-action-primary-alpha',
  'border-slate-300 text-sm bg-white/75',
  'transition-colors focus:bg-slate-50 focus:text-action-primary',

  // custom variants provided via plugin `@headlessui/tailwindcss`
  // 'ui-open:bg-sky-50 ui-open:text-slate-400',
  // 'ui-open:outline-none ui-open:border-slate-300 ui-open:ring-2 ui-open:ring-sky-100',
)

/**
 * Button that renders with the given `SvgIcon` inside.
 * Intended for menu, options, etc. buttons.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { SvgIcon, a11y, appendClassName, ...restButtonProps },
  forwardedRef,
) {
  return (
    <button ref={forwardedRef} type="button" className={clsx(className, appendClassName)} {...restButtonProps}>
      {!!a11y?.label && <span className="sr-only">{a11y.label}</span>}
      <SvgIcon
        className={clsx(
          'w-5 h-5 transition-colors',
          'text-slate-700 group-hover:text-action-primary-hover group-focus:text-action-primary-hover',
        )}
        aria-hidden="true"
      />
    </button>
  )
})
