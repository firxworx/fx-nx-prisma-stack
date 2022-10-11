import React, { useEffect, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { useIsMounted } from '@firx/react-hooks'
import { FormButton } from '@firx/react-forms-rhf'
import { FormInput } from '@firx/react-forms-rhf'
import { FormMultiListBox } from '@firx/react-forms-rhf'
import { FormListBox } from '@firx/react-forms-rhf'
import type { CreateVideoDto, UpdateVideoDto, VideoDto, VideoGroupDto } from '../../../../types/videos.types'
import { VideoPlatform, VideoPlatformDisplayName } from '../../../../types/enums/videos.enums'

export interface CreateVideoFormValues extends CreateVideoDto {}
export interface MutateVideoFormValues extends UpdateVideoDto {}

// @todo tighter types so only one of create or mutate can be specified
export interface VideoFormProps {
  videoGroups: VideoGroupDto[]
  create?: {
    onCreateAsync: (formValues: CreateVideoFormValues) => Promise<void>
  }
  mutate?: {
    data: VideoDto | undefined
    onMutateAsync: (formValues: MutateVideoFormValues) => Promise<void>
  }
}

// docs for react-hook-form recommend initializing empty forms to values other than `undefined`
const getEmptyFormValues = (): CreateVideoFormValues => {
  return {
    name: '',
    externalId: '',
    platform: VideoPlatform.YOUTUBE,
    groups: [],
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
    : getEmptyFormValues()

type VideoGroupSelectOption = { value: string; label: string }

const InnerForm: React.FC<{
  videoGroupSelectOptions: VideoGroupSelectOption[]
  onSubmit: React.FormEventHandler<HTMLFormElement>
}> = ({ videoGroupSelectOptions, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-4">
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
          placeholder="Platform"
          options={Object.entries(VideoPlatformDisplayName).map(([enumKey, platformName]) => ({
            value: enumKey,
            label: platformName,
          }))}
        />
        <FormInput
          name="externalId"
          label="Share/Embed Code"
          placeholder="External ID"
          validationOptions={{ required: true }}
        />
        <FormMultiListBox
          name="groups"
          label="Playlists"
          selectedCountLabelSingular="Playlist"
          selectedCountLabelPlural="Playlists"
          placeholder="Select Playlist(s)"
          options={videoGroupSelectOptions}
          appendClassName="sm:col-span-2"
        />
      </div>
      <FormButton type="submit" appendClassName="mt-6">
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
export const VideoForm: React.FC<VideoFormProps> = ({ videoGroups, create, mutate }) => {
  const getIsMounted = useIsMounted()

  const videoCreateForm = useForm<CreateVideoFormValues>({
    defaultValues: getEmptyFormValues(),
  })
  const { handleSubmit: handleCreateSubmit, reset: resetCreateForm } = videoCreateForm

  const initialMutateFormValues = useMemo(() => mapVideoDtoToFormValues(mutate?.data), [mutate?.data])
  const videoMutateForm = useForm<MutateVideoFormValues>({
    defaultValues: initialMutateFormValues,
  })
  const { handleSubmit: handleMutateSubmit, reset: resetMutateForm } = videoMutateForm

  const videoSelectOptions: VideoGroupSelectOption[] = useMemo(() => {
    return videoGroups?.map((videoGroup) => ({ value: videoGroup.uuid, label: videoGroup.name })) ?? []
  }, [videoGroups])

  useEffect(() => {
    if (mutate) {
      resetMutateForm(initialMutateFormValues)
    }
  }, [resetMutateForm, mutate, initialMutateFormValues])

  const handleCreateVideo: SubmitHandler<CreateVideoFormValues> = async (formValues) => {
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
  }

  const handleMutateVideo: SubmitHandler<MutateVideoFormValues> = async (formValues) => {
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
  }

  if (create && mutate) {
    throw new Error('Form component does not support create and mutate props together. Specify one or the other.')
  }

  if (mutate) {
    return (
      <FormProvider {...videoMutateForm}>
        <InnerForm videoGroupSelectOptions={videoSelectOptions} onSubmit={handleMutateSubmit(handleMutateVideo)} />
      </FormProvider>
    )
  }

  return (
    <FormProvider {...videoCreateForm}>
      <InnerForm videoGroupSelectOptions={videoSelectOptions} onSubmit={handleCreateSubmit(handleCreateVideo)} />
    </FormProvider>
  )
}
