import { useVideoGroupsQuery } from 'apps/ui/src/api/video-groups'
import { useCallback, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { useVideoCreateQuery } from '../../../api/videos'
import { useIsMounted } from '../../../hooks/useIsMounted'
import type { CreateVideoDto } from '../../../types/videos.types'
import { Spinner } from '../../elements/feedback/Spinner'
import { FormButton } from '../../elements/forms/FormButton'
import { FormInput } from '../../elements/forms/FormInput'
import { FormListBox } from '../../elements/forms/FormListBox'
import { FormMultiListBox } from '../../elements/forms/FormMultiListBox'

export interface VideoCreateFormValues extends CreateVideoDto {}

export interface VideoCreateFormProps {
  onSuccess?: () => void | Promise<void>
}

export const VideoCreateForm: React.FC<VideoCreateFormProps> = ({ onSuccess }) => {
  const isMounted = useIsMounted()
  const { mutateAsync, isLoading } = useVideoCreateQuery({ onSuccess })

  const form = useForm<VideoCreateFormValues>()
  const { handleSubmit } = form

  const { data: videoGroups } = useVideoGroupsQuery()

  const handleCreateQuery: SubmitHandler<VideoCreateFormValues> = useCallback(
    async (formData) => {
      if (!isMounted) {
        return
      }

      try {
        const video = await mutateAsync(formData)

        return video
      } catch (error: unknown) {
        // @todo elegant error handling for video create failure
        console.error(error instanceof Error ? error.message : String(error))
      }
    },
    [isMounted],
  )

  const videoGroupSelectOptions: { value: string; label: string }[] = useMemo(() => {
    return videoGroups?.map((vg) => ({ value: vg.uuid, label: vg.name })) ?? []
  }, [videoGroups])

  if (!videoGroups) {
    return <Spinner />
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleCreateQuery)} className="p4 mt-4 w-full">
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
          />
        </div>
        <FormButton type="submit" isLoading={isLoading} appendClassName="mt-6">
          Save
        </FormButton>
      </form>
    </FormProvider>
  )
}
