import { useCallback } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { PageHeading } from '../../../components/elements/headings/PageHeading'
import { VideoCreateForm } from '../../../components/features/videos/VideoCreateForm'

// youtube video id regex /^[A-Za-z0-9_-]{11}$/

export const VideoCreatePage: NextPage = () => {
  const { push: routerPush } = useRouter()

  const onCreateSuccessRedirectHandler = useCallback(() => {
    routerPush('/app/videos')
  }, [routerPush])

  return (
    <div>
      <PageHeading>Add Video</PageHeading>
      <div className="flex justify-center mt-4">
        <div className="w-full sm:w-4/6">
          <VideoCreateForm onSuccess={onCreateSuccessRedirectHandler} />
        </div>
      </div>
    </div>
  )
}

export default VideoCreatePage
