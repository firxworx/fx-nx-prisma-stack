import React from 'react'
import clsx from 'clsx'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { PlusIcon } from '@heroicons/react/20/solid'

import { useVideoGroupsQuery } from '../../../../api/hooks/video-groups'
import { Spinner } from '../../../../components/elements/feedback/Spinner'
import { PageHeading } from '../../../../components/elements/headings/PageHeading'
import { getRouterParamValue } from '../../../../lib/router'
import { ActionButton } from '../../../../components/elements/inputs/ActionButton'
import { useModalContext } from '../../../../context/ModalContextProvider'
import { VideoGroupForm } from '../../../../components/features/videos/VideoGroupForm'
import { ModalVariant } from '../../../../components/elements/modals/ModalBody'

import type { ApiParentContext } from '../../../../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../../../../types/box-profiles.types'

export const ManageVideosIndexPage: NextPage = () => {
  const router = useRouter()
  const boxProfileUuid = getRouterParamValue(router.query, 'box')

  const parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext'] = {
    boxProfileUuid,
  }

  const {
    data: videoGroups,
    refetch: refetchVideoGroups,
    isSuccess,
    isLoading,
    isFetching,
    isError,
  } = useVideoGroupsQuery({ parentContext: { boxProfileUuid } })

  const [showModal] = useModalContext(
    {
      title: 'Add Video Group',
      // actionLabel: 'Save',
      // action: () => alert('saved'),
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupForm
        parentContext={parentContext}
        create={{
          onSuccess: (): void => {
            hideModal()
            refetchVideoGroups()
          },
        }}
      />
    ),
  )

  // const { push: routerPush, query: routerQuery } = useRouter()

  return (
    <>
      <PageHeading showLoadingSpinner={isFetching}>Manage Video Groups</PageHeading>
      <p>
        Add YouTube videos and organize them into Video Groups.
        <br />
        Set a Video Group as <strong>Active</strong> to load it on your Box&apos;s <strong>Video Player Mode</strong>.
      </p>
      <Link href={`/app/[box]/videos/gallery`} as={`/app/${boxProfileUuid}/videos/gallery`}>
        <a className="block mt-6">Gallery</a>
      </Link>
      <div className="flex justify-end mb-4">
        <ActionButton variant="outline" onClick={showModal}>
          <PlusIcon className="h-5 w-5 mr-1" />
          <span>Add Video Group</span>
        </ActionButton>
      </div>
      <div>
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!videoGroups?.length && (
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {videoGroups?.map((vg) => (
              <Link key={vg.uuid} href={`/app/${boxProfileUuid}/videos/${vg.uuid}`}>
                <a
                  className={clsx(
                    'group flex flex-col justify-start p-4 border-2 rounded-md',
                    'border-slate-200 hover:border-action-primary',
                    'text-action-primary hover:text-action-primary-darker',
                    'bg-slate-50 hover:bg-sky-50',
                    'transition-colors',
                  )}
                >
                  <div className="flex justify-between items-center flex-auto">
                    <div className="flex flex-col pr-4 flex-1">
                      <span className="block mb-1 text-base leading-snug">{vg.name}</span>
                      <span className="block text-sm leading-4 text-action-primary/80">{vg.description}</span>
                    </div>
                    <div
                      className={clsx(
                        'flex justify-center items-center py-1 px-3 border-2 rounded-md',
                        'text-sm transition-colors border-slate-200 bg-sky-100',
                        'group-hover:border-action-primary/50',
                      )}
                    >
                      {vg.videos.length}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
        {isSuccess && !videoGroups?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">No video groups found.</div>
          </div>
        )}
      </div>
    </>
  )
}

export default ManageVideosIndexPage
