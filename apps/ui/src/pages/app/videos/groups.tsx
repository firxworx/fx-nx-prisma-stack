import type { NextPage } from 'next'
import { PageHeading } from '../../../components/elements/headings/PageHeading'

import { useVideoGroupsQuery } from '../../../api/hooks/video-groups'
import { Spinner } from '../../../components/elements/feedback/Spinner'

export const VideoGroupsPage: NextPage = (_props) => {
  const { data, isSuccess, isLoading, isError } = useVideoGroupsQuery()

  return (
    <div>
      <PageHeading>Video Groups</PageHeading>
      <div className="mt-4">
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!data?.length && (
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
        {isSuccess && !data?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">
              No video groups found.
              {/* Try <NavLink href={ADD_VIDEO_GROUP_ROUTE}>Adding a Video Group</NavLink>. */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoGroupsPage
