// @todo create shared lib with interfaces of api responses

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'

import type { VideoDto, CreateVideoDto, UpdateVideoDto } from '../../types/videos.types'
import type { ApiQueryProps } from '../types/query.types'
import type { ApiDeletionProps, ApiMutationProps } from '../types/mutation.types'
import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import { createVideo, deleteVideo, getVideo, getVideos, getVideosData, updateVideo } from '../fetchers/videos'

export interface MutationQueryArgs {
  onSuccess?: () => void
}

const VIDEOS_KEY_BASE = 'videos' as const

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

export function useVideosQuery(): Pick<UseQueryResult<VideoDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery(
    videoQueryKeys.all,
    getVideos,
  )
  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideosDataQuery(filterSortPaginateParams: string): Pick<UseQueryResult<VideoDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery(
    videoQueryKeys.listData(filterSortPaginateParams),
    () => getVideosData(filterSortPaginateParams),
  )
  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoQuery(uuid: string | undefined): Pick<UseQueryResult<VideoDto>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery(
    videoQueryKeys.detail(uuid),
    () => getVideo(uuid),
    {
      enabled: !!uuid?.length,
    },
  )

  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoCreateQuery(
  options?: UseMutationOptions<VideoDto, Error, CreateVideoDto>,
): Pick<UseMutationResult<VideoDto, Error, CreateVideoDto>, ApiMutationProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError } = useMutation<
    VideoDto,
    Error,
    CreateVideoDto
  >(videoQueryKeys.create(), createVideo, {
    onSuccess: (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // optimistic update local query cache with values
      const { uuid, ...restData } = data
      queryClient.setQueryData(videoQueryKeys.detail(uuid), restData)
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

export function useVideoMutationQuery(
  options?: UseMutationOptions<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto>>,
): Pick<UseMutationResult<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto>>, ApiMutationProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError } = useMutation<
    VideoDto,
    Error,
    ApiMutateRequestDto<UpdateVideoDto>
  >(videoQueryKeys.mutate(), updateVideo, {
    onSuccess: async (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // @todo optimistic update with previous + changed values (merged) prior to refetch?

      const invalidateItems = queryClient.invalidateQueries(videoQueryKeys.all)
      const invalidateItem = queryClient.invalidateQueries(videoQueryKeys.detail(variables.uuid))

      // refetch data -- ensure a Promise is returned so the outcome is awaited
      return Promise.all([invalidateItems, invalidateItem])
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

interface DeleteQueryContext {
  previous?: VideoDto[]
}

export function useVideoDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto, unknown>,
): Pick<UseMutationResult<void, Error, ApiDeleteRequestDto, DeleteQueryContext>, ApiDeletionProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation<
    void,
    Error,
    ApiDeleteRequestDto,
    DeleteQueryContext
  >(
    videoQueryKeys.delete(),
    deleteVideo,
    // @todo experimenting with rollback type functionality -- check docs + examples in case there are other patterns
    {
      onSuccess: async (data, variables, context) => {
        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, variables, context)
        }

        // refetch data -- ensure a Promise is returned so the outcome is awaited
        return queryClient.invalidateQueries(videoQueryKeys.detail(variables.uuid))
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
      onError: (_error, _variables, context) => {
        // rollback on failure using the context returned by onMutate()
        if (context && context?.previous) {
          queryClient.setQueryData<VideoDto[]>(videoQueryKeys.all, context.previous) // @todo revise to base query keys for sort/filter/paginated data (video api hook)
        }
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}
