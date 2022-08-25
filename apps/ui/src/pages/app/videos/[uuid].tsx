import type { NextPage } from 'next'
import { useVideoQuery } from '../../../api/videos'

import { Spinner } from '../../../components/elements/feedback/Spinner'
import { useRouter } from 'next/router'
import { VideoMutationForm } from '../../../components/features/videos/VideoMutationForm'
import { useCallback } from 'react'

export const VideoPage: NextPage = () => {
  const { push: routerPush, query: routerQuery } = useRouter()

  const videoUuid = typeof routerQuery?.uuid === 'string' ? routerQuery.uuid : ''
  const { data, isSuccess, isLoading, isError } = useVideoQuery(videoUuid)

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
        {isSuccess && data && <VideoMutationForm uuid={videoUuid} data={data} onSuccess={onSaveRedirectHandler} />}
      </div>
    </div>
  )
}

export default VideoPage
