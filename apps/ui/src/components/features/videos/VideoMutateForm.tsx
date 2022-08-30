import { useCallback, useEffect, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import type { UpdateVideoDto, VideoDto, VideoGroupDto } from '../../../types/videos.types'
import { useVideoMutationQuery } from '../../../api/videos'
import { useIsMounted } from '../../../hooks/useIsMounted'
import { Spinner } from '../../elements/feedback/Spinner'
import { FormButton } from '../../elements/forms/FormButton'
import { FormInput } from '../../elements/forms/FormInput'
import { FormMultiComboBox } from '../../elements/forms/FormMultiComboBox'
import { useVideoGroupsQuery } from '../../../api/video-groups'

export interface VideoMutateFormData extends Omit<UpdateVideoDto, 'groups'> {
  groups: Pick<VideoDto['groups'][number], 'uuid' | 'name'>[]
}

export interface VideoMutateFormProps {
  uuid?: string
  video?: VideoDto
  onSuccess?: () => void | Promise<void>
}

const mapVideoDtoToFormData = (video?: VideoDto): VideoMutateFormData | undefined =>
  video
    ? {
        name: video.name,
        externalId: video.externalId,
        platform: video.platform,
        groups: video.groups?.map((vg) => ({ uuid: vg.uuid, name: vg.name })) ?? [],
      }
    : undefined

const mapFormDataToRequestDto = (formData: VideoMutateFormData): UpdateVideoDto => ({
  ...formData,
  groups: formData.groups.map((d) => d.uuid), // Array.isArray(data.groups) ? data.groups.map((d) => d.uuid) : data.groups ? [data.groups] : undefined,
})

export const VideoMutateForm: React.FC<VideoMutateFormProps> = ({ uuid, video, onSuccess }) => {
  const isMounted = useIsMounted()
  const { mutateAsync, error: videoMutationError, isError: isVideoMutationError } = useVideoMutationQuery({ onSuccess })

  const { data: videoGroups } = useVideoGroupsQuery()

  const videoDefaultFormData = useMemo(() => mapVideoDtoToFormData(video), [video])
  // const videoDefaultFormData = mapVideoDtoToFormData(video)
  const form = useForm<VideoMutateFormData>({ defaultValues: videoDefaultFormData })
  const { handleSubmit } = form

  const handleMutationQuery: SubmitHandler<VideoMutateFormData> = useCallback(
    async (formData) => {
      if (!isMounted || !uuid) {
        return
      }

      try {
        const video = await mutateAsync({
          uuid,
          ...mapFormDataToRequestDto(formData),
        })

        if (process.env.NODE_ENV === 'development') {
          console.debug(video)
        }

        return video
      } catch (error: unknown) {
        // @todo elegant error handling for video create failure
        console.error(error instanceof Error ? error.message : String(error))
      }
    },
    [uuid, isMounted],
  )

  const videoGroupSelectOptions: Pick<VideoGroupDto, 'uuid' | 'name'>[] = useMemo(() => {
    return videoGroups?.map((vg) => ({ uuid: vg.uuid, name: vg.name })) ?? []
  }, [videoGroups])

  if (!video || !videoGroups) {
    return <Spinner />
  }

  return (
    <FormProvider {...form}>
      {isVideoMutationError && <div className="font-bold">{String(videoMutationError)}</div>}
      <form onSubmit={handleSubmit(handleMutationQuery)}>
        <div className="space-y-4 p-4 mt-4">
          <FormInput
            name="name"
            label="Name"
            placeholder="Video Name"
            hideLabel
            validationOptions={{ required: true }}
          />
          <FormInput
            name="externalId"
            label="Share/Embed Code"
            placeholder="abcd1234"
            hideLabel
            validationOptions={{ required: true }}
          />
          <FormMultiComboBox name="groups" label="Video Groups" options={videoGroupSelectOptions} />
          <FormButton type="submit">Save</FormButton>
        </div>
      </form>
    </FormProvider>
  )
}
