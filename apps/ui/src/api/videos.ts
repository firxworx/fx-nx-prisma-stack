// @todo create shared lib with interfaces of api responses

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from './lib/api-fetch'
import type { VideoGroupDto, VideoDto, CreateVideoDto } from '../types/videos.types'

export interface MutationQueryArgs {
  onSuccess?: () => void
}

const VIDEOS_KEY_BASE = 'videos' as const
const VIDEO_GROUPS_KEY_BASE = 'videoGroups' as const

/**
 * Query keys for videos API query functions.
 */
const videoQueryKeys = {
  all: [{ scope: VIDEOS_KEY_BASE }] as const,
  lists: () => [{ ...videoQueryKeys.all[0], operation: 'list' }] as const,
  listData: (filterSortPaginateParams: string) => [{ ...videoQueryKeys.lists()[0], filterSortPaginateParams }] as const,
  details: () => [{ ...videoQueryKeys.all, operation: 'detail' }] as const,
  detail: (uuid: string | undefined) => [{ ...videoQueryKeys.details()[0], uuid }] as const,
  create: () => [{ ...videoQueryKeys.all[0], operation: 'create' }] as const,
  mutate: () => [{ ...videoQueryKeys.all[0], operation: 'mutate' }] as const,
  delete: () => [{ ...videoQueryKeys.all[0], operation: 'delete' }] as const,
}

/**
 * Query keys for video groups API query functions.
 */
const videoGroupQueryKeys = {
  all: [VIDEO_GROUPS_KEY_BASE] as const,
}

export async function getVideos(): Promise<VideoDto[]> {
  return apiFetch<VideoDto[]>(`/videos`, {
    method: 'GET',
  })
}

export async function getVideosData(params: string): Promise<VideoDto[]> {
  return apiFetch<VideoDto[]>(`/videos${params ? `${params}?sortFilterPaginationParams` : ''}`, {
    method: 'GET',
  })
}

export async function getVideo(uuid: string | undefined): Promise<VideoDto> {
  return apiFetch<VideoDto>(`/videos/${uuid}`, {
    method: 'GET',
  })
}

// @todo implement the videos array and refactor types to shared lib
export async function createVideo(data: CreateVideoDto): Promise<VideoDto> {
  return apiFetch<VideoDto>(`/videos`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// @todo implement the videos array and refactor types to shared lib
export async function updateVideo({
  uuid,
  ...restData
}: { uuid: string | undefined } & Partial<VideoDto>): Promise<VideoDto> {
  return apiFetch<VideoDto>(`/videos/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(restData),
  })
}

export async function deleteVideo({ uuid }: { uuid: string | undefined }): Promise<void> {
  await apiFetch<void>(`/videos/${uuid}`, {
    method: 'DELETE',
  })
}

export async function getVideoGroups(): Promise<VideoGroupDto[]> {
  return apiFetch<VideoGroupDto[]>(`/video-groups`, {
    method: 'GET',
  })
}

export function useVideosQuery() {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(videoQueryKeys.all, getVideos)
  return { data, status, error, isLoading, isSuccess, isError }
}

export function useVideosDataQuery(filterSortPaginateParams: string) {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(
    videoQueryKeys.listData(filterSortPaginateParams),
    () => getVideosData(filterSortPaginateParams),
  )
  return { data, status, error, isLoading, isSuccess, isError }
}

export function useVideoQuery(uuid: string | undefined) {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(
    videoQueryKeys.detail(uuid),
    () => getVideo(uuid),
    {
      enabled: !!uuid?.length,
    },
  )
  return { data, status, error, isLoading, isSuccess, isError }
}

export function useVideoCreateQuery(queryArgs?: MutationQueryArgs) {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation(
    videoQueryKeys.create(),
    createVideo,
    {
      onSuccess: (data) => {
        if (typeof queryArgs?.onSuccess === 'function') {
          queryArgs.onSuccess()
        }

        // optimistic update local query cache with values
        const { uuid, ...restData } = data
        queryClient.setQueryData(videoQueryKeys.detail(data.uuid), restData)
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}

export function useVideoMutationQuery(queryArgs?: MutationQueryArgs) {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation(
    videoQueryKeys.mutate(),
    updateVideo,
    {
      onSuccess: async (_data, vars) => {
        if (typeof queryArgs?.onSuccess === 'function') {
          queryArgs.onSuccess()
        }

        // @todo optimistic update with previous + changed values (merged) prior to refetch?

        const invalidateItems = queryClient.invalidateQueries(videoQueryKeys.all)
        const invalidateItem = queryClient.invalidateQueries(videoQueryKeys.detail(vars.uuid))

        // refetch data -- ensure a Promise is returned so the outcome is awaited
        return Promise.all([invalidateItems, invalidateItem])
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}

export function useVideoDeleteQuery(queryArgs?: MutationQueryArgs) {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation(
    videoQueryKeys.delete(),
    deleteVideo,
    // @todo experimenting with rollback type functionality -- check docs + examples in case there are other patterns
    {
      onSuccess: async (_data, vars) => {
        if (typeof queryArgs?.onSuccess === 'function') {
          queryArgs.onSuccess()
        }

        // refetch data -- ensure a Promise is returned so the outcome is awaited
        return queryClient.invalidateQueries(videoQueryKeys.detail(vars.uuid))
      },
      onMutate: async ({ uuid }) => {
        // cancel any outgoing refetch queries to avoid overwriting optimistic update
        await queryClient.cancelQueries(videoQueryKeys.all)

        // snapshot previous value to enable rollback onError()
        const previous = queryClient.getQueryData<VideoDto[]>(videoQueryKeys.all)

        // optimistically update to the new value
        if (previous) {
          queryClient.setQueryData<VideoDto[]>(videoQueryKeys.all, {
            // @todo revise to base query keys for sort/filter/paginated data
            ...previous.filter((item) => item.uuid !== uuid),
          })
        }

        return { previous }
      },
      onError: (_error, _vars, context) => {
        // rollback on failure using the context returned by onMutate()
        if (context && context?.previous) {
          queryClient.setQueryData<VideoDto[]>(videoQueryKeys.all, context.previous) // @todo revise to base query keys for sort/filter/paginated data
        }
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}

export function useVideoGroupsQuery() {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(videoGroupQueryKeys.all, getVideoGroups)
  return { data, status, error, isLoading, isSuccess, isError }
}
