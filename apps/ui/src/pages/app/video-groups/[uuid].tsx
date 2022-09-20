import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { Spinner } from '../../../components/elements/feedback/Spinner'
import { PageHeading } from '../../../components/elements/headings/PageHeading'
import { useVideoGroupQuery } from '../../../api/hooks/video-groups'
import { useIsMounted } from '../../../hooks/useIsMounted'
import { useCallback } from 'react'
import { VideoGroupMultiForm } from '../../../components/features/videos/VideoGroupMultiForm'
import { VideoActionGallery } from '../../../components/features/videos/VideoActionGallery'

export const VideoGroupPage: NextPage = () => {
  const isMounted = useIsMounted()
  const { push: routerPush, query: routerQuery } = useRouter()

  const videoUuid = typeof routerQuery?.uuid === 'string' ? routerQuery.uuid : ''
  const { data: videoGroup, isSuccess, isLoading, isError } = useVideoGroupQuery(videoUuid)

  const onSaveRedirectHandler = useCallback(() => {
    if (isMounted()) {
      routerPush('/app/videos')
    }
  }, [routerPush, isMounted])

  return (
    <div>
      <PageHeading>
        Edit Video Group {!videoGroup && <span className="text-slate-600 animate-pulse">Loading...</span>}
      </PageHeading>
      <div className="mt-6">
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && videoGroup && (
          <>
            <div className="flex justify-center">
              <div className="w-full sm:w-4/6 space-y-4">
                <h2 className="text-2xl font-normal tracking-tight text-action-primary-darkest">{videoGroup.name}</h2>
                <VideoGroupMultiForm mutate={{ data: videoGroup, onSuccess: onSaveRedirectHandler }} />

                <h2 className="text-2xl">WIP Video Action Gallery</h2>
                <VideoActionGallery videos={videoGroup.videos} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VideoGroupPage
