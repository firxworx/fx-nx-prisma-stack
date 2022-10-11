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

import {
  fetchCreateVideoGroupWithParentContext,
  fetchDeleteVideoGroupWithParentContext,
  fetchMutateVideoGroupWithParentContext,
  fetchVideoGroup,
  fetchVideoGroups,
  fetchVideoGroupsWithConstraints,
} from '../fetchers/video-groups'
import type { ApiParentContext } from '../types/common.types'
import type { BoxProfileChildQueryContext } from '../../types/box-profiles.types'
import { createQueryCacheKeys } from '../lib/cache-keys'
import { useParentContext } from '../../context/ParentContextProvider'

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const VIDEO_GROUPS_QUERY_SCOPE = 'videoGroups' as const

const cacheKeys = createQueryCacheKeys(VIDEO_GROUPS_QUERY_SCOPE)
export { cacheKeys as videoGroupQueryCacheKeys }

export function useVideoGroupsQuery(): UseQueryResult<VideoGroupDto[]> {
  const { box } = useParentContext()

  return useQuery(cacheKeys.list.all(), () => fetchVideoGroups({ parentContext: box }), {
    enabled: !!box?.boxProfileUuid?.length,
  })
}

export function useVideoGroupsDataQuery({
  sortFilterPaginateParams,
}: ParentContext & { sortFilterPaginateParams: string }): UseQueryResult<VideoGroupDto[]> {
  const { box } = useParentContext()

  return useQuery<VideoGroupDto[]>(
    cacheKeys.list.params(sortFilterPaginateParams),
    () => fetchVideoGroupsWithConstraints({ parentContext: box, sortFilterPaginateParams }),
    {
      enabled: !!box.boxProfileUuid?.length,
    },
  )
}

export function useVideoGroupQuery(
  { uuid }: { uuid: string | undefined },
  initialData?: VideoGroupDto,
): UseQueryResult<VideoGroupDto> {
  const { box } = useParentContext()

  return useQuery<VideoGroupDto>(cacheKeys.detail.unique(uuid), () => fetchVideoGroup({ parentContext: box, uuid }), {
    enabled: !!uuid?.length && !!box.boxProfileUuid?.length,
    ...(initialData ? { initialData: { ...initialData } } : {}),
  })
}

export function useVideoGroupCreateQuery(
  options?: UseMutationOptions<VideoGroupDto, Error, CreateVideoGroupDto>,
): UseMutationResult<VideoGroupDto, Error, CreateVideoGroupDto> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<VideoGroupDto, Error, CreateVideoGroupDto>(fetchCreateVideoGroupWithParentContext(box), {
    onSuccess: (data, vars, context) => {
      // update query cache with response data
      const { uuid, ...restData } = data
      queryClient.setQueryData(cacheKeys.detail.unique(uuid), restData)

      const promise = queryClient.invalidateQueries(cacheKeys.list.all())

      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, vars, context)
      }

      // react-query will await outcome if a promise is returned
      return promise
    },
  })
}

export function useVideoGroupMutateQuery(
  options?: UseMutationOptions<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto>>,
): UseMutationResult<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto>> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto>>(
    fetchMutateVideoGroupWithParentContext(box),
    {
      onSuccess: async (data, vars, context) => {
        queryClient.setQueryData(cacheKeys.detail.unique(vars.uuid), data)
        const promise = queryClient.invalidateQueries(cacheKeys.list.all())

        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, vars, context)
        }

        // react-query will await outcome if a promise is returned
        return promise
      },
    },
  )
}

interface VideoGroupDeleteQueryContext {
  previous?: VideoGroupDto[]
}

export function useVideoGroupDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto, VideoGroupDeleteQueryContext>,
): UseMutationResult<void, Error, ApiDeleteRequestDto, VideoGroupDeleteQueryContext> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApiDeleteRequestDto, VideoGroupDeleteQueryContext>(
    fetchDeleteVideoGroupWithParentContext(box),
    {
      onSuccess: async (data, vars, context) => {
        // remove deleted item's data from cache
        queryClient.removeQueries(cacheKeys.detail.unique(vars.uuid))

        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, vars, context)
        }
      },
      onMutate: async ({ uuid }) => {
        // cancel any outstanding refetch queries to avoid overwriting optimistic update
        await queryClient.cancelQueries(cacheKeys.all())

        // snapshot previous value to enable rollback on error
        const previous = queryClient.getQueryData<VideoGroupDto[]>(cacheKeys.list.all())
        const removed = previous?.filter((item) => item.uuid !== uuid)

        // optimistically update to the new value
        // (note: could refactor to use updater function which receives previous data as argument)
        if (previous) {
          queryClient.setQueryData<VideoGroupDto[]>(cacheKeys.list.all(), removed)
        }

        return { previous }
      },
      onError: (_error, _vars, context) => {
        // rollback on failure using the context returned by onMutate()
        if (context && context?.previous) {
          queryClient.setQueryData<VideoGroupDto[]>(cacheKeys.list.all(), context.previous)
        }
      },
    },
  )
}
