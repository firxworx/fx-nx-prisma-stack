import type { NextPage } from 'next'

import { useVideoGroupsQuery } from '../../../api/video-groups'
import { Spinner } from '../../../components/elements/feedback/Spinner'

export const VideoGroupsPage: NextPage = (_props) => {
  const { data, isSuccess, isLoading, isError } = useVideoGroupsQuery()

  return (
    <div>
      <h2 className="text-lg">Video Groups Page</h2>
      <div className="mt-4">
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && data && (
          <ul className="space-y-2">
            {data?.map((videoGroup) => (
              <li key={videoGroup.uuid} className="p-4 border-2 rounded-md bg-slate-50 border-slate-200">
                <div>
                  <div>{videoGroup.name}</div>
                  <div>{videoGroup.videos.map((video) => video.name).join(', ')}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default VideoGroupsPage
