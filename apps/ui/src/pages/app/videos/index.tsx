import type { NextPage } from 'next'
import { useVideosQuery } from 'apps/ui/src/api/videos'

export const VideosPage: NextPage = (_props) => {
  const { data, isSuccess, isLoading, isError } = useVideosQuery()

  return (
    <div>
      <h2 className="text-lg">Videos Page</h2>
      <div className="p-4">
        {isError && <p>Error fetching data</p>}
        {isLoading && <p>Fetching data...</p>}
        {isSuccess && data && (
          <ul className="space-y-2">
            {data?.map((video) => (
              <li key={video.uuid} className="p-4 border-2 border-slate-200">
                {video.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default VideosPage
