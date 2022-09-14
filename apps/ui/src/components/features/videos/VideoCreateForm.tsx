import { useCallback, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { useVideoGroupCreateQuery, useVideoGroupsQuery } from '../../../api/hooks/video-groups'
import { useModalContext } from '../../../context/ModalContextProvider'
import { useVideoCreateQuery, useVideosQuery } from '../../../api/videos'
import { useIsMounted } from '../../../hooks/useIsMounted'
import type { CreateVideoDto, CreateVideoGroupDto } from '../../../types/videos.types'
import { Spinner } from '../../elements/feedback/Spinner'
import { FormButton } from '../../elements/forms/FormButton'
import { FormInput } from '../../elements/forms/FormInput'
import { FormListBox } from '../../elements/forms/FormListBox'
import { FormMultiListBox } from '../../elements/forms/FormMultiListBox'
import { ModalVariant } from '../../elements/modals/ModalBody'
import { VideoGroupForm } from './VideoGroupForm'

export interface VideoCreateFormValues extends CreateVideoDto {}
export interface VideoGroupCreateFormValues extends CreateVideoGroupDto {}

export interface VideoCreateFormProps {
  onSuccess?: () => void | Promise<void>
}

export const VideoCreateForm: React.FC<VideoCreateFormProps> = ({ onSuccess }) => {
  const isMounted = useIsMounted()
  const { mutateAsync: createVideoAsync, isLoading: isCreateVideoLoading } = useVideoCreateQuery({ onSuccess })

  const { mutateAsync: createVideoGroupAsync, isLoading: isCreateVideoGroupLoading } = useVideoGroupCreateQuery({
    // @todo fix erroneous onSuccess (apiFetch())
    // onSuccess: () => alert('success yo - note currently runs on server error too...'),
  })

  const { data: videos } = useVideosQuery()
  const { data: videoGroups } = useVideoGroupsQuery()

  const videoForm = useForm<VideoCreateFormValues>()
  const { handleSubmit: handleVideoSubmit } = videoForm

  const videoGroupForm = useForm<VideoGroupCreateFormValues>()
  const { reset: resetVideoGroupForm } = videoGroupForm

  const handleCreateVideo: SubmitHandler<VideoCreateFormValues> = useCallback(
    async (formData) => {
      if (!isMounted) {
        return
      }

      try {
        const video = await createVideoAsync(formData)

        return video
      } catch (error: unknown) {
        // @todo elegant error handling for video create failure
        console.error(error instanceof Error ? error.message : String(error))
      }
    },
    [isMounted],
  )

  const handleCreateVideoGroup: (hideModal: () => void) => SubmitHandler<VideoGroupCreateFormValues> =
    (hideModal) => async (formData) => {
      if (!isMounted) {
        return
      }

      try {
        // could use the VideoGroupDto returned below to update react-query cache...
        await createVideoGroupAsync(formData)

        hideModal()
      } catch (error: unknown) {
        // @todo elegant error handling for video create failure
        console.error(error instanceof Error ? error.message : String(error))
      }
    }

  const [showModal] = useModalContext(
    {
      title: 'Add Video Group',
      // actionLabel: 'Save',
      // action: () => alert('saved'),
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupForm
        reactHookForm={videoGroupForm}
        isLoading={isCreateVideoGroupLoading}
        onSubmit={handleCreateVideoGroup(hideModal)}
      />
    ),
  )

  const videoGroupSelectOptions: { value: string; label: string }[] = useMemo(() => {
    return videoGroups?.map((vg) => ({ value: vg.uuid, label: vg.name })) ?? []
  }, [videoGroups])

  if (!videos || !videoGroups) {
    return <Spinner />
  }

  return (
    <FormProvider {...videoForm}>
      <form onSubmit={handleVideoSubmit(handleCreateVideo)} className="p4 mt-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name="name"
            label="Name"
            placeholder="Video Name"
            validationOptions={{ required: true }}
            appendClassName="sm:col-span-2"
          />
          <FormListBox
            name="platform"
            label="Platform"
            options={[
              { value: 'YOUTUBE', label: 'YouTube' },
              { value: 'VIMEO', label: 'Vimeo' },
            ]}
          />
          <FormInput
            name="externalId"
            label="Share/Embed Code"
            placeholder="External ID"
            validationOptions={{ required: true }}
          />
          <FormMultiListBox
            name="groups"
            label="Video Groups"
            options={videoGroupSelectOptions}
            appendClassName="sm:col-span-2"
            onAddItemClick={() => {
              resetVideoGroupForm()
              showModal()
            }}
          />
        </div>
        <FormButton type="submit" isLoading={isCreateVideoLoading} appendClassName="mt-6">
          Save
        </FormButton>
      </form>
    </FormProvider>
  )
}
