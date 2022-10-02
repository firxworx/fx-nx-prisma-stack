import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'

import { useVideoGroupsQuery } from '../../../../api/hooks/video-groups'
import { useModalContext } from '../../../../context/ModalContextProvider'

import { Spinner } from '../../../../components/elements/feedback/Spinner'
import { PageHeading } from '../../../../components/elements/headings/PageHeading'
import { getRouterParamValue } from '../../../../lib/router'
import { VideoGroupForm } from '../../../../components/features/videos/forms/VideoGroupForm'
import { ModalVariant } from '../../../../components/elements/modals/ModalBody'

import type { ApiParentContext } from '../../../../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../../../../types/box-profiles.types'
import { VideosManager } from '../../../../components/features/videos/VideosManager'
import { VideoGroupsManager } from '../../../../components/features/videos/VideoGroupsManager'

// const tabs = ['video-groups', 'gallery']

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>['parentContext']

interface TabProps {
  parentContext: ParentContext
}

const VideosTab: React.FC<TabProps> = ({ parentContext }) => {
  return (
    <>
      <VideosManager parentContext={parentContext} />
    </>
  )
}

const VideoGroupsTab: React.FC<TabProps> = ({ parentContext }) => {
  return (
    <>
      <VideoGroupsManager parentContext={parentContext} />
    </>
  )
}

const tabs: {
  label: string
  paramKey: string // lowercase url friendly
  count?: number // optional count badge
  Component: React.FC<TabProps>
}[] = [
  {
    label: 'Groups',
    paramKey: 'groups',
    count: 0,
    Component: VideoGroupsTab,
  },
  {
    label: 'Videos',
    paramKey: 'videos',
    count: 10,
    Component: VideosTab,
  },
]

// const tabClassName = clsx(
//   'relative inline-flex items-center px-2 sm:px-4 py-2 border-0 cursor-pointer rounded-md',
//   'text-base font-medium text-brand-primary-darkest',
//   'bg-slate-100',
//   '',
//   // e.g. 'focus:z-10 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue',
// )

/**
 *
 * At time of writting 2022-10-01 there is an issue with headlessui `Tab.Panel` and it not being possible to
 * make the component non-focusable and not being able to use the `tabIndex` prop.
 *
 * @see {@link https://github.com/tailwindlabs/headlessui/discussions/1433#discussioncomment-3779815}
 */
