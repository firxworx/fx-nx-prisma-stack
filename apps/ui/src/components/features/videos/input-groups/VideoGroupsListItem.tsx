import React, { useCallback } from 'react'
import clsx from 'clsx'

import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { XCircleIcon } from '@heroicons/react/20/solid'

import type { ApiParentContext } from '../../../../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../../../../types/box-profiles.types'
import { VideoGroupDto } from '../../../../types/videos.types'
import { Spinner } from '../../../elements/feedback/Spinner'
import { OptionsMenu } from '../menus/OptionsMenu'
import { ToggleSwitch, ToggleSwitchProps } from '../../../elements/inputs/ToggleSwitch'

export interface VideoGroupsListItemProps {
  parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext']
  videoGroup: VideoGroupDto
  isActive: boolean
  isActiveToggleLoading?: boolean
  isActiveToggleLoadingAnimated?: boolean
  onEditClick?: React.MouseEventHandler<HTMLAnchorElement>
  onDeleteClick?: React.MouseEventHandler<HTMLAnchorElement>
  onManageVideosClick?: React.MouseEventHandler<HTMLButtonElement>
  onActiveToggleChange: ToggleSwitchProps['onToggleChange']
}

interface VideoGroupSummaryProps {
  duration?: number
  count: number
}

/**
 * Display basic Video Group stats inline. Part of `VideoGroupsListItem`.
 */
const VideoGroupSummary: React.FC<VideoGroupSummaryProps> = ({ duration, count }) => {
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

const LABELS = {
  VIDEOS: 'Videos',
  EDIT_DETAILS: 'Edit Details',
  DELETE_VIDEO_GROUP: 'Delete Video Group',
}

const cellPadding = 'p-4'

export const VideoGroupItem: React.FC<VideoGroupsListItemProps> = ({
  parentContext,
  videoGroup,
  isActive,
  isActiveToggleLoading,
  isActiveToggleLoadingAnimated,
  onEditClick,
  onDeleteClick,
  onActiveToggleChange,
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

  return (
    <li
      // for css border definitions refer to parent ul.fx-set-parent-rounded-md (custom class in tailwind-preset)
      className={clsx('relative flex flex-wrap transition-colors', {
        ['bg-sky-50 border-sky-200']: isActive,
      })}
    >
      <div className={clsx('flex items-center justify-center flex-shrink-0 py-4 pl-4')}>
        <ToggleSwitch
          label="Toggle if this Video Group is active or not"
          toggleState={isActive}
          isLoading={isActiveToggleLoading}
          isLoadingAnimated={isActiveToggleLoadingAnimated}
          onToggleChange={onActiveToggleChange}
        />
      </div>
      <div className={clsx('block w-full flex-1', cellPadding)}>
        <div className="block mb-1 font-normal text-base text-brand-primary-darkest leading-snug">
          <div className="mr-2">{videoGroup.name}</div>
        </div>
        <div className="block text-sm leading-4 text-brand-primary-darkest/80">
          <VideoGroupSummary count={videoGroup.videos.length} />
        </div>
      </div>
      <div className={clsx('flex items-center space-x-2', cellPadding)}>
        <button
          type="button"
          className={clsx(
            'inline-flex items-center px-4 py-2 rounded-md border bg-white',
            'font-medium tracking-tight text-brand-primary-darkest shadow-sm',
            'fx-focus-ring-form hover:bg-slate-50 hover:border-brand-primary-darker/30',
            'border-slate-300 text-sm',
            'transition-colors focus:bg-sky-50 focus:text-brand-primary-darker',
          )}
        >
          {LABELS.VIDEOS}
        </button>
        <OptionsMenu
          items={[
            {
              label: LABELS.EDIT_DETAILS,
              SvgIcon: PencilSquareIcon,
              onClick: handleEditClick,
            },
            {
              label: LABELS.DELETE_VIDEO_GROUP,
              SvgIcon: XCircleIcon,
              onClick: handleDeleteClick,
            },
          ]}
        />
      </div>
    </li>
  )
}
