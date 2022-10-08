import React, { useEffect, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { useIsMounted } from '@firx/react-hooks'

import { Spinner } from '@firx/react-feedback'
import { FormButton } from '@firx/react-forms-rhf'
import { FormInput } from '@firx/react-forms-rhf'
import { FormMultiListBox } from '@firx/react-forms-rhf'
import type { CreateVideoDto, UpdateVideoDto, VideoDto } from '../../../../types/videos.types'
import { useVideoCreateQuery, useVideoMutateQuery } from '../../../../api/hooks/videos'
import { useVideoGroupsQuery } from '../../../../api/hooks/video-groups'
import { ApiParentContext } from '../../../../api/types/common.types'
import { BoxProfileChildQueryContext } from '../../../../types/box-profiles.types'
import { FormListBox } from '@firx/react-forms-rhf'
import { VideoPlatform, VideoPlatformDisplayName } from '../../../../types/enums/videos.enums'

export interface CreateVideoFormValues extends CreateVideoDto {}
export interface MutateVideoFormValues extends UpdateVideoDto {}

// @todo tighter types so only one of create or mutate can be specified
export interface VideoFormProps extends ApiParentContext<BoxProfileChildQueryContext> {
  create?: {
    onSuccess?: (data: VideoDto, variables: CreateVideoFormValues, context: unknown) => void
  }
  mutate?: {
    onSuccess?: (data: VideoDto, variables: MutateVideoFormValues, context: unknown) => void
    data: VideoDto | undefined
  }
}

// react-hook-form docs recommend initializing empty forms from `undefined`
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
  isLoading?: boolean
  videoGroupSelectOptions: VideoGroupSelectOption[]
  // onAddVideoGroupClick: () => void // refer to todo below
  onSubmit: React.FormEventHandler<HTMLFormElement>
}> = ({ isLoading, videoGroupSelectOptions, onSubmit }) => {
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
          // onAddItemClick={(): void => {
          //   onAddVideoGroupClick()
          //   // @todo implement add item to form multi list box
          //   // resetVideoGroupForm()
          //   // showModal()
          // }}
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
 *
 * @todo VideoForm per docs is recommended to initialize defaultValues to non-undefined values e.g. empty string or null
 */
export const VideoForm: React.FC<VideoFormProps> = ({ parentContext, create, mutate }) => {
  const isMounted = useIsMounted()

  const videoCreateForm = useForm<CreateVideoFormValues>({
    defaultValues: getEmptyFormValues(),
  })
  const { handleSubmit: handleCreateSubmit, reset: resetCreateForm } = videoCreateForm

  const initialMutateFormValues = useMemo(() => mapVideoDtoToFormValues(mutate?.data), [mutate?.data])
  const videoMutateForm = useForm<MutateVideoFormValues>({
    defaultValues: initialMutateFormValues,
  })
  const { handleSubmit: handleMutateSubmit, reset: resetMutateForm } = videoMutateForm

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

  useEffect(() => {
    if (mutate) {
      resetMutateForm(initialMutateFormValues)
    }
  }, [resetMutateForm, mutate, initialMutateFormValues])

  // const [showAddVideoGroupModal] = useModalContext(
  //   {
  //     title: 'New Video Group',
  //     variant: ModalVariant.FORM,
  //   },
  //   (hideModal) => (
  //     <VideoGroupForm
  //       parentContext={parentContext}
  //       create={{
  //         onSuccess: (): void => {
  //           hideModal()
  //         },
  //       }}
  //     />
  //   ),
  // )

  const handleCreateVideo: SubmitHandler<CreateVideoFormValues> = async (formValues) => {
    if (!isMounted) {
      return
    }

    try {
      await createVideoAsync(
        { parentContext: parentContext, ...formValues },
        {
          onSuccess: () => resetCreateForm(),
        },
      )
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error))
    }
  }

  const handleMutateVideo: SubmitHandler<MutateVideoFormValues> = async (formValues) => {
    if (!isMounted || !mutate?.data?.uuid) {
      return
    }

    try {
      await mutateVideoAsync(
        {
          parentContext: parentContext,
          uuid: mutate.data.uuid,
          ...formValues,
        },
        {
          onSuccess: () => resetMutateForm(),
        },
      )
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
    if (!mutate.data) {
      return (
        <div className="flex justify-center items-center p-4">
          <Spinner />
        </div>
      )
    }

    return (
      <FormProvider {...videoMutateForm}>
        <InnerForm
          videoGroupSelectOptions={videoSelectOptions}
          isLoading={isMutateLoading}
          // onAddVideoGroupClick={showAddVideoGroupModal}
          onSubmit={handleMutateSubmit(handleMutateVideo)}
        />
      </FormProvider>
    )
  }

  return (
    <FormProvider {...videoCreateForm}>
      <InnerForm
        videoGroupSelectOptions={videoSelectOptions}
        isLoading={isCreateLoading}
        // onAddVideoGroupClick={showAddVideoGroupModal}
        onSubmit={handleCreateSubmit(handleCreateVideo)}
      />
    </FormProvider>
  )
}
