import React, { useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
// import clsx from 'clsx'

import { useIsMounted } from '@firx/react-hooks'

import { Spinner } from '../../elements/feedback/Spinner'
import { FormButton } from '../../elements/forms/FormButton'
import { FormInput } from '../../elements/forms/FormInput'
import { FormMultiListBox } from '../../elements/forms/FormMultiListBox'
import type { CreateVideoDto, UpdateVideoDto, VideoDto } from '../../../types/videos.types'
import { useVideoCreateQuery, useVideoMutateQuery } from '../../../api/hooks/videos'
import { useVideoGroupsQuery } from '../../../api/hooks/video-groups'
import { ApiParentContext } from '../../../api/types/common.types'
import { BoxProfileChildQueryContext } from '../../../types/box-profiles.types'
import { FormListBox } from '../../elements/forms/FormListBox'

export interface CreateVideoFormValues extends CreateVideoDto {}
export interface MutateVideoFormValues extends UpdateVideoDto {}

// @todo tighter types so only one of create or mutate can be specified
export interface VideoFormProps extends ApiParentContext<BoxProfileChildQueryContext> {
  create?: {
    onSuccess?: (data: VideoDto, variables: CreateVideoFormValues, context: unknown) => void
  }
  mutate?: {
    onSuccess?: (data: VideoDto, variables: MutateVideoFormValues, context: unknown) => void
    data: VideoDto
  }
}

const mapVideoDtoToFormValues = (video?: VideoDto): MutateVideoFormValues | undefined =>
  video
    ? {
        name: video.name,
        externalId: video.externalId,
        platform: video.platform,
        groups: video.groups?.map((vg) => vg.uuid) ?? [],
      }
    : undefined

type VideoGroupSelectOption = { value: string; label: string }

const InnerForm: React.FC<{
  isLoading?: boolean
  videoGroupSelectOptions: VideoGroupSelectOption[]
  onSubmit: React.FormEventHandler<HTMLFormElement>
}> = ({ isLoading, videoGroupSelectOptions, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="w-full">
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
          onAddItemClick={(): void => {
            alert('implement me') // @todo implement add item to form multi list box
            // resetVideoGroupForm()
            // showModal()
          }}
        />
      </div>
      <FormButton type="submit" isLoading={isLoading} appendClassName="mt-6">
        Save
      </FormButton>
    </form>
  )
}

/**
 * Form component for Videos create + mutate API operations, powered by react-hook-form.
 *
 * Specify one of the `create` or `mutate` objects via props, including an optional `onSuccess()` callback.
 */
export const VideoForm: React.FC<VideoFormProps> = ({ parentContext, create, mutate }) => {
  const isMounted = useIsMounted()

  const videoCreateForm = useForm<CreateVideoFormValues>()
  const { handleSubmit: handleCreateSubmit } = videoCreateForm

  const videoMutateForm = useForm<MutateVideoFormValues>({
    defaultValues: mutate?.data ? mapVideoDtoToFormValues(mutate.data) : undefined,
  })
  const { handleSubmit: handleMutateSubmit } = videoMutateForm

  const { data: videoGroups } = useVideoGroupsQuery({ parentContext: parentContext })

  const { mutateAsync: createVideoAsync, isLoading: isCreateLoading } = useVideoCreateQuery({
    onSuccess: (data, variables, context) => {
      if (typeof create?.onSuccess === 'function') {
        create.onSuccess(data, variables, context)
      }
    },
  })

  const { mutateAsync: mutateVideoAsync, isLoading: isMutateLoading } = useVideoMutateQuery({
    onSuccess: (data, variables, context) => {
      if (typeof mutate?.onSuccess === 'function') {
        mutate.onSuccess(data, variables, context)
      }
    },
  })

  const videoSelectOptions: VideoGroupSelectOption[] = useMemo(() => {
    return videoGroups?.map((videoGroup) => ({ value: videoGroup.uuid, label: videoGroup.name })) ?? []
  }, [videoGroups])

  const handleCreateVideoSubmit: SubmitHandler<CreateVideoFormValues> = async (formData) => {
    if (!isMounted) {
      return
    }

    try {
      await createVideoAsync({ parentContext: parentContext, ...formData })
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error))
    }
  }

  const handleMutateVideoSubmit: SubmitHandler<MutateVideoFormValues> = async (formData) => {
    if (!isMounted || !mutate?.data?.uuid) {
      return
    }

    try {
      await mutateVideoAsync({
        parentContext: parentContext,
        uuid: mutate.data.uuid,
        ...formData,
      })
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error))
    }
  }

  if (create && mutate) {
    throw new Error('Form component does not support create and mutate props together. Specify one or the other.')
  }

  if (!videoGroups) {
    return <Spinner />
  }

  if (mutate) {
    return (
      <FormProvider {...videoMutateForm}>
        <InnerForm
          videoGroupSelectOptions={videoSelectOptions}
          isLoading={isMutateLoading}
          onSubmit={handleMutateSubmit(handleMutateVideoSubmit)}
        />
      </FormProvider>
    )
  }

  return (
    <FormProvider {...videoCreateForm}>
      <InnerForm
        videoGroupSelectOptions={videoSelectOptions}
        isLoading={isCreateLoading}
        onSubmit={handleCreateSubmit(handleCreateVideoSubmit)}
      />
    </FormProvider>
  )
}
