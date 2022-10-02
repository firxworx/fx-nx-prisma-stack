import React, { ElementType } from 'react'
import clsx from 'clsx'
import { Menu, Transition } from '@headlessui/react'

import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

export interface DropDownMenuItem {
  label: string
  SvgIcon?: React.FC<React.ComponentProps<'svg'>>
  onClick: React.MouseEventHandler<HTMLAnchorElement>
}

export interface DropDownMenuProps {
  /** Dropdown menu items. */
  items: DropDownMenuItem[]

  /**
   * Optional button component to use as the menu toggle button.
   * If this prop is not provided, a general "triple vertical dot" menu button is rendered.
   *
   * Custom buttons must be implemented with `React.forwardRef()` + spread all props on the inner
   * button element so this component's underlying `Menu` from @headlessui/react can add necessary
   * event handlers, aria attributes, etc.
   */
  MenuButton?: ElementType

  /** Override generic defaults for labels/captions/etc related to accessibility. */
  a11y?: {
    menuButtonCaption?: string
  }
}

const menuButtonClassName = clsx(
  'flex items-center p-2 rounded-md border',
  'text-slate-400 hover:text-brand-primary-darkest',
  'fx-focus-ring-form hover:bg-slate-50 hover:border-brand-primary-darker/30',
  'border-slate-300 text-sm bg-white',
  'transition-colors focus:bg-sky-50 focus:text-brand-primary-darker',

  // custom variants provided via plugin `@headlessui/tailwindcss`
  'ui-open:bg-sky-50 ui-open:text-slate-400',
  'ui-open:outline-none ui-open:border-slate-300 ui-open:ring-2 ui-open:ring-sky-100',
)

const LABELS = {
  A11Y_DEFAULT_DROP_MENU_BUTTON: 'Open menu',
}

/**
 * Dropdown menu component implemented using `Menu` from the @headlessui/react library.
 *
 * A custom menu button component can be supplied via props, otherwise a "triple vertical dot" icon button
 * is used to toggle the menu.
 */
export const DropDownMenu: React.FC<DropDownMenuProps> = ({ a11y, items, MenuButton }) => {
  // noting an example in a GitHub issue by maintainer used the following vs <Menu.Button as={MenuButton} />
  // <Menu.Button as={React.Fragment}>
  //   <MenuButton />
  // </Menu.Button>

  return (
    <Menu
      as="div"
      className="relative inline-block" // block vs flexbox for more reliable positioning of absolute menu
    >
      {MenuButton ? (
        <Menu.Button as={MenuButton} />
      ) : (
        <Menu.Button className={menuButtonClassName}>
          <span className="sr-only">{a11y?.menuButtonCaption ?? LABELS.A11Y_DEFAULT_DROP_MENU_BUTTON}</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      )}

      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md',
            'bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            'text-left',
          )}
        >
          <div className="py-1 text-sm font-normal">
            {items.map((item) => (
              <Menu.Item key={item.label}>
                {({ active }): JSX.Element => (
                  <a
                    className={clsx(
                      'flex items-center px-4 py-2',
                      active ? 'bg-slate-100 text-slate-900' : 'text-slate-700',
                    )}
                    onClick={item.onClick}
                  >
                    {!!item.SvgIcon && (
                      <item.SvgIcon
                        className={clsx('mr-3 h-5 w-5 text-slate-400', {
                          ['text-brand-primary/100']: active,
                        })}
                        aria-hidden="true"
                      />
                    )}
                    <span className="leading-none">{item.label}</span>
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
