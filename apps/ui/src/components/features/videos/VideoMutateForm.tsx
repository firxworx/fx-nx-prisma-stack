import { useCallback, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import type { UpdateVideoDto, VideoDto } from '../../../types/videos.types'
import { useVideoMutationQuery } from '../../../api/videos'
import { useIsMounted } from '../../../hooks/useIsMounted'
import { Spinner } from '../../elements/feedback/Spinner'
import { FormButton } from '../../elements/forms/FormButton'
import { FormInput } from '../../elements/forms/FormInput'
import { useVideoGroupsQuery } from '../../../api/hooks/video-groups'
import { FormListBox } from '../../elements/forms/FormListBox'
import { FormMultiListBox } from '../../elements/forms/FormMultiListBox'

export interface VideoMutateFormValues extends UpdateVideoDto {}

export interface VideoMutateFormProps {
  uuid?: string
  video?: VideoDto
  onSuccess?: () => void | Promise<void>
}

const mapVideoDtoToFormData = (video?: VideoDto): VideoMutateFormValues | undefined =>
  video
    ? {
        name: video.name,
        externalId: video.externalId,
        platform: video.platform,
        groups: video.groups?.map((vg) => vg.uuid) ?? [],
      }
    : undefined

export const VideoMutateForm: React.FC<VideoMutateFormProps> = ({ uuid, video, onSuccess }) => {
  const isMounted = useIsMounted()
  const {
    mutateAsync,
    error: videoMutationError,
    isLoading: isVideoMutationLoading,
    isError: isVideoMutationError,
  } = useVideoMutationQuery({ onSuccess })

  const { data: videoGroups } = useVideoGroupsQuery()

  const videoDefaultFormData = useMemo(() => mapVideoDtoToFormData(video), [video])

  const form = useForm<VideoMutateFormValues>({ defaultValues: videoDefaultFormData })
  const { handleSubmit } = form

  const handleMutationQuery: SubmitHandler<VideoMutateFormValues> = useCallback(
    async (formData) => {
      if (!isMounted || !uuid) {
        return
      }

      try {
        const video = await mutateAsync({
          uuid,
          ...formData,
        })

        return video
      } catch (error: unknown) {
        // @todo elegant error handling for video create failure
        console.error(error instanceof Error ? error.message : String(error))
      }
    },
    [uuid, isMounted],
  )

  const videoGroupSelectOptions: { value: string; label: string }[] = useMemo(() => {
    return videoGroups?.map((vg) => ({ value: vg.uuid, label: vg.name })) ?? []
  }, [videoGroups])

  if (!video || !videoGroups) {
    return <Spinner />
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleMutationQuery)} className="w-full">
        {isVideoMutationError && <div className="font-medium my-4">{String(videoMutationError)}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name="name"
            label="Name"
            placeholder="Video Name"
            validationOptions={{ required: true }}
            appendClassName="sm:col-span-2"
          />
          <FormInput
            name="externalId"
            label="Share/Embed Code"
            placeholder="abcd1234"
            validationOptions={{ required: true }}
          />
          <FormListBox
            name="platform"
            label="Platform"
            options={[
              { value: 'YOUTUBE', label: 'YouTube' },
              { value: 'VIMEO', label: 'Vimeo' },
            ]}
          />
          <FormMultiListBox
            name="groups"
            label="Video Groups"
            options={videoGroupSelectOptions}
            appendClassName="sm:col-span-2"
          />
        </div>
        <FormButton type="submit" isLoading={isVideoMutationLoading} appendClassName="mt-6">
          Save
        </FormButton>
      </form>
    </FormProvider>
  )
}
