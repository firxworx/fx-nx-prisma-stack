import { useCallback, useState } from 'react'

import type { ApiParentContext } from '../../../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../../../types/box-profiles.types'
import { useVideoGroupDeleteQuery, useVideoGroupQuery, useVideoGroupsQuery } from '../../../api/hooks/video-groups'
import { useModalContext } from '../../../context/ModalContextProvider'
import { ModalVariant } from '../../elements/modals/ModalBody'
import { VideoGroupForm } from './forms/VideoGroupForm'
import { Spinner } from '../../elements/feedback/Spinner'
import { VideoGroupItem } from './input-groups/VideoGroupsListItem'
import { ManagerControls } from './input-groups/ManagerControls'
import { useSearchFilter } from '../../../hooks/useSearchFilter'
import { VideoGroupDto } from '../../../types/videos.types'

export interface VideoGroupsManagerProps {
  parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext']
}

/**
 * Comprehensive component for users to perform CRUD operations on Video Groups and manage the
 * associations of Video <-> Video Group entities.
 */
export const VideoGroupsManager: React.FC<VideoGroupsManagerProps> = ({ parentContext }) => {
  const [currentVideoGroup, setCurrentVideoGroup] = useState<string | undefined>(undefined)

  const { data: videoGroups, ...videoGroupsQuery } = useVideoGroupsQuery({ parentContext: parentContext })
  const videoGroupQuery = useVideoGroupQuery({ parentContext, uuid: currentVideoGroup })
  const { mutate: deleteVideoGroup, ...videoGroupDeleteQuery } = useVideoGroupDeleteQuery()

  const [handleSearchInputChange, searchResults] = useSearchFilter<VideoGroupDto>('name', videoGroups ?? [])

  const [showAddVideoGroupModal] = useModalContext(
    {
      title: 'Add Video Group',
      // actionLabel: 'Save',
      // action: () => alert('saved'),
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
      title: 'Edit Video Group',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupForm
        parentContext={parentContext}
        mutate={{
          data: videoGroupQuery.data,
          onSuccess: (): void => {
            hideModal()
          },
        }}
      />
    ),
    [parentContext, videoGroupQuery.data],
  )

  // const handleEditVideoGroupClick = useCallback(
  //   (uuid: string, _event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
  //     setCurrentVideoGroup(uuid)
  //     showEditVideoGroupModal()
  //   },
  //   [showEditVideoGroupModal],
  // )

  const handleEditVideoGroup = useCallback(
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
      (_event) => {
        setCurrentVideoGroup(uuid)
        showEditVideoGroupModal()
      },
    [showEditVideoGroupModal],
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

  // const handleDeleteVideoGroupClick = useCallback(
  //   (uuid: string, _event: React.MouseEvent): void => {
  //     videoGroupDeleteQuery.mutate({ parentContext: parentContext, uuid })
  //   },
  //   [parentContext, videoGroupDeleteQuery],
  // )

  return (
    <>
      {videoGroupsQuery.isError && <p>Error fetching data</p>}
      {videoGroupDeleteQuery.error && <p>Error deleting video group</p>}
      {videoGroupsQuery.isLoading && <Spinner />}
      {videoGroupsQuery.isSuccess && !!videoGroups?.length && !!parentContext?.boxProfileUuid && (
        <div className="">
          <div className="mb-4 mt-2">
            <ManagerControls
              labels={{
                search: {
                  inputLabel: 'Keyword Filter',
                  inputPlaceholder: 'Keyword Filter',
                },
                actions: {
                  addButtonCaption: 'Add Group',
                },
              }}
              onAddClick={showAddVideoGroupModal}
              onSearchInputChange={handleSearchInputChange}
              onSortAscClick={(): void => alert('asc')}
              onSortDescClick={(): void => alert('desc')}
            />
          </div>
          <ul role="list" className="relative fx-set-parent-rounded-md">
            {searchResults?.map((vg, index) => (
              <VideoGroupItem
                key={vg.uuid}
                parentContext={parentContext}
                videoGroup={vg}
                isActive={index === 1}
                onEditClick={handleEditVideoGroup(vg.uuid)}
                onDeleteClick={handleDeleteVideoGroup(vg.uuid)}
              />
            ))}
          </ul>
        </div>
      )}
      {videoGroupsQuery.isSuccess && !videoGroups?.length && (
        <div className="flex items-center border-2 border-dashed rounded-md p-4">
          <div className="text-slate-600">No video groups found.</div>
        </div>
      )}
    </>
  )
}
