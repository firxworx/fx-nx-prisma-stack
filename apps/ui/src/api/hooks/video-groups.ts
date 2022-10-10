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
  createVideoGroup,
  deleteVideoGroup,
  fetchVideoGroup,
  fetchVideoGroups,
  fetchVideoGroupsWithConstraints,
  updateVideoGroup,
} from '../fetchers/video-groups'
import type { ApiParentContext } from '../types/common.types'
import type { BoxProfileChildQueryContext } from '../../types/box-profiles.types'
import { createQueryCacheKeys } from '../lib/cache-keys'

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const VIDEO_GROUPS_QUERY_SCOPE = 'videoGroups' as const

const cacheKeys = createQueryCacheKeys(VIDEO_GROUPS_QUERY_SCOPE)
export { cacheKeys as videoGroupQueryCacheKeys }

export function useVideoGroupsQuery(pctx: ParentContext): UseQueryResult<VideoGroupDto[]> {
  return useQuery(cacheKeys.list.all(), () => fetchVideoGroups({ parentContext: pctx?.parentContext }), {
    enabled: !!pctx?.parentContext?.boxProfileUuid?.length,
  })
}

export function useVideoGroupsDataQuery({
  parentContext,
  sortFilterPaginateParams,
}: ParentContext & { sortFilterPaginateParams: string }): UseQueryResult<VideoGroupDto[]> {
  return useQuery<VideoGroupDto[]>(
    cacheKeys.list.params(sortFilterPaginateParams),
    () => fetchVideoGroupsWithConstraints({ parentContext, sortFilterPaginateParams }),
    {
      enabled: !!parentContext.boxProfileUuid?.length,
    },
  )
}

export function useVideoGroupQuery(
  { parentContext, uuid }: ParentContext & { uuid: string | undefined },
  initialData?: VideoGroupDto,
): UseQueryResult<VideoGroupDto> {
  return useQuery<VideoGroupDto>(cacheKeys.detail.unique(uuid), () => fetchVideoGroup({ parentContext, uuid }), {
    enabled: !!uuid?.length && !!parentContext?.boxProfileUuid?.length,
    ...(initialData ? { initialData: { ...initialData } } : {}),
  })
}

export function useVideoGroupCreateQuery(
  options?: UseMutationOptions<VideoGroupDto, Error, CreateVideoGroupDto & ParentContext>,
): UseMutationResult<VideoGroupDto, Error, CreateVideoGroupDto & ParentContext> {
  const queryClient = useQueryClient()

  return useMutation<VideoGroupDto, Error, CreateVideoGroupDto & ParentContext>(createVideoGroup, {
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
  options?: UseMutationOptions<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto> & ParentContext>,
): UseMutationResult<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto> & ParentContext> {
  const queryClient = useQueryClient()

  return useMutation<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto> & ParentContext>(updateVideoGroup, {
    onSuccess: async (data, vars, context) => {
      queryClient.setQueryData(cacheKeys.detail.unique(vars.uuid), data)
      const promise = queryClient.invalidateQueries(cacheKeys.list.all())

      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, vars, context)
      }

      // react-query will await outcome if a promise is returned
      return promise
    },
  })
}

interface VideoGroupDeleteQueryContext {
  previous?: VideoGroupDto[]
}

export function useVideoGroupDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto & ParentContext, VideoGroupDeleteQueryContext>,
): UseMutationResult<void, Error, ApiDeleteRequestDto & ParentContext, VideoGroupDeleteQueryContext> {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApiDeleteRequestDto & ParentContext, VideoGroupDeleteQueryContext>(deleteVideoGroup, {
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
  })
}
