import { useVideoCreateQuery } from 'apps/ui/src/api/videos'
import { useIsMounted } from 'apps/ui/src/hooks/useIsMounted'
import { VideoPlatform } from 'apps/ui/src/types/videos.types'
import { useCallback } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { FormButton } from '../../forms/FormButton'
import { FormInput } from '../../forms/FormInput'

export interface VideoCreateFormData {
  name: string
  externalId: string
  platform: VideoPlatform
  groups?: string // @todo @temp - make a multi-select for groups
}

export interface VideoCreateFormProps {
  onSuccess?: () => void | Promise<void>
}

export const VideoCreateForm: React.FC<VideoCreateFormProps> = ({ onSuccess }) => {
  const isMounted = useIsMounted()
  const { mutateAsync, isLoading } = useVideoCreateQuery({ onSuccess })

  const form = useForm<VideoCreateFormData>()
  const { handleSubmit } = form

  const handleCreateQuery: SubmitHandler<VideoCreateFormData> = useCallback(
    async (data) => {
      if (!isMounted) {
        return
      }

      try {
        const video = await mutateAsync({
          ...data,
          groups: data?.groups ? [data.groups] : [], // @todo @temp - make a multi-select for groups
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
    [isMounted],
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleCreateQuery)}>
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
            placeholder="External ID"
            hideLabel
            validationOptions={{ required: true }}
          />
          <FormInput
            name="platform"
            label="Platform"
            placeholder="Platform"
            hideLabel
            validationOptions={{ required: true }}
          />
          <FormInput name="groups" label="Video Groups" placeholder="Video Groups" hideLabel />
          <FormButton type="submit" disabled={isLoading}>
            Save
          </FormButton>
        </div>
      </form>
    </FormProvider>
  )
}
