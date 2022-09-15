import React, { Fragment, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Menu, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { useAuthSignOut } from '../../../api/auth'
import { useIsMounted } from '../../../hooks/useIsMounted'

const DEFAULT_SIGN_OUT_REDIRECT_PATH = '/'

export interface UserProfileMenuProps {
  name: string
}

const menuItems = ['My Profile', 'Settings', 'Sign Out'] as const

/**
 * Drop-down menu (for desktop viewports) with options relevant to the user's session + preferences,
 * including sign-out.
 *
 * The first initial is rendered inside an avatar-esque circle.
 */
export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ name }) => {
  const { push: routerPush } = useRouter()

  const isMounted = useIsMounted()
  const { signOut, isSuccess: isSignOutSuccess } = useAuthSignOut()

  useEffect(() => {
    if (isSignOutSuccess && isMounted()) {
      routerPush(DEFAULT_SIGN_OUT_REDIRECT_PATH)
    }
  }, [isSignOutSuccess, isMounted, routerPush])

  const handleMenuItemClick = useCallback(
    (item: typeof menuItems[number]) => (_event: React.MouseEvent<HTMLButtonElement>) => {
      switch (item) {
        case 'My Profile': {
          routerPush('/app/profile')
          break
        }
        case 'Settings': {
          routerPush('/app/settings')
          break
        }
        case 'Sign Out': {
          signOut()
          break
        }
      }
    },
    [routerPush, signOut],
  )

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={clsx(
          'flex items-center justify-center w-10 h-10 border-2 rounded-full',
          'text-sm font-normal text-action-primary transition-colors',
          'bg-slate-100 border-action-primary-darkest hover:bg-white',
          'fx-focus-ring focus:bg-white',
        )}
      >
        <span className="inline-block leading-none font-semibold">{name.charAt(0).toUpperCase()}</span>
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
