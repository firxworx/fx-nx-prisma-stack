import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { VideoGroupDto } from '../../types/videos.types'
import {
  createVideoGroup,
  deleteVideoGroup,
  fetchVideoGroup,
  fetchVideoGroups,
  fetchVideoGroupsFiltered,
  updateVideoGroup,
} from '../fetchers/video-groups'

const VIDEO_GROUPS_KEY_BASE = 'videoGroups' as const

export interface VideoGroupMutationQueryArgs {
  onSuccess?: () => void
}

// export type VideoGroupQueryEndpoint = 'all' | 'details' | 'detail' | 'create' | 'mutate' | 'delete'

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

export function useVideoGroupsQuery() {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(videoGroupQueryKeys.all, fetchVideoGroups)
  return { data, status, error, isLoading, isSuccess, isError }
}

export function useVideoGroupsFilteredQuery(filterSortPaginateParams: string) {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(
    videoGroupQueryKeys.listData(filterSortPaginateParams),
    () => fetchVideoGroupsFiltered(filterSortPaginateParams),
  )
  return { data, status, error, isLoading, isSuccess, isError }
}

export function useVideoGroupQuery(uuid: string | undefined) {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(
    videoGroupQueryKeys.detail(uuid),
    () => fetchVideoGroup(uuid),
    {
      enabled: !!uuid?.length,
    },
  )

  return { data, status, error, isLoading, isSuccess, isError }
}

export function useVideoGroupCreateQuery(queryArgs?: VideoGroupMutationQueryArgs) {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation(
    videoGroupQueryKeys.create(),
    createVideoGroup,
    {
      onSuccess: (data) => {
        if (typeof queryArgs?.onSuccess === 'function') {
          queryArgs.onSuccess()
        }

        // optimistic update local query cache with values
        const { uuid, ...restData } = data
        queryClient.setQueryData(videoGroupQueryKeys.detail(data.uuid), restData)
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}

export function useVideoGroupMutateQuery(queryArgs?: VideoGroupMutationQueryArgs) {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation(
    videoGroupQueryKeys.mutate(),
    updateVideoGroup,
    {
      onSuccess: async (_data, vars) => {
        if (typeof queryArgs?.onSuccess === 'function') {
          queryArgs.onSuccess()
        }

        // @todo optimistic update with previous + changed values (merged) prior to refetch?

        const invalidateItems = queryClient.invalidateQueries(videoGroupQueryKeys.all)
        const invalidateItem = queryClient.invalidateQueries(videoGroupQueryKeys.detail(vars.uuid))

        // refetch data -- ensure a Promise is returned so the outcome is awaited
        return Promise.all([invalidateItems, invalidateItem])
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}

export function useVideoGroupDeleteQuery(queryArgs?: VideoGroupMutationQueryArgs) {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation(
    videoGroupQueryKeys.delete(),
    deleteVideoGroup,
    // @todo experimenting with rollback type functionality -- check docs + examples in case there are other patterns
    {
      onSuccess: async (_data, vars) => {
        if (typeof queryArgs?.onSuccess === 'function') {
          queryArgs.onSuccess()
        }

        // refetch data -- ensure a Promise is returned so the outcome is awaited
        return queryClient.invalidateQueries(videoGroupQueryKeys.detail(vars.uuid))
      },
      onMutate: async ({ uuid }) => {
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
      onError: (_error, _vars, context) => {
        // rollback on failure using the context returned by onMutate()
        if (context && context?.previous) {
          queryClient.setQueryData<VideoGroupDto[]>(videoGroupQueryKeys.all, context.previous) // @todo revise to base query keys for sort/filter/paginated data
        }
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}
