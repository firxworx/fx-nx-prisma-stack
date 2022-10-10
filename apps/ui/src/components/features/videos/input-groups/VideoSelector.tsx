import React, { ChangeEvent, useEffect, useState } from 'react'
import clsx from 'clsx'

import { CheckIcon } from '@heroicons/react/24/outline'

import type { VideoDto } from '../../../../types/videos.types'
import { SearchSortInput } from '../../../elements/inputs/SearchSortInput'
import { VideoThumbnail } from '../VideoThumbnail'

export interface VideoSelectorProps {
  videos: VideoDto[]
  initialSelectedVideoUuids: string[]
  appendClassName?: string

  /** Max height of the items list as a number in vh units (e.g. `40`). */
  itemsListMinViewportHeight?: number

  /** Max height of the items list as a number in vh units (e.g. `40`). */
  itemsListMaxViewportHeight: number

  onVideoSelectionChange?: (videoUuids: string[]) => void
}

export interface VideoItemProps {
  name: string
  externalId: string
  isSelected: boolean
  onVideoClick: React.MouseEventHandler<HTMLDivElement>
}

const VideoItem: React.FC<VideoItemProps> = ({ name, externalId, isSelected, onVideoClick }) => {
  return (
    <div
      className={clsx(
        'relative min-w-0 flex items-center p-2 rounded-md overflow-hidden transition-all cursor-pointer',
        {
          ['bg-slate-300 hover:bg-slate-400/50']: isSelected,
          ['bg-slate-100 hover:bg-slate-200/75']: !isSelected,
        },
      )}
      onClick={onVideoClick}
    >
      <div
        className={clsx(
          // w-24 h-[3.375rem] has a 16:9 aspect ratio
          // w-12 h-[1.6875rem] ""
          'relative flex justify-center items-center flex-shrink-0 w-24 h-[3.375rem] rounded-md overflow-hidden',
          'bg-slate-300 transition-all',
        )}
      >
        {/* <div>IMG</div> */}
        <VideoThumbnail externalId={externalId} />
        <div
          className={clsx(
            'absolute justify-center items-center top-0 left-0 w-full h-full',
            'bg-slate-600 bg-opacity-50',
            {
              ['flex']: isSelected,
              ['hidden']: !isSelected,
            },
          )}
        >
          <div className="p-2 rounded-full bg-white bg-opacity-80">
            <CheckIcon className="h-5 w-5 text-slate-800" />
          </div>
        </div>
      </div>
      <div className="px-2 min-w-0 text-sm leading-[1.25]">
        {/* 50 chars fits 3 lines (when 2 column grid) w/ likely font faces with all-caps */}
        {/* 100 chars fits 2 lines (when 1 column grid) on most screens w/ likely font faces with all-caps */}
        {/* @future could use js measured screen size or otherwise dynamically truncate via js */}
        <span className="inline-block md:hidden">
          {name.substring(0, 100).trim()}
          {name.length > 100 && <>&hellip;</>}
        </span>
        <span className="hidden md:inline-block">
          {name.substring(0, 50).trim()}
          {name.length > 50 && <>&hellip;</>}
        </span>
      </div>
    </div>
  )
}

const pluralize = (input: string, count: number): string => {
  return `${input}${count === 1 ? '' : 's'}`
}

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  videos,
  itemsListMinViewportHeight,
  itemsListMaxViewportHeight,
  initialSelectedVideoUuids,
  appendClassName,
  onVideoSelectionChange,
}) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>(initialSelectedVideoUuids)
  const [query, setQuery] = useState('')

  const filteredVideos =
    query === ''
      ? videos
      : videos.filter((video) =>
          video.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, '')),
        )

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value)
  }

  const handleSelectVideo =
    (selectedVideoUuid: string): React.MouseEventHandler<HTMLDivElement> =>
    () => {
      setSelectedVideos((uuids) => {
        const filtered = uuids.filter((uuid) => uuid !== selectedVideoUuid)

        if (filtered.length < uuids.length) {
          return filtered
        }

        filtered.push(selectedVideoUuid)
        return filtered
      })
    }

  useEffect(() => {
    if (typeof onVideoSelectionChange === 'function') {
      onVideoSelectionChange(selectedVideos)
    }
  }, [onVideoSelectionChange, selectedVideos, selectedVideos.length])

  if (itemsListMinViewportHeight && (itemsListMinViewportHeight < 0 || itemsListMinViewportHeight > 100)) {
    throw Error('Invalid value for VideoSelector items list min viewport height: unit must be a valid vh unit.')
  }

  if (itemsListMaxViewportHeight < 0 || itemsListMaxViewportHeight > 100) {
    throw Error('Invalid value for VideoSelector items list max viewport height: unit must be a valid vh unit.')
  }

  const itemsListMinMaxHeightStyle = {
    maxHeight: `${itemsListMaxViewportHeight}vh`,
    ...(itemsListMinViewportHeight ? { minHeight: `${itemsListMinViewportHeight}vh` } : {}),
  }

  return (
    <div className={clsx('w-full', appendClassName)}>
      <div>
        <SearchSortInput
          label="Filter Videos"
          placeholder="Filter Videos"
          onSearchInputChange={handleSearchInputChange}
          onSortAscClick={(): void => alert('asc')}
          onSortDescClick={(): void => alert('desc')}
        />
      </div>
      <div
        className={clsx(
          'block xxs:flex xxs:justify-between xxs:space-x-4 my-1 xxs:my-2 p-2 rounded-md',
          'text-xs text-slate-600 text-center bg-transparent',
        )}
      >
        <div className={clsx('italic')}>
          {filteredVideos.length === videos.length
            ? `Displaying ${videos.length} videos`
            : filteredVideos.length === 0
            ? 'No matches found'
            : `Displaying ${filteredVideos.length} ${pluralize('match', filteredVideos.length)} of ${
                videos.length
              } videos`}
        </div>
        <div>{`${selectedVideos.length} ${pluralize('Video', selectedVideos.length)}`} Selected</div>
      </div>
      {filteredVideos.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-2 auto-rows-max overflow-y-scroll"
          style={itemsListMinMaxHeightStyle}
        >
          {filteredVideos.map((video) => (
            <VideoItem
              key={video.uuid}
              name={video.name}
              externalId={video.externalId}
              isSelected={!!selectedVideos.find((uuid) => uuid === video.uuid)}
              onVideoClick={handleSelectVideo(video.uuid)}
            />
          ))}
        </div>
      )}
      {filteredVideos.length === 0 && (
        <div
          className="flex justify-center items-center text-sm text-slate-500 italic"
          style={itemsListMinMaxHeightStyle}
        >
          {videos.length === 0 ? 'No videos to display.' : 'No matches found.'}
        </div>
      )}
    </div>
  )
}
