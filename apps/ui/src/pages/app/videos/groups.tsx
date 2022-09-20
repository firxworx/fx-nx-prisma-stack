import type { NextPage } from 'next'
import { PageHeading } from '../../../components/elements/headings/PageHeading'

import { useVideoGroupsQuery } from '../../../api/hooks/video-groups'
import { Spinner } from '../../../components/elements/feedback/Spinner'
import Link from 'next/link'
import clsx from 'clsx'

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
            {data?.map((vg) => (
              <li key={vg.uuid} className="group flex items-center justify-between">
                <Link href={vg.uuid}>
                  <a
                    className={clsx(
                      'p-4 flex-1 border-l-2 border-t-2 border-b-2 rounded-l-md border-slate-200',
                      'text-action-primary hover:text-action-primary-darker hover:underline',
                      'bg-slate-50 border-slate-200 group-hover:border-slate-300',
                      'transition-colors',
                    )}
                  >
                    <div>{vg.name}</div>
                    <div>{vg.videos.map((video) => video.name).join(', ')}</div>
                  </a>
                </Link>
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
