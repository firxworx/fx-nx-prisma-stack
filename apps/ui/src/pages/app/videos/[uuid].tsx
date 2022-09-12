import React, { useCallback } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { useVideoQuery } from '../../../api/videos'
import { VideoMutateForm } from '../../../components/features/videos/VideoMutateForm'
import { Spinner } from '../../../components/elements/feedback/Spinner'
import { PageHeading } from 'apps/ui/src/components/elements/headings/PageHeading'

export const VideoPage: NextPage = () => {
  const { push: routerPush, query: routerQuery } = useRouter()

  const videoUuid = typeof routerQuery?.uuid === 'string' ? routerQuery.uuid : ''
  const { data: video, isSuccess, isLoading, isError } = useVideoQuery(videoUuid)

  const onSaveRedirectHandler = useCallback(() => {
    routerPush('/app/videos')
  }, [routerPush])

  return (
    <div>
      <PageHeading>Video: {videoUuid}</PageHeading>
      <div className="mt-4">
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
      </div>
      <div className="mt-4">
        {isSuccess && video && <VideoMutateForm uuid={videoUuid} video={video} onSuccess={onSaveRedirectHandler} />}
      </div>
    </div>
  )
}

export default VideoPage
