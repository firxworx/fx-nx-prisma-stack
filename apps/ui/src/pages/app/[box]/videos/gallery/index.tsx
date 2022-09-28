import React from 'react'

import clsx from 'clsx'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Spinner } from '../../../../../components/elements/feedback/Spinner'
import { PageHeading } from '../../../../../components/elements/headings/PageHeading'
import { getRouterParamValue } from '../../../../../lib/router'
import { useVideosQuery } from '../../../../../api/hooks/videos'
import { LinkButton } from '../../../../../components/elements/inputs/LinkButton'
import { PlusIcon } from '@heroicons/react/20/solid'

export const ManageVideoGalleryPage: NextPage = () => {
  const router = useRouter()
  const boxProfileUuid = getRouterParamValue(router.query, 'box')

  const {
    data: videos,
    isSuccess,
    isLoading,
    isFetching,
    isError,
  } = useVideosQuery({ parentContext: { boxProfileUuid } })

  // const { push: routerPush, query: routerQuery } = useRouter()

  return (
    <>
      <PageHeading showLoadingSpinner={isFetching}>Manage Videos</PageHeading>
      <div className="flex justify-end">
        <LinkButton
          href="/app/[box]/videos/gallery/create"
          as={`/app/${boxProfileUuid}/videos/gallery/create`}
          variant="outline"
          appendClassName="mb-4"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          <span>Add Video</span>
        </LinkButton>
      </div>
      <div>
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!videos?.length && (
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {videos?.map((video) => (
              <Link
                key={video.uuid}
                href={`/app/[box]/videos/gallery/${video.uuid}`}
                as={`/app/${boxProfileUuid}/videos/gallery/${video.uuid}`}
              >
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
                      <span className="block mb-1 text-base leading-snug">{video.name}</span>
                      <span className="block text-sm leading-4 text-action-primary/80">{video.platform}</span>
                    </div>
                    <div
                      className={clsx(
                        'flex justify-center items-center py-1 px-3 border-2 rounded-md',
                        'text-sm transition-colors border-slate-200 bg-sky-100',
                        'group-hover:border-action-primary/50',
                      )}
                    >
                      {video.groups.length}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
        {isSuccess && !videos?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">No videos found.</div>
          </div>
        )}
      </div>
    </>
  )
}

export default ManageVideoGalleryPage
