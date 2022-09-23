import { XMarkIcon } from '@heroicons/react/20/solid'
import { PlusIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { VideoDto } from '../../../types/videos.types'
import { VideoThumbnail } from './VideoThumbnail'

/**
 * **WIP** video thumbnail icon gallery w/ support for onClick actions
 */

export interface VideoActionGalleryProps {
  videos: Exclude<VideoDto, 'video'>[]
}

export interface VideoItemProps {
  video: Pick<VideoDto, 'name' | 'externalId' | 'platform'>
}

export const VideoItemDeleteButton: React.FC = () => {
  return (
    <div
      className={clsx(
        'flex items-center justify-center p-2 border-2 rounded-md',
        'bg-white text-error',
        'border-error group-hover:bg-error-200 group-focus:bg-error-200',
        'transition-colors group-focus-visible:ring-2 group-focus-visible:ring-sky-200',
      )}
    >
      <span className="sr-only">Delete Video from Group</span>
      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
    </div>
  )
}

export const VideoItem: React.FC<VideoItemProps> = ({ video }) => {
  return (
    <div className={clsx('w-full isolate rounded-md overflow-hidden', 'ring-2 ring-slate-300')}>
      <div className="relative transition-all">
        <div className="opacity-75 filter grayscale-75">
          <VideoThumbnail externalId={video.externalId} />
        </div>
        <button
          type="button"
          className={clsx('absolute group h-full w-full inset-0 flex justify-end', 'focus:outline-none')}
          onClick={(): void => alert('hello')}
        >
          <div className="p-2">
            <VideoItemDeleteButton />
          </div>
        </button>
      </div>
      <div className="flex items-center bg-slate-50 p-2 sm:p-4">
        <div className="flex-1">
          <div className="text-sm md:text-base">{video.name}</div>
        </div>
        {/* <VideoPlatformLogo platform={video.platform} /> */}
      </div>
    </div>
  )
}

export const AddVideoItem: React.FC = () => {
  return (
    <button
      type="button"
      className={clsx(
        'group w-full rounded-md aspect-w-16 aspect-h-9 isolate overflow-hidden border-2',
        'border-slate-300 bg-slate-100 hover:bg-sky-50 fx-focus-ring',
        'transition-all cursor-pointer',
      )}
    >
      <div
        className={clsx(
          'flex flex-col items-center justify-center px-4',
          'transition-colors text-action-primary-darker',
        )}
      >
        <PlusIcon className="block h-6 w-6 text-base flex-shrink-0" />
        <div className="text-sm md:text-base">Add Video</div>
      </div>
    </button>
  )
}

export const VideoActionGallery: React.FC<VideoActionGalleryProps> = ({ videos }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {videos?.map((video) => (
        <VideoItem key={video.uuid} video={video} />
      ))}

      <AddVideoItem />
    </div>
  )
}
