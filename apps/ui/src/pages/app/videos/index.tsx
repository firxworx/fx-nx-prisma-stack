import type { NextPage } from 'next'
import Link from 'next/link'
import clsx from 'clsx'

import { PlusIcon } from '@heroicons/react/20/solid'
import { AiOutlineYoutube } from 'react-icons/ai'

import { useVideosQuery } from '../../../api/videos'
import type { VideoDto } from '../../../types/videos.types'
import { Spinner } from '../../../components/elements/feedback/Spinner'
import { LinkButton } from '../../../components/elements/inputs/LinkButton'
import { NavLink } from '../../../components/elements/inputs/NavLink'
import { PageHeading } from '../../../components/elements/headings/PageHeading'

export const VideoPlatformLogo: React.FC<{ platform?: VideoDto['platform'] }> = ({ platform }) => {
  switch (platform) {
    case 'YOUTUBE': {
      return <AiOutlineYoutube className="h-6 w-auto" />
    }
    default: {
      return null
    }
  }
}

const ADD_VIDEO_ROUTE = '/app/videos/create'

const LABELS = {
  VIDEOS_HEADING: 'Videos',
  ADD_VIDEO: 'Add Video',
  NO_VIDEOS_FOUND: 'No videos found.',
  ERROR_FETCHING_DATA: 'Error fetching data',
  TRY: 'Try', // could merge sprintf i18n style
  ADDING_A_VIDEO: 'Adding a Video',
}

export const VideosPage: NextPage = (_props) => {
  const { data, isSuccess, isLoading, isError } = useVideosQuery()

  return (
    <div>
      <PageHeading>{LABELS.VIDEOS_HEADING}</PageHeading>
      <div className="flex justify-end">
        <LinkButton href={ADD_VIDEO_ROUTE} variant="outline" appendClassName="mb-4">
          <PlusIcon className="h-5 w-5 mr-1" />
          <span>{LABELS.ADD_VIDEO}</span>
        </LinkButton>
      </div>
      <div>
        {isError && <p>{LABELS.ERROR_FETCHING_DATA}</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!data?.length && (
          <ul className="space-y-2">
            {data?.map((video) => (
              <li key={video.uuid} className="group flex items-center justify-between">
                <Link href={`/app/videos/${video.uuid}`}>
                  <a
                    className={clsx(
                      'p-4 flex-1 border-l-2 border-t-2 border-b-2 rounded-l-md border-slate-200',
                      'text-action-primary hover:text-action-primary-darker hover:underline',
                      'bg-slate-50 border-slate-200 group-hover:border-slate-300',
                      'transition-colors',
                    )}
                  >
                    {video.name}
                  </a>
                </Link>
                <Link href={`https://www.youtube.com/watch?v=${video.externalId}`}>
                  <a
                    className={clsx(
                      'p-4 border-r-2 border-l-2 border-t-2 border-b-2 rounded-r-md',
                      'text-action-primary hover:text-action-primary-darker',
                      'bg-slate-50 group-hover:border-slate-300',
                      'border-slate-200 hover:bg-yellow-50',
                      'transition-colors',
                    )}
                  >
                    <VideoPlatformLogo platform={video.platform} />
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {isSuccess && !data?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">
              {LABELS.NO_VIDEOS_FOUND} {LABELS.TRY} <NavLink href={ADD_VIDEO_ROUTE}>{LABELS.ADDING_A_VIDEO}</NavLink>.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideosPage
