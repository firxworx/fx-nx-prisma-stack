import React, { useCallback } from 'react'
import clsx from 'clsx'

import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { XCircleIcon } from '@heroicons/react/20/solid'
import { RiPlayList2Line } from 'react-icons/ri'

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
  onManageVideosClick: React.MouseEventHandler
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
  SELECT_VIDEOS: 'Select Videos',
  MANAGE_PLAYLIST: 'Manage Videos',
  EDIT_PLAYLIST_NAME: 'Edit Name',
  EDIT_DETAILS: 'Edit Details',
  DELETE_PLAYLIST: 'Delete Playlist',
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
  onManageVideosClick,
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
        ['bg-sky-50 hover:bg-sky-100/75 border-sky-200']: isActive,
        ['bg-transparent hover:bg-sky-100/25']: !isActive,
      })}
    >
      <div className={clsx('flex items-center justify-center flex-shrink-0 py-4 pl-4 pr-2')}>
        <ToggleSwitch
          label="Toggle if this Video Group is active or not"
          toggleState={isActive}
          isLoading={isActiveToggleLoading}
          isLoadingAnimated={isActiveToggleLoadingAnimated}
          onToggleChange={onActiveToggleChange}
        />
      </div>
      <div
        className={clsx('group flex space-x-4 items-center w-full flex-1 pl-2 pr-2 cursor-pointer', cellPadding)}
        onClick={onManageVideosClick}
      >
        <div className="flex-1">
          <div
            className={clsx(
              'block mb-1 font-normal text-sm xs:text-base text-brand-primary-darkest leading-tight xs:leading-snug',
              // 'transition-all',
            )}
          >
            <div className="">{videoGroup.name}</div>
          </div>
          <div className="block text-sm leading-4 text-brand-primary-darkest/80">
            <VideoGroupSummary count={videoGroup.videos.length} />
          </div>
        </div>
        {/* <RiPlayList2Line className="hidden group-hover:inline-block h-5 w-5" aria-hidden="true" /> */}
      </div>
      <div className={clsx('flex items-center pl-2 space-x-4', cellPadding)}>
        <OptionsMenu
          items={[
            {
              label: LABELS.EDIT_PLAYLIST_NAME,
              SvgIcon: PencilSquareIcon,
              onClick: handleEditClick,
            },
            {
              label: LABELS.MANAGE_PLAYLIST,
              SvgIcon: RiPlayList2Line,
              onClick: onManageVideosClick,
            },
            {
              label: LABELS.DELETE_PLAYLIST,
              SvgIcon: XCircleIcon,
              onClick: handleDeleteClick,
            },
          ]}
        />
      </div>
    </li>
  )
}
