import React, { Fragment, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Menu, Transition } from '@headlessui/react'
import clsx from 'clsx'

export interface UserProfileMenuProps {
  name: string
}

const menuItems = ['My Profile', 'Settings', 'Sign-Out'] as const

/**
 * Drop-down menu (for desktop viewports) with options relevant to the user's session + preferences,
 * including sign-out.
 *
 * The first initial is rendered inside an avatar-esque circle.
 */
export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ name }) => {
  const router = useRouter()

  const handleMenuItemClick = useCallback(
    (item: typeof menuItems[number]) => (_event: React.MouseEvent<HTMLButtonElement>) => {
      switch (item) {
        case 'My Profile': {
          router.push('/app/profile')
          break
        }
        case 'Settings': {
          router.push('/app/settings')
          break
        }
        case 'Sign-Out': {
          alert('sign-out') // @todo sign out from SessionMenu
        }
      }
      router.push(router.pathname, router.asPath)
    },
    [router],
  )

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={clsx(
          'flex items-center justify-center w-10 h-10 border-2 rounded-full',
          'text-sm font-normal text-slate-700',
          'bg-slate-100 border-slate-200 hover:bg-slate-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-100',
        )}
      >
        <span className="inline-block leading-none">{name.charAt(0).toUpperCase()}</span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute right-0 w-40 mt-1 z-30 origin-top-right overflow-hidden rounded-md',
            'bg-white shadow-lg text-base text-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-100',
          )}
        >
          <div className="divide-y divide-slate-200">
            {menuItems.map((item) => (
              <Menu.Item key={item}>
                {({ active }) => (
                  <button
                    className={clsx('group flex items-center w-full px-3 py-2 hover:bg-slate-100', {
                      'text-slate-600': !active,
                      'text-slate-800': active,
                    })}
                    onClick={handleMenuItemClick(item)}
                  >
                    {item}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
