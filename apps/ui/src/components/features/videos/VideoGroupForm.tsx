import React, { useMemo } from 'react'
import { FormProvider, SubmitHandler, UseFormReturn } from 'react-hook-form'

import { Spinner } from '../../elements/feedback/Spinner'
import { FormButton } from '../../elements/forms/FormButton'
import { FormInput } from '../../elements/forms/FormInput'
import { FormMultiListBox } from '../../elements/forms/FormMultiListBox'
import type { CreateVideoGroupDto, UpdateVideoGroupDto } from '../../../types/videos.types'
import { useVideosQuery } from '../../../api/videos'

export interface VideoGroupCreateFormValues extends CreateVideoGroupDto {}
export interface VideoGroupMutateFormValues extends UpdateVideoGroupDto {}

export interface VideoGroupFormProps {
  reactHookForm: UseFormReturn<VideoGroupCreateFormValues, any>
  isLoading?: boolean
  onSubmit: SubmitHandler<VideoGroupCreateFormValues>
}

export const VideoGroupForm: React.FC<VideoGroupFormProps> = ({ reactHookForm, isLoading, onSubmit }) => {
  const { handleSubmit } = reactHookForm

  const { data: videos } = useVideosQuery()

  const videoSelectOptions: { value: string; label: string }[] = useMemo(() => {
    return videos?.map((video) => ({ value: video.uuid, label: video.name })) ?? []
  }, [videos])

  if (!videos) {
    return <Spinner />
  }

  return (
    <FormProvider {...reactHookForm}>
      <form onSubmit={handleSubmit(onSubmit)} className="p4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormInput name="name" label="Group Name" placeholder="Group Name" validationOptions={{ required: true }} />
          <FormInput name="description" label="Description" placeholder="Description" />
          <FormMultiListBox name="videos" label="Videos" options={videoSelectOptions} />
        </div>
        <FormButton type="submit" isLoading={isLoading} appendClassName="mt-6">
          Save
        </FormButton>
      </form>
    </FormProvider>
  )
}
