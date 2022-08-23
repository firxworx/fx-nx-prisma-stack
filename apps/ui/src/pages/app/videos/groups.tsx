import type { NextPage } from 'next'
import { useVideoGroupsQuery } from 'apps/ui/src/api/videos'

export const VideoGroupsPage: NextPage = (_props) => {
  const { data, isSuccess, isLoading, isError } = useVideoGroupsQuery()

  return (
    <div>
      <h2 className="text-lg">Video Groups Page</h2>
      <div className="p-4">
        {isError && <p>Error fetching data</p>}
        {isLoading && <p>Fetching data...</p>}
        {isSuccess && data && (
          <ul className="space-y-2">
            {data?.map((videoGroup) => (
              <li key={videoGroup.uuid} className="p-4 border-2 border-slate-200">
                {videoGroup.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default VideoGroupsPage
