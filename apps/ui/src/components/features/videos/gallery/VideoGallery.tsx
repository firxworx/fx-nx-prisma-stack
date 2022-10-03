import React, { useCallback } from 'react'
import clsx from 'clsx'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { PlusIcon } from '@heroicons/react/24/outline'

import { VideoDto } from '../../../../types/videos.types'
import { VideoThumbnail } from '../VideoThumbnail'

export interface VideoGalleryProps {
  videos: Exclude<VideoDto, 'video'>[]
  onEditVideoClick: (videoUuid: string, event: React.MouseEvent<HTMLDivElement>) => void
  onAddVideoClick?: React.MouseEventHandler<HTMLButtonElement>
  onDeleteVideoClick?: (videoUuid: string, event: React.MouseEvent<HTMLButtonElement>) => void
}

export interface VideoItemProps {
  video: Pick<VideoDto, 'name' | 'externalId' | 'platform'>
  onEditVideoClick?: React.MouseEventHandler<HTMLDivElement>
  onDeleteVideoClick?: React.MouseEventHandler<HTMLButtonElement>
}

export interface VideoDeleteButtonProps {
  variant: 'full' | 'top-right-corner'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export interface VideoCaptionProps {
  video: VideoItemProps['video']
  hasBorder?: boolean
}

/**
 * Inner-component (child) of video item delete button with border + 'x' icon.
 */
export const VideoDeleteIconButton: React.FC = () => {
  return (
    <div
      className={clsx(
        'flex items-center justify-center p-2 border rounded-md',
        'bg-slate-100 group-hover:bg-white text-error-600 bg-opacity-85',
        'border-error-600 border-opacity-90 group-hover:border-opacity-100',
        'group-hover:bg-opacity-100 group-focus:bg-white',
        'transition-colors group-focus-visible:ring-2 group-focus-visible:ring-sky-200',
      )}
    >
      <span className="sr-only">Delete Video</span>
      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
    </div>
  )
}

/**
 * Delete button for individual videos in the gallery.
 * Implemented with absolute positioning so a parent with relative positioning is required.
 *
 * Set `variant` to 'top-right-corner' for top right, and 'full' for a full-height + full-width overlay.
 */
export const VideoDeleteButton: React.FC<VideoDeleteButtonProps> = ({ variant, onClick }) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (typeof onClick === 'function') {
      onClick(event)
    }

    event.stopPropagation()
  }

  if (variant === 'top-right-corner') {
    return (
      <button type="button" className="absolute group isolate top-0 right-0" onClick={handleClick}>
        <div className="p-1 xs:p-2">
          <VideoDeleteIconButton />
        </div>
      </button>
    )
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        className={clsx('absolute group isolate h-full w-full inset-0 flex justify-end', 'focus:outline-none')}
        onClick={handleClick}
      >
        <VideoDeleteIconButton />
      </button>
    )
  }

  return null
}

/**
 * Grayscale + opacity filter for video gallery item thumbnails.
 */
const GrayFilter: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="opacity-75 group-hover:opacity-100 filter grayscale-75 group-hover:grayscale-0 w-full h-full transition-all">
    {children}
  </div>
)

// /**
//  * Full height + width absolute positioned "cover box" wrapper for video items in a gallery.
//  * Renders a border with consistent round corners and _no_ 1-2px gaps (although there is minor
//  * but tolerable spillover from underlying elements at different scales).
//  *
//  * This component is a workaround for having borders around video items that render with gaps,
//  * presumably due to grid + 16:9 ratio, which appears only when borders are applied.
//  */
// const AbsoluteRoundBorder: React.FC<React.PropsWithChildren> = ({ children }) => {
//   return (
//     <div
//       className={clsx(
//         'absolute h-full w-full inset-0',
//         'flex justify-center items-end',
//         'rounded-md border',
//         'border-slate-200 group-hover:border-slate-300',
//       )}
//     >
//       {children}
//     </div>
//   )
// }

/**
 * Video thumb caption that displays video name.
 */