export const TabLayout: React.FC = () => {
  const router = useRouter()
  const [currentTabIndex, setCurrentTabIndex] = useState<number | undefined>(undefined)

  const boxProfileUuid = getRouterParamValue(router.query, 'box')
  const parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext'] = {
    boxProfileUuid,
  }

  const handleTabChange = (index: number): void => {
    if (tabs[index]) {
      // @see https://nextjs.org/docs/api-reference/next/router#with-url-object
      // e.g. with nextjs dynamic routes -- <Link href="/example/[...slug]" as={`/example/${post.slug}`} prefetch>
      router.push({
        pathname: router.pathname, // dynamic paths are represented in path as [varName]
        query: { box: boxProfileUuid, tab: tabs[index].paramKey }, // specify dynamic path variable value(s) as well
      })
    }
  }

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const findResult = tabs.findIndex((t) => t.paramKey === router.query['tab'])
    const tabIndex = findResult === -1 ? 0 : findResult

    if (tabIndex !== currentTabIndex) {
      setCurrentTabIndex(tabIndex)
    }
  }, [router.isReady, router.query, currentTabIndex])

  // hide tabs on first render when nextjs router + query is not available
  const hideTabs = currentTabIndex === undefined

  // const responsiveTabListClassName = clsx(
  //   'relative z-0 flex flex-col xs:flex-row rounded-md',
  //   'space-y-2 space-x-0 xs:space-y-0 xs:space-x-2',
  // )

  return (
    <Tab.Group selectedIndex={currentTabIndex ?? 0} onChange={handleTabChange}>
      <div className="border-b border-slate-300">
        <Tab.List
          className={clsx('relative z-0 flex flex-row space-y-0 space-x-8 rounded-md', '-mb-px')}
          aria-label="Tabs for Managing Video Groups and Videos"
        >
          {tabs.map((tab) => (
            <Tab as={React.Fragment} key={tab.label}>
              {({ selected: isSelected }): JSX.Element => (
                <a
                  className={clsx(
                    'group flex py-4 px-2 border-b-2 rounded-t-sm',
                    'whitespace-nowrap cursor-pointer',
                    'transition-colors fx-focus-ring-form',
                    {
                      [clsx(
                        'font-semibold border-brand-primary-darkest text-brand-primary-darkest',
                        'hover:border-brand-primary-darker',
                      )]: isSelected && !hideTabs, // @todo add tab color scheme
                      [clsx(
                        'font-medium border-transparent text-slate-500',
                        'hover:text-slate-600 hover:border-slate-300/90',
                      )]: !(isSelected && !hideTabs),
                    },
                  )}
                >
                  {tab.label}
                  {typeof tab.count === 'number' ? (
                    <span
                      className={clsx(
                        isSelected ? 'bg-sky-100 text-brand-primary' : 'bg-slate-100 text-slate-900',
                        'hidden ml-3 py-1 px-2.5 rounded-full text-xs font-medium md:inline-block',
                        {
                          ['group-hover:bg-slate-200/70']: !isSelected,
                        },
                      )}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </a>
              )}
            </Tab>
          ))}
        </Tab.List>
      </div>
      <Tab.Panels as="div" tabIndex={-1}>
        {tabs.map((tab) => {
          return (
            <Tab.Panel
              key={tab.label}
              tabIndex={-1} // @see doc comment + issue note that this is currently not supported (headless bug)
              className="py-4 sm:py-6 focus:rounded-sm fx-focus-ring-form focus:ring-offset-8"
            >
              {!!parentContext.boxProfileUuid && <tab.Component parentContext={parentContext}></tab.Component>}
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}

/*
<Link href={`/app/[box]/videos/gallery`} as={`/app/${boxProfileUuid}/videos/gallery`}>
  <a className="block mt-6 font-medium text-brand-primary-darker">Go to Video Gallery (temp)</a>
</Link>
*/

export const ManageVideosIndexPage: NextPage = () => {
  const router = useRouter()
  const boxProfileUuid = getRouterParamValue(router.query, 'box')

  const parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext'] = {
    boxProfileUuid,
  }

  const {
    data: videoGroups,
    isSuccess,
    isLoading,
    isFetching,
    isError,
  } = useVideoGroupsQuery({ parentContext: { boxProfileUuid } })

  const [showModal] = useModalContext(
    {
      title: 'Add Video Group',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupForm
        parentContext={parentContext}
        create={{
          onSuccess: (): void => {
            hideModal()
          },
        }}
      />
    ),
  )

  // const { push: routerPush, query: routerQuery } = useRouter()

  return (
    <>
      <PageHeading showLoadingSpinner={isFetching}>Manage Videos</PageHeading>
      <div className="mb-4 sm:mb-6">
        <p className="mb-2 sm:mb-0">Add YouTube videos and organize them into Video Groups.</p>
        <p>
          Set a Video Group as <strong>Active</strong> to load it on your Box&apos;s <strong>Video Player Mode</strong>.
        </p>
      </div>
      {/* <div className="flex justify-end mb-4">
        <ActionButton variant="outline" onClick={showModal}>
          <PlusIcon className="h-5 w-5 mr-1" />
          <span>Add Video Group</span>
        </ActionButton>
      </div> */}
      <div>
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
        {/*isSuccess && !!parentContext.boxProfileUuid && !!videoGroups?.length && (
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {videoGroups?.map((vg) => (
              <VideoGroupLink key={vg.uuid} parentContext={parentContext} videoGroup={vg} />
            ))}
          </div>
            )*/}
        {/*isSuccess && !videoGroups?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">No video groups found.</div>
          </div>
        )*/}
      </div>
      <TabLayout />
    </>
  )
}

export default ManageVideosIndexPage
