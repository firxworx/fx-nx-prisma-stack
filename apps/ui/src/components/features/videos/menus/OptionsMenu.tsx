import React from 'react'
import clsx from 'clsx'
import { Menu, Transition } from '@headlessui/react'

import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

export interface OptionsMenuItem {
  label: string
  SvgIcon?: React.FC<React.ComponentProps<'svg'>>
  onClick: React.MouseEventHandler<HTMLAnchorElement>
}

export interface OptionsMenuProps {
  items: OptionsMenuItem[]
}

// mock data used in dev - keep around for future storybook/testing/etc per roadmap
// export const optionsMenuDummyProps: OptionsMenuProps = {
//   items: [
//     {
//       label: 'Add to Favorites',
//       SvgIcon: StarIcon,
//       onClick: (): void => alert('favorite'),
//     },
//     {
//       label: 'Embed',
//       SvgIcon: CodeBracketIcon,
//       onClick: (): void => alert('embed'),
//     },
//     {
//       label: 'Report Content',
//       SvgIcon: FlagIcon,
//       onClick: (): void => alert('report'),
//     },
//   ],
// }

const menuButtonClassName = clsx(
  'flex items-center p-2 rounded-md border',
  'text-slate-400 hover:text-brand-primary-darkest', // hover:text-slate-600
  'fx-focus-ring-form hover:bg-slate-50 hover:border-brand-primary-darker/30',
  'border-slate-300 text-sm bg-white',
  'transition-colors focus:bg-sky-50 focus:text-brand-primary-darker',

  // custom tailwindcss variants courtesy of the plugin `@headlessui/tailwindcss`
  'ui-open:bg-sky-50 ui-open:text-slate-400',
  'ui-open:outline-none ui-open:border-slate-300 ui-open:ring-2 ui-open:ring-sky-100',
)

/*
// considering menu button variant that says 'BUTTON' in caps in it...
<Menu.Button className={menuButtonClassName}>
  <span className="sr-only">Open options menu</span>
  <span className="uppercase text-xs mr-1 pl-1.5">Menu</span>
  <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
</Menu.Button>
*/

/*
// original tailwindui is hidden round w/ padding for tap target w/ compensating negative margin
<Menu.Button className="-m-2 flex items-center rounded-full p-2 text-slate-400 hover:text-slate-600">
  <span className="sr-only">Open options menu</span>
  <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
</Menu.Button>
*/

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ items }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className={menuButtonClassName}>
        <span className="sr-only">Open options menu</span>
        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {items.map((item) => (
              <Menu.Item key={item.label}>
                {({ active }): JSX.Element => (
                  <a
                    className={clsx(
                      'flex items-center px-4 py-2 text-sm',
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
