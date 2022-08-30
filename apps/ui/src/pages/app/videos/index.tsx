import type { NextPage } from 'next'
import Link from 'next/link'
import clsx from 'clsx'

import { PlusIcon } from '@heroicons/react/outline'
import { AiOutlineYoutube } from 'react-icons/ai'

import { useVideosQuery } from '../../../api/videos'
import type { VideoDto } from '../../../types/videos.types'
import { Spinner } from '../../../components/elements/feedback/Spinner'

export const VideoPlatformLogo: React.FC<{ platform?: VideoDto['platform'] }> = ({ platform }) => {
  switch (platform) {
    case 'YOUTUBE': {
      return <AiOutlineYoutube className="h-6 w-auto text-slate-500" />
    }
    default: {
      return null
    }
  }
}

export const VideosPage: NextPage = (_props) => {
  const { data, isSuccess, isLoading, isError } = useVideosQuery()

  return (
    <div>
      <h2 className="text-lg">Videos Page</h2>
      <div className="flex justify-end">
        <Link href="/app/videos/create">
          <a className="flex items-center justify-center py-4 px-2 hover:text-slate-800">
            <PlusIcon className="h-5 w-5 mr-1" />
            <span>Add Video</span>
          </a>
        </Link>
      </div>
      <div>
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && data && (
          <ul className="space-y-2">
            {data?.map((video) => (
              <li
                key={video.uuid}
                className={clsx(
                  'flex justify-between items-center border-2 rounded-md',
                  'transition-colors duration-200 bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300',
                )}
              >
                <Link href={`/app/videos/${video.uuid}`}>
                  <a className="p-4 flex-1">{video.name}</a>
                </Link>
                <Link href={`https://www.youtube.com/watch?v=${video.externalId}`}>
                  <a className="px-4 py-1">
                    <VideoPlatformLogo platform={video.platform} />
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default VideosPage
