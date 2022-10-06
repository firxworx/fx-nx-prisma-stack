import React, { ChangeEvent, useState } from 'react'
import clsx from 'clsx'

import { CheckIcon } from '@heroicons/react/24/outline'

import type { VideoDto } from '../../../../types/videos.types'
import { SearchSortInput } from '../../../elements/inputs/SearchSortInput'

export interface VideoSelectorProps {
  videos: VideoDto[]
  appendClassName?: string
  // onVideoSelect: () => void
}

export interface VideoItemProps {
  name: string
  isSelected: boolean
  onVideoClick: React.MouseEventHandler<HTMLDivElement>
}

const VideoItem: React.FC<VideoItemProps> = ({ name, isSelected, onVideoClick }) => {
  return (
    <div
      className={clsx('relative flex items-center p-2 rounded-md overflow-hidden transition-colors cursor-pointer', {
        ['bg-slate-300 hover:bg-slate-400/50']: isSelected,
        ['bg-slate-100 hover:bg-slate-200/75']: !isSelected,
      })}
      onClick={onVideoClick}
    >
      <div
        className={clsx(
          // w-24 h-[3.375rem] has a 16:9 aspect ratio
          'relative flex justify-center items-center w-24 h-[3.375rem] rounded-md overflow-hidden',
          'bg-slate-300 transition-all',
        )}
      >
        <div>IMG</div>
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
      <div className={clsx('p-2 text-sm text-ellipsis')}>{name}</div>
    </div>
  )
}

const pluralize = (input: string, count: number): string => {
  return `${input}${count === 1 ? '' : 's'}`
}

export const VideoSelector: React.FC<VideoSelectorProps> = ({ videos, appendClassName }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [query, setQuery] = useState('')

  const filteredVideos =
    query === ''
      ? videos
      : videos.filter((video) =>
          video.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, '')),
        )

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    // console.log(event.target.value)
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

  return (
    <div className={clsx('w-full', appendClassName)}>
      <div>
        <SearchSortInput
          label="Filter Videos"
          placeholder="Filter Videos"
          // appendClassName="mx-auto"
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
            : `Displaying ${filteredVideos.length} ${pluralize('match', filteredVideos.length)} out of ${
                videos.length
              } videos`}
        </div>
        <div>{`${selectedVideos.length} ${pluralize('Video', selectedVideos.length)}`} Selected</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto">
        {filteredVideos.map((video) => (
          <VideoItem
            key={video.uuid}
            name={video.name}
            isSelected={!!selectedVideos.find((uuid) => uuid === video.uuid)}
            onVideoClick={handleSelectVideo(video.uuid)}
          />
        ))}
      </div>
    </div>
  )
}
