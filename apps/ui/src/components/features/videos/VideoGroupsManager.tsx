import { useCallback, useState } from 'react'

import type { VideoDto, VideoGroupDto } from '../../../types/videos.types'
import {
  useVideoGroupCreateQuery,
  useVideoGroupDeleteQuery,
  useVideoGroupMutateQuery,
  useVideoGroupQuery,
  useVideoGroupsQuery,
} from '../../../api/hooks/video-groups'
import { useModalContext } from '../../../context/ModalContextProvider'
import { ModalVariant } from '../../elements/modals/ModalBody'
import { VideoGroupForm } from './forms/VideoGroupForm'
import { Spinner } from '@firx/react-feedback'
import { VideoGroupItem } from './input-groups/VideoGroupsListItem'
import { ManagerControls } from './input-groups/ManagerControls'
import { useSearchFilter } from '../../../hooks/useSearchFilter'
import { VideoSelector } from './input-groups/VideoSelector'
import { useVideosQuery } from '../../../api/hooks/videos'
import { ActionButton } from '../../elements/inputs/ActionButton'

export interface VideoGroupsManagerProps {}

export interface VideoSelectorModalBodyProps {
  videoGroup: VideoGroupDto | undefined
  videos: VideoDto[]
  onSaveVideoSelectionAsync: (videoUuids: string[]) => Promise<void>
}

const VideoSelectorModalBody: React.FC<VideoSelectorModalBodyProps> = ({
  videoGroup,
  videos,
  onSaveVideoSelectionAsync,
}) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])

  const handleChangeVideoSelection = useCallback((uuids: string[]): void => {
    setSelectedVideos([...uuids])
  }, [])

  if (!videoGroup) {
    return null
  }

  return (
    <>
      <VideoSelector
        videos={videos ?? []}
        initialSelectedVideoUuids={videoGroup.videos.map((v) => v.uuid)}
        itemsListMinViewportHeight={40}
        itemsListMaxViewportHeight={40}
        onVideoSelectionChange={handleChangeVideoSelection}
      />
      <ActionButton
        appendClassName="mt-4 sm:mt-6"
        // isSubmitting={videoGroupMutateQuery.isLoading}
        onClick={async (): Promise<void> => {
          await onSaveVideoSelectionAsync(selectedVideos)
        }}
      >
        Save
      </ActionButton>
    </>
  )
}

/**
 * Comprehensive component for users to perform CRUD operations on Video Groups and manage the
 * associations of Video <-> Video Group entities.
 */
