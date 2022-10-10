import React from 'react'
import clsx from 'clsx'

export interface IconButtonProps extends Exclude<React.ComponentPropsWithRef<'button'>, 'type' | 'className'> {
  /**
   * Set labels for screenreaders.
   */
  a11y?: {
    label?: string
  }

  /**
   * Set variant 'primary' for a darker icon (e.g. main navigation) and 'secondary' for a lighter icon (e.g. options).
   */
  variant?: 'primary' | 'secondary'

  /**
   * React function component representation of an `<svg>...</svg>` icon.
   */
  SvgIcon: React.FC<React.ComponentProps<'svg'>>

  appendClassName?: string
  appendIconClassName?: string
}

const className = clsx(
  'group flex items-center p-2 rounded-md border',
  'text-action-primary hover:text-action-primary-hover',
  'fx-focus-ring-form focus:shadow-sm hover:shadow-sm hover:bg-slate-50 hover:border-action-primary-alpha',
  'border-slate-300 text-sm bg-white/75',
  'transition-colors focus:bg-slate-50 focus:text-action-primary',
  {
    'group-hover:bg-slate-50 group-hover:border-action-primary-alpha': true,
  },

  // custom variants provided via plugin `@headlessui/tailwindcss`
  // 'ui-open:bg-sky-50 ui-open:text-slate-400',
  // 'ui-open:outline-none ui-open:border-slate-300 ui-open:ring-2 ui-open:ring-sky-100',
)

/**
 * Button that renders with the provided `SvgIcon` inside and using palette consistent with project look-and-feel.
 * Intended for icon buttons that toggle menus, options, etc.
 *
 * Set `variant` 'primary' for a darker icon (e.g. primary navigation menu) and 'secondary' for a lighter icon
 * (e.g. options menu within a list of items). Defaults to 'primary'.
 *
 * The optional `appendClassName` and `appendIconClassName` props are respectively applied to the parent button
 * element and the svg icon. These are intended for setting custom margins + spacing vs. palette; take care to avoid
 * style/class conflicts.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant, SvgIcon, a11y, appendClassName, appendIconClassName, ...restButtonProps },
  forwardedRef,
) {
  return (
    <button ref={forwardedRef} type="button" className={clsx(className, appendClassName)} {...restButtonProps}>
      {!!a11y?.label && <span className="sr-only">{a11y.label}</span>}
      <SvgIcon
        className={clsx(
          'w-5 h-5 transition-colors',
          'group-hover:text-action-primary-hover group-focus:text-action-primary-hover',
          {
            ['text-slate-700']: variant === 'primary',
            ['text-slate-400']: variant === 'secondary',
          },
          appendIconClassName,
        )}
        aria-hidden="true"
      />
    </button>
  )
})

IconButton.defaultProps = {
  variant: 'primary',
}
