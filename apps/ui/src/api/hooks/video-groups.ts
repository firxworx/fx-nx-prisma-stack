import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'

import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoGroupDto } from '../../types/videos.types'
import type { ApiDeletionProps, ApiMutationProps } from '../types/mutation.types'
import type { ApiQueryProps } from '../types/query.types'

import {
  createVideoGroup,
  deleteVideoGroup,
  fetchVideoGroup,
  fetchVideoGroups,
  fetchVideoGroupsFiltered,
  updateVideoGroup,
} from '../fetchers/video-groups'

const VIDEO_GROUPS_KEY_BASE = 'videoGroups' as const

/**
 * Query keys for video groups API queries.
 */
const videoGroupQueryKeys = {
  all: [{ scope: VIDEO_GROUPS_KEY_BASE }] as const,
  lists: () => [{ ...videoGroupQueryKeys.all[0], operation: 'list' }] as const,
  listData: (filterSortPaginateParams: string) =>
    [{ ...videoGroupQueryKeys.lists()[0], filterSortPaginateParams }] as const,
  details: () => [{ ...videoGroupQueryKeys.all, operation: 'detail' }] as const,
  detail: (uuid: string | undefined) => [{ ...videoGroupQueryKeys.details()[0], uuid }] as const,
  create: () => [{ ...videoGroupQueryKeys.all[0], operation: 'create' }] as const,
  mutate: () => [{ ...videoGroupQueryKeys.all[0], operation: 'mutate' }] as const,
  delete: () => [{ ...videoGroupQueryKeys.all[0], operation: 'delete' }] as const,
}

export interface VideoGroupCreateQueryArgs {
  onSuccess?: (data: VideoGroupDto, variables: CreateVideoGroupDto, context: unknown) => void
}

export interface VideoGroupMutateQueryArgs {
  onSuccess?: (data: VideoGroupDto, variables: UpdateVideoGroupDto, context: unknown) => void
}

export interface VideoGroupDeleteQueryArgs {
  onSuccess?: (data: void, variables: { uuid?: string }, context: unknown) => void
}

// export type VideoGroupQueryEndpoint = 'all' | 'details' | 'detail' | 'create' | 'mutate' | 'delete'

export function useVideoGroupsQuery(): Pick<UseQueryResult<VideoGroupDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery(
    videoGroupQueryKeys.all,
    fetchVideoGroups,
  )

  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoGroupsFilteredQuery(
  filterSortPaginateParams: string,
): Pick<UseQueryResult<VideoGroupDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery<
    VideoGroupDto[]
  >(videoGroupQueryKeys.listData(filterSortPaginateParams), () => fetchVideoGroupsFiltered(filterSortPaginateParams))

  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoGroupQuery(uuid: string | undefined): Pick<UseQueryResult<VideoGroupDto>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } =
    useQuery<VideoGroupDto>(videoGroupQueryKeys.detail(uuid), () => fetchVideoGroup(uuid), {
      enabled: !!uuid?.length,
    })

  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoGroupCreateQuery(
  options?: UseMutationOptions<VideoGroupDto, Error, CreateVideoGroupDto>,
): Pick<UseMutationResult<VideoGroupDto, Error, CreateVideoGroupDto>, ApiMutationProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError } = useMutation<
    VideoGroupDto,
    Error,
    CreateVideoGroupDto
  >(videoGroupQueryKeys.create(), createVideoGroup, {
    onSuccess: (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // optimistic update local query cache with values
      const { uuid, ...restData } = data
      queryClient.setQueryData(videoGroupQueryKeys.detail(uuid), restData)
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

export function useVideoGroupMutateQuery(
  options?: UseMutationOptions<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto>>,
): Pick<UseMutationResult<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto>>, ApiMutationProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError } = useMutation<
    VideoGroupDto,
    Error,
    ApiMutateRequestDto<UpdateVideoGroupDto>
  >(videoGroupQueryKeys.mutate(), updateVideoGroup, {
    onSuccess: async (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // @todo optimistic update with previous + changed values (merged) prior to refetch?

      const invalidateItems: Promise<void> = queryClient.invalidateQueries(videoGroupQueryKeys.all)
      const invalidateItem: Promise<void> = queryClient.invalidateQueries(videoGroupQueryKeys.detail(variables.uuid))

      // refetch data -- ensure a Promise is returned so the outcome is awaited
      return Promise.all([invalidateItems, invalidateItem])
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

export function useVideoGroupDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto, unknown>,
): Pick<UseMutationResult<void, Error, ApiDeleteRequestDto, unknown>, ApiDeletionProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation<
    void,
    Error,
    ApiDeleteRequestDto,
    unknown
  >(
    videoGroupQueryKeys.delete(),
    deleteVideoGroup,
    // @todo experimenting with rollback type functionality -- check docs + examples in case there are other patterns
    {
      onSuccess: async (data, variables, context) => {
        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, variables, context)
        }

        // refetch data -- ensure a Promise is returned so the outcome is awaited
        return queryClient.invalidateQueries(videoGroupQueryKeys.detail(variables.uuid))
      },
      onMutate: async ({ uuid }): Promise<{ previous: VideoGroupDto[] | undefined }> => {
        // cancel any outgoing refetch queries to avoid overwriting optimistic update
        await queryClient.cancelQueries(videoGroupQueryKeys.all)

        // snapshot previous value to enable rollback onError()
        const previous = queryClient.getQueryData<VideoGroupDto[]>(videoGroupQueryKeys.all)

        // optimistically update to the new value
        if (previous) {
          queryClient.setQueryData<VideoGroupDto[]>(videoGroupQueryKeys.all, {
            // @todo revise to base query keys for sort/filter/paginated data
            ...previous.filter((item) => item.uuid !== uuid),
          })
        }

        return { previous }
      },
      onError: (_error, _variables, context) => {
        // rollback on failure using the context returned by onMutate()
        // @todo revise to base query keys for sort/filter/paginated data
        if (context && (context as { previous: VideoGroupDto[] | undefined })['previous']) {
          queryClient.setQueryData<VideoGroupDto[]>(
            videoGroupQueryKeys.all,
            (context as { previous: VideoGroupDto[] | undefined })['previous'],
          )
        }
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}
