import { useCallback, useMemo } from 'react'
import { useVideoMutationQuery } from '../../../api/videos'
import { useIsMounted } from '../../../hooks/useIsMounted'
import type { UpdateVideoDto, VideoDto } from '../../../types/videos.types'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Spinner } from '../../elements/feedback/Spinner'
import { FormButton } from '../../elements/forms/FormButton'
import { FormInput } from '../../elements/forms/FormInput'

export type VideoMutationFormData = UpdateVideoDto

export interface VideoMutationFormProps {
  uuid?: string
  data?: VideoDto
  onSuccess?: () => void | Promise<void>
}

const mapVideoToForm = (video?: VideoDto): UpdateVideoDto | undefined =>
  video
    ? {
        name: video.name,
        externalId: video.externalId,
        platform: video.platform,
        groups: video.groups?.map((vg) => vg.uuid) ?? [],
      }
    : undefined

export const VideoMutationForm: React.FC<VideoMutationFormProps> = ({ uuid, data, onSuccess }) => {
  const isMounted = useIsMounted()
  const { mutateAsync, isLoading, error, isError } = useVideoMutationQuery({ onSuccess })
  const videoUpdateDto = useMemo(() => mapVideoToForm(data), [data])

  const form = useForm<VideoMutationFormData>({ defaultValues: videoUpdateDto })
  const { handleSubmit } = form

  const handleMutationQuery: SubmitHandler<VideoMutationFormData> = useCallback(
    async (data) => {
      if (!isMounted || !uuid) {
        return
      }

      try {
        const video = await mutateAsync({
          uuid,
          ...data,
          groups: Array.isArray(data.groups) ? data.groups : data.groups ? [data.groups] : undefined,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log(video)
        }

        return video
      } catch (error: unknown) {
        // @todo elegant error handling for video create failure
        console.error(error instanceof Error ? error.message : String(error))
      }
    },
    [uuid, isMounted],
  )

  if (!data) {
    return <Spinner />
  }

  return (
    <FormProvider {...form}>
      {isError && <div className="font-bold">{String(error)}</div>}
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
          <FormInput name="groups" label="Groups" placeholder="Group UUID's" hideLabel />
          <FormButton type="submit" disabled={isLoading}>
            Save
          </FormButton>
        </div>
      </form>
    </FormProvider>
  )
}
