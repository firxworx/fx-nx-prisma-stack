import React, { useEffect, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { useIsMounted } from '@firx/react-hooks'

import { Spinner } from '@firx/react-feedback'
import { FormButton } from '@firx/react-forms-rhf'
import { FormInput } from '@firx/react-forms-rhf'
import { FormMultiListBox } from '@firx/react-forms-rhf'
import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoDto, VideoGroupDto } from '../../../../types/videos.types'

export interface CreateVideoGroupFormValues extends CreateVideoGroupDto {}
export interface MutateVideoGroupFormValues extends UpdateVideoGroupDto {}

// @todo tighter types so only one of create or mutate can be specified
export interface VideoGroupFormProps {
  videos: VideoDto[]
  create?: {
    onCreateAsync: (formValues: CreateVideoGroupFormValues) => Promise<void>
    //Success?: (data: VideoGroupDto, variables: CreateVideoGroupFormValues, context: unknown) => void
  }
  mutate?: {
    data: VideoGroupDto | undefined
    showVideosInput?: boolean
    onMutateAsync: (formValues: MutateVideoGroupFormValues) => Promise<void>
    // onSuccess?: (data: VideoGroupDto, variables: MutateVideoGroupFormValues, context: unknown) => void
  }
}

// docs for react-hook-form recommend initializing empty forms to values other than `undefined`
const getEmptyFormValues = (): CreateVideoGroupFormValues => {
  return {
    name: '',
    videos: [],
  }
}

const mapVideoGroupDtoToFormValues = (dto?: VideoGroupDto): MutateVideoGroupFormValues | undefined =>
  dto
    ? {
        name: dto.name,
        videos: dto.videos?.map((video) => video.uuid) ?? [],
      }
    : getEmptyFormValues()

type VideoSelectOption = { value: string; label: string }

const InnerForm: React.FC<{
  videoSelectOptions?: VideoSelectOption[]
  onSubmit: React.FormEventHandler<HTMLFormElement>
}> = ({ videoSelectOptions, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="w-full">
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
      <FormButton type="submit" appendClassName="mt-6">
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
export const VideoGroupForm: React.FC<VideoGroupFormProps> = ({ videos, create, mutate }) => {
  const getIsMounted = useIsMounted()

  const videoGroupCreateForm = useForm<CreateVideoGroupFormValues>()
  const { handleSubmit: handleCreateSubmit, reset: resetCreateForm } = videoGroupCreateForm

  const initialMutateFormValues = useMemo(() => mapVideoGroupDtoToFormValues(mutate?.data), [mutate?.data])
  const videoGroupMutateForm = useForm<MutateVideoGroupFormValues>({
    defaultValues: initialMutateFormValues,
  })
  const { handleSubmit: handleMutateSubmit, reset: resetMutateForm } = videoGroupMutateForm

  // const { data: videos } = useVideosQuery()

  const videoSelectOptions: VideoSelectOption[] = useMemo(() => {
    return videos?.map((video) => ({ value: video.uuid, label: video.name })) ?? []
  }, [videos])

  useEffect(() => {
    if (mutate) {
      resetMutateForm(initialMutateFormValues)
    }
  }, [mutate, resetMutateForm, initialMutateFormValues])

  const handleCreateVideoGroupSubmit: SubmitHandler<CreateVideoGroupFormValues> = async (formValues) => {
    if (!getIsMounted()) {
      return
    }

    try {
      await create?.onCreateAsync(formValues)
      resetCreateForm()
    } catch (error: unknown) {
      // @todo propagate form errors (VideoForm - create case)
      console.error(error instanceof Error ? error.message : String(error))
    }

    // try {
    //   await createVideoGroupAsync({ parentContext: parentContext, ...formValues })
    // } catch (error: unknown) {
    //   console.error(error instanceof Error ? error.message : String(error))
    // }
  }

  const handleMutateVideoGroupSubmit: SubmitHandler<MutateVideoGroupFormValues> = async (formValues) => {
    if (!getIsMounted() || !mutate?.data?.uuid) {
      return
    }

    try {
      await mutate?.onMutateAsync(formValues)
      // resetMutateForm()
    } catch (error: unknown) {
      // @todo propagate form errors (VideoForm - mutate case)
      console.error(error instanceof Error ? error.message : String(error))
    }

    // try {
    //   await mutateVideoGroupAsync({
    //     parentContext: parentContext,
    //     uuid: mutate.data.uuid,
    //     ...formValues,
    //   })
    // } catch (error: unknown) {
    //   console.error(error instanceof Error ? error.message : String(error))
    // }
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
          onSubmit={handleMutateSubmit(handleMutateVideoGroupSubmit)}
        />
      </FormProvider>
    )
  }

  return (
    <FormProvider {...videoGroupCreateForm}>
      <InnerForm videoSelectOptions={videoSelectOptions} onSubmit={handleCreateSubmit(handleCreateVideoGroupSubmit)} />
    </FormProvider>
  )
}
