import type { NextPage } from 'next'
import { useVideoQuery } from '../../../api/videos'

import { Spinner } from '../../../components/elements/feedback/Spinner'
import { useRouter } from 'next/router'
import { VideoMutateForm } from '../../../components/features/videos/VideoMutateForm'
import { useCallback } from 'react'

export const VideoPage: NextPage = () => {
  const { push: routerPush, query: routerQuery } = useRouter()

  const videoUuid = typeof routerQuery?.uuid === 'string' ? routerQuery.uuid : ''
  const { data: video, isSuccess, isLoading, isError } = useVideoQuery(videoUuid)

  const onSaveRedirectHandler = useCallback(() => {
    routerPush('/app/videos')
  }, [routerPush])

  return (
    <div>
      <h2 className="text-lg">Video Detail Page ({videoUuid})</h2>
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
