import React, { useCallback } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { useVideoQuery } from '../../../../../api/hooks/videos'

import { Spinner } from '../../../../../components/elements/feedback/Spinner'
import { PageHeading } from '../../../../../components/elements/headings/PageHeading'
import { VideoThumbnail } from '../../../../../components/features/videos/VideoThumbnail'
import { NavLink } from '../../../../../components/elements/inputs/NavLink'
import { getYouTubeVideoUrl } from '../../../../../lib/videos/youtube'
import { getRouterParamValue } from '../../../../../lib/router'
import { FormContainer } from '../../../../../components/elements/forms/FormContainer'
import { Heading } from '../../../../../components/elements/headings/Heading'
import { VideoForm } from '../../../../../components/features/videos/forms/VideoForm'

export const ManageVideoPage: NextPage = () => {
  const { push: routerPush, query: routerQuery } = useRouter()

  const boxProfileUuid = getRouterParamValue(routerQuery, 'box')
  const videoUuid = getRouterParamValue(routerQuery, 'video')

  const parentContext = {
    boxProfileUuid,
  }

  const { data: video, isSuccess, isFetching, isLoading, isError } = useVideoQuery({ parentContext, uuid: videoUuid })

  const onSaveRedirectHandler = useCallback(() => {
    routerPush(`/app/${boxProfileUuid}/videos/gallery`)
  }, [routerPush, boxProfileUuid])

  return (
    <>
      <PageHeading subHeading={video?.name ?? ''} showLoadingSpinner={isFetching}>
        Video
      </PageHeading>
      <div className="mt-4">
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
      </div>
      {isSuccess && !!video && (
        <FormContainer>
          <Heading type="h3">Edit Video</Heading>
          <div className="flex flex-col items-center">
            <div className="w-48 hover:ring-sky-200 hover:ring-2 transition-colors isolate rounded-md overflow-hidden">
              <NavLink href={getYouTubeVideoUrl(video.externalId)} openInNewTab>
                <VideoThumbnail externalId={video.externalId} />
              </NavLink>
            </div>
          </div>
          <VideoForm parentContext={parentContext} mutate={{ data: video, onSuccess: onSaveRedirectHandler }} />
        </FormContainer>
      )}
    </>
  )
}

export default ManageVideoPage
