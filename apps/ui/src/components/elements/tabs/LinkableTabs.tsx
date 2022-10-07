import React, { useEffect, useState } from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { getRouterParamValue } from '../../../lib/router'

const tabs = ['groups', 'gallery']

const tabClassName = clsx(
  'relative inline-flex items-center px-2 sm:px-4 py-2 border-0 cursor-pointer rounded-md',
  'text-base border-slate-300 font-medium text-slate-700',
  // e.g. 'focus:z-10 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue',
)

export interface LinkableTabsProps {
  children: JSX.Element
}

/*
<TabSet param="asdf">
  <TabSet.Tab label="">
    <...>
  </TabSet.Tab>
</TabSet>
*/

export const TabSet: React.FC = () => {
  return <></>
}

export const LinkableTabs: React.FC = () => {
  const router = useRouter()
  const [currentTabIndex, setCurrentTabIndex] = useState<number | undefined>(undefined)

  const box = getRouterParamValue(router.query, 'box')

  const handleTabChange = (index: number): void => {
    if (tabs[index]) {
      // @see https://nextjs.org/docs/api-reference/next/router#with-url-object
      // e.g. with nextjs dynamic routes -- <Link href="/example/[...slug]" as={`/example/${post.slug}`} prefetch>
      router.push({
        pathname: router.pathname, // dynamic paths are represented in path as [varName]
        query: { box, tab: tabs[index] }, // specify dynamic path variable value(s) as well
      })
    }
  }

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const findResult = tabs.findIndex((t) => t === router.query['tab'])
    const tabIndex = findResult === -1 ? 0 : findResult

    if (tabIndex !== currentTabIndex) {
      setCurrentTabIndex(tabIndex)
    }
  }, [router.isReady, router.query, currentTabIndex])

  // hide tabs on first render when router + router query is not yet available
  const hideTabs = currentTabIndex === undefined

  return (
    <Tab.Group selectedIndex={currentTabIndex ?? 0} onChange={handleTabChange}>
      <Tab.List
        className={clsx(
          'relative z-0 flex flex-col sm:flex-row p-2 mb-6 rounded-md',
          'space-y-2 space-x-0 sm:space-y-0 sm:space-x-2',
          'shadow-sm',
        )}
        aria-label="Tabs for Video Gallery and Video Groups"
      >
        {tabs.map((id) => (
          <Tab as={React.Fragment} key={id}>
            {({ selected }): JSX.Element => (
              <a
                className={clsx(tabClassName, {
                  ['']: selected && !hideTabs, // @todo add tab color scheme
                  ['bg-transparent']: !(selected && !hideTabs),
                })}
              >
                {`${id.charAt(0).toUpperCase()}${id.slice(1)}`}
              </a>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabs.map((id) => {
          // @todo complete tab panels
          return (
            <Tab.Panel key={id} className={clsx('rounded-sm fx-focus-ring', { ['hidden']: hideTabs })}>
              <div>I am tab {id}</div>
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}
