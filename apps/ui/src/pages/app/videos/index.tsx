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
import { VideoThumbnail } from 'apps/ui/src/components/features/videos/VideoThumbnail'

export const VideoPlatformLogo: React.FC<{ platform?: VideoDto['platform']; appendClassName?: string }> = ({
  platform,
  appendClassName,
}) => {
  switch (platform) {
    case 'YOUTUBE': {
      return <AiOutlineYoutube className={(clsx('h-6 w-auto'), appendClassName)} />
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
          <>
            <div className="">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data?.map((video) => (
                  <Link key={video.uuid} href={`/app/videos/${video.uuid}`}>
                    <a
                      className={clsx(
                        'group w-full rounded-md overflow-hidden',
                        'ring-2 ring-slate-200 hover:ring-sky-200 hover:ring-2 transition-colors',
                      )}
                    >
                      <div className="filter grayscale-50 group-hover:grayscale-0 transition-all">
                        <VideoThumbnail externalId={video.externalId} />
                      </div>
                      <div className="flex items-center bg-slate-50 p-2 sm:p-4">
                        <div className="flex-1">
                          <div className="text-sm md:text-base">{video.name}</div>
                          <div className="text-sm hidden sm:block font-light">{video.groups.length} groups</div>
                        </div>
                        {/* <VideoPlatformLogo platform={video.platform} /> */}
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </>
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
