import { useCallback, useState } from 'react'

import { Spinner } from '@firx/react-feedback'
import {
  useVideoCreateQuery,
  useVideoDeleteQuery,
  useVideoMutateQuery,
  useVideoQuery,
  useVideosQuery,
} from '../../../api/hooks/videos'
import { useModalContext } from '../../../context/ModalContextProvider'
import { ModalVariant } from '../../elements/modals/ModalBody'
import { VideoForm } from './forms/VideoForm'
import { VideoGallery } from './gallery/VideoGallery'
import { ManagerControls } from './input-groups/ManagerControls'
import { useSearchFilter } from '../../../hooks/useSearchFilter'
import { VideoDto } from '../../../types/videos.types'
import { useVideoGroupsQuery } from '../../../api/hooks/video-groups'

export interface VideosManagerProps {}

/**
 * Comprehensive component for users to perform CRUD operations on Videos via a gallery-style interface.
 */
export const VideosManager: React.FC<VideosManagerProps> = () => {
  const [currentVideo, setCurrentVideo] = useState<string | undefined>(undefined)

  const { data: videos, ...videosQuery } = useVideosQuery()
  const videoQuery = useVideoQuery({ uuid: currentVideo })
  const { mutateAsync: createVideoAsync } = useVideoCreateQuery()
  const { mutateAsync: mutateVideoAsync } = useVideoMutateQuery()
  const videoDeleteQuery = useVideoDeleteQuery()

  const { data: videoGroups } = useVideoGroupsQuery()

  const [handleSearchInputChange, searchResults] = useSearchFilter<VideoDto>('name', videos ?? [])

  const [showAddVideoModal] = useModalContext(
    {
      title: 'Add Video',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoForm
        videoGroups={videoGroups ?? []}
        create={{
          onCreateAsync: async (formValues): Promise<void> => {
            await createVideoAsync({
              ...formValues,
            })

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
        videoGroups={videoGroups ?? []}
        mutate={{
          data: videoQuery.data,
          onMutateAsync: async (formValues): Promise<void> => {
            if (!currentVideo) {
              return
            }

            await mutateVideoAsync({
              uuid: currentVideo,
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
    [videoQuery.data],
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
      videoDeleteQuery.mutate({ uuid })
    },
    [videoDeleteQuery],
  )

  return (
    <>
      {videosQuery.isError && <p>Error fetching data</p>}
      {videoDeleteQuery.error && <p>Error deleting video</p>}
      {videosQuery.isLoading && <Spinner />}
      {videosQuery.isSuccess && !!videos?.length && (
        <>
          <div className="mb-6">
            <ManagerControls
              labels={{
                search: {
                  inputLabel: 'Keyword Filter',
                  inputPlaceholder: 'Keyword Filter',
                },
                actions: {
                  addButtonCaption: 'Video',
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
