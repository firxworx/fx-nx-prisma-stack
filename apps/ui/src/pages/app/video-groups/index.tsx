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
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data?.map((vg) => (
              <Link key={vg.uuid} href={`/app/video-groups/${vg.uuid}`}>
                <a
                  className={clsx(
                    'group flex flex-col rounded-md',
                    'p-4 border-2 border-slate-200 hover:border-action-primary',
                    'text-action-primary hover:text-action-primary-darker',
                    'bg-slate-50 hover:bg-sky-50',
                    'transition-colors',
                  )}
                >
                  <div className="flex justify-between items-center flex-auto">
                    <div className="flex-1 leading-tight">{vg.name}</div>
                    <div
                      className={clsx(
                        'flex justify-center items-center py-1 px-3 border-2 rounded-md',
                        'text-sm transition-colors border-slate-200 bg-sky-100',
                        'group-hover:border-action-primary/50',
                      )}
                    >
                      {vg.videos.length}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
        {isSuccess && !data?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">No video groups found.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoGroupsPage
