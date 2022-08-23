import { useVideoMutationQuery } from 'apps/ui/src/api/videos'
import { useIsMounted } from 'apps/ui/src/hooks/useIsMounted'
import { useCallback } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { FormButton } from '../../elements/forms/FormButton'
import { FormInput } from '../../elements/forms/FormInput'

export interface VideoMutationFormData {
  name: string
  externalId: string
}

export interface VideoMutationFormProps {
  uuid?: string
  defaultValues?: VideoMutationFormData
  onSuccess?: () => void | Promise<void>
}

export const VideoMutationForm: React.FC<VideoMutationFormProps> = ({ uuid, defaultValues, onSuccess }) => {
  const isMounted = useIsMounted()
  const { mutateAsync, isLoading } = useVideoMutationQuery({ onSuccess })

  const form = useForm<VideoMutationFormData>() // { defaultValues }
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

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleMutationQuery)}>
        <div className="space-y-4 p-4 mt-4">
          <FormInput
            name="name"
            label="Name"
            placeholder="Video Name"
            hideLabel
            defaultValue={defaultValues?.name}
            // validationOptions={{ required: true }}
          />
          <FormInput
            name="externalId"
            label="Share/Embed Code"
            placeholder="External ID"
            hideLabel
            defaultValue={defaultValues?.externalId}
            validationOptions={{ required: true }}
          />
          <FormButton type="submit" disabled={isLoading}>
            Save
          </FormButton>
        </div>
      </form>
    </FormProvider>
  )
}
