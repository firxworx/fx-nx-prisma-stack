import React, { useEffect, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { useIsMounted } from '@firx/react-hooks'

import { Spinner } from '@firx/react-feedback'
import { FormButton } from '@firx/react-forms-rhf'
import { FormInput } from '@firx/react-forms-rhf'
import { FormMultiListBox } from '@firx/react-forms-rhf'
import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoGroupDto } from '../../../../types/videos.types'
import { useVideosQuery } from '../../../../api/hooks/videos'
import { useVideoGroupCreateQuery, useVideoGroupMutateQuery } from '../../../../api/hooks/video-groups'
import { ApiParentContext } from '../../../../api/types/common.types'
import { BoxProfileChildQueryContext } from '../../../../types/box-profiles.types'

export interface CreateVideoGroupFormValues extends CreateVideoGroupDto {}
export interface MutateVideoGroupFormValues extends UpdateVideoGroupDto {}

// @todo tighter types so only one of create or mutate can be specified
export interface VideoGroupFormProps extends ApiParentContext<BoxProfileChildQueryContext> {
  create?: {
    onSuccess?: (data: VideoGroupDto, variables: CreateVideoGroupFormValues, context: unknown) => void
  }
  mutate?: {
    data: VideoGroupDto | undefined
    showVideosInput?: boolean
    onSuccess?: (data: VideoGroupDto, variables: MutateVideoGroupFormValues, context: unknown) => void
  }
}

const mapVideoGroupDtoToFormValues = (dto?: VideoGroupDto): MutateVideoGroupFormValues | undefined =>
  dto
    ? {
        name: dto.name,
        videos: dto.videos?.map((video) => video.uuid) ?? [],
      }
    : undefined

type VideoSelectOption = { value: string; label: string }

const InnerForm: React.FC<{
  isLoading?: boolean
  videoSelectOptions?: VideoSelectOption[]
  onSubmit: React.FormEventHandler<HTMLFormElement>
}> = ({ isLoading, videoSelectOptions, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className={clsx('w-full', { ['animate-pulse']: isLoading })}>
      <div className="grid grid-cols-1 gap-2 xs:gap-4">
        <FormInput name="name" label="Name" placeholder="Playlist Name" validationOptions={{ required: true }} />
        {!!videoSelectOptions?.length && (
          <FormMultiListBox
            name="videos"
            label="Videos"
            selectedCountLabelSingular="Video"
            selectedCountLabelPlural="Videos"
            options={videoSelectOptions}
          />
        )}
      </div>
      <FormButton type="submit" isLoading={isLoading} appendClassName="mt-6">
        Save
      </FormButton>
    </form>
  )
}

/**
 * Form component for Video Groups create + mutate API operations, powered by react-hook-form.
 *
 * Specify one of the `create` or `mutate` objects via props, including an optional `onSuccess()` callback.
 *
 * @todo VideoGroupForm per docs is recommended to initialize defaultValues to non-undefined values e.g. empty string or null
 */
export const VideoGroupForm: React.FC<VideoGroupFormProps> = ({ parentContext, create, mutate }) => {
  const isMounted = useIsMounted()

  const videoGroupCreateForm = useForm<CreateVideoGroupFormValues>()
  const { handleSubmit: handleCreateSubmit } = videoGroupCreateForm

  const initialMutateFormValues = useMemo(() => mapVideoGroupDtoToFormValues(mutate?.data), [mutate?.data])
  const videoGroupMutateForm = useForm<MutateVideoGroupFormValues>({
    defaultValues: initialMutateFormValues,
  })
  const { handleSubmit: handleMutateSubmit, reset: resetMutateForm } = videoGroupMutateForm

  const { data: videos } = useVideosQuery({ parentContext: parentContext })

  const { mutateAsync: createVideoGroupAsync, isLoading: isCreateLoading } = useVideoGroupCreateQuery({
    onSuccess: (data, variables, context) => {
      if (typeof create?.onSuccess === 'function') {
        create.onSuccess(data, variables, context)
      }
    },
  })

  const { mutateAsync: mutateVideoGroupAsync, isLoading: isMutateLoading } = useVideoGroupMutateQuery({
    onSuccess: (data, variables, context) => {
      if (typeof mutate?.onSuccess === 'function') {
        mutate.onSuccess(data, variables, context)
      }
    },
  })

  const videoSelectOptions: VideoSelectOption[] = useMemo(() => {
    return videos?.map((video) => ({ value: video.uuid, label: video.name })) ?? []
  }, [videos])

  useEffect(() => {
    if (mutate) {
      resetMutateForm(initialMutateFormValues)
    }
  }, [mutate, resetMutateForm, initialMutateFormValues])

  const handleCreateVideoGroupSubmit: SubmitHandler<CreateVideoGroupFormValues> = async (formValues) => {
    if (!isMounted) {
      return
    }

    try {
      await createVideoGroupAsync({ parentContext: parentContext, ...formValues })
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error))
    }
  }

  const handleMutateVideoGroupSubmit: SubmitHandler<MutateVideoGroupFormValues> = async (formValues) => {
    if (!isMounted || !mutate?.data?.uuid) {
      return
    }

    try {
      await mutateVideoGroupAsync({
        parentContext: parentContext,
        uuid: mutate.data.uuid,
        ...formValues,
      })
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error))
    }
  }

  if (create && mutate) {
    throw new Error('Form component does not support create and mutate props together. Specify one or the other.')
  }

  if (!videos) {
    return <Spinner />
  }

  if (mutate) {
    return (
      <FormProvider {...videoGroupMutateForm}>
        <InnerForm
          videoSelectOptions={mutate.showVideosInput ? videoSelectOptions : undefined}
          isLoading={isMutateLoading}
          onSubmit={handleMutateSubmit(handleMutateVideoGroupSubmit)}
        />
      </FormProvider>
    )
  }

  return (
    <FormProvider {...videoGroupCreateForm}>
      <InnerForm
        videoSelectOptions={videoSelectOptions}
        isLoading={isCreateLoading}
        onSubmit={handleCreateSubmit(handleCreateVideoGroupSubmit)}
      />
    </FormProvider>
  )
}
