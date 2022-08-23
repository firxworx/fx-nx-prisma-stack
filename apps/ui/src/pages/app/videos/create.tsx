import type { NextPage } from 'next'
import { VideoCreateForm } from '../../../components/features/videos/VideoCreateForm'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

export const VideoCreatePage: NextPage = () => {
  const { push: routerPush } = useRouter()

  const onCreateSuccessRedirectHandler = useCallback(() => {
    routerPush('/app/videos')
  }, [routerPush])

  return (
    <div>
      <h2 className="text-lg">Add Video</h2>
      <div className="mt-4">
        <VideoCreateForm onSuccess={onCreateSuccessRedirectHandler} />
      </div>
    </div>
  )
}

export default VideoCreatePage