const VideoCaption: React.FC<VideoCaptionProps> = ({ video, hasBorder }) => {
  const borderClassName = clsx('border-b border-l border-r border-slate-200 group-hover:border-slate-400')

  return (
    <div
      className={clsx(
        'absolute bottom-0 left-0 right-0 text-sm sm:text-base px-2 py-2 sm:px-4 sm:py-4 bg-slate-700 bg-opacity-85',
        'group-hover:bg-opacity-60 transition-all',
        'rounded-bl-md rounded-br-md',
        'text-white',
        {
          [borderClassName]: hasBorder,
          // ['border-2 border-transparent']: !hasBorder,
        },
      )}
    >
      <span className="group-hover:[text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">{video.name}</span>
    </div>
  )
}

/**
 * Action button styled as a skeleton video thumbnail per the Video Gallery component.
 * Faciliates having an 'Add Video' button as the last item in a video gallery.
 *
 * @see VideoGallery
 */
export const VideoGalleryAddVideoButton: React.FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> }> = ({
  onClick,
}) => {
  return (
    <button
      type="button"
      className={clsx(
        'group w-full rounded-md aspect-w-16 aspect-h-9 isolate border-2 overflow-hidden',
        'bg-slate-100 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-200',
        'transition-all cursor-pointer fx-focus-ring',
      )}
      onClick={onClick}
    >
      <div
        className={clsx(
          'flex flex-col items-center justify-center px-4',
          'transition-colors text-action-primary-darker group-hover:text-action-primary-darkest',
        )}
      >
        <PlusIcon className="block h-6 w-6 flex-shrink-0 text-base" />
        <div className="text-sm md:text-base">Add Video</div>
      </div>
    </button>
  )
}

/**
 * Individual video (item) in a `VideoGallery` with a caption and a delete button.
 *
 * @see VideoGallery
 */
export const VideoItem: React.FC<VideoItemProps> = ({ video, onEditVideoClick, onDeleteVideoClick }) => {
  const handleEditVideoClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (typeof onEditVideoClick === 'function') {
      onEditVideoClick(event)
    }
  }

  const handleDeleteVideoClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (typeof onDeleteVideoClick === 'function') {
      onDeleteVideoClick(event)
    }
  }

  return (
    <div className="flex justify-center items-center w-full">
      <div
        className={clsx(
          'relative w-full aspect-w-16 aspect-h-9', // object-cover
        )}
      >
        <div className="cursor-pointer">
          <div className="rounded-md overflow-hidden h-full" onClick={handleEditVideoClick}>
            <div className="group h-full">
              <GrayFilter>
                <VideoThumbnail externalId={video.externalId} />
              </GrayFilter>
              <VideoCaption video={video} hasBorder={false} />
              {/* <AbsoluteRoundBorder /> */}
            </div>
            {typeof onDeleteVideoClick === 'function' && (
              <VideoDeleteButton variant="top-right-corner" onClick={handleDeleteVideoClick} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Video Gallery component that renders video thumbnails for each of the given videos,
 * each with CRUD actions.
 */
export const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  onEditVideoClick,
  onAddVideoClick,
  onDeleteVideoClick,
}) => {
  const handleEditVideoClick = useCallback(
    (videoUuid: string): React.MouseEventHandler<HTMLDivElement> =>
      (event) => {
        if (typeof onEditVideoClick === 'function') {
          onEditVideoClick(videoUuid, event)
        }
      },
    [onEditVideoClick],
  )

  const handleDeleteVideoClick = useCallback(
    (videoUuid: string): React.MouseEventHandler<HTMLButtonElement> =>
      (event) => {
        if (typeof onDeleteVideoClick === 'function') {
          onDeleteVideoClick(videoUuid, event)
        }
      },
    [onDeleteVideoClick],
  )

  const handleAddVideoClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (typeof onAddVideoClick === 'function') {
        onAddVideoClick(event)
      }
    },
    [onAddVideoClick],
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-4">
      {videos?.map((video) => (
        <VideoItem
          key={video.uuid}
          video={video}
          onEditVideoClick={handleEditVideoClick(video.uuid)}
          onDeleteVideoClick={handleDeleteVideoClick(video.uuid)}
        />
      ))}
      {typeof onAddVideoClick === 'function' && <VideoGalleryAddVideoButton onClick={handleAddVideoClick} />}
    </div>
  )
}
