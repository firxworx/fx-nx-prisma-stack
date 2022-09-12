import { PageHeading } from 'apps/ui/src/components/elements/headings/PageHeading'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

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
      <div className="mt-4">
        <VideoCreateForm onSuccess={onCreateSuccessRedirectHandler} />
      </div>
    </div>
  )
}

export default VideoCreatePage
