import React, { useCallback } from 'react'
import clsx from 'clsx'

import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { XCircleIcon } from '@heroicons/react/20/solid'

import type { ApiParentContext } from '../../../../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../../../../types/box-profiles.types'
import { VideoGroupDto } from '../../../../types/videos.types'
import { Spinner } from '../../../elements/feedback/Spinner'
import { OptionsMenu } from '../menus/OptionsMenu'

export interface VideoGroupsListItemProps {
  parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext']
  videoGroup: VideoGroupDto
  isActive: boolean
  onEditClick?: React.MouseEventHandler<HTMLAnchorElement>
  onDeleteClick?: React.MouseEventHandler<HTMLAnchorElement>
  onManageVideosClick?: React.MouseEventHandler<HTMLButtonElement>
}

const VideoDetails: React.FC<{ duration?: number; count: number }> = ({ duration, count }) => {
  return (
    <span>
      {duration ? `${duration} - ` : ''} {count} {`${count === 1 ? 'video' : 'videos'}`}
    </span>
  )
}

// const EditButton: React.FC = () => (
//   <button type="button">
//     <PencilSquareIcon className="h-5 w-5 text-slate-400 hover:text-brand-primary" />
//   </button>
// )

// const ManageButton: React.FC = () => (
//   <button type="button" className={clsx('flex justify-center items-center p-4', 'text-sm')}>
//     Manage Videos
//   </button>
// )

// const VideoList: React.FC = () => (
//   <ul className="mt-4 ml-4 list-disc list-inside text-brand-primary-darkest">
//     {videoGroup.videos.map((video) => (
//       <li key={video.uuid}>{video.name}</li>
//     ))}
//   </ul>
// )

const cellPadding = 'p-4'

export const VideoGroupItem: React.FC<VideoGroupsListItemProps> = ({
  parentContext,
  videoGroup,
  isActive,
  onEditClick,
  onDeleteClick,
  // onManageVideosClick,
}) => {
  const handleEditClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      if (typeof onEditClick === 'function') {
        onEditClick(event)
      }
    },
    [onEditClick],
  )

  const handleDeleteClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      if (typeof onDeleteClick === 'function') {
        onDeleteClick(event)
      }
    },
    [onDeleteClick],
  )

  /*
<Link
  href={`/app/[box]/videos/[videoGroup]`}
  as={`/app/${parentContext?.boxProfileUuid}/videos/${videoGroup.uuid}`}
>
  <a className={clsx('block w-full', cellPadding)}>
    <div className="block mb-1 font-normal text-base text-brand-primary-darkest leading-snug">
      <div className="mr-2">{videoGroup.name}</div>
    </div>
    <div className="block text-sm leading-4 text-brand-primary-darkest/80">
      <VideoDetails count={videoGroup.videos.length} />
    </div>
  </a>
</Link>
*/

  if (!parentContext?.boxProfileUuid) {
    return <Spinner />
  }

  // refer to parent with tailwind-preset custom class fx-set-parent-rounded-md for css border definitions
  return (
    <li
      className={clsx('relative flex flex-wrap', {
        ['bg-sky-50 border-blue-200']: isActive,
      })}
    >
      <div className={clsx('block w-full flex-1', cellPadding)}>
        <div className="block mb-1 font-normal text-base text-brand-primary-darkest leading-snug">
          <div className="mr-2">{videoGroup.name}</div>
        </div>
        <div className="block text-sm leading-4 text-brand-primary-darkest/80">
          <VideoDetails count={videoGroup.videos.length} />
        </div>
      </div>
      <div className={clsx('flex items-center space-x-2', cellPadding)}>
        <button
          type="button"
          className={clsx(
            'inline-flex items-center px-4 py-2 rounded-md border bg-white',
            'font-medium tracking-tight text-brand-primary-darkest shadow-sm', // text-slate-700
            'fx-focus-ring-form hover:bg-slate-50 hover:border-brand-primary-darker/30',
            'border-slate-300 text-sm',
            // 'border-brand-primary',
            'transition-colors focus:bg-sky-50 focus:text-brand-primary-darker',
          )}
        >
          Videos
        </button>
        {isActive ? (
          <div
            className={clsx(
              'inline-flex justify-center items-center px-4 py-2 border rounded-md border-slate-300 w-24',
              'font-medium tracking-tight text-slate-400',
              'fx-focus-ring-form cursor-default bg-slate-100 text-sm',
              'transition-colors focus:bg-sky-50 focus:text-brand-primary-darker',
            )}
          >
            Active
          </div>
        ) : (
          <button
            type="button"
            className={clsx(
              'inline-flex items-center px-4 py-2 rounded-md border bg-white w-24',
              'font-medium tracking-tight text-brand-primary-darkest shadow-sm',
              'fx-focus-ring-form hover:bg-slate-50 hover:border-brand-primary-darker/30',
              'border-slate-300 text-sm',
              'transition-colors focus:bg-sky-50 focus:text-brand-primary-darker',
            )}
          >
            Set Active
          </button>
        )}
        <OptionsMenu
          items={[
            {
              label: 'Edit Details',
              SvgIcon: PencilSquareIcon,
              onClick: handleEditClick,
            },
            {
              label: 'Delete Video Group',
              SvgIcon: XCircleIcon,
              onClick: handleDeleteClick,
            },
          ]}
        />
      </div>
    </li>
  )
}
