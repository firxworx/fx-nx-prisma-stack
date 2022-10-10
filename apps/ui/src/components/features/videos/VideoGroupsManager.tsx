import { useCallback, useState } from 'react'

import type { ApiParentContext } from '../../../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../../../types/box-profiles.types'
import type { VideoDto, VideoGroupDto } from '../../../types/videos.types'
import {
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

export interface VideoGroupsManagerProps {
  parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext']
}

export interface VideoSelectorModalBodyProps {
  parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext']
  videoGroup: VideoGroupDto | undefined
  videos: VideoDto[]
  onSaveOrCloseClick: () => void
}

const VideoSelectorModalBody: React.FC<VideoSelectorModalBodyProps> = ({
  parentContext,
  videoGroup,
  videos,
  onSaveOrCloseClick,
}) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const { mutateAsync: mutateVideoGroupAsync, ...videoGroupMutateQuery } = useVideoGroupMutateQuery()

  const handleChangeVideoSelection = useCallback((uuids: string[]): void => {
    setSelectedVideos([...uuids])
  }, [])

  const handleSaveVideoSelection = async (): Promise<void> => {
    if (!videoGroup) {
      return
    }

    await mutateVideoGroupAsync({ parentContext: parentContext, uuid: videoGroup.uuid, videos: [...selectedVideos] })
    onSaveOrCloseClick()
  }

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
        isSubmitting={videoGroupMutateQuery.isLoading}
        onClick={handleSaveVideoSelection}
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
export const VideoGroupsManager: React.FC<VideoGroupsManagerProps> = ({ parentContext }) => {
  const [currentVideoGroupUuid, setCurrentVideoGroupUuid] = useState<string | undefined>(undefined)

  const { data: videos } = useVideosQuery({ parentContext: parentContext })
  const { data: videoGroups, ...videoGroupsQuery } = useVideoGroupsQuery({ parentContext: parentContext })
  const { data: currentVideoGroup } = useVideoGroupQuery(
    { parentContext, uuid: currentVideoGroupUuid },
    videoGroups?.find((vg) => vg.uuid === currentVideoGroupUuid),
  )

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
        parentContext={parentContext}
        create={{
          onSuccess: (): void => {
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
        parentContext={parentContext}
        mutate={{
          data: currentVideoGroup,
          onSuccess: (): void => {
            hideModal()
          },
        }}
      />
    ),
    [parentContext, currentVideoGroup],
  )

  const [showVideoSelectorModal] = useModalContext(
    {
      title: 'Video Playlist',
      subtitle: currentVideoGroup?.name,
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoSelectorModalBody
        parentContext={parentContext}
        videoGroup={currentVideoGroup}
        videos={videos ?? []}
        onSaveOrCloseClick={hideModal}
      />
    ),
    [parentContext, currentVideoGroup, videos, videoGroups],
  )

  const handleChangeActiveVideoGroup = useCallback(
    (uuid: string): ((enabled: boolean) => void) =>
      (enabled) => {
        mutateVideoGroupAsync({ parentContext: parentContext, uuid, enabled })
      },
    [parentContext, mutateVideoGroupAsync],
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
          parentContext,
          uuid,
        })
      },
    [parentContext, deleteVideoGroup],
  )

  return (
    <>
      {videoGroupsQuery.isError && <p>Error fetching data</p>}
      {videoGroupDeleteQuery.error && <p>Error deleting video group</p>}
      {videoGroupsQuery.isLoading && <Spinner />}
      {videoGroupsQuery.isSuccess && !!videoGroups?.length && !!parentContext?.boxProfileUuid && (
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
                parentContext={parentContext}
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
          <div className="text-slate-600">No video groups found.</div>
        </div>
      )}
    </>
  )
}
