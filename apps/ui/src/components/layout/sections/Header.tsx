import React, { Fragment, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { Popover, Transition } from '@headlessui/react'

import { Bars3Icon, XMarkIcon, CloudIcon } from '@heroicons/react/24/outline'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid' // LogoutIcon

import type { NavigationLink } from '../../../types/navigation.types'
import { useSessionContext } from '../../../context/SessionContextProvider'
import { useAuthSignOut } from '../../../api/auth'
import { UserProfileMenu } from '../menus/UserProfileMenu'
import { useIsMounted } from '../../../hooks/useIsMounted'

export interface HeaderProps {
  navigationLinks: NavigationLink[]
}

const LABELS = {
  HOME: 'Home',
  SIGN_OUT: 'Sign Out',
}

/**
 * Header logo that links to the route provided via its `href` prop (defaults to '/').
 */
const LogoLink: React.FC<{ href?: string; appendClassName?: string }> = ({ href, appendClassName }) => {
  return (
    <Link href={href ?? '/'}>
      <a
        className={clsx(
          'group inline-block w-fit relative border-2 border-transparent rounded-md',
          'fx-focus-ring focus:bg-white transition-colors',
          'hover:bg-white hover:border-slate-200 hover:border-dashed',
          appendClassName,
        )}
      >
        <span className="sr-only">
          {process.env.NEXT_PUBLIC_SITE_TITLE} &emdash; {LABELS.HOME}
        </span>
        <CloudIcon className="h-8 sm:h-10 w-auto transition-colors text-action-primary-darkest group-hover:text-action-primary-darker" />
      </a>
    </Link>
  )
}

LogoLink.defaultProps = {
  href: '/',
}

/**
 * Menu navigation links rendered as a series of siblings implemented using NextJS `Link`.
 *
 * Individual links (anchor tags) have the given `linkClassName` applied as className and the
 * optional `onLinkClick` set as `onClick` handler.
 */
const MenuLinks: React.FC<
  Pick<HeaderProps, 'navigationLinks'> & {
    linkClassName: string
    linkCurrentClassName?: string
    onLinkClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  }
> = ({ navigationLinks, linkClassName, linkCurrentClassName, onLinkClick }) => {
  const router = useRouter()

  // check is tolerant to no trailing slash on router.pathname
  const isCurrentMenuLink = (routerPathName: string, itemHref: string): boolean => {
    return routerPathName !== '/' && itemHref.includes(routerPathName)
  }

  return (
    <>
      {navigationLinks.map((item) => {
        const isCurrent = isCurrentMenuLink(router.pathname, item.href)

        return (
          <Link key={item.title} href={`${item.href}`}>
            <a
              className={clsx(linkClassName, isCurrent ? linkCurrentClassName ?? '' : undefined)}
              aria-current={isCurrent ? 'page' : false}
              onClick={onLinkClick}
            >
              {item.title}
            </a>
          </Link>
        )
      })}
    </>
  )
}

/**
 * Desktop navigation menu containing horizontal links, hidden via CSS for viewports < tailwindcss 'lg' breakpoint.
 */
const DesktopNavMenu: React.FC<Pick<HeaderProps, 'navigationLinks'>> = ({ navigationLinks }) => {
  const session = useSessionContext()

  return (
    <div className="hidden lg:flex lg:justify-start lg:items-center lg:flex-1 text-slate-900">
      <div className="flex justify-between items-center flex-1">
        <div className="flex-1 px-6 space-x-4">
          <MenuLinks
            navigationLinks={navigationLinks}
            linkClassName={clsx(
              'inline-block px-4 py-2 border-2 rounded-lg',
              'transition-colors duration-200',
              'text-base font-medium text-center leading-tight',
              'text-action-primary-darkest border-transparent',
              'hover:bg-white hover:border-slate-200 hover:border-dashed',
              'fx-focus-ring focus:bg-white',
            )}
            linkCurrentClassName={'text-slate-900'}
          />
        </div>
        {session?.profile && <UserProfileMenu name={session.profile.name} />}
      </div>
    </div>
  )
}

/**
 * Mobile navigation menu body, intended for rendering as a child of HeadlessUI's `Popover.Panel`.
 *
 * @todo add aria-current for current page + current page styling
 * e.g. https://tailwindui.com/components/application-ui/navigation/navbars "With Search in Column Layout"
 */
const MobileNavMenu: React.FC<
  Pick<HeaderProps, 'navigationLinks'> & { isMenuOpen: boolean; onMenuItemClick: () => void }
> = ({ navigationLinks, isMenuOpen, onMenuItemClick }) => {
  const { push: routerPush } = useRouter()

  const session = useSessionContext()
  const isMounted = useIsMounted()
  const { signOut, isSuccess: isSignOutSuccess } = useAuthSignOut()

  useEffect(() => {
    if (isSignOutSuccess && isMounted()) {
      routerPush(process.env.NEXT_PUBLIC_DEFAULT_SIGN_OUT_REDIRECT_PATH ?? '/')
    }
  }, [isSignOutSuccess, isMounted, routerPush])

  // @todo listen for router events for navigation change -- more idiomatic and explicit vs. click events
  const handleMenuLinkClick = () => {
    if (isMenuOpen) {
      onMenuItemClick()
    }
  }

  const linkClassName =
    'w-full px-5 py-2 text-lg font-medium fx-focus-ring ring-inset focus:bg-slate-100 focus:rounded-md'

  return (
    <div className="rounded-b-lg shadow-lg bg-slate-200 ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className="px-5 pt-4 flex items-center justify-between">
        <LogoLink />
        <div className="-mr-2">
          <MobileNavCloseButton />
        </div>
      </div>
      <div className="py-6 text-slate-600">
        <div className="space-y-1">
          <MenuLinks
            navigationLinks={navigationLinks}
            linkClassName={clsx('block', linkClassName)}
            linkCurrentClassName={'bg-slate-100 text-slate-500'}
            onLinkClick={handleMenuLinkClick}
          />
        </div>
        {session?.profile && (
          <div className="mt-3">
            <button
              type="button"
              className={clsx('flex items-center justify-start text-sky-700', linkClassName)}
              role="menuitem"
              onClick={() => signOut()}
            >
              <ArrowLeftOnRectangleIcon className="inline-block h-5 w-5 mr-2" aria-hidden />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const mobileNavPopOverButtonClassName = clsx(
  'group inline-flex items-center justify-center p-2 border-2 rounded-md',
  'bg-white border-slate-300 hover:border-action-primary focus:border-action-primary hover:bg-sky-50',
  'fx-focus-ring transition-colors',
)

const mobileNavButtonIconClassName =
  'h-5 w-5 transition-colors text-slate-700 group-hover:text-action-primary group-focus:text-action-primary transition-colors'

const MobileNavMenuButton: React.FC = () => {
  return (
    <Popover.Button className={mobileNavPopOverButtonClassName}>
      <span className="sr-only">Open Navigation Menu</span>
      <Bars3Icon className={mobileNavButtonIconClassName} />
    </Popover.Button>
  )
}

const MobileNavCloseButton: React.FC = () => {
  return (
    <Popover.Button className={mobileNavPopOverButtonClassName}>
      <span className="sr-only">Close Menu</span>
      <XMarkIcon className={mobileNavButtonIconClassName} aria-hidden="true" />
    </Popover.Button>
  )
}

const headerClassName = 'relative border-b-2 bg-slate-100 border-slate-200'

const navClassName = clsx(
  'relative mx-auto flex items-center justify-between py-3',
  'fx-layout-max-width fx-layout-padding-x',
)

/**
 * Non-dynamic placeholder header that corresponds to `Header` component.
 *
 * @see Header
 */
export const PlaceholderHeader: React.FC = () => {
  return (
    <header className={headerClassName}>
      <nav className={navClassName} aria-label="Main">
        <div className="flex items-center flex-1">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center space-x-4">
              <LogoLink />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

/**
 * Header with branding that implements a responsive navigation menu.
 */
export const Header: React.FC<HeaderProps> = ({ navigationLinks }) => {
  return (
    <Popover as="header" className={headerClassName}>
      {({ open, close }) => (
        <>
          <nav className={navClassName} aria-label="Main">
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center space-x-4">
                  <LogoLink />
                </div>
                <div className="flex items-center lg:hidden">
                  <MobileNavMenuButton />
                </div>
              </div>
              <DesktopNavMenu navigationLinks={navigationLinks} />
            </div>
          </nav>
          {/* popover containing mobile nav menu: */}
          <Transition
            show={open}
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Popover.Panel
              focus
              static
              className={clsx('absolute z-30 top-0 inset-x-0 transition origin-top-right lg:hidden')}
            >
              <MobileNavMenu navigationLinks={navigationLinks} isMenuOpen={open} onMenuItemClick={close} />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