export const VideoGroupsManager: React.FC<VideoGroupsManagerProps> = () => {
  const [currentVideoGroupUuid, setCurrentVideoGroupUuid] = useState<string | undefined>(undefined)

  const { data: videos } = useVideosQuery()
  const { data: videoGroups, ...videoGroupsQuery } = useVideoGroupsQuery()
  const { data: currentVideoGroup } = useVideoGroupQuery(
    { uuid: currentVideoGroupUuid },
    videoGroups?.find((vg) => vg.uuid === currentVideoGroupUuid),
  )
  const { mutateAsync: createVideoGroupAsync } = useVideoGroupCreateQuery()
  const { mutateAsync: mutateVideoGroupAsync, ...videoGroupMutateQuery } = useVideoGroupMutateQuery()
  const { mutate: deleteVideoGroup, ...videoGroupDeleteQuery } = useVideoGroupDeleteQuery()

  const [handleSearchInputChange, searchResults] = useSearchFilter<VideoGroupDto>('name', videoGroups ?? [])

  const [showAddVideoGroupModal] = useModalContext(
    {
      title: 'New Playlist',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupForm
        videos={videos ?? []}
        create={{
          onCreateAsync: async (formValues): Promise<void> => {
            await createVideoGroupAsync({
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
  )

  const [showEditVideoGroupModal] = useModalContext(
    {
      title: 'Edit Playlist',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupForm
        videos={videos ?? []}
        mutate={{
          data: currentVideoGroup,
          onMutateAsync: async (formValues): Promise<void> => {
            if (!currentVideoGroupUuid) {
              return
            }

            await mutateVideoGroupAsync({
              uuid: currentVideoGroupUuid,
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
    [currentVideoGroup],
  )

  const [showVideoSelectorModal] = useModalContext(
    {
      title: 'Video Playlist',
      subtitle: currentVideoGroup?.name,
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <>
        <VideoSelectorModalBody
          videoGroup={currentVideoGroup}
          videos={videos ?? []}
          onSaveVideoSelectionAsync={async (videoUuids): Promise<void> => {
            if (!currentVideoGroupUuid) {
              return
            }

            await mutateVideoGroupAsync({ uuid: currentVideoGroupUuid, videos: videoUuids })
            hideModal()
          }}
        />
      </>
    ),
    [currentVideoGroup, videos, videoGroups],
  )

  const handleChangeActiveVideoGroup = useCallback(
    (uuid: string): ((enabled: boolean) => void) =>
      (enabled) => {
        mutateVideoGroupAsync({ uuid, enabled })
      },
    [mutateVideoGroupAsync],
  )

  const handleEditVideoGroup = useCallback(
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
      (_event) => {
        setCurrentVideoGroupUuid(uuid)
        showEditVideoGroupModal()
      },
    [showEditVideoGroupModal],
  )

  const handleManagePlaylist = useCallback(
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
      () => {
        setCurrentVideoGroupUuid(uuid)
        showVideoSelectorModal()
      },
    [showVideoSelectorModal],
  )

  const handleDeleteVideoGroup = useCallback(
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
      (_event) => {
        deleteVideoGroup({
          uuid,
        })
      },
    [deleteVideoGroup],
  )

  return (
    <>
      {videoGroupsQuery.isError && <p>Error fetching data</p>}
      {videoGroupDeleteQuery.error && <p>Error deleting video group</p>}
      {videoGroupsQuery.isLoading && <Spinner />}
      {videoGroupsQuery.isSuccess && !!videoGroups?.length && (
        <div className="">
          <div className="mb-6">
            <ManagerControls
              labels={{
                search: {
                  inputLabel: 'Keyword Filter',
                  inputPlaceholder: 'Keyword Filter',
                },
                actions: {
                  addButtonCaption: 'Playlist',
                },
              }}
              onAddClick={showAddVideoGroupModal}
              onSearchInputChange={handleSearchInputChange}
              onSortAscClick={(): void => alert('asc - implemenation TBD')} // @todo sort asc implementation TBD (VG)
              onSortDescClick={(): void => alert('desc - implementation TBD')} // @todo sort desc implementation TBD (VG)
            />
          </div>
          <ul role="list" className="relative fx-stack-set-parent-rounded-border-divided-children">
            {searchResults?.map((videoGroup) => (
              <VideoGroupItem
                key={videoGroup.uuid}
                videoGroup={videoGroup}
                isActive={!!videoGroup.enabledAt}
                isActiveToggleLoading={videoGroupMutateQuery.isLoading} // disable all toggles
                isActiveToggleLoadingAnimated={
                  // animate only the toggle that was changed by the user so as not to overdo the effect
                  videoGroupMutateQuery.isLoading && videoGroupMutateQuery.variables?.uuid === videoGroup.uuid
                }
                onEditClick={handleEditVideoGroup(videoGroup.uuid)}
                onDeleteClick={handleDeleteVideoGroup(videoGroup.uuid)}
                onActiveToggleChange={handleChangeActiveVideoGroup(videoGroup.uuid)}
                onManageVideosClick={handleManagePlaylist(videoGroup.uuid)}
              />
            ))}
          </ul>
        </div>
      )}
      {videoGroupsQuery.isSuccess && (!videoGroups?.length || !searchResults.length) && (
        <div className="flex items-center border-2 border-dashed rounded-md p-4">
          <div className="text-slate-600">No playlists found.</div>
        </div>
      )}
    </>
  )
}
