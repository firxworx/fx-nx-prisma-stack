import { useCallback, useState } from 'react'

import type { ApiParentContext } from '../../../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../../../types/box-profiles.types'
import { useVideoDeleteQuery, useVideoQuery, useVideosQuery } from '../../../api/hooks/videos'
import { useModalContext } from '../../../context/ModalContextProvider'
import { Spinner } from '../../elements/feedback/Spinner'
import { ModalVariant } from '../../elements/modals/ModalBody'
import { VideoForm } from './forms/VideoForm'
import { VideoGallery } from './gallery/VideoGallery'
import { ManagerControls } from './input-groups/ManagerControls'
import { useSearchFilter } from '../../../hooks/useSearchFilter'
import { VideoDto } from '../../../types/videos.types'

export interface VideosManagerProps {
  parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext']
}

/**
 * Comprehensive component for users to perform CRUD operations on Videos via a gallery-style interface.
 */
export const VideosManager: React.FC<VideosManagerProps> = ({ parentContext }) => {
  const [currentVideo, setCurrentVideo] = useState<string | undefined>(undefined)

  const { data: videos, ...videosQuery } = useVideosQuery({ parentContext: parentContext })
  const videoQuery = useVideoQuery({ parentContext, uuid: currentVideo })
  const videoDeleteQuery = useVideoDeleteQuery()

  const [handleSearchInputChange, searchResults] = useSearchFilter<VideoDto>('name', videos ?? [])

  // console.log(`videomanager render (total videos: ${videos?.length ?? 0})`)

  const [showAddVideoModal] = useModalContext(
    {
      title: 'Add Video',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoForm
        parentContext={parentContext}
        create={{
          onSuccess: (): void => {
            hideModal()
          },
        }}
      />
    ),
  )

  const [showEditVideoModal] = useModalContext(
    {
      title: 'Edit Video',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoForm
        parentContext={parentContext}
        mutate={{
          data: videoQuery.data,
          onSuccess: (): void => {
            hideModal()
          },
        }}
      />
    ),
    [parentContext, videoQuery.data],
  )

  const handleEditVideoClick = useCallback(
    (uuid: string, _event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
      setCurrentVideo(uuid)
      showEditVideoModal()
    },
    [showEditVideoModal],
  )

  const handleDeleteVideoClick = useCallback(
    (uuid: string, _event: React.MouseEvent): void => {
      videoDeleteQuery.mutate({ parentContext: parentContext, uuid })
    },
    [parentContext, videoDeleteQuery],
  )

  return (
    <>
      {videosQuery.isError && <p>Error fetching data</p>}
      {videoDeleteQuery.error && <p>Error deleting video</p>}
      {videosQuery.isLoading && <Spinner />}
      {videosQuery.isSuccess && !!videos?.length && (
        <>
          <div className="mb-4 mt-2">
            <ManagerControls
              labels={{
                search: {
                  inputLabel: 'Keyword Filter',
                  inputPlaceholder: 'Keyword Filter',
                },
                actions: {
                  addButtonCaption: 'Add Video',
                },
              }}
              onAddClick={showAddVideoModal}
              onSortAscClick={(): void => alert('asc')}
              onSortDescClick={(): void => alert('desc')}
              onSearchInputChange={handleSearchInputChange}
            />
          </div>
          <VideoGallery
            videos={searchResults}
            onAddVideoClick={showAddVideoModal}
            onEditVideoClick={handleEditVideoClick}
            onDeleteVideoClick={handleDeleteVideoClick}
          />
        </>
      )}
      {videosQuery.isSuccess && !videos?.length && (
        <div className="flex items-center border-2 border-dashed rounded-md p-4">
          <div className="text-slate-600">No videos found.</div>
        </div>
      )}
    </>
  )
}
