import React, { useCallback, useMemo } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { PlusIcon } from '@heroicons/react/20/solid'

import { Spinner } from '../../../../../components/elements/feedback/Spinner'
import { PageHeading } from '../../../../../components/elements/headings/PageHeading'
import { getRouterParamValue } from '../../../../../lib/router'
import { useVideoDeleteQuery, useVideosQuery } from '../../../../../api/hooks/videos'
import { LinkButton } from '../../../../../components/elements/inputs/LinkButton'
import { VideoActionGallery } from '../../../../../components/features/videos/VideoActionGallery'
import { useIsMounted } from '@firx/react-hooks'
import { useModalContext } from '../../../../../context/ModalContextProvider'
import { ModalVariant } from '../../../../../components/elements/modals/ModalBody'
import { VideoForm } from '../../../../../components/features/videos/forms/VideoForm'

export const ManageVideoGalleryPage: NextPage = () => {
  const { query: routerQuery, push: routerPush } = useRouter()
  const boxProfileUuid = getRouterParamValue(routerQuery, 'box')

  const isMounted = useIsMounted()

  const parentContext = useMemo(
    () => ({
      boxProfileUuid,
    }),
    [boxProfileUuid],
  )

  const {
    data: videos,
    refetch,
    isSuccess,
    isLoading,
    isFetching,
    isError,
  } = useVideosQuery({ parentContext: parentContext })

  const { mutate: deleteVideo, isError: isVideoDeleteError } = useVideoDeleteQuery()

  const [showAddVideoModal] = useModalContext(
    {
      title: 'Add Video',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoForm
        parentContext={parentContext}
        create={{
          onSuccess: (): void => {
            hideModal()
            refetch()
          },
        }}
      />
    ),
  )

  const handleVideoClick = useCallback(
    (uuid: string, _event: React.MouseEvent): void => {
      if (isMounted()) {
        routerPush(`/app/[box]/videos/gallery/[video]`, `/app/${boxProfileUuid}/videos/gallery/${uuid}`)
      }
    },
    [boxProfileUuid, routerPush, isMounted],
  )

  const handleDeleteVideoClick = useCallback(
    (uuid: string, _event: React.MouseEvent): void => {
      deleteVideo({ parentContext: parentContext, uuid })
    },
    [parentContext, deleteVideo],
  )

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
      <>
        {isError && <p>Error fetching data</p>}
        {isVideoDeleteError && <p>Error deleting video</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!videos?.length && (
          <VideoActionGallery
            videos={videos}
            onVideoClick={handleVideoClick}
            onAddVideoClick={(): void => showAddVideoModal()}
            onDeleteVideoClick={handleDeleteVideoClick}
          />
        )}
        {isSuccess && !videos?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">No videos found.</div>
          </div>
        )}
      </>
    </>
  )
}

export default ManageVideoGalleryPage
