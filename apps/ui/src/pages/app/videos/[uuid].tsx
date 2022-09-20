import React, { useCallback } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { useVideoQuery } from '../../../api/videos'
import { VideoMutateForm } from '../../../components/features/videos/VideoMutateForm'
import { Spinner } from '../../../components/elements/feedback/Spinner'
import { PageHeading } from '../../../components/elements/headings/PageHeading'
import { VideoThumbnail } from '../../../components/features/videos/VideoThumbnail'
import { NavLink } from '../../../components/elements/inputs/NavLink'
import { getYouTubeVideoUrl } from '../../../lib/videos/youtube'

export const VideoPage: NextPage = () => {
  const { push: routerPush, query: routerQuery } = useRouter()

  const videoUuid = typeof routerQuery?.uuid === 'string' ? routerQuery.uuid : ''
  const { data: video, isSuccess, isLoading, isError } = useVideoQuery(videoUuid)

  const onSaveRedirectHandler = useCallback(() => {
    routerPush('/app/videos')
  }, [routerPush])

  return (
    <div>
      <PageHeading>
        Video: {video ? video.name : <span className="text-slate-600 animate-pulse">Loading...</span>}
      </PageHeading>
      <div className="mt-4">
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
      </div>
      <div className="mt-4">
        {isSuccess && video && (
          <>
            <div className="flex flex-col items-center justify-center">
              <div className="w-48 hover:ring-sky-200 hover:ring-2 transition-colors isolate rounded-md overflow-hidden">
                <NavLink href={getYouTubeVideoUrl(video.externalId)} openInNewTab>
                  <VideoThumbnail externalId={video.externalId} />
                </NavLink>
              </div>
              <div className="w-full sm:w-4/6">
                <VideoMutateForm uuid={videoUuid} video={video} onSuccess={onSaveRedirectHandler} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VideoPage
